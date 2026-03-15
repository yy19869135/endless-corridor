function clearDungeonData() {
  G.inDungeon = false;
  G.dungeon = null;
  G.currentRoom = null;
  G.visitedRooms = new Set();
  G.dungeonItems = [];
  G.cluesFound = [];
  G.gameTime = 0;
  G.timerStarted = false;
  G.triggeredEvents = new Set();
  G.gamePhase = 'world';
  stopDungeonTimer();
  updateItemCount();
  updateClueUI();
  renderMinimap();
}

// ★ 构建副本归来信息（在清空数据前调用）
function buildReturnInfo(exitType, fragments) {
  var info = {
    exitType: exitType, // 'completed' | 'death' | 'timeout'
    dungeonName: G.dungeon ? G.dungeon.name : '未知副本',
    dungeonId: G.dungeon ? G.dungeon.id : '',
    difficulty: G.dungeon ? (G.dungeon.difficulty || '未知') : '未知',
    hp: G.hp,
    maxHp: G.maxHp,
    san: G.san,
    maxSan: G.maxSan,
    fragments: fragments,
    cluesFound: G.cluesFound ? G.cluesFound.length : 0,
    isTimeout: !!G._timeoutExit,
    // 收集存活和死亡的NPC信息
    aliveNPCs: [],
    deadNPCs: []
  };

  // 收集NPC状态
  if (G.dungeon && G.dungeon.npcs) {
    G.dungeon.npcs.forEach(function(npc) {
      var npcInfo = {
        name: npc.name || '未知',
        icon: npc.icon || '👤',
        title: npc.title || '',
        personality: npc.personality || '普通人',
        quote: npc.quote || ''
      };
      if (npc.dead || npc.isDead) {
        npcInfo.deathDesc = npc._deathDesc || '在副本中死亡';
        info.deadNPCs.push(npcInfo);
      } else {
        info.aliveNPCs.push(npcInfo);
      }
    });
  }

  // 清除临时标记
  G._timeoutExit = false;

  return info;
}

// ★ 触发AI生成归来过渡剧情
async function triggerReturnNarration(info) {
  if (!mujianSdk) {
    // 无AI时使用离线文本
    offlineReturnNarration(info);
    return;
  }

  // 构建归来prompt
  var prompt = '你是恐怖游戏「苍白回廊」的叙述者。\n';
  prompt += '玩家刚刚从副本「' + info.dungeonName + '」（难度：' + info.difficulty + '）返回苍白回廊。\n\n';

  // 退出方式
  if (info.exitType === 'death') {
    prompt += '【退出方式】玩家在副本中死亡，被系统强制传送回苍白回廊复活。\n';
  } else if (info.isTimeout) {
    prompt += '【退出方式】副本时间耗尽，玩家被强制拉回苍白回廊。副本坍塌关闭。\n';
  } else {
    prompt += '【退出方式】玩家通关/主动撤离副本，正常返回苍白回廊。\n';
  }

  // 玩家状态
  var hpPercent = Math.round((info.hp / info.maxHp) * 100);
  var sanPercent = Math.round((info.san / info.maxSan) * 100);
  prompt += '【玩家状态】HP：' + info.hp + '/' + info.maxHp + '（' + hpPercent + '%），SAN：' + info.san + '/' + info.maxSan + '（' + sanPercent + '%）\n';

  if (hpPercent <= 30) {
    prompt += '→ 玩家身体状况很差，重伤状态\n';
  } else if (hpPercent <= 60) {
    prompt += '→ 玩家有明显伤势\n';
  } else {
    prompt += '→ 玩家身体状况尚可\n';
  }

  if (sanPercent <= 30) {
    prompt += '→ 玩家精神状态濒临崩溃，可能出现幻觉或语无伦次\n';
  } else if (sanPercent <= 60) {
    prompt += '→ 玩家精神恍惚，目光涣散\n';
  } else {
    prompt += '→ 玩家精神状态尚可\n';
  }

  prompt += '【获得碎片】' + info.fragments + '个灵魂碎片\n';
  prompt += '【发现线索】' + info.cluesFound + '条\n\n';

  // NPC信息
  if (info.aliveNPCs.length > 0 || info.deadNPCs.length > 0) {
    prompt += '【队友NPC状况】\n';
    info.aliveNPCs.forEach(function(npc) {
      prompt += '✅ 存活：' + npc.icon + ' ' + npc.name + '（' + npc.title + '）— 性格：' + npc.personality;
      if (npc.quote) prompt += '，口头禅：「' + npc.quote + '」';
      prompt += '\n';
    });
    info.deadNPCs.forEach(function(npc) {
      prompt += '💀 死亡：' + npc.icon + ' ' + npc.name + '（' + npc.title + '）— ' + npc.deathDesc + '\n';
    });
    prompt += '\n';
  }

  // 写作要求
  prompt += '【写作要求】\n';
  prompt += '1. 用3-5段描写归来场景。先描写玩家从副本入口跌出/走出的动作和身体状态。\n';
  prompt += '2. 如果有存活的队友NPC，必须描写他们各自的反应和简短对话（符合各自性格）。\n';
  prompt += '3. 如果有队友在副本中死亡，存活者要表现出悲伤、震惊或自责。\n';
  prompt += '4. 描写苍白回廊的环境氛围作为过渡（雾气、寂静、其他路过的人等）。\n';
  prompt += '5. 以一句暗示"可以去休息或准备下一次冒险"的话自然结束。\n';
  prompt += '6. 不要使用emoji。保持恐怖游戏的阴郁氛围。语言要有文学感。\n';
  prompt += '7. NPC的对话要用引号括起来，要符合他们各自的性格和口头禅。\n';

  showTyping();

  try {
    var fullResponse = '';
    stopController = new AbortController();
    await mujianSdk.ai.chat.complete(
      prompt,
      function(res) {
        fullResponse = res.fullContent || '';
        if (res.isFinished) {
          hideTyping();
          if (fullResponse) {
            // 分段显示，增加沉浸感
            var paragraphs = fullResponse.split('\n').filter(function(p) { return p.trim(); });
            var delay = 0;
            paragraphs.forEach(function(p, i) {
              setTimeout(function() {
                addMessage('narrator', p.trim());
              }, delay);
              delay += 800;
            });

            // 最后显示系统提示
            setTimeout(function() {
              addMessage('system', '你可以在回廊中休息、整理装备，或前往下一个副本。');
            }, delay + 500);
          }
        }
      },
      stopController.signal,
      { parseContent: true }
    );
  } catch(e) {
    hideTyping();
    offlineReturnNarration(info);
  }
}

