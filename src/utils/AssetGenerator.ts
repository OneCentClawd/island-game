import Phaser from 'phaser';

/**
 * 素材生成器 - 生成高质量游戏素材
 */
export class AssetGenerator {
  
  /**
   * 生成所有游戏素材
   */
  static generateAll(scene: Phaser.Scene): void {
    this.generateGems(scene);
    this.generateUI(scene);
    this.generateEffects(scene);
    this.generateIsland(scene);
  }

  /**
   * 生成宝石素材
   */
  static generateGems(scene: Phaser.Scene): void {
    const gemConfigs = [
      { key: 'gem_red', colors: [0xff6b6b, 0xee5a5a, 0xcc4444], highlight: 0xffaaaa },
      { key: 'gem_blue', colors: [0x4ecdc4, 0x3dbdb5, 0x2d9d96], highlight: 0x8eeee8 },
      { key: 'gem_green', colors: [0x95e66b, 0x7dd35a, 0x5cb844], highlight: 0xc5f5aa },
      { key: 'gem_yellow', colors: [0xffe66d, 0xf0d85c, 0xd4bc3c], highlight: 0xfff5aa },
      { key: 'gem_purple', colors: [0x9b59b6, 0x8e4aa6, 0x7d3c98], highlight: 0xc99edb },
      { key: 'gem_orange', colors: [0xf39c12, 0xe08e0b, 0xc77d08], highlight: 0xf9c87a },
    ];

    const size = 64;

    gemConfigs.forEach(config => {
      const graphics = scene.make.graphics({ x: 0, y: 0 });
      
      // 阴影
      graphics.fillStyle(0x000000, 0.3);
      graphics.fillCircle(size / 2 + 2, size / 2 + 2, size / 2 - 4);
      
      // 主体渐变效果（用多层圆模拟）
      graphics.fillStyle(config.colors[2], 1);
      graphics.fillCircle(size / 2, size / 2, size / 2 - 4);
      
      graphics.fillStyle(config.colors[1], 1);
      graphics.fillCircle(size / 2, size / 2, size / 2 - 8);
      
      graphics.fillStyle(config.colors[0], 1);
      graphics.fillCircle(size / 2 - 2, size / 2 - 2, size / 2 - 12);
      
      // 高光
      graphics.fillStyle(config.highlight, 0.8);
      graphics.fillCircle(size / 2 - 10, size / 2 - 10, 8);
      graphics.fillStyle(0xffffff, 0.5);
      graphics.fillCircle(size / 2 - 12, size / 2 - 12, 4);

      graphics.generateTexture(config.key, size, size);
      graphics.destroy();
    });

    // 特殊宝石 - 炸弹
    this.generateBomb(scene, size);
    
    // 特殊宝石 - 彩虹球
    this.generateRainbow(scene, size);
    
    // 特殊宝石 - 横向闪电
    this.generateLineH(scene, size);
    
    // 特殊宝石 - 纵向闪电
    this.generateLineV(scene, size);
  }

  static generateBomb(scene: Phaser.Scene, size: number): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    
    // 阴影
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillCircle(size / 2 + 2, size / 2 + 2, size / 2 - 4);
    
