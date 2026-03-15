// 第七部分：GM隐藏面板 + 道具自动生成

var GM_SECRET_CODE = "gmGM密码:ababaab"; // 你自己修改这个密码

var GM_PANEL_OPEN = false;

// GM调试日志收集器
var GM_DEBUG_LOG = [];
function gmLog(msg) {
  GM_DEBUG_LOG.push({ time: Date.now(), msg: msg });
  if (GM_DEBUG_LOG.length > 100) GM_DEBUG_LOG.shift(); // 最多保留100条
  console.log('[GM] ' + msg);
}

function checkGMPassword(event) {
  if (event.key === 'Enter') {
    var input = document.getElementById('playerInput');
    var text = input.value.trim();
    if (text === GM_SECRET_CODE) {
      input.value = '';
      toggleGMPanel();
      return;
    }
    sendPlayerInput();
  }
}

function toggleGMPanel() {
  GM_PANEL_OPEN = !GM_PANEL_OPEN;
  document.getElementById('gmOverlay').classList.toggle('show', GM_PANEL_OPEN);
  if (GM_PANEL_OPEN) {
    switchGMTab('items');
  }
}

function closeGMPanel() {
  GM_PANEL_OPEN = false;
  document.getElementById('gmOverlay').classList.remove('show');
}

function switchGMTab(tab) {
  document.querySelectorAll('.gm-tab').forEach(function(t) {
    t.classList.remove('active');
    if (t.textContent.includes(tab === 'items' ? '道具' : (tab === 'rooms' ? '房间' : (tab === 'clues' ? '线索' : (tab === 'events' ? '事件' : '调试'))))) {
      t.classList.add('active');
    }
  });

  var content = document.getElementById('gmContent');
  switch(tab) {
    case 'items': renderGMItems(content); break;
    case 'rooms': renderGMRooms(content); break;
    case 'clues': renderGMClues(content); break;
    case 'events': renderGMEvents(content); break;
    case 'debug': renderGMDebug(content); break;
  }
}

// GM预览用的临时副本数据
var GM_PREVIEW_DUNGEON = null;

function gmPreviewNextDungeon() {
  // 随机选一个未通关的副本生成预览
  var dungeon = getRandomUncompletedDungeon();
  if (!dungeon) {
    showNotification('没有可用副本', 'horror');
    return null;
  }
  var factory = DUNGEON_FACTORIES[dungeon.id];
  if (!factory) return null;
  var config = factory();
  // 生成道具
  generateDungeonItems(config);
  // 生成参与者
  var participants = generateDungeonParticipants(dungeon, false);
  GM_PREVIEW_DUNGEON = {
    config: config,
    entry: dungeon,
    participants: participants
  };
  return GM_PREVIEW_DUNGEON;
}

function gmPreviewForcedDungeon() {
  var dungeon = getRandomUncompletedDungeon();
  if (!dungeon) return null;
  var factory = DUNGEON_FACTORIES[dungeon.id];
  if (!factory) return null;
  var config = factory();
  generateDungeonItems(config);
  var participants = generateDungeonParticipants(dungeon, true);
  GM_PREVIEW_DUNGEON = {
    config: config,
    entry: dungeon,
    participants: participants,
    forced: true
  };
  return GM_PREVIEW_DUNGEON;
}

function gmPreviewSpecificDungeon(dungeonId) {
  var factory = DUNGEON_FACTORIES[dungeonId];
  if (!factory) { showNotification('副本不存在', 'horror'); return null; }
  var entry = DUNGEON_LIST.find(function(d) { return d.id === dungeonId; });
  var config = factory();
  generateDungeonItems(config);
  var participants = generateDungeonParticipants(entry || { id: dungeonId, difficulty: '★★' }, false);
  GM_PREVIEW_DUNGEON = {
    config: config,
    entry: entry,
    participants: participants
  };
  return GM_PREVIEW_DUNGEON;
}

