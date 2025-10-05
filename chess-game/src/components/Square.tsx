import React from 'react';
import { Piece } from './Piece';
import { Square as SquareType } from '../types/chess.types';

interface SquareProps {
  square: SquareType;
  isSelected: boolean;
  isPossibleMove: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  onClick: () => void;
  showCoordinates?: boolean;
}

export const Square: React.FC<SquareProps> = ({
  square,
  isSelected,
  isPossibleMove,
  isLastMove,
  isInCheck,
  onClick,
  showCoordinates = false
}) => {
  const getSquareClasses = () => {
    const baseClasses = 'chess-square w-16 h-16 relative';
    const colorClass = square.color === 'light' ? 'light' : 'dark';
    const selectedClass = isSelected ? 'selected' : '';
    const highlightedClass = isPossibleMove ? 'highlighted' : '';
    const lastMoveClass = isLastMove ? 'last-move' : '';
    const checkClass = isInCheck ? 'check' : '';

    return [
      baseClasses,
      colorClass,
      selectedClass,
      highlightedClass,
      lastMoveClass,
      checkClass
    ].filter(Boolean).join(' ');
  };

  const getCoordinateLabel = () => {
    if (!showCoordinates) return null;
    
    const isCorner = (square.row === 0 || square.row === 7) && 
                    (square.col === 0 || square.col === 7);
    
    if (!isCorner) return null;

    const file = String.fromCharCode(97 + square.col); // a-h
    const rank = 8 - square.row; // 1-8

    return (
      <div className="absolute text-xs font-bold pointer-events-none">
        {square.row === 7 && square.col === 0 && (
          <span className="absolute bottom-0 left-1 text-gray-600">{file}</span>
        )}
        {square.row === 7 && square.col === 7 && (
          <span className="absolute bottom-0 right-1 text-gray-600">{rank}</span>
        )}
        {square.row === 0 && square.col === 0 && (
          <span className="absolute top-0 left-1 text-gray-600">{file}</span>
        )}
        {square.row === 0 && square.col === 7 && (
          <span className="absolute top-0 right-1 text-gray-600">{rank}</span>
        )}
      </div>
    );
  };

  const renderMoveIndicator = () => {
    if (!isPossibleMove) return null;

    const hasPiece = square.piece !== null;
    
    return (
      <div className={`move-indicator ${hasPiece ? 'capture' : ''}`} />
    );
  };

  return (
    <div
      className={getSquareClasses()}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {square.piece && (
        <Piece
          piece={square.piece}
          isSelected={isSelected}
        />
      )}
      
      {renderMoveIndicator()}
      {getCoordinateLabel()}
    </div>
  );
};