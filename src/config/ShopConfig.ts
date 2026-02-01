/**
 * 商店物品定义
 */
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'energy' | 'powerup' | 'resource' | 'special';
  price: { type: 'coin' | 'diamond'; amount: number };
  give: { type: string; amount: number };
  limit?: number; // 每日购买限制
}

/**
 * 商店物品列表
 */
export const SHOP_ITEMS: ShopItem[] = [
  // 体力
  {
    id: 'energy_small',
    name: '小体力药水',
    description: '恢复10点体力',
    icon: '🧪',
    category: 'energy',
    price: { type: 'coin', amount: 100 },
    give: { type: 'energy', amount: 10 },
    limit: 3,
  },
  {
    id: 'energy_large',
    name: '大体力药水',
    description: '恢复30点体力（满）',
    icon: '⚗️',
    category: 'energy',
    price: { type: 'diamond', amount: 5 },
    give: { type: 'energy', amount: 30 },
    limit: 2,
  },
  {
    id: 'energy_unlimited',
    name: '无限体力（1小时）',
    description: '1小时内不消耗体力',
    icon: '⚡',
    category: 'energy',
    price: { type: 'diamond', amount: 15 },
    give: { type: 'unlimited_energy', amount: 60 }, // 60分钟
    limit: 1,
  },

  // 道具
  {
    id: 'powerup_bomb',
    name: '炸弹 x3',
    description: '开局获得3个炸弹',
    icon: '💣',
    category: 'powerup',
    price: { type: 'coin', amount: 200 },
    give: { type: 'bomb', amount: 3 },
  },
  {
    id: 'powerup_rainbow',
    name: '彩虹球 x2',
    description: '开局获得2个彩虹球',
    icon: '🌈',
    category: 'powerup',
    price: { type: 'diamond', amount: 3 },
    give: { type: 'rainbow', amount: 2 },
  },
  {
    id: 'powerup_shuffle',
    name: '重排 x5',
    description: '可重新打乱棋盘5次',
    icon: '🔀',
    category: 'powerup',
    price: { type: 'coin', amount: 150 },
    give: { type: 'shuffle', amount: 5 },
  },
  {
    id: 'powerup_extra_moves',
    name: '额外步数 x3',
    description: '每关可额外+5步，共3次',
    icon: '➕',
    category: 'powerup',
    price: { type: 'diamond', amount: 5 },
    give: { type: 'extra_moves', amount: 3 },
  },

  // 资源
  {
    id: 'coin_pack_small',
    name: '金币小包',
    description: '获得500金币',
    icon: '💰',
    category: 'resource',
    price: { type: 'diamond', amount: 5 },
    give: { type: 'coin', amount: 500 },
  },
  {
    id: 'coin_pack_large',
    name: '金币大包',
    description: '获得2000金币',
    icon: '💰',
    category: 'resource',
    price: { type: 'diamond', amount: 15 },
    give: { type: 'coin', amount: 2000 },
  },
  {
    id: 'resource_pack',
    name: '建材礼包',
    description: '木材+100，石头+50',
    icon: '📦',
    category: 'resource',
    price: { type: 'diamond', amount: 10 },
    give: { type: 'resource_pack', amount: 1 },
  },

  // 特殊
  {
    id: 'vip_daily',
    name: '每日宝箱',
    description: '随机奖励（每日限1次）',
    icon: '🎁',
    category: 'special',
    price: { type: 'coin', amount: 50 },
    give: { type: 'random_reward', amount: 1 },
    limit: 1,
  },
];

/**
 * 免费每日奖励
 */
export const FREE_DAILY_REWARDS = [
  { day: 1, icon: '💰', type: 'coin', amount: 100 },
  { day: 2, icon: '🪵', type: 'wood', amount: 30 },
  { day: 3, icon: '⚡', type: 'energy', amount: 10 },
  { day: 4, icon: '💰', type: 'coin', amount: 200 },
  { day: 5, icon: '🪨', type: 'stone', amount: 20 },
  { day: 6, icon: '💰', type: 'coin', amount: 300 },
  { day: 7, icon: '💎', type: 'diamond', amount: 5 },
];
