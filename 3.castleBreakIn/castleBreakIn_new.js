import {game, Sprite} from "./sgc/sgc.js";
game.setBackground("grass.png");

class Wall extends Sprite{
  constructor(x, y, name, image){
    super();
    this.x = x; this.y = y;
    this.name = name;
    this.setImage(image);
    this.accelerateOnBounce = false;
  }
}
// Create the playing area
new Wall(0, 0, "A spooky castle wall", "castle.png");
let leftWall = new Wall (0, 200, "left side wall", "wall.png");
let rightWall = new Wall (game.displayWidth - 48, 200,
                          "left side wall", "wall.png");
// ****************************
// *** Princess Class       ***
// ****************************
class Princess extends Sprite{
  constructor(){
    super();
    this.name = "Princess Ann";
    this.setImage("ann.png");
    this.height = this.width = 48;
    this.x = game.displayWidth / 2 - 48;
    this.y = game.displayHeight - this.height;
    this.speedWhenWalking = 150;
    this.lives = 3;
    this.accelerateOnBounce = false;
    this.defineAnimation("left", 9, 11);
    this.defineAnimation("right", 3, 5);
  }
  handleRightArrowKey(){
    this.playAnimation("right");
    this.angle = 0;
    this.speed = this.speedWhenWalking;
  }
  handleLeftArrowKey(){
    this.playAnimation("left");
    this.angle = 180;
    this.speed = this.speedWhenWalking;
  }
  handleGameLoop(){
    this.speed = 0;
    this.x = Math.max(48, this.x);
    this.x = Math.min(game.displayWidth - 2 * 48, this.x);
  }
  handleCollision(otherSprite) {
    let horizontalOffset = this.x - otherSprite.x;
    let verticalOffset = this.y - otherSprite.y;
    if (Math.abs(horizontalOffset) < this.width / 3 
                && verticalOffset > this.height / 4) {
        otherSprite.angle = 90 + 2 * horizontalOffset;
    }
    return false;
  }
  handleFirstGameLoop(){
    // Set up a text area to display the number of lives remaining.
    this.livesDisplay = game.createTextArea(game.displayWidth - 3*48, 20);
    this.updateLivesDisplay();
  }
  updateLivesDisplay(){
    game.writeToTextArea(this.livesDisplay, "Lives = " + this.lives);
  }
  loseALife(){
    this.lives--;
    this.updateLivesDisplay();
    if (this.lives > 0){
      new Ball();
    }
    else {
      game.end('The mysterious stranger has escaped\nPrincess Ann for' +
               ' now!\nBetter luck next time.');
    }
  }
  addALife(){
    this.lives++;
    this.updateLivesDisplay();
  }
}
let ann = new Princess();
// ****************************
// ***     Ball Class       ***
// ****************************
class Ball extends Sprite{
  constructor(){
    super();
    this.x = game.displayWidth / 2 - 48;
    this.y = game.displayHeight / 2 -48;
    this.height = this.width = 48;
    this.name = "A ball";
    this.setImage("ball.png");
    this.defineAnimation("spin", 0, 11);
    this.playAnimation("spin", true);
    this.speed = 1;
    this.angle = 50 + Math.random() * 80; 
    Ball.ballsInPlay++;
  }
  handleGameLoop(){
    if (this.speed < 200) {
      this.speed = this.speed + 2;
    }
  }
  handleBoundaryContact(){
    game.removeSprite(this);
    Ball.ballsInPlay--;
    if (Ball.ballsInPlay == 0){
      ann.loseALife();
    }
  }
}
Ball.ballsInPlay = 0;
new Ball();

// ****************************
// ***     Block Class      ***
// ****************************
class Block extends Sprite{
  constructor(x, y){
    super();
    this.x = x; this.y = y;
    this.name = "Block";
    this.setImage("block1.png");
    this.accelerateOnBounce = false;
    Block.blocksToDestroy++;
  }
  handleCollision(){
    game.removeSprite(this);
    Block.blocksToDestroy--;
    if (Block.blocksToDestroy <= 0) {
      game.end('Congratulations!\n\nPrincess Ann can continue her pursuit\nof the mysterious stranger!')
    }
    return true;
  }
}
Block.blocksToDestroy = 0;

for (let i = 0; i < 5; i++){
  new Block(200 + i * 48, 200);
}
// *** ExtraLife Block  ***
class ExtraLifeBlock extends Block{
  constructor(x, y) {
    super(x, y);
    this.setImage("block2.png");
    Block.blocksToDestroy--;
  }
  handleCollision(){
    ann.addALife();
    return true;
  }
}
new ExtraLifeBlock(200, 250);

// *** ExtraBall Block  ***
class ExtraBallBlock extends Block{
  constructor(x, y){
    super(x, y);
    this.setImage("block3.png");
  }
  handleCollision() {
   super.handleCollision(); // call function in superclass
   new Ball(); // extend superclass behavior
   return true;
  }
}
new ExtraBallBlock(300, 250);