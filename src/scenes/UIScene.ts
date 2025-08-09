import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    private scoreText!: Phaser.GameObjects.Text;
    private cooldownText!: Phaser.GameObjects.Text;
    private score: number = 0;
    private isDesktop: boolean = true;

    // ボスHP関連
    private bossHpBar!: Phaser.GameObjects.Graphics;
    private bossHpText!: Phaser.GameObjects.Text;
    private bossMaxHp: number = 100;

    constructor() {
        super({ key: 'UIScene', active: false });
    }

    init(data: { isDesktop: boolean, bossMaxHp: number }) {
        this.isDesktop = data.isDesktop;
        this.bossMaxHp = data.bossMaxHp;
    }

    create() {
        const fontStyle = { 
            fontFamily: '"M PLUS Rounded 1c", Arial', // フォント指定
            fontSize: '24px', 
            color: '#ffffff' 
        };
        const spReadyStyle = { ...fontStyle, color: '#00ff00' };
        const spCooldownStyle = { ...fontStyle, color: '#ff0000' };

        this.scoreText = this.add.text(10, 10, 'Score: 0', fontStyle);
        this.cooldownText = this.add.text(10, 40, 'SP Ready!', spReadyStyle);

        // SPボタン (モバイル用)
        if (!this.isDesktop) {
            const spButton = this.add.text(this.scale.width - 10, this.scale.height - 10, 'SP', {
                fontFamily: '"M PLUS Rounded 1c", Arial',
                fontSize: '32px',
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

        // GameSceneからのイベントリッスン
        const gameScene = this.scene.get('GameScene');

        gameScene.events.on('addScore', (point: number) => {
            this.score += point;
            this.scoreText.setText('Score: ' + this.score);
        });

        gameScene.events.on('updateCooldown', (cooldown: number) => {
            if (cooldown > 0) {
                this.cooldownText.setText(`SP Cooldown: ${cooldown.toFixed(1)}s`);
                this.cooldownText.setStyle(spCooldownStyle);
            } else {
                this.cooldownText.setText('SP Ready!');
                this.cooldownText.setStyle(spReadyStyle);
            }
        });

        // ボス戦用のUIイベント
        gameScene.events.on('bossBattleStart', this.createBossHpBar, this);
        gameScene.events.on('updateBossHp', this.updateBossHpBar, this);
    }

    private createBossHpBar() {
        this.bossHpBar = this.add.graphics();
        this.bossHpText = this.add.text(this.scale.width / 2, 30, 'BOSS HP', {
            fontFamily: '"M PLUS Rounded 1c", Arial',
            fontSize: '20px',
            color: '#ff0000'
        }).setOrigin(0.5, 0);
        this.updateBossHpBar(this.bossMaxHp);
    }

    private updateBossHpBar(currentHp: number) {
        if (!this.bossHpBar) return;

        this.bossHpBar.clear();
        const barWidth = this.scale.width * 0.8;
        const barHeight = 20;
        const x = (this.scale.width - barWidth) / 2;
        const y = 55;
        const hpPercentage = currentHp / this.bossMaxHp;

        // 背景
        this.bossHpBar.fillStyle(0x800000); // 暗い赤
        this.bossHpBar.fillRect(x, y, barWidth, barHeight);

        // 前景
        this.bossHpBar.fillStyle(0xff0000); // 明るい赤
        this.bossHpBar.fillRect(x, y, barWidth * hpPercentage, barHeight);
        
        // 枠線
        this.bossHpBar.lineStyle(2, 0xffffff);
        this.bossHpBar.strokeRect(x, y, barWidth, barHeight);
    }
}