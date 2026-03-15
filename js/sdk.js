// ========== 连接状态 ==========
function updateConnectionStatus(connected) {
  G.connected = connected;
  var dot = document.getElementById('connectionDot');
  var text = document.getElementById('connectionText');
  if (!dot || !text) return;
  dot.className = 'connection-dot ' + (connected ? 'connected' : 'disconnected');
  text.className = 'connection-text ' + (connected ? 'connected' : 'disconnected');
  text.textContent = connected ? '已连接' : '未连接';
}

// ========== API 设置管理 ==========
function getAPISettings() {
  var saved = localStorage.getItem('paleCorridor_apiSettings');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  return {
    baseUrl: '',
    apiKey: '',
    model: 'gpt-4o-mini',
    playerName: '',
    playerPersona: ''
  };
}

function saveAPISettingsToStorage(settings) {
  localStorage.setItem('paleCorridor_apiSettings', JSON.stringify(settings));
}

function openAPISettings() {
  closeGameMenu();
  var settings = getAPISettings();
  document.getElementById('apiBaseUrl').value = settings.baseUrl || '';
  document.getElementById('apiKey').value = settings.apiKey || '';
  document.getElementById('apiModel').value = settings.model || 'gpt-4o-mini';
  document.getElementById('apiPlayerName').value = settings.playerName || G.playerName || '';
  document.getElementById('apiPlayerPersona').value = settings.playerPersona || G.playerPersona || '';
  document.getElementById('apiTestResult').textContent = '';
  document.getElementById('apiSettingsOverlay').classList.add('show');
}

function closeAPISettings() {
  document.getElementById('apiSettingsOverlay').classList.remove('show');
}

function saveAPISettings() {
  var settings = {
    baseUrl: document.getElementById('apiBaseUrl').value.trim().replace(/\/+$/, ''),
    apiKey: document.getElementById('apiKey').value.trim(),
    model: document.getElementById('apiModel').value.trim() || 'gpt-4o-mini',
    playerName: document.getElementById('apiPlayerName').value.trim(),
    playerPersona: document.getElementById('apiPlayerPersona').value.trim()
  };
  saveAPISettingsToStorage(settings);

  // 同步到游戏全局状态
  if (settings.playerName) G.playerName = settings.playerName;
  if (settings.playerPersona) G.playerPersona = settings.playerPersona;

  // 检查连接状态
  if (settings.baseUrl && settings.apiKey) {
    updateConnectionStatus(true);
  } else {
    updateConnectionStatus(false);
  }

  if (typeof saveGame === 'function') saveGame();

  // 先关闭设置页面，再显示通知
  closeAPISettings();
  setTimeout(function() {
    showNotification('✅ API设置已保存', 'clue');
  }, 300);
}

async function testAPIConnection() {
  var resultEl = document.getElementById('apiTestResult');
  var baseUrl = document.getElementById('apiBaseUrl').value.trim().replace(/\/+$/, '');
  var apiKey = document.getElementById('apiKey').value.trim();
  var model = document.getElementById('apiModel').value.trim() || 'gpt-4o-mini';

  if (!baseUrl || !apiKey) {
    resultEl.textContent = '❌ 请先填写 API 地址和 Key';
    resultEl.style.color = '#cc4444';
    return;
  }

  resultEl.textContent = '⏳ 正在测试连接...';
  resultEl.style.color = '#888';

  try {
    var response = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: '请回复"连接成功"' }],
        max_tokens: 20,
        temperature: 0
      })
    });

    if (response.ok) {
      var data = await response.json();
      if (data.choices && data.choices.length > 0) {
        resultEl.textContent = '✅ 连接成功！模型: ' + (data.model || model);
        resultEl.style.color = '#00cc66';
        updateConnectionStatus(true);
      } else {
        resultEl.textContent = '⚠️ 响应格式异常';
        resultEl.style.color = '#ff8800';
      }
    } else {
      var errText = await response.text();
      resultEl.textContent = '❌ 请求失败 (' + response.status + '): ' + errText.substring(0, 80);
      resultEl.style.color = '#cc4444';
    }
  } catch(e) {
    resultEl.textContent = '❌ 连接失败: ' + e.message;
    resultEl.style.color = '#cc4444';
  }
}

