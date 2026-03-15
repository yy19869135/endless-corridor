var mapMode = 'topdown';

function switchMapMode(mode) {
  mapMode = mode;
  document.getElementById('mapBtnTop').classList.toggle('active', mode === 'topdown');
  document.getElementById('mapBtnList').classList.toggle('active', mode === 'list');
  document.getElementById('mapTopdown').style.display = mode === 'topdown' ? 'block' : 'none';
  document.getElementById('mapList').style.display = mode === 'list' ? 'block' : 'none';
  renderMinimap();
}

function renderMinimap() {
  if (!G.dungeon) {
    if (G.gamePhase === 'world') {
      renderWorldMap();
    } else {
      document.getElementById('mapTopdown').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#444;font-size:10px">未进入副本</div>';
      document.getElementById('mapList').innerHTML = '<div style="padding:20px;text-align:center;color:#444;font-size:10px">未进入副本</div>';
    }
    return;
  }
  renderTopdownMap();
  renderListMap();
}

function renderTopdownMap() {
  var container = document.getElementById('mapTopdown');
  var rooms = G.dungeon.rooms;
  var mapLayout = G.dungeon.mapLayout;
  if (!mapLayout || !G.currentRoom) return;

  var containerW = container.offsetWidth || 120;
  var containerH = container.offsetHeight || 120;

  var curPos = mapLayout[G.currentRoom];
  if (!curPos) return;

  // 偏移量：当前房间居中
  var offsetX = Math.round(containerW / 2 - curPos.x - 4);
  var offsetY = Math.round(containerH / 2 - curPos.y - 4);

  // 当前房间的连接
  var currentConnections = rooms[G.currentRoom].connections || [];

  var html = '';

  // 绘制路径
  if (G.dungeon.mapPaths) {
    G.dungeon.mapPaths.forEach(function(p) {
      // 自动判断路径是否与当前房间相关
      var isActive = false;
      if (p.from && p.to) {
        isActive = (p.from === G.currentRoom || p.to === G.currentRoom);
      } else {
        // 没有from/to时，用路径坐标和房间坐标的距离来推断
        var px = p.x + (p.w || 2) / 2;
        var py = p.y + (p.h || 2) / 2;
        // 当前房间附近的路径高亮
        var dx = Math.abs(px - curPos.x - 14);
        var dy = Math.abs(py - curPos.y - 9);
        if (dx < 50 && dy < 50) isActive = true;
      }
      var cls = 'map-path ' + p.dir + (isActive ? ' active' : '');
      html += '<div class="' + cls + '" style="left:' + (p.x + offsetX) + 'px;top:' + (p.y + offsetY) + 'px;width:' + (p.w || 2) + 'px;height:' + (p.h || 2) + 'px"></div>';
    });
  }

  // 绘制房间
  Object.keys(mapLayout).forEach(function(rid) {
    var pos = mapLayout[rid];
    var room = rooms[rid];
    var isCurrent = (rid === G.currentRoom);
    var isNeighbor = currentConnections.indexOf(rid) !== -1;
    var cls = 'map-room';
    if (isCurrent) cls += ' current';
    else if (G.visitedRooms.has(rid)) cls += ' visited';
    else if (room.locked) cls += ' locked';
    // 相邻房间稍微高亮
    if (!isCurrent && isNeighbor) cls += ' neighbor';

    var px = pos.x + offsetX;
    var py = pos.y + offsetY;

    // 非当前房间的小圆点需要居中对齐（圆点8x8 vs 当前房间auto宽度）
    if (!isCurrent) {
      px += 10;
      py += 5;
    }

    html += '<div class="' + cls + '" style="left:' + px + 'px;top:' + py + 'px" onclick="mapClickRoom(\'' + rid + '\')" title="' + room.name + '">';
    if (isCurrent) {
      html += room.mapLabel || room.name.substring(0, 3);
    }
    html += '</div>';
  });

  // 玩家红点 — 容器中心
  var dotX = Math.round(containerW / 2 - 4);
  var dotY = Math.round(containerH / 2 - 4);
  html += '<div class="map-player-dot" id="mapPlayerDot" style="left:' + dotX + 'px;top:' + dotY + 'px"></div>';

  container.innerHTML = html;

  // 移动动画
  var dot = document.getElementById('mapPlayerDot');
  if (dot) {
    dot.classList.add('moving');
    setTimeout(function() {
      if (dot) dot.classList.remove('moving');
    }, 600);
  }
}

function renderListMap() {
  if (!G.dungeon) return;
  var container = document.getElementById('mapList');
  var rooms = G.dungeon.rooms;
  var html = '';
  Object.keys(rooms).forEach(function(rid) {
    var room = rooms[rid];
    var cls = 'list-room-item';
    if (rid === G.currentRoom) cls += ' current';
    var status = rid === G.currentRoom ? '📍' : (G.visitedRooms.has(rid) ? '✓' : (room.locked ? '🔒' : '?'));
    html += '<div class="' + cls + '" onclick="mapClickRoom(\'' + rid + '\')">' + status + ' ' + room.name + '</div>';
  });
  container.innerHTML = html;
}

function mapClickRoom(rid) {
  if (!G.inDungeon) return;
  var room = G.dungeon.rooms[rid];
  if (!room) return;
  if (room.locked) {
    showNotification('🔒 该区域已锁定', 'horror');
    return;
  }
  // 检查是否相邻
  var currentConnections = G.dungeon.rooms[G.currentRoom].connections || [];
  if (currentConnections.includes(rid) || rid === G.currentRoom) {
    if (rid !== G.currentRoom) moveToRoom(rid);
  } else {
    showNotification('无法直接到达该房间', '');
  }
}
