import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { saveManager } from '../managers/SaveManager';
import { AudioManager } from '../managers/AudioManager';

/**
 * 主菜单场景
 */
export class MainMenuScene extends Phaser.Scene {
  private audioManager!: AudioManager;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.audioManager = new AudioManager(this);
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

    // 开始游戏按钮（关卡选择）
    this.createButton(centerX, 520, '🎮 开始游戏', () => {
      this.scene.start('LevelSelectScene');
    });

    // 进入小岛按钮
    this.createButton(centerX, 610, '🏝️ 我的小岛', () => {
      this.scene.start('IslandScene');
    });

    // 成就按钮
    this.createButton(centerX, 700, '🏆 成就', () => {
      this.scene.start('AchievementScene');
    });

    // 设置按钮
    this.createButton(centerX, 790, '⚙️ 设置', () => {
      this.showSettings();
    });

    // 显示资源
    this.showResources();

    // 版本信息
    this.add.text(centerX, GameConfig.HEIGHT - 50, 'v0.2.0 - 开发中', {
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
      this.audioManager.playClick();
      callback();
    });
  }

  private showResources(): void {
    const resources = saveManager.getResources();
    const energy = saveManager.getEnergy();
    const currentLevel = saveManager.getCurrentLevel();

    const resourcesY = 100;
    const startX = 50;
    const spacing = 100;

    // 显示各项资源
    const items = [
      { emoji: '⚡', value: `${energy}/30` },
      { emoji: '💰', value: resources.coin },
      { emoji: '💎', value: resources.diamond },
      { emoji: '🪵', value: resources.wood },
      { emoji: '🪨', value: resources.stone },
    ];

    items.forEach((item, index) => {
      this.add.text(startX + index * spacing, resourcesY, `${item.emoji} ${item.value}`, {
        fontSize: '18px',
        color: '#ffffff',
      });
    });

    // 当前关卡
    this.add.text(GameConfig.WIDTH - 100, resourcesY, `关卡 ${currentLevel}`, {
      fontSize: '20px',
      color: '#ffe66d',
      fontStyle: 'bold',
    });
  }

  private showSettings(): void {
    const centerX = GameConfig.WIDTH / 2;
    const centerY = GameConfig.HEIGHT / 2;

    // 遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT), Phaser.Geom.Rectangle.Contains);

    // 面板
    const panel = this.add.image(centerX, centerY, 'panel').setScale(2.5, 2);

    // 标题
    const title = this.add.text(centerX, centerY - 120, '⚙️ 设置', {
      fontSize: '32px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const settings = saveManager.getSettings();

    // 音效开关
    const soundBtn = this.createToggleButton(
      centerX,
      centerY - 40,
      '🔊 音效',
      settings.soundEnabled,
      (enabled) => {
        saveManager.updateSettings({ soundEnabled: enabled });
      }
    );

    // 音乐开关
    const musicBtn = this.createToggleButton(
      centerX,
      centerY + 30,
      '🎵 音乐',
      settings.musicEnabled,
      (enabled) => {
        saveManager.updateSettings({ musicEnabled: enabled });
      }
    );

    // 重置存档按钮
    const resetBtn = this.add.text(centerX, centerY + 100, '🗑️ 重置存档', {
      fontSize: '20px',
      color: '#ff6b6b',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resetBtn.on('pointerup', () => {
      this.audioManager.playClick();
      if (confirm('确定要重置所有进度吗？此操作不可恢复！')) {
        saveManager.reset();
        this.scene.restart();
      }
    });

    // 关闭按钮
    const closeBtn = this.add.image(centerX, centerY + 160, 'button')
      .setInteractive({ useHandCursor: true });

    const closeBtnText = this.add.text(centerX, centerY + 160, '关闭', {
      fontSize: '20px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const cleanup = () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      soundBtn.forEach(obj => obj.destroy());
      musicBtn.forEach(obj => obj.destroy());
      resetBtn.destroy();
      closeBtn.destroy();
      closeBtnText.destroy();
    };

    closeBtn.on('pointerup', () => {
      this.audioManager.playClick();
      cleanup();
    });
  }

  private createToggleButton(
    x: number,
    y: number,
    label: string,
    initialState: boolean,
    onChange: (enabled: boolean) => void
  ): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = [];

    const labelText = this.add.text(x - 80, y, label, {
      fontSize: '22px',
      color: '#2c3e50',
    }).setOrigin(0, 0.5);
    objects.push(labelText);

    let isOn = initialState;

    const toggleBg = this.add.graphics();
    const drawToggle = () => {
      toggleBg.clear();
      toggleBg.fillStyle(isOn ? 0x4ecdc4 : 0x999999, 1);
      toggleBg.fillRoundedRect(x + 50, y - 15, 60, 30, 15);
      toggleBg.fillStyle(0xffffff, 1);
      toggleBg.fillCircle(isOn ? x + 95 : x + 65, y, 12);
    };
    drawToggle();
    objects.push(toggleBg);

    const hitArea = this.add.rectangle(x + 80, y, 60, 30)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);
    objects.push(hitArea);

    hitArea.on('pointerup', () => {
      this.audioManager.playClick();
      isOn = !isOn;
      drawToggle();
      onChange(isOn);
    });

    return objects;
  }
}
