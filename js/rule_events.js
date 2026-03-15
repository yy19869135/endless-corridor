// ============ 沉默学园开场改造：去掉按钮，改为自由输入 ============

DUNGEON_RULES['gen_04'].openingScript = {
  scene: '铁门在你身后轰然关闭。\n\n你站在一所学校的大门前。校名牌匾上写着「沉默学园」四个字，但"沉默"二字是用红色油漆后来涂上去的，原来的名字已经看不清了。\n\n校园里空无一人。操场上的国旗在无风的空气中猎猎作响。教学楼的窗户全部紧闭，窗帘拉得严严实实——除了三楼最右边那扇。那扇窗户开着，窗台上坐着一个穿校服的人影。\n\n你的系统手机震动：「副本开始。存活条件：找到真相。时限：10分钟。」\n\n然后——上课铃响了。刺耳的电子铃声在空旷的校园里回荡。校门口的告示栏上贴着一张泛黄的纸——上面写着校规。\n\n铃声还在响。根据校规第一条：上课铃响后必须在60秒内进入教室。教学楼一楼的教室门开着，走廊深处传来整齐的、不属于活人的脚步声。\n\n你要怎么做？',
  freeInput: true
};

var _original_playOpeningScript = playOpeningScript;
playOpeningScript = function(script) {
  if (!script) return;

  var quickActions = document.getElementById('quickActions');
  if (quickActions) quickActions.innerHTML = '';

  var lines = script.scene.split('\n\n');
  var delay = 0;
  var totalTextDelay = 0;

  lines.forEach(function(line, idx) {
    if (line.trim() === '') return;
    delay += 1500;
    totalTextDelay = delay;
    setTimeout(function() {
      if (line.indexOf('「') >= 0 && (line.indexOf('副本') >= 0 || line.indexOf('存活') >= 0 || line.indexOf('时限') >= 0)) {
        addMessage('system', line);
      } else {
        addMessage('narrator', line);
      }
    }, delay);
  });

  if (script.freeInput) {
    setTimeout(function() {
      G._openingScriptPlaying = false;
      addMessage('system', '═══════════════════');
      addMessage('system', '副本探索开始。自由行动，注意遵守规则。');
      addMessage('system', '💡 提示：直接在输入框打字描述你的行动，也可以摇动摇杆进行移动。');
      addMessage('system', '═══════════════════');
      var room = G.dungeon.rooms[G.currentRoom];
      if (room) {
        updateRoomDisplay(room);
        renderMinimap();
      }
      generateContextActions();
      
      setTimeout(function() {
        checkRuleEvents(G.currentRoom);
      }, 2000);
    }, totalTextDelay + 2000);
  } else if (script.forcedEvent) {
    var eventDelay = totalTextDelay + (script.forcedEvent.delay || 2000);
    setTimeout(function() {
      triggerOpeningEvent(script.forcedEvent);
    }, eventDelay);
  } else {
    setTimeout(function() {
      G._openingScriptPlaying = false;
      var room = G.dungeon.rooms[G.currentRoom];
      if (room) {
        updateRoomDisplay(room);
        renderMinimap();
      }
      generateContextActions();
    }, totalTextDelay + 2000);
  }
};

// ============ 结局故事回顾系统 ============

var _showSettlement_beforeStoryReview = showSettlement;

showSettlement = function(ending) {
  var worldbook = G.dungeon ? DUNGEON_WORLDBOOKS[G.dungeon.id] : null;
  var dungeonName = G.dungeon ? G.dungeon.name : '副本';
  var cluesFoundCopy = G.cluesFound.slice();
  var totalCluesCopy = G.dungeon ? Object.keys(G.dungeon.clues).length : 0;

  _showSettlement_beforeStoryReview(ending);

  if (worldbook && worldbook.storyReview) {
    var panel = document.getElementById('settlementPanel');
    if (panel) {
      var storyBtnDiv = document.createElement('div');
      storyBtnDiv.style.cssText = 'text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid #5a2020';
      storyBtnDiv.innerHTML = '<button class="settlement-btn secondary" style="width:100%;background:rgba(88,50,50,0.6);border:1px solid #8b4444" onclick="showStoryReview()">📖 查看完整故事</button>';
      var btnGroup = panel.querySelector('.settlement-btn-group');
      if (btnGroup) {
        btnGroup.parentNode.insertBefore(storyBtnDiv, btnGroup);
      } else {
        panel.appendChild(storyBtnDiv);
      }
      window._storyReviewData = {
        worldbook: worldbook,
        dungeonName: dungeonName,
        ending: ending,
        cluesFound: cluesFoundCopy,
        totalClues: totalCluesCopy
      };
    }
  }
};

