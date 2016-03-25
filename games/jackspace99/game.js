JackDanger.JackSpace = function() {

};

//hier musst du deine Eintragungen vornhemen.
//addMyGame("jackspace99", "JackSpace", "KnuckleJoe", "Zerschieße die Gegner, sammle ihre Teile und überlebe!", JackDanger.JackSpace);
addMyGame("jackspace99", 
    "Jack in Space", 
    "KnuckleJoe", 
    "   Zerschiesse die Gegner, sammle ihre Teile und überlebe!", 
    "Fliegen", //Steuerkreuz
    "-", //Jump button belegung
    "Schiessen", //Shoot button belegung
    JackDanger.JackSpace);

JackDanger.JackSpace.prototype.init = function() {
    logInfo("init Game JACK SPACE");    
    addLoadingScreen(this, false);//nicht anfassen
}

JackDanger.JackSpace.prototype.preload = function() {
    this.load.path = 'games/' + currentGameData.id + '/assets/';//nicht anfassen
    
    this.load.image('asteroid0', '../assetsraw/asteroid0.png');
    this.load.image('asteroid1', '../assetsraw/asteroid1.png');
    this.load.image('asteroid2', '../assetsraw/asteroid2.png');
    this.load.image('background', '../assetsraw/background.png');
    this.load.image('laser', '../assetsraw/laser0.png');
    this.load.image('enemylaser', '../assetsraw/laser1.png');
    this.load.image('phasers', '../assetsraw/phasersmall.png');
    this.load.image('phaserb', '../assetsraw/phaserbig.png');
    this.load.image('TextBox', '../assetsraw/TextBox.png');
    this.load.image('TextBoxAnfang', '../assetsraw/TextBoxAnfang.png');

    
    this.load.spritesheet('bosssheet', '../assetsraw/bossshipSpritesheet.png', 150, 450, 3);
    this.load.spritesheet('enemysheet', '../assetsraw/Enemy.png', 32, 32, 4);
    this.load.spritesheet('wrack', '../assetsraw/flame.png', 32,32,2);

    this.load.audio('bossspawn', '../assetsraw/sounds/bossspawn.ogg');
    this.load.audio('enemydestroy', '../assetsraw/sounds/enemydestroy.ogg');
    this.load.audio('enemyhit', '../assetsraw/sounds/enemyhit.ogg');
    this.load.audio('enemylasersound', '../assetsraw/sounds/enemylaser.ogg');
    this.load.audio('gethit', '../assetsraw/sounds/gethit.ogg');    
    this.load.audio('lasersound', '../assetsraw/sounds/laser.ogg');
    this.load.audio('laserasteroidhit', '../assetsraw/sounds/laserasteroidhit.ogg');
    this.load.audio('maintheme', '../assetsraw/sounds/mainmusic.ogg');
    this.load.audio('bosstheme', '../assetsraw/sounds/bosstheme.ogg');

    //füge hie rein was du alles laden musst.#
    this.atlas = "jackspace99";
    this.load.atlas("jackspace99");
}

//wird nach dem laden gestartet
JackDanger.JackSpace.prototype.create = function() {
    Pad.init();//nicht anfassen
}

