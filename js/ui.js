function updateHP(val) {
  G.hp = Math.max(0, Math.min(G.maxHp, val));
  document.getElementById('hpBar').style.width = (G.hp / G.maxHp * 100) + '%';
  document.getElementById('hpText').textContent = G.hp + '/' + G.maxHp;
  if (G.hp <= 0) triggerDeath();
}

function updateSAN(val) {
  var old = G.san;
  G.san = Math.max(0, Math.min(G.maxSan, val));
  document.getElementById('sanBar').style.width = (G.san / G.maxSan * 100) + '%';
  document.getElementById('sanText').textContent = G.san + '/' + G.maxSan;
  // SAN下降特效
  if (G.san < old) {
    var eff = document.getElementById('sanEffect');
    eff.classList.add('active');
    setTimeout(function(){ eff.classList.remove('active'); }, 600);
  }
  // 低SAN暗角
  var vig = document.getElementById('sanVignette');
  if (G.san <= 30) { vig.style.opacity = (1 - G.san / 30) * 0.8; }
  else { vig.style.opacity = 0; }
  if (G.san <= 0) triggerInsanity();
}

function addMessage(type, text) {
  var area = document.getElementById('textArea');
  // 如果是AI叙述，先解析并移除指令标记
  if (type === 'narrator' || type === 'horror' || type === 'ai') {
    text = parseAndExecuteCommands(text);
  }
  var div = document.createElement('div');
  div.className = 'message msg-' + type;
  div.innerHTML = text;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  G.messageHistory.push({ type: type, text: text });
  while (area.children.length > 60) area.removeChild(area.firstChild);
}

/**
 * 将长文本按段落拆分，逐条显示（像预设文本一样一段一段出现）
 * @param {string} type - 消息类型：'narrator'、'ai'、'horror' 等
 * @param {string} text - 完整的AI回复文本
 * @param {number} interval - 每段之间的间隔毫秒数，默认600
 * @param {function} callback - 全部显示完后的回调
 */
function addMessageParagraphs(type, text, interval, callback) {
  if (!text || !text.trim()) {
    if (callback) callback();
    return;
  }
  interval = interval || 600;

  // 先按换行拆分段落
  var paragraphs = text.split('\n').filter(function(p) { 
    return p.trim().length > 0; 
  });

  // 如果只有一段但很长（超过150字），尝试按句号拆分
  if (paragraphs.length === 1 && paragraphs[0].length > 150) {
    var longText = paragraphs[0];
    var sentences = [];
    var buffer = '';
    
    for (var i = 0; i < longText.length; i++) {
      buffer += longText[i];
      // 在句号、感叹号、问号、省略号后断句（但要积累足够长度）
      if (buffer.length >= 30 && /[。！？…]/.test(longText[i])) {
        // 检查省略号是否完整（连续的…）
        if (longText[i] === '…' && i + 1 < longText.length && longText[i + 1] === '…') {
          continue;
        }
        sentences.push(buffer.trim());
        buffer = '';
      }
    }
    if (buffer.trim()) {
      sentences.push(buffer.trim());
    }
    
    // 只有成功拆出多段才替换
    if (sentences.length > 1) {
      paragraphs = sentences;
    }
  }

  // 如果拆分后还是只有一段，直接显示
  if (paragraphs.length <= 1) {
    addMessage(type, text.trim());
    if (callback) callback();
    return;
  }

  // 逐段显示
  var delay = 0;
  paragraphs.forEach(function(p, i) {
    setTimeout(function() {
      addMessage(type, p.trim());
    }, delay);
    delay += interval;
  });

  // 全部显示完后执行回调
  if (callback) {
    setTimeout(callback, delay);
  }
}