function showStoryReview() {
  var data = window._storyReviewData;
  if (!data || !data.worldbook || !data.worldbook.storyReview) {
    showNotification('没有可回顾的故事', '');
    return;
  }

  var review = data.worldbook.storyReview;

  var overlay = document.createElement('div');
  overlay.id = 'storyReviewOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:10000;overflow-y:auto;display:flex;justify-content:center;padding:20px 0';

  var container = document.createElement('div');
  container.style.cssText = 'max-width:600px;width:90%;padding:20px;color:#c8a8a8';

  var html = '';

  html += '<div style="text-align:center;margin-bottom:30px">';
  html += '<div style="font-size:20px;color:#e0b0b0;font-weight:bold;margin-bottom:8px">' + review.title + '</div>';
  html += '<div style="font-size:11px;color:#666">—— 真相，总会在沉默中浮出水面 ——</div>';
  html += '</div>';

  html += '<div style="background:rgba(139,0,0,0.15);border:1px solid #5a2020;border-radius:8px;padding:16px;margin-bottom:24px">';
  html += '<div style="font-size:13px;color:#ff8888;margin-bottom:8px">📌 你的结局</div>';
  html += '<div style="font-size:15px;color:#e0b0b0;font-weight:bold;margin-bottom:6px">' + (data.ending.title || '未知结局') + '</div>';
  html += '<div style="font-size:12px;color:#a88;line-height:1.8">' + (data.ending.text || '') + '</div>';
  html += '<div style="font-size:10px;color:#666;margin-top:8px">线索收集：' + data.cluesFound.length + '/' + data.totalClues + '</div>';
  html += '</div>';

  html += '<div style="margin-bottom:24px">';
  html += '<div style="font-size:14px;color:#e0b0b0;margin-bottom:16px;text-align:center;letter-spacing:2px">━━━ 完整故事 ━━━</div>';
  review.sections.forEach(function(section) {
    html += '<div style="margin-bottom:20px">';
    html += '<div style="font-size:13px;color:#cc8888;font-weight:bold;margin-bottom:8px;padding-left:8px;border-left:3px solid #8b4444">' + section.heading + '</div>';
    html += '<div style="font-size:12px;color:#a88;line-height:2;text-indent:2em">' + section.text + '</div>';
    html += '</div>';
  });
  html += '</div>';

  html += '<div style="margin-bottom:24px">';
  html += '<div style="font-size:14px;color:#e0b0b0;margin-bottom:16px;text-align:center;letter-spacing:2px">━━━ 规则真相 ━━━</div>';
  review.ruleTruthReveal.forEach(function(item, idx) {
    html += '<div style="background:rgba(20,8,8,0.6);border:1px solid rgba(90,32,32,0.4);border-radius:6px;padding:12px;margin-bottom:10px">';
    html += '<div style="font-size:11px;color:#ff6666;margin-bottom:6px">📜 规则 ' + (idx + 1) + '：「' + item.rule + '」</div>';
    html += '<div style="font-size:12px;color:#88aaff;line-height:1.8">💡 真相：' + item.truth + '</div>';
    html += '</div>';
  });
  html += '</div>';

  if (review.epilogue) {
    html += '<div style="margin-bottom:30px;padding:16px;background:rgba(50,30,30,0.4);border-radius:8px;border:1px solid rgba(90,50,50,0.3)">';
    html += '<div style="font-size:11px;color:#888;margin-bottom:8px;text-align:center">✦ 后记 ✦</div>';
    var epilogueLines = review.epilogue.split('\n\n');
    epilogueLines.forEach(function(line) {
      html += '<div style="font-size:12px;color:#b89898;line-height:2;text-indent:2em;margin-bottom:8px">' + line + '</div>';
    });
    html += '</div>';
  }

  html += '<div style="text-align:center;margin-bottom:40px">';
  html += '<button onclick="closeStoryReview()" style="background:rgba(139,50,50,0.6);border:1px solid #8b4444;color:#e0b0b0;padding:10px 40px;border-radius:6px;font-size:13px;cursor:pointer">关闭故事回顾</button>';
  html += '</div>';

  container.innerHTML = html;
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  overlay.scrollTop = 0;
}

function closeStoryReview() {
  var overlay = document.getElementById('storyReviewOverlay');
  if (overlay) overlay.remove();
}

// ============ 沉默学园专用规则检测 ============

var _original_checkRuleViolation = checkRuleViolation;
checkRuleViolation = function(actionText) {
  if (!G.currentDungeonRules || !G.currentDungeonRules.rules) return null;
  if (!G.inDungeon) return null;

  var violations = [];
  var lowerAction = actionText.toLowerCase();
  var currentRoom = G.currentRoom || '';

  if (G.dungeon && G.dungeon.id === 'gen_04') {
    var rules = G.currentDungeonRules.rules;

    var rule4 = rules.find(function(r) { return r.id === 's4'; });
    if (rule4) {
      var hasSelfStamp = (lowerAction.includes('印章') || lowerAction.includes('盖章')) &&
                         (lowerAction.includes('自己') || lowerAction.includes('我') || lowerAction.includes('手上') || lowerAction.includes('身上') || lowerAction.includes('额头') || lowerAction.includes('脸上'));
      var isOnPhoto = lowerAction.includes('照片') || lowerAction.includes('毕业照') || lowerAction.includes('相片');
      if (hasSelfStamp && !isOnPhoto) {
        violations.push(rule4);
      }
    }

    if (currentRoom === 'corridor') {
      var rule5 = rules.find(function(r) { return r.id === 's5'; });
      if (rule5 && (lowerAction.includes('叫') || lowerAction.includes('喊') || lowerAction.includes('呼唤') || lowerAction.includes('喂') || lowerAction.includes('你好'))) {
        if (lowerAction.includes('女孩') || lowerAction.includes('值日生') || lowerAction.includes('她') || lowerAction.includes('那个人') || lowerAction.includes('同学')) {
          violations.push(rule5);
        }
      }
    }

    return violations.length > 0 ? violations : null;
  }

  return _original_checkRuleViolation(actionText);
};

