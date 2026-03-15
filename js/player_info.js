// ============================================================
// ★★★ 玩家名字注入系统 ★★★
// ============================================================

function getPlayerInfoForAI() {
  var info = '\n\n【玩家信息 - 必须遵守】\n';
  if (G.playerName) {
    info += '★重要★ 玩家的名字是「' + G.playerName + '」。你必须始终用这个名字称呼玩家。绝对不要编造其他名字，不要叫玩家"陈默"或任何其他名字。只能叫「' + G.playerName + '」。\n';
  } else {
    info += '★重要★ 玩家没有设置名字。请始终用"你"来称呼玩家。绝对不要自行编造任何名字（如"陈默"等），只能用"你"。\n';
  }
  if (G.playerPersona) {
    info += '玩家的人设/背景描述：' + G.playerPersona + '\n';
  }
  if (G.playerCode) {
    info += '玩家编号：' + (G.playerDisplayCode || G.playerCode) + '\n';
  }
  return info;
}

// 调试：5秒后在控制台打印玩家信息
setTimeout(function() {
  console.log('======= 玩家信息检查 =======');
  console.log('playerName:', G.playerName);
  console.log('playerPersona:', G.playerPersona);
  console.log('playerCode:', G.playerCode);
  if (!G.playerName) {
    console.log('⚠️ 警告：没有获取到玩家名字！');
    console.log('可能原因：');
    console.log('  1. 幕间平台没有设置人设');
    console.log('  2. SDK的persona API返回了意外的数据结构');
    console.log('  请查看上方 ★ 人设原始数据 的日志');
  } else {
    console.log('✅ 玩家名字已获取：' + G.playerName);
  }
  console.log('============================');
}, 5000);

console.log('✅ 玩家名字注入系统加载完成');
