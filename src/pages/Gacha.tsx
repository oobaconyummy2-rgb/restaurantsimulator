import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { GACHA_CARDS } from '../constants';
import { GachaCard } from '../types';
import { 
  Sparkles, 
  Check, 
  Clock, 
  User, 
  ChefHat, 
  Users, 
  CreditCard, 
  Trash2, 
  Store, 
  RefreshCw, 
  Info,
  Layers,
  ChevronRight,
  Filter,
  Flame,
  Award,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Gacha({ isComponent }: { isComponent?: boolean }) {
  const { 
    gems,
    ownedCardIds, 
    equippedCards, 
    drawCard, 
    drawTenCards, 
    equipCard, 
    staff,
    cheatsEnabled,
    setCheatsEnabled,
    setGems
  } = useGame();

  const [activeTab, setActiveTab] = useState<'recruit' | 'deployment'>('recruit');
  const [selectedPool, setSelectedPool] = useState<'all' | 'equipment' | 'skills' | 'decor'>('equipment');
  
  // Drag and drop active states
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverRoleId, setDragOverRoleId] = useState<string | null>(null);
  
  // Cinematic states for extraction pull results
  const [isDrawing, setIsDrawing] = useState(false);
  const [pullResults, setPullResults] = useState<GachaCard[]>([]);
  const [highestRarityPulled, setHighestRarityPulled] = useState<'R' | 'S' | 'SR' | 'SSR'>('R');
  const [extractionStep, setExtractionStep] = useState<'chains' | 'reveal'>('chains');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Deployment drawer state
  const [selectedRoleForPanel, setSelectedRoleForPanel] = useState<string | null>(null);

  // Find GachaCard by ID (safe lookup)
  const getCardById = (id: string) => GACHA_CARDS.find(c => c.id === id);

  // Auto Equip best available cards for active slots
  const handleAutoEquipBest = () => {
    const roles = ['waiter', 'cashier', 'chef', 'host', 'cleaner', 'manager'];
    let countEquipped = 0;

    roles.forEach(roleId => {
      const member = staff.find(s => s.id === roleId);
      const isHired = roleId === 'manager' || (member && member.level >= 1);
      if (!isHired) return;

      const candidateCards = GACHA_CARDS.filter(c => c.professionId === roleId && ownedCardIds.includes(c.id));
      if (candidateCards.length === 0) return;

      const rarityScores = { 'SSR': 4, 'SR': 3, 'S': 2, 'R': 1 };
      const bestCard = candidateCards.reduce((best, current) => {
        return (rarityScores[current.rarity] || 0) > (rarityScores[best.rarity] || 0) ? current : best;
      }, candidateCards[0]);

      if (equippedCards[roleId] !== bestCard.id) {
        equipCard(roleId, bestCard.id);
        countEquipped++;
      }
    });

    if (countEquipped > 0) {
      confetti({ particleCount: 30, spread: 60 });
    }
  };

  // Group owned cards by ID for counting duplicates
  const ownedCardsCount = ownedCardIds.reduce((acc, cardId) => {
    acc[cardId] = (acc[cardId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Execute single pull with cinematic transition
  const handleSinglePull = (isCheat: boolean = false) => {
    const isActuallyCheat = isCheat || cheatsEnabled;
    if (!isActuallyCheat && gems < 1000) {
      return; 
    }

    setIsDrawing(true);
    setExtractionStep('chains');
    
    const card = drawCard(isCheat, selectedPool === 'all' ? undefined : selectedPool);
    if (card) {
      setPullResults([card]);
      setHighestRarityPulled(card.rarity);
      
      setTimeout(() => {
        setExtractionStep('reveal');
        if (card.rarity === 'SSR') {
          triggerSpecialCelebration();
        }
      }, 1500);
    } else {
      setIsDrawing(false);
    }
  };

  // Execute ten pulls with cinematic transition
  const handleTenPulls = (isCheat: boolean = false) => {
    const costTen = 9000;
    const isActuallyCheat = isCheat || cheatsEnabled;
    if (!isActuallyCheat && gems < costTen) {
      return;
    }

    setIsDrawing(true);
    setExtractionStep('chains');

    const cards = drawTenCards(isCheat, selectedPool === 'all' ? undefined : selectedPool);
    if (cards && cards.length > 0) {
      setPullResults(cards);
      
      const hasSsr = cards.some(c => c.rarity === 'SSR');
      const hasSr = cards.some(c => c.rarity === 'SR');
      setHighestRarityPulled(hasSsr ? 'SSR' : hasSr ? 'SR' : 'R');

      setTimeout(() => {
        setExtractionStep('reveal');
        if (hasSsr) {
          triggerSpecialCelebration();
        }
      }, 1500);
    } else {
      setIsDrawing(false);
    }
  };

  const triggerSpecialCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  const getCardStars = (rarity: 'R' | 'S' | 'SR' | 'SSR') => {
    switch (rarity) {
      case 'SSR': return '✦✦✦✦';
      case 'SR': return '✦✦✦';
      case 'S': return '✦✦';
      default: return '✦';
    }
  };

  const getRarityBadgeColor = (rarity: 'R' | 'S' | 'SR' | 'SSR') => {
    switch (rarity) {
      case 'SSR': return 'bg-rose-50 text-rose-600 border-rose-200 font-extrabold';
      case 'SR': return 'bg-amber-50 text-amber-600 border-amber-200 font-bold';
      case 'S': return 'bg-purple-50 text-purple-600 border-purple-200 font-bold';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getProfessionIcon = (id: string, sizeClass = "w-4 h-4") => {
    switch (id) {
      case 'manager': return <Crown className={`${sizeClass} text-yellow-500 fill-yellow-100 animate-pulse`} />;
      case 'waiter': return <Users className={`${sizeClass} text-blue-500`} />;
      case 'cashier': return <CreditCard className={`${sizeClass} text-emerald-500`} />;
      case 'chef': return <ChefHat className={`${sizeClass} text-orange-500`} />;
      case 'host': return <Store className={`${sizeClass} text-purple-500`} />;
      case 'cleaner': return <Trash2 className={`${sizeClass} text-slate-500`} />;
      default: return <User className={`${sizeClass}`} />;
    }
  };

  const getProfessionName = (id: string) => {
    if (id === 'manager') return '全能店長掌權官';
    const s = staff.find(x => x.id === id);
    return s ? s.name : id;
  };

  return (
    <div id="gacha_hub_container" className="max-w-6xl mx-auto space-y-6 text-slate-800">
      
      {/* 1. Header with Gem Balance */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-200 text-[10px] font-extrabold tracking-widest uppercase">
            ✨ 精英職業稱號與特聘招募大廳 ✨
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            高階特殊職業稱號與團隊天賦
          </h2>
          <p className="text-slate-500 text-xs max-w-xl leading-relaxed">
            在這裡招募強大的餐廳營運稱號與特製員工合規資格！抽取獨一無二的奇蹟頭銜，並將他們指派部署入對應團隊，能為大廳、收銀、後廚、帶位與翻桌清潔帶來不可思議的速度和利潤加權。
          </p>
        </div>

        {/* Gem Rating & Cheat Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 z-10">
          {/* Direct Cheat Mode Toggle */}
          <button
            onClick={() => setCheatsEnabled(!cheatsEnabled)}
            className={`px-3.5 py-2.5 rounded-2xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-2 border cursor-pointer select-none active:scale-95 ${
              cheatsEnabled 
                ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-xs ring-2 ring-amber-300/30' 
                : 'bg-white hover:bg-slate-50 border-slate-250 text-slate-400 hover:text-slate-600 shadow-2xs'
            }`}
            title="點擊切換開發者免代幣招募作弊"
          >
            <span className="animate-spin" style={{ animationDuration: '3s' }}>⚙️</span>
            {cheatsEnabled ? '作弊招募：已啟用' : '啟用作弊招募'}
          </button>

          {/* Quick Gems Injector */}
          {cheatsEnabled && (
            <button
              onClick={() => {
                setGems((g: number) => g + 50000);
                confetti({ particleCount: 15, spread: 45 });
              }}
              className="px-3.5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 border border-purple-300 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              💎 補給 +50,000 鑽
            </button>
          )}

          {/* Core Gem balance */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-right min-w-[150px] shadow-sm">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">可用招募寶石</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xl">💎</span>
              <span className="text-2xl font-black text-purple-600 font-mono tracking-tight">{gems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('recruit')}
          className={`px-6 py-3.5 font-black text-xs uppercase tracking-widest border-b-2 transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'recruit' 
              ? 'border-amber-500 text-amber-600 bg-amber-50/20' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          職業稱號招募 (Titles Draw)
        </button>
        <button
          onClick={() => setActiveTab('deployment')}
          className={`px-6 py-3.5 font-black text-xs uppercase tracking-widest border-b-2 transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'deployment' 
              ? 'border-purple-500 text-purple-600 bg-purple-50/20' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-500" />
          專業裝備與證照任命 ({ownedCardIds.length})
        </button>
      </div>

      {/* RENDER TAB content */}
      {activeTab === 'recruit' ? (
        <div className="space-y-6">
          {/* Subpool switch tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100/70 p-2 rounded-[2rem] border border-slate-200 shadow-sm">
            {[
              { id: 'equipment', label: '🍳 頂級餐旅設備池', color: 'border-orange-200 text-orange-700' },
              { id: 'skills', label: '⚡ 超群營運技能池', color: 'border-amber-200 text-amber-700' },
              { id: 'decor', label: '🎨 奢華空間裝飾池', color: 'border-purple-200 text-purple-700' },
              { id: 'all', label: '👥 綜合裝備與稱號池', color: 'border-blue-200 text-blue-700' }
            ].map(pool => (
              <button
                key={pool.id}
                onClick={() => setSelectedPool(pool.id as any)}
                className={`py-3.5 px-4 rounded-2xl text-xs font-black tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-1.5 border active:scale-95 cursor-pointer ${
                  selectedPool === pool.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md font-extrabold'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 font-bold hover:text-slate-800'
                }`}
              >
                {pool.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-250/80 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Side: Dynamic Pool description matching user selection */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black tracking-wider rounded-lg uppercase mb-2">
                    ✨ CURRENT MATCH: 12% SSR rate ✨
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {selectedPool === 'equipment' && '🥘 頂級生鮮與收銀設備特選池'}
                    {selectedPool === 'skills' && '⚡ 傳奇營運動態技能特權池'}
                    {selectedPool === 'decor' && '🎨 奢華空間美學裝飾招牌池'}
                    {selectedPool === 'all' && '👥 專業技能設備與各崗位證照綜合池'}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    {selectedPool === 'equipment' && '本卡池為您專屬提供最尖端的智能大師電器與極速備餐廚具（包括太空金屬粒子烤爐、量子重力光速洗滌艙、生命原力熟成庫）。提升食物與服務星級！'}
                    {selectedPool === 'skills' && '本卡池為您解鎖包括全球社群打卡風暴、夢幻大胃王牛排盛宴、好友積分卡等強大常駐加權特權。一鍵優化獲客與客單價！'}
                    {selectedPool === 'decor' && '本卡池專注於解鎖極速流光戰袍、3D 裸眼動態投影看板、高雅綠化懸浮牆。大幅增加全員跑速、餐廳裝飾星級與帶位效率！'}
                    {selectedPool === 'all' && '本卡池為全方位的頂奢大滿貫卡池，包含所有頂級餐廚大師電器、超群營運傳奇技能、奢華大堂裝飾配置及店長跨國祕籍證照！配備至席位即刻倍增全盤營收！'}
                  </p>
                </div>

                {/* Profiles lists showcasing rare items in current active subpool */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedPool === 'equipment' ? (
                    <>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-rose-50 text-rose-500 p-2 rounded-xl mb-1 text-sm">🌌</div>
                        <p className="font-extrabold text-[11px] text-slate-800">太空粒子烤爐 (SSR)</p>
                        <span className="text-[9px] text-rose-600 font-bold block mt-0.5">製作速+50% 售價+18%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-amber-50 text-amber-500 p-2 rounded-xl mb-1 text-sm">💦</div>
                        <p className="font-extrabold text-[11px] text-slate-800">量子重力洗滌艙 (SSR)</p>
                        <span className="text-[9px] text-amber-600 font-bold block mt-0.5">服務翻桌清潔速度 +70%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-blue-50 text-blue-500 p-2 rounded-xl mb-1 text-sm">💳</div>
                        <p className="font-extrabold text-[11px] text-slate-800">智能視覺收銀台 (SR)</p>
                        <span className="text-[9px] text-blue-600 font-bold block mt-0.5">結算加壓 +65%</span>
                      </div>
                    </>
                  ) : selectedPool === 'skills' ? (
                    <>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-rose-50 text-rose-500 p-2 rounded-xl mb-1 text-sm">🚀</div>
                        <p className="font-extrabold text-[11px] text-slate-800">社群頂流風暴 (SSR)</p>
                        <span className="text-[9px] text-rose-600 font-bold block mt-0.5">客流量生成快 +50%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-amber-50 text-amber-500 p-2 rounded-xl mb-1 text-sm">🍖</div>
                        <p className="font-extrabold text-[11px] text-slate-800">大胃王皇家海陸 (SSR)</p>
                        <span className="text-[9px] text-amber-600 font-bold block mt-0.5">客單平均收益 +22%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-blue-50 text-blue-500 p-2 rounded-xl mb-1 text-sm">🌟</div>
                        <p className="font-extrabold text-[11px] text-slate-800">主廚極速備餐 (SSR)</p>
                        <span className="text-[9px] text-blue-600 font-bold block mt-0.5">備餐效率 +40%</span>
                      </div>
                    </>
                  ) : selectedPool === 'decor' ? (
                    <>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-rose-50 text-rose-500 p-2 rounded-xl mb-1 text-sm">🛸</div>
                        <p className="font-extrabold text-[11px] text-slate-800">裸眼銀河 3D 牆 (SSR)</p>
                        <span className="text-[9px] text-rose-600 font-bold block mt-0.5">布置星+0.8 患者耐力+30%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-amber-50 text-amber-500 p-2 rounded-xl mb-1 text-sm">🔥</div>
                        <p className="font-extrabold text-[11px] text-slate-800">流光創世戰衣 (SSR)</p>
                        <span className="text-[9px] text-amber-600 font-bold block mt-0.5">店內全體伙計移速+30%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-blue-50 text-blue-500 p-2 rounded-xl mb-1 text-sm">🎯</div>
                        <p className="font-extrabold text-[11px] text-slate-800">3D 看板投影 (SR)</p>
                        <span className="text-[9px] text-blue-600 font-bold block mt-0.5">客流量率常駐 +22%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-rose-50 text-rose-500 p-2 rounded-xl mb-1 text-sm">👑</div>
                        <p className="font-extrabold text-[11px] text-slate-800">跨國經管祕籍 (SSR)</p>
                        <span className="text-[9px] text-rose-600 font-bold block mt-0.5">全員虛擬等級 +3</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-amber-50 text-amber-500 p-2 rounded-xl mb-1 text-sm">🌌</div>
                        <p className="font-extrabold text-[11px] text-slate-800">超空間全息投影 (SSR)</p>
                        <span className="text-[9px] text-amber-600 font-bold block mt-0.5">顧客初始耐心 +30%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-blue-50 text-blue-500 p-2 rounded-xl mb-1 text-sm">⚡</div>
                        <p className="font-extrabold text-[11px] text-slate-800">重力懸浮滑板 (SSR)</p>
                        <span className="text-[9px] text-blue-600 font-bold block mt-0.5">服務生移速 +35%</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Info Note description */}
                <div className="border border-slate-150/65 bg-slate-50/70 rounded-2xl p-4 text-xs text-slate-500 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-slate-700">招募規則詳情：</span>
                    SSR 星級稱號機率 12% | SR 級別 28% | S 級別 25% | R 級別 35%。所召募出的神級電器與技能特訓可裝載於任命席位以獲得全局加載。
                  </div>
                </div>
              </div>

              {/* Right Side: Action cards buttons representing desk contract book */}
              <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-center pb-2 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    {selectedPool === 'equipment' && '頂級設備合同處'}
                    {selectedPool === 'skills' && '傳奇技能特訓點'}
                    {selectedPool === 'decor' && '奢華美學裝飾坊'}
                    {selectedPool === 'all' && '專項稱號與備置班'}
                  </span>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    簽署專項抽取協議 (當前已選
                    {selectedPool === 'equipment' && ' 設備 '}
                    {selectedPool === 'skills' && ' 技能 '}
                    {selectedPool === 'decor' && ' 裝飾 '}
                    {selectedPool === 'all' && ' 綜合 '}
                    卡池)
                  </p>
                </div>

                {/* Pull One */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleSinglePull(false)}
                    className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 text-slate-800 font-black transition-all active:scale-98 shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">SINGLE DRAW</span>
                      <span className="text-xs text-slate-700">簽署單份招募資歷</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-750 px-3 py-1.5 rounded-xl border border-amber-200">
                      <span>💎</span>
                      <span className="font-mono font-black text-sm">1,000</span>
                    </div>
                  </button>

                  {cheatsEnabled && (
                    <button
                      onClick={() => handleSinglePull(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-dashed border-amber-300 text-amber-900 text-[10px] font-black transition-all active:scale-98 flex items-center justify-between shadow-xs select-none cursor-pointer"
                    >
                      <span>⚡ [作弊專屬] 免幣單抽</span>
                      <span className="text-[9px] font-mono text-amber-700 bg-white/85 px-2 py-0.5 rounded border border-amber-200 font-extrabold uppercase">Free 抽</span>
                    </button>
                  )}
                </div>

                {/* Pull Ten */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleTenPulls(false)}
                    className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-black transition-all active:scale-98 shadow-md flex items-center justify-between group cursor-pointer"
                  >
                    <div className="text-left text-slate-950">
                      <span className="text-[10px] text-amber-900 font-bold uppercase tracking-widest block">BULK DRAW (10% OFF)</span>
                      <span className="text-xs font-bold text-slate-900">簽署十連特訓與專項招募</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-950/80 text-yellow-400 px-3 py-1.5 rounded-xl">
                      <span>💎</span>
                      <span className="font-mono font-black text-sm">9,000</span>
                    </div>
                  </button>

                  {cheatsEnabled && (
                    <button
                      onClick={() => handleTenPulls(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-dashed border-purple-300 text-purple-900 text-[10px] font-black transition-all active:scale-98 flex items-center justify-between shadow-xs select-none cursor-pointer"
                    >
                      <span>🌟 [作弊專屬] 免幣十連</span>
                      <span className="text-[9px] font-mono text-purple-700 bg-white/85 px-2 py-0.5 rounded border border-purple-200 font-extrabold uppercase">Free 十連</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Micro developer cheats layout */}
            {cheatsEnabled && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity bg-slate-50/90 p-2 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[9px] font-black text-slate-500">⚙️ 作弊招募：</span>
                <button
                  onClick={() => handleSinglePull(true)}
                  className="bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer"
                >
                  免幣單抽
                </button>
                <button
                  onClick={() => handleTenPulls(true)}
                  className="bg-white hover:bg-purple-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer"
                >
                  免幣十連
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SPECIAL STAFF DEPLOYMENT HUB (Tab 2) */
        <div className="space-y-6">
          
          {/* Top Section with deployment status card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                  <Layers className="w-5 h-5 text-purple-600" />
                  職位特殊稱號與專任裝備分派 (店長席解鎖)
                </h3>
                <p className="text-xs text-slate-500">
                  將您所招募到的特殊裝備卡或高階職位稱號配備至對應崗位（含全局店長室），每種職別限指派一名精英稱號或配備！指派後即可啟動全局效率與被動屬性加成。
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={handleAutoEquipBest}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="自動掃描背包中的最高星級/稀有度稱號與裝備外裝並分派"
                >
                  <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
                  一鍵配置最佳效果
                </button>
              </div>
            </div>

            {/* Slots allocation board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                ...staff,
                { id: 'manager', name: '店長室', level: 1 }
              ].map(member => {
                const isHired = member.id === 'manager' || member.level >= 1;
                const deployedCardId = equippedCards[member.id];
                const card = deployedCardId ? getCardById(deployedCardId) : null;
                
                const isSelectedForDrop = dragOverRoleId === member.id;
                const isCompatibleWithDragged = draggedCardId && (
                  getCardById(draggedCardId)?.professionId === member.id
                );

                return (
                  <div 
                    key={member.id}
                    onDragOver={(e) => {
                      if (!isHired) return;
                      if (draggedCardId) {
                        const dCard = getCardById(draggedCardId);
                        if (dCard && dCard.professionId === member.id) {
                          e.preventDefault(); // crucial to permit dropped actions
                        }
                      }
                    }}
                    onDragEnter={() => {
                      if (!isHired) return;
                      if (draggedCardId) {
                        const dCard = getCardById(draggedCardId);
                        if (dCard && dCard.professionId === member.id) {
                          setDragOverRoleId(member.id);
                        }
                      }
                    }}
                    onDragLeave={() => {
                      setDragOverRoleId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverRoleId(null);
                      const cardId = e.dataTransfer.getData("text/plain");
                      const dCard = getCardById(cardId);
                      if (dCard && dCard.professionId === member.id && isHired) {
                        equipCard(member.id, cardId);
                      }
                    }}
                    className={`rounded-2xl p-4 border flex flex-col justify-between shadow-xs relative overflow-hidden transition-all duration-300 ${
                      isHired 
                        ? isSelectedForDrop
                          ? 'border-purple-600 bg-purple-50 scale-102 ring-2 ring-purple-400 shadow-md z-15'
                          : isCompatibleWithDragged
                          ? 'border-dashed border-purple-400 bg-purple-50/10 animate-bounce-subtle z-10'
                          : 'border-slate-200 bg-white'
                        : 'border-slate-100 opacity-55 bg-slate-50/50'
                    }`}
                    style={{ 
                      animation: isCompatibleWithDragged && !isSelectedForDrop ? 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' 
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-extrabold text-xs text-slate-800 truncate">
                            {member.id === 'manager' ? '👑 店長席' : `${member.name}組`}
                          </p>
                          <p className="text-[9px] text-slate-500 font-extrabold font-mono tracking-wider">
                            {member.id === 'manager' ? '全局特殊加成' : (isHired ? `主動招募 Lv.${member.level}` : '尚未解鎖此職組')}
                          </p>
                        </div>
                        <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                          {getProfessionIcon(member.id)}
                        </div>
                      </div>

                      {card ? (
                        <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-xl space-y-1.5">
                          <p className="text-[10px] font-black text-purple-800 truncate">{card.name}</p>
                          <div className="flex items-center justify-between">
                            <span className={`inline-block px-1 py-0.2 text-[8px] font-extrabold rounded border ${getRarityBadgeColor(card.rarity)}`}>
                              {card.rarity} {getCardStars(card.rarity)}
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded leading-snug">
                            {card.buffLabel}
                          </p>
                        </div>
                      ) : (
                        <button
                          disabled={!isHired}
                          onClick={() => setSelectedRoleForPanel(member.id)}
                          className={`w-full border border-dashed rounded-xl p-4 text-center text-slate-400 text-xs min-h-[90px] flex flex-col items-center justify-center transition-all ${
                            isHired 
                              ? isCompatibleWithDragged
                                ? 'border-purple-300 text-purple-500 bg-purple-100/10'
                                : 'border-slate-300 hover:border-purple-400 hover:text-purple-600 bg-slate-50/30' 
                              : 'border-slate-200'
                          }`}
                        >
                          <span className="text-xl mb-1">+</span>
                          <span className="text-[10px] font-bold">點擊或拖入稱號</span>
                        </button>
                      )}
                    </div>

                    <div className="mt-4 animate-fadeIn">
                      {isHired ? (
                        card ? (
                          <button
                            onClick={() => equipCard(member.id, null)}
                            className="w-full text-center py-1.5 bg-slate-50 hover:bg-red-50 text-[10px] font-black text-red-500 border border-slate-200 hover:border-red-200 rounded-lg transition-all cursor-pointer"
                          >
                            卸下此職務稱號
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedRoleForPanel(member.id)}
                            className="w-full text-center py-1.5 bg-purple-50 hover:bg-purple-100 text-[10px] font-black text-purple-600 border border-purple-100 rounded-lg transition-all cursor-pointer"
                          >
                            分派特勤稱號
                          </button>
                        )
                      ) : (
                        <span className="block text-center text-[9px] font-bold text-slate-400 bg-slate-100 py-1.5 rounded-lg">
                          請先去主頁升級聘員
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special staff bag listing */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h3 className="text-md font-black uppercase tracking-tight text-slate-800 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-slate-400" />
                  旗下已解鎖裝備與專業證照檔案庫
                </h3>
                <p className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 inline-block">
                  💡 玩法提示：直接按住卡片「拖曳」並放入上方崗位以利極速分派，也支持一鍵自動配置！
                </p>
              </div>

              {/* Department Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 sm:pb-0">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 text-[10px] rounded-lg font-black tracking-wider transition-all border ${
                    activeFilter === 'all' 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  全部裝備與證照
                </button>
                {['waiter', 'cashier', 'chef', 'host', 'cleaner', 'manager'].map(profId => (
                  <button
                    key={profId}
                    onClick={() => setActiveFilter(profId)}
                    className={`px-3 py-1.5 text-[10px] rounded-lg font-black tracking-wider transition-all border flex items-center gap-1.5 ${
                      activeFilter === profId 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {getProfessionIcon(profId, "w-3 h-3")}
                    {getProfessionName(profId)}
                  </button>
                ))}
              </div>
            </div>

            {/* Owned cards roster */}
            {ownedCardIds.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <RefreshCw className="w-10 h-10 text-slate-300 mx-auto animate-spin" />
                <p className="font-extrabold text-sm">目前旗下尚未獲得任何裝備或解鎖特別職位稱號</p>
                <p className="text-xs">請轉至 【職業稱號招募】 簽署招募合約即可引入星級資歷天賦！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(ownedCardsCount).map(([cardId, count]) => {
                  const card = getCardById(cardId);
                  if (!card) return null;
                  if (activeFilter !== 'all' && card.professionId !== activeFilter) return null;

                  const isEquipped = equippedCards[card.professionId] === cardId;
                  const isRoleHired = card.professionId === 'manager' || (staff.find(x => x.id === card.professionId)?.level || 0) >= 1;

                  return (
                    <div 
                      key={card.id}
                      draggable={isRoleHired && !isEquipped}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", card.id);
                        setDraggedCardId(card.id);
                      }}
                      onDragEnd={() => {
                        setDraggedCardId(null);
                      }}
                      className={`rounded-2xl border p-4 flex flex-col justify-between transition-all hover:shadow-md bg-white relative overflow-hidden group select-none ${
                        isEquipped 
                          ? 'opacity-85 border-slate-100 bg-slate-50/50' 
                          : isRoleHired 
                          ? 'cursor-grab active:cursor-grabbing hover:scale-101 border-slate-200' 
                          : 'border-slate-150 opacity-60'
                      } ${
                        card.rarity === 'SSR' && !isEquipped
                          ? 'hover:border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.04)] ring-1 ring-rose-500/10' 
                          : card.rarity === 'SR' && !isEquipped
                          ? 'hover:border-amber-300 ring-1 ring-amber-500/5' 
                          : 'hover:border-slate-300'
                      } ${draggedCardId === card.id ? 'opacity-40 scale-95 border-purple-400 border-dashed bg-slate-50' : ''}`}
                    >
                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 border text-[9px] font-black rounded ${getRarityBadgeColor(card.rarity)}`}>
                            {card.rarity} {getCardStars(card.rarity)}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 border border-slate-100 rounded-md font-mono">
                            儲備 x{count}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-slate-800 text-sm">
                            {card.name}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-extrabold inline-flex items-center gap-1 mt-0.5 tracking-wider uppercase">
                            {getProfessionIcon(card.professionId, "w-3 h-3")}
                            {getProfessionName(card.professionId)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          "{card.description}"
                        </p>

                        <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-[10px] font-black border border-emerald-100">
                          加護天賦: {card.buffLabel}
                        </div>
                      </div>

                      {/* Deploy button action */}
                      <div className="mt-4 pt-3 border-t border-slate-100 relative z-10">
                        {isEquipped ? (
                          <div className="w-full flex items-center justify-center gap-1 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black border border-emerald-150">
                            <Check className="w-3.5 h-3.5" />
                            已入編服役中
                          </div>
                        ) : isRoleHired ? (
                          <button
                            onClick={() => equipCard(card.professionId, card.id)}
                            className="w-full py-1.5 bg-slate-900 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs font-black"
                          >
                            調派入編此崗位
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-center gap-1 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-semibold border border-slate-100">
                            需先升級解鎖此職業
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* QUICK DRAWER FOR ROLES deployment */}
      <AnimatePresence>
        {selectedRoleForPanel && (
          <div className="fixed inset-0 z-[160] flex items-end justify-center bg-black/50 p-4">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-t-3xl p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto border-t-4 border-purple-500 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-md font-black text-slate-800">
                    選擇分派至【{getProfessionName(selectedRoleForPanel)}組】的特聘員工
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">點擊卡片將員工指派至此崗位。</p>
                </div>
                <button 
                  onClick={() => setSelectedRoleForPanel(null)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-black uppercase transition-colors"
                >
                  關閉
                </button>
              </div>

              {/* Roster of matching cards */}
              {(() => {
                const candidates = Object.keys(ownedCardsCount).map(id => getCardById(id)).filter(c => c && c.professionId === selectedRoleForPanel) as GachaCard[];
                
                if (candidates.length === 0) {
                  return (
                    <div className="text-center py-10 text-slate-400 space-y-2">
                      <p className="text-xs font-bold">您目前尚無【{getProfessionName(selectedRoleForPanel)}】的特聘人物儲備</p>
                      <button
                        onClick={() => {
                          setSelectedRoleForPanel(null);
                          setActiveTab('recruit');
                        }}
                        className="text-xs text-purple-600 font-extrabold underline hover:text-purple-700"
                      >
                        立即前往人才招募辦理合約
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
                    {candidates.map(card => {
                      const isDeployed = equippedCards[selectedRoleForPanel] === card.id;

                      return (
                        <div 
                          key={card.id}
                          onClick={() => {
                            equipCard(selectedRoleForPanel, isDeployed ? null : card.id);
                            setSelectedRoleForPanel(null);
                          }}
                          className={`p-3.5 border rounded-2xl cursor-pointer flex flex-col justify-between hover:border-purple-400 transition-all ${
                            isDeployed 
                              ? 'bg-purple-50 border-purple-300' 
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`px-1.5 py-0.2 border text-[8px] font-black rounded ${getRarityBadgeColor(card.rarity)}`}>
                                {card.rarity} {getCardStars(card.rarity)}
                              </span>
                              {isDeployed && (
                                <span className="text-[10px] text-purple-600 font-extrabold flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> 目前指派
                                </span>
                              )}
                            </div>
                            <p className="font-extrabold text-xs text-slate-800">{card.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">"{card.description}"</p>
                            <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1">
                              {card.buffLabel}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. CO-RESONANCE INTENSE CINEMATIC DOUBLE SLASH REVEAL SCREEN */}
      {/* We only mimic the awesome dramatic tension of the final card reveal output! */}
      <AnimatePresence>
        {isDrawing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] bg-slate-950/98 flex flex-col items-center justify-center p-4 overflow-hidden"
          >
            {/* Cinematic tech grid pattern lines backdrop */}
            <div className="absolute inset-0 bg-radial-gradient from-slate-900/30 to-slate-950/98 pointer-events-none" />

            {/* Step A: Dossier folders scanning in progress */}
            {extractionStep === 'chains' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6 max-w-md relative z-10"
              >
                <div className="space-y-1.5 animate-pulse">
                  <div className="h-1.5 w-32 bg-amber-500 rounded-full mx-auto shadow-[0_0_15px_rgba(245,158,11,1)]" />
                  <p className="text-amber-500 text-[10px] font-mono tracking-widest uppercase">
                    HIGH-RESOLUTION CO-RESONANT IDENTITIES SCANNING
                  </p>
                </div>

                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 font-mono text-xs"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                    className="absolute inset-2 border border-slate-800 rounded-full"
                  />
                  <span className="text-3xl animate-bounce">📁</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-100 tracking-wide uppercase">
                    「專項裝備與經營證照核驗中」
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold max-w-xs mx-auto leading-relaxed">
                    正在核驗平行合約並引入最匹配的稱號與裝備，請耐心等候系統載入...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step B: The ultimate high-stakes reveal with diagonal slashes & glowing spotlights */}
            {extractionStep === 'reveal' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl text-center space-y-6 relative z-10"
              >
                {/* Spotlight background representing rarity */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[110px] pointer-events-none opacity-25 ${
                  highestRarityPulled === 'SSR' 
                    ? 'bg-rose-500 shadow-[0_0_120px_rgba(244,63,94,0.3)]' 
                    : highestRarityPulled === 'SR' 
                    ? 'bg-amber-400 shadow-[0_0_100px_rgba(245,158,11,0.2)]' 
                    : 'bg-blue-500 shadow-[0_0_80px_rgba(59,130,246,0.15)]'
                }`} />

                <div className="mb-4">
                  <span className="text-3xl animate-pulse block">📜</span>
                  <h3 className="text-2xl font-black text-white tracking-widest uppercase mt-3">
                    高級專業設備與證照授權成立
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                    Special Equipment & Professional Title Authorization Signed successfully.
                  </p>
                </div>

                {/* Staggered card grid list */}
                <div className="flex flex-wrap items-center justify-center gap-4 my-8 overflow-y-auto max-h-[52vh] p-4">
                  {pullResults.map((card, idx) => (
                    <motion.div
                      key={`${card.id}-${idx}`}
                      initial={{ opacity: 0, scale: 0.1, rotate: -35, y: 80 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                      transition={{ type: "spring", stiffness: 105, damping: 14, delay: idx * 0.12 }}
                      className={`relative w-44 h-64 rounded-2xl border p-4 text-center flex flex-col justify-between overflow-hidden shadow-2xl bg-slate-900 ${
                        card.rarity === 'SSR' 
                          ? 'border-rose-500 shadow-rose-950/30' 
                          : card.rarity === 'SR' 
                          ? 'border-amber-500 shadow-amber-950/20' 
                          : 'border-slate-800'
                      }`}
                    >
                      {/* Slash transition graphic animations across the card */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "160%" }}
                        transition={{ delay: idx * 0.12 + 0.3, duration: 0.35 }}
                        className="absolute top-[35%] -left-[30%] h-0.5 bg-gradient-to-r from-transparent via-white/80 to-transparent rotate-[30deg] pointer-events-none"
                      />
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ delay: idx * 0.12 + 0.35, duration: 0.15 }}
                        className="absolute inset-0 bg-white/10 pointer-events-none"
                      />

                      {/* Header */}
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 border text-[8px] font-black rounded ${
                          card.rarity === 'SSR' 
                            ? 'bg-rose-950/60 border-rose-900 text-rose-400' 
                            : card.rarity === 'SR' 
                            ? 'bg-amber-950/60 border-amber-900 text-amber-400' 
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          {card.rarity} {getCardStars(card.rarity)}
                        </span>
                        
                        <p className="font-extrabold text-white text-xs select-none leading-snug mt-3">
                          {card.name}
                        </p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-none mt-0.5 flex items-center justify-center gap-1">
                          {getProfessionIcon(card.professionId, "w-2.5 h-2.5")}
                          {getProfessionName(card.professionId)}
                        </p>
                      </div>

                      {/* Flavor quote */}
                      <p className="text-[9px] text-slate-400 font-medium select-none italic tracking-tight line-clamp-3 bg-slate-950/40 p-2 rounded-xl mt-1.5">
                        "{card.description}"
                      </p>

                      {/* Buff Label */}
                      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-1.5 text-[9px] font-black text-emerald-400 tracking-tight leading-snug">
                        {card.buffLabel}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Confirm agreement button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsDrawing(false);
                      setPullResults([]);
                    }}
                    className="px-16 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-450 text-slate-900 rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-xl border border-amber-600 active:scale-95"
                  >
                    完成解鎖與授權登錄 (裝載專用席位)
                  </button>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
