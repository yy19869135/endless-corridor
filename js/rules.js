//   第十部分：规则怪谈系统 + 副本开场剧情

// ============ 规则数据库 ============
// 每个副本主题对应一组规则怪谈
var DUNGEON_RULES = {};

// 手工副本规则
DUNGEON_RULES['hospital'] = {
  title: '🏥 寂静岭医院 — 生存守则',
  subtitle: '「以下规则由上一位幸存者留下，请务必遵守。」',
  rules: [
    { id: 'h1', text: '不要回应走廊里的呼唤声。那不是在叫你。', type: 'must', penalty: 'san', amount: -15 },
    { id: 'h2', text: '如果你在手术室看到有人躺在手术台上，不要靠近。那个人是你。', type: 'must', penalty: 'san', amount: -20 },
    { id: 'h3', text: '三楼病房的灯如果是亮的，说明你还安全。如果灯灭了，立刻离开。', type: 'warning', penalty: 'hp', amount: -3 },
    { id: 'h4', text: '药品柜里的红色药瓶可以喝。蓝色的不行。', type: 'must', penalty: 'death', amount: 0 },
    { id: 'h5', text: '如果广播开始播放儿歌，你有30秒时间找到最近的房间躲进去。', type: 'timed', penalty: 'hp', amount: -5 },
    { id: 'h6', text: '地下室的门只能从外面打开。如果你在地下室听到门锁的声音，不要慌——找到另一个出口。', type: 'hint' }
  ],
  openingScript: {
    scene: '你睁开眼，发现自己躺在冰冷的瓷砖地板上。空气中弥漫着消毒水和某种更深层的腐败气息。头顶的日光灯疯狂闪烁，发出刺耳的电流声。\n\n你的手机震动了一下——系统手机的屏幕上显示着一条消息：\n\n「欢迎来到副本：寂静岭医院。存活条件：找到出口。时限：10分钟。」\n\n你挣扎着站起来，发现自己在一间候诊大厅里。前方的接待台上散落着泛黄的病历。走廊深处传来——不，那不是脚步声。那是什么东西在地上拖行的声音。',
    forcedEvent: {
      type: 'choice',
      delay: 3000,
      text: '拖行声越来越近。你必须做出选择——',
      choices: [
        { text: '躲到接待台后面', result: 'safe', message: '你蹲在接待台后面，屏住呼吸。一个苍白的身影从走廊尽头缓缓经过，拖着一条不属于人类的肢体。它没有发现你。', sanChange: -5, hpChange: 0 },
        { text: '沿着走廊往反方向跑', result: 'safe', message: '你转身狂奔。身后的拖行声突然加速——但你跑得更快。你冲进一间诊室，反锁了门。门外的声音在门前停了一会儿，然后慢慢远去了。', sanChange: -3, hpChange: 0 },
        { text: '站在原地不动', result: 'danger', message: '你僵在原地。那个东西从走廊拐角处露出头——它没有脸，只有一张巨大的、向上裂开的嘴。它看到了你。', sanChange: -15, hpChange: -2 },
        { text: '大声喊"谁在那里"', result: 'danger', message: '你的声音在空荡的走廊里回荡。拖行声停了。然后——从四面八方传来了回应。不是一个。是很多个。它们都听到了你。', sanChange: -20, hpChange: -3 }
      ]
    }
  }
};

DUNGEON_RULES['mansion'] = {
  title: '🏚️ 红月庄园 — 访客须知',
  subtitle: '「此文件发现于庄园门厅的壁炉中，大部分已被烧毁。」',
  rules: [
    { id: 'm1', text: '不要直视画廊中任何一幅肖像画超过3秒。它们会记住你的脸。', type: 'must', penalty: 'san', amount: -10 },
    { id: 'm2', text: '如果你在镜子里看到了不是你的人，不要转身。慢慢后退离开。', type: 'must', penalty: 'hp', amount: -5 },
    { id: 'm3', text: '庄园的钟每小时敲一次。如果它敲了十三下，立刻找到最近的壁炉——那是唯一安全的地方。', type: 'timed', penalty: 'hp', amount: -4 },
    { id: 'm4', text: '地下室的酒窖里有一瓶1888年的红酒。不要打开它。那不是酒。', type: 'must', penalty: 'death', amount: 0 },
    { id: 'm5', text: '如果管家请你喝茶，接受。拒绝的后果比喝下去更糟。', type: 'warning', penalty: 'san', amount: -15 },
    { id: 'm6', text: '书房第三排书架的第七本书可以拉动。记住这一点。', type: 'hint' }
  ],
  openingScript: {
    scene: '马车在庄园门前停下。你从没坐过马车——但你确实是坐马车来的。\n\n庄园在红月的光芒下投下巨大的阴影。大门敞开着，门厅里烛光摇曳。一个穿黑色燕尾服的管家站在门口，微微鞠躬。\n\n「主人等您很久了。」他说。但你从未见过这座庄园的主人。\n\n你踏入门厅的瞬间，身后的大门自己关上了。锁舌咔嗒一声落下。',
    forcedEvent: {
      type: 'choice',
      delay: 3000,
      text: '管家端着一个银盘走来，上面放着一杯深红色的液体。「主人为您准备的欢迎饮品。」他的笑容完美得不像活人。',
      choices: [
        { text: '接过杯子，假装喝一口', result: 'safe', message: '你把杯子举到嘴边，液体散发着玫瑰和铁锈混合的气味。你没有真的喝下去，但管家似乎满意了。「请随我来。」他转身走向走廊。', sanChange: -3, hpChange: 0 },
        { text: '礼貌地拒绝', result: 'danger', message: '管家的笑容凝固了。「...这不是请求。」他的声音突然变得像金属摩擦。墙上的肖像画同时转向了你。你感到一阵强烈的眩晕。', sanChange: -12, hpChange: 0 },
        { text: '一饮而尽', result: 'risky', message: '液体冰冷，带着甜腻的铁锈味。你的视野模糊了一瞬——然后你看到了。走廊里站满了人。不，不是人。是画像里的人。他们都在看着你。然后你的视线恢复正常，走廊空无一人。', sanChange: -8, hpChange: 0, addClue: true },
        { text: '打翻杯子', result: 'danger', message: '杯子摔在地上，红色液体溅在白色大理石上。管家低头看着地上的污渍。「...可惜了。」他抬起头，你发现他的眼睛变成了纯黑色。「那就用另一种方式欢迎您。」', sanChange: -10, hpChange: -2 }
      ]
    }
  }
};

DUNGEON_RULES['train'] = {
  title: '🚂 末班列车 — 乘车须知',
  subtitle: '「本须知印在车票背面。车票已无法丢弃。」',
  rules: [
    { id: 't1', text: '不要看窗外。窗外看到的不是风景，是你不该看到的东西。', type: 'must', penalty: 'san', amount: -10 },
    { id: 't2', text: '如果有乘客问你"下一站是哪"，不要回答。假装睡着。', type: 'must', penalty: 'san', amount: -15 },
    { id: 't3', text: '餐车的食物可以吃，但不要吃第三道菜。', type: 'warning', penalty: 'hp', amount: -3 },
    { id: 't4', text: '4号车厢的卧铺不要拉开帘子。', type: 'must', penalty: 'death', amount: 0 },
    { id: 't5', text: '如果列车突然停下，数到60再动。不要在停车时发出任何声音。', type: 'timed', penalty: 'hp', amount: -4 },
    { id: 't6', text: '列车长只回答三个问题。选好你的问题。', type: 'hint' }
  ],
  openingScript: {
    scene: '你不记得自己是怎么上的车。\n\n车厢里灯光昏黄，座椅是老旧的红色绒布。周围的乘客都在沉睡，但他们的嘴唇在无声地动着，像是在说同一句话。\n\n你低头看自己手中的车票——目的地一栏写着一个你看不懂的字。不，是你每次看都会变的字。\n\n广播响了：「下一站——」然后是一阵刺耳的静电噪音。\n\n窗外是漆黑的隧道。但隧道不应该这么长。',
    forcedEvent: {
      type: 'choice',
      delay: 4000,
      text: '你身旁的乘客突然睁开了眼睛。她转过头看着你，嘴角带着不自然的微笑。「你也是新来的吧？」她说。「告诉我——下一站是哪里？」',
      choices: [
        { text: '假装睡着，不回答', result: 'safe', message: '你闭上眼睛，控制住呼吸。女人盯着你看了很久——你能感觉到她的目光像针一样刺在你脸上。终于，她转回去了。「...又一个聪明的。」她低声说。然后她重新闭上眼睛，嘴唇继续无声地动着。', sanChange: -3, hpChange: 0 },
        { text: '说"我不知道"', result: 'danger', message: '女人的笑容变大了。大得不正常。「不知道？那你为什么在这里？」她的手抓住了你的手腕，力气大得惊人。她的手是冰冷的。「不知道目的地的人...永远到不了站。」', sanChange: -15, hpChange: -1 },
        { text: '反问"你知道吗？"', result: 'risky', message: '女人歪了歪头，像是在思考。「我知道。」她说。「但我不能告诉你。规则不允许。」她松开你的手，从口袋里掏出一张皱巴巴的纸条塞进你手里。「这个可以给你。」纸条上画着一张列车线路图。', sanChange: -5, hpChange: 0, addClue: true },
        { text: '报出一个随便的站名', result: 'danger', message: '「...错了。」女人的表情瞬间变得空洞。她的头开始不自然地转动，像是脖子上的关节坏了。车厢里所有沉睡的乘客同时睁开了眼睛，齐声说：「错了。」', sanChange: -20, hpChange: -2 }
      ]
    }
  }
};

