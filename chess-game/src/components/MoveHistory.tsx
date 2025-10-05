import React from 'react';
import { Move } from '../types/chess.types';

interface MoveHistoryProps {
  moves: Move[];
  currentMove: number;
  onMoveClick?: (moveIndex: number) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentMove,
  onMoveClick
}) => {
  const formatMoveNumber = (index: number) => {
    return Math.floor(index / 2) + 1;
  };

  const formatMoveNotation = (move: Move) => {
    return move.notation;
  };

  const isCurrentMove = (index: number) => {
    return index === currentMove - 1;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Move History</h3>
      
      <div className="max-h-96 overflow-y-auto">
        {moves.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No moves yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-1 text-sm">
            {moves.map((move, index) => {
              const moveNumber = formatMoveNumber(index);
              const isWhiteMove = index % 2 === 0;
              const isCurrent = isCurrentMove(index);
              
              return (
                <div
                  key={index}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-blue-100 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  } ${isWhiteMove ? 'font-semibold' : ''}`}
                  onClick={() => onMoveClick?.(index)}
                >
                  <span className="text-gray-600">
                    {isWhiteMove ? `${moveNumber}.` : ''}
                  </span>
                  <span className={`ml-1 ${
                    move.isCheckmate ? 'text-red-600 font-bold' :
                    move.isCheck ? 'text-orange-600 font-semibold' :
                    move.capturedPiece ? 'text-green-600' :
                    'text-gray-800'
                  }`}>
                    {formatMoveNotation(move)}
                    {move.isCheckmate && '#'}
                    {move.isCheck && !move.isCheckmate && '+'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {moves.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total moves: {moves.length}</span>
            <span>Move {currentMove} of {moves.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};