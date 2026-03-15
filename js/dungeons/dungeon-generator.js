var DIFFICULTY_CONFIG = {
  1: { label: '★☆☆☆☆', name: '入门', timeLimit: 600, roomCount: [4,5], baseReward: [80,150], sanDrain: 0.8 },
  2: { label: '★★☆☆☆', name: '普通', timeLimit: 540, roomCount: [5,6], baseReward: [150,300], sanDrain: 1.0 },
  3: { label: '★★★☆☆', name: '困难', timeLimit: 480, roomCount: [6,7], baseReward: [300,600], sanDrain: 1.2 },
  4: { label: '★★★★☆', name: '噩梦', timeLimit: 420, roomCount: [7,8], baseReward: [600,1200], sanDrain: 1.5 },
  5: { label: '★★★★★', name: '深渊', timeLimit: 360, roomCount: [8,10], baseReward: [1200,3000], sanDrain: 2.0 }
};

var DUNGEON_THEMES = {
  hospital: {
    name: '医疗', icons: ['🏥','💊','🩺','💉','🔬'],
    roomTypes: ['大厅','病房','手术室','药房','太平间','走廊','地下室','天台'],
    atmosphere: ['消毒水味','血腥味','腐烂气息','刺鼻药水味'],
    entities: ['护士幽灵','无面患者','爬行的病人','漂浮的白大褂'],
    objects: ['病历','药瓶','手术刀','轮椅','心电图','X光片'],
    horrors: [
      '走廊尽头的轮椅自己动了起来，缓缓向你滚来。',
      '天花板上的灯管逐个熄灭，黑暗正在向你逼近。',
      '你听到手术室里传来电锯的声音...但这里已经断电很久了。',
      '墙上的X光片中，你看到了一个不属于人类的骨骼结构。',
      '护士站的呼叫铃突然全部响起，显示屏上只有一个字："跑"。'
    ]
  },
  school: {
    name: '校园', icons: ['🏫','📚','🎒','✏️','🔔'],
    roomTypes: ['教室','走廊','图书馆','体育馆','音乐室','校长室','厕所','天台'],
    atmosphere: ['粉笔灰','旧书味','潮湿霉味','铁锈味'],
    entities: ['黑板上的人影','走廊里的学生','倒挂的值日生','没有脸的老师'],
    objects: ['课本','粉笔','校徽','日记','成绩单','毕业照'],
    horrors: [
      '黑板上的粉笔字在你眼前缓缓改变，变成了"不要回头"。',
      '广播突然响起，播放着一首你从未听过的校歌...歌词全是尖叫。',
      '你打开储物柜，里面塞满了写着你名字的试卷，每一张都是零分。',
      '体育馆的地板下传来有节奏的敲击声，像是有人在打篮球。',
      '毕业照上所有人的脸都转向了你，他们在笑。'
    ]
  },
  church: {
    name: '教堂', icons: ['⛪','✝️','🕯️','📿','🔔'],
    roomTypes: ['礼拜堂','告解室','钟楼','地下墓穴','牧师室','唱诗班席','储藏室','后院墓地'],
    atmosphere: ['焚香味','潮湿石头味','腐朽木头味','泥土味'],
    entities: ['哭泣的圣像','黑袍牧师','唱诗的幽灵','爬出墓穴的手'],
    objects: ['圣经','十字架','圣水','蜡烛','忏悔录','墓碑'],
    horrors: [
      '圣像的眼睛流出了血泪，嘴唇微微张开，发出无声的尖叫。',
      '管风琴自己弹奏起来，曲调是一首倒放的安魂曲。',
      '告解室的另一侧传来低语："我知道你做了什么..."',
      '钟楼的钟声在午夜响了十三下。',
      '地下墓穴的棺材盖开始从里面被推开。'
    ]
  },
  circus: {
    name: '马戏团', icons: ['🎪','🤡','🎭','🎠','🎪'],
    roomTypes: ['大帐篷','后台','化妆间','兽笼','旋转木马','镜子迷宫','小丑房','团长室'],
    atmosphere: ['爆米花味','油彩味','动物腥味','糖果甜味'],
    entities: ['微笑的小丑','没有线的提线木偶','笼中的影子','旋转木马上的骑手'],
    objects: ['面具','气球','魔术道具','海报','门票','小丑鼻子'],
    horrors: [
      '旋转木马开始自己转动，木马上坐着看不清面容的孩子们。',
      '镜子迷宫中，你的倒影开始做出你没有做的动作。',
      '一个气球从黑暗中飘来，上面写着你的名字和一个日期——明天。',
      '小丑的笑声从四面八方传来，越来越近，越来越尖锐。',
      '你发现所有海报上的表演者都有着同一张脸——你的脸。'
    ]
  },
  lighthouse: {
    name: '灯塔', icons: ['🌊','🗼','⚓','🐚','🌅'],
    roomTypes: ['入口','守塔人房间','储藏室','楼梯间','灯室','地下洞穴','码头','礁石'],
    atmosphere: ['海腥味','潮湿咸味','腐烂海藻味','铁锈味'],
    entities: ['溺水者','海雾中的身影','触手','守塔人的幽灵'],
    objects: ['航海日志','望远镜','信号灯','贝壳','锚','救生圈'],
    horrors: [
      '灯塔的光束照向大海，你看到海面下有无数双眼睛在注视着你。',
      '海雾中传来求救声，但声音来自灯塔内部。',
      '你在望远镜中看到远处有一艘船...船上的人都在向你招手。但那艘船沉没于一百年前。',
      '楼梯间的墙壁开始渗水，水中混着暗红色的液体。',
      '地下洞穴中传来低沉的歌声，像是鲸鱼的叫声...但更像是人的哀嚎。'
    ]
  },
  theater: {
    name: '剧院', icons: ['🎭','🎬','🎵','💃','🎻'],
    roomTypes: ['大厅','观众席','舞台','后台','化妆间','道具室','包厢','地下通道'],
    atmosphere: ['灰尘味','旧天鹅绒味','油漆味','香水味'],
    entities: ['舞台上的演员','观众席的影子','飘浮的面具','镜中的舞者'],
    objects: ['剧本','面具','戏服','乐谱','节目单','玫瑰花'],
    horrors: [
      '舞台上的聚光灯突然亮起，照亮了一个正在表演的身影...但观众席空无一人。',
      '你翻开剧本，发现里面写的是你今天经历的一切。下一页还没有写完。',
      '化妆镜前坐着一个人，正在化妆。你走近才发现...那是一具干尸。',
      '观众席上突然响起雷鸣般的掌声，但每个座位都是空的。',
      '一朵玫瑰从包厢中扔下，落在你脚边。花瓣是黑色的。'
    ]
  },
  subway: {
    name: '地铁', icons: ['🚇','🚉','🎫','🚨','🔦'],
    roomTypes: ['站台','车厢','隧道','控制室','通风管道','废弃站台','维修间','出口通道'],
    atmosphere: ['铁锈味','臭氧味','潮湿霉味','机油味'],
    entities: ['站台边缘的人影','隧道中的爬行者','列车中的乘客','广播中的声音'],
    objects: ['地铁卡','站点图','对讲机','手电筒','维修工具','涂鸦'],
    horrors: [
      '隧道深处传来列车的轰鸣声，但时刻表上显示末班车已经过了三个小时。',
      '站台的监控画面中，你看到自己身后站着一个人...但你回头什么都没有。',
      '地铁到站了，车门打开，里面挤满了面无表情的乘客。他们都在看着你。',
      '你在隧道墙壁上发现了一扇门。门后是另一个站台...和另一个你。',
      '广播响起："请注意，本站已停止运营...三十年前。"'
    ]
  },
  prison: {
    name: '监狱', icons: ['🔒','⛓️','🚔','📋','🔑'],
    roomTypes: ['牢房','走廊','审讯室','监控室','食堂','放风场','典狱长室','地下通道'],
    atmosphere: ['铁锈味','汗臭味','消毒水味','潮湿霉味'],
    entities: ['囚犯的影子','巡逻的狱警','墙壁中的脸','铁链拖地声'],
    objects: ['手铐','钥匙','档案','监控录像','囚服','刻痕'],
    horrors: [
      '所有牢房的门同时打开了，但里面空无一人。只有墙上的抓痕证明曾经有人在这里。',
      '审讯室的灯突然亮起，椅子上坐着一个人——是你自己。',
      '监控画面显示走廊里有一个人在奔跑...画面的时间戳是二十年前。',
      '你听到铁链拖地的声音越来越近，但走廊里什么都看不到。',
      '食堂的餐盘上刻着倒计时数字，每次你看都会少一个。'
    ]
  },
  hotel: {
    name: '酒店', icons: ['🏨','🛎️','🔑','🛗','🚪'],
    roomTypes: ['大堂','客房','走廊','电梯','餐厅','泳池','地下停车场','顶楼套房'],
    atmosphere: ['空调味','地毯霉味','香水味','氯气味'],
    entities: ['前台的微笑者','走廊尽头的女人','电梯中的影子','泳池底的身影'],
    objects: ['房卡','登记簿','行李','电话','房间号牌','客人评价'],
    horrors: [
      '电梯门打开，里面站满了人。但当你走进去时，发现只有你一个人。镜子里却映出了满满的人影。',
      '你的房间号是404。但酒店只有三层。',
      '泳池的水面下有一个人在向你招手。你凑近看...水面映出的是天花板。',
      '走廊的房间号开始变化：201...202...203...203...203...所有门牌都变成了203。',
      '前台的电话响了。你接起来，听到的是你自己的声音："不要住在这里。"'
    ]
  },
  museum: {
    name: '博物馆', icons: ['🏛️','🖼️','🗿','💎','📜'],
    roomTypes: ['大厅','展厅','储藏室','修复室','馆长室','地下展厅','走廊','天台'],
    atmosphere: ['灰尘味','防腐剂味','旧纸味','石头味'],
    entities: ['活动的雕像','画中走出的人','展柜中的眼睛','巡夜人'],
    objects: ['展品标签','古董','画作','雕塑','文物','馆藏目录'],
    horrors: [
      '你经过一尊雕像时，它的头缓缓转向了你。',
      '一幅风景画中的天空开始下雨，雨水从画框中滴落到地板上。',
      '展柜中的木乃伊睁开了眼睛。',
      '你在古代文物上看到了自己的名字。',
      '所有展厅的灯同时熄灭，只有出口标志还亮着——但它指向的方向是墙壁。'
    ]
  },
  forest: {
    name: '森林', icons: ['🌲','🍂','🌙','🦉','🕸️'],
    roomTypes: ['林间小路','空地','废弃小屋','湖边','洞穴','古树下','迷雾区','祭坛'],
    atmosphere: ['泥土味','腐叶味','潮湿苔藓味','花粉味'],
    entities: ['树间的人影','湖中的倒影','雾中的鹿','没有影子的孩子'],
    objects: ['蘑菇','树枝','石头','羽毛','苔藓','脚印'],
    horrors: [
      '你发现自己一直在走同一条路。树上的刻痕证明你已经经过这里七次了。',
      '湖面平静如镜，但你的倒影在做着完全不同的动作。',
      '雾中传来孩子的笑声。你追过去，发现一棵树上挂满了布娃娃。',
      '你脚下的落叶突然开始向一个方向移动，像是有什么东西在地下爬行。',
      '古树的树洞中传来呼吸声。你凑近看...里面有一只眼睛。'
    ]
  },
  apartment: {
    name: '公寓', icons: ['🏢','🚪','📫','🛗','💡'],
    roomTypes: ['大厅','电梯','走廊','住户房间','天台','地下室','垃圾房','管理室'],
    atmosphere: ['烟味','做饭味','潮湿味','消毒水味'],
    entities: ['窥视的邻居','电梯中的老人','走廊尽头的孩子','墙壁后的敲击者'],
    objects: ['信件','钥匙','快递','门牌','监控','电表'],
    horrors: [
      '你按下电梯按钮，显示屏上出现了一个不存在的楼层：B13。',
      '每扇门的猫眼后面都有一只眼睛在看着你。',
      '你收到一封信，里面是你明天才会拍的照片。',
      '走廊的灯一盏接一盏地熄灭，从远处向你这边蔓延。',
      '隔壁传来和你完全一样的对话声...但你住在顶楼，隔壁没有人。'
    ]
  },
  laboratory: {
    name: '实验室', icons: ['🔬','🧪','⚗️','🧬','💻'],
    roomTypes: ['接待处','实验区','冷藏室','服务器室','观察室','隔离区','废物处理','主控室'],
    atmosphere: ['化学药品味','臭氧味','消毒水味','焦糊味'],
    entities: ['实验体','AI全息影像','防护服中的空壳','培养皿中的眼睛'],
    objects: ['实验报告','试管','显微镜','硬盘','防护服','样本'],
    horrors: [
      '冷藏室的温度显示-273°C——绝对零度。但门把手是烫的。',
      '显微镜下的样本开始移动，组成了一个微笑的脸。',
      '服务器室的屏幕上反复显示同一句话："实验对象已逃脱。"',
      '你在实验报告中发现了自己的名字。你是第99号实验体。',
      '隔离区的玻璃墙后面有什么东西在呼吸，玻璃上凝结着水雾。'
    ]
  },
  ship: {
    name: '船舶', icons: ['🚢','⚓','🌊','🧭','🪝'],
    roomTypes: ['甲板','船舱','机房','船长室','货舱','厨房','瞭望台','救生艇'],
    atmosphere: ['海腥味','柴油味','铁锈味','腐烂鱼味'],
    entities: ['溺水的船员','雾中的幽灵船','海底的呼唤者','船舱中的影子'],
    objects: ['航海日志','罗盘','救生衣','信号弹','船锚','望远镜'],
    horrors: [
      '你在甲板上看到远处有一艘船。用望远镜看...那是同一艘船。你在看自己。',
      '船舱的墙壁开始渗出海水，水中有手在伸出来。',
      '广播响起船长的声音："所有人弃船。"但船长室里没有人。',
      '你在货舱发现了一个集装箱，里面装满了和你一模一样的人偶。',
      '救生艇上坐着一排人，他们都面朝大海。你叫他们，没有人回头。'
    ]
  },
  mine: {
    name: '矿井', icons: ['⛏️','🪨','💎','🕳️','🔦'],
    roomTypes: ['矿口','主巷道','支巷','矿车站','塌方区','地下湖','矿工宿舍','深层矿洞'],
    atmosphere: ['煤灰味','硫磺味','潮湿泥土味','金属味'],
    entities: ['矿灯中的影子','墙壁中的脸','矿车上的乘客','深处的敲击者'],
    objects: ['矿灯','镐','矿石','安全帽','炸药','矿工日记'],
    horrors: [
      '你的矿灯照到墙壁上，岩石的纹理组成了一张巨大的脸。',
      '矿车自己沿着轨道滑动，车上坐着一排没有头的矿工。',
      '你听到深处传来有节奏的敲击声...那是求救信号。但这座矿井已经废弃五十年了。',
      '地下湖的水面下有什么东西在发光。你凑近看——那是无数双眼睛。',
      '塌方区的碎石开始自己移动，像是有什么东西要从下面爬出来。'
    ]
  },
  asylum: {
    name: '疯人院', icons: ['🧠','💊','🔒','📋','🪞'],
    roomTypes: ['接待大厅','隔离病房','治疗室','活动室','院长办公室','地下层','监控室','逃生通道'],
    atmosphere: ['消毒水味','尿骚味','药物味','腐烂味'],
    entities: ['自言自语的患者','穿白衣的护工','墙角的蜷缩者','走廊中的游荡者'],
    objects: ['约束衣','病历','药片','电击器','涂鸦','断裂的手环'],
    horrors: [
      '隔离病房的墙上写满了同一句话："我没有疯 我没有疯 我没有疯"。最后一行写着："也许我疯了"。',
      '治疗室的电击器自己启动了，发出蓝色的电弧。',
      '你在病历上看到了自己的名字、照片和入院日期——就是今天。',
      '活动室的电视在播放雪花屏，但你能在雪花中看到一张脸。',
      '所有患者同时停止了动作，转头看向你，然后同时露出了微笑。'
    ]
  }
};

