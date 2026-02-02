import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { saveManager } from '../managers/SaveManager';

/**
 * 物品配置
 */
interface ItemConfig {
  key: string;
  name: string;
  emoji: string;
  tier: number;        // 等级
  mergeInto?: string;  // 合成后变成什么
  value?: number;      // 金币价值
}

/**
 * 物品合成树
 */
const ITEMS: { [key: string]: ItemConfig } = {
  // 木材线 (8级)
  'wood1': { key: 'wood1', name: '树枝', emoji: '🌿', tier: 1, mergeInto: 'wood2' },
  'wood2': { key: 'wood2', name: '木头', emoji: '🪵', tier: 2, mergeInto: 'wood3' },
  'wood3': { key: 'wood3', name: '木板', emoji: '🪓', tier: 3, mergeInto: 'wood4' },
  'wood4': { key: 'wood4', name: '木箱', emoji: '📦', tier: 4, mergeInto: 'wood5' },
  'wood5': { key: 'wood5', name: '木屋', emoji: '🏠', tier: 5, mergeInto: 'wood6' },
  'wood6': { key: 'wood6', name: '别墅', emoji: '🏡', tier: 6, mergeInto: 'wood7' },
  'wood7': { key: 'wood7', name: '豪宅', emoji: '🏰', tier: 7, mergeInto: 'wood8' },
  'wood8': { key: 'wood8', name: '宫殿', emoji: '🏯', tier: 8 },
  
  // 石材线 (8级)
  'stone1': { key: 'stone1', name: '碎石', emoji: '🪨', tier: 1, mergeInto: 'stone2' },
  'stone2': { key: 'stone2', name: '石块', emoji: '🧱', tier: 2, mergeInto: 'stone3' },
  'stone3': { key: 'stone3', name: '石墙', emoji: '🧱', tier: 3, mergeInto: 'stone4' },
  'stone4': { key: 'stone4', name: '石塔', emoji: '🗼', tier: 4, mergeInto: 'stone5' },
  'stone5': { key: 'stone5', name: '城堡', emoji: '🏛️', tier: 5, mergeInto: 'stone6' },
  'stone6': { key: 'stone6', name: '要塞', emoji: '🏰', tier: 6, mergeInto: 'stone7' },
  'stone7': { key: 'stone7', name: '神殿', emoji: '⛩️', tier: 7, mergeInto: 'stone8' },
  'stone8': { key: 'stone8', name: '奇迹', emoji: '🗿', tier: 8 },
  
  // 食物线 (8级)
  'food1': { key: 'food1', name: '种子', emoji: '🌱', tier: 1, mergeInto: 'food2' },
  'food2': { key: 'food2', name: '草芽', emoji: '🌿', tier: 2, mergeInto: 'food3' },
  'food3': { key: 'food3', name: '蔬菜', emoji: '🥕', tier: 3, mergeInto: 'food4' },
  'food4': { key: 'food4', name: '水果', emoji: '🍎', tier: 4, mergeInto: 'food5' },
  'food5': { key: 'food5', name: '面包', emoji: '🍞', tier: 5, mergeInto: 'food6' },
  'food6': { key: 'food6', name: '蛋糕', emoji: '🎂', tier: 6, mergeInto: 'food7' },
  'food7': { key: 'food7', name: '盛宴', emoji: '🍱', tier: 7, mergeInto: 'food8' },
  'food8': { key: 'food8', name: '满汉全席', emoji: '🥘', tier: 8 },
  
  // 矿石线 (8级) - 新增
  'ore1': { key: 'ore1', name: '煤矿', emoji: '⬛', tier: 1, mergeInto: 'ore2' },
  'ore2': { key: 'ore2', name: '铜矿', emoji: '🪙', tier: 2, mergeInto: 'ore3' },
  'ore3': { key: 'ore3', name: '铁矿', emoji: '⚙️', tier: 3, mergeInto: 'ore4' },
  'ore4': { key: 'ore4', name: '银矿', emoji: '🥈', tier: 4, mergeInto: 'ore5' },
  'ore5': { key: 'ore5', name: '金矿', emoji: '🥇', tier: 5, mergeInto: 'ore6' },
  'ore6': { key: 'ore6', name: '宝石', emoji: '💎', tier: 6, mergeInto: 'ore7' },
  'ore7': { key: 'ore7', name: '神秘矿', emoji: '🔮', tier: 7, mergeInto: 'ore8' },
  'ore8': { key: 'ore8', name: '永恒石', emoji: '✨', tier: 8 },
  
  // 布料线 (8级) - 新增
  'cloth1': { key: 'cloth1', name: '棉花', emoji: '☁️', tier: 1, mergeInto: 'cloth2' },
  'cloth2': { key: 'cloth2', name: '线团', emoji: '🧶', tier: 2, mergeInto: 'cloth3' },
  'cloth3': { key: 'cloth3', name: '布匹', emoji: '🧵', tier: 3, mergeInto: 'cloth4' },
  'cloth4': { key: 'cloth4', name: '衣服', emoji: '👕', tier: 4, mergeInto: 'cloth5' },
  'cloth5': { key: 'cloth5', name: '礼服', emoji: '👗', tier: 5, mergeInto: 'cloth6' },
  'cloth6': { key: 'cloth6', name: '皇袍', emoji: '👘', tier: 6, mergeInto: 'cloth7' },
  'cloth7': { key: 'cloth7', name: '神衣', emoji: '🥻', tier: 7, mergeInto: 'cloth8' },
  'cloth8': { key: 'cloth8', name: '传说披风', emoji: '🦸', tier: 8 },
  
  // 工具线 (8级) - 新增
  'tool1': { key: 'tool1', name: '木棍', emoji: '🥢', tier: 1, mergeInto: 'tool2' },
  'tool2': { key: 'tool2', name: '石斧', emoji: '🪓', tier: 2, mergeInto: 'tool3' },
  'tool3': { key: 'tool3', name: '铁锤', emoji: '🔨', tier: 3, mergeInto: 'tool4' },
  'tool4': { key: 'tool4', name: '钢剑', emoji: '⚔️', tier: 4, mergeInto: 'tool5' },
  'tool5': { key: 'tool5', name: '魔杖', emoji: '🪄', tier: 5, mergeInto: 'tool6' },
  'tool6': { key: 'tool6', name: '神器', emoji: '🔱', tier: 6, mergeInto: 'tool7' },
  'tool7': { key: 'tool7', name: '圣剑', emoji: '🗡️', tier: 7, mergeInto: 'tool8' },
  'tool8': { key: 'tool8', name: '创世神器', emoji: '⚡', tier: 8 },
  
  // 金币线 (8级)
  'coin1': { key: 'coin1', name: '1金币', emoji: '🪙', tier: 1, value: 1, mergeInto: 'coin2' },
  'coin2': { key: 'coin2', name: '5金币', emoji: '💰', tier: 2, value: 5, mergeInto: 'coin3' },
  'coin3': { key: 'coin3', name: '25金币', emoji: '💰', tier: 3, value: 25, mergeInto: 'coin4' },
  'coin4': { key: 'coin4', name: '125金币', emoji: '💎', tier: 4, value: 125, mergeInto: 'coin5' },
  'coin5': { key: 'coin5', name: '625金币', emoji: '💎', tier: 5, value: 625, mergeInto: 'coin6' },
  'coin6': { key: 'coin6', name: '3125金币', emoji: '👑', tier: 6, value: 3125, mergeInto: 'coin7' },
  'coin7': { key: 'coin7', name: '15625金币', emoji: '👑', tier: 7, value: 15625, mergeInto: 'coin8' },
  'coin8': { key: 'coin8', name: '78125金币', emoji: '🏆', tier: 8, value: 78125 },
  
  // 特殊：仓库
  'warehouse': { key: 'warehouse', name: '仓库', emoji: '🏪', tier: 0 },
};

