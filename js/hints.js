//  先驱者笔记系统（原攻略提示，已重构）

var DUNGEON_HINTS = {
  'hospital': [
    {
      vague_title: '关于接待台上散落的文件...',
      vague_hint: '笔记残页："我刚到大厅的时候，接待台上的东西引起了我的注意...墙上那张平面图，有人用红笔圈了什么地方..."',
      detail: '在医院大厅的接待台上调查文件，可以找到「病历残页」。注意墙上的平面图，地下室被红笔圈出。',
      room_hint: 'lobby',
      item_hint: null
    },
    {
      vague_title: '护士站桌上的日记...',
      vague_hint: '笔记残页："大厅东边那间护士站，桌上有一本日记...药品柜里有好东西，输入跟药有关的词试试..."',
      detail: '从大厅向东进入护士站，调查桌上的日记获得「护士日记」。别忘了拿药品柜里的镇静剂（输入"药"或"镇静"）。',
      room_hint: 'nurse_station',
      item_hint: null
    },
    {
      vague_title: '手术室墙上的数字...',
      vague_hint: '笔记残页："西边的手术室...墙上有几个数字，我觉得这是某种密码。记住它，后面要用不止一次。"',
      detail: '从大厅向西进入手术室，调查墙上的数字获得「钥匙密码」：0733。这个密码后面会用到两次。',
      room_hint: 'surgery',
      item_hint: null
    },
    {
      vague_title: '三楼走廊尽头的锁门...',
      vague_hint: '笔记残页："大厅往北能到三楼走廊...走廊尽头有扇锁着的门。如果你之前留意过某些数字的话..."',
      detail: '从大厅向北到三楼走廊，走廊尽头的门需要密码。在走廊输入"0733"或到达病房门前输入密码解锁三楼病房。',
      room_hint: 'corridor_3f',
      item_hint: null
    },
    {
      vague_title: '病房里的录音机...',
      vague_hint: '笔记残页："终于进了三楼病房...录音机里有东西。还有，注意看床底下..."',
      detail: '进入三楼病房后调查录音机，获得「最后的录音」。注意床下暗门会自动解锁地下室通道。',
      room_hint: 'ward_3f',
      item_hint: null
    },
    {
      vague_title: '院长室的保险箱...',
      vague_hint: '笔记残页："手术室南边是院长室...保险箱需要之前找到的那串数字。里面的东西是逃出去的关键。"',
      detail: '从手术室向南进入院长室，输入"0733"打开保险箱，获得「地下通道地图」和「地下室钥匙」。需要先拥有密码线索。',
      room_hint: 'director_office',
      item_hint: null
    },
    {
      vague_title: '地下室的铁门...',
      vague_hint: '笔记残页（字迹潦草）："地下室...用钥匙开铁门就能出去...如果你收集了所有线索，结局会不一样..."',
      detail: '进入地下室后，使用「地下室钥匙」打开铁门逃脱。收集全部5条线索可触发S级结局「真相大白」（120碎片），只带钥匙和地图可触发A级结局（80碎片）。',
      room_hint: 'basement',
      item_hint: 'basement_key'
    }
  ],

  'mansion': [
    {
      vague_title: '壁炉台上的信件...',
      vague_hint: '笔记残页："庄园大门往北就是门厅...壁炉台上有一封信，是庄园主留下的。"',
      detail: '从庄园大门向北进入门厅，调查壁炉台上的信件获得「庄园主遗书」。',
      room_hint: 'hall', item_hint: null
    },
    {
      vague_title: '仆人房里的秘密...',
      vague_hint: '笔记残页："门厅西边的仆人房有一本日记...衣柜里还有点好东西。"',
      detail: '从门厅向西进入仆人房，调查日记获得「仆人的证词」。衣柜里还有一瓶红酒可以拿。',
      room_hint: 'servant_room', item_hint: null
    },
    {
      vague_title: '书房里蓝色的火焰...',
      vague_hint: '笔记残页："门厅再往北是书房...那本笔记很重要。壁炉的火是蓝色的，不正常..."',
      detail: '从门厅向北进入书房，调查笔记获得「仪式笔记」。注意壁炉的蓝色火焰。',
      room_hint: 'study', item_hint: null
    },
    {
      vague_title: '那幅歪斜的画像...',
      vague_hint: '笔记残页："门厅东边的画廊...有一幅画挂歪了。不是意外，是线索。画后面有东西。"',
      detail: '从门厅向东进入画廊，调查歪斜的画像获得「画像的秘密」和银钥匙。',
      room_hint: 'gallery', item_hint: null
    },
    {
      vague_title: '镜厅中的祭坛...',
      vague_hint: '笔记残页："画廊再往东就是镜厅...祭坛上有个钥匙孔。如果你之前拿到了某把钥匙的话..."',
      detail: '从画廊向东进入镜厅，调查祭坛获得「地下密室线索」。用银钥匙插入祭坛钥匙孔解锁地下密室。',
      room_hint: 'mirror_hall', item_hint: 'silver_key'
    },
    {
      vague_title: '地下密室的棺材...',
      vague_hint: '笔记残页："地下密室里有一口棺材...打开它就能知道一切。"',
      detail: '进入地下密室，调查棺材获得「庄园主的真相」。',
      room_hint: 'secret_room', item_hint: null
    },
    {
      vague_title: '最终的选择...',
      vague_hint: '笔记残页（字迹颤抖）："收集所有线索后...在地下密室做出选择。解放他们，或者用仪式..."',
      detail: '收集全部6条线索后在地下密室选择「解放灵魂」触发S级结局（150碎片）。或在镜厅用仪式笔记+真相执行仪式触发A级结局（100碎片）。',
      room_hint: 'secret_room', item_hint: null
    }
  ],

  'train': [
    {
      vague_title: '座位缝隙里的东西...',
      vague_hint: '笔记残页："1号车厢的座位缝隙里有东西...还有，千万别看窗外。"',
      detail: '在座位缝隙中调查获得「车票」。不要看窗外（会掉SAN）。',
      room_hint: 'car_1', item_hint: null
    },
    {
      vague_title: '餐车吧台后面...',
      vague_hint: '笔记残页："往北走到2号餐车...吧台后面藏着一份名单。"',
      detail: '向北进入餐车，调查吧台后面的名单获得「乘客名单」。',
      room_hint: 'car_2', item_hint: null
    },
    {
      vague_title: '卧铺车厢的列车员隔间...',
      vague_hint: '笔记残页："3号卧铺车厢...列车员的隔间里有日志。记住，不要拉帘子。"',
      detail: '继续向北到卧铺车厢，调查列车员隔间获得「列车日志」。不要拉帘子。',
      room_hint: 'car_3', item_hint: null
    },
    {
      vague_title: '行李车厢墙上的数字...',
      vague_hint: '笔记残页："4号行李车厢...墙上有一组数字，是个简单的数学题。还有一个写着你名字的包裹..."',
      detail: '向北到行李车厢，调查墙上数字获得「紧急制动密码」：1+2+3+4+5+6+7=28。拿走写着你名字的包裹里的小镜子。',
      room_hint: 'car_4', item_hint: null
    },
    {
      vague_title: '列车长室的门锁...',
      vague_hint: '笔记残页："5号空车厢直接穿过就行。6号车厢的门需要之前算出来的那个数字..."',
      detail: '5号空车厢直接穿过。6号车厢门需要密码28。进入后调查信件获得「列车长的信」。穿上列车长制服。',
      room_hint: 'car_6', item_hint: null
    },
    {
      vague_title: '驾驶室的入口...',
      vague_hint: '笔记残页："要进驾驶室...你得穿对衣服。"',
      detail: '穿着制服进入驾驶室。',
      room_hint: 'cockpit', item_hint: null
    },
    {
      vague_title: '三个选择...',
      vague_hint: '笔记残页（最后一页，血迹斑斑）："驾驶室里有三条路...制动杆需要密码，接替需要信和制服，最好的结局...需要镜子和所有线索..."',
      detail: '驾驶室有三个选择：①拉下制动杆（需密码28）→B级结局70碎片；②穿制服+列车长信→接替列车长A级100碎片；③用小镜子+全部线索→S级终点站150碎片。',
      room_hint: 'cockpit', item_hint: null
    }
  ],

  'gen_04': [
    {
      vague_title: '关于讲台上的粉笔盒...',
      vague_hint: '笔记残页："我醒来的时候在教室里...课桌抽屉里有一张奇怪的表。讲台上的粉笔盒里有粉笔，拿一根吧，说不定用得上。"',
      detail: '从校门向北进入教室，调查课桌抽屉获得「值日表」。可以拿一根粉笔。',
      room_hint: 'classroom',
      item_hint: null
    },
    {
      vague_title: '走廊通向四个方向...',
      vague_hint: '笔记残页："教室右边是走廊...走廊是这个学校的中心，四个方向都有路。北边有声音传来，东边有琴声，南边...有一股檀香味。"',
      detail: '从教室向右（东）进入走廊。走廊连接广播室（北）、音乐教室（东）、校长室（南）。',
      room_hint: 'corridor',
      item_hint: null
    },
    {
      vague_title: '广播室里传来的杂音...',
      vague_hint: '笔记残页："走廊往北是广播室...调音台上有一份广播稿。还有一盘录音带，标着一个日期。别碰麦克风。"',
      detail: '从走廊向北进入广播室，调查广播稿获得「广播稿」。可以拿走"6月6日最后广播"录音带。',
      room_hint: 'broadcast_room',
      item_hint: null
    },
    {
      vague_title: '校长室那扇虚掩的门...',
      vague_hint: '笔记残页："走廊往南是校长室...桌上有一份机密文件。还有一枚印章，眼睛形状的...拿走它，后面有用。"',
      detail: '从走廊向下（南）进入校长室，调查备忘录获得「校长的备忘录」。可以拿走红色印章。',
      room_hint: 'principal_office',
      item_hint: null
    },
    {
      vague_title: '钢琴暗格里的秘密...',
      vague_hint: '笔记残页："走廊往东是音乐教室...谱架上的乐谱很重要。把音符对应的数字弹出来——三个数字，跟日期有关。钢琴会给你回应。"',
      detail: '从走廊向东进入音乐教室，调查乐谱获得「音乐教室的乐谱」。获得乐谱后用特殊按钮「弹奏606」或输入"606"，从钢琴暗格获得档案室钥匙。',
      room_hint: 'music_room',
      item_hint: 'archive_key'
    },
    {
      vague_title: '档案室墙上的合影...',
      vague_hint: '笔记残页（字迹发抖）："用钥匙打开档案室...墙上有一张毕业照，别看太久。如果你拿了那枚印章...按在照片上你的名字那里。会出现一扇门。"',
      detail: '从音乐教室向北进入档案室（需要钥匙），调查毕业照获得「毕业照」（SAN-10注意）。用红色印章按在毕业照上解锁地下教室暗门。',
      room_hint: 'archive_room',
      item_hint: 'red_stamp'
    },
    {
      vague_title: '地下教室的最终考试...',
      vague_hint: '笔记残页（最后一页，墨水洇开）："地下教室里有一份试卷...如果你知道了真相，就写下来。如果你带了录音带，也可以播放。千万不要...选择沉默..."',
      detail: '进入地下教室后：①有备忘录+毕业照→选「写下真相」触发S级结局120碎片；②有录音带→选「播放录音带」也可触发S级；③选「保持沉默」→D级死亡结局20碎片。',
      room_hint: 'basement',
      item_hint: 'last_tape'
    }
  ]
};

