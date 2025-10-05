import { useState } from 'react';
import ChessBoard from './components/ChessBoard';
import type { Difficulty } from './types/chess';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

  const handleNewGame = () => {
    setShowNewGameConfirm(true);
  };

  const confirmNewGame = () => {
    setShowNewGameConfirm(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Chess Game</h1>
          <p className="text-gray-600 text-lg">Play against AI</p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleNewGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition"
          >
            New Game
          </button>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 font-semibold shadow-lg cursor-pointer hover:border-blue-500 transition"
          >
            <option value="easy">Easy (Depth 2)</option>
            <option value="medium">Medium (Depth 3)</option>
            <option value="hard">Hard (Depth 4)</option>
          </select>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-white hover:bg-gray-100 border-2 border-gray-300 font-bold py-2 px-6 rounded-lg shadow-lg transition"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <ChessBoard difficulty={difficulty} soundEnabled={soundEnabled} />
      </div>

      {showNewGameConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Start New Game?</h2>
            <p className="text-center mb-6 text-gray-600">
              This will reset the current game.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowNewGameConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewGame}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
