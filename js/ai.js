async function generateRoomNarration(roomId, room, isFirstVisit) {
  showTyping();

  // ★ 收集最近的NPC台词，用于防重复
  var recentNPCLines = '';
  if (G._recentNPCDialogues && G._recentNPCDialogues.length > 0) {
    recentNPCLines = '\n【最近NPC已说过的台词——禁止重复使用】\n';
    G._recentNPCDialogues.forEach(function(line) {
      recentNPCLines += '- ' + line + '\n';
    });
  }

  // 从currentParticipants获取同行者信息
  var npcDesc = '';
  if (G.currentParticipants && G.currentParticipants.length > 0) {
    var aliveCompanions = G.currentParticipants.filter(function(p) {
      return p.type !== 'player' && p.alive;
    });
    if (aliveCompanions.length > 0) {
      npcDesc = '\n\n【与你同行的参与者——他们和你一起进入了这个副本】\n';
      aliveCompanions.forEach(function(p) {
        npcDesc += '- ' + p.icon + ' ' + p.name + '（' + p.title + '）';
        if (p.personality) npcDesc += ' 性格：' + p.personality;
        if (p.quote) npcDesc += ' 口头禅：「' + p.quote + '」';
        npcDesc += '\n';
      });
      npcDesc += '注意：只描写以上这些人，不要自己编造其他角色。\n';
    }

    var deadCompanions = G.currentParticipants.filter(function(p) {
      return p.type !== 'player' && !p.alive;
    });
    if (deadCompanions.length > 0) {
      npcDesc += '\n【已死亡的参与者】\n';
      deadCompanions.forEach(function(d) {
        npcDesc += '- ' + d.icon + ' ' + d.name + '（' + (d._deathDesc || '已死亡') + '）\n';
      });
    }
  }
  var deadDesc = '';

  // 构建背包信息
  var itemDesc = '';
  if (G.dungeonItems.length > 0) {
    itemDesc = '\n【玩家背包】';
    G.dungeonItems.forEach(function(item) {
      itemDesc += item.icon + item.name + '、';
    });
    itemDesc = itemDesc.slice(0, -1) + '\n';
  }

  var prompt = '你是恐怖文字冒险游戏「苍白回廊」的叙述者。像写恐怖小说一样描写场景。\n\n';
  prompt += '【副本】「' + G.dungeon.name + '」\n';
  prompt += '【当前房间】「' + room.name + '」\n';
  prompt += '【房间设定】' + (room.description || '') + '\n';
  if (isFirstVisit && room.firstVisitText) {
    prompt += '【首次进入参考文本】' + room.firstVisitText + '\n';
  }
  prompt += '【是否首次进入】' + (isFirstVisit ? '是' : '否，玩家之前来过') + '\n';
  prompt += '【玩家HP】' + G.hp + '/' + G.maxHp + '\n';
  prompt += '【玩家SAN】' + G.san + '/' + G.maxSan + '\n';
  prompt += '【已探索】' + G.visitedRooms.size + '/' + Object.keys(G.dungeon.rooms).length + '个房间\n';
  prompt += '【已收集线索】' + G.cluesFound.length + '条\n';
  prompt += itemDesc;

  // 注入当前副本参与者信息（增强版）
  if (G.currentParticipants && G.currentParticipants.length > 0) {
    var aliveCompanions = G.currentParticipants.filter(function(p) {
      return p.type !== 'player' && p.alive;
    });
    if (aliveCompanions.length > 0) {
      prompt += '\n【参与者列表——只允许描写以下角色】\n';
      aliveCompanions.forEach(function(p) {
        prompt += '- ' + p.icon + ' ' + p.name + '（' + p.title + '）';
        if (p.personality) prompt += ' 性格：' + p.personality;
        if (p.backstory) prompt += ' 背景：' + p.backstory;
        if (p.behaviorPatterns) prompt += ' 行为模式：' + p.behaviorPatterns;
        if (p.quote) prompt += ' 口头禅（偶尔使用，不要每次都说）：「' + p.quote + '」';
        if (p.speechStyle) prompt += ' 说话风格：' + p.speechStyle;
        prompt += '\n';
      });
    }
    var deadCompanions = G.currentParticipants.filter(function(p) {
      return p.type !== 'player' && !p.alive;
    });
    if (deadCompanions.length > 0) {
      prompt += '\n【已死亡的参与者】\n';
      deadCompanions.forEach(function(d) {
        prompt += '- ' + d.icon + ' ' + d.name + '（' + (d._deathDesc || '已死亡') + '）\n';
      });
    }
  }

  // ★ 注入防重复信息
  if (recentNPCLines) {
    prompt += recentNPCLines;
  }

  if (G.dungeon.aiHints) {
    prompt += '【副本氛围】' + G.dungeon.aiHints + '\n';
  }

  prompt += '\n【写作要求——严格遵守】\n';
  prompt += '0. 只描写【参与者列表】中的角色，禁止自己编造新的NPC（如护士、医生、保安等）。如果没有提供参与者列表，则不描写任何同行者。\n';
  prompt += '1. 用第二人称"你"来写，像恐怖小说的一个段落\n';
  prompt += '2. 写6-12句话，要有画面感和沉浸感\n';
  prompt += '3. 必须包含感官细节：声音（脚步回响、水滴声、远处的低语）、气味（消毒水、铁锈、腐烂）、温度（阴冷、闷热）、触感（潮湿的墙壁、冰冷的门把手）、光线（昏暗、闪烁、刺眼）\n';
  prompt += '4. 如果有其他参与者在房间里，必须具体描写每个人：\n';
  prompt += '   - 描写他们的肢体动作、表情变化、与环境的互动\n';
  prompt += '   - 每个NPC必须有至少一句符合性格的台词，用引号包裹\n';
  prompt += '   - 台词必须是对当前场景的自然反应，而非重复口头禅\n';
  prompt += '   - NPC应该有多样化的行为：观察环境、与玩家互动、自言自语、做出符合性格的举动\n';
  prompt += '5. 如果有已死亡的角色，用恐怖的方式描写发现尸体的场景\n';
  prompt += '6. 恐怖描写要层层递进：先是微妙的不对劲→然后是明确的异常→暗示更深的恐怖\n';
  prompt += '7. 如果不是首次进入，描写房间发生了什么变化（东西移动了、声音不同了、温度变了）\n';
  prompt += '\n【NPC台词规则——极其重要】\n';
  prompt += '- NPC的口头禅只是性格参考，不是每次必须说的台词。口头禅最多在整个副本中出现1-2次\n';
  prompt += '- 每次NPC说话的内容必须是对当前场景、当前发现、当前恐怖事件的具体反应\n';
  prompt += '- 不同房间中NPC的反应必须不同：看到新东西要评论新东西，遇到恐怖事件要有恐惧/分析/逃跑等反应\n';
  prompt += '- 如果【最近NPC已说过的台词】中有内容，绝对禁止重复相同或相似的话\n';
  prompt += '- NPC之间应该有互动：对话、争论、互相安慰、互相警告\n';
  prompt += '\n【绝对禁止——违反则回复作废】\n';
  prompt += '- 禁止输出任何方括号[]指令，如[SAN:-5]、[CHOICE:...]、[HP:-3]等\n';
  prompt += '- 禁止输出选项列表或选择菜单\n';
  prompt += '- 禁止提及具体数值（HP、SAN、碎片数量）\n';
  prompt += '- 禁止使用emoji表情\n';
  prompt += '- 禁止给玩家建议该做什么\n';
  prompt += '- 禁止使用"你可以..."这种引导语\n';
  prompt += '- 你只写纯叙述文本，不写任何游戏机制内容\n';
  prompt += '- 绝对不要在叙述中提及任何角色的通讯编号。编号只有在玩家主动请求时才由callAI处理，不在房间叙述中出现\n';
  prompt += '- 全程使用中文，禁止混入任何英文、日文或其他语言的词汇\n';

    try {
    var messages = [
      { role: 'system', content: prompt }
    ];
    var fullResponse = await callOpenAICompatible(messages);

    hideTyping();

    if (fullResponse) {
      // ★ 过滤AI复读的系统提示
      fullResponse = fullResponse.replace(/\*\*\[當前房間\]\*\*.*/g, '');
      fullResponse = fullResponse.replace(/\*\*\[当前房间\]\*\*.*/g, '');
      fullResponse = fullResponse.replace(/\*\*\[房間設定\]\*\*.*/g, '');
      fullResponse = fullResponse.replace(/\*\*\[房间设定\]\*\*.*/g, '');
      fullResponse = fullResponse.replace(/【副本】.*?body_state.*?\n/g, '');
      fullResponse = fullResponse.replace(/【当前房间】.*?\n/g, '');
      fullResponse = fullResponse.replace(/【当前副本】.*?\n/g, '');
      fullResponse = fullResponse.replace(/玩家【健康】.*?\n/g, '');
      fullResponse = fullResponse.replace(/玩家【SAN】.*?\n/g, '');
      fullResponse = fullResponse.replace(/choice_setd.*?\n/g, '');
      fullResponse = fullResponse.replace(/\n{3,}/g, '\n\n').trim();

      // ★ 过滤混入的外语词汇
      fullResponse = fullResponse.replace(/\b[a-zA-Z]{4,}\b/g, '');
      fullResponse = fullResponse.replace(/\s{2,}/g, ' ').trim();

      if (fullResponse && fullResponse.trim().length > 10) {
        addMessageParagraphs('narrator', fullResponse, 700);
        extractAndSaveNPCDialogues(fullResponse);
      } else {
        if (isFirstVisit && room.firstVisitText) {
          addMessage('narrator', room.firstVisitText);
        } else if (room.description) {
          addMessage('narrator', room.description);
        }
      }
    } else {
      if (isFirstVisit && room.firstVisitText) {
        addMessage('narrator', room.firstVisitText);
      } else if (room.description) {
        addMessage('narrator', room.description);
      }
    }
    setTimeout(function() { generateContextActions(); }, 500);
  } catch(e) {
    hideTyping();
    console.error('房间叙述AI调用失败:', e);
    if (isFirstVisit && room.firstVisitText) {
      addMessage('narrator', room.firstVisitText);
    } else if (room.description) {
      addMessage('narrator', room.description);
    }
    generateNPCRoomActivity(roomId);
    setTimeout(function() { generateContextActions(); }, 500);
  }
}

