import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { saveManager } from '../managers/SaveManager';
import { AudioManager } from '../managers/AudioManager';

interface Building {
  id: string;
  name: string;
  emoji: string;
  cost: { wood: number; stone: number; coin: number };
  upgradeCost?: { wood: number; stone: number; coin: number };
  maxLevel: number;
  x: number;
  y: number;
  production?: { type: string; amount: number; interval: number }; // 每interval分钟产出amount
}

/**
 * 岛屿建设场景
 */
export class IslandScene extends Phaser.Scene {
  private buildings: Building[] = [];
  private resourceTexts: Map<string, Phaser.GameObjects.Text> = new Map();
  private audioManager!: AudioManager;
  private energyText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'IslandScene' });
  }

  create(): void {
    this.audioManager = new AudioManager(this);

    // 背景
    this.createBackground();

    // 初始化建筑数据
    this.initBuildings();

    // 绘制岛屿和建筑
    this.drawIsland();

    // UI
    this.createUI();

    // 返回按钮
    this.createBackButton();

    // 定时更新体力显示
    this.time.addEvent({
      delay: 1000,
      callback: this.updateEnergyDisplay,
      callbackScope: this,
      loop: true,
    });
  }

  private createBackground(): void {
    // 海洋背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x4ecdc4, 0x4ecdc4, 0x0099cc, 0x0099cc, 1);
    bg.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    // 添加波浪效果动画
    for (let i = 0; i < 5; i++) {
      const wave = this.add.graphics();
      wave.fillStyle(0xffffff, 0.1);
      wave.fillEllipse(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 100 + i * 30, GameConfig.WIDTH + 200, 100);

      this.tweens.add({
        targets: wave,
        x: 20,
        duration: 2000 + i * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private initBuildings(): void {
    this.buildings = [
      {
        id: 'house',
        name: '小屋',
        emoji: '🏠',
        cost: { wood: 0, stone: 0, coin: 0 },
        upgradeCost: { wood: 30, stone: 15, coin: 100 },
        maxLevel: 5,
        x: 360,
        y: 600,
      },
      {
        id: 'shop',
        name: '商店',
        emoji: '🏪',
        cost: { wood: 80, stone: 40, coin: 200 },
        upgradeCost: { wood: 50, stone: 30, coin: 150 },
        maxLevel: 3,
        x: 200,
        y: 550,
        production: { type: 'coin', amount: 20, interval: 30 },
      },
      {
        id: 'farm',
        name: '农场',
        emoji: '🌾',
        cost: { wood: 60, stone: 30, coin: 150 },
        upgradeCost: { wood: 40, stone: 20, coin: 100 },
        maxLevel: 3,
        x: 520,
        y: 550,
        production: { type: 'wood', amount: 10, interval: 20 },
      },
      {
        id: 'mine',
        name: '矿场',
        emoji: '⛏️',
        cost: { wood: 100, stone: 50, coin: 250 },
        upgradeCost: { wood: 60, stone: 40, coin: 200 },
        maxLevel: 3,
        x: 150,
        y: 650,
        production: { type: 'stone', amount: 8, interval: 25 },
      },
      {
        id: 'dock',
        name: '码头',
        emoji: '⚓',
        cost: { wood: 100, stone: 50, coin: 300 },
        upgradeCost: { wood: 80, stone: 60, coin: 250 },
        maxLevel: 3,
        x: 150,
        y: 750,
      },
      {
        id: 'lighthouse',
        name: '灯塔',
        emoji: '🗼',
        cost: { wood: 120, stone: 80, coin: 500 },
        upgradeCost: { wood: 100, stone: 80, coin: 400 },
        maxLevel: 3,
        x: 550,
        y: 700,
      },
      {
        id: 'park',
        name: '公园',
        emoji: '🌳',
        cost: { wood: 40, stone: 10, coin: 80 },
        upgradeCost: { wood: 25, stone: 10, coin: 60 },
        maxLevel: 3,
        x: 360,
        y: 750,
      },
    ];
  }

  private drawIsland(): void {
    const centerX = GameConfig.WIDTH / 2;
    const centerY = 650;

    // 岛屿主体
    const island = this.add.graphics();
    island.fillStyle(0xf4d03f, 1); // 沙滩颜色
    island.fillEllipse(centerX, centerY, 500, 350);

    // 草地
    island.fillStyle(0x27ae60, 1);
    island.fillEllipse(centerX, centerY - 30, 420, 250);

    // 绘制建筑
    this.buildings.forEach((building) => {
      this.drawBuilding(building);
    });
  }

  private drawBuilding(building: Building): void {
    const savedBuilding = saveManager.getBuilding(building.id);
    const isBuilt = savedBuilding?.built || building.id === 'house'; // 小屋默认有

    if (isBuilt) {
      const level = savedBuilding?.level || 1;

      // 已建造：显示建筑
      const buildingSprite = this.add.text(building.x, building.y, building.emoji, {
        fontSize: '64px',
      }).setOrigin(0.5);

      // 点击查看详情
      buildingSprite.setInteractive({ useHandCursor: true });
      buildingSprite.on('pointerup', () => {
        this.audioManager.playClick();
        this.showBuildingInfo(building, level);
      });

      // 名称和等级标签
      this.add.text(building.x, building.y + 45, `${building.name} Lv.${level}`, {
        fontSize: '14px',
        color: '#2c3e50',
        backgroundColor: '#ffffff',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5);

      // 产出指示器
      if (building.production) {
        const productionIcon = building.production.type === 'coin' ? '💰' :
                              building.production.type === 'wood' ? '🪵' : '🪨';
        this.add.text(building.x + 35, building.y - 30, productionIcon, {
          fontSize: '20px',
        }).setOrigin(0.5);
      }
    } else {
      // 未建造：显示建造按钮
      const placeholder = this.add.text(building.x, building.y, '➕', {
        fontSize: '48px',
        color: '#ffffff',
      }).setOrigin(0.5).setAlpha(0.7);

      placeholder.setInteractive({ useHandCursor: true });
      placeholder.on('pointerup', () => {
        this.audioManager.playClick();
        this.showBuildDialog(building);
      });

      // 虚线圆圈
      const circle = this.add.graphics();
      circle.lineStyle(2, 0xffffff, 0.5);
      circle.strokeCircle(building.x, building.y, 40);

      // 名称
      this.add.text(building.x, building.y + 45, building.name, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5).setAlpha(0.7);
    }
  }

  private createUI(): void {
    // 顶部资源栏
    const resourceBar = this.add.graphics();
    resourceBar.fillStyle(0x000000, 0.5);
    resourceBar.fillRoundedRect(20, 20, GameConfig.WIDTH - 40, 80, 15);

    const resources = saveManager.getResources();
    const energy = saveManager.getEnergy();

    // 体力
    this.add.text(50, 45, '⚡', { fontSize: '24px' });
    this.energyText = this.add.text(80, 45, `${energy}/30`, {
      fontSize: '20px',
      color: energy >= 5 ? '#4ecdc4' : '#ff6b6b',
      fontStyle: 'bold',
    });

    // 资源
    const items = [
      { key: 'coin', emoji: '💰', value: resources.coin },
      { key: 'wood', emoji: '🪵', value: resources.wood },
      { key: 'stone', emoji: '🪨', value: resources.stone },
      { key: 'diamond', emoji: '💎', value: resources.diamond },
    ];

    items.forEach((item, index) => {
      const x = 180 + index * 130;
      const y = 60;

      this.add.text(x, y, item.emoji, {
        fontSize: '24px',
      }).setOrigin(0.5);

      const valueText = this.add.text(x + 30, y, `${item.value}`, {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      this.resourceTexts.set(item.key, valueText);
    });

    // 玩关卡按钮
    this.createPlayButton();

    // 标题
    this.add.text(GameConfig.WIDTH / 2, 150, '🏝️ 我的小岛', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 3,
        fill: true,
      },
    }).setOrigin(0.5);

    // 当前关卡进度
    const currentLevel = saveManager.getCurrentLevel();
    this.add.text(GameConfig.WIDTH / 2, 190, `已通关 ${currentLevel - 1} 关`, {
      fontSize: '18px',
      color: '#ffe66d',
    }).setOrigin(0.5);
  }

  private updateEnergyDisplay(): void {
    const energy = saveManager.getEnergy();
    this.energyText.setText(`${energy}/30`);
    this.energyText.setColor(energy >= 5 ? '#4ecdc4' : '#ff6b6b');
  }

  private createPlayButton(): void {
    const centerX = GameConfig.WIDTH / 2;

    const playBtn = this.add.image(centerX, GameConfig.HEIGHT - 100, 'button')
      .setScale(1.8, 1.2)
      .setInteractive({ useHandCursor: true });

    const playText = this.add.text(centerX, GameConfig.HEIGHT - 100, '🎮 玩关卡赚资源', {
      fontSize: '24px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    playBtn.on('pointerup', () => {
      this.audioManager.playClick();
      this.scene.start('LevelSelectScene');
    });

    playBtn.on('pointerover', () => {
      playBtn.setTint(0xdddddd);
    });

    playBtn.on('pointerout', () => {
      playBtn.clearTint();
    });
  }

  private showBuildDialog(building: Building): void {
    const centerX = GameConfig.WIDTH / 2;
    const centerY = GameConfig.HEIGHT / 2;

    // 遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT), Phaser.Geom.Rectangle.Contains);

    // 对话框
    const dialog = this.add.container(centerX, centerY);

    const panel = this.add.image(0, 0, 'panel').setScale(2.5, 2.8);
    dialog.add(panel);

    // 建筑信息
    dialog.add(this.add.text(0, -140, building.emoji, { fontSize: '80px' }).setOrigin(0.5));
    dialog.add(this.add.text(0, -60, `建造 ${building.name}`, {
      fontSize: '28px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5));

    // 产出说明
    if (building.production) {
      const prodIcon = building.production.type === 'coin' ? '💰' :
                       building.production.type === 'wood' ? '🪵' : '🪨';
      dialog.add(this.add.text(0, -20, `产出: ${prodIcon} +${building.production.amount}/${building.production.interval}分钟`, {
        fontSize: '18px',
        color: '#27ae60',
      }).setOrigin(0.5));
    }

    // 所需资源
    dialog.add(this.add.text(0, 20, '所需资源：', {
      fontSize: '20px',
      color: '#666666',
    }).setOrigin(0.5));

    const costText = `🪵 ${building.cost.wood}  🪨 ${building.cost.stone}  💰 ${building.cost.coin}`;
    dialog.add(this.add.text(0, 55, costText, {
      fontSize: '22px',
      color: '#2c3e50',
    }).setOrigin(0.5));

    // 检查资源是否足够
    const resources = saveManager.getResources();
    const canBuild = resources.wood >= building.cost.wood &&
                     resources.stone >= building.cost.stone &&
                     resources.coin >= building.cost.coin;

    // 当前资源
    dialog.add(this.add.text(0, 95, `你有: 🪵${resources.wood} 🪨${resources.stone} 💰${resources.coin}`, {
      fontSize: '16px',
      color: canBuild ? '#27ae60' : '#e74c3c',
    }).setOrigin(0.5));

    // 建造按钮
    const buildBtn = this.add.image(0, 150, 'button')
      .setTint(canBuild ? 0xffffff : 0x888888)
      .setInteractive({ useHandCursor: canBuild });
    dialog.add(buildBtn);

    const btnText = canBuild ? '✓ 建造' : '✗ 资源不足';
    dialog.add(this.add.text(0, 150, btnText, {
      fontSize: '20px',
      color: canBuild ? '#2c3e50' : '#999999',
      fontStyle: 'bold',
    }).setOrigin(0.5));

    if (canBuild) {
      buildBtn.on('pointerup', () => {
        this.buildStructure(building);
        this.audioManager.playBuild();
        overlay.destroy();
        dialog.destroy();
        this.scene.restart();
      });
    }

    // 关闭按钮
    const closeBtn = this.add.text(180, -170, '✕', {
      fontSize: '32px',
      color: '#999999',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    dialog.add(closeBtn);

    const closeDialog = () => {
      overlay.destroy();
      dialog.destroy();
    };

    closeBtn.on('pointerup', () => {
      this.audioManager.playClick();
      closeDialog();
    });

    overlay.on('pointerup', closeDialog);
  }

  private buildStructure(building: Building): void {
    // 扣除资源
    saveManager.updateResources({
      wood: -building.cost.wood,
      stone: -building.cost.stone,
      coin: -building.cost.coin,
    });

    // 保存建筑状态
    saveManager.buildBuilding(building.id);
  }

  private showBuildingInfo(building: Building, level: number): void {
    const centerX = GameConfig.WIDTH / 2;
    const centerY = GameConfig.HEIGHT / 2;

    // 遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT), Phaser.Geom.Rectangle.Contains);

    // 对话框
    const dialog = this.add.container(centerX, centerY);

    const panel = this.add.image(0, 0, 'panel').setScale(2.2, 2.5);
    dialog.add(panel);

    dialog.add(this.add.text(0, -120, building.emoji, { fontSize: '64px' }).setOrigin(0.5));
    dialog.add(this.add.text(0, -50, building.name, {
      fontSize: '28px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5));

    dialog.add(this.add.text(0, -10, `等级 ${level} / ${building.maxLevel}`, {
      fontSize: '20px',
      color: '#666666',
    }).setOrigin(0.5));

    // 产出信息
    if (building.production) {
      const prodIcon = building.production.type === 'coin' ? '💰' :
                       building.production.type === 'wood' ? '🪵' : '🪨';
      const amount = building.production.amount * level;
      dialog.add(this.add.text(0, 30, `产出: ${prodIcon} +${amount}/${building.production.interval}分钟`, {
        fontSize: '18px',
        color: '#27ae60',
      }).setOrigin(0.5));
    }

    // 升级按钮（如果未满级）
    if (level < building.maxLevel && building.upgradeCost) {
      const upgradeCost = {
        wood: building.upgradeCost.wood * level,
        stone: building.upgradeCost.stone * level,
        coin: building.upgradeCost.coin * level,
      };

      dialog.add(this.add.text(0, 70, '升级所需:', {
        fontSize: '16px',
        color: '#666666',
      }).setOrigin(0.5));

      dialog.add(this.add.text(0, 95, `🪵${upgradeCost.wood} 🪨${upgradeCost.stone} 💰${upgradeCost.coin}`, {
        fontSize: '18px',
        color: '#2c3e50',
      }).setOrigin(0.5));

      const resources = saveManager.getResources();
      const canUpgrade = resources.wood >= upgradeCost.wood &&
                         resources.stone >= upgradeCost.stone &&
                         resources.coin >= upgradeCost.coin;

      const upgradeBtn = this.add.image(0, 145, 'button')
        .setTint(canUpgrade ? 0xffffff : 0x888888)
        .setInteractive({ useHandCursor: canUpgrade });
      dialog.add(upgradeBtn);

      dialog.add(this.add.text(0, 145, canUpgrade ? '⬆️ 升级' : '资源不足', {
        fontSize: '18px',
        color: canUpgrade ? '#2c3e50' : '#999999',
        fontStyle: 'bold',
      }).setOrigin(0.5));

      if (canUpgrade) {
        upgradeBtn.on('pointerup', () => {
          // TODO: 实现升级逻辑
          this.audioManager.playBuild();
          overlay.destroy();
          dialog.destroy();
        });
      }
    } else if (level >= building.maxLevel) {
      dialog.add(this.add.text(0, 80, '⭐ 已满级 ⭐', {
        fontSize: '22px',
        color: '#f1c40f',
        fontStyle: 'bold',
      }).setOrigin(0.5));
    }

    // 关闭
    const closeDialog = () => {
      overlay.destroy();
      dialog.destroy();
    };

    overlay.on('pointerup', closeDialog);
  }

  private createBackButton(): void {
    const backBtn = this.add.text(50, 120, '← 返回', {
      fontSize: '24px',
      color: '#ffffff',
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => {
      this.audioManager.playClick();
      this.scene.start('MainMenuScene');
    });
  }
}
