import {game, Sprite} from "../sgc/sgc.js";

game.setBackground("floor.png");

class Marker extends Sprite {
    constructor(board, image, name) {
        super();
        this.board = board;
        this.setImage(image);
        this.name = name;
        this.squareSymbol = this.name.substring(0, 1);
        this.x = this.startX = 150;
        this.y = this.startY = 275;
        this.inBoard = false;
    }

    playInSquare(row, col) {
        this.x = this.board.x + (col * this.board.squareSize) + (this.board.squareSize / 3);
        this.y = this.board.y + (row * this.board.squareSize) + (this.board.squareSize / 3);
        this.inBoard = true;
        this.board.debugBoard();
    }
}

class PrincessMarker extends Marker {
    constructor(board) {
        super(board, "annFace.png", "Princess Ann");
        this.dragging = false;
        this.board.squareSymbolForHumanPlayer = this.squareSymbol;
    }

    handleMouseLeftButtonDown() {
        if (this.inBoard) {
            return;
        }

        this.dragging = true;
    }

    handleMouseLeftButtonUp() {
        if (this.inBoard) {
            return;
        }

        this.dragging = false;

        // compute board row and column
        let row = Math.floor((this.y - this.board.y) / this.board.squareSize);
        let col = Math.floor((this.x - this.board.x) / this.board.squareSize);

        // Return this marker to start position if dropped outside board,
        //  or dropped in a board square that is already marked.
        if (row < 0 || row >= this.board.size ||
            col < 0 || col >= this.board.size ||
            !this.board.markSquare(row, col)
        ) {
            this.x = this.startX;
            this.y = this.startY;
            return;
        }

        this.playInSquare(row, col);
        this.board.takeTurns();
    }

    handleGameLoop() {
        if (this.dragging) {
            this.x = game.getMouseX() - this.width / 2;
            this.y = game.getMouseY() - this.height / 2;
        }
    }
};

class StrangerMarker extends Marker {
    constructor(board) {
        super(board, "strangerFace.png", "Stranger");
    }

    handleGameLoop() {
        if (this.inBoard) {
            return;
        }

        let foundMove = this.findWinningMove();

        if (!foundMove) {
            foundMove = this.findWinningMove(true);
        }

        if (!foundMove) {
            foundMove = this.findForkingMove();
        }

        if (!foundMove) {
            foundMove = this.findForkingMove(true);
        }

        if (!foundMove) {
            foundMove = this.findCenterMove();
        }

        if (!foundMove) {
            foundMove = this.findOppositeCornerMove();
        }

        if (!foundMove) {
            foundMove = this.findAnyCornerMove();
        }

        if (!foundMove) {
            foundMove = this.findAnySideMove();
        }

        /* The following code "fills in" to find a move while strategy implementation is incomplete. 
            It becomes obsolete when strategy is complete. 
        if (!foundMove) {
            // Mark a random empty square.
            let row, col;
            do {
                row = Math.round(Math.random() * (this.board.size - 1));
                col = Math.round(Math.random() * (this.board.size - 1));
            } while (!this.board.markSquare(row, col));
            this.playInSquare(row, col);
        }
        */

        if (!foundMove) throw new Error("Failed to find a move.");
        this.board.takeTurns();
    }

    findWinningMove(forOpponent) {
        for (let row = 0; row < this.board.size; row = row + 1) {
            for (let col = 0; col < this.board.size; col = col + 1) {
                // Mark the square tentatively.
                if (this.board.markSquare(row, col, forOpponent)) {
                    // If it wins, play there ...
                    if (this.board.gameIsWon()) {
                        this.board.unmarkSquare(row, col);
                        this.board.markSquare(row, col);
                        this.playInSquare(row, col);
                        return true;
                    }
                    // ... otherwise, remove tentative marker. 
                    this.board.unmarkSquare(row, col);
                }
            }
        }

        return false;
    }

