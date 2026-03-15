// ============================================================
// ★★★ AI动态规则事件系统 - 让AI自己生成选择 ★★★
// ============================================================

// ============ 1. 增强AI的system prompt ============

var _original_buildSystemPrompt = typeof buildSystemPrompt === 'function' ? buildSystemPrompt : null;
var _original_callAI = typeof callAI === 'function' ? callAI : null;

function getRuleEventPromptInjection() {
  if (!G.inDungeon || !G.currentDungeonRules) return '';
  
  var rules = G.currentDungeonRules.rules;
  var ruleText = '';
  if (rules && rules.length > 0) {
    rules.forEach(function(r, i) {
      ruleText += (i + 1) + '.' + r.text;
      if (r.penalty === 'death') ruleText += '【致死】';
      ruleText += ' ';
    });
  }

  return '\n\n【突发事件系统】' + ruleText +
    '\n当出现紧急危险时，可在回复末尾附加：' +
    '\n<!--CHOICE_EVENT\n' +
    '{"title":"标题","timeLimit":10,"choices":[' +
    '{"icon":"🏃","label":"选项(4-8字)","result":"结果描述(30-80字)","sanChange":-5,"hpChange":0,"horror":false}' +
    ']}\nCHOICE_EVENT-->' +
    '\n规则：约每3次回复触发一次，2-3个选项，有安全/冒险/致命差异。不要每次都触发。';
}

// ============ 3. 拦截AI返回，解析选择事件 ============

var _original_addMessage = addMessage;
addMessage = function(type, text) {
  // 只处理AI返回的narrator和horror类型消息
  if ((type === 'narrator' || type === 'horror' || type === 'ai') && G.inDungeon) {
    var parsed = parseChoiceEvent(text);
    if (parsed) {
      // 显示纯文本部分（去掉JSON块）
      _original_addMessage(type, parsed.cleanText);
      
      // 延迟弹出选择面板
      setTimeout(function() {
        showAIChoiceEvent(parsed.eventData);
      }, 1500);
      
      return;
    }
  }
  
  // 正常显示
  _original_addMessage(type, text);
};

// ============ 4. 解析AI返回中的选择事件JSON ============

function parseChoiceEvent(text) {
  if (!text || typeof text !== 'string') return null;
  
  // 查找 <!--CHOICE_EVENT ... CHOICE_EVENT-->
  var startTag = '<!--CHOICE_EVENT';
  var endTag = 'CHOICE_EVENT-->';
  
  var startIdx = text.indexOf(startTag);
  if (startIdx === -1) return null;
  
  var endIdx = text.indexOf(endTag);
  if (endIdx === -1) return null;
  
  // 提取JSON部分
  var jsonStr = text.substring(startIdx + startTag.length, endIdx).trim();
  
  // 提取纯文本部分
  var cleanText = text.substring(0, startIdx).trim();
  if (endIdx + endTag.length < text.length) {
    cleanText += ' ' + text.substring(endIdx + endTag.length).trim();
  }
  cleanText = cleanText.trim();
  
  // 解析JSON
  try {
    var eventData = JSON.parse(jsonStr);
    
    // 验证数据结构
    if (!eventData.choices || !Array.isArray(eventData.choices) || eventData.choices.length === 0) {
      return null;
    }
    
    // 确保每个选项有必要字段
    eventData.choices = eventData.choices.filter(function(c) {
      return c.label && c.result;
    });
    
    if (eventData.choices.length === 0) return null;
    
    // 设置默认值
    eventData.choices.forEach(function(c) {
      if (!c.icon) c.icon = '❓';
      if (typeof c.sanChange !== 'number') c.sanChange = 0;
      if (typeof c.hpChange !== 'number') c.hpChange = 0;
      if (typeof c.horror !== 'boolean') c.horror = false;
    });
    
    if (!eventData.title) eventData.title = '⚠️ 突发事件';
    if (!eventData.description) eventData.description = '';
    
    return {
      cleanText: cleanText,
      eventData: eventData
    };
  } catch (e) {
    console.warn('规则事件JSON解析失败:', e, jsonStr);
    return null;
  }
}

// ============ 5. 显示AI生成的选择面板 ============

