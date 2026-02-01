import Phaser from 'phaser';
import { GameConfig, ElementType } from '../config/GameConfig';
import { getLevelConfig, getLevelRewards } from '../config/LevelConfig';
import { PowerUpManager, PowerUpType } from '../managers/PowerUpManager';
import { AudioManager } from '../managers/AudioManager';
import { saveManager } from '../managers/SaveManager';

interface Tile {
  sprite: Phaser.GameObjects.Image;
  type: ElementType;
  row: number;
  col: number;
  powerUp?: PowerUpType;
}

/**
 * 三消游戏场景
 */
export class Match3Scene extends Phaser.Scene {
  private board: (Tile | null)[][] = [];
  private selectedTile: Tile | null = null;
  private isProcessing: boolean = false;
  private score: number = 0;
  private moves: number = 20;
  private targetScore: number = 1000;
  private currentLevel: number = 1;
  private combo: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private selectIndicator!: Phaser.GameObjects.Image;
  private powerUpManager!: PowerUpManager;
  private audioManager!: AudioManager;

  constructor() {
    super({ key: 'Match3Scene' });
  }

  create(): void {
    this.currentLevel = this.registry.get('currentLevel') || saveManager.getCurrentLevel();
    const levelConfig = getLevelConfig(this.currentLevel);

    this.score = 0;
    this.moves = levelConfig.moves;
    this.targetScore = levelConfig.targetScore;
    this.combo = 0;
    this.isProcessing = false;
    this.selectedTile = null;

    // 初始化管理器
    this.powerUpManager = new PowerUpManager(this);
    this.audioManager = new AudioManager(this);
    this.powerUpManager.generatePowerUpTextures();

    // 背景
    this.add.graphics()
      .fillGradientStyle(0x2c3e50, 0x2c3e50, 0x1a252f, 0x1a252f, 1)
      .fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    // 创建UI
    this.createUI();

    // 创建棋盘背景
    this.createBoardBackground();

    // 初始化棋盘
    this.initBoard();

    // 创建选中指示器
    this.selectIndicator = this.add.image(0, 0, 'select').setVisible(false).setDepth(10);

    // 返回按钮
    this.createBackButton();
  }

