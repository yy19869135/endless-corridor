var REPUTATION_SYSTEM = {
  score: 75, // 初始信誉分（良好）
  history: [] // 信誉变动记录
};

var REPUTATION_LEVELS = [
  { id: 'legendary', name: '🌟 信誉卓著', min: 90, max: 100, shopDiscount: 0.9, commissionBonus: 1.2, desc: 'NPC抢着接你的委托，商店打9折' },
  { id: 'good', name: '✅ 良好', min: 60, max: 89, shopDiscount: 1.0, commissionBonus: 1.0, desc: '正常状态' },
  { id: 'suspicious', name: '⚠️ 可疑', min: 30, max: 59, shopDiscount: 1.15, commissionBonus: 0.7, desc: '高价委托不开放，NPC犹豫接单' },
  { id: 'infamous', name: '💀 恶名昭彰', min: 0, max: 29, shopDiscount: 1.3, commissionBonus: 0, desc: '商店涨价30%，NPC拒绝合作，随机被追杀' }
];

function getReputationLevel() {
  var s = REPUTATION_SYSTEM.score;
  for (var i = 0; i < REPUTATION_LEVELS.length; i++) {
    if (s >= REPUTATION_LEVELS[i].min && s <= REPUTATION_LEVELS[i].max) return REPUTATION_LEVELS[i];
  }
  return REPUTATION_LEVELS[3]; // 默认恶名
}

function changeReputation(amount, reason) {
  var old = REPUTATION_SYSTEM.score;
  REPUTATION_SYSTEM.score = Math.max(0, Math.min(100, REPUTATION_SYSTEM.score + amount));
  REPUTATION_SYSTEM.history.push({ amount: amount, reason: reason, time: Date.now() });
  // 限制历史记录长度
  if (REPUTATION_SYSTEM.history.length > 50) REPUTATION_SYSTEM.history = REPUTATION_SYSTEM.history.slice(-50);

  var oldLevel = null, newLevel = null;
  REPUTATION_LEVELS.forEach(function(l) {
    if (old >= l.min && old <= l.max) oldLevel = l;
    if (REPUTATION_SYSTEM.score >= l.min && REPUTATION_SYSTEM.score <= l.max) newLevel = l;
  });

  if (amount > 0) {
    showNotification('📈 信誉 +' + amount + '（' + reason + '）', 'clue');
  } else if (amount < 0) {
    showNotification('📉 信誉 ' + amount + '（' + reason + '）', 'horror');
  }

  if (oldLevel && newLevel && oldLevel.id !== newLevel.id) {
    addMessage('system', '📊 信誉等级变化：' + oldLevel.name + ' → ' + newLevel.name);
    addMessage('system', newLevel.desc);
  }

  saveGame();
}

// 信誉自然恢复（每次进入大世界时检查）
function checkReputationRecovery() {
  var lastRecovery = REPUTATION_SYSTEM._lastRecovery || 0;
  var now = Date.now();
  // 每5分钟恢复1点（模拟每天+1）
  var elapsed = now - lastRecovery;
  if (elapsed > 5 * 60 * 1000 && REPUTATION_SYSTEM.score < 75) {
    var recoveryPoints = Math.min(Math.floor(elapsed / (5 * 60 * 1000)), 3);
    if (recoveryPoints > 0) {
      REPUTATION_SYSTEM.score = Math.min(75, REPUTATION_SYSTEM.score + recoveryPoints);
      REPUTATION_SYSTEM._lastRecovery = now;
    }
  }
  if (!REPUTATION_SYSTEM._lastRecovery) REPUTATION_SYSTEM._lastRecovery = now;
}

