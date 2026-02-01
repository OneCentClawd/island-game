import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * 主菜单场景
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const centerX = GameConfig.WIDTH / 2;

    // 背景渐变
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x4ecdc4, 0x4ecdc4, 0x44a08d, 0x44a08d, 1);
    bg.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    // 游戏标题
    this.add.text(centerX, 200, '🏝️', {
      fontSize: '120px',
    }).setOrigin(0.5);

    this.add.text(centerX, 350, '小岛物语', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 5,
        fill: true,
      },
    }).setOrigin(0.5);

    this.add.text(centerX, 420, 'Island Story', {
      fontSize: '24px',
      color: '#ffe66d',
    }).setOrigin(0.5);

    // 开始游戏按钮
    this.createButton(centerX, 600, '🎮 开始游戏', () => {
      this.scene.start('Match3Scene');
    });

    // 进入小岛按钮
    this.createButton(centerX, 700, '🏝️ 我的小岛', () => {
      this.scene.start('IslandScene');
    });

    // 显示资源
    this.showResources();

    // 版本信息
    this.add.text(centerX, GameConfig.HEIGHT - 50, 'v0.1.0 - 开发中', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.7);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const button = this.add.image(x, y, 'button')
      .setInteractive({ useHandCursor: true })
      .setScale(1.5, 1);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.on('pointerover', () => {
      button.setTint(0xdddddd);
      this.tweens.add({
        targets: [button, buttonText],
        scaleX: button.scaleX * 1.05,
        scaleY: button.scaleY * 1.05,
        duration: 100,
      });
    });

    button.on('pointerout', () => {
      button.clearTint();
      this.tweens.add({
        targets: [button, buttonText],
        scaleX: button.scaleX / 1.05,
        scaleY: button.scaleY / 1.05,
        duration: 100,
      });
    });

    button.on('pointerdown', () => {
      button.setTint(0xaaaaaa);
    });

    button.on('pointerup', () => {
      button.clearTint();
      callback();
    });
  }

  private showResources(): void {
    const resources = this.registry.get('resources');
    const energy = this.registry.get('energy');

    const resourcesY = 100;
    const startX = 50;
    const spacing = 170;

    // 显示各项资源
    const items = [
      { emoji: '⚡', value: energy, label: '体力' },
      { emoji: '💰', value: resources.coin, label: '金币' },
      { emoji: '💎', value: resources.diamond, label: '钻石' },
      { emoji: '🪵', value: resources.wood, label: '木材' },
    ];

    items.forEach((item, index) => {
      const x = startX + index * spacing;

      this.add.text(x, resourcesY, item.emoji, {
        fontSize: '32px',
      });

      this.add.text(x + 40, resourcesY + 5, `${item.value}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
    });
  }
}
