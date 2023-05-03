
// topics: if

import { game, Sprite } from "./sgc/sgc.js";

game.setBackground("floor.png");

class PlayerWizard extends Sprite {
    constructor() {
        super();
        this.name = "Marcus the Wizard";
        this.setImage("marcusSheet.png");
        this.width = 48;
        this.height = 48;
        this.x = this.width;
        this.y = this.height;
        this.speedWhenWalking = 100;
        this.spellCastTime = 0;
        this.defineAnimation("up", 0, 2);
        this.defineAnimation("down", 6, 8);
        this.defineAnimation("right", 3, 5);
    }

    handleUpArrowKey() {
        this.playAnimation("up");
        this.speed = this.speedWhenWalking;
        this.angle = 90;
    }

    handleDownArrowKey() {
        this.playAnimation("down");
        this.speed = this.speedWhenWalking;
        this.angle = 270;
    }

    handleGameLoop() {
        // Stay in display area
        this.y = Math.max(0, this.y);
        this.y = Math.min(this.y, game.displayHeight - this.height);
        this.speed = 0;
    }

    handleSpacebar() {
        if (!stranger) return;
        let now = game.getTime();
        if (now - this.spellCastTime >= 2) {
            this.spellCastTime = now;
            // Cast a spell to the right
            this.playAnimation("right");
            let spell = new Spell();
            spell.x = this.x + this.width;
            spell.y = this.y;
            spell.name = "A spell cast by Marcus";
            spell.setImage("marcusSpellSheet.png");
            spell.angle = 0;
        }
    }
}

let marcus = new PlayerWizard();

// Define an NPC sprite
class NonplayerWizard extends Sprite {
    constructor() {
        super();
        this.name = "The mysterious stranger";
        this.setImage("strangerSheet.png");
        this.width = 48;
        this.height = 48;
        this.x = game.displayWidth - 2 * this.width;
        this.y = this.height;
        this.angle = 270;
        this.speed = 150;
        this.defineAnimation("up", 0, 2);
        this.defineAnimation("down", 6, 8);
        this.defineAnimation("left", 9, 11);
        this.playAnimation("down");
    }

    handleAnimationEnd() {
        // Each time an animation ends, check the angle to play the correct animation
        if (this.angle === 90) {
            this.playAnimation("up");
        }

        if (this.angle === 270) {
            this.playAnimation("down");
        }
    }

    handleGameLoop() {
        if (this.y <= 0) {
            // Upward motion has reached top, so turn down
            this.y = 0;
            this.angle = 270;
            this.playAnimation("down");
        }

        if (this.y >= game.displayHeight - this.height) {
            // Downward motion has reached bottom, so turn up
            this.y = game.displayHeight - this.height;
            this.angle = 90;
            this.playAnimation("up");
        }

        if (marcus && Math.random() < 0.01) {
            // if Marcus exists, cast spell to left with 1% probability
            this.playAnimation("left");
            let spell = new Spell();
            spell.x = this.x - this.width;
            spell.y = this.y;
            spell.name = "A spell cast by the stranger";
            spell.setImage("strangerSpellSheet.png");
            spell.angle = 180;
        }
    }
}

let stranger = new NonplayerWizard();

class Spell extends Sprite {
    constructor() {
        super();
        this.speed = 200;
        this.width = 48;
        this.height = 48;
        this.defineAnimation("magic", 0, 7);
        this.playAnimation("magic", true);
    }

    handleBoundaryContact() {
        // Destroy spell when it leaves display area
        game.removeSprite(this);
    }

    handleCollision(otherSprite) {
        // Compare images so Stranger's spells don't destroy each other.
        if (this.getImage() !== otherSprite.getImage()) {
            // Spell images are mostly blank at top and bottom; adjust to vertical center.
            let verticalOffset = Math.abs(this.y - otherSprite.y);
            if (verticalOffset < this.height / 2) {
                game.removeSprite(this);
                new Fireball(otherSprite);
            }
        }
        return false;
    }
}

class Fireball extends Sprite {
    constructor(deadSprite) {
        super();
        this.name = "A ball of fire";
        this.x = deadSprite.x;
        this.y = deadSprite.y;
        this.setImage("fireballSheet.png");

        game.removeSprite(deadSprite);
        this.defineAnimation("explode", 0, 15);
        this.playAnimation("explode");
    }

    handleAnimationEnd() {
        game.removeSprite(this);

        if (!game.isActiveSprite(marcus)) {
            game.end("Marcus is defeated by the mysterious\nstranger in the dark cloak!\n\nBetter luck next time.");
        }

        if (!game.isActiveSprite(stranger)) {
            game.end("Congratulations!\n\nMarcus has defeated the mysterious\nstranger in the dark cloak!");
        }
    }
}