/**
 * 仓库可以吐出的物品（权重）
 */
const WAREHOUSE_DROPS: { key: string; weight: number }[] = [
  { key: 'wood1', weight: 22 },
  { key: 'stone1', weight: 22 },
  { key: 'food1', weight: 22 },
  { key: 'ore1', weight: 16 },
  { key: 'cloth1', weight: 12 },
  { key: 'tool1', weight: 10 },
  { key: 'coin1', weight: 1 },  // 金币极稀有 ~1%
];

/**
 * 场上的物品
 */
interface PlacedItem {
  id: number;
  config: ItemConfig;
  x: number;
  y: number;
  container: Phaser.GameObjects.Container;
  lastClickTime?: number;  // 用于双击检测
}

/**
 * 合成游戏主场景
 */
export class MergeScene extends Phaser.Scene {
  private items: PlacedItem[] = [];
  private selectedItem: PlacedItem | null = null;
  private nextId: number = 1;
  
  // UI
  private goldText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;
  
  // 网格配置
  private readonly GRID_COLS = 6;
  private readonly GRID_ROWS = 5;
  private readonly CELL_SIZE = 80;
  private readonly GRID_OFFSET_X = 60;
  private readonly GRID_OFFSET_Y = 150;

  constructor() {
    super({ key: 'MergeScene' });
  }

