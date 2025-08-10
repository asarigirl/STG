import Phaser from 'phaser';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        // 半透明の背景
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.7)
            .setDepth(1);

        const fontStyle = {
            fontFamily: '"M PLUS Rounded 1c", Arial',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        };

        const buttonStyle = {
            fontFamily: '"M PLUS Rounded 1c", Arial',
            fontSize: '32px',
            color: '#ffffff',
            padding: { x: 20, y: 10 },
        };

        // ポーズテキスト
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'PAUSED', fontStyle)
            .setOrigin(0.5)
            .setDepth(2);

        // 続行ボタン
        const resumeButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 20, '続行', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(2);

        const resumeButtonBg = this.add.graphics().setDepth(1);
        const resumeButtonColor = '#28a745'; // 緑
        const resumeButtonHoverColor = '#218838';
        this.drawButtonBackground(resumeButtonBg, resumeButton, resumeButtonColor);

        resumeButton.on('pointerdown', () => {
            this.scene.resume('GameScene');
            this.scene.stop();
        });

        resumeButton.on('pointerover', () => {
            this.drawButtonBackground(resumeButtonBg, resumeButton, resumeButtonHoverColor);
            this.tweens.add({ targets: resumeButton, scale: 1.05, duration: 100 });
        });

        resumeButton.on('pointerout', () => {
            this.drawButtonBackground(resumeButtonBg, resumeButton, resumeButtonColor);
            this.tweens.add({ targets: resumeButton, scale: 1, duration: 100 });
        });

        // ゲーム終了ボタン
        const exitButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'ゲーム終了', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(2);

        const exitButtonBg = this.add.graphics().setDepth(1);
        const exitButtonColor = '#dc3545'; // 赤
        const exitButtonHoverColor = '#c82333';
        this.drawButtonBackground(exitButtonBg, exitButton, exitButtonColor);

        exitButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('TitleScene');
        });

        exitButton.on('pointerover', () => {
            this.drawButtonBackground(exitButtonBg, exitButton, exitButtonHoverColor);
            this.tweens.add({ targets: exitButton, scale: 1.05, duration: 100 });
        });

        exitButton.on('pointerout', () => {
            this.drawButtonBackground(exitButtonBg, exitButton, exitButtonColor);
            this.tweens.add({ targets: exitButton, scale: 1, duration: 100 });
        });
    }

    private drawButtonBackground(graphics: Phaser.GameObjects.Graphics, text: Phaser.GameObjects.Text, color: string) {
        const textBounds = text.getBounds();
        graphics.clear();
        graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
        graphics.fillRoundedRect(textBounds.x - 20, textBounds.y - 10, textBounds.width + 40, textBounds.height + 20, 15);
    }
}
