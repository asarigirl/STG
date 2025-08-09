import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    private finalScore: number = 0;
    private isClear: boolean = false;

    constructor() {
        super('GameOverScene');
    }

    init(data: { score: number, isClear?: boolean }) {
        this.finalScore = data.score;
        this.isClear = data.isClear || false;
    }

    create() {
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