    findForkingMove(forOpponent) {
        for (let row = 0; row < this.board.size; row = row + 1) {
            for (let col = 0; col < this.board.size; col = col + 1) {
                // Mark the square tentatively.
                if (this.board.markSquare(row, col, forOpponent)) {
                    // If it creates a fork ...
                    if (this.board.countWinningMoves(forOpponent) > 1) {
                        // ... for the opponent ...
                        if (forOpponent) {
                            // ... remove the tentative mark ...
                            this.board.unmarkSquare(row, col);
                            // ... and try to force opponent to block.
                            if (this.forceOpponentToBlock()) {
                                return true;
                            }
                        }
                        // Take/block the fork.
                        this.board.unmarkSquare(row, col);
                        this.board.markSquare(row, col);
                        this.playInSquare(row, col);
                        return true;
                    }
                    // No fork, so remove tentative marker. 
                    this.board.unmarkSquare(row, col);
                }
            }
        }
        return false;
    }

    findCenterMove() {
        let center = Math.floor(this.board.size / 2);
        if (this.board.markSquare(center, center)) {
            this.playInSquare(center, center);
            return true;
        }
        return false;
    }

    findOppositeCornerMove() {
        let first = 0;
        let last = this.board.size - 1;
        let upperLeftSymbol = this.board.getSquareSymbol(first, first);
        let upperRightSymbol = this.board.getSquareSymbol(first, last);
        let lowerLeftSymbol = this.board.getSquareSymbol(last, first);
        let lowerRightSymbol = this.board.getSquareSymbol(last, last);

        if (lowerRightSymbol !== this.board.emptySquareSymbol && lowerRightSymbol !== this.squareSymbol &&
            this.board.markSquare(first, first)
        ) {
            this.playInSquare(first, first);
            return true;
        }

        if (upperLeftSymbol !== this.board.emptySquareSymbol && upperLeftSymbol !== this.squareSymbol &&
            this.board.markSquare(last, last)
        ) {
            this.playInSquare(last, last);
            return true;
        }

        if (lowerLeftSymbol !== this.board.emptySquareSymbol && lowerLeftSymbol !== this.squareSymbol &&
            this.board.markSquare(first, last)
        ) {
            this.playInSquare(first, last);
            return true;
        }

        if (upperRightSymbol !== this.board.emptySquareSymbol && upperRightSymbol !== this.squareSymbol &&
            this.board.markSquare(last, first)
        ) {
            this.playInSquare(last, first);
            return true;
        }

        return false;
    }

    findAnyCornerMove() {
        let first = 0;
        let last = this.board.size - 1;

        if (this.board.markSquare(first, first)) {
            this.playInSquare(first, first);
            return true;
        }

        if (this.board.markSquare(first, last)) {
            this.playInSquare(first, last);
            return true;
        }

        if (this.board.markSquare(last, first)) {
            this.playInSquare(last, first);
            return true;
        }

        if (this.board.markSquare(last, last)) {
            this.playInSquare(last, last);
            return true;
        }

        return false;
    }

    findAnySideMove() {
        let first = 0;
        let last = this.board.size - 1;

        // Check all interior columns of first row.
        for (let col = 1; col < last; col = col + 1) {
            if (this.board.markSquare(first, col)) {
                this.playInSquare(first, col);
                return true;
            }
        }

        // Check all interior columns of last row.
        for (let col = 1; col < last; col = col + 1) {
            if (this.board.markSquare(last, col)) {
                this.playInSquare(last, col);
                return true;
            }
        }

        // Check all interior rows of first column.
        for (let row = 1; row < last; row = row + 1) {
            if (this.board.markSquare(row, first)) {
                this.playInSquare(row, first);
                return true;
            }
        }

        // Check all interior rows of last column.
        for (let row = 1; row < last; row = row + 1) {
            if (this.board.markSquare(row, last)) {
                this.playInSquare(row, last);
                return true;
            }
        }

        return false;
    }

    forceOpponentToBlock() {
        for (let row = 0; row < this.board.size; row = row + 1) {
            for (let col = 0; col < this.board.size; col = col + 1) {
                // Mark the square tentatively ...
                if (this.board.markSquare(row, col)) {
                    // if it creates threat to win ...
                    if (this.board.countWinningMoves() === 1) {
                        // ... figure out how princess would block it
                        for (let princessRow = 0; princessRow < this.board.size; princessRow = princessRow + 1) {
                            for (let princessCol = 0; princessCol < this.board.size; princessCol = princessCol + 1) {
                                // Mark the square tentatively ...
                                if (this.board.markSquare(princessRow, princessCol, true)) {
                                    // if this is the block, and it creates no fork ...
                                    if (this.board.countWinningMoves() === 0 && this.board.countWinningMoves(true) < 2) {
                                        // ... unmark the princess block and play here.
                                        this.board.unmarkSquare(princessRow, princessCol);
                                        this.playInSquare(row, col);
                                        return true;
                                    }
                                    // unmark tentative princess square
                                    this.board.unmarkSquare(princessRow, princessCol);
                                }
                            }
                        }
                    }
                    // unmark tentative stranger move
                    this.board.unmarkSquare(row, col);
                }
            }
        }

        // no move found
        return false;
    }
}

