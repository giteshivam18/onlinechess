import { Square, Piece, PieceColor, Move, GameState } from '../types/chess.types';
import { generateAllMoves } from './moveGenerator';
import { isInCheck, isCheckmate, isStalemate } from './gameLogic';

export interface AIPlayer {
  color: PieceColor;
  difficulty: 'easy' | 'medium' | 'hard';
  isThinking: boolean;
}

export interface EvaluationResult {
  score: number;
  bestMove: Move | null;
  nodesEvaluated: number;
  depth: number;
}

// Piece values for evaluation
const PIECE_VALUES: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

// Position values for each piece type
const POSITION_VALUES: Record<string, number[][]> = {
  pawn: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  knight: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  bishop: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  rook: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  queen: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  king: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

export class ChessAI {
  private maxDepth: number;
  private nodesEvaluated: number = 0;

  constructor(difficulty: 'easy' | 'medium' | 'hard') {
    this.maxDepth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
  }

  public getBestMove(gameState: GameState): EvaluationResult {
    this.nodesEvaluated = 0;
    const startTime = Date.now();

    const result = this.minimax(
      gameState.board,
      this.maxDepth,
      -Infinity,
      Infinity,
      gameState.currentPlayer === 'white',
      gameState
    );

    const endTime = Date.now();
    console.log(`AI evaluated ${this.nodesEvaluated} nodes in ${endTime - startTime}ms`);

    return {
      score: result.score,
      bestMove: result.bestMove,
      nodesEvaluated: this.nodesEvaluated,
      depth: this.maxDepth
    };
  }

  private minimax(
    board: Square[][],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    gameState: GameState
  ): { score: number; bestMove: Move | null } {
    this.nodesEvaluated++;

    // Base case: depth 0 or terminal position
    if (depth === 0) {
      return { score: this.evaluatePosition(board, gameState.currentPlayer), bestMove: null };
    }

    const moves = generateAllMoves(board, gameState.currentPlayer, gameState.enPassantTarget);
    
    if (moves.length === 0) {
      // No legal moves - check for checkmate or stalemate
      if (isInCheck(board, gameState.currentPlayer)) {
        return { score: isMaximizing ? -20000 : 20000, bestMove: null };
      } else {
        return { score: 0, bestMove: null }; // Stalemate
      }
    }

    let bestMove: Move | null = null;
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      // Make the move
      const newBoard = this.makeMove(board, move);
      const newGameState = { ...gameState, board: newBoard, currentPlayer: gameState.currentPlayer === 'white' ? 'black' : 'white' as PieceColor };

      // Recursive call
      const result = this.minimax(newBoard, depth - 1, alpha, beta, !isMaximizing, newGameState);

      if (isMaximizing) {
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        alpha = Math.max(alpha, result.score);
      } else {
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        beta = Math.min(beta, result.score);
      }

      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }

    return { score: bestScore, bestMove };
  }

  private evaluatePosition(board: Square[][], currentPlayer: PieceColor): number {
    let score = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = board[row][col];
        if (square.piece) {
          const pieceValue = this.getPieceValue(square.piece, row, col);
          score += square.piece.color === currentPlayer ? pieceValue : -pieceValue;
        }
      }
    }

    // Add positional bonuses
    score += this.evaluatePositionalFactors(board, currentPlayer);

    return score;
  }

  private getPieceValue(piece: Piece, row: number, col: number): number {
    const baseValue = PIECE_VALUES[piece.type];
    const positionValue = this.getPositionValue(piece, row, col);
    return baseValue + positionValue;
  }

  private getPositionValue(piece: Piece, row: number, col: number): number {
    const positionTable = POSITION_VALUES[piece.type];
    const actualRow = piece.color === 'white' ? 7 - row : row;
    return positionTable[actualRow][col];
  }

  private evaluatePositionalFactors(board: Square[][], currentPlayer: PieceColor): number {
    let score = 0;

    // Center control
    const centerSquares = [
      [3, 3], [3, 4], [4, 3], [4, 4]
    ];

    for (const [row, col] of centerSquares) {
      const square = board[row][col];
      if (square.piece && square.piece.color === currentPlayer) {
        score += 10;
      } else if (square.piece && square.piece.color !== currentPlayer) {
        score -= 10;
      }
    }

    // King safety (simplified)
    const king = this.findKing(board, currentPlayer);
    if (king) {
      const kingRow = king.row;
      const kingCol = king.col;
      
      // Penalize king in center during opening/middlegame
      if (kingRow >= 2 && kingRow <= 5 && kingCol >= 2 && kingCol <= 5) {
        score -= 20;
      }
    }

    return score;
  }

  private findKing(board: Square[][], color: PieceColor): { row: number; col: number } | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = board[row][col];
        if (square.piece && square.piece.type === 'king' && square.piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  private makeMove(board: Square[][], move: Move): Square[][] {
    const newBoard = board.map(row => row.map(square => ({ ...square })));
    
    // Move the piece
    newBoard[move.to.row][move.to.col].piece = { ...move.piece, hasMoved: true };
    newBoard[move.from.row][move.from.col].piece = null;

    // Handle castling
    if (move.isCastling) {
      const rookFromCol = move.to.col > move.from.col ? 7 : 0;
      const rookToCol = move.to.col > move.from.col ? 5 : 3;
      const rook = newBoard[move.from.row][rookFromCol].piece;
      
      if (rook) {
        newBoard[move.from.row][rookToCol].piece = { ...rook, hasMoved: true };
        newBoard[move.from.row][rookFromCol].piece = null;
      }
    }

    return newBoard;
  }
}

export const createAI = (difficulty: 'easy' | 'medium' | 'hard'): ChessAI => {
  return new ChessAI(difficulty);
};