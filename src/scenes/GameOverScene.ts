import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    private finalScore: number = 0;

    constructor() {
        super('GameOverScene');
    }

    init(data: { score: number }) {
        this.finalScore = data.score;
    }

    create() {
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 400, 300, 0x000000, 0.7);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'GAME OVER', {
            font: '48px Arial',
            color: '#ff0000'
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