DUNGEON_RULES['gen_04'] = {
  title: '🏫 沉默学园 — 校规',
  subtitle: '「本校规张贴于校门口告示栏。红字部分由不明人士后期添加。」',
  rules: [
    { id: 's1', text: '上课铃响后必须在60秒内进入教室。迟到的学生会被"处理"。', type: 'timed', penalty: 'hp', amount: -5 },
    { id: 's2', text: '不要翻阅音乐教室的第三本乐谱。如果你已经翻了，不要弹奏上面的曲子。如果你已经弹了——跑。', type: 'warning', penalty: 'san', amount: -15 },
    { id: 's3', text: '广播室的广播只在下午6:06播放。如果你在其他时间听到了广播，那不是广播。', type: 'must', penalty: 'san', amount: -10 },
    { id: 's4', text: '校长室的红色印章不要盖在自己身上。', type: 'must', penalty: 'death', amount: 0 },
    { id: 's5', text: '如果你在走廊里看到一个穿校服的女孩背对着你站着，不要叫她。绕路走。', type: 'must', penalty: 'hp', amount: -4 },
    { id: 's6', text: '档案室的门只在音乐教室弹奏正确曲目后才会打开。曲目编号与一个日期有关。', type: 'hint' },
    { id: 's7', text: '地下教室是存在的。但入口不在你以为的地方。', type: 'hint' }
  ],
  openingScript: {
    scene: '铁门在你身后轰然关闭。\n\n你站在一所学校的大门前。校名牌匾上写着「沉默学园」四个字，但"沉默"二字是用红色油漆后来涂上去的，原来的名字已经看不清了。\n\n校园里空无一人。操场上的国旗在无风的空气中猎猎作响。教学楼的窗户全部紧闭，窗帘拉得严严实实——除了三楼最右边那扇。那扇窗户开着，窗台上坐着一个穿校服的人影。\n\n你的系统手机震动：「副本开始。存活条件：找到真相。时限：8分钟。」\n\n然后——上课铃响了。刺耳的电子铃声在空旷的校园里回荡。',
    forcedEvent: {
      type: 'timed_choice',
      delay: 2000,
      timeLimit: 15,
      text: '上课铃响了！根据校规第一条：上课铃响后必须在60秒内进入教室。你看到教学楼一楼的教室门开着——',
      choices: [
        { text: '立刻跑进教室', result: 'safe', message: '你冲进教室，在最后一声铃响消失前坐到了一张空课桌前。教室里空无一人，但每张课桌上都摆着翻开的课本。你面前的课本上用红笔圈出了一行字：「不要回头看黑板。」\n\n你当然看了黑板。黑板上写满了"安静"二字。粉笔还在黑板槽里微微滚动，像是刚刚有人写完。', sanChange: -5, hpChange: 0 },
        { text: '先去校门口的告示栏看看', result: 'risky', message: '你跑向告示栏。上面贴着一张泛黄的校规——和你刚才看到的规则一样。但最底下多了一行小字：「以上规则仅适用于活着的学生。」\n\n你还没来得及细想，铃声停了。走廊尽头传来脚步声——不，是很多脚步声。整齐划一的脚步声。像是一整个班级的学生在走廊里列队行走。但你看不到任何人。', sanChange: -8, hpChange: 0, addClue: true },
        { text: '不理铃声，先探索操场', result: 'danger', message: '你无视了铃声，走向操场。铃声停了。\n\n校园广播突然响起，一个女孩的声音平静地说：「三年二班，有同学迟到了。」\n\n你感到脚下的地面开始震动。操场的跑道上出现了裂缝，裂缝里渗出暗红色的液体。一只苍白的手从裂缝中伸了出来。', sanChange: -15, hpChange: -3 },
        { text: '向三楼窗台上的人影喊话', result: 'danger', message: '「喂！上面的！」你的声音在校园里回荡。\n\n窗台上的人影一动不动。然后——它站了起来。你看清了，那不是一个人。那是一个穿着校服的人偶，关节处用铁丝连接。它的头缓缓转向你，嘴巴裂开一个不可能的角度。\n\n广播响了：「违反校规：上课期间不得在走廊喧哗。处罚——」', sanChange: -20, hpChange: -4 }
      ]
    }
  }
};

