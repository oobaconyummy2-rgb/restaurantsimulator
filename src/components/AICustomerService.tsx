import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, AlertCircle, Bot, Zap, ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function AICustomerService() {
  const { cheatsEnabled, setCheatsEnabled } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: '喵！我是星級餐廳首席AI客服助理「餐旅小喵助理」喔！這裡可以解答您的任何營運疑惑，或者為您引路呢喵！ฅ(>ω<*ฅ)',
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawVal = textToSend || inputVal;
    if (!rawVal.trim() || loading) return;

    if (!textToSend) {
      setInputVal('');
    }

    const userMessage: Message = {
      sender: 'user',
      text: rawVal,
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: rawVal })
      });

      if (!response.ok) {
        throw new Error('呼叫 API 失敗');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        sender: 'bot',
        text: data.reply || '喵嗚～連線好像短路了，請再試試喔！',
        time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `喵...連線有些問題：${err.message || '未知錯誤'}。您可以確認 Gemini API 密鑰是否綁定，或者稍後再試喔！`,
          time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const preloadQuestions = [
    "如何開啟/使用免金幣作弊模式？⚙️",
    "我想抽新推出的餐廳設備池與營運技能卡！💎",
    "遊戲內『事前備料』與『主打配額』是什麼？🍱",
    "怎麼摸到黃金招財貓並拿到百萬福澤加護？🐈"
  ];

  const handleQuestionClick = (q: string) => {
    handleSendMessage(q);
  };

  return (
    <>
      {/* Floating Button for AICustomerService */}
      <div id="ai_chat_floating_button" className="fixed bottom-6 right-24 z-[80] pointer-events-auto">
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-3.5 bg-orange-500 hover:bg-orange-600 border-3 border-orange-200 hover:border-orange-100 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce transition-all cursor-pointer"
          style={{ animationDuration: '4s' }}
        >
          {/* Notification Glow Dot */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse" />
          
          <Bot className="w-6 h-6 shrink-0" />
          
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[8px] font-black px-2 py-0.5 rounded-md whitespace-nowrap border border-slate-700 shadow-xs">
            ✨ AI 客服在線
          </div>
        </motion.button>
      </div>

      {/* Slide-out Sidebar or Large chat container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-4 z-[90] w-full max-w-[360px] md:max-w-[400px] bg-white border-2 border-orange-200 rounded-[2.5rem] shadow-[0_24px_50px_-12px_rgba(249,115,22,0.25)] flex flex-col overflow-hidden text-slate-800 pointer-events-auto h-[550px] max-h-[80vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/25">
                  <Bot className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight flex items-center gap-1">
                    星級 AI 客服
                    <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-extrabold uppercase rounded-full animate-pulse border border-emerald-400">Online</span>
                  </h4>
                  <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Restaurant Copilot</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main scrollable body messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-orange-50/20 [scrollbar-width:thin] scrollbar-thumb-orange-200">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {m.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 scroll-none shrink-0 mb-1">
                        <span className="text-xs">🐱</span>
                      </div>
                    )}
                    <div 
                      className={`p-3.5 rounded-[1.5rem] text-xs shadow-3xs leading-relaxed break-words whitespace-pre-wrap ${
                        m.sender === 'user'
                          ? 'bg-orange-500 text-white rounded-br-xs font-medium'
                          : 'bg-white text-slate-800 border border-orange-100 rounded-bl-xs font-normal'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono tracking-tighter mt-1 px-1">{m.time}</span>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-start">
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 shrink-0 mb-1">
                      <span className="text-xs">🐱</span>
                    </div>
                    <div className="bg-white border border-orange-100 p-3.5 rounded-[1.5rem] rounded-bl-xs shadow-3xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions / FAQ cards */}
            <div className="px-4 py-2 bg-white/95 border-t border-slate-100 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 shrink-0 scroll-smooth">
              {preloadQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuestionClick(q)}
                  className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100/90 border border-orange-100 text-orange-700 rounded-full text-[10px] font-black transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer shadow-3xs"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2.5 shrink-0">
              <input
                type="text"
                placeholder="輸入您的經營疑惑，或與小喵嘮嗑..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs border border-slate-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 rounded-2xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputVal.trim() || loading}
                className={`p-3 rounded-2xl text-white transition-all cursor-pointer ${inputVal.trim() && !loading ? 'bg-orange-500 hover:bg-orange-600 shadow-md active:scale-95' : 'bg-slate-100 text-slate-350 cursor-not-allowed'}`}
              >
                <Send className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
