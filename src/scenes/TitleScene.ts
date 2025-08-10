import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
  private cutinImages: string[] = [];
  private cutinImage!: Phaser.GameObjects.Image;

  constructor() {
    super('TitleScene');
  }

  create() {
    // --- 背景画像の表示と切り替え ---
    for (let i = 0; i < 23; i++) {
        this.cutinImages.push(`cutin_${i}`);
    }
    const randomCutinKey = Phaser.Math.RND.pick(this.cutinImages);
    this.cutinImage = this.add.image(this.scale.width / 2, this.scale.height / 2, randomCutinKey);
    this.updateCutinScale();
    this.time.addEvent({
        delay: 3000,
        callback: this.changeCutinImage,
        callbackScope: this,
        loop: true
    });

    // --- タイトルとテキストのスタイル定義 ---
    const titleStyle = {
        fontFamily: '"M PLUS Rounded 1c", Arial',
        fontSize: '50px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
    };
    const textStyle = {
        fontFamily: '"M PLUS Rounded 1c", Arial',
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
    };
    const buttonStyle = {
        fontFamily: '"M PLUS Rounded 1c", Arial',
        fontSize: '32px',
        color: '#ffffff',
        padding: { x: 20, y: 10 },
    };

    // --- UI要素の作成 ---
    this.add.text(this.scale.width / 2, 100, 'えいえんのアサリガールSTG', titleStyle).setOrigin(0.5);

    const rulesText = [
        '【遊び方】',
        'PC: 矢印キー or AWSDキーで移動',
        'Spaceでショット, XキーでSPウェポン',
        'ESCキーで一時停止',
        'スマホ: スワイプで移動, ショットは自動, SPボタンでSPウェポン',
        'SPウェポンは画面の敵を一掃！(クールダウン10秒)',
        '敵を倒してスコアを稼ごう！'
    ];
    this.add.text(this.scale.width / 2, this.scale.height - 150, rulesText, textStyle).setOrigin(0.5);

    // --- 難易度選択ボタン ---
    const difficulties = ['イージー', 'ノーマル', 'ハード'];
    const buttonWidth = 150; // ボタンの幅を小さく
    const buttonHeight = 45; // ボタンの高さを小さく
    const buttonSpacing = 15; // ボタンの間隔を調整
    const totalWidth = difficulties.length * buttonWidth + (difficulties.length - 1) * buttonSpacing;
    const startX = (this.scale.width - totalWidth) / 2;

    const buttonColors: { [key: string]: string } = {
        'イージー': '#28a745', 'ノーマル': '#007bff', 'ハード': '#dc3545'
    };
    const buttonHoverColors: { [key: string]: string } = {
        'イージー': '#218838', 'ノーマル': '#0069d9', 'ハード': '#c82333'
    };

    difficulties.forEach((difficulty, i) => {
        const buttonX = startX + i * (buttonWidth + buttonSpacing) + buttonWidth / 2;
        const buttonY = 280; // ボタンの位置を少し上に

        const button = this.add.text(buttonX, buttonY, difficulty, {
            ...buttonStyle,
            fontSize: '22px', // 文字サイズをさらに小さく
            fixedWidth: buttonWidth,
            fixedHeight: buttonHeight,
            align: 'center'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        const bg = this.add.graphics();
        
        const drawButton = (color: string) => {
            bg.clear();
            bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
            bg.fillRoundedRect(button.x - button.width / 2, button.y - button.height / 2, button.width, button.height, 15);
        }

        drawButton(buttonColors[difficulty]);
        this.children.moveBelow(bg, button);

        button.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('GameScene', { difficulty: difficulty });
            });
        });

        button.on('pointerover', () => {
            drawButton(buttonHoverColors[difficulty]);
            this.tweens.add({ targets: button, scale: 1.05, duration: 100 });
        });

        button.on('pointerout', () => {
            drawButton(buttonColors[difficulty]);
            this.tweens.add({ targets: button, scale: 1, duration: 100 });
        });
    });
  }

  private changeCutinImage() {
    const randomCutinKey = Phaser.Math.RND.pick(this.cutinImages);
    this.tweens.add({
        targets: this.cutinImage,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
            this.cutinImage.setTexture(randomCutinKey);
            this.updateCutinScale();
            this.tweens.add({
                targets: this.cutinImage,
                alpha: 1,
                duration: 500,
                ease: 'Power2'
            });
        }
    });
  }

  private updateCutinScale() {
      const imageAspectRatio = 3 / 4; // 画像の縦横比 (横3:縦4)
      const screenAspectRatio = this.scale.width / this.scale.height; // 画面の縦横比

      let displayWidth;
      let displayHeight;

      if (screenAspectRatio > imageAspectRatio) {
          // 画面が画像より横長の場合、高さを画面に合わせる
          displayHeight = this.scale.height;
          displayWidth = displayHeight * imageAspectRatio;
      } else {
          // 画面が画像より縦長の場合、幅を画面に合わせる
          displayWidth = this.scale.width;
          displayHeight = displayWidth / imageAspectRatio;
      }

      this.cutinImage.setDisplaySize(displayWidth, displayHeight);
      this.cutinImage.setScrollFactor(0);
  }
}
