// ★ 副本内参与者交互系统
// 让炮灰和可攻略角色在副本中出现、互动、死亡

// 在进入副本后注入参与者到房间
function injectParticipantsIntoDungeon() {
  
  if (!G.currentParticipants || !G.dungeon || !G.dungeon.rooms) {
    if (typeof gmLog === 'function') gmLog('注入失败：participants=' + !!G.currentParticipants + ' dungeon=' + !!G.dungeon);
    return;
  }

  var participants = G.currentParticipants.filter(function(p) { return p.type !== 'player'; });
  if (participants.length === 0) {
    if (typeof gmLog === 'function') gmLog('没有非玩家参与者');
    return;
  }

  var roomIds = Object.keys(G.dungeon.rooms).filter(function(id) { return id !== G.dungeon.startRoom; });
  if (roomIds.length === 0) {
    if (typeof gmLog === 'function') gmLog('没有可用房间');
    return;
  }

  // 初始化副本NPC列表
  G.dungeon._participants = [];

  // 确保所有参与者有 alive 状态
  G.currentParticipants.forEach(function(p) {
    if (p.alive === undefined) p.alive = true;
  });

  // 检查已死亡角色列表，标记已死亡的参与者
  if (G.deadCharacters && G.deadCharacters.length > 0) {
    G.currentParticipants.forEach(function(p) {
      if (p.type === 'player') return;
      var isDead = G.deadCharacters.some(function(dc) {
        var dcName = typeof dc === 'string' ? dc : dc.name;
        return dcName === p.name;
      });
      if (isDead) {
        p.alive = false;
        p._deathDesc = '在之前的副本中已经死亡';
      }
    });
  }

  participants.forEach(function(p, idx) {
    var targetRoom = roomIds[idx % roomIds.length];
    var room = G.dungeon.rooms[targetRoom];
    if (!room) return;

    var npc = {
      name: p.name,
      icon: p.icon || '👤',
      type: p.type,
      code: p.code,
      personality: p.personality || 'normal',
      quote: p.quote || '',
      dead: !p.alive,
      currentRoom: targetRoom,
      deathRate: p.deathRate || 0
    };
    G.dungeon._participants.push(npc);

    // 在房间中添加首次进入事件
    var encounterEvtId = 'participant_' + idx + '_' + targetRoom;
    room.events = room.events || [];
    room.events.push({
      id: encounterEvtId,
      trigger: 'firstVisit',
      delay: 800 + idx * 300,
      once: true,
      _participantIdx: idx
    });

    // 添加关键词交互
    room.keywords = room.keywords || {};
    room.keywords[p.name] = {
      message: npc.icon + ' ' + npc.name + '看了你一眼。' +
        (npc.type === 'target' ? '似乎对你有些好感。' :
         npc.type === 'fodder' ? '一脸紧张的样子。' : ''),
      messageType: 'narrator'
    };
  });

  console.log('👥 参与者注入完成：' + participants.length + '人分配到' + roomIds.length + '个房间');
}

// 处理参与者遭遇事件
function handleParticipantEncounter(participantIdx) {
  if (!G.dungeon || !G.dungeon._participants) return;
  var npc = G.dungeon._participants[participantIdx];
  if (!npc) return;

  if (npc.dead) {
    addMessage('horror', '你看到了' + npc.icon + ' ' + npc.name + '的尸体...' + getDeathDescription(npc));
    updateSAN(G.san - 3);
    return;
  }

  // 显示遭遇信息
  if (npc.type === 'target') {
    addMessage('narrator', npc.icon + ' ' + npc.name + '也在这里探索。看到你时微微点头示意。');
  } else if (npc.type === 'fodder') {
    addMessage('narrator', npc.icon + ' ' + npc.name + '缩在角落里，一脸惊恐。');
  } else {
    addMessage('narrator', npc.icon + ' ' + npc.name + '也在这个房间。');
  }

  if (npc.quote) {
    setTimeout(function() {
      if (npc.dead) return;
      addMessage('narrator', npc.icon + ' ' + npc.name + '：「' + npc.quote + '」');
    }, 1200);
  }

  // 炮灰延迟死亡
  if (npc.type === 'fodder' && npc.deathRate > 0) {
    scheduleNPCDeath(npc, participantIdx);
  }
}

function scheduleNPCDeath(npc, idx) {
  var deathDelay = 20000 + Math.random() * 80000;
  setTimeout(function() {
    if (npc.dead || G.gamePhase !== 'dungeon') return;
    if (Math.random() < npc.deathRate * 0.4) {
      killNPC(npc);
    }
  }, deathDelay);
}

// ★ 统一的NPC死亡处理（供 scheduleNPCDeath 和 triggerRandomNPCDeath 共用）
function killNPC(npc) {
  npc.dead = true;
  npc._deathDesc = getDeathDescription(npc);

  // 同步更新 currentParticipants 中的状态
  if (G.currentParticipants) {
    var participant = G.currentParticipants.find(function(p) {
      return p.name === npc.name && p.type !== 'player';
    });
    if (participant) {
      participant.alive = false;
      participant._deathDesc = npc._deathDesc;
    }
  }

  // 记录到死亡角色列表
  if (!G.deadCharacters) G.deadCharacters = [];
  var alreadyDead = G.deadCharacters.some(function(dc) {
    return (typeof dc === 'string' ? dc : dc.name) === npc.name;
  });
  if (!alreadyDead) {
    G.deadCharacters.push({
      name: npc.name,
      icon: npc.icon,
      code: npc.code,
      deathTime: Date.now(),
      deathLocation: G.dungeon ? G.dungeon.name : '未知'
    });
  }

  // 如果有AI，让AI描述死亡；否则用离线文本
  if (G.connected && typeof mujianSdk !== 'undefined' && mujianSdk && typeof callAIForNPCDeath === 'function') {
    // ai.js 中的 callAIForNPCDeath 会处理AI叙述
    callAIForNPCDeath(npc);
  } else {
    addMessage('horror', '💀 远处传来' + npc.icon + ' ' + npc.name + '的惨叫声...');
    addMessage('system', npc.name + ' 已死亡。');
    updateSAN(G.san - 5);
    showNotification('💀 ' + npc.name + ' 死亡', 'horror');
  }

  saveGame();
}

