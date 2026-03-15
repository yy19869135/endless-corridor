function saveGame() {
  try {
    var saveData = {
      version: 3,
      timestamp: Date.now(),
      // 玩家信息
      playerCode: G.playerCode,
      playerDisplayCode: G.playerDisplayCode,
      playerName: G.playerName,
      playerPersona: G.playerPersona,
      // 基础状态
      hp: G.hp, maxHp: G.maxHp,
      san: G.san, maxSan: G.maxSan,
      soulFragments: G.soulFragments,
      factionDrawn: G.factionDrawn,
      playerFaction: G.playerFaction,
      systemUnlocked: G.systemUnlocked,

      // ★ 成长系统（新增）
      playerLevel: G.playerLevel || 1,
      playerExp: G.playerExp || 0,
      totalDungeonClears: G.totalDungeonClears || 0,
      totalDeaths: G.totalDeaths || 0,
      bestRating: G.bestRating || 'F',

      // ★ 排行榜（保存完整数据，含NPC增长后的分数）
      leaderboard: G.leaderboard,

      // 永久数据
      permanentItems: G.permanentItems.map(function(i) {
        return { id: i.id, name: i.name, icon: i.icon, desc: i.desc, count: i.count, consumable: i.consumable, stackable: i.stackable };
      }),
      completedDungeons: G.completedDungeons,
      contacts: G.contacts.map(function(c) {
        return { code: c.code, affinity: c.affinity, chatHistory: (c.chatHistory || []).slice(-20), unlockTime: c.unlockTime };
      }),
      team: G.team,
      deadCharacters: G.deadCharacters,
      // 游戏阶段
      inDungeon: G.inDungeon,
      gamePhase: G.gamePhase,
      worldLocation: G.worldLocation,
      // 副本状态
      currentRoom: G.currentRoom,
      visitedRooms: Array.from(G.visitedRooms),
      triggeredEvents: Array.from(G.triggeredEvents),
      dungeonItems: G.dungeonItems,
      cluesFound: G.cluesFound,
      gameTime: G.gameTime,
      currentParticipants: G.currentParticipants,
      dungeonId: G.dungeon ? G.dungeon.id : null,
      // 大世界
      visitedWorldLocations: Array.from(G.visitedWorldLocations || []),
      _firstDungeonTriggered: G._firstDungeonTriggered || false,
      _pendingRetaliations: G._pendingRetaliations || [],
      messageHistory: G.messageHistory.slice(-50),
// 先驱者笔记进度
hintViewedMap: (typeof hintViewedMap !== 'undefined') ? hintViewedMap : {},
hintDetailViewedMap: (typeof hintDetailViewedMap !== 'undefined') ? hintDetailViewedMap : {}
    };
    var json = JSON.stringify(saveData);
    localStorage.setItem('paleCorridor_save', json);

    // 同时保存信誉和委托数据
    if (typeof REPUTATION_SYSTEM !== 'undefined') {
      localStorage.setItem('pale_corridor_reputation', JSON.stringify(REPUTATION_SYSTEM));
    }
    if (typeof COMMISSION_SYSTEM !== 'undefined') {
      localStorage.setItem('pale_corridor_commissions', JSON.stringify({
        playerCommissions: COMMISSION_SYSTEM.playerCommissions.filter(function(c) { return c.status !== 'done' || Date.now() - c.publishTime < 600000; }),
        completedCommissions: COMMISSION_SYSTEM.completedCommissions.slice(-20),
        _lastRefresh: COMMISSION_SYSTEM._lastRefresh
      }));
    }
    if (typeof CYCLE_SYSTEM !== 'undefined') {
      localStorage.setItem('paleCorridor_cycle', JSON.stringify({
        cycleStartTime: CYCLE_SYSTEM.cycleStartTime,
        forcedDungeonId: CYCLE_SYSTEM.forcedDungeonId,
        activeQuest: CYCLE_SYSTEM.activeQuest
      }));
    }

    return true;
  } catch(e) {
    console.warn('存档失败:', e);
    return false;
  }
}

