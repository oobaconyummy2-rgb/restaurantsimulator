import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, Lock, DollarSign, Users, Pizza, Briefcase, Store, Award, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS } from '../constants';
import Layout from '../components/Layout';

export default function Achievements({ isComponent = false }: { isComponent?: boolean }) {
  const navigate = useNavigate();
  const { stats, money, upgrades, staff, menuState } = useGame();

  const isUnlocked = (ach: any) => {
     // This logic should match the one in constants.tsx or be centralized
     return ach.check(stats, money, upgrades, staff, menuState);
  };

  const content = (
    <div className="space-y-8">
      <section className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Trophy className="w-64 h-64 rotate-12" />
        </div>
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-500 rounded-2xl text-white shadow-xl shadow-orange-500/20">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">榮譽成就室</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.35em] mt-1">Global Restaurant Hall of Fame</p>
            </div>
          </div>
          {!isComponent && (
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = isUnlocked(ach);
            return (
              <motion.div
                key={ach.id}
                whileHover={unlocked ? { y: -5 } : {}}
                className={`
                  p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center text-center gap-6
                  ${unlocked ? 'bg-white border-orange-100 shadow-2xl shadow-orange-500/5' : 'bg-slate-50 border-slate-100 grayscale opacity-60'}
                `}
              >
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform duration-500 ${unlocked ? 'bg-orange-500 text-white scale-110 rotate-3' : 'bg-slate-200 text-slate-400'}`}>
                  {unlocked ? <CheckCircle2 className="w-10 h-10" /> : ach.icon}
                </div>
                
                <div>
                  <h4 className={`text-xl font-black mb-2 uppercase tracking-tight ${unlocked ? 'text-slate-800' : 'text-slate-400'}`}>{ach.name}</h4>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed">{ach.description}</p>
                </div>

                {unlocked ? (
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">已達成</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-slate-200 text-slate-500 rounded-full flex items-center gap-2">
                     <Lock className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">尚未解鎖</span>
                  </div>
                )}
              </motion.div>
            );
          })}
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