var _original_applyRuleViolation = applyRuleViolation;
applyRuleViolation = function(rule) {
  if (G.dungeon && G.dungeon.id === 'gen_04') {
    addMessage('horror', '═══ 校规违反 ═══');

    if (rule.id === 's4') {
      addMessage('horror', '你将红色印章按在了自己的手上。印章表面灼热得像烙铁。');
      addMessage('horror', '你感到嘴唇开始不受控制地闭合。一根看不见的针从虚空中出现，银色的线穿过你的上唇，穿过下唇，一针一针地缝合。你想尖叫——但声音已经发不出来了。');
      addMessage('horror', '你的视野模糊了。最后你看到的是教室里那些和你一样嘴唇被缝合的学生。他们的眼中满是泪水——和欢迎。');
    } else if (rule.id === 's5') {
      addMessage('horror', '你的声音在走廊里回荡。女孩的身影僵住了——然后猛地消失了，像是被什么东西拽走了。');
      addMessage('horror', '校园广播突然响起，发出一阵刺耳的尖啸。那个机械般的女声说："走廊里不许喧哗。"噪音像针一样刺入你的大脑。');
    } else {
      addMessage('horror', '你违反了校规：「' + rule.text + '」');
    }

    if (rule.penalty === 'death') {
      addMessage('horror', '💀 违反致死校规。检测保命道具...');
      var reviveItem = G.permanentItems.find(function(item) {
        return item.name.includes('替身') || item.name.includes('复活') || item.name.includes('回溯');
      });
      var dungeonRevive = G.dungeonItems ? G.dungeonItems.find(function(item) {
        return item.name.includes('替身') || item.name.includes('复活');
      }) : null;

      if (reviveItem) {
        removePermanentItem(reviveItem.id);
        addMessage('system', '💫 ' + reviveItem.icon + ' ' + reviveItem.name + '替你承受了封印！道具已消耗。');
        addMessage('narrator', '在最后一刻，一股温暖的力量将你从封印中拉了回来。你的嘴唇上残留着针刺的痛感，但缝合的线消失了。');
        updateHP(Math.max(1, G.hp - 5));
        updateSAN(Math.max(1, G.san - 20));
        showNotification('💫 保命道具生效！', 'clue');
      } else if (dungeonRevive) {
        G.dungeonItems = G.dungeonItems.filter(function(i) { return i !== dungeonRevive; });
        addMessage('system', '💫 ' + dungeonRevive.name + '替你承受了封印！');
        updateHP(Math.max(1, G.hp - 5));
        updateSAN(Math.max(1, G.san - 20));
        showNotification('💫 保命道具生效！', 'clue');
      } else {
        addMessage('horror', '没有什么能救你了。你成为了沉默学园的新成员。永远。');
        updateHP(0);
        showNotification('💀 违反致死校规', 'horror');
      }
    } else if (rule.penalty === 'hp') {
      updateHP(G.hp + rule.amount);
      addMessage('system', '❤️ HP ' + rule.amount);
      showNotification('⚠️ 违反校规 HP' + rule.amount, 'horror');
    } else if (rule.penalty === 'san') {
      updateSAN(G.san + rule.amount);
      addMessage('system', '🧠 SAN ' + rule.amount);
      showNotification('⚠️ 违反校规 SAN' + rule.amount, 'horror');
    }

    addMessage('horror', '═══════════════');
    return;
  }

  _original_applyRuleViolation(rule);
};

console.log('✅ 沉默学园世界书 + 开场改造 + 故事回顾 + 规则优化 加载完成');

// ============================
// ★★★ 规则事件触发系统 v2 - 队列机制 + 防叠加 ★★★
// ============================

// ============ 1. 定义沉默学园的规则事件 ============

var RULE_EVENTS = {};

