import { Square, Piece, PieceColor, Move } from '../types/chess.types';
import { isValidMove, isEnPassantMove, isPromotionMove } from './moveValidation';
import { isEmpty, isEnemy, isOwnPiece } from './gameLogic';

export const generateAllMoves = (
  board: Square[][],
  color: PieceColor,
  enPassantTarget: { row: number; col: number } | null = null
): Move[] => {
  const moves: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = board[row][col];
      if (square.piece && square.piece.color === color) {
        const pieceMoves = generateMovesForPiece(board, row, col, square.piece, enPassantTarget);
        moves.push(...pieceMoves);
      }
    }
  }

  return moves;
};

export const generateMovesForPiece = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  piece: Piece,
  enPassantTarget: { row: number; col: number } | null = null
): Move[] => {
  const moves: Move[] = [];

  switch (piece.type) {
    case 'pawn':
      moves.push(...generatePawnMoves(board, fromRow, fromCol, piece, enPassantTarget));
      break;
    case 'rook':
      moves.push(...generateRookMoves(board, fromRow, fromCol, piece));
      break;
    case 'knight':
      moves.push(...generateKnightMoves(board, fromRow, fromCol, piece));
      break;
    case 'bishop':
      moves.push(...generateBishopMoves(board, fromRow, fromCol, piece));
      break;
    case 'queen':
      moves.push(...generateQueenMoves(board, fromRow, fromCol, piece));
      break;
    case 'king':
      moves.push(...generateKingMoves(board, fromRow, fromCol, piece));
      break;
  }

  return moves;
};

export const generatePawnMoves = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  piece: Piece,
  enPassantTarget: { row: number; col: number } | null = null
): Move[] => {
  const moves: Move[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;

  // Forward moves
  const oneSquareForward = fromRow + direction;
  if (oneSquareForward >= 0 && oneSquareForward < 8 && isEmpty(board, oneSquareForward, fromCol)) {
    moves.push(...createPawnMoves(board, fromRow, fromCol, oneSquareForward, fromCol, piece));
  }

  // Two squares forward from starting position
  const twoSquaresForward = fromRow + 2 * direction;
  if (fromRow === startRow && 
      twoSquaresForward >= 0 && twoSquaresForward < 8 && 
      isEmpty(board, twoSquaresForward, fromCol) && 
      isEmpty(board, oneSquareForward, fromCol)) {
    moves.push(...createPawnMoves(board, fromRow, fromCol, twoSquaresForward, fromCol, piece));
  }

  // Diagonal captures
  for (const colOffset of [-1, 1]) {
    const toCol = fromCol + colOffset;
    const toRow = fromRow + direction;
    
    if (toCol >= 0 && toCol < 8 && toRow >= 0 && toRow < 8) {
      if (isEnemy(board, toRow, toCol, piece.color)) {
        moves.push(...createPawnMoves(board, fromRow, fromCol, toRow, toCol, piece));
      }
    }
  }

  // En passant
  if (enPassantTarget && isEnPassantMove(board, fromRow, fromCol, enPassantTarget.row, enPassantTarget.col, piece, enPassantTarget)) {
    moves.push(...createPawnMoves(board, fromRow, fromCol, enPassantTarget.row, enPassantTarget.col, piece));
  }

  return moves;
};

export const createPawnMoves = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: Piece
): Move[] => {
  const moves: Move[] = [];

  if (isPromotionMove(fromRow, toRow, piece)) {
    // Generate promotion moves for all piece types
    const promotionPieces: Array<Piece['type']> = ['queen', 'rook', 'bishop', 'knight'];
    
    for (const promotionType of promotionPieces) {
      const move: Move = {
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece,
        capturedPiece: board[toRow][toCol].piece || undefined,
        promotion: promotionType,
        notation: generateMoveNotation(board, fromRow, fromCol, toRow, toCol, piece, promotionType)
      };
      moves.push(move);
    }
  } else {
    const move: Move = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece,
      capturedPiece: board[toRow][toCol].piece || undefined,
      notation: generateMoveNotation(board, fromRow, fromCol, toRow, toCol, piece)
    };
    moves.push(move);
  }

  return moves;
};

export const generateRookMoves = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  piece: Piece
): Move[] => {
  const moves: Move[] = [];
  const directions = [
    { row: -1, col: 0 },  // up
    { row: 1, col: 0 },   // down
    { row: 0, col: -1 },  // left
    { row: 0, col: 1 }    // right
  ];

  for (const direction of directions) {
    let toRow = fromRow + direction.row;
    let toCol = fromCol + direction.col;

    while (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) {
      if (isEmpty(board, toRow, toCol)) {
        moves.push(createMove(board, fromRow, fromCol, toRow, toCol, piece));
      } else if (isEnemy(board, toRow, toCol, piece.color)) {
        moves.push(createMove(board, fromRow, fromCol, toRow, toCol, piece));
        break;
      } else {
        break;
      }

      toRow += direction.row;
      toCol += direction.col;
    }
  }

  return moves;
};

