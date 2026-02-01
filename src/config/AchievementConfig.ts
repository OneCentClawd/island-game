/**
 * 成就定义
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  reward: { type: string; amount: number };
  hidden?: boolean; // 隐藏成就，完成前不显示
}

export interface AchievementCondition {
  type: 'level_complete' | 'total_score' | 'total_matches' | 'buildings_built' | 'combo' | 'stars';
  value: number;
}

/**
 * 成就列表
 */
export const ACHIEVEMENTS: Achievement[] = [
  // 关卡成就
  {
    id: 'first_win',
    name: '初出茅庐',
    description: '完成第1关',
    icon: '🎯',
    condition: { type: 'level_complete', value: 1 },
    reward: { type: 'coin', amount: 100 },
  },
  {
    id: 'level_5',
    name: '小有所成',
    description: '完成第5关',
    icon: '⭐',
    condition: { type: 'level_complete', value: 5 },
    reward: { type: 'coin', amount: 200 },
  },
  {
    id: 'level_10',
    name: '渐入佳境',
    description: '完成第10关',
    icon: '🌟',
    condition: { type: 'level_complete', value: 10 },
    reward: { type: 'diamond', amount: 5 },
  },
  {
    id: 'level_20',
    name: '炉火纯青',
    description: '完成第20关',
    icon: '🏆',
    condition: { type: 'level_complete', value: 20 },
    reward: { type: 'diamond', amount: 10 },
  },
  {
    id: 'level_50',
    name: '三消大师',
    description: '完成第50关',
    icon: '👑',
    condition: { type: 'level_complete', value: 50 },
    reward: { type: 'diamond', amount: 30 },
  },

  // 分数成就
  {
    id: 'score_10000',
    name: '万分俱乐部',
    description: '累计获得10000分',
    icon: '💯',
    condition: { type: 'total_score', value: 10000 },
    reward: { type: 'coin', amount: 300 },
  },
  {
    id: 'score_100000',
    name: '十万富翁',
    description: '累计获得100000分',
    icon: '💰',
    condition: { type: 'total_score', value: 100000 },
    reward: { type: 'diamond', amount: 10 },
  },

  // 消除成就
  {
    id: 'matches_100',
    name: '消消乐',
    description: '累计消除100次',
    icon: '✨',
    condition: { type: 'total_matches', value: 100 },
    reward: { type: 'coin', amount: 150 },
  },
  {
    id: 'matches_1000',
    name: '消除达人',
    description: '累计消除1000次',
    icon: '🔥',
    condition: { type: 'total_matches', value: 1000 },
    reward: { type: 'diamond', amount: 5 },
  },

  // 连击成就
  {
    id: 'combo_5',
    name: '五连击',
    description: '达成5连击',
    icon: '⚡',
    condition: { type: 'combo', value: 5 },
    reward: { type: 'coin', amount: 200 },
  },
  {
    id: 'combo_10',
    name: '十连击',
    description: '达成10连击',
    icon: '💥',
    condition: { type: 'combo', value: 10 },
    reward: { type: 'diamond', amount: 3 },
  },

  // 星星成就
  {
    id: 'stars_15',
    name: '收藏家',
    description: '累计获得15颗星',
    icon: '⭐',
    condition: { type: 'stars', value: 15 },
    reward: { type: 'coin', amount: 250 },
  },
  {
    id: 'stars_45',
    name: '星光闪耀',
    description: '累计获得45颗星',
    icon: '🌟',
    condition: { type: 'stars', value: 45 },
    reward: { type: 'diamond', amount: 8 },
  },

  // 建筑成就
  {
    id: 'build_1',
    name: '建筑工人',
    description: '建造第1个建筑',
    icon: '🏠',
    condition: { type: 'buildings_built', value: 1 },
    reward: { type: 'wood', amount: 50 },
  },
  {
    id: 'build_5',
    name: '小小城主',
    description: '建造5个建筑',
    icon: '🏘️',
    condition: { type: 'buildings_built', value: 5 },
    reward: { type: 'diamond', amount: 5 },
  },

  // 隐藏成就
  {
    id: 'lucky_7',
    name: '幸运数字',
    description: '单次获得777分',
    icon: '🍀',
    condition: { type: 'total_score', value: 777 },
    reward: { type: 'diamond', amount: 7 },
    hidden: true,
  },
];

/**
 * 检查成就是否达成
 */
export function checkAchievement(
  achievement: Achievement,
  stats: {
    highestLevel: number;
    totalScore: number;
    totalMatches: number;
    buildingsBuilt: number;
    maxCombo: number;
    totalStars: number;
  }
): boolean {
  const { type, value } = achievement.condition;

  switch (type) {
    case 'level_complete':
      return stats.highestLevel >= value;
    case 'total_score':
      return stats.totalScore >= value;
    case 'total_matches':
      return stats.totalMatches >= value;
    case 'buildings_built':
      return stats.buildingsBuilt >= value;
    case 'combo':
      return stats.maxCombo >= value;
    case 'stars':
      return stats.totalStars >= value;
    default:
      return false;
  }
}