// ★ 新增：从AI回复中提取NPC台词，存入历史记录用于防重复
function extractAndSaveNPCDialogues(text) {
  if (!G._recentNPCDialogues) G._recentNPCDialogues = [];

  // 提取引号内的台词
  var quotes = text.match(/["「"](.*?)["」"]/g);
  if (quotes) {
    quotes.forEach(function(q) {
      var clean = q.replace(/["「"」""]/g, '').trim();
      if (clean.length > 2 && clean.length < 50) {
        G._recentNPCDialogues.push(clean);
      }
    });
  }

  // 只保留最近20条，防止prompt过长
  if (G._recentNPCDialogues.length > 20) {
    G._recentNPCDialogues = G._recentNPCDialogues.slice(-20);
  }
}

// 获取当前房间中的NPC（根据房间索引分配NPC位置）
function getNPCsInRoom(roomId) {
  if (!G.currentParticipants || G.currentParticipants.length === 0) {
    // 用dungeonNPCs回退
    if (!dungeonNPCs || dungeonNPCs.length === 0) return [];
    var result = [];
    var roomIds = Object.keys(G.dungeon.rooms);
    var roomIdx = roomIds.indexOf(roomId);
    dungeonNPCs.forEach(function(npcCode, idx) {
      var npcRoomIdx = (idx + Math.floor(G.gameTime / 120)) % roomIds.length;
      if (npcRoomIdx === roomIdx) {
        var cd = CHARACTER_DB[npcCode];
        if (cd) {
          result.push({
            name: cd.name,
            icon: cd.icon,
            title: cd.title,
            personality: (cd.personality || []).join('、'),
            quote: cd.greeting
          });
        }
      }
    });
    return result;
  }

  var result = [];
  var roomIds = Object.keys(G.dungeon.rooms);
  var roomIdx = roomIds.indexOf(roomId);

  G.currentParticipants.forEach(function(p, idx) {
    if (p.type === 'player') return;
    if (!p.alive) return;

    var npcRoomIdx = (idx + Math.floor(G.gameTime / 90)) % roomIds.length;
    if (npcRoomIdx === roomIdx) {
      result.push({
        name: p.name,
        icon: p.icon,
        title: p.title,
        personality: p.personality || '',
        quote: p.quote,
        type: p.type
      });
    }
  });

  return result;
}