// 记录每个提示是否已被查看（按副本ID存储）
var hintViewedMap = {};
// 记录每个提示是否已展开详细内容
var hintDetailViewedMap = {};

function openHintPanel() {
  document.getElementById('hintOverlay').classList.add('show');
  renderHintList();
}

function closeHintPanel() {
  document.getElementById('hintOverlay').classList.remove('show');
}

// 智能推荐：判断玩家当前最可能卡在哪一步
function getRecommendedHintIndex(hints, dungeonId) {
  if (!G.inDungeon || !G.dungeon) return -1;

  // 策略：从后往前找，找到第一个"玩家还没完成"的步骤
  // 简单判断：如果玩家还没访问过某个房间，或者还没拿到某个道具
  for (var i = 0; i < hints.length; i++) {
    var hint = hints[i];

    // 如果有 room_hint，检查玩家是否访问过该房间
    if (hint.room_hint && G.visitedRooms) {
      var visited = false;
      if (G.visitedRooms instanceof Set) {
        visited = G.visitedRooms.has(hint.room_hint);
      } else if (Array.isArray(G.visitedRooms)) {
        visited = G.visitedRooms.indexOf(hint.room_hint) >= 0;
      }
      if (!visited) {
        return i;
      }
    }

    // 如果有 item_hint，检查玩家是否拥有该道具
    if (hint.item_hint) {
      var hasItem = G.dungeonItems.some(function(item) { return item.id === hint.item_hint; });
      if (!hasItem) {
        return i;
      }
    }
  }

  // 所有步骤都完成了，推荐最后一步
  return hints.length - 1;
}

