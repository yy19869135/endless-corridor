function findContactByCode(code) {
  return G.contacts.find(function(c) { return c.code === code; });
}

function addContactByCode(inputCode) {
  inputCode = inputCode.toUpperCase().trim().replace(/\s+/g, '');
  
  // 尝试通过复杂编号查找
  var internalCode = CODE_LOOKUP[inputCode];
  
  // 如果直接输入的就是内部code（兼容）
  if (!internalCode && CHARACTER_DB[inputCode]) {
    internalCode = inputCode;
  }
  
  // 也支持不带横杠的输入（如 K73NWP -> K7-3NWP）
  if (!internalCode && inputCode.length === 6 && inputCode.indexOf('-') === -1) {
    var withDash = inputCode.substring(0, 2) + '-' + inputCode.substring(2);
    internalCode = CODE_LOOKUP[withDash];
  }
  
  // ★ 预设编号没找到，尝试从AI对话中匹配动态角色（如炮灰NPC）
  if (!internalCode) {
    var dynamicChar = tryMatchDynamicCharacter(inputCode);
    if (dynamicChar) {
      var dynCode = 'DYN-' + Date.now();
      FIXED_DISPLAY_CODES[dynCode] = inputCode;
      CODE_LOOKUP[inputCode] = dynCode;
      createCharacter({
        id: dynamicChar.name,
        code: dynCode,
        name: dynamicChar.name,
        type: 'dynamic',
        icon: dynamicChar.icon || '👤',
        gender: dynamicChar.gender || 'unknown',
        age: '?',
        title: dynamicChar.title || '副本中遇到的人',
        personality: dynamicChar.personality || ['未知'],
        strength: 5, intelligence: 5, luck: 5,
        faction: 'neutral',
        specialSkill: '未知',
        backstory: '在副本「' + (G.dungeon ? G.dungeon.name : '未知') + '」中遇到的人。',
        greeting: dynamicChar.quote || '......',
        chatStyle: '根据之前互动中展现的性格来回复',
        romanceable: true,
        relationEvents: {
          30: '你们的关系开始变得熟悉。',
          50: '对方向你敞开了心扉。',
          70: '你们之间建立了深厚的信任。',
          90: '"你是我在这个世界上最重要的人。"'
        }
      });
      internalCode = dynCode;
      addMessage('system', '📱 识别到联系人：' + dynamicChar.icon + ' ' + dynamicChar.name);
    }
  }
  
  // ★ 兜底：编号格式正确但找不到预设角色，创建未知联系人
  if (!internalCode) {
    if (/^[A-Z0-9]{2}-[A-Z0-9]{3,5}$/.test(inputCode)) {
      var unknownName = tryExtractNameNearCode(inputCode);
      var dynCode2 = 'DYN-' + Date.now();
      FIXED_DISPLAY_CODES[dynCode2] = inputCode;
      CODE_LOOKUP[inputCode] = dynCode2;
      createCharacter({
        id: (unknownName || '未知') + '_' + inputCode,
        code: dynCode2,
        name: unknownName || '未知联系人',
        type: 'dynamic',
        icon: unknownName ? '👤' : '❓',
        gender: 'unknown',
        age: '?',
        title: unknownName ? '副本中遇到的人' : '身份待确认',
        personality: ['未知'],
        strength: 5, intelligence: 5, luck: 5,
        faction: 'neutral',
        specialSkill: '未知',
        backstory: '通过编号 ' + inputCode + ' 添加的联系人。',
        greeting: unknownName ? '......你找我？' : '......你是谁？',
        chatStyle: '谨慎、试探性的',
        romanceable: true,
        relationEvents: { 30: '对方开始信任你。', 50: '对方告诉了你更多。', 70: '你们成为了可靠的伙伴。', 90: '"认识你真好。"' }
      });
      internalCode = dynCode2;
      if (unknownName) {
        addMessage('system', '📱 识别到联系人：' + unknownName);
      } else {
        addMessage('system', '📱 编号 ' + inputCode + ' 已记录，联系人身份待确认...');
      }
    } else {
      showNotification('⚠️ 编号格式错误', 'horror');
      addMessage('system', '📱 编号格式应为 XX-XXXX（如 K7-3NWP），请确认后重试。');
      return false;
    }
  }
  
  if (findContactByCode(internalCode)) {
    showNotification('该联系人已在通讯录中', '');
    return false;
  }
  
  var charData = CHARACTER_DB[internalCode];
  if (!charData) {
    showNotification('⚠️ 系统异常', 'horror');
    return false;
  }
  
  sendFriendRequest(internalCode);
  return true;
}

