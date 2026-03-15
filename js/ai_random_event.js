// ============================================================
// ★★★ AI随机事件系统 - 让AI在房间叙述中自由生成突发事件 ★★★
// ============================================================
// 文件名: ai_random_event.js
// 加载顺序: 在 ai.js, ai_choice.js, rule_events.js 之后

(function() {

// ============ 1. 保存原始函数引用 ============

var _orig_generateRoomNarration = generateRoomNarration;

// ============ 2. 随机事件触发概率控制 ============

var RandomEventControl = {
  // 最近N次房间移动中触发过事件的次数
  _recentTriggers: [],
  _maxHistory: 8,
  
  // 基础触发概率（每次进入新房间时）
  baseProbability: 0.35,
  
  // 连续未触发时递增概率（保底机制）
  _missStreak: 0,
  
  shouldTrigger: function() {
    // 清理历史
    if (this._recentTriggers.length > this._maxHistory) {
      this._recentTriggers = this._recentTriggers.slice(-this._maxHistory);
    }
    
    // 最近2次内触发过 → 跳过（防止太频繁）
    var recentCount = this._recentTriggers.slice(-2).filter(Boolean).length;
    if (recentCount >= 1) {
      this._missStreak++;
      this._recentTriggers.push(false);
      return false;
    }
    
    // 计算概率：基础 + 连续未触发的递增
    var prob = this.baseProbability + (this._missStreak * 0.1);
    prob = Math.min(prob, 0.8); // 上限80%
    
    // SAN越低，触发概率越高（恐怖感递增）
    if (G.san && G.maxSan) {
      var sanRatio = G.san / G.maxSan;
      if (sanRatio < 0.3) prob += 0.2;
      else if (sanRatio < 0.5) prob += 0.1;
    }
    
    var roll = Math.random();
    var triggered = roll < prob;
    
    this._recentTriggers.push(triggered);
    if (triggered) {
      this._missStreak = 0;
    } else {
      this._missStreak++;
    }
    
    return triggered;
  },
  
  reset: function() {
    this._recentTriggers = [];
    this._missStreak = 0;
  }
};

// 暴露到全局
window.RandomEventControl = RandomEventControl;

// ============ 3. 构建随机事件的AI指令注入 ============

function getRandomEventPromptInjection(room) {
  var sanPercent = G.san && G.maxSan ? Math.round((G.san / G.maxSan) * 100) : 100;
  var hpPercent = G.hp && G.maxHp ? Math.round((G.hp / G.maxHp) * 100) : 100;
  
  var injection = '\n\n【随机突发事件系统——本次回复必须执行】\n';
  injection += '在你的叙述文本之后，你必须附加一个突发事件。\n';
  injection += '这个事件是叙述中自然发生的危险/异常/恐怖场景，玩家需要立刻做出反应。\n\n';
  
  injection += '【当前玩家状态】HP:' + G.hp + '/' + G.maxHp + ' SAN:' + G.san + '/' + G.maxSan + '\n';
  injection += '【当前房间】' + (room ? room.name : '未知') + '\n\n';
  
  injection += '【格式要求】在叙述文本最后换行，然后附加：\n';
  injection += '<!--RANDOM_EVENT\n';
  injection += '{\n';
  injection += '  "trigger": "叙述中触发事件的那句话（从你的叙述中摘取，作为事件弹窗的引入）",\n';
  injection += '  "title": "事件标题（4-8字，带emoji）",\n';
  injection += '  "description": "紧急情况描述（30-60字，描述玩家面临的危险）",\n';
  injection += '  "timeLimit": 8,\n';
  injection += '  "choices": [\n';
  injection += '    {\n';
  injection += '      "icon": "emoji",\n';
  injection += '      "label": "选项名（3-6字）",\n';
  injection += '      "result": "选择后的结果描述（40-80字，像小说一样写）",\n';
  injection += '      "sanChange": 0,\n';
  injection += '      "hpChange": 0,\n';
  injection += '      "horror": false\n';
  injection += '    }\n';
  injection += '  ]\n';
  injection += '}\n';
  injection += 'RANDOM_EVENT-->\n\n';
  
  injection += '【事件设计规则】\n';
  injection += '1. 事件必须与你刚才写的叙述内容直接相关（不能凭空出现无关的东西）\n';
  injection += '2. 必须提供2-3个选项，体现不同策略：\n';
  injection += '   - 一个"安全但有代价"的选项（SAN-2~-5）\n';
  injection += '   - 一个"冒险但可能有收获"的选项（SAN-8~-15 或 HP-2~-5）\n';
  injection += '   - 可选：一个"聪明/观察型"选项（低代价，但需要玩家注意到线索）\n';
  injection += '3. timeLimit根据紧急程度设置：生死攸关5-8秒，一般危险8-12秒，观察类12-15秒\n';
  injection += '4. 超时会自动选择最差选项，所以最差选项的惩罚要重（SAN-15~-25 或 HP-3~-5）\n';
  
  // 根据SAN值调整事件烈度
  if (sanPercent <= 30) {
    injection += '5. 玩家SAN很低（' + sanPercent + '%），事件应该更加诡异、幻觉化，选项中可以有"分不清现实"的描述\n';
    injection += '6. 降低SAN惩罚（已经很低了），改为HP惩罚或心理恐怖描写\n';
  } else if (sanPercent <= 50) {
    injection += '5. 玩家SAN偏低（' + sanPercent + '%），事件可以暗示玩家开始产生幻觉\n';
  }
  
  if (hpPercent <= 30) {
    injection += '7. 玩家HP很低（' + hpPercent + '%），避免大量HP惩罚，侧重SAN惩罚\n';
  }
  
  injection += '\n【事件类型参考（不限于此，请自由发挥）】\n';
  injection += '- 环境异变：墙壁渗血/地板塌陷/门突然锁上/灯光熄灭\n';
  injection += '- 实体遭遇：影子移动/镜中倒影不对/背后有呼吸声/远处有人形\n';
  injection += '- 物品异常：手中物品变形/文字自己改变/画中人物动了\n';
  injection += '- 身体异常：突然失去某种感官/手不受控制/看到不存在的东西\n';
  injection += '- 声音类：有人叫你名字/听到自己的声音/音乐盒自己响了\n';
  
  injection += '\n【绝对禁止】\n';
  injection += '- 不要在叙述正文中提到"选择""选项"等元游戏词汇\n';
  injection += '- 不要在叙述正文中写出事件的结果（结果只在choices的result里写）\n';
  injection += '- 叙述要在危险/异常发生的瞬间戛然而止，制造紧张感\n';
  injection += '- result中不要使用emoji\n';

  return injection;
}

// ============ 4. 重写 generateRoomNarration 注入随机事件 ============

generateRoomNarration = async function(roomId, room, isFirstVisit) {
  // 判断本次是否触发随机事件
  var shouldTriggerEvent = RandomEventControl.shouldTrigger();
  
  // 首次进入房间时降低触发概率（让玩家先看看环境）
  if (isFirstVisit && Math.random() > 0.4) {
    shouldTriggerEvent = false;
  }
  
  // 如果已经有规则事件要触发，跳过随机事件（避免叠加）
  if (G._ruleEventTriggered && window._currentRuleEvent) {
    shouldTriggerEvent = false;
  }
  
  // 如果不触发随机事件，使用原始函数
  if (!shouldTriggerEvent) {
    return _orig_generateRoomNarration(roomId, room, isFirstVisit);
  }
  
  // ===== 触发随机事件：重新构建prompt =====
  showTyping();
  
  // ★ 复用原始prompt构建逻辑（从ai.js中提取关键部分）
  var recentNPCLines = '';
  if (G._recentNPCDialogues && G._recentNPCDialogues.length > 0) {
    recentNPCLines = '\n【最近NPC已说过的台词——禁止重复使用】\n';
    G._recentNPCDialogues.forEach(function(line) {
      recentNPCLines += '- ' + line + '\n';
    });
  }
  
  var itemDesc = '';
  if (G.dungeonItems && G.dungeonItems.length > 0) {
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
  
  // 参与者信息
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
        if (p.quote) prompt += ' 口头禅（偶尔使用）：「' + p.quote + '」';
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
  
  if (recentNPCLines) prompt += recentNPCLines;
  if (G.dungeon.aiHints) prompt += '【副本氛围】' + G.dungeon.aiHints + '\n';
  
  // ===== 写作要求（与原始相同） =====
  prompt += '\n【写作要求——严格遵守】\n';
  prompt += '0. 只描写【参与者列表】中的角色，禁止自己编造新的NPC。\n';
  prompt += '1. 用第二人称"你"来写，像恐怖小说的一个段落\n';
  prompt += '2. 写6-12句话，要有画面感和沉浸感\n';
  prompt += '3. 必须包含感官细节：声音、气味、温度、触感、光线\n';
  prompt += '4. 如果有同行参与者，描写他们的反应和台词\n';
  prompt += '5. 恐怖描写要层层递进：先微妙不对劲→明确异常→暗示更深恐怖\n';
  prompt += '6. 如果不是首次进入，描写房间发生了什么变化\n';
  prompt += '7. ★★★ 叙述的最后必须以一个突发的危险/异常事件结尾，在最紧张的瞬间戛然而止 ★★★\n';
  prompt += '\n【NPC台词规则】\n';
  prompt += '- 口头禅最多整个副本出现1-2次，每次台词必须是对当前场景的具体反应\n';
  prompt += '- 如果有已说过的台词列表，禁止重复\n';
  
  prompt += '\n【禁止事项】\n';
  prompt += '- 禁止在叙述正文中使用emoji\n';
  prompt += '- 禁止提及具体数值\n';
  prompt += '- 禁止给玩家建议\n';
  prompt += '- 禁止使用"你可以..."引导语\n';
  prompt += '- 全程使用中文\n';
  
  // ===== ★ 注入随机事件指令 =====
  prompt += getRandomEventPromptInjection(room);
  
    // ===== 调用AI =====
  try {
    var messages = [
      { role: 'system', content: prompt }
    ];
    var fullResponse = await callOpenAICompatible(messages);

    hideTyping();

    if (fullResponse) {
      // ★ 先解析随机事件（在过滤之前，保持JSON完整）
      var parsed = parseRandomEvent(fullResponse);

      // ★ 再过滤系统提示复读（只过滤叙述文本）
      if (parsed && parsed.cleanText) {
        parsed.cleanText = filterAISystemEcho(parsed.cleanText);
      } else {
        fullResponse = filterAISystemEcho(fullResponse);
      }
          
      if (parsed && parsed.eventData) {
        // 有随机事件：先显示叙述，再弹出事件
        if (parsed.cleanText && parsed.cleanText.trim().length > 10) {
          addMessageParagraphs('narrator', parsed.cleanText, 700, function() {
            setTimeout(function() {
              showRandomEventPopup(parsed.eventData);
            }, 1200);
          });
          extractAndSaveNPCDialogues(parsed.cleanText);
        } else {
          showRandomEventPopup(parsed.eventData);
        }
      } else {
        // 解析失败，当普通叙述处理
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
    console.error('随机事件AI调用失败:', e);
    if (isFirstVisit && room.firstVisitText) {
      addMessage('narrator', room.firstVisitText);
    } else if (room.description) {
      addMessage('narrator', room.description);
    }
    setTimeout(function() { generateContextActions(); }, 500);
  }
};

// ============ 5. 过滤AI复读的系统提示 ============

function filterAISystemEcho(text) {
  if (!text) return '';
  text = text.replace(/\*\*$$當前房間$$\*\*.*/g, '');
  text = text.replace(/\*\*$$当前房间$$\*\*.*/g, '');
  text = text.replace(/\*\*$$房間設定$$\*\*.*/g, '');
  text = text.replace(/\*\*$$房间设定$$\*\*.*/g, '');
  text = text.replace(/【副本】.*?\n/g, '');
  text = text.replace(/【当前房间】.*?\n/g, '');
  text = text.replace(/【当前副本】.*?\n/g, '');
  text = text.replace(/玩家【健康】.*?\n/g, '');
  text = text.replace(/玩家【SAN】.*?\n/g, '');
  text = text.replace(/choice_setd.*?\n/g, '');
  // 删掉或注释掉这行
// text = text.replace(/\b[a-zA-Z]{4,}\b/g, '');
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

// ============ 6. 解析随机事件标记 ============

function parseRandomEvent(text) {
  if (!text || typeof text !== 'string') return null;
  
  var startTag = '<!--RANDOM_EVENT';
  var endTag = 'RANDOM_EVENT-->';
  
  var startIdx = text.indexOf(startTag);
  if (startIdx === -1) {
    startTag = '<!--CHOICE_EVENT';
    endTag = 'CHOICE_EVENT-->';
    startIdx = text.indexOf(startTag);
    if (startIdx === -1) {
      // 最后尝试：直接找JSON块
      return tryExtractJsonDirect(text);
    }
  }
  
  var endIdx = text.indexOf(endTag);
  if (endIdx === -1) {
    // 有开始标签但没有结束标签，尝试从开始标签后提取JSON
    var afterStart = text.substring(startIdx + startTag.length);
    var cleanText = text.substring(0, startIdx).trim();
    return tryParseJsonBlock(afterStart, cleanText);
  }
  
  var jsonStr = text.substring(startIdx + startTag.length, endIdx).trim();
  var cleanText = text.substring(0, startIdx).trim();
  
  if (endIdx + endTag.length < text.length) {
    var afterText = text.substring(endIdx + endTag.length).trim();
    if (afterText) cleanText += '\n' + afterText;
  }
  cleanText = cleanText.trim();
  
  return tryParseJsonBlock(jsonStr, cleanText);
}

function tryExtractJsonDirect(text) {
  // 尝试从文本中直接找到包含choices的JSON
  var patterns = [
    /\{[\s\S]*?"choices"\s*:\s*\[[\s\S]*?\]\s*\}/,
    /\{[\s\S]*?"label"\s*:[\s\S]*?"result"\s*:[\s\S]*?\}/
  ];
  
  for (var i = 0; i < patterns.length; i++) {
    var match = text.match(patterns[i]);
    if (match) {
      var jsonStr = match[0];
      var cleanText = text.substring(0, text.indexOf(jsonStr)).trim();
      return tryParseJsonBlock(jsonStr, cleanText);
    }
  }
  return null;
}

function tryParseJsonBlock(jsonStr, cleanText) {
  if (!jsonStr || jsonStr.trim().length < 10) return null;
  
  // 清理JSON字符串
  jsonStr = jsonStr.trim();
  
  // 如果不以{开头，尝试找到第一个{
  var braceIdx = jsonStr.indexOf('{');
  if (braceIdx > 0) {
    jsonStr = jsonStr.substring(braceIdx);
  }
  if (braceIdx === -1) return null;
  
  // 找到最后一个}
  var lastBrace = jsonStr.lastIndexOf('}');
  if (lastBrace !== -1) {
    jsonStr = jsonStr.substring(0, lastBrace + 1);
  }
  
  // 多次尝试解析
  var eventData = null;
  
  // 尝试1：直接解析
  try {
    eventData = JSON.parse(jsonStr);
  } catch(e1) {
    // 尝试2：修复常见问题
    try {
      var fixed = jsonStr
        .replace(/,\s*}/g, '}')
        .replace(/,\s*\]/g, ']')
        .replace(/'/g, '"')
        .replace(/[\r\n]+/g, ' ')
        .replace(/\t/g, ' ');
      eventData = JSON.parse(fixed);
    } catch(e2) {
      // 尝试3：更激进的修复
      try {
        var fixed2 = fixed
          .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
          .replace(/""+/g, '"');
        eventData = JSON.parse(fixed2);
      } catch(e3) {
        // 尝试4：用正则手动提取字段
        eventData = manualExtractEvent(jsonStr);
      }
    }
  }
  
  if (!eventData) return null;
  
  // 验证和修复字段
  return validateEventData(eventData, cleanText);
}

function manualExtractEvent(jsonStr) {
  // 手动用正则提取关键信息
  var titleMatch = jsonStr.match(/"title"\s*:\s*"([^"]*?)"/);
  var descMatch = jsonStr.match(/"description"\s*:\s*"([^"]*?)"/);
  var triggerMatch = jsonStr.match(/"trigger"\s*:\s*"([^"]*?)"/);
  var timeLimitMatch = jsonStr.match(/"timeLimit"\s*:\s*(\d+)/);
  
  // 提取choices数组
  var choices = [];
  var choiceRegex = /\{\s*"icon"\s*:\s*"([^"]*?)"\s*,\s*"label"\s*:\s*"([^"]*?)"\s*,\s*"result"\s*:\s*"([^"]*?)"\s*,\s*"sanChange"\s*:\s*(-?\d+)\s*,\s*"hpChange"\s*:\s*(-?\d+)/g;
  var cm;
  while ((cm = choiceRegex.exec(jsonStr)) !== null) {
    choices.push({
      icon: cm[1],
      label: cm[2],
      result: cm[3],
      sanChange: parseInt(cm[4]) || 0,
      hpChange: parseInt(cm[5]) || 0,
      horror: false
    });
  }
  
  // 如果上面的正则没匹配到，尝试更宽松的匹配
  if (choices.length === 0) {
    var labelMatches = jsonStr.match(/"label"\s*:\s*"([^"]*?)"/g);
    var resultMatches = jsonStr.match(/"result"\s*:\s*"([^"]*?)"/g);
    var iconMatches = jsonStr.match(/"icon"\s*:\s*"([^"]*?)"/g);
    var sanMatches = jsonStr.match(/"sanChange"\s*:\s*(-?\d+)/g);
    var hpMatches = jsonStr.match(/"hpChange"\s*:\s*(-?\d+)/g);
    
    if (labelMatches && resultMatches) {
      for (var i = 0; i < labelMatches.length; i++) {
        var label = labelMatches[i].match(/"label"\s*:\s*"([^"]*?)"/)[1];
        var result = resultMatches[i] ? resultMatches[i].match(/"result"\s*:\s*"([^"]*?)"/)[1] : '...';
        var icon = iconMatches && iconMatches[i] ? iconMatches[i].match(/"icon"\s*:\s*"([^"]*?)"/)[1] : '❓';
        var san = sanMatches && sanMatches[i] ? parseInt(sanMatches[i].match(/(-?\d+)/)[1]) : 0;
        var hp = hpMatches && hpMatches[i] ? parseInt(hpMatches[i].match(/(-?\d+)/)[1]) : 0;
        
        choices.push({
          icon: icon,
          label: label,
          result: result,
          sanChange: san,
          hpChange: hp,
          horror: false
        });
      }
    }
  }
  
  if (choices.length === 0) return null;
  
  return {
    title: titleMatch ? titleMatch[1] : '⚠️ 突发状况',
    description: descMatch ? descMatch[1] : '',
    trigger: triggerMatch ? triggerMatch[1] : '',
    timeLimit: timeLimitMatch ? parseInt(timeLimitMatch[1]) : 8,
    choices: choices
  };
}

