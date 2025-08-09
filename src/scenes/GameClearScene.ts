import Phaser from 'phaser';

export default class GameClearScene extends Phaser.Scene {
    private finalScore: number = 0;
    private cutinImages: string[] = [];
    private cutinImage!: Phaser.GameObjects.Image;

    constructor() {
        super('GameClearScene');
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
        const scaleX = this.scale.width / this.cutinImage.width;
        const scaleY = this.scale.height / this.cutinImage.height;
        const scale = Math.max(scaleX, scaleY);
        this.cutinImage.setScale(scale); // ゲームクリアなので明るいまま

        // --- スタイル定義 ---
        const baseTextStyle = {
            fontFamily: '"M PLUS Rounded 1c", Arial',
            stroke: '#000000',
            strokeThickness: 6
        };
        const titleStyle = {
            ...baseTextStyle,
            fontSize: '64px',
            color: '#00ff00', // 緑色
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

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'GAME CLEAR!', titleStyle).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2, `Final Score: ${this.finalScore}`, scoreStyle).setOrigin(0.5);

        // --- ボタン ---
        const retryButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'タイトルへ戻る', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const textBounds = retryButton.getBounds();
        const bg = this.add.graphics();
        const buttonColor = '#28a745'; // 緑
        const buttonHoverColor = '#218838';

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
