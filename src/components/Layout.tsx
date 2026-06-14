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
  Trophy,
  Sparkles,
  Pause,
  Play,
  ClipboardList,
  Gift,
  AlertTriangle,
  X,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import LuckyCatWidget from './LuckyCatWidget';
import AICustomerService from './AICustomerService';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { 
    money, 
    gems,
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
    setActiveTab,
    isPaused,
    setIsPaused,
    togglePause,
    dailyQuests,
    claimDailyQuestReward,
    resetGame,
    cheatsEnabled,
    ratings
  } = useGame();

  const [showPauseModal, setShowPauseModal] = React.useState(false);
  const [showTasksModal, setShowTasksModal] = React.useState(false);
  const [showRatingDetails, setShowRatingDetails] = React.useState(false);

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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 md:px-6 py-3 md:py-4 flex flex-col lg:flex-row gap-3 lg:gap-6 lg:items-center lg:justify-between shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-200/50">
                <Store className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">餐廳模擬器</h1>
            </div>
            
            {/* Show total money on very top header beside title for ultra small screens */}
            <div className="flex md:hidden items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                <span className="text-[10px] font-black font-mono">${money.toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-100">
                <span className="text-[10px] font-black font-mono">💎{gems}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-start gap-4 px-3 md:px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 w-full md:w-auto">
            <div className="hidden md:flex items-center gap-2 pr-4 border-r border-slate-200">
              <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-emerald-600 font-mono tracking-tight">${money.toFixed(2)}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 pr-4 border-r border-slate-200">
              <div className="bg-purple-500 p-1.5 rounded-lg text-white">
                <span className="text-xs">💎</span>
              </div>
              <span className="text-lg font-black text-purple-600 font-mono tracking-tight">{gems}</span>
            </div>
            <div className="flex items-center justify-between md:justify-start gap-3 md:gap-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 w-full md:w-auto">
              {/* Show money inside if md, or show standard stats on mobile */}
              <div className="flex md:hidden items-center gap-2">
                <span className="text-emerald-600 font-mono font-black">${money.toFixed(0)}</span>
                <span className="text-purple-600 font-mono font-black">💎{gems}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-orange-500">Lv.{restaurantLevel}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-xl text-slate-850 font-bold shadow-2xs">
                <span className="tabular-nums font-mono text-slate-700">{formatTime(stats.currentTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Day {stats.day}</span>
              </div>

              {/* 五星評分 Badge */}
              <div className="relative flex items-center shrink-0">
                <button
                  onClick={() => setShowRatingDetails(!showRatingDetails)}
                  onMouseEnter={() => setShowRatingDetails(true)}
                  onMouseLeave={() => setShowRatingDetails(false)}
                  className="flex items-center gap-1 bg-amber-50 border border-amber-200 hover:bg-amber-105 text-amber-700 px-2 py-1 rounded-xl h-7 cursor-pointer transition-colors relative"
                  title="餐廳星級評分 (點擊/懸停查看細目)"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-mono font-black text-[11px] leading-none">{ratings?.overall?.toFixed(1) || "1.0"}</span>
                </button>

                <AnimatePresence>
                  {showRatingDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-8 right-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-50 w-52 text-left normal-case tracking-normal"
                    >
                      <h4 className="font-black text-slate-800 text-xs mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        餐館評級細目
                      </h4>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">🍔 美食美味</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-black text-slate-700">{ratings?.food?.toFixed(1) || "1.0"}</span>
                            <span className="text-amber-500">★</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">✨ 高級裝潢</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-black text-slate-700">{ratings?.decor?.toFixed(1) || "1.0"}</span>
                            <span className="text-amber-500">★</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">🙋 親切服務</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-black text-slate-700">{ratings?.service?.toFixed(1) || "1.0"}</span>
                            <span className="text-amber-500">★</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-100 pt-2 flex items-center justify-between font-black">
                          <span className="text-slate-800">⭐ 綜合評等</span>
                          <span className="font-mono text-amber-600">{ratings?.overall?.toFixed(1) || "1.0"} / 5.0</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-3 border-t border-slate-100 pt-2 text-center font-bold">
                        💡 升級員工、裝修與菜色可提高評等
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Pause Toggle button */}
              <button 
                onClick={() => {
                  togglePause();
                  setShowPauseModal(true);
                }}
                className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${isPaused ? 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'}`}
                title="暫停經營時間"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              {/* Daily Quests button */}
              <button
                onClick={() => setShowTasksModal(true)}
                className="relative flex items-center justify-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
                title="今日經營任務 clipboard"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline-block font-extrabold text-[9px] tracking-wider">每日任務</span>
                {(() => {
                  const unsc = (dailyQuests || []).filter(q => q.completed && !q.claimed).length;
                  return unsc > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 border border-white text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold animate-bounce leading-none">
                      {unsc}
                    </span>
                  ) : null;
                })()}
              </button>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 md:gap-2 overflow-x-auto w-full lg:w-auto pb-1.5 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
          <NavItem active={activeTab === 'game'} onClick={() => setActiveTab('game')} icon={<LayoutDashboard className="w-4 h-4" />} label="經營" />
          <NavItem active={activeTab === 'gacha'} onClick={() => setActiveTab('gacha')} icon={<Sparkles className="w-4 h-4 text-amber-500 fill-current" />} label="招募" />
          <NavItem active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} icon={<Utensils className="w-4 h-4" />} label="菜單" />
          <NavItem active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={<Trophy className="w-4 h-4" />} label="成就" />
          <NavItem active={activeTab === 'upgrade'} onClick={() => setActiveTab('upgrade')} icon={<TrendingUp className="w-4 h-4" />} label="升級" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-4 h-4" />} label="設定" />
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 min-h-[calc(100vh-80px)]">
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

      <LuckyCatWidget />
      <AICustomerService />

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

        {/* Pause Confirmation Modal */}
        {showPauseModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 text-slate-800"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[3rem] p-8 md:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] w-full max-w-md text-center relative overflow-hidden border border-slate-100"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500 animate-pulse" />
              
              <div className="mb-6">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <Pause className="w-8 h-8 text-amber-500 fill-amber-500/10" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">⏸️ 餐廳模擬已暫停</h2>
                <p className="text-[10px] text-slate-400 mt-1 font-extrabold tracking-widest uppercase">Time is Still • Operations Frozen</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-left space-y-2 mb-8 text-[11px] font-black text-slate-500 leading-relaxed">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <span>顧客用餐、結帳與點單進度已靜止</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <span>服務自動化、翻桌清理與招攬已鎖定</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <span>特殊事件和關卡時效均已安全定格</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setIsPaused(false);
                    setShowPauseModal(false);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-2xl font-black text-sm shadow-lg shadow-amber-500/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  繼續經營餐館
                </button>

                <button 
                  onClick={() => {
                    if (confirm("您確定要完全重置目前的餐館經營數據嗎？這會遺失所有金幣與研究稱號！")) {
                      resetGame();
                      setIsPaused(false);
                      setShowPauseModal(false);
                    }
                  }}
                  className="w-full py-3 bg-slate-50 hover:bg-rose-50 text-[10px] text-slate-450 hover:text-red-600 font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-dashed border-slate-200 hover:border-red-200"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  完全重置經營 (重來)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Daily Quests Center Popover Modal */}
        {showTasksModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 text-slate-800"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[3rem] p-6 md:p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] w-full max-w-lg relative overflow-hidden border border-slate-105"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              
              {/* Close Button */}
              <button 
                onClick={() => setShowTasksModal(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-5 pr-8">
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                  <ClipboardList className="w-5 h-5 text-orange-500" />
                  今日經營作戰任務
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-bold">
                  完成以下的每日餐飲試煉，即可領取特使招募專屬寶石！
                </p>
              </div>

              {/* Tasks List wrapper */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {(dailyQuests || []).map((quest) => {
                  const percent = Math.min(100, (quest.current / quest.target) * 100);
                  return (
                    <div 
                      key={quest.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        quest.claimed 
                          ? 'border-slate-100 bg-slate-50/50 opacity-60' 
                          : quest.completed 
                          ? 'border-amber-250 bg-amber-50/20 shadow-2xs' 
                          : 'border-slate-150 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className={`text-xs font-black ${quest.claimed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {quest.description}
                          </p>
                          <p className="text-[10px] text-amber-600 font-extrabold uppercase mt-0.5 tracking-wider">
                            獎勵：💎 {quest.rewardGems} 顆寶石
                          </p>
                        </div>

                        {/* Claim task button */}
                        <div className="shrink-0">
                          {quest.claimed ? (
                            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-400 border border-slate-200 text-[9px] font-black rounded-lg">
                              已領取
                            </span>
                          ) : quest.completed ? (
                            <button
                              onClick={() => {
                                claimDailyQuestReward(quest.id);
                                confetti({ particleCount: 40, spread: 50, colors: ['#fbbf24', '#f59e0b', '#fff'] });
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-103 font-black text-[10px] rounded-xl hover:shadow-md cursor-pointer transition-all animate-pulse"
                            >
                              領取 💎
                            </button>
                          ) : (
                            <span className="inline-block px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-150 text-[9px] font-extrabold rounded-lg">
                              {quest.current} / {quest.target}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar info */}
                      {!quest.claimed && (
                        <div className="relative pt-1">
                          <div className="flex mb-1 items-center justify-between">
                            <div>
                              <span className="text-[9px] font-extrabold inline-block text-amber-600">
                                完成進度: {percent.toFixed(0)}%
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-bold inline-block text-slate-600 tabular-nums">
                                {quest.current} / {quest.target}
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-slate-100">
                            <motion.div 
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.5 }}
                              style={{ backgroundColor: quest.completed ? '#f59e0b' : '#f97316' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                  💡 跨日營業後，指標進度即重新整備
                </span>
                <button
                  onClick={() => setShowTasksModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-[11px] cursor-pointer"
                >
                  確認關閉
                </button>
              </div>
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
        px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl font-black text-xs lg:text-sm flex items-center gap-1.5 lg:gap-2 transition-all shrink-0 whitespace-nowrap snap-center
        ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