function renderHintList() {
  var container = document.getElementById('hintList');
  var warning = document.getElementById('hintWarning');

  if (!G.inDungeon || !G.dungeon) {
    container.innerHTML = '<div class="hint-no-dungeon">尚未进入副本<br><br>进入副本后可在此查看先驱者留下的笔记</div>';
    warning.style.display = 'none';
    return;
  }

  var dungeonId = G.dungeon.id || 'silent_school';
  var hints = DUNGEON_HINTS[dungeonId];

  if (!hints || hints.length === 0) {
    container.innerHTML = '<div class="hint-no-dungeon">这个副本没有发现先驱者的遗物...</div>';
    warning.style.display = 'none';
    return;
  }

  // 初始化查看记录
  if (!hintViewedMap[dungeonId]) hintViewedMap[dungeonId] = {};
  if (!hintDetailViewedMap[dungeonId]) hintDetailViewedMap[dungeonId] = {};

  warning.style.display = 'block';

  var recommendedIdx = getRecommendedHintIndex(hints, dungeonId);
  var html = '';

  for (var i = 0; i < hints.length; i++) {
    var hint = hints[i];
    var isViewed = hintViewedMap[dungeonId][i];
    var isDetailViewed = hintDetailViewedMap[dungeonId][i];
    var isRecommended = (i === recommendedIdx);

    // 外层容器
    html += '<div class="hint-item' + (isRecommended ? ' recommended' : '') + '" id="hintItem_' + i + '">';

    // 标题行
    html += '<div class="hint-item-header" onclick="toggleHintExpand(' + i + ')">';
    html += '<span class="hint-item-step">';
    if (isRecommended) html += '<span class="hint-recommend-badge">📍 当前推荐</span> ';
    html += hint.vague_title;
    html += '</span>';

    // 状态标签
    if (isDetailViewed) {
      html += '<span class="hint-item-status unlocked">📖 已阅</span>';
    } else if (isViewed) {
      html += '<span class="hint-item-status partial">📝 已读线索</span>';
    } else {
      html += '<span class="hint-item-status locked">📜 未读</span>';
    }
    html += '<span class="hint-expand-arrow" id="hintArrow_' + i + '">▼</span>';
    html += '</div>';

    // 展开内容区（默认隐藏）
    html += '<div class="hint-expand-body" id="hintBody_' + i + '" style="display:none">';

    // 第一层：模糊线索（免费）
    html += '<div class="hint-vague-section">';
    html += '<div class="hint-vague-label">📜 先驱者的线索</div>';
    if (isViewed) {
      html += '<div class="hint-vague-content">' + hint.vague_hint + '</div>';
    } else {
      html += '<div class="hint-vague-locked">';
      html += '<button class="hint-read-btn" onclick="readVagueHint(' + i + ', event)">🕯️ 解读笔记 <span class="hint-san-cost">(-2 SAN)</span></button>';
      html += '</div>';
    }
    html += '</div>';

    // 第二层：详细答案（需要额外代价）
    html += '<div class="hint-detail-section">';
    html += '<div class="hint-detail-label">🩸 完整记录</div>';
    if (isDetailViewed) {
      html += '<div class="hint-detail-content">' + hint.detail + '</div>';
    } else if (isViewed) {
      // 已经读了模糊提示，可以花更多SAN看详细
      html += '<div class="hint-detail-locked">';
      html += '<button class="hint-read-btn danger" onclick="readDetailHint(' + i + ', event)">🩸 深入解读 <span class="hint-san-cost">(-3 SAN)</span></button>';
      html += '<div class="hint-detail-warn">⚠️ 精神污染加重</div>';
      html += '</div>';
    } else {
      html += '<div class="hint-detail-locked">';
      html += '<div class="hint-detail-need-first">需先解读上方线索</div>';
      html += '</div>';
    }
    html += '</div>';

    html += '</div>'; // hint-expand-body
    html += '</div>'; // hint-item
  }

  container.innerHTML = html;

  // 如果有推荐项，自动展开它
  if (recommendedIdx >= 0) {
    setTimeout(function() {
      var body = document.getElementById('hintBody_' + recommendedIdx);
      var arrow = document.getElementById('hintArrow_' + recommendedIdx);
      if (body) {
        body.style.display = 'block';
        if (arrow) arrow.textContent = '▲';
      }
    }, 100);
  }
}

