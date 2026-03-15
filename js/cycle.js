var CYCLE_SYSTEM = {
  cycleDays: 7,
  dayLengthMs: 4 * 60 * 1000, // 4分钟 = 1天，28分钟 = 7天周期
  cycleStartTime: null,
  forcedDungeonId: null,
  activeQuest: null,
  questPool: [],
  timerInterval: null,
  paused: false
};

function initCycleSystem() {
  var saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('paleCorridor_cycle'));
  } catch(e) {}
  if (saved) {
    CYCLE_SYSTEM.cycleStartTime = saved.cycleStartTime || null;
    CYCLE_SYSTEM.forcedDungeonId = saved.forcedDungeonId || null;
    CYCLE_SYSTEM.activeQuest = saved.activeQuest || null;
  }
  if (!CYCLE_SYSTEM.cycleStartTime) {
    CYCLE_SYSTEM.cycleStartTime = Date.now();
    saveCycleSystem();
  }
}

function saveCycleSystem() {
  try {
    localStorage.setItem('paleCorridor_cycle', JSON.stringify({
      cycleStartTime: CYCLE_SYSTEM.cycleStartTime,
      forcedDungeonId: CYCLE_SYSTEM.forcedDungeonId,
      activeQuest: CYCLE_SYSTEM.activeQuest
    }));
  } catch(e) {}
}

function getCycleElapsedMs() {
  if (!CYCLE_SYSTEM.cycleStartTime) return 0;
  return Date.now() - CYCLE_SYSTEM.cycleStartTime;
}

function getCycleCurrentDay() {
  var elapsed = getCycleElapsedMs();
  return Math.floor(elapsed / CYCLE_SYSTEM.dayLengthMs) + 1;
}

function getCycleRemainingMs() {
  var totalCycleMs = CYCLE_SYSTEM.cycleDays * CYCLE_SYSTEM.dayLengthMs;
  var elapsed = getCycleElapsedMs();
  return Math.max(0, totalCycleMs - elapsed);
}

function getDaysSinceLastEntry() {
  return getCycleCurrentDay() - 1;
}