// 解析AI回复中的指令标记，执行效果，返回清理后的纯文本
function parseAndExecuteCommands(text) {
  if (!text) return text;
  var cleaned = text;

  // 解析 [HP:数值]
  cleaned = cleaned.replace(/\[HP:([-+]?\d+)\]/gi, function(match, val) {
    var n = parseInt(val);
    if (n < 0) {
      updateHP(G.hp + n);
      showNotification('❤️ HP ' + n, 'horror');
    } else if (n > 0) {
      updateHP(G.hp + n);
      showNotification('❤️ HP +' + n, 'clue');
    }
    return '';
  });

  // 解析 [SAN:数值]
  cleaned = cleaned.replace(/\[SAN:([-+]?\d+)\]/gi, function(match, val) {
    var n = parseInt(val);
    if (n < 0) {
      updateSAN(G.san + n);
      showNotification('🧠 SAN ' + n, 'horror');
    } else if (n > 0) {
      updateSAN(G.san + n);
      showNotification('🧠 SAN +' + n, 'clue');
    }
    return '';
  });

  // 解析 [ITEM_ADD:名称|图标|描述|可用|可带出]
  cleaned = cleaned.replace(/\[ITEM_ADD:([^\]]+)\]/gi, function(match, params) {
    var parts = params.split('|');
    if (parts.length >= 2) {
      var item = {
        name: parts[0].trim(),
        icon: parts[1] ? parts[1].trim() : '📦',
        description: parts[2] ? parts[2].trim() : '',
        usable: parts[3] ? parts[3].trim() === 'true' : false,
        permanent: parts[4] ? parts[4].trim() === 'true' : false
      };
      G.dungeonItems.push(item);
      updateItemCount();
      showNotification('获得：' + item.icon + ' ' + item.name, 'clue');
    }
    return '';
  });

  // 解析 [ITEM_REMOVE:名称]
  cleaned = cleaned.replace(/\[ITEM_REMOVE:([^\]]+)\]/gi, function(match, name) {
    var n = name.trim();
    var idx = -1;
    for (var i = 0; i < G.dungeonItems.length; i++) {
      if (G.dungeonItems[i].name === n) { idx = i; break; }
    }
    if (idx >= 0) {
      G.dungeonItems.splice(idx, 1);
      updateItemCount();
    }
    return '';
  });

  // 解析 [CLUE:线索名|描述|SAN消耗]
  cleaned = cleaned.replace(/\[CLUE:([^\]]+)\]/gi, function(match, params) {
    var parts = params.split('|');
    if (parts.length >= 1) {
      var clueName = parts[0].trim();
      var clueDesc = parts[1] ? parts[1].trim() : '';
      var sanCost = parts[2] ? parseInt(parts[2].trim()) : 0;
      if (!G.cluesFound.some(function(c) { return c.name === clueName; })) {
        G.cluesFound.push({ name: clueName, description: clueDesc });
        showNotification('🔍 发现线索：' + clueName, 'clue');
        if (sanCost) {
          updateSAN(G.san - Math.abs(sanCost));
          showNotification('🧠 SAN -' + Math.abs(sanCost), 'horror');
        }
      }
    }
    return '';
  });

  // 解析 [NOTIFY:文本|类型]
  cleaned = cleaned.replace(/\[NOTIFY:([^\]]+)\]/gi, function(match, params) {
    var parts = params.split('|');
    showNotification(parts[0].trim(), parts[1] ? parts[1].trim() : '');
    return '';
  });

  // 解析 [CHOICE:...] — 移除文本中的选项指令（选项由generateContextActions处理）
  cleaned = cleaned.replace(/\[CHOICE:[^\]]*\]/gi, '');

  // 解析 [NPC_APPEAR:...] — 移除
  cleaned = cleaned.replace(/\[NPC_APPEAR:[^\]]*\]/gi, '');

  // 解析 [UNLOCK:...] — 移除
  cleaned = cleaned.replace(/\[UNLOCK:[^\]]*\]/gi, '');

  // 解析 [MOVE:...] — 移除
  cleaned = cleaned.replace(/\[MOVE:[^\]]*\]/gi, '');

  // 解析 [DEATH_CHECK:...] — 移除
  cleaned = cleaned.replace(/\[DEATH_CHECK:[^\]]*\]/gi, '');

  // 解析 [ENDING:...] — 移除
  cleaned = cleaned.replace(/\[ENDING:[^\]]*\]/gi, '');

  // 解析 [ITEM_USE:...] — 移除
  cleaned = cleaned.replace(/\[ITEM_USE:[^\]]*\]/gi, '');

  // 清理残留的方括号指令（兜底）
  cleaned = cleaned.replace(/\[[A-Z_]+:[^\]]*\]/gi, '');

  // 清理多余空行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

