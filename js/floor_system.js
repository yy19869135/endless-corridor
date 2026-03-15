// 第六部分：楼层切换 + 小地图改造

function switchFloor(floor) {
  currentFloor = floor;
  document.querySelectorAll('.floor-btn').forEach(function(btn) {
    btn.classList.toggle('active', parseInt(btn.dataset.floor) === floor);
  });
  renderWorldMap();
}

function getFloorLocations(floor) {
  var result = {};
  Object.keys(WORLD_LOCATIONS).forEach(function(lid) {
    if (WORLD_LOCATIONS[lid].floor === floor) {
      result[lid] = WORLD_LOCATIONS[lid];
    }
  });
  return result;
}

// 覆盖 renderWorldMap，支持楼层
var _origRenderWorldMap = renderWorldMap;
renderWorldMap = function() {
  if (G.inDungeon || G.gamePhase !== 'world') {
    _origRenderWorldMap();
    return;
  }

  var container = document.getElementById('mapTopdown');
  var html = '';

  // 楼层按钮（右上角竖排）
  html += '<div style="position:absolute;right:2px;top:2px;display:flex;flex-direction:column;gap:2px;z-index:10">';
  [1, 2, 3].forEach(function(f) {
    var floorConf = WORLD_FLOORS[f];
    var isActive = currentFloor === f;
    var playerLoc = WORLD_LOCATIONS[G.worldLocation];
    var hasPlayer = playerLoc && playerLoc.floor === f;
    html += '<button class="floor-btn' + (isActive ? ' active' : '') + '" data-floor="' + f + '" onclick="event.stopPropagation();switchFloor(' + f + ')" style="';
    html += 'padding:1px 3px;font-size:8px;border:1px solid ' + (isActive ? floorConf.color : '#3a1515') + ';';
    html += 'border-radius:3px;background:' + (isActive ? 'rgba(180,30,30,0.3)' : 'rgba(10,5,5,0.9)') + ';';
    html += 'color:' + (isActive ? '#f0c0c0' : '#555') + ';cursor:pointer;min-width:20px;text-align:center;line-height:1.4;';
    html += '">' + (hasPlayer ? '•' : '') + 'F' + f + '</button>';
  });
  html += '</div>';

  var layout = FLOOR_MAP_LAYOUTS[currentFloor] || {};
  var paths = FLOOR_MAP_PATHS[currentFloor] || [];

  // 绘制路径
  paths.forEach(function(p) {
    html += '<div class="map-path ' + p.dir + '" style="left:' + p.x + 'px;top:' + p.y + 'px;width:' + (p.w || 2) + 'px;height:' + (p.h || 2) + 'px"></div>';
  });

  // 绘制地点
  Object.keys(layout).forEach(function(lid) {
    var pos = layout[lid];
    var loc = WORLD_LOCATIONS[lid];
    if (!loc) return;
    var cls = 'map-room';
    if (lid === G.worldLocation) cls += ' current';
    else cls += ' visited';
    html += '<div class="' + cls + '" style="left:' + pos.x + 'px;top:' + pos.y + 'px" onclick="worldMapClick(\'' + lid + '\')" title="' + loc.name + '">';
    html += '<span style="font-size:7px">' + loc.name.substring(0, 3) + '</span>';
    html += '</div>';
  });

  // 玩家红点（仅当前楼层显示）
  var playerLoc = WORLD_LOCATIONS[G.worldLocation];
  if (playerLoc && playerLoc.floor === currentFloor && layout[G.worldLocation]) {
    var cp = layout[G.worldLocation];
    html += '<div class="map-player-dot" style="left:' + (cp.x + 15) + 'px;top:' + (cp.y + 8) + 'px"></div>';
  }

  // 楼层名称
  var floorConf = WORLD_FLOORS[currentFloor];
  html += '<div style="position:absolute;bottom:2px;left:4px;font-size:7px;color:#444">' + floorConf.name + '</div>';

  container.innerHTML = html;

  // 列表模式也按楼层
  var listContainer = document.getElementById('mapList');
  var listHtml = '';
  var floorLocs = getFloorLocations(currentFloor);
  Object.keys(floorLocs).forEach(function(lid) {
    var loc = floorLocs[lid];
    var cls = 'list-room-item' + (lid === G.worldLocation ? ' current' : '');
    listHtml += '<div class="' + cls + '" onclick="worldMapClick(\'' + lid + '\')">' + (lid === G.worldLocation ? '📍 ' : '') + loc.icon + ' ' + loc.name + '</div>';
  });
  listContainer.innerHTML = listHtml;
};

// 移动时自动切换到目标楼层
var _floorAwareMoveToWorldLocation = moveToWorldLocation;
moveToWorldLocation = function(locId, isInit) {
  var loc = WORLD_LOCATIONS[locId];
  if (loc && loc.floor && loc.floor !== currentFloor) {
    currentFloor = loc.floor;
  }
  _floorAwareMoveToWorldLocation(locId, isInit);
};

// 跨楼层点击地图支持
var _origWorldMapClick = worldMapClick;
worldMapClick = function(locId) {
  if (G.inDungeon) return;
  var currentLoc = WORLD_LOCATIONS[G.worldLocation];
  var targetLoc = WORLD_LOCATIONS[locId];
  if (!currentLoc || !targetLoc) return;
  if (locId === G.worldLocation) return;
  if (currentLoc.connections && currentLoc.connections.includes(locId)) {
    moveToWorldLocation(locId, false);
  } else {
    showNotification('无法直接到达该地点', '');
  }
};

// 传送面板也按楼层分组
var _origShowTeleportPanel = typeof showTeleportPanel === 'function' ? showTeleportPanel : null;
showTeleportPanel = function() {
  var panel = document.getElementById('dungeonSelectPanel');
  var html = '<div style="text-align:center;font-size:16px;color:#e0b0b0;margin-bottom:12px;border-bottom:1px solid #3a1515;padding-bottom:8px">🌀 快速传送</div>';
  [1, 2, 3].forEach(function(f) {
    var floorConf = WORLD_FLOORS[f];
    var floorLocs = getFloorLocations(f);
    var locIds = Object.keys(floorLocs);
    if (locIds.length === 0) return;
    html += '<div style="font-size:11px;color:' + floorConf.color + ';margin:10px 0 4px;border-bottom:1px solid #2a1010;padding-bottom:2px">' + floorConf.name + '</div>';
    locIds.forEach(function(lid) {
      var loc = floorLocs[lid];
      var isCurrent = lid === G.worldLocation;
      html += '<div class="dungeon-card" style="padding:10px;' + (isCurrent ? 'border-color:#cc3333;opacity:0.5' : 'cursor:pointer') + '" onclick="' + (isCurrent ? '' : 'closeDungeonSelect();moveToWorldLocation(&quot;' + lid + '&quot;,false)') + '">';
      html += '<span style="font-size:14px">' + loc.icon + '</span> ' + loc.name;
      if (isCurrent) html += ' <span style="font-size:10px;color:#cc3333">（当前位置）</span>';
      html += '</div>';
    });
  });
  html += '<button class="settlement-btn secondary" style="margin-top:12px" onclick="closeDungeonSelect()">返回</button>';
  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
};

console.log('✅ 第六部分加载完成：楼层切换 + 小地图改造');
