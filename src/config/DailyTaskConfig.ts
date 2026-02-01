/**
 * 每日任务定义
 */
export interface DailyTask {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  reward: { type: string; amount: number };
  trackType: 'matches' | 'levels' | 'score' | 'stars' | 'combo' | 'login';
}

/**
 * 每日任务列表（每天随机选3-5个）
 */
export const DAILY_TASKS: DailyTask[] = [
  {
    id: 'daily_login',
    name: '每日登录',
    description: '今天登录游戏',
    icon: '📅',
    target: 1,
    reward: { type: 'coin', amount: 50 },
    trackType: 'login',
  },
  {
    id: 'complete_3_levels',
    name: '闯关达人',
    description: '完成3个关卡',
    icon: '🎯',
    target: 3,
    reward: { type: 'coin', amount: 100 },
    trackType: 'levels',
  },
  {
    id: 'complete_5_levels',
    name: '关卡大师',
    description: '完成5个关卡',
    icon: '🏆',
    target: 5,
    reward: { type: 'diamond', amount: 2 },
    trackType: 'levels',
  },
  {
    id: 'match_50',
    name: '消消乐',
    description: '消除50组宝石',
    icon: '✨',
    target: 50,
    reward: { type: 'coin', amount: 80 },
    trackType: 'matches',
  },
  {
    id: 'match_100',
    name: '消除达人',
    description: '消除100组宝石',
    icon: '💎',
    target: 100,
    reward: { type: 'diamond', amount: 1 },
    trackType: 'matches',
  },
  {
    id: 'score_3000',
    name: '得分手',
    description: '累计获得3000分',
    icon: '💯',
    target: 3000,
    reward: { type: 'coin', amount: 100 },
    trackType: 'score',
  },
  {
    id: 'score_5000',
    name: '高分王',
    description: '累计获得5000分',
    icon: '🔥',
    target: 5000,
    reward: { type: 'diamond', amount: 2 },
    trackType: 'score',
  },
  {
    id: 'get_5_stars',
    name: '收星人',
    description: '获得5颗星星',
    icon: '⭐',
    target: 5,
    reward: { type: 'coin', amount: 120 },
    trackType: 'stars',
  },
  {
    id: 'combo_3',
    name: '连击新手',
    description: '达成3连击',
    icon: '⚡',
    target: 3,
    reward: { type: 'coin', amount: 60 },
    trackType: 'combo',
  },
  {
    id: 'combo_5',
    name: '连击高手',
    description: '达成5连击',
    icon: '💥',
    target: 5,
    reward: { type: 'diamond', amount: 1 },
    trackType: 'combo',
  },
];

/**
 * 获取今日任务（基于日期种子的伪随机）
 */
export function getTodayTasks(count: number = 4): DailyTask[] {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // 使用种子打乱数组
  const shuffled = [...DAILY_TASKS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // 确保包含每日登录任务
  const loginTask = DAILY_TASKS.find(t => t.id === 'daily_login')!;
  const otherTasks = shuffled.filter(t => t.id !== 'daily_login').slice(0, count - 1);
  
  return [loginTask, ...otherTasks];
}

/**
 * 伪随机数生成（基于种子）
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 每日任务状态
 */
export interface DailyTaskProgress {
  date: string; // YYYY-MM-DD
  tasks: {
    [taskId: string]: {
      progress: number;
      claimed: boolean;
    };
  };
}