//  委托物品数据库 
var COMMISSION_ITEMS = {
  // 普通（基础价50-150）
  'herb_bundle': { name: '灵草束', icon: '🌿', rarity: 'common', basePrice: 60, source: '迷失森林', desc: '散发微光的草药' },
  'old_key': { name: '旧钥匙', icon: '🔑', rarity: 'common', basePrice: 80, source: '寂静岭医院', desc: '不知道能打开什么的钥匙' },
  'diary_fragment': { name: '日记碎片', icon: '📄', rarity: 'common', basePrice: 50, source: '回声公寓', desc: '残缺的日记页' },
  'bone_dust': { name: '骨粉', icon: '💀', rarity: 'common', basePrice: 70, source: '哀鸣教堂', desc: '研磨成粉的古老骨骼' },
  'rust_nail': { name: '锈铁钉', icon: '📌', rarity: 'common', basePrice: 55, source: '铁窗泪', desc: '带有诅咒气息的铁钉' },
  'ghost_candle': { name: '幽灵蜡烛', icon: '🕯️', rarity: 'common', basePrice: 90, source: '红月庄园', desc: '燃烧蓝色火焰的蜡烛' },
  'mirror_shard': { name: '镜片碎片', icon: '🪞', rarity: 'common', basePrice: 100, source: '404酒店', desc: '映出奇怪影像的碎镜片' },
  'ink_bottle': { name: '墨水瓶', icon: '🖋️', rarity: 'common', basePrice: 65, source: '沉默学园', desc: '永远不会干涸的墨水' },
  'bell_fragment': { name: '钟铃碎片', icon: '🔔', rarity: 'common', basePrice: 120, source: '钟声回响', desc: '敲击时会发出诡异回声' },
  'sea_shell': { name: '深海贝壳', icon: '🐚', rarity: 'common', basePrice: 75, source: '潮汐洞穴', desc: '贴近耳朵能听到哭声' },

  // 稀有（基础价200-500）
  'seal_stone': { name: '封印石', icon: '🪨', rarity: 'rare', basePrice: 250, source: '哀鸣教堂', desc: '刻有古老符文的石头' },
  'curse_eye': { name: '诅咒之眼', icon: '👁️', rarity: 'rare', basePrice: 350, source: '疯人院', desc: '一只永远不会闭上的眼球' },
  'amulet': { name: '护身符', icon: '📿', rarity: 'rare', basePrice: 300, source: '红月庄园', desc: '能抵挡一次低级诅咒' },
  'ghost_music_box': { name: '幽灵音乐盒', icon: '🎵', rarity: 'rare', basePrice: 400, source: '永恒剧场', desc: '自动播放安魂曲' },
  'blood_vial': { name: '血色药剂·浓缩', icon: '🧪', rarity: 'rare', basePrice: 280, source: '血色诊所', desc: '浓缩的生命精华' },
  'shadow_cloak_piece': { name: '暗影斗篷碎片', icon: '🧥', rarity: 'rare', basePrice: 450, source: '深层实验室', desc: '能短暂隐匿气息' },
  'frozen_tear': { name: '冰封之泪', icon: '💧', rarity: 'rare', basePrice: 320, source: '雾中灯塔', desc: '永远不会融化的泪滴' },
  'puppet_string': { name: '傀儡丝线', icon: '🧵', rarity: 'rare', basePrice: 380, source: '木偶剧', desc: '能操控小型物体' },
  'echo_crystal': { name: '回声水晶', icon: '💎', rarity: 'rare', basePrice: 420, source: '地底回声', desc: '记录了某段声音' },
  'train_ticket_eternal': { name: '永恒车票', icon: '🎫', rarity: 'rare', basePrice: 500, source: '末班列车', desc: '写着"永不到站"的车票' },

  // 传说（基础价800-2000）
  'time_fragment': { name: '时间碎片', icon: '⏳', rarity: 'legendary', basePrice: 1200, source: '时间隧道', desc: '凝固的时间结晶' },
  'abyss_heart': { name: '深渊之心', icon: '🖤', rarity: 'legendary', basePrice: 1800, source: '深渊之眼', desc: '深渊核心的脉动结晶' },
  'immortal_blood': { name: '不死者之血', icon: '🩸', rarity: 'legendary', basePrice: 2000, source: '苍白回廊·深层', desc: '传说中不死者的血液' },
  'void_essence': { name: '虚空精华', icon: '🌀', rarity: 'legendary', basePrice: 1500, source: '基因崩坏', desc: '来自虚空的纯粹能量' },
  'soul_lantern': { name: '魂灯', icon: '🏮', rarity: 'legendary', basePrice: 1000, source: '末日弥撒', desc: '燃烧灵魂的灯笼' },
  'dream_butterfly': { name: '梦蝶', icon: '🦋', rarity: 'legendary', basePrice: 800, source: '女巫森林', desc: '能进入他人梦境的蝴蝶' }
};

//   委托系统核心  
var COMMISSION_SYSTEM = {
  playerCommissions: [],   // 玩家发布的委托（NPC去执行）
  npcCommissions: [],      // NPC发布的委托（玩家去执行）
  completedCommissions: [], // 已完成的委托记录
  maxPlayerCommissions: 3, // 玩家同时发布的委托上限
  maxAcceptedNPC: 2,       // 玩家同时接取的NPC委托上限
  _lastRefresh: 0
};

// NPC接单者模板
var COMMISSION_NPC_POOL = [
  { name: '褚军', icon: '🎖️', reliability: 0.85, speed: 'fast', personality: '退伍军人，执行力强' },
  { name: '刘博士', icon: '🤓', reliability: 0.75, speed: 'normal', personality: '学者，谨慎但有时犹豫' },
  { name: '沈悦', icon: '😊', reliability: 0.80, speed: 'normal', personality: '护士，认真负责' },
  { name: '杨帆', icon: '⛵', reliability: 0.70, speed: 'fast', personality: '冒险家，速度快但鲁莽' },
  { name: '曹丽', icon: '👩‍🏫', reliability: 0.78, speed: 'normal', personality: '女教师，严谨可靠' },
  { name: '周星', icon: '😎', reliability: 0.55, speed: 'fast', personality: '商人，有私吞风险' },
  { name: '韩冰', icon: '🥶', reliability: 0.60, speed: 'normal', personality: '冷漠旁观者，可能敷衍' },
  { name: '方小方', icon: '🎮', reliability: 0.65, speed: 'slow', personality: '宅男，慢但意外靠谱' },
  { name: '邱月华', icon: '🌙', reliability: 0.72, speed: 'normal', personality: '占卜师，运气成分大' },
  { name: '李叔', icon: '😐', reliability: 0.90, speed: 'slow', personality: '沉默中年人，最可靠' }
];

// 生成NPC委托（NPC发布，玩家接取）
function generateNPCCommissions() {
  var commissions = [];
  var items = Object.keys(COMMISSION_ITEMS);
  var npcNames = ['林夜', '苏糖', '老陈', '姜雪', '莫然', '祁洛', '归夜', '红颜', '严九', '雾姬', '铁匠老爹', '书虫'];
  var npcIcons = ['🗡️', '🌸', '🚬', '❄️', '🔥', '🎭', '🦇', '💋', '🔬', '☕', '🔨', '📚'];

  var count = Math.floor(Math.random() * 3) + 3; // 3-5个委托

  for (var i = 0; i < count; i++) {
    var itemKey = items[Math.floor(Math.random() * items.length)];
    var item = COMMISSION_ITEMS[itemKey];
    var npcIdx = Math.floor(Math.random() * npcNames.length);
    var priceMultiplier = 1.0 + Math.random() * 0.8; // 1.0-1.8倍
    var reward = Math.floor(item.basePrice * priceMultiplier);

    commissions.push({
      id: 'npc_comm_' + Date.now() + '_' + i,
      type: 'npc_to_player',
      itemId: itemKey,
      itemName: item.name,
      itemIcon: item.icon,
      itemRarity: item.rarity,
      source: item.source,
      reward: reward,
      publisherName: npcNames[npcIdx],
      publisherIcon: npcIcons[npcIdx],
      accepted: false,
      completed: false,
      failed: false,
      timeLimit: item.rarity === 'legendary' ? 15 * 60 * 1000 : (item.rarity === 'rare' ? 10 * 60 * 1000 : 8 * 60 * 1000),
      acceptTime: null,
      affinityBonus: priceMultiplier >= 1.5 ? 3 : 1
    });
  }
  return commissions;
}

