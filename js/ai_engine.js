async function callAI(playerText) {
  if (!AI_CONFIG.baseUrl || !AI_CONFIG.apiKey) {
    addMessage('system', '⚠️ AI服务未配置，请在菜单 → AI服务设置中配置');
    openAISettings();
    return;
  }
  G._lastPlayerInput = playerText;
  showTyping();

  try {
    // 构建系统提示
    var systemPrompt = '';
    if (G.inDungeon && G.dungeon) {
      var room = G.dungeon.rooms[G.currentRoom];
      systemPrompt = buildDungeonAIPrompt(room, playerText);
    } else {
      systemPrompt = '你是「苍白回廊」无限流生存游戏的系统AI。玩家在大世界中。简短回复，保持神秘感。不要使用emoji。';
    }

    // ★ 注入玩家名字信息
    if (typeof getPlayerInfoForAI === 'function') {
      systemPrompt += getPlayerInfoForAI();
    }

    // ★ 注入规则事件指令
    if (typeof getRuleEventPromptInjection === 'function') {
      var ruleInjection = getRuleEventPromptInjection();
      if (ruleInjection) {
        systemPrompt += ruleInjection;
      }
    }

    // 构建消息列表
    var messages = [{ role: 'system', content: systemPrompt }];
    
    // 添加最近对话历史
    var recent = G.messageHistory.slice(-10);
    recent.forEach(function(m) {
      if (m.type === 'player') {
        messages.push({ role: 'user', content: m.text });
      } else if (m.type === 'ai' || m.type === 'narrator') {
        messages.push({ role: 'assistant', content: m.text });
      }
    });
    
    messages.push({ role: 'user', content: playerText });

    var fullResponse = '';
    stopController = new AbortController();
    
    await streamChatCompletion(
      messages,
      function(res) {
        fullResponse = res.fullContent || '';
        if (res.isFinished) {
          hideTyping();
          if (fullResponse) {
            parseAIResponse(fullResponse);
          }
        }
      },
      stopController.signal
    );
  } catch (e) {
    hideTyping();
    console.error('❌ AI调用失败:', e);
    if (e.name === 'AbortError') {
      addMessage('system', '（已停止生成）');
    } else {
      addMessage('system', '（AI响应异常：' + e.message + '）');
      if (typeof offlineFallback === 'function') {
        offlineFallback(playerText);
      }
    }
  }
}

function buildAIContext(playerText) {
  var systemPrompt = '';

  if (G.inDungeon && G.dungeon) {
    var room = G.dungeon.rooms[G.currentRoom];
    systemPrompt = buildDungeonAIPrompt(room, playerText);
  } else {
    systemPrompt = '你是「苍白回廊」无限流生存游戏的系统AI。玩家在大世界中。简短回复，保持神秘感。不要使用emoji。';
  }

  var messages = [{ role: 'system', content: systemPrompt }];

  var recent = G.messageHistory.slice(-10);
  recent.forEach(function(m) {
    if (m.type === 'player') {
      messages.push({ role: 'user', content: m.text });
    } else if (m.type === 'ai' || m.type === 'narrator') {
      messages.push({ role: 'assistant', content: m.text });
    }
  });

  messages.push({ role: 'user', content: playerText });
  return messages;
}

//  AI指令协议引擎 