// ============ 自动生成副本的规则模板 ============
var THEME_RULE_TEMPLATES = {
  hospital: {
    titleTemplate: '🏥 {name} — 患者须知',
    subtitleTemplate: '「此须知发现于护士站废墟中。部分内容被血迹覆盖。」',
    rulePool: [
      { text: '不要回应走廊里的呼唤声。那不是在叫你。', type: 'must', penalty: 'san', amount: -12 },
      { text: '如果病房的灯在闪烁，立刻离开那个房间。', type: 'must', penalty: 'hp', amount: -3 },
      { text: '手术室的门如果自己打开了，不要进去。', type: 'must', penalty: 'san', amount: -15 },
      { text: '药品柜里标签朝下的药瓶不要碰。', type: 'warning', penalty: 'hp', amount: -4 },
      { text: '如果你听到婴儿哭声，那不是婴儿。', type: 'must', penalty: 'san', amount: -10 },
      { text: '电梯只能用来上楼。下楼请走楼梯。', type: 'warning', penalty: 'san', amount: -8 },
      { text: '如果你在病床上看到自己的名字，不要躺上去。', type: 'must', penalty: 'death', amount: 0 },
      { text: '护士站的值班表上如果出现了你的名字，你还有一次机会。把名字划掉。', type: 'hint' }
    ]
  },
  school: {
    titleTemplate: '🏫 {name} — 校规补充条例',
    subtitleTemplate: '「本条例由学生会于[已涂改]年颁布。最后修订者：[数据删除]」',
    rulePool: [
      { text: '上课铃响后必须在60秒内回到教室。', type: 'timed', penalty: 'hp', amount: -5 },
      { text: '不要数走廊里的教室数量。数字不会是对的。', type: 'warning', penalty: 'san', amount: -8 },
      { text: '黑板上如果出现了你没写的字，不要读出来。', type: 'must', penalty: 'san', amount: -15 },
      { text: '体育器材室晚上6点后不要进入。', type: 'must', penalty: 'hp', amount: -4 },
      { text: '如果老师叫了一个不存在的学生的名字，不要应答。', type: 'must', penalty: 'death', amount: 0 },
      { text: '图书馆的禁书区有一本没有书名的书。翻到最后一页就能找到出口的线索。', type: 'hint' },
      { text: '放学铃和上课铃的音调不同。如果你分不清——那是第三种铃声。听到它就跑。', type: 'must', penalty: 'hp', amount: -5 }
    ]
  },
  church: {
    titleTemplate: '⛪ {name} — 告解指引',
    subtitleTemplate: '「愿主保佑读到此文的灵魂。以下是最后一位神父留下的警告。」',
    rulePool: [
      { text: '不要在午夜12点整凝视十字架。', type: 'must', penalty: 'san', amount: -15 },
      { text: '告解室另一侧如果有声音回应你，那不是神父。', type: 'must', penalty: 'san', amount: -12 },
      { text: '圣水可以使用，但不要喝。', type: 'warning', penalty: 'hp', amount: -3 },
      { text: '管风琴如果自己弹奏起来，跟着旋律哼唱。停下就危险了。', type: 'must', penalty: 'hp', amount: -5 },
      { text: '地下墓穴的第三具棺材是空的。它在等一个人。不要让那个人是你。', type: 'must', penalty: 'death', amount: 0 },
      { text: '祭坛下方有一个暗格，需要特定的祷告词才能打开。', type: 'hint' }
    ]
  },
  circus: {
    titleTemplate: '🎪 {name} — 观众须知',
    subtitleTemplate: '「本须知印在入场券背面。墨迹还是湿的。」',
    rulePool: [
      { text: '不要和小丑对视。如果你笑了，它会认为你在嘲笑它。', type: 'must', penalty: 'san', amount: -12 },
      { text: '旋转木马停下来的时候，不要还坐在上面。', type: 'must', penalty: 'hp', amount: -5 },
      { text: '镜子迷宫里，跟着你的倒影走。不要跟着你自己走。', type: 'warning', penalty: 'san', amount: -10 },
      { text: '如果你听到掌声，鞠躬致谢。这是唯一能让"观众"满意的方式。', type: 'must', penalty: 'san', amount: -15 },
      { text: '马戏团团长的帽子里什么都没有。不要把手伸进去验证。', type: 'must', penalty: 'death', amount: 0 },
      { text: '后台化妆间的第三面镜子能照出真实的马戏团。', type: 'hint' }
    ]
  },
  lighthouse: {
    titleTemplate: '🗼 {name} — 守塔人日志',
    subtitleTemplate: '「本日志最后记录日期：[墨迹模糊]。守塔人：[已失踪]」',
    rulePool: [
      { text: '灯塔的光束不能照到你。如果光束转向你，蹲下。', type: 'must', penalty: 'san', amount: -15 },
      { text: '海面上的求救声是假的。不要靠近海边。', type: 'must', penalty: 'hp', amount: -4 },
      { text: '楼梯间的第13级台阶不存在。跳过它。', type: 'warning', penalty: 'hp', amount: -3 },
      { text: '如果雾角响了三次以上，回到灯塔内部。', type: 'timed', penalty: 'san', amount: -10 },
      { text: '不要打开灯塔顶层的那扇红色的门。', type: 'must', penalty: 'death', amount: 0 },
      { text: '守塔人的日志第47页记录了灯塔的秘密。', type: 'hint' }
    ]
  },
  theater: {
    titleTemplate: '🎭 {name} — 剧场规章',
    subtitleTemplate: '「演出已经开始。请遵守以下规章。违者将被请上舞台。」',
    rulePool: [
      { text: '演出期间不要鼓掌。掌声会被"它们"理解为邀请。', type: 'must', penalty: 'san', amount: -12 },
      { text: '如果舞台上的演员向你招手，不要上台。', type: 'must', penalty: 'hp', amount: -5 },
      { text: '化妆间的镜子前不要坐下。坐下就站不起来了。', type: 'must', penalty: 'san', amount: -15 },
      { text: '剧本可以翻阅，但不要读出最后一幕的台词。', type: 'warning', penalty: 'san', amount: -10 },
      { text: '包厢里的"观众"不是人。不要和它们交谈。', type: 'must', penalty: 'death', amount: 0 },
      { text: '道具间有一把真正的钥匙混在假钥匙中。用重量区分。', type: 'hint' }
    ]
  },
  subway: {
    titleTemplate: '🚇 {name} — 乘车安全提示',
    subtitleTemplate: '「本提示由最后一班列车的乘客留下。他没有到站。」',
    rulePool: [
      { text: '不要在车厢连接处停留超过10秒。', type: 'timed', penalty: 'hp', amount: -3 },
      { text: '如果到站时车门没有打开，不要尝试强行打开。', type: 'must', penalty: 'san', amount: -10 },
      
      { text: '站台上如果只有你一个人，不要上车。等下一班。但如果下一班来的还是同一辆车——上去。', type: 'warning', penalty: 'san', amount: -8 },
      { text: '隧道里的涂鸦不要读。那不是涂鸦。', type: 'must', penalty: 'san', amount: -12 },
      { text: '如果广播报出了你的名字，不要下车。那不是你的站。', type: 'must', penalty: 'death', amount: 0 },
      { text: '最后一节车厢的座位下面有一个紧急通讯器。', type: 'hint' }
    ]
  },
  prison: {
    titleTemplate: '🔒 {name} — 囚犯守则',
    subtitleTemplate: '「本守则刻在牢房墙壁上。刻字的人已经不在了。」',
    rulePool: [
      { text: '熄灯后不要说话。隔壁牢房里的不是人。', type: 'must', penalty: 'san', amount: -12 },
      { text: '放风时间只有15分钟。铃声响了必须回牢房。', type: 'timed', penalty: 'hp', amount: -5 },
      { text: '不要接受其他囚犯递给你的任何东西。', type: 'warning', penalty: 'hp', amount: -3 },
      { text: '如果你听到铁链拖地的声音，面朝墙壁站好。', type: 'must', penalty: 'san', amount: -15 },
      { text: '审讯室的椅子不要坐。坐上去的人会说出自己最深的秘密——然后消失。', type: 'must', penalty: 'death', amount: 0 },
      { text: '典狱长办公室的保险柜密码是某个囚犯的编号。', type: 'hint' }
    ]
  },
  hotel: {
    titleTemplate: '🏨 {name} — 住客须知',
    subtitleTemplate: '「本须知放在床头柜上。上一位住客用血在背面写了"快跑"。」',
    rulePool: [
      { text: '不要住404号房。不要问为什么。', type: 'must', penalty: 'death', amount: 0 },
      { text: '凌晨3点到4点之间不要离开房间。', type: 'timed', penalty: 'hp', amount: -5 },
      { text: '如果有人敲门说是客房服务，先从猫眼看。如果走廊是空的——不要开门。', type: 'must', penalty: 'san', amount: -12 },
      { text: '泳池在晚上10点后关闭。如果你在关闭后看到泳池里有人在游泳，那不是人。', type: 'must', penalty: 'san', amount: -10 },
      { text: '电梯到达你没按的楼层时，不要出去。', type: 'warning', penalty: 'san', amount: -8 },
      { text: '前台的登记簿上记录着所有住客的退房方式。翻到最后一页。', type: 'hint' }
    ]
  },
  museum: {
    titleTemplate: '🏛️ {name} — 参观须知',
    subtitleTemplate: '「本须知由前任馆长撰写。他目前是三号展厅的展品之一。」',
    rulePool: [
      { text: '不要触碰任何展品。展品会触碰你。', type: 'must', penalty: 'hp', amount: -3 },
      { text: '如果雕像的姿势和你上次看到的不一样，不要惊慌。慢慢后退。', type: 'must', penalty: 'san', amount: -10 },
      { text: '古埃及展厅的石棺不要打开。', type: 'must', penalty: 'death', amount: 0 },
      { text: '画中如果出现了你的身影，离开那个展厅。', type: 'must', penalty: 'san', amount: -15 },
      { text: '博物馆的出口每小时变换一次位置。', type: 'warning', penalty: 'san', amount: -8 },
      { text: '馆长办公室的抽屉里有一份展品清单。清单上有一件展品标注为"活体"。', type: 'hint' }
    ]
  },
  forest: {
    titleTemplate: '🌲 {name} — 护林员警告',
    subtitleTemplate: '「本警告钉在入口处的树上。钉子是从里面钉出来的。」',
    rulePool: [
      { text: '不要离开小路。如果你已经离开了——你看到的小路不是原来那条。', type: 'must', penalty: 'san', amount: -10 },
      { text: '如果你听到有人叫你的名字，不要回应。森林不知道你的名字。', type: 'must', penalty: 'san', amount: -15 },
      { text: '天黑前必须找到猎人小屋。天黑后森林会"醒来"。', type: 'timed', penalty: 'hp', amount: -5 },
      { text: '不要数你经过了多少棵树。数字会让你发疯。', type: 'warning', penalty: 'san', amount: -8 },
      { text: '如果你看到篝火，不要靠近。篝火周围坐着的人已经不是人了。', type: 'must', penalty: 'death', amount: 0 },
      { text: '猎人小屋的日记记录了走出森林的方法。关键在第三天的日记。', type: 'hint' }
    ]
  },
  apartment: {
    titleTemplate: '🏢 {name} — 物业通知',
    subtitleTemplate: '「本通知塞在您的门缝下。但物业办公室已经废弃三年了。」',
    rulePool: [
      { text: '电梯显示B13层时不要出去。这栋楼没有B13层。', type: 'must', penalty: 'san', amount: -15 },
      { text: '如果你听到楼上的脚步声，不要上去查看。你住在顶楼。', type: 'must', penalty: 'san', amount: -10 },
      { text: '每扇门的猫眼后面都有东西在看你。不要贴近猫眼。', type: 'warning', penalty: 'san', amount: -8 },
      { text: '走廊的灯如果开始一盏接一盏地熄灭，跑回你的房间。', type: 'timed', penalty: 'hp', amount: -4 },
      { text: '不要打开1408号房间的门。', type: 'must', penalty: 'death', amount: 0 },
      { text: '物业办公室的钥匙柜里有一把万能钥匙。但柜子上了锁。密码是某个房间号。', type: 'hint' }
    ]
  },
  laboratory: {
    titleTemplate: '🔬 {name} — 安全规程',
    subtitleTemplate: '「本规程最后更新于实验失控前24小时。」',
    rulePool: [
      { text: '不要打开标记为"已处理"的培养皿。它们没有被处理。', type: 'must', penalty: 'hp', amount: -5 },
      { text: '如果防护服中是空的但在自己行走，不要阻挡它。', type: 'must', penalty: 'san', amount: -12 },
      { text: '服务器室的屏幕如果显示你的名字，拔掉电源。', type: 'warning', penalty: 'san', amount: -10 },
      { text: '冷藏室的温度显示如果是负数，可以进入。如果显示正数——里面的东西已经醒了。', type: 'must', penalty: 'death', amount: 0 },
      { text: '隔离区的红色按钮是紧急封锁。只在万不得已时使用。', type: 'hint' },
      { text: '实验日志记录了实验体的弱点。在主任办公室。', type: 'hint' }
    ]
  },
  ship: {
    titleTemplate: '🚢 {name} — 航海日志附录',
    subtitleTemplate: '「本附录由大副在失踪前写下。墨迹被海水浸泡过。」',
    rulePool: [
      { text: '不要在甲板上用望远镜看远处的船。那是同一艘船。你在看自己。', type: 'must', penalty: 'san', amount: -15 },
      { text: '船舱渗水时不要伸手进水里。水里有手会拉你。', type: 'must', penalty: 'hp', amount: -4 },
      { text: '如果广播发出弃船命令，不要弃船。船外没有海。', type: 'must', penalty: 'death', amount: 0 },
      { text: '货舱的集装箱不要打开。尤其是有敲击声的那个。', type: 'warning', penalty: 'san', amount: -10 },
      { text: '船长室的航海图标注了一个安全区域。到达那里就能脱出。', type: 'hint' }
    ]
  },
  mine: {
    titleTemplate: '⛏️ {name} — 矿井安全告示',
    subtitleTemplate: '「本告示张贴于矿井入口。纸张已经泛黄五十年了。」',
    rulePool: [
      { text: '矿灯不能灭。灯灭了它们就能看到你。', type: 'must', penalty: 'hp', amount: -5 },
      { text: '如果你听到有节奏的敲击声，不要敲回去。', type: 'must', penalty: 'san', amount: -12 },
      { text: '矿车如果自己开始移动，不要上去。', type: 'must', penalty: 'death', amount: 0 },
      { text: '塌方区的碎石如果在移动，跑。', type: 'timed', penalty: 'hp', amount: -4 },
      { text: '地下湖的水可以喝，但不要看水面下的东西。', type: 'warning', penalty: 'san', amount: -10 },
      { text: '老矿工的遗物中有一张地图，标注了安全通道。', type: 'hint' }
    ]
  },
  asylum: {
    titleTemplate: '🏥 {name} — 患者管理条例',
    subtitleTemplate: '「本条例由院长亲笔书写。院长目前是C区的患者。」',
    rulePool: [
      { text: '不要和C区的患者交谈。他们说的都是真的。这才是最可怕的。', type: 'must', penalty: 'san', amount: -12 },
      { text: '如果你在病历上看到自己的名字，不要相信上面写的诊断。', type: 'warning', penalty: 'san', amount: -10 },
      { text: '治疗室的电击器如果自己启动了，离开那个房间。', type: 'must', penalty: 'hp', amount: -5 },
      { text: '活动室的电视只播放雪花屏。如果你在雪花中看到了画面——闭眼。', type: 'must', penalty: 'san', amount: -15 },
      { text: '隔离病房的门不要从外面打开。锁着是有原因的。', type: 'must', penalty: 'death', amount: 0 },
      { text: '院长办公室的保险柜里有通往外面的钥匙。密码是某个患者的编号。', type: 'hint' }
    ]
  }
};

