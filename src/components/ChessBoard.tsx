import { useState, useEffect } from 'react';
import type { GameState, Position, Difficulty, Piece } from '../types/chess';
import { createInitialBoard, getLegalMoves, makeMove, PIECE_SYMBOLS, shouldPromotePawn, promotePawn } from '../utils/chessLogic';
import { getBestMove } from '../utils/chessAI';
import { audioSystem } from '../utils/audioSystem';
import Square from './Square';
import PromotionModal from './PromotionModal';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface ChessBoardProps {
  difficulty: Difficulty;
  soundEnabled: boolean;
}

export default function ChessBoard({ difficulty, soundEnabled }: ChessBoardProps) {
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedSquare: null,
    legalMoves: [],
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    lastMove: null,
    enPassantTarget: null,
    castlingRights: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
  });

  const [isAIThinking, setIsAIThinking] = useState(false);
  const [promotionSquare, setPromotionSquare] = useState<Position | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  useEffect(() => {
    audioSystem.setMuted(!soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (gameState.isCheckmate || gameState.isStalemate) {
      setShowGameOverModal(true);
    }
  }, [gameState.isCheckmate, gameState.isStalemate]);

  useEffect(() => {
    if (gameState.currentPlayer === 'black' && !gameState.isCheckmate && !gameState.isStalemate && !promotionSquare) {
      setIsAIThinking(true);
      setTimeout(() => {
        makeAIMove();
      }, 500);
    }
  }, [gameState.currentPlayer, gameState.isCheckmate, gameState.isStalemate, promotionSquare]);

  const makeAIMove = () => {
    const depthMap = { easy: 2, medium: 3, hard: 4 };
    const depth = depthMap[difficulty];
    const bestMove = getBestMove(gameState, depth);

    if (bestMove) {
      const newGameState = makeMove(gameState, bestMove.from, bestMove.to);
      if (newGameState) {
        const move = newGameState.lastMove;
        if (move?.isCastling) {
          audioSystem.playSound('castle');
        } else if (move?.capturedPiece) {
          audioSystem.playSound('capture');
        } else {
          audioSystem.playSound('move');
        }

        if (newGameState.isCheckmate) {
          audioSystem.playSound('checkmate');
        } else if (newGameState.isCheck) {
          audioSystem.playSound('check');
        }

        if (shouldPromotePawn(newGameState.board, bestMove.to)) {
          const promoted = promotePawn(newGameState, bestMove.to, 'queen');
          setGameState(promoted);
        } else {
          setGameState(newGameState);
        }
      }
    }
    setIsAIThinking(false);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameState.currentPlayer === 'black' || isAIThinking || gameState.isCheckmate || gameState.isStalemate) {
      return;
    }

    const clickedPiece = gameState.board[row][col];

    if (gameState.selectedSquare) {
      const isLegalMove = gameState.legalMoves.some(
        move => move.row === row && move.col === col
      );

      if (isLegalMove) {
        const newGameState = makeMove(gameState, gameState.selectedSquare, { row, col });
        if (newGameState) {
          const move = newGameState.lastMove;
          if (move?.isCastling) {
            audioSystem.playSound('castle');
          } else if (move?.capturedPiece) {
            audioSystem.playSound('capture');
          } else {
            audioSystem.playSound('move');
          }

          if (newGameState.isCheckmate) {
            audioSystem.playSound('checkmate');
          } else if (newGameState.isCheck) {
            audioSystem.playSound('check');
          }

          if (shouldPromotePawn(newGameState.board, { row, col })) {
            setPromotionSquare({ row, col });
            setGameState(newGameState);
          } else {
            setGameState(newGameState);
          }
        } else {
          audioSystem.playSound('illegal');
        }
      } else if (clickedPiece && clickedPiece.color === gameState.currentPlayer) {
        const legalMoves = getLegalMoves(
          gameState.board,
          { row, col },
          gameState.enPassantTarget,
          gameState.castlingRights
        );
        setGameState({
          ...gameState,
          selectedSquare: { row, col },
          legalMoves,
        });
      } else {
        audioSystem.playSound('illegal');
        setGameState({
          ...gameState,
          selectedSquare: null,
          legalMoves: [],
        });
      }
    } else if (clickedPiece && clickedPiece.color === gameState.currentPlayer) {
      const legalMoves = getLegalMoves(
        gameState.board,
        { row, col },
        gameState.enPassantTarget,
        gameState.castlingRights
      );
      setGameState({
        ...gameState,
        selectedSquare: { row, col },
        legalMoves,
      });
    }
  };

  const handlePromotion = (pieceType: Piece['type']) => {
    if (promotionSquare) {
      const promoted = promotePawn(gameState, promotionSquare, pieceType);
      setGameState(promoted);
      setPromotionSquare(null);
    }
  };

  const handleNewGame = () => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedSquare: null,
      legalMoves: [],
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      lastMove: null,
      enPassantTarget: null,
      castlingRights: {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: true,
        blackQueenSide: true,
      },
    });
    setShowGameOverModal(false);
  };

  const isSquareLight = (row: number, col: number) => (row + col) % 2 === 0;
  const isSquareSelected = (row: number, col: number) =>
    gameState.selectedSquare?.row === row && gameState.selectedSquare?.col === col;
  const isSquareLegalMove = (row: number, col: number) =>
    gameState.legalMoves.some(move => move.row === row && move.col === col);
  const isSquareLastMove = (row: number, col: number) =>
    (gameState.lastMove?.from.row === row && gameState.lastMove?.from.col === col) ||
    (gameState.lastMove?.to.row === row && gameState.lastMove?.to.col === col);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            {isAIThinking ? (
              <span className="text-blue-600 animate-pulse">Computer is thinking...</span>
            ) : (
              <span>
                {gameState.currentPlayer === 'white' ? 'White' : 'Black'} to move
              </span>
            )}
          </div>
          {gameState.isCheck && !gameState.isCheckmate && (
            <div className="text-red-600 font-bold text-lg">CHECK!</div>
          )}
        </div>

        <div className="flex gap-2 mb-2">
          <div className="text-sm font-semibold">Captured by White:</div>
          <div className="flex gap-1">
            {gameState.capturedPieces.white.map((piece, idx) => (
              <span key={idx} className="text-lg">
                {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
              </span>
            ))}
          </div>
        </div>

        <div className="relative inline-block">
          <div className="absolute -left-6 top-0 flex flex-col justify-around h-full text-sm font-semibold text-gray-600">
            {RANKS.map(rank => (
              <div key={rank} className="h-[60px] flex items-center">
                {rank}
              </div>
            ))}
          </div>

          <div className="border-4 border-gray-800 rounded-lg shadow-2xl overflow-hidden">
            {gameState.board.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((piece, colIdx) => (
                  <Square
                    key={`${rowIdx}-${colIdx}`}
                    piece={piece}
                    isLight={isSquareLight(rowIdx, colIdx)}
                    isSelected={isSquareSelected(rowIdx, colIdx)}
                    isLegalMove={isSquareLegalMove(rowIdx, colIdx)}
                    isLastMove={isSquareLastMove(rowIdx, colIdx)}
                    isCheck={gameState.isCheck && piece?.type === 'king' && piece?.color === gameState.currentPlayer}
                    onClick={() => handleSquareClick(rowIdx, colIdx)}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="absolute -bottom-6 left-0 flex justify-around w-full text-sm font-semibold text-gray-600">
            {FILES.map(file => (
              <div key={file} className="w-[60px] text-center">
                {file}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <div className="text-sm font-semibold">Captured by Black:</div>
          <div className="flex gap-1">
            {gameState.capturedPieces.black.map((piece, idx) => (
              <span key={idx} className="text-lg">
                {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-64">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-bold text-lg mb-3">Move History</h3>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded p-2">
            {gameState.moveHistory.length === 0 ? (
              <div className="text-gray-400 text-sm">No moves yet</div>
            ) : (
              <div className="space-y-1">
                {gameState.moveHistory.map((move, idx) => (
                  <div key={idx} className="text-sm flex gap-2">
                    <span className="font-semibold text-gray-600 w-8">{Math.floor(idx / 2) + 1}.</span>
                    <span className={idx % 2 === 0 ? 'text-gray-900' : 'text-gray-700'}>
                      {move.notation}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {promotionSquare && (
        <PromotionModal
          color={gameState.board[promotionSquare.row][promotionSquare.col]?.color || 'white'}
          onSelect={handlePromotion}
        />
      )}

      {showGameOverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-center">
              {gameState.isCheckmate ? 'Checkmate!' : 'Stalemate!'}
            </h2>
            <p className="text-xl text-center mb-6">
              {gameState.isCheckmate
                ? `${gameState.currentPlayer === 'white' ? 'Black' : 'White'} wins!`
                : "It's a draw!"}
            </p>
            <button
              onClick={handleNewGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