  private createUI(): void {
    const centerX = GameConfig.WIDTH / 2;

    // 关卡信息面板
    this.add.image(centerX, 120, 'panel').setScale(2.2, 0.8);

    this.add.text(centerX, 80, `第 ${this.currentLevel} 关`, {
      fontSize: '28px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 分数
    this.add.text(centerX - 100, 130, '分数', {
      fontSize: '18px',
      color: '#666666',
    }).setOrigin(0.5);

    this.scoreText = this.add.text(centerX - 100, 160, '0', {
      fontSize: '32px',
      color: '#4ecdc4',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 目标
    this.add.text(centerX + 100, 130, '目标', {
      fontSize: '18px',
      color: '#666666',
    }).setOrigin(0.5);

    this.add.text(centerX + 100, 160, `${this.targetScore}`, {
      fontSize: '32px',
      color: '#ff6b6b',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 剩余步数
    this.add.text(centerX, 220, '剩余步数', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.movesText = this.add.text(centerX, 260, `${this.moves}`, {
      fontSize: '48px',
      color: '#ffe66d',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 连击提示（隐藏）
    this.comboText = this.add.text(centerX, 320, '', {
      fontSize: '24px',
      color: '#ff6b6b',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
  }

  private createBoardBackground(): void {
    const { ROWS, COLS, TILE_SIZE, OFFSET_X, OFFSET_Y } = GameConfig.BOARD;
    const boardWidth = COLS * TILE_SIZE;
    const boardHeight = ROWS * TILE_SIZE;

    // 棋盘背景
    const boardBg = this.add.graphics();
    boardBg.fillStyle(0x000000, 0.3);
    boardBg.fillRoundedRect(
      OFFSET_X - 10,
      OFFSET_Y - 10,
      boardWidth + 20,
      boardHeight + 20,
      15
    );

    // 格子背景
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
        const y = OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;
        const isLight = (row + col) % 2 === 0;

        const cellBg = this.add.graphics();
        cellBg.fillStyle(isLight ? 0xffffff : 0xe8e8e8, 0.2);
        cellBg.fillRoundedRect(
          x - TILE_SIZE / 2 + 2,
          y - TILE_SIZE / 2 + 2,
          TILE_SIZE - 4,
          TILE_SIZE - 4,
          8
        );
      }
    }
  }

  private initBoard(): void {
    const { ROWS, COLS } = GameConfig.BOARD;

    // 初始化二维数组
    this.board = [];
    for (let row = 0; row < ROWS; row++) {
      this.board[row] = [];
      for (let col = 0; col < COLS; col++) {
        this.board[row][col] = null;
      }
    }

    // 填充棋盘，确保没有初始匹配
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        this.createTileAt(row, col, true);
      }
    }
  }

  private createTileAt(row: number, col: number, checkMatch: boolean = false): Tile {
    const { TILE_SIZE, OFFSET_X, OFFSET_Y } = GameConfig.BOARD;
    const x = OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
    const y = OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;

    let type: ElementType;
    do {
      type = GameConfig.ELEMENTS[Phaser.Math.Between(0, GameConfig.ELEMENTS.length - 1)];
    } while (checkMatch && this.wouldMatch(row, col, type));

    const sprite = this.add.image(x, y, type)
      .setInteractive({ useHandCursor: true })
      .setScale(0.9);

    sprite.on('pointerdown', () => this.onTileClick(row, col));

    const tile: Tile = { sprite, type, row, col, powerUp: PowerUpType.NONE };
    this.board[row][col] = tile;

    return tile;
  }

  private wouldMatch(row: number, col: number, type: ElementType): boolean {
    // 检查水平方向
    if (col >= 2) {
      const left1 = this.board[row][col - 1];
      const left2 = this.board[row][col - 2];
      if (left1 && left2 && left1.type === type && left2.type === type) {
        return true;
      }
    }

    // 检查垂直方向
    if (row >= 2) {
      const up1 = this.board[row - 1][col];
      const up2 = this.board[row - 2][col];
      if (up1 && up2 && up1.type === type && up2.type === type) {
        return true;
      }
    }

    return false;
  }

  private onTileClick(row: number, col: number): void {
    if (this.isProcessing || this.moves <= 0) return;

    const clickedTile = this.board[row][col];
    if (!clickedTile) return;

    this.audioManager.playClick();

    if (!this.selectedTile) {
      // 选中第一个方块
      this.selectedTile = clickedTile;
      this.selectIndicator.setPosition(clickedTile.sprite.x, clickedTile.sprite.y).setVisible(true);
    } else if (this.selectedTile === clickedTile) {
      // 取消选中
      this.selectedTile = null;
      this.selectIndicator.setVisible(false);
    } else if (this.isAdjacent(this.selectedTile, clickedTile)) {
      // 交换相邻方块
      this.swapTiles(this.selectedTile, clickedTile);
    } else {
      // 选中新方块
      this.selectedTile = clickedTile;
      this.selectIndicator.setPosition(clickedTile.sprite.x, clickedTile.sprite.y);
    }
  }

  private isAdjacent(tile1: Tile, tile2: Tile): boolean {
    const rowDiff = Math.abs(tile1.row - tile2.row);
    const colDiff = Math.abs(tile1.col - tile2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  private async swapTiles(tile1: Tile, tile2: Tile): Promise<void> {
    this.isProcessing = true;
    this.selectIndicator.setVisible(false);
    this.selectedTile = null;

    // 检查是否有彩虹球参与交换
    const rainbowTile = tile1.powerUp === PowerUpType.RAINBOW ? tile1 : 
                        tile2.powerUp === PowerUpType.RAINBOW ? tile2 : null;
    const otherTile = rainbowTile === tile1 ? tile2 : tile1;

    if (rainbowTile) {
      // 彩虹球特殊处理：消除所有同类
      this.moves--;
      this.movesText.setText(`${this.moves}`);
      this.combo = 0;
      
      await this.executeRainbowPowerUp(rainbowTile, otherTile.type);
      await this.processMatches();
      this.isProcessing = false;
      this.checkGameEnd();
      return;
    }

    // 执行交换动画
    await this.animateSwap(tile1, tile2);

    // 更新棋盘数据
    this.board[tile1.row][tile1.col] = tile2;
    this.board[tile2.row][tile2.col] = tile1;

    // 交换位置信息
    [tile1.row, tile2.row] = [tile2.row, tile1.row];
    [tile1.col, tile2.col] = [tile2.col, tile1.col];

    // 检查是否有匹配
    const matches = this.findMatches();
    if (matches.length > 0) {
      this.moves--;
      this.movesText.setText(`${this.moves}`);
      this.combo = 0;
      await this.processMatches();
    } else {
      // 没有匹配，换回来
      await this.animateSwap(tile1, tile2);
      this.board[tile1.row][tile1.col] = tile2;
      this.board[tile2.row][tile2.col] = tile1;
      [tile1.row, tile2.row] = [tile2.row, tile1.row];
      [tile1.col, tile2.col] = [tile2.col, tile1.col];
    }

    this.isProcessing = false;

    // 检查游戏结束
    this.checkGameEnd();
  }

  private async executeRainbowPowerUp(rainbowTile: Tile, targetType: ElementType): Promise<void> {
    const { ROWS, COLS } = GameConfig.BOARD;
    const tilesToRemove: Tile[] = [rainbowTile];

    // 找出所有目标类型的方块
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = this.board[r][c];
        if (tile && tile.type === targetType) {
          tilesToRemove.push(tile);
        }
      }
    }

    this.audioManager.playPowerUp();

    // 计分
    const points = tilesToRemove.length * 20;
    this.score += points;
    this.scoreText.setText(`${this.score}`);
    this.showScorePopup(points);

    // 消除动画
    await this.animateDestroy(tilesToRemove);

    // 从棋盘移除
    for (const tile of tilesToRemove) {
      this.board[tile.row][tile.col] = null;
      tile.sprite.destroy();
    }

    // 下落和填充
    await this.dropTiles();
    await this.fillBoard();
  }

  private animateSwap(tile1: Tile, tile2: Tile): Promise<void> {
    return new Promise((resolve) => {
      const duration = GameConfig.ANIMATION.SWAP;

      this.tweens.add({
        targets: tile1.sprite,
        x: tile2.sprite.x,
        y: tile2.sprite.y,
        duration,
        ease: 'Power2',
      });

      this.tweens.add({
        targets: tile2.sprite,
        x: tile1.sprite.x,
        y: tile1.sprite.y,
        duration,
        ease: 'Power2',
        onComplete: () => resolve(),
      });
    });
  }

  private findMatches(): Tile[][] {
    const matches: Tile[][] = [];
    const { ROWS, COLS } = GameConfig.BOARD;

    // 检查水平匹配
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 2; col++) {
        const match = this.getHorizontalMatch(row, col);
        if (match.length >= 3) {
          matches.push(match);
          col += match.length - 1;
        }
      }
    }

    // 检查垂直匹配
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 2; row++) {
        const match = this.getVerticalMatch(row, col);
        if (match.length >= 3) {
          matches.push(match);
          row += match.length - 1;
        }
      }
    }

    return matches;
  }

  private getHorizontalMatch(row: number, col: number): Tile[] {
    const match: Tile[] = [];
    const tile = this.board[row][col];
    if (!tile) return match;

    const type = tile.type;
    for (let c = col; c < GameConfig.BOARD.COLS; c++) {
      const t = this.board[row][c];
      if (t && t.type === type) {
        match.push(t);
      } else {
        break;
      }
    }
    return match;
  }

  private getVerticalMatch(row: number, col: number): Tile[] {
    const match: Tile[] = [];
    const tile = this.board[row][col];
    if (!tile) return match;

    const type = tile.type;
    for (let r = row; r < GameConfig.BOARD.ROWS; r++) {
      const t = this.board[r][col];
      if (t && t.type === type) {
        match.push(t);
      } else {
        break;
      }
    }
    return match;
  }

  private async processMatches(): Promise<void> {
    let matches = this.findMatches();

    while (matches.length > 0) {
      this.combo++;

      // 移除匹配的方块，同时检查道具生成
      const removedTiles = new Set<Tile>();
      const powerUpsToCreate: { row: number; col: number; type: PowerUpType; elementType: ElementType }[] = [];

      for (const match of matches) {
        // 检查是否应该生成道具
        const powerUpType = this.powerUpManager.determinePowerUp(
          match.map(t => ({ row: t.row, col: t.col }))
        );

        if (powerUpType !== PowerUpType.NONE) {
          // 在中间位置生成道具
          const midIndex = Math.floor(match.length / 2);
          const midTile = match[midIndex];
          powerUpsToCreate.push({
            row: midTile.row,
            col: midTile.col,
            type: powerUpType,
            elementType: midTile.type,
          });
        }

        for (const tile of match) {
          // 检查是否有道具被消除
          if (tile.powerUp && tile.powerUp !== PowerUpType.NONE) {
            // 触发道具效果
            const affected = this.powerUpManager.executePowerUp(
              tile.powerUp,
              tile.row,
              tile.col,
              this.board,
              tile.type
            );
            for (const pos of affected) {
              const affectedTile = this.board[pos.row][pos.col];
              if (affectedTile) {
                removedTiles.add(affectedTile);
              }
            }
          }
          removedTiles.add(tile);
        }
      }

      // 计分（带连击加成）
      const basePoints = removedTiles.size * 10;
      const comboMultiplier = 1 + (this.combo - 1) * 0.5;
      const points = Math.floor(basePoints * comboMultiplier);
      this.score += points;
      this.scoreText.setText(`${this.score}`);

      // 显示连击和得分
      if (this.combo > 1) {
        this.showCombo();
      }
      this.showScorePopup(points);
      this.audioManager.playMatch(this.combo);

      // 播放消除动画
      await this.animateDestroy([...removedTiles]);

      // 从棋盘移除
      for (const tile of removedTiles) {
        this.board[tile.row][tile.col] = null;
        tile.sprite.destroy();
      }

      // 生成道具
      for (const pu of powerUpsToCreate) {
        if (!this.board[pu.row][pu.col]) {
          this.createPowerUpTile(pu.row, pu.col, pu.type, pu.elementType);
          this.audioManager.playPowerUp();
        }
      }

      // 方块下落
      await this.dropTiles();

      // 填充新方块
      await this.fillBoard();

      // 继续检查新的匹配
      matches = this.findMatches();
    }
  }

  private createPowerUpTile(row: number, col: number, powerUpType: PowerUpType, elementType: ElementType): void {
    const { TILE_SIZE, OFFSET_X, OFFSET_Y } = GameConfig.BOARD;
    const x = OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
    const y = OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;

    // 使用道具纹理
    let textureKey = elementType as string;
    switch (powerUpType) {
      case PowerUpType.LINE_H:
        textureKey = 'powerup_line_h';
        break;
      case PowerUpType.LINE_V:
        textureKey = 'powerup_line_v';
        break;
      case PowerUpType.BOMB:
        textureKey = 'powerup_bomb';
        break;
      case PowerUpType.RAINBOW:
        textureKey = 'powerup_rainbow';
        break;
    }

    const sprite = this.add.image(x, y, textureKey)
      .setInteractive({ useHandCursor: true })
      .setScale(0);

    sprite.on('pointerdown', () => this.onTileClick(row, col));

    // 弹出动画
    this.tweens.add({
      targets: sprite,
      scale: 0.9,
      duration: 200,
      ease: 'Back.easeOut',
    });

    const tile: Tile = { sprite, type: elementType, row, col, powerUp: powerUpType };
    this.board[row][col] = tile;
  }

  private showCombo(): void {
    this.comboText.setText(`${this.combo} 连击!`);
    this.comboText.setAlpha(1);
    this.comboText.setScale(1.5);

    this.tweens.add({
      targets: this.comboText,
      scale: 1,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
    });
  }

  private showScorePopup(points: number): void {
    const centerX = GameConfig.WIDTH / 2;
    const popup = this.add.text(centerX, 500, `+${points}`, {
      fontSize: '48px',
      color: '#ffe66d',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: popup.y - 100,
      alpha: 0,
      duration: GameConfig.ANIMATION.SCORE_POPUP,
      onComplete: () => popup.destroy(),
    });
  }

  private animateDestroy(tiles: Tile[]): Promise<void> {
    return new Promise((resolve) => {
      if (tiles.length === 0) {
        resolve();
        return;
      }

      let completed = 0;
      for (const tile of tiles) {
        this.tweens.add({
          targets: tile.sprite,
          scale: 0,
          alpha: 0,
          duration: GameConfig.ANIMATION.DESTROY,
          ease: 'Back.easeIn',
          onComplete: () => {
            completed++;
            if (completed === tiles.length) resolve();
          },
        });
      }
    });
  }

  private async dropTiles(): Promise<void> {
    const { ROWS, COLS, TILE_SIZE, OFFSET_Y } = GameConfig.BOARD;
    const promises: Promise<void>[] = [];

    for (let col = 0; col < COLS; col++) {
      let emptyRow = ROWS - 1;

      for (let row = ROWS - 1; row >= 0; row--) {
        const tile = this.board[row][col];
        if (tile) {
          if (row !== emptyRow) {
            // 移动到新位置
            this.board[emptyRow][col] = tile;
            this.board[row][col] = null;
            tile.row = emptyRow;

            const newY = OFFSET_Y + emptyRow * TILE_SIZE + TILE_SIZE / 2;
            const distance = emptyRow - row;

            promises.push(new Promise((resolve) => {
              this.tweens.add({
                targets: tile.sprite,
                y: newY,
                duration: GameConfig.ANIMATION.FALL * distance,
                ease: 'Bounce.easeOut',
                onComplete: () => resolve(),
              });
            }));
          }
          emptyRow--;
        }
      }
    }

    if (promises.length > 0) {
      this.audioManager.playDrop();
    }
    await Promise.all(promises);
  }

  private async fillBoard(): Promise<void> {
    const { ROWS, COLS, TILE_SIZE, OFFSET_X, OFFSET_Y } = GameConfig.BOARD;
    const promises: Promise<void>[] = [];

    for (let col = 0; col < COLS; col++) {
      let emptyCount = 0;
      for (let row = 0; row < ROWS; row++) {
        if (!this.board[row][col]) {
          emptyCount++;
        }
      }

      let fillIndex = 0;
      for (let row = 0; row < ROWS; row++) {
        if (!this.board[row][col]) {
          const type = GameConfig.ELEMENTS[Phaser.Math.Between(0, GameConfig.ELEMENTS.length - 1)];
          const x = OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
          const finalY = OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;
          const startY = OFFSET_Y - (emptyCount - fillIndex) * TILE_SIZE;

          const sprite = this.add.image(x, startY, type)
            .setInteractive({ useHandCursor: true })
            .setScale(0.9);

          sprite.on('pointerdown', () => this.onTileClick(row, col));

          const tile: Tile = { sprite, type, row, col, powerUp: PowerUpType.NONE };
          this.board[row][col] = tile;

          promises.push(new Promise((resolve) => {
            this.tweens.add({
              targets: sprite,
              y: finalY,
              duration: GameConfig.ANIMATION.FALL * (emptyCount - fillIndex + 1),
              ease: 'Bounce.easeOut',
              onComplete: () => resolve(),
            });
          }));

          fillIndex++;
        }
      }
    }

    await Promise.all(promises);
  }

  private checkGameEnd(): void {
    if (this.score >= this.targetScore) {
      this.showResult(true);
    } else if (this.moves <= 0) {
      this.showResult(false);
    }
  }

  private showResult(isWin: boolean): void {
    if (isWin) {
      this.audioManager.playWin();
    } else {
      this.audioManager.playLose();
    }

    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    const centerX = GameConfig.WIDTH / 2;
    const centerY = GameConfig.HEIGHT / 2;

    // 结果面板
    this.add.image(centerX, centerY, 'panel').setScale(2.5, 2.5);

    // 结果文字
    const emoji = isWin ? '🎉' : '😢';
    const title = isWin ? '恭喜过关！' : '再接再厉！';
    const color = isWin ? '#4ecdc4' : '#ff6b6b';

    this.add.text(centerX, centerY - 120, emoji, {
      fontSize: '80px',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 40, title, {
      fontSize: '36px',
      color: color,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 20, `得分: ${this.score}`, {
      fontSize: '28px',
      color: '#2c3e50',
    }).setOrigin(0.5);

    // 计算星级
    const stars = this.calculateStars();
    this.showStars(centerX, centerY + 70, stars);

    // 按钮
    if (isWin) {
      // 保存进度
      saveManager.completeLevel(this.currentLevel, stars);

      // 获取奖励
      const rewards = getLevelRewards(this.currentLevel, stars);
      saveManager.updateResources(rewards);

      // 显示奖励
      this.add.text(centerX, centerY + 120, 
        `奖励: 🪵${rewards.wood} 🪨${rewards.stone} 💰${rewards.coin}${rewards.diamond > 0 ? ` 💎${rewards.diamond}` : ''}`, 
        {
          fontSize: '18px',
          color: '#2c3e50',
        }
      ).setOrigin(0.5);

      this.registry.set('currentLevel', this.currentLevel + 1);

      this.createResultButton(centerX, centerY + 170, '下一关', () => {
        this.scene.restart();
      });
    } else {
      this.createResultButton(centerX, centerY + 150, '重新挑战', () => {
        this.scene.restart();
      });
    }

    this.createResultButton(centerX, centerY + 230, '返回', () => {
      this.scene.start('LevelSelectScene');
    });
  }

  private calculateStars(): number {
    const ratio = this.score / this.targetScore;
    if (ratio >= 2) return 3;
    if (ratio >= 1.5) return 2;
    return 1;
  }

  private showStars(x: number, y: number, count: number): void {
    for (let i = 0; i < 3; i++) {
      const starX = x + (i - 1) * 50;
      const filled = i < count;
      this.add.text(starX, y, filled ? '⭐' : '☆', {
        fontSize: '36px',
      }).setOrigin(0.5);
    }
  }

  private createResultButton(x: number, y: number, text: string, callback: () => void): void {
    const button = this.add.image(x, y, 'button')
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, text, {
      fontSize: '20px',
      color: '#2c3e50',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.on('pointerup', () => {
      this.audioManager.playClick();
      callback();
    });
  }

  private createBackButton(): void {
    const backBtn = this.add.text(50, 50, '← 返回', {
      fontSize: '24px',
      color: '#ffffff',
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => {
      this.audioManager.playClick();
      this.scene.start('LevelSelectScene');
    });
  }
}
