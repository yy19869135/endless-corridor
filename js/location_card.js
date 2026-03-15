// 第五部分：地点卡片 + AI自动叙述 + 首次到达系统

// 记录已访问的大世界地点
if (!G.visitedWorldLocations) G.visitedWorldLocations = new Set();

// 地点特性标签
var LOCATION_FEATURES = {
  'world_hub': ['🏛️ 交通枢纽', '📜 信息中心'],
  'world_teleport': ['🌀 快速传送', '🗺️ 全区通达'],
  'world_board': ['📋 委托任务', '💎 赚取碎片'],
  'world_bureau': ['📊 信誉查询', '📢 举报中心'],
  'world_gate': ['🚪 副本入口', '⚠️ 危险区域'],
  'world_market_entrance': ['🏪 商业中心', '⚠️ 小心扒手'],
  'world_market': ['🏴 黑市交易', '💰 不讲价'],
  'world_auction': ['🔨 稀有拍卖', '🔜 开发中'],
  'world_cafe': ['☕ 恢复SAN', '💬 情报交换'],
  'world_residential': ['🏘️ 安全区域', '😌 低威胁'],
  'world_rest_area': ['🛏️ 恢复HP/SAN', '🛡️ 安全休息'],
  'world_archive': ['📚 线索查询', '🔍 世界观'],
  'world_garden': ['🌿 采集草药', '🎲 随机事件'],
  'world_training': ['⚔️ 战斗训练', '💪 切磋'],
  'world_abyss_entrance': ['⚠️ 高危区域', '🧠 SAN消耗'],
  'world_shrine': ['🙏 祈祷', '🎲 祝福/诅咒'],
  'world_void': ['🌀 稀有掉落', '💀 极度危险']
};

function showLocationCard(locId) {
  var loc = WORLD_LOCATIONS[locId];
  if (!loc) return;
  document.getElementById('locCardIcon').textContent = loc.icon || '📍';
  document.getElementById('locCardName').textContent = loc.name;
  document.getElementById('locCardRegion').textContent = loc.region || '苍白回廊';
  document.getElementById('locCardDesc').textContent = loc.description || '';
  var featuresHtml = '';
  var features = LOCATION_FEATURES[locId] || [];
  features.forEach(function(f) {
    featuresHtml += '<span class="loc-card-feature">' + f + '</span>';
  });
  document.getElementById('locCardFeatures').innerHTML = featuresHtml;
  document.getElementById('locationCardOverlay').classList.add('show');
}

function dismissLocationCard() {
  document.getElementById('locationCardOverlay').classList.remove('show');
  if (window._locCardTimer) clearTimeout(window._locCardTimer);
}

async function triggerAutoNarration(locId) {
  var loc = WORLD_LOCATIONS[locId];
  if (!loc) return;
  if (!G.connected || !mujianSdk) return;
  var prompt = '你是「苍白回廊」的叙述者。玩家刚到达「' + loc.name + '」。';
  prompt += '地点描述：' + (loc.description || '') + '。';
  prompt += '玩家状态：HP ' + G.hp + '/' + G.maxHp + '，SAN ' + G.san + '/' + G.maxSan + '。';
  prompt += '碎片：' + G.soulFragments + '。';
  prompt += '\n用1-2句话描述玩家到达时的即时感受和环境细节。要有氛围感，简短有力。不要给建议。';
  try {
    var fullResponse = '';
    stopController = new AbortController();
    await mujianSdk.ai.chat.complete(
      prompt,
      function(res) {
        fullResponse = res.fullContent || '';
        if (res.isFinished && fullResponse) {
          addMessage('ai', fullResponse);
        }
      },
      stopController.signal,
      { parseContent: true }
    );
  } catch(e) {}
}

var _finalMoveToWorldLocation = moveToWorldLocation;
moveToWorldLocation = function(locId, isInit) {
  var isFirstVisit = !G.visitedWorldLocations.has(locId);
  _finalMoveToWorldLocation(locId, isInit);
  G.visitedWorldLocations.add(locId);
  if (isFirstVisit && !(isInit && locId === 'world_hub')) {
    showLocationCard(locId);
    setTimeout(function() {
      triggerAutoNarration(locId);
    }, 1500);
  }
  if (!isFirstVisit && !isInit && Math.random() < 0.2) {
    triggerAutoNarration(locId);
  }
};

console.log('✅ 第五部分加载完成：地点卡片 + AI自动叙述 + 首次到达系统');
