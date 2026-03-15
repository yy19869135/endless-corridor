DUNGEON_FACTORIES['gen_05'] = function() {
  return {
    id: 'gen_05',
    name: '哀鸣教堂',
    timeLimit: 600,
    startRoom: 'church_entrance',
    intro: '你推开教堂沉重的橡木大门，铰链发出像人类呻吟的声音。教堂内部笼罩在昏暗的烛光中，数百根蜡烛排列在两侧的长椅上，每一根都燃烧着不自然的蓝色火焰。空气中弥漫着焚香和腐烂百合花的气味。祭坛上方的十字架倒挂着，基督像的眼睛被挖空了，空洞的眼眶中渗出暗红色的液体...',
    aiHints: '这是一座被诅咒的教堂「哀鸣教堂」。教堂恐怖主题，普通难度。核心设定：这座教堂的最后一位神父在某次午夜弥撒中进行了一场禁忌仪式，试图打开通往"彼岸"的门。仪式失败了——或者说成功了，但代价是整座教堂被困在了生与死的夹缝中。教堂中的圣像会流泪、管风琴会自己弹奏安魂曲、告解室中有"某物"在等待告解者。关键NPC是一个自称"最后的修女"的苍白女人，她的身体半透明，只在烛光下才能看清。核心谜题围绕"禁忌仪式"和"彼岸之门"展开。保持宗教恐怖氛围，多用拉丁语元素和宗教意象，侧重亵渎感和神圣被扭曲的恐怖。',

    clues: {
      'ch1': { name: '神父的日记', icon: '📔', description: '一本皮革封面的日记，最后几页的字迹越来越潦草："第七次尝试...门开了一条缝...我看到了彼岸...那里不是天堂。那里什么都不是。虚无。纯粹的虚无。而虚无在注视着我。"日记的最后一页只有一行字，用血写的："不要关上门。它已经看到了我们。"', sanCost: 5, foundIn: '神父居所' },
      'ch2': { name: '仪式手稿', icon: '📜', description: '一份用拉丁语书写的仪式手稿，边缘被烧焦。你看不懂大部分内容，但有几个词被反复圈出："Porta（门）""Nihil（虚无）""Sacrificium（祭品）"。手稿背面画着一个复杂的阵法图，中心是一只睁开的眼睛。', sanCost: 8, foundIn: '祭坛' },
      'ch3': { name: '修女的忏悔录', icon: '📿', description: '一本薄薄的忏悔录，字迹清秀但颤抖："我知道神父在做什么。我应该阻止他。但我没有。因为我也想看到彼岸。我也想知道死后的世界是什么样的。现在我知道了。死后的世界就是这里。永远在这里。"最后一行："如果有人读到这个——告解室的第三隔间。那里有出路。但你需要说出真相。"', sanCost: 5, foundIn: '告解室' },
      'ch4': { name: '圣水的秘密', icon: '⛲', description: '你在洗礼池底部发现了一块刻有文字的石板："圣水已被污染。它不再净化罪恶——它封印罪恶。每一滴圣水中都困着一个灵魂。不要喝。不要触碰。如果你已经触碰了——祈祷。"石板边缘刻着日期，是三十年前。', sanCost: 6, foundIn: '洗礼池' },
      'ch5': { name: '管风琴的乐谱', icon: '🎵', description: '一份手写乐谱，曲名是《逆向安魂曲》。普通的安魂曲是为死者祈祷，而这首曲子...如果倒着弹奏，音符组成的旋律会打开"彼岸之门"。乐谱底部写着："正弹关门，倒弹开门。但开门需要祭品。关门需要——真相。"', sanCost: 10, foundIn: '管风琴阁楼' }
    },

    rooms: {
      'church_entrance': {
        name: '教堂大门',
        icon: '⛪',
        mapLabel: '门',
        description: '教堂的入口处。沉重的橡木大门在你身后关闭了，门上的铁环发出沉闷的回响。门厅两侧是圣水池，水面泛着不自然的银色光泽。头顶的彩色玻璃窗描绘着末日审判的场景，但画中的天使表情扭曲，像是在痛苦地尖叫。',
        firstVisitText: '你踏入教堂的瞬间，身后的大门自己合上了。沉重的橡木撞击声在空旷的教堂中回荡了很久。你试着推门——纹丝不动。门上的铁环烫得像被火烧过。看来，唯一的出路在教堂深处。',
        connections: ['nave'],
        directionMap: { north: 'nave' },
        lookDescription: '门厅不大，两侧各有一个石制圣水池。左侧的圣水池水面平静，但你总觉得水面下有什么东西在动。右侧的圣水池是干的，底部有深深的抓痕。',
        listenDescription: '教堂深处传来管风琴的低沉嗡鸣，像是有人按住了最低音的琴键不放。偶尔能听到蜡烛噼啪作响的声音，以及...哭泣声？',
        keywords: {
          '圣水池': '你凑近左侧的圣水池。银色的水面映出你的倒影——但倒影的嘴在动，像是在说什么。你听不到声音。',
          '圣水': { message: '你伸手触碰圣水。水冰冷刺骨，一阵寒意从指尖蔓延到全身。', horror: '你的手指从水中抽出时，指尖变成了苍白色，像是被冻伤了。水面上浮现出一张脸——不是你的脸。它在微笑。', sanChange: -5 },
          '玻璃窗': '你仰头看彩色玻璃窗。末日审判的画面在烛光下闪烁。你注意到画面中有一个细节之前没看到——审判者的位置是空的。没有上帝。只有一把空椅子。',
          '大门': '你再次推门。门纹丝不动。但你注意到门上的铁环在微微震动，像是有什么东西在门外试图进来。'
        },
        events: [
          {
            id: 'entrance_cry',
            trigger: 'firstVisit',
            delay: 4000,
            horror: '一阵微弱的哭泣声从教堂深处传来。不是一个人在哭——是很多人，低沉的、压抑的、像是被捂住嘴巴的哭泣。声音在教堂的穹顶下回荡，形成诡异的和声。',
            sanChange: -3,
            notification: '🧠 SAN -3'
          }
        ]
      },

      'nave': {
        name: '中殿',
        icon: '🕯️',
        mapLabel: '殿',
        description: '教堂的中殿，两排长椅整齐排列，通向远处的祭坛。每张长椅上都点着蓝色的蜡烛，火焰在无风的空气中摇曳。天花板高得看不清，黑暗像浓雾一样聚集在头顶。',
        firstVisitText: '你走进中殿，蓝色烛光在你两侧延伸，像是一条通往祭坛的光之隧道。长椅上空无一人，但每个座位前都放着翻开的圣经。你随手拿起一本——所有页面都是空白的。不，不是空白。字迹在你注视的时候慢慢浮现，然后又消失，像是书在呼吸。',
        connections: ['church_entrance', 'altar', 'confessional', 'bell_tower_base'],
        directionMap: { south: 'church_entrance', north: 'altar', east: 'confessional', west: 'bell_tower_base' },
        lookDescription: '中殿两侧的墙壁上挂着圣徒的画像。每一幅画像的眼睛都被涂黑了。地面是黑白相间的大理石，但某些白色方格上有暗红色的污渍。',
        listenDescription: '管风琴的嗡鸣声更近了。你还能听到蜡烛燃烧的声音——不对，蜡烛不应该发出这种声音。那是低语声。蜡烛在低语。',
        keywords: {
          '圣经': '你翻开一本圣经。文字在页面上浮现又消失。你努力辨认——"他不在这里""门已经打开""虚无在注视"——这些句子反复出现，但每次排列顺序都不同。',
          '蜡烛': { message: '你凑近一根蓝色蜡烛仔细看。火焰不是向上燃烧的——它向下燃烧，像是被倒置了。', horror: '你的手指不小心碰到了火焰。蓝色的火不烫——它是冰冷的。冷到你的骨头都在发痛。蜡烛的蓝光在你的皮肤上留下了一个像烫伤一样的痕迹，但那是冻伤。', sanChange: -4 },
          '画像': '你走近一幅圣徒画像。眼睛被黑色颜料涂掉了。你伸手触碰画面——颜料是湿的。是新涂的。谁在最近涂掉了所有圣徒的眼睛？',
          '长椅': '你在一张长椅上坐下。椅子是冰冷的，像是坐在石头上。你感到旁边有人——但你转头时什么都没有。只有空气中残留的焚香味突然变浓了。'
        },
        specialActions: [
          {
            id: 'take_candle',
            icon: '🕯️',
            label: '拿一根蓝色蜡烛',
            message: '你从长椅上取下一根蓝色蜡烛。冰冷的火焰在你手中摇曳，散发出微弱的光芒。也许在黑暗的地方会有用。',
            addItem: { id: 'blue_candle', name: '蓝色蜡烛', icon: '🕯️', desc: '燃烧着冰冷蓝色火焰的蜡烛，能照亮黑暗但不提供温暖', usable: true, canTakeOut: true },
            removeAfterUse: true
          }
        ],
        events: [
          {
            id: 'nave_organ',
            trigger: 'firstVisit',
            delay: 6000,
            horror: '管风琴突然奏响了一个沉重的和弦。声音震动了整座教堂，蓝色蜡烛的火焰同时剧烈摇晃。和弦持续了整整十秒，然后戛然而止。寂静中，你听到了脚步声——从祭坛方向传来。有但你看不到任何人。',
            sanChange: -5,
            notification: '🧠 SAN -5'
          }
        ]
      },

      'confessional': {
        name: '告解室',
        icon: '🚪',
        mapLabel: '告',
        description: '三个木制告解隔间并排立在墙边。第一个和第二个的门虚掩着，里面空无一人。第三个隔间的门紧闭，门缝中透出微弱的光。',
        firstVisitText: '告解室散发着陈旧的木头和蜡烛油的气味。三个隔间像三具直立的棺材。你注意到第一个隔间的跪垫上有膝盖的压痕——新鲜的，像是刚刚有人跪过。第三个隔间的门上钉着一个小十字架，十字架是倒挂的。',
        connections: ['nave'],
        directionMap: { west: 'nave' },
        actions: {
          '调查': {
            message: '你拉开第二个隔间的门，在座位缝隙中发现了一本薄薄的忏悔录...',
            addClue: 'ch3',
            once: true
          }
        },
        keywords: {
          '第一个隔间': '你走进第一个隔间，跪在跪垫上。隔板另一侧是空的。你等了一会儿——然后隔板另一侧传来呼吸声。缓慢的、沉重的呼吸。但那里不应该有人。',
          '第二个隔间': { message: '你在第二个隔间的座位缝隙中发现了一本忏悔录...', addClue: 'ch3' },
          '第三个隔间': { message: '你尝试打开第三个隔间的门。门是锁着的。但门缝中透出的光变亮了一瞬间，然后又暗下去。', horror: '你把耳朵贴在门上。里面传来一个女人的声音，轻柔得像是在唱摇篮曲："你来了...我等了你很久...进来吧...告诉我你的罪...告诉我你的名字..."', sanChange: -8 },
          '忏悔': { message: '你在第一个隔间跪下，低声说："我来忏悔。"', horror: '隔板另一侧传来一个声音——不是人类的声音，像是很多人同时在说话："我们知道你的罪。我们都知道。你来这里不是为了忏悔。你来这里是为了逃跑。但这里没有出口。只有——门。"', sanChange: -10 }
        },
        specialActions: [
          {
            id: 'open_third',
            icon: '🔑',
            label: '用钥匙打开第三隔间',
            condition: { hasItem: 'crypt_key' },
            message: '你用从地下墓穴找到的钥匙打开了第三个隔间。门缓缓打开——里面坐着一个修女。不，是一个修女的轮廓。她的身体是半透明的，像是用烟雾凝成的。她抬头看你，空洞的眼睛里流出银色的泪水。"你找到了真相吗？"她问。',
            triggerEnding: 'true_ending_church'
          }
        ],
        events: [
          {
            id: 'confessional_whisper',
            trigger: 'firstVisit',
            delay: 4000,
            horror: '你走近告解室时，三个隔间的门同时微微震动了一下。从第三个隔间传来轻柔的歌声——一首你从未听过的赞美诗，但旋律让你的心脏收紧。歌声在你靠近时停了。',
            sanChange: -4,
            notification: '🧠 SAN -4'
          }
        ]
      },

      'altar': {
        name: '祭坛',
        icon: '✝️',
        mapLabel: '坛',
        description: '教堂的祭坛。一张石制祭台上覆盖着暗红色的布，布上放着一个银质圣杯和一本厚重的书。祭坛后方的十字架是倒挂的，基督像的头朝下，空洞的眼眶向下注视着祭台。',
        firstVisitText: '你走近祭坛，脚步声在空旷的教堂中回响。祭台上的银质圣杯中装着暗红色的液体——不是酒。液体表面有微弱的脉动，像是心跳。那本厚重的书翻开着，页面上的文字是你不认识的语言。但有些词你能读懂——因为它们是用血写的。',
        connections: ['nave', 'priest_quarters', 'organ_loft'],
        directionMap: { south: 'nave', east: 'priest_quarters', west: 'organ_loft' },
        actions: {
          '调查': {
            message: '你翻开祭台上那本厚重的书，在夹层中发现了一份仪式手稿...',
            addClue: 'ch2',
            once: true
          }
        },
        keywords: {
          '圣杯': { message: '你端起银质圣杯。里面的液体温热，散发着铁锈和玫瑰混合的气味。', horror: '液体的表面映出你的脸——但倒影的嘴在动。它在说："喝下去。"你放下圣杯，液体溅出几滴落在祭台上，石头表面发出嘶嘶声，像是被腐蚀了。', sanChange: -6 },
          '十字架': '倒挂的十字架上，基督像的空眼眶中不断渗出暗红色液体，滴落在祭台上。你仔细看——液体不是从眼眶流出的。它是从虚空中凭空出现的，像是空间本身在流血。',
          '仪式手稿': { message: '你翻开那本厚重的书，在夹层中发现了一份仪式手稿...', addClue: 'ch2' },
          '祭台': '石制祭台上有刻痕。你用手指描摹——那是一个阵法图案，和仪式手稿上的一模一样。阵法中心有一个凹槽，形状像一只眼睛。'
        },
        specialActions: [
          {
            id: 'place_eye',
            icon: '👁️',
            label: '将石眼放入凹槽',
            condition: { hasItem: 'stone_eye' },
            message: '你将从地下墓穴找到的石眼放入祭台的凹槽。完美契合。祭台开始震动，阵法图案发出暗红色的光。地面裂开一条缝——通往地下墓穴的阶梯显现了！',
            unlockRoom: 'crypt',
            removeAfterUse: true
          }
        ],
        events: [
          {
            id: 'altar_blood',
            trigger: 'firstVisit',
            delay: 5000,
            horror: '十字架上的基督像突然动了——它的头缓缓抬起，空洞的眼眶直视着你。一滴暗红色的液体从它的嘴角流下。然后它又恢复了原来的姿势，像是从未动过。但你确定它动了。你非常确定。',
            sanChange: -7,
            notification: '⚠️ 它在看你！SAN -7'
          }
        ]
      },

      'priest_quarters': {
        name: '神父居所',
        icon: '🛏️',
        mapLabel: '居',
        description: '一间简朴的房间，一张窄床、一张书桌、一个衣柜。书桌上堆满了书籍和文件，一盏油灯还在燃烧。床铺整齐，像是主人只是暂时离开了。',
        firstVisitText: '你推开神父居所的门。房间出奇地温暖——和教堂其他地方的阴冷完全不同。书桌上的油灯还亮着，火焰是正常的橙色，不是外面的蓝色。桌上摊开着一本日记，旁边是一杯已经凉透的茶。一切都像是主人刚刚离开。但灰尘的厚度告诉你，没有人碰过这些东西至少三十年了。',
        connections: ['altar'],
        directionMap: { west: 'altar' },
        actions: {
          '调查': {
            message: '你翻开书桌上的日记，最后几页的内容让你不寒而栗...',
            addClue: 'ch1',
            once: true
          }
        },
        keywords: {
          '日记': { message: '你阅读神父的日记...字迹越来越潦草，最后变成了血写的文字。', addClue: 'ch1' },
          '书桌': '书桌上除了日记，还有一叠信件。都是写给主教的求助信，但没有一封被寄出。每封信都以同一句话结尾："门已经打开了。我关不上它。"',
          '衣柜': { message: '你打开衣柜。里面挂着神父的法衣——黑色长袍和白色领带。', horror: '你拿起法衣时，它突然变得沉重无比，像是被水浸透了。你低头看——法衣在滴血。不是旧的血迹，是新鲜的、温热的血。你松手，法衣落在地上。血迹消失了，法衣恢复了正常的重量。', sanChange: -6 },
          '床': '床铺整齐得不自然。你掀开被子——床垫上有一个人形的凹痕，像是有人在这里躺了很久很久。凹痕的位置，手是交叉放在胸前的。像是棺材里的姿势。'
        },
        specialActions: [
          {
            id: 'take_crucifix',
            icon: '✝️',
            label: '拿走银十字架',
            message: '你从书桌抽屉里找到一个小巧的银十字架。它在你手中微微发热，散发出微弱的白色光芒。也许这能保护你。',
            addItem: { id: 'silver_cross', name: '银十字架', icon: '✝️', desc: '神父的银十字架，握着它时能感到微弱的温暖。对某些存在可能有威慑力', usable: true, canTakeOut: true },
            removeAfterUse: true
          }
        ],
        events: [
          {
            id: 'priest_ghost',
            trigger: 'enter',
            condition: { clueCount: 3 },
            delay: 5000,
            horror: '油灯的火焰突然变成了蓝色。你感到身后有人。缓缓回头——一个穿着黑色法衣的身影站在角落里。他的脸被阴影遮住，但你能看到他的嘴在动。他在反复说着同一句话。你听不到声音，但你能读出他的唇语："关上门...关上门...关上门..."',
            sanChange: -8,
            notification: '⚠️ 神父的残影！SAN -8'
          }
        ]
      },

      'organ_loft': {
        name: '管风琴阁楼',
        icon: '🎹',
        mapLabel: '琴',
        description: '狭窄的楼梯通向管风琴所在的阁楼。巨大的管风琴占据了整面墙壁，数百根铜管像器官一样排列。琴键上覆盖着一层薄灰，但有几个键是干净的。',
        firstVisitText: '你爬上吱呀作响的楼梯来到阁楼。管风琴近看比远看更加庞大，铜管从地面延伸到天花板。你注意到琴键上大部分覆盖着灰尘，但Do-Re-Mi三个键是干净的——像是最近有人弹过。谱架上放着一份手写乐谱，标题是《逆向安魂曲》。',
        connections: ['altar'],
        directionMap: { east: 'altar' },
        actions: {
          '调查': {
            message: '你拿起谱架上的乐谱仔细研究。这首曲子如果倒着弹奏...',
            addClue: 'ch5',
            once: true
          }
        },
        keywords: {
          '乐谱': { message: '你研究《逆向安魂曲》的乐谱...', addClue: 'ch5' },
          '管风琴': '你按下一个琴键。低沉的音符在教堂中回荡，震得你的胸腔发麻。你注意到——当音符响起时，教堂中的蓝色蜡烛火焰同时跳动了一下。',
          '弹奏': { message: '你坐在琴凳上，试着弹奏几个音符。', horror: '当你弹出一段旋律时，管风琴的铜管中传出了回应——不是你弹的音符的回声，而是一段完全不同的旋律。像是有人在管子里面弹奏。旋律悲伤而诡异，像是一首倒放的赞美诗。', sanChange: -5 },
          '铜管': '你凑近一根铜管，向里面看。管子深处有什么东西在反光。你把手伸进去——摸到了一个冰冷的圆形物体。你把它掏出来：一只石头雕刻的眼睛。'
        },
        specialActions: [
          {
            id: 'find_stone_eye',
            icon: '👁️',
            label: '从铜管中取出石眼',
            message: '你从管风琴的铜管深处取出一只石头雕刻的眼睛。它冰冷沉重，瞳孔部分是一颗暗红色的宝石。当你握住它时，你短暂地看到了教堂的另一个版本——一个充满光明的、没有被诅咒的教堂。然后幻象消失了。',
            addItem: { id: 'stone_eye', name: '石之眼', icon: '👁️', desc: '从管风琴铜管中找到的石头眼睛，瞳孔是暗红色宝石。握着它时能短暂看到"另一个教堂"', usable: true, canTakeOut: false },
            removeAfterUse: true
          },
          {
            id: 'play_reverse',
            icon: '🎵',
            label: '倒弹安魂曲',
            condition: { hasClue: 'ch5' },
            message: '你按照乐谱，将《逆向安魂曲》倒着弹奏。每一个音符都像是在撕裂空间。教堂开始震动，蓝色蜡烛全部熄灭。在完全的黑暗中，你看到了——祭坛方向出现了一扇发光的门。彼岸之门。',
            sanChange: -10
          }
        ],
        events: [
          {
            id: 'organ_autoplay',
            trigger: 'firstVisit',
            delay: 4000,
            horror: '你刚走近管风琴，它就自己弹奏起来。低沉的和弦充满整个阁楼，琴键在没有人触碰的情况下自己按下又弹起。你看到脚踏板也在自己移动——像是有一个看不见的人坐在那里演奏。曲子弹了三十秒后突然停止。琴凳上出现了一个凹陷，像是刚刚有人坐过。',
            sanChange: -6,
            notification: '🧠 SAN -6'
          }
        ]
      },

      'bell_tower_base': {
        name: '钟楼底层',
        icon: '🔔',
        mapLabel: '钟',
        description: '钟楼的底层是一个圆形的石室。中央是洗礼池，池中的水呈现不自然的银色。螺旋楼梯通向上方，但楼梯在第三层就断了。墙壁上刻满了名字。',
        firstVisitText: '你走进钟楼底层。圆形石室的墙壁上密密麻麻地刻满了名字——几百个，也许上千个。你认出了一些：它们是人名。每个名字旁边都刻着一个日期。最早的日期是一百多年前，最近的...是今天。最近的那个名字旁边还没有刻日期，只有一个空白的横线。',
        connections: ['nave'],
        directionMap: { east: 'nave' },
        actions: {
          '调查': {
            message: '你蹲在洗礼池边，在池底发现了一块刻有文字的石板...',
            addClue: 'ch4',
            once: true
          }
        },
        keywords: {
          '名字': '你仔细看墙上的名字。有些名字被划掉了，有些名字旁边画着十字。最近的那个名字——你凑近看，心脏猛地一沉。那是你的名字。',
          '洗礼池': { message: '你看向洗礼池中银色的水面。水面下似乎有什么东西在移动...', addClue: 'ch4' },
          '楼梯': '你沿着螺旋楼梯往上爬。第一层、第二层...到第三层时，楼梯断了。前方是一个黑洞洞的缺口，下面是深不见底的黑暗。但你听到了钟声——从上方传来，微弱但清晰。',
          '银水': { message: '你伸手触碰银色的水面。', horror: '你的手指刚碰到水面，水中伸出一只苍白的手抓住了你的手腕！你拼命挣脱——手从水中抽出时，手腕上留下了五个指印。银色的水面恢复了平静，像什么都没发生过。', sanChange: -8, hpChange: -1 }
        },
        events: [
          {
            id: 'bell_ring',
            trigger: 'firstVisit',
            delay: 5000,
            horror: '头顶传来一声钟响。沉重的、悠远的钟声在石室中回荡。一声。两声。三声...你开始数。钟声在第十二下时停了。然后——第十三下。钟楼不应该敲十三下。第十三声钟响时，洗礼池中的银色水面开始沸腾。',
            sanChange: -6,
            notification: '⚠️ 十三声钟响！SAN -6'
          }
        ]
      },

      'crypt': {
        name: '地下墓穴',
        icon: '💀',
        mapLabel: '墓',
        locked: true,
        lockHint: '需要在祭坛找到开启方法',
        description: '阴暗潮湿的地下墓穴。两侧墙壁上嵌着一排排石棺，大部分已经封死。走廊尽头有一扇铁门，门上挂着一把锈迹斑斑的锁。空气中弥漫着泥土和某种甜腻的腐败气味。',
        firstVisitText: '你沿着祭坛下方的阶梯走入地下。空气变得潮湿而沉重。墓穴比你想象的要大——走廊向两侧延伸，消失在黑暗中。石棺整齐地排列在墙壁的凹龛中，每一具上面都刻着名字和日期。你注意到——这些名字和钟楼墙壁上的名字一模一样。',
        connections: ['altar'],
        directionMap: { south: 'altar' },
        keywords: {
          '石棺': '大部分石棺是封死的。但你发现有一具石棺的盖子是松动的——上面刻着最近的日期。你犹豫了一下，推开盖子。里面是空的。但石棺底部有一把钥匙。',
          '铁门': '走廊尽头的铁门上挂着锁。门缝中透出微弱的白光。你贴近门缝——光是温暖的，和教堂中冰冷的蓝光完全不同。门后面是什么？',
          '墙壁': '墙壁上有刮痕。不是装饰——是指甲刮出来的。有人曾经试图从这里挖出去。刮痕在某个位置停了下来，旁边用血写着一个词："Veritas"（真相）。',
          '空气': '甜腻的气味越来越浓。你意识到那不是腐败的气味——是焚香。和教堂上方一样的焚香。有人在地下墓穴中点过香。'
        },
        specialActions: [
          {
            id: 'take_crypt_key',
            icon: '🔑',
            label: '从石棺中取出钥匙',
            message: '你从空石棺底部取出一把古旧的铁钥匙。钥匙冰冷沉重，上面刻着一个十字架图案。这把钥匙...也许能打开告解室第三隔间的门。',
            addItem: { id: 'crypt_key', name: '墓穴钥匙', icon: '🔑', desc: '从地下墓穴的空石棺中找到的铁钥匙，上面刻着十字架', usable: false, canTakeOut: false },
            removeAfterUse: true
          },
          {
            id: 'speak_truth',
            icon: '💬',
            label: '对着铁门说"Veritas"',
            condition: { hasClue: 'ch5' },
            message: '你站在铁门前，深吸一口气，说出那个词："Veritas。"铁门上的锁自己弹开了。门缓缓打开，温暖的白光涌入墓穴。门后是一条向上的阶梯，通向...外面？你看到了阳光。真正的阳光。',
            triggerEnding: 'true_ending_church'
          }
        ],
        events: [
          {
            id: 'crypt_coffin',
            trigger: 'firstVisit',
            delay: 4000,
            horror: '你走过一排石棺时，其中一具发出了声响。不是从外面——是从里面。缓慢的、有节奏的敲击声。一下。两下。三下。然后停了。你屏住呼吸等了很久。然后——石棺盖上出现了一条裂缝，从里面。',
            sanChange: -8,
            notification: '💀 有东西在棺材里！SAN -8'
          }
        ]
      }
    },

    mapLayout: {
      'church_entrance': { x: 80, y: 120 },
      'nave':            { x: 80, y: 60 },
      'confessional':    { x: 150, y: 60 },
      'altar':           { x: 80, y: 0 },
      'priest_quarters': { x: 150, y: 0 },
      'organ_loft':      { x: 10, y: 0 },
      'bell_tower_base': { x: 10, y: 60 },
      'crypt':           { x: 80, y: -60 }
    },

    mapPaths: [
      { x: 93, y: 78, w: 2, h: 42, dir: 'v' },
      { x: 93, y: 18, w: 2, h: 42, dir: 'v' },
      { x: 105, y: 68, w: 45, h: 2, dir: 'h' },
      { x: 105, y: 8, w: 45, h: 2, dir: 'h' },
      { x: 35, y: 8, w: 45, h: 2, dir: 'h' },
      { x: 35, y: 68, w: 45, h: 2, dir: 'h' },
      { x: 93, y: -42, w: 2, h: 42, dir: 'v' }
    ],

    itemEffects: {
      'blue_candle': {
        message: '蓝色蜡烛的冰冷火焰照亮了周围。在蓝光中，你看到了平时看不到的东西——墙壁上浮现出隐藏的文字和符号。',
        consume: false
      },
      'silver_cross': {
        message: '你举起银十字架。它发出微弱的白色光芒，周围的阴冷气息暂时退却了。',
        sanChange: 5,
        consume: false
      },
      'stone_eye': {
        roomRequired: 'altar',
        message: '你将石之眼放入祭台中央的凹槽。地面开始震动...',
        unlockRoom: 'crypt',
        consume: true
      },
      'crypt_key': {
        roomRequired: 'confessional',
        message: '你用钥匙打开了告解室第三隔间的门...',
        triggerEnding: 'true_ending_church',
        consume: true
      }
    },

    endings: [
      {
        id: 'true_ending_church',
        title: '✝️ 真相之光',
        text: '当你说出"Veritas"的那一刻，整座教堂开始震动。蓝色蜡烛全部熄灭，取而代之的是温暖的金色阳光从彩色玻璃窗中涌入。倒挂的十字架翻转过来，基督像的眼睛重新出现——它在微笑。\n\n修女的半透明身影出现在你身旁。她的身体开始变得清晰，变得真实。"你做到了，"她说，泪水从她的脸上滑落，但这次是真正的泪水。"三十年了...终于有人说出了真相。"\n\n教堂大门自己打开了。门外是真正的阳光，真正的世界。你回头看了一眼——教堂恢复了它本来的样子。圣洁、庄严、安宁。墙上那些名字一个接一个地消失，灵魂终于得到了安息。\n\n你走出教堂时，手中的银十字架变得温暖。你回到了苍白回廊。',
        rating: 'S',
        fragmentReward: 120,
        requirements: {
          clues: ['ch1', 'ch5'],
          room: 'crypt'
        },
        bonusItems: [
          { id: 'holy_candle', name: '净化蜡烛', icon: '🕯️', desc: '来自哀鸣教堂的圣物。在副本中使用可驱散一次低级诅咒，恢复10SAN。' },
          { id: 'truth_fragment', name: '真相碎片', icon: '💠', desc: '蕴含深层真相的结晶' }
        ]
      },
      {
        id: 'nun_ending',
        title: '📿 修女的安息',
        text: '你用钥匙打开了告解室第三隔间。修女的灵魂终于得到了倾听。她告诉了你一切——神父的疯狂、仪式的真相、被困灵魂的痛苦。当她说完最后一个字，她的身体化为银色的光点，飘散在空气中。教堂的诅咒减弱了，但没有完全解除。你找到了一条裂缝，从教堂中逃了出来。',
        rating: 'A',
        fragmentReward: 80,
        requirements: {
          clues: ['ch3'],
          items: ['crypt_key']
        }
      },
      {
        id: 'escape_church',
        title: '🌫️ 仓皇逃离',
        text: '你没能找到全部真相，但在教堂的诅咒完全吞噬你之前，你发现了地下墓穴中的一条裂缝。你挤过狭窄的石缝，指甲断裂，皮肤被划破。当你终于看到外面的光时，你几乎哭了出来。身后的裂缝在你通过后合拢了。教堂的钟声在你身后响起——第十三声。',
        rating: 'C',
        fragmentReward: 40,
        requirements: {
          minClueCount: 2
        }
      },
      {
        id: 'absorbed_ending',
        title: '💀 永恒的信徒',
        text: '你在教堂中迷失了太久。蓝色蜡烛的冰冷火焰一根接一根地熄灭，黑暗从四面八方涌来。你跪在祭坛前，不知道是在祈祷还是在求饶。最后你看到的是修女的脸——她在哭。"又一个..."她低声说。你的名字出现在了钟楼的墙壁上。日期是今天。',
        rating: 'D',
        fragmentReward: 20,
        isDeath: true,
        requirements: {}
      }
    ]
  };
};

