var WORLD_LOCATIONS = {
  'world_hub': {
    name: '苍白回廊·中央',
    icon: '🌫️',
    image: '',
    description: '灰白色的雾气在脚下翻涌。回廊中央的石碑上浮现着文字。',
    connections: ['world_market', 'world_gate', 'world_rest', 'world_board'],
    directionMap: { north: 'world_gate', east: 'world_market', south: 'world_rest', west: 'world_board' }
  },
  'world_gate': {
    name: '副本入口',
    icon: '🚪',
    image: '',
    description: '无数扇门悬浮在虚空中，每扇门后都是一个不同的世界。',
    connections: ['world_hub'],
    directionMap: { south: 'world_hub' },
    onEnter: function() {
      addMessage('system', '你来到了副本入口。无数扇门在你面前展开...');
      addMessage('narrator', '选择一扇门，踏入未知的恐惧之中。');
    },
    specialAction: { label: '🚪 进入下一个副本', action: 'autoEnterNextDungeon()' }
  },
  'world_market': {
    name: '黑市',
    icon: '🏪',
    image: '',
    description: '阴暗的角落里，一个戴兜帽的身影在贩卖各种奇异物品。',
    connections: ['world_hub'],
    directionMap: { west: 'world_hub' },
    onEnter: function() {
      addMessage('system', '你来到了黑市。兜帽商人向你点了点头。');
    },
    specialAction: { label: '🏪 打开商店', action: 'toggleSystemPhone();renderSystemApp("market")' }
  },
  'world_rest': {
    name: '休息区',
    icon: '🛏️',
    image: '',
    description: '一片相对安宁的区域，雾气在这里变得稀薄。你可以在这里恢复状态。',
    connections: ['world_hub'],
    directionMap: { north: 'world_hub' },
    onEnter: function() {
      addMessage('system', '你来到了休息区。这里的空气比别处清新一些。');
      if (G.san < G.maxSan) {
        var sanRecover = Math.min(10, G.maxSan - G.san);
        updateSAN(G.san + sanRecover);
        addMessage('system', '🧠 SAN恢复了' + sanRecover + '点。');
      }
      if (G.hp < G.maxHp) {
        var hpRecover = Math.min(2, G.maxHp - G.hp);
        updateHP(G.hp + hpRecover);
        addMessage('system', '❤️ HP恢复了' + hpRecover + '点。');
      }
    }
  },
  'world_board': {
    name: '任务板',
    icon: '📋',
    image: '',
    description: '一块巨大的石板上刻满了各种任务和悬赏。',
    connections: ['world_hub'],
    directionMap: { east: 'world_hub' },
    onEnter: function() {
      addMessage('system', '你来到了任务板前。上面贴满了各种委托...');
    },
    specialAction: { label: '📋 查看任务', action: 'showQuestPanel()' }
  }
};

var WORLD_MAP_LAYOUT = {
  'world_hub':    { x: 50, y: 55 },
  'world_gate':   { x: 50, y: 10 },
  'world_market': { x: 100, y: 55 },
  'world_rest':   { x: 50, y: 100 },
  'world_board':  { x: 2, y: 55 }
};

var WORLD_MAP_PATHS = [
  { x: 68, y: 30, w: 2, h: 25, dir: 'v' },
  { x: 86, y: 63, w: 14, h: 2, dir: 'h' },
  { x: 68, y: 75, w: 2, h: 25, dir: 'v' },
  { x: 36, y: 63, w: 14, h: 2, dir: 'h' }
];

function enterWorld() {
  // 确保玩家编号已生成
  if (!G.playerCode) {
    initPlayerCode();
  }
  
  G.gamePhase = 'world';
  G.inDungeon = false;
  G.worldLocation = G.worldLocation || 'world_hub';

  document.getElementById('textArea').innerHTML = '';

  // 显示系统手机按钮
  document.getElementById('phoneToggleBtn').classList.add('show');
  G.systemUnlocked = true;

  // 进入当前大世界位置
  moveToWorldLocation(G.worldLocation, true);
}

