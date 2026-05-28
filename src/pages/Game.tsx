import React from "react";
import { motion } from "framer-motion";
import {
  Store,
  Plus,
  Utensils,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Trash2,
  Zap,
  Sparkles,
  DollarSign,
  Crown,
  X,
  Volume2,
  Clock,
} from "lucide-react";
import { useGame } from "../context/GameContext";
import { FOOD_ITEMS, CUSTOMER_TYPES } from "../constants";
import Layout from "../components/Layout";

export default function Game({
  isComponent = false,
}: {
  isComponent?: boolean;
}) {
  const {
    tables,
    cleaningTables,
    selectedTableIndex,
    setSelectedTableIndex,
    generateOrder,
    isWorkHours,
    registerItems,
    setRegisterItems,
    addToRegister,
    clearRegister,
    posInput,
    setPosInput,
    checkout,
    getItemPriceForOrder,
    dailySpecials,
    staff,
    upgrades,
    autoOrderEnabled,
    autoAmountEnabled,
    cheatsEnabled,
    hurryTable,
  } = useGame();

  const [shoutingTables, setShoutingTables] = React.useState<Record<number, string | null>>({});
  const [cooldownTables, setCooldownTables] = React.useState<Record<number, number>>({});
  const [mobileTab, setMobileTab] = React.useState<'order' | 'menu' | 'pos'>('order');

  const shoutPhrases = [
    "「請客人吃快一點喔！💨」",
    "「後面客人在排隊囉，抓緊時間！🚀」",
    "「請加快用餐與買單速度唷～⏱️」",
    "「翻桌即是正義！請用完快點結帳～🙏」",
    "「服務生：請吃快點，感謝配合！✨」"
  ];

  const triggerHurry = (idx: number) => {
    const now = Date.now();
    const lastHurry = cooldownTables[idx] || 0;
    if (now - lastHurry < 5050) {
      return;
    }
    
    hurryTable(idx);
    
    const phrase = shoutPhrases[Math.floor(Math.random() * shoutPhrases.length)];
    setShoutingTables((prev) => ({ ...prev, [idx]: phrase }));
    setCooldownTables((prev) => ({ ...prev, [idx]: now }));
    
    setTimeout(() => {
      setShoutingTables((prev) => ({ ...prev, [idx]: null }));
    }, 2500);
  };

  const currentOrder =
    selectedTableIndex !== null ? tables[selectedTableIndex] : null;

  // Automation: Auto-fill register and amount
  React.useEffect(() => {
    if (currentOrder) {
      const cashier = staff.find((s) => s.id === "cashier");
      const cashierLevel = cheatsEnabled
        ? Math.max(2, cashier?.level || 0)
        : cashier?.level || 0;

      if (autoOrderEnabled && cashierLevel >= 1) {
        setRegisterItems(currentOrder.items);
      }
      if (autoAmountEnabled && cashierLevel >= 2) {
        setPosInput(currentOrder.total.toString());
      }
    } else {
      clearRegister();
    }
  }, [
    selectedTableIndex,
    currentOrder,
    autoOrderEnabled,
    autoAmountEnabled,
    cheatsEnabled,
  ]); // Include dependencies

  React.useEffect(() => {
    if (selectedTableIndex !== null) {
      setMobileTab('order');
    }
  }, [selectedTableIndex]);

  const handleNumpadPress = (val: string) => {
    if (val === "C") {
      setPosInput("");
    } else if (val === "⌫") {
      setPosInput((prev) => prev.slice(0, -1));
    } else {
      setPosInput((prev) => {
        if (prev === "0" && val === "0") return "0";
        if (prev === "0") return val;
        return prev + val;
      });
    }
  };

  const getQuickCashSuggestions = () => {
    if (!currentOrder) return [10, 50, 100];
    const total = Math.round(currentOrder.total);
    const options = new Set<number>();

    options.add(total);

    // Quick bill presets larger than or equal to total
    [10, 20, 50, 100, 200, 500, 1000].forEach((bill) => {
      if (bill >= total) {
        options.add(bill);
      }
    });

    const nextTen = Math.ceil(total / 10) * 10;
    if (nextTen > total) options.add(nextTen);

    const nextFifty = Math.ceil(total / 50) * 50;
    if (nextFifty > total) options.add(nextFifty);

    return Array.from(options)
      .sort((a, b) => a - b)
      .slice(0, 4);
  };

  const getFoodIcon = (id: string) => FOOD_ITEMS.find((f) => f.id === id)?.icon;
  const getFoodName = (id: string) => FOOD_ITEMS.find((f) => f.id === id)?.name;

  const getCustomerInfo = (id: string | undefined) => {
    if (!id) return CUSTOMER_TYPES[0];
    return CUSTOMER_TYPES.find((c) => c.id === id) || CUSTOMER_TYPES[0];
  };

  const content = (
    <div className="flex flex-col gap-4 md:gap-6 pb-20">
      {/* Top Section: Table Grid (Shrinkable) */}
      <section className="bg-white rounded-2xl md:rounded-[2rem] p-3 md:p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-slate-800 tracking-tight">
                餐廳座位 (Live Floor)
              </h3>
            </div>
          </div>
          {isWorkHours && (
            <button
              onClick={generateOrder}
              className="px-4 py-1.5 bg-orange-500 text-white text-[9px] md:text-[10px] font-black rounded-full hover:bg-orange-600 transition-all shadow-md shadow-orange-500/10 uppercase tracking-wider flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5" />
              招攬顧客
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-1.5 md:gap-3">
          {tables.map((order, idx) => {
            const isCleaning = cleaningTables[idx] !== null;
            const cleaner = staff.find((s) => s.id === "cleaner");
            const cleanerSpeedSkill = cleaner?.skills["cl_speed_1"] || 0;
            const cleaningDuration = Math.max(
              0.2,
              5 - (cleaner?.level || 0) * 0.8 - cleanerSpeedSkill * 0.8,
            );

            return (
              <button
                key={idx}
                onClick={() => setSelectedTableIndex(idx)}
                className={`
                  relative aspect-square rounded-xl md:rounded-2xl border md:border-2 transition-all flex flex-col items-center justify-center p-1 md:gap-1 group
                  ${selectedTableIndex === idx ? "bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-100 scale-102 z-10" : order || isCleaning ? "bg-white border-slate-200 hover:border-slate-400" : "bg-slate-50 border-slate-100 border-dashed opacity-40 hover:opacity-100"}
                `}
              >
                <div
                  className={`
                  w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 relative
                  ${order ? (order.isVip ? "bg-amber-100 text-amber-600 shadow-sm border border-amber-200" : "bg-blue-100 text-blue-600 shadow-inner") : isCleaning ? "bg-amber-100 text-amber-500" : "bg-slate-200 text-slate-400"}
                `}
                >
                  {order ? (
                    <>
                      <div className="text-2xl">
                        {getCustomerInfo(order.customerType).icon}
                      </div>
                      {order.isVip && (
                        <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white p-0.5 rounded-full shadow-lg">
                          <Crown className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </>
                  ) : isCleaning ? (
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Plus className="w-4 h-4 opacity-20" />
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`font-black text-[8px] uppercase tracking-tighter ${selectedTableIndex === idx ? "text-blue-600" : "text-slate-500"}`}
                  >
                    T{idx + 1}
                  </p>
                </div>

                {isCleaning && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-[1.5rem] flex items-center justify-center">
                    <div className="w-3/4 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-amber-400"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: cleaningDuration,
                          ease: "linear",
                        }}
                      />
                    </div>
                  </div>
                )}

                {shoutingTables[idx] && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 10, x: "-50%" }}
                    animate={{ scale: 1, opacity: 1, y: 0, x: "-50%" }}
                    exit={{ scale: 0, opacity: 0, y: 10, x: "-50%" }}
                    className="absolute -top-12 left-1/2 bg-amber-500 border border-amber-400 text-slate-900 text-[10px] font-black py-1.5 px-3 rounded-xl shadow-lg whitespace-nowrap z-50 flex items-center gap-1.5"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-800"></span>
                    </span>
                    {shoutingTables[idx]}
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Mobile Snug Tabs Controller */}
      <div className="flex lg:hidden bg-slate-900 border border-white/10 p-1.5 rounded-[1.5rem] gap-1 z-40 shadow-xl mb-6 sticky top-[80px]">
        <button
          type="button"
          onClick={() => setMobileTab('order')}
          className={`flex-1 py-3 text-center rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'order'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📋 顧客點單</span>
          {currentOrder && (
            <span className={`text-[10px] rounded-md px-1.5 py-0.5 font-bold ${
              mobileTab === 'order' ? 'bg-white/25 text-white' : 'bg-white/10 text-slate-300'
            }`}>
              {currentOrder.items.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('menu')}
          className={`flex-1 py-3 text-center rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'menu'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🍳 菜單項目</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('pos')}
          className={`flex-1 py-3 text-center rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'pos'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>💵 收銀點餐</span>
          {registerItems.length > 0 && (
            <span className={`text-[10px] rounded-md px-1.5 py-0.5 font-bold animate-pulse ${
              mobileTab === 'pos' ? 'bg-white/25 text-white' : 'bg-white/10 text-slate-300'
            }`}>
              {registerItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Interface: Order Details + Menu + Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        {/* Left: Receipt Display (顧客訂單) */}
        <div className={`lg:col-span-3 flex flex-col ${mobileTab === 'order' ? 'block' : 'hidden lg:flex'}`}>
          <div className="bg-slate-900 rounded-2xl md:rounded-3xl p-3.5 md:p-4 border border-white/10 flex flex-col shadow-2xl relative lg:h-[425px] transition-all">
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "15px 15px",
              }}
            />

            <div className="mb-3 flex items-center justify-between relative z-10 shrink-0">
              <div>
                <h4 className="text-xs font-black text-white tracking-wider flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  顧客訂單
                </h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  {selectedTableIndex !== null
                    ? `桌位 Table ${selectedTableIndex + 1}`
                    : "等待點選桌位"}
                </p>
              </div>
              {currentOrder ? (
                <div className="flex gap-1">
                  {currentOrder.isVip && (
                    <div className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-amber-500/30 text-[9px] font-black">
                      <Crown className="w-2 h-2" />
                      VIP
                    </div>
                  )}
                  <span className="bg-blue-500/25 text-blue-400 px-1.5 py-0.5 rounded-md text-[9px] font-black border border-blue-500/20">
                    {getCustomerInfo(currentOrder.customerType).name}
                  </span>
                </div>
              ) : (
                <div className="w-1 h-1 rounded-full bg-slate-700" />
              )}
            </div>

            {/* List of ordered items containing scrolling inside responsive min-to-max heights */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar relative z-10 space-y-1.5 max-h-[180px] lg:max-h-none min-h-[80px]">
              {currentOrder ? (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-orange-400/80 uppercase tracking-wider block animate-pulse">
                    💡 點選下方餐點可直接送入點餐檯
                  </p>
                  {currentOrder.items.map((itId, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => addToRegister(itId)}
                      className="w-full text-left bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/5 flex items-center justify-between group transition-all active:scale-95 duration-75"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center text-xs filter drop-shadow-md group-hover:scale-105 transition-transform shrink-0">
                          {getFoodIcon(itId)}
                        </div>
                        <span className="font-black text-white text-[11px] block leading-tight truncate">
                          {getFoodName(itId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-white/40 text-[9px] font-bold">
                          ${getItemPriceForOrder(itId, currentOrder)}
                        </span>
                        <span className="bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white border border-orange-500/20 text-[8px] font-black px-1.5 py-0.5 rounded transition-all">
                          點選
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-full py-8 lg:py-0 flex flex-col items-center justify-center opacity-30 gap-2.5 text-center">
                  <Utensils className="w-5 h-5 text-white animate-bounce" />
                  <p className="text-[9px] font-black text-slate-400 leading-relaxed">
                    請點選上方座位圖<br />查看該桌客人的餐點
                  </p>
                </div>
              )}
            </div>

            {currentOrder && (
              <div className="mt-2 pt-2 border-t border-white/5 relative z-10 shrink-0">
                <div className="flex justify-between items-center bg-blue-600/10 text-blue-400 p-2.5 rounded-lg border border-blue-500/10 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] opacity-75">
                    應收金額 (Total)
                  </span>
                  <span className="text-lg font-black font-mono tracking-tighter text-white">
                    ${Math.round(currentOrder.total)}
                  </span>
                </div>
              </div>
            )}

            {currentOrder && (
              <div className="mt-1.5 shrink-0 relative z-10 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterItems(currentOrder.items);
                    setMobileTab('pos');
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md border border-blue-500/85 animate-pulse"
                >
                  📥 一鍵整單轉入點餐檯
                </button>
              </div>
            )}

            {currentOrder && (staff.find(s => s.id === 'waiter')?.level || 0) > 0 && (
              <div className="mt-1 shrink-0 relative z-10">
                <button
                  type="button"
                  onClick={() => triggerHurry(selectedTableIndex!)}
                  className="w-full py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-amber-500/10 border border-amber-300"
                >
                  <Volume2 className="w-3 h-3 animate-pulse" />
                  👤 催促客人
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Menu Grid (菜單研發) */}
        <div className={`lg:col-span-5 flex flex-col ${mobileTab === 'menu' ? 'block' : 'hidden lg:flex'}`}>
          <div className="bg-slate-900 rounded-2xl md:rounded-3xl p-3.5 md:p-4 shadow-2xl border border-white/10 flex flex-col relative overflow-hidden lg:h-[425px] transition-all">
            <Utensils className="absolute -top-12 -right-12 w-48 h-48 text-white/5 rotate-12 pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/5 text-orange-400 rounded-lg">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-black text-sm text-white tracking-widest leading-none">
                    菜單研發
                  </h3>
                </div>
                <div className="flex gap-1">
                  {dailySpecials.map((id) => (
                    <div
                      key={id}
                      className="w-5 h-5 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs"
                      title="Daily Special"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Made more screen resource efficient by allowing 3 or 4 columns on medium screen sizes, and scrolling with capped height on mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5 overflow-y-auto pr-1 custom-scrollbar flex-1 pb-1.5 content-start max-h-[180px] lg:max-h-none">
                {FOOD_ITEMS.filter((item) => {
                  const upgradeId = item.requiredUpgradeId;
                  if (!upgradeId) return true;
                  return upgrades.find((u) => u.id === upgradeId)?.level! > 0;
                }).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToRegister(item.id)}
                    className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-orange-500/30 p-2 rounded-lg transition-all flex items-center gap-2.5 active:scale-95 shadow-md text-left"
                  >
                    <div
                      className={`w-7 h-7 rounded-md ${item.color} text-white flex items-center justify-center text-xs shadow-sm group-hover:scale-105 transition-transform shrink-0`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-[11px] text-white group-hover:text-orange-400 transition-colors uppercase truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-black text-white/40 font-mono tracking-tight">
                        ${getItemPriceForOrder(item.id, currentOrder)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Digital Register / POS (收銀點餐檯) */}
        <div className={`lg:col-span-4 flex flex-col ${mobileTab === 'pos' ? 'block' : 'hidden lg:flex'}`}>
          <div className="bg-white rounded-2xl md:rounded-3xl p-3.5 md:p-3 shadow-xl text-slate-800 flex flex-col border border-slate-200 relative lg:h-[425px] transition-all">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <h4 className="text-xs font-black tracking-tight text-slate-800">
                  收銀點餐檯 (POS)
                </h4>
              </div>
              <button
                onClick={clearRegister}
                className="p-0.5 px-2 hover:bg-slate-100 rounded text-[9px] text-slate-400 hover:text-slate-600 transition-colors font-black uppercase flex items-center gap-0.5 border border-slate-150"
              >
                <Trash2 className="w-2.5 h-2.5" />
                清空
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-2 min-h-0">
              {/* POS items cart with snugger vertical boundaries */}
              <div className="bg-slate-50 rounded-lg p-2.5 flex-1 overflow-y-auto space-y-1 border border-slate-105 custom-scrollbar max-h-[100px] lg:max-h-none min-h-[50px]">
                {registerItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-60 text-slate-450 py-2">
                    <ShoppingBag className="w-4 h-4 mb-0.5 text-slate-400" />
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                      待收點餐項目
                    </p>
                  </div>
                ) : (
                  registerItems.map((id, i) => {
                    const item = FOOD_ITEMS.find((f) => f.id === id);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[10px] font-bold py-1 border-b border-slate-100 group text-slate-705"
                      >
                        <span className="flex items-center gap-1">
                          <span className="scale-75 origin-left shrink-0">{item?.icon}</span>
                          <span className="truncate max-w-[100px] text-slate-800 text-[10px]">
                            {item?.name}
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-450 text-[9px]">
                            ${getItemPriceForOrder(id, currentOrder)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRegisterItems((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              );
                            }}
                            className="p-0.5 text-slate-400 hover:text-red-500 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-2 shrink-0">
                {/* 快速鈔票/硬幣選擇 suggestions */}
                {currentOrder && (
                  <div className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {getQuickCashSuggestions().map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setPosInput(amount.toString())}
                        className={`flex-1 py-0.5 px-2 rounded text-[8px] font-black tracking-tight whitespace-nowrap transition-all border text-center ${
                          posInput === amount.toString()
                            ? "bg-blue-600 border-blue-500 text-white shadow-sm scale-102"
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                      >
                        ${amount} {amount === Math.round(currentOrder.total) ? "🪙" : "💵"}
                      </button>
                    ))}
                  </div>
                )}

                {/* Amount Screen Monitor */}
                <div className="relative group bg-slate-50 border border-slate-200 rounded-lg py-1 px-3 flex items-center justify-between">
                  <span className="text-[8px] font-black text-slate-400 tracking-wider">
                    輸入金額
                  </span>
                  <div className="flex items-center gap-0.5 font-mono text-sm font-black text-blue-600">
                    <span>$</span>
                    <span>{posInput || "0"}</span>
                  </div>

                  {currentOrder && (
                    <button
                      type="button"
                      onClick={() =>
                        setPosInput(Math.round(currentOrder.total).toString())
                      }
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-[8px] font-black py-0.5 px-1.5 rounded transition-all border border-blue-200 active:scale-95"
                    >
                      自動填入
                    </button>
                  )}
                </div>

                {/* Calculator Keyboard */}
                <div className="grid grid-cols-3 gap-1">
                  {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumpadPress(num)}
                      className="py-1 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-755 text-xs font-black font-mono rounded transition-all border border-slate-100 active:scale-95 flex items-center justify-center shadow-sm"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleNumpadPress("C")}
                    className="py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[9px] font-black rounded transition-all border border-red-100 active:scale-95 flex items-center justify-center uppercase tracking-wider shadow-sm"
                  >
                    清除
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpadPress("0")}
                    className="py-1 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-755 text-xs font-black font-mono rounded transition-all border border-slate-100 active:scale-95 flex items-center justify-center shadow-sm"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpadPress("⌫")}
                    className="py-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-755 text-xs font-black rounded transition-all border border-slate-200 active:scale-95 flex items-center justify-center font-mono shadow-sm"
                  >
                    ⌫
                  </button>
                </div>

                <button
                  disabled={!currentOrder}
                  onClick={() => checkout()}
                  className={`w-full py-2 rounded-lg font-black text-[10px] transition-all flex items-center justify-center gap-1.5 ${currentOrder ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10 active:scale-95" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                >
                  結帳完成
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isComponent) return content;

  return <Layout>{content}</Layout>;
}
