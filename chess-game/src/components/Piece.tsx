import React from 'react';
import { Piece as PieceType } from '../types/chess.types';

interface PieceProps {
  piece: PieceType;
  isSelected?: boolean;
  isAnimating?: boolean;
}

export const Piece: React.FC<PieceProps> = ({
  piece,
  isSelected = false,
  isAnimating = false
}) => {
  const getPieceSymbol = (type: string, color: string) => {
    const symbols: Record<string, Record<string, string>> = {
      white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
      }
    };

    return symbols[color]?.[type] || '?';
  };

  const getPieceClasses = () => {
    const baseClasses = 'chess-piece text-4xl font-bold select-none';
    const colorClass = piece.color === 'white' ? 'white' : 'black';
    const selectedClass = isSelected ? 'ring-2 ring-blue-400 ring-opacity-75' : '';
    const animatingClass = isAnimating ? 'animate-pulse' : '';

    return [
      baseClasses,
      colorClass,
      selectedClass,
      animatingClass
    ].filter(Boolean).join(' ');
  };

  return (
    <div className={getPieceClasses()}>
      {getPieceSymbol(piece.type, piece.color)}
    </div>
  );
};