// 哀鸣教堂规则覆盖（使用手工规则替代自动生成的）
DUNGEON_RULES['gen_05'] = {
  title: '⛪ 哀鸣教堂 — 告解指引',
  subtitle: '「愿主保佑读到此文的灵魂。以下是最后一位神父留下的警告。」',
  rules: [
    { id: 'c1', text: '不要在午夜凝视倒挂的十字架超过3秒。它会注意到你。', type: 'must', penalty: 'san', amount: -15 },
    { id: 'c2', text: '告解室第三个隔间的门是锁着的。在找到钥匙之前不要尝试打开。里面的东西会回应你。', type: 'warning', penalty: 'san', amount: -10 },
    { id: 'c3', text: '如果管风琴自己弹奏起来，不要试图阻止。跟着旋律轻声哼唱。停下就危险了。', type: 'must', penalty: 'hp', amount: -4 },
    { id: 'c4', text: '圣水已被污染。不要触碰，不要饮用。如果你已经触碰了——祈祷。', type: 'must', penalty: 'hp', amount: -3 },
    { id: 'c5', text: '钟楼如果敲了十三下，立刻找到最近的壁龛躲进去。第十三声钟响时，"它们"会出来。', type: 'timed', penalty: 'hp', amount: -5 },
    { id: 'c6', text: '地下墓穴的第三具石棺是空的。它在等一个人。不要让那个人是你。', type: 'must', penalty: 'death', amount: 0 },
    { id: 'c7', text: '说出真相可以打开最后的门。但真相不是你以为的那个。', type: 'hint' }
  ],
  openingScript: {
    scene: '教堂的大门在你推开的瞬间发出了一声像叹息的声音。\n\n里面比外面更暗。唯一的光源是祭坛上的蜡烛——数百根蜡烛整齐地排列着，火焰全部是蓝色的，向同一个方向倾斜。但教堂里没有风。\n\n长椅上空无一人。但你注意到每个座位上都放着一本翻开的圣经，翻到的都是同一页——而那一页是空白的。\n\n你的系统手机震动：「副本：哀鸣教堂。存活条件：找到出口。时限：10分钟。」\n\n管风琴突然响了。没有人在弹。低沉的和弦像心跳一样，一下又一下。\n\n然后你听到了哭泣声。不是一个人。是很多人。从教堂的每一个角落传来。\n\n你要怎么做？',
    freeInput: true
  }
};

