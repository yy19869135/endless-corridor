//   第八部分：GM已发现编号系统  

// 初始化已发现编号存储
if (!G.discoveredCodes) G.discoveredCodes = {};
if (!G.pendingFriendRequests) G.pendingFriendRequests = [];
if (!G.rejectedNPCHistory) G.rejectedNPCHistory = {};
// 格式: { 'PL-001': { name:'林夜', displayCode:'K7-3NWP', discoveredAt: timestamp, source:'迷失森林' } }

// 记录一个已发现的编号
function discoverCode(internalCode, source) {
  if (G.discoveredCodes[internalCode]) return; // 已发现过
  var charData = CHARACTER_DB[internalCode];
  if (!charData) return;
  G.discoveredCodes[internalCode] = {
    name: charData.name,
    icon: charData.icon,
    displayCode: charData.displayCode,
    title: charData.title,
    discoveredAt: Date.now(),
    source: source || '未知'
  };
  saveGame();
}

//   拦截编号展示时机，自动记录  

// 1. 拦截副本中NPC交互（交流/编号关键词触发时）
var _origInjectNPCInteractions = injectNPCInteractions;
injectNPCInteractions = function(dungeonConfig) {
  _origInjectNPCInteractions(dungeonConfig);
  
  // 给每个NPC的交互关键词加上编号发现记录
  if (!dungeonConfig || !dungeonConfig.rooms) return;
  dungeonNPCs.forEach(function(npcCode, idx) {
    var charData = CHARACTER_DB[npcCode];
    if (!charData) return;
    var roomIds = Object.keys(dungeonConfig.rooms);
    var targetRoomIdx = Math.min(idx + 1, roomIds.length - 1);
    var targetRoom = dungeonConfig.rooms[roomIds[targetRoomIdx]];
    if (!targetRoom) return;

    // 包装关键词响应，在触发时记录编号
    var origExchange = targetRoom.keywords['交流'];
    if (origExchange) {
      var origMsg = origExchange.message || origExchange;
      targetRoom.keywords['交流'] = {
        message: origMsg,
        messageType: 'system',
        onTrigger: function() { discoverCode(npcCode, dungeonConfig.name || '副本'); }
      };
    }
    var origCode = targetRoom.keywords['编号'];
    if (origCode) {
      var origMsg2 = origCode.message || origCode;
      targetRoom.keywords['编号'] = {
        message: origMsg2,
        messageType: 'narrator',
        onTrigger: function() { discoverCode(npcCode, dungeonConfig.name || '副本'); }
      };
    }

    // 包装特殊行动按钮
    if (targetRoom.specialActions) {
      targetRoom.specialActions.forEach(function(sa) {
        if (sa.id === 'talk_npc_' + idx) {
          var origSaMsg = sa.message;
          sa._npcCode = npcCode;
          sa._dungeonName = dungeonConfig.name || '副本';
        }
      });
    }
  });
};

// 2. 拦截 doSpecialAction，检测NPC对话按钮
var _prevDoSpecialAction2 = doSpecialAction;
doSpecialAction = function(actionId) {
  // 检查是否是NPC对话按钮
  if (actionId && actionId.indexOf('talk_npc_') === 0 && G.dungeon) {
    var room = G.dungeon.rooms[G.currentRoom];
    if (room && room.specialActions) {
      room.specialActions.forEach(function(sa) {
        if (sa.id === actionId && sa._npcCode) {
          discoverCode(sa._npcCode, sa._dungeonName || '副本');
        }
      });
    }
  }
  _prevDoSpecialAction2(actionId);
};

// 3. 拦截关键词处理，检测onTrigger回调
var _origProcessKeyword = typeof processKeyword === 'function' ? processKeyword : null;
if (_origProcessKeyword) {
  processKeyword = function(keyword) {
    // 先检查当前房间的关键词是否有onTrigger
    if (G.dungeon && G.currentRoom) {
      var room = G.dungeon.rooms[G.currentRoom];
      if (room && room.keywords && room.keywords[keyword]) {
        var resp = room.keywords[keyword];
        if (typeof resp === 'object' && resp.onTrigger) {
          resp.onTrigger();
        }
      }
    }
    return _origProcessKeyword(keyword);
  };
}

// 4. 好友申请成功时也记录
var _origSendFriendRequest = sendFriendRequest;
sendFriendRequest = function(code) {
  discoverCode(code, '好友申请');
  _origSendFriendRequest(code);
};

//   GM面板：编号页签  