JackDanger.JackSpace.prototype.mycreate = function() {
    this.initPhysics();
    
    this.maintheme = game.add.audio('maintheme', 1, true)
    this.bosstheme = game.add.audio('bosstheme', 1, true);
    this.maintheme.stop();
    this.bosstheme.stop();

    this.background = this.game.add.group();
    this.addBackground();

    this.notHit = true;
    this.enemyOnScreen = false;
    this.intervalSpawner = null;
    this.laserTime = 0;
    this.chargeTime = 0;
    this.spawnTimer = null;
    this.amountCollected = 0;
    this.bossSpawned = false;
    this.tb1 = null;
    this.counter = 0;
    this.asteroidTimer = 0;

    clearTimeout(this.spawnTimer);

    this.myJack = this.createJack();

    this.asteroid = game.add.group();    
    this.enemy = game.add.group();
    this.myBoss;

    this.waist = game.add.group();
    this.waist.enableBody = true;
    this.waist.physicsBodyType = Phaser.Physics.ARCADE;
    
    //Eigene Schüsse
    this.lasers = game.add.group();
    this.lasers.enableBody = true;
    this.lasers.physicsBodyType = Phaser.Physics.ARCADE;

    this.lasers.createMultiple(25, 'laser');
    this.lasers.setAll('anchor.x', 0);
    this.lasers.setAll('anchor.y', 0.5);
    this.lasers.setAll('outOfBoundsKill', true);
    this.lasers.setAll('checkWorldBounds', true);

    //Gegnerische Schüsse
    this.enemylasers = game.add.group();
    this.enemylasers.enableBody = true;
    this.enemylasers.physicsBodyType = Phaser.Physics.ARCADE;

    this.enemylasers.createMultiple(15, 'enemylaser');
    this.enemylasers.setAll('anchor.x', 0);
    this.enemylasers.setAll('anchor.y', 0.5);
    this.enemylasers.setAll('outOfBoundsKill', true);
    this.enemylasers.setAll('checkWorldBounds', true);

    this.cKey = this.input.keyboard.addKey(Phaser.Keyboard.C);
    this.cKey.onDown.add(this.unpause, this);
    clearInterval(this.intervalSpawner);
    //if(Pad.isDown(Pad.JUMP)) 
        //this.intervalSpawner = game.time.events.loop(1500, this.spawnAsteroids, this.asteroid);

    this.loadStartBox();
}


//wird jeden Frame aufgerufen
JackDanger.JackSpace.prototype.update = function() {
    if (this.amountCollected >= 4 && !this.bossSpawned && this.counter == 0) {        
        this.counter++;        

        this.loadTextBox();

        game.time.events.add(1200 , function() { 
            for(var i = 0; i < this.enemy.children.length; i++){
                var t = this.enemy.children[i];
                console.log(t.health);
                t.health = 0;
            }   
            this.managemusic();
            this.bossSpawned = true;
            clearTimeout(this.spawnTimer);
            this.myBoss = this.spawnBoss();}, this);
    }

    var dt = this.time.physicsElapsedMS * 0.001;

    if(this.notHit) this.jack.controls(this);

    if(!this.enemyOnScreen && !this.bossSpawned) {
        this.enemyOnScreen = true;
        this.spawnTimer = setTimeout(this.spawnEnemy, 4000, this.enemy);
    }

    if(game.time.now > this.asteroidTimer + 1500) {
        this.asteroidTimer = game.time.now;
        this.spawnAsteroids(this.asteroid);
    }

    this.updateAsteroids(dt);
    this.updateEnemy(dt);
    this.updateBackground(dt);
    if(this.bossSpawned) this.boss.updateBoss(this);

    //Collisions
    this.physics.arcade.overlap(this.asteroid, this.jack.sprite, this.lose, null, this); 
    this.physics.arcade.collide(this.asteroid, this.jack.sprite, this.lose, null, this);
    this.physics.arcade.overlap(this.enemylasers, this.jack.sprite, this.lose, null, this);          
    this.physics.arcade.overlap(this.jack.sprite, this.enemy, this.lose);
    this.physics.arcade.overlap(this.lasers, this.enemy, this.collisionHandler, null, this);
    this.physics.arcade.overlap(this.lasers, this.asteroid, this.collisionAsteroid, null, this);
    this.physics.arcade.collide(this.asteroid, this.asteroid);
    this.physics.arcade.overlap(this.jack.sprite, this.waist, this.collect, null, this);
    if(this.bossSpawned) this.physics.arcade.overlap(this.lasers, this.boss.boss, this.boss.damageBoss, null, this);
 
    if(false) {
        game.debug.body(this.jack.sprite);
        for ( var i = 0; i < this.enemy.children.length; i++){
            var t = this.enemy.children[i];
            game.debug.body(t);
        }
        for ( var i = 0; i < this.asteroid.children.length; i++){
            var t = this.asteroid.children[i];
            game.debug.body(t);
        }
        if(this.bossSpawned) game.debug.body(this.boss.boss);
    }
}