// 玩家发布委托
function publishPlayerCommission(itemId, bounty) {
  var item = COMMISSION_ITEMS[itemId];
  if (!item) { showNotification('无效物品', 'horror'); return false; }

  var activeCount = COMMISSION_SYSTEM.playerCommissions.filter(function(c) { return !c.completed && !c.failed; }).length;
  if (activeCount >= COMMISSION_SYSTEM.maxPlayerCommissions) {
    showNotification('同时最多发布' + COMMISSION_SYSTEM.maxPlayerCommissions + '个委托', 'horror');
    return false;
  }

  var minBounty = Math.floor(item.basePrice * 0.8);
  if (bounty < minBounty) {
    showNotification('悬赏金不能低于' + minBounty, 'horror');
    return false;
  }

  if (G.soulFragments < bounty) {
    showNotification('灵魂碎片不足', 'horror');
    return false;
  }

  // 信誉检查
  var repLevel = getReputationLevel();
  if (repLevel.id === 'infamous') {
    showNotification('💀 信誉太低，没有NPC愿意接你的委托', 'horror');
    return false;
  }

  // 扣除悬赏金
  G.soulFragments -= bounty;
  updateFragmentDisplay();

  // 计算好感度加成
  var ratio = bounty / item.basePrice;
  var affinityGain = 1;
  var generosityMsg = '';
  if (ratio >= 2.0) { affinityGain = 5; generosityMsg = '「豪气！跟你合作很愉快」'; }
  else if (ratio >= 1.5) { affinityGain = 3; generosityMsg = '「你出手真大方」'; }
  else if (ratio >= 1.0) { affinityGain = 1; generosityMsg = ''; }

  var commission = {
    id: 'player_comm_' + Date.now(),
    type: 'player_to_npc',
    itemId: itemId,
    itemName: item.name,
    itemIcon: item.icon,
    itemRarity: item.rarity,
    source: item.source,
    bounty: bounty,
    basePrice: item.basePrice,
    affinityGain: affinityGain,
    generosityMsg: generosityMsg,
    status: 'waiting', // waiting -> accepted -> executing -> result
    acceptor: null,
    publishTime: Date.now(),
    acceptTime: null,
    resultTime: null,
    result: null,
    completed: false,
    failed: false
  };

  COMMISSION_SYSTEM.playerCommissions.push(commission);

  addMessage('system', '📋 委托已发布：' + item.icon + ' ' + item.name);
  addMessage('system', '💎 悬赏金：' + bounty + ' 碎片');
  addMessage('system', '⏳ 等待NPC接单中...');

  // 2-4分钟后NPC接单（实际用15-30秒模拟）
  var acceptDelay = (Math.random() * 15000) + 15000;

  // 信誉和悬赏影响接单速度
  if (repLevel.id === 'legendary') acceptDelay *= 0.5;
  if (ratio >= 1.5) acceptDelay *= 0.7;
  if (repLevel.id === 'suspicious') acceptDelay *= 1.5;

  setTimeout(function() { npcAcceptCommission(commission.id); }, acceptDelay);

  saveGame();
  return true;
}

// NPC接单
function npcAcceptCommission(commissionId) {
  var comm = COMMISSION_SYSTEM.playerCommissions.find(function(c) { return c.id === commissionId; });
  if (!comm || comm.status !== 'waiting') return;

  // 选择NPC
  var repLevel = getReputationLevel();
  var availableNPCs = COMMISSION_NPC_POOL.slice();

  // 高悬赏吸引更可靠的NPC
  var ratio = comm.bounty / comm.basePrice;
  if (ratio >= 1.5) {
    availableNPCs.sort(function(a, b) { return b.reliability - a.reliability; });
  }

  var npc = availableNPCs[Math.floor(Math.random() * Math.min(5, availableNPCs.length))];

  comm.status = 'accepted';
  comm.acceptor = { name: npc.name, icon: npc.icon, reliability: npc.reliability, speed: npc.speed };
  comm.acceptTime = Date.now();

  addMessage('system', '📱 ' + npc.icon + ' ' + npc.name + '接了你的委托！');
  addMessage('narrator', npc.icon + ' ' + npc.name + '："' + getAcceptQuote(npc) + '"');
  if (comm.generosityMsg) {
    addMessage('narrator', npc.icon + ' ' + npc.name + '：' + comm.generosityMsg);
  }

  showNotification(npc.icon + ' ' + npc.name + '接了委托', 'clue');

  // 开始执行（30秒-2分钟模拟副本探索）
  var execTime = npc.speed === 'fast' ? 30000 : (npc.speed === 'slow' ? 90000 : 60000);
  execTime += Math.random() * 30000;

  comm.status = 'executing';
  addMessage('system', '⏳ ' + npc.name + '正在前往「' + comm.source + '」...');

  setTimeout(function() { resolveCommission(commissionId); }, execTime);
}

function getAcceptQuote(npc) {
  var quotes = {
    '褚军': '收到，保证完成任务。',
    '刘博士': '让我分析一下最优路线...',
    '沈悦': '交给我吧，我会小心的！',
    '杨帆': '哈哈，这种活我最擅长了！',
    '曹丽': '好的，我会按时完成。',
    '周星': '嘿嘿，这笔买卖不错。',
    '韩冰': '...行吧。',
    '方小方': '这不就是跑腿任务嘛，简单！',
    '邱月华': '我算了一卦...应该没问题。',
    '李叔': '......（点了点头）'
  };
  return quotes[npc.name] || '我接了。';
}