// 扩展switchGMTab
var _origSwitchGMTab = switchGMTab;
switchGMTab = function(tab) {
  if (tab === 'codes') {
    document.querySelectorAll('.gm-tab').forEach(function(t) { t.classList.remove('active'); });
    var tabs = document.querySelectorAll('.gm-tab');
    tabs.forEach(function(t) {
      if (t.dataset.tab === 'codes') t.classList.add('active');
    });
    renderGMCodes(document.getElementById('gmContent'));
    return;
  }
  _origSwitchGMTab(tab);
};

function renderGMCodes(container) {
  var html = '';
  html += '<div style="margin-bottom:8px;color:#b57a7a">📱 已发现编号</div>';

  // 统计
  var totalChars = Object.keys(CHARACTER_DB).length;
  var discoveredCount = Object.keys(G.discoveredCodes).length;
  var contactCount = G.contacts.length;

  html += '<div style="display:flex;gap:8px;margin-bottom:10px;padding:8px;background:rgba(20,8,8,0.6);border:1px solid #3a1515;border-radius:6px">';
  html += '<div style="flex:1;text-align:center"><div style="font-size:18px;color:#ffd700">' + discoveredCount + '</div><div style="font-size:9px;color:#888">已发现</div></div>';
  html += '<div style="flex:1;text-align:center"><div style="font-size:18px;color:#88ff88">' + contactCount + '</div><div style="font-size:9px;color:#888">已加好友</div></div>';
  html += '<div style="flex:1;text-align:center"><div style="font-size:18px;color:#888">' + totalChars + '</div><div style="font-size:9px;color:#888">总角色数</div></div>';
  html += '</div>';

  // 快捷操作
  html += '<div style="display:flex;gap:4px;margin-bottom:10px">';
  html += '<button class="action-btn" onclick="GM_DiscoverAllCodes()" style="flex:1;font-size:10px">🔓 解锁全部编号</button>';
  html += '<button class="action-btn" onclick="GM_CopyAllCodes()" style="flex:1;font-size:10px">📋 复制编号表</button>';
  html += '</div>';

  // 搜索
  html += '<input type="text" id="gmCodeSearch" placeholder="搜索角色名或编号..." oninput="filterGMCodes()" style="width:100%;padding:6px 8px;border:1px solid #3a1515;border-radius:6px;background:rgba(20,8,8,0.8);color:#c8c8d0;font-size:11px;outline:none;margin-bottom:8px;box-sizing:border-box">';

  // 已发现列表
  html += '<div id="gmCodeList">';
  html += buildGMCodeList('');
  html += '</div>';

  container.innerHTML = html;
}

function buildGMCodeList(filter) {
  var html = '';
  var lowerFilter = filter.toLowerCase();

  // 先显示已发现的
  var discovered = Object.keys(G.discoveredCodes);
  if (discovered.length > 0) {
    html += '<div style="font-size:10px;color:#88ff88;margin:6px 0 4px;border-bottom:1px solid #1a3a1a;padding-bottom:2px">✅ 已发现 (' + discovered.length + ')</div>';
    discovered.forEach(function(code) {
      var info = G.discoveredCodes[code];
      var charData = CHARACTER_DB[code];
      if (!charData) return;
      
      // 搜索过滤
      if (lowerFilter && info.name.toLowerCase().indexOf(lowerFilter) === -1 && 
          info.displayCode.toLowerCase().indexOf(lowerFilter) === -1 &&
          code.toLowerCase().indexOf(lowerFilter) === -1) return;

      var isContact = !!findContactByCode(code);
      var timeStr = new Date(info.discoveredAt).toLocaleString();

      html += '<div class="gm-item" style="' + (isContact ? 'border-left:2px solid #88ff88' : '') + '">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<div class="gm-item-label">' + info.icon + ' ' + info.name + (isContact ? ' <span style="color:#88ff88;font-size:9px">✓好友</span>' : '') + '</div>';
      html += '<span style="font-size:12px;color:#ffd700;font-family:monospace;letter-spacing:1px">' + info.displayCode + '</span>';
      html += '</div>';
      html += '<div class="gm-item-desc">' + (info.title || charData.title) + ' | 内部码: ' + code + '</div>';
      html += '<div class="gm-item-code">发现于: ' + info.source + ' | ' + timeStr + '</div>';
      
      // 快捷操作
      if (!isContact) {
        html += '<button class="action-btn" onclick="GM_QuickAddContact(\'' + code + '\')" style="margin-top:4px;font-size:9px;padding:2px 8px">⚡ 直接加好友</button>';
      }
      html += '</div>';
    });
  }

  // 未发现的（折叠显示）
  var undiscovered = Object.keys(CHARACTER_DB).filter(function(code) {
    return !G.discoveredCodes[code];
  });

  if (undiscovered.length > 0) {
    html += '<div style="font-size:10px;color:#555;margin:12px 0 4px;border-bottom:1px solid #1a0a0a;padding-bottom:2px;cursor:pointer" onclick="document.getElementById(\'gmUndiscoveredList\').style.display=document.getElementById(\'gmUndiscoveredList\').style.display===\'none\'?\'block\':\'none\'">🔒 未发现 (' + undiscovered.length + ') ▼ 点击展开</div>';
    html += '<div id="gmUndiscoveredList" style="display:none">';
    undiscovered.forEach(function(code) {
      var charData = CHARACTER_DB[code];
      if (!charData) return;
      
      if (lowerFilter && charData.name.toLowerCase().indexOf(lowerFilter) === -1 &&
          charData.displayCode.toLowerCase().indexOf(lowerFilter) === -1) return;

      html += '<div class="gm-item" style="opacity:0.5">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<div class="gm-item-label">' + charData.icon + ' ' + charData.name + '</div>';
      html += '<span style="font-size:12px;color:#666;font-family:monospace">' + charData.displayCode + '</span>';
      html += '</div>';
      html += '<div class="gm-item-desc">' + charData.title + ' | ' + code + '</div>';
      html += '<button class="action-btn" onclick="GM_QuickDiscover(\'' + code + '\')" style="margin-top:4px;font-size:9px;padding:2px 8px">🔓 标记发现</button>';
      html += '</div>';
    });
    html += '</div>';
  }

  return html;
}

