import React from 'react';
import { Piece, PieceType, PieceColor } from '../types/chess.types';

interface PromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onPromote: (pieceType: PieceType) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  color,
  onPromote,
  onCancel
}) => {
  if (!isOpen) return null;

  const promotionPieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

  const getPieceSymbol = (type: PieceType, pieceColor: PieceColor) => {
    const symbols: Record<string, Record<string, string>> = {
      white: {
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘'
      },
      black: {
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞'
      }
    };

    return symbols[pieceColor]?.[type] || '?';
  };

  const getPieceName = (type: PieceType) => {
    const names: Record<PieceType, string> = {
      queen: 'Queen',
      rook: 'Rook',
      bishop: 'Bishop',
      knight: 'Knight'
    };

    return names[type];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Promote Pawn
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          Choose a piece to promote your pawn to:
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {promotionPieces.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onPromote(pieceType)}
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-center">
                <div className={`text-4xl mb-2 ${
                  color === 'white' ? 'text-white drop-shadow-lg' : 'text-gray-800 drop-shadow-lg'
                }`}>
                  {getPieceSymbol(pieceType, color)}
                </div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  {getPieceName(pieceType)}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};