// ★ 从AI对话和副本参与者中匹配动态角色
function tryMatchDynamicCharacter(inputCode) {
  // 1. 检查当前副本参与者（炮灰NPC）
  if (G.currentParticipants) {
    for (var i = 0; i < G.currentParticipants.length; i++) {
      var p = G.currentParticipants[i];
      if (p.type === 'player') continue;
      if (checkCodeMentionedByNPC(inputCode, p.name)) {
        return {
          name: p.name,
          icon: p.icon,
          gender: p.gender,
          title: p.title,
          personality: p.personality ? [p.personality] : ['普通人'],
          quote: p.quote
        };
      }
    }
  }
  
  // 2. 检查炮灰模板库
  for (var j = 0; j < FODDER_TEMPLATES.length; j++) {
    var f = FODDER_TEMPLATES[j];
    if (checkCodeMentionedByNPC(inputCode, f.name)) {
      return {
        name: f.name,
        icon: f.icon,
        gender: f.gender,
        title: f.desc,
        personality: [f.personality],
        quote: f.quote
      };
    }
  }
  
  // 3. 从对话中提取名字
  var nameFromChat = tryExtractNameNearCode(inputCode);
  if (nameFromChat) {
    // 尝试从参与者中找到这个名字的详细信息
    var detailedInfo = null;
    if (G.currentParticipants) {
      detailedInfo = G.currentParticipants.find(function(p) { return p.name === nameFromChat; });
    }
    if (!detailedInfo) {
      detailedInfo = FODDER_TEMPLATES.find(function(f) { return f.name === nameFromChat; });
    }
    
    if (detailedInfo) {
      return {
        name: detailedInfo.name,
        icon: detailedInfo.icon || '👤',
        gender: detailedInfo.gender || 'unknown',
        title: detailedInfo.title || detailedInfo.desc || '副本中遇到的人',
        personality: detailedInfo.personality ? [detailedInfo.personality] : ['未知'],
        quote: detailedInfo.quote || '......'
      };
    }
    
    return {
      name: nameFromChat,
      icon: '👤',
      gender: 'unknown',
      title: '副本中遇到的人',
      personality: ['未知'],
      quote: '......'
    };
  }
  
  return null;
}

// ★ 检查AI对话中某个NPC是否说出过某个编号
function checkCodeMentionedByNPC(code, npcName) {
  var recent = G.messageHistory.slice(-30);
  for (var i = recent.length - 1; i >= 0; i--) {
    var msg = recent[i];
    if ((msg.type === 'ai' || msg.type === 'narrator') && msg.text) {
      if (msg.text.indexOf(code) !== -1 && msg.text.indexOf(npcName) !== -1) {
        return true;
      }
    }
  }
  return false;
}

// ★ 从AI对话中提取编号附近的角色名字
function tryExtractNameNearCode(code) {
  var recent = G.messageHistory.slice(-30);
  for (var i = recent.length - 1; i >= 0; i--) {
    var msg = recent[i];
    if ((msg.type === 'ai' || msg.type === 'narrator') && msg.text && msg.text.indexOf(code) !== -1) {
      var text = msg.text;
      var idx = text.indexOf(code);
      var surrounding = text.substring(Math.max(0, idx - 100), Math.min(text.length, idx + 100));
      
      // 模式1：「XXX说/道/报出...编号」
      var patterns = [
        /([^\s，。：""、]{2,4})(?:紧张|微笑|淡淡|轻声|小声|犹豫|害羞|冷淡|平静)?(?:地)?(?:说|道|报出|递给|告诉|透露|搓着|开口|念出|低声)/,
        /([^\s，。：""、]{2,4})的(?:声音|编号|手指|视线|嗓音)/,
        /([^\s，。：""、]{2,4})(?:：|:)[""].*?[""]/
      ];
      
      for (var p = 0; p < patterns.length; p++) {
        var match = surrounding.match(patterns[p]);
        if (match && match[1]) {
          var name = match[1];
          var badWords = ['你的','我的','他的','她的','回廊','系统','副本','编号','手指','声音','视线','一个','那个','这个','对方','玩家','所有'];
          var isBad = badWords.some(function(w) { return name.indexOf(w) !== -1; });
          if (!isBad && name.length >= 2 && name.length <= 4) {
            return name;
          }
        }
      }
      
      // 模式2：直接在编号前后找中文名
      var beforeCode = text.substring(Math.max(0, idx - 30), idx);
      var chineseNames = beforeCode.match(/[\u4e00-\u9fa5]{2,4}/g);
      if (chineseNames && chineseNames.length > 0) {
        var lastName = chineseNames[chineseNames.length - 1];
        var badWords2 = ['编号','系统','输入','确认','重试','通讯','手机','联系'];
        if (!badWords2.some(function(w) { return lastName.indexOf(w) !== -1; })) {
          return lastName;
        }
      }
    }
  }
  return null;
}

