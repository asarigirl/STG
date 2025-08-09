import Phaser from 'phaser';

// シーンのインポート
import PreloadScene from './scenes/PreloadScene';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import GameOverScene from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      // debug: true // 開発中に当たり判定などを可視化する場合
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene, TitleScene, GameScene, UIScene, GameOverScene],
};

export default new Phaser.Game(config);