// 折叠/展开
function toggleHintExpand(index) {
  var body = document.getElementById('hintBody_' + index);
  var arrow = document.getElementById('hintArrow_' + index);
  if (!body) return;

  if (body.style.display === 'none') {
    body.style.display = 'block';
    if (arrow) arrow.textContent = '▲';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.textContent = '▼';
  }
}

// 解读模糊线索（-3 SAN）
function readVagueHint(index, event) {
  if (event) event.stopPropagation();

  var dungeonId = G.dungeon ? G.dungeon.id : '';
  if (!dungeonId) return;

  // 扣除SAN值（模糊线索 -2）
if (typeof updateSAN === 'function') {
  updateSAN(G.san - 2);
} else {
  G.san = Math.max(0, G.san - 2);
}

  // 标记为已查看
  if (!hintViewedMap[dungeonId]) hintViewedMap[dungeonId] = {};
  hintViewedMap[dungeonId][index] = true;

  // 通知
  if (typeof showNotification === 'function') {
    showNotification('🧠 SAN -2 | 笔记已解读', 'horror');
  }

  // 触发SAN特效
  if (typeof triggerSanEffect === 'function') {
    triggerSanEffect();
  }

  renderHintList();

  // 保持该条展开
  setTimeout(function() {
    var body = document.getElementById('hintBody_' + index);
    var arrow = document.getElementById('hintArrow_' + index);
    if (body) {
      body.style.display = 'block';
      if (arrow) arrow.textContent = '▲';
    }
  }, 50);
}

// 解读详细内容（-5 SAN）
function readDetailHint(index, event) {
  if (event) event.stopPropagation();

  var dungeonId = G.dungeon ? G.dungeon.id : '';
  if (!dungeonId) return;

  // 扣除SAN值（详细答案 -3）
if (typeof updateSAN === 'function') {
  updateSAN(G.san - 3);
} else {
  G.san = Math.max(0, G.san - 3);
}

  // 标记
  if (!hintDetailViewedMap[dungeonId]) hintDetailViewedMap[dungeonId] = {};
  hintDetailViewedMap[dungeonId][index] = true;

  if (typeof showNotification === 'function') {
    showNotification('🧠 SAN -3 | 记忆涌入脑海...', 'horror');
  }

  if (typeof triggerSanEffect === 'function') {
    triggerSanEffect();
  }

  renderHintList();

  setTimeout(function() {
    var body = document.getElementById('hintBody_' + index);
    var arrow = document.getElementById('hintArrow_' + index);
    if (body) {
      body.style.display = 'block';
      if (arrow) arrow.textContent = '▲';
    }
  }, 50);
}

function resetHints() {
  hintViewedMap = {};
  hintDetailViewedMap = {};
}
