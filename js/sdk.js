function updateConnectionStatus(connected) {
  G.connected = connected;
  var dot = document.getElementById('connectionDot');
  var text = document.getElementById('connectionText');
  if (!dot || !text) return;
  dot.className = 'connection-dot ' + (connected ? 'connected' : 'disconnected');
  text.className = 'connection-text ' + (connected ? 'connected' : 'disconnected');
  text.textContent = connected ? '已连接' : '未连接';
}

async function initMujianSDK() {
  try {
    if (window.MujianUMD && window.MujianUMD.MujianSdk) {
      mujianSdk = window.MujianUMD.MujianSdk.getInstance();
      await mujianSdk.init();
      updateConnectionStatus(true);
      
      // 初始化玩家编号
      initPlayerCode();
      
      // 获取玩家人设 - 修复版
      try {
        var personaRes = await mujianSdk.ai.chat.settings.persona.getActive();
        console.log('★ 人设原始数据:', JSON.stringify(personaRes));
        
        if (personaRes) {
          // 兼容多种数据结构
          var pName = personaRes.name || personaRes.displayName || null;
          var pDesc = personaRes.description || personaRes.bio || personaRes.content || null;
          
          // 如果外层没有，试试 data 字段
          if (!pName && personaRes.data) {
            pName = personaRes.data.name || personaRes.data.displayName || null;
          }
          if (!pDesc && personaRes.data) {
            pDesc = personaRes.data.description || personaRes.data.bio || null;
          }
          
          if (pName) G.playerName = pName;
          if (pDesc) G.playerPersona = pDesc;
          
          console.log('★ 玩家名字:', G.playerName || '未获取到');
          console.log('★ 玩家人设:', G.playerPersona ? G.playerPersona.substring(0, 80) : '未获取到');
          saveGame();
        } else {
          console.log('⚠️ 人设数据为空');
        }
      } catch(e) {
        console.log('获取人设失败:', e);
      }

      // 监听平台的新游戏事件
      try {
        mujianSdk.onNewGame(function() {
          localStorage.removeItem('paleCorridor_save');
          localStorage.removeItem('paleCorridor_cycle');
          localStorage.removeItem('pale_corridor_reputation');
          localStorage.removeItem('pale_corridor_commissions');
          location.reload();
        });
      } catch(e) {}
      // 加载历史消息
      try {
        var messages = await mujianSdk.ai.chat.message.getAll();
        if (messages && messages.length > 0) {
          messages.forEach(function(msg) {
            if (msg.role === 'assistant') {
              G.messageHistory.push({ type: 'ai', text: msg.content });
            } else if (msg.role === 'user') {
              G.messageHistory.push({ type: 'player', text: msg.content });
            }
          });
        }
      } catch(e) {}
    } else {
      updateConnectionStatus(false);
    }
  } catch (e) {
    updateConnectionStatus(false);
  }
}