var ADJ_POOL = ['阴森','诡异','压抑','荒凉','腐朽','扭曲','寂静','冰冷','昏暗','窒息','恐怖','不安','古老','破败','黑暗','凄凉','诡谲','幽暗','死寂','萧瑟'];

var DISCOVERY_POOL = [
  '角落里有什么东西在微微发光。',
  '地上有一串不属于你的脚印。',
  '墙上有人用暗红色液体写了什么。',
  '空气中突然传来一阵低语声。',
  '你感到有什么东西在注视着你。',
  '一个物体从桌上滚落，发出清脆的声响。',
  '远处传来了不明来源的声音。',
  '这里的温度突然下降了好几度。',
  '你闻到了一股不该出现在这里的气味。',
  '天花板上有奇怪的痕迹。',
  '地板上有一摊不明液体，还是温的。',
  '你的影子似乎比你慢了一拍。'
];

var CLUE_TEMPLATES = [
  { name: '残破的日记', icon: '📔', descTemplate: '一本残破的日记，记录着{content}...' },
  { name: '神秘信件', icon: '✉️', descTemplate: '一封没有署名的信："{content}"' },
  { name: '褪色照片', icon: '📷', descTemplate: '一张褪色的照片，上面是{content}。' },
  { name: '录音磁带', icon: '📼', descTemplate: '播放后听到："{content}"' },
  { name: '涂鸦文字', icon: '✍️', descTemplate: '墙上潦草地写着："{content}"' },
  { name: '古老文件', icon: '📜', descTemplate: '一份古老的文件，内容是关于{content}的。' },
  { name: '密码纸条', icon: '🔢', descTemplate: '纸条上写着一串数字和符号：{content}' },
  { name: '钥匙线索', icon: '🔑', descTemplate: '一条关于{content}的重要线索。' }
];

