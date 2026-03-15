function checkPlayerMoveIntent(playerText, aiCommands) {
  // 如果AI已经发了MOVE指令，不需要干预
  var hasMove = aiCommands && aiCommands.some(function(c) { return c.cmd === 'MOVE'; });
  if (hasMove) return;

  // 不在副本中不处理
  if (!G.inDungeon || !G.dungeon || !G.currentRoom) return;

  var room = G.dungeon.rooms[G.currentRoom];
  if (!room || !room.connections) return;

  // 移动意图关键词模式：「前往+地点」「去+地点」等
  var movePatterns = ['前往', '去', '进入', '走向', '走到', '回到', '前去', '移动到', '走进'];
  
  var hasMoveIntent = movePatterns.some(function(p) { return playerText.includes(p); });
  if (!hasMoveIntent) return;

  // 收集所有可达房间，按名称长度降序排列（优先匹配长名称，避免"教室"误匹配"地下教室"）
  var candidates = [];
  room.connections.forEach(function(cid) {
    var cr = G.dungeon.rooms[cid];
    if (!cr || cr.locked) return;
    candidates.push({ id: cid, name: cr.name });
  });

  // 按名称长度降序排，优先匹配最长的名称
  candidates.sort(function(a, b) { return b.name.length - a.name.length; });

  var targetId = null;
  var targetName = '';

  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    // 严格匹配：玩家输入必须包含完整房间名
    if (playerText.includes(c.name)) {
      targetId = c.id;
      targetName = c.name;
      break;
    }
  }

  // 如果完整名没匹配到，尝试用房间名的核心词匹配
  // 但要排除歧义：如果多个房间都匹配，不执行自动移动
  if (!targetId) {
    var partialMatches = [];
    candidates.forEach(function(c) {
      // 提取核心词（去掉"一楼""二楼""地下"等前缀）
      var coreName = c.name.replace(/^(一楼|二楼|三楼|地下|楼上|楼下)/, '');
      if (coreName.length >= 2 && playerText.includes(coreName)) {
        partialMatches.push(c);
      }
    });
    // 只有唯一匹配时才执行
    if (partialMatches.length === 1) {
      targetId = partialMatches[0].id;
      targetName = partialMatches[0].name;
    }
  }

  if (targetId) {
    console.log('★ 自动检测到移动意图，补发MOVE指令 → ' + targetName);
    // 标记这是自动补发的移动，避免和AI叙述冲突
    G._autoMoveTriggered = true;
    setTimeout(function() {
      moveToRoom(targetId);
      G._autoMoveTriggered = false;
    }, 1500);
  }
}

// 根据当前房间和状态生成情境选项按钮
function generateContextActions() {
  if (!G.inDungeon || !G.currentRoom || !G.dungeon) return;
  var room = G.dungeon.rooms[G.currentRoom];
  if (!room) return;

  var actions = [];

  // ★ 不再渲染 specialActions 为按钮（防止剧透解谜步骤）
  // specialActions 仍保留在数据中，通过以下方式触发：
  // 1. 玩家在输入框用自然语言描述行为 → AI判定
  // 2. 玩家在背包中使用道具 → executeDungeonItemUse处理
  // 3. AI通过[CHOICE]指令动态生成情境选项

  // 只保留通用探索按钮
  actions.push({ label: '🔍 调查', action: 'doAction(\'调查\')' });
  actions.push({ label: '👁️ 查看', action: 'doAction(\'查看\')' });
  actions.push({ label: '👂 倾听', action: 'doAction(\'倾听\')' });
  actions.push({ label: '📋 线索', action: 'toggleClueSidebar()' });

  // 渲染
  var container = document.getElementById('quickActions');
  var html = '';
  actions.forEach(function(a) {
    var safeAction = a.action.replace(/"/g, '&quot;');
    html += '<button class="action-btn" onclick="' + safeAction + '">' + a.label + '</button>';
  });
  html += '<button class="action-btn primary" onclick="toggleInventory()">🎒 背包</button>';
  container.innerHTML = html;
}