function getGMDungeon() {
  // 优先用预览数据，其次用当前副本
  if (G.dungeon && G.inDungeon) return G.dungeon;
  if (GM_PREVIEW_DUNGEON) return GM_PREVIEW_DUNGEON.config;
  return null;
}

function renderGMItems(container) {
  var dungeon = getGMDungeon();
  if (!dungeon) {
    container.innerHTML = '<div style="text-align:center;color:#555;padding:20px">未进入副本且未生成预览<br><br>点击「调试」标签生成下一个副本预览</div>';
    return;
  }
  var html = '<div style="margin-bottom:8px;color:#b57a7a">🎒 副本道具 — ' + dungeon.name + '</div>';
  var effects = dungeon.itemEffects || {};
  var keys = Object.keys(effects);
  if (keys.length === 0) {
    html += '<div style="text-align:center;color:#555">暂无道具数据（点调试标签生成）</div>';
  } else {
    keys.forEach(function(itemId) {
      var effect = effects[itemId];
      html += '<div class="gm-item">';
      html += '<div class="gm-item-label">' + (effect.icon || '📦') + ' ' + (effect.name || itemId) + '</div>';
      html += '<div class="gm-item-desc">' + (effect.desc || '') + '</div>';
      html += '<div class="gm-item-code">ID: ' + itemId + ' | 可用: ' + (effect.usable ? '是' : '否') + ' | 可带出: ' + (effect.canTakeOut ? '是' : '否') + ' | 消耗: ' + (effect.consumable ? '是' : '否') + '</div>';
      if (effect.message) html += '<div class="gm-item-code" style="color:#666">' + effect.message + '</div>';
      html += '</div>';
    });
  }
  // 显示房间内嵌道具（keywords中的addItem）
  html += '<div style="margin-top:12px;margin-bottom:8px;color:#b57a7a">📍 房间内嵌道具</div>';
  var embeddedCount = 0;
  Object.keys(dungeon.rooms).forEach(function(rid) {
    var room = dungeon.rooms[rid];
    if (!room.keywords) return;
    Object.keys(room.keywords).forEach(function(kw) {
      var resp = room.keywords[kw];
      if (resp && typeof resp === 'object' && resp.addItem) {
        embeddedCount++;
        html += '<div class="gm-item">';
        html += '<div class="gm-item-label">' + (resp.addItem.icon || '📦') + ' ' + resp.addItem.name + ' <span style="color:#555">← 关键词「' + kw + '」</span></div>';
        html += '<div class="gm-item-desc">房间: ' + room.name + ' | ' + (resp.addItem.desc || '') + '</div>';
        html += '</div>';
      }
    });
  });
  if (embeddedCount === 0) html += '<div style="color:#555;font-size:11px">无嵌入道具</div>';
  container.innerHTML = html;
}

function renderGMRooms(container) {
  var dungeon = getGMDungeon();
  if (!dungeon) { container.innerHTML = '<div style="text-align:center;color:#555">未进入副本且未生成预览</div>'; return; }
  var html = '<div style="margin-bottom:8px;color:#b57a7a">🚪 房间数据 — ' + dungeon.name + '</div>';
  Object.keys(dungeon.rooms).forEach(function(roomId) {
    var room = dungeon.rooms[roomId];
    var isCurrent = G.inDungeon && G.currentRoom === roomId;
    html += '<div class="gm-item" style="' + (isCurrent ? 'border-color:#cc3333' : '') + '">';
    html += '<div class="gm-item-label">' + (room.icon || '🚪') + ' ' + room.name + (isCurrent ? ' 📍当前' : '') + (room.locked ? ' 🔒' : '') + '</div>';
    html += '<div class="gm-item-desc">' + (room.description || '').substring(0, 80) + '...</div>';
    html += '<div class="gm-item-code">ID: ' + roomId + ' | 连接: ' + (room.connections || []).join(', ') + '</div>';
    if (room.directionMap) html += '<div class="gm-item-code">方向: ' + JSON.stringify(room.directionMap) + '</div>';
    // 显示房间特殊行动
    if (room.specialActions && room.specialActions.length > 0) {
      html += '<div class="gm-item-code" style="color:#b57a7a">特殊行动: ';
      room.specialActions.forEach(function(sa) { html += sa.icon + sa.label + ' '; });
      html += '</div>';
    }
    // 显示房间事件数
    if (room.events && room.events.length > 0) {
      html += '<div class="gm-item-code" style="color:#cc4444">事件: ' + room.events.length + '个</div>';
    }
    html += '</div>';
  });
  container.innerHTML = html;
}