var CLUE_CONTENTS = [
  '这里曾经发生过一场无法解释的事故',
  '所有人都在同一天消失了',
  '第13号房间里藏着真相',
  '不要相信你看到的一切',
  '出口就在最不可能的地方',
  '时间在这里是扭曲的',
  '有人一直在观察着一切',
  '钥匙就藏在最显眼的地方',
  '真相比你想象的更加可怕',
  '这一切都是一个循环',
  '镜子里的世界才是真实的',
  '声音会指引你找到出路',
  '数字是解开谜题的关键',
  '最后的幸存者留下了记录',
  '这个地方有自己的意志',
  '不要在午夜回头看',
  '第七扇门后面是出口',
  '它一直在你身后',
  '名字是打开封印的钥匙',
  '血月之下一切都会改变'
];

var INTRO_TEMPLATES = [
  '你在{place}中醒来，四周一片{adj}。{atmosphere}弥漫在空气中，让你感到一阵恶心。你必须找到离开这里的方法...',
  '当你踏入{place}的瞬间，身后的入口消失了。{atmosphere}扑面而来，{adj}的氛围让你不寒而栗。唯一的出路...在前方。',
  '你不记得自己是怎么来到{place}的。这里{adj}得令人窒息，{atmosphere}无处不在。直觉告诉你，必须尽快逃离...',
  '一阵眩晕过后，你发现自己身处{place}。{adj}的环境让你的理智开始动摇。{atmosphere}像是在提醒你——这里不欢迎活人。'
];

