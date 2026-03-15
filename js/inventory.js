var currentInvTab = 'all';

function toggleInventory() {
  var overlay = document.getElementById('inventoryOverlay');
  overlay.classList.toggle('show');
  if (overlay.classList.contains('show')) renderInventory();
}

function switchInvTab(tab, btn) {
  currentInvTab = tab;
  document.querySelectorAll('.inv-tab').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  renderInventory();
}

function renderInventory() {
  var list = document.getElementById('inventoryList');
  var items = [];

  if (currentInvTab === 'all' || currentInvTab === 'dungeon') {
    G.dungeonItems.forEach(function(item) {
      items.push(Object.assign({}, item, { _source: 'dungeon' }));
    });
  }
  if (currentInvTab === 'all' || currentInvTab === 'permanent') {
    G.permanentItems.forEach(function(item) {
      items.push(Object.assign({}, item, { _source: 'permanent' }));
    });
  }

  if (items.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:#555;padding:20px;font-size:13px">没有物品</div>';
    return;
  }

  var html = '';
  items.forEach(function(item, idx) {
    var tagClass = item._source === 'permanent' ? 'perm' : (item.canTakeOut ? 'takeout' : 'temp');
    var tagText = item._source === 'permanent' ? '永久' : (item.canTakeOut ? '可带出' : '副本');
    html += '<div class="inv-item">';
    html += '<div class="inv-item-icon">' + (item.icon || '📦') + '</div>';
    html += '<div class="inv-item-info">';
    html += '<div class="inv-item-name">' + item.name + (item.count > 1 ? ' x' + item.count : '') + '</div>';
    html += '<div class="inv-item-desc">' + (item.desc || '') + '</div>';
    html += '<div class="inv-item-tag ' + tagClass + '">' + tagText + '</div>';
    if (item.usable && G.inDungeon) {
      html += '<button class="inv-use-btn" onclick="useItem(\'' + item.id + '\',\'' + item._source + '\')">使用</button>';
    }
    html += '</div></div>';
  });
  list.innerHTML = html;
}

function addDungeonItem(item) {
  var existing = G.dungeonItems.find(function(i){ return i.id === item.id; });
  if (existing && item.stackable) {
    existing.count = (existing.count || 1) + 1;
  } else {
    item.count = item.count || 1;
    G.dungeonItems.push(item);
  }
  updateItemCount();
  showNotification('获得：' + item.name, 'clue');
  saveGame();
}

function addPermanentItem(item) {
  var existing = G.permanentItems.find(function(i){ return i.id === item.id; });
  if (existing && item.stackable) {
    existing.count = (existing.count || 1) + 1;
  } else {
    item.count = item.count || 1;
    G.permanentItems.push(item);
  }
  updateItemCount();
}

function hasDungeonItem(id) {
  return G.dungeonItems.some(function(i){ return i.id === id; });
}

function removeDungeonItem(id) {
  var idx = G.dungeonItems.findIndex(function(i){ return i.id === id; });
  if (idx >= 0) {
    G.dungeonItems[idx].count--;
    if (G.dungeonItems[idx].count <= 0) G.dungeonItems.splice(idx, 1);
  }
  updateItemCount();
}

function removePermanentItem(id) {
  var idx = G.permanentItems.findIndex(function(i){ return i.id === id; });
  if (idx >= 0) {
    G.permanentItems[idx].count--;
    if (G.permanentItems[idx].count <= 0) G.permanentItems.splice(idx, 1);
  }
  updateItemCount();
}

function useItem(itemId, source) {
  if (source === 'permanent') {
    var item = G.permanentItems.find(function(i){ return i.id === itemId; });
    if (item && item.onUse) {
      item.onUse();
      if (item.consumable) removePermanentItem(itemId);
      renderInventory();
    }
  } else {
    var item = G.dungeonItems.find(function(i){ return i.id === itemId; });
    if (item && item.usable) {
      executeDungeonItemUse(item);
      renderInventory();
    }
  }
}

function executeDungeonItemUse(item) {
  if (!G.dungeon || !G.currentRoom) return;
  var room = G.dungeon.rooms[G.currentRoom];

  // 检查副本配置中是否有该物品的使用效果
  if (G.dungeon.itemEffects && G.dungeon.itemEffects[item.id]) {
    var effect = G.dungeon.itemEffects[item.id];

    // ★ 新增：检查是否有房间专属效果（道具多用途）
    if (effect.roomEffects && effect.roomEffects[G.currentRoom]) {
      var roomEffect = effect.roomEffects[G.currentRoom];

      // ★ 如果该房间效果包含谜题输入框，弹出输入框
      if (roomEffect.puzzleInput) {
        toggleInventory(); // 先关闭背包
        var puzzleConfig = JSON.parse(JSON.stringify(roomEffect.puzzleInput));
        puzzleConfig.itemId = item.id; // 记录使用的道具ID
        openPuzzleInput(puzzleConfig);
        return;
      }

      // 普通房间效果（无输入框）
      if (roomEffect.message) addMessage('narrator', roomEffect.message);
      if (roomEffect.sanChange) updateSAN(G.san + roomEffect.sanChange);
      if (roomEffect.hpChange) updateHP(G.hp + roomEffect.hpChange);
      if (roomEffect.unlockRoom && G.dungeon) {
        G.dungeon.rooms[roomEffect.unlockRoom].locked = false;
        addMessage('system', '🔓 新的区域已解锁');
      }
      if (roomEffect.addClue) collectClue(roomEffect.addClue);
      if (roomEffect.addItem) addDungeonItem(roomEffect.addItem);
      if (roomEffect.triggerEnding) triggerEnding(roomEffect.triggerEnding);
      if (roomEffect.consume !== false && effect.consume !== false) removeDungeonItem(item.id);
      return;
    }

    // ★ 原有逻辑：检查房间限制
    if (effect.roomRequired && effect.roomRequired !== G.currentRoom) {
      addMessage('system', '这里似乎不是使用' + item.name + '的地方...');
      return;
    }

    // ★ 新增：旧格式也支持 puzzleInput
    if (effect.puzzleInput) {
      toggleInventory();
      var puzzleConfig2 = JSON.parse(JSON.stringify(effect.puzzleInput));
      puzzleConfig2.itemId = item.id;
      openPuzzleInput(puzzleConfig2);
      return;
    }

    if (effect.message) addMessage('narrator', effect.message);
    if (effect.sanChange) updateSAN(G.san + effect.sanChange);
    if (effect.hpChange) updateHP(G.hp + effect.hpChange);
    if (effect.unlockRoom) {
      G.dungeon.rooms[effect.unlockRoom].locked = false;
      addMessage('system', '🔓 新的区域已解锁');
    }
    if (effect.addClue) collectClue(effect.addClue);
    if (effect.triggerEnding) triggerEnding(effect.triggerEnding);
    if (effect.consume !== false) removeDungeonItem(item.id);
  } else {
    addMessage('system', '你使用了' + item.name + '，但似乎没有什么效果。');
  }
}

