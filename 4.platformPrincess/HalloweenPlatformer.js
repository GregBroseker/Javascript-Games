import {game, Sprite} from "./sgc/sgc.js";
game.setBackground("cemetery.png");

class Crate extends Sprite {
  constructor() {
    super();
    this.name = "A crate";
    this.setImage("crate_small.jpg");
    this.x = 96;  this.y = 300;
    this.accelerateOnBounce = false; 
    this.width = 48; this.height = 48;
    this.isFalling = false;
  }
  handleGameLoop() {
    this.isFalling = false;
    let supports = game.getSpritesOverlapping(this.x, this.y +
      this.height, this.width, 4, Support);
    if (supports.length === 0 || 
        supports[0].y < this.y + this.height - 4){
          this.isFalling = true;
          this.y += 4;
    }
    if (supports[0] instanceof Slider) {
      // this.y = supports[0].y - 48;
      this.angle = supports[0].angle;
      this.speed = supports[0].speed;
    }
  }
  handleCollision(otherSprite){
    if (otherSprite === ann && ann.x < this.x) this.x += 4;
    if (otherSprite === ann && ann.x > this.x) this.x -= 4;
    if (otherSprite === slider1 || otherSprite === slider2) {
      this.angle = otherSprite.angle;
      this.speed = otherSprite.speed;
      this.falling = false;
    }  
  }  
}
let myBox = new Crate();

let powerUp = new Sprite();
powerUp.name = "Shooter";
powerUp.setImage("bone2.png");
powerUp.x = 48; powerUp.y = 90;
powerUp.accelerateOnBounce = false;

class Support extends Sprite {
  constructor(x, y, image){
    super();
    this.x = x; this.y = y;
    this.setImage(image);
  }
}
class Platform extends Support {
  constructor(x, y, image){
    super(x, y, image);
    this.name = "A platform";
    this.accelerateOnBounce = false;
  }
}
let startPlatform = new Platform(0, 400, "tileTopRight.png");
let finishPlatform = new Platform(game.displayWidth - 48*2, 400, "tileTopLeft.png");
let powerPlatform = new Platform(0, 120, "tileFloatRight.png");
let centerPlatform = new Platform(340, 420, "slider.png");

class Slider extends Support {
  constructor(x, y, angle){
    super(x, y, "tileFloatCenter.png");
    this.name = "A Sliding support";
    this.angle = angle;
    this.speed = 96;
    this.accelerateOnBounce = false;
  }
  handleGameLoop(){
    if (this.y <= 48) this.angle = 270;
    if (this.y > 448) this.angle = 90;
    if (this == slider3 && this.x > finishPlatform.x - 48 * 6) this.angle = 180;
    if (this == slider3 && this.x < startPlatform.x + 48 * 6) this.angle = 0;
  }
}
let slider1 = new Slider (startPlatform.x + 48*3, startPlatform.y - 96, 270);
let slider2 = new Slider (finishPlatform.x - 48 * 3, finishPlatform.y - 96, 270);
    slider2.speed = 180;
let slider3 = new Slider (startPlatform.x + 48*6, 144, 0);
// let slider4 = new Slider (startPlatform.x + 48*6, finishPlatform.y + 96, 0);


class Princess extends Sprite {
  constructor(){
    super();
    this.setImage("ann.png");
    this.x = 48; this.y = 300;
    this.speed = 0;
    this.speedWhenWalking = 125;
    this.defineAnimation("left", 9, 11);
    this.defineAnimation("right", 3, 5);
    this.isFalling = false;
    this.height = this.width = 48;
    this.shooter = false;
  }
  handleLeftArrowKey(){
    this.angle = 180;
    this.speed = this.speedWhenWalking;
  }
  handleRightArrowKey(){
    this.angle = 0;
    this.speed = this.speedWhenWalking;
  }
  handleGameLoop(){
    if (this.angle === 0 && this.speed > 0) {
      this.playAnimation("right");
    }
    if (this.angle === 180 && this.speed > 0) {
      this.playAnimation("left");
    }
    this.x = Math.max(5, this.x);
    this.isFalling = false;
    // Check directly below princess for supports
    let supports = game.getSpritesOverlapping(this.x, this.y +
      this.height, this.width, 4, Support);
    // Is there none, or is its *top* above the bottom of the princess?
    if (supports.length === 0 || 
        supports[0].y < this.y + this.height - 4){
          this.isFalling = true;
          this.y += 4;
    }
  }
  handleSpacebar(){
    if (!this.isFalling) this.y = this.y - 1.25 * this.height;
  }
  handleAlphaNumericKeys(Q){
    if (!this.shooter) return;
    new Spell(this.x, this.y, this.angle);
  }
  handleBoundaryContact(){
    if (this.y > game.displayHeight - 96) {
      game.end('Princess Ann has drowned.\n\nBetter luck next time.')
    }
  }
  handleCollision(otherSprite){
    if (otherSprite === powerUp){
      // enable shooting
      game.removeSprite(otherSprite);
      this.shooter = true;
    }
    if (otherSprite instanceof Slider){
      this.angle = otherSprite.angle;
      this.speed = otherSprite.speed;
      this.falling = false;
    }
  }
}
let ann = new Princess();

