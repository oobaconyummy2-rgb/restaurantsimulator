import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import MainHub from './pages/MainHub';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="*" element={<MainHub />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