function validateEventData(eventData, cleanText) {
  if (!eventData.choices || !Array.isArray(eventData.choices) || eventData.choices.length === 0) {
    return null;
  }
  
  eventData.choices = eventData.choices.filter(function(c) {
    return c.label && c.result;
  });
  if (eventData.choices.length === 0) return null;
  
  if (!eventData.title) eventData.title = '⚠️ 突发状况';
  if (!eventData.description) eventData.description = '';
  if (!eventData.timeLimit || eventData.timeLimit < 3) eventData.timeLimit = 8;
  if (eventData.timeLimit > 20) eventData.timeLimit = 15;
  
  eventData.choices.forEach(function(c) {
    if (!c.icon) c.icon = '❓';
    if (typeof c.sanChange !== 'number') c.sanChange = 0;
    if (typeof c.hpChange !== 'number') c.hpChange = 0;
    if (typeof c.horror !== 'boolean') c.horror = false;
    c.sanChange = Math.max(-30, Math.min(10, c.sanChange));
    c.hpChange = Math.max(-8, Math.min(5, c.hpChange));
  });
  
  return {
    cleanText: cleanText || '',
    eventData: eventData
  };
}

// ============ 7. 随机事件弹窗UI ============

function showRandomEventPopup(eventData) {
  // 防止与其他弹窗叠加
  var existingOverlay = document.getElementById('randomEventOverlay') || 
                         document.getElementById('ruleEventOverlay') || 
                         document.getElementById('aiChoiceOverlay');
  if (existingOverlay) {
    console.warn('已有事件弹窗，跳过随机事件');
    return;
  }
  
  // 确保样式存在
  if (!document.getElementById('randomEventStyles')) {
    var style = document.createElement('style');
    style.id = 'randomEventStyles';
    style.textContent = 
      '@keyframes randomEventFadeIn { from { opacity:0; } to { opacity:1; } }' +
      '@keyframes randomEventSlideUp { from { transform:translateY(40px) scale(0.9); opacity:0; } to { transform:translateY(0) scale(1); opacity:1; } }' +
      '@keyframes randomEventGlow { 0%,100% { box-shadow:0 0 15px rgba(180,50,50,0.3), inset 0 0 15px rgba(100,0,0,0.1); } 50% { box-shadow:0 0 35px rgba(180,50,50,0.6), inset 0 0 25px rgba(100,0,0,0.2); } }' +
      '@keyframes randomEventTimerBar { from { width:100%; } to { width:0%; } }' +
      '@keyframes randomEventShake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-3px); } 75% { transform:translateX(3px); } }' +
      '@keyframes randomChoiceAppear { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }' +
      '.random-event-btn { transition:all 0.15s ease !important; }' +
      '.random-event-btn:hover { background:rgba(160,50,50,0.5) !important; border-color:#cc5555 !important; transform:scale(1.03) !important; }' +
      '.random-event-btn:active { transform:scale(0.96) !important; }' +
      '#randomEventOverlay.shake { animation:randomEventShake 0.3s ease !important; }';
    document.head.appendChild(style);
  }
  
  // 创建遮罩
  var overlay = document.createElement('div');
  overlay.id = 'randomEventOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10002;display:flex;align-items:center;justify-content:center;padding:16px;animation:randomEventFadeIn 0.3s ease';
  
  // 容器
  var container = document.createElement('div');
  container.id = 'randomEventContainer';
  container.style.cssText = 'max-width:380px;width:100%;background:linear-gradient(160deg, #1c0a0a 0%, #0a0303 50%, #150808 100%);border:2px solid #8b2020;border-radius:14px;padding:22px;animation:randomEventSlideUp 0.4s ease, randomEventGlow 2.5s infinite;max-height:82vh;overflow-y:auto';
  
  var html = '';
  
  // 顶部警告条
  html += '<div style="text-align:center;margin-bottom:16px">';
  html += '<div style="display:inline-block;background:rgba(180,30,30,0.3);border:1px solid rgba(180,30,30,0.5);border-radius:20px;padding:3px 14px;margin-bottom:8px">';
  html += '<span style="font-size:9px;color:#ff5555;letter-spacing:3px;font-weight:bold">⚡ 突发事件 ⚡</span>';
  html += '</div>';
  html += '<div style="font-size:18px;color:#e8c0c0;font-weight:bold;text-shadow:0 0 12px rgba(200,50,50,0.4);line-height:1.4">' + escapeHtml(eventData.title) + '</div>';
  html += '</div>';
  
  // 分隔线
  html += '<div style="border-bottom:1px solid rgba(139,32,32,0.5);margin:0 0 14px"></div>';
  
  // 触发文本（从叙述中摘取的那句话）
  if (eventData.trigger) {
    html += '<div style="font-size:12px;color:#a08080;line-height:1.7;margin-bottom:12px;padding:10px 12px;background:rgba(20,8,8,0.6);border-radius:8px;border-left:3px solid #6a2020;font-style:italic">';
    html += '「' + escapeHtml(eventData.trigger) + '」';
    html += '</div>';
  }
  
  // 描述
  if (eventData.description) {
        html += '<div style="font-size:12.5px;color:#c8a8a8;line-height:1.8;margin-bottom:16px;padding:10px 12px;background:rgba(15,5,5,0.5);border-radius:6px">';
    html += escapeHtml(eventData.description);
    html += '</div>';
  }
  
  // 倒计时条
  if (eventData.timeLimit && eventData.timeLimit > 0) {
    html += '<div style="margin-bottom:16px">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">';
    html += '<span style="font-size:10px;color:#ff5555;font-weight:bold">⏰ 限时反应</span>';
    html += '<span id="randomEventCountdown" style="font-size:13px;color:#ff6666;font-weight:bold">' + eventData.timeLimit + 's</span>';
    html += '</div>';
    html += '<div style="background:rgba(50,15,15,0.6);border-radius:4px;height:5px;overflow:hidden">';
    html += '<div id="randomEventTimerBar" style="height:100%;background:linear-gradient(90deg,#ff6644,#cc0000);width:100%;transition:width 1s linear"></div>';
    html += '</div></div>';
  }
  
  // 选择按钮
  html += '<div style="display:flex;flex-direction:column;gap:9px">';
  eventData.choices.forEach(function(choice, idx) {
    var animDelay = (idx * 0.12) + 's';
    html += '<button class="random-event-btn" ';
    html += 'style="background:rgba(70,25,25,0.6);border:1px solid #5a2020;border-radius:9px;padding:13px 14px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:11px;animation:randomChoiceAppear 0.3s ease ' + animDelay + ' both" ';
    html += 'onclick="resolveRandomEvent(' + idx + ')">';
    html += '<span style="font-size:26px;flex-shrink:0;filter:drop-shadow(0 0 4px rgba(200,80,80,0.3))">' + (choice.icon || '❓') + '</span>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-size:13.5px;color:#e0c0c0;font-weight:bold">' + escapeHtml(choice.label) + '</div>';
    html += '</div>';
    html += '</button>';
  });
  html += '</div>';
  
  container.innerHTML = html;
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // 保存数据
  window._randomEventData = eventData;
  window._randomEventTimerId = null;
  window._randomEventResolved = false;
  
  // 启动倒计时
  if (eventData.timeLimit && eventData.timeLimit > 0) {
    var remaining = eventData.timeLimit;
    
    window._randomEventTimerId = setInterval(function() {
      remaining--;
      
      var countdown = document.getElementById('randomEventCountdown');
      if (countdown) countdown.textContent = remaining + 's';
      
      var timerBar = document.getElementById('randomEventTimerBar');
      if (timerBar) {
        timerBar.style.width = ((remaining / eventData.timeLimit) * 100) + '%';
      }
      
      // 最后3秒闪烁+震动
      if (remaining <= 3 && remaining > 0) {
        if (countdown) {
          countdown.style.color = '#ff0000';
          countdown.style.fontSize = '15px';
        }
        var ov = document.getElementById('randomEventOverlay');
        if (ov) {
          ov.classList.add('shake');
          setTimeout(function() { ov.classList.remove('shake'); }, 300);
        }
      }
      
      // 超时
      if (remaining <= 0) {
        clearInterval(window._randomEventTimerId);
        window._randomEventTimerId = null;
        
        if (!window._randomEventResolved) {
          // 找最差选项
          var worstIdx = 0;
          var worstScore = 0;
          eventData.choices.forEach(function(c, i) {
            var score = Math.abs(c.sanChange || 0) + Math.abs(c.hpChange || 0) * 3;
            if (c.horror) score += 10;
            if (score > worstScore) {
              worstScore = score;
              worstIdx = i;
            }
          });
          
          addMessage('horror', '⏰ 你犹豫太久了——恐惧吞噬了你的理智！');
          resolveRandomEvent(worstIdx);
        }
      }
    }, 1000);
  }
  
  // 系统提示
  addMessage('system', '⚡ 突发事件！请立刻做出选择！');
}

