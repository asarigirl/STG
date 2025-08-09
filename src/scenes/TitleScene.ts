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
        'PC: AWSDキーで移動, Spaceでショット, XキーでSPウェポン',
        'スマホ: スワイプで移動, ショットは自動, SPボタンでSPウェポン',
        'SPウェポンは画面の敵を一掃！(クールダウン10秒)',
        '敵を倒してスコアを稼ごう！'
    ];
    this.add.text(this.scale.width / 2, this.scale.height - 150, rulesText, textStyle).setOrigin(0.5);

    // --- 難易度選択ボタン ---
    const difficulties = ['イージー', 'ノーマル', 'ハード'];
    const buttonColors: { [key: string]: string } = {
        'イージー': '#28a745', // 緑
        'ノーマル': '#007bff', // 青
        'ハード': '#dc3545'   // 赤
    };
    const buttonHoverColors: { [key: string]: string } = {
        'イージー': '#218838',
        'ノーマル': '#0069d9',
        'ハード': '#c82333'
    };

    difficulties.forEach((difficulty, i) => {
        const button = this.add.text(this.scale.width / 2, 300 + i * 70, difficulty, {
            ...buttonStyle,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        const textBounds = button.getBounds();
        const bg = this.add.graphics();
        
        const drawButton = (color: string) => {
            bg.clear();
            bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
            bg.fillRoundedRect(textBounds.x - 20, textBounds.y - 10, textBounds.width + 40, textBounds.height + 20, 15);
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
      const scaleX = this.scale.width / this.cutinImage.width;
      const scaleY = this.scale.height / this.cutinImage.height;
      const scale = Math.max(scaleX, scaleY); // 画面全体を覆うように調整
      this.cutinImage.setScale(scale).setScrollFactor(0);
  }
}