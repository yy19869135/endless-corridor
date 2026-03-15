function checkEndingConditions() {
  if (!G.dungeon || !G.dungeon.endings) return;
  G.dungeon.endings.forEach(function(ending) {
    if (ending.triggered) return;
    if (checkEndingRequirements(ending)) {
      ending.available = true;
    }
  });
}

function checkEndingRequirements(ending) {
  var req = ending.requirements;
  if (!req) return false;
  if (req.clues) {
    for (var i = 0; i < req.clues.length; i++) {
      if (!G.cluesFound.includes(req.clues[i])) return false;
    }
  }
  if (req.items) {
    for (var i = 0; i < req.items.length; i++) {
      if (!hasDungeonItem(req.items[i])) return false;
    }
  }
  if (req.room && G.currentRoom !== req.room) return false;
  if (req.sanBelow && G.san >= req.sanBelow) return false;
  if (req.minClueCount && G.cluesFound.length < req.minClueCount) return false;
  return true;
}

function triggerEnding(endingId) {
  var ending = G.dungeon.endings.find(function(e){ return e.id === endingId; });
  if (!ending) return;
  ending.triggered = true;
  G.gamePhase = 'ended';
  stopDungeonTimer();

  addMessage('system', '═══════════════════');
  addMessage('horror', ending.title || '结局');
  if (ending.text) addMessage('narrator', ending.text);
  addMessage('system', '═══════════════════');

  setTimeout(function() { showSettlement(ending); }, 2000);
}

function triggerDeath() {
  G.gamePhase = 'ended';
  stopDungeonTimer();
  addMessage('horror', '你的意识逐渐模糊...生命的火焰熄灭了。');
  addMessage('system', '☠️ 你已死亡');

  // 检查替死娃娃
  var doll = G.permanentItems.find(function(i){ return i.id === 'substitute_doll'; });
  if (doll) {
    setTimeout(function() {
      addMessage('system', '💫 替死娃娃发出微光，碎裂成粉末...');
      addMessage('system', '你从死亡边缘被拉了回来！');
      removePermanentItem('substitute_doll');
      updateHP(3);
      G.gamePhase = 'dungeon';
      if (!G.timerStarted) startDungeonTimer();
    }, 1500);
    return;
  }

  setTimeout(function() {
    showSettlement({
      id: 'death',
      title: '☠️ 死亡',
      text: '你的旅程在此终结...',
      rating: 'F',
      fragmentReward: 0,
      isDeath: true
    });
  }, 2000);
}

function triggerInsanity() {
  G.gamePhase = 'ended';
  stopDungeonTimer();
  addMessage('horror', '你的理智彻底崩溃了...现实与幻觉的界限消失了。');
  addMessage('system', '🧠 理智归零 - 疯狂');
  setTimeout(function() {
    showSettlement({
      id: 'insanity',
      title: '🧠 疯狂',
      text: '你在无尽的恐惧中失去了自我...',
      rating: 'D',
      fragmentReward: 0,
      isDeath: true
    });
  }, 2000);
}

function triggerTimeOut() {
  G.timerStarted = false;
  stopDungeonTimer();
  G._timeoutExit = true;

  addMessage('horror', '时间到——副本开始坍塌，一股不可抗拒的力量将你扯离了这个空间。');
  showNotification('⏰ 时间耗尽！副本强制关闭', 'horror');
  updateSAN(G.san - 10);

  setTimeout(function() {
    showSettlement('timeout');
  }, 2000);
}

// ★ 获取当前副本难度
function getCurrentDungeonDifficulty() {
  if (!G.dungeon || !G.dungeon.id) return 2;
  // 从 GENERATED_DUNGEON_DEFS 中查找难度
  if (typeof GENERATED_DUNGEON_DEFS !== 'undefined') {
    var def = GENERATED_DUNGEON_DEFS.find(function(d) { return d.id === G.dungeon.id; });
    if (def) return def.difficulty;
  }
  // 手工副本默认难度
  var manualDiff = { hospital: 2, mansion: 3, train: 4 };
  return manualDiff[G.dungeon.id] || 2;
}