RULE_EVENTS['gen_04'] = [
  // ---- 规则1：上课铃，校门触发 ----
  {
    id: 'rule_1_bell',
    ruleIndex: 1,
    triggerRoom: 'school_gate',
    triggerType: 'enterRoom',
    triggerCondition: function() {
      return !G._ruleEventTriggered['rule_1_bell'];
    },
    popup: {
      title: '🔔 铃声响起',
      description: '刺耳的上课铃突然在校园里炸响！校门口的广播喇叭疯狂闪烁，墙上的时钟开始倒计时...\n\n⚠️ 你想起校规第1条：\n「上课铃响后必须在60秒内进入教室。迟到的学生会被"处理"。」',
      timeLimit: 12,
      choices: [
        {
          icon: '🏃',
          label: '立刻跑回教室',
          message: '你拔腿狂奔，穿过校门冲进教学楼，跑进教室坐到座位上。铃声停止了。你喘着粗气，感觉身后有什么东西在最后一秒停下了脚步。椅子是温的——刚才有人坐在这里。',
          sanChange: -3,
          hpChange: 0,
          moveToRoom: 'classroom'
        },
        {
          icon: '🚶',
          label: '无视铃声，继续探索',
          message: '你选择无视铃声。倒计时结束的瞬间，校门口的灯全部熄灭。黑暗中传来整齐的脚步声——很多人正在从教学楼方向向你走来。你感到无数冰冷的手抓住了你的校服，将你拖向校园深处...',
          sanChange: -18,
          hpChange: -3,
          horror: true
        },
        {
          icon: '👀',
          label: '躲进校门旁的值班室观察',
          message: '你闪身躲到校门旁废弃的值班室里。透过破碎的窗户，你看到校园里出现了一排穿着校服的身影，他们整齐划一地走向教学楼。最后一个"学生"经过时停了下来，缓缓转头看向值班室——你屏住了呼吸。它的脸上没有五官。过了漫长的几秒，它转回头继续走了。',
          sanChange: -8,
          hpChange: 0
        }
      ]
    }
  },

  // ---- 规则2：第三本乐谱，音乐教室触发 ----
  {
    id: 'rule_2_music',
    ruleIndex: 2,
    triggerRoom: 'music_room',
    triggerType: 'enterRoom',
    triggerCondition: function() {
      return !G._ruleEventTriggered['rule_2_music'];
    },
    delay: 5000,
    popup: {
      title: '🎵 谱架上的乐谱',
      description: '你注意到谱架上不只有一份乐谱——有三本叠在一起。\n\n第一本是《校歌》，第二本是《沉默练习曲》，第三本...封面是空白的，但你的手不自觉地想要翻开它。\n\n⚠️ 校规第2条：\n「不要翻阅音乐教室的第三本乐谱。如果你已经翻了，不要弹奏上面的曲子。如果你已经弹了——跑。」',
      choices: [
        {
          icon: '📖',
          label: '翻开第三本乐谱',
          message: '你翻开了第三本乐谱。上面只有一个音符，无限重复。你的眼睛无法从乐谱上移开——音符开始在纸面上蠕动，像是活的。你听到钢琴自己弹奏起来，就是那一个音符，越来越快，越来越响...',
          sanChange: -15,
          hpChange: 0,
          horror: true,
          followUp: {
            title: '🎹 钢琴在自己弹奏',
            description: '那个音符在你脑海中回荡，钢琴的琴键疯狂跳动。每一次敲击都像是在敲你的颅骨。你还要继续待在这里吗？',
            choices: [
              {
                icon: '🏃',
                label: '跑！',
                message: '你猛地合上乐谱，夺门而出。身后传来钢琴弦断裂的声音，像是某种东西的尖叫。你跑出了音乐教室，大口喘气。耳鸣持续了很久。',
                sanChange: -3,
                hpChange: 0,
                moveToRoom: 'corridor'
              },
              {
                icon: '🎹',
                label: '在钢琴上弹奏那个音符',
                message: '你坐到钢琴前，按下了那个音符。声音响起的瞬间，整间教室的空气凝固了。然后你看到了——墙壁变得透明，你看到每间教室里的"学生"都同时站了起来，转头看向你。钢琴盖猛地砸下来——你的手指剧痛！',
                sanChange: -25,
                hpChange: -5,
                horror: true
              }
            ]
          }
        },
        {
          icon: '🚫',
          label: '遵守校规，不翻第三本',
          message: '你强忍好奇心，将手缩了回来。第三本乐谱的封面上似乎浮现出一行字："下次你会翻的。"然后文字消失了。',
          sanChange: -2,
          hpChange: 0
        },
        {
          icon: '📝',
          label: '只看前两本乐谱',
          message: '你翻看了《校歌》和《沉默练习曲》。校歌的歌词很正常，但如果把每句歌词的第一个字连起来读："救——我——们——出——去"。你的手微微发抖。',
          sanChange: -3,
          hpChange: 0,
          addClue: 'sc4'
        }
      ]
    }
  },

  // ---- 规则3：非6:06的广播，广播室触发 ----
  {
    id: 'rule_3_broadcast',
    ruleIndex: 3,
    triggerRoom: 'broadcast_room',
    triggerType: 'enterRoom',
    triggerCondition: function() {
      return !G._ruleEventTriggered['rule_3_broadcast'];
    },
    delay: 6000,
    popup: {
      title: '📻 不该响起的广播',
      description: '广播设备突然自动启动，扬声器中传出沙沙的电流声，然后是一个孩子的声音在念名字...\n\n⚠️ 校规第3条：\n「广播室的广播只在下午6:06播放。如果你在其他时间听到了广播，那不是广播。」\n\n墙上的时钟停在6:06——但你进来时它不是这个时间。',
      choices: [
        {
          icon: '🔊',
          label: '凑近扬声器仔细听',
          message: '你把耳朵贴近扬声器。声音越来越清晰——它在念你的名字。反复地、不停地念着。然后你感觉到扬声器里有什么东西在呼吸，温热的气息喷在你的耳朵上...你猛地弹开！扬声器的网罩后面，有一只眼睛在看着你。',
          sanChange: -12,
          hpChange: 0,
          horror: true
        },
        {
          icon: '🔇',
          label: '拔掉电源，关掉广播',
          message: '你猛地拔掉了设备的电源线。广播停了。房间陷入寂静。但几秒后，扬声器在没有电源的情况下再次响起——"你...不应该...关掉我..."声音比之前更近了。它不是从扬声器里传来的。它就在你身后。',
          sanChange: -8,
          hpChange: 0,
          horror: true
        },
        {
          icon: '🚪',
          label: '遵守校规，立刻离开',
          message: '你想起校规的警告，转身就走。在你踏出广播室的瞬间，身后传来巨大的撞击声——像是有什么东西从扬声器里挤了出来。你没有回头。门在你身后自己关上了。',
          sanChange: -3,
          hpChange: 0,
          moveToRoom: 'corridor'
        }
      ]
    }
  },

  // ---- 规则4：红色印章，校长室触发 ----
  {
    id: 'rule_4_stamp',
    ruleIndex: 4,
    triggerRoom: 'principal_office',
    triggerType: 'enterRoom',
    triggerCondition: function() {
      return !G._ruleEventTriggered['rule_4_stamp'];
    },
    delay: 8000,
    popup: {
      title: '🔴 印章的诱惑',
      description: '桌上的红色印章突然变得温热，散发出微弱的红光。一个声音在你脑海中低语：\n\n"盖上它...盖在你的手上...你就能看到真相了..."\n\n印章表面的眼睛图案似乎在微微跳动，像是有脉搏。\n\n⚠️ 校规第4条：\n「校长室的红色印章不要盖在自己身上。」🔴致死',
      choices: [
        {
          icon: '✋',
          label: '将印章盖在自己手上',
          message: '你鬼使神差地将印章按在了手背上。\n\n一阵灼烧般的剧痛——眼睛形状的印记烙进了你的皮肤。你的视野开始扭曲，看到了学校的"真实面目"：墙壁是肉做的，地板下有无数只手在蠕动...然后你感到嘴唇开始被缝合。你的意识正在消散。你成为了沉默学园的一部分。',
          sanChange: -50,
          hpChange: -10,
          horror: true,
          triggerDeath: true
        },
        {
          icon: '🚫',
          label: '抵抗诱惑，放下印章',
          message: '你咬紧牙关，将手从印章旁移开。低语声消失了。印章表面的眼睛图案似乎眨了一下——但你告诉自己那只是错觉。你的额头上冒出了冷汗。',
          sanChange: -3,
          hpChange: 0
        },
        {
          icon: '📋',
          label: '将印章盖在桌上的档案上',
          message: '你将印章盖在桌上的一份空白档案上。印记出现后，档案上浮现出文字——是一份学生名单，上面记录着每个"留校生"的名字和他们沉默的日期。名单很长，从三十年前一直排到现在。最后一行是空白的，等待着下一个名字...',
          sanChange: -5,
          hpChange: 0,
          addClue: 'sc3'
        }
      ]
    }
  },

  // ---- 规则5：走廊的女孩 ----
  // ★ 改为停留触发，走廊是过道房间，路过不应该弹窗
  {
    id: 'rule_5_girl',
    ruleIndex: 5,
    triggerRoom: 'corridor',
    triggerType: 'stayInRoom',
    stayTime: 10000,
    triggerCondition: function() {
      return !G._ruleEventTriggered['rule_5_girl'] && G.cluesFound.length >= 3;
    },
    delay: 1000,
    popup: {
      title: '👤 走廊里的身影',
      description: '走廊尽头，你看到一个穿校服的女孩背对着你站着。\n\n她的长发垂到腰际，一动不动，像是一尊雕像。走廊里的温度骤然下降，你呼出的气变成了白雾。\n\n⚠️ 校规第5条：\n「如果你在走廊里看到一个穿校服的女孩背对着你站着，不要叫她。绕路走。」',
      choices: [
        {
          icon: '📢',
          label: '叫她："喂，你好？"',
          message: '你的声音在走廊中回荡。\n\n女孩开始转身——非常缓慢地，像是生锈的机械。你看到她的脸...不，那不是脸。那是一片光滑的、没有五官的皮肤。但"脸"的正中央裂开了一条缝，露出了密密麻麻的、像针一样的牙齿。\n\n她开始向你走来。很快。太快了。',
          sanChange: -20,
          hpChange: -4,
          horror: true
        },
        {
          icon: '🔙',
          label: '遵守校规，悄悄绕路',
          message: '你屏住呼吸，贴着墙壁慢慢后退。你的鞋底在地面上发出轻微的摩擦声——女孩的头微微偏了一下。\n\n你加快脚步，转进了旁边的岔路。身后传来轻微的脚步声...然后停了下来。你回头看——走廊空无一人。但地上多了一行湿漉漉的小脚印。',
          sanChange: -5,
          hpChange: 0
        },
        {
          icon: '✏️',
          label: '用粉笔在地上画一条线',
          message: '你蹲下来，用粉笔在你和她之间画了一条白线。\n\n女孩似乎感应到了什么——她低下头看着那条线。然后她缓缓后退，一步，两步，消失在走廊尽头的阴影中。\n\n粉笔线上出现了一行用水渍写成的字："...谢谢你...没有叫我的名字..."\n\n水渍慢慢干了，但你记住了这些字。',
          sanChange: -2,
          hpChange: 0,
          addClue: 'sc_hidden',
          requireItem: 'chalk'
        }
      ]
    }
  },

  // ---- 规则6/7：档案室暗示，音乐教室触发 ----
  {
    id: 'rule_6_hint',
    ruleIndex: 6,
    triggerRoom: 'music_room',
    triggerType: 'enterRoom',
    triggerCondition: function() {
      return !G._ruleEventTriggered['rule_6_hint'] && G.cluesFound.includes('sc4') && !G._ruleEventTriggered['rule_2_music'];
    },
    delay: 3000,
    popup: {
      title: '💡 乐谱上的数字',
      description: '你再次看向那份《沉默练习曲》的乐谱。音符对应的数字连起来是：6-0-6。\n\n6:06...和墙上时钟停止的时间一样。也和广播的时间一样。\n\n钢琴就在你面前，琴盖是打开的。',
      choices: [
        {
          icon: '🎹',
          label: '在钢琴上弹出6-0-6',
          message: '你在钢琴上按下对应6-0-6的琴键。三个音符在空气中回荡。\n\n钢琴内部发出咔嗒一声——底板弹开了，里面藏着一把钥匙！钥匙上刻着"档案室"三个字。\n\n同时，你听到远处传来一扇门解锁的声音。',
          sanChange: -2,
          hpChange: 0,
          addItem: { id: 'archive_key', name: '档案室钥匙', icon: '🔑', desc: '从钢琴暗格中找到的钥匙，上面刻着"档案室"' }
        },
        {
          icon: '🤔',
          label: '先不弹，记住这个数字',
          message: '你将6-0-6这个数字记在心里。也许之后会用到。钢琴的琴键在你注视下微微颤动，像是在催促你。',
          sanChange: 0,
          hpChange: 0
        }
      ]
    }
  }
];