// 好友申请系统：AI自主决定是否同意
function sendFriendRequest(code) {
  var charData = CHARACTER_DB[code];
  if (!charData) return;

  addMessage('system', '📱 正在向 ' + charData.icon + ' ' + charData.name + ' 发送好友申请...');
  showNotification('📱 已发送好友申请', '');

  // AI决策：根据角色性格和随机因素决定是否同意
  var delay = Math.floor(Math.random() * 3000) + 2000; // 2-5秒延迟，模拟思考

  setTimeout(function() {
    var decision = aiDecideFriendRequest(charData);

    if (decision.accepted) {
      // 同意
      G.contacts.push({
        code: code,
        affinity: decision.initialAffinity || 0,
        chatHistory: [],
        unlockTime: Date.now(),
        aiCanDelete: true // AI有权删除
      });
      showNotification('✅ ' + charData.name + '同意了你的好友申请！', 'clue');
      addMessage('system', '📱 ' + charData.icon + ' ' + charData.name + '同意了好友申请');
      addMessage('narrator', charData.icon + ' ' + charData.name + '："' + decision.message + '"');
      saveGame();
      // 刷新通讯录界面
      if (document.getElementById('systemPhone').classList.contains('show')) {
        renderContactsApp();
      }
    } else {
      // 拒绝
      showNotification('❌ ' + charData.name + '拒绝了你的好友申请', 'horror');
      addMessage('system', '📱 ' + charData.icon + ' ' + charData.name + '拒绝了好友申请');
      addMessage('narrator', charData.icon + ' ' + charData.name + '："' + decision.message + '"');
    }
  }, delay);
}

function aiDecideFriendRequest(charData) {
  // 基础接受率70%，根据性格调整
  var acceptRate = 0.70;
  var personality = charData.personality || [];

  // 性格影响接受率
  var friendlyTraits = ['活泼','善良','温柔','乐观','热血','元气','豪爽','温和','甜美','单纯','灵动','善解人意'];
  var hostileTraits = ['冷酷','孤僻','冷漠','高傲','阴沉','厌世','凶狠','冰冷','决绝'];
  var cautiousTraits = ['警觉','冷静','理性','严谨','沉默'];

  personality.forEach(function(p) {
    if (friendlyTraits.includes(p)) acceptRate += 0.08;
    if (hostileTraits.includes(p)) acceptRate -= 0.15;
    if (cautiousTraits.includes(p)) acceptRate -= 0.05;
  });

  // 限制范围
  acceptRate = Math.max(0.15, Math.min(0.95, acceptRate));

  var accepted = Math.random() < acceptRate;

  // 根据性格生成回复
  var acceptMessages, rejectMessages;

  if (personality.includes('活泼') || personality.includes('元气') || personality.includes('乐观')) {
    acceptMessages = ['太好了！多个朋友多条路嘛~', '耶！我正好缺人聊天！', '好呀好呀！以后多联系！'];
    rejectMessages = ['嗯...现在还不是时候呢~', '抱歉啦，我还不太确定...', '下次再说吧~'];
  } else if (personality.includes('冷酷') || personality.includes('冷漠') || personality.includes('孤僻')) {
    acceptMessages = ['...随你。', '别烦我就行。', '......行吧。'];
    rejectMessages = ['不需要。', '别烦我。', '......（已读不回）', '我不需要朋友。'];
  } else if (personality.includes('高傲') || personality.includes('高贵')) {
    acceptMessages = ['算你有眼光。', '勉强接受吧。', '哼...看在你诚意的份上。'];
    rejectMessages = ['你还不够格。', '等你变强了再来。', '不感兴趣。'];
  } else if (personality.includes('温柔') || personality.includes('善良')) {
    acceptMessages = ['好的，很高兴认识你。', '当然可以~', '嗯，以后互相照顾吧。'];
    rejectMessages = ['对不起...我现在还没准备好...', '不好意思，让我再想想...', '抱歉...'];
  } else if (personality.includes('警觉') || personality.includes('谨慎')) {
    acceptMessages = ['...我会观察你一段时间。', '先加上吧，但别耍花招。', '可以，但我在看着你。'];
    rejectMessages = ['我不信任陌生人。', '你的目的是什么？', '等我确认你不是威胁再说。'];
  } else if (personality.includes('疯狂') || personality.includes('不按常理')) {
    acceptMessages = ['哈哈哈！为什么不呢！', '赌一把！加了！', '有趣有趣~'];
    rejectMessages = ['今天运气不好~拒绝！', '掷骰子决定...不好意思，是拒绝~', '哈哈，不要~'];
  } else {
    acceptMessages = ['好的。', '可以。', '嗯，加吧。'];
    rejectMessages = ['现在不行。', '改天吧。', '...不了。'];
  }

  var messages = accepted ? acceptMessages : rejectMessages;
  var message = messages[Math.floor(Math.random() * messages.length)];

  return {
    accepted: accepted,
    message: message,
    initialAffinity: accepted ? Math.floor(Math.random() * 10) : 0
  };
}

