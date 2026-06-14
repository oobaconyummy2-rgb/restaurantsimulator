import React from 'react';
import { useGame } from '../context/GameContext';
import Layout from '../components/Layout';
import Game from './Game';
import Menu from './Menu';
import Upgrade from './Upgrade';
import Settings from './Settings';
import Achievements from './Achievements';
import Gacha from './Gacha';
import { AnimatePresence, motion } from 'motion/react';

export default function MainHub() {
  const { activeTab } = useGame();

  const renderContent = () => {
    switch (activeTab) {
      case 'game':
        return <Game isComponent />;
      case 'gacha':
        return <Gacha isComponent />;
      case 'menu':
        return <Menu isComponent />;
      case 'upgrade':
        return <Upgrade isComponent />;
      case 'achievements':
        return <Achievements isComponent />;
      case 'settings':
        return <Settings isComponent />;
      default:
        return <Game isComponent />;
    }
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
