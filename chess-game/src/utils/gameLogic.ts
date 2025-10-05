import { Square, Piece, Move, GameState, PieceType, PieceColor } from '../types/chess.types';

export const createInitialBoard = (): Square[][] => {
  const board: Square[][] = [];
  
  for (let row = 0; row < 8; row++) {
    board[row] = [];
    for (let col = 0; col < 8; col++) {
      board[row][col] = {
        row,
        col,
        piece: null,
        color: (row + col) % 2 === 0 ? 'light' : 'dark',
        isHighlighted: false,
        isSelected: false,
        isLastMove: false,
        isCheck: false
      };
    }
  }

  // Place pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  // Black pieces (top)
  for (let col = 0; col < 8; col++) {
    board[0][col].piece = {
      type: pieceOrder[col],
      color: 'black',
      hasMoved: false
    };
    board[1][col].piece = {
      type: 'pawn',
      color: 'black',
      hasMoved: false
    };
  }

  // White pieces (bottom)
  for (let col = 0; col < 8; col++) {
    board[7][col].piece = {
      type: pieceOrder[col],
      color: 'white',
      hasMoved: false
    };
    board[6][col].piece = {
      type: 'pawn',
      color: 'white',
      hasMoved: false
    };
  }

  return board;
};

export const createInitialGameState = (): GameState => {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    gameStatus: 'playing',
    selectedSquare: null,
    possibleMoves: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    canCastle: {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    },
    enPassantTarget: null,
    halfMoveClock: 0,
    fullMoveNumber: 1
  };
};

export const isSquareInBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

export const getSquare = (board: Square[][], row: number, col: number): Square | null => {
  if (!isSquareInBounds(row, col)) return null;
  return board[row][col];
};

export const isEmpty = (board: Square[][], row: number, col: number): boolean => {
  const square = getSquare(board, row, col);
  return square ? square.piece === null : true;
};

export const isEnemy = (board: Square[][], row: number, col: number, color: PieceColor): boolean => {
  const square = getSquare(board, row, col);
  return square && square.piece ? square.piece.color !== color : false;
};

export const isOwnPiece = (board: Square[][], row: number, col: number, color: PieceColor): boolean => {
  const square = getSquare(board, row, col);
  return square && square.piece ? square.piece.color === color : false;
};

export const findKing = (board: Square[][], color: PieceColor): { row: number; col: number } | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = board[row][col];
      if (square.piece && square.piece.type === 'king' && square.piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

export const isInCheck = (board: Square[][], color: PieceColor): boolean => {
  const king = findKing(board, color);
  if (!king) return false;

  const enemyColor = color === 'white' ? 'black' : 'white';
  
  // Check if any enemy piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = board[row][col];
      if (square.piece && square.piece.color === enemyColor) {
        // This is a simplified check - in a real implementation,
        // you'd use the move validation functions
        if (canPieceAttackSquare(board, row, col, king.row, king.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

export const canPieceAttackSquare = (board: Square[][], fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
  const piece = board[fromRow][fromCol].piece;
  if (!piece) return false;

  // This is a simplified implementation
  // In a real chess engine, you'd implement proper attack patterns for each piece
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  switch (piece.type) {
    case 'pawn':
      const direction = piece.color === 'white' ? -1 : 1;
      return (toRow === fromRow + direction) && 
             ((toCol === fromCol - 1) || (toCol === fromCol + 1));
    
    case 'rook':
      return (rowDiff === 0 || colDiff === 0) && isPathClear(board, fromRow, fromCol, toRow, toCol);
    
    case 'bishop':
      return (rowDiff === colDiff) && isPathClear(board, fromRow, fromCol, toRow, toCol);
    
    case 'queen':
      return ((rowDiff === 0 || colDiff === 0) || (rowDiff === colDiff)) && 
             isPathClear(board, fromRow, fromCol, toRow, toCol);
    
    case 'king':
      return rowDiff <= 1 && colDiff <= 1;
    
    case 'knight':
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    
    default:
      return false;
  }
};

export const isPathClear = (board: Square[][], fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
  const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
  const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
  
  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;
  
  while (currentRow !== toRow || currentCol !== toCol) {
    if (!isEmpty(board, currentRow, currentCol)) {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }
  
  return true;
};

export const isCheckmate = (board: Square[][], color: PieceColor): boolean => {
  if (!isInCheck(board, color)) return false;
  
  // Check if any legal moves exist for the current player
  // This is a simplified check - in a real implementation,
  // you'd generate all possible moves and check if any are legal
  return false; // Placeholder
};

export const isStalemate = (board: Square[][], color: PieceColor): boolean => {
  if (isInCheck(board, color)) return false;
  
  // Check if any legal moves exist for the current player
  // This is a simplified check - in a real implementation,
  // you'd generate all possible moves and check if any are legal
  return false; // Placeholder
};

export const updateGameStatus = (gameState: GameState): GameState => {
  const { board, currentPlayer } = gameState;
  
  const isCheck = isInCheck(board, currentPlayer);
  const isCheckmate = isCheckmate(board, currentPlayer);
  const isStalemate = isStalemate(board, currentPlayer);
  
  let gameStatus: GameState['gameStatus'] = 'playing';
  if (isCheckmate) {
    gameStatus = 'checkmate';
  } else if (isStalemate) {
    gameStatus = 'stalemate';
  } else if (isCheck) {
    gameStatus = 'check';
  }
  
  return {
    ...gameState,
    isCheck,
    isCheckmate,
    isStalemate,
    gameStatus
  };
};