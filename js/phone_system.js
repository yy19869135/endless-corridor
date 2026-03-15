function toggleSystemPhone() {
  document.getElementById('systemPhone').classList.toggle('show');
  if (document.getElementById('systemPhone').classList.contains('show')) {
    renderSystemApp('home');
  }
}

function renderSystemApp(app) {
  var screen = document.getElementById('systemScreen');
  var html = '';

  switch (app) {
    case 'home':
      html += '<div class="app-grid">';
      html += '<div class="sys-app-btn" onclick="renderSystemApp(\'contacts\')">📱<br>通讯录</div>';
      html += '<div class="sys-app-btn" onclick="renderSystemApp(\'market\')">🏪<br>黑市</div>';
      html += '<div class="sys-app-btn" onclick="renderSystemApp(\'rank\')">🏆<br>排行榜</div>';
      html += '<div class="sys-app-btn" onclick="renderSystemApp(\'team\')">👥<br>队伍</div>';
      html += '<div class="sys-app-btn" onclick="renderSystemApp(\'bag\')">🎒<br>背包</div>';
      html += '<div class="sys-app-btn" onclick="renderSystemApp(\'status\')">📊<br>状态</div>';
html += '<div class="sys-app-btn" onclick="renderSystemApp(\'settings\')">⚙️<br>设置</div>';
html += '</div>';
      break;

    case 'contacts':
      html += '<span class="sys-back-btn" onclick="renderSystemApp(\'home\')">← 返回</span>';
      html += '<div class="sys-section-title">📱 通讯录</div>';
      if (G.contacts.length === 0) {
        html += '<div style="text-align:center;color:#555;padding:30px">还没有联系人<br><br>在副本中遇到NPC后会自动添加</div>';
      } else {
        G.contacts.forEach(function(c) {
          html += '<div class="contact-item">';
          html += '<span class="contact-avatar">' + (c.icon || '👤') + '</span>';
          html += '<div class="contact-info"><div class="contact-name">' + c.name + '</div>';
          html += '<div class="contact-affinity">好感度：' + (c.affinity || 0) + '</div>';
          html += '<div class="contact-status-text">' + (c.status || '未知') + '</div></div></div>';
        });
      }
      break;

    case 'market':
      html += '<span class="sys-back-btn" onclick="renderSystemApp(\'home\')">← 返回</span>';
      html += '<div class="sys-section-title">🏪 黑市</div>';
      html += '<div style="text-align:right;font-size:10px;color:#ffd700;margin-bottom:8px">💎 ' + G.soulFragments + '</div>';
      var marketItems = [
        { id: 'substitute_doll', name: '替死娃娃', icon: '🪆', price: 150, desc: '死亡时自动消耗，复活并恢复3HP', consumable: true, stackable: true },
        { id: 'san_potion', name: '安神香', icon: '🕯️', price: 80, desc: '使用后恢复20SAN', consumable: true, stackable: true, onUse: function(){ updateSAN(G.san + 20); addMessage('system', '🕯️ 安神香的烟雾让你平静下来。SAN+20'); } },
        { id: 'hp_potion', name: '血色药剂', icon: '🧪', price: 60, desc: '使用后恢复3HP', consumable: true, stackable: true, onUse: function(){ updateHP(G.hp + 3); addMessage('system', '🧪 温热的液体流过喉咙。HP+3'); } },
        { id: 'compass', name: '灵魂罗盘', icon: '🧭', price: 200, desc: '在副本中显示隐藏房间的方向', consumable: false },
        { id: 'tear_of_regression', name: '💧 回溯之泪', icon: '💧', price: 5000, desc: '极稀有！复活一名死亡的可攻略角色，好感度+30', consumable: true, stackable: true, rarity: 'legendary' }
      ];
      marketItems.forEach(function(item) {
        var canBuy = G.soulFragments >= item.price;
        html += '<div class="market-item">';
        html += '<div><div style="color:#ddd;font-size:12px">' + item.icon + ' ' + item.name + '</div>';
        html += '<div style="color:#888;font-size:10px">' + item.desc + '</div></div>';
        html += '<div style="text-align:right"><div style="color:#ffd700;font-size:11px">💎' + item.price + '</div>';
        if (canBuy) {
          html += '<button class="market-buy-btn" onclick="buyMarketItem(\'' + item.id + '\',' + item.price + ')">购买</button>';
        } else {
          html += '<span style="color:#555;font-size:10px">不足</span>';
        }
        html += '</div></div>';
      });
      break;

    case 'rank':
      html += '<span class="sys-back-btn" onclick="renderSystemApp(\'home\')">← 返回</span>';
      html += '<div class="sys-section-title">🏆 排行榜</div>';
      html += '<div style="text-align:right;font-size:10px;color:#888;margin-bottom:8px">你的碎片：💎 ' + G.soulFragments + '</div>';
      G.leaderboard.forEach(function(r) {
        var isUser = r.tag === 'User';
        var bgColor = isUser ? 'rgba(80,60,0,0.3)' : 'rgba(20,8,8,0.3)';
        var borderColor = isUser ? '#8b7500' : '#3a1515';
        var posColor = r.rank === 1 ? 'color:#FFD700' : (r.rank === 2 ? 'color:#C0C0C0' : (r.rank === 3 ? 'color:#CD7F32' : ''));
        html += '<div style="background:' + bgColor + ';border:1px solid ' + borderColor + ';border-radius:8px;padding:10px;margin-bottom:6px;display:flex;flex-direction:column;gap:2px">';
        html += '<div style="display:flex;justify-content:space-between;width:100%;align-items:center">';
        html += '<span style="font-size:12px;' + posColor + '">#' + r.rank + ' ' + (r.icon || '') + ' <b>' + r.name + '</b>' + (isUser ? ' ⭐' : '') + '</span>';
        html += '<span style="font-size:11px;color:#ffd700">💎' + r.score.toLocaleString() + '</span>';
        html += '</div>';
        if (r.title) html += '<div style="font-size:9px;color:#666">' + r.title + '</div>';
        if (r.hasRareItem && r.rareItem) html += '<div style="font-size:9px;color:#da70d6;background:rgba(139,0,139,0.15);padding:1px 6px;border-radius:3px;border:1px solid #8b008b;display:inline-block;margin-top:2px">✨ ' + r.rareItem + '</div>';
        if (r.tag === 'Recruitable') html += '<div style="font-size:9px;color:#DAA520;margin-top:2px">⭐ 可攻略角色</div>';
        html += '</div>';
      });
      break;

    case 'team':
      html += '<span class="sys-back-btn" onclick="renderSystemApp(\'home\')">← 返回</span>';
      html += '<div class="sys-section-title">👥 队伍 (' + G.team.length + '/' + G.teamMaxSize + ')</div>';
      for (var i = 0; i < G.teamMaxSize; i++) {
        if (G.team[i]) {
          html += '<div class="team-slot filled">' + (G.team[i].icon || '👤') + ' ' + G.team[i].name + '<br><span style="font-size:9px;color:#888">' + (G.team[i].role || '队员') + '</span></div>';
        } else {
          html += '<div class="team-slot">空位 - 在副本中招募同伴</div>';
        }
      }
      break;

    case 'bag':
      html += '<span class="sys-back-btn" onclick="renderSystemApp(\'home\')">← 返回</span>';
      html += '<div class="sys-section-title">🎒 永久背包</div>';
      if (G.permanentItems.length === 0) {
        html += '<div style="text-align:center;color:#555;padding:20px">没有永久道具<br><br>在黑市购买或副本中获取</div>';
      } else {
        G.permanentItems.forEach(function(item) {
          html += '<div class="market-item">';
          html += '<div><div style="color:#ddd;font-size:12px">' + (item.icon || '📦') + ' ' + item.name + (item.count > 1 ? ' x' + item.count : '') + '</div>';
          html += '<div style="color:#888;font-size:10px">' + (item.desc || '') + '</div></div>';
          if (item.onUse && !G.inDungeon) {
            html += '<button class="market-buy-btn" onclick="usePermItemFromPhone(\'' + item.id + '\')">使用</button>';
          }
          html += '</div>';
        });
      }
      break;

    case 'status':
      html += '<span class="sys-back-btn" onclick="renderSystemApp(\'home\')">← 返回</span>';
      html += '<div class="sys-section-title">📊 玩家状态</div>';
      html += '<div style="padding:8px">';
      html += '<div>📱 我的编号：<span style="color:#ffd700;font-family:monospace;letter-spacing:1px">' + (G.playerDisplayCode || '未生成') + '</span></div>';
      html += '<div style="margin-bottom:8px;color:#ddd">❤️ HP：' + G.hp + ' / ' + G.maxHp + '</div>';
      html += '<div style="margin-bottom:8px;color:#ddd">🧠 SAN：' + G.san + ' / ' + G.maxSan + '</div>';
      html += '<div style="margin-bottom:8px;color:#ffd700">💎 灵魂碎片：' + G.soulFragments + '</div>';
      html += '<div style="margin-bottom:8px;color:#ddd">🎴 阵营：' + (G.playerFaction ? G.playerFaction.icon + ' ' + G.playerFaction.name : '未抽取') + '</div>';
      html += '<div style="margin-bottom:8px;color:#ddd">✅ 通关副本：' + G.completedDungeons.length + '个</div>';
      html += '<div style="margin-bottom:8px;color:#ddd">📦 永久道具：' + G.permanentItems.length + '件</div>';
      html += '<div style="margin-bottom:8px;color:#ddd">👥 队伍人数：' + G.team.length + '/' + G.teamMaxSize + '</div>';
      
      // ★★★ 回到现实世界 ★★★
      html += '<div style="margin-top:20px;padding-top:12px;border-top:1px solid #3a1515">';
      html += '<div style="font-size:12px;color:#888;margin-bottom:8px;text-align:center">🌍 回到现实世界</div>';
      html += '<div style="font-size:10px;color:#555;text-align:center;margin-bottom:8px;line-height:1.8">收集 99,999 灵魂碎片即可打开回到现实世界的通道。<br>当前进度：💎 ' + G.soulFragments + ' / 99,999</div>';
      html += '<div style="background:rgba(30,15,15,0.6);border-radius:4px;height:8px;overflow:hidden;margin-bottom:8px">';
      var progressPercent = Math.min(100, (G.soulFragments / 99999) * 100);
      html += '<div style="height:100%;width:' + progressPercent + '%;background:linear-gradient(90deg,#4a2,#6d4);border-radius:4px;transition:width 0.5s"></div>';
      html += '</div>';
      if (G.soulFragments >= 99999) {
        html += '<button style="width:100%;padding:12px;border:2px solid #6d4;border-radius:8px;background:rgba(20,60,20,0.4);color:#88ff88;font-size:14px;cursor:pointer;animation:ruleEventPulse 2s infinite" onclick="triggerReturnToReality()">🌍 打开现实之门</button>';
      } else {
        html += '<div style="text-align:center;font-size:10px;color:#444">碎片不足，继续探索副本吧...</div>';
      }
      html += '</div>';
      
      html += '</div>';
      break;

    case 'settings':
      html += '<span class="sys-back-btn" onclick="renderSystemApp(\'home\')">← 返回</span>';
      html += '<div class="sys-section-title">⚙️ 设置</div>';
      html += '<div style="padding:8px">';
      html += '<div style="margin-bottom:12px;color:#ddd;font-size:12px">📂 存档管理</div>';
      html += '<div style="margin-bottom:8px;padding:10px;background:rgba(20,8,8,0.6);border:1px solid #3a1515;border-radius:8px">';
      html += '<div style="color:#888;font-size:11px;margin-bottom:4px">当前存档</div>';
      try {
        var saveRaw = localStorage.getItem('paleCorridor_save');
        if (saveRaw) {
          var saveInfo = JSON.parse(saveRaw);
          var saveDate = new Date(saveInfo.timestamp);
          html += '<div style="color:#aaa;font-size:10px">保存时间：' + saveDate.toLocaleString() + '</div>';
          html += '<div style="color:#aaa;font-size:10px">HP：' + (saveInfo.hp||0) + '/' + (saveInfo.maxHp||10) + ' | SAN：' + (saveInfo.san||0) + '/' + (saveInfo.maxSan||100) + '</div>';
          html += '<div style="color:#aaa;font-size:10px">碎片：' + (saveInfo.soulFragments||0) + ' | 通关：' + (saveInfo.completedDungeons||[]).length + '个</div>';
          html += '<div style="color:#aaa;font-size:10px">阶段：' + (saveInfo.inDungeon ? '副本中（' + (saveInfo.dungeonId||'?') + '）' : '大世界') + '</div>';
        } else {
          html += '<div style="color:#555;font-size:10px">无存档</div>';
        }
      } catch(e) {
        html += '<div style="color:#555;font-size:10px">读取失败</div>';
      }
      html += '</div>';
      html += '<button style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #3a5a3a;border-radius:8px;background:rgba(10,40,10,0.3);color:#88ff88;font-size:12px;cursor:pointer" onclick="manualSaveGame()">💾 手动保存</button>';
      html += '<button style="width:100%;padding:10px;margin-bottom:16px;border:1px solid #5a1515;border-radius:8px;background:rgba(80,10,10,0.3);color:#ff6666;font-size:12px;cursor:pointer" onclick="toggleSystemPhone();toggleGameMenu()">🗑️ 重置存档（前往菜单）</button>';
      html += '<div style="margin-top:16px;color:#ddd;font-size:12px">🎮 游戏信息</div>';
      html += '<div style="padding:8px;color:#666;font-size:10px;line-height:2">';
      html += '副本总数：' + DUNGEON_LIST.length + '个<br>';
      html += '角色总数：' + Object.keys(CHARACTER_DB).length + '个<br>';
      html += '版本：v2.0<br>';
      html += '</div>';
      html += '</div>';
      break;
  }

  screen.innerHTML = html;
}

