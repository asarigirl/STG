import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    private finalScore: number = 0;
    private cutinImages: string[] = [];
    private cutinImage!: Phaser.GameObjects.Image;

    constructor() {
        super('GameOverScene');
    }

    init(data: { score: number }) {
        this.finalScore = data.score;
    }

    create() {
        // --- 背景 ---
        for (let i = 0; i < 23; i++) {
            this.cutinImages.push(`cutin_${i}`);
        }
        const randomCutinKey = Phaser.Math.RND.pick(this.cutinImages);
        this.cutinImage = this.add.image(this.scale.width / 2, this.scale.height / 2, randomCutinKey);
        
        // 縦横比4:3に固定し、画面の短い方の辺に合わせて表示
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
        this.cutinImage.setTint(0x808080); // 少し暗くする

        // --- スタイル定義 ---
        const baseTextStyle = {
            fontFamily: '"M PLUS Rounded 1c", Arial',
            stroke: '#000000',
            strokeThickness: 6
        };
        const titleStyle = {
            ...baseTextStyle,
            fontSize: '64px',
            color: '#ff4444', // 赤色
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, stroke: true, fill: true }
        };
        const scoreStyle = {
            ...baseTextStyle,
            fontSize: '40px',
            color: '#ffffff'
        };
        const buttonStyle = {
            ...baseTextStyle,
            fontSize: '32px',
            color: '#ffffff',
            padding: { x: 20, y: 10 }
        };

        // --- UI要素 ---
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'GAME OVER', titleStyle).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2, `Final Score: ${this.finalScore}`, scoreStyle).setOrigin(0.5);

        // --- リトライボタン ---
        const retryButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'タイトルへ戻る', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const textBounds = retryButton.getBounds();
        const bg = this.add.graphics();
        const buttonColor = '#007bff';
        const buttonHoverColor = '#0056b3';

        const drawButton = (color: string) => {
            bg.clear();
            bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
            bg.fillRoundedRect(textBounds.x - 20, textBounds.y - 10, textBounds.width + 40, textBounds.height + 20, 15);
        };

        drawButton(buttonColor);
        this.children.moveBelow(bg, retryButton);

        retryButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('TitleScene');
            });
        });

        retryButton.on('pointerover', () => {
            drawButton(buttonHoverColor);
            this.tweens.add({ targets: retryButton, scale: 1.05, duration: 100 });
        });

        retryButton.on('pointerout', () => {
            drawButton(buttonColor);
            this.tweens.add({ targets: retryButton, scale: 1, duration: 100 });
        });
    }
}