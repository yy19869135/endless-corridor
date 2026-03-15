var mujianSdk = null; // 已废弃，保留变量避免报错
var stopController = new AbortController();

var G = {
  // 永久数据（跨副本保留）
  hp: 10, maxHp: 10,
  san: 100, maxSan: 100,
  soulFragments: 0,
  connected: false,
  factionDrawn: false,
  playerFaction: null,
  permanentItems: [],
  completedDungeons: [],
  contacts: [],
  team: [],
  teamMaxSize: 3,
  leaderboard: [
    { rank: 1, name: '只有我不在的街道', score: 99999, tag: 'NPC', title: '回归者', icon: '👤' },
    { rank: 2, name: '龙傲天', score: 88888, tag: 'NPC', title: '传说探索者', icon: '👤' },
    { rank: 3, name: '深渊行者', score: 77777, tag: 'NPC', title: '资深探索者', icon: '👤' },
    { rank: 999, name: '你', score: 0, tag: 'User', title: '新人', icon: '👤' }
  ],
  marketItems: [],
  systemUnlocked: false,

  // ★ 成长系统（新增）
  playerLevel: 1,
  playerExp: 0,
  totalDungeonClears: 0,   // 总通关次数（含重复）
  totalDeaths: 0,           // 总死亡次数
  bestRating: 'F',          // 历史最佳评级

  // 副本临时数据
  inDungeon: false,
  dungeon: null,
  currentRoom: null,
  visitedRooms: new Set(),
  dungeonItems: [],
  cluesFound: [],
  gameTime: 0,
  timerInterval: null,
  timerStarted: false,
  gamePhase: 'world',
  triggeredEvents: new Set(),
  messageHistory: [],

  // 大世界位置
  worldLocation: 'world_hub',
  currentParticipants: null,
  deadCharacters: [],
  cycleData: null
};