// ★★★ 回到现实世界 - 真结局 ★★★
function triggerReturnToReality() {
  if (G.soulFragments < 99999) {
    showNotification('碎片不足！', 'horror');
    return;
  }
  
  if (!confirm('你确定要消耗 99,999 灵魂碎片打开现实之门吗？\n\n这将触发游戏的真结局。')) return;
  
  // 关闭手机
  toggleSystemPhone();
  
  // 扣除碎片
  G.soulFragments -= 99999;
  
  // 真结局演出
  var overlay = document.createElement('div');
  overlay.id = 'realityEndingOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:99999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 2s';
  
  var container = document.createElement('div');
  container.style.cssText = 'max-width:500px;width:90%;text-align:center;color:#c8c8d0;padding:20px';
  
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // 渐入
  setTimeout(function() { overlay.style.opacity = '1'; }, 100);
  
  // 第一段文字
  setTimeout(function() {
    container.innerHTML = '<div style="font-size:14px;line-height:2.5;opacity:0;animation:ruleEventFadeIn 3s forwards">' +
      '你将收集到的99,999枚灵魂碎片投入了苍白回廊中央的裂隙。<br><br>' +
      '碎片化作金色的光芒，照亮了这个永恒灰暗的空间。<br><br>' +
      '裂隙越来越大，你看到了——<br><br>' +
      '<span style="color:#88ff88;font-size:16px">阳光。</span>' +
      '</div>';
  }, 2000);
  
  // 第二段文字
  setTimeout(function() {
    container.innerHTML = '<div style="font-size:14px;line-height:2.5;opacity:0;animation:ruleEventFadeIn 3s forwards">' +
      '你穿过了那道门。<br><br>' +
      '身后，苍白回廊的一切在崩塌。<br>' +
      '那些副本，那些怪物，那些规则——<br>' +
      '都在化为虚无。<br><br>' +
      '你睁开眼睛。<br><br>' +
      '你躺在一张普通的床上。<br>' +
      '窗外是真实的天空。<br>' +
      '手机屏幕上显示着一条未读消息：<br><br>' +
      '<span style="color:#ffd700;font-size:13px">"欢迎回到现实世界。"</span>' +
      '</div>';
  }, 10000);
  
  // 最终画面
  setTimeout(function() {
    container.innerHTML = '<div style="opacity:0;animation:ruleEventFadeIn 3s forwards">' +
      '<div style="font-size:24px;color:#88ff88;margin-bottom:20px">🌍 真结局</div>' +
      '<div style="font-size:18px;color:#e0e0e0;margin-bottom:10px">— 回到现实 —</div>' +
      '<div style="font-size:12px;color:#888;margin-bottom:30px;line-height:2">' +
      '通关副本数：' + G.completedDungeons.length + '<br>' +
      '永久道具数：' + G.permanentItems.length + '<br>' +
      '队伍成员：' + G.team.length + '<br>' +
      '剩余碎片：' + G.soulFragments +
      '</div>' +
      '<div style="font-size:11px;color:#555;margin-bottom:30px">感谢你的游玩。苍白回廊的故事到此结束。<br>...或者，只是另一个循环的开始？</div>' +
      '<button onclick="closeRealityEnding()" style="background:rgba(40,80,40,0.4);border:1px solid #4a8;color:#88ff88;padding:12px 40px;border-radius:8px;font-size:14px;cursor:pointer">关闭</button>' +
      '</div>';
  }, 20000);
  
  saveGame();
}

