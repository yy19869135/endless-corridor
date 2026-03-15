DUNGEON_FACTORIES['train'] = function() {
  return {
    id: 'train',
    name: '末班列车',
    timeLimit: 480,
    startRoom: 'car_1',
    intro: '你在一列行驶中的列车上醒来。窗外是无尽的黑暗，车厢里空无一人。广播中传来机械般的声音："欢迎乘坐末班列车。本次列车不设终点站。请各位乘客...享受旅程。"',
    aiHints: '这是一列永远不会到站的幽灵列车。每节车厢都有不同的主题和恐怖元素。列车长是关键NPC，他知道停车的方法。',

    clues: {
      't1': { name: '车票', icon: '🎫', description: '一张没有目的地的车票。背面写着："只有找到列车长，才能下车。"', sanCost: 3, foundIn: '1号车厢' },
      't2': { name: '乘客名单', icon: '📋', description: '名单上的名字都被划掉了，只剩最后一个——你的名字。', sanCost: 8, foundIn: '2号车厢' },
      't3': { name: '列车日志', icon: '📓', description: '"第10000次循环...没有人能到达最后一节车厢...除非..."', sanCost: 10, foundIn: '3号车厢' },
      't4': { name: '紧急制动密码', icon: '🔢', description: '紧急制动器的密码：每节车厢号码之和。1+2+3+4+5+6+7=28。', sanCost: 5, foundIn: '4号车厢' },
      't5': { name: '列车长的信', icon: '✉️', description: '"我也是乘客...我只是比你们早上车了一万年..."', sanCost: 15, foundIn: '驾驶室' }
    },

    rooms: {
      'car_1': {
        name: '1号车厢 - 普通车厢',
        icon: '🚃',
        mapLabel: '1',
        description: '看起来普通的车厢，座椅上散落着报纸和杂志。但所有报纸的日期都是同一天。',
        firstVisitText: '你在一个普通的车厢座位上醒来。头很痛，记忆模糊。车厢里空无一人，但座椅上还残留着体温。窗外一片漆黑，什么也看不到...',
        connections: ['car_2'],
        directionMap: { north: 'car_2' },
        actions: {
          '调查': {
            message: '你在座位缝隙中发现了一张车票...',
            addClue: 't1',
            once: true
          }
        },
        keywords: {
          '报纸': '所有报纸的日期都是1999年12月31日。头条写着："末班列车今夜发车"。',
          '车票': { message: '你检查车票...', addClue: 't1' },
          '窗外': { message: '你贴近窗户向外看...', horror: '黑暗中，一张苍白的脸突然贴上了窗户外侧，与你四目相对。', sanChange: -8 }
        }
      },

      'car_2': {
        name: '2号车厢 - 餐车',
        icon: '🍽️',
        mapLabel: '2',
        description: '餐车的桌上摆满了精致的餐具，但食物已经腐烂。空气中弥漫着甜腻的腐败气息。',
        firstVisitText: '你推开车厢连接处的门，走进餐车。桌上的蜡烛还在燃烧，餐盘里的食物看起来曾经很精致...但现在已经长满了霉菌。吧台后面有一份乘客名单。',
        connections: ['car_1', 'car_3'],
        directionMap: { south: 'car_1', north: 'car_3' },
        actions: {
          '调查': {
            message: '你查看吧台后面的乘客名单...',
            addClue: 't2',
            once: true
          }
        },
        keywords: {
          '名单': { message: '乘客名单上的名字都被划掉了...', addClue: 't2' },
          '食物': { message: '你凑近观察那些腐烂的食物...', horror: '食物突然开始蠕动，像是有什么东西在里面。你连忙后退。', sanChange: -5 },
          '蜡烛': '蜡烛的火焰是绿色的。你试着吹灭它，但火焰纹丝不动。'
        },
        events: [
          {
            id: 'car2_waiter',
            trigger: 'firstVisit',
            delay: 4000,
            horror: '你听到身后传来脚步声。回头一看，一个穿着侍者制服的身影站在车厢另一端。他的脸...是模糊的，像是被橡皮擦擦过一样。他向你鞠了一躬，然后消失了。',
            sanChange: -7,
            notification: '🧠 SAN -7'
          }
        ]
      },

      'car_3': {
        name: '3号车厢 - 卧铺车厢',
        icon: '🛏️',
        mapLabel: '3',
        description: '卧铺车厢的帘子都拉着。有些铺位上似乎有人形的隆起，但你不确定那是不是真的有人。',
        firstVisitText: '卧铺车厢很安静，安静得不正常。每个铺位的帘子都拉得严严实实。你注意到其中一个铺位的帘子缝隙中，有一只手垂了下来...那只手是灰色的。',
        connections: ['car_2', 'car_4'],
        directionMap: { south: 'car_2', north: 'car_4' },
        actions: {
          '调查': {
            message: '你在列车员的小隔间里发现了一本日志...',
            addClue: 't3',
            once: true
          }
        },
        keywords: {
          '帘子': { message: '你鼓起勇气拉开一个帘子...', horror: '铺位上躺着一个人。不，不是人——是一个用报纸和衣服堆成的人形。但它的"头"缓缓转向了你。', sanChange: -10 },
          '日志': { message: '列车日志记录着令人不安的内容...', addClue: 't3' },
          '手': '你小心翼翼地碰了一下那只灰色的手。它是冰冷的...然后它突然抓住了你的手腕。你拼命甩开，那只手又垂了下去，一动不动。'
        },
        events: [
          {
            id: 'car3_whisper',
            trigger: 'firstVisit',
            delay: 3000,
            horror: '从某个铺位后面传来细微的低语声："...不要...继续...前进..."',
            sanChange: -5
          }
        ]
      },

      'car_4': {
        name: '4号车厢 - 行李车厢',
        icon: '📦',
        mapLabel: '4',
        description: '堆满了各种行李箱和包裹的车厢。有些箱子在微微颤动，像是里面有什么活物。',
        firstVisitText: '行李车厢里堆满了大大小小的箱子。空气中有一股奇怪的甜味。你注意到墙上有人用粉笔写了一些数字和公式...',
        connections: ['car_3', 'car_5'],
        directionMap: { south: 'car_3', north: 'car_5' },
        actions: {
          '调查': {
            message: '你研究墙上的数字...这似乎是紧急制动器的密码提示。',
            addClue: 't4',
            once: true
          }
        },
        keywords: {
          '数字': { message: '墙上写着：1+2+3+4+5+6+7=?', addClue: 't4' },
          '箱子': { message: '你打开一个颤动的箱子...', horror: '箱子里是空的。但当你关上盖子时，你听到里面传来了敲击声。', sanChange: -6 },
          '包裹': '大部分包裹上都没有收件人地址。只有一个包裹上写着你的名字。里面是一面小镜子。',
          '镜子': {
            message: '你拿起那面小镜子。也许会有用。',
            addItem: { id: 'small_mirror', name: '小镜子', icon: '🪞', desc: '一面普通的小镜子...真的普通吗？', usable: true, canTakeOut: false }
          }
        },
        events: [
          {
            id: 'car4_sound',
            trigger: 'enter',
            condition: { clueCount: 2 },
            horror: '所有箱子同时开始剧烈颤动。然后突然停止。寂静中，你听到了一个孩子的笑声。',
            sanChange: -8,
            notification: '⚠️ 异常现象！'
          }
        ]
      },

      'car_5': {
        name: '5号车厢 - 空车厢',
        icon: '🚃',
        mapLabel: '5',
        description: '这节车厢完全是空的。没有座椅，没有行李，什么都没有。只有四面光滑的金属墙壁和一扇通往下一节车厢的门。',
        firstVisitText: '你走进一节完全空旷的车厢。脚步声在金属地板上回响。这里什么都没有...但你感到一种强烈的被注视感。天花板上的灯管发出刺眼的白光。',
        connections: ['car_4', 'car_6'],
        directionMap: { south: 'car_4', north: 'car_6' },
        lookDescription: '空荡荡的车厢。墙壁上有一些细微的划痕，像是有人用指甲刮出来的。',
        listenDescription: '你屏住呼吸...能听到列车行驶的轰鸣声，还有...你自己的心跳声。异常地快。',
        keywords: {
          '划痕': { message: '你仔细辨认墙上的划痕...那是文字："回头看"。', horror: '你下意识地回头——身后空无一人。但当你转回来时，面前的墙上多了一行字："太慢了"。', sanChange: -12 },
          '灯': '灯管的光芒太亮了，让你的眼睛很不舒服。你注意到灯管在以一种规律的频率闪烁...像是摩尔斯电码。'
        },
        events: [
          {
            id: 'car5_trap',
            trigger: 'firstVisit',
            delay: 5000,
            horror: '灯突然全部熄灭。在完全的黑暗中，你感到有什么东西从你头顶掠过。然后灯重新亮起——你发现自己站的位置和刚才不一样了。',
            sanChange: -10,
            notification: '⚠️ 空间异常！SAN -10'
          }
        ]
      },

      'car_6': {
        name: '6号车厢 - 列车长室',
        icon: '🎩',
        mapLabel: '6',
        locked: true,
        lockHint: '门上有一个密码锁，需要输入正确的数字',
        description: '列车长的私人车厢。布置得很温馨，有一张小桌、一把椅子和一个书架。桌上放着一封信。',
        firstVisitText: '你输入密码28，门锁咔嗒一声打开了。列车长的车厢出乎意料地温馨。桌上的茶杯里还有温热的茶。椅子上搭着一件列车长的制服。桌上有一封信，信封上写着："致最后的乘客"。',
        connections: ['car_5', 'cabin'],
        directionMap: { south: 'car_5', north: 'cabin' },
        actions: {
          '调查': {
            message: '你打开信封，阅读列车长留下的信...',
            addClue: 't5',
            once: true
          }
        },
        keywords: {
          '信': { message: '列车长的信揭示了惊人的真相...', addClue: 't5' },
          '28': '你在密码锁上输入28...咔嗒！门开了。',
          '制服': '列车长的制服保存得很好。胸前的铭牌上写着一个名字，但已经模糊得看不清了。',
          '茶': { message: '你端起茶杯喝了一口...茶是温的，带着一种奇怪的花香。', sanChange: 5 }
        },
        specialActions: [
          {
            id: 'wear_uniform',
            icon: '🎩',
            label: '穿上制服',
            message: '你穿上了列车长的制服。它出奇地合身，像是为你量身定做的...',
            addItem: { id: 'conductor_uniform', name: '列车长制服', icon: '🎩', desc: '穿上它，你就是新的列车长', usable: true, canTakeOut: true },
            removeAfterUse: true
          }
        ],
        events: [
          {
            id: 'car6_conductor',
            trigger: 'firstVisit',
            delay: 4000,
            message: '你感到一阵寒意。转身时，你看到椅子上坐着一个半透明的身影——列车长的灵魂。他疲惫地看着你，微微点了点头。',
            horror: '"终于...有人来了...请...让这列车停下来..."',
            sanChange: -8
          }
        ]
      },

      'cabin': {
        name: '驾驶室',
        icon: '🚂',
        mapLabel: '驾',
        locked: true,
        lockHint: '需要列车长的授权才能进入',
        keyRequired: 'conductor_uniform',
        description: '列车的驾驶室。控制台上布满了各种仪表和按钮。正中央有一个红色的紧急制动拉杆。',
        firstVisitText: '你穿着列车长的制服走进驾驶室。控制台上的仪表全部亮着，显示着各种无法理解的数据。窗外依然是无尽的黑暗。紧急制动拉杆就在你面前...',
        connections: ['car_6'],
        directionMap: { south: 'car_6' },
        keywords: {
          '仪表': '仪表显示列车已经运行了...3,650,000天。那是一万年。',
          '窗外': { message: '你透过驾驶室的窗户向外看...', horror: '黑暗中，你看到了无数张脸。那是所有曾经乘坐过这列列车的乘客...他们都在窗外注视着你。', sanChange: -10 },
          '制动': '紧急制动拉杆上有一个密码锁。需要输入正确的密码才能拉动。',
          '28': '你在制动器的密码锁上输入28...'
        },
        specialActions: [
          {
            id: 'pull_brake',
            icon: '🛑',
            label: '拉下制动杆',
            condition: { hasClue: 't4' },
            message: '你输入密码28，然后用力拉下紧急制动拉杆。列车发出刺耳的金属摩擦声，开始减速...',
            triggerEnding: 'stop_train'
          },
          {
            id: 'become_conductor',
            icon: '🎩',
            label: '接替列车长',
            condition: { hasItem: 'conductor_uniform', hasClue: 't5' },
            message: '你坐在列车长的座位上，双手握住方向盘。你感到一股力量从制服中涌入你的身体...你成为了新的列车长。',
            triggerEnding: 'new_conductor'
          },
          {
            id: 'use_mirror_cabin',
            icon: '🪞',
            label: '使用镜子',
            condition: { hasItem: 'small_mirror' },
            message: '你举起小镜子对准窗外的黑暗。镜子中映出了一条铁轨...和铁轨尽头的一座车站。你看到了终点站！',
            triggerEnding: 'find_station'
          }
        ],
        events: [
          {
            id: 'cabin_final',
            trigger: 'firstVisit',
            delay: 3000,
            horror: '控制台上的广播突然响起："最后一位乘客已到达驾驶室。列车将在...永恒...后到站。"',
            sanChange: -5
          }
        ]
      }
    },

    mapLayout: {
      'car_1':  { x: 10, y: 60 },
      'car_2':  { x: 40, y: 60 },
      'car_3':  { x: 70, y: 60 },
      'car_4':  { x: 100, y: 60 },
      'car_5':  { x: 130, y: 60 },
      'car_6':  { x: 160, y: 60 },
      'cabin':  { x: 190, y: 60 }
    },

    mapPaths: [
      { x: 25, y: 68, w: 15, h: 2, dir: 'h' },
      { x: 55, y: 68, w: 15, h: 2, dir: 'h' },
      { x: 85, y: 68, w: 15, h: 2, dir: 'h' },
      { x: 115, y: 68, w: 15, h: 2, dir: 'h' },
      { x: 145, y: 68, w: 15, h: 2, dir: 'h' },
      { x: 175, y: 68, w: 15, h: 2, dir: 'h' }
    ],

    itemEffects: {
      'small_mirror': {
        roomRequired: 'cabin',
        message: '镜子映出了终点站的景象...',
        triggerEnding: 'find_station',
        consume: true
      }
    },

    endings: [
      {
        id: 'stop_train',
        title: '🛑 紧急制动',
        text: '列车在一阵剧烈的颤抖后终于停了下来。车门打开，外面是一片灰白色的雾气——苍白回廊。你跳下列车，身后的列车缓缓消失在迷雾中。广播最后说了一句："感谢乘坐...下次再见。"',
        rating: 'B',
        fragmentReward: 70,
        requirements: {
          clues: ['t4'],
          room: 'cabin'
        }
      },
      {
        id: 'new_conductor',
        title: '🎩 新任列车长',
        text: '你接替了列车长的位置。你感到自己与列车融为一体，能感知每一节车厢、每一个座位。前任列车长的灵魂终于得到了解脱，化作一缕光消散了。但你...你将永远驾驶这列列车。直到下一个人来接替你。',
        rating: 'A',
        fragmentReward: 100,
        requirements: {
          items: ['conductor_uniform'],
          clues: ['t5'],
          room: 'cabin'
        },
        bonusItems: [
          { id: 'conductor_whistle', name: '列车长的哨子', icon: '📯', desc: '吹响它可以召唤末班列车。在副本中使用可立即返回入口。' },
          { id: 'truth_fragment', name: '真相碎片', icon: '💠', desc: '蕴含深层真相的结晶' }
        ]
      },
      {
        id: 'find_station',
        title: '🚉 终点站',
        text: '镜子映出的终点站变成了现实。列车缓缓驶入一座古老的车站。站台上站着所有曾经的乘客，他们微笑着向你挥手。你走下列车，脚踏实地的感觉从未如此美好。列车鸣笛一声，驶向了远方...',
        rating: 'S',
        fragmentReward: 150,
        requirements: {
          items: ['small_mirror'],
          clues: ['t1', 't2', 't3', 't4', 't5'],
          room: 'cabin'
        },
        bonusItems: [
          { id: 'eternal_ticket', name: '永恒车票', icon: '🎫', desc: '一张可以前往任何地方的车票。持有时副本内移动速度+20%。' },
          { id: 'truth_fragment', name: '真相碎片', icon: '💠', desc: '蕴含深层真相的结晶' }
        ]
      }
    ]
  };
};