function renderGMClues(container) {
  var dungeon = getGMDungeon();
  if (!dungeon) { container.innerHTML = '<div style="text-align:center;color:#555">未进入副本且未生成预览</div>'; return; }
  var html = '<div style="margin-bottom:8px;color:#b57a7a">🔍 线索数据 — ' + dungeon.name + '</div>';
  var clueKeys = Object.keys(dungeon.clues);
  if (clueKeys.length === 0) {
    html += '<div style="text-align:center;color:#555">暂无线索</div>';
  } else {
    clueKeys.forEach(function(clueId) {
      var clue = dungeon.clues[clueId];
      var found = G.inDungeon && G.cluesFound.includes(clueId);
      html += '<div class="gm-item" style="' + (found ? 'border-color:#ffd700' : '') + '">';
      html += '<div class="gm-item-label">' + (clue.icon || '📋') + ' ' + clue.name + (found ? ' ✅已收集' : '') + '</div>';
      html += '<div class="gm-item-desc">SAN消耗: ' + (clue.sanCost || 0) + ' | 位置: ' + (clue.foundIn || '未知') + '</div>';
      html += '<div class="gm-item-code">' + clue.description + '</div>';
      html += '</div>';
    });
  }
  // 结局条件
  html += '<div style="margin-top:12px;margin-bottom:8px;color:#b57a7a">🏁 结局条件</div>';
  (dungeon.endings || []).forEach(function(ending) {
    html += '<div class="gm-item">';
    html += '<div class="gm-item-label">' + ending.title + ' <span style="color:#ffd700">' + (ending.rating || '?') + '级</span></div>';
    html += '<div class="gm-item-desc">碎片奖励: ' + (ending.fragmentReward || 0) + '</div>';
    if (ending.requirements) {
      html += '<div class="gm-item-code">条件: ' + JSON.stringify(ending.requirements) + '</div>';
    }
    html += '</div>';
  });
  container.innerHTML = html;
}

function renderGMEvents(container) {
  var dungeon = getGMDungeon();
  if (!dungeon) { container.innerHTML = '<div style="text-align:center;color:#555">未进入副本且未生成预览</div>'; return; }
  var html = '<div style="margin-bottom:8px;color:#b57a7a">⚡ 房间事件 — ' + dungeon.name + '</div>';
  var eventCount = 0;
  Object.keys(dungeon.rooms).forEach(function(roomId) {
    var room = dungeon.rooms[roomId];
    if (room.events && room.events.length > 0) {
      room.events.forEach(function(evt) {
        eventCount++;
        var triggered = G.inDungeon && G.triggeredEvents.has(evt.id);
        html += '<div class="gm-item" style="' + (triggered ? 'opacity:0.5' : '') + '">';
        html += '<div class="gm-item-label">' + room.name + ' — ' + evt.id + (triggered ? ' ✅已触发' : '') + '</div>';
        html += '<div class="gm-item-desc">触发: ' + evt.trigger + (evt.delay ? ' (延迟' + evt.delay + 'ms)' : '') + '</div>';
        if (evt.condition) html += '<div class="gm-item-code">条件: ' + JSON.stringify(evt.condition) + '</div>';
        if (evt.horror) html += '<div class="gm-item-code" style="color:#cc4444">恐怖: ' + evt.horror.substring(0, 60) + '...</div>';
        if (evt.sanChange) html += '<div class="gm-item-code">SAN: ' + evt.sanChange + '</div>';
        if (evt.unlockRoom) html += '<div class="gm-item-code" style="color:#88ff88">解锁: ' + evt.unlockRoom + '</div>';
        html += '</div>';
      });
    }
  });
  if (eventCount === 0) {
    html += '<div style="text-align:center;color:#555">暂无事件</div>';
  }
  // 参与者信息
  if (GM_PREVIEW_DUNGEON && GM_PREVIEW_DUNGEON.participants) {
    html += '<div style="margin-top:12px;margin-bottom:8px;color:#b57a7a">👥 参与者</div>';
    GM_PREVIEW_DUNGEON.participants.forEach(function(p) {
      html += '<div class="gm-item">';
      html += '<div class="gm-item-label">' + p.icon + ' ' + p.name + ' <span style="color:#555">[' + p.type + ']</span></div>';
      html += '<div class="gm-item-desc">' + p.title + (p.deathRate ? ' | 死亡率:' + Math.round(p.deathRate * 100) + '%' : '') + '</div>';
      if (p.quote) html += '<div class="gm-item-code">「' + p.quote + '」</div>';
      html += '</div>';
    });
  }
  container.innerHTML = html;
}

