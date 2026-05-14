import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Volume2, Save, Trash2, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Layout from '../components/Layout';

export default function Settings() {
  const { 
    difficulty, 
    setDifficulty, 
    autoOrderEnabled, 
    setAutoOrderEnabled, 
    autoAmountEnabled, 
    setAutoAmountEnabled,
    cheatsEnabled,
    setCheatsEnabled,
    volumes,
    setVolumes,
    resetGame
  } = useGame();

  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const handleVolumeChange = (type: 'master' | 'bgm' | 'sfx', val: number) => {
    setVolumes(prev => ({ ...prev, [type]: val }));
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-2xl text-slate-800">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">遊戲設定</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Game Preferences</p>
          </div>
        </div>

        <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-12">
          {/* Difficulty */}
          <div className="space-y-6">
             <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <h4 className="font-black text-slate-800">難度設定</h4>
             </div>
             <div className="grid grid-cols-3 gap-4">
                {(['easy', 'normal', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${difficulty === d ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {d === 'easy' ? '簡單' : d === 'normal' ? '一般' : '困難'}
                  </button>
                ))}
             </div>
          </div>

          {/* Volume */}
          <div className="space-y-6">
             <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <Volume2 className="w-5 h-5 text-orange-500" />
                <h4 className="font-black text-slate-800">音量控制</h4>
             </div>
             <div className="space-y-8">
                {Object.entries(volumes).map(([key, val]) => (
                  <div key={key} className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                       <span>{key === 'master' ? '主音量' : key === 'bgm' ? '背景音樂' : '特效音'}</span>
                       <span>{val}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => handleVolumeChange(key as any, parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                ))}
             </div>
          </div>

          {/* Automation Switches */}
          <div className="space-y-6">
             <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <Save className="w-5 h-5 text-emerald-500" />
                <h4 className="font-black text-slate-800">自動化與輔助</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                   <div>
                      <p className="font-black text-sm">自動點單助手</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Auto-Scan items</p>
                   </div>
                   <button 
                     onClick={() => setAutoOrderEnabled(!autoOrderEnabled)}
                     className={`w-14 h-8 rounded-full relative transition-colors ${autoOrderEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                   >
                     <motion.div 
                       animate={{ x: autoOrderEnabled ? 24 : 4 }}
                       className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                     />
                   </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                   <div>
                      <p className="font-black text-sm">金額連動結帳</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Auto-Fill payment</p>
                   </div>
                   <button 
                     onClick={() => setAutoAmountEnabled(!autoAmountEnabled)}
                     className={`w-14 h-8 rounded-full relative transition-colors ${autoAmountEnabled ? 'bg-blue-500' : 'bg-slate-200'}`}
                   >
                     <motion.div 
                       animate={{ x: autoAmountEnabled ? 24 : 4 }}
                       className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                     />
                   </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-amber-50 rounded-3xl border border-amber-100">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-lg text-white">
                         <Zap className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                         <p className="font-black text-sm text-amber-900">作弊模式</p>
                         <p className="text-[10px] text-amber-600/60 font-bold uppercase">Boosted Cashier (Lv.2)</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setCheatsEnabled(!cheatsEnabled)}
                     className={`w-14 h-8 rounded-full relative transition-colors ${cheatsEnabled ? 'bg-amber-500' : 'bg-slate-200'}`}
                   >
                     <motion.div 
                       animate={{ x: cheatsEnabled ? 24 : 4 }}
                       className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                     />
                   </button>
                </div>
             </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-8 border-t border-slate-100 space-y-6 text-center">
             <div className="flex items-center justify-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-black">危險區域</h4>
             </div>
             
             {!showResetConfirm ? (
               <button 
                 onClick={() => setShowResetConfirm(true)}
                 className="px-12 py-5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-3xl font-black text-sm uppercase tracking-widest border border-rose-100 transition-all flex items-center gap-3 mx-auto"
               >
                 <Trash2 className="w-5 h-5" />
                 重設遊戲進度
               </button>
             ) : (
               <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-200 border-dashed space-y-6 max-w-sm mx-auto">
                 <p className="text-rose-600 font-black text-sm uppercase tracking-tight">確定要刪除所有存檔嗎？</p>
                 <div className="flex gap-4 justify-center">
                   <button 
                     onClick={() => setShowResetConfirm(false)}
                     className="px-6 py-3 bg-white text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
                   >
                     取消
                   </button>
                   <button 
                     onClick={() => resetGame()}
                     className="px-6 py-3 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                   >
                     確定重設
                   </button>
                 </div>
               </div>
             )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