class TicTacToe extends Sprite {
    constructor() {
        super();
        this.name = "A tic-tac-toe board";
        this.setImage("board.png");
        this.activeMarker; // variable exists, but value is undefined
        this.x = 300;
        this.y = 85;
        this.squareSize = 150;
        this.emptySquareSymbol = "-";
        this.size = 3; // 3x3 game board
        this.dataModel = [];
        for (let row = 0; row < this.size; row = row + 1) {
            this.dataModel[row] = [];
            for (let col = 0; col < this.size; col = col + 1) {
                this.dataModel[row][col] = this.emptySquareSymbol;
            }
        }
        this.tentativelyMarkedSquare = undefined;
    }

    takeTurns() {
        if (this.gameIsWon()) {
            let message = "        Game Over.\n        ";
            if (this.activeMarker.constructor === PrincessMarker) {
                message = message + "The Princess wins.";
            } else if (this.activeMarker.constructor === StrangerMarker) {
                message = message + "The Stranger wins.";
            }
            game.end(message);
            return;
        }

        if (this.gameIsDrawn()) {
            game.end("        Game Over.\n        The game ends in a draw.");
            return;
        }

        if (!this.activeMarker) {
            // value is undefined, so choose first player at random
            if (Math.random() < 0.5) {
                this.activeMarker = new PrincessMarker(this);
            } else {
                this.activeMarker = new StrangerMarker(this);
            }
        } else if (this.activeMarker.constructor === PrincessMarker) {
            // princess has moved; now it's stranger's turn
            this.activeMarker = new StrangerMarker(this);
        } else if (this.activeMarker.constructor === StrangerMarker) {
            // stranger has moved; now it's princess's turn
            this.activeMarker = new PrincessMarker(this);
        } else {
            throw new Error("Unexpected value for current player: neither princess nor stranger.");
        }
    }

    markSquare(row, col, forOpponent) {
        // Which symbol to put in square? 
        let squareSymbol = this.activeMarker.squareSymbol;
        if (forOpponent) {
            squareSymbol = this.squareSymbolForHumanPlayer;
        }

        if (this.getSquareSymbol(row, col) === this.emptySquareSymbol) {
            this.dataModel[row][col] = squareSymbol;
            return true;
        }

        return false;
    }

    unmarkSquare(row, col) {
        this.dataModel[row][col] = this.emptySquareSymbol;
    }

    getSquareSymbol(row, col) {
        return this.dataModel[row][col];
    }

    gameIsWon() {
        // Are there three of the same markers in any horizontal row?
        for (let row = 0; row < this.size; row = row + 1) {
            if (this.getSquareSymbol(row, 0) === this.getSquareSymbol(row, 1) &&
                this.getSquareSymbol(row, 1) === this.getSquareSymbol(row, 2) &&
                this.getSquareSymbol(row, 2) !== this.emptySquareSymbol
            ) {
                return true;
            }
        }

        // Are there three of the same markers in any vertical column? 
        for (let col = 0; col < this.size; col = col + 1) {
            if (this.getSquareSymbol(0, col) === this.getSquareSymbol(1, col) &&
                this.getSquareSymbol(1, col) === this.getSquareSymbol(2, col) &&
                this.getSquareSymbol(2, col) !== this.emptySquareSymbol
            ) {
                return true;
            }
        }

        // Are there three of the same markers diagonally from upper left?
        if (this.getSquareSymbol(0, 0) === this.getSquareSymbol(1, 1) &&
            this.getSquareSymbol(1, 1) === this.getSquareSymbol(2, 2) &&
            this.getSquareSymbol(2, 2) !== this.emptySquareSymbol
        ) {
            return true;
        }

        // Are there three of the same markers diagonally from lower left?
        if (this.getSquareSymbol(0, 2) === this.getSquareSymbol(1, 1) &&
            this.getSquareSymbol(1, 1) === this.getSquareSymbol(2, 0) &&
            this.getSquareSymbol(2, 0) !== this.emptySquareSymbol
        ) {
            return true;
        }

        return false;
    }

