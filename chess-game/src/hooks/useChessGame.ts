import React, { useState, useCallback, useMemo } from 'react';
import { GameState, GameSettings, Move, PieceType, PieceColor } from '../types/chess.types';
import { createInitialGameState, updateGameStatus, isInCheck } from '../utils/gameLogic';
import { generateAllMoves } from '../utils/moveGenerator';
import { isValidMove } from '../utils/moveValidation';
import { createAI } from '../utils/aiEngine';

export const useChessGame = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [settings, setSettings] = useState<GameSettings>({
    playerColor: 'white',
    difficulty: 'medium',
    soundEnabled: true,
    showLegalMoves: true,
    showCoordinates: true
  });
  const [isAITurn, setIsAITurn] = useState(false);
  const [promotionModal, setPromotionModal] = useState<{
    isOpen: boolean;
    move: Move | null;
  }>({ isOpen: false, move: null });

  const ai = useMemo(() => createAI(settings.difficulty), [settings.difficulty]);

  const makeMove = useCallback((move: Move) => {
    setGameState(prevState => {
      const newBoard = prevState.board.map(row => row.map(square => ({ ...square })));
      
      // Clear previous highlights
      newBoard.forEach(row => row.forEach(square => {
        square.isHighlighted = false;
        square.isSelected = false;
        square.isLastMove = false;
        square.isCheck = false;
      }));

      // Make the move
      const piece = { ...move.piece, hasMoved: true };
      newBoard[move.to.row][move.to.col].piece = piece;
      newBoard[move.from.row][move.from.col].piece = null;

      // Handle special moves
      if (move.isCastling) {
        handleCastling(newBoard, move);
      }

      if (move.isEnPassant) {
        handleEnPassant(newBoard, move);
      }

      // Handle promotion
      if (move.promotion) {
        newBoard[move.to.row][move.to.col].piece = {
          ...piece,
          type: move.promotion
        };
      }

      // Update captured pieces
      const capturedPieces = { ...prevState.capturedPieces };
      if (move.capturedPiece) {
        capturedPieces[move.capturedPiece.color].push(move.capturedPiece);
      }

      // Update move history
      const newMoveHistory = [...prevState.moveHistory, move];

      // Update game state
      const newGameState: GameState = {
        ...prevState,
        board: newBoard,
        currentPlayer: prevState.currentPlayer === 'white' ? 'black' : 'white',
        moveHistory: newMoveHistory,
        capturedPieces,
        selectedSquare: null,
        possibleMoves: [],
        halfMoveClock: move.capturedPiece || move.piece.type === 'pawn' ? 0 : prevState.halfMoveClock + 1,
        fullMoveNumber: prevState.currentPlayer === 'black' ? prevState.fullMoveNumber + 1 : prevState.fullMoveNumber,
        enPassantTarget: null
      };

      // Check for check/checkmate/stalemate
      const updatedGameState = updateGameStatus(newGameState);

      // Highlight last move
      updatedGameState.board[move.from.row][move.from.col].isLastMove = true;
      updatedGameState.board[move.to.row][move.to.col].isLastMove = true;

      return updatedGameState;
    });
  }, []);

  const handleCastling = (board: Square[][], move: Move) => {
    const isKingside = move.to.col > move.from.col;
    const rookFromCol = isKingside ? 7 : 0;
    const rookToCol = isKingside ? 5 : 3;
    
    const rook = board[move.from.row][rookFromCol].piece;
    if (rook) {
      board[move.from.row][rookToCol].piece = { ...rook, hasMoved: true };
      board[move.from.row][rookFromCol].piece = null;
    }
  };

  const handleEnPassant = (board: Square[][], move: Move) => {
    const capturedPawnRow = move.piece.color === 'white' ? move.to.row + 1 : move.to.row - 1;
    board[capturedPawnRow][move.to.col].piece = null;
  };

  const selectSquare = useCallback((row: number, col: number) => {
    if (isAITurn) return;

    setGameState(prevState => {
      const newBoard = prevState.board.map(row => row.map(square => ({ ...square })));
      
      // Clear previous highlights
      newBoard.forEach(row => row.forEach(square => {
        square.isHighlighted = false;
        square.isSelected = false;
      }));

      const square = newBoard[row][col];
      const piece = square.piece;

      // If clicking on own piece, select it
      if (piece && piece.color === prevState.currentPlayer) {
        square.isSelected = true;
        
        // Generate possible moves for this piece
        const possibleMoves = generateAllMoves(newBoard, prevState.currentPlayer, prevState.enPassantTarget)
          .filter(move => 
            move.from.row === row && 
            move.from.col === col &&
            isValidMove(newBoard, row, col, move.to.row, move.to.col, piece)
          );

        // Highlight possible moves
        possibleMoves.forEach(move => {
          newBoard[move.to.row][move.to.col].isHighlighted = true;
        });

        return {
          ...prevState,
          board: newBoard,
          selectedSquare: { row, col },
          possibleMoves: possibleMoves.map(move => move.to)
        };
      }

      // If clicking on a possible move, make the move
      if (prevState.selectedSquare && prevState.possibleMoves.some(move => move.row === row && move.col === col)) {
        const selectedPiece = newBoard[prevState.selectedSquare.row][prevState.selectedSquare.col].piece;
        if (selectedPiece) {
          const move: Move = {
            from: prevState.selectedSquare,
            to: { row, col },
            piece: selectedPiece,
            capturedPiece: square.piece || undefined,
            notation: generateMoveNotation(prevState.selectedSquare, { row, col }, selectedPiece, square.piece)
          };

          // Check for promotion
          if (selectedPiece.type === 'pawn' && (row === 0 || row === 7)) {
            setPromotionModal({ isOpen: true, move });
            return prevState;
          }

          makeMove(move);
          setIsAITurn(true);
        }
      }

      return {
        ...prevState,
        board: newBoard,
        selectedSquare: null,
        possibleMoves: []
      };
    });
  }, [isAITurn, makeMove]);

  const generateMoveNotation = (from: { row: number; col: number }, to: { row: number; col: number }, piece: Piece, capturedPiece?: Piece | null): string => {
    const fromFile = String.fromCharCode(97 + from.col);
    const fromRank = 8 - from.row;
    const toFile = String.fromCharCode(97 + to.col);
    const toRank = 8 - to.row;

    let notation = '';

    if (piece.type !== 'pawn') {
      notation += piece.type.toUpperCase();
    }

    if (capturedPiece) {
      if (piece.type === 'pawn') {
        notation += fromFile;
      }
      notation += 'x';
    }

    notation += toFile + toRank;

    return notation;
  };

  const handlePromotion = useCallback((pieceType: PieceType) => {
    if (promotionModal.move) {
      const moveWithPromotion = {
        ...promotionModal.move,
        promotion: pieceType
      };
      makeMove(moveWithPromotion);
      setIsAITurn(true);
    }
    setPromotionModal({ isOpen: false, move: null });
  }, [promotionModal.move, makeMove]);

  const cancelPromotion = useCallback(() => {
    setPromotionModal({ isOpen: false, move: null });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setIsAITurn(false);
    setPromotionModal({ isOpen: false, move: null });
  }, []);

  const startNewGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const undoMove = useCallback(() => {
    if (gameState.moveHistory.length === 0) return;

    setGameState(prevState => {
      const newMoveHistory = [...prevState.moveHistory];
      const lastMove = newMoveHistory.pop();

      if (!lastMove) return prevState;

      // Revert the board to previous state
      const newBoard = createInitialGameState().board;
      
      // Replay all moves except the last one
      for (let i = 0; i < newMoveHistory.length; i++) {
        const move = newMoveHistory[i];
        const piece = { ...move.piece, hasMoved: true };
        newBoard[move.to.row][move.to.col].piece = piece;
        newBoard[move.from.row][move.from.col].piece = null;
      }

      return {
        ...prevState,
        board: newBoard,
        moveHistory: newMoveHistory,
        currentPlayer: newMoveHistory.length % 2 === 0 ? 'white' : 'black',
        selectedSquare: null,
        possibleMoves: [],
        gameStatus: 'playing',
        isCheck: false,
        isCheckmate: false,
        isStalemate: false
      };
    });

    setIsAITurn(false);
  }, [gameState.moveHistory.length]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // AI move logic
  const makeAIMove = useCallback(async () => {
    if (!isAITurn || gameState.currentPlayer === settings.playerColor) return;

    try {
      const result = ai.getBestMove(gameState);
      if (result.bestMove) {
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        makeMove(result.bestMove);
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      setIsAITurn(false);
    }
  }, [isAITurn, gameState, settings.playerColor, ai, makeMove]);

  // Trigger AI move when it's AI's turn
  React.useEffect(() => {
    if (isAITurn && gameState.currentPlayer !== settings.playerColor) {
      makeAIMove();
    }
  }, [isAITurn, gameState.currentPlayer, settings.playerColor, makeAIMove]);

  return {
    gameState,
    settings,
    promotionModal,
    makeMove,
    selectSquare,
    handlePromotion,
    cancelPromotion,
    resetGame,
    startNewGame,
    undoMove,
    updateSettings,
    isAITurn
  };
};