// ============ 规则生成函数 ============

function generateRulesForDungeon(dungeonId, dungeonName, theme) {
  // 先检查是否有手工规则
  if (DUNGEON_RULES[dungeonId]) return DUNGEON_RULES[dungeonId];

  // 使用主题模板生成
  var template = THEME_RULE_TEMPLATES[theme];
  if (!template) {
    // 没有对应主题模板，使用通用规则
    template = THEME_RULE_TEMPLATES['hospital']; // 兜底
  }

  var title = template.titleTemplate.replace('{name}', dungeonName);
  var subtitle = template.subtitleTemplate;

  // 从规则池中随机选5-7条
  var pool = template.rulePool.slice();
  var shuffled = pool.sort(function() { return Math.random() - 0.5; });
  var count = Math.min(shuffled.length, Math.floor(Math.random() * 3) + 5);
  var selectedRules = shuffled.slice(0, count);

  // 确保至少有1条hint、1条must、1条death
  var hasHint = selectedRules.some(function(r) { return r.type === 'hint'; });
  var hasMust = selectedRules.some(function(r) { return r.type === 'must'; });
  var hasDeath = selectedRules.some(function(r) { return r.penalty === 'death'; });

  if (!hasHint) {
    var hints = pool.filter(function(r) { return r.type === 'hint'; });
    if (hints.length > 0) selectedRules.push(hints[0]);
  }
  if (!hasMust) {
    var musts = pool.filter(function(r) { return r.type === 'must' && !selectedRules.includes(r); });
    if (musts.length > 0) selectedRules.push(musts[0]);
  }
  if (!hasDeath) {
    var deaths = pool.filter(function(r) { return r.penalty === 'death' && !selectedRules.includes(r); });
    if (deaths.length > 0) selectedRules.push(deaths[0]);
  }

  // 给每条规则加上id
  selectedRules.forEach(function(r, i) {
    r.id = dungeonId + '_r' + i;
  });

  var generated = {
    title: title,
    subtitle: subtitle,
    rules: selectedRules,
    openingScript: generateOpeningScript(dungeonName, theme),
    _generated: true
  };

  // 缓存
  DUNGEON_RULES[dungeonId] = generated;
  return generated;
}

// ============ 开场剧情自动生成 ============

