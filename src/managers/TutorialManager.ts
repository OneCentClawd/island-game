import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { AudioManager } from '../managers/AudioManager';

interface TutorialStep {
  target?: { x: number; y: number; radius?: number };
  text: string;
  position: 'top' | 'bottom' | 'center';
  action?: 'tap' | 'swap' | 'wait';
  highlight?: boolean;
}

/**
 * 新手引导管理器
 */
export class TutorialManager {
  private scene: Phaser.Scene;
  private audioManager: AudioManager;
  private container!: Phaser.GameObjects.Container;
  private overlay!: Phaser.GameObjects.Graphics;
  private textBox!: Phaser.GameObjects.Container;
  private handIcon!: Phaser.GameObjects.Text;
  
  private steps: TutorialStep[] = [];
  private currentStep: number = 0;
  private isActive: boolean = false;
  private onCompleteCallback: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.audioManager = new AudioManager(scene);
    this.createUI();
  }

  private createUI(): void {
    this.container = this.scene.add.container(0, 0).setDepth(900).setVisible(false);

    // 半透明遮罩
    this.overlay = this.scene.add.graphics();
    this.container.add(this.overlay);

    // 手指图标
    this.handIcon = this.scene.add.text(0, 0, '👆', {
      fontSize: '48px',
    }).setOrigin(0.5).setVisible(false);
    this.container.add(this.handIcon);

    // 文字框
    this.textBox = this.scene.add.container(0, 0);
    this.container.add(this.textBox);
  }

  /**
   * 开始三消教程
   */
  startMatch3Tutorial(onComplete?: () => void): void {
    this.steps = [
      {
        text: '欢迎来到小岛物语！\n让我来教你怎么玩～',
        position: 'center',
        action: 'tap',
      },
      {
        text: '点击一个宝石选中它',
        position: 'bottom',
        target: { x: 234, y: 493, radius: 40 },
        action: 'tap',
        highlight: true,
      },
      {
        text: '再点击相邻的宝石交换位置',
        position: 'bottom',
        target: { x: 304, y: 493, radius: 40 },
        action: 'tap',
        highlight: true,
      },
      {
        text: '3个或更多相同的宝石连成一线\n就会消除并得分！',
        position: 'center',
        action: 'wait',
      },
      {
        text: '4个连消会生成条形炸弹 💣\n可以消除整行或整列！',
        position: 'center',
        action: 'tap',
      },
      {
        text: '5个连消会生成彩虹球 🌈\n可以消除所有同色宝石！',
        position: 'center',
        action: 'tap',
      },
      {
        text: '在步数用完前达到目标分数\n就能过关啦！',
        position: 'center',
        action: 'tap',
      },
      {
        text: '过关后会获得资源奖励\n可以用来建设你的小岛！\n\n准备好了吗？开始吧！',
        position: 'center',
        action: 'tap',
      },
    ];

    this.onCompleteCallback = onComplete || null;
    this.currentStep = 0;
    this.isActive = true;
    this.container.setVisible(true);
    this.showCurrentStep();
  }

  /**
   * 显示当前步骤
   */
  private showCurrentStep(): void {
    if (this.currentStep >= this.steps.length) {
      this.complete();
      return;
    }

    const step = this.steps[this.currentStep];

    // 清除之前的内容
    this.overlay.clear();
    this.textBox.removeAll(true);
    this.handIcon.setVisible(false);

    // 绘制遮罩
    this.overlay.fillStyle(0x000000, 0.7);
    
    if (step.target && step.highlight) {
      // 带高亮区域的遮罩
      this.drawHighlightMask(step.target);
      
      // 显示手指
      this.handIcon.setPosition(step.target.x, step.target.y + 30).setVisible(true);
      this.scene.tweens.add({
        targets: this.handIcon,
        y: step.target.y + 40,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    } else {
      // 全屏遮罩
      this.overlay.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    }

    // 创建文字框
    this.createTextBox(step);

    // 点击继续
    if (step.action === 'tap' || step.action === 'wait') {
      this.overlay.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT),
        Phaser.Geom.Rectangle.Contains
      );
      this.overlay.once('pointerdown', () => {
        this.audioManager.playClick();
        this.nextStep();
      });
    }
  }

  /**
   * 绘制带高亮区域的遮罩
   */
  private drawHighlightMask(target: { x: number; y: number; radius?: number }): void {
    const radius = target.radius || 50;

    // 使用图形遮罩技术
    this.overlay.fillStyle(0x000000, 0.7);
    this.overlay.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    // 高亮区域（清除部分遮罩）
    this.overlay.fillStyle(0x000000, 0);
    this.overlay.fillCircle(target.x, target.y, radius);

    // 高亮边框
    this.overlay.lineStyle(3, 0x4ecdc4, 1);
    this.overlay.strokeCircle(target.x, target.y, radius);

    // 脉冲动画
    const pulseCircle = this.scene.add.graphics();
    pulseCircle.lineStyle(2, 0x4ecdc4, 0.5);
    pulseCircle.strokeCircle(target.x, target.y, radius);
    this.container.add(pulseCircle);

    this.scene.tweens.add({
      targets: pulseCircle,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 800,
      repeat: -1,
    });
  }

  /**
   * 创建文字框
   */
  private createTextBox(step: TutorialStep): void {
    const width = GameConfig.WIDTH - 80;
    const padding = 20;

    // 背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(0, 0, width, 120, 15);
    bg.lineStyle(2, 0x4ecdc4, 1);
    bg.strokeRoundedRect(0, 0, width, 120, 15);
    this.textBox.add(bg);

    // 文字
    const text = this.scene.add.text(padding, padding, step.text, {
      fontSize: '20px',
      color: '#ffffff',
      wordWrap: { width: width - padding * 2 },
      lineSpacing: 6,
      align: 'center',
    });
    text.setX((width - text.width) / 2);
    this.textBox.add(text);

    // 调整背景高度
    bg.clear();
    const boxHeight = text.height + padding * 2 + 20;
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(0, 0, width, boxHeight, 15);
    bg.lineStyle(2, 0x4ecdc4, 1);
    bg.strokeRoundedRect(0, 0, width, boxHeight, 15);

    // 点击提示
    const hint = this.scene.add.text(width / 2, boxHeight - 15, '点击继续', {
      fontSize: '14px',
      color: '#4ecdc4',
    }).setOrigin(0.5);
    this.textBox.add(hint);

    // 定位
    let y: number;
    switch (step.position) {
      case 'top':
        y = 150;
        break;
      case 'bottom':
        y = GameConfig.HEIGHT - boxHeight - 100;
        break;
      default:
        y = (GameConfig.HEIGHT - boxHeight) / 2;
    }

    this.textBox.setPosition(40, y);
  }

  /**
   * 下一步
   */
  private nextStep(): void {
    this.scene.tweens.killTweensOf(this.handIcon);
    this.currentStep++;
    this.showCurrentStep();
  }

  /**
   * 完成教程
   */
  private complete(): void {
    this.isActive = false;
    this.container.setVisible(false);
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  /**
   * 跳过教程
   */
  skip(): void {
    this.complete();
  }

  /**
   * 是否正在进行
   */
  isRunning(): boolean {
    return this.isActive;
  }
}