function showSettlement(ending) {
  var panel = document.getElementById('settlementPanel');
  var totalClues = G.dungeon ? Object.keys(G.dungeon.clues || {}).length : 0;
  var foundClues = G.cluesFound.length;
  var timeUsed = G.gameTime;
  var rating = ending.rating || calculateRating(foundClues, totalClues, G.san, G.hp);

  // ★ 判断死亡/失败
  var isDeath = !!(ending.isDeath || ending === 'timeout' || G.hp <= 0 || G.san <= 0);

  // ★ 超时构造
  if (ending === 'timeout') {
    ending = {
      id: 'timeout',
      title: '⏰ 时间耗尽',
      text: '副本坍塌，你被强制驱逐...',
      rating: 'D',
      isDeath: true
    };
    isDeath = true;
  }

  // ★ 死亡不给碎片
  var fragments = 0;
  if (!isDeath) {
    fragments = ending.fragmentReward !== undefined ? ending.fragmentReward : calculateFragments(rating, foundClues);
  }

  // ★ 获取难度用于经验计算
  var difficulty = getCurrentDungeonDifficulty();

  var html = '';
  html += '<div class="settlement-title">' + (G.dungeon ? G.dungeon.name : '副本') + ' - 结算</div>';
  html += '<div class="settlement-ending-name">' + (ending.title || '未知结局') + '</div>';

  html += '<div class="settlement-stats">';
  html += '<div class="settlement-stat-card"><div class="settlement-stat-label">评级</div><div class="settlement-stat-value">' + (isDeath ? 'F' : rating) + '</div></div>';
  html += '<div class="settlement-stat-card"><div class="settlement-stat-label">线索</div><div class="settlement-stat-value">' + foundClues + '/' + totalClues + '</div></div>';
  html += '<div class="settlement-stat-card"><div class="settlement-stat-label">用时</div><div class="settlement-stat-value">' + Math.floor(timeUsed / 60) + '分' + (timeUsed % 60) + '秒</div></div>';
  html += '<div class="settlement-stat-card"><div class="settlement-stat-label">剩余SAN</div><div class="settlement-stat-value">' + G.san + '</div></div>';
  html += '</div>';

  if (isDeath) {
    // ★★★ 死亡结算 ★★★
    var fragmentPenalty = Math.floor(G.soulFragments * 0.15); // 损失15%碎片
    var deathExp = calculateDeathExp(foundClues, difficulty); // 死亡也给少量经验

    html += '<div style="background:rgba(80,0,0,0.3);border:1px solid #5a1515;border-radius:8px;padding:16px;margin:12px 0;text-align:center">';
    html += '<div style="font-size:14px;color:#ff4444;margin-bottom:8px">☠️ 探索失败</div>';
    html += '<div style="font-size:11px;color:#a88;line-height:1.8">你未能完成副本。</div>';
    html += '<div style="font-size:11px;color:#a88;line-height:1.8">💎 碎片惩罚：-' + fragmentPenalty + '（当前 ' + G.soulFragments + '）</div>';
    html += '<div style="font-size:11px;color:#a88;line-height:1.8">✨ 经验获得：+' + deathExp + '（探索经验）</div>';
    html += '<div style="font-size:11px;color:#666;line-height:1.8;margin-top:8px">HP/SAN将恢复至50%，副本道具全部丢失。</div>';
    html += '</div>';

    // ★ 碎片复活选项
    var reviveCost = 50;
    html += '<div style="background:rgba(50,30,0,0.3);border:1px solid #5a4a15;border-radius:8px;padding:12px;margin:8px 0">';
    html += '<div style="font-size:12px;color:#ffd700;margin-bottom:8px;text-align:center">💎 碎片复活</div>';
    if (G.soulFragments >= reviveCost) {
      html += '<div style="font-size:11px;color:#c8a8a8;text-align:center;margin-bottom:8px">消耗 <span style="color:#ffd700">' + reviveCost + '</span> 灵魂碎片，在副本入口重新开始（保留已收集线索）</div>';
      html += '<button class="settlement-btn" style="width:100%;background:rgba(80,60,0,0.4);border-color:#8b7500;margin-bottom:8px" onclick="reviveWithFragments(' + reviveCost + ')">💎 花费 ' + reviveCost + ' 碎片复活</button>';
    } else {
      html += '<div style="font-size:11px;color:#666;text-align:center">碎片不足（需要 ' + reviveCost + '，当前 ' + G.soulFragments + '）</div>';
    }
    html += '</div>';

    html += '<div class="settlement-btn-group">';
    html += '<button class="settlement-btn" style="background:rgba(60,10,10,0.6);border-color:#5a1515" onclick="deathExitDungeon(' + fragmentPenalty + ',' + deathExp + ',' + difficulty + ')">💀 接受失败，返回回廊</button>';
    html += '</div>';

  } else {
    // ★★★ 成功通关 ★★★
    var expGain = calculateExpGain(rating, difficulty);

    html += '<div class="settlement-rewards">';
    html += '<div class="settlement-rewards-title">🎁 结算奖励</div>';
    html += '<div class="settlement-reward-item"><span>💎 灵魂碎片</span><span class="settlement-reward-value">+' + fragments + '</span></div>';
    html += '<div class="settlement-reward-item"><span>✨ 经验值</span><span class="settlement-reward-value">+' + expGain + '</span></div>';

    // 可带出道具
    var takeOutItems = G.dungeonItems.filter(function(i){ return i.canTakeOut; });
    takeOutItems.forEach(function(item) {
      html += '<div class="settlement-reward-item"><span>' + (item.icon || '📦') + ' ' + item.name + '</span><span class="settlement-reward-value">带出</span></div>';
    });

    // 结局特殊奖励
    if (ending.bonusItems) {
      ending.bonusItems.forEach(function(item) {
        html += '<div class="settlement-reward-item"><span>' + (item.icon || '🎁') + ' ' + item.name + '</span><span class="settlement-reward-value">获得</span></div>';
      });
    }
    html += '</div>';

    html += '<div class="settlement-btn-group">';
    html += '<button class="settlement-btn" onclick="exitDungeon(' + fragments + ',' + expGain + ',' + difficulty + ')">🌀 返回苍白回廊</button>';
    html += '</div>';
  }

  panel.innerHTML = html;
  document.getElementById('settlementOverlay').classList.add('show');
}

