
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  CreditCard, 
  Trash2, 
  ArrowLeft, 
  DollarSign, 
  Zap, 
  Star,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface CareerModeProps {
  onExit: () => void;
  onEarnMoney: (amount: number) => void;
  restaurantMoney: number;
}

type Role = 'chef' | 'cashier' | 'cleaner';

interface RoleStats {
  level: number;
  xp: number;
  maxXp: number;
  totalEarned: number;
}

export default function CareerMode({ onExit, onEarnMoney }: CareerModeProps) {
  const [role, setRole] = useState<Role | null>(null);
  const [stats, setStats] = useState<Record<Role, RoleStats>>(() => {
    const saved = localStorage.getItem('rt_career_stats');
    return saved ? JSON.parse(saved) : {
      chef: { level: 1, xp: 0, maxXp: 100, totalEarned: 0 },
      cashier: { level: 1, xp: 0, maxXp: 100, totalEarned: 0 },
      cleaner: { level: 1, xp: 0, maxXp: 100, totalEarned: 0 }
    };
  });

  const [activeTask, setActiveTask] = useState<any>(null);
  const [gameTimer, setGameTimer] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [meatProgress, setMeatProgress] = useState(0);
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    return localStorage.getItem('rt_career_tutorial_seen') !== 'true';
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('rt_career_stats', JSON.stringify(stats));
  }, [stats]);

  const closeTutorial = (roleId?: Role) => {
    setShowTutorial(false);
    localStorage.setItem('rt_career_tutorial_seen', 'true');
    if (roleId) startRoleGame(roleId);
  };

  const addXp = (currentRole: Role, amount: number) => {
    setStats(prev => {
      const roleStats = prev[currentRole];
      let newXp = roleStats.xp + amount;
      let newLevel = roleStats.level;
      let newMaxXp = roleStats.maxXp;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel++;
        newMaxXp = Math.floor(newMaxXp * 1.25);
      }

      return {
        ...prev,
        [currentRole]: { ...roleStats, xp: newXp, level: newLevel, maxXp: newMaxXp }
      };
    });
  };

  const finishGame = useCallback((finalScore: number) => {
    setIsPlaying(false);
    if (!role) return;

    const earnings = Math.floor(finalScore * (stats[role].level * 0.5 + 1));
    onEarnMoney(earnings);
    addXp(role, finalScore * 2);
    
    setStats(prev => ({
      ...prev,
      [role]: { ...prev[role], totalEarned: prev[role].totalEarned + earnings }
    }));

    setActiveTask({ type: 'result', earnings, score: finalScore });
  }, [role, stats, onEarnMoney]);

  // Game Loop
  useEffect(() => {
    if (isPlaying && gameTimer > 0) {
      const timer = setInterval(() => {
        setGameTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishGame(score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, gameTimer, score, finishGame]);

  const generateTask = useCallback((currentRole: Role) => {
    if (currentRole === 'chef') {
      const recipes = [
        { name: '經典沙威瑪', target: ['🍞', '🥩', '🥒', '🍟', '🧴'], type: 'shawarma' },
        { name: '特製肉卷', target: ['🌯', '🥩', '🍅', '🧅', '🧴'], type: 'shawarma' },
        { name: '全肉盛宴', target: ['🍞', '🥩', '🥩', '🥓', '🧴'], type: 'shawarma' },
        { name: '雙層漢堡', target: ['🍔', '🥩', '🧀', '🥬', '🍅'], type: 'burger' }
      ];
      const recipe = recipes[Math.floor(Math.random() * recipes.length)];
      setMeatProgress(0);
      return { 
        type: 'chef', 
        ...recipe, 
        current: [], 
        stage: 'prep' as 'prep' | 'adding' | 'processing' | 'finishing'
      };
    }
    if (currentRole === 'cashier') {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const sum = a + b;
      const options = [sum, sum + 5, sum - 2, sum + 10].sort(() => Math.random() - 0.5);
      // Ensure only unique options
      const uniqueOptions = Array.from(new Set(options));
      while(uniqueOptions.length < 4) {
        const extra = sum + Math.floor(Math.random() * 20) - 10;
        if(!uniqueOptions.includes(extra)) uniqueOptions.push(extra);
      }
      return { type: 'cashier', question: `${a} + ${b} = ?`, answer: sum, options: uniqueOptions.sort(() => Math.random() - 0.5) };
    }
    if (currentRole === 'cleaner') {
      return { type: 'cleaner', position: { top: Math.random() * 80 + '%', left: Math.random() * 80 + '%' } };
    }
  }, []);

  const startRoleGame = (selectedRole: Role) => {
    if (showTutorial) return; // Wait for tutorial
    setRole(selectedRole);
    setScore(0);
    setGameTimer(30);
    setIsPlaying(true);
    setActiveTask(generateTask(selectedRole));
  };

  const handleChefAction = (id: string, actionType: 'ingredient' | 'tool' | 'meat') => {
    if (!activeTask || activeTask.type !== 'chef') return;

    if (actionType === 'meat') {
      if (activeTask.stage !== 'prep') return;
      setMeatProgress(prev => {
        const next = prev + 10;
        if (next >= 100) {
          setActiveTask({ ...activeTask, stage: 'adding' });
          return 0;
        }
        return next;
      });
      return;
    }

    if (actionType === 'ingredient') {
      if (activeTask.stage !== 'adding') return;
      const expectedIngredient = activeTask.target[activeTask.current.length];
      
      // If the action is correct
      if (id === expectedIngredient) {
        const newCurrent = [...activeTask.current, id];
        if (newCurrent.length === activeTask.target.length) {
          setActiveTask({ ...activeTask, current: newCurrent, stage: 'processing' });
        } else {
          setActiveTask({ ...activeTask, current: newCurrent });
        }
      } else {
        // Penalty or flash red
      }
    } else if (actionType === 'tool') {
      if (activeTask.stage === 'processing') {
         // Wrapping/Toasting
         setActiveTask({ ...activeTask, stage: 'finishing' });
      } else if (activeTask.stage === 'finishing') {
         // Completed
         setScore(prev => prev + 25);
         setActiveTask(generateTask('chef'));
      }
    }
  };

  const handleCashierAction = (value: number) => {
    if (!activeTask || activeTask.type !== 'cashier') return;
    if (value === activeTask.answer) {
      setScore(prev => prev + 15);
      setActiveTask(generateTask('cashier'));
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setActiveTask(generateTask('cashier'));
    }
  };

  const handleCleanerAction = () => {
    setScore(prev => prev + 5);
    setActiveTask(generateTask('cleaner'));
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
        <button onClick={onExit} className="flex items-center gap-2 text-slate-400 hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          返回主選單
        </button>

        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-5xl font-black mb-4 tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              員工職業生涯
            </h1>
            <p className="text-slate-400 text-lg uppercase tracking-[0.3em] font-bold">Choose Your Career Path</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: 'chef' as Role, name: '專業行政主廚', icon: <ChefHat />, color: 'bg-orange-500', desc: '負責烹飪高級料理，2.5D廚房實作，考驗配方與製作。' },
              { id: 'cashier' as Role, name: '首席收銀專員', icon: <CreditCard />, color: 'bg-blue-500', desc: '處理顧客帳單，考驗計算速度與準確度。' },
              { id: 'cleaner' as Role, name: '環境美化大師', icon: <Trash2 />, color: 'bg-emerald-500', desc: '快速清理店內環境，考驗動態捕捉與速度。' }
            ].map(r => (
              <motion.div 
                key={r.id}
                whileHover={{ y: -10 }}
                className="bg-slate-800 rounded-[3rem] p-8 border border-white/5 relative overflow-hidden flex flex-col group"
              >
                <div className={`w-16 h-16 ${r.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(r.icon as React.ReactElement, { className: 'w-8 h-8 text-white' })}
                </div>
                <h3 className="text-xl font-black mb-2">{r.name}</h3>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">{r.desc}</p>
                
                <div className="mt-auto space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500">Level</span>
                      <span className="text-lg font-black text-white">Lv.{stats[r.id].level}</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-white/40 mb-1" style={{ width: `${(stats[r.id].xp / stats[r.id].maxXp) * 100}%` }} />
                   </div>
                   <button 
                     onClick={() => {
                        if (showTutorial) {
                           setRole(r.id); // Set role but stay in tutorial
                        } else {
                           startRoleGame(r.id);
                        }
                     }}
                     className={`w-full py-4 rounded-[2rem] font-black text-sm transition-all ${r.color} hover:brightness-110 active:scale-95 shadow-lg`}
                   >
                     開始上班
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tutorial Overlay */}
        <AnimatePresence>
          {showTutorial && role && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] p-10 max-w-xl w-full text-slate-900 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-orange-500" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-orange-100 rounded-2xl text-orange-600">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">新手教學：{role === 'chef' ? '2.5D 主廚之道' : '上班須知'}</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">Employee Handbook</p>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  {role === 'chef' ? (
                    <div className="space-y-4">
                      <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 font-black text-sm">1</div>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">
                          <span className="text-orange-600">切肉階段</span>：連續點擊左側的肉串機，將肉切好備用。
                        </p>
                      </div>
                      <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 font-black text-sm">2</div>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">
                          <span className="text-orange-600">組裝階段</span>：按照清單順序點擊下方的食材加入捲餅中。
                        </p>
                      </div>
                      <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 font-black text-sm">3</div>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">
                          <span className="text-blue-600">完工階段</span>：點擊右側工具進行「包裝」與「加熱」最後出餐！
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 font-bold leading-relaxed">
                      這是一個考驗反應力的模式！完成越多任務，賺取的經驗值越高，能為你的餐廳帶來更多額外收入。
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => closeTutorial(role)}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-orange-500 transition-all active:scale-95 shadow-xl"
                  >
                    讀完了，開始挑戰！
                  </button>
                  <button 
                    onClick={() => setShowTutorial(false)}
                    className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                  >
                    我已經是專家了，跳過教學
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 relative overflow-hidden flex flex-col items-center justify-center">
       <div className="absolute top-8 left-8 flex items-center gap-6">
          <button onClick={() => setRole(null)} className="bg-white/5 p-3 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-300" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Currently Role</p>
             <h2 className="text-xl font-black">{role === 'chef' ? '行政主廚' : role === 'cashier' ? '首席收銀員' : '清潔大師'}</h2>
          </div>
       </div>

       <div className="absolute top-8 right-8 flex gap-8 items-center text-right">
          <div>
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Remaining Time</p>
             <div className="flex items-center justify-end gap-2 text-2xl font-black tabular-nums">
                <Clock className="w-5 h-5 text-blue-400" />
                {gameTimer}S
             </div>
          </div>
          <div>
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Current Score</p>
             <div className="flex items-center justify-end gap-2 text-2xl font-black tabular-nums text-emerald-400">
                <Star className="w-5 h-5" />
                {score}
             </div>
          </div>
       </div>

       <div className="w-full max-w-2xl bg-slate-800 rounded-[4rem] p-12 border border-white/5 shadow-2xl relative">
          <AnimatePresence mode="wait">
          {activeTask?.type === 'result' ? (
            <motion.div 
              key="result"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12"
            >
               <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
               <h2 className="text-4xl font-black mb-2">下班了！</h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">Work report</p>
               
               <div className="grid grid-cols-2 gap-4 mb-12">
                  <div className="bg-white/5 p-6 rounded-3xl">
                     <p className="text-[10px] font-black text-slate-500 uppercase mb-2">本次得分</p>
                     <p className="text-3xl font-black">{activeTask.score}</p>
                  </div>
                  <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
                     <p className="text-[10px] font-black text-emerald-500 uppercase mb-2">本次薪水</p>
                     <p className="text-3xl font-black text-emerald-400">+${activeTask.earnings}</p>
                  </div>
               </div>

               <button 
                 onClick={() => setRole(null)}
                 className="px-12 py-5 bg-white text-slate-900 rounded-[2.5rem] font-black text-lg hover:bg-slate-200 transition-all active:scale-95"
               >
                 回到職業介面
               </button>
            </motion.div>
          ) : role === 'chef' ? (
            <motion.div key="chef-game" className="flex flex-col items-center">
               <div className="w-full mb-6 flex justify-between items-end">
                  <div className="text-left">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">目前任務</p>
                     <h3 className="text-xl font-black text-orange-400">{activeTask?.name}</h3>
                  </div>
                  <div className="flex gap-2">
                     {activeTask?.target.map((ing: string, idx: number) => (
                        <div 
                          key={idx} 
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg border-2 transition-all ${activeTask.current.length > idx ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-700/50 border-slate-600 opacity-50'}`}
                        >
                          {ing}
                        </div>
                     ))}
                  </div>
               </div>

               {/* 2.5D Kitchen Simulation */}
               <div className="relative w-full h-[350px] mb-6 bg-slate-900/50 rounded-[3rem] border border-white/5 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                  
                  {/* Left: Shawarma Meat Spit */}
                  <div className="absolute left-8 bottom-12 flex flex-col items-center">
                     <motion.div 
                        onClick={() => handleChefAction('slicer', 'meat')}
                        animate={activeTask?.stage === 'prep' ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className={`relative w-24 h-48 bg-slate-800 rounded-t-full border-x-8 border-orange-900 shadow-2xl cursor-pointer flex flex-col items-center justify-center ${activeTask?.stage !== 'prep' && 'opacity-30 grayscale'}`}
                     >
                        <div className="w-12 h-40 bg-orange-700 rounded-full shadow-inner flex flex-col gap-2 overflow-hidden items-center pt-4">
                           <div className="w-full h-8 bg-orange-600" />
                           <div className="w-full h-8 bg-orange-500" />
                           <div className="w-full h-8 bg-orange-600" />
                           <div className="w-full h-8 bg-orange-500" />
                        </div>
                        {activeTask?.stage === 'prep' && (
                           <div className="absolute -bottom-8 w-24 h-4 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div 
                                 className="h-full bg-orange-500"
                                 initial={{ width: 0 }}
                                 animate={{ width: `${meatProgress}%` }}
                              />
                           </div>
                        )}
                        <p className="absolute -top-10 text-[10px] font-black uppercase text-orange-400">點擊切肉</p>
                     </motion.div>
                  </div>

                  {/* Center: Assembly Board (Isometric) */}
                  <div className="relative w-80 h-40 transform -rotate-x-[20deg] rotate-z-[0deg] bg-slate-700 rounded-2xl shadow-[0px_20px_0px_#1e293b] flex items-center justify-center">
                     <div className="absolute inset-2 border-2 border-dashed border-white/10 rounded-xl" />
                     
                     <div className="flex gap-1 flex-wrap justify-center p-2 items-end">
                        <AnimatePresence>
                           {/* Base Bread / Bowl */}
                           <motion.div key="base" className="text-6xl mb-[-10px] z-0">{activeTask?.target[0]}</motion.div>
                           
                           {/* Ingredients on top */}
                           {activeTask?.current.slice(1).map((ing: string, i: number) => (
                              <motion.div 
                                key={`${ing}-${i}`}
                                initial={{ scale: 0, y: -100, opacity: 0 }}
                                animate={{ scale: 1, y: -20 - (i * 5), opacity: 1 }}
                                className="text-4xl filter drop-shadow-lg absolute"
                                style={{ zIndex: i + 1 }}
                              >
                                {ing}
                              </motion.div>
                           ))}
                        </AnimatePresence>
                     </div>

                     {/* Wrapping / Toasting Indicator */}
                     {activeTask?.stage === 'processing' && (
                        <motion.div 
                           initial={{ scale: 0, rotate: 45 }}
                           animate={{ scale: 1.2, rotate: 0 }}
                           className="absolute -top-16 text-5xl z-50"
                        >
                           ✨
                        </motion.div>
                     )}
                     
                     {activeTask?.stage === 'finishing' && (
                        <motion.div 
                           animate={{ y: [0, -5, 0], opacity: [1, 0.5, 1] }}
                           transition={{ repeat: Infinity }}
                           className="absolute -top-16 text-5xl z-50"
                        >
                           🔥
                        </motion.div>
                     )}
                  </div>

                  {/* Right: Tools (Wrapping / Toasting) */}
                  <div className="absolute right-8 bottom-12 flex flex-col gap-6 items-center">
                     <motion.button 
                       onClick={() => handleChefAction('tool', 'tool')}
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-2xl transition-all border-4 ${activeTask?.stage === 'processing' || activeTask?.stage === 'finishing' ? 'bg-blue-500 border-white animate-pulse' : 'bg-slate-800 border-transparent opacity-30 cursor-not-allowed'}`}
                     >
                        <span className="text-4xl">
                           {activeTask?.stage === 'finishing' ? '♨️' : '🌯'}
                        </span>
                        <p className="text-[8px] font-black uppercase text-white/50">
                           {activeTask?.stage === 'finishing' ? '正在加熱' : '開始包裝'}
                        </p>
                     </motion.button>
                     <p className="text-[10px] font-black uppercase text-blue-400">完工區</p>
                  </div>
               </div>

               {/* Interaction Buttons (Toppings) */}
               <div className="grid grid-cols-7 gap-3 w-full">
                  {['🍞', '🌯', '🥖', '🥩', '🥓', '🍗', '🥬', '🧅', '🍅', '🥒', '🍄', '🧀', '🍟', '🧴'].map(ing => (
                    <button 
                      key={ing}
                      onClick={() => handleChefAction(ing, 'ingredient')}
                      className={`
                        aspect-square rounded-xl text-xl flex items-center justify-center transition-all shadow-md
                        ${activeTask?.stage === 'adding' ? 'bg-slate-700 hover:bg-slate-600 active:scale-90 border-b-4 border-slate-900' : 'bg-slate-800 opacity-20 cursor-not-allowed'}
                      `}
                    >
                      {ing}
                    </button>
                  ))}
               </div>
            </motion.div>
          ) : role === 'cashier' ? (
            <motion.div key="cashier-game" className="text-center">
               <h2 className="text-5xl font-black mb-12 text-blue-400">{activeTask?.question}</h2>
               <div className="grid grid-cols-2 gap-4">
                  {activeTask?.options.map((opt: number) => (
                    <button 
                      key={opt}
                      onClick={() => handleCashierAction(opt)}
                      className="py-8 bg-slate-700 rounded-3xl text-3xl font-black hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </motion.div>
          ) : (
            <motion.div key="cleaner-game" className="h-[400px] relative">
               <h2 className="text-lg font-black text-center mb-4 text-emerald-400">點擊髒汙處進行清潔！</h2>
               <div className="h-full w-full bg-slate-700/30 rounded-3xl relative overflow-hidden">
                  {activeTask?.type === 'cleaner' && (
                    <motion.button
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      onClick={handleCleanerAction}
                      style={{ top: activeTask.position.top, left: activeTask.position.left }}
                      className="absolute w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-10"
                    >
                      🦠
                    </motion.button>
                  )}
               </div>
            </motion.div>
          )}
          </AnimatePresence>
       </div>
    </div>
  );
}