  create(): void {
    // 背景
    this.cameras.main.setBackgroundColor('#2d5a27');
    
    // 创建UI
    this.createUI();
    
    // 创建网格
    this.createGrid();
    
    // 尝试加载存档
    if (!this.loadGame()) {
      // 没有存档，初始化新游戏
      this.spawnWarehouse(2, 2);
      this.spawnItem('wood1', 0, 0);
      this.spawnItem('wood1', 1, 0);
      this.spawnItem('stone1', 0, 1);
    }
    
    this.showInfo('点击仓库获取物品，点击两个相同物品合成！');
  }

  /**
   * 创建UI
   */
  private createUI(): void {
    // 标题
    this.add.text(GameConfig.WIDTH / 2, 30, '🏝️ 小岛物语 - 合成', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // 资源显示（和其他模式共用）
    const resources = saveManager.getResources();
    const energy = saveManager.getEnergy();
    
    // 体力
    this.energyText = this.add.text(GameConfig.WIDTH / 2 - 150, 75, `⚡ ${energy}`, {
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // 金币
    this.goldText = this.add.text(GameConfig.WIDTH / 2, 75, `💰 ${resources.coin}`, {
      fontSize: '22px',
      color: '#ffd700',
    }).setOrigin(0.5);
    
    // 木材
    this.add.text(GameConfig.WIDTH / 2 + 100, 75, `🪵 ${resources.wood}`, {
      fontSize: '22px',
      color: '#8B4513',
    }).setOrigin(0.5);
    
    // 石材
    this.add.text(GameConfig.WIDTH / 2 + 200, 75, `🪨 ${resources.stone}`, {
      fontSize: '22px',
      color: '#808080',
    }).setOrigin(0.5);
    
    // 信息提示
    this.infoText = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 50, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);
    
    // 返回按钮
    const backBtn = this.add.text(50, 30, '← 返回', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    
    backBtn.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

  /**
   * 创建网格
   */
  private createGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.3);
    
    for (let row = 0; row < this.GRID_ROWS; row++) {
      for (let col = 0; col < this.GRID_COLS; col++) {
        const x = this.GRID_OFFSET_X + col * this.CELL_SIZE;
        const y = this.GRID_OFFSET_Y + row * this.CELL_SIZE;
        graphics.strokeRect(x, y, this.CELL_SIZE, this.CELL_SIZE);
      }
    }
  }

  /**
   * 获取格子中心坐标
   */
  private getCellCenter(col: number, row: number): { x: number; y: number } {
    return {
      x: this.GRID_OFFSET_X + col * this.CELL_SIZE + this.CELL_SIZE / 2,
      y: this.GRID_OFFSET_Y + row * this.CELL_SIZE + this.CELL_SIZE / 2,
    };
  }

  /**
   * 在指定位置生成物品
   */
  private spawnItem(key: string, col: number, row: number): PlacedItem | null {
    const config = ITEMS[key];
    if (!config) return null;
    
    // 检查位置是否已占用
    if (this.getItemAt(col, row)) {
      // 找空位
      const empty = this.findEmptyCell();
      if (!empty) {
        this.showInfo('❌ 没有空位了！');
        return null;
      }
      col = empty.col;
      row = empty.row;
    }
    
    const pos = this.getCellCenter(col, row);
    
    // 创建容器
    const container = this.add.container(pos.x, pos.y);
    
    // 背景圆
    const bg = this.add.circle(0, 0, 32, this.getTierColor(config.tier), 0.8);
    container.add(bg);
    
    // Emoji
    const emoji = this.add.text(0, 0, config.emoji, {
      fontSize: '40px',
    }).setOrigin(0.5);
    container.add(emoji);
    
    // 等级指示（如果不是仓库）
    if (config.tier > 0) {
      const tierBadge = this.add.text(20, -20, `${config.tier}`, {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5);
      container.add(tierBadge);
    }
    
    const item: PlacedItem = {
      id: this.nextId++,
      config,
      x: col,
      y: row,
      container,
    };
    
    this.items.push(item);
    
    // 点击事件
    container.setSize(64, 64);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.onItemClick(item));
    
    // 出现动画
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 200,
      ease: 'Back.out',
    });
    
    return item;
  }