// ★ 碎片复活
function reviveWithFragments(cost) {
  if (G.soulFragments < cost) {
    showNotification('碎片不足！', 'horror');
    return;
  }

  G.soulFragments -= cost;
  updateLeaderboard();
  saveGame();

  document.getElementById('settlementOverlay').classList.remove('show');

  var savedClues = G.cluesFound.slice();
  G.hp = G.maxHp;
  G.san = Math.floor(G.maxSan * 0.7);
  G.gamePhase = 'dungeon';

  var startRoom = G.dungeon.startRoom || Object.keys(G.dungeon.rooms)[0];
  G.cluesFound = savedClues;

  addMessage('system', '💎 消耗 ' + cost + ' 灵魂碎片，你从死亡中挣脱了回来...');
  addMessage('narrator', '一阵金色的光芒将你的意识拉回。你发现自己重新站在了副本的入口处。之前收集的线索还残留在记忆中，但身体已经疲惫不堪。');
  addMessage('system', '❤️ HP已恢复至 ' + G.hp + '/' + G.maxHp);
  addMessage('system', '🧠 SAN恢复至 ' + G.san + '/' + G.maxSan);

  showNotification('💎 碎片复活成功！', 'clue');

  if (!G.timerStarted) startDungeonTimer();
  moveToRoom(startRoom);
}

// ★★★ 死亡退出（不再删档！惩罚+回大世界）★★★
function deathExitDungeon(fragmentPenalty, deathExp, difficulty) {
  document.getElementById('settlementOverlay').classList.remove('show');

  // ★ 死亡惩罚：扣碎片
  G.soulFragments = Math.max(0, G.soulFragments - fragmentPenalty);
  updateFragmentDisplay();

  // ★ 死亡也给少量经验（探索经验）
  grantExp(deathExp, difficulty);

  // ★ 记录死亡次数
  G.totalDeaths = (G.totalDeaths || 0) + 1;

  // ★ 更新排行榜
  updateLeaderboard();

  // ★ 保存归来信息
  var returnInfo = buildReturnInfo('death', 0);

  // 清空副本临时数据
  clearDungeonData();

  // ★ 恢复状态（有惩罚）
  updateHP(Math.floor(G.maxHp * 0.5));
  updateSAN(Math.floor(G.maxSan * 0.5));

  saveGame();
  enterWorld();

  addMessage('horror', '——你从黑暗中醒来。死亡的记忆像褪色的照片，模糊却刺痛。');
  addMessage('system', '☠️ 死亡惩罚：损失 💎' + fragmentPenalty + ' 碎片');
  addMessage('system', '❤️ HP恢复至 ' + G.hp + '/' + G.maxHp + ' | 🧠 SAN恢复至 ' + G.san + '/' + G.maxSan);

  // 触发AI归来叙事
  setTimeout(function() {
    triggerReturnNarration(returnInfo);
  }, 1500);
}

function calculateRating(found, total, san, hp) {
  var score = (found / Math.max(total, 1)) * 50 + (san / G.maxSan) * 30 + (hp / G.maxHp) * 20;
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 55) return 'B';
  if (score >= 35) return 'C';
  return 'D';
}

