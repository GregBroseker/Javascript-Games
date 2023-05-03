import {game, Sprite} from "./sgc/sgc.js";
game.setBackground("floor.png");

class PlayerWizard extends Sprite {
  constructor(){
    super();
    this.name = "Marcus the Wizard";
    this.setImage("marcusSheet.png");
    this.width = this.height = 48;
    this.x = this.width;
    this.y = this.height;
    this.defineAnimation("down", 6, 8);
    this.defineAnimation("up", 0, 2 );
    this.defineAnimation("right", 3, 5);
    this.speedWhenWalking = 100;
    this.spellCastTime = 0;
  }
  handleDownArrowKey(){
    this.playAnimation("down");
    this.speed = this.speedWhenWalking;
    this.angle = 270;
  }
  handleUpArrowKey(){
    this.playAnimation("up");
    this.speed = this.speedWhenWalking;
    this.angle = 90;
  }
  handleGameLoop(){
    // Keep marcus in the display area
    this.y = Math.max(5, this.y);   // assigns greatest of 5 or current y to y
    this.y = Math.min(game.displayHeight - this.height, this.y); 
    this.speed = 0;
  }
  handleSpacebar(){
    let now = game.getTime();
    if (now - this.spellCastTime >= 2){
      // reset the timer
      this.spellCastTime = now;
      // cast a spell
      let spell = new Spell();
      spell.x = this.x + this.width;  // set spell position to the right
      spell.y = this.y;               // of any object created from the class
      spell.name = "A spell cast by Marcus";
      spell.setImage("marcusSpellSheet.png");
      spell.angle = 0;
      this.playAnimation("right");
    }
  }
}
let marcus = new PlayerWizard();

class Spell extends Sprite {
  constructor(){
    super();
    this.speed = 200;
    this.height = this.width = 48;
    this.defineAnimation("magic", 0, 7);
    this.playAnimation("magic", true);
  }
  handleBoundaryContact(){
    game.removeSprite(this);
  }
  handleCollision(otherSprite){
    // Compare images so the same spells don't destroy each other.
    if (this.getImage() !== otherSprite.getImage()) {
      // Adjust mostly blank spell image to vertical center.
      let verticalOffset = Math.abs(this.y - otherSprite.y);
      if (verticalOffset < this.height / 2) {
          game.removeSprite(this);
          new Fireball(otherSprite);
      }
    }
    return false;
  }
}

class NonPlayerWizard extends Sprite{
  constructor(){
    super();
    this.name = "A mysterious stranger";
    this.setImage("strangerSheet.png");
    this.width = this.height = 48;
    this.x = game.displayWidth - 2* this.width;
    this.y = this.height;
    this.angle = 270;
    this.speed = 150;
    this.defineAnimation("up", 0, 2);
    this.defineAnimation("down", 6, 8);
    this.defineAnimation("left", 9, 11);
    this.playAnimation("down");
  }
  handleGameLoop(){
    if (this.y <= 0){
      this.y = 0;
      this.angle = 270;
      this.playAnimation("down");
    }
    if (this.y >= game.displayHeight  - this.height){
      this.y = game.displayHeight  - this.height;
      this.angle = 90;
      this.playAnimation("up");
    }
    if (Math.random() < 0.01){
      let spell = new Spell();
      spell.name = "a spell cast by stranger";
      spell.x = this.x - 2* this.width;
      spell.y = this.y;
      spell.setImage("strangerSpellSheet.png");
      spell.angle = 180;
      this.playAnimation("left");
    }
  }
  handleAnimationEnd(){
    if (this.angle === 90){
      this.playAnimation("up");
    }
    if (this.angle === 270){
      this.playAnimation("down");
    }
  }
}

let stranger = new NonPlayerWizard();

class Fireball extends Sprite {
  constructor(deadSprite){
    super();
    this.x = deadSprite.x;
    this.y = deadSprite.y;
    this.setImage("fireballSheet.png");
    this.name = "A ball of fire";
    game.removeSprite(deadSprite);
    this.defineAnimation("explode", 0, 15);
    this.playAnimation("explode");
  }
  handleAnimationEnd(){
    game.removeSprite(this);
    if (!game.isActiveSprite(stranger)){
      game.end("Congratuations!\n\nMarcus has defeated the mysterious"
      + "\nstranger in the dark cloak!");
    }
    if (!game.isActiveSprite(marcus)){
      game.end("Marcus is defeated by the mysterious\nstranger in the dark"
      + " cloak!\n\nBetter luck next time.");
    }
  }
}