import { Square, Piece, PieceColor, PieceType } from '../types/chess.types';
import { isEmpty, isEnemy, isOwnPiece, isInCheck, isPathClear } from './gameLogic';

export const isValidMove = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: Piece
): boolean => {
  // Basic bounds check
  if (fromRow < 0 || fromRow >= 8 || fromCol < 0 || fromCol >= 8 ||
      toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) {
    return false;
  }

  // Can't move to the same square
  if (fromRow === toRow && fromCol === toCol) {
    return false;
  }

  // Can't capture own piece
  if (isOwnPiece(board, toRow, toCol, piece.color)) {
    return false;
  }

  // Check piece-specific movement rules
  if (!isValidPieceMove(board, fromRow, fromCol, toRow, toCol, piece)) {
    return false;
  }

  // Check if move would put own king in check
  if (wouldMovePutKingInCheck(board, fromRow, fromCol, toRow, toCol, piece)) {
    return false;
  }

  return true;
};

export const isValidPieceMove = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: Piece
): boolean => {
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const absRowDiff = Math.abs(rowDiff);
  const absColDiff = Math.abs(colDiff);

  switch (piece.type) {
    case 'pawn':
      return isValidPawnMove(board, fromRow, fromCol, toRow, toCol, piece);
    
    case 'rook':
      return isValidRookMove(board, fromRow, fromCol, toRow, toCol);
    
    case 'knight':
      return isValidKnightMove(fromRow, fromCol, toRow, toCol);
    
    case 'bishop':
      return isValidBishopMove(board, fromRow, fromCol, toRow, toCol);
    
    case 'queen':
      return isValidQueenMove(board, fromRow, fromCol, toRow, toCol);
    
    case 'king':
      return isValidKingMove(board, fromRow, fromCol, toRow, toCol, piece);
    
    default:
      return false;
  }
};

export const isValidPawnMove = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: Piece
): boolean => {
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  // Forward move
  if (colDiff === 0) {
    // One square forward
    if (rowDiff === direction && isEmpty(board, toRow, toCol)) {
      return true;
    }
    // Two squares forward from starting position
    if (rowDiff === 2 * direction && fromRow === startRow && 
        isEmpty(board, toRow, toCol) && isEmpty(board, fromRow + direction, fromCol)) {
      return true;
    }
  }
  // Diagonal capture
  else if (Math.abs(colDiff) === 1 && rowDiff === direction) {
    return isEnemy(board, toRow, toCol, piece.color);
  }

  return false;
};

export const isValidRookMove = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean => {
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  // Must move in a straight line
  if (rowDiff !== 0 && colDiff !== 0) {
    return false;
  }

  // Path must be clear
  return isPathClear(board, fromRow, fromCol, toRow, toCol);
};

export const isValidKnightMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean => {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // Knight moves in L-shape
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

export const isValidBishopMove = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean => {
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  // Must move diagonally
  if (Math.abs(rowDiff) !== Math.abs(colDiff)) {
    return false;
  }

  // Path must be clear
  return isPathClear(board, fromRow, fromCol, toRow, toCol);
};

export const isValidQueenMove = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean => {
  // Queen combines rook and bishop moves
  return isValidRookMove(board, fromRow, fromCol, toRow, toCol) ||
         isValidBishopMove(board, fromRow, fromCol, toRow, toCol);
};

export const isValidKingMove = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: Piece
): boolean => {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // King moves one square in any direction
  if (rowDiff <= 1 && colDiff <= 1) {
    return true;
  }

  // Castling (simplified - would need more complex logic in real implementation)
  if (rowDiff === 0 && colDiff === 2 && !piece.hasMoved) {
    return isValidCastling(board, fromRow, fromCol, toRow, toCol, piece.color);
  }

  return false;
};

export const isValidCastling = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  color: PieceColor
): boolean => {
  // Simplified castling validation
  // In a real implementation, you'd check:
  // - King and rook haven't moved
  // - No pieces between king and rook
  // - King not in check
  // - King doesn't pass through check
  
  const isKingside = toCol > fromCol;
  const rookCol = isKingside ? 7 : 0;
  const rook = board[fromRow][rookCol].piece;
  
  if (!rook || rook.type !== 'rook' || rook.color !== color || rook.hasMoved) {
    return false;
  }

  // Check if path is clear
  const startCol = Math.min(fromCol, rookCol) + 1;
  const endCol = Math.max(fromCol, rookCol);
  
  for (let col = startCol; col < endCol; col++) {
    if (!isEmpty(board, fromRow, col)) {
      return false;
    }
  }

  return true;
};

export const wouldMovePutKingInCheck = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: Piece
): boolean => {
  // Create a temporary board with the move made
  const tempBoard = board.map(row => row.map(square => ({ ...square })));
  const capturedPiece = tempBoard[toRow][toCol].piece;
  
  // Make the move
  tempBoard[toRow][toCol].piece = piece;
  tempBoard[fromRow][fromCol].piece = null;
  
  // Check if king is in check
  return isInCheck(tempBoard, piece.color);
};

export const isEnPassantMove = (
  board: Square[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: Piece,
  enPassantTarget: { row: number; col: number } | null
): boolean => {
  if (piece.type !== 'pawn' || !enPassantTarget) {
    return false;
  }

  const direction = piece.color === 'white' ? -1 : 1;
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  return (rowDiff === direction && 
          Math.abs(colDiff) === 1 && 
          toRow === enPassantTarget.row && 
          toCol === enPassantTarget.col);
};

export const isPromotionMove = (
  fromRow: number,
  toRow: number,
  piece: Piece
): boolean => {
  if (piece.type !== 'pawn') {
    return false;
  }

  const promotionRow = piece.color === 'white' ? 0 : 7;
  return toRow === promotionRow;
};