function loadGame() {
  try {
    var raw = localStorage.getItem('paleCorridor_save');
    if (!raw) return false;
    var s = JSON.parse(raw);
    if (!s || !s.version) return false;

    // 玩家信息
    G.playerCode = s.playerCode || null;
    G.playerDisplayCode = s.playerDisplayCode || null;
    G.playerName = s.playerName || null;
    G.playerPersona = s.playerPersona || null;

    // 基础状态
    G.hp = s.hp || 10; G.maxHp = s.maxHp || 10;
    G.san = s.san || 100; G.maxSan = s.maxSan || 100;
    G.soulFragments = s.soulFragments || 0;
    G.factionDrawn = s.factionDrawn || false;
    G.playerFaction = s.playerFaction || null;
    G.systemUnlocked = s.systemUnlocked || false;

    // ★ 成长系统（新增）
    G.playerLevel = s.playerLevel || 1;
    G.playerExp = s.playerExp || 0;
    G.totalDungeonClears = s.totalDungeonClears || 0;
    G.totalDeaths = s.totalDeaths || 0;
    G.bestRating = s.bestRating || 'F';

    // ★ 排行榜（从存档恢复，含NPC增长后的分数）
    if (s.leaderboard && s.leaderboard.length > 4) {
      G.leaderboard = s.leaderboard;
    }

    // ★ 根据等级重算maxHp/maxSan（防止存档不一致）
    var calcMaxHp = Math.min(20, 10 + Math.floor(G.playerLevel / 3));
    var calcMaxSan = Math.min(200, 100 + G.playerLevel * 2);
    if (calcMaxHp > G.maxHp) G.maxHp = calcMaxHp;
    if (calcMaxSan > G.maxSan) G.maxSan = calcMaxSan;

    // 永久数据
    G.permanentItems = s.permanentItems || [];
    G.completedDungeons = s.completedDungeons || [];
    G.contacts = (s.contacts || []).map(function(c) {
      return { code: c.code, affinity: c.affinity || 0, chatHistory: c.chatHistory || [], unlockTime: c.unlockTime || 0 };
    });
    G.team = s.team || [];
    G.deadCharacters = s.deadCharacters || [];

    // 游戏阶段
    G.inDungeon = s.inDungeon || false;
    G.gamePhase = s.gamePhase || 'world';
    G.worldLocation = s.worldLocation || 'world_hub';

    // 副本状态
    G.currentRoom = s.currentRoom || null;
    G.visitedRooms = new Set(s.visitedRooms || []);
    G.triggeredEvents = new Set(s.triggeredEvents || []);
    G.dungeonItems = s.dungeonItems || [];
    G.cluesFound = s.cluesFound || [];
    G.gameTime = s.gameTime || 0;
    G.currentParticipants = s.currentParticipants || null;

    // 大世界
    G.visitedWorldLocations = new Set(s.visitedWorldLocations || []);
    G._firstDungeonTriggered = s._firstDungeonTriggered || false;
    G._pendingRetaliations = s._pendingRetaliations || [];
    G.messageHistory = s.messageHistory || [];

// 恢复先驱者笔记进度
if (typeof hintViewedMap !== 'undefined') {
  hintViewedMap = s.hintViewedMap || {};
}
if (typeof hintDetailViewedMap !== 'undefined') {
  hintDetailViewedMap = s.hintDetailViewedMap || {};
}

    // 恢复副本配置
    if (s.inDungeon && s.dungeonId) {
      var factory = null;
      if (typeof DUNGEON_FACTORIES !== 'undefined' && DUNGEON_FACTORIES[s.dungeonId]) {
        factory = DUNGEON_FACTORIES[s.dungeonId];
      }
      if (factory) {
        G.dungeon = factory();
        if (typeof generateDungeonItems === 'function') {
          generateDungeonItems(G.dungeon);
        }
        (s.triggeredEvents || []).forEach(function(evtId) {
          Object.keys(G.dungeon.rooms).forEach(function(rid) {
            var room = G.dungeon.rooms[rid];
            if (room.events) {
              room.events.forEach(function(evt) {
                if (evt.id === evtId && evt.unlockRoom) {
                  G.dungeon.rooms[evt.unlockRoom].locked = false;
                }
              });
            }
          });
        });
        (s.triggeredEvents || []).forEach(function(evtId) {
          Object.keys(G.dungeon.rooms).forEach(function(rid) {
            var room = G.dungeon.rooms[rid];
            if (room.specialActions) {
              room.specialActions = room.specialActions.filter(function(a) {
                return !(a.id === evtId && a.removeAfterUse);
              });
            }
          });
        });
      } else {
        G.inDungeon = false;
        G.gamePhase = 'world';
        G.dungeon = null;
      }
    }

    // 加载信誉数据
    try {
      var repData = localStorage.getItem('pale_corridor_reputation');
      if (repData && typeof REPUTATION_SYSTEM !== 'undefined') {
        var parsed = JSON.parse(repData);
        REPUTATION_SYSTEM.score = parsed.score || 75;
        REPUTATION_SYSTEM.history = parsed.history || [];
        REPUTATION_SYSTEM._lastRecovery = parsed._lastRecovery || Date.now();
      }
    } catch(e) {}

    // 加载委托数据
    try {
      var commData = localStorage.getItem('pale_corridor_commissions');
      if (commData && typeof COMMISSION_SYSTEM !== 'undefined') {
        var parsed2 = JSON.parse(commData);
        COMMISSION_SYSTEM.playerCommissions = parsed2.playerCommissions || [];
        COMMISSION_SYSTEM.completedCommissions = parsed2.completedCommissions || [];
        COMMISSION_SYSTEM._lastRefresh = parsed2._lastRefresh || 0;
      }
    } catch(e) {}

    return true;
  } catch(e) {
    console.warn('读档失败:', e);
    return false;
  }
}
