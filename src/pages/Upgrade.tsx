import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, ArrowUpCircle, Zap, DollarSign, Star, Briefcase, ChevronRight, ChevronDown, Lock } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { INITIAL_UPGRADES, INITIAL_STAFF, STAFF_SKILLS } from '../constants';
import Layout from '../components/Layout';

export default function Upgrade({ isComponent = false }: { isComponent?: boolean }) {
  const { money, upgrades, staff, buyUpgrade, trainStaff, allocateSkillPoints } = useGame();
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);

  const getUpgradeCost = (id: string, base: number, level: number) => Math.round(base * Math.pow(1.5, level));
  const getStaffCost = (id: string, base: number, level: number) => Math.round(base * Math.pow(1.8, level));

  const content = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Column: Store Upgrades */}
      <section className="space-y-8">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">商店升級</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Business Growth</p>
            </div>
         </div>

         <div className="space-y-4">
            {upgrades.filter(u => !u.id.startsWith('menu_')).map((u) => {
              const cost = getUpgradeCost(u.id, u.baseCost, u.level);
              const isMax = u.maxLevel !== undefined && u.level >= u.maxLevel;
              const canAfford = money >= cost;

              return (
                <div key={u.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center gap-6 group transition-all hover:shadow-lg">
                   <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {u.icon}
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                         <h4 className="font-black text-slate-800">{u.name}</h4>
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Lv.{u.level}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{u.description}</p>
                   </div>
                   <button
                     disabled={isMax || !canAfford}
                     onClick={() => buyUpgrade(u.id)}
                     className={`px-6 py-4 rounded-[1.5rem] font-black text-sm flex flex-col items-center gap-1 transition-all ${isMax ? 'bg-slate-100 text-slate-400' : canAfford ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-95' : 'bg-slate-50 text-slate-300'}`}
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
      <section className="space-y-8">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">員工招募與技能</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Talent Management</p>
            </div>
         </div>

         <div className="space-y-4">
            {staff.map((s) => {
              const cost = getStaffCost(s.id, s.baseCost, s.level);
              const canAfford = money >= cost;
              const isExpanded = expandedStaff === s.id;
              const skills = STAFF_SKILLS[s.id] || [];

              return (
                <div key={s.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-lg">
                  <div className="p-6 flex items-center gap-6 group">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        {s.icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-black text-slate-800 flex items-center gap-2">
                            {s.name}
                            {s.skillPoints > 0 && (
                              <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-bounce">
                                {s.skillPoints} pts
                              </span>
                            )}
                            {s.id === 'cashier' && (useGame() as any).cheatsEnabled && s.level < 2 && (
                              <span className="bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                                <Zap className="w-2 h-2 fill-current" />
                                作弊增強中
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            Lv.{s.id === 'cashier' && (useGame() as any).cheatsEnabled ? Math.max(2, s.level) : s.level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{s.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={!canAfford}
                        onClick={() => trainStaff(s.id)}
                        className={`px-6 py-4 rounded-[1.5rem] font-black text-sm flex flex-col items-center gap-1 transition-all ${canAfford ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95' : 'bg-slate-100 text-slate-300'}`}
                      >
                          <span>{s.level === 0 ? '招募' : '培訓'}</span>
                          <span className="text-[10px] opacity-80 font-mono tracking-tighter">${cost}</span>
                      </button>
                      <button 
                        onClick={() => setExpandedStaff(isExpanded ? null : s.id)}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all active:scale-90"
                      >
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-emerald-500" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-50 border-t border-slate-100 p-6 space-y-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
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
                              <div key={skill.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isLocked ? 'opacity-40 border-slate-200 bg-slate-100' : 'bg-white border-white shadow-sm'}`}>
                                <div className={`p-2 rounded-lg ${isLocked ? 'bg-slate-200 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {isLocked ? <Lock className="w-4 h-4" /> : skill.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-slate-700 text-xs">{skill.name}</span>
                                    <span className="text-[9px] font-black text-slate-400">Lv {currentLevel}/{skill.maxLevel}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500">{skill.description}</p>
                                </div>
                                <button
                                  disabled={!canUnlock || isLocked}
                                  onClick={() => allocateSkillPoints(s.id, skill.id)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${isMax ? 'text-emerald-500' : isLocked ? 'text-slate-300' : canUnlock ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95' : 'text-slate-300'}`}
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