// 种子随机数
function seededRandom(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickRandom(arr, seed) {
  if (seed === undefined) return arr[Math.floor(Math.random() * arr.length)];
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function pickMultiple(arr, count, seed) {
  var shuffled = arr.slice();
  var baseSeed = seed || Math.random() * 10000;
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(seededRandom(baseSeed + i) * (i + 1));
    var temp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = temp;
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function randomInt(min, max, seed) {
  if (seed === undefined) return Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
}

// 副本生成器
function generateDungeon(dungeonId, config) {
  var seed = config.seed || 0;
  for (var i = 0; i < dungeonId.length; i++) seed += dungeonId.charCodeAt(i) * (i + 1) * 137;
  var theme = DUNGEON_THEMES[config.theme];
  var diff = DIFFICULTY_CONFIG[config.difficulty];
  var roomCount = randomInt(diff.roomCount[0], diff.roomCount[1], seed + 1);
  var clueCount = Math.min(roomCount - 1, randomInt(3, 6, seed + 2));
  var baseReward = randomInt(diff.baseReward[0], diff.baseReward[1], seed + 3);

  // ============ 1. 选择房间类型 ============
  var selectedRooms = pickMultiple(theme.roomTypes, roomCount, seed + 10);
  var roomIds = [];
  var rooms = {};
  var clues = {};
  var mapLayout = {};
  var mapPaths = [];

  // ============ 2. 构建网格布局 ============
  var gridCols, gridRows;
  if (roomCount <= 4) { gridCols = 2; gridRows = 2; }
  else if (roomCount <= 6) { gridCols = 3; gridRows = 2; }
  else if (roomCount <= 9) { gridCols = 3; gridRows = 3; }
  else { gridCols = 4; gridRows = Math.ceil(roomCount / 4); }

  // 蛇形排列：确保相邻房间在网格中也相邻
  var grid = [];
  for (var r = 0; r < gridRows; r++) {
    grid[r] = [];
    for (var c = 0; c < gridCols; c++) { grid[r][c] = -1; }
  }
  var roomIdx = 0;
  for (var row = 0; row < gridRows; row++) {
    if (row % 2 === 0) {
      for (var col = 0; col < gridCols && roomIdx < roomCount; col++) { grid[row][col] = roomIdx; roomIdx++; }
    } else {
      for (var col = gridCols - 1; col >= 0 && roomIdx < roomCount; col--) { grid[row][col] = roomIdx; roomIdx++; }
    }
  }

  // 位置映射
  var roomGridPos = {}; // ri -> {row, col}
  var gridToRi = {};    // "row_col" -> ri
  for (var row = 0; row < gridRows; row++) {
    for (var col = 0; col < gridCols; col++) {
      var ri = grid[row][col];
      if (ri >= 0 && ri < roomCount) {
        roomGridPos[ri] = { row: row, col: col };
        gridToRi[row + '_' + col] = ri;
      }
    }
  }

  // ============ 3. 生成房间 ============
  for (var ri = 0; ri < selectedRooms.length; ri++) {
    var rid = 'room_' + ri;
    roomIds.push(rid);
    var roomName = selectedRooms[ri];
    var isFirst = (ri === 0);
    var isLast = (ri === selectedRooms.length - 1);
    var adj = pickRandom(ADJ_POOL, seed + ri * 7 + 100);
    var atm = pickRandom(theme.atmosphere, seed + ri * 7 + 200);
    var disc = pickRandom(DISCOVERY_POOL, seed + ri * 7 + 300);
    var horror = pickRandom(theme.horrors, seed + ri * 7 + 400);
    var entity = pickRandom(theme.entities, seed + ri * 7 + 500);
    var obj1 = pickRandom(theme.objects, seed + ri * 7 + 600);
    var obj2 = pickRandom(theme.objects, seed + ri * 7 + 601);

    // 丰富描述
    var desc = roomName + '里' + adj + '异常。空气中弥漫着' + atm + '。你注意到' + obj1 + '和' + obj2 + '。';
    var firstText = '你走进' + roomName + '，' + disc;
    if (isFirst) {
      desc = '你站在' + config.placeName + '的入口处。' + atm + '扑面而来。周围散落着' + obj1 + '。';
      firstText = '你踏入' + config.placeName + '的瞬间，一股寒意从脚底升起。这里比你想象的更加' + adj + '...';
    }
    if (isLast) {
      desc = '这里似乎是' + config.placeName + '的核心区域。空气变得异常沉重。' + obj1 + '在昏暗中若隐若现。';
      firstText = '你来到了' + config.placeName + '的最深处。' + disc;
    }

    // ============ 4. 四方向连接 ============
    var connections = [];
    var dirMap = {};
    var pos = roomGridPos[ri];
    if (pos) {
      var neighbors = [
        { dir: 'north', dr: -1, dc: 0 },
        { dir: 'south', dr: 1, dc: 0 },
        { dir: 'west', dr: 0, dc: -1 },
        { dir: 'east', dr: 0, dc: 1 }
      ];
      neighbors.forEach(function(n) {
        var nr = pos.row + n.dr;
        var nc = pos.col + n.dc;
        var neighborKey = nr + '_' + nc;
        var neighborRi = gridToRi[neighborKey];
        if (neighborRi !== undefined) {
          var neighborRid = 'room_' + neighborRi;
          connections.push(neighborRid);
          dirMap[n.dir] = neighborRid;
        }
      });
    }

    // 地图布局坐标
    var cellW = Math.floor(160 / gridCols);
    var cellH = Math.floor(100 / gridRows);
    if (pos) {
      mapLayout[rid] = {
        x: 10 + pos.col * cellW + Math.floor(cellW / 2) - 14,
        y: 10 + pos.row * cellH + Math.floor(cellH / 2) - 9
      };
    }

    // ============ 5. 房间数据 ============
    var roomData = {
      name: roomName,
      icon: pickRandom(theme.icons, seed + ri * 3),
      mapLabel: roomName.charAt(0),
      description: desc,
      firstVisitText: firstText,
      connections: connections,
      directionMap: dirMap,
      locked: false,
      lookDescription: '你环顾' + roomName + '四周...' + adj + '的氛围让你不安。角落里有' + obj1 + '。',
      listenDescription: '你屏住呼吸仔细倾听...' + (isLast ? '深处传来令人不安的声响。' : '只有令人窒息的寂静。偶尔有' + atm + '的气味飘过。'),
      actions: {},
      keywords: {},
      specialActions: [],
      events: []
    };

    // ============ 6. 每个房间的特殊行动 ============
    var themeActions = {
      hospital: [
        { icon: '💊', label: '搜索药品', msg: '你在药品柜中翻找...' },
        { icon: '📋', label: '查看病历', msg: '你翻阅了散落的病历文件...' },
        { icon: '🔬', label: '检查设备', msg: '你检查了医疗设备...' }
      ],
      school: [
        { icon: '📝', label: '翻看课桌', msg: '你翻看了课桌抽屉里的东西...' },
        { icon: '📚', label: '查看书架', msg: '你在书架上寻找有用的信息...' },
        { icon: '🔔', label: '检查广播', msg: '你检查了广播设备...' }
      ],
      church: [
        { icon: '🕯️', label: '检查蜡烛', msg: '你检查了祭坛上的蜡烛...' },
        { icon: '📿', label: '调查祭坛', msg: '你仔细调查了祭坛...' },
        { icon: '📖', label: '翻阅经文', msg: '你翻阅了散落的经文...' }
      ],
      circus: [
        { icon: '🎭', label: '检查面具', msg: '你拿起一个面具仔细端详...' },
        { icon: '🪞', label: '照镜子', msg: '你走到镜子前...' },
        { icon: '🎪', label: '查看道具', msg: '你翻看了表演道具...' }
      ],
      lighthouse: [
        { icon: '🔭', label: '眺望远方', msg: '你透过窗户眺望远方...' },
        { icon: '📔', label: '查看日志', msg: '你翻阅了守塔人的日志...' },
        { icon: '🔦', label: '检查灯具', msg: '你检查了灯塔的照明设备...' }
      ],
      theater: [
        { icon: '🎭', label: '查看剧本', msg: '你翻阅了散落的剧本...' },
        { icon: '🪑', label: '检查座位', msg: '你检查了观众席的座位...' },
        { icon: '🎵', label: '检查乐池', msg: '你走到乐池旁查看...' }
      ],
      subway: [
        { icon: '🎫', label: '查看站牌', msg: '你查看了站台上的站牌...' },
        { icon: '📻', label: '检查广播', msg: '你检查了车站广播设备...' },
        { icon: '🚪', label: '检查车门', msg: '你检查了车厢的门...' }
      ],
      prison: [
        { icon: '🔑', label: '搜索钥匙', msg: '你在角落里搜索钥匙...' },
        { icon: '📝', label: '查看墙壁', msg: '你查看了墙壁上的刻字...' },
        { icon: '🔗', label: '检查锁链', msg: '你检查了生锈的锁链...' }
      ],
      hotel: [
        { icon: '🔑', label: '检查前台', msg: '你检查了前台的物品...' },
        { icon: '📞', label: '拿起电话', msg: '你拿起了房间里的电话...' },
        { icon: '🪞', label: '照镜子', msg: '你走到浴室的镜子前...' }
      ],
      museum: [
        { icon: '🖼️', label: '观察展品', msg: '你仔细观察了展品...' },
        { icon: '📋', label: '查看说明', msg: '你阅读了展品说明牌...' },
        { icon: '🔍', label: '检查玻璃柜', msg: '你检查了展示柜...' }
      ],
      forest: [
        { icon: '🌿', label: '采集草药', msg: '你在周围寻找有用的植物...' },
        { icon: '👣', label: '追踪足迹', msg: '你发现了地上的足迹...' },
        { icon: '🪵', label: '检查树木', msg: '你检查了附近的树木...' }
      ],
      apartment: [
        { icon: '📬', label: '查看信箱', msg: '你查看了门口的信箱...' },
        { icon: '🚪', label: '敲门', msg: '你敲了敲隔壁的门...' },
        { icon: '📺', label: '打开电视', msg: '你打开了房间里的电视...' }
      ],
      laboratory: [
        { icon: '🧪', label: '检查试管', msg: '你检查了实验台上的试管...' },
        { icon: '💻', label: '查看电脑', msg: '你打开了实验室的电脑...' },
        { icon: '📊', label: '阅读报告', msg: '你翻阅了实验报告...' }
      ],
      ship: [
        { icon: '🧭', label: '查看罗盘', msg: '你查看了船上的罗盘...' },
        { icon: '📔', label: '翻阅日志', msg: '你翻阅了航海日志...' },
        { icon: '🔭', label: '使用望远镜', msg: '你拿起望远镜向远处看...' }
      ],
      mine: [
        { icon: '🔦', label: '照亮深处', msg: '你用矿灯照向更深处...' },
        { icon: '⛏️', label: '敲击岩壁', msg: '你用工具敲击岩壁...' },
        { icon: '📔', label: '查看矿工日记', msg: '你翻阅了矿工留下的日记...' }
      ],
      asylum: [
        { icon: '📋', label: '查看病历', msg: '你查看了散落的病历...' },
        { icon: '💊', label: '检查药物', msg: '你检查了药物柜...' },
        { icon: '📺', label: '打开电视', msg: '你打开了活动室的电视...' }
      ]
    };

    // 为每个房间选1-2个特殊行动
    var actPool = themeActions[config.theme] || themeActions['hospital'];
    var actCount = isFirst ? 1 : (isLast ? 0 : randomInt(1, 2, seed + ri * 50));
    var selectedActs = pickMultiple(actPool, actCount, seed + ri * 51);
    selectedActs.forEach(function(act, ai) {
      roomData.specialActions.push({
        id: dungeonId + '_sa_' + ri + '_' + ai,
        icon: act.icon,
        label: act.label,
        message: act.msg,
        removeAfterUse: false
      });
    });

    // ============ 7. 关键词交互 ============
    // 每个房间2-3个关键词
    var kwObj1 = pickRandom(theme.objects, seed + ri * 60);
    var kwObj2 = pickRandom(theme.objects, seed + ri * 61);
    var kwEntity = pickRandom(theme.entities, seed + ri * 62);
    
    roomData.keywords[kwObj1] = {
      message: '你仔细检查了' + kwObj1 + '。' + pickRandom(DISCOVERY_POOL, seed + ri * 63),
      messageType: 'narrator'
    };
    roomData.keywords[kwObj2] = {
      message: '你查看了' + kwObj2 + '，上面似乎有些不寻常的痕迹。',
      messageType: 'narrator'
    };
    if (!isFirst && seededRandom(seed + ri * 64) > 0.5) {
      roomData.keywords['声音'] = {
        message: '你仔细聆听...远处传来了不明来源的声响。',
        horror: pickRandom(theme.horrors, seed + ri * 65),
        sanChange: -3
      };
    }

    // ============ 8. 恐怖事件 ============
    if (ri > 0 && seededRandom(seed + ri * 13) > 0.35) {
      roomData.events.push({
        id: dungeonId + '_evt_' + ri,
        trigger: 'firstVisit',
        delay: Math.floor(seededRandom(seed + ri * 17) * 4000) + 2000,
        horror: horror,
        sanChange: -Math.floor(seededRandom(seed + ri * 19) * 8) - 3,
        notification: '🧠 SAN 下降'
      });
    }

    // 给部分房间添加物品（通过关键词和特殊行动）
    if (seededRandom(seed + ri * 23) > 0.5 && !isFirst) {
      var itemObj = pickRandom(theme.objects, seed + ri * 29);
      var itemId = dungeonId + '_item_' + ri;
      var itemData = {
        id: itemId,
        name: itemObj,
        icon: pickRandom(theme.icons, seed + ri * 31),
        desc: '在' + roomName + '中找到的' + itemObj,
        usable: seededRandom(seed + ri * 32) > 0.5,
        canTakeOut: false,
        stackable: false
      };
      
      // 关键词获取
      roomData.keywords[itemObj] = {
        message: '你检查了' + itemObj + '，决定把它带上。',
        addItem: itemData
      };
      
      // 特殊行动获取
      roomData.specialActions.push({
        id: dungeonId + '_pickup_' + ri,
        icon: '🔍',
        label: '搜索' + roomName.substring(0, 2),
        message: '你仔细搜索后发现了「' + itemObj + '」。',
        addItem: itemData,
        removeAfterUse: true
      });
    }

    rooms[rid] = roomData;
  }

  // ============ 9. 添加分支路径（2-3条暗道） ============
  var branchCount = Math.min(3, Math.max(1, Math.floor(roomCount / 3)));
  for (var b = 0; b < branchCount; b++) {
    var attempts = 0;
    while (attempts < 30) {
      var r1 = randomInt(0, roomCount - 2, seed + b * 100 + attempts);
      var r2 = randomInt(r1 + 2, roomCount - 1, seed + b * 100 + attempts + 50);
      if (r2 >= roomCount) { attempts++; continue; }
      
      var r1Id = 'room_' + r1;
      var r2Id = 'room_' + r2;
      
      // 跳过已连接的
      if (rooms[r1Id].connections.indexOf(r2Id) !== -1) { attempts++; continue; }
      // 跳过最终房间
      if (r2 === roomCount - 1) { attempts++; continue; }
      
      // 添加双向连接
      rooms[r1Id].connections.push(r2Id);
      rooms[r2Id].connections.push(r1Id);
      
      // 找空闲方向
      var allDirs = ['north', 'south', 'east', 'west'];
      var freeDir1 = allDirs.find(function(d) { return !rooms[r1Id].directionMap[d]; });
      var freeDir2 = allDirs.find(function(d) { return !rooms[r2Id].directionMap[d]; });
      if (freeDir1) rooms[r1Id].directionMap[freeDir1] = r2Id;
      if (freeDir2) rooms[r2Id].directionMap[freeDir2] = r1Id;
      
      // 暗道关键词
      rooms[r1Id].keywords['暗道'] = {
        message: '你发现了一条隐藏的通道，似乎通向' + rooms[r2Id].name + '...',
        messageType: 'system'
      };
      rooms[r2Id].keywords['暗道'] = {
        message: '你发现了一条隐藏的通道，似乎通向' + rooms[r1Id].name + '...',
        messageType: 'system'
      };
      break;
    }
  }

  // ============ 10. 锁定最终房间 ============
  if (roomCount >= 4) {
    var lastRid = 'room_' + (roomCount - 1);
    rooms[lastRid].locked = true;
    rooms[lastRid].lockHint = '需要收集足够的线索才能打开';
  }

  // ============ 11. 生成线索（多种获取方式） ============
  var clueRoomIndices = pickMultiple(
    Array.from({length: roomCount - 1}, function(_, i){ return i + 1; }),
    clueCount,
    seed + 60
  );

  for (var ci = 0; ci < clueCount; ci++) {
    var cid = dungeonId + '_c' + ci;
    var clueTpl = pickRandom(CLUE_TEMPLATES, seed + ci * 41);
    var clueContent = pickRandom(CLUE_CONTENTS, seed + ci * 43);
    var clueRoomIdx = clueRoomIndices[ci];
    var clueRoomId = 'room_' + clueRoomIdx;
    var clueRoomName = rooms[clueRoomId].name;
    var sanCost = Math.floor(seededRandom(seed + ci * 47) * 8) + 3;

    clues[cid] = {
      name: clueTpl.name,
      icon: clueTpl.icon,
      description: clueTpl.descTemplate.replace('{content}', clueContent),
      sanCost: sanCost,
      foundIn: clueRoomName
    };

    // 方式1：调查行动获取
    rooms[clueRoomId].actions['调查'] = {
      message: '你仔细调查了' + clueRoomName + '，发现了「' + clueTpl.name + '」...',
      addClue: cid,
      once: true
    };

    // 方式2：关键词触发
    var triggerWords = [clueTpl.name, '线索', '文件', '记录', '痕迹'];
    var triggerWord = triggerWords[ci % triggerWords.length];
    rooms[clueRoomId].keywords[triggerWord] = {
      message: '你发现了「' + clueTpl.name + '」：' + clueTpl.descTemplate.replace('{content}', clueContent),
      messageType: 'system',
      addClue: cid,
      sanChange: -sanCost
    };

    // 方式3：特殊行动按钮
    rooms[clueRoomId].specialActions.push({
      id: dungeonId + '_findclue_' + ci,
      icon: '🔍',
      label: '搜索' + clueRoomName.substring(0, 2),
      message: '你仔细搜索后发现了「' + clueTpl.name + '」。' + clueTpl.descTemplate.replace('{content}', clueContent),
      addClue: cid,
      removeAfterUse: true
    });
  }

  // ============ 12. 解锁最终房间（多个触发点） ============
  if (roomCount >= 4) {
    // 在倒数第2和第3个房间都添加解锁检查
    var checkRooms = [roomCount - 2];
    if (roomCount >= 5) checkRooms.push(roomCount - 3);
    
    checkRooms.forEach(function(checkIdx) {
      var checkRid = 'room_' + checkIdx;
      if (rooms[checkRid]) {
        rooms[checkRid].events.push({
          id: dungeonId + '_unlock_' + checkIdx,
          trigger: 'enter',
          condition: { clueCount: Math.max(2, clueCount - 1) },
          once: true,
          message: '你感到一阵震动...最深处的封印似乎松动了。',
          unlockRoom: 'room_' + (roomCount - 1),
          notification: '🔓 最终区域已解锁'
        });
      }
    });
  }

  // ============ 13. 最终房间行动 ============
  var finalRoomId = 'room_' + (roomCount - 1);
  rooms[finalRoomId].specialActions = [
    {
      id: 'escape_action',
      icon: '🚪',
      label: '逃离此地',
      message: '你找到了出口，光芒将你吞没...',
      triggerEnding: 'escape_good'
    },
    {
      id: 'final_investigate',
      icon: '🔍',
      label: '深入调查',
      message: '你决定在最后的区域进行更深入的调查...',
      removeAfterUse: false
    }
  ];

  // ============ 14. 生成地图路径 ============
  var drawnPaths = {};
  Object.keys(rooms).forEach(function(rid) {
    var room = rooms[rid];
    var pos1 = mapLayout[rid];
    if (!pos1) return;
    room.connections.forEach(function(connId) {
      var pos2 = mapLayout[connId];
      if (!pos2) return;
      // 避免重复
      var pathKey = rid < connId ? rid + '_' + connId : connId + '_' + rid;
      if (drawnPaths[pathKey]) return;
      drawnPaths[pathKey] = true;

      var x1 = pos1.x + 14;
      var y1 = pos1.y + 9;
      var x2 = pos2.x + 14;
      var y2 = pos2.y + 9;

      if (Math.abs(y1 - y2) < 5) {
        // 水平
        mapPaths.push({ x: Math.min(x1, x2), y: y1 - 1, w: Math.abs(x2 - x1), h: 2, dir: 'h' });
      } else if (Math.abs(x1 - x2) < 5) {
        // 垂直
        mapPaths.push({ x: x1 - 1, y: Math.min(y1, y2), w: 2, h: Math.abs(y2 - y1), dir: 'v' });
      } else {
        // L形（分支暗道）
        mapPaths.push({ x: Math.min(x1, x2), y: y1 - 1, w: Math.abs(x2 - x1), h: 2, dir: 'h' });
        mapPaths.push({ x: x2 - 1, y: Math.min(y1, y2), w: 2, h: Math.abs(y2 - y1), dir: 'v' });
      }
    });
  });

  // ============ 15. 生成AI叙述指引 ============
  var aiHintsText = '这是一个' + theme.name + '主题的副本「' + config.placeName + '」。';
  aiHintsText += '难度：' + diff.name + '。共' + roomCount + '个房间，' + clueCount + '条线索。';
  aiHintsText += '氛围关键词：' + theme.atmosphere.join('、') + '。';
    aiHintsText += '可能出现的异常存在：' + theme.entities.slice(0, 3).join('、') + '。';
  aiHintsText += '常见物品：' + theme.objects.slice(0, 4).join('、') + '。';
  aiHintsText += '玩家需要探索各个房间，收集线索，最终从最后的房间逃脱。';
  aiHintsText += '请营造紧张恐怖的氛围，描述环境细节，暗示危险的存在。';

  // 生成开场文本
  var introTpl = pickRandom(INTRO_TEMPLATES, seed + 70);
  var introText = introTpl
    .replace('{place}', config.placeName)
    .replace('{adj}', pickRandom(ADJ_POOL, seed + 71))
    .replace('{atmosphere}', pickRandom(theme.atmosphere, seed + 72));

  // ============ 16. 组装副本配置 ============
  return {
    id: dungeonId,
    name: config.placeName,
    timeLimit: diff.timeLimit,
    startRoom: 'room_0',
    intro: introText,
    aiHints: aiHintsText,
    clues: clues,
    rooms: rooms,
    mapLayout: mapLayout,
    mapPaths: mapPaths,
    itemEffects: {},
    endings: [
      {
        id: 'escape_good',
        title: '🌅 逃出生天',
        text: '你成功逃离了「' + config.placeName + '」。当光芒消散时，你发现自己回到了苍白回廊。身后的副本入口正在缓缓关闭...',
        rating: null,
        fragmentReward: baseReward,
        requirements: { room: finalRoomId },
        bonusItems: seededRandom(seed + 80) > 0.7 ? [
          { id: dungeonId + '_trophy', name: config.placeName + '纪念品', icon: pickRandom(theme.icons, seed + 81), desc: '来自「' + config.placeName + '」的纪念品' }
        ] : []
      },
      {
        id: 'escape_partial',
        title: '🌫️ 仓皇逃离',
        text: '你没能完全探索「' + config.placeName + '」，但勉强找到了出路...',
        rating: 'C',
        fragmentReward: Math.floor(baseReward * 0.4),
        requirements: { minClueCount: 1 }
      }
    ]
  };
}

// 99个副本定义

var GENERATED_DUNGEON_DEFS = [
  // 手工副本保留前3个ID: hospital, mansion, train
  // 以下为生成副本 编号 4-99
  { id: 'gen_04', name: '🏫 沉默学园', theme: 'school', difficulty: 1, placeName: '沉默学园' },
  { id: 'gen_05', name: '⛪ 哀鸣教堂', theme: 'church', difficulty: 2, placeName: '哀鸣教堂' },
  { id: 'gen_06', name: '🎪 午夜马戏团', theme: 'circus', difficulty: 2, placeName: '午夜马戏团' },
  { id: 'gen_07', name: '🌊 深渊灯塔', theme: 'lighthouse', difficulty: 3, placeName: '深渊灯塔' },
  { id: 'gen_08', name: '🎭 永恒剧场', theme: 'theater', difficulty: 3, placeName: '永恒剧场' },
  { id: 'gen_09', name: '🚇 末日地铁', theme: 'subway', difficulty: 2, placeName: '末日地铁' },
  { id: 'gen_10', name: '🔒 铁窗泪', theme: 'prison', difficulty: 3, placeName: '铁窗泪' },
  { id: 'gen_11', name: '🏨 404酒店', theme: 'hotel', difficulty: 2, placeName: '404酒店' },
  { id: 'gen_12', name: '🏛️ 夜行博物馆', theme: 'museum', difficulty: 2, placeName: '夜行博物馆' },
  { id: 'gen_13', name: '🌲 迷失森林', theme: 'forest', difficulty: 1, placeName: '迷失森林' },
  { id: 'gen_14', name: '🏢 回声公寓', theme: 'apartment', difficulty: 2, placeName: '回声公寓' },
  { id: 'gen_15', name: '🔬 深层实验室', theme: 'laboratory', difficulty: 4, placeName: '深层实验室' },
  { id: 'gen_16', name: '🚢 幽灵船', theme: 'ship', difficulty: 3, placeName: '幽灵船' },
  { id: 'gen_17', name: '⛏️ 矿井深处', theme: 'mine', difficulty: 3, placeName: '矿井深处' },
  { id: 'gen_18', name: '🧠 疯人院', theme: 'asylum', difficulty: 4, placeName: '疯人院' },
  { id: 'gen_19', name: '🏥 血色诊所', theme: 'hospital', difficulty: 2, placeName: '血色诊所' },
  { id: 'gen_20', name: '🏫 毕业典礼', theme: 'school', difficulty: 3, placeName: '毕业典礼' },
  { id: 'gen_21', name: '⛪ 沉默修道院', theme: 'church', difficulty: 3, placeName: '沉默修道院' },
  { id: 'gen_22', name: '🎪 小丑的微笑', theme: 'circus', difficulty: 4, placeName: '小丑的微笑' },
  { id: 'gen_23', name: '🌊 雾中灯塔', theme: 'lighthouse', difficulty: 2, placeName: '雾中灯塔' },
  { id: 'gen_24', name: '🎭 最后一幕', theme: 'theater', difficulty: 4, placeName: '最后一幕' },
  { id: 'gen_25', name: '🚇 环线列车', theme: 'subway', difficulty: 3, placeName: '环线列车' },
  { id: 'gen_26', name: '🔒 死囚之夜', theme: 'prison', difficulty: 4, placeName: '死囚之夜' },
  { id: 'gen_27', name: '🏨 镜像酒店', theme: 'hotel', difficulty: 3, placeName: '镜像酒店' },
  { id: 'gen_28', name: '🏛️ 活化石展', theme: 'museum', difficulty: 3, placeName: '活化石展' },
  { id: 'gen_29', name: '🌲 血月森林', theme: 'forest', difficulty: 3, placeName: '血月森林' },
  { id: 'gen_30', name: '🏢 第13层', theme: 'apartment', difficulty: 3, placeName: '第13层' },
  { id: 'gen_31', name: '🔬 基因崩坏', theme: 'laboratory', difficulty: 5, placeName: '基因崩坏' },
  { id: 'gen_32', name: '🚢 深海巨轮', theme: 'ship', difficulty: 4, placeName: '深海巨轮' },
  { id: 'gen_33', name: '⛏️ 地心矿脉', theme: 'mine', difficulty: 4, placeName: '地心矿脉' },
  { id: 'gen_34', name: '🧠 白色房间', theme: 'asylum', difficulty: 5, placeName: '白色房间' },
  { id: 'gen_35', name: '🏥 停尸间', theme: 'hospital', difficulty: 3, placeName: '停尸间' },
  { id: 'gen_36', name: '🏫 放学后', theme: 'school', difficulty: 1, placeName: '放学后' },
  { id: 'gen_37', name: '⛪ 地下墓穴', theme: 'church', difficulty: 4, placeName: '地下墓穴' },
  { id: 'gen_38', name: '🎪 畸形秀', theme: 'circus', difficulty: 3, placeName: '畸形秀' },
  { id: 'gen_39', name: '🌊 海底神殿', theme: 'lighthouse', difficulty: 5, placeName: '海底神殿' },
  { id: 'gen_40', name: '🎭 木偶剧', theme: 'theater', difficulty: 2, placeName: '木偶剧' },
  { id: 'gen_41', name: '🚇 废弃站台', theme: 'subway', difficulty: 1, placeName: '废弃站台' },
  { id: 'gen_42', name: '🔒 越狱之夜', theme: 'prison', difficulty: 2, placeName: '越狱之夜' },
  { id: 'gen_43', name: '🏨 永夜套房', theme: 'hotel', difficulty: 4, placeName: '永夜套房' },
  { id: 'gen_44', name: '🏛️ 禁忌展厅', theme: 'museum', difficulty: 4, placeName: '禁忌展厅' },
  { id: 'gen_45', name: '🌲 树海迷途', theme: 'forest', difficulty: 2, placeName: '树海迷途' },
  { id: 'gen_46', name: '🏢 邻居的秘密', theme: 'apartment', difficulty: 1, placeName: '邻居的秘密' },
  { id: 'gen_47', name: '🔬 零号病毒', theme: 'laboratory', difficulty: 3, placeName: '零号病毒' },
  { id: 'gen_48', name: '🚢 玛丽赛勒号', theme: 'ship', difficulty: 2, placeName: '玛丽赛勒号' },
  { id: 'gen_49', name: '⛏️ 黄金矿洞', theme: 'mine', difficulty: 1, placeName: '黄金矿洞' },
  { id: 'gen_50', name: '🧠 镜像疗法', theme: 'asylum', difficulty: 3, placeName: '镜像疗法' },
  { id: 'gen_51', name: '🏥 夜班护士', theme: 'hospital', difficulty: 1, placeName: '夜班护士' },
  { id: 'gen_52', name: '🏫 七不思议', theme: 'school', difficulty: 2, placeName: '七不思议' },
  { id: 'gen_53', name: '⛪ 异端审判', theme: 'church', difficulty: 5, placeName: '异端审判' },
  { id: 'gen_54', name: '🎪 最后的演出', theme: 'circus', difficulty: 5, placeName: '最后的演出' },
  { id: 'gen_55', name: '🌊 深渊之眼', theme: 'lighthouse', difficulty: 4, placeName: '深渊之眼' },
  { id: 'gen_56', name: '🎭 歌剧魅影', theme: 'theater', difficulty: 3, placeName: '歌剧魅影' },
  { id: 'gen_57', name: '🚇 时间隧道', theme: 'subway', difficulty: 4, placeName: '时间隧道' },
  { id: 'gen_58', name: '🔒 无期徒刑', theme: 'prison', difficulty: 5, placeName: '无期徒刑' },
  { id: 'gen_59', name: '🏨 蜜月陷阱', theme: 'hotel', difficulty: 1, placeName: '蜜月陷阱' },
  { id: 'gen_60', name: '🏛️ 诅咒文物', theme: 'museum', difficulty: 5, placeName: '诅咒文物' },
  { id: 'gen_61', name: '🌲 猎人小屋', theme: 'forest', difficulty: 4, placeName: '猎人小屋' },
  { id: 'gen_62', name: '🏢 电梯游戏', theme: 'apartment', difficulty: 4, placeName: '电梯游戏' },
  { id: 'gen_63', name: '🔬 克隆体', theme: 'laboratory', difficulty: 4, placeName: '克隆体' },
  { id: 'gen_64', name: '🚢 泰坦尼克', theme: 'ship', difficulty: 5, placeName: '泰坦尼克' },
  { id: 'gen_65', name: '⛏️ 矿工之歌', theme: 'mine', difficulty: 2, placeName: '矿工之歌' },
  { id: 'gen_66', name: '🧠 电击疗法', theme: 'asylum', difficulty: 2, placeName: '电击疗法' },
  { id: 'gen_67', name: '🏥 产房', theme: 'hospital', difficulty: 4, placeName: '产房' },
  { id: 'gen_68', name: '🏫 补习班', theme: 'school', difficulty: 4, placeName: '补习班' },
  { id: 'gen_69', name: '⛪ 末日弥撒', theme: 'church', difficulty: 3, placeName: '末日弥撒' },
  { id: 'gen_70', name: '🎪 魔术箱', theme: 'circus', difficulty: 1, placeName: '魔术箱' },
  { id: 'gen_71', name: '🌊 潮汐洞穴', theme: 'lighthouse', difficulty: 1, placeName: '潮汐洞穴' },
  { id: 'gen_72', name: '🎭 谢幕之舞', theme: 'theater', difficulty: 5, placeName: '谢幕之舞' },
  { id: 'gen_73', name: '🚇 零点列车', theme: 'subway', difficulty: 5, placeName: '零点列车' },
  { id: 'gen_74', name: '🔒 独囚室', theme: 'prison', difficulty: 1, placeName: '独囚室' },
  { id: 'gen_75', name: '🏨 退房时间', theme: 'hotel', difficulty: 5, placeName: '退房时间' },
  { id: 'gen_76', name: '🏛️ 蜡像馆', theme: 'museum', difficulty: 1, placeName: '蜡像馆' },
  { id: 'gen_77', name: '🌲 女巫森林', theme: 'forest', difficulty: 5, placeName: '女巫森林' },
  { id: 'gen_78', name: '🏢 顶楼住户', theme: 'apartment', difficulty: 5, placeName: '顶楼住户' },
  { id: 'gen_79', name: '🔬 时间实验', theme: 'laboratory', difficulty: 2, placeName: '时间实验' },
  { id: 'gen_80', name: '🚢 捕鲸船', theme: 'ship', difficulty: 1, placeName: '捕鲸船' },
  { id: 'gen_81', name: '⛏️ 塌方', theme: 'mine', difficulty: 5, placeName: '塌方' },
  { id: 'gen_82', name: '🧠 梦境病房', theme: 'asylum', difficulty: 1, placeName: '梦境病房' },
  { id: 'gen_83', name: '🏥 急诊室', theme: 'hospital', difficulty: 5, placeName: '急诊室' },
  { id: 'gen_84', name: '🏫 校庆之夜', theme: 'school', difficulty: 5, placeName: '校庆之夜' },
  { id: 'gen_85', name: '⛪ 钟声回响', theme: 'church', difficulty: 1, placeName: '钟声回响' },
  { id: 'gen_86', name: '🎪 空中飞人', theme: 'circus', difficulty: 3, placeName: '空中飞人' },
  { id: 'gen_87', name: '🌊 灯塔守望者', theme: 'lighthouse', difficulty: 3, placeName: '灯塔守望者' },
  { id: 'gen_88', name: '🎭 双面人', theme: 'theater', difficulty: 1, placeName: '双面人' },
  { id: 'gen_89', name: '🚇 末班地铁', theme: 'subway', difficulty: 1, placeName: '末班地铁' },
  { id: 'gen_90', name: '🔒 典狱长的日记', theme: 'prison', difficulty: 4, placeName: '典狱长的日记' },
  { id: 'gen_91', name: '🏨 无人旅馆', theme: 'hotel', difficulty: 3, placeName: '无人旅馆' },
  { id: 'gen_92', name: '🏛️ 午夜画展', theme: 'museum', difficulty: 2, placeName: '午夜画展' },
  { id: 'gen_93', name: '🌲 雾中营地', theme: 'forest', difficulty: 3, placeName: '雾中营地' },
  { id: 'gen_94', name: '🏢 搬家之夜', theme: 'apartment', difficulty: 2, placeName: '搬家之夜' },
  { id: 'gen_95', name: '🔬 意识上传', theme: 'laboratory', difficulty: 5, placeName: '意识上传' },
  { id: 'gen_96', name: '🚢 漂流瓶', theme: 'ship', difficulty: 3, placeName: '漂流瓶' },
  { id: 'gen_97', name: '⛏️ 地底回声', theme: 'mine', difficulty: 3, placeName: '地底回声' },
  { id: 'gen_98', name: '🧠 最终诊断', theme: 'asylum', difficulty: 5, placeName: '最终诊断' },
  { id: 'gen_99', name: '💀 苍白回廊·深层', theme: 'asylum', difficulty: 5, placeName: '苍白回廊·深层' }
];

// 注册所有生成副本到工厂
GENERATED_DUNGEON_DEFS.forEach(function(def) {
  DUNGEON_FACTORIES[def.id] = function() {
    return generateDungeon(def.id, {
      theme: def.theme,
      difficulty: def.difficulty,
      placeName: def.placeName,
      seed: def.id.charCodeAt(4) * 1000 + def.id.charCodeAt(5) * 100
    });
  };
});
