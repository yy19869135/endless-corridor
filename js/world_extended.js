var WORLD_FLOORS = {
  1: { name: '第一层·地表', label: '地表', color: '#cc3333' },
  2: { name: '第二层·居住', label: '居住', color: '#cc8833' },
  3: { name: '第三层·深渊', label: '深渊', color: '#8833cc' }
};
var currentFloor = 1;

WORLD_LOCATIONS = {
  //   第一层·地表  
  'world_hub': {
    name: '中央广场',
    icon: '🏛️',
    region: '中央区',
    floor: 1,
    image: 'https://cdn.mujian.me/tuchuang/69944f895acac.png',
    description: '苍白回廊的中心。巨大的石碑矗立在广场中央，上面刻着不断变化的文字。四通八达的道路延伸向各个区域。',
    connections: ['world_board', 'world_teleport', 'world_bureau'],
    directionMap: { east: 'world_board', south: 'world_teleport', west: 'world_bureau' },
    onEnter: function() {
      addMessage('narrator', '广场上人来人往——如果那些半透明的身影也算"人"的话。石碑上的文字闪烁着，似乎在记录着什么。');
    }
  },
  'world_bureau': {
    name: '管理局',
    icon: '🏢',
    region: '中央区',
    floor: 1,
    image: 'https://cdn.mujian.me/tuchuang/69945220065a7.png',
    description: '回廊系统的行政机构。可以查询信誉、举报违规行为、领取补偿。',
    connections: ['world_hub'],
    directionMap: { east: 'world_hub' },
    onEnter: function() {
      addMessage('narrator', '管理局的大门上方悬挂着一只巨大的眼睛标志。里面的工作人员都是没有面孔的人形。');
      var rep = getReputationLevel();
      addMessage('system', '📊 当前信誉：' + rep.name + '（' + REPUTATION_SYSTEM.score + '分）');
    },
    specialAction: { label: '📊 查看信誉', action: 'showReputationPanel()' }
  },
  'world_board': {
    name: '任务板',
    icon: '📋',
    region: '中央区',
    floor: 1,
    image: 'https://cdn.mujian.me/tuchuang/6994546aec452.png',
    description: '一块巨大的石板上贴满了各种委托和悬赏。旁边有一个自助终端可以发布委托。',
    connections: ['world_hub'],
    directionMap: { west: 'world_hub' },
    onEnter: function() {
      addMessage('system', '你来到了任务板前。上面贴满了各种委托...');
      addMessage('narrator', '有NPC发布的委托，也可以自己发布让别人帮忙。');
    },
    specialAction: { label: '📋 委托任务板', action: 'showCommissionPanel()' }
  },
  'world_teleport': {
    name: '传送大厅',
    icon: '🌀',
    region: '中央区',
    floor: 1,
    image: 'https://cdn.mujian.me/tuchuang/699455abf39f5.png',
    description: '巨大的圆形大厅，地面刻满了传送阵法。从这里可以快速前往各个区域。',
    connections: ['world_hub', 'world_market_entrance', 'world_residential', 'world_gate'],
    directionMap: { north: 'world_hub', east: 'world_market_entrance', west: 'world_residential', south: 'world_gate' },
    onEnter: function() {
      addMessage('narrator', '传送阵法在脚下微微发光。这里是回廊的交通枢纽，可以快速到达各个区域。');
    }
  },
  'world_market_entrance': {
    name: '商业街入口',
    icon: '🏪',
    region: '商业区',
    floor: 1,
    image: 'https://cdn.mujian.me/tuchuang/699456a682ab5.png',
    description: '热闹的商业街入口，两侧是各种摊位和店铺。空气中弥漫着奇异的香料味。',
    connections: ['world_teleport', 'world_auction'],
    directionMap: { west: 'world_teleport', south: 'world_auction' },
    onEnter: function() {
      addMessage('narrator', '商业街上人声鼎沸。各种奇异的商品在摊位上闪闪发光。');
      var rep = getReputationLevel();
      if (rep.id === 'infamous' && Math.random() < 0.3) {
        setTimeout(function() {
          addMessage('horror', '你注意到几个黑衣人在暗处盯着你...');
          addMessage('system', '⚠️ 信誉过低，有人在跟踪你。');
          updateSAN(G.san - 3);
        }, 3000);
      }
    }
  },
  'world_market': {
    name: '黑市',
    icon: '🏴',
    region: '商业区',
    floor: 1,
    image: 'https://cdn.mujian.me/tuchuang/6994582ce54af.jpg',
    description: '阴暗的角落里，灰烬在贩卖各种奇异物品。价格公道，但从不讲价。',
    connections: ['world_auction'],
    directionMap: { west: 'world_auction' },
    onEnter: function() {
      addMessage('system', '你来到了黑市。灰烬向你点了点头。');
      addMessage('narrator', '🧥 灰烬："买还是不买？"');
    },
    specialAction: { label: '🏪 打开商店', action: 'toggleSystemPhone();renderSystemApp("market")' }
  },
  'world_auction': {
    name: '拍卖行',
    icon: '🔨',
    region: '商业区',
    floor: 1,
    image: 'https://cdn.mujian.me/tuchuang/69945a56b130e.png',
    description: '一个圆形的拍卖大厅，定期举行稀有物品的拍卖。',
    connections: ['world_market_entrance', 'world_market', 'world_cafe'],
    directionMap: { north: 'world_market_entrance', east: 'world_market', west: 'world_cafe' },
    onEnter: function() {
      addMessage('narrator', '拍卖行今天似乎没有拍卖会。但展示柜中陈列着一些令人垂涎的物品。');
      addMessage('system', '（拍卖功能开发中...）');
    }
  },
  'world_cafe': {
    name: '迷雾咖啡馆',
    icon: '☕',
    region: '商业区',
    floor: 1,
    image: 'https://cdn.mujian.me/tuchuang/69945b9062e00.png',
    description: '雾姬经营的咖啡馆。温暖的灯光和咖啡香气让人暂时忘记恐惧。',
    connections: ['world_auction'],
    directionMap: { east: 'world_auction' },
    onEnter: function() {
      addMessage('narrator', '推开门，咖啡的香气扑面而来。雾姬站在吧台后面，微笑着看向你。');
      addMessage('narrator', '☕ 雾姬："欢迎回来。今天想喝点什么？"');
      if (G.san < G.maxSan) {
        var recover = Math.min(8, G.maxSan - G.san);
        updateSAN(G.san + recover);
        addMessage('system', '🧠 咖啡馆的氛围让你放松了。SAN +' + recover);
      }
    }
  },

  //   第二层·居住  
  'world_residential': {
    name: '居住区入口',
    icon: '🏘️',
    region: '生活区',
    floor: 2,
    image: 'https://cdn.mujian.me/tuchuang/69945c3fd4d67.png',
    description: '回廊中相对安宁的区域。这里有简陋但安全的住所。',
    connections: ['world_teleport', 'world_rest_area', 'world_archive', 'world_training'],
    directionMap: { south: 'world_training', west: 'world_rest_area', east: 'world_archive', north: 'world_teleport' },
    onEnter: function() {
      addMessage('narrator', '居住区的雾气比别处稀薄。偶尔能看到其他参与者在这里休息。');
      addMessage('system', '💡 点击「🌀 传送大厅」可返回一楼。');
    }
  },
  'world_rest_area': {
    name: '休息区',
    icon: '🛏️',
    region: '生活区',
    floor: 2,
    image: 'https://cdn.mujian.me/tuchuang/69945dffb363b.png',
    description: '一片相对安宁的区域。你可以在这里恢复状态。',
    connections: ['world_residential', 'world_garden'],
    directionMap: { east: 'world_residential', south: 'world_garden' },
    onEnter: function() {
      addMessage('system', '你来到了休息区。这里的空气比别处清新一些。');
      if (G.san < G.maxSan) {
        var sanRecover = Math.min(10, G.maxSan - G.san);
        updateSAN(G.san + sanRecover);
        addMessage('system', '🧠 SAN恢复了' + sanRecover + '点。');
      }
      if (G.hp < G.maxHp) {
        var hpRecover = Math.min(2, G.maxHp - G.hp);
        updateHP(G.hp + hpRecover);
        addMessage('system', '❤️ HP恢复了' + hpRecover + '点。');
      }
    }
  },
  'world_archive': {
    name: '档案馆',
    icon: '📚',
    region: '生活区',
    floor: 2,
    image: 'https://cdn.mujian.me/tuchuang/69945f0cd517a.png',
    description: '书虫管理的档案馆。这里收藏着关于回廊的一切记录。',
    connections: ['world_residential'],
    directionMap: { west: 'world_residential' },
    onEnter: function() {
      addMessage('narrator', '档案馆里弥漫着旧书的气味。书虫坐在角落里，身体边缘的书页在微微翻动。');
      addMessage('narrator', '📚 书虫递过一张纸条："...需要查什么？"');
    }
  },
  'world_garden': {
    name: '灰烬花园',
    icon: '🌿',
    region: '生活区',
    floor: 2,
    image: 'https://cdn.mujian.me/tuchuang/69945fd6519b4.png',
    description: '一片种满了奇异植物的花园。这些植物从副本废墟中生长出来，散发着微弱的光芒。',
    connections: ['world_rest_area', 'world_training'],
    directionMap: { north: 'world_rest_area', east: 'world_training' },
    onEnter: function() {
      addMessage('narrator', '花园里的植物散发着柔和的光芒。有些花朵在你靠近时会轻轻摇曳，像是在打招呼。');
      if (Math.random() < 0.25) {
        addMessage('system', '🌿 你在花丛中发现了一束灵草！');
        addPermanentItem({
          id: 'herb_bundle_found',
          name: '灵草束',
          icon: '🌿',
          desc: '在灰烬花园中采集的灵草',
          stackable: true, consumable: false
        });
        changeReputation(1, '花园采集');
      }
    }
  },
  'world_training': {
    name: '训练场入口',
    icon: '⚔️',
    region: '战斗区',
    floor: 2,
    image: 'https://cdn.mujian.me/tuchuang/699460df4ba03.png',
    description: '回廊中的战斗训练区域。可以在这里磨练技能。',
    connections: ['world_residential', 'world_garden'],
    directionMap: { north: 'world_residential', west: 'world_garden' },
    onEnter: function() {
      addMessage('narrator', '训练场上传来金属碰撞的声音。几个参与者正在进行模拟战斗。');
    }
  },
  
  //   第三层·深渊  
  'world_gate': {
    name: '副本入口',
    icon: '🚪',
    region: '深渊区',
    floor: 3,
    image: 'https://cdn.mujian.me/tuchuang/699461fc9de90.png',
    description: '无数扇门悬浮在虚空中，每扇门后都是一个不同的世界。',
    connections: ['world_teleport', 'world_abyss_entrance'],
    directionMap: { north: 'world_teleport', east: 'world_abyss_entrance' },
    onEnter: function() {
      addMessage('system', '你来到了副本入口。无数扇门在你面前展开...');
      addMessage('narrator', '选择一扇门，踏入未知的恐惧之中。');
      checkRetaliationEvents();
    },
    specialAction: { label: '🚪 选择副本', action: 'showDungeonSelect()' }
  },
  'world_abyss_entrance': {
    name: '深渊',
    icon: '🕳️',
    region: '深渊区',
    floor: 3,
    image: 'https://cdn.mujian.me/tuchuang/699462c14e0ce.png',
    description: '回廊的边缘地带。脚下是无尽的深渊，偶尔能听到来自深处的低语。',
    connections: ['world_gate'],
    directionMap: { west: 'world_gate' },
    onEnter: function() {
      addMessage('horror', '你来到了回廊的边缘。脚下的深渊散发着令人不安的气息...');
      updateSAN(G.san - 3);
      addMessage('system', '🧠 SAN -3');
      if (G.san < 30) {
        setTimeout(function() {
          addMessage('horror', '深渊中传来一个声音："...下来...和我们一起..."');
          updateSAN(G.san - 5);
        }, 4000);
      }
    }
  }
};