var AI_COMMAND_HANDLERS = {
  'HP': function(params) {
    var val = parseInt(params, 10);
    if (!isNaN(val)) {
      updateHP(G.hp + val);
      if (val < 0) addMessage('system', '[ HP ' + val + ' ]');
      else addMessage('system', '[ HP +' + val + ' ]');
    }
  },
  'SAN': function(params) {
    var val = parseInt(params, 10);
    if (!isNaN(val)) {
      updateSAN(G.san + val);
      if (val < 0) addMessage('system', '[ SAN ' + val + ' ]');
      else addMessage('system', '[ SAN +' + val + ' ]');
    }
  },
  'ITEM_ADD': function(params) {
    var parts = params.split('|');
    var item = {
      id: 'ai_item_' + Date.now() + '_' + Math.floor(Math.random()*1000),
      name: (parts[0] || '未知物品').trim(),
      icon: (parts[1] || '📦').trim(),
      desc: (parts[2] || '').trim(),
      usable: parts[3] ? parts[3].trim() === 'true' : false,
      canTakeOut: parts[4] ? parts[4].trim() === 'true' : false,
      stackable: false,
      count: 1
    };
    addDungeonItem(item);
  },
  'ITEM_REMOVE': function(params) {
    var itemName = params.trim();
    var found = G.dungeonItems.find(function(i) { return i.name === itemName; });
    if (found) {
      removeDungeonItem(found.id);
      addMessage('system', '[ 失去物品：' + itemName + ' ]');
    }
    var permFound = G.permanentItems.find(function(i) { return i.name === itemName; });
    if (permFound) {
      removePermanentItem(permFound.id);
      addMessage('system', '[ 失去物品：' + itemName + ' ]');
    }
  },
  'ITEM_USE': function(params) {
    var itemName = params.trim();
    var found = G.dungeonItems.find(function(i) { return i.name === itemName; });
    if (found) {
      removeDungeonItem(found.id);
      addMessage('system', '[ 自动使用：' + itemName + ' ]');
      return;
    }
    var permFound = G.permanentItems.find(function(i) { return i.name === itemName; });
    if (permFound) {
      if (permFound.onUse) permFound.onUse();
      if (permFound.consumable) removePermanentItem(permFound.id);
      addMessage('system', '[ 自动使用：' + itemName + ' ]');
    }
  },
  'CLUE': function(params) {
    var parts = params.split('|');
    var clueName = (parts[0] || '未知线索').trim();
    var clueDesc = (parts[1] || '').trim();
    var sanCost = parts[2] ? parseInt(parts[2].trim(), 10) : 0;
    var clueId = 'ai_clue_' + Date.now() + '_' + Math.floor(Math.random()*1000);
    if (G.dungeon) {
      G.dungeon.clues[clueId] = {
        name: clueName,
        icon: '📋',
        description: clueDesc,
        sanCost: sanCost || 0,
        foundIn: G.currentRoom ? (G.dungeon.rooms[G.currentRoom] ? G.dungeon.rooms[G.currentRoom].name : '未知') : '未知'
      };
      collectClue(clueId);
    }
  },
  'UNLOCK': function(params) {
    var roomName = params.trim();
    if (!G.dungeon) return;
    var targetId = null;
    Object.keys(G.dungeon.rooms).forEach(function(rid) {
      if (G.dungeon.rooms[rid].name.includes(roomName)) targetId = rid;
    });
    if (targetId && G.dungeon.rooms[targetId].locked) {
      G.dungeon.rooms[targetId].locked = false;
      addMessage('system', '[ 区域解锁：' + G.dungeon.rooms[targetId].name + ' ]');
      renderMinimap();
    }
  },
  'MOVE': function(params) {
    var roomName = params.trim();
    if (!G.dungeon) return;
    
    // ★ 收集所有匹配的房间，按名称长度降序（精确匹配优先）
    var matches = [];
    Object.keys(G.dungeon.rooms).forEach(function(rid) {
      var rName = G.dungeon.rooms[rid].name;
      if (rName.includes(roomName) || roomName.includes(rName)) {
        matches.push({ id: rid, name: rName, exactMatch: rName === roomName });
      }
    });
    
    // 优先精确匹配
    var target = matches.find(function(m) { return m.exactMatch; });
    if (!target && matches.length > 0) {
      // 按名称长度降序，取最匹配的
      matches.sort(function(a, b) { return b.name.length - a.name.length; });
      target = matches[0];
    }
    
    if (target) {
      // ★ 标记AI已触发移动，moveToRoom中跳过重复的AI叙述
      G._aiMoveTriggered = true;
      setTimeout(function() { 
        moveToRoom(target.id); 
        G._aiMoveTriggered = false;
      }, 1000);
    }
  },
  'ENDING': function(params) {
    var endingId = params.trim();
    if (G.dungeon) {
      var ending = G.dungeon.endings.find(function(e) { return e.id === endingId; });
      if (ending) {
        triggerEnding(endingId);
      } else {
        triggerEnding('escape_good');
      }
    }
  },
  'DEATH_CHECK': function(params) {
    autoUseSurvivalItem(params.trim());
  },
  'NPC_APPEAR': function(params) {
    var parts = params.split('|');
    var npcName = (parts[0] || '???').trim();
    var npcIcon = (parts[1] || '👤').trim();
    var greeting = (parts[2] || '...').trim();
    addMessage('narrator', npcIcon + '「' + npcName + '」出现了。');
    addMessage('narrator', '「' + npcName + '」：' + '"' + greeting + '"');
  },
  'CHOICE': function(params) {
    var choices = params.split('|');
    var container = document.getElementById('quickActions');
    var html = '';
    choices.forEach(function(c) {
      var parts = c.split(':');
      var label = (parts[0] || '').trim();
      var action = (parts.slice(1).join(':') || label).trim();
      if (label) {
        var safeText = action.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        html += '<button class="action-btn" onclick="sendAIAction(\'' + safeText + '\')">' + label + '</button>';
      }
    });
    html += '<button class="action-btn primary" onclick="toggleInventory()">背包</button>';
    if (html && container) container.innerHTML = html;
  },
  'NOTIFY': function(params) {
    var parts = params.split('|');
    showNotification(parts[0].trim(), (parts[1] || '').trim());
  }
};