function filterGMCodes() {
  var input = document.getElementById('gmCodeSearch');
  var list = document.getElementById('gmCodeList');
  if (!input || !list) return;
  list.innerHTML = buildGMCodeList(input.value.trim());
}

// GM快捷操作
function GM_DiscoverAllCodes() {
  Object.keys(CHARACTER_DB).forEach(function(code) {
    discoverCode(code, 'GM解锁');
  });
  showNotification('已解锁全部编号', 'clue');
  renderGMCodes(document.getElementById('gmContent'));
}

function GM_CopyAllCodes() {
  var text = '  苍白回廊·角色编号对照表  \n\n';
  Object.keys(CHARACTER_DB).forEach(function(code) {
    var ch = CHARACTER_DB[code];
    if (ch.displayCode) {
      var discovered = G.discoveredCodes[code] ? '✅' : '🔒';
      var contact = findContactByCode(code) ? '👥' : '  ';
      text += discovered + contact + ' ' + ch.icon + ' ' + ch.name + '：' + ch.displayCode + ' (' + code + ')\n';
    }
  });
  
  // 手机上没有clipboard API，显示在消息里
  addMessage('system', '📋 编号对照表已输出到下方：');
  addMessage('system', text);
  showNotification('📋 编号表已输出', 'clue');
}

function GM_QuickAddContact(code) {
  var charData = CHARACTER_DB[code];
  if (!charData) return;
  if (findContactByCode(code)) {
    showNotification('已是好友', '');
    return;
  }
  // 直接加好友，跳过申请流程
  G.contacts.push({
    code: code,
    affinity: 10,
    chatHistory: [],
    unlockTime: Date.now(),
    aiCanDelete: true
  });
  showNotification('✅ 已添加 ' + charData.name, 'clue');
  saveGame();
  renderGMCodes(document.getElementById('gmContent'));
}

function GM_QuickDiscover(code) {
  discoverCode(code, 'GM手动标记');
  showNotification('🔓 已标记发现', 'clue');
  renderGMCodes(document.getElementById('gmContent'));
}

//   注入GM面板的编号Tab按钮  

// 覆盖toggleGMPanel，在打开时注入编号tab
var _origToggleGMPanel = toggleGMPanel;
toggleGMPanel = function() {
  _origToggleGMPanel();
  if (GM_PANEL_OPEN) {
    // 检查是否已有编号tab，没有就注入
    var tabBar = document.querySelector('.gm-tabs');
    if (tabBar && !tabBar.querySelector('[data-tab="codes"]')) {
      var codesTab = document.createElement('button');
      codesTab.className = 'gm-tab';
      codesTab.dataset.tab = 'codes';
      codesTab.textContent = '📱 编号';
      codesTab.onclick = function() { switchGMTab('codes'); };
      tabBar.appendChild(codesTab);
    }
  }
};

console.log('✅ 第八部分加载完成：GM已发现编号系统');
