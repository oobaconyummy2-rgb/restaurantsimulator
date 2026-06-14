import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  FoodItem, 
  Order, 
  MenuState, 
  ItemRating, 
  Upgrade, 
  Staff, 
  GameEvent, 
  GameStats, 
  DailyStats,
  GachaCard,
  DailyQuest
} from '../types';
import { 
  FOOD_ITEMS, 
  INITIAL_UPGRADES, 
  INITIAL_STAFF, 
  RANDOM_EVENTS, 
  CUSTOMER_TYPES,
  GACHA_CARDS
} from '../constants';
import confetti from 'canvas-confetti';

interface GameContextType {
  money: number;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  gems: number;
  setGems: React.Dispatch<React.SetStateAction<number>>;
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
  
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
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
  hurryTable: (tableIdx: number) => void;
 
  // Gacha System
  ownedCardIds: string[];
  equippedCards: Record<string, string | null>;
  gachaCost: number;
  drawCard: (isCheat?: boolean, poolType?: 'equipment' | 'skills' | 'decor') => GachaCard | null;
  drawTenCards: (isCheat?: boolean, poolType?: 'equipment' | 'skills' | 'decor') => GachaCard[];
  equipCard: (staffId: string, cardId: string | null) => void;
  // Lucky Cat System
  luckyCatLastPet: number;
  luckyCatBuff: {
    id: string;
    name: string;
    description: string;
    type: 'price' | 'patience' | 'speed' | 'tip_chance';
    value: number;
    expiresAt: number;
  } | null;
  petLuckyCat: () => boolean;

  // Pause System
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  togglePause: () => void;

  // Daily Quests
  dailyQuests: DailyQuest[];
  claimDailyQuestReward: (id: string) => void;

