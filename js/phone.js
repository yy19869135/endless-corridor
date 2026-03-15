function toggleGameMenu() {
  document.getElementById('gameMenuOverlay').classList.toggle('show');
}

function closeGameMenu() {
  document.getElementById('gameMenuOverlay').classList.remove('show');
}

function doSaveGame() {
  closeGameMenu();
  if (typeof saveGame === 'function') {
    var ok = saveGame();
    showNotification(ok ? '💾 存档成功' : '❌ 存档失败', ok ? 'clue' : 'horror');
  }
}

function doLoadGame() {
  closeGameMenu();
  if (typeof loadGame === 'function') {
    var ok = loadGame();
    if (ok) {
      showNotification('📂 读档成功，正在恢复...', 'clue');
      setTimeout(function() { location.reload(); }, 800);
    } else {
      showNotification('❌ 没有找到存档', 'horror');
    }
  }
}

function openStoryRecall() {
  closeGameMenu();
  renderStoryRecall();
  document.getElementById('storyRecallOverlay').classList.add('show');
}

function closeStoryRecall() {
  document.getElementById('storyRecallOverlay').classList.remove('show');
}

function renderStoryRecall() {
  var body = document.getElementById('storyRecallBody');
  if (!G.messageHistory || G.messageHistory.length === 0) {
    body.innerHTML = '<div class="story-recall-empty">暂无剧情记录</div>';
    return;
  }
  var typeMap = { system: '系统', narrator: '旁白', player: '你', horror: '异常', ai: 'AI' };
  var html = '';
  G.messageHistory.forEach(function(msg) {
    var label = typeMap[msg.type] || msg.type;
    html += '<div class="story-recall-item"><div class="recall-type">' + label + '</div>' + msg.text + '</div>';
  });
  body.innerHTML = html;
  body.scrollTop = body.scrollHeight;
}

function confirmRestart() {
  closeGameMenu();
  if (confirm('确定要重新开始吗？所有未存档的进度将丢失。')) {
    if (typeof resetAllData === 'function') {
      resetAllData();
    } else {
      localStorage.removeItem('paleCorridor_save');
      localStorage.removeItem('paleCorridor_cycle');
      localStorage.removeItem('pale_corridor_reputation');
      localStorage.removeItem('pale_corridor_commissions');
      location.reload();
    }
  }
}
