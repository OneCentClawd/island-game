/**
 * 游戏全局配置
 */
export const GameConfig = {
  // 画布尺寸 (适配手机竖屏)
  WIDTH: 720,
  HEIGHT: 1280,

  // 三消棋盘配置
  BOARD: {
    ROWS: 8,
    COLS: 8,
    TILE_SIZE: 80,
    OFFSET_X: 40,
    OFFSET_Y: 300,
  },

  // 元素类型
  ELEMENTS: ['wood', 'stone', 'coin', 'star', 'heart', 'diamond'] as const,

  // 颜色配置
  COLORS: {
    PRIMARY: 0x4ecdc4,
    SECONDARY: 0xffe66d,
    ACCENT: 0xff6b6b,
    BACKGROUND: 0xf7fff7,
    TEXT_DARK: 0x2c3e50,
    TEXT_LIGHT: 0xffffff,
  },

  // 动画时长 (毫秒)
  ANIMATION: {
    SWAP: 200,
    FALL: 150,
    DESTROY: 200,
    SCORE_POPUP: 500,
  },

  // 初始资源
  INITIAL_RESOURCES: {
    wood: 100,
    stone: 50,
    coin: 500,
    diamond: 10,
    energy: 30,
  },

  // 体力配置
  ENERGY: {
    MAX: 30,
    PER_LEVEL: 5,
    REGEN_MINUTES: 5,
  },
};

export type ElementType = typeof GameConfig.ELEMENTS[number];
