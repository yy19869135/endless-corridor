async function sendPlayerInput() {
  var input = document.getElementById('playerInput');
  var text = input.value.trim();
  if (!text) return;
  input.value = '';

  addMessage('player', text);

  // 先检查副本内的关键词匹配
  if (G.inDungeon && G.dungeon) {
    var handled = handleKeywordInput(text);
    if (handled) return;
  }

  // 调用AI
  if (G.connected && mujianSdk) {
    await callAI(text);
  } else {
    // 离线回退
    addMessage('system', '（AI未连接，使用离线模式）');
    offlineFallback(text);
  }
}

function handleKeywordInput(text) {
  if (!G.dungeon || !G.currentRoom) return false;
  var room = G.dungeon.rooms[G.currentRoom];
  if (!room.keywords) return false;

  var lowerText = text.toLowerCase();
  var matched = false;

  Object.keys(room.keywords).forEach(function(keyword) {
    if (matched) return;
    if (lowerText.includes(keyword)) {
      var response = room.keywords[keyword];
      if (typeof response === 'string') {
        addMessage('narrator', response);
      } else {
        if (response.message) addMessage(response.messageType || 'narrator', response.message);
        if (response.horror) addMessage('horror', response.horror);
        if (response.sanChange) updateSAN(G.san + response.sanChange);
        if (response.hpChange) updateHP(G.hp + response.hpChange);
        if (response.addItem) addDungeonItem(response.addItem);
        if (response.addClue) collectClue(response.addClue);
        if (response.unlockRoom) {
          G.dungeon.rooms[response.unlockRoom].locked = false;
          addMessage('system', '🔓 新区域已解锁');
          renderMinimap();
        }
      }
      matched = true;
    }
  });
  return matched;
}

function offlineFallback(text) {
  var lowerText = text.toLowerCase();

  // 离线模式下处理基本的道具使用
  var useKeywords = ['使用', '用', '吃', '喝', '服用', '打开', '装备'];
  var isUsingItem = useKeywords.some(function(k) { return lowerText.includes(k); });

  if (isUsingItem && G.inDungeon) {
    var allItems = G.dungeonItems.concat(G.permanentItems);
    var matchedItem = null;
    allItems.forEach(function(item) {
      if (matchedItem) return;
      if (lowerText.includes(item.name.toLowerCase()) || lowerText.includes(item.name)) {
        matchedItem = item;
      }
    });
    if (matchedItem) {
      addMessage('narrator', '你使用了「' + matchedItem.name + '」。');
      if (matchedItem.name.includes('药') || matchedItem.name.includes('恢复') || matchedItem.name.includes('治疗')) {
        updateHP(G.hp + 3);
        addMessage('system', '[ HP +3 ]');
      } else if (matchedItem.name.includes('镇静') || matchedItem.name.includes('安神') || matchedItem.name.includes('SAN')) {
        updateSAN(G.san + 15);
        addMessage('system', '[ SAN +15 ]');
      } else if (matchedItem.name.includes('钥匙') || matchedItem.name.includes('权限')) {
        addMessage('narrator', '你拿出了「' + matchedItem.name + '」，也许可以在某扇锁着的门前使用。');
        return;
      } else {
        addMessage('narrator', '你使用了「' + matchedItem.name + '」，但不确定效果如何。');
      }
      // 消耗道具
      var isDungeon = G.dungeonItems.some(function(i) { return i.id === matchedItem.id; });
      if (isDungeon) removeDungeonItem(matchedItem.id);
      else if (matchedItem.consumable) removePermanentItem(matchedItem.id);
      return;
    }
  }

  // 搜索/调查时有概率给道具
  var searchKeywords = ['搜索', '调查', '检查', '翻找', '查看', '搜'];
  var isSearching = searchKeywords.some(function(k) { return lowerText.includes(k); });

  if (isSearching && G.inDungeon && Math.random() < 0.35) {
    var room = G.dungeon ? G.dungeon.rooms[G.currentRoom] : null;
    var roomName = room ? room.name : '这里';
    var randomItems = [
      { name: '破旧笔记', icon: '📝', desc: '字迹模糊的笔记' },
      { name: '生锈钥匙', icon: '🔑', desc: '不知道能开什么门' },
      { name: '急救包', icon: '🩹', desc: '简易急救用品，可恢复少量HP', usable: true },
      { name: '蜡烛', icon: '🕯️', desc: '还能燃烧一段时间' },
      { name: '镇静剂', icon: '💉', desc: '可以恢复少量SAN', usable: true }
    ];
    var found = randomItems[Math.floor(Math.random() * randomItems.length)];
    addMessage('narrator', '你仔细搜索了' + roomName + '...');
    addMessage('narrator', '在角落里，你发现了一个「' + found.name + '」。');
    addDungeonItem({
      id: 'offline_item_' + Date.now(),
      name: found.name,
      icon: found.icon,
      desc: found.desc,
      usable: found.usable || false,
      canTakeOut: false,
      stackable: false,
      count: 1
    });
    return;
  }

  // 默认氛围回复
  var responses = [
    '周围一片寂静，你的声音消散在黑暗中...',
    '你感到一阵不安，但什么也没有发生。',
    '空气中弥漫着腐朽的气息，你决定更加谨慎。',
    '远处传来若有若无的声响，但很快又归于沉寂。',
    '你的直觉告诉你，这里并不安全。',
    '你试着做了些什么，但这个地方似乎在抗拒你的行动。',
    '一阵冷风掠过你的脖颈，你不由得打了个寒颤。',
    '地板下传来微弱的震动，像是有什么东西在移动。'
  ];
  addMessage('narrator', responses[Math.floor(Math.random() * responses.length)]);

  // 离线模式也生成基本选项
  if (G.inDungeon) {
    setTimeout(function() { generateContextActions(); }, 500);
  }
}
