DUNGEON_FACTORIES['hospital'] = function() {
  return {
    id: 'hospital',
    name: '寂静岭医院',
    timeLimit: 600,
    startRoom: 'lobby',
    intro: '你在一片刺眼的白光中醒来，发现自己躺在一张破旧的病床上。空气中弥漫着消毒水和腐烂混合的气味。墙上的时钟停在了3:33。你必须在限定时间内找到逃出这里的方法...',
    aiHints: '这是一座废弃精神病院。充满了精神病患者的痕迹和超自然现象。重要NPC是一个名叫"小护士"的幽灵。',

    clues: {
      'c1': { name: '病历残页', icon: '📄', description: '一份残缺的病历：患者编号0733...反复出现"看见了"的字样...', sanCost: 5, foundIn: '大厅' },
      'c2': { name: '护士日记', icon: '📔', description: '"他们说三楼有东西...我不该上去的...那扇门后面..."', sanCost: 8, foundIn: '护士站' },
      'c3': { name: '钥匙密码', icon: '🔢', description: '墙上潦草地写着：0-7-3-3。似乎是某个密码。', sanCost: 3, foundIn: '手术室' },
      'c4': { name: '最后的录音', icon: '🎙️', description: '"如果你听到这段录音...不要相信镜子里的自己...出口在...地下..."', sanCost: 10, foundIn: '三楼病房' },
      'c5': { name: '地下通道地图', icon: '🗺️', description: '一张手绘的地图，标注了从地下室通往外部的逃生路线。', sanCost: 0, foundIn: '院长室' }
    },

    rooms: {
      'lobby': {
        name: '医院大厅',
        icon: '🏥',
        mapLabel: '厅',
        description: '破败的大厅，接待台上散落着发黄的文件。头顶的灯管忽明忽暗，发出令人不安的嗡嗡声。',
        firstVisitText: '你从病床上挣扎着起身，踉跄地走进大厅。到处都是灰尘和蛛网，像是已经荒废了很多年。但奇怪的是，空气中隐约能闻到新鲜血液的味道...',
        connections: ['nurse_station', 'surgery', 'corridor'],
        directionMap: { north: 'corridor', east: 'nurse_station', west: 'surgery' },
        lookDescription: '大厅很宽敞，但天花板低得令人压抑。墙上挂着一幅褪色的医院平面图。接待台后面有一扇通往护士站的门。',
        listenDescription: '灯管的嗡嗡声...还有...像是从走廊深处传来的脚步声？不，也许只是你的幻觉。',
        actions: {
          '调查': {
            message: '你翻看接待台上的文件。大部分已经腐烂得无法辨认，但你发现了一份还算完整的病历残页...',
            addClue: 'c1',
            once: true
          }
        },
        keywords: {
          '文件': { message: '你仔细翻看文件，发现了一份病历残页...', addClue: 'c1' },
          '血': '你凑近闻了闻...那股血腥味似乎来自走廊的方向。',
          '地图': '墙上的平面图显示这栋建筑有三层和一个地下室。地下室的位置被人用红笔圈了出来。'
        },
        events: [
          {
            id: 'lobby_flicker',
            trigger: 'firstVisit',
            delay: 3000,
            horror: '灯管突然全部熄灭，黑暗中你听到一个女人的声音在耳边低语："别...走..."',
            sanChange: -5,
            notification: '🧠 SAN -5'
          }
        ]
      },

      'nurse_station': {
        name: '护士站',
        icon: '💊',
        mapLabel: '护',
        description: '护士站的玻璃窗碎了一半，里面的药品柜东倒西歪。一本日记本摊开在桌上。',
        firstVisitText: '你推开护士站的门，铰链发出刺耳的尖叫。桌上摊开着一本日记，墨水还没有完全干透——这不可能，这座医院明明已经废弃多年了...',
        connections: ['lobby', 'corridor'],
        directionMap: { west: 'lobby', north: 'corridor' },
        actions: {
          '调查': {
            message: '你翻开那本日记。字迹越到后面越潦草，最后几页几乎是在纸上划出的痕迹...',
            addClue: 'c2',
            once: true
          },
          '查看': '药品柜里大部分药瓶都碎了。你注意到有一瓶标注着"镇静剂"的药还完好。'
        },
        keywords: {
          '日记': { message: '你仔细阅读护士的日记...', addClue: 'c2' },
          '药': {
            message: '你拿起那瓶镇静剂，也许之后会用到。',
            addItem: { id: 'sedative', name: '镇静剂', icon: '💉', desc: '一瓶完好的镇静剂，可以恢复少量SAN', usable: true, canTakeOut: false }
          },
          '镇静': {
            message: '你拿起那瓶镇静剂。',
            addItem: { id: 'sedative', name: '镇静剂', icon: '💉', desc: '一瓶完好的镇静剂，可以恢复少量SAN', usable: true, canTakeOut: false }
          }
        },
        specialActions: [
          {
            id: 'read_diary',
            icon: '📔',
            label: '阅读日记',
            message: '你翻开那本日记，字迹越到后面越潦草...',
            addClue: 'c2',
            removeAfterUse: true
          },
          {
            id: 'take_medicine',
            icon: '💊',
            label: '拿取药品',
            message: '你从药品柜中取出一瓶完好的镇静剂。',
            addItem: { id: 'sedative', name: '镇静剂', icon: '💉', desc: '可以恢复少量SAN', usable: true, canTakeOut: false },
            removeAfterUse: true
          }
        ]
      },

      'surgery': {
        name: '手术室',
        icon: '🔪',
        mapLabel: '术',
        description: '手术台上残留着干涸的暗红色痕迹。无影灯歪斜地悬挂在天花板上，像一只巨大的死去的眼睛。',
        firstVisitText: '你推开手术室的门，一股浓烈的铁锈味扑面而来。手术台上的皮带还保持着束缚的姿态，仿佛刚刚还有人躺在上面。墙上用暗红色液体写着一串数字...',
        connections: ['lobby', 'director_office'],
        directionMap: { east: 'lobby', south: 'director_office' },
        actions: {
          '调查': {
            message: '你仔细辨认墙上的数字：0-7-3-3。这是某种密码吗？',
            addClue: 'c3',
            once: true
          }
        },
        keywords: {
          '数字': { message: '墙上写着：0-7-3-3。你把这个密码记了下来。', addClue: 'c3' },
          '手术台': '手术台上的束缚带已经老化，但上面的抓痕清晰可见。这里的患者曾经拼命挣扎过。',
          '灯': '你碰了一下无影灯，它突然亮了一瞬，照亮了手术台下方——那里有一把生锈的手术刀。'
        },
        specialActions: [
          {
            id: 'take_scalpel',
            icon: '🔪',
            label: '拿手术刀',
            message: '你捡起那把生锈的手术刀。虽然不太锋利了，但也许能派上用场。',
            addItem: { id: 'scalpel', name: '手术刀', icon: '🔪', desc: '一把生锈的手术刀', usable: true, canTakeOut: false },
            removeAfterUse: true
          }
        ],
        events: [
          {
            id: 'surgery_vision',
            trigger: 'firstVisit',
            delay: 5000,
            horror: '你的视线突然模糊了。恍惚间，你看到手术台上躺着一个人，几个穿白大褂的身影正在对他做着什么...然后一切消失了。',
            sanChange: -8,
            notification: '🧠 SAN -8'
          }
        ]
      },

      'corridor': {
        name: '三楼走廊',
        icon: '🚪',
        mapLabel: '廊',
        description: '昏暗的走廊，两侧是紧闭的病房门。走廊尽头有一扇门，门上贴着"禁止进入"的标签。',
        firstVisitText: '你沿着楼梯来到三楼。走廊里的灯只有最远处的一盏还亮着，发出惨白的光。两侧的病房门紧闭着，但你能感觉到有什么东西在门后注视着你...',
        connections: ['lobby', 'nurse_station', 'ward_3f'],
        directionMap: { south: 'lobby', east: 'nurse_station', north: 'ward_3f' },
        lookDescription: '走廊墙壁上有抓痕，像是有人曾经拼命想要逃离这里。地上散落着几张照片，但都模糊得看不清。',
        listenDescription: '你屏住呼吸...从走廊尽头的那扇门后面，传来了微弱的...音乐盒的声音？',
        keywords: {
          '照片': '你捡起地上的照片。虽然模糊，但你能隐约看到一群穿着病号服的人站在医院门前。其中一个人的脸被人为地涂掉了。',
          '抓痕': '抓痕很深，有些地方甚至能看到暗红色的痕迹。这里曾经发生过什么可怕的事情...',
          '门': '走廊尽头的门上贴着"禁止进入"。你试着推了推，门是锁着的。也许需要找到钥匙或密码。'
        },
        events: [
          {
            id: 'corridor_ghost',
            trigger: 'enter',
            condition: { clueCount: 2 },
            horror: '走廊尽头的灯突然熄灭了。黑暗中，你看到一个白色的身影站在那里，然后慢慢转过头来...那张脸上没有五官，只有一个巨大的、扭曲的笑容。',
            sanChange: -12,
            notification: '⚠️ 遭遇异常存在！SAN -12'
          }
        ]
      },

      'ward_3f': {
        name: '三楼病房',
        icon: '🛏️',
        mapLabel: '房',
        locked: true,
        lockHint: '门上有一个四位数密码锁',
        keyRequired: null,
        description: '病房里只有一张床和一台老旧的录音机。窗户被木板封死，墙上写满了密密麻麻的文字。',
        firstVisitText: '你输入密码0733，锁咔嗒一声打开了。病房里阴冷异常，你的呼吸凝成白雾。床头柜上放着一台录音机，录音带还在里面...',
        connections: ['corridor', 'basement'],
        directionMap: { south: 'corridor', west: 'basement' },
        actions: {
          '调查': {
            message: '你按下录音机的播放键。一个颤抖的声音从扬声器中传出...',
            addClue: 'c4',
            once: true
          }
        },
        keywords: {
          '录音': { message: '你按下播放键，听到一段令人不安的录音...', addClue: 'c4' },
          '墙': { message: '墙上的文字全是同一句话的重复："它在镜子里 它在镜子里 它在镜子里..."', horror: '当你读完这些文字，你感到背后有什么东西在呼吸...', sanChange: -5 },
          '0733': '你在密码锁上输入0733...咔嗒！门开了。'
        },
        specialActions: [
          {
            id: 'play_recorder',
            icon: '🎙️',
            label: '播放录音',
            message: '录音机发出沙沙的噪音，然后一个声音说道："如果你听到这段录音...不要相信镜子里的自己...出口在...地下..."',
            addClue: 'c4',
            removeAfterUse: true
          }
        ],
        events: [
          {
            id: 'ward_unlock_basement',
            trigger: 'firstVisit',
            delay: 2000,
            message: '你注意到床下有一个暗门，似乎通往地下...',
            unlockRoom: 'basement',
            notification: '🔓 发现暗门：通往地下室'
          }
        ]
      },

      'director_office': {
        name: '院长室',
        icon: '🗄️',
        mapLabel: '院',
        description: '院长室保存得比其他房间好得多。书架上整齐地排列着各种医学书籍，办公桌上放着一个保险箱。',
        firstVisitText: '院长室的门虚掩着。你走进去，发现这里几乎没有灰尘，像是有人一直在打扫。桌上的台灯还亮着——这不对劲。保险箱的密码锁等待着输入...',
        connections: ['surgery'],
        directionMap: { north: 'surgery' },
        actions: {
          '调查': '办公桌的抽屉里有一些文件，都是关于"0733号实验"的。但关键页面被撕掉了。'
        },
        keywords: {
          '保险箱': {
            message: '你需要密码才能打开保险箱。',
          },
          '0733': {
            message: '你在保险箱上输入0733...咔嗒！保险箱打开了。里面有一张手绘的地下通道地图！',
            addClue: 'c5',
            addItem: { id: 'basement_key', name: '地下室钥匙', icon: '🔑', desc: '一把老旧的铜钥匙，上面刻着"B1"', usable: false, canTakeOut: false }
          },
          '书架': '医学书籍中夹杂着一些奇怪的笔记，记录着关于"意识转移"的实验...',
          '台灯': '台灯是亮着的。你检查了一下电线...它根本没有插电。'
        },
        specialActions: [
          {
            id: 'open_safe',
            icon: '🔐',
            label: '输入密码',
            message: '你输入0733...保险箱打开了！里面有一张地图和一把钥匙。',
            addClue: 'c5',
            addItem: { id: 'basement_key', name: '地下室钥匙', icon: '🔑', desc: '刻着"B1"的铜钥匙', usable: false, canTakeOut: false },
            condition: { hasClue: 'c3' },
            removeAfterUse: true
          }
        ],
        events: [
          {
            id: 'office_photo',
            trigger: 'firstVisit',
            delay: 4000,
            horror: '你注意到书架上有一张合影。照片中的人你一个都不认识...除了最后一排右边的那个人。那是你自己。',
            sanChange: -10,
            notification: '🧠 SAN -10'
          }
        ]
      },

      'basement': {
        name: '地下室',
        icon: '⬇️',
        mapLabel: '地',
        locked: true,
        lockHint: '需要找到通往地下的入口',
        description: '阴暗潮湿的地下室，到处都是生锈的管道。远处隐约能看到一扇铁门，门上写着"出口"。',
        firstVisitText: '你沿着狭窄的阶梯走入地下。空气变得冰冷而潮湿，你的手电筒照出的光在黑暗中显得如此微弱。管道中传来咕噜咕噜的声响，像是什么东西在流动...',
        connections: ['ward_3f'],
        directionMap: { east: 'ward_3f' },
        actions: {
          '调查': '你检查了周围的管道和墙壁。地上有一些新鲜的脚印...不是你的。'
        },
        keywords: {
          '出口': '铁门上写着"出口"，但门是锁着的。需要某种钥匙。',
          '铁门': '你检查铁门上的锁。这是一个需要钥匙的老式锁。',
          '脚印': '脚印从黑暗中延伸而来，在铁门前消失了。这些脚印...是赤脚的，而且异常的大。'
        },
        specialActions: [
          {
            id: 'use_key_exit',
            icon: '🔑',
            label: '使用钥匙',
            condition: { hasItem: 'basement_key' },
            message: '你将钥匙插入锁孔，转动...铁门缓缓打开，一道刺眼的白光从门后涌出...',
            triggerEnding: 'escape_good'
          },
          {
            id: 'force_door',
            icon: '⚡',
            label: '强行推门',
            message: '你用尽全力推门...门纹丝不动。但你的举动似乎惊动了什么...',
            hpChange: -2,
            sanChange: -5,
            removeAfterUse: true
          }
        ],
        events: [
          {
            id: 'basement_final',
            trigger: 'enter',
            condition: { hasClue: 'c4', hasClue: 'c5' },
            delay: 3000,
            horror: '黑暗中，你听到身后传来脚步声。越来越近...越来越近...',
            sanChange: -8,
            notification: '⚠️ 有什么东西在靠近！'
          }
        ]
      }
    },

    // 地图布局
    mapLayout: {
      'lobby':           { x: 80, y: 60 },
      'nurse_station':   { x: 150, y: 60 },
      'surgery':         { x: 10, y: 60 },
      'corridor':        { x: 80, y: 10 },
      'ward_3f':         { x: 80, y: -30 },
      'director_office': { x: 10, y: 110 },
      'basement':        { x: 30, y: -30 }
    },

    mapPaths: [
      { x: 105, y: 68, w: 45, h: 2, dir: 'h' },   // lobby -> nurse
      { x: 35, y: 68, w: 45, h: 2, dir: 'h' },     // surgery -> lobby
      { x: 93, y: 35, w: 2, h: 25, dir: 'v' },     // lobby -> corridor
      { x: 93, y: -5, w: 2, h: 15, dir: 'v' },     // corridor -> ward
      { x: 23, y: 80, w: 2, h: 30, dir: 'v' },     // surgery -> director
      { x: 55, y: -22, w: 25, h: 2, dir: 'h' }     // basement -> ward
    ],

    // 物品使用效果
    itemEffects: {
      'sedative': {
        message: '你使用了镇静剂，感到一阵平静。',
        sanChange: 15,
        consume: true
      },
      'scalpel': {
        message: '你挥舞着手术刀，但这里没有需要切割的东西。',
        consume: false
      }
    },

    // 结局配置
    endings: [
      {
        id: 'escape_good',
        title: '🌅 逃出生天',
        text: '铁门打开的瞬间，刺眼的白光吞没了一切。你感到一股强大的力量将你向前推去。当你再次睁开眼睛时，你发现自己站在苍白回廊中。身后的副本入口正在缓缓关闭，里面传来最后一声若有若无的叹息...',
        rating: 'A',
        fragmentReward: 80,
        requirements: {
          clues: ['c4', 'c5'],
          items: ['basement_key'],
          room: 'basement'
        },
        bonusItems: [
          { id: 'nurse_charm', name: '护士的护身符', icon: '📿', desc: '来自寂静岭医院的纪念品。佩戴时SAN下降速度-5%' }
        ]
      },
      {
        id: 'escape_incomplete',
        title: '🌫️ 仓皇逃离',
        text: '你在没有完全理解真相的情况下逃出了医院。虽然活了下来，但那些未解之谜将永远萦绕在你的脑海中...',
        rating: 'C',
        fragmentReward: 30,
        requirements: {
          items: ['basement_key'],
          room: 'basement'
        }
      },
      {
        id: 'true_ending',
        title: '👁️ 真相大白',
        text: '你收集了所有线索，终于拼凑出了完整的真相。0733号患者...就是你自己。这座医院是你内心恐惧的具象化。当你接受了这个事实，医院的墙壁开始崩塌，露出了背后苍白的回廊...',
        rating: 'S',
        fragmentReward: 120,
        requirements: {
          clues: ['c1', 'c2', 'c3', 'c4', 'c5'],
          room: 'basement'
        },
        bonusItems: [
          { id: 'nurse_charm', name: '护士的护身符', icon: '📿', desc: '佩戴时SAN下降速度-5%' },
          { id: 'truth_fragment', name: '真相碎片', icon: '💠', desc: '蕴含着深层真相的结晶。收集足够多可以解锁隐藏内容。' }
        ]
      }
    ]
  };
};