function showTyping() {
  var area = document.getElementById('textArea');
  var div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}

function hideTyping() {
  var el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function showNotification(text, type) {
  var n = document.getElementById('notification');
  n.textContent = text;
  n.className = 'notification ' + (type || '') + ' show';
  setTimeout(function(){ n.classList.remove('show'); }, 2500);
}

function updateRoomDisplay(room) {
  document.getElementById('roomName').textContent = (room.icon || '') + ' ' + room.name;
  var imgEl = document.getElementById('sceneImage');
  imgEl.style.opacity = '0';
  setTimeout(function() {
    if (room.image) {
      imgEl.className = '';
      imgEl.style.width = '100%';
      imgEl.style.height = '100%';
      imgEl.style.position = 'relative';
      imgEl.innerHTML = '<img class="scene-image" src="' + room.image + '" alt="' + room.name + '" onerror="this.parentElement.innerHTML=\'<div class=scene-image-placeholder><span style=font-size:48px>' + (room.icon || '🌫️') + '</span></div><div id=sceneVignette></div>\'"><div id="sceneVignette"></div>';
    } else {
      imgEl.innerHTML = '<div class="scene-image-placeholder"><span style="font-size:48px">' + (room.icon || '🌫️') + '</span></div><div id="sceneVignette"></div>';
    }
    imgEl.style.opacity = '1';
  }, 200);
}

function updateItemCount() {
  var total = G.dungeonItems.length + G.permanentItems.length;
  document.getElementById('itemCount').textContent = total;
}

function updateFragmentDisplay() {
  document.getElementById('fragmentCount').textContent = G.soulFragments;
}

//  计时器 
function startDungeonTimer() {
  if (G.timerInterval) clearInterval(G.timerInterval);
  G.timerStarted = true;
  G.timerInterval = setInterval(function() {
    G.gameTime++;

    // 每60秒有概率触发NPC死亡事件
    if (G.gameTime % 60 === 0 && G.gameTime > 30) {
      if (Math.random() < 0.35) {
        triggerRandomNPCDeath();
      }
    }

    var limit = G.dungeon ? G.dungeon.timeLimit : 9999;
    var remaining = limit - G.gameTime;
    if (remaining <= 0) {
      clearInterval(G.timerInterval);
      triggerTimeOut();
      return;
    }
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    var timeEl = document.getElementById('timeText');
    timeEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    if (remaining <= 60) {
      timeEl.className = 'time-display urgent';
    }
  }, 1000);
}

function stopDungeonTimer() {
  if (G.timerInterval) clearInterval(G.timerInterval);
  G.timerStarted = false;
  document.getElementById('timeText').textContent = '--:--';
  document.getElementById('timeText').className = 'time-display';
}

// ========== 谜题输入框系统 ==========
var _currentPuzzle = null;
var _puzzleAttempts = 0;

function openPuzzleInput(puzzleConfig) {
  _currentPuzzle = puzzleConfig;
  _puzzleAttempts = 0;
  document.getElementById('puzzleInputPrompt').innerHTML = puzzleConfig.prompt || '你要写下什么？';
  document.getElementById('puzzleInputField').value = '';
  document.getElementById('puzzleInputHint').textContent = puzzleConfig.hint || '';
  document.getElementById('puzzleInputAttempts').textContent = '';
  var overlay = document.getElementById('puzzleInputOverlay');
    overlay.classList.add('show');
  setTimeout(function() {
    document.getElementById('puzzleInputField').focus();
  }, 100);
}

function closePuzzleInput() {
  document.getElementById('puzzleInputOverlay').classList.remove('show');
  _currentPuzzle = null;
  _puzzleAttempts = 0;
}

function submitPuzzleInput() {
  if (!_currentPuzzle) return;
  var input = document.getElementById('puzzleInputField').value.trim();
  if (!input) return;

  _puzzleAttempts++;
  var puzzle = _currentPuzzle;

  // 检查正确答案
  var isCorrect = false;
  if (puzzle.correct) {
    for (var i = 0; i < puzzle.correct.length; i++) {
      if (input === puzzle.correct[i] || input.indexOf(puzzle.correct[i]) >= 0) {
        isCorrect = true;
        break;
      }
    }
  }

  if (isCorrect) {
    closePuzzleInput();
    // 执行正确答案效果
    if (puzzle.onCorrect) {
      if (puzzle.onCorrect.message) addMessage('narrator', puzzle.onCorrect.message);
      if (puzzle.onCorrect.horror) {
        setTimeout(function() { addMessage('horror', puzzle.onCorrect.horror); }, 800);
      }
      if (puzzle.onCorrect.sanChange) updateSAN(G.san + puzzle.onCorrect.sanChange);
      if (puzzle.onCorrect.hpChange) updateHP(G.hp + puzzle.onCorrect.hpChange);
      if (puzzle.onCorrect.addItem) addDungeonItem(puzzle.onCorrect.addItem);
      if (puzzle.onCorrect.unlockRoom && G.dungeon) {
        G.dungeon.rooms[puzzle.onCorrect.unlockRoom].locked = false;
        addMessage('system', '🔓 新的区域已解锁');
      }
      if (puzzle.onCorrect.addClue) collectClue(puzzle.onCorrect.addClue);
      if (puzzle.onCorrect.triggerEnding) triggerEnding(puzzle.onCorrect.triggerEnding);
      if (puzzle.onCorrect.consumeItem && puzzle.itemId) removeDungeonItem(puzzle.itemId);
    }
    return;
  }

  // 检查彩蛋错误答案
  var easterEggTriggered = false;
  if (puzzle.easterEggs) {
    for (var keyword in puzzle.easterEggs) {
      if (puzzle.easterEggs.hasOwnProperty(keyword) && input.indexOf(keyword) >= 0) {
        var egg = puzzle.easterEggs[keyword];
        closePuzzleInput();
        if (egg.response) addMessage('horror', egg.response);
        if (egg.sanChange) updateSAN(G.san + egg.sanChange);
        if (egg.hpChange) updateHP(G.hp + egg.hpChange);
        if (egg.triggerEnding) triggerEnding(egg.triggerEnding);
        easterEggTriggered = true;
        break;
      }
    }
  }
  if (easterEggTriggered) return;

  // 普通错误
  var maxAttempts = puzzle.maxAttempts || 5;
  if (puzzle.defaultWrong) {
    if (puzzle.defaultWrong.response) addMessage('horror', puzzle.defaultWrong.response);
    if (puzzle.defaultWrong.sanChange) updateSAN(G.san + puzzle.defaultWrong.sanChange);
    if (puzzle.defaultWrong.hpChange) updateHP(G.hp + puzzle.defaultWrong.hpChange);
  } else {
    addMessage('system', '似乎不对...你感到一阵寒意。');
    updateSAN(G.san - 2);
  }

  // 更新尝试次数显示
  var remaining = maxAttempts - _puzzleAttempts;
  document.getElementById('puzzleInputAttempts').textContent = '剩余尝试：' + remaining + ' 次';
  document.getElementById('puzzleInputField').value = '';

  // 超过最大尝试次数
  if (_puzzleAttempts >= maxAttempts) {
    closePuzzleInput();
    if (puzzle.onFail) {
      if (puzzle.onFail.message) addMessage('horror', puzzle.onFail.message);
      if (puzzle.onFail.sanChange) updateSAN(G.san + puzzle.onFail.sanChange);
      if (puzzle.onFail.hpChange) updateHP(G.hp + puzzle.onFail.hpChange);
      if (puzzle.onFail.triggerEnding) triggerEnding(puzzle.onFail.triggerEnding);
    } else {
      addMessage('horror', '你的意识开始模糊...黑暗从四面八方涌来。');
      updateSAN(G.san - 10);
    }
  }
}