function renderGMDebug(container) {
  var dungeon = getGMDungeon();
  var html = '<div style="margin-bottom:8px;color:#b57a7a">🔧 调试工具</div>';

  //   副本大纲（GM专用，玩家看不到）  
  if (dungeon) {
    html += '<div class="gm-item" style="border-color:#5a3a1a;background:rgba(50,30,10,0.3)">';
    html += '<div class="gm-item-label" style="color:#ffd700">📜 副本大纲（GM专用）</div>';
    html += '<div style="color:#ccc;font-size:12px;line-height:1.8;margin-top:6px">';
    html += '<div style="color:#b57a7a;font-weight:bold">副本名：' + dungeon.name + '</div>';
    html += '<div style="margin-top:4px"><span style="color:#888">AI提示：</span>' + (dungeon.aiHints || '无') + '</div>';
    html += '<div style="margin-top:4px"><span style="color:#888">开场白：</span>' + (dungeon.intro || '无').substring(0, 100) + '...</div>';
    html += '<div style="margin-top:4px"><span style="color:#888">房间数：</span>' + Object.keys(dungeon.rooms).length + '</div>';
    html += '<div style="margin-top:4px"><span style="color:#888">线索数：</span>' + Object.keys(dungeon.clues).length + '</div>';
    html += '<div style="margin-top:4px"><span style="color:#888">结局数：</span>' + (dungeon.endings ? dungeon.endings.length : 0) + '</div>';
    // 房间流程图
    html += '<div style="margin-top:8px;color:#b57a7a;font-weight:bold">🗺️ 房间流程</div>';
    Object.keys(dungeon.rooms).forEach(function(rid) {
      var room = dungeon.rooms[rid];
      var lockInfo = room.locked ? ' 🔒' + (room.lockHint ? '(' + room.lockHint + ')' : '') : '';
      var keyInfo = room.keyRequired ? ' 🔑需要:' + room.keyRequired : '';
      html += '<div style="font-size:10px;color:#aaa;padding:2px 0">';
      html += (rid === dungeon.startRoom ? '🟢 ' : '  ') + room.name + lockInfo + keyInfo;
      html += ' → [' + (room.connections || []).join(', ') + ']';
      html += '</div>';
    });
    // 线索链
    html += '<div style="margin-top:8px;color:#b57a7a;font-weight:bold">🔗 线索链</div>';
    Object.keys(dungeon.clues).forEach(function(cid) {
      var clue = dungeon.clues[cid];
      html += '<div style="font-size:10px;color:#aaa;padding:2px 0">';
      html += (clue.icon || '📋') + ' ' + clue.name + ' [SAN-' + (clue.sanCost || 0) + '] @ ' + (clue.foundIn || '?');
      html += '</div>';
    });
    // 结局条件
    html += '<div style="margin-top:8px;color:#b57a7a;font-weight:bold">🏁 结局路线</div>';
    (dungeon.endings || []).forEach(function(ending) {
      html += '<div style="font-size:10px;color:#aaa;padding:2px 0">';
      html += ending.title + ' [' + (ending.rating || '?') + '级 💎' + (ending.fragmentReward || 0) + ']';
      if (ending.requirements) {
        var reqs = [];
        if (ending.requirements.clues) reqs.push('线索:' + ending.requirements.clues.join(','));
        if (ending.requirements.items) reqs.push('道具:' + ending.requirements.items.join(','));
        if (ending.requirements.room) reqs.push('房间:' + ending.requirements.room);
        if (ending.requirements.minClueCount) reqs.push('最少线索:' + ending.requirements.minClueCount);
        html += ' | 条件:' + reqs.join(' + ');
      }
      html += '</div>';
    });
    html += '</div></div>';
  }

  //   参与者信息  
  if (GM_PREVIEW_DUNGEON && GM_PREVIEW_DUNGEON.participants) {
    html += '<div class="gm-item" style="border-color:#3a5a1a;background:rgba(30,50,10,0.2)">';
    html += '<div class="gm-item-label" style="color:#88ff88">👥 副本参与者</div>';
    GM_PREVIEW_DUNGEON.participants.forEach(function(p) {
      var typeColor = p.type === 'player' ? '#ff4444' : (p.type === 'target' ? '#DAA520' : '#888');
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a0a0a">';
      html += '<span style="color:#ddd;font-size:11px">' + p.icon + ' ' + p.name + '</span>';
      html += '<span style="font-size:9px;color:' + typeColor + '">' + p.type + (p.deathRate ? ' 死亡率' + Math.round(p.deathRate * 100) + '%' : '') + '</span>';
      html += '</div>';
    });
    html += '</div>';
  } else if (G.currentParticipants) {
    html += '<div class="gm-item" style="border-color:#3a5a1a;background:rgba(30,50,10,0.2)">';
    html += '<div class="gm-item-label" style="color:#88ff88">👥 当前副本参与者</div>';
    G.currentParticipants.forEach(function(p) {
      var typeColor = p.type === 'player' ? '#ff4444' : (p.type === 'target' ? '#DAA520' : '#888');
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a0a0a">';
      html += '<span style="color:#ddd;font-size:11px">' + p.icon + ' ' + p.name + '</span>';
      html += '<span style="font-size:9px;color:' + typeColor + '">' + p.type + (p.deathRate ? ' 死亡率' + Math.round(p.deathRate * 100) + '%' : '') + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  //   生成预览按钮组  
  html += '<div class="gm-item" style="display:flex;flex-direction:column;gap:6px">';
  html += '<div class="gm-item-label">📋 副本预览生成</div>';
  html += '<button class="action-btn primary" onclick="GM_GenerateRandomPreview()" style="width:100%">🎲 生成随机副本预览</button>';
  html += '<button class="action-btn" onclick="GM_GenerateForcedPreview()" style="width:100%">⚠️ 生成强制副本预览</button>';
  html += '<div style="display:flex;gap:4px;margin-top:4px">';
  html += '<input type="text" id="gmDungeonIdInput" placeholder="输入副本ID如 hospital" style="flex:1;padding:4px 8px;border:1px solid #3a1515;border-radius:4px;background:rgba(20,8,8,0.8);color:#c8c8d0;font-size:11px;outline:none">';
  html += '<button class="action-btn" onclick="GM_GenerateSpecificPreview()" style="white-space:nowrap">指定生成</button>';
  html += '</div>';
  html += '</div>';

  // 直接进入预览副本
  if (GM_PREVIEW_DUNGEON) {
    html += '<div class="gm-item" style="border-color:#cc3333">';
    html += '<div class="gm-item-label" style="color:#ff6666">🚪 当前预览: ' + GM_PREVIEW_DUNGEON.config.name + (GM_PREVIEW_DUNGEON.forced ? ' [强制]' : '') + '</div>';
    html += '<div class="gm-item-desc">房间: ' + Object.keys(GM_PREVIEW_DUNGEON.config.rooms).length + ' | 线索: ' + Object.keys(GM_PREVIEW_DUNGEON.config.clues).length + ' | 道具: ' + Object.keys(GM_PREVIEW_DUNGEON.config.itemEffects || {}).length + '</div>';
    html += '<button class="action-btn primary" onclick="GM_EnterPreviewDungeon()" style="width:100%;margin-top:6px">⚡ 直接进入此副本</button>';
    html += '<button class="action-btn" onclick="GM_ShowPreviewIntro()" style="width:100%;margin-top:4px">📖 显示副本介绍页</button>';
    html += '</div>';
  }

  // 副本内工具
  if (G.inDungeon && G.dungeon) {
    html += '<div style="margin-top:8px;margin-bottom:4px;color:#b57a7a">🎮 副本内工具</div>';
    html += '<div class="gm-item"><button class="action-btn" onclick="GM_ForceGenerateItems()" style="width:100%">🎲 重新生成道具</button></div>';
    html += '<div class="gm-item"><button class="action-btn" onclick="GM_AddAllClues()" style="width:100%">🔍 收集所有线索</button></div>';
    html += '<div class="gm-item"><button class="action-btn" onclick="GM_UnlockAllRooms()" style="width:100%">🚪 解锁所有房间</button></div>';
  }

  // 通用工具
  html += '<div style="margin-top:8px;margin-bottom:4px;color:#b57a7a">💊 通用工具</div>';
  html += '<div class="gm-item"><button class="action-btn" onclick="GM_FullRestore()" style="width:100%">💰 满状态恢复</button></div>';
  html += '<div class="gm-item"><button class="action-btn" onclick="GM_AddFragments()" style="width:100%">💎 +1000碎片</button></div>';

  // 状态显示
  html += '<div style="margin-top:12px;padding:8px;background:rgba(20,8,8,0.6);border-radius:6px">';
  html += '<div style="color:#888;font-size:11px">当前状态</div>';
  html += '<div style="color:#aaa">HP: ' + G.hp + '/' + G.maxHp + ' | SAN: ' + G.san + '/' + G.maxSan + '</div>';
  html += '<div style="color:#ffd700">碎片: ' + G.soulFragments + '</div>';
  html += '<div style="color:#aaa">阶段: ' + G.gamePhase + ' | 副本中: ' + G.inDungeon + '</div>';
  if (G.inDungeon) html += '<div style="color:#aaa">当前房间: ' + G.currentRoom + ' | 副本: ' + (G.dungeon ? G.dungeon.name : '无') + '</div>';
  if (GM_PREVIEW_DUNGEON) html += '<div style="color:#ff6666">预览副本: ' + GM_PREVIEW_DUNGEON.config.name + '</div>';
    html += '</div>';

  // 调试日志
  html += '<div style="margin-top:12px;margin-bottom:4px;color:#b57a7a">📋 调试日志 <span style="color:#555;font-size:10px">(' + GM_DEBUG_LOG.length + '条)</span></div>';
  html += '<div style="max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.4);border:1px solid #1a0a0a;border-radius:4px;padding:4px">';
  if (GM_DEBUG_LOG.length === 0) {
    html += '<div style="color:#555;font-size:10px;text-align:center;padding:8px">暂无日志</div>';
  } else {
    for (var i = GM_DEBUG_LOG.length - 1; i >= 0; i--) {
      var log = GM_DEBUG_LOG[i];
      var t = new Date(log.time);
      var ts = t.getHours() + ':' + String(t.getMinutes()).padStart(2,'0') + ':' + String(t.getSeconds()).padStart(2,'0');
      html += '<div style="font-size:10px;color:#aaa;padding:2px 4px;border-bottom:1px solid #0a0505"><span style="color:#555">[' + ts + ']</span> ' + log.msg + '</div>';
    }
  }
  html += '</div>';
  html += '<button class="action-btn" onclick="GM_DEBUG_LOG=[];switchGMTab(\'debug\')" style="width:100%;margin-top:4px;font-size:10px">🗑️ 清空日志</button>';

  container.innerHTML = html;
}

function GM_GenerateRandomPreview() {
  var preview = gmPreviewNextDungeon();
  if (preview) {
    showNotification('🎲 已生成: ' + preview.config.name, 'clue');
    addMessage('system', '🔧 [GM] 已生成随机副本预览：「' + preview.config.name + '」');
    addMessage('system', '房间: ' + Object.keys(preview.config.rooms).length + ' | 线索: ' + Object.keys(preview.config.clues).length + ' | 道具: ' + Object.keys(preview.config.itemEffects || {}).length);
    switchGMTab('debug');
  }
}

function GM_GenerateForcedPreview() {
  var preview = gmPreviewForcedDungeon();
  if (preview) {
    showNotification('⚠️ 已生成强制副本: ' + preview.config.name, 'clue');
    addMessage('system', '🔧 [GM] 已生成强制副本预览：「' + preview.config.name + '」');
    switchGMTab('debug');
  }
}

function GM_GenerateSpecificPreview() {
  var input = document.getElementById('gmDungeonIdInput');
  if (!input || !input.value.trim()) { showNotification('请输入副本ID', 'horror'); return; }
  var preview = gmPreviewSpecificDungeon(input.value.trim());
  if (preview) {
    showNotification('已生成: ' + preview.config.name, 'clue');
    addMessage('system', '🔧 [GM] 已生成指定副本预览：「' + preview.config.name + '」');
    switchGMTab('debug');
  }
}

function GM_EnterPreviewDungeon() {
  if (!GM_PREVIEW_DUNGEON) { showNotification('没有预览数据', 'horror'); return; }
  closeGMPanel();
  if (GM_PREVIEW_DUNGEON.forced) {
    showDungeonIntroPage(GM_PREVIEW_DUNGEON.entry, GM_PREVIEW_DUNGEON.participants, true);
  } else {
    showDungeonIntroPage(GM_PREVIEW_DUNGEON.entry, GM_PREVIEW_DUNGEON.participants, false);
  }
}

function GM_ShowPreviewIntro() {
  if (!GM_PREVIEW_DUNGEON) { showNotification('没有预览数据', 'horror'); return; }
  closeGMPanel();
  showDungeonIntroPage(GM_PREVIEW_DUNGEON.entry, GM_PREVIEW_DUNGEON.participants, GM_PREVIEW_DUNGEON.forced || false);
}

function GM_ForceGenerateItems() {
  if (!G.dungeon || !G.inDungeon) { showNotification('未进入副本', 'horror'); return; }
  generateDungeonItems(G.dungeon);
  renderGMItems(document.getElementById('gmContent'));
  showNotification('道具已重新生成', 'clue');
}

function GM_AddAllClues() {
  if (!G.dungeon || !G.inDungeon) return;
  Object.keys(G.dungeon.clues).forEach(function(cid) {
    if (!G.cluesFound.includes(cid)) collectClue(cid);
  });
  showNotification('已收集所有线索', 'clue');
}

function GM_UnlockAllRooms() {
  if (!G.dungeon || !G.inDungeon) return;
  Object.keys(G.dungeon.rooms).forEach(function(rid) {
    G.dungeon.rooms[rid].locked = false;
  });
  renderMinimap();
  showNotification('所有房间已解锁', 'clue');
}

function GM_FullRestore() {
  updateHP(G.maxHp);
  updateSAN(G.maxSan);
  showNotification('状态已恢复', 'clue');
}

function GM_AddFragments() {
  G.soulFragments += 1000;
  updateFragmentDisplay();
  showNotification('💎 +1000', 'clue');
}

// 自动进入下一个副本（不需要选择）
function autoEnterNextDungeon() {
  var dungeon = getRandomUncompletedDungeon();
  if (!dungeon) {
    addMessage('system', '没有可用的副本。');
    return;
  }
  var participants = generateDungeonParticipants(dungeon, false);
  showDungeonIntroPage(dungeon, participants, false);
}

console.log('✅ 第七部分加载完成：GM隐藏面板 + 道具自动生成');