function closeRealityEnding() {
  var overlay = document.getElementById('realityEndingOverlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(function() { overlay.remove(); }, 2000);
  }
}

function manualSaveGame() {
  saveGame();
  showNotification('💾 存档成功', 'clue');
  // 刷新设置页面显示
  renderSystemApp('settings');
}

function confirmResetAllData() {
  if (!confirm('确定要清除所有存档数据吗？\n\n这将删除你的所有进度、道具、通讯录、碎片等，无法恢复！')) return;
  if (!confirm('真的确定吗？这个操作不可撤销！')) return;
  localStorage.removeItem('paleCorridor_save');
  localStorage.removeItem('paleCorridor_cycle');
  localStorage.removeItem('pale_corridor_reputation');
  localStorage.removeItem('pale_corridor_commissions');
  location.reload();
}

function usePermItemFromPhone(itemId) {
  var item = G.permanentItems.find(function(i){ return i.id === itemId; });
  if (item && item.onUse) {
    item.onUse();
    if (item.consumable) removePermanentItem(itemId);
    renderSystemApp('bag');
  }
}

function buyMarketItem(itemId, price) {
  if (G.soulFragments < price) {
    showNotification('灵魂碎片不足', 'horror');
    return;
  }
  G.soulFragments -= price;
  updateFragmentDisplay();

  // 根据ID创建道具
  var itemDefs = {
    'substitute_doll': { id: 'substitute_doll', name: '替死娃娃', icon: '🪆', desc: '死亡时自动消耗，复活并恢复3HP', consumable: true, stackable: true },
    'san_potion': { id: 'san_potion', name: '安神香', icon: '🕯️', desc: '使用后恢复20SAN', consumable: true, stackable: true, onUse: function(){ updateSAN(G.san + 20); addMessage('system', '🕯️ 安神香的烟雾让你平静下来。SAN+20'); } },
    'hp_potion': { id: 'hp_potion', name: '血色药剂', icon: '🧪', desc: '使用后恢复3HP', consumable: true, stackable: true, onUse: function(){ updateHP(G.hp + 3); addMessage('system', '🧪 温热的液体流过喉咙。HP+3'); } },
    'compass': { id: 'compass', name: '灵魂罗盘', icon: '🧭', desc: '在副本中显示隐藏房间的方向', consumable: false },
    'tear_of_regression': { id: 'tear_of_regression', name: '回溯之泪', icon: '💧', desc: '复活死亡的可攻略角色，好感度+30', consumable: true, stackable: true }
  };

  var item = itemDefs[itemId];
  if (item) {
    addPermanentItem(item);
    showNotification('购买成功：' + item.name, 'clue');
    addMessage('system', '🏪 购买了 ' + item.icon + ' ' + item.name);
    renderSystemApp('market');
  }
}
