// ★ 动态排行榜系统

function initLeaderboard() {
  if (G.leaderboard && G.leaderboard.length > 4) return;

  G.leaderboard = [
    { rank: 1, name: '只有我不在的街道', score: 99999, tag: 'NPC', title: '回归者', icon: '👤', growth: 0 },
    { rank: 2, name: '龙傲天', score: 88888, tag: 'NPC', title: '传说探索者', icon: '🐉', growth: 50 },
    { rank: 3, name: '深渊行者', score: 77777, tag: 'NPC', title: '资深探索者', icon: '🌀', growth: 80 },
    { rank: 4, name: '林夜', score: 45000, tag: 'NPC', title: '冷酷剑客', icon: '🗡️', growth: 120 },
    { rank: 5, name: '莫然', score: 38000, tag: 'NPC', title: '烈焰佣兵', icon: '🔥', growth: 100 },
    { rank: 6, name: '老陈', score: 32000, tag: 'NPC', title: '老练刑警', icon: '🚬', growth: 60 },
    { rank: 7, name: '祁洛', score: 28000, tag: 'NPC', title: '千面狐', icon: '🎭', growth: 90 },
    { rank: 8, name: '姜雪', score: 25000, tag: 'NPC', title: '冰原医师', icon: '❄️', growth: 70 },
    { rank: 9, name: '柳道', score: 22000, tag: 'NPC', title: '剑道宗师', icon: '⚔️', growth: 85 },
    { rank: 10, name: '赵黑', score: 20000, tag: 'NPC', title: '暗夜猎手', icon: '🖤', growth: 110 },
    { rank: 11, name: '苏糖', score: 15000, tag: 'NPC', title: '元气解谜少女', icon: '🌸', growth: 95 },
    { rank: 12, name: '沈一', score: 12000, tag: 'NPC', title: '迷途僧人', icon: '📿', growth: 65 },
    { rank: 13, name: '陆风', score: 10000, tag: 'NPC', title: '赌徒', icon: '🌪️', growth: 130 },
    { rank: 14, name: '温情', score: 8000, tag: 'NPC', title: '歌姬', icon: '🎵', growth: 55 },
    { rank: 15, name: '韩梅', score: 6000, tag: 'NPC', title: '疯狂科学家', icon: '🔬', growth: 75 },
    { rank: 16, name: '小五', score: 4000, tag: 'NPC', title: '天才少年', icon: '🎮', growth: 100 },
    { rank: 17, name: '白灵', score: 3000, tag: 'NPC', title: '通灵少女', icon: '👻', growth: 40 },
    { rank: 18, name: '叶青', score: 2000, tag: 'NPC', title: '植物学家', icon: '🍃', growth: 45 },
    { rank: 19, name: '方域', score: 1500, tag: 'NPC', title: '铁壁守护者', icon: '🛡️', growth: 80 },
    { rank: 20, name: '池瞳', score: 1000, tag: 'NPC', title: '预言者', icon: '👁️‍🗨️', growth: 35 },
    { rank: 999, name: '你', score: 0, tag: 'User', title: '新人', icon: '👤', growth: 0 }
  ];
}