function moveToWorldLocation(locId, isInit) {
  var loc = WORLD_LOCATIONS[locId];
  if (!loc) return;

  G.worldLocation = locId;
  updateRoomDisplay({ name: loc.name, icon: loc.icon, image: loc.image });

  if (!isInit || locId === 'world_hub') {
    addMessage('system', '📍 ' + loc.name);
    addMessage('narrator', loc.description);
  }

  if (loc.onEnter && !isInit) {
    loc.onEnter();
  }

  if (isInit && locId === 'world_hub') {
    addMessage('system', '你回到了苍白回廊。灰白色的雾气在脚下翻涌。');
    addMessage('narrator', '用摇杆移动探索回廊，或直接前往副本入口。');
  }

  // 渲染大世界地图
  renderWorldMap();

  // 更新快捷按钮
  var container = document.getElementById('quickActions');
  container.innerHTML = '';
  if (loc.specialAction) {
    var safeSpecialAction = loc.specialAction.action.replace(/"/g, '&quot;');
    container.innerHTML += '<button class="action-btn primary" onclick="' + safeSpecialAction + '">' + loc.specialAction.label + '</button>';
  } else {
    container.innerHTML += '<button class="action-btn primary" onclick="showDungeonSelect()">🚪 进入副本</button>';
  }
  container.innerHTML += '<button class="action-btn" onclick="showQuestPanel()">📋 任务</button>';
  container.innerHTML += '<button class="action-btn" onclick="toggleSystemPhone()">📱 系统</button>';
  container.innerHTML += '<button class="action-btn" onclick="toggleInventory()">🎒 背包</button>';
  saveGame();
}

function renderWorldMap() {
  var container = document.getElementById('mapTopdown');
  var html = '';

  // 绘制路径
  WORLD_MAP_PATHS.forEach(function(p) {
    html += '<div class="map-path ' + p.dir + '" style="left:' + p.x + 'px;top:' + p.y + 'px;width:' + (p.w || 2) + 'px;height:' + (p.h || 2) + 'px"></div>';
  });

  // 绘制地点
  Object.keys(WORLD_MAP_LAYOUT).forEach(function(lid) {
    var pos = WORLD_MAP_LAYOUT[lid];
    var loc = WORLD_LOCATIONS[lid];
    var cls = 'map-room';
    if (lid === G.worldLocation) cls += ' current';
    else cls += ' visited';
    html += '<div class="' + cls + '" style="left:' + pos.x + 'px;top:' + pos.y + 'px" onclick="worldMapClick(\'' + lid + '\')" title="' + loc.name + '">';
    html += '<span style="font-size:8px">' + loc.name.replace('苍白回廊·','').replace('副本','副本') + '</span>';
    html += '</div>';
  });

  // 玩家点
  if (G.worldLocation && WORLD_MAP_LAYOUT[G.worldLocation]) {
    var cp = WORLD_MAP_LAYOUT[G.worldLocation];
    html += '<div class="map-player-dot" style="left:' + (cp.x + 11) + 'px;top:' + (cp.y + 8) + 'px"></div>';
  }

  container.innerHTML = html;

  // 列表模式
  var listContainer = document.getElementById('mapList');
  var listHtml = '';
  Object.keys(WORLD_LOCATIONS).forEach(function(lid) {
    var loc = WORLD_LOCATIONS[lid];
    var cls = 'list-room-item' + (lid === G.worldLocation ? ' current' : '');
    listHtml += '<div class="' + cls + '" onclick="worldMapClick(\'' + lid + '\')">' + (lid === G.worldLocation ? '📍 ' : '') + loc.icon + ' ' + loc.name + '</div>';
  });
  listContainer.innerHTML = listHtml;
}

function worldMapClick(locId) {
  if (G.inDungeon) return;
  var currentLoc = WORLD_LOCATIONS[G.worldLocation];
  if (!currentLoc) return;
  if (locId === G.worldLocation) return;
  if (currentLoc.connections && currentLoc.connections.includes(locId)) {
    moveToWorldLocation(locId, false);
  } else {
    showNotification('无法直接到达该地点', '');
  }
}

function showWorldInfo() {
  addMessage('system', '📊 等级：Lv.' + (G.playerLevel || 1) + ' (' + (G.playerExp || 0) + '/' + ((G.playerLevel || 1) * 150) + ')');
  addMessage('system', '💎 灵魂碎片：' + G.soulFragments);
  addMessage('system', '❤️ HP：' + G.hp + '/' + G.maxHp + ' | 🧠 SAN：' + G.san + '/' + G.maxSan);
  addMessage('system', '🏆 排名：#' + (typeof getPlayerRank === 'function' ? getPlayerRank() : '???') + ' | 最佳评级：' + (G.bestRating || 'F'));
  addMessage('system', '⚔️ 通关：' + (G.totalDungeonClears || 0) + '次 | 死亡：' + (G.totalDeaths || 0) + '次');
  addMessage('system', '📦 永久道具：' + (G.permanentItems.length > 0 ? G.permanentItems.map(function(i){ return i.name; }).join('、') : '无'));
  addMessage('system', '✅ 已通关副本：' + (G.completedDungeons.length > 0 ? G.completedDungeons.length + '个' : '无'));
  var days = typeof getDaysSinceLastEntry === 'function' ? getDaysSinceLastEntry() : 0;
  var remaining = Math.max(0, 7 - days);
  addMessage('system', '⏰ 距离强制副本：' + remaining + ' 天');
}