  // New Rating System
  ratings: {
    food: number;
    decor: number;
    service: number;
    overall: number;
  };
  cardBenefits: {
    speedBonus: number;
    patienceBonus: number;
    priceBonus: number;
    spawnBonus: number;
    tipBonus: number;
  };
  gameStarted: boolean;
  startGame: () => void;
  recentReviews: any[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- State ---
  const [money, setMoney] = useState<number>(() => {
    const saved = localStorage.getItem('rt_money');
    return saved ? parseFloat(saved) : 100;
  });

  const [gems, setGems] = useState<number>(() => {
    const saved = localStorage.getItem('rt_gems');
    return saved ? parseInt(saved) : 3000;
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

  const [ownedCardIds, setOwnedCardIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('rt_owned_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [equippedCards, setEquippedCards] = useState<Record<string, string | null>>(() => {
    const saved = localStorage.getItem('rt_equipped_cards');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      waiter: parsed.waiter || null,
      cashier: parsed.cashier || null,
      chef: parsed.chef || null,
      host: parsed.host || null,
      cleaner: parsed.cleaner || null,
      manager: parsed.manager || null,

      // Equipment slots
      oven: parsed.oven || null,
      dishwasher: parsed.dishwasher || null,
      register: parsed.register || null,
      fridge: parsed.fridge || null,

      // Skills slots
      peak_hour: parsed.peak_hour || null,
      glutton: parsed.glutton || null,
      discount: parsed.discount || null,
      prep: parsed.prep || null,

      // Decor slots
      tables: parsed.tables || null,
      floor: parsed.floor || null,
      wallpaper: parsed.wallpaper || null,
      sign: parsed.sign || null,
      uniform: parsed.uniform || null
    };
  });

  const [luckyCatLastPet, setLuckyCatLastPet] = useState<number>(() => {
    const saved = localStorage.getItem('rt_cat_last_pet');
    return saved ? parseInt(saved) : 0;
  });

  const [luckyCatBuff, setLuckyCatBuff] = useState<{
    id: string;
    name: string;
    description: string;
    type: 'price' | 'patience' | 'speed' | 'tip_chance';
    value: number;
    expiresAt: number;
  } | null>(() => {
    const saved = localStorage.getItem('rt_cat_buff');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.expiresAt < Date.now()) {
        localStorage.removeItem('rt_cat_buff');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const gachaCost = 200;

  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [eventTimeLeft, setEventTimeLeft] = useState<number>(0);

  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);

  const [gameStarted, setGameStarted] = useState<boolean>(() => {
    const saved = localStorage.getItem('rt_game_started');
    return saved === 'true';
  });

  const startGame = useCallback(() => {
    setGameStarted(true);
    localStorage.setItem('rt_game_started', 'true');
  }, []);

  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => {
    const saved = localStorage.getItem('rt_daily_quests');
    return saved ? JSON.parse(saved) : [
      { id: 'q_serve', description: '招來並服務 15 名顧客', target: 15, current: 0, rewardGems: 1500, completed: false, claimed: false },
      { id: 'q_earnings', description: '今日結帳獲得累計 $800 營業金', target: 800, current: 0, rewardGems: 1000, completed: false, claimed: false },
      { id: 'q_upgrade', description: '今天進行 2 次餐廳或菜單升級', target: 2, current: 0, rewardGems: 1200, completed: false, claimed: false },
      { id: 'q_gacha', description: '今天進行 1 次特殊特務稱號招募', target: 1, current: 0, rewardGems: 1000, completed: false, claimed: false }
    ];
  });

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const next = !prev;
      if (next) {
        setPauseStartTime(Date.now());
      } else {
        if (pauseStartTime) {
          const pausedDuration = Date.now() - pauseStartTime;
          if (pausedDuration > 0) {
            setTables(prevTables => prevTables.map(t => t ? { ...t, startTime: t.startTime + pausedDuration } : null));
            setCleaningTables(prevClean => prevClean.map(c => c !== null ? c + pausedDuration : null));
            setLuckyCatBuff(prevBuff => prevBuff ? { ...prevBuff, expiresAt: prevBuff.expiresAt + pausedDuration } : null);
          }
        }
        setPauseStartTime(null);
      }
      return next;
    });
  }, [pauseStartTime]);

  const claimDailyQuestReward = useCallback((id: string) => {
    setGems(g => g); // Keep reference to trigger gems updates
    setDailyQuests(prev => prev.map(q => {
      if (q.id === id && q.completed && !q.claimed) {
        setGems(g => g + q.rewardGems);
        setFeedback({ type: 'success', text: `精妙！獲得 ${q.rewardGems} 顆寶石！💎` });
        confetti({ particleCount: 40, spread: 70 });
        setTimeout(() => setFeedback(null), 1500);
        return { ...q, claimed: true };
      }
      return q;
    }));
  }, []);

  const restaurantLevel = Math.floor(stats.totalEarned / 500) + 1;
  const isWorkHours = stats.currentTime < 1380;
  const isDayComplete = stats.currentTime >= 1380 && tables.every(t => t === null) && cleaningTables.every(c => c === null);

  const tablesRef = useRef<(Order | null)[]>([]);
  useEffect(() => { tablesRef.current = tables; }, [tables]);

  // Persistence
  useEffect(() => {
    if (isResettingRef.current) return;
    localStorage.setItem('rt_money', money.toString());
    localStorage.setItem('rt_gems', gems.toString());
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
    localStorage.setItem('rt_owned_cards', JSON.stringify(ownedCardIds));
    localStorage.setItem('rt_equipped_cards', JSON.stringify(equippedCards));
    localStorage.setItem('rt_staff_v3', JSON.stringify(staff.map(s => ({ 
      id: s.id, 
      level: s.level,
      skillPoints: s.skillPoints,
      skills: s.skills
    }))));
    localStorage.setItem('rt_difficulty', difficulty);
    localStorage.setItem('rt_daily_quests', JSON.stringify(dailyQuests));
  }, [money, gems, upgrades, staff, stats, dailyStats, menuState, itemRatings, dailySpecials, autoOrderEnabled, autoAmountEnabled, volumes, difficulty, ownedCardIds, equippedCards, dailyQuests]);

  // Migration: Ensure cleaner speed skill is at least level 5
  useEffect(() => {
    const cleaner = staff.find(s => s.id === 'cleaner');
    if (cleaner && (cleaner.skills['cl_speed_1'] || 0) < 5) {
      setStaff(prev => prev.map(s => s.id === 'cleaner' ? { ...s, skills: { ...s.skills, 'cl_speed_1': 5 } } : s));
    }
  }, [staff]);

  const cardBenefits = useMemo(() => {
    let speedBonus = 0;
    let patienceBonus = 0;
    let priceBonus = 0;
    let spawnBonus = 0;
    let tipBonus = 0;

    Object.keys(equippedCards).forEach(slotKey => {
      const cardId = equippedCards[slotKey];
      if (!cardId) return;
      const card = GACHA_CARDS.find(c => c.id === cardId);
      if (!card) return;
      
      if (card.stats.extraSpeed) speedBonus += card.stats.extraSpeed;
      if (card.stats.patienceMod) patienceBonus += card.stats.patienceMod;
      if (card.stats.priceMod) priceBonus += card.stats.priceMod;
      if (card.stats.spawnRateBonus) spawnBonus += card.stats.spawnRateBonus;
      if (card.stats.extraTipChance) tipBonus += card.stats.extraTipChance;
    });

    return {
      speedBonus,
      patienceBonus,
      priceBonus,
      spawnBonus,
      tipBonus
    };
  }, [equippedCards]);

  const ratings = useMemo(() => {
    // 1. FOOD rating (Max 5.0)
    const chef = staff.find(s => s.id === 'chef');
    const chefLevel = chef?.level || 0;
    const chefSpeedSkill = chef?.skills['ch_speed_1'] || 0;
    const chefPrePrepSkill = chef?.skills['ch_preprep_1'] || 0;
    
    let foodUpgradeLevels = 0;
    upgrades.forEach(u => {
      if (u.id.startsWith('menu_')) {
        foodUpgradeLevels += u.level;
      }
    });

    // Active Equipment Cards for Food: Oven, Fridge
    let foodCardStars = 0;
    const activeOven = GACHA_CARDS.find(c => c.id === equippedCards['oven']);
    const activeFridge = GACHA_CARDS.find(c => c.id === equippedCards['fridge']);
    const activePrep = GACHA_CARDS.find(c => c.id === equippedCards['prep']);

    if (activeOven) {
      if (activeOven.rarity === 'R') foodCardStars += 0.3;
      else if (activeOven.rarity === 'S') foodCardStars += 0.6;
      else if (activeOven.rarity === 'SR') foodCardStars += 0.9;
      else if (activeOven.rarity === 'SSR') foodCardStars += 1.3;
    }
    if (activeFridge) {
      if (activeFridge.rarity === 'R') foodCardStars += 0.2;
      else if (activeFridge.rarity === 'S') foodCardStars += 0.5;
      else if (activeFridge.rarity === 'SR') foodCardStars += 0.8;
      else if (activeFridge.rarity === 'SSR') foodCardStars += 1.2;
    }
    if (activePrep) {
      if (activePrep.rarity === 'R') foodCardStars += 0.1;
      else if (activePrep.rarity === 'S') foodCardStars += 0.25;
      else if (activePrep.rarity === 'SR') foodCardStars += 0.45;
      else if (activePrep.rarity === 'SSR') foodCardStars += 0.7;
    }

    const rawFood = 1.0 + (foodUpgradeLevels * 0.15) + (chefLevel * 0.1) + (chefSpeedSkill * 0.12) + (chefPrePrepSkill * 0.2) + foodCardStars;
    const foodRating = Math.max(1.0, Math.min(5.0, Math.round(rawFood * 10) / 10));

    // 2. DECOR rating (Max 5.0)
    const decorUpgrade = upgrades.find(u => u.id === 'decor');
    const decorLevel = decorUpgrade?.level || 0;

    let decorCardStars = 0;
    const activeTables = GACHA_CARDS.find(c => c.id === equippedCards['tables']);
    const activeFloor = GACHA_CARDS.find(c => c.id === equippedCards['floor']);
    const activeWallpaper = GACHA_CARDS.find(c => c.id === equippedCards['wallpaper']);
    const activeSign = GACHA_CARDS.find(c => c.id === equippedCards['sign']);
    const activeUniform = GACHA_CARDS.find(c => c.id === equippedCards['uniform']);

    if (activeTables) {
      if (activeTables.rarity === 'R') decorCardStars += 0.2;
      else if (activeTables.rarity === 'S') decorCardStars += 0.4;
      else if (activeTables.rarity === 'SR') decorCardStars += 0.7;
      else if (activeTables.rarity === 'SSR') decorCardStars += 1.1;
    }
    if (activeFloor) {
      if (activeFloor.rarity === 'R') decorCardStars += 0.1;
      else if (activeFloor.rarity === 'S') decorCardStars += 0.3;
      else if (activeFloor.rarity === 'SR') decorCardStars += 0.6;
      else if (activeFloor.rarity === 'SSR') decorCardStars += 0.9;
    }
    if (activeWallpaper) {
      if (activeWallpaper.rarity === 'R') decorCardStars += 0.1;
      else if (activeWallpaper.rarity === 'S') decorCardStars += 0.3;
      else if (activeWallpaper.rarity === 'SR') decorCardStars += 0.5;
      else if (activeWallpaper.rarity === 'SSR') decorCardStars += 0.8;
    }
    if (activeSign) {
      if (activeSign.rarity === 'R') decorCardStars += 0.2;
      else if (activeSign.rarity === 'S') decorCardStars += 0.5;
      else if (activeSign.rarity === 'SR') decorCardStars += 0.8;
      else if (activeSign.rarity === 'SSR') decorCardStars += 1.2;
    }
    if (activeUniform) {
      if (activeUniform.rarity === 'R') decorCardStars += 0.1;
      else if (activeUniform.rarity === 'S') decorCardStars += 0.2;
      else if (activeUniform.rarity === 'SR') decorCardStars += 0.4;
      else if (activeUniform.rarity === 'SSR') decorCardStars += 0.7;
    }

    const rawDecor = 1.0 + (decorLevel * 0.4) + decorCardStars;
    const decorRating = Math.max(1.0, Math.min(5.0, Math.round(rawDecor * 10) / 10));

    // 3. SERVICE rating (Max 5.0)
    const waiter = staff.find(s => s.id === 'waiter');
    const cashier = staff.find(s => s.id === 'cashier');
    const host = staff.find(s => s.id === 'host');
    const cleaner = staff.find(s => s.id === 'cleaner');

    const totalStaffLevels = (waiter?.level || 0) + (cashier?.level || 0) + (host?.level || 0) + (cleaner?.level || 0);

    let serviceCardStars = 0;
    const activeRegister = GACHA_CARDS.find(c => c.id === equippedCards['register']);
    const activeDishwasher = GACHA_CARDS.find(c => c.id === equippedCards['dishwasher']);
    const activeDiscount = GACHA_CARDS.find(c => c.id === equippedCards['discount']);
    const activeGlutton = GACHA_CARDS.find(c => c.id === equippedCards['glutton']);

    if (activeRegister) {
      if (activeRegister.rarity === 'R') serviceCardStars += 0.2;
      else if (activeRegister.rarity === 'S') serviceCardStars += 0.4;
      else if (activeRegister.rarity === 'SR') serviceCardStars += 0.7;
      else if (activeRegister.rarity === 'SSR') serviceCardStars += 1.1;
    }
    if (activeDishwasher) {
      if (activeDishwasher.rarity === 'R') serviceCardStars += 0.2;
      else if (activeDishwasher.rarity === 'S') serviceCardStars += 0.4;
      else if (activeDishwasher.rarity === 'SR') serviceCardStars += 0.7;
      else if (activeDishwasher.rarity === 'SSR') serviceCardStars += 1.1;
    }
    if (activeDiscount) {
      if (activeDiscount.rarity === 'R') serviceCardStars += 0.1;
      else if (activeDiscount.rarity === 'S') serviceCardStars += 0.3;
      else if (activeDiscount.rarity === 'SR') serviceCardStars += 0.5;
      else if (activeDiscount.rarity === 'SSR') serviceCardStars += 0.8;
    }
    if (activeGlutton) {
      if (activeGlutton.rarity === 'R') serviceCardStars += 0.1;
      else if (activeGlutton.rarity === 'S') serviceCardStars += 0.25;
      else if (activeGlutton.rarity === 'SR') serviceCardStars += 0.45;
      else if (activeGlutton.rarity === 'SSR') serviceCardStars += 0.7;
    }

    const rawService = 1.0 + (totalStaffLevels * 0.12) + serviceCardStars;
    const serviceRating = Math.max(1.0, Math.min(5.0, Math.round(rawService * 10) / 10));

    // Overall Average
    const overallRating = Math.max(1.0, Math.min(5.0, Math.round(((foodRating + decorRating + serviceRating) / 3) * 10) / 10));

    return {
      food: foodRating,
      decor: decorRating,
      service: serviceRating,
      overall: overallRating
    };
  }, [upgrades, staff, equippedCards]);

  const getEquippedCard = useCallback((staffId: string): GachaCard | null => {
    const cardId = equippedCards[staffId];
    if (!cardId) return null;
    return GACHA_CARDS.find(c => c.id === cardId) || null;
  }, [equippedCards]);

  const calculateItemPrice = useCallback((itemId: string, isVip: boolean = false) => {
    const item = FOOD_ITEMS.find(f => f.id === itemId);
    const mState = menuState[itemId];
    const rating = itemRatings[itemId];
    const chef = staff.find(s => s.id === 'chef');
    const chefPriceSkill = chef?.skills['ch_price_1'] || 0;
    
    const catPriceBonus = (luckyCatBuff && luckyCatBuff.type === 'price' && luckyCatBuff.expiresAt > Date.now()) ? luckyCatBuff.value : 0;
    const chefVirtualLevel = (chef?.level || 0);

    const premiumLevel = upgrades.find(u => u.id === 'premium')?.level || 0;
    
    const vipMultiplier = isVip ? 1.5 : 1;
    // Base modifications + cardBenefits price bonus
    const mod = (1 + chefVirtualLevel * 0.1 + chefPriceSkill * 0.05 + cardBenefits.priceBonus + catPriceBonus) * (1 + premiumLevel * 0.15) * vipMultiplier * (mState?.priceMod || 1);
    
    // Average item-specific rating mod
    const avgRating = rating?.count > 0 ? rating.totalStars / rating.count : 3;
    const itemRatingMod = 1 + (avgRating - 3) * 0.05;

    // Overall Food Rating factor: Food Rating ranges from 1.0 to 5.0, giving additional -10% to +16%
    const foodRatingMod = 1 + (ratings.food - 3.0) * 0.08;

    const specialMod = dailySpecials.includes(itemId) ? 1.25 : 1;
    const levelPriceMod = restaurantLevel >= 25 ? 1.15 : 1;
    
    const rawPrice = (item?.price || 0) * mod * itemRatingMod * foodRatingMod * specialMod * levelPriceMod;
    // Round to nearest whole number to avoid "troublesome" decimals
    return Math.ceil(rawPrice);
  }, [menuState, itemRatings, staff, upgrades, dailySpecials, restaurantLevel, luckyCatBuff, cardBenefits, ratings]);

  const getItemPriceForOrder = useCallback((itemId: string, order: Order | null) => {
    if (order?.unitPrices && order.unitPrices[itemId] !== undefined) {
      return order.unitPrices[itemId];
    }
    return calculateItemPrice(itemId, order?.isVip || false);
  }, [calculateItemPrice]);

  const generateOrder = useCallback(() => {
    const decorLevel = upgrades.find(u => u.id === 'decor')?.level || 0;
    const host = staff.find(s => s.id === 'host');
    const hostLevel = host?.level || 0;

    const hostCard = getEquippedCard('host');
    const hostLevelBonus = hostCard?.stats.staffLevelBonus || 0;

    const managerCard = getEquippedCard('manager');
    const managerLevelBonus = managerCard?.stats.staffLevelBonus || 0;
    const managerPatienceBonus = managerCard?.stats.patienceMod || 0;

    const catPatienceBonus = (luckyCatBuff && luckyCatBuff.type === 'patience' && luckyCatBuff.expiresAt > Date.now()) ? luckyCatBuff.value : 0;

    const hostVirtualLevel = hostLevel + hostLevelBonus + managerLevelBonus;
    const hostCardVipBonus = hostCard?.stats.extraTipChance || 0;

    const vipChanceBonus = (hostVirtualLevel >= 4 ? 0.15 : 0) + hostCardVipBonus;
    const forceVip = activeEvent?.effects.forceType === 'vip';
    const levelVipMod = restaurantLevel >= 15 ? 1.5 : 1;
    const isVipSpawn = forceVip || Math.random() < ((0.05 + decorLevel * 0.05 + hostVirtualLevel * 0.03 + vipChanceBonus) * levelVipMod);
    
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

    const patienceSkill = host?.skills['h_patience_1'] || 0;
    const hostCardPatienceBonus = hostCard?.stats.patienceMod || 0;
    
    const waitTime = (30 + decorLevel * 9 + patienceSkill * 10 + (hostCardPatienceBonus + managerPatienceBonus + catPatienceBonus) * 40) * (activeEvent?.effects.patienceMod || 1) * (difficulty === 'easy' ? 1.5 : difficulty === 'hard' ? 0.7 : 1);

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
    
    const catTipChanceBonus = (luckyCatBuff && luckyCatBuff.type === 'tip_chance' && luckyCatBuff.expiresAt > Date.now()) ? luckyCatBuff.value : 0;
    const catPriceBonusComp = (luckyCatBuff && luckyCatBuff.type === 'price' && luckyCatBuff.expiresAt > Date.now()) ? luckyCatBuff.value : 0;

    const cashierVirtualLevel = (cashier?.level || 0);
    
    const cashierLevel = cheatsEnabled ? Math.max(2, cashierVirtualLevel) : cashierVirtualLevel;
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
      const waiterVirtualLevel = (waiter?.level || 0);

      const waiterTipSkill = waiter?.skills['w_tip_1'] || 0;
      const cashierMathSkill = (cashier?.skills['ca_math_1'] || 0) + cardBenefits.tipBonus;
      
      const tipChance = 0.5 + waiterTipSkill * 0.1 + cardBenefits.tipBonus + catTipChanceBonus;
      const tipMod = Math.random() < tipChance ? 1.0 : 0.5;
      
      let baseTipScale = waiterVirtualLevel * 0.05 + 0.1;
      // Service rating scales tip up to +15% at 5.0 stars
      const serviceTipMod = 1 + (ratings.service - 3.0) * 0.051;
      const tip = targetOrder.total * baseTipScale * tipMod * serviceTipMod;
      
      let revenueBonus = 1.0;
      if (Math.random() < cashierMathSkill * 0.05) {
        revenueBonus = 1.1;
        setFeedback({ type: 'success', text: '結帳驚喜：收入 +10%！' });
      }

      const finalAmount = (targetOrder.total + tip) * 
                          (activeEvent?.effects.priceMod || 1) * 
                          (restaurantLevel >= 5 ? 1.1 : 1) * 
                          revenueBonus * 
                          (1 + cardBenefits.priceBonus + catPriceBonusComp);

      setMoney(prev => prev + finalAmount);
      setGems(prev => prev + 50);
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

      setDailyQuests(prevQuests => prevQuests.map(q => {
        if (q.id === 'q_serve') {
          const current = Math.min(q.target, q.current + 1);
          return { ...q, current, completed: current >= q.target };
        }
        if (q.id === 'q_earnings') {
          const current = Math.min(q.target, q.current + Math.floor(finalAmount));
          return { ...q, current, completed: current >= q.target };
        }
        return q;
      }));

      // Update Item Ratings
      const processingTime = (Date.now() - targetOrder.startTime) / 1000;
      
      // Calculate Pre-prep bonus: Each prepped item reduces perceived wait time by 2 seconds
      const prePrepCount = targetOrder.items.filter(id => prePrepItems.includes(id)).length;
      const effectiveProcessingTime = Math.max(0, processingTime - (prePrepCount * 2));
      const patienceRatio = effectiveProcessingTime / targetOrder.waitTime;
      
      setItemRatings(prev => {
        const next = { ...prev };
        let totalRatingSum = 0;
        let ratedCount = 0;

        targetOrder.items.forEach(itemId => {
          let rating = 4; // Base
          if (patienceRatio < 0.3) rating = 5;
          else if (patienceRatio > 0.8) rating = 3;
          else if (patienceRatio > 1.0) rating = 2;
          
          // Random fluctuation
          rating = Math.max(1, Math.min(5, rating + (Math.random() > 0.8 ? 1 : Math.random() < 0.2 ? -1 : 0)));
          totalRatingSum += rating;
          ratedCount += 1;

          if (!next[itemId]) next[itemId] = { totalStars: 0, count: 0, averageRating: 0 };
          const newTotalStars = next[itemId].totalStars + rating;
          const newCount = next[itemId].count + 1;
          next[itemId] = {
            totalStars: newTotalStars,
            count: newCount,
            averageRating: newTotalStars / newCount
          };
        });

        // Calculate overall average customer rating (1-5 range)
        const avgCustRating = ratedCount > 0 ? Math.round(totalRatingSum / ratedCount) : 5;
        const commentsByStars: Record<number, string[]> = {
          5: [
            "非常滿意！服務快速，超乎期待！🤤",
            "這家店是人間美味！一定要再來！✨",
            "超完美用餐體驗，出餐快得不可思議！🚀",
            "服務貼心，餐點滿分，無懈可擊！👑"
          ],
          4: [
            "味道很讚，出餐速度也可以接受！👍",
            "整體很不錯，會推薦給朋友！🔥",
            "算是一次愉快的用餐，推推～✨",
            "好吃！如果能再稍微快一點點就更完美了。👀"
          ],
          3: [
            "普通，出餐速度稍微慢了些。😐",
            "還可以吧，中規中矩。👌",
            "餐點還行，但服務生好像有點忙不過來？🏃",
            "一般般，冷氣可以再涼一點。💨"
          ],
          2: [
            "等得有點太久了，吃得不是很開心。😡",
            "出餐慢，服務也有待加強...😣",
            "一般啦，但也太沒效率了吧。😤"
          ],
          1: [
            "太誇張了！等到快升天，完全不想再來了！🤬",
            "差評！等超久而且服務態度很差！👎",
            "黑名單店，極度不推薦！💥"
          ]
        };
        const commentsOfStar = commentsByStars[avgCustRating] || commentsByStars[5];
        const randomComment = commentsOfStar[Math.floor(Math.random() * commentsOfStar.length)];

        setRecentReviews(prev => {
          const next = [{ rating: avgCustRating, comment: randomComment, customerType: targetOrder.customerType, time: Date.now() }, ...prev].slice(0, 10);
          localStorage.setItem('rt_recent_reviews', JSON.stringify(next));
          return next;
        });

        return next;
      });
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
    const canAfford = money >= cost;
    if (cheatsEnabled || canAfford) {
      if (!cheatsEnabled && canAfford) {
        setMoney(p => p - cost);
      }
      setUpgrades(p => p.map(x => x.id === id ? { ...x, level: x.level + 1 } : x));
      setFeedback({ type: 'success', text: '升級成功！' });
      setDailyQuests(prevQuests => prevQuests.map(q => {
        if (q.id === 'q_upgrade') {
          const current = Math.min(q.target, q.current + 1);
          return { ...q, current, completed: current >= q.target };
        }
        return q;
      }));
    } else setFeedback({ type: 'error', text: '預算不足！' });
    setTimeout(() => setFeedback(null), 2000);
  };

  const trainStaff = (id: string) => {
    const s = staff.find(x => x.id === id);
    if (!s) return;
    
    // If cheats on and it's cashier, and level is below 2, we treat it as level 2 for training if they want to upgrade to 3.
    // However, the cleanest way is just to let them train from their REAL level.
    const cost = Math.round(s.baseCost * Math.pow(1.8, s.level));
    const canAfford = money >= cost;
    if (cheatsEnabled || canAfford) {
      if (!cheatsEnabled && canAfford) {
        setMoney(p => p - cost);
      }
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

  const hurryTable = useCallback((tableIdx: number) => {
    setTables(prev => {
      const next = [...prev];
      if (next[tableIdx]) {
        next[tableIdx] = {
          ...next[tableIdx]!,
          startTime: next[tableIdx]!.startTime + 25000
        };
      }
      return next;
    });
    setFeedback({ type: 'success', text: '服務生催熟：顧客加快了吃飯與買單速度！⚡' });
    setTimeout(() => setFeedback(null), 1500);
  }, []);

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
    if (isWorkHours && !activeEvent && !isPaused) {
      const interval = setInterval(() => {
        if (isPausedRef.current) return;
        if (Math.random() < 0.05) {
          const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
          setActiveEvent(event);
          setEventTimeLeft(event.duration);
        }
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isWorkHours, activeEvent, isPaused]);

  useEffect(() => {
    if (eventTimeLeft > 0 && !isPaused) {
      const timer = setInterval(() => {
        if (isPausedRef.current) return;
        setEventTimeLeft(p => p - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (activeEvent && !isPaused) setActiveEvent(null);
  }, [eventTimeLeft, activeEvent, isPaused]);

  const statsRef = useRef(stats);
  const moneyRef = useRef(money);
  const upgradesRef = useRef(upgrades);
  const staffRef = useRef(staff);
  const autoOrderEnabledRef = useRef(autoOrderEnabled);
  const autoAmountEnabledRef = useRef(autoAmountEnabled);
  const cheatsEnabledRef = useRef(cheatsEnabled);
  const isWorkHoursRef = useRef(isWorkHours);
  const equippedCardsRef = useRef(equippedCards);
  const luckyCatBuffRef = useRef(luckyCatBuff);

  const isResettingRef = useRef(false);

  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { moneyRef.current = money; }, [money]);
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);
  useEffect(() => { staffRef.current = staff; }, [staff]);
  useEffect(() => { autoOrderEnabledRef.current = autoOrderEnabled; }, [autoOrderEnabled]);
  useEffect(() => { autoAmountEnabledRef.current = autoAmountEnabled; }, [autoAmountEnabled]);
  useEffect(() => { cheatsEnabledRef.current = cheatsEnabled; }, [cheatsEnabled]);
  useEffect(() => { isWorkHoursRef.current = isWorkHours; }, [isWorkHours]);
  useEffect(() => { equippedCardsRef.current = equippedCards; }, [equippedCards]);
  useEffect(() => { luckyCatBuffRef.current = luckyCatBuff; }, [luckyCatBuff]);

  // Stable checkout and generateOrder for interval usage
  const checkoutRef = useRef(checkout);
  const generateOrderRef = useRef(generateOrder);
  useEffect(() => { checkoutRef.current = checkout; }, [checkout]);
  useEffect(() => { generateOrderRef.current = generateOrder; }, [generateOrder]);

  // Staff Automation & Spawning
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPausedRef.current) return;
      const cleaner = staffRef.current.find(s => s.id === 'cleaner');
      const cashier = staffRef.current.find(s => s.id === 'cashier');
      const cleanerSpeedSkill = cleaner?.skills['cl_speed_1'] || 0;
      const marketingLevel = upgradesRef.current.find(u => u.id === 'marketing')?.level || 0;

      const getCardStatsFromRef = (slot: string) => {
        const cardId = equippedCardsRef.current[slot];
        if (!cardId) return null;
        return GACHA_CARDS.find(c => c.id === cardId) || null;
      };

      const activeCat = luckyCatBuffRef.current;
      const isCatSpeedActive = activeCat && activeCat.type === 'speed' && activeCat.expiresAt > Date.now();
      const catSpeedBonus = isCatSpeedActive ? activeCat.value : 0;

      // Card Speed/Spawn modifiers gathered safely
      const dishwasherCard = getCardStatsFromRef('dishwasher');
      const cleanerCardSpeed = dishwasherCard?.stats.extraSpeed || 0;

      const cashierCard = getCardStatsFromRef('register');

      // 1. Cleaning logic
      setCleaningTables(p => {
        let changed = false;
        const currentRestaurantLevel = Math.floor(statsRef.current.totalEarned / 500) + 1;
        const cleanerVirtualLevel = (cleaner?.level || 0);

        const next = p.map(s => {
          if (s === null) return null;
          const levelPerkMod = currentRestaurantLevel >= 10 ? 0.75 : 1.0;
          const duration = Math.max(0.2, (5 - cleanerVirtualLevel * 0.8 - cleanerSpeedSkill * 0.8 - (cleanerCardSpeed + catSpeedBonus) * 5) * levelPerkMod);
          if ((Date.now() - s) / 1000 >= duration) { changed = true; return null; }
          return s;
        });
        return changed ? next : p;
      });

      // 2. Auto-Checkout (Cashier) logic
      const cashierVirtualLevel = (cashier?.level || 0);
      const cashierVirtualEffectiveLevel = cashierVirtualLevel + (cashierCard ? 1 : 0); // extra automatic bump if has register card

      const cashierLevel = cheatsEnabledRef.current ? Math.max(2, cashierVirtualEffectiveLevel) : cashierVirtualEffectiveLevel;
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
      const waiterVirtualLevel = (waiter?.level || 0);

      // Card spawn modifiers: Peak Hours skill + Sign decor
      const peakHourCard = getCardStatsFromRef('peak_hour');
      const signCard = getCardStatsFromRef('sign');
      const cardSpawnRateBonus = (peakHourCard?.stats.spawnRateBonus || 0) + (signCard?.stats.spawnRateBonus || 0);

      const uniformCard = getCardStatsFromRef('uniform');
      const prepCard = getCardStatsFromRef('prep');
      const cardWaiterSpeedBonus = (uniformCard?.stats.extraSpeed || 0) + (prepCard?.stats.extraSpeed || 0);

      if (isWorkHoursRef.current && (marketingLevel > 0 || waiterVirtualLevel > 0)) {
         const spawnInterval = Math.max(2, 25 - (marketingLevel * 6) - (waiterVirtualLevel * 4) - (waiterSpeedSkill * 3) - (cardSpawnRateBonus * 10) - ((cardWaiterSpeedBonus + catSpeedBonus) * 10));
         if (Math.random() < (1 / spawnInterval)) {
            const count = 1 + Math.floor(waiterVirtualLevel / 4);
            for (let i = 0; i < count; i++) {
               generateOrderRef.current();
            }
         }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Run once, values accessed via refs

  const [recentReviews, setRecentReviews] = useState<any[]>(() => {
    const saved = localStorage.getItem('rt_recent_reviews');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState('game');

  const drawCard = useCallback((isCheat: boolean = false, poolType?: 'equipment' | 'skills' | 'decor'): GachaCard | null => {
    const isActuallyCheat = isCheat || cheatsEnabled;
    // Check cost
    if (!isActuallyCheat && gems < 1000) {
      setFeedback({ type: 'error', text: '寶石不足，無法進行抽卡！需要 1000 寶石' });
      setTimeout(() => setFeedback(null), 2000);
      return null;
    }

    const availablePool = poolType ? GACHA_CARDS.filter(c => c.professionId === poolType) : GACHA_CARDS;

    // Spend gems
    if (!isActuallyCheat) {
      setGems(prev => prev - 1000);
    }

    // Roll rarity: SSR (10%), SR (20%), S (25%), R (45%)
    const roll = Math.random();
    let targetRarity: 'R' | 'S' | 'SR' | 'SSR' = 'R';
    if (roll < 0.10) {
      targetRarity = 'SSR';
    } else if (roll < 0.30) {
      targetRarity = 'SR';
    } else if (roll < 0.55) {
      targetRarity = 'S';
    }

    // Get cards matching targetRarity
    let matchPool = availablePool.filter(c => c.rarity === targetRarity);
    if (matchPool.length === 0) {
      matchPool = availablePool; // Fallback
    }

    const drawn = matchPool[Math.floor(Math.random() * matchPool.length)];

    setOwnedCardIds(prev => [...prev, drawn.id]);
    setDailyQuests(prevQuests => prevQuests.map(q => {
      if (q.id === 'q_gacha') {
        const current = Math.min(q.target, q.current + 1);
        return { ...q, current, completed: current >= q.target };
      }
      return q;
    }));

    setFeedback({ type: 'success', text: `恭喜抽出：【${drawn.rarity}】${drawn.name}！` });
    setTimeout(() => setFeedback(null), 2500);
    confetti({ particleCount: 35, spread: 60 });
    return drawn;
  }, [gems]);

  const drawTenCards = useCallback((isCheat: boolean = false, poolType?: 'equipment' | 'skills' | 'decor'): GachaCard[] => {
    const isActuallyCheat = isCheat || cheatsEnabled;
    const costTen = 9000; // 10 pulls with 10% discount
    if (!isActuallyCheat && gems < costTen) {
      setFeedback({ type: 'error', text: '寶石不足，無法進行十連抽！需要 9000 寶石' });
      setTimeout(() => setFeedback(null), 2000);
      return [];
    }

    const availablePool = poolType ? GACHA_CARDS.filter(c => c.professionId === poolType) : GACHA_CARDS;

    if (!isActuallyCheat) {
      setGems(prev => prev - costTen);
    }

    const results: GachaCard[] = [];
    for (let i = 0; i < 10; i++) {
      const roll = Math.random();
      let targetRarity: 'R' | 'S' | 'SR' | 'SSR' = 'R';
      if (roll < 0.10) {
        targetRarity = 'SSR';
      } else if (roll < 0.30) {
        targetRarity = 'SR';
      } else if (roll < 0.55) {
        targetRarity = 'S';
      }

      let matchPool = availablePool.filter(c => c.rarity === targetRarity);
      if (matchPool.length === 0) {
        matchPool = availablePool;
      }
      const drawn = matchPool[Math.floor(Math.random() * matchPool.length)];
      results.push(drawn);
    }

    setOwnedCardIds(prev => [...prev, ...results.map(r => r.id)]);
    setDailyQuests(prevQuests => prevQuests.map(q => {
      if (q.id === 'q_gacha') {
        const current = Math.min(q.target, q.current + 10);
        return { ...q, current, completed: current >= q.target };
      }
      return q;
    }));

    setFeedback({ type: 'success', text: `恭喜獲得 10 樣極品寶物！已存入背包` });
    setTimeout(() => setFeedback(null), 2500);
    confetti({ particleCount: 80, spread: 100 });
    return results;
  }, [gems]);

  const equipCard = useCallback((staffId: string, cardId: string | null) => {
    setEquippedCards(prev => ({
      ...prev,
      [staffId]: cardId
    }));
    setFeedback({ type: 'success', text: cardId ? '任命主管成功！職業稱號已生效' : '已卸下該職位主管' });
    setTimeout(() => setFeedback(null), 2000);
  }, []);

  const petLuckyCat = useCallback(() => {
    const now = Date.now();
    const cooldownMs = 60 * 1000;
    const isCheatEnabled = cheatsEnabledRef.current;
    
    if (!isCheatEnabled && now - luckyCatLastPet < cooldownMs) {
      const remainingSecs = Math.ceil((cooldownMs - (now - luckyCatLastPet)) / 1000);
      setFeedback({ 
        type: 'error', 
        text: `招財貓正在閉眼打盹呢！請等 ${remainingSecs} 秒後再來摸牠吧。(每60秒可觸摸一次)` 
      });
      setTimeout(() => setFeedback(null), 3000);
      return false;
    }

    const roll = Math.random();
    if (roll < 0.20) {
      const cashGain = Math.floor(Math.random() * 601) + 400; // $400 - $1000
      setMoney(prev => prev + cashGain);
      setLuckyCatLastPet(now);
      localStorage.setItem('rt_cat_last_pet', now.toString());
      
      const windfallBuff = {
        id: 'cat_windfall',
        name: '【意外金福】',
        description: `恭喜獲得現場驚喜紅包 $${cashGain}！`,
        type: 'price' as const,
        value: 0,
        expiresAt: now + 5000
      };
      setLuckyCatBuff(windfallBuff);
      localStorage.setItem('rt_cat_buff', JSON.stringify(windfallBuff));
      
      setFeedback({ type: 'success', text: `🐱 喵！招財貓舒服地蹭了蹭你，饋贈紅包 $${cashGain}！` });
      setTimeout(() => setFeedback(null), 3500);
      confetti({ particleCount: 50, spread: 80 });
      return true;
    } else {
      const buffsList = [
        { id: 'cat_gold', name: '【金運招福】', description: '所有餐點售價加成提升 25%', type: 'price' as const, value: 0.25 },
        { id: 'cat_patience', name: '【客似雲來】', description: '顧客等待耐心額外增加 35%', type: 'patience' as const, value: 0.35 },
        { id: 'cat_speed', name: '【步步高升】', description: '全體員工移動與清掃速度加成 +25%', type: 'speed' as const, value: 0.25 },
        { id: 'cat_fortune', name: '【喜事連連】', description: '結帳小費獲得機率提升 30%', type: 'tip_chance' as const, value: 0.30 },
      ];
      const selected = buffsList[Math.floor(Math.random() * buffsList.length)];
      const expiresAt = now + 10 * 60 * 1000; // 10 minutes
      
      const catActiveBuff = {
        ...selected,
        expiresAt
      };
      
      setLuckyCatLastPet(now);
      setLuckyCatBuff(catActiveBuff);
      localStorage.setItem('rt_cat_last_pet', now.toString());
      localStorage.setItem('rt_cat_buff', JSON.stringify(catActiveBuff));
      
      setFeedback({ type: 'success', text: `🐱 喵～招財貓賜予星砂祝福！${selected.name} 生效中！` });
      setTimeout(() => setFeedback(null), 3500);
      confetti({ particleCount: 35, spread: 70 });
      return true;
    }
  }, [luckyCatLastPet]);

  const resetGame = useCallback(() => {
    isResettingRef.current = true;
    localStorage.clear();
    window.location.href = '/';
  }, []);

  return (
    <GameContext.Provider value={{
      money, setMoney, gems, setGems, upgrades, staff, stats, dailyStats, menuState, itemRatings, dailySpecials,
      tables, cleaningTables, selectedTableIndex, setSelectedTableIndex,
      registerItems, setRegisterItems, posInput, setPosInput, activeEvent, eventTimeLeft,
      feedback, setFeedback, restaurantLevel, isWorkHours, isDayComplete,
      autoOrderEnabled, setAutoOrderEnabled, autoAmountEnabled, setAutoAmountEnabled,
      cheatsEnabled, setCheatsEnabled,
      volumes, setVolumes, difficulty, setDifficulty, toggleDailySpecial,
      prePrepItems, togglePrePrep,
      activeTab, setActiveTab,
      generateOrder, checkout, buyUpgrade, trainStaff, allocateSkillPoints, startNextDay, addToRegister, clearRegister,
      getItemPriceForOrder, resetGame, hurryTable,
      ownedCardIds, equippedCards, gachaCost, drawCard, drawTenCards, equipCard,
      luckyCatLastPet, luckyCatBuff, petLuckyCat,
      isPaused, setIsPaused, togglePause, dailyQuests, claimDailyQuestReward,

      // New properties
      ratings, cardBenefits, gameStarted, startGame, recentReviews
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