// 结算委托结果
function resolveCommission(commissionId) {
  var comm = COMMISSION_SYSTEM.playerCommissions.find(function(c) { return c.id === commissionId; });
  if (!comm || comm.status !== 'executing') return;

  var npc = comm.acceptor;
  var reliability = npc.reliability;
  var repLevel = getReputationLevel();

  // 信誉影响NPC表现
  if (repLevel.id === 'legendary') reliability += 0.05;
  if (repLevel.id === 'suspicious') reliability -= 0.1;

  // 私吞判定
  var embezzleChance = 0;
  if (npc.name === '周星') embezzleChance = 0.20;
  else if (npc.name === '韩冰') embezzleChance = 0.12;
  else embezzleChance = 0.05;

  // 好感度高的NPC不会私吞（简化：用reliability代替）
  if (reliability >= 0.85) embezzleChance = 0;

  var roll = Math.random();
  var result;

  if (roll < embezzleChance) {
    // 私吞
    result = 'embezzled';
    comm.result = 'embezzled';
    comm.completed = false;
    comm.failed = true;
    comm.status = 'done';

    addMessage('system', '⚠️ ' + npc.icon + ' ' + npc.name + '完成了委托，但...');
    addMessage('horror', npc.icon + ' ' + npc.name + '疑似私吞了委托物品！');
    addMessage('system', '你的悬赏金不会退还。');

    showEmbezzleChoice(commissionId);

  } else if (roll < embezzleChance + 0.10) {
    // 大成功
    result = 'great_success';
    comm.result = 'great_success';
    comm.completed = true;
    comm.status = 'done';

    var bonusFragments = Math.floor(comm.bounty * 0.3);
    addMessage('system', '🌟 大成功！' + npc.icon + ' ' + npc.name + '不仅带回了物品，还有额外收获！');
    addMessage('narrator', npc.icon + ' ' + npc.name + '："运气不错，多拿了点好东西。"');

    // 给玩家物品（加入永久背包）
    addPermanentItem({
      id: comm.itemId + '_comm',
      name: comm.itemName,
      icon: comm.itemIcon,
      desc: '通过委托获得的' + comm.itemName,
      stackable: true,
      consumable: false
    });
    G.soulFragments += bonusFragments;
    updateFragmentDisplay();
    addMessage('system', '获得：' + comm.itemIcon + ' ' + comm.itemName + ' + 💎' + bonusFragments + '额外碎片');
    changeReputation(3, '委托大成功');
    showNotification('🌟 委托大成功！', 'clue');

  } else if (roll < embezzleChance + 0.10 + 0.40) {
    // 成功
    result = 'success';
    comm.result = 'success';
    comm.completed = true;
    comm.status = 'done';

    addMessage('system', '✅ ' + npc.icon + ' ' + npc.name + '成功带回了' + comm.itemIcon + ' ' + comm.itemName + '！');
    addMessage('narrator', npc.icon + ' ' + npc.name + '："任务完成。"');

    addPermanentItem({
      id: comm.itemId + '_comm',
      name: comm.itemName,
      icon: comm.itemIcon,
      desc: '通过委托获得的' + comm.itemName,
      stackable: true,
      consumable: false
    });
    addMessage('system', '获得：' + comm.itemIcon + ' ' + comm.itemName);
    changeReputation(3, '按时完成委托');
    showNotification('✅ 委托完成！', 'clue');

  } else if (roll < embezzleChance + 0.10 + 0.40 + 0.20) {
    // 部分成功
    result = 'partial';
    comm.result = 'partial';
    comm.completed = true;
    comm.status = 'done';

    addMessage('system', '⚠️ ' + npc.icon + ' ' + npc.name + '没能找到目标物品，但带回了替代品。');
    addMessage('narrator', npc.icon + ' ' + npc.name + '："抱歉，只找到了这个..."');

    // 给一个低级替代品
    var substituteItems = Object.keys(COMMISSION_ITEMS).filter(function(k) { return COMMISSION_ITEMS[k].rarity === 'common'; });
    var subKey = substituteItems[Math.floor(Math.random() * substituteItems.length)];
    var subItem = COMMISSION_ITEMS[subKey];
    addPermanentItem({
      id: subKey + '_sub',
      name: subItem.name + '（替代品）',
      icon: subItem.icon,
      desc: '委托替代品',
      stackable: true,
      consumable: false
    });
    addMessage('system', '获得替代品：' + subItem.icon + ' ' + subItem.name);

  } else if (roll < embezzleChance + 0.10 + 0.40 + 0.20 + 0.20) {
    // 失败
    result = 'failed';
    comm.result = 'failed';
    comm.completed = false;
    comm.failed = true;
    comm.status = 'done';

    addMessage('system', '❌ ' + npc.icon + ' ' + npc.name + '空手而归，还受了伤。');
    addMessage('narrator', npc.icon + ' ' + npc.name + '："那地方太危险了...抱歉。"');
    addMessage('system', '悬赏金不退还。');
    showNotification('❌ 委托失败', 'horror');

  } else {
    // 惨败 - NPC死亡
    result = 'catastrophe';
    comm.result = 'catastrophe';
    comm.completed = false;
    comm.failed = true;
    comm.status = 'done';

    addMessage('horror', '💀 ' + npc.icon + ' ' + npc.name + '在副本中失踪了...');
    addMessage('system', '系统通知：委托执行者 ' + npc.name + ' 已确认死亡。');
    addMessage('system', '悬赏金不退还。可使用「回溯之泪」复活。');
    showNotification('💀 ' + npc.name + '在委托中死亡', 'horror');
  }

  // 好感度变化
  if (comm.affinityGain && (result === 'success' || result === 'great_success')) {
    // 如果接单NPC在通讯录中，增加好感
    var contact = G.contacts.find(function(c) {
      var charData = CHARACTER_DB[c.code];
      return charData && charData.name === npc.name;
    });
    if (contact) {
      changeAffinity(contact.code, comm.affinityGain);
    }
  }

  COMMISSION_SYSTEM.completedCommissions.push(comm);
  saveGame();
}