function getDeathDescription(npc) {
  var descs = {
    coward: '在恐惧中跑错了方向，再也没有回来。',
    arrogant: '自大地冲向了危险，为此付出了代价。',
    crybaby: '哭声引来了不该引来的东西。',
    brute: '蛮力在这里毫无用处。倒在了未知的恐惧面前。',
    vain: '尖叫声在走廊里回荡了很久。',
    runner: '跑得很快，但方向是错的。',
    drunk: '甚至没来得及清醒就永远睡着了。',
    thug: '暴力在这个地方只会招来更大的暴力。',
    greedy: '贪婪让他触碰了不该触碰的东西。',
    gamer: '这不是游戏。太晚才意识到这一点。',
    normal: '在副本中遭遇不测，永远留在了这里。'
  };
  return descs[npc.personality] || descs['normal'];
}

// ★ 随机NPC死亡（被 ui.js 的计时器调用）
// 注意：这个函数会覆盖 ai.js 中的同名函数
// 所以这里整合了两边的逻辑
function triggerRandomNPCDeath() {
  if (!G.inDungeon || G.gamePhase !== 'dungeon') return;

  // 优先使用 currentParticipants（ai.js 的数据源）
  if (G.currentParticipants && G.currentParticipants.length > 0) {
    var aliveFodders = G.currentParticipants.filter(function(p) {
      return p.type === 'fodder' && p.alive;
    });

    if (aliveFodders.length === 0) return;

    // 按死亡率排序，高死亡率优先
    aliveFodders.sort(function(a, b) { return (b.deathRate || 0.5) - (a.deathRate || 0.5); });

    var victim = null;
    for (var i = 0; i < aliveFodders.length; i++) {
      if (Math.random() < (aliveFodders[i].deathRate || 0.5) * 0.3) {
        victim = aliveFodders[i];
        break;
      }
    }

    if (!victim) return;

    // 标记死亡
    victim.alive = false;
    var roomIds = Object.keys(G.dungeon.rooms);
    victim._deathRoomIdx = Math.floor(Math.random() * roomIds.length);

    var deathDescs = [
      '被不明力量撕裂',
      '在黑暗中消失，只留下一滩血迹',
      '被墙壁中伸出的手拖了进去',
      '突然倒地，面部扭曲成不可能的角度',
      '在尖叫声中被天花板上掉落的东西砸中',
      '触碰了不该触碰的东西后全身僵硬',
      '被镜子中的自己拉了进去'
    ];
    victim._deathDesc = deathDescs[Math.floor(Math.random() * deathDescs.length)];

    // 同步到 _participants
    if (G.dungeon && G.dungeon._participants) {
      var pNpc = G.dungeon._participants.find(function(n) { return n.name === victim.name; });
      if (pNpc) {
        pNpc.dead = true;
        pNpc._deathDesc = victim._deathDesc;
      }
    }

    // 记录到死亡角色列表
    if (!G.deadCharacters) G.deadCharacters = [];
    var alreadyDead = G.deadCharacters.some(function(dc) {
      return (typeof dc === 'string' ? dc : dc.name) === victim.name;
    });
    if (!alreadyDead) {
      G.deadCharacters.push({
        name: victim.name,
        icon: victim.icon,
        code: victim.code,
        deathTime: Date.now(),
        deathLocation: G.dungeon ? G.dungeon.name : '未知'
      });
    }

    // 用AI描述死亡
    if (G.connected && typeof mujianSdk !== 'undefined' && mujianSdk && typeof callAIForNPCDeath === 'function') {
      callAIForNPCDeath(victim);
    } else {
      addMessage('horror', '远处传来一声凄厉的惨叫——' + victim.icon + ' ' + victim.name + '的声音突然中断了。');
      addMessage('system', '⚠️ ' + victim.name + '已死亡');
      updateSAN(G.san - 8);
      showNotification('💀 ' + victim.name + '死了', 'horror');
    }

    saveGame();
    return;
  }

  // 回退：使用 dungeon._participants
  if (!G.dungeon || !G.dungeon._participants) return;

  var alive = G.dungeon._participants.filter(function(p) {
    return !p.dead && p.type === 'fodder';
  });
  if (alive.length === 0) return;

  var fallbackVictim = alive[Math.floor(Math.random() * alive.length)];
  if (Math.random() < (fallbackVictim.deathRate || 0.3) * 0.3) {
    killNPC(fallbackVictim);
  }
}

// ★ 获取存活/死亡参与者数量
function getAliveParticipantCount() {
  if (!G.currentParticipants) return 0;
  return G.currentParticipants.filter(function(p) {
    return p.type !== 'player' && p.alive;
  }).length;
}

function getDeadParticipantCount() {
  if (!G.currentParticipants) return 0;
  return G.currentParticipants.filter(function(p) {
    return p.type !== 'player' && !p.alive;
  }).length;
}
