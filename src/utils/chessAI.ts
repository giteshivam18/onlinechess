import type { Board, Position, GameState, Piece } from '../types/chess';
import { getLegalMoves, makeMove, getPieceAt } from './chessLogic';

const PIECE_VALUES: Record<Piece['type'], number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_TABLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

function getPieceSquareValue(piece: Piece, row: number, col: number): number {
  const adjustedRow = piece.color === 'white' ? row : 7 - row;

  switch (piece.type) {
    case 'pawn':
      return PAWN_TABLE[adjustedRow][col];
    case 'knight':
      return KNIGHT_TABLE[adjustedRow][col];
    case 'bishop':
      return BISHOP_TABLE[adjustedRow][col];
    case 'rook':
      return ROOK_TABLE[adjustedRow][col];
    case 'queen':
      return QUEEN_TABLE[adjustedRow][col];
    case 'king':
      return KING_TABLE[adjustedRow][col];
    default:
      return 0;
  }
}

function evaluateBoard(board: Board): number {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const materialValue = PIECE_VALUES[piece.type];
        const positionValue = getPieceSquareValue(piece, row, col);
        const totalValue = materialValue + positionValue;

        if (piece.color === 'black') {
          score += totalValue;
        } else {
          score -= totalValue;
        }
      }
    }
  }

  return score;
}

interface MinimaxResult {
  score: number;
  move: { from: Position; to: Position } | null;
}

function minimax(
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean
): MinimaxResult {
  if (depth === 0 || gameState.isCheckmate || gameState.isStalemate) {
    let score = evaluateBoard(gameState.board);

    if (gameState.isCheckmate) {
      score = maximizingPlayer ? -50000 : 50000;
    } else if (gameState.isStalemate) {
      score = 0;
    }

    if (gameState.isCheck) {
      score += maximizingPlayer ? -50 : 50;
    }

    return { score, move: null };
  }

  const allMoves: Array<{ from: Position; to: Position }> = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getPieceAt(gameState.board, { row, col });
      if (piece && piece.color === gameState.currentPlayer) {
        const legalMoves = getLegalMoves(
          gameState.board,
          { row, col },
          gameState.enPassantTarget,
          gameState.castlingRights
        );
        for (const to of legalMoves) {
          allMoves.push({ from: { row, col }, to });
        }
      }
    }
  }

  allMoves.sort((a, b) => {
    const captureA = getPieceAt(gameState.board, a.to) ? 1 : 0;
    const captureB = getPieceAt(gameState.board, b.to) ? 1 : 0;
    return captureB - captureA;
  });

  if (maximizingPlayer) {
    let maxScore = -Infinity;
    let bestMove = null;

    for (const move of allMoves) {
      const newGameState = makeMove(gameState, move.from, move.to);
      if (!newGameState) continue;

      const result = minimax(newGameState, depth - 1, alpha, beta, false);

      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }

      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) {
        break;
      }
    }

    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    let bestMove = null;

    for (const move of allMoves) {
      const newGameState = makeMove(gameState, move.from, move.to);
      if (!newGameState) continue;

      const result = minimax(newGameState, depth - 1, alpha, beta, true);

      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }

      beta = Math.min(beta, result.score);
      if (beta <= alpha) {
        break;
      }
    }

    return { score: minScore, move: bestMove };
  }
}

export function getBestMove(gameState: GameState, depth: number = 3): { from: Position; to: Position } | null {
  const result = minimax(gameState, depth, -Infinity, Infinity, true);
  return result.move;
}