  /**
   * 生成仓库
   */
  private spawnWarehouse(col: number, row: number): void {
    const item = this.spawnItem('warehouse', col, row);
    if (item) {
      // 仓库有特殊动画
      this.tweens.add({
        targets: item.container,
        scaleX: 1.05,
        scaleY: 0.95,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    }
  }

  /**
   * 点击物品
   */
  private onItemClick(item: PlacedItem): void {
    // 仓库特殊处理
    if (item.config.key === 'warehouse') {
      this.onWarehouseClick(item);
      return;
    }
    
    // 金币特殊处理 - 双击收集，单击可合成
    if (item.config.value) {
      const now = Date.now();
      const lastClick = item.lastClickTime || 0;
      item.lastClickTime = now;
      
      // 双击检测（300ms内）
      if (now - lastClick < 300) {
        this.collectCoin(item);
        return;
      }
      
      // 单击 - 和普通物品一样可以选中/合成
    }
    
    // 如果没有选中 - 选中这个
    if (!this.selectedItem) {
      this.selectItem(item);
      return;
    }
    
    // 如果点击同一个 - 取消选中
    if (this.selectedItem.id === item.id) {
      this.deselectItem();
      return;
    }
    
    // 如果可以合成
    if (this.selectedItem.config.key === item.config.key && item.config.mergeInto) {
      this.mergeItems(this.selectedItem, item);
      return;
    }
    
    // 否则切换选中
    this.deselectItem();
    this.selectItem(item);
  }

  /**
   * 选中物品
   */
  private selectItem(item: PlacedItem): void {
    this.selectedItem = item;
    
    // 高亮效果
    this.tweens.add({
      targets: item.container,
      scale: 1.2,
      duration: 100,
    });
    
    // 显示可合成的物品
    const samePkg = this.items.filter(i => 
      i.id !== item.id && 
      i.config.key === item.config.key
    );
    
    if (samePkg.length > 0) {
      this.showInfo(`✅ 找到 ${samePkg.length} 个相同物品可以合成！`);
      // 高亮其他相同物品
      samePkg.forEach(i => {
        this.tweens.add({
          targets: i.container,
          scale: 1.1,
          duration: 200,
          yoyo: true,
          repeat: -1,
        });
      });
    } else if (item.config.mergeInto) {
      this.showInfo(`选中了 ${item.config.emoji} ${item.config.name}，需要另一个相同物品合成`);
    } else {
      this.showInfo(`${item.config.emoji} ${item.config.name} 已经是最高级！`);
    }
  }

  /**
   * 取消选中
   */
  private deselectItem(): void {
    if (!this.selectedItem) return;
    
    // 恢复所有物品大小
    this.items.forEach(item => {
      this.tweens.killTweensOf(item.container);
      item.container.setScale(1);
    });
    
    this.selectedItem = null;
    this.showInfo('');
  }

  /**
   * 合成物品
   */
  private mergeItems(item1: PlacedItem, item2: PlacedItem): void {
    const mergeInto = item1.config.mergeInto;
    if (!mergeInto) return;
    
    // 检查体力
    if (!saveManager.useEnergy(1)) {
      this.showInfo('❌ 体力不足！');
      this.deselectItem();
      return;
    }
    this.updateEnergyUI();
    
    const targetPos = { x: item2.x, y: item2.y };
    
    // 移动动画
    this.tweens.add({
      targets: item1.container,
      x: item2.container.x,
      y: item2.container.y,
      scale: 0,
      duration: 200,
      ease: 'Quad.in',
      onComplete: () => {
        // 删除两个物品
        this.removeItem(item1);
        this.removeItem(item2);
        
        // 生成新物品
        const newItem = this.spawnItem(mergeInto, targetPos.x, targetPos.y);
        
        if (newItem) {
          // 合成特效
          this.createMergeEffect(newItem.container.x, newItem.container.y);
          this.showInfo(`🎉 合成了 ${newItem.config.emoji} ${newItem.config.name}！`);
        }
        
        this.selectedItem = null;
        this.saveGame();  // 保存
      },
    });
    
    // 缩小item2
    this.tweens.add({
      targets: item2.container,
      scale: 0,
      duration: 200,
    });
  }

  /**
   * 点击仓库
   */
  private onWarehouseClick(warehouse: PlacedItem): void {
    // 检查体力
    if (!saveManager.useEnergy(1)) {
      this.showInfo('❌ 体力不足！');
      return;
    }
    this.updateEnergyUI();
    
    // 找空位
    const empty = this.findEmptyCell();
    if (!empty) {
      this.showInfo('❌ 没有空位了！先合成一些物品');
      return;
    }
    
    // 随机选择物品
    const total = WAREHOUSE_DROPS.reduce((sum, d) => sum + d.weight, 0);
    let rand = Math.random() * total;
    let selected = WAREHOUSE_DROPS[0].key;
    
    for (const drop of WAREHOUSE_DROPS) {
      rand -= drop.weight;
      if (rand <= 0) {
        selected = drop.key;
        break;
      }
    }
    
    // 生成物品
    const newItem = this.spawnItem(selected, empty.col, empty.row);
    
    if (newItem) {
      // 从仓库飞出的效果
      newItem.container.setPosition(warehouse.container.x, warehouse.container.y);
      this.tweens.add({
        targets: newItem.container,
        x: this.getCellCenter(empty.col, empty.row).x,
        y: this.getCellCenter(empty.col, empty.row).y,
        duration: 300,
        ease: 'Quad.out',
      });
      
      this.showInfo(`📦 获得了 ${newItem.config.emoji} ${newItem.config.name}！`);
      this.saveGame();  // 保存
    }
    
    // 仓库弹跳效果
    this.tweens.add({
      targets: warehouse.container,
      scale: 1.3,
      duration: 100,
      yoyo: true,
    });
  }

  /**
   * 收集金币
   */
  private collectCoin(item: PlacedItem): void {
    const value = item.config.value || 0;
    saveManager.updateResources({ coin: value });
    const newCoin = saveManager.getResources().coin;
    this.goldText.setText(`💰 ${newCoin}`);
    
    // 飞向金币UI的效果
    this.tweens.add({
      targets: item.container,
      x: GameConfig.WIDTH / 2,
      y: 75,
      scale: 0,
      duration: 300,
      ease: 'Quad.in',
      onComplete: () => {
        this.removeItem(item);
        this.saveGame();  // 保存合成场景物品
      },
    });
    
    this.showInfo(`💰 +${value} 金币！总计: ${newCoin}`);
  }

  /**
   * 删除物品
   */
  private removeItem(item: PlacedItem): void {
    const index = this.items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      this.items.splice(index, 1);
      item.container.destroy();
    }
  }

  /**
   * 找空格子
   */
  private findEmptyCell(): { col: number; row: number } | null {
    for (let row = 0; row < this.GRID_ROWS; row++) {
      for (let col = 0; col < this.GRID_COLS; col++) {
        if (!this.getItemAt(col, row)) {
          return { col, row };
        }
      }
    }
    return null;
  }

  /**
   * 获取指定位置的物品
   */
  private getItemAt(col: number, row: number): PlacedItem | undefined {
    return this.items.find(i => i.x === col && i.y === row);
  }

  /**
   * 获取等级对应颜色
   */
  private getTierColor(tier: number): number {
    const colors = [
      0x808080, // 0 - 灰色（仓库）
      0x8B4513, // 1 - 棕色
      0x228B22, // 2 - 绿色
      0x4169E1, // 3 - 蓝色
      0x9932CC, // 4 - 紫色
      0xFFD700, // 5 - 金色
    ];
    return colors[tier] || 0xffffff;
  }

  /**
   * 合成特效
   */
  private createMergeEffect(x: number, y: number): void {
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      quantity: 10,
      emitting: false,
    });
    particles.explode();
    
