document.addEventListener('DOMContentLoaded', function() {
  // 绑定输入框（回车发送 + GM密码检测）
  var playerInput = document.getElementById('playerInput');
  if (playerInput) {
    playerInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // GM密码检测
        if (typeof checkGMPassword === 'function') {
          var text = playerInput.value.trim();
          if (text === GM_SECRET_CODE) {
            playerInput.value = '';
            toggleGMPanel();
            return;
          }
        }
        sendPlayerInput();
      }
    });
  }

  // 初始化SDK
  initMujianSDK();

  // 初始化排行榜
  if (typeof initEnhancedLeaderboard === 'function') initEnhancedLeaderboard();

  // ★★★ 核心：尝试读档 ★★★
  var hasSave = loadGame();

  if (hasSave && G.factionDrawn) {
    //   有存档，直接恢复  
    console.log('苍白回廊 - 恢复存档，阶段:', G.gamePhase, '副本中:', G.inDungeon);

    // 恢复UI
    updateHP(G.hp);
    updateSAN(G.san);
    updateFragmentDisplay();
    updateItemCount();

    // 隐藏开场界面
    var introOverlay = document.getElementById('introOverlay');
    if (introOverlay) {
      introOverlay.style.display = 'none';
      introOverlay.classList.add('hidden');
    }

    if (G.inDungeon && G.dungeon && G.currentRoom) {
      //   恢复副本  
      var room = G.dungeon.rooms[G.currentRoom];
      if (room) {
        updateRoomDisplay(room);
        renderMinimap();
        updateClueUI();
        startDungeonTimer();
        // 在恢复副本或大世界之前，先恢复历史消息
if (G.messageHistory && G.messageHistory.length > 0) {
  var area = document.getElementById('textArea');
  area.innerHTML = ''; // 清空
  G.messageHistory.forEach(function(msg) {
    var div = document.createElement('div');
    div.className = 'message msg-' + msg.type;
    div.innerHTML = msg.text;
    area.appendChild(div);
  });
  area.scrollTop = area.scrollHeight;
}
        addMessage('system', '📂 已恢复存档 — 继续探索「' + G.dungeon.name + '」');
        addMessage('system', '📍 当前位置：' + room.name);
        addMessage('system', '❤️ HP ' + G.hp + '/' + G.maxHp + ' | 🧠 SAN ' + G.san + '/' + G.maxSan);
        setTimeout(function() { generateContextActions(); }, 500);
      } else {
        // 房间数据异常，回退到大世界
        G.inDungeon = false;
        G.gamePhase = 'world';
        enterWorld();
        addMessage('system', '📂 存档恢复（副本数据异常，已返回大世界）');
      }
    } else {
      //   恢复大世界  
      // 先恢复历史消息
      if (G.messageHistory && G.messageHistory.length > 0) {
        var area = document.getElementById('textArea');
        area.innerHTML = '';
        G.messageHistory.forEach(function(msg) {
          var div = document.createElement('div');
          div.className = 'message msg-' + msg.type;
          div.innerHTML = msg.text;
          area.appendChild(div);
        });
        area.scrollTop = area.scrollHeight;
      }
      enterWorld();
      addMessage('system', '📂 已恢复存档 — 欢迎回来');
    }

    // 初始化循环系统
    if (typeof initCycleSystem === 'function') initCycleSystem();

  } else {
    //   没有存档或未抽阵营，走新游戏流程  
    console.log('苍白回廊 - 新游戏初始化');

    renderMinimap();
    updateItemCount();
    updateClueUI();
    updateFragmentDisplay();
    updateHP(G.hp);
    updateSAN(G.san);

    if (typeof initCycleSystem === 'function') initCycleSystem();

    // 显示开场界面，等待玩家点击
    // introOverlay 保持显示状态，玩家点击后触发 closeIntroAndStart()
  }

  console.log('苍白回廊 - 初始化完成');
});

// 自动保存（每30秒，无论在大世界还是副本中）
setInterval(function() {
  if (G.gamePhase !== 'ended') {
    saveGame();
  }
}, 30000);
