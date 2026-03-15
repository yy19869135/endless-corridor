// ========== AI服务配置（替代幕间SDK） ==========
var AI_CONFIG = {
  baseUrl: '',
  apiKey: '',
  model: '',
  maxTokens: 2048,
  temperature: 0.85
};

function loadAIConfig() {
  try {
    var saved = localStorage.getItem('paleCorridor_aiConfig');
    if (saved) {
      var parsed = JSON.parse(saved);
      AI_CONFIG.baseUrl = parsed.baseUrl || '';
      AI_CONFIG.apiKey = parsed.apiKey || '';
      AI_CONFIG.model = parsed.model || '';
    }
  } catch(e) {}
}

function saveAIConfig() {
  localStorage.setItem('paleCorridor_aiConfig', JSON.stringify({
    baseUrl: AI_CONFIG.baseUrl,
    apiKey: AI_CONFIG.apiKey,
    model: AI_CONFIG.model
  }));
}

function openAISettings() {
  loadAIConfig();
  document.getElementById('aiBaseUrl').value = AI_CONFIG.baseUrl;
  document.getElementById('aiApiKey').value = AI_CONFIG.apiKey;
  document.getElementById('aiModelName').value = AI_CONFIG.model;
  document.getElementById('aiSettingsStatus').textContent = '';
  document.getElementById('aiSettingsOverlay').classList.add('show');
}

function closeAISettings() {
  document.getElementById('aiSettingsOverlay').classList.remove('show');
}

function saveAISettings() {
  AI_CONFIG.baseUrl = document.getElementById('aiBaseUrl').value.trim().replace(/\/+$/, '');
  AI_CONFIG.apiKey = document.getElementById('aiApiKey').value.trim();
  AI_CONFIG.model = document.getElementById('aiModelName').value.trim();
  saveAIConfig();
  
  // 更新连接状态
  var isConfigured = AI_CONFIG.baseUrl && AI_CONFIG.apiKey && AI_CONFIG.model;
  updateConnectionStatus(isConfigured);
  G.connected = isConfigured;
  
  document.getElementById('aiSettingsStatus').innerHTML = '<span style="color:#8f8">✅ 已保存</span>';
}

async function testAIConnection() {
  var statusEl = document.getElementById('aiSettingsStatus');
  var url = document.getElementById('aiBaseUrl').value.trim().replace(/\/+$/, '');
  var key = document.getElementById('aiApiKey').value.trim();
  var model = document.getElementById('aiModelName').value.trim();
  
  if (!url || !key || !model) {
    statusEl.innerHTML = '<span style="color:#f88">❌ 请填写完整配置</span>';
    return;
  }
  
  statusEl.innerHTML = '<span style="color:#ff8">⏳ 测试中...</span>';
  
  try {
    var response = await fetch(url + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: '回复"连接成功"这四个字' }],
        max_tokens: 20
      })
    });
    
    if (response.ok) {
      var data = await response.json();
      var reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      statusEl.innerHTML = '<span style="color:#8f8">✅ 连接成功！回复: ' + (reply || '').substring(0, 30) + '</span>';
    } else {
      var errText = await response.text();
      statusEl.innerHTML = '<span style="color:#f88">❌ HTTP ' + response.status + ': ' + errText.substring(0, 60) + '</span>';
    }
  } catch(e) {
    statusEl.innerHTML = '<span style="color:#f88">❌ 网络错误: ' + e.message + '</span>';
  }
}

function updateConnectionStatus(connected) {
  G.connected = connected;
  var dot = document.getElementById('connectionDot');
  var text = document.getElementById('connectionText');
  if (!dot || !text) return;
  dot.className = 'connection-dot ' + (connected ? 'connected' : 'disconnected');
  text.className = 'connection-text ' + (connected ? 'connected' : 'disconnected');
  text.textContent = connected ? '已连接' : '未连接';
}

// ========== OpenAI兼容API流式调用 ==========
async function streamChatCompletion(messages, onChunk, signal) {
  if (!AI_CONFIG.baseUrl || !AI_CONFIG.apiKey || !AI_CONFIG.model) {
    throw new Error('AI服务未配置，请在菜单中设置');
  }
  
  var response = await fetch(AI_CONFIG.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + AI_CONFIG.apiKey
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: messages,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      stream: true
    }),
    signal: signal
  });
  
  if (!response.ok) {
    var errText = await response.text();
    throw new Error('API错误 ' + response.status + ': ' + errText.substring(0, 100));
  }
  
  var reader = response.body.getReader();
  var decoder = new TextDecoder();
  var fullContent = '';
  var buffer = '';
  
  while (true) {
    var result = await reader.read();
    if (result.done) break;
    
    buffer += decoder.decode(result.value, { stream: true });
    var lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || !line.startsWith('data:')) continue;
      var data = line.substring(5).trim();
      if (data === '[DONE]') {
        onChunk({ fullContent: fullContent, isFinished: true });
        return fullContent;
      }
      try {
        var parsed = JSON.parse(data);
        var delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
        if (delta && delta.content) {
          fullContent += delta.content;
          onChunk({ fullContent: fullContent, isFinished: false });
        }
      } catch(e) {}
    }
  }
  
  // 如果没收到 [DONE] 但流结束了
  if (fullContent) {
    onChunk({ fullContent: fullContent, isFinished: true });
  }
  return fullContent;
}

// ========== 初始化（替代initMujianSDK） ==========
async function initMujianSDK() {
  loadAIConfig();
  
  var isConfigured = AI_CONFIG.baseUrl && AI_CONFIG.apiKey && AI_CONFIG.model;
  updateConnectionStatus(isConfigured);
  G.connected = isConfigured;
  
  // 初始化玩家编号
  if (typeof initPlayerCode === 'function') {
    initPlayerCode();
  }
  
  if (!isConfigured) {
    console.log('⚠️ AI服务未配置，请在菜单 → AI服务设置中配置');
    // 不再自动弹出，只在控制台提示
  }
}