function showAIChoiceEvent(eventData) {
  // 创建全屏遮罩
  var overlay = document.createElement('div');
  overlay.id = 'aiChoiceOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);z-index:10001;display:flex;align-items:center;justify-content:center;padding:16px;animation:ruleEventFadeIn 0.4s ease';
  
  // 确保动画样式存在
  if (!document.getElementById('ruleEventStyles')) {
    var style = document.createElement('style');
    style.id = 'ruleEventStyles';
    style.textContent = 
      '@keyframes ruleEventFadeIn { from { opacity:0; } to { opacity:1; } }' +
      '@keyframes ruleEventSlideIn { from { transform:scale(0.85) translateY(20px); opacity:0; } to { transform:scale(1) translateY(0); opacity:1; } }' +
      '@keyframes ruleEventPulse { 0%,100% { box-shadow:0 0 15px rgba(139,0,0,0.3); } 50% { box-shadow:0 0 35px rgba(139,0,0,0.6); } }' +
      '@keyframes ruleEventTimerShrink { from { width:100%; } to { width:0%; } }' +
      '@keyframes choiceBtnAppear { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }' +
      '.ai-choice-btn { transition:all 0.2s !important; }' +
      '.ai-choice-btn:hover { background:rgba(139,50,50,0.5) !important; transform:scale(1.02) !important; border-color:#aa4444 !important; }' +
      '.ai-choice-btn:active { transform:scale(0.97) !important; }';
    document.head.appendChild(style);
  }
  
  // 弹窗容器
  var container = document.createElement('div');
  container.style.cssText = 'max-width:380px;width:100%;background:linear-gradient(145deg, #1a0808 0%, #0d0404 100%);border:2px solid #8b0000;border-radius:12px;padding:20px;animation:ruleEventSlideIn 0.4s ease, ruleEventPulse 3s infinite;max-height:80vh;overflow-y:auto';
  
  var html = '';
  
  // 标题区
  html += '<div style="text-align:center;margin-bottom:14px">';
  html += '<div style="font-size:9px;color:#ff4444;letter-spacing:4px;margin-bottom:4px;text-transform:uppercase">⚡ EMERGENCY ⚡</div>';
  html += '<div style="font-size:17px;color:#e0b0b0;font-weight:bold;text-shadow:0 0 10px rgba(200,0,0,0.4)">' + escapeHtml(eventData.title) + '</div>';
  html += '</div>';
  
  // 分隔线
  html += '<div style="border-bottom:1px solid rgba(139,0,0,0.5);margin:0 0 12px"></div>';
  
  // 描述（如果有）
  if (eventData.description) {
    html += '<div style="font-size:12px;color:#c8a8a8;line-height:1.8;margin-bottom:14px;padding:8px 10px;background:rgba(30,10,10,0.5);border-radius:6px;border-left:2px solid #5a2020">';
    html += escapeHtml(eventData.description);
    html += '</div>';
  }
  
  // 倒计时条
  if (eventData.timeLimit && eventData.timeLimit > 0) {
    html += '<div style="margin-bottom:14px">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
    html += '<span style="font-size:10px;color:#ff4444">⏰ 限时决定</span>';
    html += '<span id="aiChoiceCountdown" style="font-size:12px;color:#ff6666;font-weight:bold">' + eventData.timeLimit + 's</span>';
    html += '</div>';
    html += '<div style="background:rgba(50,20,20,0.6);border-radius:4px;height:4px;overflow:hidden">';
    html += '<div id="aiChoiceTimerBar" style="height:100%;background:linear-gradient(90deg,#ff6644,#ff0000);width:100%;transition:width 1s linear"></div>';
    html += '</div></div>';
  }
  
  // 选择按钮
  html += '<div style="display:flex;flex-direction:column;gap:8px">';
  eventData.choices.forEach(function(choice, idx) {
    var animDelay = (idx * 0.15) + 's';
    html += '<button class="ai-choice-btn" ';
    html += 'style="background:rgba(60,25,25,0.6);border:1px solid #5a2020;border-radius:8px;padding:12px 14px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;animation:choiceBtnAppear 0.3s ease ' + animDelay + ' both" ';
    html += 'onclick="resolveAIChoice(' + idx + ')">';
    html += '<span style="font-size:24px;flex-shrink:0;filter:drop-shadow(0 0 3px rgba(200,100,100,0.3))">' + (choice.icon || '❓') + '</span>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-size:13px;color:#e0c0c0;font-weight:bold">' + escapeHtml(choice.label) + '</div>';
    html += '</div>';
    html += '</button>';
  });
  html += '</div>';
  
  container.innerHTML = html;
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // 保存数据
  window._aiChoiceData = eventData;
  window._aiChoiceTimerId = null;
  window._aiChoiceResolved = false;
  
  // 启动倒计时
  if (eventData.timeLimit && eventData.timeLimit > 0) {
    var remaining = eventData.timeLimit;
    
    window._aiChoiceTimerId = setInterval(function() {
      remaining--;
      
      // 更新倒计时显示
      var countdown = document.getElementById('aiChoiceCountdown');
      if (countdown) countdown.textContent = remaining + 's';
      
      // 更新进度条
      var timerBar = document.getElementById('aiChoiceTimerBar');
      if (timerBar) {
        timerBar.style.width = ((remaining / eventData.timeLimit) * 100) + '%';
      }
      
      // 最后5秒闪烁警告
      if (remaining <= 5 && remaining > 0) {
        var countdownEl = document.getElementById('aiChoiceCountdown');
        if (countdownEl) {
          countdownEl.style.color = '#ff0000';
          countdownEl.style.fontSize = '14px';
        }
      }
      
      // 超时
      if (remaining <= 0) {
        clearInterval(window._aiChoiceTimerId);
        window._aiChoiceTimerId = null;
        
        if (!window._aiChoiceResolved) {
          // 找到最差选项
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
          
          _original_addMessage('horror', '⏰ 你犹豫太久了——恐惧吞噬了你的理智！');
          resolveAIChoice(worstIdx);
        }
      }
    }, 1000);
  }
  
  // 系统提示
  _original_addMessage('system', '⚡ 突发事件！请立刻做出选择！');
}