    // 星星效果（使用文字代替）
    for (let i = 0; i < 5; i++) {
      const star = this.add.text(x, y, '✨', { fontSize: '24px' }).setOrigin(0.5);
      const angle = (i / 5) * Math.PI * 2;
      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        alpha: 0,
        duration: 400,
        onComplete: () => star.destroy(),
      });
    }
  }

  /**
   * 显示信息
   */
  private showInfo(text: string): void {
    this.infoText.setText(text);
  }

  /**
   * 更新体力UI
   */
  private updateEnergyUI(): void {
    const energy = saveManager.getEnergy();
    this.energyText.setText(`⚡ ${energy}`);
  }

  /**
   * 保存游戏（只保存合成场景的物品布局）
   */
  private saveGame(): void {
    const saveData = {
      nextId: this.nextId,
      items: this.items.map(item => ({
        key: item.config.key,
        x: item.x,
        y: item.y,
      })),
    };
    localStorage.setItem('merge_save', JSON.stringify(saveData));
  }

  /**
   * 加载游戏
   */
  private loadGame(): boolean {
    const saved = localStorage.getItem('merge_save');
    if (!saved) return false;
    
    try {
      const data = JSON.parse(saved);
      this.nextId = data.nextId || 1;
      
      // 恢复物品
      for (const itemData of data.items || []) {
        if (itemData.key === 'warehouse') {
          this.spawnWarehouse(itemData.x, itemData.y);
        } else {
          this.spawnItem(itemData.key, itemData.x, itemData.y);
        }
      }
      
      return true;
    } catch (e) {
      console.error('加载存档失败', e);
      return false;
    }
  }
}