function sendAIAction(actionText) {
  document.getElementById('playerInput').value = actionText;
  sendPlayerInput();
}

function autoUseSurvivalItem(deathReason) {
  var doll = G.permanentItems.find(function(i) { return i.id === 'substitute_doll'; });
  if (doll) {
    removePermanentItem('substitute_doll');
    addMessage('horror', '你感到死亡的气息笼罩全身——');
    addMessage('system', '「替身娃娃」突然发出刺眼的光芒，随即碎裂成粉末...');
    addMessage('system', '[ 替身娃娃 已消耗，你从死亡边缘被拉了回来 ]');
    updateHP(3);
    showNotification('替身娃娃救了你一命', 'clue');
    return true;
  }
  var survivalItems = G.dungeonItems.filter(function(i) {
    return i.name.includes('护身') || i.name.includes('保命') || i.name.includes('复活') || i.name.includes('替身') || i.name.includes('免死');
  });
  if (survivalItems.length > 0) {
    var item = survivalItems[0];
    removeDungeonItem(item.id);
    addMessage('system', '[ ' + item.name + ' 自动触发，抵消了致命伤害 ]');
    updateHP(2);
    showNotification(item.name + '救了你', 'clue');
    return true;
  }
  return false;
}

// ★★★ AI输出格式防护系统 ★★★
// 当DeepSeek错误输出JSON格式时，自动提取中文叙述文本