// ============ 2. 初始化规则事件追踪 ============

var _enterDungeon_ruleEvents = enterDungeon;
enterDungeon = function(config) {
  G._ruleEventTriggered = {};
  G._roomVisitCount = {};
  G._ruleEventQueue = [];

  _enterDungeon_ruleEvents(config);
};

// ============ 3. 规则事件触发检测（带队列 + 防叠加） ============

// 停留触发定时器
var _stayTimers = [];

function clearStayTimers() {
  _stayTimers.forEach(function(id) { clearTimeout(id); });
  _stayTimers = [];
}

function checkRuleEvents(roomId) {
  if (!G.inDungeon || !G.dungeon) return;

  var dungeonId = G.dungeon.id;
  var events = RULE_EVENTS[dungeonId];
  if (!events) return;

  var hasNewEvents = false;

  events.forEach(function(event) {
    // 检查房间匹配
    if (event.triggerRoom && event.triggerRoom !== roomId) return;

    // enterRoom 类型在这里处理
    if (event.triggerType !== 'enterRoom') return;

    // 检查触发条件
    if (event.triggerCondition && !event.triggerCondition()) return;

    // 检查是否已经在队列中
    if (G._ruleEventQueue && G._ruleEventQueue.some(function(e) { return e.id === event.id; })) return;

    // 标记为已触发
    G._ruleEventTriggered[event.id] = true;

    if (!G._ruleEventQueue) G._ruleEventQueue = [];
    G._ruleEventQueue.push(event);
    hasNewEvents = true;
  });

  if (hasNewEvents) {
    var firstEvent = G._ruleEventQueue[0];
    var startDelay = (firstEvent && firstEvent.delay) ? firstEvent.delay : 3000;
    setTimeout(function() {
      processRuleEventQueue();
    }, startDelay);
  }

  // 启动停留触发检测
  startStayTimers(roomId);
}

