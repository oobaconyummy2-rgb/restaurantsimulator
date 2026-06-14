import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, ArrowUpCircle, Zap, DollarSign, Star, Briefcase, ChevronRight, ChevronDown, Lock } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { INITIAL_UPGRADES, INITIAL_STAFF, STAFF_SKILLS } from '../constants';
import Layout from '../components/Layout';

export default function Upgrade({ isComponent = false }: { isComponent?: boolean }) {
  const { money, upgrades, staff, buyUpgrade, trainStaff, allocateSkillPoints, cheatsEnabled } = useGame();
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);

  const getUpgradeCost = (id: string, base: number, level: number) => Math.round(base * Math.pow(1.5, level));
  const getStaffCost = (id: string, base: number, level: number) => Math.round(base * Math.pow(1.8, level));

  const content = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Left Column: Store Upgrades */}
      <section className="space-y-4 md:space-y-6">
         <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">商店升級</h3>
              <p className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em]">Business Growth</p>
            </div>
         </div>

         <div className="space-y-4">
            {upgrades.filter(u => !u.id.startsWith('menu_')).map((u) => {
              const cost = getUpgradeCost(u.id, u.baseCost, u.level);
              const isMax = u.maxLevel !== undefined && u.level >= u.maxLevel;
              const canAfford = money >= cost || cheatsEnabled;

              return (
                <div key={u.id} className="bg-white rounded-2xl md:rounded-[1.5rem] p-4 md:p-5 border border-slate-200 shadow-sm flex items-center gap-4 group transition-all hover:shadow-md">
                   <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                      {u.icon}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                         <h4 className="font-black text-xs md:text-sm text-slate-800 truncate">{u.name}</h4>
                         <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest shrink-0">Lv.{u.level}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-normal line-clamp-2">{u.description}</p>
                   </div>
                   <button
                     disabled={isMax || !canAfford}
                     onClick={() => buyUpgrade(u.id)}
                     className={`px-4 py-2 md:px-5 md:py-3 rounded-xl font-black text-xs flex flex-col items-center gap-0.5 transition-all shrink-0 ${isMax ? 'bg-slate-100 text-slate-400' : (money >= cost || cheatsEnabled) ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/10 active:scale-95' : 'bg-slate-50 text-slate-300'}`}
                   >
                      <span>{isMax ? 'MAX' : '提升'}</span>
                      {!isMax && <span className="text-[10px] opacity-80 font-mono tracking-tighter">${cost}</span>}
                   </button>
                </div>
              );
            })}
         </div>
      </section>

      {/* Right Column: Staff Training & Skills */}
      <section className="space-y-4 md:space-y-6">
         <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">員工招募與技能</h3>
              <p className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em]">Talent Management</p>
            </div>
         </div>

         <div className="space-y-3">
            {staff.map((s) => {
              const cost = getStaffCost(s.id, s.baseCost, s.level);
              const canAfford = money >= cost || cheatsEnabled;
              const isExpanded = expandedStaff === s.id;
              const skills = STAFF_SKILLS[s.id] || [];

              return (
                <div key={s.id} className="bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="p-4 md:p-5 flex items-center gap-4 group">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shrink-0">
                        {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="font-black text-xs md:text-sm text-slate-800 flex items-center gap-1.5 truncate">
                            {s.name}
                            {s.skillPoints > 0 && (
                              <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-bounce shrink-0">
                                {s.skillPoints} pt
                              </span>
                            )}
                            {s.id === 'cashier' && (useGame() as any).cheatsEnabled && s.level < 2 && (
                              <span className="bg-amber-100 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5 shrink-0">
                                <Zap className="w-2 h-2 fill-current" />
                                外掛中
                              </span>
                            )}
                          </h4>
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest shrink-0">
                            Lv.{s.id === 'cashier' && (useGame() as any).cheatsEnabled ? Math.max(2, s.level) : s.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-normal line-clamp-2">{s.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={!canAfford}
                        onClick={() => trainStaff(s.id)}
                        className={`px-4 py-2 md:px-5 md:py-3 rounded-xl font-black text-xs flex flex-col items-center gap-0.5 transition-all shrink-0 ${canAfford ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/10 active:scale-95' : 'bg-slate-100 text-slate-300'}`}
                      >
                          <span>{s.level === 0 ? '招募' : '培訓'}</span>
                          <span className="text-[10px] opacity-80 font-mono tracking-tighter">${cost}</span>
                      </button>
                      <button 
                        onClick={() => setExpandedStaff(isExpanded ? null : s.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-all active:scale-90"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-50 border-t border-slate-100 p-4 md:p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <Star className="w-3 h-3" />
                            技能樹 (可用點數: {s.skillPoints})
                          </h5>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {skills.map(skill => {
                            const currentLevel = s.skills[skill.id] || 0;
                            const isMax = currentLevel >= skill.maxLevel;
                            const canUnlock = s.skillPoints > 0 && !isMax;
                            
                            // Check prerequisites
                            let isLocked = false;
                            if (skill.requiredSkillId) {
                              const prereqLevel = s.skills[skill.requiredSkillId] || 0;
                              if (prereqLevel === 0) isLocked = true;
                            }

                            return (
                              <div key={skill.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isLocked ? 'opacity-40 border-slate-200 bg-slate-100' : 'bg-white border-white shadow-sm'}`}>
                                <div className={`p-1.5 rounded-lg shrink-0 ${isLocked ? 'bg-slate-200 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : skill.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-black text-slate-700 text-xs">{skill.name}</span>
                                    <span className="text-[9px] font-black text-slate-400 shrink-0">Lv {currentLevel}/{skill.maxLevel}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-500 leading-tight">{skill.description}</p>
                                </div>
                                <button
                                  disabled={!canUnlock || isLocked}
                                  onClick={() => allocateSkillPoints(s.id, skill.id)}
                                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all shrink-0 ${isMax ? 'text-emerald-500' : isLocked ? 'text-slate-300' : canUnlock ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95' : 'text-slate-300'}`}
                                >
                                  {isMax ? '已封頂' : isLocked ? '尚未解鎖' : `升級 (${skill.cost}pt)`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
         </div>

         {/* Small tip card */}
         <div className="bg-emerald-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-5 animate-pulse" />
            <h4 className="text-lg font-black mb-3">技能點數機制</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              每次提升員工等級都會獲得 1 點技能點數。你可以自由分配這些點數來強化員工的特定能力，例如增加小費收入、提升服務速度或是解鎖特殊加威能。
            </p>
         </div>
      </section>
    </div>
  );

  if (isComponent) return content;

  return (
    <Layout>
      {content}
    </Layout>
  );
}