function calculateFragments(rating, clueCount) {
  var base = { S: 100, A: 75, B: 50, C: 30, D: 15, F: 0 };
  return (base[rating] || 15) + clueCount * 10;
}

// ★ 经验计算
function calculateExpGain(rating, difficulty) {
  var ratingMult = { S: 100, A: 75, B: 50, C: 30, D: 15 };
  var diffMult = { 1: 0.6, 2: 1, 3: 1.5, 4: 2, 5: 3 };
  var base = ratingMult[rating] || 15;
  return Math.floor(base * (diffMult[difficulty] || 1));
}

function calculateDeathExp(clueCount, difficulty) {
  // 死亡给探索经验：每个线索5点 × 难度系数
  var diffMult = { 1: 0.5, 2: 0.8, 3: 1, 4: 1.2, 5: 1.5 };
  return Math.floor((5 + clueCount * 5) * (diffMult[difficulty] || 1));
}

// ★ 经验发放与升级
function grantExp(exp, difficulty) {
  G.playerLevel = G.playerLevel || 1;
  G.playerExp = G.playerExp || 0;
  G.playerExp += exp;

  var levelUpExp = G.playerLevel * 150;

  while (G.playerExp >= levelUpExp) {
    G.playerExp -= levelUpExp;
    G.playerLevel++;
    levelUpExp = G.playerLevel * 150;

    // 升级奖励：每3级+1HP上限，每级+2SAN上限
    var newMaxHp = Math.min(20, 10 + Math.floor(G.playerLevel / 3));
    var newMaxSan = Math.min(200, 100 + G.playerLevel * 2);

    if (newMaxHp > G.maxHp) {
      G.maxHp = newMaxHp;
      updateHP(G.maxHp); // 升级回满
    }
    if (newMaxSan > G.maxSan) {
      G.maxSan = newMaxSan;
      updateSAN(G.maxSan);
    }

    addMessage('system', '🎉 等级提升！Lv.' + G.playerLevel);
    addMessage('system', '❤️ HP上限：' + G.maxHp + ' | 🧠 SAN上限：' + G.maxSan);
    showNotification('🎉 升级！Lv.' + G.playerLevel, 'clue');
  }
}

// ★ 更新历史最佳评级
function updateBestRating(rating) {
  var ratingOrder = { S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 };
  var currentBest = ratingOrder[G.bestRating] || 0;
  var newRating = ratingOrder[rating] || 0;
  if (newRating > currentBest) {
    G.bestRating = rating;
  }
}

function exitDungeon(fragments, expGain, difficulty) {
  document.getElementById('settlementOverlay').classList.remove('show');

  // 发放碎片
  G.soulFragments += fragments;
  updateFragmentDisplay();

  // ★ 发放经验
  grantExp(expGain, difficulty);

  // ★ 更新统计
  G.totalDungeonClears = (G.totalDungeonClears || 0) + 1;
  var rating = calculateRating(
    G.cluesFound.length,
    G.dungeon ? Object.keys(G.dungeon.clues || {}).length : 0,
    G.san, G.hp
  );
  updateBestRating(rating);

  // ★ 更新排行榜
  updateLeaderboard();

  // 可带出道具转入永久背包
  G.dungeonItems.forEach(function(item) {
    if (item.canTakeOut) {
      addPermanentItem(item);
    }
  });

  // 记录通关
  if (G.dungeon && !G.completedDungeons.includes(G.dungeon.id)) {
    G.completedDungeons.push(G.dungeon.id);
  }

  // 保存归来信息
  var returnInfo = buildReturnInfo('completed', fragments);

  // 清空副本临时数据
  clearDungeonData();
  saveGame();
  enterWorld();

  // 显示等级信息
  addMessage('system', '📊 Lv.' + G.playerLevel + ' (' + G.playerExp + '/' + (G.playerLevel * 150) + ')');

  // 延迟触发AI归来剧情
  setTimeout(function() {
    triggerReturnNarration(returnInfo);
  }, 1500);
}

function restartFromDeath(fragments) {
  document.getElementById('settlementOverlay').classList.remove('show');

  G.soulFragments += fragments;
  updateFragmentDisplay();

  var returnInfo = buildReturnInfo('death', fragments);

  clearDungeonData();

  updateHP(G.maxHp);
  updateSAN(Math.floor(G.maxSan * 0.7));
  saveGame();
  enterWorld();

  setTimeout(function() {
    triggerReturnNarration(returnInfo);
  }, 1500);
}
