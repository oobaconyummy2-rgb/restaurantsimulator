import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import Game from './pages/Game';
import Menu from './pages/Menu';
import Upgrade from './pages/Upgrade';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/index.html" element={<Home />} />
          <Route path="/game.html" element={<Game />} />
          <Route path="/menu.html" element={<Menu />} />
          <Route path="/upgrade.html" element={<Upgrade />} />
          <Route path="/settings.html" element={<Settings />} />
          <Route path="/achievements.html" element={<Achievements />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
