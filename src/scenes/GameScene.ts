import Phaser from 'phaser';

// Bulletクラスは変更なし
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
    private bossSpawnScore: number = 500; // ボス出現スコア
    private enemyTimer!: Phaser.Time.TimerEvent;

    private isPaused: boolean = false; // ポーズ状態

    // SPウェポン関連
    private spWeaponCooldown: number = 10000; // 10秒
    private lastSpWeaponTime: number = 0;

    // 難易度設定
    private difficulty: string = 'ノーマル';
    private difficultySettings = {
        spawnDelay: 1000,
        enemySpeed: 100,
        bossHp: 30,
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
        this.isPaused = false;
        this.lastSpWeaponTime = -10000; // 最初からSPを使えるように

        switch (this.difficulty) {
            case 'イージー':
                this.difficultySettings = { spawnDelay: 1500, enemySpeed: 80, bossHp: 15, bossAttackDelay: 2000 };
                break;
            case 'ノーマル':
                this.difficultySettings = { spawnDelay: 1000, enemySpeed: 100, bossHp: 30, bossAttackDelay: 1500 };
                break;
            case 'ハード':
                this.difficultySettings = { spawnDelay: 500, enemySpeed: 150, bossHp: 50, bossAttackDelay: 1000 };
                break;
        }
    }

    preload() {
        // 弾のテクスチャ作成
        const graphics = this.add.graphics();
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('bullet', 8, 8);
        graphics.destroy();
    }

    create() {
        this.isDesktop = this.sys.game.device.os.desktop;
        // UIシーンを起動し、ボスHPの初期値を渡す
        this.scene.launch('UIScene', { 
            isDesktop: this.isDesktop, 
            bossMaxHp: this.difficultySettings.bossHp 
        });

        // 動的にロードされたアセットキーを取得
        const allTextureKeys = this.textures.getKeys();
        this.playerImages = allTextureKeys.filter(key => key.startsWith('player_'));
        this.bgImages = allTextureKeys.filter(key => key.startsWith('bg_'));
        this.enemyImages = allTextureKeys.filter(key => key.startsWith('enemy_'));
        this.cutinImages = allTextureKeys.filter(key => key.startsWith('cutin_'));
        this.bossImages = allTextureKeys.filter(key => key.startsWith('boss_'));
        this.bgmAudio = this.sound.getAllKeys().filter(key => key.startsWith('bgm_'));

        // BGM再生
        const randomBgmKey = Phaser.Math.RND.pick(this.bgmAudio);
        this.sound.play(randomBgmKey, { loop: true, volume: 0.5 });

        // 背景をタイル状に配置し、スクロール可能にする
        const randomBgKey = Phaser.Math.RND.pick(this.bgImages);
        this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, randomBgKey).setOrigin(0, 0);

        // プレイヤー作成
        const randomPlayerKey = Phaser.Math.RND.pick(this.playerImages);
        this.player = this.physics.add.sprite(100, this.scale.height / 2, randomPlayerKey);
        this.player.setCollideWorldBounds(true).setScale(0.5);

        // グループの初期化
        this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 30, runChildUpdate: true });
        this.enemies = this.physics.add.group({ runChildUpdate: true });
        this.bossBullets = this.physics.add.group({ classType: Bullet, maxSize: 100, runChildUpdate: true });

        // 敵の出現タイマー
        this.enemyTimer = this.time.addEvent({
            delay: this.difficultySettings.spawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // 衝突判定
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletEnemyCollision, undefined, this);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerCollision, undefined, this);
        this.physics.add.overlap(this.player, this.bossBullets, this.handlePlayerCollision, undefined, this);

        // 操作キーの設定
        if (this.isDesktop) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keys.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keys.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keys.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keys.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keys.SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.keys.X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
            this.keys.ESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC); // ESCキーを追加
        } else {
            // スマホ・タブレット操作
            this.time.addEvent({ delay: 200, callback: this.fireBullet, callbackScope: this, loop: true });
            this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => { if (pointer.isDown) { this.player.setPosition(pointer.x, pointer.y); } });
        }
        // UIシーンからのSP発動イベント
        this.events.on('fireSP', this.fireSpecialWeapon, this);
    }

    update(time: number, delta: number) {
        if (this.isGameOver) return;

        // ポーズ処理
        if (this.isDesktop && Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            if (this.isPaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        }
        
        if (this.isPaused) return; // ポーズ中は以降の処理をスキップ

        // ボス戦への移行
        if (!this.isBossBattle && this.score >= this.bossSpawnScore) {
            this.startBossBattle();
        }

        // 背景を右から左へスクロール
        this.bg.tilePositionX += 2;

        // プレイヤー操作
        if (this.isDesktop) {
            this.player.setVelocity(0);
            if (this.keys.A.isDown || this.cursors.left.isDown) { this.player.setVelocityX(-300); }
            else if (this.keys.D.isDown || this.cursors.right.isDown) { this.player.setVelocityX(300); }
            if (this.keys.W.isDown || this.cursors.up.isDown) { this.player.setVelocityY(-300); }
            else if (this.keys.S.isDown || this.cursors.down.isDown) { this.player.setVelocityY(300); }

            if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) { this.fireBullet(); }
            if (Phaser.Input.Keyboard.JustDown(this.keys.X)) { this.fireSpecialWeapon(time); } // SPキー
        }
        
        // SPクールダウンをUIに通知
        const remainingCooldown = Math.max(0, this.lastSpWeaponTime + this.spWeaponCooldown - time);
        this.events.emit('updateCooldown', remainingCooldown / 1000);
    }

    private pauseGame() {
        this.isPaused = true;
        this.physics.pause();
        this.sound.pauseAll();
        this.enemyTimer.paused = true;
        this.scene.pause('UIScene');

        // ポーズ画面を作成
        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5).setOrigin(0, 0);
        const resumeButton = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'ゲーム続行', { fontSize: '32px', color: '#fff' }).setOrigin(0.5).setInteractive();
        const quitButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 50, 'ゲーム終了', { fontSize: '32px', color: '#fff' }).setOrigin(0.5).setInteractive();

        const pauseContainer = this.add.container(0, 0, [overlay, resumeButton, quitButton]);
        pauseContainer.setName('pauseMenu');

        resumeButton.on('pointerdown', () => this.resumeGame());
        quitButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.stop('UIScene');
            this.scene.start('TitleScene');
        });
    }

    private resumeGame() {
        this.isPaused = false;
        const pauseMenu = this.children.getByName('pauseMenu');
        if (pauseMenu) {
            pauseMenu.destroy();
        }
        this.physics.resume();
        this.sound.resumeAll();
        this.enemyTimer.paused = false;
        this.scene.resume('UIScene');
    }

    private fireBullet() {
        const bullet = this.bullets.get() as Bullet;
        if (bullet) { bullet.fire(this.player.x + 50, this.player.y, 500, 0); }
    }

    private fireSpecialWeapon(currentTime: number) {
        // クールダウンチェック
        if (currentTime > this.lastSpWeaponTime + this.spWeaponCooldown) {
            this.lastSpWeaponTime = currentTime;

            // 画面上の雑魚敵を一掃
            this.enemies.getChildren().forEach(enemy => {
                (enemy as Phaser.Physics.Arcade.Sprite).destroy();
                this.score += 10;
                this.events.emit('addScore', 10);
            });

            // ボス戦中ならボスにもダメージ
            if (this.isBossBattle && this.boss.active) {
                const damage = 5; // SPのボスへのダメージ
                const currentHp = this.boss.getData('hp') as number;
                const newHp = Math.max(0, currentHp - damage);
                this.boss.setData('hp', newHp);
                this.events.emit('updateBossHp', newHp); // UIに通知
                this.boss.setTint(0xffaa00); // ダメージエフェクト
                this.time.delayedCall(100, () => { this.boss.clearTint(); });

                if (newHp <= 0) {
                    this.defeatBoss();
                }
            }
            
            // 派手なエフェクト
            const whiteRect = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff, 0.8).setOrigin(0, 0);
            this.tweens.add({
                targets: whiteRect,
                alpha: 0,
                duration: 500,
                onComplete: () => { whiteRect.destroy(); }
            });

            const randomCutinKey = Phaser.Math.RND.pick(this.cutinImages);
            const cutin = this.add.image(this.scale.width / 2, this.scale.height / 2, randomCutinKey);
            const cutinWidth = this.scale.width * 0.6;
            const cutinHeight = cutinWidth * (3 / 4);
            cutin.setDisplaySize(cutinWidth, cutinHeight);
            this.tweens.add({ targets: cutin, alpha: 0, duration: 1000, delay: 500, onComplete: () => { cutin.destroy(); } });
        }
    }

    private startBossBattle() {
        this.isBossBattle = true;
        this.enemyTimer.remove(); // 雑魚敵の出現を停止
        this.enemies.clear(true, true); // 画面上の雑魚敵を消去

        this.sound.stopAll();
        const randomBgmKey = Phaser.Math.RND.pick(this.bgmAudio);
        this.sound.play(randomBgmKey, { loop: true, volume: 0.25 });

        const randomBossKey = Phaser.Math.RND.pick(this.bossImages);
        this.boss = this.physics.add.sprite(this.scale.width + 100, this.scale.height / 2, randomBossKey).setScale(0.8);
        this.boss.setData('hp', this.difficultySettings.bossHp);
        this.physics.add.overlap(this.player, this.boss, this.handlePlayerCollision, undefined, this);
        this.physics.add.overlap(this.bullets, this.boss, this.handleBulletBossCollision, undefined, this);

        // UIにボス戦開始を通知
        this.events.emit('bossBattleStart');

        // ボス登場演出
        this.tweens.add({ targets: this.boss, x: this.scale.width - 150, duration: 2000, ease: 'Power2' });
        this.tweens.add({ targets: this.boss, y: this.scale.height - 150, duration: 3000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: 2000 });

        // ボスの攻撃タイマー
        this.time.addEvent({ delay: this.difficultySettings.bossAttackDelay, callback: this.fireBossBullet, callbackScope: this, loop: true });
    }

    private fireBossBullet() {
        if (!this.boss.active) return;
        const pattern = this.difficulty === 'イージー' ? 'single' : Phaser.Math.RND.pick(['single', 'triple']);
        
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
        enemy.setVelocityX(-this.difficultySettings.enemySpeed);
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
        this.events.emit('updateBossHp', newHp); // UIに通知

        this.boss.setTint(0xff0000);
        this.time.delayedCall(100, () => { this.boss.clearTint(); });

        if (newHp <= 0) {
            this.defeatBoss();
        }
    }
    
    private defeatBoss() {
        this.boss.destroy();
        this.sound.stopAll();
        this.scene.stop('UIScene');
        // ゲームクリアシーンへ遷移
        this.scene.start('GameClearScene', { score: this.score + 1000 });
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
