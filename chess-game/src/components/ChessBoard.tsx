import React from 'react';
import { Square } from './Square';
import { Square as SquareType } from '../types/chess.types';

interface ChessBoardProps {
  board: SquareType[][];
  selectedSquare: { row: number; col: number } | null;
  possibleMoves: { row: number; col: number }[];
  onSquareClick: (row: number, col: number) => void;
  currentPlayer: 'white' | 'black';
  isCheck: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedSquare,
  possibleMoves,
  onSquareClick,
  currentPlayer,
  isCheck
}) => {
  const renderSquare = (row: number, col: number) => {
    const square = board[row][col];
    const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
    const isPossibleMove = possibleMoves.some(move => move.row === row && move.col === col);
    const isLastMove = square.isLastMove;
    const isInCheck = square.isCheck;

    return (
      <Square
        key={`${row}-${col}`}
        square={square}
        isSelected={isSelected}
        isPossibleMove={isPossibleMove}
        isLastMove={isLastMove}
        isInCheck={isInCheck}
        onClick={() => onSquareClick(row, col)}
        showCoordinates={true}
      />
    );
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
      <div className="grid grid-cols-8 gap-0 border-2 border-gray-600">
        {board.map((row, rowIndex) =>
          row.map((_, colIndex) => renderSquare(rowIndex, colIndex))
        )}
      </div>
      
      {/* Game status indicator */}
      <div className="mt-4 text-center">
        <div className={`text-lg font-semibold ${
          currentPlayer === 'white' ? 'text-white' : 'text-gray-300'
        }`}>
          {currentPlayer === 'white' ? 'White' : 'Black'} to move
        </div>
        {isCheck && (
          <div className="text-red-500 font-bold animate-pulse">
            CHECK!
          </div>
        )}
      </div>
    </div>
  );
};