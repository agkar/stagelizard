window.addEventListener("load", function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 700;
    
    class InputHandler {
        constructor(game) {
            this.game = game;
            this.mode = 'TOUCH RIGHT'
            this.mode = 'TOUCH STOP'
            this.mode = 'TILT TOUCH'

            window.addEventListener('keydown', e =>  {
                if(
                    (e.key === 'ArrowUp' ||
                    e.key === 'ArrowDown') && this.game.keys.indexOf(e.key) === -1 && !e.repeat) {
                    this.game.keys.push(e.key);
                }
                else if(e.key === ' ' && !e.repeat)
                {
                    this.game.player.shoot();
                }
            })
            window.addEventListener('keyup', e =>  {
                if(this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            })
            canvas.addEventListener('touchstart', e => {
                //e.preventDefault();
                console.log("touch start");
                this.moveDown();
            }, {passive: false})
            canvas.addEventListener("touchend", e => {
                //e.preventDefault();
                this.stopUp();
                this.stopDown();
                console.log("touch end");
            }, {passive: false})
            canvas.addEventListener("touchcancel", e => {
                e.preventDefault();
                console.log("touch cancel");
            }, {passive: false})
            canvas.addEventListener("touchmove", e => {
                e.preventDefault();
                const rect = canvas.getBoundingClientRect();
                const y = this.game.height * (e.targetTouches[0].clientY - rect.top) / rect.height;
                const norm_x = (e.targetTouches[0].clientX - rect.left) / rect.width;

                console.log("touch move", y, this.game.player.y);
                if(y < this.game.player.y)
                {
                    this.moveUp();
                    this.stopDown();
                }
                else
                {
                    this.moveDown();
                    this.stopUp();
                }
                if(norm_x > 0.5)
                {
                    this.game.player.shoot();
                }
            })
            this.initialBeta = null;
            window.addEventListener("deviceorientation2", e => {
                const absolute = e.absolute;
                const alpha = e.alpha;
                const beta = e.beta;
                const gamma = e.gamma;
                if(this.initialBeta == null)
                {
                    this.initialBeta = beta;
                }
                // use beta
                //console.log(`B ${e.beta}`);
                //console.log(` ${this.initialBeta - e.beta}`);
                if(beta > this.initialBeta + 5)
                {                    
                    this.moveDown();
                    this.stopUp();
                }
                else if(beta < this.initialBeta - 5)
                {
                    this.moveUp();
                    this.stopDown();
                }
                else
                {
                    this.stopUp();
                    this.stopDown();
                }
            }, true);
            window.addEventListener("devicemotion", (event) => {
                //console.log(event.acceleration);
              });
        }
        moveUp()
        {
            if(this.game.keys.indexOf("ArrowUp") === -1) 
            {
                this.game.keys.push("ArrowUp");
            }
        }
        moveDown()
        {
            if(this.game.keys.indexOf("ArrowDown") === -1) 
            {
                this.game.keys.push("ArrowDown");
            }
        }
        stopUp()
        {
            if(this.game.keys.indexOf("ArrowUp") > -1) {
                this.game.keys.splice(this.game.keys.indexOf("ArrowUp"), 1);
            }
        }
        stopDown()
        {
            if(this.game.keys.indexOf("ArrowDown") > -1) {
                this.game.keys.splice(this.game.keys.indexOf("ArrowDown"), 1);
            }
        }
        update()
        {

        }

    }
    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 10;
            this.speed = 30;
            this.markedForDeletion = false;
        }

        update() {
            this.x += this.speed;
            if(this.x > this.game.width * 1.0)
            {
                this.markedForDeletion = true;
            }
        }
        draw(context) {
            context.fillStyle = 'yellow';
            //context.fillRect(this.x, this.y, this.width, this.height);
            context.beginPath();
            context.arc(this.x, this.y, 10, 0, 2 * Math.PI);
            context.fill();
        }

    }
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 140;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 4;
            this.projectiles = [];
            this.shootInterval = 100;
            this.shootTimer = 0;
            this.image = document.getElementById("user1");
        }
        update(deltaTime) {
            if(this.game.keys.includes('ArrowUp'))
                this.speedY = -this.maxSpeed;
            else if(this.game.keys.includes('ArrowDown'))
                this.speedY = this.maxSpeed;
            else
                this.speedY = 0;
            
            this.y += this.speedY;
            this.y = Math.max(this.y, 65);
            this.y = Math.min(this.y, this.game.height - this.height * 0.5);
            
            this.projectiles.forEach(projective => {
                projective.update();
            })

            this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);

            this.shootTimer += deltaTime;            
        }
        draw(context) {
            context.strokeStyle = 'red';
            //context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projective => {
                projective.draw(context);
            })
        }
        shoot() {
            if(this.game.ammo > 0 && this.shootTimer > this.shootInterval)
            {
                this.projectiles.push(new Projectile(this.game, this.x + this.width, this.y + 0.5 * this.height));
                this.game.ammo--;
                this.shootTimer = 0;
            }
        }

    }
       
    class Car {
        constructor(game, id, speed)
        {
            this.game = game;
            this.x = Math.random() > 0.5 ? this.game.width - 540 : this.game.width - 380;
            this.y = this.game.height;
            this.width = 80;
            this.height = 160;

            this.speedY = speed;
            this.markedForDeletion = false;
            this.image = document.getElementById("cars");
            this.spriteWidth = 76;
            this.spriteHeight = 128;            
            this.carID = id;
        }
        update() {
            this.y += this.speedY;
            if(this.y + this.height < 0)
            {
                this.markedForDeletion = true;
            }
        }
        draw(context) {
            context.strokeStyle = 'green';
            //context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, 
                this.carID * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight,
                this.x, this.y, this.width, this.height);
        }
    }

    class Microphone {
        constructor(game)
        {
            this.game = game;
            this.x = this.game.width - 100;
            this.y = Math.random() * (this.game.height - 80 - 65) + 65;
            this.width = 80;
            this.height = 80;

            this.markedForDeletion = false;
            this.image = document.getElementById("microphone");  
        }
        update() {
            
        }
        draw(context) {
            context.strokeStyle = 'yellow';
            //context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, 
                this.x, this.y, this.width, this.height);
        }
    }

    class Background {
        constructor(game, sprite = 0)
        {
            this.game = game;
            this.image = document.getElementById("road");
            this.x = this.game.width - 590 - 120;
            this.y = 0;
            this.width = 590;
            this.speedY = 5;

            const spriteOffsets = [20, 160, 300, 440];
            this.spriteOffsetX = spriteOffsets[sprite];
            /*this.spriteOffsetX = 20;
            this.spriteOffsetX = 160;
            this.spriteOffsetX = 300;
            this.spriteOffsetX = 440;*/
            this.spriteOffsetY = 113;
            this.spriteWidth = 130;
            this.spriteHeight = 450;
        }
        update()
        {
            this.y += this.speedY;
            if(this.y >= this.game.height)
            {
                this.y = 0;
            }
        }
        draw(context)
        {
            context.drawImage(this.image, 
                this.spriteOffsetX, this.spriteOffsetY, this.spriteWidth, this.spriteHeight,
                this.x, this.y, this.width, this.game.height);
            context.drawImage(this.image, 
                this.spriteOffsetX, this.spriteOffsetY, this.spriteWidth, this.spriteHeight,
                this.x, this.y - this.game.height, this.width, this.game.height);
        }

    }
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 32;
            this.fontFamily = "Bangers";
            this.color = 'white'
        }
        draw(context) {
            context.save();
            context.font = this.fontSize + "px " + this.fontFamily;
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.letterSpacing = '2px'
            // Score
            context.fillText('Score: '+this.game.score, 20, 40);
            
            // Ammo
            for(let i = 0; i < this.game.ammo; i++)
            {
                context.fillRect(20 + 5 * i,50,3,20);
            }
            // Timer
            const formatedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formatedTime, 0.5 * this.game.width - 400, 40);
            // game over messages
            if(this.game.gameOver)
            {
                console.log("Game over")
                context.textAlign = 'center';
                let message1;
                let message2;
                if(this.game.score > this.game.winningScore)
                {
                    message1 = "You Win!";
                    message2 = "Well done!";
                }
                else
                {
                    message1 = "You Lose!";
                    message2 = "Try again!";

                }
                context.font = "64px " + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40)
                context.font = "32px " + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40)
            }
            context.restore();
        }

    }
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            const spriteID = Math.floor(Math.random() * 4);
            this.background = new Background(this, spriteID);
            this.microphone = new Microphone(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.cars = [];
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 20;
            this.gameTime = 0;
            this.gameTimeLimit = 60000;
        }
        update(deltaTime) {
            if(!this.gameOver)
            {
                this.gameTime += deltaTime;
            }
            if(this.gameTime > this.gameTimeLimit)
            {
                this.gameOver = true;
            }

            this.background.update();
            this.player.update(deltaTime);
            this.microphone.update();
            if(this.ammoTimer > this.ammoInterval)
            {
                if(this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            }
            else
            {
                this.ammoTimer += deltaTime;
            }
            this.player.projectiles.forEach(p => {
                if(this.checkCollision(p, this.microphone))
                {
                    p.markedForDeletion = true;
                    if(!this.gameOver)
                    {
                        this.score += 2;
                        this.microphone = new Microphone(this);
                    }
                    if(this.score > this.winningScore)
                    {
                        this.gameOver = true;
                    }
                }
            })
            
            this.cars.forEach(car => {
                car.update();
                this.player.projectiles.forEach(p => {
                    if(this.checkCollision(p, car))
                    {
                        p.markedForDeletion = true;
                        if(!this.gameOver)
                        {
                            this.score += 1;
                        }
                        if(this.score > this.winningScore)
                        {
                            this.gameOver = true;
                        }
                    }
                })
            })
            this.cars = this.cars.filter(e => !e.markedForDeletion);

            if(this.cars.length === 0)
            {
                const carID = Math.floor(Math.random() * 4);
                this.cars.push(new Car(this, carID, Math.random() * -4 - 1));
            }

            this.player.projectiles = this.player.projectiles.filter(e => !e.markedForDeletion);
        }
        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.microphone.draw(context);
            this.cars.forEach(car => {
                car.draw(context);
            })
            this.ui.draw(context);
        }
        addCar() {

        }
        checkCollision(rect1, rect2)
        {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            )
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    // animation loop
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate(0);

})