// 私吞选择弹窗
function showEmbezzleChoice(commissionId) {
  var comm = COMMISSION_SYSTEM.playerCommissions.find(function(c) { return c.id === commissionId; });
  if (!comm) return;
  var npc = comm.acceptor;

  var panel = document.getElementById('settlementPanel');
  var html = '';
  html += '<div class="settlement-title">⚠️ 委托物品疑似被私吞</div>';
  html += '<div class="settlement-ending-name">' + npc.icon + ' ' + npc.name + ' 没有交出 ' + comm.itemIcon + ' ' + comm.itemName + '</div>';

  html += '<div style="padding:12px;background:rgba(139,0,0,0.1);border:1px solid #3a1515;border-radius:8px;margin:16px 0;font-size:12px;color:#999;line-height:1.8">';
  html += '你委托 ' + npc.name + ' 前往「' + comm.source + '」获取 ' + comm.itemName + '。<br>';
  html += '对方声称任务失败，但你怀疑物品被私吞了。<br>';
  html += '你可以选择如何处理这件事。';
  html += '</div>';

  html += '<div class="settlement-btn-group">';
  html += '<button class="settlement-btn" onclick="pursueEmbezzler(\'' + commissionId + '\')">🔍 追讨（好感-20，50%追回）</button>';
  html += '<button class="settlement-btn secondary" onclick="reportEmbezzler(\'' + commissionId + '\')">📢 举报（对方信誉-10%，你好感-10）</button>';
  html += '<button class="settlement-btn secondary" onclick="ignoreEmbezzle(\'' + commissionId + '\')">😤 算了（好感-5）</button>';
  html += '</div>';

  panel.innerHTML = html;
  document.getElementById('settlementOverlay').classList.add('show');
}

function pursueEmbezzler(commissionId) {
  document.getElementById('settlementOverlay').classList.remove('show');
  var comm = COMMISSION_SYSTEM.playerCommissions.find(function(c) { return c.id === commissionId; });
  if (!comm || !comm.acceptor) return;
  var npc = comm.acceptor;

  // 好感-20
  var contact = G.contacts.find(function(c) {
    var cd = CHARACTER_DB[c.code];
    return cd && cd.name === npc.name;
  });
  if (contact) changeAffinity(contact.code, -20);

  // 50%追回
  if (Math.random() < 0.5) {
    addMessage('system', '✅ 你成功追回了 ' + comm.itemIcon + ' ' + comm.itemName + '！');
    addPermanentItem({
      id: comm.itemId + '_recovered',
      name: comm.itemName,
      icon: comm.itemIcon,
      desc: '从私吞者手中追回的物品',
      stackable: true, consumable: false
    });
    addMessage('narrator', npc.icon + ' ' + npc.name + '："...你赢了。但别指望我还会帮你。"');
    showNotification('✅ 物品追回成功', 'clue');
  } else {
    addMessage('system', '❌ 追讨失败。' + npc.name + '否认私吞，你没有证据。');
    addMessage('narrator', npc.icon + ' ' + npc.name + '："我说了，东西丢了！你爱信不信。"');
    showNotification('❌ 追讨失败', 'horror');
  }
  saveGame();
}

function reportEmbezzler(commissionId) {
  document.getElementById('settlementOverlay').classList.remove('show');
  var comm = COMMISSION_SYSTEM.playerCommissions.find(function(c) { return c.id === commissionId; });
  if (!comm || !comm.acceptor) return;
  var npc = comm.acceptor;

  // 好感-10
  var contact = G.contacts.find(function(c) {
    var cd = CHARACTER_DB[c.code];
    return cd && cd.name === npc.name;
  });
  if (contact) changeAffinity(contact.code, -10);

  addMessage('system', '📢 你向管理局举报了 ' + npc.icon + ' ' + npc.name + '。');
  addMessage('system', '系统通知：' + npc.name + ' 的排行积分 -10%，列入观察名单。');
  addMessage('narrator', npc.icon + ' ' + npc.name + '："你...你居然举报我？！"');
  changeReputation(2, '举报私吞者');
  showNotification('📢 举报成功', 'clue');
  saveGame();
}

function ignoreEmbezzle(commissionId) {
  document.getElementById('settlementOverlay').classList.remove('show');
  var comm = COMMISSION_SYSTEM.playerCommissions.find(function(c) { return c.id === commissionId; });
  if (!comm || !comm.acceptor) return;
  var npc = comm.acceptor;

  var contact = G.contacts.find(function(c) {
    var cd = CHARACTER_DB[c.code];
    return cd && cd.name === npc.name;
  });
  if (contact) changeAffinity(contact.code, -5);

  addMessage('system', '你选择不追究此事。');
  addMessage('narrator', '也许是真的丢了...也许不是。但你决定放下这件事。');
  saveGame();
}

//   玩家接取NPC委托 + 私吞机制  