// 哀鸣教堂规则事件
RULE_EVENTS['gen_05'] = [
  {
    id: 'church_rule_organ',
    ruleIndex: 3,
    triggerRoom: 'organ_loft',
    triggerType: 'enterRoom',
    triggerCondition: function() { return !G._ruleEventTriggered['church_rule_organ']; },
    delay: 6000,
    popup: {
      title: '🎹 管风琴自动弹奏',
      description: '管风琴突然自己弹奏起来！低沉的旋律充满整个阁楼，琴键在没有人触碰的情况下自己按下又弹起。\n\n⚠️ 校规第3条：\n「如果管风琴自己弹奏起来，不要试图阻止。跟着旋律轻声哼唱。停下就危险了。」',
      timeLimit: 10,
      choices: [
        {
          icon: '🎵',
          label: '跟着旋律哼唱',
          message: '你跟着管风琴的旋律轻声哼唱。虽然你不认识这首曲子，但旋律似乎自然而然地从你嘴里流出。当你唱到最后一个音符时，管风琴停了下来。琴凳上出现了一张纸条："你通过了考验。"',
          sanChange: -3,
          hpChange: 0
        },
        {
          icon: '🔇',
          label: '强行按住琴键阻止',
          message: '你冲过去按住琴键——但琴键的力量大得惊人！它们像是活的，疯狂地跳动。你的手指被夹在琴键之间，剧痛传来。管风琴发出刺耳的不和谐音，铜管中喷出冰冷的气流。',
          sanChange: -12,
          hpChange: -3,
          horror: true
        },
        {
          icon: '🏃',
          label: '立刻跑下楼梯',
          message: '你转身冲下楼梯。身后管风琴的声音越来越响，越来越快，像是在追赶你。你跑到中殿时声音才停下来。你回头看——阁楼的楼梯口站着一个黑色的人影。然后它消失了。',
          sanChange: -5,
          hpChange: 0,
          moveToRoom: 'nave'
        }
      ]
    }
  },
  {
    id: 'church_rule_bell',
    ruleIndex: 5,
    triggerRoom: 'bell_tower_base',
    triggerType: 'enterRoom',
    triggerCondition: function() { return !G._ruleEventTriggered['church_rule_bell'] && G.cluesFound.length >= 2; },
    delay: 5000,
    popup: {
      title: '🔔 第十三声钟响',
      description: '钟楼突然开始敲钟！沉重的钟声震动了整座教堂。\n\n一...二...三...你开始数。\n\n...十一...十二...\n\n钟声停了。然后——第十三声！\n\n⚠️ 规则第5条：「钟楼如果敲了十三下，立刻找到最近的壁龛躲进去。」\n\n墙壁上的壁龛就在你旁边！',
      timeLimit: 8,
      choices: [
        {
          icon: '🧱',
          label: '立刻躲进壁龛',
          message: '你一头钻进墙壁上的壁龛，蜷缩在石头凹槽中。第十三声钟响的余波在空气中回荡。你听到脚步声——多脚步声——从楼梯上方传来。它们经过你的壁龛时停了一下...然后继续走了。你在壁龛中等了整整一分钟才敢出来。',
          sanChange: -5,
          hpChange: 0
        },
        {
          icon: '👀',
          label: '留在原地看看会发生什么',
          message: '第十三声钟响后，洗礼池中的银色水面开始沸腾。从水面下伸出了无数只苍白的手——它们抓住了你的脚踝！你拼命挣扎，终于挣脱了。但你的鞋子被拖入了水中。',
          sanChange: -15,
          hpChange: -4,
          horror: true
        }
      ]
    }
  },
  {
    id: 'church_rule_water',
    ruleIndex: 4,
    triggerRoom: 'church_entrance',
    triggerType: 'enterRoom',
    triggerCondition: function() { return !G._ruleEventTriggered['church_rule_water'] && G._roomVisitCount && G._roomVisitCount['church_entrance'] >= 2; },
    delay: 3000,
    popup: {
      title: '⛲ 圣水的诱惑',
      description: '你再次经过门厅的圣水池。银色的水面在蓝色烛光下闪烁，散发出一种令人平静的光芒。你的嘴唇干裂，喉咙发紧。\n\n水面上浮现出文字："饮下我，你将看到真相。"\n\n⚠️ 规则第4条：「圣水已被污染。不要触碰，不要饮用。」',
      choices: [
        {
          icon: '💧',
          label: '喝一口圣水',
          message: '你捧起一捧银色的水送到嘴边。水冰冷刺骨，带着金属的味道。瞬间，你的视野变了——你看到了教堂的"真实"面目。墙壁是肉做的，在缓慢蠕动。天花板上倒挂着无数个人形，他们都在无声地尖叫。然后幻象消失了，你跪在地上干呕。',
          sanChange: -20,
          hpChange: -2,
          horror: true
        },
        {
          icon: '🚫',
          label: '遵守规则，不碰圣水',
          message: '你后退一步，远离圣水池。水面上的文字消失了，取而代之的是另一行字："明智的选择。"然后水面恢复了平静。',
          sanChange: -2,
          hpChange: 0
        },
        {
          icon: '✝️',
          label: '用银十字架净化圣水',
          message: '你将银十字架浸入圣水中。水面剧烈翻腾，发出嘶嘶声。银色的水逐渐变得清澈透明——真正的圣水。一个微弱的声音在你耳边说："谢谢你...解放了我们..."水中浮起了一个小小的水晶瓶。',
          sanChange: 3,
          hpChange: 0,
          requireItem: 'silver_cross',
          addItem: { id: 'pure_water', name: '净化圣水', icon: '💧', desc: '被银十字架净化的真正圣水。使用后恢复15SAN', usable: true, canTakeOut: true }
        }
      ]
    }
  }
];

