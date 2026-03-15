(function() {
  var base = document.getElementById('joystickBase');
  var stick = document.getElementById('joystickStick');
  if (!base || !stick) return;

  var dragging = false;
  var baseCX = 0, baseCY = 0;
  var maxDist = 30;
  var hasMoved = false; // 关键：标记本次拖动是否已触发移动

  function onStart(e) {
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    hasMoved = false;
    var r = base.getBoundingClientRect();
    baseCX = r.left + r.width / 2;
    baseCY = r.top + r.height / 2;
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    var touch = e.touches ? e.touches[0] : e;
    var dx = touch.clientX - baseCX;
    var dy = touch.clientY - baseCY;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxDist) {
      dx = dx / dist * maxDist;
      dy = dy / dist * maxDist;
    }

    stick.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';

    // 超过阈值且本次拖动还没触发过移动 → 触发一次
    if (!hasMoved && dist > 15) {
      hasMoved = true;
      var dir;
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? 'east' : 'west';
      } else {
        dir = dy > 0 ? 'south' : 'north';
      }
      handleJoystickMove(dir);
    }
  }

  function onEnd(e) {
    if (!dragging) return;
    dragging = false;
    hasMoved = false;
    stick.style.transform = 'translate(0,0)';
  }

  // 触摸事件
  stick.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);

  // 鼠标事件（PC调试）
  stick.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
})();

function handleJoystickMove(direction) {
  // 大世界摇杆移动
  if (!G.inDungeon && G.gamePhase === 'world') {
    var loc = WORLD_LOCATIONS[G.worldLocation];
    if (loc && loc.directionMap && loc.directionMap[direction]) {
      moveToWorldLocation(loc.directionMap[direction], false);
    } else {
      addMessage('system', '这个方向没有路...');
    }
    return;
  }
  if (!G.inDungeon || !G.currentRoom || !G.dungeon) return;
  var room = G.dungeon.rooms[G.currentRoom];
  var dirMap = room.directionMap || {};
  var targetRoom = dirMap[direction];

  if (!targetRoom) {
    // 尝试从connections中按方向匹配
    var conns = room.connections || [];
    if (conns.length > 0) {
      var dirIndex = { north: 0, east: 1, south: 2, west: 3 };
      var idx = dirIndex[direction];
      if (idx !== undefined && idx < conns.length && conns[idx]) {
        targetRoom = conns[idx];
      }
    }
  }

  if (!targetRoom) {
    addMessage('system', '这个方向没有路...');
    return;
  }

  var target = G.dungeon.rooms[targetRoom];
  if (!target) return;

  if (target.locked) {
    // 检查是否有钥匙
    if (target.keyRequired && hasDungeonItem(target.keyRequired)) {
      target.locked = false;
      removeDungeonItem(target.keyRequired);
      addMessage('system', '🔓 使用钥匙打开了通往「' + target.name + '」的门');
      moveToRoom(targetRoom);
    } else {
      addMessage('system', '🔒 通往「' + target.name + '」的门被锁住了' + (target.lockHint ? '。' + target.lockHint : ''));
    }
    return;
  }

  moveToRoom(targetRoom);
}

