import type { Piece } from '../types/chess';
import { PIECE_SYMBOLS } from '../utils/chessLogic';

interface SquareProps {
  piece: Piece | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  onClick: () => void;
}

export default function Square({
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isLastMove,
  isCheck,
  onClick,
}: SquareProps) {
  let bgColor = isLight ? 'bg-[#F0D9B5]' : 'bg-[#B58863]';

  if (isLastMove) {
    bgColor = 'bg-yellow-300';
  } else if (isSelected) {
    bgColor = 'bg-green-400';
  }

  return (
    <div
      className={`w-[60px] h-[60px] flex items-center justify-center cursor-pointer relative transition-all duration-300 ${bgColor} hover:opacity-80`}
      onClick={onClick}
    >
      {piece && (
        <div
          className={`text-5xl select-none transition-transform duration-300 ${
            isCheck ? 'animate-pulse' : ''
          }`}
          style={{
            filter: isCheck ? 'drop-shadow(0 0 8px red)' : 'none',
          }}
        >
          {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
        </div>
      )}
      {isLegalMove && (
        <div
          className={`absolute ${
            piece ? 'w-14 h-14 border-4 border-green-500 rounded-full' : 'w-4 h-4 bg-green-500 rounded-full'
          }`}
        />
      )}
      {isCheck && (
        <div className="absolute inset-0 border-4 border-red-600 rounded pointer-events-none animate-pulse" />
      )}
    </div>
  );
}