// AI主动删除好友
function aiConsiderDeleteFriend(code) {
  var contact = findContactByCode(code);
  var charData = CHARACTER_DB[code];
  if (!contact || !charData) return;

  // 好感度极低时AI可能主动删除
  if (contact.affinity <= -50) {
    var deleteChance = 0.3 + (Math.abs(contact.affinity) - 50) * 0.01;
    if (Math.random() < deleteChance) {
      aiDeleteFriend(code);
    }
  }
}

function aiDeleteFriend(code) {
  var charData = CHARACTER_DB[code];
  if (!charData) return;

  var idx = G.contacts.findIndex(function(c) { return c.code === code; });
  if (idx < 0) return;

  G.contacts.splice(idx, 1);

  var deleteMessages = [
    '我们不合适。再见。',
    '不要再联系我了。',
    '...这段关系到此为止。',
    '你让我失望了。',
    '我删了你，别找我了。'
  ];

  var msg = deleteMessages[Math.floor(Math.random() * deleteMessages.length)];

  showNotification('💔 ' + charData.name + '删除了你', 'horror');
  addMessage('system', '📱 ' + charData.icon + ' ' + charData.name + '将你从好友列表中移除了');
  addMessage('horror', charData.icon + ' ' + charData.name + '："' + msg + '"');

  saveGame();

  if (currentChatTarget === code) {
    currentChatTarget = null;
    if (document.getElementById('systemPhone').classList.contains('show')) {
      renderContactsApp();
    }
  }
}

function changeAffinity(code, amount) {
  var contact = findContactByCode(code);
  if (!contact) return;
  var oldAff = contact.affinity;
  contact.affinity = Math.max(-100, Math.min(100, contact.affinity + amount));
  var charData = CHARACTER_DB[code];
  if (!charData) return;
  // 检查关系事件
  if (charData.relationEvents) {
    var thresholds = Object.keys(charData.relationEvents).map(Number).sort(function(a,b){return a-b;});
    thresholds.forEach(function(t) {
      if (oldAff < t && contact.affinity >= t) {
        addMessage('system', '💕 ' + charData.name + '的好感度达到了' + t + '！');
        addMessage('narrator', charData.relationEvents[t]);
      }
    });
  }
}

//   通讯录UI（集成到系统手机）  

// 覆盖原来的 renderSystemApp，扩展 contacts 部分
var _originalRenderSystemApp = renderSystemApp;
renderSystemApp = function(app) {
  if (app === 'contacts') {
    renderContactsApp();
    return;
  }
  _originalRenderSystemApp(app);
};

function renderContactsApp() {
  var screen = document.getElementById('systemScreen');
  var html = '';
  html += '<span class="sys-back-btn" onclick="renderSystemApp(\'home\')">← 返回</span>';
  html += '<div class="sys-section-title">📱 通讯录 <span style="font-size:10px;color:#666">(' + G.contacts.length + '人)</span></div>';

  // 添加按钮
  html += '<div style="margin-bottom:10px;display:flex;gap:6px">';
  html += '<input type="text" id="contactCodeInput" placeholder="输入编号 如 K7-3NWP" style="flex:1;padding:6px 8px;border:1px solid #3a1515;border-radius:6px;background:rgba(20,8,8,0.8);color:#c8c8d0;font-size:11px;outline:none">';
  html += '<button style="padding:6px 12px;border:1px solid #5a2020;border-radius:6px;background:#3a0a0a;color:#f0c0c0;font-size:14px;cursor:pointer" onclick="doAddContact()">+</button>';
  html += '</div>';

  //   待处理的好友申请  
  if (G.pendingFriendRequests && G.pendingFriendRequests.length > 0) {
    html += '<div style="margin-bottom:10px;padding:8px;background:rgba(139,0,0,0.15);border:1px solid #5a2020;border-radius:8px">';
    html += '<div style="font-size:11px;color:#ff6666;margin-bottom:6px">📬 待处理的好友申请 (' + G.pendingFriendRequests.length + ')</div>';
    G.pendingFriendRequests.forEach(function(req) {
      var charData = CHARACTER_DB[req.code];
      if (!charData) return;
      html += '<div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid #2a1010">';
      html += '<span style="font-size:16px">' + charData.icon + '</span>';
      html += '<div style="flex:1">';
      html += '<div style="font-size:12px;color:#ddd">' + charData.name + '</div>';
      html += '<div style="font-size:9px;color:#888">' + charData.title + '</div>';
      html += '</div>';
      html += '<button style="padding:3px 8px;border:1px solid #2a5a2a;border-radius:4px;background:#1a3a1a;color:#88ff88;font-size:10px;cursor:pointer" onclick="acceptNPCFriendRequest(\'' + req.code + '\');renderContactsApp()">✅</button>';
      html += '<button style="padding:3px 8px;border:1px solid #5a2020;border-radius:4px;background:#3a0a0a;color:#ff6666;font-size:10px;cursor:pointer" onclick="rejectNPCFriendRequest(\'' + req.code + '\');renderContactsApp()">❌</button>';
      html += '</div>';
    });
    html += '</div>';
  }

  if (G.contacts.length === 0) {
    html += '<div style="text-align:center;color:#555;padding:30px;font-size:12px;line-height:2">';
    html += '通讯录为空<br><br>';
    html += '在副本中与NPC交流<br>获取专属编号后<br>输入编号发送好友申请<br>对方可能同意或拒绝';
    html += '</div>';
  } else {
    G.contacts.forEach(function(c) {
      var charData = CHARACTER_DB[c.code];
      if (!charData) return;
      var affColor = c.affinity >= 50 ? '#ff6699' : (c.affinity >= 0 ? '#e74c3c' : '#666');
      html += '<div class="contact-item" onclick="openChat(\'' + c.code + '\')">';
      html += '<span class="contact-avatar">' + charData.icon + '</span>';
      html += '<div class="contact-info">';
      html += '<div class="contact-name">' + charData.name + ' <span style="font-size:9px;color:#555">' + (charData.displayCode || c.code) + '</span></div>';
      html += '<div style="font-size:10px;color:#888">' + charData.title + '</div>';
      html += '<div class="contact-affinity" style="color:' + affColor + '">♥ ' + c.affinity + '</div>';
      html += '</div>';
      html += '<span style="font-size:10px;color:#555">💬</span>';
      html += '</div>';
    });
  }

  screen.innerHTML = html;
}

