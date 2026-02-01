import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

interface Building {
  id: string;
  name: string;
  emoji: string;
  cost: { wood: number; stone: number; coin: number };
  built: boolean;
  x: number;
  y: number;
}

/**
 * 岛屿建设场景
 */
export class IslandScene extends Phaser.Scene {
  private buildings: Building[] = [];
  private resourceTexts: Map<string, Phaser.GameObjects.Text> = new Map();

  constructor() {
    super({ key: 'IslandScene' });
  }

  create(): void {
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
  }

  private createBackground(): void {
    // 海洋背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x4ecdc4, 0x4ecdc4, 0x0099cc, 0x0099cc, 1);
    bg.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    // 添加波浪效果
    for (let i = 0; i < 5; i++) {
      const wave = this.add.graphics();
      wave.fillStyle(0xffffff, 0.1);
      wave.fillEllipse(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 100 + i * 30, GameConfig.WIDTH + 200, 100);
    }
  }

  private initBuildings(): void {
    this.buildings = [
      {
        id: 'house',
        name: '小屋',
        emoji: '🏠',
        cost: { wood: 50, stone: 20, coin: 100 },
        built: true, // 初始已有
        x: 360,
        y: 600,
      },
      {
        id: 'shop',
        name: '商店',
        emoji: '🏪',
        cost: { wood: 80, stone: 40, coin: 200 },
        built: false,
        x: 200,
        y: 550,
      },
      {
        id: 'farm',
        name: '农场',
        emoji: '🌾',
        cost: { wood: 60, stone: 30, coin: 150 },
        built: false,
        x: 520,
        y: 550,
      },
      {
        id: 'dock',
        name: '码头',
        emoji: '⚓',
        cost: { wood: 100, stone: 50, coin: 300 },
        built: false,
        x: 150,
        y: 700,
      },
      {
        id: 'lighthouse',
        name: '灯塔',
        emoji: '🗼',
        cost: { wood: 120, stone: 80, coin: 500 },
        built: false,
        x: 550,
        y: 700,
      },
      {
        id: 'park',
        name: '公园',
        emoji: '🌳',
        cost: { wood: 40, stone: 10, coin: 80 },
        built: false,
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
    island.fillEllipse(centerX, centerY, 500, 300);

    // 草地
    island.fillStyle(0x27ae60, 1);
    island.fillEllipse(centerX, centerY - 30, 400, 200);

    // 绘制建筑
    this.buildings.forEach((building) => {
      this.drawBuilding(building);
    });
  }

  private drawBuilding(building: Building): void {
    if (building.built) {
      // 已建造：显示建筑
      const buildingSprite = this.add.text(building.x, building.y, building.emoji, {
        fontSize: '64px',
      }).setOrigin(0.5);

      // 点击查看详情
      buildingSprite.setInteractive({ useHandCursor: true });
      buildingSprite.on('pointerup', () => {
        this.showBuildingInfo(building);
      });

      // 名称标签
      this.add.text(building.x, building.y + 45, building.name, {
        fontSize: '16px',
        color: '#2c3e50',
        backgroundColor: '#ffffff',
        padding: { x: 8, y: 4 },
      }).setOrigin(0.5);
    } else {
      // 未建造：显示建造按钮
      const placeholder = this.add.text(building.x, building.y, '➕', {
        fontSize: '48px',
        color: '#ffffff',
      }).setOrigin(0.5).setAlpha(0.7);

      placeholder.setInteractive({ useHandCursor: true });
      placeholder.on('pointerup', () => {
        this.showBuildDialog(building);
      });

      // 虚线圆圈
      const circle = this.add.graphics();
      circle.lineStyle(2, 0xffffff, 0.5);
      circle.strokeCircle(building.x, building.y, 40);
    }
  }

  private createUI(): void {
    // 顶部资源栏
    const resourceBar = this.add.graphics();
    resourceBar.fillStyle(0x000000, 0.5);
    resourceBar.fillRoundedRect(20, 20, GameConfig.WIDTH - 40, 80, 15);

    const resources = this.registry.get('resources');

    const items = [
      { key: 'coin', emoji: '💰', value: resources.coin },
      { key: 'wood', emoji: '🪵', value: resources.wood },
      { key: 'stone', emoji: '🪨', value: resources.stone },
      { key: 'diamond', emoji: '💎', value: resources.diamond },
    ];

    items.forEach((item, index) => {
      const x = 60 + index * 170;
      const y = 60;

      this.add.text(x, y, item.emoji, {
        fontSize: '28px',
      }).setOrigin(0.5);

      const valueText = this.add.text(x + 50, y, `${item.value}`, {
        fontSize: '22px',
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
  }

  private createPlayButton(): void {
    const centerX = GameConfig.WIDTH / 2;

    const playBtn = this.add.image(centerX, GameConfig.HEIGHT - 150, 'button')
      .setScale(1.8, 1.2)
      .setInteractive({ useHandCursor: true });

    const playText = this.add.text(centerX, GameConfig.HEIGHT - 150, '🎮 玩关卡赚资源', {
      fontSize: '24px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    playBtn.on('pointerup', () => {
      this.scene.start('Match3Scene');
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

    const panel = this.add.image(0, 0, 'panel').setScale(2.5, 2.5);
    dialog.add(panel);

    // 建筑信息
    dialog.add(this.add.text(0, -120, building.emoji, { fontSize: '80px' }).setOrigin(0.5));
    dialog.add(this.add.text(0, -40, `建造 ${building.name}`, {
      fontSize: '28px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5));

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
    const resources = this.registry.get('resources');
    const canBuild = resources.wood >= building.cost.wood &&
                     resources.stone >= building.cost.stone &&
                     resources.coin >= building.cost.coin;

    // 建造按钮
    const buildBtn = this.add.image(0, 130, 'button')
      .setTint(canBuild ? 0xffffff : 0x888888)
      .setInteractive({ useHandCursor: canBuild });
    dialog.add(buildBtn);

    const btnText = canBuild ? '✓ 建造' : '✗ 资源不足';
    dialog.add(this.add.text(0, 130, btnText, {
      fontSize: '20px',
      color: canBuild ? '#2c3e50' : '#999999',
      fontStyle: 'bold',
    }).setOrigin(0.5));

    if (canBuild) {
      buildBtn.on('pointerup', () => {
        this.buildStructure(building);
        overlay.destroy();
        dialog.destroy();
        this.scene.restart();
      });
    }

    // 关闭按钮
    const closeBtn = this.add.text(180, -150, '✕', {
      fontSize: '32px',
      color: '#999999',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    dialog.add(closeBtn);

    closeBtn.on('pointerup', () => {
      overlay.destroy();
      dialog.destroy();
    });

    overlay.on('pointerup', () => {
      overlay.destroy();
      dialog.destroy();
    });
  }

  private buildStructure(building: Building): void {
    const resources = this.registry.get('resources');

    // 扣除资源
    resources.wood -= building.cost.wood;
    resources.stone -= building.cost.stone;
    resources.coin -= building.cost.coin;
    this.registry.set('resources', resources);

    // 标记为已建造
    building.built = true;
  }

  private showBuildingInfo(building: Building): void {
    const centerX = GameConfig.WIDTH / 2;
    const centerY = GameConfig.HEIGHT / 2;

    // 遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT), Phaser.Geom.Rectangle.Contains);

    // 对话框
    const dialog = this.add.container(centerX, centerY);

    const panel = this.add.image(0, 0, 'panel').setScale(2, 1.8);
    dialog.add(panel);

    dialog.add(this.add.text(0, -80, building.emoji, { fontSize: '64px' }).setOrigin(0.5));
    dialog.add(this.add.text(0, -10, building.name, {
      fontSize: '28px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5));

    dialog.add(this.add.text(0, 40, '等级 1 / 5', {
      fontSize: '18px',
      color: '#666666',
    }).setOrigin(0.5));

    dialog.add(this.add.text(0, 80, '产出: 💰 +10/小时', {
      fontSize: '18px',
      color: '#27ae60',
    }).setOrigin(0.5));

    // 关闭
    overlay.on('pointerup', () => {
      overlay.destroy();
      dialog.destroy();
    });
  }

  private createBackButton(): void {
    const backBtn = this.add.text(50, 120, '← 返回', {
      fontSize: '24px',
      color: '#ffffff',
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