function generateOpeningScript(dungeonName, theme) {
  var OPENING_SCENES = {
    hospital: [
      '你的意识从黑暗中浮起，像溺水者拼命挣扎着浮出水面。\n\n刺鼻的消毒水味道灌入鼻腔。你发现自己躺在一张生锈的轮椅上，走廊两侧是紧闭的病房门。头顶的日光灯只有一盏还亮着，发出濒死般的嗡嗡声。\n\n你的系统手机亮了：「副本：' + dungeonName + '。存活条件：找到出口。」\n\n远处传来什么东西倒塌的声音。然后是脚步声——不对，太多了。太整齐了。像是一群人在同时迈步。',
      '电梯门打开的瞬间，一股混合着甲醛和腐肉的气味扑面而来。\n\n你不记得自己是怎么进的电梯。电梯按钮面板上所有楼层都亮着，但显示屏上的数字是——负数。\n\n门外是一条漫长的走廊，墙壁上的油漆像皮肤一样剥落。走廊尽头有一个护士站，值班灯还亮着。\n\n你的系统手机震动：「副本：' + dungeonName + '。时限开始计算。」\n\n护士站传来椅子转动的声音。有人——或者什么东西——坐在那里。'
    ],
    school: [
      '校门在你身后关上了。不是慢慢关上的——是猛地合拢，像一张嘴巴闭合。\n\n你站在一所学校的操场上。夕阳把一切染成血红色，但太阳的位置不对——它在地平线以下。光是从地面往上照的。\n\n教学楼的窗户全部紧闭。但你能看到每扇窗户后面都有一个黑色的人影，一动不动地站着。\n\n你的系统手机响了：「副本：' + dungeonName + '。存活条件：找到真相。」\n\n然后——上课铃响了。',
      '你醒来时坐在一张课桌前。\n\n教室里空无一人，但每张桌上都摆着翻开的课本和削好的铅笔，像是所有人同时离开了。黑板上写着今天的日期——但那个日期是三十年前的。\n\n窗外是浓雾。你看不到操场，看不到围墙，看不到任何东西。只有雾。\n\n你的系统手机亮了：「副本：' + dungeonName + '。」\n\n走廊里传来脚步声。很轻，很小，像是孩子在跑。但笑声不像孩子。'
    ],
    church: [
      '教堂的大门在你推开的瞬间发出了一声像叹息的声音。\n\n里面比外面更暗。唯一的光源是祭坛上的蜡烛——几十根蜡烛整齐地排列着，火焰全部向同一个方向倾斜。但教堂里没有风。\n\n长椅上空无一人。但你注意到每个座位上都放着一本翻开的圣经，翻到的都是同一页。\n\n你的系统手机震动：「副本：' + dungeonName + '。」\n\n管风琴突然响了。没有人在弹。',
    ],
    circus: [
      '旋转木马的音乐从四面八方传来，但调子不对——像是把正常的旋律倒着放。\n\n你站在一个马戏团的入口处。帐篷是红白条纹的，但白色部分在月光下看起来像骨头的颜色。入口处的告示牌上写着：「今晚演出：永不落幕」。\n\n你的系统手机亮了：「副本：' + dungeonName + '。」\n\n帐篷里传来掌声。热烈的、持续不断的掌声。但你进去后发现——观众席是空的。',
    ],
    lighthouse: [
      '海雾浓得像一堵墙。你几乎是摸索着走到了灯塔脚下。\n\n灯塔的光束在雾中缓慢旋转，每次扫过你的位置时，你都能短暂地看清周围——礁石、碎裂的栏杆、以及岸边那艘搁浅的船。船体上的名字已经被海水腐蚀得看不清了。\n\n灯塔的门开着。里面传来有节奏的滴水声。\n\n你的系统手机响了：「副本：' + dungeonName + '。」\n\n海面上传来一声悠长的雾角。然后是第二声。第三声...',
    ],
    theater: [
      '剧场的大门自己打开了，像是在欢迎你。\n\n大厅里金碧辉煌，但所有的金色装饰都蒙着一层灰。水晶吊灯还亮着，但灯光是冷的，像月光。\n\n售票处的玻璃后面坐着一个人偶，手里举着一张票。票上写着你的名字和座位号。\n\n你的系统手机亮了：「副本：' + dungeonName + '。」\n\n剧场深处传来一个声音：「第三幕即将开始。请观众入座。」',
    ],
    subway: [
      '你不知道自己是什么时候上的地铁。\n\n车厢里的灯管有一半坏了，幸存的那些也在不停闪烁。座位上没有其他乘客，但有些座位的坐垫上有凹陷，像是刚刚有人坐过。\n\n窗外不是隧道——是纯粹的黑色虚空。偶尔有什么东西在黑暗中闪过，太快了，你看不清。\n\n你的系统手机震动：「副本：' + dungeonName + '。」\n\n广播响了：「下一站——」然后是长达十秒的沉默。',
    ]
  };

  var OPENING_EVENTS = {
    hospital: {
      type: 'choice', delay: 3000,
      text: '走廊尽头传来金属碰撞的声音，越来越近。你必须做出选择——',
      choices: [
        { text: '躲进最近的病房', result: 'safe', message: '你推开最近的病房门冲了进去。门在你身后关上的瞬间，走廊里的声音经过了你的门前。透过门上的小窗，你看到一个穿着护士服的身影推着轮椅经过。轮椅上坐着的东西——你不想描述它。', sanChange: -5, hpChange: 0 },
        { text: '沿走廊往反方向跑', result: 'safe', message: '你转身狂奔。你的脚步声在空荡的走廊里回响。你跑了很久——太久了。这条走廊不应该这么长。终于，你看到了一个岔路口。身后的声音已经消失了。', sanChange: -3, hpChange: 0 },
        { text: '站在原地等它过来', result: 'danger', message: '你站在原地，紧握拳头。声音越来越近——然后你看到了。一个没有脸的护士推着一辆空轮椅。她停在你面前，歪了歪头。然后她伸出手——指向轮椅。她想让你坐上去。', sanChange: -15, hpChange: -2 },
        { text: '大声喊叫求救', result: 'danger', message: '你的声音在走廊里回荡了很久。太久了。回声变了——它不再是你的声音。走廊里所有的病房门同时打开了。', sanChange: -18, hpChange: -3 }
      ]
    },
        school: {
      type: 'timed_choice', delay: 2000, timeLimit: 15,
      text: '上课铃响了！你需要立刻做出选择——',
      choices: [
        { text: '冲进最近的教室', result: 'safe', message: '你冲进教室，在铃声消失前坐到了一张空课桌前。教室里没有其他人，但黑板上的粉笔字还是湿的：「今日课题：如何活着离开」。课桌抽屉里有一本笔记本，封面写着一个你不认识的学生的名字。', sanChange: -3, hpChange: 0 },
        { text: '先观察一下环境', result: 'risky', message: '你四处张望。铃声停了。走廊突然变得很安静——不，不是安静。是所有声音都消失了。你的脚步声、呼吸声、心跳声。全部消失了。然后你听到了一个声音——从广播里传来的女孩的声音：「迟到的同学，请到教导处报到。」', sanChange: -10, hpChange: 0 },
        { text: '无视铃声继续探索', result: 'danger', message: '你决定无视铃声。这是一个错误。\n\n铃声停止后，校园里的空气变得粘稠。你感到有无数双眼睛在看着你——从每一扇窗户后面。广播响了：「违反校规第一条。处罚执行中。」\n\n你脚下的地面开始龟裂。', sanChange: -15, hpChange: -3 },
        { text: '向窗户里的人影求助', result: 'danger', message: '你朝窗户挥手。窗户后面的人影没有动。然后——所有窗户里的人影同时举起了手。它们在模仿你。但动作慢了半拍。你放下手，它们没有放下。', sanChange: -12, hpChange: -1 }
      ]
    }
  };

  // 获取对应主题的开场
  var scenes = OPENING_SCENES[theme] || OPENING_SCENES['hospital'];
  var scene = scenes[Math.floor(Math.random() * scenes.length)];
  var event = OPENING_EVENTS[theme] || OPENING_EVENTS['hospital'];

  return {
    scene: scene,
    forcedEvent: event
  };
}

// ============ 规则面板UI ============

