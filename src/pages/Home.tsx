import React from 'react';
import { motion } from 'motion/react';
import { Store, Play, Settings as SettingsIcon, LogOut, Zap, ArrowLeft, Utensils } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Settings from './Settings';

export default function Home() {
  const { startGame } = useGame();
  const [showSettings, setShowSettings] = React.useState(false);

  if (showSettings) {
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
           <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-orange-100/40 blur-[120px] rounded-full" />
           <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-blue-100/40 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-white rounded-[3.5rem] p-8 md:p-12 border border-slate-200 shadow-xl max-h-[85vh] overflow-y-auto"
        >
          <button 
            onClick={() => setShowSettings(false)}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            返回標題畫面
          </button>
          
          <Settings isComponent />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
           className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-orange-100/30 to-amber-100/30 blur-[100px] rounded-full"
         />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-orange-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30 relative animate-bounce">
            <Store className="w-12 h-12 text-white" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white"
            >
              <Zap className="w-4 h-4 fill-current" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">餐廳模擬器</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Restaurant Tycoon Extreme</p>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={startGame}
            className="group relative flex items-center justify-center gap-3 py-5 bg-orange-500 text-white rounded-3xl font-black text-xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all hover:bg-orange-600 overflow-hidden cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current" />
            遊戲開始
          </button>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center gap-3 py-5 bg-white text-slate-600 border-2 border-slate-100 rounded-3xl font-black text-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <SettingsIcon className="w-6 h-6" />
            遊戲設定
          </button>

          <button 
            onClick={() => {
              if(confirm('確定要完全重新開始並清除所有資料嗎？')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="flex items-center justify-center gap-3 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black text-xl hover:bg-rose-100 hover:text-rose-600 border-2 border-transparent hover:border-rose-200 active:scale-95 transition-all cursor-pointer"
          >
            <LogOut className="w-6 h-6" />
            重置存檔 (重新開始)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