function acceptNPCCommission(commissionId) {
  var comm = COMMISSION_SYSTEM.npcCommissions.find(function(c) { return c.id === commissionId; });
  if (!comm || comm.accepted) return;

  var acceptedCount = COMMISSION_SYSTEM.npcCommissions.filter(function(c) { return c.accepted && !c.completed && !c.failed; }).length;
  if (acceptedCount >= COMMISSION_SYSTEM.maxAcceptedNPC) {
    showNotification('同时最多接取' + COMMISSION_SYSTEM.maxAcceptedNPC + '个委托', 'horror');
    return;
  }

  comm.accepted = true;
  comm.acceptTime = Date.now();

  addMessage('system', '📋 接取委托：为 ' + comm.publisherIcon + ' ' + comm.publisherName + ' 获取 ' + comm.itemIcon + ' ' + comm.itemName);
  addMessage('system', '💎 报酬：' + comm.reward + ' 碎片');
  addMessage('system', '📍 来源副本：' + comm.source);
  showNotification('📋 委托已接取', 'clue');
  saveGame();
}

// 玩家在副本中获得委托物品时触发
function checkCommissionItemFound(itemId) {
  var activeComms = COMMISSION_SYSTEM.npcCommissions.filter(function(c) {
    return c.accepted && !c.completed && !c.failed && c.itemId === itemId;
  });

  if (activeComms.length === 0) return;

  var comm = activeComms[0];
  // 弹出选择：交付 or 私吞
  showPlayerEmbezzleChoice(comm);
}

function showPlayerEmbezzleChoice(comm) {
  var panel = document.getElementById('settlementPanel');
  var html = '';
  html += '<div class="settlement-title">📦 找到委托物品</div>';
  html += '<div class="settlement-ending-name">你找到了 ' + comm.itemIcon + ' ' + comm.itemName + '</div>';

  html += '<div style="padding:12px;background:rgba(139,0,0,0.1);border:1px solid #3a1515;border-radius:8px;margin:16px 0;font-size:12px;color:#999;line-height:1.8">';
  html += '这是 ' + comm.publisherIcon + ' ' + comm.publisherName + ' 委托你获取的物品。<br>';
  html += '报酬：💎 ' + comm.reward + ' 碎片<br>';
  html += '你可以选择交付...或者留给自己。';
  html += '</div>';

  html += '<div class="settlement-btn-group">';
  html += '<button class="settlement-btn" onclick="deliverCommissionItem(\'' + comm.id + '\')">🤝 交付委托（获得 💎' + comm.reward + '，好感+' + comm.affinityBonus + '）</button>';
  html += '<button class="settlement-btn secondary" style="border-color:#8b0000" onclick="embezzleCommissionItem(\'' + comm.id + '\')">😈 私吞（物品归自己，但...）</button>';
  html += '</div>';

  panel.innerHTML = html;
  document.getElementById('settlementOverlay').classList.add('show');
}

function deliverCommissionItem(commissionId) {
  document.getElementById('settlementOverlay').classList.remove('show');
  var comm = COMMISSION_SYSTEM.npcCommissions.find(function(c) { return c.id === commissionId; });
  if (!comm) return;

  comm.completed = true;
  G.soulFragments += comm.reward;
  updateFragmentDisplay();

  addMessage('system', '🤝 你将 ' + comm.itemIcon + ' ' + comm.itemName + ' 交给了 ' + comm.publisherIcon + ' ' + comm.publisherName);
  addMessage('system', '💎 获得报酬：' + comm.reward + ' 碎片');
  addMessage('narrator', comm.publisherIcon + ' ' + comm.publisherName + '："谢谢你，辛苦了。"');

  // 好感度
  var contact = G.contacts.find(function(c) {
    var cd = CHARACTER_DB[c.code];
    return cd && cd.name === comm.publisherName;
  });
  if (contact) changeAffinity(contact.code, comm.affinityBonus);

  changeReputation(3, '按时交付委托');
  showNotification('✅ 委托完成！+' + comm.reward + '💎', 'clue');

  COMMISSION_SYSTEM.completedCommissions.push(comm);
  saveGame();
}

function embezzleCommissionItem(commissionId) {
  document.getElementById('settlementOverlay').classList.remove('show');
  var comm = COMMISSION_SYSTEM.npcCommissions.find(function(c) { return c.id === commissionId; });
  if (!comm) return;

  comm.failed = true;
  comm._embezzled = true;

  // 物品归玩家
  addPermanentItem({
    id: comm.itemId + '_stolen',
    name: comm.itemName,
    icon: comm.itemIcon,
    desc: '从委托中私吞的物品',
    stackable: true, consumable: false
  });

  addMessage('horror', '你将 ' + comm.itemIcon + ' ' + comm.itemName + ' 据为己有...');
  addMessage('system', '📦 获得：' + comm.itemIcon + ' ' + comm.itemName);

  // 后果
  // 1. 好感-30
  var contact = G.contacts.find(function(c) {
    var cd = CHARACTER_DB[c.code];
    return cd && cd.name === comm.publisherName;
  });
  if (contact) {
    changeAffinity(contact.code, -30);
    addMessage('system', '💔 ' + comm.publisherName + ' 的好感度 -30');
  }

  // 2. 信誉大幅下降
  changeReputation(-15, '私吞委托物品');

  // 3. 委托人反应
  addMessage('narrator', comm.publisherIcon + ' ' + comm.publisherName + '："...你把东西交出来。"');

  // 4. 随机追杀事件（延迟触发）
  var hasInfluence = ['林夜', '归夜', '莫然', '红颜', '严九', '柳道'].includes(comm.publisherName);
  if (hasInfluence) {
    addMessage('horror', comm.publisherName + '不是好惹的人...你感到一阵不安。');
    // 下次进入副本时触发追杀事件
    if (!G._pendingRetaliations) G._pendingRetaliations = [];
    G._pendingRetaliations.push({
      from: comm.publisherName,
      fromIcon: comm.publisherIcon,
      itemName: comm.itemName,
      time: Date.now()
    });
  }

  showNotification('😈 私吞成功...但后果自负', 'horror');
  saveGame();
}

