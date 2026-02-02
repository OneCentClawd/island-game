import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { Match3Scene } from './scenes/Match3Scene';
import { IslandScene } from './scenes/IslandScene';
import { AchievementScene } from './scenes/AchievementScene';
import { DailyTaskScene } from './scenes/DailyTaskScene';
import { ShopScene } from './scenes/ShopScene';
import { MergeScene } from './scenes/MergeScene';
import { GameConfig } from './config/GameConfig';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.WIDTH,
  height: GameConfig.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#4ECDC4',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, MainMenuScene, LevelSelectScene, Match3Scene, IslandScene, AchievementScene, DailyTaskScene, ShopScene, MergeScene],
};

new Phaser.Game(config);
