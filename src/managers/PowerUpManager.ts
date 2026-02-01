import { GameConfig, ElementType } from '../config/GameConfig';

/**
 * 特殊道具类型
 */
export enum PowerUpType {
  NONE = 'none',
  LINE_H = 'line_h',      // 横向消除
  LINE_V = 'line_v',      // 纵向消除
  BOMB = 'bomb',          // 炸弹（3x3）
  RAINBOW = 'rainbow',    // 彩虹球（消除所有同类）
}

/**
 * 道具生成规则
 */
export interface PowerUpRule {
  matchCount: number;
  shape?: 'line' | 'L' | 'T';
  powerUp: PowerUpType;
}

export const POWER_UP_RULES: PowerUpRule[] = [
  { matchCount: 4, shape: 'line', powerUp: PowerUpType.LINE_H }, // 4个一排 → 条形炸弹
  { matchCount: 5, shape: 'L', powerUp: PowerUpType.BOMB },      // L形5个 → 炸弹
  { matchCount: 5, shape: 'T', powerUp: PowerUpType.BOMB },      // T形5个 → 炸弹
  { matchCount: 5, shape: 'line', powerUp: PowerUpType.RAINBOW }, // 5个一排 → 彩虹球
];

/**
 * 道具管理器
 */
export class PowerUpManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 根据消除形状判断是否生成道具
   */
  determinePowerUp(matchedTiles: { row: number; col: number }[]): PowerUpType {
    const count = matchedTiles.length;

    if (count < 4) return PowerUpType.NONE;

    // 检查是否是直线
    const rows = new Set(matchedTiles.map(t => t.row));
    const cols = new Set(matchedTiles.map(t => t.col));

    const isHorizontalLine = rows.size === 1;
    const isVerticalLine = cols.size === 1;

    if (count === 4) {
      // 4个消除 → 条形炸弹
      return isHorizontalLine ? PowerUpType.LINE_V : PowerUpType.LINE_H;
    }

    if (count >= 5) {
      if (isHorizontalLine || isVerticalLine) {
        // 5个直线 → 彩虹球
        return PowerUpType.RAINBOW;
      } else {
        // L形或T形 → 炸弹
        return PowerUpType.BOMB;
      }
    }

    return PowerUpType.NONE;
  }

  /**
   * 执行道具效果
   */
  executePowerUp(
    powerUp: PowerUpType,
    row: number,
    col: number,
    board: any[][],
    targetType?: ElementType
  ): { row: number; col: number }[] {
    const affected: { row: number; col: number }[] = [];
    const { ROWS, COLS } = GameConfig.BOARD;

    switch (powerUp) {
      case PowerUpType.LINE_H:
        // 消除整行
        for (let c = 0; c < COLS; c++) {
          if (board[row][c]) {
            affected.push({ row, col: c });
          }
        }
        break;

      case PowerUpType.LINE_V:
        // 消除整列
        for (let r = 0; r < ROWS; r++) {
          if (board[r][col]) {
            affected.push({ row: r, col });
          }
        }
        break;

      case PowerUpType.BOMB:
        // 消除3x3区域
        for (let r = row - 1; r <= row + 1; r++) {
          for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c]) {
              affected.push({ row: r, col: c });
            }
          }
        }
        break;

      case PowerUpType.RAINBOW:
        // 消除所有指定类型
        if (targetType) {
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (board[r][c] && board[r][c].type === targetType) {
                affected.push({ row: r, col: c });
              }
            }
          }
        }
        break;
    }

    return affected;
  }

  /**
   * 生成道具的纹理
   */
  generatePowerUpTextures(): void {
    // 条形炸弹（横）
    const lineH = this.scene.make.graphics({ x: 0, y: 0 });
    lineH.fillStyle(0xff6b6b, 1);
    lineH.fillRoundedRect(5, 25, 60, 20, 5);
    lineH.fillStyle(0xffffff, 0.5);
    lineH.fillTriangle(15, 35, 25, 25, 25, 45);
    lineH.fillTriangle(55, 35, 45, 25, 45, 45);
    lineH.generateTexture('powerup_line_h', 70, 70);
    lineH.destroy();

    // 条形炸弹（竖）
    const lineV = this.scene.make.graphics({ x: 0, y: 0 });
    lineV.fillStyle(0xff6b6b, 1);
    lineV.fillRoundedRect(25, 5, 20, 60, 5);
    lineV.fillStyle(0xffffff, 0.5);
    lineV.fillTriangle(35, 15, 25, 25, 45, 25);
    lineV.fillTriangle(35, 55, 25, 45, 45, 45);
    lineV.generateTexture('powerup_line_v', 70, 70);
    lineV.destroy();

    // 炸弹
    const bomb = this.scene.make.graphics({ x: 0, y: 0 });
    bomb.fillStyle(0x2c3e50, 1);
    bomb.fillCircle(35, 38, 25);
    bomb.fillStyle(0xff6b6b, 1);
    bomb.fillCircle(35, 15, 8);
    bomb.lineStyle(3, 0xffe66d, 1);
    bomb.lineBetween(35, 8, 35, 0);
    bomb.generateTexture('powerup_bomb', 70, 70);
    bomb.destroy();

    // 彩虹球
    const rainbow = this.scene.make.graphics({ x: 0, y: 0 });
    const colors = [0xff6b6b, 0xffe66d, 0x4ecdc4, 0x9b59b6, 0x3498db];
    colors.forEach((color, i) => {
      rainbow.fillStyle(color, 1);
      rainbow.slice(35, 35, 28, 
        Phaser.Math.DegToRad(i * 72 - 90), 
        Phaser.Math.DegToRad((i + 1) * 72 - 90), 
        false
      );
      rainbow.fillPath();
    });
    rainbow.fillStyle(0xffffff, 1);
    rainbow.fillCircle(35, 35, 12);
    rainbow.generateTexture('powerup_rainbow', 70, 70);
    rainbow.destroy();
  }

  /**
   * 获取道具显示名称
   */
  getPowerUpName(powerUp: PowerUpType): string {
    switch (powerUp) {
      case PowerUpType.LINE_H:
      case PowerUpType.LINE_V:
        return '条形炸弹';
      case PowerUpType.BOMB:
        return '超级炸弹';
      case PowerUpType.RAINBOW:
        return '彩虹球';
      default:
        return '';
    }
  }
}
