import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Store, 
  DollarSign, 
  Zap, 
  Utensils, 
  TrendingUp, 
  Users, 
  Settings, 
  ArrowLeft,
  CheckCircle2,
  TableProperties,
  LayoutDashboard,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { 
    money, 
    restaurantLevel, 
    stats, 
    isWorkHours, 
    isDayComplete, 
    dailyStats, 
    startNextDay,
    activeEvent,
    eventTimeLeft,
    feedback,
    activeTab,
    setActiveTab
  } = useGame();

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h;
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-slate-900 font-sans selection:bg-orange-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-200/50">
              <Store className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800">餐廳大亨</h1>
          </div>
          
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
              <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-emerald-600 font-mono tracking-tight">${money.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-orange-500">Lv.{restaurantLevel}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-800 tabular-nums">{formatTime(stats.currentTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Day {stats.day}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <NavItem active={activeTab === 'game'} onClick={() => setActiveTab('game')} icon={<LayoutDashboard className="w-4 h-4" />} label="經營" />
          <NavItem active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} icon={<Utensils className="w-4 h-4" />} label="菜單" />
          <NavItem active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={<Trophy className="w-4 h-4" />} label="成就" />
          <NavItem active={activeTab === 'upgrade'} onClick={() => setActiveTab('upgrade')} icon={<TrendingUp className="w-4 h-4" />} label="升級" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-4 h-4" />} label="設定" />
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-6 min-h-[calc(100vh-80px)]">
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-8 py-4 rounded-[2rem] border shadow-2xl font-black text-sm flex items-center gap-3 ${feedback.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'}`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            {feedback.text}
          </motion.div>
        )}

        {/* Event Banner */}
        <AnimatePresence>
          {activeEvent && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`mb-6 overflow-hidden rounded-[2rem] ${activeEvent.color} text-white p-6 relative`}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    {activeEvent.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{activeEvent.name}</h3>
                    <p className="text-xs opacity-80 font-bold uppercase tracking-widest">{activeEvent.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-60">剩餘時間</p>
                    <p className="text-3xl font-black font-mono tabular-nums">{eventTimeLeft}S</p>
                  </div>
                  <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(eventTimeLeft / activeEvent.duration) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </main>

      <AnimatePresence>
        {isDayComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[4rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] w-full max-w-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" />
              
              <div className="mb-8">
                 <div className="w-24 h-24 bg-orange-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-100/50">
                    <Store className="w-12 h-12 text-orange-600" />
                 </div>
                 <h2 className="text-4xl font-black text-slate-900 mb-2">本日營業大成功！</h2>
                 <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Day {stats.day} Daily report</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-left">
                 <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                    <Users className="w-12 h-12 text-slate-200 absolute -bottom-2 -right-2 opacity-50 transition-transform" />
                    <p className="text-xs font-black text-slate-400 uppercase mb-2">服務總桌數</p>
                    <p className="text-4xl font-black text-slate-800">{dailyStats.customers} <span className="text-lg font-bold text-slate-400">位</span></p>
                 </div>
                 <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 relative group overflow-hidden">
                    <DollarSign className="w-12 h-12 text-emerald-200 absolute -bottom-2 -right-2 opacity-50 transition-transform" />
                    <p className="text-xs font-black text-emerald-600 uppercase mb-2">本日營收</p>
                    <p className="text-4xl font-black text-emerald-700 font-mono">${dailyStats.earnings.toFixed(2)}</p>
                 </div>
              </div>

              <button 
                onClick={startNextDay}
                className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-slate-400/20 active:scale-95 group"
              >
                <Zap className="w-6 h-6 text-amber-400 fill-current group-hover:animate-bounce" />
                開始新的一天
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all
        ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