function startStayTimers(roomId) {
  // 清除之前的停留定时器
  clearStayTimers();

  if (!G.inDungeon || !G.dungeon) return;

  var dungeonId = G.dungeon.id;
  var events = RULE_EVENTS[dungeonId];
  if (!events) return;

  events.forEach(function(event) {
    if (event.triggerRoom !== roomId) return;
    if (event.triggerType !== 'stayInRoom') return;
    if (event.triggerCondition && !event.triggerCondition()) return;
    if (G._ruleEventTriggered && G._ruleEventTriggered[event.id]) return;
    if (G._ruleEventQueue && G._ruleEventQueue.some(function(e) { return e.id === event.id; })) return;

    var stayTime = event.stayTime || 6000;

    var timerId = setTimeout(function() {
      // 再次确认玩家还在这个房间
      if (G.currentRoom !== roomId) return;

      // 确认没有弹窗正在显示
      if (document.getElementById('ruleEventOverlay') ||
          document.getElementById('randomEventOverlay') ||
          document.getElementById('aiChoiceOverlay')) {
        // 有弹窗，放弃本次触发（不标记，下次还能触发）
        return;
      }

      // 再次检查条件（可能线索数变了）
      if (event.triggerCondition && !event.triggerCondition()) return;

      G._ruleEventTriggered[event.id] = true;

      if (!G._ruleEventQueue) G._ruleEventQueue = [];
      G._ruleEventQueue.push(event);
      processRuleEventQueue();
    }, stayTime);

    _stayTimers.push(timerId);
  });
}

// ============ 队列处理器：同一时间只弹一个事件 ============

function processRuleEventQueue() {
  // 如果当前已有弹窗，等待
  if (document.getElementById('ruleEventOverlay') ||
      document.getElementById('randomEventOverlay') ||
      document.getElementById('aiChoiceOverlay')) {
    setTimeout(processRuleEventQueue, 800);
    return;
  }

  // 队列为空则结束
  if (!G._ruleEventQueue || G._ruleEventQueue.length === 0) return;

  // 取出队列中第一个事件
  var event = G._ruleEventQueue.shift();

  // 检查玩家是否还在触发房间（路过的就跳过）
  if (event.triggerRoom && event.triggerRoom !== G.currentRoom) {
    processRuleEventQueue();
    return;
  }

  showRuleEventPopup(event);
}

// ============ 4. 规则事件弹窗UI ============

