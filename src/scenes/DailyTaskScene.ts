import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { getTodayTasks, DailyTask } from '../config/DailyTaskConfig';
import { saveManager } from '../managers/SaveManager';
import { AudioManager } from '../managers/AudioManager';

/**
 * 每日任务场景
 */
export class DailyTaskScene extends Phaser.Scene {
  private audioManager!: AudioManager;

  constructor() {
    super({ key: 'DailyTaskScene' });
  }

  create(): void {
    this.audioManager = new AudioManager(this);

    // 背景
    this.add.graphics()
      .fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1)
      .fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    // 标题
    this.add.text(GameConfig.WIDTH / 2, 60, '📋 每日任务', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 刷新时间提示
    const resetTime = this.getResetTimeText();
    this.add.text(GameConfig.WIDTH / 2, 100, `${resetTime}后刷新`, {
      fontSize: '16px',
      color: '#888888',
    }).setOrigin(0.5);

    // 返回按钮
    this.createBackButton();

    // 任务列表
    this.createTaskList();
  }

  private getResetTimeText(): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}小时${minutes}分钟`;
  }

  private createTaskList(): void {
    const tasks = getTodayTasks(4);
    const progress = saveManager.getDailyTaskProgress();
    const startY = 150;
    const itemHeight = 120;

    tasks.forEach((task, index) => {
      this.createTaskItem(task, startY + index * itemHeight, progress);
    });

    // 全部完成奖励
    const allCompleted = tasks.every(task => {
      const taskProgress = progress.tasks[task.id];
      return taskProgress && taskProgress.progress >= task.target;
    });

    this.createBonusReward(startY + tasks.length * itemHeight + 20, allCompleted);
  }

  private createTaskItem(task: DailyTask, y: number, progress: any): void {
    const width = GameConfig.WIDTH - 40;
    const height = 100;
    const x = 20;

    const taskProgress = progress.tasks[task.id] || { progress: 0, claimed: false };
    const isCompleted = taskProgress.progress >= task.target;
    const isClaimed = taskProgress.claimed;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(isClaimed ? 0x27ae60 : isCompleted ? 0x2980b9 : 0x333333, 0.5);
    bg.fillRoundedRect(x, y, width, height, 12);
    if (isCompleted && !isClaimed) {
      bg.lineStyle(2, 0xf1c40f, 1);
      bg.strokeRoundedRect(x, y, width, height, 12);
    }

    // 图标
    this.add.text(x + 50, y + height / 2, task.icon, {
      fontSize: '40px',
    }).setOrigin(0.5);

    // 名称和描述
    this.add.text(x + 100, y + 20, task.name, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.add.text(x + 100, y + 48, task.description, {
      fontSize: '14px',
      color: '#aaaaaa',
    });

    // 进度条
    const barWidth = 200;
    const barHeight = 8;
    const barX = x + 100;
    const barY = y + 75;
    const progressRatio = Math.min(taskProgress.progress / task.target, 1);

    const barBg = this.add.graphics();
    barBg.fillStyle(0x555555, 1);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4);

    const barFill = this.add.graphics();
    barFill.fillStyle(isCompleted ? 0x27ae60 : 0x3498db, 1);
    barFill.fillRoundedRect(barX, barY, barWidth * progressRatio, barHeight, 4);

    // 进度文字
    this.add.text(barX + barWidth + 10, barY + barHeight / 2, 
      `${Math.min(taskProgress.progress, task.target)}/${task.target}`, {
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);

    // 奖励/领取按钮
    const rewardIcon = task.reward.type === 'coin' ? '💰' : '💎';
    
    if (isClaimed) {
      this.add.text(width - 20, y + height / 2, '✓ 已领取', {
        fontSize: '16px',
        color: '#27ae60',
      }).setOrigin(1, 0.5);
    } else if (isCompleted) {
      const claimBtn = this.add.container(width - 50, y + height / 2);
      
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0xf1c40f, 1);
      btnBg.fillRoundedRect(-40, -18, 80, 36, 8);
      claimBtn.add(btnBg);

      const btnText = this.add.text(0, 0, '领取', {
        fontSize: '18px',
        color: '#2c3e50',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      claimBtn.add(btnText);

      btnBg.setInteractive(new Phaser.Geom.Rectangle(-40, -18, 80, 36), Phaser.Geom.Rectangle.Contains);
      btnBg.on('pointerup', () => {
        this.claimReward(task);
      });
    } else {
      this.add.text(width - 20, y + height / 2, `${rewardIcon}+${task.reward.amount}`, {
        fontSize: '18px',
        color: '#ffe66d',
      }).setOrigin(1, 0.5);
    }
  }

  private createBonusReward(y: number, allCompleted: boolean): void {
    const width = GameConfig.WIDTH - 40;
    const x = 20;

    const bg = this.add.graphics();
    bg.fillStyle(0x8e44ad, 0.5);
    bg.fillRoundedRect(x, y, width, 80, 12);
    if (allCompleted) {
      bg.lineStyle(2, 0xf1c40f, 1);
      bg.strokeRoundedRect(x, y, width, 80, 12);
    }

    this.add.text(x + 50, y + 40, '🎁', {
      fontSize: '40px',
    }).setOrigin(0.5);

    this.add.text(x + 100, y + 25, '完成全部任务奖励', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.add.text(x + 100, y + 52, '💎 x5 + 💰 x500', {
      fontSize: '16px',
      color: '#ffe66d',
    });

    if (allCompleted) {
      const progress = saveManager.getDailyTaskProgress();
      if (!progress.bonusClaimed) {
        const claimBtn = this.add.text(width - 50, y + 40, '领取', {
          fontSize: '18px',
          color: '#f1c40f',
          fontStyle: 'bold',
          backgroundColor: '#2c3e50',
          padding: { x: 15, y: 8 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        claimBtn.on('pointerup', () => {
          this.claimBonusReward();
          claimBtn.setText('✓').setColor('#27ae60');
        });
      } else {
        this.add.text(width - 50, y + 40, '✓', {
          fontSize: '24px',
          color: '#27ae60',
        }).setOrigin(0.5);
      }
    }
  }

  private claimReward(task: DailyTask): void {
    this.audioManager.playClick();
    
    // 发放奖励
    if (task.reward.type === 'coin') {
      saveManager.updateResources({ coin: task.reward.amount });
    } else if (task.reward.type === 'diamond') {
      saveManager.updateResources({ diamond: task.reward.amount });
    }

    // 标记已领取
    saveManager.claimDailyTask(task.id);

    // 刷新界面
    this.scene.restart();
  }

  private claimBonusReward(): void {
    this.audioManager.playClick();
    
    saveManager.updateResources({ diamond: 5, coin: 500 });
    saveManager.claimDailyBonus();
    
    this.scene.restart();
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