function formatCycleTime(ms) {
  var totalSec = Math.floor(ms / 1000);
  var h = Math.floor(totalSec / 3600);
  var m = Math.floor((totalSec % 3600) / 60);
  var s = totalSec % 60;
  if (h > 0) {
    return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function startCycleTimer() {
  if (CYCLE_SYSTEM.timerInterval) clearInterval(CYCLE_SYSTEM.timerInterval);
  CYCLE_SYSTEM.paused = false;
  updateCycleTimerDisplay();
  CYCLE_SYSTEM.timerInterval = setInterval(function() {
    if (CYCLE_SYSTEM.paused) return;
    updateCycleTimerDisplay();
    var remaining = getCycleRemainingMs();
    if (remaining <= 0) {
      clearInterval(CYCLE_SYSTEM.timerInterval);
      CYCLE_SYSTEM.timerInterval = null;
      triggerForcedDungeon();
    }
  }, 1000);
}

function pauseCycleTimer() {
  CYCLE_SYSTEM.paused = true;
}

function resumeCycleTimer() {
  CYCLE_SYSTEM.paused = false;
}

function updateCycleTimerDisplay() {
  var el = document.getElementById('cycleTimerText');
  if (!el) return;
  var day = getCycleCurrentDay();
  var remaining = getCycleRemainingMs();
  var dayInCycleRemaining = CYCLE_SYSTEM.dayLengthMs - (getCycleElapsedMs() % CYCLE_SYSTEM.dayLengthMs);

  if (day > CYCLE_SYSTEM.cycleDays) {
    el.textContent = '⚠️ 强制副本！';
    el.parentElement.className = 'stat-item time-display cycle-timer urgent';
    return;
  }

  el.textContent = '第' + day + '天 ' + formatCycleTime(remaining);

  if (day >= 6) {
    el.parentElement.className = 'stat-item time-display cycle-timer urgent';
  } else if (day >= 5) {
    el.parentElement.className = 'stat-item time-display cycle-timer warning';
  } else {
    el.parentElement.className = 'stat-item time-display cycle-timer';
  }
}

function resetCycleTimer() {
  CYCLE_SYSTEM.cycleStartTime = Date.now();
  CYCLE_SYSTEM.forcedDungeonId = null;
  saveCycleSystem();
  startCycleTimer();
}

function checkCycleForced() {
  var remaining = getCycleRemainingMs();
  return remaining <= 0;
}

function getRandomUncompletedDungeon() {
  var available = DUNGEON_LIST.filter(function(d) {
    return !G.completedDungeons.includes(d.id) && DUNGEON_FACTORIES[d.id];
  });
  if (available.length === 0) {
    available = DUNGEON_LIST.filter(function(d) { return DUNGEON_FACTORIES[d.id]; });
  }
  return available[Math.floor(Math.random() * available.length)];
}

function triggerForcedDungeon() {
  var dungeon = getRandomUncompletedDungeon();
  if (!dungeon) return;
  CYCLE_SYSTEM.forcedDungeonId = dungeon.id;
  saveCycleSystem();

  // 生成副本参与者（炮灰+可攻略）
  var participants = generateDungeonParticipants(dungeon, true);

  showDungeonIntroPage(dungeon, participants, true);
}

function recordDungeonEntry() {
  resetCycleTimer();
}

//   炮灰NPC模板（30个）  
var FODDER_TEMPLATES = [
  { name: '张伟', icon: '😰', gender: 'male', desc: '胆小的大学生', quote: '我...我不想进去...', deathRate: 0.8, personality: 'coward' },
  { name: '王刚', icon: '😤', gender: 'male', desc: '自大的老手', quote: '切，这种副本我闭眼过。', deathRate: 0.9, personality: 'arrogant' },
  { name: '小雨', icon: '😢', gender: 'female', desc: '哭泣的少女', quote: '呜呜...我们会死吗...', deathRate: 0.7, personality: 'crybaby' },
  { name: '李叔', icon: '😐', gender: 'male', desc: '沉默的中年人', quote: '......', deathRate: 0.5, personality: 'silent' },
  { name: '赵强', icon: '💪', gender: 'male', desc: '暴躁的壮汉', quote: '有什么怪物老子一拳一个！', deathRate: 0.85, personality: 'brute' },
  { name: '陈小美', icon: '💄', gender: 'female', desc: '爱美的网红', quote: '这里能拍照吗？', deathRate: 0.9, personality: 'vain' },
  { name: '刘博士', icon: '🤓', gender: 'male', desc: '理性的学者', quote: '让我分析一下当前局势...', deathRate: 0.4, personality: 'smart' },
  { name: '孙大妈', icon: '👵', gender: 'female', desc: '唠叨的大妈', quote: '我跟你们说啊，这地方不干净！', deathRate: 0.6, personality: 'nagging' },
  { name: '周星', icon: '😎', gender: 'male', desc: '油嘴滑舌的商人', quote: '兄弟，要不我们做个交易？', deathRate: 0.7, personality: 'sly' },
  { name: '吴静', icon: '😶', gender: 'female', desc: '安静的女孩', quote: '（低头不说话）', deathRate: 0.5, personality: 'quiet' },
  { name: '钱多多', icon: '🤑', gender: 'male', desc: '贪婪的富豪', quote: '多少钱能出去？我出！', deathRate: 0.85, personality: 'greedy' },
  { name: '郑义', icon: '😠', gender: 'male', desc: '正义感过强的青年', quote: '我一定要保护所有人！', deathRate: 0.75, personality: 'hero' },
  { name: '冯小小', icon: '🥺', gender: 'female', desc: '怯懦的小女生', quote: '我想回家...', deathRate: 0.65, personality: 'timid' },
  { name: '褚军', icon: '🎖️', gender: 'male', desc: '退伍军人', quote: '保持队形，跟紧我。', deathRate: 0.3, personality: 'soldier' },
  { name: '卫兰', icon: '🧘', gender: 'female', desc: '信佛的中年女性', quote: '阿弥陀佛...一切都是命。', deathRate: 0.5, personality: 'religious' },
  { name: '蒋浩', icon: '🏃', gender: 'male', desc: '只想逃跑的人', quote: '快跑！别管别人了！', deathRate: 0.8, personality: 'runner' },
  { name: '沈悦', icon: '😊', gender: 'female', desc: '乐观的护士', quote: '别担心，我会急救！', deathRate: 0.35, personality: 'nurse' },
  { name: '韩冰', icon: '🥶', gender: 'male', desc: '冷漠的旁观者', quote: '跟我无关。', deathRate: 0.6, personality: 'cold' },
  { name: '杨帆', icon: '⛵', gender: 'male', desc: '冒险家', quote: '这种地方正合我意！', deathRate: 0.5, personality: 'adventurer' },
  { name: '秦可卿', icon: '💅', gender: 'female', desc: '高冷的千金', quote: '别碰我。', deathRate: 0.7, personality: 'princess' },
  { name: '许三', icon: '🍺', gender: 'male', desc: '醉醺醺的酒鬼', quote: '嗝...这是哪？', deathRate: 0.9, personality: 'drunk' },
  { name: '曹丽', icon: '👩‍🏫', gender: 'female', desc: '严厉的女教师', quote: '都安静！听我指挥！', deathRate: 0.45, personality: 'teacher' },
  { name: '魏大壮', icon: '🐻', gender: 'male', desc: '憨厚的农民', quote: '俺也不知道咋回事...', deathRate: 0.6, personality: 'simple' },
  { name: '方小方', icon: '🎮', gender: 'male', desc: '沉迷游戏的宅男', quote: '这不就是密室逃脱吗？', deathRate: 0.7, personality: 'gamer' },
  { name: '邱月华', icon: '🌙', gender: 'female', desc: '神经质的占卜师', quote: '我看到了...死亡...', deathRate: 0.55, personality: 'fortune' },
  { name: '田七', icon: '🤕', gender: 'male', desc: '受伤的逃亡者', quote: '它...它还在追我...', deathRate: 0.8, personality: 'wounded' },
  { name: '丁小丁', icon: '👶', gender: 'male', desc: '看起来很年轻的少年', quote: '我十八了！别把我当小孩！', deathRate: 0.65, personality: 'young' },
  { name: '崔翠', icon: '🌺', gender: 'female', desc: '温柔的家庭主妇', quote: '我还要回去给孩子做饭...', deathRate: 0.6, personality: 'mother' },
  { name: '雷子', icon: '⚡', gender: 'male', desc: '暴躁的混混', quote: '谁他妈把老子弄到这来的？！', deathRate: 0.85, personality: 'thug' },
  { name: '白素素', icon: '🤍', gender: 'female', desc: '苍白的女人', quote: '...我好像来过这里。', deathRate: 0.4, personality: 'mysterious' }
];

// 副本参与者分配规则
var PARTICIPANT_CONFIG = {
  1: { targets: [1, 1], fodders: [1, 2] },   // 入门：1可攻略 + 1-2炮灰
  2: { targets: [1, 2], fodders: [2, 3] },   // 普通：1-2可攻略 + 2-3炮灰
  3: { targets: [2, 2], fodders: [3, 4] },   // 困难：2可攻略 + 3-4炮灰
  4: { targets: [2, 3], fodders: [4, 5] },   // 噩梦：2-3可攻略 + 4-5炮灰
  5: { targets: [3, 3], fodders: [5, 7] }    // 深渊：3可攻略 + 5-7炮灰
};

function getDungeonDifficulty(dungeon) {
  if (!dungeon) return 2;
  // 从DUNGEON_LIST查找
  var entry = DUNGEON_LIST.find(function(d) { return d.id === dungeon.id; });
  if (!entry) return 2;
  var diffStr = entry.difficulty;
  var starCount = (diffStr.match(/★/g) || []).length;
  return Math.max(1, Math.min(5, starCount));
}

function generateDungeonParticipants(dungeonEntry, isForced) {
  var diffLevel = 2;
  // 尝试从entry的difficulty获取
  if (dungeonEntry && dungeonEntry.difficulty) {
    var starCount = (dungeonEntry.difficulty.match(/★/g) || []).length;
    diffLevel = Math.max(1, Math.min(5, starCount));
  }

  var config = PARTICIPANT_CONFIG[diffLevel] || PARTICIPANT_CONFIG[2];
  var targetCount = randomInt(config.targets[0], config.targets[1]);
  var fodderCount = randomInt(config.fodders[0], config.fodders[1]);

  var participants = [];

  // 选择可攻略角色
  var allTargetCodes = Object.keys(CHARACTER_DB).filter(function(code) {
    return CHARACTER_DB[code].type === 'player';
  });
  var shuffledTargets = allTargetCodes.sort(function() { return Math.random() - 0.5; });
  var selectedTargets = shuffledTargets.slice(0, targetCount);

  selectedTargets.forEach(function(code) {
    var charData = CHARACTER_DB[code];
    participants.push({
      type: 'target',
      code: code,
      name: charData.name,
      icon: charData.icon,
      title: charData.title,
      quote: charData.greeting,
      gender: charData.gender,
      alive: true
    });
  });

  // 选择炮灰
  var shuffledFodders = FODDER_TEMPLATES.slice().sort(function() { return Math.random() - 0.5; });
  var selectedFodders = shuffledFodders.slice(0, fodderCount);

  selectedFodders.forEach(function(f, idx) {
    participants.push({
      type: 'fodder',
      code: 'fodder_' + idx,
      name: f.name,
      icon: f.icon,
      title: f.desc,
      quote: f.quote,
      gender: f.gender,
      deathRate: f.deathRate,
      personality: f.personality,
      alive: true
    });
  });

  // 加入玩家
  participants.push({
    type: 'player',
    code: 'player',
    name: G.playerName || '你',
    icon: '👤',
    title: G.playerFaction ? G.playerFaction.name : '参与者',
    quote: G.playerPersona ? ('「' + G.playerPersona.substring(0, 20) + '...」') : '',
    alive: true
  });

  return participants;
}

// 计算预估存活率
function estimateSurvivalRate(participants) {
  var total = participants.length;
  var expectedDeaths = 0;
  participants.forEach(function(p) {
    if (p.type === 'fodder') {
      expectedDeaths += p.deathRate || 0.7;
    } else if (p.type === 'target') {
      expectedDeaths += 0.15;
    } else {
      expectedDeaths += 0.1;
    }
  });
  var survivalRate = Math.max(5, Math.min(60, Math.round((1 - expectedDeaths / total) * 100)));
  return survivalRate;
}

// 显示副本介绍页
function showDungeonIntroPage(dungeonEntry, participants, isForced) {
  var panel = document.getElementById('dungeonIntroPanel');
  var survivalRate = estimateSurvivalRate(participants);

  var html = '';
  html += '<div class="di-header">';
  html += '<div class="di-badge ' + (isForced ? 'forced' : 'voluntary') + '">' + (isForced ? '⚠️ 强制副本' : '🚪 主动挑战') + '</div>';
  html += '<div class="di-title">' + dungeonEntry.name + '</div>';
  html += '</div>';

  html += '<div class="di-meta">';
  html += '<div class="di-meta-item"><div class="di-meta-label">难度</div><div class="di-meta-value">' + (dungeonEntry.difficulty || '★★') + '</div></div>';
  html += '<div class="di-meta-item"><div class="di-meta-label">参与人数</div><div class="di-meta-value">' + participants.length + '人</div></div>';
  html += '<div class="di-meta-item"><div class="di-meta-label">限时</div><div class="di-meta-value">' + Math.floor((dungeonEntry.timeLimit || 600) / 60) + '分</div></div>';
  html += '<div class="di-meta-item"><div class="di-meta-label">预估存活</div><div class="di-meta-value" style="color:' + (survivalRate < 30 ? '#ff4444' : '#ff8800') + '">' + survivalRate + '%</div></div>';
  html += '</div>';

  html += '<div class="di-desc">';
  html += '<div class="di-desc-title">📜 副本简介</div>';
  html += '<div class="di-desc-text">' + (dungeonEntry.description || '未知的恐怖正在等待着你...') + '</div>';
  html += '</div>';

  html += '<div class="di-members">';
  html += '<div class="di-members-title">👥 参与者名单</div>';

  participants.forEach(function(p) {
    var memberClass = 'di-member';
    var tagHtml = '';
    if (p.type === 'player') {
      memberClass += ' is-player';
      tagHtml = '<span class="di-member-tag di-tag-player">玩家</span>';
    } else if (p.type === 'target') {
      memberClass += ' is-target';
      tagHtml = '<span class="di-member-tag di-tag-target">参与者</span>';
    } else {
      memberClass += ' is-fodder';
      tagHtml = '<span class="di-member-tag di-tag-fodder">参与者</span>';
    }

    html += '<div class="' + memberClass + '">';
    html += '<div class="di-member-top">';
    html += '<div class="di-member-name">' + p.icon + ' ' + p.name + '</div>';
    html += tagHtml;
    html += '</div>';
    html += '<div class="di-member-desc">' + p.title + '</div>';
    if (p.quote) {
      html += '<div class="di-member-quote">「' + p.quote + '」</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  html += '<div class="di-warning">';
  html += '<div class="di-warning-text">⚠️「全员存活从来不是选项。」</div>';
  html += '<div class="di-survival">——回廊系统</div>';
  html += '</div>';

  html += '<div class="di-btns">';
  if (isForced) {
    html += '<button class="settlement-btn" onclick="confirmEnterDungeon(\'' + dungeonEntry.id + '\')">进入副本（无法拒绝）</button>';
  } else {
    html += '<button class="settlement-btn secondary" onclick="closeDungeonIntro()">返回</button>';
    
    html += '<button class="settlement-btn" onclick="confirmEnterDungeon(\'' + dungeonEntry.id + '\')">进入副本</button>';
  }
  html += '</div>';

  panel.innerHTML = html;

  // 保存当前参与者到全局
  G.currentParticipants = participants;

  document.getElementById('dungeonIntroOverlay').classList.add('show');
}

function closeDungeonIntro() {
  document.getElementById('dungeonIntroOverlay').classList.remove('show');
  G.currentParticipants = null;
}

function confirmEnterDungeon(dungeonId) {
  document.getElementById('dungeonIntroOverlay').classList.remove('show');
  _doEnterDungeon(dungeonId);
}

//   复活道具：回溯之泪  

// 在黑市中添加回溯之泪（后面会修改商店）
var REVIVE_ITEM = {
  id: 'tear_of_regression',
  name: '回溯之泪',
  icon: '💧',
  desc: '极其稀有的道具。可复活一名在副本中死亡的可攻略角色，并大幅提升好感度。',
  price: 5000,
  consumable: true,
  stackable: true,
  rarity: 'legendary'
};

function useReviveTear(targetCode) {
  var item = G.permanentItems.find(function(i) { return i.id === 'tear_of_regression'; });
  if (!item) {
    showNotification('你没有回溯之泪', 'horror');
    return;
  }

  var charData = CHARACTER_DB[targetCode];
  if (!charData) return;

  // 消耗道具
  removePermanentItem('tear_of_regression');

  // 复活角色（从死亡名单移除，如果有的话）
  if (G.deadCharacters) {
    G.deadCharacters = G.deadCharacters.filter(function(c) { return c !== targetCode; });
  }

  // 大幅提升好感度
  var contact = findContactByCode(targetCode);
  if (contact) {
    changeAffinity(targetCode, 30);
  } else {
    // 如果不在通讯录，自动添加并给高好感
    G.contacts.push({
      code: targetCode,
      affinity: 40,
      chatHistory: [],
      unlockTime: Date.now()
    });
  }

  addMessage('system', '💧 回溯之泪碎裂，时光倒流...');
  addMessage('horror', charData.icon + ' ' + charData.name + '的身影从虚无中重新凝聚。');
  addMessage('system', '💕 ' + charData.name + '的好感度大幅提升！');
  addMessage('narrator', charData.icon + ' ' + charData.name + '："...你救了我？"');

  showNotification('💧 ' + charData.name + '已复活！好感度+30', 'clue');
  saveGame();
}

//   排行榜增强  

// 在排行榜前十中加入一个可攻略角色
function initEnhancedLeaderboard() {
  G.leaderboard = [
    { rank: 1, name: '归夜', score: 999999, tag: 'NPC', icon: '🦇', title: '不死者', hasRareItem: true, rareItem: '永恒之冠' },
    { rank: 2, name: '龙傲天', score: 888888, tag: 'NPC', icon: '⚔️', title: '无败战神', hasRareItem: true, rareItem: '破灭之刃' },
    { rank: 3, name: '深渊行者', score: 777777, tag: 'NPC', icon: '🌑', title: '深渊归来者', hasRareItem: true, rareItem: '深渊凝视' },
    { rank: 4, name: '柳道', score: 666666, tag: 'NPC', icon: '⚔️', title: '剑道宗师', hasRareItem: true, rareItem: '斩灵剑' },
    { rank: 5, name: '池瞳', score: 555555, tag: 'NPC', icon: '👁️‍🗨️', title: '预言者', hasRareItem: true, rareItem: '命运之眼' },
    { rank: 6, name: '红颜', score: 444444, tag: 'NPC', icon: '💋', title: '蛇蝎美人', hasRareItem: true, rareItem: '魅惑之心' },
    { rank: 7, name: '严九', score: 333333, tag: 'NPC', icon: '🔬', title: '疯狂科学家', hasRareItem: true, rareItem: '解析之瞳' },
    { rank: 8, name: '莫然', score: 222222, tag: 'NPC', icon: '🔥', title: '烈焰佣兵', hasRareItem: false },
    { rank: 9, name: '祁洛', score: 111111, tag: 'NPC', icon: '🎭', title: '千面狐', hasRareItem: false },
    { rank: 10, name: '林夜', score: 99999, tag: 'Recruitable', icon: '🗡️', title: '冷酷剑客', hasRareItem: true, rareItem: '回溯之泪' },
    { rank: 999, name: '你', score: 0, tag: 'User', icon: '👤', title: '新人' }
  ];
}

//   任务系统  

var QUEST_TEMPLATES = [
  {
    type: 'collect',
    nameTemplate: '收集{item}',
    descTemplate: '进入「{dungeon}」，找到{item}并带出副本。',
    rewardFragments: [50, 150]
  },
  {
    type: 'explore',
    nameTemplate: '探索{dungeon}',
    descTemplate: '进入「{dungeon}」，探索至少{count}个房间。',
    rewardFragments: [30, 100]
  },
  {
    type: 'survive',
    nameTemplate: '在{dungeon}中存活',
    descTemplate: '进入「{dungeon}」并成功逃出，SAN不低于{san}。',
    rewardFragments: [60, 200]
  },
  {
    type: 'clue',
    nameTemplate: '收集{dungeon}的线索',
    descTemplate: '进入「{dungeon}」，收集至少{count}条线索。',
    rewardFragments: [40, 120]
  }
];

function generateQuests() {
  var quests = [];
  var available = DUNGEON_LIST.filter(function(d) { return DUNGEON_FACTORIES[d.id]; });
  if (available.length === 0) return quests;

  for (var qi = 0; qi < 3; qi++) {
    var tpl = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
    var targetDungeon = available[Math.floor(Math.random() * available.length)];
    var reward = Math.floor(Math.random() * (tpl.rewardFragments[1] - tpl.rewardFragments[0])) + tpl.rewardFragments[0];

    var quest = {
      id: 'quest_' + Date.now() + '_' + qi,
      type: tpl.type,
      name: tpl.nameTemplate.replace('{item}', '神秘物品').replace('{dungeon}', targetDungeon.name),
      description: tpl.descTemplate
        .replace('{dungeon}', targetDungeon.name)
        .replace('{item}', '神秘物品')
        .replace('{count}', Math.floor(Math.random() * 3) + 3)
        .replace('{san}', Math.floor(Math.random() * 30) + 30),
      targetDungeonId: targetDungeon.id,
      rewardFragments: reward,
      accepted: false,
      completed: false
    };
    quests.push(quest);
  }
  return quests;
}

function acceptQuest(questId) {
  var quest = CYCLE_SYSTEM.questPool.find(function(q) { return q.id === questId; });
  if (!quest) return;
  quest.accepted = true;
  CYCLE_SYSTEM.activeQuest = quest;
  saveCycleSystem();
  addMessage('system', '📋 接受任务：' + quest.name);
  addMessage('system', quest.description);
  addMessage('system', '💎 奖励：' + quest.rewardFragments + ' 灵魂碎片');
  showNotification('任务已接受', 'clue');
}

function checkQuestCompletion() {
  if (!CYCLE_SYSTEM.activeQuest || !CYCLE_SYSTEM.activeQuest.accepted) return;
  var q = CYCLE_SYSTEM.activeQuest;
  var completed = false;

  switch (q.type) {
    case 'explore':
      completed = G.visitedRooms.size >= 3;
      break;
    case 'survive':
      completed = G.gamePhase === 'ended' && G.hp > 0;
      break;
    case 'clue':
      completed = G.cluesFound.length >= 3;
      break;
    case 'collect':
      completed = G.dungeonItems.length > 0;
      break;
  }

  if (completed) {
    q.completed = true;
    G.soulFragments += q.rewardFragments;
    updateFragmentDisplay();
    addMessage('system', '✅ 任务完成：' + q.name);
    addMessage('system', '💎 获得 ' + q.rewardFragments + ' 灵魂碎片');
    showNotification('✅ 任务完成！+' + q.rewardFragments + '💎', 'clue');
    CYCLE_SYSTEM.activeQuest = null;
    saveCycleSystem();
  }
}

// 修改现有函数以集成新系统

// 保存原始的 enterWorld 和 enterDungeon 引用
var _originalEnterWorld = enterWorld;
var _originalEnterDungeon = enterDungeon;
var _originalShowSettlement = showSettlement;
var _originalShowDungeonSelect = showDungeonSelect;

// 覆盖 enterWorld，加入七天循环检查
enterWorld = function() {
  _originalEnterWorld();
  initCycleSystem();
  startCycleTimer();

  // 检查是否需要强制进入副本
  if (checkCycleForced()) {
    setTimeout(function() {
      triggerForcedDungeon();
    }, 2000);
    return;
  }

  // 显示任务相关信息
  var currentDay = getCycleCurrentDay();
  var remainingMs = getCycleRemainingMs();
  var remainingMin = Math.ceil(remainingMs / 60000);
  if (currentDay >= 6) {
    addMessage('system', '⚠️ 第' + currentDay + '天！距离强制副本仅剩 ' + remainingMin + ' 分钟！');
  } else if (currentDay >= 5) {
    addMessage('system', '⏰ 第' + currentDay + '天，距离强制副本还有 ' + remainingMin + ' 分钟。');
  }

  // 刷新任务池
  if (CYCLE_SYSTEM.questPool.length === 0 || !CYCLE_SYSTEM.activeQuest) {
    CYCLE_SYSTEM.questPool = generateQuests();
  }
};

// 覆盖 enterDungeon，记录进入时间
enterDungeon = function(dungeonConfig) {
  recordDungeonEntry();
  pauseCycleTimer();
  _originalEnterDungeon(dungeonConfig);

  // ★ 进入副本后注入参与者到房间
  setTimeout(function() {
    if (typeof gmLog === 'function') gmLog('setTimeout触发，准备注入参与者');
    if (typeof injectParticipantsIntoDungeon === 'function') {
      injectParticipantsIntoDungeon();
    } else {
      if (typeof gmLog === 'function') gmLog('injectParticipantsIntoDungeon 函数不存在！');
    }
  }, 1500);
};

// 覆盖 showSettlement，加入任务检查
var _origShowSettlement = showSettlement;
showSettlement = function(ending) {
  checkQuestCompletion();
  _origShowSettlement(ending);
};

// 覆盖 showDungeonSelect，加入分页和搜索
showDungeonSelect = function() {
  var panel = document.getElementById('dungeonSelectPanel');
  var html = '';
  html += '<div style="text-align:center;font-size:16px;color:#e0b0b0;margin-bottom:8px;border-bottom:1px solid #3a1515;padding-bottom:8px">🚪 选择副本 <span style="font-size:11px;color:#666">(' + DUNGEON_LIST.length + '个)</span></div>';

  // 搜索框
  html += '<input type="text" id="dungeonSearchInput" placeholder="搜索副本名称..." style="width:100%;padding:6px 10px;margin-bottom:8px;border:1px solid #3a1515;border-radius:8px;background:rgba(20,8,8,0.8);color:#c8c8d0;font-size:12px;outline:none" oninput="filterDungeonList(this.value)">';

  // 难度筛选
  html += '<div style="display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap">';
  html += '<button class="map-mode-btn active" onclick="filterDungeonDifficulty(0,this)" style="font-size:9px">全部</button>';
  for (var d = 1; d <= 5; d++) {
    html += '<button class="map-mode-btn" onclick="filterDungeonDifficulty(' + d + ',this)" style="font-size:9px">' + DIFFICULTY_CONFIG[d].label + '</button>';
  }
  html += '</div>';

  // 副本列表容器
  html += '<div id="dungeonListContainer" style="max-height:50vh;overflow-y:auto">';
  html += buildDungeonListHTML(DUNGEON_LIST);
  html += '</div>';

  html += '<button class="settlement-btn secondary" style="margin-top:12px" onclick="closeDungeonSelect()">返回</button>';
  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
};

function buildDungeonListHTML(list) {
  var html = '';
  list.forEach(function(d, idx) {
    var isCompleted = G.completedDungeons.includes(d.id);
    var isLocked = d.unlockCondition && !d.unlockCondition();
    var cls = 'dungeon-card' + (isLocked ? ' dungeon-card-locked' : '');

    html += '<div class="' + cls + '" data-name="' + d.name + '" data-diff="' + d.difficulty + '" onclick="' + (isLocked ? '' : 'selectDungeon(\'' + d.id + '\')') + '">';
    html += '<div class="dungeon-card-title">' + (isCompleted ? '✅ ' : (isLocked ? '🔒 ' : '')) + '#' + (idx + 1) + ' ' + d.name + '</div>';
    html += '<div class="dungeon-card-meta">难度：' + d.difficulty + ' | 限时：' + Math.floor(d.timeLimit / 60) + '分钟</div>';
    html += '<div class="dungeon-card-desc">' + d.description + '</div>';
    html += '</div>';
  });
  if (list.length === 0) {
    html = '<div style="text-align:center;color:#555;padding:20px">没有匹配的副本</div>';
  }
  return html;
}

function filterDungeonList(keyword) {
  var container = document.getElementById('dungeonListContainer');
  if (!keyword) {
    container.innerHTML = buildDungeonListHTML(DUNGEON_LIST);
    return;
  }
  var filtered = DUNGEON_LIST.filter(function(d) {
    return d.name.toLowerCase().includes(keyword.toLowerCase());
  });
  container.innerHTML = buildDungeonListHTML(filtered);
}

function filterDungeonDifficulty(level, btn) {
  // 更新按钮样式
  btn.parentElement.querySelectorAll('.map-mode-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');

  var container = document.getElementById('dungeonListContainer');
  if (level === 0) {
    container.innerHTML = buildDungeonListHTML(DUNGEON_LIST);
    return;
  }
  var targetLabel = DIFFICULTY_CONFIG[level].label;
  var filtered = DUNGEON_LIST.filter(function(d) {
    return d.difficulty === targetLabel;
  });
  container.innerHTML = buildDungeonListHTML(filtered);
}

//   任务面板  

function showQuestPanel() {
  var panel = document.getElementById('dungeonSelectPanel');
  var html = '';
  html += '<div style="text-align:center;font-size:16px;color:#e0b0b0;margin-bottom:12px;border-bottom:1px solid #3a1515;padding-bottom:8px">📋 任务板</div>';

  // 当前活跃任务
  if (CYCLE_SYSTEM.activeQuest) {
    var aq = CYCLE_SYSTEM.activeQuest;
    html += '<div style="margin-bottom:16px">';
    html += '<div style="font-size:12px;color:#b57a7a;margin-bottom:6px">当前任务</div>';
    html += '<div class="dungeon-card" style="border-color:#5a3a1a">';
    html += '<div class="dungeon-card-title">📌 ' + aq.name + '</div>';
    html += '<div class="dungeon-card-desc">' + aq.description + '</div>';
    html += '<div class="dungeon-card-meta" style="margin-top:6px">💎 奖励：' + aq.rewardFragments + ' 灵魂碎片</div>';
    html += '<button class="settlement-btn" style="margin-top:8px;padding:8px" onclick="selectDungeon(\'' + aq.targetDungeonId + '\');closeDungeonSelect()">🚪 前往副本</button>';
    html += '</div></div>';
  }

  // 可接取的任务
  html += '<div style="font-size:12px;color:#b57a7a;margin-bottom:6px">可接取任务</div>';
  if (CYCLE_SYSTEM.questPool.length === 0) {
    CYCLE_SYSTEM.questPool = generateQuests();
  }

  CYCLE_SYSTEM.questPool.forEach(function(q) {
    if (q.accepted) return;
    html += '<div class="dungeon-card">';
    html += '<div class="dungeon-card-title">' + q.name + '</div>';
    html += '<div class="dungeon-card-desc">' + q.description + '</div>';
    html += '<div class="dungeon-card-meta" style="margin-top:4px">💎 奖励：' + q.rewardFragments + '</div>';
    html += '<button class="market-buy-btn" style="margin-top:6px;padding:4px 12px" onclick="acceptQuest(\'' + q.id + '\');showQuestPanel()">接受</button>';
    html += '</div>';
  });

  // 七天倒计时
  var currentDay = getCycleCurrentDay();
  var remainingMs = getCycleRemainingMs();
  var remainingMin = Math.ceil(remainingMs / 60000);
  var remainingDisplay = remainingMin >= 60 ? Math.floor(remainingMin / 60) + '时' + (remainingMin % 60) + '分' : remainingMin + '分钟';
  html += '<div style="margin-top:16px;padding:10px;background:rgba(139,0,0,0.1);border:1px solid #3a1515;border-radius:8px;text-align:center">';
  html += '<div style="font-size:11px;color:#888">距离强制副本</div>';
  html += '<div style="font-size:20px;color:' + (currentDay >= 6 ? '#ff4444' : '#e0b0b0') + ';font-weight:bold">' + remainingDisplay + '</div>';
  html += '<div style="font-size:10px;color:#666">第' + currentDay + '天 / 7天 | 4分钟=1天</div>';
  html += '</div>';

  html += '<button class="settlement-btn secondary" style="margin-top:12px" onclick="closeDungeonSelect()">返回</button>';
  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
}

//   随机副本入口  

function enterRandomDungeon() {
  var dungeon = getRandomUncompletedDungeon();
  if (!dungeon) {
    addMessage('system', '没有可用的副本。');
    return;
  }
  addMessage('system', '🎲 随机选择了副本：「' + dungeon.name + '」');
  setTimeout(function() {
    selectDungeon(dungeon.id);
  }, 1000);
}
