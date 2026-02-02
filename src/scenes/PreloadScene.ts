import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { AssetGenerator } from '../utils/AssetGenerator';

/**
 * 预加载场景 - 加载游戏资源并显示进度条
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    console.log('PreloadScene preload!');
    // 创建加载进度UI
    this.createLoadingUI();
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
    this.add.text(centerX, centerY + 50, '加载中...', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 进度条背景
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x222222, 0.8);
    progressBarBg.fillRoundedRect(centerX - 150, centerY, 300, 30, 15);

    // 进度条 - 模拟加载
    const progressBar = this.add.graphics();
    let progress = 0;

    this.time.addEvent({
      delay: 20,
      repeat: 50,
      callback: () => {
        progress += 0.02;
        progressBar.clear();
        progressBar.fillStyle(0xffe66d, 1);
        progressBar.fillRoundedRect(centerX - 145, centerY + 5, 290 * Math.min(progress, 1), 20, 10);
      }
    });
  }

  create(): void {
    console.log('PreloadScene create!');
    // 生成所有游戏素材
    AssetGenerator.generateAll(this);

    // 生成旧版兼容素材（Match3Scene 用的 key）
    this.generateLegacyAssets();

    // 短暂延迟后进入主菜单
    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }

  /**
   * 生成兼容旧代码的素材 key
   */
  private generateLegacyAssets(): void {
    // 消除元素映射到新的宝石
    const mapping = [
      { old: 'wood', new: 'gem_red' },
      { old: 'stone', new: 'gem_blue' },
      { old: 'coin', new: 'gem_green' },
      { old: 'star', new: 'gem_yellow' },
      { old: 'heart', new: 'gem_purple' },
      { old: 'diamond', new: 'gem_orange' },
    ];

    mapping.forEach(({ old, new: newKey }) => {
      // 复制纹理
      if (this.textures.exists(newKey)) {
        const source = this.textures.get(newKey).getSourceImage();
        this.textures.addImage(old, source as HTMLImageElement);
      }
    });

    // 生成选中框
    const selectGraphics = this.make.graphics({ x: 0, y: 0 });
    selectGraphics.lineStyle(4, 0xffffff, 1);
    selectGraphics.strokeRoundedRect(2, 2, 76, 76, 10);
    selectGraphics.generateTexture('select', 80, 80);
    selectGraphics.destroy();
  }
}