function updateLeaderboard() {
  // 确保排行榜已初始化
  if (!G.leaderboard || G.leaderboard.length === 0) {
    initLeaderboard();
  }

  // ★ NPC分数随玩家通关次数增长（模拟NPC也在探索）
  var playerClears = G.totalDungeonClears || 0;
  G.leaderboard.forEach(function(entry) {
    if (entry.tag === 'NPC' && entry.growth > 0) {
      // 每次玩家通关，NPC也"通关"了，分数增长
      // 基础分 + 通关次数 × growth系数 × 随机波动
      var seed = 0;
      for (var i = 0; i < entry.name.length; i++) seed += entry.name.charCodeAt(i);
      var wave = 0.8 + (Math.sin(seed + playerClears) * 0.2 + 0.2); // 0.8~1.2波动
      entry.score = entry.score + Math.floor(playerClears * entry.growth * wave);
    }
  });

  // ★ 更新玩家数据
  var userEntry = G.leaderboard.find(function(r) { return r.tag === 'User'; });
  if (userEntry) {
    // 玩家积分 = 碎片 + 通关数×200 + 等级×500
    userEntry.score = G.soulFragments
      + (G.totalDungeonClears || 0) * 200
      + (G.playerLevel || 1) * 500;

    if (G.playerName) userEntry.name = G.playerName;

    // 更新称号
    var level = G.playerLevel || 1;
    var clears = G.totalDungeonClears || 0;
    if (level >= 20 && clears >= 50) {
      userEntry.title = '回归者';
    } else if (level >= 15 && clears >= 30) {
      userEntry.title = '传说探索者';
    } else if (level >= 10 && clears >= 15) {
      userEntry.title = '资深探索者';
    } else if (level >= 5 && clears >= 5) {
      userEntry.title = '探索者';
    } else if (clears >= 1) {
      userEntry.title = '幸存者';
    } else {
      userEntry.title = '新人';
    }

    // 等级标签
    userEntry.title = 'Lv.' + level + ' ' + userEntry.title;

    // 阵营图标
    if (G.playerFaction) userEntry.icon = G.playerFaction.icon;
  }

  // ★ 检查已死亡角色——从排行榜中标记
  if (G.deadCharacters && G.deadCharacters.length > 0) {
    G.leaderboard.forEach(function(entry) {
      if (entry.tag === 'NPC') {
        var isDead = G.deadCharacters.some(function(dc) {
          return dc.name === entry.name || dc === entry.name;
        });
        if (isDead) {
          entry.dead = true;
          entry.title = '☠️ 已死亡';
        }
      }
    });
  }

  // ★ 按分数排序
  G.leaderboard.sort(function(a, b) { return b.score - a.score; });

  // ★ 更新排名
  G.leaderboard.forEach(function(r, i) { r.rank = i + 1; });
}

// ★ 获取玩家当前排名
function getPlayerRank() {
  if (!G.leaderboard) return 999;
  var userEntry = G.leaderboard.find(function(r) { return r.tag === 'User'; });
  return userEntry ? userEntry.rank : 999;
}

// ★ 获取排行榜前N名
function getTopRankers(n) {
  if (!G.leaderboard) return [];
  return G.leaderboard.slice(0, n || 20);
}

// ★ 获取玩家附近的排名（上下各2名）
function getNearbyRankers() {
  if (!G.leaderboard) return [];
  var userEntry = G.leaderboard.find(function(r) { return r.tag === 'User'; });
  if (!userEntry) return [];

  var userIdx = G.leaderboard.indexOf(userEntry);
  var start = Math.max(0, userIdx - 2);
  var end = Math.min(G.leaderboard.length, userIdx + 3);
  return G.leaderboard.slice(start, end);
}

// ==================== 开场流程 ====================

function closeIntroAndStart() {
  var overlay = document.getElementById('introOverlay');
  overlay.classList.add('hidden');
  setTimeout(function() {
    overlay.style.display = 'none';
    if (loadGame() && G.factionDrawn) {
      enterWorld();
    } else {
      document.getElementById('factionDrawOverlay').classList.add('show');
    }
  }, 500);
}

function resetAllData() {
  if (!confirm('确定要清除所有存档数据吗？\n\n这将删除你的所有进度、道具、通讯录、碎片等，无法恢复！')) return;
  if (!confirm('真的确定吗？这个操作不可撤销！')) return;
  localStorage.removeItem('paleCorridor_save');
  localStorage.removeItem('paleCorridor_cycle');
  localStorage.removeItem('pale_corridor_reputation');
  localStorage.removeItem('pale_corridor_commissions');
  location.reload();
}
