// phase in: 
// walls and ann as bare sprites
// Princess class to add mouse behavior
// two instances of Wizard class
// ctor useful to standardize objects; DRY
// topics: object, class, property, method, constructor, extends, handlers, booleans, strings, numbers, let, assignment, Math.random
import {game, Sprite} from "../sgc/sgc.js";

game.setBackground("floor.png");
game.showScore = true;

let topWall = new Sprite();
topWall.width = 800;
topWall.height = 48;
topWall.setImage("horizontalWall.png");
topWall.x = 0;
topWall.y = 0;
topWall.accelerateOnBounce = false;

let leftWall = new Sprite();
leftWall.width = 48;
leftWall.height = 504;
leftWall.setImage("verticalWall.png");
leftWall.x = 0;
leftWall.y = topWall.height;
leftWall.accelerateOnBounce = false;

let bottomWall = new Sprite();
bottomWall.width = 800;
bottomWall.height = 48;
bottomWall.setImage("horizontalWall.png");
bottomWall.x = 0;
bottomWall.y = topWall.height + leftWall.height;
bottomWall.accelerateOnBounce = false;

let rightWall = new Sprite();
rightWall.width = 48;
rightWall.height = 504;
rightWall.setImage("verticalWall.png");
rightWall.x = topWall.width - rightWall.width;
rightWall.y = topWall.height;
rightWall.accelerateOnBounce = false;

class Princess extends Sprite {
    handleMouseClick() {
        game.end();
    }
}

let ann = new Princess();
// Possible exercise: after Princess class is defined, relocate following statements to a constructor
ann.name = "Princess Ann";
ann.width = 48;
ann.height = 48;
ann.setImage("ann.png");
// ? do the extra parentheses-- unneeded for order of operations-- clarify why the following is correct?
ann.x = leftWall.width + (Math.random() * (rightWall.x - ann.width - leftWall.width));
ann.y = topWall.height + (Math.random() * (bottomWall.y - ann.height - topWall.height));
ann.angle = Math.random() * 360;
ann.speed = 200;

class Wizard extends Sprite {
    constructor() {
        super();
        this.width = 48;
        this.height = 48;
        this.x = leftWall.width + (Math.random() * (rightWall.x - this.width - leftWall.width));
        this.y = topWall.height + (Math.random() * (bottomWall.y - this.height - topWall.height));
        this.angle = Math.random() * 360;
    }

    handleMouseClick() {
        game.score = game.score + this.clickPoints;
        this.speed = this.speed * 1.1;
        this.x = leftWall.width + (Math.random() * (rightWall.x - this.width - leftWall.width));
        this.y = topWall.height + (Math.random() * (bottomWall.y - this.height - topWall.height));
    }
}

let marcus = new Wizard();
// Possible exercise: why should the following statements NOT be in the Wizard class constructor? 
marcus.name = "Marcus the Wizard";
marcus.speed = 100;
marcus.setImage("marcus.png");
marcus.clickPoints = -10;

let stranger = new Wizard();
stranger.name = "The mysterious stranger";
stranger.speed = 300;
stranger.setImage("stranger.png");
stranger.clickPoints = 10;