    // 炸弹主体
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2 - 6);
    
    graphics.fillStyle(0x34495e, 1);
    graphics.fillCircle(size / 2 - 2, size / 2 - 2, size / 2 - 10);
    
    // 引线
    graphics.lineStyle(3, 0x8b4513, 1);
    graphics.beginPath();
    graphics.moveTo(size / 2, 8);
    graphics.lineTo(size / 2 + 8, 2);
    graphics.strokePath();
    
    // 火花
    graphics.fillStyle(0xff6600, 1);
    graphics.fillCircle(size / 2 + 10, 4, 4);
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(size / 2 + 10, 4, 2);
    
    // 高光
    graphics.fillStyle(0x5d6d7e, 0.6);
    graphics.fillCircle(size / 2 - 10, size / 2 - 8, 6);

    graphics.generateTexture('gem_bomb', size, size);
    graphics.destroy();
  }

  static generateRainbow(scene: Phaser.Scene, size: number): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    const colors = [0xff6b6b, 0xf39c12, 0xffe66d, 0x95e66b, 0x4ecdc4, 0x9b59b6];
    
    // 彩虹圆环
    const ringWidth = 6;
    colors.forEach((color, i) => {
      graphics.lineStyle(ringWidth, color, 1);
      graphics.strokeCircle(size / 2, size / 2, size / 2 - 4 - i * ringWidth);
    });
    
    // 中心星星
    graphics.fillStyle(0xffffff, 1);
    this.drawStar(graphics, size / 2, size / 2, 5, 10, 5);
    
    graphics.generateTexture('gem_rainbow', size, size);
    graphics.destroy();
  }

  static generateLineH(scene: Phaser.Scene, size: number): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    
    // 背景宝石
    graphics.fillStyle(0x3498db, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2 - 6);
    
    // 横向闪电
    graphics.fillStyle(0xf1c40f, 1);
    graphics.fillRect(4, size / 2 - 4, size - 8, 8);
    
    // 箭头
    graphics.fillTriangle(size - 8, size / 2, size - 16, size / 2 - 8, size - 16, size / 2 + 8);
    graphics.fillTriangle(8, size / 2, 16, size / 2 - 8, 16, size / 2 + 8);

    graphics.generateTexture('gem_line_h', size, size);
    graphics.destroy();
  }

  static generateLineV(scene: Phaser.Scene, size: number): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    
    // 背景宝石
    graphics.fillStyle(0x3498db, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2 - 6);
    
    // 纵向闪电
    graphics.fillStyle(0xf1c40f, 1);
    graphics.fillRect(size / 2 - 4, 4, 8, size - 8);
    
    // 箭头
    graphics.fillTriangle(size / 2, 8, size / 2 - 8, 16, size / 2 + 8, 16);
    graphics.fillTriangle(size / 2, size - 8, size / 2 - 8, size - 16, size / 2 + 8, size - 16);

    graphics.generateTexture('gem_line_v', size, size);
    graphics.destroy();
  }

  /**
   * 生成UI素材
   */
  static generateUI(scene: Phaser.Scene): void {
    // 按钮
    this.generateButton(scene, 'button', 200, 60, 0x4ecdc4, 0x44a08d);
    this.generateButton(scene, 'button_red', 200, 60, 0xe74c3c, 0xc0392b);
    this.generateButton(scene, 'button_green', 200, 60, 0x27ae60, 0x1e8449);
    this.generateButton(scene, 'button_gold', 200, 60, 0xf1c40f, 0xd4ac0d);
    
    // 面板
    this.generatePanel(scene, 'panel', 300, 200);
    this.generatePanel(scene, 'panel_dark', 300, 200, 0x2c3e50, 0x1a252f);
    
    // 星星
    this.generateStar(scene, 'star_empty', 40, 0x555555);
    this.generateStar(scene, 'star_filled', 40, 0xf1c40f);
    
    // 进度条背景
    this.generateProgressBar(scene);
  }

  static generateButton(scene: Phaser.Scene, key: string, width: number, height: number, color1: number, color2: number): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    
    // 阴影
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRoundedRect(2, 4, width, height, 12);
    
    // 主体
    graphics.fillStyle(color2, 1);
    graphics.fillRoundedRect(0, 2, width, height, 12);
    
    graphics.fillStyle(color1, 1);
    graphics.fillRoundedRect(0, 0, width, height - 4, 12);
    
    // 高光
    graphics.fillStyle(0xffffff, 0.2);
    graphics.fillRoundedRect(4, 4, width - 8, height / 3, 8);

    graphics.generateTexture(key, width, height + 4);
    graphics.destroy();
  }

  static generatePanel(scene: Phaser.Scene, key: string, width: number, height: number, color1: number = 0x34495e, color2: number = 0x2c3e50): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    
    // 阴影
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRoundedRect(4, 4, width, height, 16);
    
    // 边框
    graphics.fillStyle(color2, 1);
    graphics.fillRoundedRect(0, 0, width, height, 16);
    
    // 内部
    graphics.fillStyle(color1, 1);
    graphics.fillRoundedRect(4, 4, width - 8, height - 8, 12);

    graphics.generateTexture(key, width + 4, height + 4);
    graphics.destroy();
  }

  static generateStar(scene: Phaser.Scene, key: string, size: number, color: number): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    
    graphics.fillStyle(color, 1);
    this.drawStar(graphics, size / 2, size / 2, 5, size / 2 - 2, size / 4);
    
    // 高光
    if (color !== 0x555555) {
      graphics.fillStyle(0xffffff, 0.4);
      graphics.fillCircle(size / 3, size / 3, size / 8);
    }

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  static generateProgressBar(scene: Phaser.Scene): void {
    // 背景
    let graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRoundedRect(0, 0, 200, 20, 10);
    graphics.generateTexture('progress_bg', 200, 20);
    graphics.destroy();

    // 填充
    graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x27ae60, 1);
    graphics.fillRoundedRect(0, 0, 200, 20, 10);
    graphics.generateTexture('progress_fill', 200, 20);
    graphics.destroy();
  }

  /**
   * 生成特效素材
   */
  static generateEffects(scene: Phaser.Scene): void {
    // 粒子
    let graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle', 16, 16);
    graphics.destroy();

    // 星星粒子
    graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xf1c40f, 1);
    this.drawStar(graphics, 12, 12, 4, 12, 6);
    graphics.generateTexture('particle_star', 24, 24);
    graphics.destroy();

    // 爆炸圆环
    graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.lineStyle(4, 0xf39c12, 1);
    graphics.strokeCircle(32, 32, 28);
    graphics.generateTexture('explosion_ring', 64, 64);
    graphics.destroy();
  }

  /**
   * 生成小岛素材
   */
  static generateIsland(scene: Phaser.Scene): void {
    // 草地
    let graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x7cb342, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0x8bc34a, 0.5);
    for (let i = 0; i < 8; i++) {
      graphics.fillCircle(Math.random() * 64, Math.random() * 64, 4 + Math.random() * 4);
    }
    graphics.generateTexture('tile_grass', 64, 64);
    graphics.destroy();

    // 沙滩
    graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xf4d03f, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0xe9c53f, 0.5);
    for (let i = 0; i < 6; i++) {
      graphics.fillCircle(Math.random() * 64, Math.random() * 64, 2 + Math.random() * 3);
    }
    graphics.generateTexture('tile_sand', 64, 64);
    graphics.destroy();

    // 水
    graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0x5dade2, 0.4);
    for (let i = 0; i < 4; i++) {
      graphics.fillEllipse(Math.random() * 64, Math.random() * 64, 20, 8);
    }
    graphics.generateTexture('tile_water', 64, 64);
    graphics.destroy();

    // 简单房子
    this.generateBuilding(scene, 'building_house', 0x8d6e63, 0xe57373);
    this.generateBuilding(scene, 'building_shop', 0x5c6bc0, 0x7986cb);
    this.generateBuilding(scene, 'building_farm', 0x81c784, 0xa5d6a7);
    this.generateBuilding(scene, 'building_dock', 0x90a4ae, 0xb0bec5);
    this.generateBuilding(scene, 'building_lighthouse', 0xfff176, 0xffeb3b);
    
    // 树
    this.generateTree(scene);
  }

  static generateBuilding(scene: Phaser.Scene, key: string, wallColor: number, roofColor: number): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    const size = 80;
    
    // 阴影
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillRect(8, size - 20, size - 8, 20);
    
    // 墙壁
    graphics.fillStyle(wallColor, 1);
    graphics.fillRect(10, 30, size - 20, size - 40);
    
    // 屋顶
    graphics.fillStyle(roofColor, 1);
    graphics.fillTriangle(size / 2, 5, 5, 35, size - 5, 35);
    
    // 门
    graphics.fillStyle(0x5d4037, 1);
    graphics.fillRect(size / 2 - 8, size - 30, 16, 20);
    
    // 窗户
    graphics.fillStyle(0xbbdefb, 1);
    graphics.fillRect(20, 45, 12, 12);
    graphics.fillRect(size - 32, 45, 12, 12);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  static generateTree(scene: Phaser.Scene): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    
    // 树干
    graphics.fillStyle(0x6d4c41, 1);
    graphics.fillRect(26, 40, 12, 30);
    
    // 树冠
    graphics.fillStyle(0x388e3c, 1);
    graphics.fillCircle(32, 28, 22);
    graphics.fillStyle(0x43a047, 1);
    graphics.fillCircle(28, 24, 16);
    graphics.fillStyle(0x4caf50, 1);
    graphics.fillCircle(36, 20, 12);

    graphics.generateTexture('tree', 64, 70);
    graphics.destroy();
  }

  /**
   * 绘制星形
   */
  static drawStar(graphics: Phaser.GameObjects.Graphics, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    
    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }
    
    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
  }
}
