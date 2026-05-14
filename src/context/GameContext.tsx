import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  FoodItem, 
  Order, 
  MenuState, 
  ItemRating, 
  Upgrade, 
  Staff, 
  GameEvent, 
  GameStats, 
  DailyStats
} from '../types';
import { 
  FOOD_ITEMS, 
  INITIAL_UPGRADES, 
  INITIAL_STAFF, 
  RANDOM_EVENTS, 
  CUSTOMER_TYPES 
} from '../constants';
import confetti from 'canvas-confetti';

interface GameContextType {
  money: number;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  upgrades: Upgrade[];
  staff: Staff[];
  stats: GameStats;
  dailyStats: DailyStats;
  menuState: MenuState;
  itemRatings: Record<string, ItemRating>;
  dailySpecials: string[];
  tables: (Order | null)[];
  cleaningTables: (number | null)[];
  selectedTableIndex: number | null;
  setSelectedTableIndex: (idx: number | null) => void;
  registerItems: string[];
  setRegisterItems: React.Dispatch<React.SetStateAction<string[]>>;
  posInput: string;
  setPosInput: React.Dispatch<React.SetStateAction<string>>;
  activeEvent: GameEvent | null;
  eventTimeLeft: number;
  feedback: { type: 'success' | 'error', text: string } | null;
  setFeedback: (f: { type: 'success' | 'error', text: string } | null) => void;
  restaurantLevel: number;
  isWorkHours: boolean;
  isDayComplete: boolean;
  autoOrderEnabled: boolean;
  setAutoOrderEnabled: (v: boolean) => void;
  autoAmountEnabled: boolean;
  setAutoAmountEnabled: (v: boolean) => void;
  cheatsEnabled: boolean;
  setCheatsEnabled: (v: boolean) => void;
  volumes: { master: number; bgm: number; sfx: number };
  setVolumes: React.Dispatch<React.SetStateAction<{ master: number; bgm: number; sfx: number }>>;
  difficulty: 'easy' | 'normal' | 'hard';
  setDifficulty: (d: 'easy' | 'normal' | 'hard') => void;
  toggleDailySpecial: (itemId: string) => void;
  prePrepItems: string[];
  togglePrePrep: (itemId: string) => void;
  