JackDanger.JackSpace.prototype.render = function () {}

JackDanger.JackSpace.prototype.initPhysics = function() {
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.arcade.gravity.x = 0; 
}

JackDanger.JackSpace.prototype.createJack = function() {
    this.jack = new JackDanger.JackSpace.Jack(this);
    return this.jack;
}

JackDanger.JackSpace.prototype.lose = function(object, jack) {
    this.timeText = game.add.bitmapText(game.width / 2, 20, "white", "", 30);
    this.timeText.anchor.set(0.5);
    this.timeText.setText("Autsch!");
    clearInterval(this.intervalSpawner);

    this.maintheme.stop();
    this.bosstheme.stop();

    if(this.notHit){
        game.add.audio('gethit').play();
        setTimeout(function(){ onLose(); }, 2000);
        this.notHit = false;
    }
}

JackDanger.JackSpace.Jack = function(game) {
    this.game = game;
    this.sprite = game.add.sprite(100 , game.game.height / 2, "jackspace99", "JD1.png");
    this.sprite.anchor.set(0, 0.5);
    this.sprite.scale.set(1.25);

    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.allowGravity = false;


    this.setAnimations();
    this.doAnimation("fly");
}

JackDanger.JackSpace.Jack.prototype = { //Notizen noch schreiben! z.B. , nach function(){}
    setAnimations: function() {
         this.sprite.animations.add("fly", ["JD1.png", "JD2.png"], 10, true, false);
         this.sprite.animations.add("flyUp", ["JD3.png"], 3, true, false);
         this.sprite.animations.add("flyDown", ["JD4.png"], 3, true, false);
    },

    doAnimation: function(name) {
        this.sprite.animations.play(name);
    },

    controls: function(game) {
        if(Pad.isDown(Pad.SHOOT)) this.fireLaser(game); 

        if(Pad.isDown(Pad.UP) && this.sprite.y >= 10) {
            this.sprite.y -= 3;
            this.doAnimation("flyUp");

            //BackgroundScroll
            for ( var i = 0; i < game.background.children.length; i++){
                var t = game.background.children[i];
                t.y -= 1;
            }
        } else{ 
            if(Pad.isDown(Pad.DOWN)&& this.sprite.y <= this.game.game.height - 10) {
                this.sprite.y += 3;
                this.doAnimation("flyDown");

                //BackgroundScroll
                for ( var i = 0; i < game.background.children.length; i++){
                    var t = game.background.children[i];
                    t.y +=1;
                } 
            } else{ this.doAnimation("fly"); }
        }
        if(Pad.isDown(Pad.LEFT)&& this.sprite.x >= 4) {
            this.sprite.x -= 2.5;

            //BackgroundScroll
            for ( var i = 0; i < game.background.children.length; i++){
                var t = game.background.children[i];
                t.x -=0.5;
            }
        }

        if(Pad.isDown(Pad.RIGHT)&& this.sprite.x <= this.game.game.width - 64) {
            this.sprite.x += 2.5;

            //BackGroundScroll
            for ( var i = 0; i < game.background.children.length; i++){
                var t = game.background.children[i];
                t.x +=0.5;
            }
        }
    },

    fireLaser: function(game) {
        if(game.time.now > game.laserTime){
            laser = game.lasers.getFirstExists(false);

            if(laser){
                laser.reset(this.sprite.x + laser.body.width*2, this.sprite.y);
                laser.body.velocity.x = 400;
                game.laserTime = game.time.now + 600;

                this.game.add.audio("lasersound").play();
            }
        }
    }
}

