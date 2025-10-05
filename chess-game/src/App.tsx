import React from 'react';
import { ChessBoard } from './components/ChessBoard';
import { GameControls } from './components/GameControls';
import { MoveHistory } from './components/MoveHistory';
import { useChessGame } from './hooks/useChessGame';
import './index.css';

function App() {
  const {
    gameState,
    makeMove,
    selectSquare,
    resetGame,
    undoMove,
    startNewGame,
    settings,
    updateSettings
  } = useChessGame();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Chess Game
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chess Board */}
          <div className="lg:col-span-2 flex justify-center">
            <ChessBoard
              board={gameState.board}
              selectedSquare={gameState.selectedSquare}
              possibleMoves={gameState.possibleMoves}
              onSquareClick={selectSquare}
              currentPlayer={gameState.currentPlayer}
              isCheck={gameState.isCheck}
            />
          </div>
          
          {/* Game Controls and History */}
          <div className="lg:col-span-2 space-y-6">
            <GameControls
              gameState={gameState}
              onReset={resetGame}
              onUndo={undoMove}
              onNewGame={startNewGame}
              settings={settings}
              onSettingsChange={updateSettings}
            />
            
            <MoveHistory
              moves={gameState.moveHistory}
              currentMove={gameState.moveHistory.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
