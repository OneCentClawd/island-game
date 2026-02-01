import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * 预加载场景 - 加载游戏资源并显示进度条
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // 创建加载进度UI
    this.createLoadingUI();

    // 由于目前没有美术资源，我们先生成简单的几何图形作为占位符
    this.generatePlaceholderAssets();
  }

  private createLoadingUI(): void {
    const centerX = GameConfig.WIDTH / 2;
    const centerY = GameConfig.HEIGHT / 2;

    // 标题
    this.add.text(centerX, centerY - 100, '🏝️ 小岛物语', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 加载提示
    const loadingText = this.add.text(centerX, centerY + 50, '加载中...', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 进度条背景
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x222222, 0.8);
    progressBarBg.fillRoundedRect(centerX - 150, centerY, 300, 30, 15);

    // 进度条
    const progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffe66d, 1);
      progressBar.fillRoundedRect(centerX - 145, centerY + 5, 290 * value, 20, 10);
      loadingText.setText(`加载中... ${Math.floor(value * 100)}%`);
    });
  }

  private generatePlaceholderAssets(): void {
    // 生成消除元素的占位图形
    const elements = [
      { key: 'wood', color: 0x8B4513, emoji: '🪵' },
      { key: 'stone', color: 0x808080, emoji: '🪨' },
      { key: 'coin', color: 0xFFD700, emoji: '💰' },
      { key: 'star', color: 0xFFFF00, emoji: '⭐' },
      { key: 'heart', color: 0xFF69B4, emoji: '❤️' },
      { key: 'diamond', color: 0x00BFFF, emoji: '💎' },
    ];

    elements.forEach(({ key, color }) => {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(color, 1);
      graphics.fillCircle(35, 35, 30);
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeCircle(35, 35, 30);
      graphics.generateTexture(key, 70, 70);
      graphics.destroy();
    });

    // 生成选中框
    const selectGraphics = this.make.graphics({ x: 0, y: 0 });
    selectGraphics.lineStyle(4, 0xffffff, 1);
    selectGraphics.strokeRoundedRect(2, 2, 76, 76, 10);
    selectGraphics.generateTexture('select', 80, 80);
    selectGraphics.destroy();

    // 生成按钮
    const buttonGraphics = this.make.graphics({ x: 0, y: 0 });
    buttonGraphics.fillStyle(0xffe66d, 1);
    buttonGraphics.fillRoundedRect(0, 0, 200, 60, 15);
    buttonGraphics.generateTexture('button', 200, 60);
    buttonGraphics.destroy();

    // 生成面板背景
    const panelGraphics = this.make.graphics({ x: 0, y: 0 });
    panelGraphics.fillStyle(0xffffff, 0.95);
    panelGraphics.fillRoundedRect(0, 0, 300, 200, 20);
    panelGraphics.generateTexture('panel', 300, 200);
    panelGraphics.destroy();
  }

  create(): void {
    // 短暂延迟后进入主菜单
    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
