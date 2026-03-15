function showDungeonSelect() {
  var panel = document.getElementById('dungeonSelectPanel');
  var html = '<div style="text-align:center;font-size:16px;color:#e0b0b0;margin-bottom:16px;border-bottom:1px solid #3a1515;padding-bottom:12px">🚪 选择副本</div>';

  DUNGEON_LIST.forEach(function(d) {
    var isCompleted = G.completedDungeons.includes(d.id);
    var isLocked = d.unlockCondition && !d.unlockCondition();
    var cls = 'dungeon-card' + (isLocked ? ' dungeon-card-locked' : '');

    html += '<div class="' + cls + '" onclick="' + (isLocked ? '' : 'selectDungeon(\'' + d.id + '\')') + '">';
    html += '<div class="dungeon-card-title">' + (isCompleted ? '✅ ' : (isLocked ? '🔒 ' : '')) + d.name + '</div>';
    html += '<div class="dungeon-card-meta">难度：' + d.difficulty + ' | 限时：' + Math.floor(d.timeLimit / 60) + '分钟 | 房间：' + d.roomCount + '</div>';
    html += '<div class="dungeon-card-desc">' + d.description + '</div>';
    html += '</div>';
  });

  html += '<button class="settlement-btn secondary" style="margin-top:12px" onclick="closeDungeonSelect()">返回</button>';
  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
}

function closeDungeonSelect() {
  document.getElementById('dungeonSelectOverlay').classList.remove('show');
}

function selectDungeon(dungeonId) {
  var dungeonFactory = DUNGEON_FACTORIES[dungeonId];
  if (!dungeonFactory) {
    addMessage('system', '该副本尚未开放...');
    return;
  }

  // 查找副本信息
  var dungeonEntry = DUNGEON_LIST.find(function(d) { return d.id === dungeonId; });
  if (!dungeonEntry) {
    closeDungeonSelect();
    enterDungeon(dungeonFactory());
    return;
  }

  // 生成参与者并显示介绍页
  var participants = generateDungeonParticipants(dungeonEntry, false);
  closeDungeonSelect();
  showDungeonIntroPage(dungeonEntry, participants, false);
}

function _doEnterDungeon(dungeonId) {
  var dungeonFactory = DUNGEON_FACTORIES[dungeonId];
  if (!dungeonFactory) return;
  enterDungeon(dungeonFactory());
}

function enterDungeon(dungeonConfig) {
  // 初始化副本数据
  G.dungeon = JSON.parse(JSON.stringify(dungeonConfig)); // 深拷贝，防止修改原始配置
  resetHints();
  G.inDungeon = true;
  G.gamePhase = 'dungeon';
  G.currentRoom = G.dungeon.startRoom;
  G.visitedRooms = new Set();
  G.dungeonItems = [];
  G.cluesFound = [];
  G.gameTime = 0;
  G.triggeredEvents = new Set();
  G.messageHistory = [];

  document.getElementById('textArea').innerHTML = '';
  document.getElementById('phoneToggleBtn').classList.remove('show');

  // 副本开场（如果有开场剧情，这些消息会被清空替代）
  if (!G._openingScriptPlaying) {
    addMessage('system', '═══════════════════');
    addMessage('system', '[ 进入副本 ]「' + G.dungeon.name + '」');
    if (G.dungeon.intro) addMessage('narrator', G.dungeon.intro);
    addMessage('system', '[ 限时 ] ' + Math.floor(G.dungeon.timeLimit / 60) + '分钟');
    addMessage('system', '═══════════════════');
  }

  // 启动计时器
  startDungeonTimer();

  // 进入起始房间
  setTimeout(function() {
    moveToRoom(G.dungeon.startRoom);
  }, 1000);
  saveGame();
}

//   阵营系统  
var FACTIONS = [
  { id: 'survivor', name: '幸存者', icon: '🛡️', desc: '以生存为第一目标。HP恢复速度+20%，副本内获得额外防御提示。' },
  { id: 'seeker', name: '求知者', icon: '📖', desc: '追求真相的探索者。线索发现概率+15%，SAN下降速度-10%。' },
  { id: 'shadow', name: '暗影行者', icon: '🌑', desc: '与黑暗共舞的冒险者。可感知隐藏房间，但SAN上限-10。' },
  { id: 'vessel', name: '容器', icon: '🏺', desc: '被选中的特殊存在。随机获得强力被动，但副本难度+1。' }
];

function flipFactionCard() {
  if (G.factionDrawn) return;
  var card = document.getElementById('factionCardInner');
  if (card.classList.contains('flipped')) return;

  // 随机选择阵营
  var faction = FACTIONS[Math.floor(Math.random() * FACTIONS.length)];
  G.playerFaction = faction;

  document.getElementById('factionIcon').textContent = faction.icon;
  document.getElementById('factionName').textContent = faction.name;
  document.getElementById('factionDesc').textContent = faction.desc;

  card.classList.add('flipped');
  setTimeout(function() {
    document.getElementById('factionConfirmBtn').classList.add('show');
  }, 900);
}

function confirmFaction() {
  G.factionDrawn = true;
  document.getElementById('factionDrawOverlay').classList.remove('show');

  addMessage('system', '🎴 你的阵营：' + G.playerFaction.icon + ' ' + G.playerFaction.name);
  addMessage('narrator', G.playerFaction.desc);

  // 应用阵营效果
  if (G.playerFaction.id === 'shadow') {
    G.maxSan = 90;
    updateSAN(90);
  }

  // 进入大世界
  setTimeout(function() { enterWorld(); }, 1000);
}