// 更新大世界地图布局（按楼层）
var FLOOR_MAP_LAYOUTS = {
  1: {
    'world_hub':              { x: 52, y: 10 },
    'world_bureau':           { x: 8, y: 10 },
    'world_board':            { x: 96, y: 10 },
    'world_teleport':         { x: 52, y: 50 },
    'world_market_entrance':  { x: 96, y: 50 },
    'world_market':           { x: 96, y: 90 },
    'world_auction':          { x: 52, y: 90 },
    'world_cafe':             { x: 8, y: 90 }
  },
  2: {
    'world_residential':      { x: 52, y: 10 },
    'world_rest_area':        { x: 8, y: 10 },
    'world_archive':          { x: 96, y: 10 },
    'world_garden':           { x: 8, y: 60 },
    'world_training':         { x: 52, y: 60 }
  },
  3: {
    'world_gate':             { x: 25, y: 40 },
    'world_abyss_entrance':   { x: 80, y: 40 }
  }
};

var FLOOR_MAP_PATHS = {
  1: [
    { x: 28, y: 18, w: 24, h: 2, dir: 'h' },
    { x: 72, y: 18, w: 24, h: 2, dir: 'h' },
    { x: 65, y: 22, w: 2, h: 28, dir: 'v' },
    { x: 72, y: 58, w: 24, h: 2, dir: 'h' },
    { x: 109, y: 62, w: 2, h: 28, dir: 'v' },
    { x: 72, y: 98, w: 24, h: 2, dir: 'h' },
    { x: 28, y: 98, w: 24, h: 2, dir: 'h' }
  ],
  2: [
    { x: 28, y: 18, w: 24, h: 2, dir: 'h' },
    { x: 72, y: 18, w: 24, h: 2, dir: 'h' },
    { x: 21, y: 22, w: 2, h: 38, dir: 'v' },
    { x: 65, y: 22, w: 2, h: 38, dir: 'v' }
  ],
  3: [
    { x: 45, y: 48, w: 35, h: 2, dir: 'h' }
  ]
};

WORLD_MAP_LAYOUT = FLOOR_MAP_LAYOUTS[1];
WORLD_MAP_PATHS = FLOOR_MAP_PATHS[1];

//   信誉面板  

function showReputationPanel() {
  var panel = document.getElementById('dungeonSelectPanel');
  var rep = getReputationLevel();
  var html = '';

  html += '<div style="text-align:center;font-size:16px;color:#e0b0b0;margin-bottom:12px;border-bottom:1px solid #3a1515;padding-bottom:8px">📊 信誉档案</div>';

  // 当前信誉
  html += '<div style="text-align:center;margin:16px 0">';
  html += '<div style="font-size:24px;margin-bottom:4px">' + rep.name + '</div>';
  html += '<div style="font-size:32px;color:#e0b0b0;font-weight:bold">' + REPUTATION_SYSTEM.score + '</div>';
  html += '<div style="font-size:11px;color:#888;margin-top:4px">' + rep.desc + '</div>';
  html += '</div>';

  // 信誉条
  html += '<div style="margin:12px 0">';
  html += '<div style="display:flex;justify-content:space-between;font-size:9px;color:#666;margin-bottom:2px"><span>💀 0</span><span>⚠️ 30</span><span>✅ 60</span><span>🌟 90</span><span>100</span></div>';
  html += '<div style="width:100%;height:8px;background:#1a0a0a;border-radius:4px;overflow:hidden;border:1px solid #3a1515">';
  var barColor = rep.id === 'legendary' ? '#ffd700' : (rep.id === 'good' ? '#88ff88' : (rep.id === 'suspicious' ? '#ff8800' : '#ff4444'));
  html += '<div style="width:' + REPUTATION_SYSTEM.score + '%;height:100%;background:' + barColor + ';border-radius:4px;transition:width 0.5s"></div>';
  html += '</div></div>';

  // 等级效果
  html += '<div style="font-size:11px;color:#b57a7a;margin:12px 0 6px">当前效果</div>';
  html += '<div class="dungeon-card">';
  html += '<div style="font-size:11px;color:#999;line-height:2">';
  html += '🏪 商店价格：' + (rep.shopDiscount === 1.0 ? '正常' : (rep.shopDiscount < 1 ? '打' + Math.round(rep.shopDiscount * 10) + '折' : '涨价' + Math.round((rep.shopDiscount - 1) * 100) + '%')) + '<br>';
  html += '📋 委托奖励倍率：x' + rep.commissionBonus + '<br>';
  if (rep.id === 'infamous') html += '⚠️ NPC拒绝合作<br>⚠️ 随机遭遇追杀事件<br>';
  if (rep.id === 'suspicious') html += '⚠️ 高价委托不可用<br>';
  if (rep.id === 'legendary') html += '✨ NPC抢着接你的委托<br>✨ 接单速度翻倍<br>';
  html += '</div></div>';

  // 最近变动
  if (REPUTATION_SYSTEM.history.length > 0) {
    html += '<div style="font-size:11px;color:#b57a7a;margin:12px 0 6px">最近变动</div>';
    var recent = REPUTATION_SYSTEM.history.slice(-8).reverse();
    recent.forEach(function(h) {
      var color = h.amount > 0 ? '#88ff88' : '#ff4444';
      var sign = h.amount > 0 ? '+' : '';
      html += '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:10px;border-bottom:1px solid #1a0a0a">';
      html += '<span style="color:#888">' + h.reason + '</span>';
      html += '<span style="color:' + color + '">' + sign + h.amount + '</span>';
      html += '</div>';
    });
  }

  // 恢复提示
  if (REPUTATION_SYSTEM.score < 60) {
    html += '<div style="margin-top:12px;padding:8px;background:rgba(139,0,0,0.1);border:1px solid #3a1515;border-radius:6px;font-size:10px;color:#999;line-height:1.8">';
    html += '💡 恢复信誉的方法：<br>';
    html += '• 按时完成委托 +3<br>';
    html += '• 帮助NPC随机事件 +5<br>';
    html += '• 每5分钟自然恢复 +1（上限75）<br>';
    html += '• 在神龛祈祷 +1';
    html += '</div>';
  }

  html += '<button class="settlement-btn secondary" style="margin-top:12px" onclick="closeDungeonSelect()">返回</button>';
  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
}