function showRuleEventPopup(event) {
  if (!event || !event.popup) {
    processRuleEventQueue();
    return;
  }

  // 防止叠加：如果已有弹窗，放回队列等待
  if (document.getElementById('ruleEventOverlay') ||
      document.getElementById('randomEventOverlay') ||
      document.getElementById('aiChoiceOverlay')) {
    if (!G._ruleEventQueue) G._ruleEventQueue = [];
    G._ruleEventQueue.unshift(event);
    setTimeout(processRuleEventQueue, 800);
    return;
  }

  var popup = event.popup;

  // 创建全屏遮罩
  var overlay = document.createElement('div');
  overlay.id = 'ruleEventOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10001;display:flex;align-items:center;justify-content:center;padding:16px;animation:ruleEventFadeIn 0.5s ease';

  // 添加动画样式
  if (!document.getElementById('ruleEventStyles')) {
    var style = document.createElement('style');
    style.id = 'ruleEventStyles';
    style.textContent =
      '@keyframes ruleEventFadeIn { from { opacity:0; } to { opacity:1; } }' +
      '@keyframes ruleEventSlideIn { from { transform:scale(0.8) translateY(30px); opacity:0; } to { transform:scale(1) translateY(0); opacity:1; } }' +
      '@keyframes ruleEventPulse { 0%,100% { box-shadow:0 0 20px rgba(139,0,0,0.3); } 50% { box-shadow:0 0 40px rgba(139,0,0,0.6); } }' +
      '@keyframes ruleEventTimerShrink { from { width:100%; } to { width:0%; } }' +
      '.rule-event-choice:hover { background:rgba(139,50,50,0.4) !important; transform:scale(1.02); }' +
      '.rule-event-choice:active { transform:scale(0.98); }' +
      '.rule-event-choice.disabled { opacity:0.3 !important; pointer-events:none; }';
    document.head.appendChild(style);
  }

  // 弹窗容器
  var container = document.createElement('div');
  container.style.cssText = 'max-width:380px;width:100%;background:linear-gradient(145deg, #1a0808, #0d0404);border:2px solid #8b0000;border-radius:12px;padding:20px;animation:ruleEventSlideIn 0.5s ease, ruleEventPulse 3s infinite;max-height:85vh;overflow-y:auto';

  var html = '';

  // 标题
  html += '<div style="text-align:center;margin-bottom:16px">';
  html += '<div style="font-size:10px;color:#ff4444;letter-spacing:3px;margin-bottom:6px">⚠️ 规则触发 ⚠️</div>';
  html += '<div style="font-size:18px;color:#e0b0b0;font-weight:bold;text-shadow:0 0 10px rgba(139,0,0,0.5)">' + popup.title + '</div>';
  html += '</div>';

  // 分隔线
  html += '<div style="border-bottom:1px solid #5a2020;margin:0 0 14px"></div>';

  // 描述文字
  var descLines = popup.description.split('\n');
  html += '<div style="margin-bottom:18px">';
  descLines.forEach(function(line) {
    if (line.trim() === '') {
      html += '<div style="height:8px"></div>';
    } else if (line.indexOf('⚠️') >= 0 || line.indexOf('校规') >= 0 || line.indexOf('「') >= 0) {
      html += '<div style="font-size:11px;color:#ff6666;line-height:1.8;padding:4px 8px;background:rgba(139,0,0,0.15);border-left:2px solid #8b0000;margin:4px 0">' + line + '</div>';
    } else {
      html += '<div style="font-size:12px;color:#c8a8a8;line-height:1.8">' + line + '</div>';
    }
  });
  html += '</div>';

  // 倒计时条
  if (popup.timeLimit) {
    html += '<div style="margin-bottom:14px">';
    html += '<div style="font-size:10px;color:#ff4444;text-align:center;margin-bottom:4px">⏰ 限时 ' + popup.timeLimit + ' 秒</div>';
    html += '<div style="background:rgba(50,20,20,0.6);border-radius:4px;height:4px;overflow:hidden">';
    html += '<div id="ruleEventTimer" style="height:100%;background:linear-gradient(90deg,#ff4444,#ff0000);animation:ruleEventTimerShrink ' + popup.timeLimit + 's linear forwards"></div>';
    html += '</div></div>';
  }

  // 选择按钮
  html += '<div id="ruleEventChoices" style="display:flex;flex-direction:column;gap:10px">';
  popup.choices.forEach(function(choice, idx) {
    var isDisabled = false;
    var disabledReason = '';

    if (choice.requireItem) {
      var hasItem = false;
      if (G.dungeonItems) {
        hasItem = G.dungeonItems.some(function(item) { return item.id === choice.requireItem; });
      }
      if (!hasItem && G.permanentItems) {
        hasItem = G.permanentItems.some(function(item) { return item.id === choice.requireItem; });
      }
      if (!hasItem) {
        isDisabled = true;
        disabledReason = '（需要道具）';
      }
    }

    html += '<button class="rule-event-choice' + (isDisabled ? ' disabled' : '') + '" ';
    html += 'style="background:rgba(80,30,30,0.5);border:1px solid #6a2020;border-radius:8px;padding:12px 14px;cursor:pointer;text-align:left;transition:all 0.2s;display:flex;align-items:center;gap:10px" ';
    if (!isDisabled) {
      html += 'onclick="resolveRuleEvent(' + idx + ')" ';
    }
    html += '>';
    html += '<span style="font-size:22px;flex-shrink:0">' + choice.icon + '</span>';
    html += '<div>';
    html += '<div style="font-size:13px;color:#e0b0b0;font-weight:bold">' + choice.label + '</div>';
    if (disabledReason) {
      html += '<div style="font-size:10px;color:#666;margin-top:2px">' + disabledReason + '</div>';
    }
    html += '</div>';
    html += '</button>';
  });
  html += '</div>';

  container.innerHTML = html;
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // 保存当前事件数据
  window._currentRuleEvent = event;
  window._ruleEventTimerId = null;

  // 如果有时限，启动超时处理
  if (popup.timeLimit) {
    window._ruleEventTimerId = setTimeout(function() {
      var worstIdx = 0;
      var worstScore = 0;
      popup.choices.forEach(function(c, i) {
        var score = Math.abs(c.sanChange || 0) + Math.abs(c.hpChange || 0) * 3;
        if (score > worstScore) {
          worstScore = score;
          worstIdx = i;
        }
      });

      addMessage('horror', '⏰ 你犹豫太久了——');
      resolveRuleEvent(worstIdx);
    }, popup.timeLimit * 1000);
  }

  addMessage('system', '═══ ⚠️ 规则事件触发 ═══');
}

// ============ 5. 处理规则事件选择结果 ============