function showRulesPanel(dungeonId, dungeonName, theme, callback) {
  var rules = generateRulesForDungeon(dungeonId, dungeonName, theme);
  
  // 保存当前副本规则到全局
  G.currentDungeonRules = rules;

  var overlay = document.getElementById('dungeonSelectOverlay');
  var panel = document.getElementById('dungeonSelectPanel');

  var html = '';
  
  // 标题区
  html += '<div style="text-align:center;margin-bottom:12px">';
  html += '<div style="font-size:10px;color:#ff4444;letter-spacing:4px;margin-bottom:4px">⚠️ 系统通知 ⚠️</div>';
  html += '<div style="font-size:16px;color:#e0b0b0;font-weight:bold;margin-bottom:6px">' + rules.title + '</div>';
  html += '<div style="font-size:11px;color:#888;font-style:italic">' + rules.subtitle + '</div>';
  html += '</div>';

  // 分隔线
  html += '<div style="border-bottom:1px solid #5a2020;margin:8px 0"></div>';

  // 规则列表
  html += '<div style="max-height:45vh;overflow-y:auto;padding:4px">';
  
  rules.rules.forEach(function(rule, idx) {
    var typeIcon = '';
    var typeColor = '';
    var bgColor = '';
    
    switch(rule.type) {
      case 'must':
        typeIcon = '🚫';
        typeColor = '#ff4444';
        bgColor = 'rgba(139,0,0,0.15)';
        break;
      case 'warning':
        typeIcon = '⚠️';
        typeColor = '#ff8800';
        bgColor = 'rgba(139,100,0,0.1)';
        break;
      case 'timed':
        typeIcon = '⏰';
        typeColor = '#ff6666';
        bgColor = 'rgba(139,0,0,0.1)';
        break;
      case 'hint':
        typeIcon = '💡';
        typeColor = '#88aaff';
        bgColor = 'rgba(0,50,139,0.1)';
        break;
      default:
        typeIcon = '📌';
        typeColor = '#aaa';
        bgColor = 'rgba(50,50,50,0.1)';
    }

    // 死亡惩罚特殊标记
    var penaltyText = '';
    if (rule.penalty === 'death') {
      penaltyText = '<span style="color:#ff0000;font-size:9px;border:1px solid #ff0000;padding:0 4px;border-radius:3px;margin-left:6px">违反即死</span>';
    } else if (rule.penalty === 'hp') {
      penaltyText = '<span style="color:#ff6666;font-size:9px;margin-left:6px">HP' + rule.amount + '</span>';
    } else if (rule.penalty === 'san') {
      penaltyText = '<span style="color:#aa88ff;font-size:9px;margin-left:6px">SAN' + rule.amount + '</span>';
    }

    html += '<div style="background:' + bgColor + ';border:1px solid rgba(90,32,32,0.3);border-radius:6px;padding:8px 10px;margin-bottom:6px">';
    html += '<div style="display:flex;align-items:flex-start;gap:6px">';
    html += '<span style="font-size:14px;flex-shrink:0">' + typeIcon + '</span>';
    html += '<div style="flex:1">';
    html += '<div style="font-size:12px;color:' + typeColor + ';line-height:1.6">';
    html += '<span style="color:#666;font-size:10px;margin-right:4px">' + (idx + 1) + '.</span>';
    html += rule.text;
    html += penaltyText;
    html += '</div>';
    html += '</div></div></div>';
  });

  html += '</div>';

  // 底部警告
  html += '<div style="text-align:center;margin:12px 0 8px;padding:8px;background:rgba(139,0,0,0.2);border:1px solid #5a2020;border-radius:6px">';
  html += '<div style="font-size:11px;color:#ff6666;line-height:1.8">⚠️ 请牢记以上规则。违反规则将受到惩罚。</div>';
  html += '<div style="font-size:9px;color:#666;margin-top:4px">「规则是唯一能保护你的东西。」——回廊系统</div>';
  html += '</div>';

  // 确认按钮
  html += '<button class="settlement-btn" style="width:100%" onclick="confirmRulesRead()">我已阅读并记住规则（进入副本）</button>';

  panel.innerHTML = html;
  overlay.classList.add('show');

  // 保存回调
  window._rulesReadCallback = callback;
}

// ============ 修改 confirmRulesRead ============

function confirmRulesRead() {
  document.getElementById('dungeonSelectOverlay').classList.remove('show');
  
  // ★ 不在这里执行回调，而是先设置标记，阻止enterDungeon调AI
  G._openingScriptPlaying = true;
  
  // 先执行回调（进入副本），但moveToRoom会被拦截
  if (window._rulesReadCallback) {
    var cb = window._rulesReadCallback;
    window._rulesReadCallback = null;
    cb(); // 这会调用 enterDungeon()，但我们拦截了moveToRoom的AI调用
  }

  // 然后播放开场剧情（纯本地文字，不调AI）
  if (G.currentDungeonRules && G.currentDungeonRules.openingScript) {
    // 清空enterDungeon产生的消息，用开场剧情替代
    setTimeout(function() {
      document.getElementById('textArea').innerHTML = '';
      G.messageHistory = [];
      playOpeningScript(G.currentDungeonRules.openingScript);
    }, 300);
  }
}

// ============ 重写 playOpeningScript ============

function playOpeningScript(script) {
  if (!script) return;

  // 清空快捷按钮区
  var quickActions = document.getElementById('quickActions');
  if (quickActions) quickActions.innerHTML = '';

  // 播放开场叙述
  var lines = script.scene.split('\n\n');
  var delay = 0;
  var totalTextDelay = 0;

  lines.forEach(function(line, idx) {
    if (line.trim() === '') return;
    delay += 1500;
    totalTextDelay = delay;
    setTimeout(function() {
      if (line.indexOf('「') >= 0 && (line.indexOf('副本') >= 0 || line.indexOf('存活') >= 0 || line.indexOf('时限') >= 0)) {
        addMessage('system', line);
      } else {
        addMessage('narrator', line);
      }
    }, delay);
  });

  // ★ 所有文字显示完毕后，再显示强制事件和倒计时
  if (script.forcedEvent) {
    var eventDelay = totalTextDelay + (script.forcedEvent.delay || 2000);
    setTimeout(function() {
      triggerOpeningEvent(script.forcedEvent);
    }, eventDelay);
  }
}

// ============ 重写 triggerOpeningEvent ============

function triggerOpeningEvent(event) {
  if (!event || !event.choices) return;

  // 显示事件描述
  addMessage('horror', event.text);

  // 生成选择按钮（先显示按钮，再开始倒计时）
  showOpeningChoices(event.choices);

  // 如果是限时选择，按钮显示后才开始倒计时
  if (event.type === 'timed_choice' && event.timeLimit) {
    setTimeout(function() {
      addMessage('system', '⏰ 你有 ' + event.timeLimit + ' 秒做出选择！');
      startOpeningTimer(event);
    }, 500);
  }
}

// ============ 重写 startOpeningTimer ============

var _openingTimerInterval = null;
var _openingTimerExpired = false;

function startOpeningTimer(event) {
  _openingTimerExpired = false;
  var remaining = event.timeLimit;
  
  _openingTimerInterval = setInterval(function() {
    remaining--;
    if (remaining <= 0) {
      clearInterval(_openingTimerInterval);
      _openingTimerInterval = null;
      _openingTimerExpired = true;
      
      // 超时惩罚 - 自动选择最差选项
      var worstChoice = event.choices.reduce(function(worst, c) {
        var score = (c.sanChange || 0) + (c.hpChange || 0) * 3;
        var worstScore = (worst.sanChange || 0) + (worst.hpChange || 0) * 3;
        return score < worstScore ? c : worst;
      }, event.choices[0]);

      addMessage('horror', '⏰ 时间到！你犹豫太久了——');
      
      // 移除选择按钮
      var container = document.getElementById('quickActions');
      if (container) {
        var btns = container.querySelectorAll('.opening-choice-btn');
        btns.forEach(function(b) { b.remove(); });
      }
      
      resolveOpeningChoice(worstChoice);
    } else if (remaining <= 5) {
      addMessage('system', '⏰ ' + remaining + '秒！');
    }
  }, 1000);
}

// ============ 重写 showOpeningChoices ============

function showOpeningChoices(choices) {
  var container = document.getElementById('quickActions');
  if (!container) return;

  // 清空现有按钮
  container.innerHTML = '';

  choices.forEach(function(choice, idx) {
    var btn = document.createElement('button');
    btn.className = 'action-btn opening-choice-btn';
    
    // 根据结果类型设置样式（但玩家不知道结果，只是微妙的颜色差异）
    btn.style.borderColor = '#5a2020';
    
    btn.textContent = choice.text;
    btn.onclick = function() {
      if (_openingTimerExpired) return;
      
      // 停止计时器
      if (_openingTimerInterval) {
        clearInterval(_openingTimerInterval);
        _openingTimerInterval = null;
      }
      
      // 移除所有选择按钮
      var btns = container.querySelectorAll('.opening-choice-btn');
      btns.forEach(function(b) { b.remove(); });
      
      resolveOpeningChoice(choice);
    };
    container.appendChild(btn);
  });
}

// ============ 重写 resolveOpeningChoice - 核心修改 ============

