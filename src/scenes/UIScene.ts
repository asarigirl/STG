import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    private scoreText!: Phaser.GameObjects.Text;
    private cooldownText!: Phaser.GameObjects.Text;
    private score: number = 0;
    private isDesktop: boolean = true;

    constructor() {
        super({ key: 'UIScene', active: false });
    }

    init(data: { isDesktop: boolean }) {
        this.isDesktop = data.isDesktop;
    }

    create() {
        this.scoreText = this.add.text(10, 10, 'Score: 0', { font: '24px Arial', color: '#ffffff' });
        this.cooldownText = this.add.text(10, 40, 'SP Ready!', { font: '24px Arial', color: '#00ff00' });

        if (!this.isDesktop) {
            const spButton = this.add.text(this.scale.width - 10, this.scale.height - 10, 'SP', {
                font: '32px Arial',
                color: '#ffff00',
                backgroundColor: '#555555'
            })
            .setOrigin(1, 1)
            .setPadding(15)
            .setInteractive();

            spButton.on('pointerdown', () => {
                this.scene.get('GameScene').events.emit('fireSP', this.time.now);
            });
        }

        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('addScore', (point: number) => {
            this.score += point;
            this.scoreText.setText('Score: ' + this.score);
        });

        gameScene.events.on('updateCooldown', (cooldown: number) => {
            if (cooldown > 0) {
                this.cooldownText.setText(`SP Cooldown: ${cooldown.toFixed(1)}s`);
                this.cooldownText.setColor('#ff0000');
            } else {
                this.cooldownText.setText('SP Ready!');
                this.cooldownText.setColor('#00ff00');
            }
        });
    }
}
