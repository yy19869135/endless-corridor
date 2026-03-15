function collectClue(clueId) {
  if (G.cluesFound.includes(clueId)) return;
  G.cluesFound.push(clueId);
  var clue = G.dungeon.clues[clueId];
  if (!clue) return;
  if (clue.sanCost) updateSAN(G.san - clue.sanCost);
  showNotification('发现线索：' + clue.name, 'clue');
  addMessage('system', '[ 线索已记录 ] ' + clue.name);
  updateClueUI();
  checkEndingConditions();
  saveGame();
}

function updateClueUI() {
  if (!G.dungeon) return;
  var totalClues = Object.keys(G.dungeon.clues).length;
  var found = G.cluesFound.length;
  document.getElementById('clueCountBadge').textContent = found + ' / ' + totalClues;
  document.getElementById('clueProgressText').textContent = '线索进度：' + found + ' / ' + totalClues;
  document.getElementById('clueProgressBar').style.width = (totalClues > 0 ? found / totalClues * 100 : 0) + '%';

  var body = document.getElementById('clueSidebarBody');
  if (found === 0) {
    body.innerHTML = '<div class="clue-empty">还没有发现任何线索<br><br>试着调查房间中的物品</div>';
    return;
  }
  var html = '';
  G.cluesFound.forEach(function(cid) {
    var c = G.dungeon.clues[cid];
    if (!c) return;
    html += '<div class="clue-card">';
    html += '<div class="clue-card-header"><span class="clue-card-name">' + (c.icon || '📋') + ' ' + c.name + '</span>';
    if (c.sanCost) html += '<span class="clue-card-san">SAN -' + c.sanCost + '</span>';
    html += '</div>';
    html += '<div class="clue-card-desc">' + c.description + '</div>';
    if (c.foundIn) html += '<div class="clue-card-room">发现于：' + c.foundIn + '</div>';
    html += '</div>';
  });
  body.innerHTML = html;
}

function toggleClueSidebar() {
  document.getElementById('clueSidebar').classList.toggle('open');
  document.getElementById('clueSidebarOverlay').classList.toggle('show');
}
