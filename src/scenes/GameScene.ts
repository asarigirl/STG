import Phaser from 'phaser';

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bullet');
    }

    fire(x: number, y: number, velocityX: number, velocityY: number) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setVelocity(velocityX, velocityY);
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        // 弾が画面外に出たら非アクティブ化
        if (this.x <= -10 || this.x >= this.scene.scale.width + 10 || this.y <= -10 || this.y >= this.scene.scale.height + 10) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

export default class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys: any = {};
    private bg!: Phaser.GameObjects.TileSprite;
    private bullets!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private bossBullets!: Phaser.Physics.Arcade.Group;
    private boss!: Phaser.Physics.Arcade.Sprite;
    private enemyImages: string[] = [];
    private playerImages: string[] = [];
    private bgImages: string[] = [];
    private bgmAudio: string[] = [];
    private cutinImages: string[] = [];
    private bossImages: string[] = [];
    private score: number = 0;
    private isGameOver: boolean = false;
    private isDesktop: boolean = true;
    private isBossBattle: boolean = false;
    private bossSpawnScore: number = 500;
    private enemyTimer!: Phaser.Time.TimerEvent;

    private spWeaponCooldown: number = 10000;
    private lastSpWeaponTime: number = 0;

    private difficulty: string = 'ノーマル';
    private difficultySettings = {
        spawnDelay: 1000,
        enemySpeed: 100,
        bossHp: 100,
        bossAttackDelay: 1500
    };

    constructor() {
        super('GameScene');
    }

    init(data: { difficulty: string }) {
        this.difficulty = data.difficulty || 'ノーマル';
        this.score = 0;
        this.isGameOver = false;
        this.isBossBattle = false;
        this.lastSpWeaponTime = -10000;

        switch (this.difficulty) {
            case 'イージー':
                this.difficultySettings = { spawnDelay: 1500, enemySpeed: 80, bossHp: 50, bossAttackDelay: 2000 };
                break;
            case 'ノーマル':
                this.difficultySettings = { spawnDelay: 1000, enemySpeed: 100, bossHp: 100, bossAttackDelay: 1500 };
                break;
            case 'ハード':
                this.difficultySettings = { spawnDelay: 500, enemySpeed: 150, bossHp: 200, bossAttackDelay: 1000 };
                break;
        }
    }

    preload() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('bullet', 8, 8);
        graphics.destroy();
    }

    create() {
        this.isDesktop = this.sys.game.device.os.desktop;
        this.scene.launch('UIScene', { isDesktop: this.isDesktop });

        for (let i = 0; i < 33; i++) { this.playerImages.push(`player_${i}`); }
        for (let i = 0; i < 99; i++) { this.bgImages.push(`bg_${i}`); }
        for (let i = 0; i < 55; i++) { this.enemyImages.push(`enemy_${i}`); }
        for (let i = 0; i < 36; i++) { this.bgmAudio.push(`bgm_${i}`); }
        for (let i = 0; i < 23; i++) { this.cutinImages.push(`cutin_${i}`); }
        for (let i = 0; i < 5; i++) { this.bossImages.push(`boss_${i}`); }

        const randomBgmKey = Phaser.Math.RND.pick(this.bgmAudio);
        this.sound.play(randomBgmKey, { loop: true, volume: 0.5 });

        const randomBgKey = Phaser.Math.RND.pick(this.bgImages);
        this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, randomBgKey).setOrigin(0, 0);

        const randomPlayerKey = Phaser.Math.RND.pick(this.playerImages);
        this.player = this.physics.add.sprite(100, this.scale.height / 2, randomPlayerKey);
        this.player.setCollideWorldBounds(true).setScale(0.5);

        this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 30, runChildUpdate: true });
        this.enemies = this.physics.add.group({ runChildUpdate: true });
        this.bossBullets = this.physics.add.group({ classType: Bullet, maxSize: 100, runChildUpdate: true });

        this.enemyTimer = this.time.addEvent({
            delay: this.difficultySettings.spawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletEnemyCollision, undefined, this);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerCollision, undefined, this);
        this.physics.add.overlap(this.player, this.bossBullets, this.handlePlayerCollision, undefined, this);

        if (this.isDesktop) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keys.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keys.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keys.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keys.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keys.SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.keys.SHIFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        } else {
            this.time.addEvent({ delay: 200, callback: this.fireBullet, callbackScope: this, loop: true });
            this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => { if (pointer.isDown) { this.player.setPosition(pointer.x, pointer.y); } });
        }
        this.events.on('fireSP', this.fireSpecialWeapon, this);
    }

    update(time: number, delta: number) {
        if (this.isGameOver) return;

        if (!this.isBossBattle && this.score >= this.bossSpawnScore) {
            this.startBossBattle();
        }

        this.bg.tilePositionX -= 2; // 横スクロール

        if (this.isDesktop) {
            this.player.setVelocity(0);
            if (this.keys.A.isDown) { this.player.setVelocityX(-300); }
            else if (this.keys.D.isDown) { this.player.setVelocityX(300); }
            if (this.keys.W.isDown) { this.player.setVelocityY(-300); }
            else if (this.keys.S.isDown) { this.player.setVelocityY(300); }

            if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) { this.fireBullet(); }
            if (Phaser.Input.Keyboard.JustDown(this.keys.SHIFT)) { this.fireSpecialWeapon(time); }
        }
        const remainingCooldown = Math.max(0, this.lastSpWeaponTime + this.spWeaponCooldown - time);
        this.events.emit('updateCooldown', remainingCooldown / 1000);
    }

    private fireBullet() {
        const bullet = this.bullets.get() as Bullet;
        if (bullet) { bullet.fire(this.player.x + 50, this.player.y, 500, 0); }
    }

    private fireSpecialWeapon(currentTime: number) {
        if (currentTime > this.lastSpWeaponTime + this.spWeaponCooldown) {
            this.lastSpWeaponTime = currentTime;

            // ホワイトアウト演出
            const whiteRect = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff, 1).setOrigin(0, 0);
            this.tweens.add({
                targets: whiteRect,
                alpha: 0,
                duration: 500,
                onComplete: () => { whiteRect.destroy(); }
            });

            const randomCutinKey = Phaser.Math.RND.pick(this.cutinImages);
            const cutin = this.add.image(this.scale.width / 2, this.scale.height / 2, randomCutinKey);
            // カットイン画像のアスペクト比を維持 (4:3)
            const cutinWidth = this.scale.width * 0.6; // 画面幅の60%程度
            const cutinHeight = cutinWidth * (3 / 4); // 4:3の比率で高さを計算
            cutin.setDisplaySize(cutinWidth, cutinHeight);

            this.tweens.add({ targets: cutin, alpha: 0, duration: 1000, delay: 500, onComplete: () => { cutin.destroy(); } });

            const killAction = (targetGroup: Phaser.Physics.Arcade.Group) => {
                targetGroup.getChildren().forEach(t => {
                    (t as Phaser.Physics.Arcade.Sprite).destroy();
                    this.score += 10;
                    this.events.emit('addScore', 10);
                });
            }
            killAction(this.enemies);
            if(this.isBossBattle) {
                this.boss.setData('hp', this.boss.getData('hp') - 20); // SPはボスにもダメージ
            }
        }
    }

    private startBossBattle() {
        this.isBossBattle = true;
        this.enemyTimer.remove();
        this.enemies.clear(true, true);

        this.sound.stopAll();
        const randomBgmKey = Phaser.Math.RND.pick(this.bgmAudio);
        this.sound.play(randomBgmKey, { loop: true, volume: 0.7 });

        const randomBossKey = Phaser.Math.RND.pick(this.bossImages);
        this.boss = this.physics.add.sprite(this.scale.width + 100, this.scale.height / 2, randomBossKey).setScale(0.8);
        this.boss.setData('hp', this.difficultySettings.bossHp);
        this.physics.add.overlap(this.player, this.boss, this.handlePlayerCollision, undefined, this);
        this.physics.add.overlap(this.bullets, this.boss, this.handleBulletBossCollision, undefined, this);

        // ボス登場演出 (右から中央へ)
        this.tweens.add({ targets: this.boss, x: this.scale.width - 150, duration: 2000, ease: 'Power2' });
        // ボスの上下移動
        this.tweens.add({ targets: this.boss, y: this.scale.height - 150, duration: 3000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: 2000 });

        this.time.addEvent({ delay: this.difficultySettings.bossAttackDelay, callback: this.fireBossBullet, callbackScope: this, loop: true });
    }

    private fireBossBullet() {
        if (!this.boss.active) return;
        const pattern = this.difficulty === 'イージー' ? 'single' : Phaser.Math.RND.pick(['single', 'triple']);
        
        // プレイヤーの方向へ弾を発射
        const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
        const speed = 200;

        if (pattern === 'single') {
            const bullet = this.bossBullets.get() as Bullet;
            if (bullet) {
                bullet.fire(this.boss.x, this.boss.y, Math.cos(angle) * speed, Math.sin(angle) * speed);
            }
        }
        if (pattern === 'triple') {
            for (let i = -1; i <= 1; i++) {
                const bullet = this.bossBullets.get() as Bullet;
                if (bullet) {
                    bullet.fire(this.boss.x, this.boss.y, Math.cos(angle + i * 0.3) * speed, Math.sin(angle + i * 0.3) * speed);
                }
            }
        }
    }

    private spawnEnemy() {
        if (this.isGameOver) return;
        const y = Phaser.Math.Between(50, this.scale.height - 50);
        const randomEnemyKey = Phaser.Math.RND.pick(this.enemyImages);
        const enemy = this.enemies.create(this.scale.width + 50, y, randomEnemyKey);
        enemy.setVelocityX(-this.difficultySettings.enemySpeed); // 左方向に移動
        enemy.setScale(0.5);
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    }

    private handleBulletEnemyCollision(bullet: any, enemy: any) {
        bullet.setActive(false).setVisible(false);
        enemy.destroy();
        this.score += 10;
        this.events.emit('addScore', 10);
    }

    private handleBulletBossCollision(boss: any, bullet: any) {
        (bullet as Bullet).setActive(false).setVisible(false);
        const currentHp = this.boss.getData('hp') as number;
        const newHp = currentHp - 1;
        this.boss.setData('hp', newHp);
        this.boss.setTint(0xff0000);
        this.time.delayedCall(100, () => { this.boss.clearTint(); });
        if (newHp <= 0) {
            this.boss.destroy();
            this.isGameOver = true;
            this.sound.stopAll();
            this.scene.stop('UIScene');
            this.scene.start('GameOverScene', { score: this.score + 1000 });
        }
    }

    private handlePlayerCollision(player: any, enemy: any) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.sound.stopAll();
        this.physics.pause();
        (player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000);
        this.scene.stop('UIScene');
        this.scene.start('GameOverScene', { score: this.score });
    }
}