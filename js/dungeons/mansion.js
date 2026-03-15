DUNGEON_FACTORIES['mansion'] = function() {
  return {
    id: 'mansion',
    name: '红月庄园',
    timeLimit: 900,
    startRoom: 'gate',
    intro: '一辆马车将你送到了庄园门前。天空中悬挂着一轮血红色的月亮，庄园的轮廓在月光下显得格外诡异。铁门自动打开了，仿佛在邀请你进入...',
    aiHints: '这是一座维多利亚风格的庄园。红月之夜会发生超自然现象。庄园主人已经死去多年，但他的执念仍在。画像和镜子是关键元素。',

    clues: {
      'm1': { name: '庄园主遗书', icon: '✉️', description: '"我将永远守护这座庄园...即使死后也不会离开..."', sanCost: 5, foundIn: '门厅' },
      'm2': { name: '仆人的证词', icon: '📜', description: '"老爷在红月之夜进行了某种仪式...从那以后，画像就开始流泪了..."', sanCost: 8, foundIn: '仆人房' },
      'm3': { name: '仪式笔记', icon: '📕', description: '一本记录着古老仪式的笔记。需要在红月之夜，在镜厅中完成特定步骤...', sanCost: 10, foundIn: '书房' },
      'm4': { name: '画像的秘密', icon: '🖼️', description: '画像背后藏着一个暗格，里面有一把银钥匙和一张纸条："镜中之门"', sanCost: 6, foundIn: '画廊' },
      'm5': { name: '地下密室线索', icon: '🔮', description: '镜厅的某面镜子后面有一条通往地下密室的暗道。', sanCost: 5, foundIn: '镜厅' },
      'm6': { name: '庄园主的真相', icon: '💀', description: '"他不是在守护庄园...他是被困在了这里。红月仪式是为了解放他的灵魂..."', sanCost: 12, foundIn: '地下密室' }
    },

    rooms: {
      'gate': {
        name: '庄园大门',
        icon: '🚪',
        mapLabel: '门',
        description: '高大的铁门后是一条铺满落叶的石板路，两侧是枯死的玫瑰丛。远处的庄园主楼在红月下投下巨大的阴影。',
        firstVisitText: '你踏过铁门的门槛，身后的门立刻关上了。回头看去，铁门上的锁已经生锈得无法打开。看来，唯一的出路在前方...',
        connections: ['hall'],
        directionMap: { north: 'hall' },
        keywords: {
          '玫瑰': '枯死的玫瑰丛中，你注意到有一朵花还保持着鲜红的颜色。但当你伸手去碰时，它瞬间枯萎了。',
          '铁门': '铁门已经锁死了。锈迹斑斑的铁栏杆上刻着庄园的家徽——一轮红月下的眼睛。'
        }
      },

      'hall': {
        name: '门厅',
        icon: '🏛️',
        mapLabel: '厅',
        description: '宽敞的门厅，大理石地板上铺着褪色的红地毯。正对面是一座宏伟的楼梯，两侧各有一扇门。墙上挂着庄园主的巨幅画像。',
        firstVisitText: '你推开沉重的橡木大门走进门厅。蜡烛自动点燃了，发出摇曳的光芒。庄园主的画像从墙上俯视着你，那双眼睛似乎在跟随你的移动...',
        connections: ['gate', 'gallery', 'servant_room', 'study'],
        directionMap: { south: 'gate', east: 'gallery', west: 'servant_room', north: 'study' },
        actions: {
          '调查': {
            message: '你在画像下方的壁炉台上发现了一封信。信封上写着"致最后的访客"...',
            addClue: 'm1',
            once: true
          }
        },
        keywords: {
          '画像': { message: '你仔细观察画像。庄园主是一个中年男人，表情严肃。但你注意到...画像的眼角似乎有泪痕。', horror: '你盯着画像看了太久。突然，画像中的人眨了一下眼睛。', sanChange: -5 },
          '信': { message: '你打开信封，里面是庄园主的遗书...', addClue: 'm1' },
          '楼梯': '宏伟的楼梯通向二楼。楼梯扶手上积满了灰尘，但中间有一条清晰的痕迹，像是有人经常走过。'
        },
        events: [
          {
            id: 'hall_candles',
            trigger: 'firstVisit',
            delay: 4000,
            horror: '所有蜡烛突然同时熄灭，又同时重新点燃。在那短暂的黑暗中，你感觉有什么东西从你身边掠过...',
            sanChange: -3
          }
        ]
      },

      'gallery': {
        name: '画廊',
        icon: '🖼️',
        mapLabel: '画',
        description: '长长的画廊两侧挂满了画像，都是庄园历代主人的肖像。走廊尽头有一面巨大的落地镜。',
        firstVisitText: '你走进画廊，脚步声在空旷的走廊中回荡。两侧的画像似乎都在注视着你。你注意到最后一幅画像——也就是现任庄园主的画像——画框有些歪斜...',
        connections: ['hall', 'mirror_hall'],
        directionMap: { west: 'hall', east: 'mirror_hall' },
        actions: {
          '调查': {
            message: '你检查那幅歪斜的画像，发现画像背后有一个暗格...',
            addClue: 'm4',
            addItem: { id: 'silver_key', name: '银钥匙', icon: '🗝️', desc: '画像背后找到的银钥匙，上面刻着月亮图案', usable: true, canTakeOut: false },
            once: true
          }
        },
        keywords: {
          '画像': { message: '你扶正那幅歪斜的画像，发现背后有暗格...', addClue: 'm4', addItem: { id: 'silver_key', name: '银钥匙', icon: '🗝️', desc: '刻着月亮图案的银钥匙', usable: true, canTakeOut: false } },
          '镜子': '走廊尽头的落地镜映出了你的身影。但你总觉得镜中的自己...动作慢了半拍。',
          '落地镜': { message: '你走近落地镜仔细观察...', horror: '镜中的你突然露出了一个你没有做出的微笑。', sanChange: -8 }
        },
        events: [
          {
            id: 'gallery_eyes',
            trigger: 'enter',
            condition: { clueCount: 3 },
            horror: '你经过画廊时，所有画像中的人同时转头看向你。当你回头确认时，它们又恢复了原样。',
            sanChange: -7,
            notification: '🧠 SAN -7'
          }
        ]
      },

      'servant_room': {
        name: '仆人房',
        icon: '🛏️',
        mapLabel: '仆',
        description: '简陋的仆人房间，只有一张窄床和一个衣柜。床头放着一本破旧的日记。',
        firstVisitText: '仆人房的门吱呀一声打开。房间很小，空气中弥漫着霉味。床上的被褥已经腐烂，但床头的日记保存得还算完好...',
        connections: ['hall'],
        directionMap: { east: 'hall' },
        actions: {
          '调查': {
            message: '你翻开仆人的日记，里面记录了庄园中发生的怪事...',
            addClue: 'm2',
            once: true
          }
        },
        keywords: {
          '日记': { message: '仆人的日记中记录了红月之夜的仪式...', addClue: 'm2' },
          '衣柜': '衣柜里只有几件破旧的仆人制服。但在最里面，你发现了一瓶红酒。',
          '红酒': {
            message: '你拿起那瓶红酒。酒标上写着一个年份...和一行小字："献给永恒的主人"。',
            addItem: { id: 'red_wine', name: '红酒', icon: '🍷', desc: '"献给永恒的主人"', usable: true, canTakeOut: false }
          }
        }
      },

      'study': {
        name: '书房',
        icon: '📚',
        mapLabel: '书',
        description: '书房里堆满了各种古籍和手稿。壁炉中的火还在燃烧——这不可能。书桌上摊开着一本笔记。',
        firstVisitText: '书房的门没有锁。你走进去，壁炉中的火焰突然旺盛起来，照亮了整个房间。书桌上摊开着一本笔记，墨水似乎还是湿的...',
        connections: ['hall', 'mirror_hall'],
        directionMap: { south: 'hall', east: 'mirror_hall' },
        actions: {
          '调查': {
            message: '你阅读书桌上的笔记。这是一本关于古老仪式的记录...',
            addClue: 'm3',
            once: true
          }
        },
        keywords: {
          '笔记': { message: '仪式笔记详细记录了红月仪式的步骤...', addClue: 'm3' },
          '壁炉': { message: '壁炉中的火焰是蓝色的。你伸手靠近...它是冰冷的。', horror: '蓝色的火焰中，你隐约看到了一张扭曲的脸...', sanChange: -6 },
          '古籍': '大部分古籍都是关于灵魂学和降灵术的。有人在其中一本书的空白处写满了批注。'
        },
        events: [
          {
            id: 'study_writing',
            trigger: 'firstVisit',
            delay: 6000,
            horror: '你听到身后传来沙沙的声音。回头一看，书桌上的笔正在自己书写着什么...当你走近时，笔停了下来。纸上写着："帮帮我"。',
            sanChange: -8,
            notification: '🧠 SAN -8'
          }
        ]
      },

      'mirror_hall': {
        name: '镜厅',
        icon: '🪞',
        mapLabel: '镜',
        description: '圆形的大厅，四面墙壁都是镜子。无数个你的倒影在镜中无限延伸。大厅中央有一个石制祭坛。',
        firstVisitText: '你走进镜厅的瞬间，一阵眩晕袭来。四面八方都是你的倒影，让你分不清哪个是真实的自己。大厅中央的石制祭坛上刻着月亮的图案...',
        connections: ['gallery', 'study', 'secret_chamber'],
        directionMap: { west: 'gallery', south: 'study', north: 'secret_chamber' },
        actions: {
          '调查': {
            message: '你检查祭坛上的刻痕。月亮图案的中心有一个钥匙孔...',
            addClue: 'm5',
            once: true
          }
        },
        keywords: {
          '镜子': { message: '你仔细观察每面镜子...其中一面镜子的反射似乎有些不同。', horror: '你发现其中一面镜子里的你...没有影子。', sanChange: -10 },
          '祭坛': { message: '祭坛上刻着复杂的符文和月亮图案。中心有一个钥匙孔。', addClue: 'm5' }
        },
        specialActions: [
          {
            id: 'use_silver_key',
            icon: '🗝️',
            label: '使用银钥匙',
            condition: { hasItem: 'silver_key' },
            message: '你将银钥匙插入祭坛的钥匙孔。所有镜子同时发出耀眼的光芒，其中一面镜子的表面开始波动，像水面一样...',
            unlockRoom: 'secret_chamber',
            removeAfterUse: true
          },
          {
            id: 'perform_ritual',
            icon: '🔮',
            label: '执行仪式',
            condition: { hasClue: 'm3', hasClue: 'm6' },
            message: '你按照仪式笔记的步骤，在祭坛前开始了红月仪式。镜子中的倒影开始独立行动，它们围成一圈，低声吟唱着古老的咒语...',
            triggerEnding: 'true_ending_mansion'
          }
        ],
        events: [
          {
            id: 'mirror_doppelganger',
            trigger: 'firstVisit',
            delay: 5000,
            horror: '你注意到镜中的一个倒影停止了模仿你的动作。它缓缓转过身，面对着你...然后开始向镜面走来。',
            sanChange: -15,
            notification: '⚠️ 镜中异象！SAN -15'
          }
        ]
      },

      'secret_chamber': {
        name: '地下密室',
        icon: '🔮',
        mapLabel: '密',
        locked: true,
        lockHint: '需要在镜厅找到入口',
        description: '狭小的地下密室，墙壁上画满了符文。中央有一具棺材，棺盖半开着。',
        firstVisitText: '你穿过镜面，来到了一个隐藏的地下密室。空气中弥漫着古老的香料气味。墙壁上的符文在红月的光芒下微微发光。中央的棺材...棺盖是打开的。',
        connections: ['mirror_hall'],
        directionMap: { south: 'mirror_hall' },
        actions: {
          '调查': {
            message: '你鼓起勇气查看棺材内部。里面是庄园主的遗体...但他的表情不像是死去的人，更像是...在沉睡。棺材底部有一封信...',
            addClue: 'm6',
            once: true
          }
        },
        keywords: {
          '棺材': { message: '你查看棺材中的遗体和信件...', addClue: 'm6' },
          '符文': { message: '符文记录着一种古老的灵魂束缚术。庄园主用这种术式将自己的灵魂绑定在了庄园中。', horror: '当你触碰符文时，它们开始发出刺眼的红光...', sanChange: -8 },
          '信': { message: '信中揭示了庄园主的真相...他不是在守护庄园，而是被困在了这里。', addClue: 'm6' }
        },
        specialActions: [
          {
            id: 'free_soul',
            icon: '💫',
            label: '解放灵魂',
            condition: { hasClue: 'm6' },
            message: '你按照信中的指示，开始解除灵魂束缚。棺材中的遗体开始发出柔和的光芒...',
            triggerEnding: 'good_ending_mansion'
          }
        ],
        events: [
          {
            id: 'chamber_ghost',
            trigger: 'firstVisit',
            delay: 3000,
            message: '棺材旁出现了一个半透明的身影——庄园主的灵魂。他看着你，嘴唇微动，似乎在说什么...',
            horror: '"...帮我...解脱..."',
            sanChange: -5
          }
        ]
      }
    },

    mapLayout: {
      'gate':            { x: 80, y: 120 },
      'hall':            { x: 80, y: 70 },
      'gallery':         { x: 150, y: 70 },
      'servant_room':    { x: 10, y: 70 },
      'study':           { x: 80, y: 20 },
      'mirror_hall':     { x: 150, y: 20 },
      'secret_chamber':  { x: 150, y: -30 }
    },

    mapPaths: [
      { x: 93, y: 90, w: 2, h: 30, dir: 'v' },
      { x: 105, y: 78, w: 45, h: 2, dir: 'h' },
      { x: 35, y: 78, w: 45, h: 2, dir: 'h' },
      { x: 93, y: 40, w: 2, h: 30, dir: 'v' },
      { x: 163, y: 40, w: 2, h: 30, dir: 'v' },
      { x: 105, y: 28, w: 45, h: 2, dir: 'h' },
      { x: 163, y: -5, w: 2, h: 25, dir: 'v' }
    ],

    itemEffects: {
      'silver_key': {
        roomRequired: 'mirror_hall',
        message: '你将银钥匙插入祭坛...镜面开始波动。',
        unlockRoom: 'secret_chamber',
        consume: true
      },
      'red_wine': {
        roomRequired: 'secret_chamber',
        message: '你将红酒倒在棺材旁的祭坛上。酒液渗入石头中，符文的光芒变得更加柔和...',
        sanChange: 10,
        consume: true
      }
    },

    endings: [
      {
        id: 'good_ending_mansion',
        title: '🌙 灵魂解放',
        text: '随着仪式的完成，庄园主的灵魂终于从束缚中解脱。他的身影在月光中逐渐消散，脸上露出了安详的微笑。庄园开始崩塌，但一道温暖的光芒将你包裹，送回了苍白回廊...',
        rating: 'S',
        fragmentReward: 150,
        requirements: {
          clues: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
          room: 'secret_chamber'
        },
        bonusItems: [
          { id: 'moon_pendant', name: '红月吊坠', icon: '🌙', desc: '庄园主灵魂留下的谢礼。佩戴时HP上限+2' },
          { id: 'truth_fragment', name: '真相碎片', icon: '💠', desc: '蕴含深层真相的结晶' }
        ]
      },
      {
        id: 'true_ending_mansion',
        title: '🪞 镜中真相',
        text: '红月仪式完成了。镜子中的世界与现实融为一体，你看到了庄园数百年来的全部历史。最终，所有镜子同时碎裂，庄园消失在红月的光芒中...',
        rating: 'A',
        fragmentReward: 100,
        requirements: {
          clues: ['m3', 'm6'],
          room: 'mirror_hall'
        }
      },
      {
        id: 'escape_mansion',
        title: '🚪 仓皇逃离',
        text: '你没能完全解开庄园的秘密，但找到了一条逃生的路。身后的庄园在红月下发出最后的哀鸣...',
        rating: 'C',
        fragmentReward: 40,
        requirements: {
          minClueCount: 2
        }
      }
    ]
  };
};
