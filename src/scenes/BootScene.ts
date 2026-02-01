import Phaser from 'phaser';

/**
 * 启动场景 - 初始化游戏设置
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // 设置游戏全局数据
    this.registry.set('resources', {
      wood: 100,
      stone: 50,
      coin: 500,
      diamond: 10,
    });
    this.registry.set('energy', 30);
    this.registry.set('currentLevel', 1);
    this.registry.set('highScore', 0);

    // 进入预加载场景
    this.scene.start('PreloadScene');
  }
}