function doAddContact() {
  var input = document.getElementById('contactCodeInput');
  if (!input) return;
  var code = input.value.trim();
  if (!code) {
    showNotification('请输入编号', '');
    return;
  }
  if (addContactByCode(code)) {
    input.value = '';
    renderContactsApp();
  }
}

//   AI聊天界面  

var currentChatTarget = null;

function openChat(code) {
  var charData = CHARACTER_DB[code];
  var contact = findContactByCode(code);
  if (!charData || !contact) return;
  currentChatTarget = code;

  var screen = document.getElementById('systemScreen');
  var html = '';

  // 聊天头部
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #3a1515">';
  html += '<span class="sys-back-btn" onclick="renderContactsApp()" style="margin:0">←</span>';
  html += '<span style="font-size:18px">' + charData.icon + '</span>';
  html += '<div style="flex:1">';
  html += '<div style="color:#ddd;font-size:13px">' + charData.name + '</div>';
  html += '<div style="color:#888;font-size:9px">' + charData.title + ' | ♥' + contact.affinity + '</div>';
  html += '</div>';
  html += '<span style="font-size:10px;color:#555;cursor:pointer" onclick="showCharProfile(\'' + code + '\')">📋</span>';
  html += '</div>';

  // 聊天记录
  html += '<div id="chatMessages" style="height:260px;overflow-y:auto;margin-bottom:8px;padding:4px">';
  if (contact.chatHistory.length === 0) {
    // 首次对话，显示角色问候语
    html += '<div style="margin-bottom:8px"><div style="display:flex;gap:6px;align-items:flex-start">';
    html += '<span style="font-size:16px">' + charData.icon + '</span>';
    html += '<div style="background:#1a0a0a;border:1px solid #3a1515;border-radius:8px;padding:6px 10px;max-width:80%;font-size:12px;color:#c8c8d0">' + charData.greeting + '</div>';
    html += '</div></div>';
  } else {
    contact.chatHistory.forEach(function(msg) {
      if (msg.role === 'user') {
        html += '<div style="margin-bottom:8px;text-align:right"><div style="display:inline-block;background:#3a1515;border-radius:8px;padding:6px 10px;max-width:80%;font-size:12px;color:#e0c0a0">' + msg.content + '</div></div>';
      } else {
        html += '<div style="margin-bottom:8px"><div style="display:flex;gap:6px;align-items:flex-start">';
        html += '<span style="font-size:16px">' + charData.icon + '</span>';
        html += '<div style="background:#1a0a0a;border:1px solid #3a1515;border-radius:8px;padding:6px 10px;max-width:80%;font-size:12px;color:#c8c8d0">' + msg.content + '</div>';
        html += '</div></div>';
      }
    });
  }
  html += '</div>';

  // 输入框
  html += '<div style="display:flex;gap:6px">';
  html += '<input type="text" id="chatInput" placeholder="说点什么..." style="flex:1;padding:6px 10px;border:1px solid #3a1515;border-radius:16px;background:rgba(20,8,8,0.8);color:#c8c8d0;font-size:12px;outline:none" onkeydown="if(event.key===\'Enter\')sendChatMessage()">';
  html += '<button style="padding:6px 12px;border:1px solid #5a2020;border-radius:16px;background:#3a0a0a;color:#f0c0c0;font-size:12px;cursor:pointer" onclick="sendChatMessage()">发送</button>';
  html += '</div>';

  screen.innerHTML = html;

  // 滚动到底部
  var chatDiv = document.getElementById('chatMessages');
  if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
}

