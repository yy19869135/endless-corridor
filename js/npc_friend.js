//   第九部分：NPC主动加好友系统  

// NPC发起好友申请
function npcRequestAddPlayer(npcCode, source) {
  var charData = CHARACTER_DB[npcCode];
  if (!charData) return;
  if (findContactByCode(npcCode)) {
    addMessage('narrator', charData.icon + ' ' + charData.name + '："我们已经是好友了吧？"');
    return;
  }
  if (G.pendingFriendRequests.find(function(r) { return r.code === npcCode; })) {
    addMessage('system', '📱 ' + charData.name + '的好友申请还未处理。');
    return;
  }
  G.pendingFriendRequests.push({
    code: npcCode,
    time: Date.now(),
    source: source || '副本'
  });
  discoverCode(npcCode, source || '对方主动申请');
  saveGame();
  showNPCFriendRequest(npcCode);
}

// 显示NPC好友申请通知
function showNPCFriendRequest(npcCode) {
  var charData = CHARACTER_DB[npcCode];
  if (!charData) return;
  var displayCode = charData.displayCode || npcCode;
  addMessage('system', '═══════════════════');
  addMessage('system', '📱 收到好友申请！');
  addMessage('narrator', charData.icon + ' ' + charData.name + '向你发送了好友申请');
  addMessage('narrator', '「' + getNPCRequestLine(charData) + '」');
  addMessage('system', '编号：' + displayCode + ' | ' + charData.title);
  addMessage('system', '═══════════════════');
  showNotification('📱 ' + charData.name + '请求加你好友', 'clue');
  showFriendRequestButtons(npcCode);
}