class Spell extends Sprite {
  constructor(x, y, direction) {
    super();
    if (direction === 0) this.x = x + 48;
    else if (direction === 180) this.x = x - 48;
    this.y = y;
    this.angle = direction;
    this.speed = 250;
    this.setImage("marcusSpellSheet.png");
    this.defineAnimation("zap", 0, 7);
    this.playAnimation("zap", true);
    this.accelerateOnBounce = false;
  }
  handleCollision(otherSprite){
    if (otherSprite instanceof Bat || otherSprite instanceof Spider){
      game.removeSprite(otherSprite)
    }
  }
}
class Door extends Sprite {
  constructor(){
    super();
    this.setImage('tombStone.png');
    this.x = game.displayWidth - 48;
    this.y = finishPlatform.y - 24;
    this.accelerateOnBounce = false;
  }
  handleCollision(otherSprite){
    if (otherSprite === ann) {
      game.end('Congratulations!\n\nPrincess Ann can now pursue' +
      ' the\nstranger deeper into the castle!');
    }
  }
}
let exit = new Door();
exit.name = "The exit door";

class Spider extends Sprite {
  constructor(x, y){
    super();
    this.name = "A big fat hairy spider";
    this.setImage("spider.png");
    this.x = x; this.y = y;
    this.speed = 48;
    this.accelerateOnBounce = false;
    this.defineAnimation("creep", 0, 2);
    this.playAnimation("creep", true);
  }
  handleGameLoop(){
    if (this.y < ann.y - ann.height){
      this.angle = 270;
    }
    if (this.y > ann.y) {
      this.angle = 90;
    }
  }
  handleCollision(otherSprite) {
    // Spiders only care about collisons with Ann.
    if (otherSprite === ann) {
	    // Spiders must hit Ann on top of her head.
   		let horizontalOffset = this.x - otherSprite.x;
   		let verticalOffset = this.y - otherSprite.y;
   		if (Math.abs(horizontalOffset) < this.width / 2 && 
   		    Math.abs(verticalOffset) < 30) {
        		otherSprite.y = otherSprite.y + 1; // knock Ann off platform
   		}
   	}
    return false;
  }
}
// new Spider(200, 225); new Spider(550, 200);

class Bat extends Sprite {
  constructor(x, y){
    super();
    this.x = x;
    this.y = y;
    this.setImage("bat.png");
    this.accelerateOnBounce = false;
    this.name = "a scary bat";
    this.defineAnimation("flap", 0, 1);
    this.playAnimation("flap", true);
    this.attackSpeed = 300;
    this.speed = this.normalSpeed = 20;
    this.angle = 45 + Math.round(Math.random()*3) * 90;
    this.angleTimer = 0;
  }
  attack(){
    this.speed = this.attackSpeed;
    this.aimFor(ann.x, ann.y);
  }
  handleCollision(otherSprite) {
    if (otherSprite === ann) {
      ann.y++;
    }
    return false;
  }
  handleGameLoop() {
    // if (Math.random() < 0.001) this.attack();
    // if bat is not attacking, hover
    // console.log(this.speed);
    if (Math.round(this.speed) === 20) {
      let now = game.getTime();
      if (now - this.angleTimer >= 3) {
        this.angleTimer = now;
        this.angle = this.angle + 90 + 90 * 
        Math.round(Math.random());
      }
    }
  }    
}
// let leftBat = new Bat(200, 100);
let rightBat = new Bat(500, 75);