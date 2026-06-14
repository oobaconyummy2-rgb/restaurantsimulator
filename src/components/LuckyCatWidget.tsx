import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Sparkles, 
  Clock, 
  Heart,
  X,
  Info,
  Flame,
  Zap,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export default function LuckyCatWidget() {
  const { 
    money,
    gems,
    luckyCatLastPet,
    luckyCatBuff,
    petLuckyCat,
    cheatsEnabled
  } = useGame();

  const [isOpen, setIsOpen] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [pettingSeconds, setPettingSeconds] = useState(3);
  const [catTimerText, setCatTimerText] = useState('');
  const [catBuffRemainingText, setCatBuffRemainingText] = useState('');
  const [canPet, setCanPet] = useState(true);

  // Timers and countdown state
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const cooldownMs = 60 * 1000; // 60 seconds
      const elapsed = now - luckyCatLastPet;
      
      if (elapsed < cooldownMs) {
        const remainingSecs = Math.ceil((cooldownMs - elapsed) / 1000);
        setCatTimerText(`${remainingSecs}秒`);
        setCanPet(false);
      } else {
        setCatTimerText('可觸摸');
        setCanPet(true);
      }

      if (luckyCatBuff && luckyCatBuff.expiresAt > now) {
        const remainingSecs = Math.ceil((luckyCatBuff.expiresAt - now) / 1000);
        const mins = Math.floor(remainingSecs / 60);
        const secs = remainingSecs % 60;
        setCatBuffRemainingText(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } else {
        setCatBuffRemainingText('');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [luckyCatLastPet, luckyCatBuff]);

  // Handle immediate state check on open
  useEffect(() => {
    const now = Date.now();
    const cooldownMs = 60 * 1000;
    const elapsed = now - luckyCatLastPet;
    if (elapsed < cooldownMs) {
      const remainingSecs = Math.ceil((cooldownMs - elapsed) / 1000);
      setCatTimerText(`${remainingSecs}秒`);
      setCanPet(false);
    } else {
      setCatTimerText('可觸摸');
      setCanPet(true);
    }
  }, [isOpen, luckyCatLastPet]);

  // Petting process 3 seconds handler
  const handlePetAction = () => {
    if (!canPet && !cheatsEnabled) return;
    
    setIsPetting(true);
    setPettingSeconds(3);

    const pettingInterval = setInterval(() => {
      setPettingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(pettingInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      setIsPetting(false);
      // Trigger game context petting
      petLuckyCat();
    }, 3000);
  };

  return (
    <>
      {/* 1. Global Floating Button */}
      <div className="fixed bottom-6 right-6 z-[80] pointer-events-auto">
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-3.5 rounded-full shadow-2xl flex items-center justify-center border-3 transition-colors ${
            canPet || cheatsEnabled
              ? 'bg-amber-100 hover:bg-amber-50 border-amber-400 text-amber-700 animate-bounce'
              : 'bg-slate-100 border-slate-300 text-slate-500'
          }`}
          style={{ animationDuration: '3s' }}
        >
          {/* Notification Glow Dot */}
          {(canPet || cheatsEnabled) && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-amber-100 animate-ping" />
          )}

          {/* Cute Cat Silhouette Icon */}
          <span className="text-2xl select-none leading-none">🐈</span>
          
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[8px] font-black px-2 py-0.5 rounded-md whitespace-nowrap border border-slate-700">
            招財貓 {canPet || cheatsEnabled ? '可擼' : catTimerText}
          </div>
        </motion.button>
      </div>

      {/* 2. Lucky Cat Temple Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-[3rem] w-full max-w-md p-6 relative border-4 border-amber-400 shadow-2xl text-slate-800"
            >
              {/* Close button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-200 text-[10px] font-extrabold tracking-widest uppercase">
                  ✨ 喵吉招福小神殿 ✨
                </div>
                
                <h3 className="text-2xl font-black text-slate-900">黃金招財貓 🐈</h3>
                <p className="text-slate-500 text-xs px-2 leading-relaxed">
                  每 60 秒可以觸摸一次喵吉。摸摸他有高機率獲得加護祝福，甚至直接獲贈天外飛來大筆金福意外財！
                </p>

                {/* Animated cat graphics */}
                <div className="py-2 flex justify-center">
                  <div className="w-28 h-28 relative flex items-center justify-center bg-amber-50 border-2 border-amber-200 rounded-full shadow-inner">
                    {/* Waving Paw Arm */}
                    <motion.div 
                      animate={{ rotate: [15, -20, 15] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      style={{ transformOrigin: "bottom left" }}
                      className="absolute top-5 left-[15px] w-5 h-10 bg-yellow-400 rounded-full border-2 border-slate-900 z-20 flex items-start justify-center pt-1.5 shadow-md"
                    >
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900" />
                    </motion.div>

                    {/* Cat body & ears */}
                    <div className="w-16 h-20 bg-white rounded-t-[35px] rounded-b-[40px] border-2 border-slate-900 relative flex flex-col items-center justify-center overflow-hidden shadow-sm z-15">
                      <div className="absolute top-[40px] w-4.5 h-4.5 bg-yellow-400 rounded-full border border-slate-900 flex items-center justify-center font-black text-[6px] text-slate-900">
                        福
                      </div>
                      <div className="absolute -top-1 left-0.5 w-5 h-5 bg-white border-2 border-slate-900 rotate-45 rounded-tr" />
                      <div className="absolute -top-1 right-0.5 w-5 h-5 bg-white border-2 border-slate-900 -rotate-45 rounded-tl" />
                      <div className="absolute top-0.5 left-2 w-2 h-2 bg-pink-300 rotate-45 rounded-tr-xs" />
                      <div className="absolute top-0.5 right-2 w-2 h-2 bg-pink-300 -rotate-45 rounded-tl-xs" />

                      <div className="absolute top-5 flex gap-2.5">
                        <span className="text-[6px] font-black text-slate-900">⌒</span>
                        <span className="text-[6px] font-black text-slate-900">⌒</span>
                      </div>
                      
                      <div className="absolute top-6 left-2.5 w-2 h-0.5 bg-red-300 rounded-full" />
                      <div className="absolute top-6 right-2.5 w-2 h-0.5 bg-red-300 rounded-full" />
                      
                      <div className="absolute top-[30px] w-10 h-3 bg-red-600 border-b border-slate-900 rounded-b-full text-[5px] text-white flex items-center justify-center font-bold">
                        招財貓
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time blessings stat */}
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">當前喵吉神恩加護</span>
                    {luckyCatBuff && luckyCatBuff.expiresAt > Date.now() && (
                      <span className="text-[10px] font-mono text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {catBuffRemainingText || '生效中'}
                      </span>
                    )}
                  </div>

                  {luckyCatBuff && luckyCatBuff.expiresAt > Date.now() ? (
                    <div className="flex items-start gap-2.5">
                      <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                        <Sparkles className="w-4 h-4 animate-spin" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-amber-700">{luckyCatBuff.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{luckyCatBuff.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs py-1.5 italic text-center">
                      目前暫無任何福德狀態生效中，趕快摸摸他吧！
                    </div>
                  )}
                </div>

                {/* Pet Button */}
                <button
                  onClick={handlePetAction}
                  disabled={!canPet && !cheatsEnabled}
                  className={`w-full py-4 rounded-3xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg border-2 ${
                    canPet || cheatsEnabled
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 border-amber-400 text-slate-900 active:scale-95'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {canPet || cheatsEnabled ? (
                    <>
                      <Heart className="w-4 h-4 fill-current text-red-500 animate-pulse" />
                      溫柔撫摸喵吉 (立即招福)
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      喵吉睡覺中 ({catTimerText}後可摸)
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 3-Second Interactive Tenor Petting Animation Overlay */}
      <AnimatePresence>
        {isPetting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/90 flex flex-col items-center justify-center p-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="space-y-6 max-w-sm w-full"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30 text-[10px] font-black uppercase tracking-widest">
                <Heart className="w-3 h-3 fill-current text-red-500 animate-bounce" />
                舒服按摩喵吉中！
              </div>

              {/* Tenor Embed Iframe */}
              <div className="w-[320px] h-[320px] max-w-full rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden relative bg-slate-950">
                <iframe 
                  src="https://tenor.com/embed/9479810553422426648" 
                  className="w-full h-full pointer-events-none" 
                  frameBorder="0" 
                  allowFullScreen
                ></iframe>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-white">「呼嚕嚕...喵～🌸」</h4>
                <div className="w-48 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
                  />
                </div>
                <p className="text-slate-400 text-xs font-mono font-bold tracking-widest">
                  擼貓剩餘：{pettingSeconds}秒
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
