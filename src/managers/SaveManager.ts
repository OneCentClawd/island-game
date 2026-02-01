import { GameConfig } from '../config/GameConfig';

/**
 * 存档数据结构
 */
export interface SaveData {
  version: number;
  resources: {
    wood: number;
    stone: number;
    coin: number;
    diamond: number;
  };
  energy: number;
  lastEnergyUpdate: number; // 时间戳
  currentLevel: number;
  highestLevel: number;
  levelStars: { [level: number]: number }; // 每关获得的星数
  buildings: { [id: string]: BuildingSaveData };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
  statistics: {
    totalMatches: number;
    totalScore: number;
    playTime: number; // 秒
    maxCombo: number;
  };
  completedDialogs: string[]; // 已完成的剧情对话
  unlockedAchievements: string[]; // 已解锁的成就
  tutorialCompleted: boolean; // 是否完成新手引导
}

export interface BuildingSaveData {
  built: boolean;
  level: number;
  lastCollect?: number; // 上次收集时间
}

const SAVE_KEY = 'island_game_save';
const SAVE_VERSION = 1;

/**
 * 存档管理器
 */
export class SaveManager {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  /**
   * 加载存档
   */
  private load(): SaveData {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as SaveData;
        // 版本迁移（如果需要）
        if (data.version < SAVE_VERSION) {
          return this.migrate(data);
        }
        return data;
      }
    } catch (e) {
      console.warn('加载存档失败:', e);
    }
    return this.createNew();
  }

  /**
   * 创建新存档
   */
  private createNew(): SaveData {
    return {
      version: SAVE_VERSION,
      resources: { ...GameConfig.INITIAL_RESOURCES },
      energy: GameConfig.ENERGY.MAX,
      lastEnergyUpdate: Date.now(),
      currentLevel: 1,
      highestLevel: 1,
      levelStars: {},
      buildings: {
        house: { built: true, level: 1 },
      },
      settings: {
        soundEnabled: true,
        musicEnabled: true,
      },
      statistics: {
        totalMatches: 0,
        totalScore: 0,
        playTime: 0,
        maxCombo: 0,
      },
      completedDialogs: [],
      unlockedAchievements: [],
      tutorialCompleted: false,
    };
  }

  /**
   * 版本迁移
   */
  private migrate(oldData: SaveData): SaveData {
    // 未来版本迁移逻辑
    const newData = this.createNew();
    return { ...newData, ...oldData, version: SAVE_VERSION };
  }

  /**
   * 保存
   */
  save(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('保存失败:', e);
    }
  }

  /**
   * 获取资源
   */
  getResources() {
    return this.data.resources;
  }

  /**
   * 更新资源
   */
  updateResources(delta: Partial<typeof this.data.resources>): void {
    Object.entries(delta).forEach(([key, value]) => {
      if (key in this.data.resources && value !== undefined) {
        (this.data.resources as any)[key] += value;
      }
    });
    this.save();
  }

  /**
   * 设置资源
   */
  setResources(resources: typeof this.data.resources): void {
    this.data.resources = { ...resources };
    this.save();
  }

  /**
   * 获取体力（自动恢复）
   */
  getEnergy(): number {
    const now = Date.now();
    const elapsed = now - this.data.lastEnergyUpdate;
    const regenMs = GameConfig.ENERGY.REGEN_MINUTES * 60 * 1000;
    const regained = Math.floor(elapsed / regenMs);

    if (regained > 0 && this.data.energy < GameConfig.ENERGY.MAX) {
      this.data.energy = Math.min(
        GameConfig.ENERGY.MAX,
        this.data.energy + regained
      );
      this.data.lastEnergyUpdate = now - (elapsed % regenMs);
      this.save();
    }

    return this.data.energy;
  }

  /**
   * 消耗体力
   */
  useEnergy(amount: number): boolean {
    const current = this.getEnergy();
    if (current >= amount) {
      this.data.energy = current - amount;
      this.data.lastEnergyUpdate = Date.now();
      this.save();
      return true;
    }
    return false;
  }

  /**
   * 获取下次体力恢复时间（秒）
   */
  getNextEnergyTime(): number {
    if (this.data.energy >= GameConfig.ENERGY.MAX) return 0;
    const elapsed = Date.now() - this.data.lastEnergyUpdate;
    const regenMs = GameConfig.ENERGY.REGEN_MINUTES * 60 * 1000;
    return Math.ceil((regenMs - (elapsed % regenMs)) / 1000);
  }

  /**
   * 获取当前关卡
   */
  getCurrentLevel(): number {
    return this.data.currentLevel;
  }

  /**
   * 完成关卡
   */
  completeLevel(level: number, stars: number): void {
    if (level >= this.data.highestLevel) {
      this.data.highestLevel = level + 1;
      this.data.currentLevel = level + 1;
    }
    // 更新星数（只保留最高）
    if (!this.data.levelStars[level] || this.data.levelStars[level] < stars) {
      this.data.levelStars[level] = stars;
    }
    this.save();
  }

  /**
   * 获取关卡星数
   */
  getLevelStars(level: number): number {
    return this.data.levelStars[level] || 0;
  }

  /**
   * 获取建筑数据
   */
  getBuilding(id: string): BuildingSaveData | undefined {
    return this.data.buildings[id];
  }

  /**
   * 建造建筑
   */
  buildBuilding(id: string): void {
    this.data.buildings[id] = { built: true, level: 1 };
    this.save();
  }

  /**
   * 更新统计
   */
  updateStatistics(matches: number, score: number): void {
    this.data.statistics.totalMatches += matches;
    this.data.statistics.totalScore += score;
    this.save();
  }

  /**
   * 获取设置
   */
  getSettings() {
    return this.data.settings;
  }

  /**
   * 更新设置
   */
  updateSettings(settings: Partial<typeof this.data.settings>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
  }

  /**
   * 重置存档
   */
  reset(): void {
    this.data = this.createNew();
    this.save();
  }

  /**
   * 导出存档（用于云同步）
   */
  export(): string {
    return JSON.stringify(this.data);
  }

  /**
   * 导入存档
   */
  import(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr) as SaveData;
      this.data = data;
      this.save();
      return true;
    } catch (e) {
      return false;
    }
  }

  // ============ 新增方法 ============

  /**
   * 标记对话已完成
   */
  completeDialog(dialogId: string): void {
    if (!this.data.completedDialogs) {
      this.data.completedDialogs = [];
    }
    if (!this.data.completedDialogs.includes(dialogId)) {
      this.data.completedDialogs.push(dialogId);
      this.save();
    }
  }

  /**
   * 获取已完成的对话
   */
  getCompletedDialogs(): string[] {
    return this.data.completedDialogs || [];
  }

  /**
   * 解锁成就
   */
  unlockAchievement(achievementId: string): boolean {
    if (!this.data.unlockedAchievements) {
      this.data.unlockedAchievements = [];
    }
    if (!this.data.unlockedAchievements.includes(achievementId)) {
      this.data.unlockedAchievements.push(achievementId);
      this.save();
      return true; // 新解锁
    }
    return false; // 已解锁
  }

  /**
   * 获取已解锁成就
   */
  getUnlockedAchievements(): string[] {
    return this.data.unlockedAchievements || [];
  }

  /**
   * 更新最大连击
   */
  updateMaxCombo(combo: number): void {
    if (!this.data.statistics.maxCombo) {
      this.data.statistics.maxCombo = 0;
    }
    if (combo > this.data.statistics.maxCombo) {
      this.data.statistics.maxCombo = combo;
      this.save();
    }
  }

  /**
   * 获取统计数据
   */
  getStatistics() {
    return this.data.statistics;
  }

  /**
   * 获取总星数
   */
  getTotalStars(): number {
    return Object.values(this.data.levelStars).reduce((sum, stars) => sum + stars, 0);
  }

  /**
   * 获取建造的建筑数量
   */
  getBuiltCount(): number {
    return Object.values(this.data.buildings).filter(b => b.built).length;
  }

  /**
   * 是否完成新手引导
   */
  isTutorialCompleted(): boolean {
    return this.data.tutorialCompleted || false;
  }

  /**
   * 标记新手引导完成
   */
  completeTutorial(): void {
    this.data.tutorialCompleted = true;
    this.save();
  }

  // ============ 每日任务相关 ============

  /**
   * 获取每日任务进度
   */
  getDailyTaskProgress(): any {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('island_daily_tasks');
    
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        return data;
      }
    }
    
    // 新的一天，重置进度
    return { date: today, tasks: {}, bonusClaimed: false };
  }

  /**
   * 更新每日任务进度
   */
  updateDailyTaskProgress(taskId: string, amount: number): void {
    const progress = this.getDailyTaskProgress();
    if (!progress.tasks[taskId]) {
      progress.tasks[taskId] = { progress: 0, claimed: false };
    }
    progress.tasks[taskId].progress += amount;
    localStorage.setItem('island_daily_tasks', JSON.stringify(progress));
  }

  /**
   * 领取每日任务奖励
   */
  claimDailyTask(taskId: string): void {
    const progress = this.getDailyTaskProgress();
    if (progress.tasks[taskId]) {
      progress.tasks[taskId].claimed = true;
      localStorage.setItem('island_daily_tasks', JSON.stringify(progress));
    }
  }

  /**
   * 领取每日全部完成奖励
   */
  claimDailyBonus(): void {
    const progress = this.getDailyTaskProgress();
    progress.bonusClaimed = true;
    localStorage.setItem('island_daily_tasks', JSON.stringify(progress));
  }

  // ============ 签到相关 ============

  /**
   * 获取签到连续天数
   */
  getLoginStreak(): { streak: number; lastLogin: string } {
    const saved = localStorage.getItem('island_login_streak');
    if (saved) {
      return JSON.parse(saved);
    }
    return { streak: 0, lastLogin: '' };
  }

  /**
   * 领取每日签到
   */
  claimDailyLogin(): number {
    const data = this.getLoginStreak();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (data.lastLogin === yesterday) {
      // 连续签到
      data.streak += 1;
    } else if (data.lastLogin !== today) {
      // 断签或首次
      data.streak = 1;
    }

    data.lastLogin = today;
    localStorage.setItem('island_login_streak', JSON.stringify(data));
    return data.streak;
  }

  // ============ 商店相关 ============

  /**
   * 获取物品今日购买次数
   */
  getItemPurchaseCount(itemId: string): number {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('island_shop_purchases');
    
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        return data.items[itemId] || 0;
      }
    }
    return 0;
  }

  /**
   * 记录物品购买
   */
  recordItemPurchase(itemId: string): void {
    const today = new Date().toISOString().split('T')[0];
    let data = { date: today, items: {} as any };
    
    const saved = localStorage.getItem('island_shop_purchases');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        data = parsed;
      }
    }
    
    data.items[itemId] = (data.items[itemId] || 0) + 1;
    localStorage.setItem('island_shop_purchases', JSON.stringify(data));
  }

  /**
   * 添加体力（可超过上限）
   */
  addEnergy(amount: number): void {
    this.data.energy = Math.min(999, this.data.energy + amount);
    this.save();
  }

  /**
   * 设置无限体力
   */
  setUnlimitedEnergy(minutes: number): void {
    const expireTime = Date.now() + minutes * 60 * 1000;
    localStorage.setItem('island_unlimited_energy', expireTime.toString());
  }

  /**
   * 检查是否有无限体力
   */
  hasUnlimitedEnergy(): boolean {
    const saved = localStorage.getItem('island_unlimited_energy');
    if (saved) {
      const expireTime = parseInt(saved);
      return Date.now() < expireTime;
    }
    return false;
  }

  // ============ 背包相关 ============

  /**
   * 添加道具到背包
   */
  addInventoryItem(type: string, amount: number): void {
    const inventory = this.getInventory();
    inventory[type] = (inventory[type] || 0) + amount;
    localStorage.setItem('island_inventory', JSON.stringify(inventory));
  }

  /**
   * 使用背包道具
   */
  useInventoryItem(type: string, amount: number = 1): boolean {
    const inventory = this.getInventory();
    if ((inventory[type] || 0) >= amount) {
      inventory[type] -= amount;
      localStorage.setItem('island_inventory', JSON.stringify(inventory));
      return true;
    }
    return false;
  }

  /**
   * 获取背包
   */
  getInventory(): { [type: string]: number } {
    const saved = localStorage.getItem('island_inventory');
    return saved ? JSON.parse(saved) : {};
  }
}

// 单例
export const saveManager = new SaveManager();