function showCharProfile(code) {
  var charData = CHARACTER_DB[code];
  var contact = findContactByCode(code);
  if (!charData) return;

  var screen = document.getElementById('systemScreen');
  var html = '';
  html += '<span class="sys-back-btn" onclick="openChat(\'' + code + '\')">← 返回聊天</span>';
  html += '<div style="text-align:center;margin:10px 0">';
  html += '<div style="font-size:40px">' + charData.icon + '</div>';
  html += '<div style="font-size:16px;color:#e0b0b0;margin:6px 0">' + charData.name + '</div>';
  html += '<div style="font-size:11px;color:#888">' + charData.title + ' | ' + (charData.displayCode || charData.code) + '</div>';
  html += '<div style="font-size:11px;color:#b57a7a;margin-top:4px">♥ 好感度：' + (contact ? contact.affinity : 0) + '</div>';
  html += '</div>';

  html += '<div style="padding:8px">';
  html += '<div style="font-size:11px;color:#888;margin-bottom:4px">性别：' + (charData.gender === 'male' ? '男' : (charData.gender === 'female' ? '女' : '未知')) + ' | 年龄：' + charData.age + '</div>';
  html += '<div style="font-size:11px;color:#888;margin-bottom:4px">阵营：' + charData.faction + '</div>';
  html += '<div style="font-size:11px;color:#888;margin-bottom:4px">能力：' + charData.specialSkill + '</div>';
  html += '<div style="font-size:11px;color:#888;margin-bottom:8px">性格：' + charData.personality.join('、') + '</div>';
  html += '<div style="font-size:11px;color:#999;line-height:1.8;border-top:1px solid #3a1515;padding-top:8px">' + charData.backstory + '</div>';
  html += '</div>';

  screen.innerHTML = html;
}

//   副本中NPC报出编号  

var dungeonNPCs = [];

var _enterDungeonWithNPC = enterDungeon;
enterDungeon = function(dungeonConfig) {
  var allCodes = Object.keys(CHARACTER_DB).filter(function(code) {
    return CHARACTER_DB[code].type === 'player';
  });
  var unlockedCodes = G.contacts.map(function(c) { return c.code; });
  var candidates = allCodes.filter(function(code) {
    return !unlockedCodes.includes(code);
  });
  if (candidates.length < 2) candidates = allCodes.slice();

  var count = Math.min(candidates.length, Math.floor(Math.random() * 2) + 2);
  var shuffled = candidates.sort(function() { return Math.random() - 0.5; });
  dungeonNPCs = shuffled.slice(0, count);

  _enterDungeonWithNPC(dungeonConfig);

  // 只注入交互关键词和按钮，不再硬塞出场消息
  injectNPCInteractions(dungeonConfig);
};

function injectNPCInteractions(dungeonConfig) {
  if (!dungeonConfig || !dungeonConfig.rooms) return;
  var roomIds = Object.keys(dungeonConfig.rooms);
  if (roomIds.length === 0 || dungeonNPCs.length === 0) return;

  dungeonNPCs.forEach(function(npcCode, idx) {
    var charData = CHARACTER_DB[npcCode];
    if (!charData) return;

    var targetRoomIdx = Math.min(idx + 1, roomIds.length - 1);
    var targetRoom = dungeonConfig.rooms[roomIds[targetRoomIdx]];
    if (!targetRoom) return;

    if (!targetRoom.keywords) targetRoom.keywords = {};
    if (!targetRoom.specialActions) targetRoom.specialActions = [];

    var displayCode = charData.displayCode || charData.code;

    targetRoom.keywords[charData.name] = {
      message: charData.icon + ' ' + charData.name + '看向你："' + charData.greeting + '"',
      messageType: 'narrator'
    };
    targetRoom.keywords['交流'] = {
      message: charData.icon + ' ' + charData.name + '说："我的编号是 ' + displayCode + '，记住了。"\n\n（提示：打开📱通讯录 → 输入 ' + displayCode + '）',
      messageType: 'system'
    };
    targetRoom.keywords['编号'] = {
      message: charData.icon + ' ' + charData.name + '："' + displayCode + '。在通讯系统里输入就能找到我。"',
      messageType: 'narrator'
    };

    targetRoom.specialActions.push({
      id: 'talk_npc_' + idx,
      icon: charData.icon,
      label: '与' + charData.name + '交谈',
      message: charData.icon + ' ' + charData.name + '转过头来。\n\n"' + charData.greeting + '"\n\n"想联系我的话...我的编号是 ' + displayCode + '。"',
      removeAfterUse: false
    });

    var originalDesc = targetRoom.description || '';
    targetRoom.description = originalDesc + ' 你注意到角落里站着一个' + (charData.gender === 'male' ? '男人' : '女人') + '（' + charData.icon + '）。';
  });
}

//   发送聊天消息  