//   集成到现有系统  

// 覆盖 enterWorld，加入信誉恢复和委托按钮
// 在第四部分，找到 enterWorld 的覆盖，修改首次副本触发条件
var _prevEnterWorld = enterWorld;
enterWorld = function() {
  _prevEnterWorld();
  if (typeof checkReputationRecovery === 'function') checkReputationRecovery();
  
  if (G.completedDungeons.length === 0 && !G.inDungeon && !G._firstDungeonTriggered) {
    G._firstDungeonTriggered = true;
    saveGame();
    setTimeout(function() {
      addMessage('system', '═══════════════════');
      addMessage('horror', '回廊系统的声音响起——');
      addMessage('narrator', '"欢迎来到苍白回廊，新的参与者。你的第一次试炼即将开始。"');
      addMessage('system', '═══════════════════');
      
      setTimeout(function() {
        // ★ 固定第一个强制副本为「沉默学园」
        var firstDungeon = DUNGEON_LIST.find(function(d) {
          return d.id === 'gen_04';
        });
        // 兜底：如果找不到 gen_04，回退到第一个副本
        if (!firstDungeon) firstDungeon = DUNGEON_LIST[0];
        var participants = generateDungeonParticipants(firstDungeon, true);
        showDungeonIntroPage(firstDungeon, participants, true);
      }, 3000);
    }, 2000);
    return;
  }
};

