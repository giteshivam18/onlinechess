export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type SquareColor = 'light' | 'dark';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Square {
  row: number;
  col: number;
  piece: Piece | null;
  color: SquareColor;
  isHighlighted?: boolean;
  isSelected?: boolean;
  isLastMove?: boolean;
  isCheck?: boolean;
}

export interface Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
  piece: Piece;
  capturedPiece?: Piece;
  promotion?: PieceType;
  isCastling?: boolean;
  isEnPassant?: boolean;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isStalemate?: boolean;
  notation: string;
}

export interface GameState {
  board: Square[][];
  currentPlayer: PieceColor;
  moveHistory: Move[];
  capturedPieces: { white: Piece[]; black: Piece[] };
  gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';
  selectedSquare: { row: number; col: number } | null;
  possibleMoves: { row: number; col: number }[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  canCastle: {
    white: { kingside: boolean; queenside: boolean };
    black: { kingside: boolean; queenside: boolean };
  };
  enPassantTarget: { row: number; col: number } | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}

export interface GameSettings {
  playerColor: PieceColor;
  difficulty: 'easy' | 'medium' | 'hard';
  timeControl?: {
    white: number;
    black: number;
  };
  soundEnabled: boolean;
  showLegalMoves: boolean;
  showCoordinates: boolean;
}

export interface AIPlayer {
  color: PieceColor;
  difficulty: 'easy' | 'medium' | 'hard';
  isThinking: boolean;
}

export interface PromotionChoice {
  pieceType: PieceType;
  color: PieceColor;
}

export interface GameResult {
  winner: PieceColor | 'draw';
  reason: 'checkmate' | 'stalemate' | 'resignation' | 'timeout' | 'draw';
  moves: number;
  duration: number;
}

export type BoardPosition = Square[][];
export type MoveList = Move[];
export type PiecePosition = { row: number; col: number; piece: Piece };