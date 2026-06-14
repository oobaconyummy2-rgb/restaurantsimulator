import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import MainHub from './pages/MainHub';
import Home from './pages/Home';

function GameRunner() {
  const { gameStarted } = useGame();

  if (!gameStarted) {
    return <Home />;
  }

  return <MainHub />;
}

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="*" element={<GameRunner />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