JackDanger.JackSpace.prototype.spawnAsteroids = function(myAsteroid) {    
    var object = myAsteroid.create(this.game.width + 32 , Math.random() * 450, "asteroid" + (Math.floor(Math.random() * 3))); 

    object.scale.set(2);
    
    game.physics.enable(object, Phaser.Physics.ARCADE);
    object.body.immovable = true;
    object.anchor.set(0.5,0.5);
    
    object.body.velocity.x = -50 - Math.floor(Math.random() * 40);
    object.body.velocity.y = Math.random()*8 - 4;
    object.body.angularVelocity = Math.random()*360-180;
}

JackDanger.JackSpace.prototype.updateAsteroids = function() {
    for ( var i = 0; i < this.asteroid.children.length; i++){
        var t = this.asteroid.children[i];
        if(t.x < -32*2){
            t.destroy();
        }
    }
}

JackDanger.JackSpace.prototype.spawnEnemy = function(myEnemy) {    
    var object = myEnemy.create(this.game.width + 50, Math.random() * 350, "enemysheet");
    var anim = object.animations.add('anim');    
    object.animations.play('anim', 15, true);
    
    object.anchor.set(1, 0.5);
    object.scale.set(2);
    
    game.physics.enable(object, Phaser.Physics.ARCADE);
    object.body.velocity.x = -30;
    object.body.velocity.y = 80;
    object.body.allowGravity = false;
    object.body.immovable = true;

    object.health = 3;
}

JackDanger.JackSpace.prototype.updateEnemy = function() {
    for ( var i = 0; i < this.enemy.children.length; i++){
        var t = this.enemy.children[i];
        setDirVel(t);
        this.enemyFire(t);

        if(t.health <= 0){
            var w1 = this.waist.create(t.x, t.y, 'wrack');
            w1.anchor.set(1, 0.5);
            w1.scale.set(2);

            var anim = w1.animations.add('anim');    
            w1.animations.play('anim', 10, true);

            w1.body.velocity.x = -50;
            this.enemyOnScreen = false;
            t.destroy();
        }
    }
}

JackDanger.JackSpace.prototype.damageEnemy = function(object) {
    object.health--;

    if(object.health <= 0){
        this.game.add.audio("enemydestroy").play();
    } else {
        this.game.add.audio("enemyhit").play();
    }
    
}

function setDirVel(myEnem) { //ZU CHAOTISCH
    if(myEnem.x < this.game.width - 40) {
        myEnem.body.velocity.x = 0;
    } 

    if(myEnem.y > 0.8*this.game.height) { 
        myEnem.body.velocity.y = -80;
    } 

    if(myEnem.y < 0.2*this.game.height) {
        myEnem.body.velocity.y = 80;
    }    
}

JackDanger.JackSpace.prototype.addBackground = function() {
    background1 = this.game.add.tileSprite(0, 0, 800, 450, "background",0,this.background);
    background2 = this.game.add.tileSprite(800, 0, 800, 450, "background",0,this.background);

    background1O = this.game.add.tileSprite(0, -450, 800, 450, "background",0,this.background);
    background2O = this.game.add.tileSprite(800, -450, 800, 450, "background",0,this.background);

    background1U = this.game.add.tileSprite(0, 450, 800, 450, "background",0,this.background);
    background2U = this.game.add.tileSprite(800, 450, 800, 450, "background",0,this.background);
}

JackDanger.JackSpace.prototype.updateBackground = function() {
    for ( var i = 0; i < this.background.children.length; i++){
        var t = this.background.children[i];
        t.x -= 1.3;

        if(t.x < -800) t.x +=1600;
    }
}

JackDanger.JackSpace.prototype.collisionHandler = function(laser, enemy){
    laser.kill();
    console.log("H"+enemy.health);
    this.damageEnemy(enemy);
}