async function sendChatMessage() {
  var input = document.getElementById('chatInput');
  if (!input) return;
  var text = input.value.trim();
  if (!text || !currentChatTarget) return;
  input.value = '';

  var contact = findContactByCode(currentChatTarget);
  var charData = CHARACTER_DB[currentChatTarget];
  if (!contact || !charData) return;

  // 记录玩家消息
  contact.chatHistory.push({ role: 'user', content: text });

  // 刷新聊天界面
  openChat(currentChatTarget);

  // 好感度变化由AI决定（不再固定+1）
  // AI会在回复中自主调整好感度

  // 调用AI生成角色回复
  if (G.connected && mujianSdk) {
    try {
      var prompt = buildCharacterPrompt(charData, contact, text);
      var fullResponse = '';
      var chatCode = currentChatTarget;
      stopController = new AbortController();
      await mujianSdk.ai.chat.complete(
        prompt,
        function(res) {
          fullResponse = res.fullContent || '';
          if (res.isFinished && fullResponse) {
            var parsed = parseCharacterReply(fullResponse, chatCode);
            var c = findContactByCode(chatCode);
            if (c) {
              c.chatHistory.push({ role: 'assistant', content: parsed.cleanText });
              if (currentChatTarget === chatCode) {
                openChat(chatCode);
              }
            }
            saveGame();
          }
        },
        stopController.signal,
        { parseContent: true }
      );
    } catch(e) {
      // AI失败，用离线回复
      var offlineResult = generateOfflineReplyWithAffinity(charData, contact, text);
      contact.chatHistory.push({ role: 'assistant', content: offlineResult.reply });
      changeAffinity(currentChatTarget, offlineResult.affinityChange);
      aiConsiderDeleteFriend(currentChatTarget);
      openChat(currentChatTarget);
      saveGame();
    }
  } else {
    // 离线模式
    var offlineResult = generateOfflineReplyWithAffinity(charData, contact, text);
    contact.chatHistory.push({ role: 'assistant', content: offlineResult.reply });
    changeAffinity(currentChatTarget, offlineResult.affinityChange);
    // 检查AI是否要删好友
    aiConsiderDeleteFriend(currentChatTarget);
    openChat(currentChatTarget);
    saveGame();
  }
}

function buildCharacterPrompt(charData, contact, playerText) {
  var prompt = '你现在扮演一个角色进行对话。严格按照以下设定回复，不要跳出角色。\n\n';
  prompt += '【角色设定】\n';
  prompt += '姓名：' + charData.name + '\n';
  prompt += '称号：' + charData.title + '\n';
  prompt += '性别：' + (charData.gender === 'male' ? '男' : (charData.gender === 'female' ? '女' : '未知')) + '\n';
  prompt += '年龄：' + charData.age + '\n';
  prompt += '性格：' + charData.personality.join('、') + '\n';
  prompt += '说话风格：' + charData.chatStyle + '\n';
  prompt += '背景故事：' + charData.backstory + '\n';
  prompt += '特殊能力：' + charData.specialSkill + '\n';
  prompt += '编号：' + charData.code + '\n';
  prompt += '\n【世界观】\n';
  prompt += '你们都在一个叫"苍白回廊"的超自然空间中，被迫参加致命的副本游戏。回廊中有各种恐怖副本，玩家需要组队生存。\n';
  prompt += '\n【当前关系】\n';
  prompt += '好感度：' + contact.affinity + '/100\n';
  if (contact.affinity < 20) prompt += '你对对方还比较陌生和警惕。\n';
  else if (contact.affinity < 50) prompt += '你对对方有了一些好感，愿意多聊几句。\n';
  else if (contact.affinity < 80) prompt += '你很信任对方，会分享更多私密的想法。\n';
  else prompt += '你对对方有很深的感情，会展露最真实的自己。\n';
  prompt += '\n【重要规则】\n';
  prompt += '1. 回复要简短，1-3句话，符合角色性格。\n';
  prompt += '2. 不要说"作为AI"之类的话，你就是这个角色。\n';
  prompt += '3. 根据好感度调整态度和亲密程度。\n';
  prompt += '4. 可以提到副本、怨灵、回廊等世界观元素。\n';
  prompt += '5. 你有自主权！你可以喜欢或讨厌对方。如果对方让你不舒服，你可以表达不满。\n';
  prompt += '6. 在回复末尾用隐藏标记表达态度变化（玩家看不到）：\n';
  prompt += '   [好感+1] 到 [好感+5] 表示好感上升\n';
  prompt += '   [好感-1] 到 [好感-10] 表示好感下降\n';
  prompt += '   [删除好友] 表示你决定删除对方（仅在极度厌恶时使用）\n';
  prompt += '   如果对话正常，用[好感+1]；如果对方说了让你开心的话，用[好感+3]或更高；\n';
  prompt += '   如果对方冒犯你，用[好感-3]或更低；如果对方持续骚扰侮辱你，可以用[删除好友]。\n';

  // 加入最近几条聊天记录
  var recent = contact.chatHistory.slice(-6);
  prompt += '\n【最近对话】\n';
  recent.forEach(function(msg) {
    if (msg.role === 'user') prompt += '玩家：' + msg.content + '\n';
    else prompt += charData.name + '：' + msg.content + '\n';
  });

  prompt += '\n玩家说：' + playerText + '\n';
  prompt += '请以' + charData.name + '的身份回复（1-3句话）：';

  return prompt;
}

