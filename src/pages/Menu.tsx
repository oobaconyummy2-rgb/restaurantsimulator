import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Star, 
  Sparkles, 
  TrendingUp, 
  X, 
  Clock,
  CheckCircle2,
  Lock,
  ArrowUpCircle,
  Trophy
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { FOOD_ITEMS, ACHIEVEMENTS } from '../constants';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

export default function Menu() {
  const navigate = useNavigate();
  const { menuState, itemRatings, dailySpecials, stats, money, upgrades, toggleDailySpecial, prePrepItems, togglePrePrep, staff, buyUpgrade } = useGame();

  const getUpgradeCost = (id: string, base: number, level: number) => Math.round(base * Math.pow(1.5, level));

  const getAvgRating = (id: string) => {
    const rating = itemRatings[id];
    if (!rating || rating.count === 0) return 0;
    return rating.averageRating;
  };

  return (
    <Layout>
      <div className="space-y-12">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-orange-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-orange-500/20">
                <Utensils className="w-10 h-10" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mb-2 leading-none">Management Center</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none">菜單研發與管理</h3>
              </div>
           </div>
           
           <div className="flex items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="pr-6 border-r border-slate-100 text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1">主打配額</p>
                 <div className="flex items-center gap-2 justify-end">
                    <span className="text-2xl font-black text-slate-800">{dailySpecials.length}/3</span>
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1">事前備料</p>
                 <div className="flex items-center gap-2 justify-end">
                    <span className="text-2xl font-black text-slate-800">{prePrepItems.length}/2</span>
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                 </div>
              </div>
           </div>
        </section>

        {/* Menu Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {FOOD_ITEMS.map((item) => {
             const rating = getAvgRating(item.id);
             const isSpecial = dailySpecials.includes(item.id);
             const isPrePrepped = prePrepItems.includes(item.id);
             
             // Check if unlocked
             const upgradeId = item.requiredUpgradeId;
             const upgradeObj = upgradeId ? upgrades.find(u => u.id === upgradeId) : null;
             const isLocked = upgradeId && upgradeObj && upgradeObj.level === 0;
             const unlockCost = upgradeObj ? getUpgradeCost(upgradeObj.id, upgradeObj.baseCost, upgradeObj.level) : 0;

             return (
               <motion.div
                 layoutId={`item-${item.id}`}
                 key={item.id}
                 className={`
                   group relative flex flex-col bg-white rounded-[3rem] border-2 transition-all duration-500 overflow-hidden
                   ${isLocked ? 'border-slate-100 opacity-80' : 'border-slate-50 hover:border-orange-200 hover:shadow-[0_40px_80px_-20px_rgba(249,115,22,0.15)] hover:-translate-y-2'}
                   ${isSpecial ? 'ring-8 ring-orange-100 border-orange-200' : ''}
                 `}
               >
                  {/* Item Banner Area */}
                  <div className={`h-32 transition-colors duration-500 relative flex items-center justify-center ${isLocked ? 'bg-slate-100' : item.color}`}>
                     <Utensils className="absolute -bottom-4 -left-4 w-32 h-32 text-white/10 rotate-12" />
                     {isLocked ? (
                       <Lock className="w-12 h-12 text-slate-300" />
                     ) : (
                       <div className="text-5xl filter transition-transform group-hover:scale-125 duration-700 drop-shadow-2xl">
                          {item.icon}
                       </div>
                     )}
                     
                     {isSpecial && (
                       <div className="absolute top-6 left-6 bg-white text-orange-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                          Daily Special
                       </div>
                     )}
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 min-w-0">
                           <h4 className={`text-xl font-black tracking-tight uppercase truncate ${isLocked ? 'text-slate-400' : 'text-slate-900 group-hover:text-orange-600'} transition-colors`}>
                              {item.name}
                           </h4>
                           <div className="flex items-center gap-2 mt-1">
                              <Star className={`w-3 h-3 ${rating > 0 ? 'text-amber-400' : 'text-slate-200'}`} />
                              <span className="text-[10px] font-black text-slate-400 font-mono tracking-tighter">
                                 {rating > 0 ? `${rating.toFixed(1)} / 5.0` : 'NO DATA'}
                              </span>
                           </div>
                        </div>
                        <div className="text-right ml-4 shrink-0">
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Base Price</p>
                           <p className={`text-xl font-black font-mono leading-none ${isLocked ? 'text-slate-300' : 'text-slate-800'}`}>${item.price}</p>
                        </div>
                     </div>

                     {isLocked ? (
                       <div className="mt-auto space-y-4 pt-6 border-t border-slate-50">
                          <p className="text-[10px] font-bold text-slate-400 bg-slate-50 p-4 rounded-2xl text-center">
                             尚未研發此餐點。
                          </p>
                          <button 
                            onClick={() => buyUpgrade(upgradeObj!.id)}
                            disabled={money < unlockCost}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${money >= unlockCost ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                          >
                             <TrendingUp className="w-4 h-4" />
                             研發並解鎖 — ${unlockCost}
                          </button>
                       </div>
                     ) : (
                       <div className="mt-auto space-y-3 pt-6 border-t border-slate-50">
                          <button
                            onClick={() => toggleDailySpecial(item.id)}
                            className={`w-full py-4 rounded-2xl flex items-center justify-between px-6 transition-all group/btn ${isSpecial ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-50 text-slate-400 hover:bg-orange-100 hover:text-orange-600'}`}
                          >
                             <div className="flex items-center gap-3">
                                <Sparkles className={`w-4 h-4 ${isSpecial ? 'text-white' : 'text-slate-300 group-hover/btn:text-orange-500'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">本月主打 (+25% 利潤)</span>
                             </div>
                             {isSpecial ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-200" />}
                          </button>

                          <button
                            onClick={() => togglePrePrep(item.id)}
                            className={`w-full py-4 rounded-2xl flex items-center justify-between px-6 transition-all group/btn ${isPrePrepped ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-400 hover:bg-blue-100 hover:text-blue-600'}`}
                          >
                             <div className="flex items-center gap-3">
                                <Clock className={`w-4 h-4 ${isPrePrepped ? 'text-white' : 'text-slate-300 group-hover/btn:text-blue-500'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">事前備料 (快速出餐)</span>
                             </div>
                             {isPrePrepped ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-200" />}
                          </button>
                       </div>
                     )}
                  </div>
               </motion.div>
             );
           })}
        </section>
      </div>
    </Layout>
  );
}
