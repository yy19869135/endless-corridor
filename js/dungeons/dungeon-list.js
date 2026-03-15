var DUNGEON_LIST = [
  {
    id: 'hospital',
    name: '🏥 寂静岭医院',
    difficulty: '★★☆',
    timeLimit: 600,
    roomCount: 6,
    description: '一座废弃的精神病院，走廊里回荡着不属于活人的低语...'
  },
  {
    id: 'mansion',
    name: '🏚️ 红月庄园',
    difficulty: '★★★',
    timeLimit: 900,
    roomCount: 8,
    description: '传说每逢红月之夜，庄园中的画像会流泪，镜子会映出不存在的人...',
    unlockCondition: function() { return G.completedDungeons.includes('hospital'); }
  },
  {
    id: 'train',
    name: '🚂 末班列车',
    difficulty: '★★★★',
    timeLimit: 480,
    roomCount: 7,
    description: '永远不会到站的列车，每节车厢都是一个独立的噩梦...',
    unlockCondition: function() { return G.completedDungeons.includes('mansion'); }
  }
];

// 副本工厂（返回完整副本配置的函数）
var DUNGEON_FACTORIES = {};