JackDanger.JackSpace.prototype.collisionAsteroid = function(laser, enemy){
    //laser.destroy(); Warum funktioniert hier destroy nicht? In CollisionHandler funktioniert es doch auch?
    laser.kill();
    this.game.add.audio("laserasteroidhit").play();
}

JackDanger.JackSpace.prototype.enemyFire = function(thisenemy) {
    if(game.time.now > this.chargeTime){
        enemylaser = this.enemylasers.getFirstExists(false);

        if(enemylaser){
            enemylaser.reset(thisenemy.x - thisenemy.width, thisenemy.y);
            enemylaser.body.velocity.x = -200;
            enemylaser.body.acceleration.x = -450;
            
            game.time.events.repeat(150, 2, this.repeatShot, this, this.enemylasers, thisenemy);
                //this.game.add.tween(enemylaser.scale).to( {x: 2, y: 2}, 1200, Phaser.Easing.Linear.None, true, 0, 4, true);
            this.chargeTime = game.time.now + 3000;
        }
    }
}

JackDanger.JackSpace.prototype.repeatShot = function(myLasers, thisenemy) {
    enemylaser = myLasers.getFirstExists(false);
                enemylaser.reset(thisenemy.x - thisenemy.width, thisenemy.y);
                enemylaser.body.velocity.x = -200;
                enemylaser.body.acceleration.x = -450;

                this.game.add.audio("enemylasersound", 0.5).play();
}

JackDanger.JackSpace.prototype.collect = function(player, collectedWaist) {
    collectedWaist.destroy();
    this.amountCollected++;
    console.log(this.amountCollected);
}

JackDanger.JackSpace.prototype.spawnBoss = function() {
    this.boss = new JackDanger.JackSpace.Boss();
    game.physics.enable(this.boss, Phaser.Physics.ARCADE);
    return this.boss;
}

JackDanger.JackSpace.Boss = function() {
    this.boss = /*myBoss.create*/game.add.sprite(800 + 25  , 450 / 2, "bosssheet");
    game.add.tween(this.boss).to( { x: 800 - this.boss.width}, 2000, Phaser.Easing.Quadratic.InOut, true, 0, 0);

    this.boss.anchor.set(0, 0.5);
    game.physics.enable(this.boss, Phaser.Physics.ARCADE);
    this.boss.body.allowGravity = false;
    this.boss.body.immovable = true;

    var cannon = this.boss.animations.add('cannon');    
    this.boss.animations.play('cannon', 15, true);

    game.add.audio("bossspawn").play();
    this.boss.soundhit = "enemyhit";

    this.boss.health = 15;
    
    this.spawnTime = game.time.now;
}

JackDanger.JackSpace.Boss.prototype = {
    bossAnimation: function(mySprite) {
    bossanim = bossSprite.animations.add("spinningCannon", ["boss0", "boss1","boss0", "boss2"], 100, true, false);
    bossanim.play("spinningCannon");
    },

    bossFirePhaser: function(myGame){
        if(game.time.now > myGame.chargeTime){
            bossPhaser0 = new JackDanger.JackSpace.BossPhaser(660, 0.27*450, true, myGame);
            setTimeout(function() {bossPhaser1 = new JackDanger.JackSpace.BossPhaser(650, 0.4*450, true, myGame); game.add.audio("enemylasersound", 0.5).play();}, 500);
            setTimeout(function() {bossPhaser2 = new JackDanger.JackSpace.BossPhaser(650, 0.6*450, false, myGame)}, 500);
            bossPhaser3 = new JackDanger.JackSpace.BossPhaser(660, 0.73*450, false, myGame);
            game.add.audio("enemylasersound", 0.5).play();

                //enemylaser.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
                //this.game.add.tween(enemylaser.scale).to( {x: 2, y: 2}, 1200, Phaser.Easing.Linear.None, true, 0, 4, true);
      
            myGame.chargeTime = game.time.now + 4000;
        }
    },

    bossFireSlowShot: function(myGame){
        if(game.time.now > (myGame.chargeTime)) {
            slowShot = new JackDanger.JackSpace.SlowShot(660, 0.5 * 450, true, myGame);
        }
    },

    updateBoss: function(myGame) {
        if(game.time.now > this.spawnTime + 3000) this.bossFireSlowShot(myGame);
        if(game.time.now > this.spawnTime + 3000) this.bossFirePhaser(myGame);
    },

    damageBoss: function(boss, laser) {
            laser.kill();
            //boss.destroy();
            console.log(this.boss.boss.health);
            this.boss.boss.health--;

            if(this.boss.boss.health <= 0) {
                clearInterval(this.intervalSpawner);
                onVictory();
            }
    }
}


