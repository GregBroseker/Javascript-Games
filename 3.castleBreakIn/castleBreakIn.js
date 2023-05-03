// topics: class (static) variable, for, multi-level inheritance, polymorphism
import { game, Sprite } from "../sgc/sgc.js";

game.setBackground("grass.png");

class Block extends Sprite {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.name = "A block";
        this.setImage("block1.png");
        this.accelerateOnBounce = false;
        Block.blocksToDestroy = Block.blocksToDestroy + 1;
    }

    handleCollision() {
        game.removeSprite(this);
        Block.blocksToDestroy = Block.blocksToDestroy - 1;
        if (Block.blocksToDestroy === 0) {
            game.end("Congratulations!\n\nPrincess Ann can continue her pursuit\nof the mysterious stranger!");
        }
        return true;
    }
}

// This "static" variable exists at the class level.
// That is, there is one variable shared by all class objects, not a separate one in each object.
Block.blocksToDestroy = 0;

// A for loop is convenient for arranging blocks.
for (let i = 0; i < 5; i = i + 1) {
    new Block(200 + i * 48, 200);
}

class ExtraLifeBlock extends Block {
    constructor(x, y) {
        super(x, y);
        this.setImage("block2.png"); // change image that was set by superclass 
        Block.blocksToDestroy = Block.blocksToDestroy - 1; // these blocks are indestructible, so adjust count
    }

    handleCollision() {
        ann.addALife(); // override (replace) superclass behavior
        return true;
    }
}

new ExtraLifeBlock(200, 250);

class ExtraBallBlock extends Block {
    constructor(x, y) {
        super(x, y);
        this.setImage("block3.png"); // change image that was set by superclass 
    }

    handleCollision() {
        super.handleCollision(); // call function in superclass
        new Ball(); // extend superclass behavior
        return true;
    }
}

new ExtraBallBlock(300, 250);

class Wall extends Sprite {
    constructor(x, y, name, image) {
        super();
        this.x = x;
        this.y = y;
        this.name = name;
        this.setImage(image);
        this.accelerateOnBounce = false;
    }
}

new Wall(0, 0, "A spooky castle wall", "castle.png");
let leftWall = new Wall(0, 200, "Left side wall", "wall.png");
let rightWall = new Wall(game.displayWidth - 48, 200, "Right side wall", "wall.png");

class Princess extends Sprite {
    constructor() {
        super();
        this.name = "Princess Ann";
        this.setImage("ann.png");
        this.width = 48;
        this.height = 48;
        this.x = game.displayWidth / 2;
        this.y = game.displayHeight - this.height;
        this.speedWhenWalking = 150;
        this.accelerateOnBounce = false;
        this.defineAnimation("left", 9, 11);
        this.defineAnimation("right", 3, 5);
        this.lives = 1;
    }

    handleFirstGameLoop() {
        // Set up a text area to display the number of lives remaining.
        this.livesDisplay = game.createTextArea(game.displayWidth - 3 * 48, 20);
        this.updateLivesDisplay();
    }

    handleGameLoop() {
        this.speed = 0;
        this.x = Math.max(leftWall.width, this.x);
        this.x = Math.min(game.displayWidth - rightWall.width - this.width, this.x);
    }

    handleLeftArrowKey() {
        this.playAnimation("left");
        this.angle = 180;
        this.speed = this.speedWhenWalking; 
    }

    handleRightArrowKey() {
        this.playAnimation("right");
        this.angle = 0;
        this.speed = this.speedWhenWalking; 
    }

    handleCollision(otherSprite) {
        // Horizontally, Ann's image file is about one-third blank, one-third Ann, and one-third blank.
        // Vertically, there is very little blank space. Ann's head is about one-fourth the height.
        // The other sprite (Ball) should change angle if:
        // 1. it hits the middle horizontal third of the image, which is not blank, AND
        // 2. it hits the upper fourth, which is Ann's head.
        let horizontalOffset = this.x - otherSprite.x;
        let verticalOffset = this.y - otherSprite.y;
        if (Math.abs(horizontalOffset) < this.width / 3 && verticalOffset > this.height / 4) {
            // The new angle depends on the horizontal difference between sprites.
            otherSprite.angle = 90 + 2 * horizontalOffset;
        }
        return false;
    }

    addALife() {
        this.lives = this.lives + 1;
        this.updateLivesDisplay();
    }

    loseALife() {
        this.lives = this.lives - 1;
        this.updateLivesDisplay();
        if (this.lives > 0) {
            new Ball(); // create a ball to restart play
        } else {
            game.end("The mysterious stranger has escaped\nPrincess Ann for now!\n\nBetter luck next time.");
        }
    }

    updateLivesDisplay() {
        game.writeToTextArea(this.livesDisplay, "Lives = " + this.lives);
    }
}

let ann = new Princess();

class Ball extends Sprite {
    constructor() {
        super();
        this.name = "Ann's souvenir East Alexandria soccer ball";
        this.setImage("ball.png");
        this.width = 48;
        this.height = 48;
        this.x = game.displayWidth / 2;
        this.y = game.displayHeight / 2;
        this.speed = 1;
        this.angle = 50 + Math.random() * 80;
        this.defineAnimation("spin", 0, 11);
        this.playAnimation("spin", true);

        Ball.ballsInPlay = Ball.ballsInPlay + 1;
    }

    handleGameLoop() {
        // Movement starts slowly so player can get set.
        if (this.speed < 200) {
            this.speed = this.speed + 2;
        }
    }

    handleBoundaryContact() {
        // Ball can only contact bottom boundary-- then it's gone.
        game.removeSprite(this);
        Ball.ballsInPlay = Ball.ballsInPlay - 1;

        // Player should only lose a life when the *last* ball goes out of play.
        if (Ball.ballsInPlay === 0) {
            ann.loseALife(); // may end the game
        }
    }
}

Ball.ballsInPlay = 0;

// We need one ball to start the game.
new Ball();