export const generateKnightMoves = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  piece: Piece
): Move[] => {
  const moves: Move[] = [];
  const knightMoves = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 },  { row: 1, col: 2 },
    { row: 2, col: -1 },  { row: 2, col: 1 }
  ];

  for (const move of knightMoves) {
    const toRow = fromRow + move.row;
    const toCol = fromCol + move.col;

    if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) {
      if (isEmpty(board, toRow, toCol) || isEnemy(board, toRow, toCol, piece.color)) {
        moves.push(createMove(board, fromRow, fromCol, toRow, toCol, piece));
      }
    }
  }

  return moves;
};

export const generateBishopMoves = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  piece: Piece
): Move[] => {
  const moves: Move[] = [];
  const directions = [
    { row: -1, col: -1 },  // up-left
    { row: -1, col: 1 },   // up-right
    { row: 1, col: -1 },   // down-left
    { row: 1, col: 1 }     // down-right
  ];

  for (const direction of directions) {
    let toRow = fromRow + direction.row;
    let toCol = fromCol + direction.col;

    while (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) {
      if (isEmpty(board, toRow, toCol)) {
        moves.push(createMove(board, fromRow, fromCol, toRow, toCol, piece));
      } else if (isEnemy(board, toRow, toCol, piece.color)) {
        moves.push(createMove(board, fromRow, fromCol, toRow, toCol, piece));
        break;
      } else {
        break;
      }

      toRow += direction.row;
      toCol += direction.col;
    }
  }

  return moves;
};

export const generateQueenMoves = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  piece: Piece
): Move[] => {
  // Queen combines rook and bishop moves
  return [
    ...generateRookMoves(board, fromRow, fromCol, piece),
    ...generateBishopMoves(board, fromRow, fromCol, piece)
  ];
};

export const generateKingMoves = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  piece: Piece
): Move[] => {
  const moves: Move[] = [];
  const kingMoves = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 },                       { row: 0, col: 1 },
    { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
  ];

  for (const move of kingMoves) {
    const toRow = fromRow + move.row;
    const toCol = fromCol + move.col;

    if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) {
      if (isEmpty(board, toRow, toCol) || isEnemy(board, toRow, toCol, piece.color)) {
        moves.push(createMove(board, fromRow, fromCol, toRow, toCol, piece));
      }
    }
  }

  // Castling moves (simplified)
  if (!piece.hasMoved) {
    // Kingside castling
    if (board[fromRow][7].piece?.type === 'rook' && 
        board[fromRow][7].piece?.color === piece.color && 
        !board[fromRow][7].piece?.hasMoved) {
      if (isEmpty(board, fromRow, 5) && isEmpty(board, fromRow, 6)) {
        moves.push(createMove(board, fromRow, fromCol, fromRow, 6, piece, true));
      }
    }

    // Queenside castling
    if (board[fromRow][0].piece?.type === 'rook' && 
        board[fromRow][0].piece?.color === piece.color && 
        !board[fromRow][0].piece?.hasMoved) {
      if (isEmpty(board, fromRow, 1) && isEmpty(board, fromRow, 2) && isEmpty(board, fromRow, 3)) {
        moves.push(createMove(board, fromRow, fromCol, fromRow, 2, piece, true));
      }
    }
  }

  return moves;
};

export const createMove = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: Piece,
  isCastling: boolean = false
): Move => {
  return {
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
    piece,
    capturedPiece: board[toRow][toCol].piece || undefined,
    isCastling,
    notation: generateMoveNotation(board, fromRow, fromCol, toRow, toCol, piece)
  };
};

export const generateMoveNotation = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: Piece,
  promotion?: Piece['type']
): string => {
  const fromFile = String.fromCharCode(97 + fromCol);
  const fromRank = 8 - fromRow;
  const toFile = String.fromCharCode(97 + toCol);
  const toRank = 8 - toRow;

  let notation = '';

  if (piece.type !== 'pawn') {
    notation += piece.type.toUpperCase();
  }

  if (board[toRow][toCol].piece) {
    if (piece.type === 'pawn') {
      notation += fromFile;
    }
    notation += 'x';
  }

  notation += toFile + toRank;

  if (promotion) {
    notation += '=' + promotion.toUpperCase();
  }

  return notation;
};