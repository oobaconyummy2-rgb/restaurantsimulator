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
    <div className="flex flex-col gap-10 pb-32">
      {/* Top Section: Table Grid (Shrinkable) */}
      <section className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                餐廳座標
              </h3>
              <p className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em]">
                Live Floor Plan
              </p>
            </div>
          </div>
          {isWorkHours && (
            <button
              onClick={generateOrder}
              className="px-6 py-2 bg-orange-500 text-white text-[10px] font-black rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10 uppercase tracking-widest flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              招攬顧客
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                  relative aspect-square rounded-[1.5rem] border-2 transition-all flex flex-col items-center justify-center gap-1 group
                  ${selectedTableIndex === idx ? "bg-blue-50 border-blue-400 shadow-lg ring-4 ring-blue-100 scale-105 z-10" : order || isCleaning ? "bg-white border-slate-200 hover:border-slate-400" : "bg-slate-50 border-slate-100 border-dashed opacity-40 hover:opacity-100"}
                `}
              >
                <div
                  className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 relative
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

      {/* Main Interface: Order Details + Menu + Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        {/* Left: Receipt Display */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="min-h-[350px] lg:min-h-[800px] lg:h-auto bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-white/10 flex flex-col shadow-2xl relative">
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "15px 15px",
              }}
            />

            <div className="mb-6 flex items-center justify-between relative z-10 shrink-0">
              <div>
                <h4 className="text-base font-black text-white tracking-tight uppercase tracking-wider">
                  顧客訂單
                </h4>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
                  {selectedTableIndex !== null
                    ? `Table ${selectedTableIndex + 1}`
                    : "STANDBY"}
                </p>
              </div>
              {currentOrder?.isVip && (
                <div className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-lg flex items-center gap-1 border border-amber-500/30">
                  <Crown className="w-3 h-3" />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 space-y-3">
              {currentOrder ? (
                currentOrder.items.map((itId, i) => (
                  <div
                    key={i}
                    className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl filter drop-shadow-md group-hover:scale-110 transition-transform">
                      {getFoodIcon(itId)}
                    </div>
                    <div className="flex-1">
                      <span className="font-black text-white text-[13px] block leading-tight">
                        {getFoodName(itId)}
                      </span>
                    </div>
                    <span className="font-mono text-white/40 text-[10px]">
                      ${getItemPriceForOrder(itId, currentOrder)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            {currentOrder && (
              <div className="mt-6 pt-6 border-t border-white/10 relative z-10 shrink-0">
                <div className="flex justify-between items-center bg-blue-600/10 text-blue-400 p-4 rounded-2xl border border-blue-500/10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
                    Total Bill
                  </span>
                  <span className="text-2xl font-black font-mono tracking-tighter text-white">
                    ${Math.round(currentOrder.total)}
                  </span>
                </div>
              </div>
            )}

            {currentOrder && (staff.find(s => s.id === 'waiter')?.level || 0) > 0 && (
              <div className="mt-3 shrink-0 relative z-10">
                <button
                  type="button"
                  onClick={() => triggerHurry(selectedTableIndex!)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-extrabold text-[11px] uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-500/10 border border-amber-300"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  🗣️ 服務生催促客人：快一點！
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Menu Grid */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="min-h-[350px] lg:min-h-[800px] lg:h-auto bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-2xl border border-white/10 flex flex-col relative overflow-hidden">
            <Utensils className="absolute -top-12 -right-12 w-48 h-48 text-white/5 rotate-12 pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 text-orange-400 rounded-xl">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-base text-white tracking-tight uppercase tracking-widest leading-none">
                    菜單研發
                  </h3>
                </div>
                <div className="flex gap-1">
                  {dailySpecials.map((id) => (
                    <div
                      key={id}
                      className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs"
                      title="Daily Special"
                    >
                      <Sparkles className="w-3 h-3" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-2 content-start">
                {FOOD_ITEMS.filter((item) => {
                  const upgradeId = item.requiredUpgradeId;
                  if (!upgradeId) return true;
                  return upgrades.find((u) => u.id === upgradeId)?.level! > 0;
                }).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToRegister(item.id)}
                    className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-orange-500/30 p-3 rounded-[1.5rem] transition-all flex flex-col items-center gap-2 active:scale-95 shadow-md h-fit"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${item.color} text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-500`}
                    >
                      {item.icon}
                    </div>
                    <div className="text-center w-full">
                      <p className="font-black text-[9px] text-white group-hover:text-orange-400 transition-colors uppercase tracking-tight truncate px-1">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-black text-white/40 font-mono tracking-tighter mt-0.5">
                        ${getItemPriceForOrder(item.id, currentOrder)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Digital Register / POS */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="min-h-[400px] lg:min-h-[800px] lg:h-auto bg-white rounded-[2rem] p-6 md:p-8 shadow-xl text-slate-800 flex flex-col border border-slate-200 relative">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-black tracking-tight text-slate-800">
                  收銀終端
                </h4>
              </div>
              <button
                onClick={clearRegister}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="bg-slate-50 rounded-2xl p-4 flex-1 overflow-y-auto space-y-1 border border-slate-100 custom-scrollbar min-h-0">
                {registerItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-60 py-6 text-slate-450">
                    <ShoppingBag className="w-6 h-6 mb-2 text-slate-400" />
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                      待收銀
                    </p>
                  </div>
                ) : (
                  registerItems.map((id, i) => {
                    const item = FOOD_ITEMS.find((f) => f.id === id);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[11px] font-bold py-2 border-b border-slate-100 group text-slate-705"
                      >
                        <span className="flex items-center gap-2">
                          <span className="opacity-80">{item?.icon}</span>
                          <span className="truncate max-w-[100px] text-slate-800">
                            {item?.name}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-450">
                            ${getItemPriceForOrder(id, currentOrder)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRegisterItems((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              );
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-4 shrink-0">
                {/* 快速鈔票/硬幣選擇 (Quick suggestions dynamic based on receipt total) */}
                {currentOrder && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    {getQuickCashSuggestions().map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setPosInput(amount.toString())}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black tracking-tight whitespace-nowrap transition-all border text-center ${
                          posInput === amount.toString()
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                      >
                        ${amount} {amount === Math.round(currentOrder.total) ? "🪙" : "💵"}
                      </button>
                    ))}
                  </div>
                )}

                {/* 顯示幕 (High contrast digital POS screen display) */}
                <div className="relative group bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                    金額
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xl font-black text-blue-600">
                    <span>$</span>
                    <span>{posInput || "0"}</span>
                  </div>

                  {currentOrder && (
                    <button
                      type="button"
                      onClick={() =>
                        setPosInput(Math.round(currentOrder.total).toString())
                      }
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-black py-1 px-2.5 rounded-lg transition-all border border-blue-200 active:scale-95"
                    >
                      自動輸入
                    </button>
                  )}
                </div>

                {/* 實體收銀按鈕 (Calculator POS touch keyboard pad) */}
                <div className="grid grid-cols-3 gap-1.5">
                  {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumpadPress(num)}
                      className="py-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-base font-black font-mono rounded-xl transition-all border border-slate-100 active:scale-95 flex items-center justify-center shadow-sm"
                    >
                      {num}
                    </button>
                  ))}
                  {/* 清除 & 0 & 退格 */}
                  <button
                    type="button"
                    onClick={() => handleNumpadPress("C")}
                    className="py-3 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-black rounded-xl transition-all border border-red-100 active:scale-95 flex items-center justify-center uppercase tracking-wider shadow-sm"
                  >
                    清除
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpadPress("0")}
                    className="py-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-base font-black font-mono rounded-xl transition-all border border-slate-100 active:scale-95 flex items-center justify-center shadow-sm"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpadPress("⌫")}
                    className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-base font-black rounded-xl transition-all border border-slate-200 active:scale-95 flex items-center justify-center font-mono shadow-sm"
                  >
                    ⌫
                  </button>
                </div>

                <button
                  disabled={!currentOrder}
                  onClick={() => checkout()}
                  className={`w-full py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-3 ${currentOrder ? "bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                >
                  結帳完成
                  <ArrowRight className="w-4 h-4" />
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
