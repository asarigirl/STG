import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
  private cutinImages: string[] = [];
  private cutinImage!: Phaser.GameObjects.Image;

  constructor() {
    super('TitleScene');
  }

  create() {
    // PreloadSceneで読み込んだカットイン画像のキーを取得
    for (let i = 0; i < 23; i++) { // 23はcフォルダの画像数
        this.cutinImages.push(`cutin_${i}`);
    }

    // ランダムなカットイン画像を表示
    const randomCutinKey = Phaser.Math.RND.pick(this.cutinImages);
    this.cutinImage = this.add.image(this.scale.width / 2, this.scale.height / 2, randomCutinKey);
    const scaleX = this.scale.width / this.cutinImage.width;
    const scaleY = this.scale.height / this.cutinImage.height;
    const scale = Math.min(scaleX, scaleY);
    this.cutinImage.setScale(scale);

    // 一定時間ごとにカットイン画像を切り替える
    this.time.addEvent({
        delay: 3000, // 3秒ごと
        callback: this.changeCutinImage,
        callbackScope: this,
        loop: true
    });

    // タイトルテキスト
    this.add.text(this.scale.width / 2, 100, 'えいえんのアサリガールSLG', {
        font: '50px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
    }).setOrigin(0.5);

    // 遊び方
    const rulesText = [
        '【遊び方】',
        'PC: AWSDキーで移動, Spaceでショット, 左ShiftでSPウェポン',
        'スマホ: スワイプで移動, ショットは自動, SPボタンでSPウェポン',
        'SPウェポンは10秒に1回使用可能',
        '敵を倒してスコアを稼ごう！'
    ];
    this.add.text(this.scale.width / 2, this.scale.height - 150, rulesText, {
        font: '20px Arial',
        color: '#ffffff',
        align: 'center'
    }).setOrigin(0.5);

    // 難易度選択
    const difficulties = ['イージー', 'ノーマル', 'ハード'];
    difficulties.forEach((difficulty, i) => {
        const button = this.add.text(this.scale.width / 2, 300 + i * 60, difficulty, {
            font: '32px Arial',
            color: '#00ff00',
            backgroundColor: '#333333'
        })
        .setPadding(10)
        .setOrigin(0.5)
        .setInteractive();

        button.on('pointerdown', () => {
            this.scene.start('GameScene', { difficulty: difficulty });
        });

        button.on('pointerover', () => button.setBackgroundColor('#555555'));
        button.on('pointerout', () => button.setBackgroundColor('#333333'));
    });
  }

  private changeCutinImage() {
    const randomCutinKey = Phaser.Math.RND.pick(this.cutinImages);
    this.cutinImage.setTexture(randomCutinKey);
    const scaleX = this.scale.width / this.cutinImage.width;
    const scaleY = this.scale.height / this.cutinImage.height;
    const scale = Math.min(scaleX, scaleY);
    this.cutinImage.setScale(scale);
  }
}