//  房间移动核心 
function moveToRoom(roomId) {
  if (!G.dungeon || !G.dungeon.rooms[roomId]) return;
  var room = G.dungeon.rooms[roomId];
  var isFirstVisit = !G.visitedRooms.has(roomId);

    G.currentRoom = roomId;
  G.visitedRooms.add(roomId);
  
  // ★ 记录房间访问次数
  if (!G._roomVisitCount) G._roomVisitCount = {};
  if (!G._roomVisitCount[roomId]) G._roomVisitCount[roomId] = 0;
  G._roomVisitCount[roomId]++;

  updateRoomDisplay(room);
  renderMinimap();

  // 触发房间事件（保留原有逻辑）
  if (room.events) {
    room.events.forEach(function(evt) {
      if (G.triggeredEvents.has(evt.id)) return;
      if (evt.trigger === 'enter' || (evt.trigger === 'firstVisit' && isFirstVisit)) {
        if (checkEventCondition(evt)) {
          executeEvent(evt);
        }
      }
    });
  }

  // 自动收集房间中的线索
  if (room.autoClues && isFirstVisit) {
    room.autoClues.forEach(function(cid) { collectClue(cid); });
  }
  
    // ★ 如果开场剧情正在播放，跳过AI调用和房间显示更新
  // ★★★ 修复：规则事件触发的移动不受此限制 ★★★
  if (G._openingScriptPlaying && !G._ruleEventMoveTriggered) {
    addMessage('system', '📍 进入「' + room.name + '」');
    return;
  }

  // ★★★ 修复：规则事件触发的移动，清除开场标记 ★★★
  if (G._ruleEventMoveTriggered) {
    G._openingScriptPlaying = false;
  }

    // 调用AI生成场景描述
  // ★ 如果是AI的MOVE指令触发的移动，AI已经生成了叙述，只需要更新按钮
  if (G._aiMoveTriggered) {
    addMessage('system', '📍 进入「' + room.name + '」');
    setTimeout(function() { generateContextActions(); }, 500);

  // ★ 过渡房间（走廊等）重复经过时跳过AI叙述
  } else if (!isFirstVisit && isTransitRoom(roomId, room)) {
    addMessage('system', '📍 经过「' + room.name + '」');
    // 不调用AI，直接生成操作按钮
    setTimeout(function() { generateContextActions(); }, 300);

  } else if (G.connected && mujianSdk) {
    generateRoomNarration(roomId, room, isFirstVisit);
  } else {

    // 离线回退：显示默认文本
    if (isFirstVisit && room.firstVisitText) {
      addMessage('narrator', room.firstVisitText);
    } else if (room.description) {
      addMessage('narrator', room.description);
    }
    setTimeout(function() { generateContextActions(); }, 500);
  }
  saveGame();
}

/**
 * 判断房间是否为"过渡房间"（走廊、楼梯等）
 * 过渡房间在重复经过时跳过AI叙述，只显示简短提示
 */
function isTransitRoom(roomId, room) {
  // 方式1：房间数据中显式标记了 transit: true
  if (room.transit) return true;

  // 方式2：根据房间名称自动判断（走廊、过道、楼梯等）
  var transitKeywords = ['走廊', '过道', '通道', '楼梯', '阶梯', '连廊', '甬道', '廊道', '天桥', '隧道'];
  var name = room.name || '';
  for (var i = 0; i < transitKeywords.length; i++) {
    if (name.includes(transitKeywords[i])) return true;
  }

  // 方式3：房间ID包含transit/corridor/hallway等标记
  var idLower = roomId.toLowerCase();
  if (idLower.includes('corridor') || idLower.includes('hallway') || idLower.includes('transit') || idLower.includes('passage')) {
    return true;
  }

  return false;
}

function checkEventCondition(evt) {
  if (!evt.condition) return true;
  var c = evt.condition;
  if (c.hasClue && !G.cluesFound.includes(c.hasClue)) return false;
  if (c.hasItem && !hasDungeonItem(c.hasItem)) return false;
  if (c.sanBelow && G.san >= c.sanBelow) return false;
  if (c.sanAbove && G.san <= c.sanAbove) return false;
  if (c.visitedRoom && !G.visitedRooms.has(c.visitedRoom)) return false;
  if (c.clueCount && G.cluesFound.length < c.clueCount) return false;
  return true;
}

function executeEvent(evt) {
  G.triggeredEvents.add(evt.id);
  if (evt.delay) {
    setTimeout(function() { doExecuteEvent(evt); }, evt.delay);
  } else {
    doExecuteEvent(evt);
  }
}