// NPC申请时的台词
function getNPCRequestLine(charData) {
  var personality = charData.personality || [];
  if (personality.includes('活泼') || personality.includes('元气') || personality.includes('乐观')) {
    var lines = ['加个好友呗！以后一起组队~', '嘿嘿，我直接加你！', '我们交换编号吧！'];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  if (personality.includes('冷酷') || personality.includes('冷漠') || personality.includes('孤僻')) {
    var lines = ['...给我你的编号。', '......加一下。有事联系。', '别误会，只是方便联络。'];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  if (personality.includes('高傲') || personality.includes('高贵')) {
    var lines = ['算你有资格和我交换编号。', '我不常加人...你是例外。', '记住，这是荣幸。'];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  if (personality.includes('温柔') || personality.includes('善良')) {
    var lines = ['那个...我们可以加个好友吗？', '如果你不介意的话...能加个好友吗？', '我想和你保持联系，可以吗？'];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  if (personality.includes('暴烈') || personality.includes('暴躁') || personality.includes('热血')) {
    var lines = ['喂！把编号给我！下次一起干！', '加好友！少废话！', '你还不错，加个好友！'];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  if (personality.includes('狡猾') || personality.includes('妖媚')) {
    var lines = ['想不想...和我保持更亲密的联系？', '给你个特权，加我好友吧~', '我的编号可不是谁都能拿到的哦~'];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  if (personality.includes('中二') || personality.includes('天才')) {
    var lines = ['队友！快加我！', '作为最强搭档，我们必须保持通讯！', '加好友加好友！'];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  if (personality.includes('神秘') || personality.includes('疏离')) {
    var lines = ['...记住这个编号。也许有一天你会需要联系我。', '我有预感...我们还会再见。', '...留个联系方式。原因以后你会知道。'];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  var defaults = ['加个好友吧。', '交换一下编号？', '我们保持联系吧。'];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// 在快捷操作区显示同意/拒绝按钮
function showFriendRequestButtons(npcCode) {
  var charData = CHARACTER_DB[npcCode];
  if (!charData) return;
  var container = document.getElementById('quickActions');
  if (!container) return;
  var btnGroup = document.createElement('div');
  btnGroup.id = 'friendRequestBtns_' + npcCode;
  btnGroup.style.cssText = 'display:flex;gap:6px;width:100%;margin-top:4px';
  var acceptBtn = document.createElement('button');
  acceptBtn.className = 'action-btn primary';
  acceptBtn.innerHTML = '✅ 同意 ' + charData.name;
  acceptBtn.onclick = function() { acceptNPCFriendRequest(npcCode); btnGroup.remove(); };
  var rejectBtn = document.createElement('button');
  rejectBtn.className = 'action-btn';
  rejectBtn.style.borderColor = '#8b0000';
  rejectBtn.innerHTML = '❌ 拒绝';
  rejectBtn.onclick = function() { rejectNPCFriendRequest(npcCode); btnGroup.remove(); };
  btnGroup.appendChild(acceptBtn);
  btnGroup.appendChild(rejectBtn);
  container.appendChild(btnGroup);
}

// 同意NPC好友申请
function acceptNPCFriendRequest(npcCode) {
  var charData = CHARACTER_DB[npcCode];
  if (!charData) return;
  G.pendingFriendRequests = G.pendingFriendRequests.filter(function(r) { return r.code !== npcCode; });
  if (findContactByCode(npcCode)) {
    addMessage('system', '📱 你们已经是好友了。');
    return;
  }
  var initialAffinity = Math.floor(Math.random() * 10) + 5;
  if (G.rejectedNPCHistory && G.rejectedNPCHistory[npcCode]) {
    initialAffinity = Math.max(-50, initialAffinity + G.rejectedNPCHistory[npcCode]);
  }
  G.contacts.push({
    code: npcCode,
    affinity: initialAffinity,
    chatHistory: [],
    unlockTime: Date.now(),
    aiCanDelete: true
  });
  showNotification('✅ 已添加 ' + charData.name, 'clue');
  addMessage('system', '📱 你同意了 ' + charData.icon + ' ' + charData.name + ' 的好友申请');
  var personality = charData.personality || [];
  var happyLine = '好的，以后多联系。';
  if (personality.includes('活泼') || personality.includes('元气')) {
    happyLine = ['太好了！以后多聊天呀~', '耶！我又多了一个朋友！', '嘿嘿，记得回我消息哦！'][Math.floor(Math.random() * 3)];
  } else if (personality.includes('冷酷') || personality.includes('冷漠')) {
    happyLine = ['...嗯。', '......（微微点头）', '别发太多消息。'][Math.floor(Math.random() * 3)];
  } else if (personality.includes('温柔') || personality.includes('善良')) {
    happyLine = ['谢谢你...以后请多关照。', '太好了，我很开心。', '有什么事随时联系我。'][Math.floor(Math.random() * 3)];
  } else if (personality.includes('高傲')) {
    happyLine = ['哼，算你识相。', '不错，你做了正确的选择。', '记住这份荣幸。'][Math.floor(Math.random() * 3)];
  } else if (personality.includes('暴烈') || personality.includes('热血')) {
    happyLine = ['哈哈！够爽快！', '好！下次副本叫上我！', '这才对嘛！'][Math.floor(Math.random() * 3)];
  }
  addMessage('narrator', charData.icon + ' ' + charData.name + '："' + happyLine + '"');
  saveGame();
  if (document.getElementById('systemPhone') && document.getElementById('systemPhone').classList.contains('show')) {
    renderContactsApp();
  }
}

// 拒绝NPC好友申请
function rejectNPCFriendRequest(npcCode) {
  var charData = CHARACTER_DB[npcCode];
  if (!charData) return;
  G.pendingFriendRequests = G.pendingFriendRequests.filter(function(r) { return r.code !== npcCode; });
  showNotification('❌ 已拒绝 ' + charData.name, 'horror');
  addMessage('system', '📱 你拒绝了 ' + charData.icon + ' ' + charData.name + ' 的好友申请');
  var personality = charData.personality || [];
  var affinityLoss = -10;
  var rejectLine = '...好吧。';
  if (personality.includes('高傲') || personality.includes('高贵')) {
    affinityLoss = -20;
    rejectLine = ['你会后悔的。', '...哼。', '你不配。'][Math.floor(Math.random() * 3)];
  } else if (personality.includes('暴烈') || personality.includes('暴躁')) {
    affinityLoss = -15;
    rejectLine = ['你什么意思？！', '...行，记住了。', '哼！'][Math.floor(Math.random() * 3)];
  } else if (personality.includes('温柔') || personality.includes('善良')) {
    affinityLoss = -5;
    rejectLine = ['...没关系，我理解。', '好的...打扰了。', '...嗯。'][Math.floor(Math.random() * 3)];
  } else if (personality.includes('冷酷') || personality.includes('冷漠')) {
    affinityLoss = -8;
    rejectLine = ['......随便。', '...无所谓。', '（转身离开）'][Math.floor(Math.random() * 3)];
  } else if (personality.includes('活泼') || personality.includes('元气')) {
    affinityLoss = -10;
    rejectLine = ['诶...为什么...', '呜...好吧...', '那、那下次再说...'][Math.floor(Math.random() * 3)];
  } else if (personality.includes('狡猾') || personality.includes('妖媚')) {
    affinityLoss = -12;
    rejectLine = ['呵...有意思。', '你会主动来找我的。', '拒绝我？...第一次呢。'][Math.floor(Math.random() * 3)];
  }
  addMessage('narrator', charData.icon + ' ' + charData.name + '："' + rejectLine + '"');
  addMessage('system', '💔 ' + charData.name + ' 好感度 ' + affinityLoss);
  if (!G.rejectedNPCHistory[npcCode]) G.rejectedNPCHistory[npcCode] = 0;
  G.rejectedNPCHistory[npcCode] += affinityLoss;
  saveGame();
}

// 玩家主动给NPC自己的编号
function givePlayerCodeToNPC(npcCode) {
  var charData = CHARACTER_DB[npcCode];
  if (!charData) return;
  if (findContactByCode(npcCode)) {
    addMessage('narrator', charData.icon + ' ' + charData.name + '："我们已经是好友了。"');
    return;
  }
  var playerCode = G.playerDisplayCode || 'X9-VOID';
  addMessage('system', '📱 你把自己的编号 ' + playerCode + ' 告诉了 ' + charData.name);
  addMessage('narrator', charData.icon + ' ' + charData.name + '看了看你的编号...');
  var delay = Math.floor(Math.random() * 3000) + 2000;
  setTimeout(function() {
    // 70%概率同意加你
    if (Math.random() < 0.7) {
      var initialAffinity = Math.floor(Math.random() * 5) + 1;
      if (G.rejectedNPCHistory && G.rejectedNPCHistory[npcCode]) {
        initialAffinity = Math.max(-50, initialAffinity + G.rejectedNPCHistory[npcCode]);
      }
      G.contacts.push({
        code: npcCode,
        affinity: initialAffinity,
        chatHistory: [],
        unlockTime: Date.now(),
        aiCanDelete: true
      });
      discoverCode(npcCode, '主动给出编号');
      showNotification('✅ ' + charData.name + '加了你', 'clue');
      addMessage('system', '📱 ' + charData.icon + ' ' + charData.name + '添加了你为好友');
      var personality = charData.personality || [];
      var acceptLine = '嗯，记住了。';
      if (personality.includes('温柔') || personality.includes('善良')) {
        acceptLine = '谢谢你愿意告诉我。';
      } else if (personality.includes('冷酷') || personality.includes('冷漠')) {
        acceptLine = '...加了。';
      } else if (personality.includes('活泼') || personality.includes('元气')) {
        acceptLine = '好耶！我加你了！';
      }
      addMessage('narrator', charData.icon + ' ' + charData.name + '："' + acceptLine + '"');
      saveGame();
      if (document.getElementById('systemPhone') && document.getElementById('systemPhone').classList.contains('show')) {
        renderContactsApp();
      }
    } else {
      showNotification('❌ ' + charData.name + '没有加你', 'horror');
      addMessage('system', '📱 ' + charData.icon + ' ' + charData.name + '看了看编号，没有添加你');
      var personality = charData.personality || [];
      var rejectLine = '...现在不太方便。';
      if (personality.includes('高傲')) {
        rejectLine = '我为什么要加你？';
      } else if (personality.includes('冷酷')) {
        rejectLine = '...不需要。';
      } else if (personality.includes('温柔')) {
        rejectLine = '抱歉...我再考虑一下。';
      }
      addMessage('narrator', charData.icon + ' ' + charData.name + '："' + rejectLine + '"');
    }
  }, delay);
}

// 注入"给出编号"按钮 + NPC主动加好友事件
var _injectNPCWithGiveCode = injectNPCInteractions;
injectNPCInteractions = function(dungeonConfig) {
  _injectNPCWithGiveCode(dungeonConfig);
  if (!dungeonConfig || !dungeonConfig.rooms) return;
  
  dungeonNPCs.forEach(function(npcCode, idx) {
    var charData = CHARACTER_DB[npcCode];
    if (!charData) return;
    if (findContactByCode(npcCode)) return;
    var roomIds = Object.keys(dungeonConfig.rooms);
    var targetRoomIdx = Math.min(idx + 1, roomIds.length - 1);
    var targetRoom = dungeonConfig.rooms[roomIds[targetRoomIdx]];
    if (!targetRoom) return;
    
    // 给出编号按钮
    if (!targetRoom.specialActions) targetRoom.specialActions = [];
    targetRoom.specialActions.push({
      id: 'give_code_' + idx,
      icon: '📱',
      label: '给' + charData.name + '你的编号',
      message: '你掏出手机，向' + charData.name + '展示了你的编号。',
      removeAfterUse: true
    });
    
    // NPC主动加好友事件
    if (!targetRoom.events) targetRoom.events = [];
    targetRoom.events.push({
      id: 'npc_add_player_' + npcCode,
      trigger: 'enter',
      once: true,
      delay: 8000 + Math.random() * 12000,
      action: function() {
        if (Math.random() < 0.5 && !findContactByCode(npcCode)) {
          npcRequestAddPlayer(npcCode, dungeonConfig.name || '副本');
        }
      }
    });
  });
};

// 拦截doSpecialAction处理给出编号
var _prevDoSpecialActionGiveCode = doSpecialAction;
doSpecialAction = function(actionId) {
  if (actionId && actionId.indexOf('give_code_') === 0) {
    var idx = parseInt(actionId.replace('give_code_', ''), 10);
    if (!isNaN(idx) && dungeonNPCs[idx]) {
      givePlayerCodeToNPC(dungeonNPCs[idx]);
      return;
    }
  }
  _prevDoSpecialActionGiveCode(actionId);
};

console.log('✅ 第九部分加载完成：NPC主动加好友系统');