// 获取当前房间中已死亡的角色
function getDeadInRoom(roomId) {
  if (!G.currentParticipants) return [];
  var result = [];
  var roomIds = Object.keys(G.dungeon.rooms);
  var roomIdx = roomIds.indexOf(roomId);

  G.currentParticipants.forEach(function(p, idx) {
    if (p.type === 'player') return;
    if (p.alive) return;
    if (p._deathRoomIdx === roomIdx) {
      result.push({
        name: p.name,
        icon: p.icon,
        deathDesc: p._deathDesc || '倒在地上，已经没有呼吸'
      });
    }
  });

  return result;
}

// 离线模式下生成NPC活动文本（已禁用，由AI全权负责）
function generateNPCRoomActivity(roomId) {
  return;
}

// NPC随机死亡事件（在副本进行中触发）
function triggerRandomNPCDeath() {
  if (!G.currentParticipants || !G.inDungeon) return;

  var aliveFodders = G.currentParticipants.filter(function(p) {
    return p.type === 'fodder' && p.alive;
  });

  if (aliveFodders.length === 0) return;

  aliveFodders.sort(function(a, b) { return (b.deathRate || 0.5) - (a.deathRate || 0.5); });

  var victim = null;
  for (var i = 0; i < aliveFodders.length; i++) {
    if (Math.random() < (aliveFodders[i].deathRate || 0.5) * 0.3) {
      victim = aliveFodders[i];
      break;
    }
  }

  if (!victim) return;

  victim.alive = false;
  var roomIds = Object.keys(G.dungeon.rooms);
  victim._deathRoomIdx = Math.floor(Math.random() * roomIds.length);

  var deathDescs = [
    '被不明力量撕裂',
    '在黑暗中消失，只留下一滩血迹',
    '被墙壁中伸出的手拖了进去',
    '突然倒地，面部扭曲成不可能的角度',
    '在尖叫声中被天花板上掉落的东西砸中',
    '触碰了不该触碰的东西后全身僵硬',
    '被镜子中的自己拉了进去'
  ];
  victim._deathDesc = deathDescs[Math.floor(Math.random() * deathDescs.length)];

  if (G.connected) {
    callAIForNPCDeath(victim);
  } else {
    addMessage('horror', '远处传来一声凄厉的惨叫——');
    addMessage('horror', victim.icon + ' ' + victim.name + '的声音突然中断了。');
    addMessage('system', '⚠️ ' + victim.name + '已死亡');
    updateSAN(G.san - 8);
    addMessage('system', '🧠 SAN -8');
    showNotification('💀 ' + victim.name + '死了', 'horror');
  }
}