// 哀鸣教堂攻略提示
DUNGEON_HINTS['gen_05'] = [
  { step: '第一步：教堂大门', content: '从大门向北进入中殿。可以拿一根蓝色蜡烛（可带出副本）。注意不要碰圣水池。' },
  { step: '第二步：中殿探索', content: '中殿连接四个方向：北→祭坛，东→告解室，西→钟楼底层。先去各处收集线索。' },
  { step: '第三步：告解室', content: '调查第二个隔间获得「修女的忏悔录」。第三隔间需要钥匙，暂时打不开。' },
  { step: '第四步：祭坛→神父居所', content: '在祭坛调查获得「仪式手稿」。向东进入神父居所，调查日记获得「神父的日记」。可以拿银十字架（可带出副本）。' },
  { step: '第五步：管风琴阁楼', content: '从祭坛向西进入管风琴阁楼。调查乐谱获得「管风琴的乐谱」。用特殊按钮从铜管中取出「石之眼」。' },
  { step: '第六步：钟楼底层', content: '从中殿向西进入钟楼底层。调查洗礼池获得「圣水的秘密」。注意十三声钟响事件。' },
  { step: '第七步：打开地下墓穴', content: '回到祭坛，用「石之眼」放入祭台凹槽，解锁地下墓穴入口。' },
  { step: '最终步：结局', content: '在地下墓穴中：①从空石棺取钥匙→回告解室开第三隔间→A级结局80碎片。②收集仪式手稿+乐谱→对铁门说"Veritas"→S级结局120碎片。③收集2条线索以上→C级逃脱40碎片。' }
];
