export default class Game {
  static points = {
    '1': 40,
    '2': 100,
    '3': 300,
    '4': 1200,
  };

  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lines = 0;
    this.topOut = false;
    this.playfield = this.createPlayfield();
    this.activePiece = this.createPiece();
    this.nextPiece = this.createPiece();
  }

  get level() {
    return Math.floor(this.lines * 0.1);
  }

  getState() {
    const playfield = this.playfield.slice().map(x => x.slice());
    const { x: pieceX, y: pieceY, blocks } = this.activePiece
    
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (blocks[y][x]) {
          playfield[pieceY + y][pieceX + x] = blocks[y][x];
        }        
      }
    }
    return  {
      score: this.score,
      level: this.level,
      lines: this.lines,
      isGameOver: this.topOut,
      nextPiece: this.nextPiece,
      playfield: playfield
    }
  }

  createPlayfield() {
    return Array(20).fill(0).map(x => Array(10).fill(0));
  }

  createPiece() {
    const index = Math.floor(Math.random() * 7);
    const type = 'IJLOSTZ'[index];
    const piece = {};
    switch (type) {
      case 'I':
        piece.blocks = [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ];       
        break;
      case 'J':
        piece.blocks = [
          [0, 0, 0],
          [2, 2, 2],
          [0, 0, 2]
        ];  
        break;
      case 'L':
        piece.blocks = [
          [0, 0, 0],
          [3, 3, 3],
          [3, 0, 0]
        ];   
        break;
      case 'O':
        piece.blocks = [
          [0, 0, 0, 0],
          [0, 4, 4, 0],
          [0, 4, 4, 0],
          [0, 0, 0, 0]
        ];  
        break;
      case 'S':
        piece.blocks = [
          [0, 0, 0],
          [0, 5, 5],
          [5, 5, 0]
        ];  
        break;
      case 'T':
        piece.blocks = [
          [0, 0, 0],
          [6, 6, 6],
          [0, 6, 0]
        ];   
        break;
      case 'Z':
        piece.blocks = [
          [0, 0, 0],
          [7, 7, 0],
          [0, 7, 7]
        ]; 
        break;                                            
      default:
        throw new Error('Unknown piece type');
    }

    piece.x = Math.floor((10 - piece.blocks[0].length) / 2);
    piece.y = -1
    return piece;
  }

  rotatePiece() {
    this.rotateBlocks();    
    if (this.hasCollision()) this.rotateBlocks(false);
  }

  rotateBlocks(clockwise = true) {
    const blocks = this.activePiece.blocks;
    const x = Math.floor(blocks.length / 2);
    const y = blocks.length - 1;

    for (let i = 0; i < x; i++) {
      for (let j = i; j < y - i; j++) {
        const temp = blocks[i][j];

        if (clockwise) {
          blocks[i][j] = blocks[y - j][i];
          blocks[y - j][i] = blocks[y - i][y - j];
          blocks[y - i][y - j] = blocks[j][y - i];
          blocks[j][y - i] = temp;
        } else {
          blocks[i][j] = blocks[j][y - i];
          blocks[j][y - i] = blocks[y - i][y - j];
          blocks[y - i][y - j] = blocks[y - j][i];
          blocks[y - j][i] = temp;
        }        
      }
    }
  }

  movePieceDown() {
    if (this.topOut) return;

    this.activePiece.y++;
    if (this.hasCollision()) {
      this.activePiece.y--;
      this.lockPiece();
      const clearedLines = this.clearLines();
      this.updateScore(clearedLines);
      this.updatePieces();
    }

  };

  movePieceRight() {
    this.activePiece.x++;
    if (this.hasCollision()) {
      this.activePiece.x--;
    }
  };

  movePieceLeft() {
    this.activePiece.x--;
    if (this.hasCollision()) {
      this.activePiece.x++
    }
  };

  hasCollision() {
    const playfield = this.playfield;
    const { x: pieceX, y: pieceY, blocks } = this.activePiece;

    for (let y= 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (
          blocks[y][x] &&  
          (playfield[pieceY + y] === undefined || playfield[pieceY + y][pieceX + x] === undefined || playfield[pieceY + y][pieceX + x])
        ) return true;
      }
    }
    return false; 
  };

  lockPiece() {
    const { x: pieceX, y: pieceY, blocks } = this.activePiece;

    for (let y= 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (blocks[y][x]) {
          this.playfield[pieceY + y][pieceX + x] = blocks[y][x];
        }
      }
    }
  }

  clearLines() {
    const rows = 20;
    // const columns = 10;
    const lines = [];

    for (let y = rows - 1; y >= 0; y--) {
      if (!(this.playfield[y].some(x => x !== 0))) break;
      if ((this.playfield[y].includes(0))) continue;
      lines.unshift(y);
    }
    for (const index of lines) {
      this.playfield.splice(index,1);
      this.playfield.unshift(new Array(10).fill(0));
    }
    return lines.length;
  }

  updateScore(clearedLines) {
    if (clearedLines > 0) {
      this.score += Game.points[clearedLines] * (this.level + 1);
      this.lines += clearedLines;
    }

  }
 
  updatePieces() {
    this.activePiece = this.nextPiece;
    this.nextPiece = this.createPiece();

    if (this.hasCollision()) {
      this.topOut = true;
    }
  }
}