async function callAIForNPCDeath(victim) {
  var prompt = '你是恐怖游戏「苍白回廊」的叙述者。\n';
  prompt += '副本「' + G.dungeon.name + '」中，一个角色刚刚死亡。\n';
  prompt += '死者：' + victim.icon + ' ' + victim.name + '（' + victim.title + '）\n';
  prompt += '死亡方式：' + victim._deathDesc + '\n';
  prompt += '性格：' + (victim.personality || '普通人') + '\n';
  prompt += '口头禅：「' + (victim.quote || '') + '」\n\n';
  prompt += '用2-3句话描述这个角色的死亡场景。要恐怖、有冲击力。';
  prompt += '先描述异常声响，然后描述发现死亡的过程。不要用emoji。全程使用中文。';

  try {
    var messages = [
      { role: 'system', content: prompt }
    ];
    var fullResponse = await callOpenAICompatible(messages);

    if (fullResponse) {
      addMessageParagraphs('horror', fullResponse, 800, function() {
        addMessage('system', '⚠️ ' + victim.name + '已死亡');
        updateSAN(G.san - 8);
        addMessage('system', '🧠 SAN -8');
        showNotification('💀 ' + victim.name + '死了', 'horror');
      });
    } else {
      addMessage('horror', '远处传来一声凄厉的惨叫——' + victim.icon + ' ' + victim.name + '的声音突然中断了。');
      addMessage('system', '⚠️ ' + victim.name + '已死亡');
      updateSAN(G.san - 8);
      showNotification('💀 ' + victim.name + '死了', 'horror');
    }
  } catch(e) {
    addMessage('horror', '远处传来一声凄厉的惨叫——' + victim.icon + ' ' + victim.name + '的声音突然中断了。');
    addMessage('system', '⚠️ ' + victim.name + '已死亡');
    updateSAN(G.san - 8);
    showNotification('💀 ' + victim.name + '死了', 'horror');
  }
}
