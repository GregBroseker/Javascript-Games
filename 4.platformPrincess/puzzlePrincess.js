import {game, Sprite} from "./sgc/sgc.js";
game.setBackground("floor.png");

class Marker extends Sprite {
  constructor(board, image, name){
    super();
    this.board = board;
    this.setImage(image);
    this.name = name;
    this.squareSymbol = this.name.substring(0, 1);
    this.x = this.startX = 150;
    this.y = this.startY = 275;
    this.inBoard = false;
  }
  handleMouseLeftButtonDown(){
    if (this.inBoard) return;
    this.dragging = true;
  }
  handleMouseLeftButtonUp(){
    if (this.inBoard) return;
    this.dragging = false;
    let col = Math.floor( (this.x - this.board.x) / this.board.squareSize);
    let row = Math.floor( (this.y - this.board.y) / this.board.squareSize);
    // console.log("row = " + row, "col = " + col);
    if (row < 0 || row > this.board.size -1 ||
        col < 0 || col > this.board.size - 1) {
          this.x = this.startX;
          this.y = this.startY;
          return;
    }
    this.playInSquare(row, col);
    this.board.takeTurns();
  }
  handleGameLoop(){
    if (this.dragging) {
      this.x = game.getMouseX() - this.width/2;
      this.y = game.getMouseY() - this.height/2;
    }
  }
  playInSquare(row, col){
    this.x = 51 + this.board.x + col * this.board.squareSize;
    this.y = 51 + this.board.y + row * this.board.squareSize;
    this.board.dataModel[row][col] = this.squareSymbol;
    this.board.debugBoard();
    this.inBoard = true;
  }
}
class PrincessMarker extends Marker {
  constructor(board){
    super(board, 'annFace.png', 'Princess Ann');
    this.dragging = false;
  }
}
class StrangerMarker extends Marker {   }

class TicTacToe  extends Sprite {
  constructor(){
    super();
    this.name = "a board";
    this.setImage("board.png");
    this.x = 300; this.y = 85;
    this.squareSize = 150;
    this.size = 3;
    this.activeMarker;
    this.emptySquareSymbol = '-';
    this.dataModel = [];
    for (let row = 0; row < this.size; row = row + 1) {
      this.dataModel[row] = [];
      for (let col = 0; col < this.size; col = col + 1) {
          this.dataModel[row][col] = this.emptySquareSymbol;
      }
    }
  }
  debugBoard(){
    let moveCount = 0;
    let boardString = '\n';
    for (let row = 0; row < this.size; row = row + 1) {
      for (let col = 0; col < this.size; col = col + 1) {
        boardString = boardString + this.dataModel[row][col] + ' ';
        if (this.dataModel[row][col] !== this.emptySquareSymbol) {
          moveCount++;
        }
      }
     	boardString = boardString + '\n';
    }
    console.log('The data model after ' + moveCount + ' move(s):' + boardString);
  }
  takeTurns() {
    this.activeMarker = new PrincessMarker(this);
  }
}

let theBoard = new TicTacToe();
theBoard.takeTurns();