function resolveOpeningChoice(choice) {
  // 显示结果叙述
  var msgType = choice.result === 'danger' ? 'horror' : 'narrator';
  addMessage(msgType, choice.message);

  // 应用HP/SAN变化
  if (choice.hpChange && choice.hpChange !== 0) {
    updateHP(G.hp + choice.hpChange);
    addMessage('system', '❤️ HP ' + (choice.hpChange > 0 ? '+' : '') + choice.hpChange);
  }
  if (choice.sanChange && choice.sanChange !== 0) {
    updateSAN(G.san + choice.sanChange);
    addMessage('system', '🧠 SAN ' + (choice.sanChange > 0 ? '+' : '') + choice.sanChange);
  }

  // 如果有额外线索
  if (choice.addClue) {
    addMessage('system', '🔍 你获得了一条重要信息...');
    showNotification('🔍 发现线索', 'clue');
  }

  // ★ 解除开场剧情标记
  G._openingScriptPlaying = false;

  // 过渡到正常副本探索
  setTimeout(function() {
    addMessage('system', '═══════════════════');
    addMessage('system', '副本探索开始。注意遵守规则。');
    addMessage('system', '═══════════════════');
    
    // ★★★ 核心修复：根据选择结果，自动移动到对应房间 ★★★
    setTimeout(function() {
      var targetRoomId = findRoomByChoice(choice);
      
      if (targetRoomId && targetRoomId !== G.currentRoom) {
        // 移动到目标房间（这会自动更新背景图、小地图、调AI）
        moveToRoom(targetRoomId);
      } else {
        // 没找到匹配房间，就在当前房间调AI描述
        var room = G.dungeon.rooms[G.currentRoom];
        if (room) {
          updateRoomDisplay(room);
          renderMinimap();
        }
        if (G.connected && mujianSdk) {
          var contextText = '玩家刚进入副本。开场选择：' + choice.text + '。结果：' + choice.message.substring(0, 80);
          callAI(contextText);
        } else {
          var room2 = G.dungeon.rooms[G.currentRoom];
          if (room2 && room2.description) {
            addMessage('narrator', room2.description);
          }
          generateContextActions();
        }
      }
    }, 1000);
  }, 2000);
}

