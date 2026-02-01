import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DialogScene, DialogLine } from '../config/StoryConfig';
import { AudioManager } from './AudioManager';

/**
 * 对话管理器 - 显示剧情对话
 */
export class DialogManager {
  private scene: Phaser.Scene;
  private audioManager: AudioManager;
  private container!: Phaser.GameObjects.Container;
  private dialogBox!: Phaser.GameObjects.Graphics;
  private nameText!: Phaser.GameObjects.Text;
  private contentText!: Phaser.GameObjects.Text;
  private avatarText!: Phaser.GameObjects.Text;
  private continueHint!: Phaser.GameObjects.Text;
  
  private currentDialog: DialogScene | null = null;
  private currentLineIndex: number = 0;
  private isTyping: boolean = false;
  private fullText: string = '';
  private onCompleteCallback: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.audioManager = new AudioManager(scene);
    this.createDialogUI();
  }

  private createDialogUI(): void {
    const width = GameConfig.WIDTH;
    const height = GameConfig.HEIGHT;
    const boxHeight = 200;
    const boxY = height - boxHeight - 20;

    this.container = this.scene.add.container(0, 0).setDepth(1000).setVisible(false);

    // 半透明遮罩
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.3);
    overlay.fillRect(0, 0, width, height);
    this.container.add(overlay);

    // 对话框背景
    this.dialogBox = this.scene.add.graphics();
    this.dialogBox.fillStyle(0x2c3e50, 0.95);
    this.dialogBox.fillRoundedRect(20, boxY, width - 40, boxHeight, 15);
    this.dialogBox.lineStyle(3, 0x4ecdc4, 1);
    this.dialogBox.strokeRoundedRect(20, boxY, width - 40, boxHeight, 15);
    this.container.add(this.dialogBox);

    // 头像/表情
    this.avatarText = this.scene.add.text(70, boxY + 50, '🧝', {
      fontSize: '64px',
    }).setOrigin(0.5);
    this.container.add(this.avatarText);

    // 说话人名字
    this.nameText = this.scene.add.text(130, boxY + 20, '', {
      fontSize: '22px',
      color: '#4ecdc4',
      fontStyle: 'bold',
    });
    this.container.add(this.nameText);

    // 对话内容
    this.contentText = this.scene.add.text(130, boxY + 55, '', {
      fontSize: '20px',
      color: '#ffffff',
      wordWrap: { width: width - 180 },
      lineSpacing: 8,
    });
    this.container.add(this.contentText);

    // 继续提示
    this.continueHint = this.scene.add.text(width - 60, boxY + boxHeight - 30, '▼', {
      fontSize: '20px',
      color: '#4ecdc4',
    }).setOrigin(0.5);
    this.container.add(this.continueHint);

    // 闪烁动画
    this.scene.tweens.add({
      targets: this.continueHint,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // 点击继续
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => this.onTap());
  }

  /**
   * 显示对话
   */
  show(dialog: DialogScene, onComplete?: () => void): void {
    this.currentDialog = dialog;
    this.currentLineIndex = 0;
    this.onCompleteCallback = onComplete || null;
    this.container.setVisible(true);
    this.showCurrentLine();
  }

  /**
   * 隐藏对话
   */
  hide(): void {
    this.container.setVisible(false);
    this.currentDialog = null;
  }

  /**
   * 点击处理
   */
  private onTap(): void {
    if (!this.currentDialog) return;

    if (this.isTyping) {
      // 打字中，直接显示全部
      this.contentText.setText(this.fullText);
      this.isTyping = false;
    } else {
      // 下一句
      this.currentLineIndex++;
      if (this.currentLineIndex < this.currentDialog.lines.length) {
        this.showCurrentLine();
      } else {
        // 对话结束
        this.hide();
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
        }
      }
    }
  }

  /**
   * 显示当前行
   */
  private showCurrentLine(): void {
    if (!this.currentDialog) return;

    const line = this.currentDialog.lines[this.currentLineIndex];
    this.fullText = line.text;

    // 设置说话人
    switch (line.speaker) {
      case 'player':
        this.avatarText.setText('🧑');
        this.nameText.setText(line.name || '你');
        this.nameText.setColor('#ffe66d');
        break;
      case 'npc':
        this.avatarText.setText(this.getEmotionEmoji(line.emotion));
        this.nameText.setText(line.name || 'NPC');
        this.nameText.setColor('#4ecdc4');
        break;
      case 'narrator':
        this.avatarText.setText('📖');
        this.nameText.setText('');
        break;
    }

    // 打字机效果
    this.contentText.setText('');
    this.isTyping = true;
    this.typeText(line.text);
  }

  /**
   * 获取表情 emoji
   */
  private getEmotionEmoji(emotion?: string): string {
    switch (emotion) {
      case 'happy': return '🧝‍♀️';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'surprised': return '😮';
      default: return '🧝';
    }
  }

  /**
   * 打字机效果
   */
  private typeText(text: string): void {
    let index = 0;
    const timer = this.scene.time.addEvent({
      delay: 30,
      callback: () => {
        if (!this.isTyping) {
          timer.destroy();
          return;
        }
        index++;
        this.contentText.setText(text.substring(0, index));
        if (index >= text.length) {
          this.isTyping = false;
          timer.destroy();
        }
      },
      loop: true,
    });
  }

  /**
   * 是否正在显示
   */
  isActive(): boolean {
    return this.container.visible;
  }
}