// ★ 离线模式的归来文本（AI不可用时的后备）
function offlineReturnNarration(info) {
  var hpPercent = Math.round((info.hp / info.maxHp) * 100);
  var sanPercent = Math.round((info.san / info.maxSan) * 100);

  // 根据状态选择描写
  if (info.exitType === 'death') {
    addMessage('narrator', '意识在黑暗中重新凝聚。你发现自己躺在苍白回廊冰冷的地面上，全身的骨头都在抗议。死亡的记忆像褪色的照片一样模糊，但那种恐惧依然鲜明。');
  } else if (info.isTimeout) {
    addMessage('narrator', '副本入口的门猛地弹开，你被一股无形的力量推了出来，重重跌在回廊的石板地上。身后的门砰然关闭，上面的符文暗淡下去——副本已经坍塌了。');
  } else {
    if (hpPercent <= 30) {
      addMessage('narrator', '你几乎是爬出副本入口的。每一步都像踩在碎玻璃上，视线模糊，但你终于回到了苍白回廊。');
    } else if (hpPercent <= 60) {
      addMessage('narrator', '你踉跄着走出副本入口，衣服上还沾着那个世界的痕迹。回廊的灰白色雾气包裹住你，像一个冰冷的拥抱。');
    } else {
      addMessage('narrator', '你稳步走出副本入口，虽然疲惫，但一切还在掌控之中。苍白回廊的雾气安静地迎接你的归来。');
    }
  }

  // NPC反应
  if (info.aliveNPCs.length > 0) {
    setTimeout(function() {
      info.aliveNPCs.forEach(function(npc, i) {
        setTimeout(function() {
          if (info.isTimeout || info.exitType === 'death') {
            addMessage('narrator', npc.icon + ' ' + npc.name + '也跟着出现在回廊中，大口喘着气。沉默了一会儿后，' + npc.name + '低声说了什么，但你没有听清。');
          } else {
            addMessage('narrator', npc.icon + ' ' + npc.name + '走到你身边，轻轻点了点头。"至少我们都回来了。"');
          }
        }, i * 1000);
      });
    }, 1200);
  }

  // 死亡NPC的悼念
  if (info.deadNPCs.length > 0) {
    setTimeout(function() {
      info.deadNPCs.forEach(function(npc) {
        addMessage('narrator', '但是' + npc.icon + ' ' + npc.name + '没有出来。那扇门已经关上了，再也不会打开。');
      });
      if (info.aliveNPCs.length > 0) {
        addMessage('narrator', '没有人提起' + info.deadNPCs[0].name + '的名字。有些事情，沉默比言语更沉重。');
      }
    }, 1200 + info.aliveNPCs.length * 1000 + 500);
  }

  // 结束提示
  var totalDelay = 1200 + (info.aliveNPCs.length + info.deadNPCs.length) * 1000 + 2000;
  setTimeout(function() {
    addMessage('system', '你可以在回廊中休息、整理装备，或前往下一个副本。');
  }, totalDelay);
}