    gameIsDrawn() {
        // Are all squares marked? 
        for (let row = 0; row < this.size; row = row + 1) {
            for (let col = 0; col < this.size; col = col + 1) {
                if (this.getSquareSymbol(row, col) === this.emptySquareSymbol) {
                    return false;
                }
            }
        }

        return true;
    }

    countWinningMoves(forOpponent) {
        let squareSymbol = this.activeMarker.squareSymbol;
        if (forOpponent) {
            squareSymbol = this.squareSymbolForHumanPlayer;
        }

        let winningMoves = 0;

        // check rows
        for (let row = 0; row < this.size; row = row + 1) {
            let emptyCount = 0;
            let markerCount = 0;

            for (let col = 0; col < this.size; col = col + 1) {
                if (this.getSquareSymbol(row, col) === this.emptySquareSymbol) {
                    emptyCount = emptyCount + 1;
                } else if (this.getSquareSymbol(row, col) === squareSymbol) {
                    markerCount = markerCount + 1;
                }
            }

            if (emptyCount === 1 && markerCount === 2) {
                winningMoves = winningMoves + 1;
            }
        }

        // check columns
        for (let col = 0; col < this.size; col = col + 1) {
            let emptyCount = 0;
            let markerCount = 0;

            for (let row = 0; row < this.size; row = row + 1) {
                if (this.getSquareSymbol(row, col) === this.emptySquareSymbol) {
                    emptyCount = emptyCount + 1;
                } else if (this.getSquareSymbol(row, col) === squareSymbol) {
                    markerCount = markerCount + 1;
                }
            }

            if (emptyCount === 1 && markerCount === 2) {
                winningMoves = winningMoves + 1;
            }
        }

        // check first diagonal
        let emptyCount = 0;
        let markerCount = 0;

        if (this.getSquareSymbol(0, 0) === this.emptySquareSymbol) {
            emptyCount = emptyCount + 1;
        } else if (this.getSquareSymbol(0, 0) === squareSymbol) {
            markerCount = markerCount + 1;
        }

        if (this.getSquareSymbol(1, 1) === this.emptySquareSymbol) {
            emptyCount = emptyCount + 1;
        } else if (this.getSquareSymbol(1, 1) === squareSymbol) {
            markerCount = markerCount + 1;
        }

        if (this.getSquareSymbol(2, 2) === this.emptySquareSymbol) {
            emptyCount = emptyCount + 1;
        } else if (this.getSquareSymbol(2, 2) === squareSymbol) {
            markerCount = markerCount + 1;
        }

        if (emptyCount === 1 && markerCount === 2) {
            winningMoves = winningMoves + 1;
        }

        // check second diagonal
        emptyCount = 0;
        markerCount = 0;

        if (this.getSquareSymbol(0, 2) === this.emptySquareSymbol) {
            emptyCount = emptyCount + 1;
        } else if (this.getSquareSymbol(0, 2) === squareSymbol) {
            markerCount = markerCount + 1;
        }

        if (this.getSquareSymbol(1, 1) === this.emptySquareSymbol) {
            emptyCount = emptyCount + 1;
        } else if (this.getSquareSymbol(1, 1) === squareSymbol) {
            markerCount = markerCount + 1;
        }

        if (this.getSquareSymbol(2, 0) === this.emptySquareSymbol) {
            emptyCount = emptyCount + 1;
        } else if (this.getSquareSymbol(2, 0) === squareSymbol) {
            markerCount = markerCount + 1;
        }

        if (emptyCount === 1 && markerCount === 2) {
            winningMoves = winningMoves + 1;
        }

        return winningMoves;
    }

    debugBoard() {
        let boardString = "\n";
        let moveCount = 0;
        for (let row = 0; row < this.size; row = row + 1) {
            for (let col = 0; col < this.size; col = col + 1) {
                boardString = boardString + this.getSquareSymbol(row, col) + " ";
                if (this.getSquareSymbol(row, col) !== this.emptySquareSymbol) {
                    moveCount = moveCount + 1;
                }
            }
            boardString = boardString + "\n";
        }
        console.log("The data model after " + moveCount + " move(s):" + boardString);
    }
}

let theBoard = new TicTacToe();
theBoard.takeTurns();
