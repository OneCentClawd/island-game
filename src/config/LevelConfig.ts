/**
 * 关卡配置
 */
export interface LevelConfig {
  level: number;
  moves: number;           // 步数限制
  targetScore: number;     // 目标分数
  targets?: CollectTarget[]; // 收集目标
  boardConfig?: BoardConfig; // 棋盘配置
}

export interface CollectTarget {
  type: string;
  count: number;
}

export interface BoardConfig {
  rows?: number;
  cols?: number;
  blockedCells?: [number, number][]; // 不可用的格子
}

/**
 * 关卡数据
 */
export const LEVELS: LevelConfig[] = [
  // 第1-5关：新手引导
  {
    level: 1,
    moves: 25,
    targetScore: 500,
  },
  {
    level: 2,
    moves: 22,
    targetScore: 800,
  },
  {
    level: 3,
    moves: 20,
    targetScore: 1000,
  },
  {
    level: 4,
    moves: 20,
    targetScore: 1200,
    targets: [{ type: 'wood', count: 10 }],
  },
  {
    level: 5,
    moves: 18,
    targetScore: 1500,
    targets: [{ type: 'coin', count: 15 }],
  },

  // 第6-10关：逐渐增加难度
  {
    level: 6,
    moves: 18,
    targetScore: 1800,
  },
  {
    level: 7,
    moves: 16,
    targetScore: 2000,
    targets: [
      { type: 'wood', count: 12 },
      { type: 'stone', count: 8 },
    ],
  },
  {
    level: 8,
    moves: 16,
    targetScore: 2200,
  },
  {
    level: 9,
    moves: 15,
    targetScore: 2500,
    targets: [{ type: 'star', count: 20 }],
  },
  {
    level: 10,
    moves: 15,
    targetScore: 3000,
  },

  // 第11-15关：中级挑战
  {
    level: 11,
    moves: 14,
    targetScore: 3500,
  },
  {
    level: 12,
    moves: 14,
    targetScore: 4000,
    targets: [
      { type: 'heart', count: 15 },
      { type: 'diamond', count: 10 },
    ],
  },
  {
    level: 13,
    moves: 13,
    targetScore: 4500,
  },
  {
    level: 14,
    moves: 13,
    targetScore: 5000,
  },
  {
    level: 15,
    moves: 12,
    targetScore: 6000,
    targets: [
      { type: 'wood', count: 20 },
      { type: 'stone', count: 15 },
      { type: 'coin', count: 25 },
    ],
  },
];

/**
 * 获取关卡配置
 */
export function getLevelConfig(level: number): LevelConfig {
  const config = LEVELS.find(l => l.level === level);
  if (config) {
    return config;
  }

  // 超出预设关卡，动态生成
  const baseMoves = Math.max(10, 25 - Math.floor(level / 3));
  const baseScore = 500 + level * 500;

  return {
    level,
    moves: baseMoves,
    targetScore: baseScore,
  };
}

/**
 * 关卡奖励配置
 */
export function getLevelRewards(level: number, stars: number): { wood: number; stone: number; coin: number; diamond: number } {
  const baseReward = {
    wood: 10 + level * 2,
    stone: 5 + level,
    coin: 50 + level * 10,
    diamond: 0,
  };

  // 根据星级加成
  const multiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1;

  return {
    wood: Math.floor(baseReward.wood * multiplier),
    stone: Math.floor(baseReward.stone * multiplier),
    coin: Math.floor(baseReward.coin * multiplier),
    diamond: stars === 3 ? 1 : 0, // 3星才给钻石
  };
}
