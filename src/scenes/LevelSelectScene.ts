import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { getLevelConfig, LEVELS } from '../config/LevelConfig';
import { saveManager } from '../managers/SaveManager';
import { AudioManager } from '../managers/AudioManager';

/**
 * 关卡选择场景
 */
export class LevelSelectScene extends Phaser.Scene {
  private audioManager!: AudioManager;
  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private levelContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(): void {
    this.audioManager = new AudioManager(this);

    // 背景
    this.add.graphics()
      .fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1)
      .fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    // 标题
    this.add.text(GameConfig.WIDTH / 2, 60, '选择关卡', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 资源显示
    this.createResourceBar();

    // 返回按钮
    this.createBackButton();

    // 关卡列表容器
    this.levelContainer = this.add.container(0, 0);
    this.createLevelGrid();

    // 设置滚动区域
    const maskShape = this.make.graphics({});
    maskShape.fillRect(0, 150, GameConfig.WIDTH, GameConfig.HEIGHT - 200);
    const mask = maskShape.createGeometryMask();
    this.levelContainer.setMask(mask);

    // 添加滚动交互
    this.input.on('wheel', (pointer: any, _: any, __: any, deltaY: number) => {
      this.scrollY = Phaser.Math.Clamp(
        this.scrollY + deltaY * 0.5,
        0,
        this.maxScrollY
      );
      this.levelContainer.y = -this.scrollY + 150;
    });

    // 触摸滚动
    let startY = 0;
    let startScrollY = 0;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      startY = pointer.y;
      startScrollY = this.scrollY;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        const deltaY = startY - pointer.y;
        this.scrollY = Phaser.Math.Clamp(
          startScrollY + deltaY,
          0,
          this.maxScrollY
        );
        this.levelContainer.y = -this.scrollY + 150;
      }
    });
  }

  private createResourceBar(): void {
    const resources = saveManager.getResources();
    const y = 110;
    const startX = 50;
    const spacing = 100;

    const items = [
      { icon: '💰', value: resources.coin },
      { icon: '🪵', value: resources.wood },
      { icon: '🪨', value: resources.stone },
      { icon: '💎', value: resources.diamond },
    ];

    items.forEach((item, index) => {
      this.add.text(startX + index * spacing, y, `${item.icon} ${item.value}`, {
        fontSize: '18px',
        color: '#ffffff',
      });
    });

    // 体力
    const energy = saveManager.getEnergy();
    this.add.text(GameConfig.WIDTH - 80, y, `⚡ ${energy}/30`, {
      fontSize: '18px',
      color: energy >= 5 ? '#4ecdc4' : '#ff6b6b',
    });
  }

  private createLevelGrid(): void {
    const cols = 4;
    const buttonSize = 80;
    const padding = 15;
    const startX = (GameConfig.WIDTH - cols * (buttonSize + padding) + padding) / 2;
    const startY = 0;

    const highestLevel = saveManager.getCurrentLevel();
    const totalLevels = Math.max(LEVELS.length, highestLevel + 5);

    for (let i = 0; i < totalLevels; i++) {
      const level = i + 1;
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (buttonSize + padding) + buttonSize / 2;
      const y = startY + row * (buttonSize + padding) + buttonSize / 2;

      this.createLevelButton(x, y, level, buttonSize, level <= highestLevel);
    }

    // 计算最大滚动距离
    const totalRows = Math.ceil(totalLevels / cols);
    const contentHeight = totalRows * (buttonSize + padding);
    const viewHeight = GameConfig.HEIGHT - 200;
    this.maxScrollY = Math.max(0, contentHeight - viewHeight);
  }

  private createLevelButton(x: number, y: number, level: number, size: number, unlocked: boolean): void {
    const stars = saveManager.getLevelStars(level);
    const levelConfig = getLevelConfig(level);

    // 背景
    const bg = this.add.graphics();
    if (unlocked) {
      bg.fillStyle(stars > 0 ? 0x4ecdc4 : 0x3498db, 1);
    } else {
      bg.fillStyle(0x555555, 1);
    }
    bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 10);
    this.levelContainer.add(bg);

    // 关卡号
    const levelText = this.add.text(x, y - 10, `${level}`, {
      fontSize: '28px',
      color: unlocked ? '#ffffff' : '#888888',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.levelContainer.add(levelText);

    // 星星
    if (stars > 0) {
      const starsText = this.add.text(x, y + 22, '⭐'.repeat(stars) + '☆'.repeat(3 - stars), {
        fontSize: '12px',
      }).setOrigin(0.5);
      this.levelContainer.add(starsText);
    } else if (!unlocked) {
      const lockText = this.add.text(x, y + 22, '🔒', {
        fontSize: '16px',
      }).setOrigin(0.5);
      this.levelContainer.add(lockText);
    }

    // 点击区域
    if (unlocked) {
      const hitArea = this.add.rectangle(x, y, size, size)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001);
      this.levelContainer.add(hitArea);

      hitArea.on('pointerdown', () => {
        // 检查体力
        if (!saveManager.useEnergy(5)) {
          this.showEnergyWarning();
          return;
        }
        
        this.audioManager.playClick();
        this.registry.set('currentLevel', level);
        this.scene.start('Match3Scene');
      });

      hitArea.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(stars > 0 ? 0x5fd9d1 : 0x5dade2, 1);
        bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 10);
      });

      hitArea.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(stars > 0 ? 0x4ecdc4 : 0x3498db, 1);
        bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 10);
      });
    }
  }

  private showEnergyWarning(): void {
    const centerX = GameConfig.WIDTH / 2;
    const centerY = GameConfig.HEIGHT / 2;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT), Phaser.Geom.Rectangle.Contains);

    const panel = this.add.image(centerX, centerY, 'panel').setScale(2, 1.5);

    const title = this.add.text(centerX, centerY - 50, '⚡ 体力不足', {
      fontSize: '28px',
      color: '#ff6b6b',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const nextEnergy = saveManager.getNextEnergyTime();
    const minutes = Math.floor(nextEnergy / 60);
    const seconds = nextEnergy % 60;
    const timeText = this.add.text(centerX, centerY, `下次恢复: ${minutes}:${seconds.toString().padStart(2, '0')}`, {
      fontSize: '20px',
      color: '#2c3e50',
    }).setOrigin(0.5);

    const closeBtn = this.add.image(centerX, centerY + 60, 'button')
      .setInteractive({ useHandCursor: true });

    const closeBtnText = this.add.text(centerX, centerY + 60, '确定', {
      fontSize: '20px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    closeBtn.on('pointerup', () => {
      this.audioManager.playClick();
      overlay.destroy();
      panel.destroy();
      title.destroy();
      timeText.destroy();
      closeBtn.destroy();
      closeBtnText.destroy();
    });
  }

  private createBackButton(): void {
    const backBtn = this.add.text(50, 50, '← 返回', {
      fontSize: '24px',
      color: '#ffffff',
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => {
      this.audioManager.playClick();
      this.scene.start('MainMenuScene');
    });
  }
}