// 追杀事件检查（进入副本时调用）
function checkRetaliationEvents() {
  if (!G._pendingRetaliations || G._pendingRetaliations.length === 0) return;

  var event = G._pendingRetaliations.shift();
  setTimeout(function() {
    addMessage('horror', '⚠️ 你感到一股杀意...');
    addMessage('horror', event.fromIcon + ' ' + event.from + '派来的人找到了你！');
    addMessage('system', '「把' + event.itemName + '还回来...否则别想活着离开。」');

    // 扣HP和SAN
    updateHP(G.hp - 2);
    updateSAN(G.san - 10);
    addMessage('system', '❤️ HP -2 | 🧠 SAN -10');
    showNotification('⚠️ 遭到追杀！', 'horror');
  }, 10000 + Math.random() * 20000);
}

//   委托面板UI  

function showCommissionPanel() {
  var panel = document.getElementById('dungeonSelectPanel');
  var html = '';
  html += '<div style="text-align:center;font-size:16px;color:#e0b0b0;margin-bottom:8px;border-bottom:1px solid #3a1515;padding-bottom:8px">📋 委托任务板</div>';

  // Tab切换
  html += '<div style="display:flex;gap:0;margin-bottom:12px;border-bottom:1px solid #3a1515">';
  html += '<button class="inv-tab active" id="commTab1" onclick="switchCommTab(\'npc\')">NPC委托</button>';
  html += '<button class="inv-tab" id="commTab2" onclick="switchCommTab(\'publish\')">发布委托</button>';
  html += '<button class="inv-tab" id="commTab3" onclick="switchCommTab(\'my\')">我的委托</button>';
  html += '</div>';

  // 信誉显示
  var repLevel = getReputationLevel();
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:6px 8px;background:rgba(20,8,8,0.6);border:1px solid #3a1515;border-radius:6px">';
  html += '<span style="font-size:11px;color:#888">信誉：' + repLevel.name + ' (' + REPUTATION_SYSTEM.score + ')</span>';
  html += '<span style="font-size:11px;color:#ffd700">💎 ' + G.soulFragments + '</span>';
  html += '</div>';

  html += '<div id="commissionContent" style="max-height:45vh;overflow-y:auto">';
  html += buildNPCCommissionList();
  html += '</div>';

  html += '<button class="settlement-btn secondary" style="margin-top:12px" onclick="closeDungeonSelect()">返回</button>';
  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
}

function switchCommTab(tab) {
  document.querySelectorAll('#commTab1,#commTab2,#commTab3').forEach(function(b) { b.classList.remove('active'); });
  var content = document.getElementById('commissionContent');

  if (tab === 'npc') {
    document.getElementById('commTab1').classList.add('active');
    content.innerHTML = buildNPCCommissionList();
  } else if (tab === 'publish') {
    document.getElementById('commTab2').classList.add('active');
    content.innerHTML = buildPublishPanel();
  } else if (tab === 'my') {
    document.getElementById('commTab3').classList.add('active');
    content.innerHTML = buildMyCommissionList();
  }
}

function buildNPCCommissionList() {
  // 刷新NPC委托（每5分钟刷新一次）
  var now = Date.now();
  if (COMMISSION_SYSTEM.npcCommissions.length === 0 || now - COMMISSION_SYSTEM._lastRefresh > 5 * 60 * 1000) {
    COMMISSION_SYSTEM.npcCommissions = generateNPCCommissions();
    COMMISSION_SYSTEM._lastRefresh = now;
  }

  var repLevel = getReputationLevel();
  var html = '';

  COMMISSION_SYSTEM.npcCommissions.forEach(function(c) {
    if (c.completed || c.failed) return;

    var rarityColor = c.itemRarity === 'legendary' ? '#ffd700' : (c.itemRarity === 'rare' ? '#da70d6' : '#aaa');
    var isLocked = c.itemRarity !== 'common' && repLevel.id === 'suspicious';
    var isBlocked = repLevel.id === 'infamous';

    html += '<div class="dungeon-card" style="' + (isLocked || isBlocked ? 'opacity:0.4;pointer-events:none' : '') + '">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center">';
    html += '<div class="dungeon-card-title" style="font-size:13px">' + c.itemIcon + ' ' + c.itemName + '</div>';
    html += '<span style="font-size:10px;color:' + rarityColor + ';border:1px solid ' + rarityColor + ';padding:1px 6px;border-radius:4px">' + (c.itemRarity === 'legendary' ? '传说' : (c.itemRarity === 'rare' ? '稀有' : '普通')) + '</span>';
    html += '</div>';
    html += '<div class="dungeon-card-meta">委托人：' + c.publisherIcon + ' ' + c.publisherName + ' | 来源：' + c.source + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">';
    html += '<span style="color:#ffd700;font-size:13px">💎 ' + c.reward + '</span>';

    if (c.accepted) {
      html += '<span style="color:#88ff88;font-size:10px">已接取 ✓</span>';
    } else if (isBlocked) {
      html += '<span style="color:#ff4444;font-size:10px">信誉不足</span>';
    } else if (isLocked) {
      html += '<span style="color:#ff8800;font-size:10px">信誉不足</span>';
    } else {
      html += '<button class="market-buy-btn" onclick="acceptNPCCommission(\'' + c.id + '\');switchCommTab(\'npc\')">接取</button>';
    }
    html += '</div></div>';
  });

  if (html === '') {
    html = '<div style="text-align:center;color:#555;padding:20px">暂无可用委托</div>';
  }

  return html;
}

