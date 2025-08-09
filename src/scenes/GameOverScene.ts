import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    private finalScore: number = 0;
    private isClear: boolean = false;
    private cutinImages: string[] = [];
    private cutinImage!: Phaser.GameObjects.Image;

    constructor() {
        super('GameOverScene');
    }

    init(data: { score: number, isClear?: boolean }) {
        this.finalScore = data.score;
        this.isClear = data.isClear || false;
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

        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 600, 400, 0x000000, 0.7);

        const titleText = this.isClear ? 'GAME CLEAR!' : 'GAME OVER';
        const titleColor = this.isClear ? '#00ff00' : '#ff0000';

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, titleText, {
            font: '48px Arial',
            color: titleColor
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2, `Final Score: ${this.finalScore}` , {
            font: '32px Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        const retryButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'リトライ', {
            font: '32px Arial',
            color: '#00ff00',
            backgroundColor: '#333333'
        })
        .setPadding(10)
        .setOrigin(0.5)
        .setInteractive();

        retryButton.on('pointerdown', () => {
            this.scene.start('TitleScene');
        });

        retryButton.on('pointerover', () => retryButton.setBackgroundColor('#555555'));
        retryButton.on('pointerout', () => retryButton.setBackgroundColor('#333333'));
    }
}