// ============ 6. 处理AI选择结果 ============

function resolveAIChoice(idx) {
  if (window._aiChoiceResolved) return;
  window._aiChoiceResolved = true;
  
  var eventData = window._aiChoiceData;
  if (!eventData || !eventData.choices || !eventData.choices[idx]) return;
  
  var choice = eventData.choices[idx];
  
  // 清除计时器
  if (window._aiChoiceTimerId) {
    clearInterval(window._aiChoiceTimerId);
    window._aiChoiceTimerId = null;
  }
  
  // 移除弹窗（带动画）
  var overlay = document.getElementById('aiChoiceOverlay');
  if (overlay) {
    overlay.style.transition = 'opacity 0.3s';
    overlay.style.opacity = '0';
    setTimeout(function() { overlay.remove(); }, 300);
  }
  
  // 显示结果
  setTimeout(function() {
    // 显示玩家选择
    _original_addMessage('system', '➤ 你选择了：' + choice.label);
    
    // 显示结果描述
    var msgType = choice.horror ? 'horror' : 'narrator';
    _original_addMessage(msgType, choice.result);
    
    // 应用数值变化
    if (choice.hpChange && choice.hpChange !== 0) {
      updateHP(G.hp + choice.hpChange);
      _original_addMessage('system', '❤️ HP ' + (choice.hpChange > 0 ? '+' : '') + choice.hpChange);
    }
    if (choice.sanChange && choice.sanChange !== 0) {
      updateSAN(G.san + choice.sanChange);
      _original_addMessage('system', '🧠 SAN ' + (choice.sanChange > 0 ? '+' : '') + choice.sanChange);
    }
    
    // 将选择结果反馈给AI，让AI继续剧情
    if (G.connected && typeof _original_callAI === 'function') {
      setTimeout(function() {
        var feedbackText = '【玩家在突发事件"' + eventData.title + '"中选择了"' + choice.label + '"。结果：' + choice.result.substring(0, 60) + '。请基于这个选择继续推进剧情。不要再次附加CHOICE_EVENT，先描述后续发展。】';
        _original_callAI(feedbackText);
      }, 2000);
    }
    
    // 检查死亡
    if (G.hp <= 0) {
      showNotification('💀 你死了', 'horror');
    }
    if (G.san <= 0) {
      showNotification('🧠 精神崩溃', 'horror');
    }
    
  }, 500);
  
  window._aiChoiceData = null;
}

// ============ 7. HTML转义工具 ============

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
