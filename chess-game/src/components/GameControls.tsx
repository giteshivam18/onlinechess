import React, { useState } from 'react';
import { GameState, GameSettings } from '../types/chess.types';

interface GameControlsProps {
  gameState: GameState;
  onReset: () => void;
  onUndo: () => void;
  onNewGame: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onReset,
  onUndo,
  onNewGame,
  settings,
  onSettingsChange
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const getGameStatusText = () => {
    switch (gameState.gameStatus) {
      case 'check':
        return `Check! ${gameState.currentPlayer === 'white' ? 'White' : 'Black'} is in check`;
      case 'checkmate':
        return `Checkmate! ${gameState.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
      case 'stalemate':
        return 'Stalemate! Game is a draw';
      case 'draw':
        return 'Game is a draw';
      default:
        return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'} to move`;
    }
  };

  const getStatusColor = () => {
    switch (gameState.gameStatus) {
      case 'check':
        return 'text-orange-600';
      case 'checkmate':
        return 'text-red-600';
      case 'stalemate':
      case 'draw':
        return 'text-gray-600';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Game Status */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Game Status</h3>
        <div className={`text-center font-medium ${getStatusColor()}`}>
          {getGameStatusText()}
        </div>
        
        {gameState.isCheck && (
          <div className="text-center text-red-500 font-bold animate-pulse mt-2">
            ⚠️ CHECK!
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Controls</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onNewGame}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            New Game
          </button>
          
          <button
            onClick={onReset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Reset
          </button>
          
          <button
            onClick={onUndo}
            disabled={gameState.moveHistory.length === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Undo Move
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Settings</h3>
          
          <div className="space-y-4">
            {/* Player Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player Color
              </label>
              <select
                value={settings.playerColor}
                onChange={(e) => onSettingsChange({ 
                  playerColor: e.target.value as 'white' | 'black' 
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Difficulty
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) => onSettingsChange({ 
                  difficulty: e.target.value as 'easy' | 'medium' | 'hard' 
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Sound Effects
              </label>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onSettingsChange({ soundEnabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {/* Show Legal Moves */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Show Legal Moves
              </label>
              <input
                type="checkbox"
                checked={settings.showLegalMoves}
                onChange={(e) => onSettingsChange({ showLegalMoves: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {/* Show Coordinates */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Show Coordinates
              </label>
              <input
                type="checkbox"
                checked={settings.showCoordinates}
                onChange={(e) => onSettingsChange({ showCoordinates: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Game Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Moves:</span>
            <span className="ml-2 font-medium">{gameState.moveHistory.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Half-moves:</span>
            <span className="ml-2 font-medium">{gameState.halfMoveClock}</span>
          </div>
          <div>
            <span className="text-gray-600">Full moves:</span>
            <span className="ml-2 font-medium">{gameState.fullMoveNumber}</span>
          </div>
          <div>
            <span className="text-gray-600">Captured:</span>
            <span className="ml-2 font-medium">
              {gameState.capturedPieces.white.length + gameState.capturedPieces.black.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};