// 覆盖 moveToWorldLocation，更新快捷按钮
var _prevMoveToWorldLocation = moveToWorldLocation;
moveToWorldLocation = function(locId, isInit) {
  _prevMoveToWorldLocation(locId, isInit);

  // 根据地点更新快捷按钮
  var loc = WORLD_LOCATIONS[locId];
  var container = document.getElementById('quickActions');
  if (!container) return;

  container.innerHTML = '';

  // 地点专属功能按钮
  var locButtons = getLocationButtons(locId);
  locButtons.forEach(function(btn) {
    var safeAction = btn.action.replace(/"/g, '&quot;');
    container.innerHTML += '<button class="action-btn' + (btn.primary ? ' primary' : '') + '" onclick="' + safeAction + '">' + btn.label + '</button>';
  });
};

// 每个地点的专属按钮配置
function getLocationButtons(locId) {
  var buttons = [];
  switch(locId) {
    case 'world_hub':
      buttons.push({ label: '🚪 副本入口', action: 'moveToWorldLocation(\'world_gate\',false)', primary: true });
      buttons.push({ label: '📋 委托', action: 'showCommissionPanel()', primary: false });
      buttons.push({ label: '📱 系统', action: 'toggleSystemPhone()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_gate':
      buttons.push({ label: '🚪 进入下一个副本', action: 'autoEnterNextDungeon()', primary: true });
      buttons.push({ label: '🌀 传送大厅', action: 'moveToWorldLocation(\'world_teleport\',false)', primary: false });
      buttons.push({ label: '📱 系统', action: 'toggleSystemPhone()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_board':
      buttons.push({ label: '📋 委托任务板', action: 'showCommissionPanel()', primary: true });
      buttons.push({ label: '📊 查看信誉', action: 'showReputationPanel()', primary: false });
      buttons.push({ label: '📱 系统', action: 'toggleSystemPhone()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_bureau':
      buttons.push({ label: '📊 查看信誉', action: 'showReputationPanel()', primary: true });
      buttons.push({ label: '📋 委托', action: 'showCommissionPanel()', primary: false });
      buttons.push({ label: '📱 系统', action: 'toggleSystemPhone()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_teleport':
      buttons.push({ label: '🌀 快速传送', action: 'showTeleportPanel()', primary: true });
      buttons.push({ label: '📱 系统', action: 'toggleSystemPhone()', primary: false });
      buttons.push({ label: '📋 委托', action: 'showCommissionPanel()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_market_entrance':
      buttons.push({ label: '🏴 进入黑市', action: 'moveToWorldLocation(\'world_market\',false)', primary: true });
      buttons.push({ label: '🔨 拍卖行', action: 'moveToWorldLocation(\'world_auction\',false)', primary: false });
      buttons.push({ label: '☕ 咖啡馆', action: 'moveToWorldLocation(\'world_cafe\',false)', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_market':
      buttons.push({ label: '🏪 打开商店', action: 'toggleSystemPhone();renderSystemApp(\'market\')', primary: true });
      buttons.push({ label: '📋 委托', action: 'showCommissionPanel()', primary: false });
      buttons.push({ label: '📱 系统', action: 'toggleSystemPhone()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_auction':
      buttons.push({ label: '🔨 查看拍卖', action: 'addMessage(\'system\',\'拍卖功能开发中...\')', primary: true });
      buttons.push({ label: '🏪 黑市', action: 'moveToWorldLocation(\'world_market\',false)', primary: false });
      buttons.push({ label: '📱 系统', action: 'toggleSystemPhone()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_cafe':
      buttons.push({ label: '☕ 点一杯咖啡', action: 'orderCoffee()', primary: true });
      buttons.push({ label: '💬 和雾姬聊天', action: 'chatWithFogLady()', primary: false });
      buttons.push({ label: '📱 系统', action: 'toggleSystemPhone()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_residential':
      buttons.push({ label: '🌀 传送大厅', action: 'moveToWorldLocation(\'world_teleport\',false)', primary: true });
      buttons.push({ label: '🛏️ 休息区', action: 'moveToWorldLocation(\'world_rest_area\',false)', primary: false });
      buttons.push({ label: '📚 档案馆', action: 'moveToWorldLocation(\'world_archive\',false)', primary: false });
      buttons.push({ label: '🌿 花园', action: 'moveToWorldLocation(\'world_garden\',false)', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_rest_area':
      buttons.push({ label: '🛏️ 休息恢复', action: 'doRest()', primary: true });
      buttons.push({ label: '🌀 传送大厅', action: 'moveToWorldLocation(\'world_teleport\',false)', primary: false });
      buttons.push({ label: '📋 委托', action: 'showCommissionPanel()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_archive':
      buttons.push({ label: '📚 查阅档案', action: 'searchArchive()', primary: true });
      buttons.push({ label: '🌀 传送大厅', action: 'moveToWorldLocation(\'world_teleport\',false)', primary: false });
      buttons.push({ label: '💬 找书虫', action: 'chatWithBookworm()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_garden':
      buttons.push({ label: '🌿 采集草药', action: 'gatherHerbs()', primary: true });
      buttons.push({ label: '🌀 传送大厅', action: 'moveToWorldLocation(\'world_teleport\',false)', primary: false });
      buttons.push({ label: '👀 观察植物', action: 'observePlants()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_training':
      buttons.push({ label: '⚔️ 开始训练', action: 'doTraining()', primary: true });
      buttons.push({ label: '🌀 传送大厅', action: 'moveToWorldLocation(\'world_teleport\',false)', primary: false });
      buttons.push({ label: '📋 委托', action: 'showCommissionPanel()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    case 'world_abyss_entrance':
      buttons.push({ label: '🕳️ 凝视深渊', action: 'gazeAbyss()', primary: true });
      buttons.push({ label: '🌀 传送大厅', action: 'moveToWorldLocation(\'world_teleport\',false)', primary: false });
      buttons.push({ label: '🚪 副本入口', action: 'moveToWorldLocation(\'world_gate\',false)', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
    default:
      buttons.push({ label: '🚪 副本', action: 'showDungeonSelect()', primary: true });
      buttons.push({ label: '📋 委托', action: 'showCommissionPanel()', primary: false });
      buttons.push({ label: '📱 系统', action: 'toggleSystemPhone()', primary: false });
      buttons.push({ label: '🎒 背包', action: 'toggleInventory()', primary: false });
      break;
  }
  return buttons;
}

//   地点专属功能实现  

// 传送面板
function showTeleportPanel() {
  var panel = document.getElementById('dungeonSelectPanel');
  var html = '<div style="text-align:center;font-size:16px;color:#e0b0b0;margin-bottom:12px;border-bottom:1px solid #3a1515;padding-bottom:8px">🌀 快速传送</div>';
  var regions = {};
  Object.keys(WORLD_LOCATIONS).forEach(function(lid) {
    var loc = WORLD_LOCATIONS[lid];
    var region = loc.region || '未知';
    if (!regions[region]) regions[region] = [];
    regions[region].push({ id: lid, name: loc.name, icon: loc.icon });
  });
  Object.keys(regions).forEach(function(region) {
    html += '<div style="font-size:11px;color:#b57a7a;margin:10px 0 4px;border-bottom:1px solid #2a1010;padding-bottom:2px">' + region + '</div>';
    regions[region].forEach(function(loc) {
      var isCurrent = loc.id === G.worldLocation;
      html += '<div class="dungeon-card" style="padding:10px;' + (isCurrent ? 'border-color:#cc3333;opacity:0.5' : 'cursor:pointer') + '" onclick="' + (isCurrent ? '' : 'closeDungeonSelect();moveToWorldLocation(\\\'' + loc.id + '\\\',false)') + '">';
      html += '<span style="font-size:14px">' + loc.icon + '</span> ' + loc.name;
      if (isCurrent) html += ' <span style="font-size:10px;color:#cc3333">（当前位置）</span>';
      html += '</div>';
    });
  });
  html += '<button class="settlement-btn secondary" style="margin-top:12px" onclick="closeDungeonSelect()">返回</button>';
  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
}

// 咖啡馆：点咖啡
function orderCoffee() {
  if (G.san >= G.maxSan) {
    addMessage('narrator', '☕ 雾姬："你看起来状态不错嘛，不需要咖啡了。"');
    return;
  }
  var recover = Math.min(15, G.maxSan - G.san);
  updateSAN(G.san + recover);
  addMessage('narrator', '☕ 雾姬递给你一杯温热的特调咖啡。淡淡的花香让你的心绪平静下来。');
  addMessage('system', '🧠 SAN +' + recover);
  showNotification('☕ SAN +' + recover, 'clue');
}

// 咖啡馆：和雾姬聊天
function chatWithFogLady() {
  var chats = [
    '☕ 雾姬一边擦杯子一边说："最近深渊那边不太平...你别往那边跑。"',
    '☕ 雾姬："有个客人上次来点了杯咖啡，喝完就消失了。杯子还在，人没了。"',
    '☕ 雾姬低声说："管理局的人最近来得很频繁...他们在找什么东西。"',
    '☕ 雾姬："你知道吗？这里的咖啡豆是从副本废墟里长出来的。"',
    '☕ 雾姬看着窗外："雾又浓了...每次雾变浓的时候，就会有人失踪。"',
    '☕ 雾姬微笑着："你是我今天第一个客人...也许也是最后一个。"'
  ];
  addMessage('narrator', chats[Math.floor(Math.random() * chats.length)]);
}

// 休息区：休息
function doRest() {
  var hpRecover = Math.min(3, G.maxHp - G.hp);
  var sanRecover = Math.min(15, G.maxSan - G.san);
  if (hpRecover <= 0 && sanRecover <= 0) {
    addMessage('system', '你已经是满状态了，不需要休息。');
    return;
  }
  updateHP(G.hp + hpRecover);
  updateSAN(G.san + sanRecover);
  addMessage('narrator', '你躺在简陋但干净的床上，闭上眼睛。黑暗中，你感到身体在慢慢恢复...');
  if (hpRecover > 0) addMessage('system', '❤️ HP +' + hpRecover);
  if (sanRecover > 0) addMessage('system', '🧠 SAN +' + sanRecover);
  showNotification('🛏️ 休息完毕', 'clue');
}

// 档案馆：查阅
function searchArchive() {
  var findings = [
    '📚 你在一本旧日记中发现："第七层之后就没有回头路了。不要相信那个穿白衣的人。"',
    '📚 一张泛黄的地图从书架上掉落。上面标注了一个你从未见过的区域。',
    '📚 你翻到一份名单，上面列着所有"永久失踪者"的名字。最后一个被涂掉了。',
    '📚 一本关于回廊起源的书，但关键页面被撕掉了。',
    '📚 你发现了一份副本攻略笔记，但字迹越到后面越潦草，最后变成了"救命"。',
    '📚 档案显示：回廊系统已运行超过10000个循环。'
  ];
  addMessage('narrator', findings[Math.floor(Math.random() * findings.length)]);
  if (Math.random() < 0.3) {
    showNotification('🔍 发现有用信息', 'clue');
  }
}

// 档案馆：找书虫
function chatWithBookworm() {
  var lines = [
    '📚 书虫递过一张纸条："...推荐阅读《回廊编年史》第七章。"',
    '📚 书虫突然开口："你...你知道第一批参与者是谁吗？"然后又沉默了。',
    '📚 书虫指了指一个书架角落，那里有一本发光的书。',
    '📚 书虫的眼镜反射出奇怪的文字，你凑近看...它缩了回去。'
  ];
  addMessage('narrator', lines[Math.floor(Math.random() * lines.length)]);
}

// 花园：采集
function gatherHerbs() {
  if (Math.random() < 0.6) {
    addPermanentItem({
      id: 'herb_bundle_' + Date.now(),
      name: '灵草束',
      icon: '🌿',
      desc: '在灰烬花园中采集的灵草',
      stackable: true, consumable: false
    });
    addMessage('system', '🌿 你采集到了一束灵草！');
    showNotification('🌿 获得灵草束', 'clue');
  } else if (Math.random() < 0.3) {
    addMessage('horror', '你伸手去摘一朵花，它突然缠住了你的手腕！你挣脱了，但留下了伤痕。');
    updateHP(G.hp - 1);
    addMessage('system', '❤️ HP -1');
  } else {
    addMessage('narrator', '你在花丛中寻找了一会儿，但没有找到有用的草药。');
  }
}

// 花园：观察
function observePlants() {
  var obs = [
    '🌿 一朵黑色的花在你注视下缓缓绽放，花心中有一只微小的眼睛。',
    '🌿 这些植物似乎会对声音做出反应。你轻声说话时，它们的叶子在微微颤动。',
    '🌿 你发现有些植物的根系延伸到地下很深的地方...它们在吸取什么？',
    '🌿 一株藤蔓上挂着一个小小的铃铛，风一吹就发出清脆的声响。'
  ];
  addMessage('narrator', obs[Math.floor(Math.random() * obs.length)]);
}

// 训练场：训练
function doTraining() {
  var panel = document.getElementById('dungeonSelectPanel');
  var html = '<div style="text-align:center;font-size:16px;color:#e0b0b0;margin-bottom:12px;border-bottom:1px solid #3a1515;padding-bottom:8px">⚔️ 战斗训练</div>';
  html += '<div class="dungeon-card" onclick="doTrainAction(\'basic\');closeDungeonSelect()">';
  html += '<div class="dungeon-card-title">🗡️ 基础训练</div>';
  html += '<div class="dungeon-card-desc">消耗少量体力，提升战斗经验。</div>';
  html += '<div class="dungeon-card-meta">消耗：❤️ HP -1 | 奖励：💎 5-15碎片</div>';
  html += '</div>';
  html += '<div class="dungeon-card" onclick="doTrainAction(\'hard\');closeDungeonSelect()">';
  html += '<div class="dungeon-card-title">⚔️ 高强度训练</div>';
  html += '<div class="dungeon-card-desc">消耗较多体力，但奖励更丰厚。</div>';
  html += '<div class="dungeon-card-meta">消耗：❤️ HP -2 🧠 SAN -5 | 奖励：💎 20-50碎片</div>';
  html += '</div>';
  html += '<div class="dungeon-card" onclick="doTrainAction(\'spar\');closeDungeonSelect()">';
  html += '<div class="dungeon-card-title">🤺 切磋对决</div>';
  html += '<div class="dungeon-card-desc">与其他参与者切磋，胜负各半。</div>';
  html += '<div class="dungeon-card-meta">消耗：❤️ HP -1 | 奖励：胜利 💎 30-60碎片</div>';
  html += '</div>';
  html += '<button class="settlement-btn secondary" style="margin-top:12px" onclick="closeDungeonSelect()">返回</button>';
  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
}

function doTrainAction(type) {
  switch(type) {
    case 'basic':
      if (G.hp <= 1) { addMessage('system', '你太虚弱了，无法训练。'); return; }
      updateHP(G.hp - 1);
      var reward1 = Math.floor(Math.random() * 11) + 5;
      G.soulFragments += reward1;
      updateFragmentDisplay();
      addMessage('narrator', '⚔️ 你完成了一组基础训练。虽然身体有些疲惫，但感觉更强了。');
      addMessage('system', '❤️ HP -1 | 💎 +' + reward1);
      break;
    case 'hard':
      if (G.hp <= 2) { addMessage('system', '你太虚弱了，无法进行高强度训练。'); return; }
      updateHP(G.hp - 2);
      updateSAN(G.san - 5);
      var reward2 = Math.floor(Math.random() * 31) + 20;
      G.soulFragments += reward2;
      updateFragmentDisplay();
      addMessage('narrator', '⚔️ 高强度训练结束。你浑身酸痛，但收获颇丰。');
      addMessage('system', '❤️ HP -2 🧠 SAN -5 | 💎 +' + reward2);
      break;
    case 'spar':
      if (G.hp <= 1) { addMessage('system', '你太虚弱了，无法切磋。'); return; }
      updateHP(G.hp - 1);
      if (Math.random() < 0.5) {
        var reward3 = Math.floor(Math.random() * 31) + 30;
        G.soulFragments += reward3;
        updateFragmentDisplay();
        addMessage('narrator', '🤺 你赢了！对手心服口服。');
        addMessage('system', '❤️ HP -1 | 💎 +' + reward3);
        changeReputation(2, '切磋获胜');
      } else {
        addMessage('narrator', '🤺 你输了...不过从失败中也学到了东西。');
        addMessage('system', '❤️ HP -1');
      }
      break;
  }
}

// 铁匠工坊
function openForge() {
  var panel = document.getElementById('dungeonSelectPanel');
  var html = '<div style="text-align:center;font-size:16px;color:#e0b0b0;margin-bottom:12px;border-bottom:1px solid #3a1515;padding-bottom:8px">🔨 铁匠工坊</div>';
  html += '<div style="font-size:11px;color:#888;margin-bottom:10px;text-align:center">🔨 铁匠老爹："想打点什么，小鬼？"</div>';
  html += '<div class="dungeon-card" onclick="forgeItem(\'weapon\');closeDungeonSelect()">';
  html += '<div class="dungeon-card-title">🗡️ 打造武器</div>';
  html += '<div class="dungeon-card-meta">💎 100碎片 | 获得随机武器</div>';
  html += '</div>';
  html += '<div class="dungeon-card" onclick="forgeItem(\'armor\');closeDungeonSelect()">';
  html += '<div class="dungeon-card-title">🛡️ 打造防具</div>';
  html += '<div class="dungeon-card-meta">💎 80碎片 | 获得随机防具</div>';
  html += '</div>';
  html += '<div class="dungeon-card" onclick="forgeItem(\'potion\');closeDungeonSelect()">';
  html += '<div class="dungeon-card-title">🧪 炼制药剂</div>';
  html += '<div class="dungeon-card-meta">💎 50碎片 | 获得恢复药剂</div>';
  html += '</div>';
  html += '<button class="settlement-btn secondary" style="margin-top:12px" onclick="closeDungeonSelect()">返回</button>';
  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
}

function forgeItem(type) {
  var cost = type === 'weapon' ? 100 : (type === 'armor' ? 80 : 50);
  if (G.soulFragments < cost) { showNotification('碎片不足', 'horror'); return; }
  G.soulFragments -= cost;
  updateFragmentDisplay();
  var items = {
    weapon: [
      { name: '锈铁剑', icon: '🗡️', desc: '铁匠打造的基础武器' },
      { name: '骨刃', icon: '🦴', desc: '用怨灵骨骼锻造的匕首' },
      { name: '灵银刀', icon: '🔪', desc: '对灵体有额外伤害' }
    ],
    armor: [
      { name: '皮甲', icon: '🧥', desc: '基础防护装备' },
      { name: '符文护腕', icon: '⌚', desc: '刻有防护符文的护腕' },
      { name: '暗影斗篷', icon: '🧣', desc: '降低被怨灵发现的概率' }
    ],
    potion: [
      { name: '血色药剂', icon: '🧪', desc: '恢复3HP' },
      { name: '安神香', icon: '🕯️', desc: '恢复20SAN' },
      { name: '强化药水', icon: '⚗️', desc: '临时提升战斗能力' }
    ]
  };
  var pool = items[type];
  var got = pool[Math.floor(Math.random() * pool.length)];
  addPermanentItem({
    id: type + '_' + Date.now(),
    name: got.name,
    icon: got.icon,
    desc: got.desc,
    stackable: true,
    consumable: type === 'potion'
  });
  addMessage('narrator', '🔨 铁匠老爹抡起锤子，叮叮当当一阵敲打...');
  addMessage('system', '获得：' + got.icon + ' ' + got.name);
  addMessage('narrator', '🔨 "拿好了，小鬼！"');
  showNotification(got.icon + ' ' + got.name, 'clue');
}

// 铁匠聊天
function chatWithBlacksmith() {
  var lines = [
    '🔨 铁匠老爹："这把锤子跟了我三百年了。在这个鬼地方，时间没什么意义。"',
    '🔨 铁匠老爹："你要是能弄到深渊之心，我能给你打一把好武器。"',
    '🔨 铁匠老爹："上次有个小子拿了把诅咒武器来让我修，结果武器自己动了..."',
    '🔨 铁匠老爹看了看你的装备："就这？...算了，年轻人嘛，慢慢来。"',
    '🔨 铁匠老爹："我以前有个徒弟...他进了一个副本就再也没回来。"'
  ];
  addMessage('narrator', lines[Math.floor(Math.random() * lines.length)]);
}

// 深渊：凝视
function gazeAbyss() {
  addMessage('horror', '你站在深渊边缘，向下凝视...');
  updateSAN(G.san - 5);
  addMessage('system', '🧠 SAN -5');
  if (Math.random() < 0.2) {
    var bonus = Math.floor(Math.random() * 50) + 30;
    G.soulFragments += bonus;
    updateFragmentDisplay();
    addMessage('system', '🌀 深渊中飘出了 💎' + bonus + ' 碎片...');
    showNotification('🌀 深渊馈赠 +' + bonus + '💎', 'clue');
  } else {
    addMessage('horror', '深渊回望了你。你感到一阵眩晕...');
  }
}

// 神龛：祈祷
function prayAtShrine() {
  if (Math.random() < 0.6) {
    var sanRecover = Math.floor(Math.random() * 10) + 5;
    updateSAN(G.san + sanRecover);
    addMessage('narrator', '⛩️ 你在神龛前虔诚祈祷。一股温暖的力量流过你的身体。');
    addMessage('system', '🧠 SAN +' + sanRecover);
    changeReputation(1, '神龛祈祷');
    showNotification('🙏 祈祷成功', 'clue');
  } else {
    updateSAN(G.san - 8);
    addMessage('horror', '⛩️ 神龛中传来不属于这个世界的低语...你不该来这里。');
    addMessage('system', '🧠 SAN -8');
    showNotification('⚠️ 祈祷失败', 'horror');
  }
}

// 神龛：献祭
function offerAtShrine() {
  if (G.permanentItems.length === 0) {
    addMessage('system', '你没有可以献祭的物品。');
    return;
  }
  var item = G.permanentItems[0];
  var panel = document.getElementById('dungeonSelectPanel');
  var html = '<div style="text-align:center;font-size:16px;color:#e0b0b0;margin-bottom:12px;border-bottom:1px solid #3a1515;padding-bottom:8px">🕯️ 献祭物品</div>';
  html += '<div style="font-size:11px;color:#888;margin-bottom:10px;text-align:center">选择一件物品献给神龛，可能获得祝福或诅咒。</div>';
  G.permanentItems.forEach(function(item, idx) {
    html += '<div class="dungeon-card" style="padding:10px;cursor:pointer" onclick="doOffer(' + idx + ');closeDungeonSelect()">';
    html += item.icon + ' ' + item.name + (item.count > 1 ? ' x' + item.count : '');
    html += '</div>';
  });
  html += '<button class="settlement-btn secondary" style="margin-top:12px" onclick="closeDungeonSelect()">取消</button>';
  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
}

function doOffer(idx) {
  if (idx < 0 || idx >= G.permanentItems.length) return;
  var item = G.permanentItems[idx];
  var itemName = item.name;
  removePermanentItem(item.id);
  addMessage('narrator', '⛩️ 你将 ' + itemName + ' 放在神龛前。它在紫色火焰中化为灰烬...');
  if (Math.random() < 0.7) {
    var reward = Math.floor(Math.random() * 80) + 40;
    G.soulFragments += reward;
    updateFragmentDisplay();
    updateSAN(G.san + 10);
    addMessage('system', '✨ 神龛接受了你的献祭！💎 +' + reward + ' 🧠 SAN +10');
    showNotification('✨ 献祭成功！', 'clue');
  } else {
    updateSAN(G.san - 15);
    addMessage('horror', '⛩️ 神龛拒绝了你的献祭...一股邪恶的力量反噬了你。');
    addMessage('system', '🧠 SAN -15');
    showNotification('💀 献祭被拒绝', 'horror');
  }
}

// 虚空：探索
function exploreVoid() {
  updateSAN(G.san - 10);
  addMessage('horror', '🌀 你伸手触碰虚空裂隙...空间在你周围扭曲...');
  addMessage('system', '🧠 SAN -10');
  var roll = Math.random();
  if (roll < 0.15) {
    var voidItemPool = [
      { name: '时间碎片', icon: '⏳', desc: '凝固的时间结晶' },
      { name: '虚空精华', icon: '🌀', desc: '来自虚空的纯粹能量' },
      { name: '梦蝶', icon: '🦋', desc: '能进入他人梦境的蝴蝶' }
    ];
    var got = voidItemPool[Math.floor(Math.random() * voidItemPool.length)];
    addPermanentItem({
      id: 'void_' + Date.now(),
      name: got.name,
      icon: got.icon,
      desc: got.desc,
      stackable: true, consumable: false
    });
    addMessage('system', '🌟 虚空中飘出了稀有物品：' + got.icon + ' ' + got.name + '！');
    showNotification('🌟 获得稀有物品！', 'clue');
  } else if (roll < 0.5) {
    var fragments = Math.floor(Math.random() * 60) + 20;
    G.soulFragments += fragments;
    updateFragmentDisplay();
    addMessage('system', '🌀 虚空中散落出 💎' + fragments + ' 碎片。');
  } else {
    addMessage('horror', '虚空中什么也没有...只有无尽的黑暗和你自己的倒影。那个倒影在对你微笑。');
  }
}

// 虚空：窥视
function peekVoid() {
  updateSAN(G.san - 3);
  var visions = [
    '🌀 裂隙中闪过一个画面：另一个你正在和某人并肩作战。那个你...笑着。',
    '🌀 你看到了一个没有雾的世界。阳光照在一座普通的城市上。那是...回廊之外？',
    '🌀 裂隙中传来你自己的声音："不要打开第七扇门。"',
    '🌀 你看到了一个全是白色的空间。一个穿白衣的人背对着你。他缓缓转头——裂隙关闭了。',
    '🌀 裂隙中飘出一张纸条："如果你读到这个，说明循环还没有结束。"',
    '🌀 你看到无数个自己在不同的副本中战斗、逃跑、死亡...这是平行世界？'
  ];
  addMessage('horror', visions[Math.floor(Math.random() * visions.length)]);
  addMessage('system', '🧠 SAN -3');
}

// 覆盖 enterDungeon，加入追杀检查和委托物品注入
var _prevEnterDungeon = enterDungeon;
enterDungeon = function(dungeonConfig) {
  _prevEnterDungeon(dungeonConfig);
  // 自动生成副本道具
  generateDungeonItems(dungeonConfig);
  // 检查追杀事件
  setTimeout(function() { checkRetaliationEvents(); }, 8000);
  // 注入委托物品到副本房间
  injectCommissionItems(dungeonConfig);
};

// 道具自动生成系统
function generateDungeonItems(dungeon) {
  if (!dungeon || !dungeon.rooms) return;
  
  var diffLevel = getDungeonDifficulty(dungeon);
  var theme = DUNGEON_THEMES[dungeon.theme] || { name: '通用', icons: ['📦'], objects: ['未知物品'] };
  
  // 根据难度决定道具数量和品质
  var itemCount = 3 + diffLevel; // 难度1=4个，难度5=8个道具
  var hasRare = diffLevel >= 2;
  var hasEpic = diffLevel >= 4;
  var hasLegendary = diffLevel >= 5;
  
  // 道具模板
  var itemTemplates = {
    medical: [
      { name: '破旧绷带', icon: '🩹', desc: '恢复少量HP，HP+2', usable: true },
      { name: '生锈手术刀', icon: '🔪', desc: '可能有些用处', usable: false },
      { name: '血色药剂', icon: '🧪', desc: '恢复HP，HP+3', usable: true },
      { name: '急救包', icon: '🩹', desc: '恢复HP，HP+5', usable: true }
    ],
    light: [
      { name: '蜡烛', icon: '🕯️', desc: '提供短暂照明', usable: false },
      { name: '手电筒', icon: '🔦', desc: '照亮黑暗区域', usable: false },
      { name: '火柴', icon: '🔥', desc: '点燃后照亮，一次性', usable: true }
    ],
    key: [
      { name: '铜钥匙', icon: '🗝️', desc: '打开某扇锁着的门', usable: false },
      { name: '生锈铁钥匙', icon: '🔑', desc: '满是锈迹的钥匙', usable: false },
      { name: '电子门卡', icon: '💳', desc: '刷卡开启电子锁', usable: false },
      { name: '密码纸', icon: '📝', desc: '记录着一串数字', usable: false }
    ],
    charm: [
      { name: '破碎护身符', icon: '📿', desc: '提供微弱的保护', usable: true },
      { name: '十字架', icon: '✝️', desc: '对某些东西有威慑力', usable: false },
      { name: '圣水瓶', icon: '⛲', desc: '净化一次诅咒', usable: true },
      { name: '玉佩', icon: '🔘', desc: '不知来历的玉佩', usable: false }
    ],
    special: [
      { name: '录音笔', icon: '📼', desc: '记录了什么', usable: false },
      { name: '照片', icon: '📷', desc: '模糊的照片', usable: false },
      { name: '日记本', icon: '📔', desc: '残缺的日记', usable: false }
    ]
  };
  
  // 高级道具（可带出）
  var rareItems = [
    { name: '灵魂罗盘', icon: '🧭', desc: '显示隐藏房间方向，可带出', canTakeOut: true, usable: true },
    { name: '替身娃娃', icon: '🪆', desc: '死亡时复活，保留3HP，可带出', canTakeOut: true, consumable: true },
    { name: '时空怀表', icon: '⏰', desc: '每副本可回溯5秒一次，可带出', canTakeOut: true, usable: true },
    { name: '破法护符', icon: '🛡️', desc: 'SAN下降速度-20%，可带出', canTakeOut: true }
  ];
  
  // 初始化itemEffects
  if (!dungeon.itemEffects) dungeon.itemEffects = {};
  
  // 获取所有房间ID（排除起始房间）
  var roomIds = Object.keys(dungeon.rooms).filter(function(id) { return id !== dungeon.startRoom; });
  
  // 生成普通道具
  var categories = ['medical', 'light', 'key', 'charm', 'special'];
  for (var i = 0; i < itemCount; i++) {
    if (roomIds.length === 0) break;
    var cat = categories[i % categories.length];
    var templates = itemTemplates[cat] || itemTemplates.special;
    var tpl = templates[Math.floor(Math.random() * templates.length)];
    var targetRoom = roomIds[Math.floor(Math.random() * roomIds.length)];
    
    var itemId = 'gen_item_' + dungeon.id + '_' + i;
    dungeon.itemEffects[itemId] = {
      name: tpl.name,
      icon: tpl.icon,
      desc: tpl.desc,
      usable: tpl.usable || false,
      canTakeOut: false,
      consumable: cat === 'light' || cat === 'medical',
      message: '你发现了 ' + tpl.icon + ' ' + tpl.name + '：' + tpl.desc
    };
    
    // 注入到房间
    var room = dungeon.rooms[targetRoom];
    if (!room.keywords) room.keywords = {};
    room.keywords[tpl.name] = {
      message: dungeon.itemEffects[itemId].message,
      addItem: { id: itemId, name: tpl.name, icon: tpl.icon, desc: tpl.desc, usable: tpl.usable, canTakeOut: false, consumable: tpl.consumable }
    };
  }
  
  // 难度2+：有概率生成精良道具
  if (hasRare && Math.random() < 0.3) {
    var rareTpl = rareItems[Math.floor(Math.random() * 2)]; // 只取前两个（灵魂罗盘、替身娃娃）
    var rareRoom = roomIds[Math.floor(Math.random() * roomIds.length)];
    var rareId = 'rare_item_' + dungeon.id;
    dungeon.itemEffects[rareId] = {
      name: rareTpl.name,
      icon: rareTpl.icon,
      desc: rareTpl.desc,
      usable: true,
      canTakeOut: true,
      consumable: rareTpl.consumable || false,
      message: '你发现了珍贵的 ' + rareTpl.icon + ' ' + rareTpl.name + '！'
    };
    if (dungeon.rooms[rareRoom]) {
      if (!dungeon.rooms[rareRoom].keywords) dungeon.rooms[rareRoom].keywords = {};
      dungeon.rooms[rareRoom].keywords[rareTpl.name] = {
        message: dungeon.itemEffects[rareId].message,
        addItem: { id: rareId, name: rareTpl.name, icon: rareTpl.icon, desc: rareTpl.desc, usable: true, canTakeOut: true }
      };
    }
  }
  
  // 难度4+：小概率史诗道具
  if (hasEpic && Math.random() < 0.2) {
    var epicTpl = rareItems[2]; // 时空怀表
    var epicRoom = roomIds[Math.floor(Math.random() * roomIds.length)];
    var epicId = 'epic_item_' + dungeon.id;
    dungeon.itemEffects[epicId] = {
      name: epicTpl.name,
      icon: epicTpl.icon,
      desc: epicTpl.desc,
      usable: true,
      canTakeOut: true,
      consumable: false,
      message: '⚠️ 你感受到强大的力量...' + epicTpl.desc
    };
    // 高级道具放在危险房间（带恐怖事件的房间）
    var dangerRooms = Object.keys(dungeon.rooms).filter(function(rid) {
      return dungeon.rooms[rid].events && dungeon.rooms[rid].events.length > 0;
    });
    if (dangerRooms.length > 0) {
      epicRoom = dangerRooms[Math.floor(Math.random() * dangerRooms.length)];
    }
    if (dungeon.rooms[epicRoom]) {
      if (!dungeon.rooms[epicRoom].keywords) dungeon.rooms[epicRoom].keywords = {};
      dungeon.rooms[epicRoom].keywords[epicTpl.name] = {
        message: dungeon.itemEffects[epicId].message,
        horror: '当你触碰到它时，周围的空间开始扭曲...SAN-10',
        sanChange: -10,
        addItem: { id: epicId, name: epicTpl.name, icon: epicTpl.icon, desc: epicTpl.desc, usable: true, canTakeOut: true }
      };
    }
  }
  
  // 难度5：极小概率传说道具
  if (hasLegendary && Math.random() < 0.1) {
    var legTpl = { name: '虚空凝视者', icon: '👁️', desc: '透视所有隐藏线索和房间，可带出', canTakeOut: true, usable: true };
    var legRoom = roomIds[Math.floor(Math.random() * roomIds.length)];
    var legId = 'legend_item_' + dungeon.id;
    dungeon.itemEffects[legId] = {
      name: legTpl.name,
      icon: legTpl.icon,
      desc: legTpl.desc,
      usable: true,
      canTakeOut: true,
      consumable: false,
      message: '🌟 传说级物品！' + legTpl.desc
    };
    if (dungeon.rooms[legRoom]) {
      if (!dungeon.rooms[legRoom].keywords) dungeon.rooms[legRoom].keywords = {};
      dungeon.rooms[legRoom].keywords[legTpl.name] = {
        message: dungeon.itemEffects[legId].message,
        horror: '虚空在注视着你...SAN-15',
        sanChange: -15,
        addItem: { id: legId, name: legTpl.name, icon: legTpl.icon, desc: legTpl.desc, usable: true, canTakeOut: true }
      };
    }
  }
}

// 在副本房间中注入委托物品
function injectCommissionItems(dungeonConfig) {
  if (!dungeonConfig || !dungeonConfig.rooms) return;

  var activeComms = COMMISSION_SYSTEM.npcCommissions.filter(function(c) {
    return c.accepted && !c.completed && !c.failed;
  });

  if (activeComms.length === 0) return;

  var roomIds = Object.keys(dungeonConfig.rooms);
  if (roomIds.length < 2) return;

  activeComms.forEach(function(comm) {
    // 在随机房间中放置委托物品
    var targetIdx = Math.floor(Math.random() * (roomIds.length - 1)) + 1;
    var targetRoom = dungeonConfig.rooms[roomIds[targetIdx]];
    if (!targetRoom) return;

    if (!targetRoom.keywords) targetRoom.keywords = {};
    if (!targetRoom.specialActions) targetRoom.specialActions = [];

    // 添加关键词触发
    targetRoom.keywords[comm.itemName] = {
      message: '你发现了 ' + comm.itemIcon + ' ' + comm.itemName + '！这正是委托需要的物品。',
      messageType: 'system'
    };

    // 添加特殊行动
    targetRoom.specialActions.push({
      id: 'pickup_comm_' + comm.id,
      icon: comm.itemIcon,
      label: '拾取' + comm.itemName,
      message: '你捡起了 ' + comm.itemIcon + ' ' + comm.itemName + '。',
      removeAfterUse: true
    });

    // 在调查行动中也能发现
    var origAction = targetRoom.actions ? targetRoom.actions['调查'] : null;
    targetRoom.actions = targetRoom.actions || {};
    targetRoom.actions['调查'] = {
      message: (typeof origAction === 'string' ? origAction : (origAction && origAction.message ? origAction.message : '你仔细调查了周围。')) + '\n\n你还发现了 ' + comm.itemIcon + ' ' + comm.itemName + '！',
      once: true
    };

    // 修改房间描述提示
    var origDesc = targetRoom.description || '';
    targetRoom.description = origDesc + ' 角落里似乎有什么东西在发光...';

    // 绑定拾取后触发委托选择
    var origSpecialAction = targetRoom.specialActions[targetRoom.specialActions.length - 1];
    var origOnClick = 'doSpecialAction(\'pickup_comm_' + comm.id + '\')';
    // 用事件注入方式：进入房间后延迟提示
    if (!targetRoom.events) targetRoom.events = [];
    targetRoom.events.push({
      id: 'comm_item_hint_' + comm.id,
      trigger: 'enter',
      once: true,
      delay: 2000,
      action: function() {
        addMessage('system', '💡 你注意到这个房间里有 ' + comm.itemIcon + ' ' + comm.itemName + ' 的踪迹...');
      }
    });
  });
}

// 覆盖 doSpecialAction，加入委托物品拾取逻辑
var _prevDoSpecialAction = doSpecialAction;
doSpecialAction = function(actionId) {
  // 检查是否是委托物品拾取
  if (actionId && actionId.indexOf('pickup_comm_') === 0) {
    var commId = actionId.replace('pickup_comm_', '');
    var comm = COMMISSION_SYSTEM.npcCommissions.find(function(c) { return c.id === commId; });
    if (comm && comm.accepted && !comm.completed && !comm.failed) {
      checkCommissionItemFound(comm.itemId);
      return;
    }
  }
  // 调用原始逻辑
  if (_prevDoSpecialAction) _prevDoSpecialAction(actionId);
}

//   自动事件触发系统  

var AUTO_EVENT_REGISTRY = {};
var AUTO_EVENT_COOLDOWNS = {};

function registerAutoEvent(locationId, eventConfig) {
  if (!AUTO_EVENT_REGISTRY[locationId]) AUTO_EVENT_REGISTRY[locationId] = [];
  AUTO_EVENT_REGISTRY[locationId].push(eventConfig);
}

function triggerAutoEvents(locationId) {
  var events = AUTO_EVENT_REGISTRY[locationId];
  if (!events || events.length === 0) return;

  events.forEach(function(evt) {
    // 冷却检查
    var cooldownKey = locationId + '_' + evt.id;
    var now = Date.now();
    if (AUTO_EVENT_COOLDOWNS[cooldownKey] && now - AUTO_EVENT_COOLDOWNS[cooldownKey] < (evt.cooldown || 60000)) return;

    // 概率检查
    if (evt.chance && Math.random() > evt.chance) return;

    // 条件检查
    if (evt.condition && !evt.condition()) return;

    // 触发
    AUTO_EVENT_COOLDOWNS[cooldownKey] = now;
    if (evt.delay) {
      setTimeout(function() { evt.action(); }, evt.delay);
    } else {
      evt.action();
    }
  });
}

// 将自动事件触发集成到移动系统
var _prevMoveToWorldLocation2 = moveToWorldLocation;
moveToWorldLocation = function(locId, isInit) {
  _prevMoveToWorldLocation2(locId, isInit);
  if (!isInit) {
    triggerAutoEvents(locId);
  }
};

//   注册自动事件  

// 中央广场 - 随机NPC搭话
registerAutoEvent('world_hub', {
  id: 'hub_npc_chat',
  chance: 0.3,
  cooldown: 120000,
  delay: 3000,
  action: function() {
    var npcs = [
      { icon: '👤', name: '路过的参与者', line: '"你也是新来的？...小心点，这里没有看上去那么安全。"' },
      { icon: '👻', name: '半透明的身影', line: '"...你能看到我？...已经很久没人注意到我了..."' },
      { icon: '🧥', name: '黑衣人', line: '"想买点好东西吗？黑市那边有你想要的。"' },
      { icon: '👧', name: '迷路的女孩', line: '"请问...你知道出口在哪里吗？我已经在这里走了好久好久..."' }
    ];
    var npc = npcs[Math.floor(Math.random() * npcs.length)];
    addMessage('narrator', npc.icon + ' ' + npc.name + '：' + npc.line);
  }
});

// 商业街 - 小偷事件
registerAutoEvent('world_market_entrance', {
  id: 'market_thief',
  chance: 0.15,
  cooldown: 300000,
  delay: 5000,
  condition: function() { return G.soulFragments > 50; },
  action: function() {
    var stolen = Math.floor(Math.random() * 20) + 10;
    stolen = Math.min(stolen, G.soulFragments);
    addMessage('horror', '⚠️ 一个黑影从你身边掠过！');
    addMessage('system', '你的口袋轻了一些...丢失了 💎' + stolen + ' 碎片！');
    G.soulFragments -= stolen;
    updateFragmentDisplay();
    showNotification('⚠️ 被偷了 ' + stolen + ' 碎片！', 'horror');

    // 追回选项
    setTimeout(function() {
      addMessage('system', '你看到小偷往黑市方向跑了。要追吗？');
      var container = document.getElementById('quickActions');
      if (container) {
        var btn = document.createElement('button');
        btn.className = 'action-btn primary';
        btn.textContent = '🏃 追小偷';
        btn.onclick = function() {
          btn.remove();
          if (Math.random() < 0.6) {
            G.soulFragments += stolen;
            updateFragmentDisplay();
            addMessage('system', '✅ 你追上了小偷，夺回了 💎' + stolen + ' 碎片！');
            changeReputation(2, '抓住小偷');
          } else {
            addMessage('system', '❌ 小偷消失在人群中...碎片追不回来了。');
            updateSAN(G.san - 3);
          }
        };
        container.appendChild(btn);
      }
    }, 2000);
  }
});

// 深渊边缘 - 低语事件
registerAutoEvent('world_abyss_entrance', {
  id: 'abyss_whisper',
  chance: 0.5,
  cooldown: 180000,
  delay: 6000,
  action: function() {
    var whispers = [
      '"...回来...回来...你属于这里..."',
      '"...第' + (Math.floor(Math.random() * 999) + 1) + '次循环...还是没有人能逃出去..."',
      '"...不要相信管理局...他们也是囚徒..."',
      '"...你的名字...我记得你的名字...上一个循环你也来过这里..."',
      '"...灵魂碎片...不过是锁链的碎片...你以为那是货币？..."'
    ];
    addMessage('horror', '深渊中传来低语：' + whispers[Math.floor(Math.random() * whispers.length)]);
    updateSAN(G.san - 2);
  }
});

// 灰烬花园 - 奇异植物事件
registerAutoEvent('world_garden', {
  id: 'garden_plant',
  chance: 0.35,
  cooldown: 180000,
  delay: 4000,
  action: function() {
    var events = [
      function() {
        addMessage('narrator', '一朵黑色的花突然绽放，释放出一阵甜腻的香气。');
        addMessage('system', '🌸 你感到精神一振。SAN +3');
        updateSAN(G.san + 3);
      },
      function() {
        addMessage('narrator', '一株藤蔓突然缠上了你的脚踝！你挣脱了，但留下了一道红痕。');
        addMessage('system', '❤️ HP -1');
        updateHP(G.hp - 1);
      },
      function() {
        addMessage('narrator', '你发现一颗发光的果实挂在枝头。');
        addPermanentItem({
          id: 'glowing_fruit_' + Date.now(),
          name: '发光果实',
          icon: '🍎',
          desc: '散发微光的奇异果实，食用后恢复少量SAN',
          stackable: true, consumable: true
        });
        addMessage('system', '获得：🍎 发光果实');
      }
    ];
    events[Math.floor(Math.random() * events.length)]();
  }
});

// 迷雾咖啡馆 - 雾姬闲聊
registerAutoEvent('world_cafe', {
  id: 'cafe_chat',
  chance: 0.4,
  cooldown: 120000,
  delay: 5000,
  action: function() {
    var chats = [
      '☕ 雾姬一边擦杯子一边说："听说最近深渊那边不太平...你别往那边跑。"',
      '☕ 雾姬："有个客人上次来点了杯咖啡，喝完就消失了。杯子还在，人没了。"',
      '☕ 雾姬低声说："管理局的人最近来得很频繁...他们在找什么东西。"',
      '☕ 雾姬："你知道吗？这里的咖啡豆是从副本废墟里长出来的。味道不错，就是偶尔会让人做奇怪的梦。"',
      '☕ 雾姬看着窗外："雾又浓了...每次雾变浓的时候，就会有人失踪。"'
    ];
    addMessage('narrator', chats[Math.floor(Math.random() * chats.length)]);
  }
});

// 档案馆 - 发现线索
registerAutoEvent('world_archive', {
  id: 'archive_clue',
  chance: 0.25,
  cooldown: 300000,
  delay: 4000,
  action: function() {
    var clues = [
      { text: '你在一本旧日记中发现了一段话："第七层之后就没有回头路了。不要相信那个穿白衣的人。"', type: 'clue' },
      { text: '一张泛黄的地图从书架上掉落。上面标注了一个你从未见过的区域——"记忆回廊"。', type: 'clue' },
      { text: '你翻到一份名单，上面列着所有"永久失踪者"的名字。最后一个名字...被涂掉了。', type: 'horror' },
      { text: '书虫递给你一张纸条："第一批参与者中，有人找到了出口。但他选择留下来。"', type: 'narrator' }
    ];
    var clue = clues[Math.floor(Math.random() * clues.length)];
    addMessage(clue.type === 'clue' ? 'system' : clue.type, (clue.type === 'clue' ? '🔍 ' : '') + clue.text);
    if (clue.type === 'clue') showNotification('🔍 发现线索', 'clue');
  }
});

// 训练场 - 随机切磋
registerAutoEvent('world_training', {
  id: 'training_spar',
  chance: 0.3,
  cooldown: 240000,
  delay: 3000,
  action: function() {
    addMessage('narrator', '⚔️ 一个参与者向你发起了切磋邀请。');
    var container = document.getElementById('quickActions');
    if (container) {
      var btn = document.createElement('button');
      btn.className = 'action-btn primary';
      btn.textContent = '⚔️ 接受切磋';
      btn.onclick = function() {
        btn.remove();
        var win = Math.random() < 0.5;
        if (win) {
          var reward = Math.floor(Math.random() * 30) + 20;
          addMessage('system', '⚔️ 你赢了！对方心服口服地递上了 💎' + reward + ' 碎片。');
          G.soulFragments += reward;
          updateFragmentDisplay();
          changeReputation(2, '切磋获胜');
        } else {
          addMessage('system', '⚔️ 你输了...不过也学到了一些东西。');
          updateHP(G.hp - 1);
          addMessage('system', '❤️ HP -1，但获得了战斗经验。');
        }
      };
      container.appendChild(btn);

      var btn2 = document.createElement('button');
      btn2.className = 'action-btn';
      btn2.textContent = '🚫 拒绝';
      btn2.onclick = function() {
        btn.remove();
        btn2.remove();
        addMessage('narrator', '对方耸了耸肩，转身离开了。');
      };
      container.appendChild(btn2);
    }
  }
});

// 无名神龛 - 神秘祝福/诅咒
registerAutoEvent('world_shrine', {
  id: 'shrine_blessing',
  chance: 0.4,
  cooldown: 300000,
  delay: 5000,
  action: function() {
    if (Math.random() < 0.6) {
      // 祝福
      var blessings = [
        function() { updateSAN(G.san + 8); addMessage('system', '✨ 神龛散发出温暖的光芒。SAN +8'); },
        function() { updateHP(G.hp + 2); addMessage('system', '✨ 你感到伤口在愈合。HP +2'); },
        function() {
          var bonus = Math.floor(Math.random() * 30) + 20;
          G.soulFragments += bonus;
          updateFragmentDisplay();
          addMessage('system', '✨ 神龛前出现了 💎' + bonus + ' 碎片。');
        }
      ];
      blessings[Math.floor(Math.random() * blessings.length)]();
    } else {
      // 诅咒
      addMessage('horror', '神龛的蜡烛突然全部熄灭...');
      updateSAN(G.san - 10);
      addMessage('system', '🧠 SAN -10');
      addMessage('horror', '你听到了不该听到的声音。');
    }
  }
});

// 虚空裂隙 - 平行世界碎片
registerAutoEvent('world_void', {
  id: 'void_fragment',
  chance: 0.3,
  cooldown: 300000,
  delay: 8000,
  action: function() {
    var fragments = [
      '裂隙中闪过一个画面：另一个你正在和林夜并肩作战。那个你...笑着。',
      '你看到了一个没有雾的世界。阳光照在一座普通的城市上。那是...回廊之外的世界？',
      '裂隙中传来你自己的声音："不要打开第七扇门。"',
      '你看到了一个全是白色的空间。一个穿白衣的人背对着你站着。他似乎察觉到了你的目光，缓缓转过头——裂隙关闭了。',
      '裂隙中飘出一张纸条："如果你读到这个，说明循环还没有结束。第' + (Math.floor(Math.random() * 99) + 1) + '次了。"'
    ];
    addMessage('horror', '🌀 ' + fragments[Math.floor(Math.random() * fragments.length)]);
    updateSAN(G.san - 3);
  }
});

//   保存/加载集成  

// 扩展加载函数
var _prevLoadGame = typeof loadGame === 'function' ? loadGame : null;

console.log('✅ 第四部分加载完成：信誉系统 + 委托任务系统 + 大世界扩展（5区20地点）+ 自动事件触发');
