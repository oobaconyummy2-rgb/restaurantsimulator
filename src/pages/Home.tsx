import React from 'react';
import { motion } from 'framer-motion';
import { Store, Play, Settings, LogOut, Zap, ArrowLeft, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [showModeSelect, setShowModeSelect] = React.useState(false);

  if (showModeSelect) {
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
           <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-orange-100/40 blur-[120px] rounded-full" />
           <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-blue-100/40 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-16">
             <button 
               onClick={() => setShowModeSelect(false)}
               className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest mx-auto group"
             >
               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               返回首頁
             </button>
             <h2 className="text-4xl font-black text-slate-800 tracking-tight">選擇遊戲模式</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">CHOOSE YOUR RESTAURANT EXPERIENCE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
             <motion.div 
               whileHover={{ y: -10 }}
               className="bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-orange-500/5 border border-slate-100 hover:border-orange-500/20 transition-all group flex flex-col mx-auto w-full"
             >
                <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform">
                   <Store className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">餐廳模擬器 (自由模式)</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-1">
                  扮演餐廳經營者，從桌椅擺設、招聘員工到設計菜單，全方位打造你的美食帝國。考驗你的經營策略與即時管理能力。
                </p>
                <button 
                  onClick={() => navigate('/game.html')}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-orange-500 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                >
                  開始經營之旅
                </button>
             </motion.div>
             
             {/* Career Mode has been removed as per user request */}
             <div className="bg-slate-50/50 rounded-[3.5rem] p-10 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-6">
                   <Utensils className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">更多模式即將推出</h3>
                <p className="text-slate-400 text-xs uppercase tracking-widest">Stay Tuned for updates</p>
             </div>
          </div>
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
          <div className="w-24 h-24 bg-orange-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30 relative">
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
            onClick={() => navigate('/game.html')}
            className="group relative flex items-center justify-center gap-3 py-5 bg-orange-500 text-white rounded-3xl font-black text-xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all hover:bg-orange-600 overflow-hidden"
          >
            <Play className="w-6 h-6 fill-current" />
            遊戲開始
          </button>
          
          <button 
            onClick={() => navigate('/settings.html')}
            className="flex items-center justify-center gap-3 py-5 bg-white text-slate-600 border-2 border-slate-100 rounded-3xl font-black text-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <Settings className="w-6 h-6" />
            遊戲設定
          </button>

          <button 
            onClick={() => {
              if(confirm('確定要退出並清除所有資料嗎？')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="flex items-center justify-center gap-3 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black text-xl hover:bg-red-50 hover:text-red-500 border-2 border-transparent hover:border-red-100 active:scale-95 transition-all"
          >
            <LogOut className="w-6 h-6" />
            退出遊戲
          </button>
        </div>
      </motion.div>
    </div>
  );
}