JackDanger.JackSpace.BossPhaser = function(x, y, top, myGame){
    this.Phaser = myGame.enemylasers.create(x , y, "phasers"); 

    //this.Phaser = game.add.sprite(x , y, "phasers");
    this.Phaser.anchor.set(0, 0.5);

    game.physics.enable(this.Phaser, Phaser.Physics.ARCADE);
    this.Phaser.body.allowGravity = false;
    this.Phaser.body.outOfBoundsKill = true;

    this.Phaser.body.velocity.x = -100;
    this.Phaser.body.acceleration.x = -200;

    game.add.tween(this.Phaser).to( {y: y + (top ? -this.Phaser.height*1.5 : +this.Phaser.height*1.5)}, 500, "Sine.easeInOut", true, 0, -1, true);
}

JackDanger.JackSpace.SlowShot = function(x, y, top, myGame){
    this.Phaser = myGame.enemylasers.create(x , y, "jackspace99", "JDExpl.png"); 

    //this.Phaser = game.add.sprite(x , y, "phasers");
    this.Phaser.anchor.set(0.5, 0.5);

    game.physics.enable(this.Phaser, Phaser.Physics.ARCADE);
    this.Phaser.body.allowGravity = false;
    this.Phaser.body.outOfBoundsKill = true;

    this.calculateDirection(this.Phaser, myGame.myJack);
}

JackDanger.JackSpace.SlowShot.prototype = {
    calculateDirection: function(object, jack) {
        var dx = jack.sprite.x - object.body.x;
        var dy = jack.sprite.y - object.body.y;

        var n = Math.sqrt(dx*dx + dy*dy);

        object.body.velocity.x = (dx / n) * 100;
        object.body.velocity.y = (dy / n) * 100;
        object.body.angularVelocity = 360;
    }
}

JackDanger.JackSpace.prototype.loadTextBox = function() {
    this.tb1 = game.add.sprite(-700 , 300, "TextBox");

    this.mytween = this.game.add.tween(this.tb1).to( {x: 50}, 700, Phaser.Easing.Back.Out, true, 0, 0);
    this.mytween.onComplete.add(function(){game.paused = true;}, this);
}

JackDanger.JackSpace.prototype.unpause = function(event){
    if(game.paused){
        game.paused = false;
        this.mytween = this.game.add.tween(this.tb2).to( {x: -700}, 700, Phaser.Easing.Back.Out, true, 0, 0);
        this.mytween = this.game.add.tween(this.tb1).to( {x: -700}, 700, Phaser.Easing.Back.Out, true, 0, 0);
        this.mytween.onComplete.add(function(){this.tb1.destroy();}, this);
    }
}

JackDanger.JackSpace.prototype.managemusic = function(){
    this.maintheme.stop();
    this.bosstheme.play();
}

JackDanger.JackSpace.prototype.loadStartBox = function() {
    this.tb2 = game.add.sprite(-700 , 300, "TextBoxAnfang");

    this.mytween = this.game.add.tween(this.tb2).to( {x: 50}, 700, Phaser.Easing.Back.Out, true, 0, 0);
    this.mytween.onComplete.add(function(){game.paused = true;}, this);

    game.time.events.add(1200 , function() {this.maintheme.play();}, this);
}
