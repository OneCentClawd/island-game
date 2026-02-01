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
 * 关卡数据 (50关)
 */
export const LEVELS: LevelConfig[] = [
  // ========== 第1-10关：新手引导 ==========
  { level: 1, moves: 25, targetScore: 500 },
  { level: 2, moves: 23, targetScore: 700 },
  { level: 3, moves: 22, targetScore: 900 },
  { level: 4, moves: 20, targetScore: 1100 },
  { level: 5, moves: 20, targetScore: 1300 },
  { level: 6, moves: 18, targetScore: 1500 },
  { level: 7, moves: 18, targetScore: 1800 },
  { level: 8, moves: 17, targetScore: 2000 },
  { level: 9, moves: 16, targetScore: 2200 },
  { level: 10, moves: 16, targetScore: 2500 },

  // ========== 第11-20关：渐入佳境 ==========
  { level: 11, moves: 15, targetScore: 2800 },
  { level: 12, moves: 15, targetScore: 3000 },
  { level: 13, moves: 14, targetScore: 3200 },
  { level: 14, moves: 14, targetScore: 3500 },
  { level: 15, moves: 14, targetScore: 3800 },
  { level: 16, moves: 13, targetScore: 4000 },
  { level: 17, moves: 13, targetScore: 4300 },
  { level: 18, moves: 13, targetScore: 4600 },
  { level: 19, moves: 12, targetScore: 5000 },
  { level: 20, moves: 12, targetScore: 5500 },

  // ========== 第21-30关：中级挑战 ==========
  { level: 21, moves: 12, targetScore: 6000 },
  { level: 22, moves: 12, targetScore: 6500 },
  { level: 23, moves: 11, targetScore: 7000 },
  { level: 24, moves: 11, targetScore: 7500 },
  { level: 25, moves: 11, targetScore: 8000 },
  { level: 26, moves: 11, targetScore: 8500 },
  { level: 27, moves: 10, targetScore: 9000 },
  { level: 28, moves: 10, targetScore: 9500 },
  { level: 29, moves: 10, targetScore: 10000 },
  { level: 30, moves: 10, targetScore: 11000 },

  // ========== 第31-40关：高手过招 ==========
  { level: 31, moves: 10, targetScore: 12000 },
  { level: 32, moves: 10, targetScore: 13000 },
  { level: 33, moves: 9, targetScore: 14000 },
  { level: 34, moves: 9, targetScore: 15000 },
  { level: 35, moves: 9, targetScore: 16000 },
  { level: 36, moves: 9, targetScore: 17000 },
  { level: 37, moves: 9, targetScore: 18000 },
  { level: 38, moves: 8, targetScore: 19000 },
  { level: 39, moves: 8, targetScore: 20000 },
  { level: 40, moves: 8, targetScore: 22000 },

  // ========== 第41-50关：大师级别 ==========
  { level: 41, moves: 8, targetScore: 24000 },
  { level: 42, moves: 8, targetScore: 26000 },
  { level: 43, moves: 8, targetScore: 28000 },
  { level: 44, moves: 7, targetScore: 30000 },
  { level: 45, moves: 7, targetScore: 32000 },
  { level: 46, moves: 7, targetScore: 35000 },
  { level: 47, moves: 7, targetScore: 38000 },
  { level: 48, moves: 7, targetScore: 42000 },
  { level: 49, moves: 6, targetScore: 46000 },
  { level: 50, moves: 6, targetScore: 50000 },
];

/**
 * 获取关卡配置
 */
export function getLevelConfig(level: number): LevelConfig {
  const config = LEVELS.find(l => l.level === level);
  if (config) {
    return config;
  }

  // 超出50关，动态生成无尽模式
  const baseMoves = Math.max(5, 12 - Math.floor((level - 50) / 10));
  const baseScore = 50000 + (level - 50) * 5000;

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
  // 基础奖励随关卡增长
  const levelBonus = Math.floor(level / 10);
  
  const baseReward = {
    wood: 10 + level * 2 + levelBonus * 5,
    stone: 5 + level + levelBonus * 3,
    coin: 50 + level * 15 + levelBonus * 20,
    diamond: 0,
  };

  // 根据星级加成
  const multiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1;

  // 里程碑关卡额外奖励
  let bonusDiamond = 0;
  if (level % 10 === 0) bonusDiamond = Math.floor(level / 10); // 10/20/30关额外钻石

  return {
    wood: Math.floor(baseReward.wood * multiplier),
    stone: Math.floor(baseReward.stone * multiplier),
    coin: Math.floor(baseReward.coin * multiplier),
    diamond: (stars === 3 ? 1 : 0) + bonusDiamond,
  };
}

/**
 * 获取关卡难度描述
 */
export function getLevelDifficulty(level: number): string {
  if (level <= 10) return '简单';
  if (level <= 20) return '普通';
  if (level <= 30) return '困难';
  if (level <= 40) return '专家';
  return '大师';
}

/**
 * 获取关卡难度颜色
 */
export function getLevelDifficultyColor(level: number): number {
  if (level <= 10) return 0x27ae60; // 绿色
  if (level <= 20) return 0x3498db; // 蓝色
  if (level <= 30) return 0xf1c40f; // 黄色
  if (level <= 40) return 0xe67e22; // 橙色
  return 0xe74c3c; // 红色
}