// ========== 获取模型列表 ==========
async function fetchModelList() {
  var baseUrl = document.getElementById('apiBaseUrl').value.trim().replace(/\/+$/, '');
  var apiKey = document.getElementById('apiKey').value.trim();
  var statusEl = document.getElementById('apiModelStatus');
  var selectEl = document.getElementById('apiModelSelect');

  if (!baseUrl || !apiKey) {
    statusEl.textContent = '❌ 请先填写 API 地址和 Key';
    statusEl.style.color = '#cc4444';
    return;
  }

  statusEl.textContent = '⏳ 正在获取模型列表...';
  statusEl.style.color = '#888';

  try {
    var response = await fetch(baseUrl + '/models', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      }
    });

    if (!response.ok) {
      statusEl.textContent = '❌ 获取失败 (' + response.status + ')';
      statusEl.style.color = '#cc4444';
      return;
    }

    var data = await response.json();
    var models = [];

    if (data.data && Array.isArray(data.data)) {
      models = data.data;
    } else if (Array.isArray(data)) {
      models = data;
    }

    if (models.length === 0) {
      statusEl.textContent = '⚠️ 未找到可用模型';
      statusEl.style.color = '#ff8800';
      return;
    }

    // 按模型ID排序
    models.sort(function(a, b) {
      var nameA = (a.id || a.name || '').toLowerCase();
      var nameB = (b.id || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // 填充下拉框
    selectEl.innerHTML = '<option value="">-- 选择模型 (' + models.length + ' 个) --</option>';
    models.forEach(function(m) {
      var modelId = m.id || m.name || '';
      if (modelId) {
        var option = document.createElement('option');
        option.value = modelId;
        option.textContent = modelId;
        selectEl.appendChild(option);
      }
    });

    // 如果当前输入框有值，自动选中对应项
    var currentModel = document.getElementById('apiModel').value.trim();
    if (currentModel) {
      selectEl.value = currentModel;
    }

    statusEl.textContent = '✅ 已获取 ' + models.length + ' 个模型';
    statusEl.style.color = '#00cc66';

  } catch(e) {
    statusEl.textContent = '❌ 获取失败: ' + e.message;
    statusEl.style.color = '#cc4444';
  }
}

function onModelSelectChange() {
  var selectEl = document.getElementById('apiModelSelect');
  var inputEl = document.getElementById('apiModel');
  if (selectEl.value) {
    inputEl.value = selectEl.value;
  }
}

// ========== OpenAI 兼容 API 调用 ==========

async function callOpenAICompatible(messages, options) {
  var settings = getAPISettings();
  if (!settings.baseUrl || !settings.apiKey) {
    throw new Error('未配置API，请在菜单中打开API设置');
  }

  var body = {
    model: settings.model || 'gpt-4o-mini',
    messages: messages,
    temperature: (options && options.temperature !== undefined) ? options.temperature : 0.85,
    max_tokens: (options && options.max_tokens) ? options.max_tokens : 2000,
    top_p: (options && options.top_p !== undefined) ? options.top_p : 0.9
  };

  var response = await fetch(settings.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + settings.apiKey
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    var errText = '';
    try { errText = await response.text(); } catch(e) {}
    throw new Error('API请求失败 (' + response.status + '): ' + errText.substring(0, 100));
  }

  var data = await response.json();
  if (data.choices && data.choices.length > 0 && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  throw new Error('API响应格式异常');
}

// ========== 初始化（替代原SDK初始化） ==========
async function initMujianSDK() {
  // 从本地存储加载API设置
  var settings = getAPISettings();

  // 恢复玩家信息
  if (settings.playerName) G.playerName = settings.playerName;
  if (settings.playerPersona) G.playerPersona = settings.playerPersona;

  // 初始化玩家编号
  if (typeof initPlayerCode === 'function') initPlayerCode();

  // 检查API是否已配置
  if (settings.baseUrl && settings.apiKey) {
    updateConnectionStatus(true);
    console.log('★ API已配置:', settings.baseUrl);
    console.log('★ 模型:', settings.model);
    console.log('★ 玩家名字:', G.playerName || '未设置');
  } else {
    updateConnectionStatus(false);
    console.log('⚠️ API未配置，请在菜单中设置');
  }
}