function sanitizeAIResponse(text) {
  if (!text) return text;

  var trimmed = text.trim();

  // ★★★ 新增：检测DeepSeek输出的中文键名JSON ★★★
  var chineseJSONPattern = /\{\s*"[^"]{0,4}"\s*:\s*["'\[\{-]/;
  if (chineseJSONPattern.test(trimmed)) {
    console.warn('⚠️ 检测到中文键名JSON格式，正在提取叙述文本...');
    var chineseTexts = [];
    var strRegex = /"([^"]{10,})"/g;
    var strMatch;
    while ((strMatch = strRegex.exec(trimmed)) !== null) {
      var content = strMatch[1].trim();
      if (/[\u4e00-\u9fa5]/.test(content) && !/^\[?[A-Z_]+:/.test(content)) {
        chineseTexts.push(content);
      }
    }
    var cmdTexts = [];
    var cmdRegex2 = /\[([A-Z_]+:[^\]]*)\]/g;
    var cmdMatch;
    while ((cmdMatch = cmdRegex2.exec(trimmed)) !== null) {
      cmdTexts.push('[' + cmdMatch[1] + ']');
    }
    if (chineseTexts.length > 0) {
      var result = chineseTexts.join('\n\n');
      if (cmdTexts.length > 0) {
        result += '\n' + cmdTexts.join('\n');
      }
      return result;
    }
  }

  // 1. 清除末尾的系统标记泄露
  trimmed = trimmed.replace(/RANDOM_EVENT\s*-*>?\s*$/gm, '');
  trimmed = trimmed.replace(/^RANDOM_EVENT\s*-*>?\s*$/gm, '');
  trimmed = trimmed.replace(/-->\s*$/gm, '');

  // 2. 检测是否整体是JSON
  var isFullJSON = false;
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      var parsed = JSON.parse(trimmed);
      isFullJSON = true;
      console.warn('⚠️ AI输出了完整JSON，正在转换为叙述文本...');
      var extracted = extractNarrativeFromJSON(parsed);
      if (extracted && extracted.length > 10) {
        return extracted;
      }
    } catch(e) {
      // 不是有效JSON，可能是混合内容
    }
  }

  // 3. 检测混合内容：文本中嵌入了JSON片段
  if (!isFullJSON && (trimmed.indexOf('{"') >= 0 || trimmed.indexOf('[{') >= 0)) {
    // 尝试提取JSON片段并转换
    var jsonBlockRegex = /(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\])/g;
    var hasJSONBlock = false;
    var result = trimmed;

    // 检查是否有大段JSON（超过100字符的JSON块才处理）
    var jsonMatch;
    while ((jsonMatch = jsonBlockRegex.exec(trimmed)) !== null) {
      if (jsonMatch[0].length > 100) {
        hasJSONBlock = true;
        try {
          var blockParsed = JSON.parse(jsonMatch[0]);
          var blockText = extractNarrativeFromJSON(blockParsed);
          if (blockText && blockText.length > 10) {
            result = result.replace(jsonMatch[0], blockText);
          }
        } catch(e) {
          // 解析失败，用正则清理
          var cleaned = jsonMatch[0]
            .replace(/[\{\}\[\]]/g, ' ')
            .replace(/"[a-zA-Z_]*"\s*:/g, '')
            .replace(/"\s*,\s*"/g, '\n')
            .replace(/"/g, '')
            .replace(/,\s*-?\d+\s*,/g, ' ')
            .replace(/:\s*-?\d+/g, '')
            .replace(/\s{2,}/g, '\n')
            .trim();
          if (cleaned.length > 20) {
            result = result.replace(jsonMatch[0], cleaned);
          }
        }
      }
    }

    if (hasJSONBlock) {
      console.warn('⚠️ AI输出包含JSON片段，已清理');
      trimmed = result;
    }
  }

  // 4. 最终清理：移除残留的JSON语法符号
  trimmed = trimmed.replace(/^\s*\}\s*$/gm, '');
  trimmed = trimmed.replace(/^\s*\]\s*$/gm, '');
  trimmed = trimmed.replace(/^\s*\{\s*$/gm, '');
  trimmed = trimmed.replace(/^\s*\[\s*$/gm, '');
  trimmed = trimmed.replace(/RANDOM_EVENT\s*-*>?/g, '');
  trimmed = trimmed.replace(/\n{3,}/g, '\n\n');

  return trimmed.trim();
}

function extractNarrativeFromJSON(obj) {
  var texts = [];
  var commands = [];

  if (typeof obj === 'string') {
    // 检查是否是方括号指令
    if (/^\[([A-Z_]+):/.test(obj.trim())) {
      commands.push(obj.trim());
    } else if (obj.length > 3 && /[\u4e00-\u9fa5]/.test(obj)) {
      texts.push(obj);
    }
    return texts.join('\n\n') + (commands.length > 0 ? '\n' + commands.join('\n') : '');
  }

  if (Array.isArray(obj)) {
    obj.forEach(function(item) {
      if (typeof item === 'object' && item !== null) {
        // 处理选项对象 {"":"🏃", "":"逃跑", "":"你拔腿就跑...", "": -5, "": 0, "":""}
        var choiceTexts = extractChoiceFromObject(item);
        if (choiceTexts.narrative) {
          texts.push(choiceTexts.narrative);
        }
        if (choiceTexts.commands) {
          commands = commands.concat(choiceTexts.commands);
        }
      } else {
        var t = extractNarrativeFromJSON(item);
        if (t) texts.push(t);
      }
    });

    var result = texts.join('\n\n');
    if (commands.length > 0) result += '\n' + commands.join('\n');
    return result || null;
  }

  if (typeof obj === 'object' && obj !== null) {
    // 提取主要叙述文本
    var narrativeKeys = ['description', 'desc', 'text', 'message', 'content', 'narrative', 'scene', ''];
    var mainText = '';

    // 先找主文本
    for (var i = 0; i < narrativeKeys.length; i++) {
      var key = narrativeKeys[i];
      if (obj[key] && typeof obj[key] === 'string' && obj[key].length > 5) {
        mainText = obj[key];
        break;
      }
    }

    // 找所有中文字符串值
    if (!mainText) {
      Object.keys(obj).forEach(function(key) {
        var val = obj[key];
        if (typeof val === 'string' && val.length > 10 && /[\u4e00-\u9fa5]/.test(val)) {
          texts.push(val);
        }
      });
    } else {
      texts.push(mainText);
    }

    // 处理嵌套的选项数组
    Object.keys(obj).forEach(function(key) {
      var val = obj[key];
      if (Array.isArray(val)) {
        // 可能是choices数组，转换为[CHOICE:...]指令
        var choiceLabels = [];
        val.forEach(function(item) {
          if (typeof item === 'object' && item !== null) {
            var label = item[''] || item['label'] || item['name'] || '';
            var desc = item[''] || item['desc'] || item['action'] || label;
            if (label && typeof label === 'string') {
              var icon = item[''] || item['icon'] || '';
              choiceLabels.push((icon ? icon + ' ' : '') + label + ':' + desc);
            }
            // 提取选项中的叙述文本
            var itemNarrative = item[''] || item['message'] || item['text'] || '';
            if (itemNarrative && typeof itemNarrative === 'string' && itemNarrative.length > 10) {
              // 不直接显示选项结果文本，那是选择后才应该看到的
            }
          } else if (typeof item === 'string' && item.length > 3) {
            choiceLabels.push(item + ':' + item);
          }
        });
        if (choiceLabels.length > 0) {
          commands.push('[CHOICE:' + choiceLabels.join('|') + ']');
        }
      }
    });

    // 处理HP/SAN数值
    Object.keys(obj).forEach(function(key) {
      var val = obj[key];
      if (typeof val === 'number') {
        var lowerKey = key.toLowerCase();
        if (lowerKey.includes('hp') || lowerKey.includes('生命') || lowerKey === '') {
          if (val !== 0) commands.push('[HP:' + val + ']');
        } else if (lowerKey.includes('san') || lowerKey.includes('理智') || lowerKey === '') {
          if (val !== 0) commands.push('[SAN:' + val + ']');
        }
      }
    });

    // 处理时限
    Object.keys(obj).forEach(function(key) {
      var val = obj[key];
      if (typeof val === 'number' && (key.includes('time') || key.includes('时限') || key === '')) {
        // 时限信息，添加到叙述中
        if (val > 0) texts.push('⏰ 限时 ' + val + ' 秒');
      }
    });

    var result = texts.join('\n\n');
    if (commands.length > 0) result += '\n' + commands.join('\n');
    return result || null;
  }

  return null;
}

function extractChoiceFromObject(obj) {
  var result = { narrative: '', commands: [] };
  if (!obj || typeof obj !== 'object') return result;

  // 提取图标和标签
  var icon = obj[''] || obj['icon'] || '';
  var label = obj[''] || obj['label'] || obj['name'] || '';
  var message = obj[''] || obj['message'] || obj['text'] || obj['desc'] || '';
  var sanChange = obj[''] || obj['san'] || obj['sanChange'] || 0;
  var hpChange = obj[''] || obj['hp'] || obj['hpChange'] || 0;

  // 不在这里输出选项结果（那是选择后的内容）
  // 只返回空，让上层处理选项列表

  return result;
}

function parseAIResponse(text) {
  // ★★★ JSON防护层：检测并修复DeepSeek输出JSON格式的情况 ★★★
  text = sanitizeAIResponse(text);

  var cleanText = text;
  var commands = [];

  var cmdRegex = /\[([A-Z_]+):([^\]]*)\]/g;
  var match;
  while ((match = cmdRegex.exec(text)) !== null) {
    commands.push({ cmd: match[1], params: match[2], full: match[0] });
  }
  commands.forEach(function(c) {
    cleanText = cleanText.replace(c.full, '');
  });

  var simpleCmdRegex = /\[([A-Z_]+)\]/g;
  while ((match = simpleCmdRegex.exec(cleanText)) !== null) {
    if (AI_COMMAND_HANDLERS[match[1]]) {
      commands.push({ cmd: match[1], params: '', full: match[0] });
      cleanText = cleanText.replace(match[0], '');
    }
  }

  // ★★★ 过滤 DeepSeek 复读系统提示的内容 ★★★
  var filterPatterns = [
    /\*\*\[當前房間\]\*\*.*/g,
    /\*\*\[当前房间\]\*\*.*/g,
    /\*\*\[房間設定\]\*\*.*/g,
    /\*\*\[房间设定\]\*\*.*/g,
    /【副本】.*?[\n$]/g,
    /【当前房间】.*?[\n$]/g,
    /【當前房間】.*?[\n$]/g,
    /【房间描述】.*?[\n$]/g,
    /【房間描述】.*?[\n$]/g,
    /【房间设定】.*?[\n$]/g,
    /【房間設定】.*?[\n$]/g,
    /【玩家状态】.*?[\n$]/g,
    /【玩家信息.*?】.*?[\n$]/g,
    /【当前副本】.*?[\n$]/g,
    /【當前副本】.*?[\n$]/g,
    /玩家【健康】.*?[\n$]/g,
    /玩家【SAN】.*?[\n$]/g,
    /choice_setd.*?[\n$]/g,
    /body_state.*?[\n$]/g,
    /★重要★.*?[\n$]/g,
    /★玩家名字.*?[\n$]/g,
    /AI視其.*?[\n$]/g,
    /AI视其.*?[\n$]/g,
    /当前时间.*?剩余.*?[\n$]/g,
    /- - - - - - - -/g
  ];
  filterPatterns.forEach(function(pattern) {
    cleanText = cleanText.replace(pattern, '');
  });
  // ★★★ 过滤结束 ★★★

  cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();

  if (cleanText) {
    // ★ 分段显示AI回复，像预设文本一样一段一段出现
    addMessageParagraphs('ai', cleanText, 600);
}

  commands.forEach(function(c) {
    if (c.cmd === 'ENDING') {
      var clueCount = G.cluesFound ? G.cluesFound.length : 0;
      var timeElapsed = G.dungeon && G.dungeon.timeLimit ? (G.dungeon.timeLimit - G.remainingTime) : 0;
      if (clueCount < 2 && timeElapsed < 120) {
        console.warn('★ 拦截过早的ENDING指令:', c.params, '线索:', clueCount, '时间:', timeElapsed);
        addMessage('narrator', '你感到一股不祥的预感，但现在还不是结束的时候...');
        return;
      }
    }
    
    var handler = AI_COMMAND_HANDLERS[c.cmd];
    if (handler) {
      try { handler(c.params); } catch(e) { console.warn('AI指令执行失败:', c, e); }
    }
  });

  var hasChoice = commands.some(function(c) { return c.cmd === 'CHOICE'; });
  if (!hasChoice) {
    setTimeout(function() { generateContextActions(); }, 500);
  }

  if (G._lastPlayerInput) {
    checkPlayerMoveIntent(G._lastPlayerInput, commands);
  }
}
