import type { Piece, PieceColor } from '../types/chess';
import { PIECE_SYMBOLS } from '../utils/chessLogic';

interface PromotionModalProps {
  color: PieceColor;
  onSelect: (pieceType: Piece['type']) => void;
}

export default function PromotionModal({ color, onSelect }: PromotionModalProps) {
  const pieces: Array<Piece['type']> = ['queen', 'rook', 'bishop', 'knight'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Promote Pawn</h2>
        <div className="flex gap-4">
          {pieces.map(pieceType => (
            <button
              key={pieceType}
              onClick={() => onSelect(pieceType)}
              className="w-20 h-20 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition text-6xl border-2 border-gray-300 hover:border-blue-500"
            >
              {PIECE_SYMBOLS[`${color}-${pieceType}`]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