function doExecuteEvent(evt) {
  if (evt.message) addMessage(evt.messageType || 'narrator', evt.message);
  if (evt.horror) addMessage('horror', evt.horror);
  if (evt.sanChange) updateSAN(G.san + evt.sanChange);
  if (evt.hpChange) updateHP(G.hp + evt.hpChange);
  if (evt.addItem) addDungeonItem(evt.addItem);
  if (evt.addClue) collectClue(evt.addClue);
  if (evt.unlockRoom) {
    G.dungeon.rooms[evt.unlockRoom].locked = false;
    addMessage('system', '🔓 新区域已解锁：' + G.dungeon.rooms[evt.unlockRoom].name);
    renderMinimap();
  }
  if (evt.notification) showNotification(evt.notification, evt.notificationType || 'horror');
  if (evt.triggerEnding) triggerEnding(evt.triggerEnding);
  saveGame();
}

function updateQuickActions(room) {
  var container = document.getElementById('quickActions');
  var html = '';

  html += '<button class="action-btn" onclick="doAction(\'调查\')">🔍 调查</button>';
  html += '<button class="action-btn" onclick="doAction(\'查看\')">👁️ 查看</button>';

  // 房间特殊交互
  if (room.specialActions) {
    room.specialActions.forEach(function(act) {
      if (act.condition && !checkActionCondition(act.condition)) return;
      html += '<button class="action-btn" onclick="doSpecialAction(\'' + act.id + '\')">' + act.icon + ' ' + act.label + '</button>';
    });
  }

  html += '<button class="action-btn" onclick="doAction(\'倾听\')">👂 倾听</button>';
  html += '<button class="action-btn" onclick="toggleClueSidebar()">📋 线索</button>';
  html += '<button class="action-btn primary" onclick="toggleInventory()">🎒 背包</button>';
  container.innerHTML = html;
}

function checkActionCondition(cond) {
  if (cond.hasItem && !hasDungeonItem(cond.hasItem)) return false;
  if (cond.hasClue && !G.cluesFound.includes(cond.hasClue)) return false;
  return true;
}

function doSpecialAction(actionId) {
  if (!G.dungeon || !G.currentRoom) return;
  var room = G.dungeon.rooms[G.currentRoom];
  var action = room.specialActions.find(function(a){ return a.id === actionId; });
  if (!action) return;

  if (action.message) addMessage('narrator', action.message);
  if (action.horror) addMessage('horror', action.horror);
  if (action.sanChange) updateSAN(G.san + action.sanChange);
  if (action.hpChange) updateHP(G.hp + action.hpChange);
  if (action.addItem) addDungeonItem(action.addItem);
  if (action.addClue) collectClue(action.addClue);
  if (action.unlockRoom) {
    G.dungeon.rooms[action.unlockRoom].locked = false;
    addMessage('system', '🔓 新区域已解锁');
    renderMinimap();
  }
  if (action.removeAfterUse) {
    room.specialActions = room.specialActions.filter(function(a){ return a.id !== actionId; });
    updateQuickActions(room);
  }
  if (action.triggerEnding) triggerEnding(action.triggerEnding);
}

//  通用行动处理 
function doAction(actionType) {
  if (!G.inDungeon || !G.currentRoom) {
    addMessage('system', '你现在不在副本中。');
    return;
  }
  var room = G.dungeon.rooms[G.currentRoom];

  // 检查房间是否有该行动的预设响应
  if (room.actions && room.actions[actionType]) {
    var act = room.actions[actionType];
    if (typeof act === 'string') {
      addMessage('narrator', act);
    } else {
      if (act.message) addMessage('narrator', act.message);
      if (act.horror) addMessage('horror', act.horror);
      if (act.sanChange) updateSAN(G.san + act.sanChange);
      if (act.addItem) addDungeonItem(act.addItem);
      if (act.addClue) collectClue(act.addClue);
      if (act.once) { delete room.actions[actionType]; }
    }
    return;
  }

  // 默认响应
  var defaults = {
    '调查': '你仔细调查了周围，没有发现特别的东西。',
    '查看': '你环顾四周...' + (room.lookDescription || room.description || '一切看起来很普通。'),
    '倾听': '你屏住呼吸仔细倾听...' + (room.listenDescription || '只有令人不安的寂静。')
  };
  addMessage('narrator', defaults[actionType] || '你尝试了，但什么也没发生。');
}
