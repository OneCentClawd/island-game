import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { ACHIEVEMENTS, checkAchievement, Achievement } from '../config/AchievementConfig';
import { saveManager } from '../managers/SaveManager';
import { AudioManager } from '../managers/AudioManager';

/**
 * 成就场景
 */
export class AchievementScene extends Phaser.Scene {
  private audioManager!: AudioManager;
  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private listContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'AchievementScene' });
  }

  create(): void {
    this.audioManager = new AudioManager(this);

    // 背景
    this.add.graphics()
      .fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1)
      .fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    // 标题
    this.add.text(GameConfig.WIDTH / 2, 60, '🏆 成就', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 统计信息
    this.showStats();

    // 返回按钮
    this.createBackButton();

    // 成就列表
    this.listContainer = this.add.container(0, 0);
    this.createAchievementList();

    // 滚动遮罩
    const maskShape = this.make.graphics({});
    maskShape.fillRect(0, 180, GameConfig.WIDTH, GameConfig.HEIGHT - 230);
    const mask = maskShape.createGeometryMask();
    this.listContainer.setMask(mask);

    // 滚动
    this.input.on('wheel', (_: any, __: any, ___: any, deltaY: number) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY + deltaY * 0.5, 0, this.maxScrollY);
      this.listContainer.y = -this.scrollY + 180;
    });

    let startY = 0, startScrollY = 0;
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      startY = pointer.y;
      startScrollY = this.scrollY;
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.scrollY = Phaser.Math.Clamp(startScrollY + startY - pointer.y, 0, this.maxScrollY);
        this.listContainer.y = -this.scrollY + 180;
      }
    });
  }

  private showStats(): void {
    const unlockedCount = saveManager.getUnlockedAchievements().length;
    const totalCount = ACHIEVEMENTS.filter(a => !a.hidden).length;

    this.add.text(GameConfig.WIDTH / 2, 110, `已解锁 ${unlockedCount} / ${totalCount}`, {
      fontSize: '20px',
      color: '#4ecdc4',
    }).setOrigin(0.5);

    // 进度条
    const barWidth = 300;
    const barHeight = 10;
    const barX = (GameConfig.WIDTH - barWidth) / 2;
    const barY = 140;
    const progress = unlockedCount / totalCount;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 5);

    const barFill = this.add.graphics();
    barFill.fillStyle(0x4ecdc4, 1);
    barFill.fillRoundedRect(barX, barY, barWidth * progress, barHeight, 5);
  }

  private createAchievementList(): void {
    const unlocked = saveManager.getUnlockedAchievements();
    const stats = {
      highestLevel: saveManager.getCurrentLevel() - 1,
      totalScore: saveManager.getStatistics().totalScore,
      totalMatches: saveManager.getStatistics().totalMatches,
      buildingsBuilt: saveManager.getBuiltCount(),
      maxCombo: saveManager.getStatistics().maxCombo || 0,
      totalStars: saveManager.getTotalStars(),
    };

    const itemHeight = 100;
    const padding = 20;
    let y = 0;

    // 已解锁的成就
    const unlockedAchievements = ACHIEVEMENTS.filter(a => unlocked.includes(a.id));
    const lockedAchievements = ACHIEVEMENTS.filter(a => !unlocked.includes(a.id) && !a.hidden);

    // 先显示已解锁
    unlockedAchievements.forEach((achievement) => {
      this.createAchievementItem(achievement, y, true, stats);
      y += itemHeight + padding;
    });

    // 再显示未解锁
    lockedAchievements.forEach((achievement) => {
      this.createAchievementItem(achievement, y, false, stats);
      y += itemHeight + padding;
    });

    // 计算滚动范围
    const contentHeight = y;
    const viewHeight = GameConfig.HEIGHT - 230;
    this.maxScrollY = Math.max(0, contentHeight - viewHeight);
  }

  private createAchievementItem(achievement: Achievement, y: number, unlocked: boolean, stats: any): void {
    const width = GameConfig.WIDTH - 40;
    const height = 100;
    const x = 20;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(unlocked ? 0x27ae60 : 0x333333, unlocked ? 0.3 : 0.5);
    bg.fillRoundedRect(x, y, width, height, 12);
    if (unlocked) {
      bg.lineStyle(2, 0x27ae60, 1);
      bg.strokeRoundedRect(x, y, width, height, 12);
    }
    this.listContainer.add(bg);

    // 图标
    const icon = this.add.text(x + 50, y + height / 2, unlocked ? achievement.icon : '🔒', {
      fontSize: '40px',
    }).setOrigin(0.5);
    this.listContainer.add(icon);

    // 名称
    const name = this.add.text(x + 100, y + 20, achievement.name, {
      fontSize: '22px',
      color: unlocked ? '#ffffff' : '#888888',
      fontStyle: 'bold',
    });
    this.listContainer.add(name);

    // 描述
    const desc = this.add.text(x + 100, y + 50, achievement.description, {
      fontSize: '16px',
      color: unlocked ? '#cccccc' : '#666666',
    });
    this.listContainer.add(desc);

    // 奖励
    const rewardIcon = achievement.reward.type === 'coin' ? '💰' :
                       achievement.reward.type === 'diamond' ? '💎' :
                       achievement.reward.type === 'wood' ? '🪵' : '🪨';
    const reward = this.add.text(width - 30, y + height / 2, `${rewardIcon} +${achievement.reward.amount}`, {
      fontSize: '18px',
      color: unlocked ? '#ffe66d' : '#666666',
    }).setOrigin(1, 0.5);
    this.listContainer.add(reward);

    // 进度（未解锁）
    if (!unlocked) {
      const condition = achievement.condition;
      let current = 0;
      switch (condition.type) {
        case 'level_complete': current = stats.highestLevel; break;
        case 'total_score': current = stats.totalScore; break;
        case 'total_matches': current = stats.totalMatches; break;
        case 'buildings_built': current = stats.buildingsBuilt; break;
        case 'combo': current = stats.maxCombo; break;
        case 'stars': current = stats.totalStars; break;
      }
      const progress = Math.min(current / condition.value, 1);

      // 进度条
      const barWidth = 150;
      const barHeight = 6;
      const barX = x + 100;
      const barY = y + 75;

      const barBg = this.add.graphics();
      barBg.fillStyle(0x555555, 1);
      barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 3);
      this.listContainer.add(barBg);

      const barFill = this.add.graphics();
      barFill.fillStyle(0x4ecdc4, 1);
      barFill.fillRoundedRect(barX, barY, barWidth * progress, barHeight, 3);
      this.listContainer.add(barFill);

      const progressText = this.add.text(barX + barWidth + 10, barY + barHeight / 2, `${current}/${condition.value}`, {
        fontSize: '12px',
        color: '#888888',
      }).setOrigin(0, 0.5);
      this.listContainer.add(progressText);
    }
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