function buildPublishPanel() {
  var html = '';
  var repLevel = getReputationLevel();

  if (repLevel.id === 'infamous') {
    html += '<div style="text-align:center;color:#ff4444;padding:30px">💀 信誉太低，无法发布委托<br><br>通过完成NPC委托恢复信誉</div>';
    return html;
  }

  html += '<div style="font-size:11px;color:#888;margin-bottom:8px">选择需要的物品，设定悬赏金后发布。NPC会自动接单前往副本获取。</div>';

  // 物品选择（按稀有度分组）
  var rarities = [
    { key: 'common', label: '普通', color: '#aaa' },
    { key: 'rare', label: '稀有', color: '#da70d6' },
    { key: 'legendary', label: '传说', color: '#ffd700' }
  ];

  rarities.forEach(function(r) {
    if (r.key !== 'common' && repLevel.id === 'suspicious') return; // 可疑信誉不能发高级委托

    html += '<div style="font-size:10px;color:' + r.color + ';margin:8px 0 4px;border-bottom:1px solid #2a1010;padding-bottom:2px">' + r.label + '</div>';

    Object.keys(COMMISSION_ITEMS).forEach(function(itemId) {
      var item = COMMISSION_ITEMS[itemId];
      if (item.rarity !== r.key) return;

      var minBounty = Math.floor(item.basePrice * 0.8);
      html += '<div class="market-item" style="flex-direction:column;align-items:stretch;gap:6px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<div><span style="font-size:12px;color:#ddd">' + item.icon + ' ' + item.name + '</span>';
      html += '<div style="font-size:9px;color:#666">' + item.desc + ' | 来源：' + item.source + '</div></div>';
      html += '<span style="font-size:10px;color:#888">底价 💎' + minBounty + '</span>';
      html += '</div>';
      html += '<div style="display:flex;gap:6px;align-items:center">';
      html += '<input type="number" id="bounty_' + itemId + '" placeholder="悬赏金" min="' + minBounty + '" value="' + item.basePrice + '" style="flex:1;padding:4px 8px;border:1px solid #3a1515;border-radius:4px;background:rgba(20,8,8,0.8);color:#ffd700;font-size:11px;outline:none">';
      html += '<button class="market-buy-btn" onclick="doPublishCommission(\'' + itemId + '\')">发布</button>';
      html += '</div></div>';
    });
  });

  return html;
}

function doPublishCommission(itemId) {
  var input = document.getElementById('bounty_' + itemId);
  if (!input) return;
  var bounty = parseInt(input.value, 10);
  if (isNaN(bounty) || bounty <= 0) {
    showNotification('请输入有效的悬赏金', 'horror');
    return;
  }
  if (publishPlayerCommission(itemId, bounty)) {
    switchCommTab('my');
  }
}

function buildMyCommissionList() {
  var html = '';

  // 玩家发布的委托
  var playerComms = COMMISSION_SYSTEM.playerCommissions.filter(function(c) { return !c.completed || Date.now() - (c.resultTime || c.publishTime) < 10 * 60 * 1000; });
  if (playerComms.length > 0) {
    html += '<div style="font-size:11px;color:#b57a7a;margin-bottom:6px">我发布的委托</div>';
    playerComms.forEach(function(c) {
      var statusText = '';
      var statusColor = '#888';
      switch (c.status) {
        case 'waiting': statusText = '⏳ 等待接单'; statusColor = '#888'; break;
        case 'accepted': statusText = '✅ ' + c.acceptor.icon + ' ' + c.acceptor.name + '已接单'; statusColor = '#88ff88'; break;
        case 'executing': statusText = '🏃 ' + c.acceptor.icon + ' ' + c.acceptor.name + '执行中...'; statusColor = '#ffaa00'; break;
        case 'done':
          if (c.result === 'great_success') { statusText = '🌟 大成功'; statusColor = '#ffd700'; }
          else if (c.result === 'success') { statusText = '✅ 成功'; statusColor = '#88ff88'; }
          else if (c.result === 'partial') { statusText = '⚠️ 部分成功'; statusColor = '#ffaa00'; }
          else if (c.result === 'failed') { statusText = '❌ 失败'; statusColor = '#ff4444'; }
          else if (c.result === 'embezzled') { statusText = '🚨 疑似私吞'; statusColor = '#ff0000'; }
          else if (c.result === 'catastrophe') { statusText = '💀 执行者死亡'; statusColor = '#ff0000'; }
          break;
      }

      html += '<div class="dungeon-card">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<span style="font-size:12px;color:#ddd">' + c.itemIcon + ' ' + c.itemName + '</span>';
      html += '<span style="font-size:10px;color:' + statusColor + '">' + statusText + '</span>';
      html += '</div>';
      html += '<div style="font-size:10px;color:#888;margin-top:4px">悬赏：💎' + c.bounty + ' | 来源：' + c.source + '</div>';
      html += '</div>';
    });
  }

  // 玩家接取的NPC委托
  var acceptedComms = COMMISSION_SYSTEM.npcCommissions.filter(function(c) { return c.accepted && !c.completed && !c.failed; });
  if (acceptedComms.length > 0) {
    html += '<div style="font-size:11px;color:#b57a7a;margin:12px 0 6px">我接取的委托</div>';
    acceptedComms.forEach(function(c) {
      html += '<div class="dungeon-card">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<span style="font-size:12px;color:#ddd">' + c.itemIcon + ' ' + c.itemName + '</span>';
      html += '<span style="font-size:10px;color:#ffaa00">进行中</span>';
      html += '</div>';
      html += '<div style="font-size:10px;color:#888;margin-top:4px">委托人：' + c.publisherIcon + ' ' + c.publisherName + ' | 报酬：💎' + c.reward + '</div>';
      html += '<div style="font-size:10px;color:#888">来源副本：' + c.source + '</div>';
      html += '</div>';
    });
  }

  if (html === '') {
    html = '<div style="text-align:center;color:#555;padding:20px">暂无进行中的委托<br><br>去NPC委托页接取任务<br>或发布委托让NPC帮你跑腿</div>';
  }

  return html;
}
