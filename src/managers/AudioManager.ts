/**
 * 音效管理器
 * 目前使用 Web Audio API 生成简单音效，后续可替换为真实音频文件
 */
export class AudioManager {
  private scene: Phaser.Scene;
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API 不可用');
      this.enabled = false;
    }
  }

  /**
   * 播放消除音效
   */
  playMatch(combo: number = 1): void {
    if (!this.enabled || !this.audioContext) return;

    const frequency = 440 + combo * 100; // 连击越高音调越高
    this.playTone(frequency, 0.1, 'sine');
  }

  /**
   * 播放下落音效
   */
  playDrop(): void {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(200, 0.05, 'triangle');
  }

  /**
   * 播放道具音效
   */
  playPowerUp(): void {
    if (!this.enabled || !this.audioContext) return;

    // 播放上升音阶
    [440, 554, 659, 880].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.1, 'sine'), i * 50);
    });
  }

  /**
   * 播放胜利音效
   */
  playWin(): void {
    if (!this.enabled || !this.audioContext) return;

    const melody = [523, 659, 784, 1047]; // C5, E5, G5, C6
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 150);
    });
  }

  /**
   * 播放失败音效
   */
  playLose(): void {
    if (!this.enabled || !this.audioContext) return;

    const melody = [392, 349, 330, 262]; // G4, F4, E4, C4
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 200);
    });
  }

  /**
   * 播放按钮点击音效
   */
  playClick(): void {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(800, 0.05, 'square');
  }

  /**
   * 播放建造音效
   */
  playBuild(): void {
    if (!this.enabled || !this.audioContext) return;

    // 模拟锤子敲击
    [200, 250, 200].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.08, 'square'), i * 100);
    });
  }

  /**
   * 基础音调播放
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // 淡入淡出
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * 开关音效
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * 获取音效状态
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
