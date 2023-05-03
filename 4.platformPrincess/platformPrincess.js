// topics: array, method that is not sgc handler; could add for loop to randomize number, position of enemies

// consider rewriting 48's and other numbers as multiples of 4 to emphasize alignment

import { game, Sprite } from "../sgc/sgc.js";

game.setBackground("water.png", 500, 0); // scrolls horizontally

// Create some scenery.
let wall = new Sprite();
wall.name = "A spooky castle wall";
wall.setImage("wall.png");
wall.x = 0;
wall.y = 175;
wall.accelerateOnBounce = false;

// Our heroine.
class Princess extends Sprite {
    constructor() {
        super();
        this.setImage("ann.png");
        this.x = 48;
        this.y = 300;
        this.speed = 0;
        this.speedWhenWalking = 125;
        this.isFalling = false;
        this.defineAnimation("left", 9, 11);
        this.defineAnimation("right", 3, 5);
    }

    handleLeftArrowKey() {
        if (!this.isFalling) {
            // move left
            this.speed = this.speedWhenWalking;
            this.angle = 180;
        }
    }

    handleRightArrowKey() {
        if (!this.isFalling) {
            // move right
            this.speed = this.speedWhenWalking;
            this.angle = 0;
        }
    }

    handleSpacebar() {
        if (!this.isFalling) {
            this.y = this.y - 2 * this.height; // jump
        }
    }

    handleGameLoop() {
        // Play the appropriate animation.
        if (this.angle === 0 && this.speed > 0) {
            this.playAnimation("right");
        }

        if (this.angle === 180 && this.speed > 0) {
            this.playAnimation("left");
        }

        // Check directly below princess for supports.
        let supports = game.getSpritesOverlapping(this.x, this.y + this.height, this.width, 1, Support);

        // Is there one, and is its *top* at or below the bottom of the princess?
        this.isFalling = false;
        if (supports.length === 0 || supports[0].y < this.y + this.height) {
            this.y = this.y + 4; // simulate gravity
            this.isFalling = true;
        }

        // Stay away from left boundary
        this.x = Math.max(2, this.x);
    }

    handleBoundaryContact() {
        // This can only happen at bottom of display; player loses.
        game.end("Princess Ann has drowned.\n\nBetter luck next time.");
    }
}

let ann = new Princess();
ann.name = "Princess Ann";

class Support extends Sprite {
    constructor(x, y, image) {
        super();
        this.x = x;
        this.y = y;
        this.setImage(image);
    }
}

class Platform extends Support {
    constructor(x, y, image) {
        super(x, y, image);
        this.name = "A platform";
        this.accelerateOnBounce = false;
    }
}

// Create a start and a finish platform at opposite ends of the display.
let startPlatform = new Platform(0, 400, "start.png");
let finishPlatform = new Platform(game.displayWidth - 48 * 2, 400, "finish.png");

class Slider extends Support {
    constructor(x, y, angle) {
        super(x, y, "slider.png");
        this.name = "A sliding support";
        this.angle = angle;
        this.speed = 48;
    }
}

// Create two sliders.
new Slider(startPlatform.x + 48 * 3, startPlatform.y + 48, 0);
new Slider(finishPlatform.x - 48 * 5, finishPlatform.y + 48, 180);

// Create an exit.
class Door extends Sprite {
    constructor() {
        super();
        this.setImage("door.png");
        this.x = game.displayWidth - 48;
        this.y = finishPlatform.y - 2 * 48;
        this.accelerateOnBounce = false;
    }

    // static open() {
    handleCollision(otherSprite) {
        if (otherSprite === ann) {
            game.end("Congratulations!\n\nPrincess Ann can now pursue the\nstranger deeper into the castle!");
        }
        return false;
    }
}

let exit = new Door();
exit.name = "The exit door";

class Bat extends Sprite {
    constructor(x, y) {
        super();
        this.name = "An enemy bat";
        this.setImage("bat.png");
        this.x = this.startX = x;
        this.y = this.startY = y;
        this.accelerateOnBounce = false;
        this.defineAnimation("flap", 0, 1);
        this.playAnimation("flap", true);
        this.speed = this.normalSpeed = 20;
        this.attackSpeed = 300;
        this.angle = 45 + (Math.round(Math.random() * 3) * 90);
        this.angleTimer = 0;
    }

    attack() {
        this.speed = this.attackSpeed;
        this.aimFor(ann.x, ann.y);
    }

    handleGameLoop() {
        // Bats attack with 0.1% probability.
        if (Math.random() < 0.001) {
            this.attack();
        }

        // When not attacking, roam in same general area of display.
        if (this.speed === this.normalSpeed) {
            let now = game.getTime();
            if (now - this.angleTimer >= 5) {
                this.angleTimer = now;
                this.angle = this.angle + 90;
                if (Math.random() < 0.5) {
                    this.angle = this.angle + 90;
                }
            }
        }
    }

    handleBoundaryContact() {
        if (this.y < 0) {
            // Don't leave from top of display.
            this.y = 0;
        }

        if (this.y >= game.displayHeight) {
            // After attacking, return to normal roaming behavior.
            this.x = this.startX;
            this.y = 0;
            this.speed = 20;
            this.angle = 270;
        }
    }

    handleCollision(otherSprite) {
        // Bats only care about collisons with Ann.
        if (otherSprite === ann) {
            otherSprite.y = otherSprite.y + 1; // knock Ann off platform
        }
        return false;
    }
}

// Create two bats.
new Bat(200, 100);
new Bat(500, 75);

class Spider extends Sprite {
    constructor(x, y) {
        super();
        this.name = "An enemy spider";
        this.setImage("spider.png");
        this.x = x;
        this.y = y;
        this.speed = 48;
        this.accelerateOnBounce = false;
        this.defineAnimation("creep", 0, 2);
        this.playAnimation("creep", true);
    }

    handleGameLoop() {
        if (this.y < ann.y - ann.height) {
            // This spider is above the "attack zone". Move down.
            this.angle = 270;
        }

        if (this.y > ann.y) {
            // This spider is below the "attack zone". Move up. 
            this.angle = 90;
        }
    }

    handleCollision(otherSprite) {
        // Spiders only care about collisons with Ann.
        if (otherSprite === ann) {
            // Spiders must hit Ann on top of her head.
            let horizontalOffset = this.x - otherSprite.x;
            let verticalOffset = this.y - otherSprite.y;
            if (Math.abs(horizontalOffset) < this.width / 3 && Math.abs(verticalOffset) < 1) {
                otherSprite.y = otherSprite.y + 1; // knock Ann off platform
            }
        }
        return false;
    }
}

// Create two spiders.
new Spider(200, 225);
new Spider(550, 200);