// ============ 8. 处理随机事件选择结果 ============

window.resolveRandomEvent = function(idx) {
  if (window._randomEventResolved) return;
  window._randomEventResolved = true;
  
  var eventData = window._randomEventData;
  if (!eventData || !eventData.choices || !eventData.choices[idx]) return;
  
  var choice = eventData.choices[idx];
  
  // 清除计时器
  if (window._randomEventTimerId) {
    clearInterval(window._randomEventTimerId);
    window._randomEventTimerId = null;
  }
  
  // 移除弹窗（带动画）
  var overlay = document.getElementById('randomEventOverlay');
  if (overlay) {
    overlay.style.transition = 'opacity 0.3s';
    overlay.style.opacity = '0';
    setTimeout(function() { overlay.remove(); }, 300);
  }
  
  // 显示结果
  setTimeout(function() {
    // 显示玩家选择
    addMessage('system', '➤ 你选择了：' + choice.label);
    
    // 显示结果描述
    var msgType = choice.horror ? 'horror' : 'narrator';
    addMessage(msgType, choice.result);
    
    // 应用数值变化
    if (choice.hpChange && choice.hpChange !== 0) {
      updateHP(G.hp + choice.hpChange);
      addMessage('system', '❤️ HP ' + (choice.hpChange > 0 ? '+' : '') + choice.hpChange);
    }
    if (choice.sanChange && choice.sanChange !== 0) {
      updateSAN(G.san + choice.sanChange);
      addMessage('system', '🧠 SAN ' + (choice.sanChange > 0 ? '+' : '') + choice.sanChange);
    }
    
    // 检查死亡
    if (G.hp <= 0) {
      showNotification('💀 你死了', 'horror');
    }
    if (G.san <= 0) {
      showNotification('🧠 精神崩溃', 'horror');
    }
    
  }, 500);
  
  window._randomEventData = null;
};

// ============ 9. 副本进入时重置计数器 ============

var _enterDungeon_randomEvent = enterDungeon;
enterDungeon = function(config) {
  RandomEventControl.reset();
  _enterDungeon_randomEvent(config);
};

console.log('✅ AI随机事件系统加载完成 - AI将在房间叙述中自由生成突发选择事件');

})();