function generateOfflineReply(charData, contact, playerText) {
  var aff = contact.affinity;
  var replies;

  if (aff < 20) {
    replies = [
      charData.greeting,
      '......',
      '嗯。',
      '你说什么？',
      '我没什么想说的。',
      '（看了你一眼，没有回应）',
      '有事？',
      '...随便吧。'
    ];
  } else if (aff < 50) {
    replies = [
      '嗯，你说得有道理。',
      '在这个地方...小心点。',
      '你还活着就好。',
      '下次副本...要一起吗？',
      '我今天心情还行。',
      '你比我想象的要坚强。',
      '...谢谢你愿意和我说话。',
      '这里的日子不好过，但有人说话感觉好多了。'
    ];
  } else if (aff < 80) {
    replies = [
      '看到你我就安心了。',
      '下次副本我一定会保护你的。',
      '...你是我在这里唯一信任的人。',
      '有些话...我只会对你说。',
      '你有没有想过...离开这里之后的事？',
      '不管发生什么，我都站在你这边。',
      '今天的月亮...让我想到了你。',
      '别受伤了，我会担心的。'
    ];
  } else {
    replies = [
      '你在的地方...就是我想去的地方。',
      '我以前觉得活着没意义...遇到你之后改变了。',
      '...能遇到你，是我在回廊中最幸运的事。',
      '不管这个世界有多恐怖，有你在就够了。',
      '我想永远和你在一起...即使是在这样的地方。',
      '你笑起来真好看...多笑笑吧。',
      '如果有一天能离开这里...你愿意和我一起吗？'
    ];
  }

  return replies[Math.floor(Math.random() * replies.length)];
}


function generateOfflineReplyWithAffinity(charData, contact, playerText) {
  var reply = generateOfflineReply(charData, contact, playerText);
  var affinityChange = 1; // 默认+1

  // 检测玩家是否说了不好的话
  var negativeWords = ['滚','死','蠢','丑','垃圾','废物','白痴','去死','闭嘴','讨厌你','恶心'];
  var positiveWords = ['喜欢','爱','好看','厉害','谢谢','感谢','保护','一起','相信','信任','加油'];
  var lowerText = playerText.toLowerCase();

  var isNegative = negativeWords.some(function(w) { return lowerText.includes(w); });
  var isPositive = positiveWords.some(function(w) { return lowerText.includes(w); });

  if (isNegative) {
    affinityChange = -(Math.floor(Math.random() * 5) + 3); // -3到-7
    // 根据性格回复
    var personality = charData.personality || [];
    if (personality.includes('暴烈') || personality.includes('暴躁')) {
      reply = '你说什么？！再说一遍试试！';
    } else if (personality.includes('冷酷') || personality.includes('冷漠')) {
      reply = '......（冰冷的目光）';
    } else if (personality.includes('善良') || personality.includes('温柔')) {
      reply = '...你为什么要这样说？';
    } else if (personality.includes('高傲')) {
      reply = '你不配和我说话。';
    } else {
      reply = '...你让我很不舒服。';
    }
  } else if (isPositive) {
    affinityChange = Math.floor(Math.random() * 3) + 2; // +2到+4
  }

  return {
    reply: reply,
    affinityChange: affinityChange
  };
}

function parseCharacterReply(text, code) {
  var cleanText = text;
  var affinityChange = 0;
  var shouldDelete = false;

  // 检查删除标记
  if (/\[删除好友\]/i.test(text)) {
    shouldDelete = true;
    cleanText = cleanText.replace(/\[删除好友\]/gi, '').trim();
  }

  // 检查好感度标记
  var affMatch = text.match(/\[好感([+-]\d+)\]/);
  if (affMatch) {
    affinityChange = parseInt(affMatch[1], 10);
    cleanText = cleanText.replace(/\[好感[+-]\d+\]/g, '').trim();
  }

  // 应用好感度变化
  if (affinityChange !== 0 && code) {
    changeAffinity(code, affinityChange);
  }

  // 处理删除
  if (shouldDelete && code) {
    setTimeout(function() {
      aiDeleteFriend(code);
    }, 1500);
  }

  // 如果没有标记，默认+1
  if (!affMatch && !shouldDelete && code) {
    changeAffinity(code, 1);
  }

  return {
    cleanText: cleanText || text,
    affinityChange: affinityChange,
    shouldDelete: shouldDelete
  };
}