function resolveRuleEvent(choiceIdx) {
  var event = window._currentRuleEvent;
  if (!event || !event.popup) return;

  var choice = event.popup.choices[choiceIdx];
  if (!choice) return;

  // 清除超时计时器
  if (window._ruleEventTimerId) {
    clearTimeout(window._ruleEventTimerId);
    window._ruleEventTimerId = null;
  }

  // 移除弹窗
  var overlay = document.getElementById('ruleEventOverlay');
  if (overlay) {
    overlay.style.animation = 'ruleEventFadeIn 0.3s ease reverse';
    setTimeout(function() { overlay.remove(); }, 300);
  }

  // 显示选择结果
  setTimeout(function() {
    var msgType = choice.horror ? 'horror' : 'narrator';
    addMessage(msgType, choice.message);

    // 应用HP变化
    if (choice.hpChange && choice.hpChange !== 0) {
      updateHP(G.hp + choice.hpChange);
      addMessage('system', '❤️ HP ' + (choice.hpChange > 0 ? '+' : '') + choice.hpChange);
    }

    // 应用SAN变化
    if (choice.sanChange && choice.sanChange !== 0) {
      updateSAN(G.san + choice.sanChange);
      addMessage('system', '🧠 SAN ' + (choice.sanChange > 0 ? '+' : '') + choice.sanChange);
    }

    // 添加线索
    if (choice.addClue && G.dungeon && G.dungeon.clues) {
      if (G.dungeon.clues[choice.addClue]) {
        if (!G.cluesFound.includes(choice.addClue)) {
          G.cluesFound.push(choice.addClue);
          var clue = G.dungeon.clues[choice.addClue];
          addMessage('system', '📋 [线索已记录] ' + clue.name);
          showNotification('🔍 发现线索：' + clue.name, 'clue');
        }
      }
    }

    // 添加道具
    if (choice.addItem) {
      if (!G.dungeonItems) G.dungeonItems = [];
      G.dungeonItems.push(choice.addItem);
      addMessage('system', choice.addItem.icon + ' 获得道具：' + choice.addItem.name);
      showNotification(choice.addItem.icon + ' ' + choice.addItem.name, 'clue');
    }

    // 致死判定
    if (choice.triggerDeath) {
      var reviveItem = G.permanentItems.find(function(item) {
        return item.name.includes('替身') || item.name.includes('复活') || item.name.includes('回溯');
      });
      var dungeonRevive = G.dungeonItems ? G.dungeonItems.find(function(item) {
        return item.name.includes('替身') || item.name.includes('复活');
      }) : null;

      if (reviveItem) {
        removePermanentItem(reviveItem.id);
        addMessage('system', '💫 ' + reviveItem.icon + ' ' + reviveItem.name + '替你承受了死亡！');
        updateHP(Math.max(1, G.hp));
        updateSAN(Math.max(1, G.san));
        showNotification('💫 保命道具生效！', 'clue');
      } else if (dungeonRevive) {
        G.dungeonItems = G.dungeonItems.filter(function(i) { return i !== dungeonRevive; });
        addMessage('system', '💫 ' + dungeonRevive.name + '替你承受了死亡！');
        updateHP(Math.max(1, G.hp));
        updateSAN(Math.max(1, G.san));
        showNotification('💫 保命道具生效！', 'clue');
      } else {
        setTimeout(function() {
          updateHP(0);
          showNotification('💀 违反致死规则', 'horror');
        }, 2000);
        window._currentRuleEvent = null;
        return;
      }
    }

    // 移动房间
    // ★★★ 修复：确保移动后触发AI场景描述 ★★★
    if (choice.moveToRoom) {
      setTimeout(function() {
        G._openingScriptPlaying = false;
        G._aiMoveTriggered = false;
        G._ruleEventMoveTriggered = true;
        moveToRoom(choice.moveToRoom);
        setTimeout(function() {
          G._ruleEventMoveTriggered = false;
        }, 500);
      }, 2000);
    }

    // 后续选择（嵌套事件）走队列
    if (choice.followUp) {
      var followUpEvent = {
        id: event.id + '_followup',
        popup: choice.followUp
      };
      if (!G._ruleEventQueue) G._ruleEventQueue = [];
      G._ruleEventQueue.unshift(followUpEvent);
    }

    addMessage('system', '═══════════════');

    // ★ 处理完当前事件后，继续处理队列
    window._currentRuleEvent = null;
    setTimeout(function() {
      processRuleEventQueue();
    }, 2000);

  }, 500);
}

// ============ 6. 挂载到房间切换逻辑 ============

var _moveToRoom_ruleEvents = moveToRoom;
moveToRoom = function(roomId) {
  // 离开房间时清除停留定时器
  clearStayTimers();

  if (!G._roomVisitCount) G._roomVisitCount = {};
  if (!G._roomVisitCount[roomId]) G._roomVisitCount[roomId] = 0;
  G._roomVisitCount[roomId]++;

  _moveToRoom_ruleEvents(roomId);

  setTimeout(function() {
    checkRuleEvents(roomId);
  }, 1000);
};

// ============ 7. 为沉默学园添加隐藏线索定义 ============

var _originalGen04Factory = DUNGEON_FACTORIES['gen_04'];
DUNGEON_FACTORIES['gen_04'] = function() {
  var dungeon = _originalGen04Factory();

  if (!dungeon.clues['sc_hidden']) {
    dungeon.clues['sc_hidden'] = {
      name: '值日生的留言',
      icon: '💧',
      description: '用水渍写在地上的文字："谢谢你没有叫我的名字。我叫林小雨。我是最后一个值日生。帮我...说出真相。" 文字很快就干了，但你记住了每一个字。',
      sanCost: 0,
      foundIn: '走廊'
    };
  }

  return dungeon;
};

console.log('✅ 规则事件触发系统 v2 加载完成 - 队列机制 + 停留触发 + 防叠加');