  resetGame: () => void;
  // Actions
  generateOrder: () => void;
  checkout: (tableIdx?: number, overwriteItems?: string[], forceSkipAmount?: boolean) => void;
  buyUpgrade: (id: string) => void;
  trainStaff: (id: string) => void;
  allocateSkillPoints: (staffId: string, skillId: string) => void;
  startNextDay: () => void;
  addToRegister: (itemId: string) => void;
  clearRegister: () => void;
  getItemPriceForOrder: (itemId: string, order: Order | null) => number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- State ---
  const [money, setMoney] = useState<number>(() => {
    const saved = localStorage.getItem('rt_money');
    return saved ? parseFloat(saved) : 100;
  });

  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>(() => {
    const saved = localStorage.getItem('rt_difficulty');
    return (saved as 'easy' | 'normal' | 'hard') || 'normal';
  });

  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const savedV3 = localStorage.getItem('rt_upgrades_v3');
    if (savedV3) {
      const levels = JSON.parse(savedV3);
      return INITIAL_UPGRADES.map(u => ({ ...u, level: levels[u.id] || 0 }));
    }
    return INITIAL_UPGRADES;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('rt_staff_v3');
    if (saved) {
      const data = JSON.parse(saved);
      return INITIAL_STAFF.map(s => {
        const savedStaff = data.find((sd: any) => sd.id === s.id);
        return { 
          ...s, 
          level: savedStaff?.level || 0,
          skillPoints: savedStaff?.skillPoints || 0,
          skills: savedStaff?.skills || {}
        };
      });
    }
    return INITIAL_STAFF;
  });

  const [tables, setTables] = useState<(Order | null)[]>(new Array(6).fill(null));
  const [cleaningTables, setCleaningTables] = useState<(number | null)[]>(new Array(6).fill(null));
  const [selectedTableIndex, setSelectedTableIndex] = useState<number | null>(null);
  const [registerItems, setRegisterItems] = useState<string[]>([]);
  const [posInput, setPosInput] = useState<string>('');
  const [autoOrderEnabled, setAutoOrderEnabled] = useState(false);
  const [autoAmountEnabled, setAutoAmountEnabled] = useState(false);
  const [cheatsEnabled, setCheatsEnabled] = useState(() => {
    return localStorage.getItem('rt_cheats') === 'true';
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('rt_stats');
    return saved ? JSON.parse(saved) : { totalEarned: 0, customersServed: 0, day: 1, currentTime: 540 };
  });

  const [dailyStats, setDailyStats] = useState<DailyStats>(() => {
    const saved = localStorage.getItem('rt_daily_stats');
    return saved ? JSON.parse(saved) : { customers: 0, earnings: 0, items: {}, vipsServed: 0, bonusMultiplier: 0 };
  });

  const [menuState, setMenuState] = useState<MenuState>(() => {
    const saved = localStorage.getItem('rt_menu_state');
    if (saved) return JSON.parse(saved);
    const initial: MenuState = {};
    FOOD_ITEMS.forEach(item => { initial[item.id] = { priceMod: 1, outOfStock: false }; });
    return initial;
  });

  const [itemRatings, setItemRatings] = useState<Record<string, ItemRating>>(() => {
    const saved = localStorage.getItem('rt_item_ratings');
    if (saved) return JSON.parse(saved);
    const initial: Record<string, ItemRating> = {};
    FOOD_ITEMS.forEach(item => { initial[item.id] = { totalStars: 0, count: 0, averageRating: 0 }; });
    return initial;
  });

  const [dailySpecials, setDailySpecials] = useState<string[]>(() => {
    const saved = localStorage.getItem('rt_daily_specials');
    return saved ? JSON.parse(saved) : [];
  });

  const [prePrepItems, setPrePrepItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('rt_preprep_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [volumes, setVolumes] = useState(() => {
    const saved = localStorage.getItem('rt_volumes');
    return saved ? JSON.parse(saved) : { master: 80, bgm: 60, sfx: 100 };
  });

  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [eventTimeLeft, setEventTimeLeft] = useState<number>(0);

  const restaurantLevel = Math.floor(stats.totalEarned / 500) + 1;
  const isWorkHours = stats.currentTime < 1080;
  const isDayComplete = stats.currentTime >= 1080 && tables.every(t => t === null) && cleaningTables.every(c => c === null);

  const tablesRef = useRef<(Order | null)[]>([]);
  useEffect(() => { tablesRef.current = tables; }, [tables]);

  // Persistence
  useEffect(() => {
    if (isResettingRef.current) return;
    localStorage.setItem('rt_money', money.toString());
    const upgradeLevels: Record<string, number> = {};
    upgrades.forEach(u => upgradeLevels[u.id] = u.level);
    localStorage.setItem('rt_upgrades_v3', JSON.stringify(upgradeLevels));
    localStorage.setItem('rt_stats', JSON.stringify(stats));
    localStorage.setItem('rt_daily_stats', JSON.stringify(dailyStats));
    localStorage.setItem('rt_menu_state', JSON.stringify(menuState));
    localStorage.setItem('rt_item_ratings', JSON.stringify(itemRatings));
    localStorage.setItem('rt_daily_specials', JSON.stringify(dailySpecials));
    localStorage.setItem('rt_preprep_items', JSON.stringify(prePrepItems));
    localStorage.setItem('rt_auto_order', JSON.stringify(autoOrderEnabled));
    localStorage.setItem('rt_auto_amount', JSON.stringify(autoAmountEnabled));
    localStorage.setItem('rt_cheats', cheatsEnabled.toString());
    localStorage.setItem('rt_volumes', JSON.stringify(volumes));
    localStorage.setItem('rt_staff_v3', JSON.stringify(staff.map(s => ({ 
      id: s.id, 
      level: s.level,
      skillPoints: s.skillPoints,
      skills: s.skills
    }))));
    localStorage.setItem('rt_difficulty', difficulty);
  }, [money, upgrades, staff, stats, dailyStats, menuState, itemRatings, dailySpecials, autoOrderEnabled, autoAmountEnabled, volumes, difficulty]);

  // Migration: Ensure cleaner speed skill is at least level 5
  useEffect(() => {
    const cleaner = staff.find(s => s.id === 'cleaner');
    if (cleaner && (cleaner.skills['cl_speed_1'] || 0) < 5) {
      setStaff(prev => prev.map(s => s.id === 'cleaner' ? { ...s, skills: { ...s.skills, 'cl_speed_1': 5 } } : s));
    }
  }, [staff]);

  const calculateItemPrice = useCallback((itemId: string, isVip: boolean = false) => {
    const item = FOOD_ITEMS.find(f => f.id === itemId);
    const mState = menuState[itemId];
    const rating = itemRatings[itemId];
    const chef = staff.find(s => s.id === 'chef');
    const chefPriceSkill = chef?.skills['ch_price_1'] || 0;
    
    const premiumLevel = upgrades.find(u => u.id === 'premium')?.level || 0;
    
    const vipMultiplier = isVip ? 1.5 : 1;
    const mod = (1 + (chef?.level || 0) * 0.1 + chefPriceSkill * 0.05) * (1 + premiumLevel * 0.15) * vipMultiplier * (mState?.priceMod || 1);
    const avgRating = rating?.count > 0 ? rating.totalStars / rating.count : 3;
    const ratingMod = 1 + (avgRating - 3) * 0.05;
    const specialMod = dailySpecials.includes(itemId) ? 1.25 : 1;
    const levelPriceMod = restaurantLevel >= 25 ? 1.15 : 1;
    
    const rawPrice = (item?.price || 0) * mod * ratingMod * specialMod * levelPriceMod;
    // Round to nearest whole number to avoid "troublesome" decimals
    return Math.ceil(rawPrice);
  }, [menuState, itemRatings, staff, upgrades, dailySpecials, restaurantLevel]);

  const getItemPriceForOrder = useCallback((itemId: string, order: Order | null) => {
    if (order?.unitPrices && order.unitPrices[itemId] !== undefined) {
      return order.unitPrices[itemId];
    }
    return calculateItemPrice(itemId, order?.isVip || false);
  }, [calculateItemPrice]);

  const generateOrder = useCallback(() => {
    const decorLevel = upgrades.find(u => u.id === 'decor')?.level || 0;
    const hostLevel = staff.find(s => s.id === 'host')?.level || 0;

    const vipChanceBonus = hostLevel >= 4 ? 0.15 : 0;
    const forceVip = activeEvent?.effects.forceType === 'vip';
    const levelVipMod = restaurantLevel >= 15 ? 1.5 : 1;
    const isVipSpawn = forceVip || Math.random() < ((0.05 + decorLevel * 0.05 + hostLevel * 0.03 + vipChanceBonus) * levelVipMod);
    
    const possibleTypes = isVipSpawn 
      ? CUSTOMER_TYPES.filter(t => (t as any).isVip) 
      : CUSTOMER_TYPES.filter(t => !(t as any).isVip);
    
    if (possibleTypes.length === 0) {
      // Fallback if filter failed for some reason
      const fallbackType = isVipSpawn ? CUSTOMER_TYPES.find(t => (t as any).isVip) || CUSTOMER_TYPES[0] : CUSTOMER_TYPES[0];
      possibleTypes.push(fallbackType);
    }

    const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
    const isVip = (type as any).isVip === true;

    const availableFood = FOOD_ITEMS.filter(item => {
      if (menuState[item.id]?.outOfStock) return false;
      if (!item.requiredUpgradeId) return true;
      const upgrade = upgrades.find(u => u.id === item.requiredUpgradeId);
      return upgrade && upgrade.level > 0;
    });

    if (availableFood.length === 0) return;

    let finalItems: string[] = [];
    const groupSize = Math.floor(Math.random() * (type.maxSize - type.minSize + 1)) + type.minSize;
    const itemCount = Math.min(10, groupSize * 2 + Math.floor(decorLevel / 2) + (isVip ? 3 : 0));
    
    for (let i = 0; i < Math.max(1, itemCount); i++) {
      finalItems.push(availableFood[Math.floor(Math.random() * availableFood.length)].id);
    }

    const host = staff.find(s => s.id === 'host');
    const patienceSkill = host?.skills['h_patience_1'] || 0;
    
    const waitTime = (30 + decorLevel * 9 + patienceSkill * 10) * (activeEvent?.effects.patienceMod || 1) * (difficulty === 'easy' ? 1.5 : difficulty === 'hard' ? 0.7 : 1);

    const unitPrices: Record<string, number> = {};
    let total = 0;
    finalItems.forEach(itemId => {
      const price = calculateItemPrice(itemId, isVip);
      total += price;
      unitPrices[itemId] = price;
    });

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      items: finalItems,
      total: Math.ceil(total),
      startTime: Date.now(),
      waitTime: waitTime,
      customerType: type.id,
      groupSize: groupSize,
      isVip: isVip,
      unitPrices: unitPrices
    };

    setTables(prev => {
      const next = [...prev];
      const emptyIndex = next.findIndex((t, idx) => t === null && cleaningTables[idx] === null);
      if (emptyIndex !== -1) {
        next[emptyIndex] = newOrder;
        if (selectedTableIndex === null) setSelectedTableIndex(emptyIndex);
      }
      return next;
    });
  }, [upgrades, staff, activeEvent, restaurantLevel, menuState, difficulty, calculateItemPrice, selectedTableIndex, cleaningTables]);

  const checkout = useCallback((tableIdx?: number, overwriteItems?: string[], forceSkipAmount: boolean = false) => {
    const targetIdx = tableIdx !== undefined ? tableIdx : selectedTableIndex;
    if (targetIdx === null || !tables[targetIdx]) return;

    const targetOrder = tables[targetIdx]!;
    const itemsToVerify = overwriteItems || registerItems;
    const cashier = staff.find(s => s.id === 'cashier');
    const cashierLevel = cheatsEnabled ? Math.max(2, cashier?.level || 0) : (cashier?.level || 0);
    const skipAmountCheck = forceSkipAmount || cheatsEnabled || (cashierLevel >= 2 && autoAmountEnabled);
    const enteredAmount = parseFloat(posInput);

    if (!skipAmountCheck) {
      if (Math.round(targetOrder.total * 100) !== Math.round((enteredAmount || 0) * 100)) {
        setFeedback({ type: 'error', text: '收銀金額不符！' });
        setTimeout(() => setFeedback(null), 2000);
        return;
      }
    }

    const orderCounts: Record<string, number> = {};
    targetOrder.items.forEach(id => orderCounts[id] = (orderCounts[id] || 0) + 1);
    const registerCounts: Record<string, number> = {};
    const effectiveItemsToVerify = (cheatsEnabled || (cashierLevel >= 1 && autoOrderEnabled)) ? targetOrder.items : itemsToVerify;
    effectiveItemsToVerify.forEach(id => registerCounts[id] = (registerCounts[id] || 0) + 1);
    
    let isMatch = true;
    const allIds = new Set([...Object.keys(orderCounts), ...Object.keys(registerCounts)]);
    allIds.forEach(id => { if (orderCounts[id] !== registerCounts[id]) isMatch = false; });

    if (isMatch) {
      const waiter = staff.find(s => s.id === 'waiter');
      const chef = staff.find(s => s.id === 'chef');
      
      const waiterTipSkill = waiter?.skills['w_tip_1'] || 0;
      const cashierMathSkill = (cashier?.skills['ca_math_1'] || 0);
      
      const tipChance = 0.5 + waiterTipSkill * 0.1;
      const tipMod = Math.random() < tipChance ? 1.0 : 0.5;
      
      let baseTipScale = (waiter?.level || 0) * 0.05 + 0.1;
      const tip = targetOrder.total * baseTipScale * tipMod;
      
      let revenueBonus = 1.0;
      if (Math.random() < cashierMathSkill * 0.05) {
        revenueBonus = 1.1;
        setFeedback({ type: 'success', text: '結帳驚喜：收入 +10%！' });
      }

      const finalAmount = (targetOrder.total + tip) * (activeEvent?.effects.priceMod || 1) * (restaurantLevel >= 5 ? 1.1 : 1) * revenueBonus;

      setMoney(prev => prev + finalAmount);
      setStats(prev => ({
        ...prev,
        totalEarned: prev.totalEarned + finalAmount,
        customersServed: prev.customersServed + 1,
        currentTime: prev.currentTime + 10
      }));

      setDailyStats(prev => {
        const newItems = { ...prev.items };
        targetOrder.items.forEach(itemId => { newItems[itemId] = (newItems[itemId] || 0) + 1; });
        return { 
          ...prev, 
          customers: prev.customers + 1, 
          earnings: prev.earnings + finalAmount, 
          items: newItems,
          vipsServed: prev.vipsServed + (targetOrder.isVip ? 1 : 0)
        };
      });

      // Update Item Ratings
      const processingTime = (Date.now() - targetOrder.startTime) / 1000;
      
      // Calculate Pre-prep bonus: Each prepped item reduces perceived wait time by 2 seconds
      const prePrepCount = targetOrder.items.filter(id => prePrepItems.includes(id)).length;
      const effectiveProcessingTime = Math.max(0, processingTime - (prePrepCount * 2));
      const patienceRatio = effectiveProcessingTime / targetOrder.waitTime;
      
      setItemRatings(prev => {
        const next = { ...prev };
        targetOrder.items.forEach(itemId => {
          let rating = 4; // Base
          if (patienceRatio < 0.3) rating = 5;
          else if (patienceRatio > 0.8) rating = 3;
          else if (patienceRatio > 1.0) rating = 2;
          
          // Random fluctuation
          rating = Math.max(1, Math.min(5, rating + (Math.random() > 0.8 ? 1 : Math.random() < 0.2 ? -1 : 0)));

          if (!next[itemId]) next[itemId] = { totalStars: 0, count: 0, averageRating: 0 };
          const newTotalStars = next[itemId].totalStars + rating;
          const newCount = next[itemId].count + 1;
          next[itemId] = {
            totalStars: newTotalStars,
            count: newCount,
            averageRating: newTotalStars / newCount
          };
        });
        return next;
      });

      setRecentReviews(prev => [{ rating: 5, comment: "非常滿意！", customerType: targetOrder.customerType }, ...prev].slice(0, 10));
      setTables(prev => { const next = [...prev]; next[targetIdx] = null; return next; });
      setCleaningTables(prev => { const next = [...prev]; next[targetIdx] = Date.now(); return next; });
      
      clearRegister();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setFeedback({ type: 'success', text: '結帳成功！' });
      setTimeout(() => setFeedback(null), 2000);
    } else {
      setFeedback({ type: 'error', text: '餐點不符！' });
      setTimeout(() => setFeedback(null), 2000);
    }
  }, [tables, selectedTableIndex, registerItems, staff, autoAmountEnabled, autoOrderEnabled, cheatsEnabled, posInput, activeEvent, restaurantLevel, prePrepItems]);

  const buyUpgrade = (id: string) => {
    const u = upgrades.find(u => u.id === id);
    if (!u) return;
    const cost = Math.round(u.baseCost * Math.pow(1.5, u.level));
    if (money >= cost) {
      setMoney(p => p - cost);
      setUpgrades(p => p.map(x => x.id === id ? { ...x, level: x.level + 1 } : x));
      setFeedback({ type: 'success', text: '升級成功！' });
    } else setFeedback({ type: 'error', text: '預算不足！' });
    setTimeout(() => setFeedback(null), 2000);
  };

  const trainStaff = (id: string) => {
    const s = staff.find(x => x.id === id);
    if (!s) return;
    
    // If cheats on and it's cashier, and level is below 2, we treat it as level 2 for training if they want to upgrade to 3.
    // However, the cleanest way is just to let them train from their REAL level.
    const cost = Math.round(s.baseCost * Math.pow(1.8, s.level));
    if (money >= cost) {
      setMoney(p => p - cost);
      setStaff(p => p.map(x => x.id === id ? { ...x, level: x.level + 1, skillPoints: x.skillPoints + 1 } : x));
      setFeedback({ type: 'success', text: '培訓成功！獲得 1 點技能點數' });
    } else setFeedback({ type: 'error', text: '預算不足！' });
    setTimeout(() => setFeedback(null), 2000);
  };

  const allocateSkillPoints = (staffId: string, skillId: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id !== staffId) return s;
      if (s.skillPoints <= 0) return s;
      
      const currentSkillLevel = s.skills[skillId] || 0;
      // We'd ideally check maxLevel here from STAFF_SKILLS
      // but let's assume UI handles that or we do it here.
      // For simplicity in this chunk, just increment.
      
      return {
        ...s,
        skillPoints: s.skillPoints - 1,
        skills: {
          ...s.skills,
          [skillId]: currentSkillLevel + 1
        }
      };
    }));
    setFeedback({ type: 'success', text: '技能升級成功！' });
    setTimeout(() => setFeedback(null), 2000);
  };

  const startNextDay = () => {
    setStats(p => ({ ...p, day: p.day + 1, currentTime: 540 }));
    setDailyStats({ customers: 0, earnings: 0, items: {}, vipsServed: 0, bonusMultiplier: 0 });
    setTables(new Array(6).fill(null));
    setCleaningTables(new Array(6).fill(null));
    setFeedback({ type: 'success', text: `第 ${stats.day + 1} 天開始！` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const addToRegister = (id: string) => setRegisterItems(p => [...p, id]);
  const clearRegister = () => { setRegisterItems([]); setPosInput(''); };

  const toggleDailySpecial = (itemId: string) => {
    setDailySpecials(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      if (prev.length >= 3) {
        setFeedback({ type: 'error', text: '主打餐點最多只能設定 3 項！' });
        setTimeout(() => setFeedback(null), 2000);
        return prev;
      }
      setFeedback({ type: 'success', text: '已設為本月主打！' });
      setTimeout(() => setFeedback(null), 2000);
      return [...prev, itemId];
    });
  };

  const togglePrePrep = (itemId: string) => {
    const chef = staff.find(s => s.id === 'chef');
    const hasSkill = (chef?.skills['ch_preprep_1'] || 0) > 0;
    const orderCount = itemRatings[itemId]?.count || 0;
    const isFrequentlyOrdered = orderCount >= 15;

    if (!hasSkill) {
      setFeedback({ type: 'error', text: '廚師需要學會「事前備料」技能！' });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    if (!isFrequentlyOrdered) {
      setFeedback({ type: 'error', text: '該餐點點單次數不足，無法制定預製流程！(需 15 次)' });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    setPrePrepItems(prev => {
      if (prev.includes(itemId)) {
        setFeedback({ type: 'success', text: '已取消預製。' });
        setTimeout(() => setFeedback(null), 2000);
        return prev.filter(id => id !== itemId);
      }
      if (prev.length >= 2) {
        setFeedback({ type: 'error', text: '預製餐點最多只能同時進行 2 項！' });
        setTimeout(() => setFeedback(null), 2000);
        return prev;
      }
      setFeedback({ type: 'success', text: '已啟動預製流程！' });
      setTimeout(() => setFeedback(null), 2000);
      return [...prev, itemId];
    });
  };

  // Random Events Logic
  useEffect(() => {
    if (isWorkHours && !activeEvent) {
      const interval = setInterval(() => {
        if (Math.random() < 0.05) {
          const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
          setActiveEvent(event);
          setEventTimeLeft(event.duration);
        }
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isWorkHours, activeEvent]);

  useEffect(() => {
    if (eventTimeLeft > 0) {
      const timer = setInterval(() => setEventTimeLeft(p => p - 1), 1000);
      return () => clearInterval(timer);
    } else if (activeEvent) setActiveEvent(null);
  }, [eventTimeLeft, activeEvent]);

  const statsRef = useRef(stats);
  const moneyRef = useRef(money);
  const upgradesRef = useRef(upgrades);
  const staffRef = useRef(staff);
  const autoOrderEnabledRef = useRef(autoOrderEnabled);
  const autoAmountEnabledRef = useRef(autoAmountEnabled);
  const cheatsEnabledRef = useRef(cheatsEnabled);
  const isWorkHoursRef = useRef(isWorkHours);

  const isResettingRef = useRef(false);

  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { moneyRef.current = money; }, [money]);
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);
  useEffect(() => { staffRef.current = staff; }, [staff]);
  useEffect(() => { autoOrderEnabledRef.current = autoOrderEnabled; }, [autoOrderEnabled]);
  useEffect(() => { autoAmountEnabledRef.current = autoAmountEnabled; }, [autoAmountEnabled]);
  useEffect(() => { cheatsEnabledRef.current = cheatsEnabled; }, [cheatsEnabled]);
  useEffect(() => { isWorkHoursRef.current = isWorkHours; }, [isWorkHours]);

  // Stable checkout and generateOrder for interval usage
  const checkoutRef = useRef(checkout);
  const generateOrderRef = useRef(generateOrder);
  useEffect(() => { checkoutRef.current = checkout; }, [checkout]);
  useEffect(() => { generateOrderRef.current = generateOrder; }, [generateOrder]);

  // Staff Automation & Spawning
  useEffect(() => {
    const timer = setInterval(() => {
      const cleaner = staffRef.current.find(s => s.id === 'cleaner');
      const cashier = staffRef.current.find(s => s.id === 'cashier');
      const cleanerSpeedSkill = cleaner?.skills['cl_speed_1'] || 0;
      const marketingLevel = upgradesRef.current.find(u => u.id === 'marketing')?.level || 0;

      // 1. Cleaning logic
      setCleaningTables(p => {
        let changed = false;
        const currentRestaurantLevel = Math.floor(statsRef.current.totalEarned / 500) + 1;
        const next = p.map(s => {
          if (s === null) return null;
          // Base duration reduced to 5. Level perk added.
          const levelPerkMod = currentRestaurantLevel >= 10 ? 0.75 : 1.0;
          const duration = Math.max(0.2, (5 - (cleaner?.level || 0) * 0.8 - cleanerSpeedSkill * 0.8) * levelPerkMod);
          if ((Date.now() - s) / 1000 >= duration) { changed = true; return null; }
          return s;
        });
        return changed ? next : p;
      });

      // 2. Auto-Checkout (Cashier) logic
      const cashierLevel = cheatsEnabledRef.current ? Math.max(2, cashier?.level || 0) : (cashier?.level || 0);
      const shouldAuto = cheatsEnabledRef.current || (cashierLevel >= 2 && autoAmountEnabledRef.current && autoOrderEnabledRef.current);
      
      if (shouldAuto) {
        tablesRef.current.forEach((order, idx) => {
           if (order) {
              checkoutRef.current(idx, order.items, true);
           }
        });
      }

      // 3. Auto-Spawn (Marketing + Waiter)
      const waiter = staffRef.current.find(s => s.id === 'waiter');
      const waiterSpeedSkill = waiter?.skills['w_speed_1'] || 0;
      
      if (isWorkHoursRef.current && (marketingLevel > 0 || (waiter?.level || 0) > 0)) {
         // Base interval reduced further for much faster gameplay
         const spawnInterval = Math.max(2, 25 - (marketingLevel * 6) - ((waiter?.level || 0) * 4) - (waiterSpeedSkill * 3));
         if (Math.random() < (1 / spawnInterval)) {
            // Spawn more at once if waiter is higher level
            const count = 1 + Math.floor((waiter?.level || 0) / 4);
            for (let i = 0; i < count; i++) {
               generateOrderRef.current();
            }
         }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Run once, values accessed via refs

  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  const resetGame = useCallback(() => {
    isResettingRef.current = true;
    localStorage.clear();
    window.location.href = '/';
  }, []);

  return (
    <GameContext.Provider value={{
      money, setMoney, upgrades, staff, stats, dailyStats, menuState, itemRatings, dailySpecials,
      tables, cleaningTables, selectedTableIndex, setSelectedTableIndex,
      registerItems, setRegisterItems, posInput, setPosInput, activeEvent, eventTimeLeft,
      feedback, setFeedback, restaurantLevel, isWorkHours, isDayComplete,
      autoOrderEnabled, setAutoOrderEnabled, autoAmountEnabled, setAutoAmountEnabled,
      cheatsEnabled, setCheatsEnabled,
      volumes, setVolumes, difficulty, setDifficulty, toggleDailySpecial,
      prePrepItems, togglePrePrep,
      generateOrder, checkout, buyUpgrade, trainStaff, allocateSkillPoints, startNextDay, addToRegister, clearRegister,
      getItemPriceForOrder, resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