// ★★★ 根据玩家选择文本，智能匹配副本中的目标房间 ★★★
function findRoomByChoice(choice) {
  if (!G.dungeon || !G.dungeon.rooms) return null;
  
  var choiceText = choice.text + ' ' + choice.message;
  var choiceLower = choiceText.toLowerCase();
  
  // 从选择文本中提取可能的房间关键词
  var roomKeywords = {
    '教室': ['教室', '课堂', '课桌'],
    '告示栏': ['告示栏', '告示', '公告'],
    '操场': ['操场', '跑道', '运动场'],
    '走廊': ['走廊', '过道', '通道'],
    '病房': ['病房', '病室'],
    '手术室': ['手术室', '手术'],
    '诊室': ['诊室', '诊疗'],
    '候诊': ['候诊', '大厅', '门厅'],
    '接待': ['接待台', '接待'],
    '门厅': ['门厅', '大厅', '门口'],
    '画廊': ['画廊', '画室'],
    '书房': ['书房', '图书'],
    '酒窖': ['酒窖', '地下室'],
    '餐车': ['餐车', '餐厅'],
    '卧铺': ['卧铺', '车厢'],
    '化妆间': ['化妆间', '化妆室'],
    '舞台': ['舞台', '台上']
  };
  
  // 方法1：直接在副本房间名中匹配选择文本中的关键词
  var bestMatch = null;
  var bestScore = 0;
  
  Object.keys(G.dungeon.rooms).forEach(function(rid) {
    if (rid === G.currentRoom) return; // 跳过当前房间
    var room = G.dungeon.rooms[rid];
    if (room.locked) return; // 跳过锁定房间
    
    var roomName = room.name;
    var score = 0;
    
    // 选择文本中直接包含房间名
    if (choiceLower.includes(roomName)) {
      score += 10;
    }
    
    // 房间名包含在选择文本中的关键词
    Object.keys(roomKeywords).forEach(function(key) {
      if (roomName.includes(key)) {
        roomKeywords[key].forEach(function(kw) {
          if (choiceLower.includes(kw)) {
            score += 5;
          }
        });
      }
    });
    
    // 房间名的每个字在选择文本中出现
    for (var i = 0; i < roomName.length; i++) {
      if (choiceLower.includes(roomName[i])) {
        score += 1;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rid;
    }
  });
  
  // 方法2：如果是"safe"结果且选择文本包含"进"、"冲进"、"跑进"等，
  // 尝试找startRoom的第一个连接房间
  if (!bestMatch || bestScore < 3) {
    if (choice.result === 'safe' && (choiceLower.includes('冲进') || choiceLower.includes('跑进') || choiceLower.includes('进入') || choiceLower.includes('躲进'))) {
      var startRoom = G.dungeon.rooms[G.currentRoom];
      if (startRoom && startRoom.connections && startRoom.connections.length > 0) {
        // 找第一个未锁定的连接房间
        for (var i = 0; i < startRoom.connections.length; i++) {
          var connId = startRoom.connections[i];
          var connRoom = G.dungeon.rooms[connId];
          if (connRoom && !connRoom.locked) {
            bestMatch = connId;
            break;
          }
        }
      }
    }
  }
  
  // 方法3：如果选择是"danger"结果且涉及"原地"、"站着"，保持当前房间
  if (choice.result === 'danger' && (choiceLower.includes('原地') || choiceLower.includes('站在') || choiceLower.includes('不动'))) {
    return null; // 不移动
  }
  
  return bestMatch;
}

// ============ 规则查看按钮（副本内随时查看） ============

function showCurrentRules() {
  if (!G.currentDungeonRules) {
    showNotification('当前没有副本规则', '');
    return;
  }

  var rules = G.currentDungeonRules;
  var panel = document.getElementById('dungeonSelectPanel');
  var html = '';

  html += '<div style="text-align:center;margin-bottom:12px">';
  html += '<div style="font-size:14px;color:#e0b0b0;font-weight:bold">' + rules.title + '</div>';
  html += '<div style="font-size:10px;color:#888;font-style:italic;margin-top:4px">' + rules.subtitle + '</div>';
  html += '</div>';

  html += '<div style="max-height:50vh;overflow-y:auto">';
  rules.rules.forEach(function(rule, idx) {
    var typeIcon = rule.type === 'must' ? '🚫' : (rule.type === 'warning' ? '⚠️' : (rule.type === 'timed' ? '⏰' : (rule.type === 'hint' ? '💡' : '📌')));
    var typeColor = rule.type === 'must' ? '#ff4444' : (rule.type === 'warning' ? '#ff8800' : (rule.type === 'timed' ? '#ff6666' : (rule.type === 'hint' ? '#88aaff' : '#aaa')));
    
    html += '<div style="padding:6px 8px;margin-bottom:4px;border-left:2px solid ' + typeColor + ';background:rgba(20,8,8,0.4)">';
    html += '<span style="font-size:12px">' + typeIcon + '</span> ';
    html += '<span style="font-size:11px;color:' + typeColor + '">' + (idx + 1) + '. ' + rule.text + '</span>';
    if (rule.penalty === 'death') {
      html += ' <span style="color:#ff0000;font-size:9px;border:1px solid #ff0000;padding:0 3px;border-radius:2px">致死</span>';
    }
    html += '</div>';
  });
  html += '</div>';

  html += '<button class="settlement-btn secondary" style="margin-top:12px;width:100%" onclick="closeDungeonSelect()">关闭</button>';

  panel.innerHTML = html;
  document.getElementById('dungeonSelectOverlay').classList.add('show');
}

// ============ 集成到副本进入流程 ============

// 保存原始的 _doEnterDungeon 引用
var _originalDoEnterDungeon = typeof _doEnterDungeon === 'function' ? _doEnterDungeon : null;

// 如果 _doEnterDungeon 不存在，尝试用 confirmEnterDungeon 的内部逻辑
if (!_originalDoEnterDungeon) {
  // 创建一个包装函数
  _originalDoEnterDungeon = function(dungeonId) {
    // 查找副本工厂
    var factory = DUNGEON_FACTORIES[dungeonId];
    if (!factory) {
      addMessage('system', '副本数据不存在：' + dungeonId);
      return;
    }
    var dungeonConfig = factory();
    
    // 生成道具
    if (typeof generateDungeonItems === 'function') {
      generateDungeonItems(dungeonConfig);
    }
    
    // 调用原始进入函数
    if (typeof enterDungeon === 'function') {
      enterDungeon(dungeonConfig);
    }
  };
}

// 覆盖 _doEnterDungeon，在进入副本前显示规则
_doEnterDungeon = function(dungeonId) {
  // 查找副本信息
  var dungeonEntry = DUNGEON_LIST.find(function(d) { return d.id === dungeonId; });
  var dungeonName = dungeonEntry ? dungeonEntry.name : '未知副本';
  
  // 查找主题
  var theme = 'hospital'; // 默认
  var genDef = GENERATED_DUNGEON_DEFS.find(function(d) { return d.id === dungeonId; });
  if (genDef) {
    theme = genDef.theme;
  } else if (dungeonId === 'hospital') {
    theme = 'hospital';
  } else if (dungeonId === 'mansion') {
    theme = 'church'; // 庄园用教堂主题的氛围
  } else if (dungeonId === 'train') {
    theme = 'subway'; // 列车用地铁主题
  }

  // 显示规则面板，确认后进入副本
  showRulesPanel(dungeonId, dungeonName, theme, function() {
    // 这里执行真正的副本进入逻辑
    var factory = DUNGEON_FACTORIES[dungeonId];
    if (!factory) {
      addMessage('system', '副本数据不存在：' + dungeonId);
      return;
    }
    var dungeonConfig = factory();
    
    if (typeof generateDungeonItems === 'function') {
      generateDungeonItems(dungeonConfig);
    }
    
    enterDungeon(dungeonConfig);
  });
};

// ============ 规则违反检测系统 ============

// 在玩家行动时检测是否违反规则
function checkRuleViolation(actionText) {
  if (!G.currentDungeonRules || !G.currentDungeonRules.rules) return null;
  if (!G.inDungeon) return null;

  var violations = [];
  var lowerAction = actionText.toLowerCase();

  G.currentDungeonRules.rules.forEach(function(rule) {
    // 根据规则内容和玩家行动进行模糊匹配
    var ruleText = rule.text.toLowerCase();
    
    // 检测"不要回应/回答"类规则
    if (ruleText.includes('不要回应') || ruleText.includes('不要回答')) {
      if (lowerAction.includes('回应') || lowerAction.includes('回答') || lowerAction.includes('应答')) {
        violations.push(rule);
      }
    }
    
    // 检测"不要看/直视"类规则
    if (ruleText.includes('不要看') || ruleText.includes('不要直视') || ruleText.includes('不要凝视')) {
      if (lowerAction.includes('看窗外') || lowerAction.includes('直视') || lowerAction.includes('凝视') || lowerAction.includes('盯着看')) {
        violations.push(rule);
      }
    }

    // 检测"不要打开"类规则
    if (ruleText.includes('不要打开')) {
      if (lowerAction.includes('打开') || lowerAction.includes('开门') || lowerAction.includes('拉开')) {
        // 检查是否是同一个对象
        var targetMatch = ruleText.match(/不要打开(.+?)[\。\.]/);
        if (targetMatch) {
          var target = targetMatch[1].trim();
          if (lowerAction.includes(target.substring(0, 2))) {
            violations.push(rule);
          }
        }
      }
    }

    // 检测"不要靠近"类规则
    if (ruleText.includes('不要靠近')) {
      if (lowerAction.includes('靠近') || lowerAction.includes('走过去') || lowerAction.includes('接近')) {
        violations.push(rule);
      }
    }

    // 检测"不要触碰/碰"类规则
    if (ruleText.includes('不要碰') || ruleText.includes('不要触碰')) {
      if (lowerAction.includes('碰') || lowerAction.includes('触碰') || lowerAction.includes('摸') || lowerAction.includes('拿起')) {
        violations.push(rule);
      }
    }
  });

  return violations.length > 0 ? violations : null;
}

// 执行规则违反惩罚
function applyRuleViolation(rule) {
  addMessage('horror', '═══ 规则违反 ═══');
  addMessage('horror', '你违反了规则：「' + rule.text + '」');

  if (rule.penalty === 'death') {
    addMessage('horror', '💀 违反即死规则。检测保命道具...');
    
    // 检查是否有保命道具（替身娃娃等）
    var reviveItem = G.permanentItems.find(function(item) {
      return item.name.includes('替身') || item.name.includes('复活') || item.name.includes('回溯');
    });
    
    // 也检查副本道具
    var dungeonRevive = G.dungeonItems ? G.dungeonItems.find(function(item) {
      return item.name.includes('替身') || item.name.includes('复活');
    }) : null;

    if (reviveItem) {
      removePermanentItem(reviveItem.id);
      addMessage('system', '💫 ' + reviveItem.icon + ' ' + reviveItem.name + '替你承受了死亡！道具已消耗。');
      updateHP(Math.max(1, G.hp - 5));
      updateSAN(Math.max(1, G.san - 20));
      addMessage('system', '❤️ HP降至 ' + G.hp + ' | 🧠 SAN降至 ' + G.san);
      showNotification('💫 保命道具生效！', 'clue');
    } else if (dungeonRevive) {
      G.dungeonItems = G.dungeonItems.filter(function(i) { return i !== dungeonRevive; });
      addMessage('system', '💫 ' + dungeonRevive.name + '替你承受了死亡！');
      updateHP(Math.max(1, G.hp - 5));
      updateSAN(Math.max(1, G.san - 20));
      showNotification('💫 保命道具生效！', 'clue');
    } else {
      addMessage('horror', '💀 没有保命道具。你死了。');
      updateHP(0);
      showNotification('💀 违反致死规则', 'horror');
    }
  } else if (rule.penalty === 'hp') {
    updateHP(G.hp + rule.amount);
    addMessage('system', '❤️ HP ' + rule.amount);
    showNotification('⚠️ 违反规则 HP' + rule.amount, 'horror');
  } else if (rule.penalty === 'san') {
    updateSAN(G.san + rule.amount);
    addMessage('system', '🧠 SAN ' + rule.amount);
    showNotification('⚠️ 违反规则 SAN' + rule.amount, 'horror');
  }

  addMessage('horror', '═══════════════');
}

// ============ 集成规则检测到玩家输入处理 ============

var _originalSendPlayerInput = typeof sendPlayerInput === 'function' ? sendPlayerInput : null;

if (_originalSendPlayerInput) {
  var _wrappedSendPlayerInput = sendPlayerInput;
  sendPlayerInput = function() {
    var input = document.getElementById('playerInput');
    if (input && input.value.trim() && G.inDungeon) {
      var text = input.value.trim();
      var violations = checkRuleViolation(text);
      if (violations && violations.length > 0) {
        // 有规则违反，先处理违反再继续
        setTimeout(function() {
          violations.forEach(function(v) {
            applyRuleViolation(v);
          });
        }, 1000);
      }
    }
    _wrappedSendPlayerInput();
  };
}

// ============ 在副本内快捷操作中添加"查看规则"按钮 ============

// 覆盖 generateContextActions，添加规则按钮
var _originalGenerateContextActions = typeof generateContextActions === 'function' ? generateContextActions : null;

if (_originalGenerateContextActions) {
  var _wrappedGenerateContextActions = generateContextActions;
  generateContextActions = function() {
    _wrappedGenerateContextActions();
    
    // 在副本中添加"查看规则"按钮
    if (G.inDungeon && G.currentDungeonRules) {
      var container = document.getElementById('quickActions');
      if (container) {
        var ruleBtn = document.createElement('button');
        ruleBtn.className = 'action-btn';
        ruleBtn.textContent = '📜 规则';
        ruleBtn.style.borderColor = '#5a2020';
        ruleBtn.onclick = function() { showCurrentRules(); };
        container.appendChild(ruleBtn);
      }
    }
  };
}

// ============ 副本结束时清理规则 ============

var _originalShowSettlement2 = typeof showSettlement === 'function' ? showSettlement : null;
if (_originalShowSettlement2) {
  var _wrappedShowSettlement2 = showSettlement;
  showSettlement = function(ending) {
    G.currentDungeonRules = null;
    _wrappedShowSettlement2(ending);
  };
}

console.log('✅ 第十部分加载完成：规则怪谈系统 + 副本开场剧情 + 规则违反检测');
