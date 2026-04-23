/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Utensils, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ChefHat, 
  Store, 
  Zap,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowUpCircle,
  Star,
  TrendingDown,
  Coffee,
  Pizza,
  IceCream,
  Fish,
  Lock,
  Briefcase,
  GraduationCap,
  Award,
  Smile,
  Heart,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Camera,
  CreditCard,
  Search,
  Soup,
  Cake,
  Beef,
  Trophy,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Tablet,
  Play,
  LogOut,
  Settings,
  Music,
  Volume2,
  Mic2,
  Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import CareerMode from './components/CareerMode';

// --- Types ---

interface FoodItem {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  color: string;
  category: 'main' | 'drink';
  requiredUpgradeId?: string; // If set, this item is locked until upgrade
}

interface Order {
  id: string;
  items: string[]; // IDs of FoodItems
  total: number;
  startTime: number;
  waitTime: number; // in seconds
  customerType: string;
  groupSize: number;
  rating?: number; // 1-5 stars
  isVip: boolean;
  unitPrices?: Record<string, number>;
}

interface MenuState {
  [itemId: string]: {
    priceMod: number;
    outOfStock: boolean;
  };
}

interface ItemRating {
  totalStars: number;
  count: number;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  level: number;
  maxLevel?: number; // Maximum level allowed
  icon: React.ReactNode;
}

interface Staff {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  level: number;
  icon: React.ReactNode;
}

interface GameEvent {
  id: string;
  name: string;
  description: string;
  color: string;
  effects: {
    spawnRateMod?: number;
    patienceMod?: number;
    qualityMod?: number;
    priceMod?: number;
    tipMod?: number;
    forceType?: string;
  };
  duration: number; // in seconds
  icon: React.ReactNode;
}

// --- Constants ---

const FOOD_ITEMS: FoodItem[] = [
  { id: 'burger', name: '漢堡', price: 12, icon: <Utensils className="w-10 h-10" />, color: 'bg-orange-500', category: 'main' },
  { id: 'fries', name: '薯條', price: 6, icon: <ShoppingBag className="w-10 h-10" />, color: 'bg-yellow-400', category: 'main' },
  { id: 'pizza', name: '披薩', price: 18, icon: <Pizza className="w-10 h-10" />, color: 'bg-amber-500', category: 'main', requiredUpgradeId: 'menu_pizza' },
  { id: 'sushi', name: '壽司', price: 25, icon: <Fish className="w-10 h-10" />, color: 'bg-rose-400', category: 'main', requiredUpgradeId: 'menu_sushi' },
  { id: 'ramen', name: '拉麵', price: 20, icon: <Soup className="w-10 h-10" />, color: 'bg-indigo-500', category: 'main', requiredUpgradeId: 'menu_ramen' },
  { id: 'steak', name: '牛排', price: 35, icon: <Beef className="w-10 h-10" />, color: 'bg-red-800', category: 'main', requiredUpgradeId: 'menu_steak' },
  { id: 'cake', name: '蛋糕', price: 15, icon: <Cake className="w-10 h-10" />, color: 'bg-purple-400', category: 'main', requiredUpgradeId: 'menu_cake' },
  { id: 'icecream', name: '冰淇淋', price: 8, icon: <IceCream className="w-10 h-10" />, color: 'bg-pink-300', category: 'main', requiredUpgradeId: 'menu_icecream' },
  
  // Drinks
  { id: 'cola', name: '可樂', price: 4, icon: <Coffee className="w-10 h-10" />, color: 'bg-red-600', category: 'drink' },
  { id: 'tea', name: '綠茶', price: 3, icon: <Coffee className="w-10 h-10 text-green-200" />, color: 'bg-emerald-600', category: 'drink', requiredUpgradeId: 'menu_tea' },
  { id: 'juice', name: '果汁', price: 5, icon: <Coffee className="w-10 h-10 text-orange-200" />, color: 'bg-orange-400', category: 'drink', requiredUpgradeId: 'menu_juice' },
  { id: 'milktea', name: '珍奶', price: 7, icon: <Coffee className="w-10 h-10 text-amber-100" />, color: 'bg-amber-700', category: 'drink', requiredUpgradeId: 'menu_milktea' },
];

const INITIAL_UPGRADES: Upgrade[] = [
  { id: 'premium', name: '提高餐點價格', description: '就是字面上的意思', baseCost: 300, level: 0, icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'menu_pizza', name: '解鎖：披薩', description: '菜單中加入披薩', baseCost: 200, level: 0, maxLevel: 1, icon: <Pizza className="w-5 h-5" /> },
  { id: 'menu_sushi', name: '解鎖：壽司', description: '菜單中加入壽司', baseCost: 400, level: 0, maxLevel: 1, icon: <Fish className="w-5 h-5" /> },
  { id: 'menu_icecream', name: '解鎖：冰淇淋', description: '菜單中加入冰淇淋', baseCost: 150, level: 0, maxLevel: 1, icon: <IceCream className="w-5 h-5" /> },
  { id: 'menu_ramen', name: '解鎖：拉麵', description: '菜單中加入拉麵', baseCost: 350, level: 0, maxLevel: 1, icon: <Soup className="w-5 h-5" /> },
  { id: 'menu_steak', name: '解鎖：牛排', description: '菜單中加入牛排', baseCost: 600, level: 0, maxLevel: 1, icon: <Beef className="w-5 h-5" /> },
  {id: 'menu_cake', name: '解鎖：蛋糕', description: '菜單中加入蛋糕', baseCost: 250, level: 0, maxLevel: 1, icon: <Cake className="w-5 h-5" /> },
  {id: 'menu_tea', name: '解鎖：綠茶', description: '飲品中加入綠茶', baseCost: 100, level: 0, maxLevel: 1, icon: <Coffee className="w-5 h-5 text-green-400" /> },
  {id: 'menu_juice', name: '解鎖：果汁', description: '飲品中加入果汁', baseCost: 180, level: 0, maxLevel: 1, icon: <Coffee className="w-5 h-5 text-orange-400" /> },
  {id: 'menu_milktea', name: '解鎖：珍奶', description: '飲品中加入珍奶', baseCost: 300, level: 0, maxLevel: 1, icon: <Coffee className="w-5 h-5 text-amber-600" /> },
  {id: 'decor', name: '店內裝修與裝潢', description: '提升餐廳吸引力，增加客人流量、滿意度與 VIP 比例。', baseCost: 150, level: 0, icon: <Store className="w-5 h-5" /> },
  { id: 'marketing', name: '增加餐廳曝光率', description: '客人出現的頻率提升。', baseCost: 200, level: 0, icon: <TrendingUp className="w-5 h-5" /> },
];

const INITIAL_STAFF: Staff[] = [
  { 
    id: 'waiter', 
    name: '服務生', 
    description: '負責帶位。等級越高收的小費越多。', 
    baseCost: 50, 
    level: 0, 
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'cashier',
    name: '收銀員',
    description: '等級 1 自動點單，等級 2 以上自動結帳。',
    baseCost: 200,
    level: 0,
    icon: <CreditCard className="w-5 h-5" />,
  },
  { 
    id: 'chef', 
    name: '廚師', 
    description: '提升餐點售價。高等級可觸發手藝加成。', 
    baseCost: 120, 
    level: 0, 
    icon: <ChefHat className="w-5 h-5" />,
  },
  { 
    id: 'host', 
    name: '接待員', 
    description: '提升客人耐心。', 
    baseCost: 150, 
    level: 0, 
    icon: <Store className="w-5 h-5" />,
  },
  {
    id: 'cleaner',
    name: '清潔工',
    description: '自動清理客人的桌子。等級越高清理速度越快。',
    baseCost: 80,
    level: 0,
    icon: <Trash2 className="w-5 h-5" />,
  },
];

const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'rush_hour',
    name: '用餐尖峰！',
    description: '一大群顧客正在湧入！客流量大幅增加。',
    color: 'bg-orange-600',
    effects: { spawnRateMod: 0.3 },
    duration: 60,
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'happy_hour',
    name: '歡樂時光 🍻',
    description: '飲料酒精類熱賣中！顧客耐心提升且小費增加。',
    color: 'bg-amber-500',
    effects: { patienceMod: 1.5, tipMod: 1.5, spawnRateMod: 0.8 },
    duration: 45,
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'kitchen_fire',
    name: '廚房意外 🔥',
    description: '廚房設備運作不順，出餐速度變慢，顧客耐心下降。',
    color: 'bg-red-600',
    effects: { patienceMod: 0.5, qualityMod: -1.5 },
    duration: 45,
    icon: <Flame className="w-5 h-5" />
  },
  {
    id: 'health_inspect',
    name: '衛生稽查 🚔',
    description: '稽查員在現場！餐點價格受限，但品質要求變高。',
    color: 'bg-blue-600',
    effects: { qualityMod: 1.0, priceMod: 0.8, tipMod: 0.5 },
    duration: 40,
    icon: <ShieldCheck className="w-5 h-5" />
  },
  {
    id: 'celebrity',
    name: '名人光臨 ✨',
    description: '一位名人正在附近！這吸引了更多的 VIP 顧客與大筆小費。',
    color: 'bg-purple-600',
    effects: { spawnRateMod: 0.7, forceType: 'vip', tipMod: 2.0 },
    duration: 50,
    icon: <Camera className="w-5 h-5" />
  },
  {
    id: 'food_festival',
    name: '美食嘉年華 🎪',
    description: '全城美食舉辦美食嘉年華！客流量變大',
    color: 'bg-pink-600',
    effects: { spawnRateMod: 0.2, priceMod: 1.3, patienceMod: 0.7 },
    duration: 60,
    icon: <Trophy className="w-5 h-5" />
  },
  {
    id: 'influencer',
    name: '美食網紅打卡 📸',
    description: '評論影響力翻倍',
    color: 'bg-indigo-600',
    effects: { tipMod: 1.8, qualityMod: 0.5 },
    duration: 45,
    icon: <Smile className="w-5 h-5" />
  },
  {
    id: 'power_outage',
    name: '斷電 🌑',
    description: '餐廳陷入黑暗。顧客非常焦慮且不滿',
    color: 'bg-slate-800',
    effects: { patienceMod: 0.3, qualityMod: -2.0, spawnRateMod: 2.0 },
    duration: 30,
    icon: <Zap className="w-5 h-5" />
  }
];

const CUSTOMER_TYPES = [
  { id: 'single', name: '單人顧客', icon: <Users className="w-5 h-5" />, minSize: 1, maxSize: 1 },
  { id: 'couple', name: '雙人顧客', icon: <Users className="w-5 h-5" />, minSize: 2, maxSize: 2 },
  { id: 'group', name: '三人顧客', icon: <Users className="w-5 h-5" />, minSize: 3, maxSize: 3 },
  { id: 'family', name: '家庭/四人顧客', icon: <Users className="w-5 h-5" />, minSize: 4, maxSize: 6 },
  { id: 'student', name: '學生', icon: <GraduationCap className="w-5 h-5" />, minSize: 1, maxSize: 2 },
  { id: 'executive', name: '上班族', icon: <Briefcase className="w-5 h-5" />, minSize: 1, maxSize: 1 },
  { id: 'critic', name: '美食評論家', icon: <Award className="w-5 h-5" />, minSize: 1, maxSize: 1 },
  { id: 'vip', name: 'VIP顧客', icon: <Zap className="w-5 h-5" />, minSize: 1, maxSize: 1, isVip: true },
];

const LEVEL_PERKS = [
  { level: 5, name: '熟練經營', description: '營收加成 +10%', icon: <TrendingUp className="w-4 h-4" /> },
  { level: 10, name: '極速清潔', description: '翻桌清潔速度提升 25%', icon: <Sparkles className="w-4 h-4" /> },
  { level: 15, name: '顧客磁鐵', description: 'VIP 顧客出現機率提升 50%', icon: <Zap className="w-4 h-4" /> },
  { level: 20, name: '黃金耐心', description: '顧客等待耐心額外增加 20%', icon: <Heart className="w-4 h-4" /> },
  { level: 25, name: '品牌溢價', description: '所有餐點基礎售價提升 15%', icon: <DollarSign className="w-4 h-4" /> },
  { level: 30, name: '知名度巔峰', description: '活動觸發頻率提升 30%', icon: <Trophy className="w-4 h-4" /> },
];

export default function App() {
  // --- State ---
  const [money, setMoney] = useState<number>(() => {
    const saved = localStorage.getItem('rt_money');
    return saved ? parseFloat(saved) : 100;
  });

  const [gameState, setGameState] = useState<'start' | 'mode_select' | 'playing_free' | 'playing_career'>('start');
  const [careerRole, setCareerRole] = useState<'chef' | 'cashier' | 'cleaner' | null>(null);
  const [activeTab, setActiveTab] = useState<'game' | 'shop' | 'staff' | 'research' | 'settings'>('game');
  
  const [volumes, setVolumes] = useState(() => {
    const saved = localStorage.getItem('rt_volumes');
    return saved ? JSON.parse(saved) : { master: 80, bgm: 60, sfx: 100 };
  });

  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const savedV3 = localStorage.getItem('rt_upgrades_v3');
    const savedV2 = localStorage.getItem('rt_upgrades_v2');
    
    if (savedV3) {
      const levels = JSON.parse(savedV3);
      return INITIAL_UPGRADES.map(u => ({
        ...u,
        level: levels[u.id] || 0
      }));
    } else if (savedV2) {
      // Migration from v2 to v3
      const levels = JSON.parse(savedV2);
      return INITIAL_UPGRADES.map(u => ({
        ...u,
        level: levels[u.id] || 0
      }));
    }
    return INITIAL_UPGRADES;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('rt_staff_v2');
    if (saved) {
      const data = JSON.parse(saved);
      return INITIAL_STAFF.map(s => {
        const savedStaff = data.find((sd: any) => sd.id === s.id);
        if (!savedStaff) return s;
        return {
          ...s,
          level: savedStaff.level || 0
        };
      });
    }
    return INITIAL_STAFF;
  });

  const [tables, setTables] = useState<(Order | null)[]>(new Array(6).fill(null));
  const [selectedTableIndex, setSelectedTableIndex] = useState<number | null>(null);
  const currentOrder = selectedTableIndex !== null ? tables[selectedTableIndex] : null;

  const [nextOrderPreview, setNextOrderPreview] = useState<string[] | null>(null);
  const [registerItems, setRegisterItems] = useState<string[]>([]);
  const [posInput, setPosInput] = useState<string>(''); 
  const [autoOrderEnabled, setAutoOrderEnabled] = useState(false);
  const [autoAmountEnabled, setAutoAmountEnabled] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('rt_stats');
    return saved ? JSON.parse(saved) : { totalEarned: 0, customersServed: 0, day: 1, currentTime: 540 };
  });

  const [dailyStats, setDailyStats] = useState(() => {
    const saved = localStorage.getItem('rt_daily_stats');
    return saved ? JSON.parse(saved) : { customers: 0, earnings: 0, items: {}, vipsServed: 0, bonusMultiplier: 0 };
  });

  const [menuState, setMenuState] = useState<MenuState>(() => {
    const saved = localStorage.getItem('rt_menu_state');
    if (saved) return JSON.parse(saved);
    const initial: MenuState = {};
    FOOD_ITEMS.forEach(item => {
      initial[item.id] = { priceMod: 1, outOfStock: false };
    });
    return initial;
  });

  const [itemRatings, setItemRatings] = useState<Record<string, ItemRating>>(() => {
    const saved = localStorage.getItem('rt_item_ratings');
    if (saved) return JSON.parse(saved);
    const initial: Record<string, ItemRating> = {};
    FOOD_ITEMS.forEach(item => {
      initial[item.id] = { totalStars: 0, count: 0 };
    });
    return initial;
  });

  const [dailySpecials, setDailySpecials] = useState<string[]>(() => {
    const saved = localStorage.getItem('rt_daily_specials');
    return saved ? JSON.parse(saved) : [];
  });

  const [cleaningTables, setCleaningTables] = useState<(number | null)[]>(new Array(6).fill(null));

  const [recentReviews, setRecentReviews] = useState<{rating: number, comment: string, customerType: string}[]>(() => {
    const saved = localStorage.getItem('rt_recent_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [eventTimeLeft, setEventTimeLeft] = useState<number>(0);

  const restaurantLevel = Math.floor(stats.totalEarned / 500) + 1;
  const isWorkHours = stats.currentTime < 1080; // 18:00 = 1080 mins
  const isDayComplete = stats.currentTime >= 1080 && tables.every(t => t === null) && cleaningTables.every(c => c === null);

  // --- Refs ---
  const orderTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tablesRef = useRef<(Order | null)[]>([]);
  
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('rt_money', money.toString());
    
    // Only save levels to avoid serializing React elements
    const upgradeLevels: Record<string, number> = {};
    upgrades.forEach(u => upgradeLevels[u.id] = u.level);
    localStorage.setItem('rt_upgrades_v3', JSON.stringify(upgradeLevels));

    localStorage.setItem('rt_stats', JSON.stringify(stats));
    localStorage.setItem('rt_daily_stats', JSON.stringify(dailyStats));
    localStorage.setItem('rt_menu_state', JSON.stringify(menuState));
    localStorage.setItem('rt_item_ratings', JSON.stringify(itemRatings));
    localStorage.setItem('rt_daily_specials', JSON.stringify(dailySpecials));
    localStorage.setItem('rt_recent_reviews', JSON.stringify(recentReviews));
    localStorage.setItem('rt_auto_order', JSON.stringify(autoOrderEnabled));
    localStorage.setItem('rt_auto_amount', JSON.stringify(autoAmountEnabled));
    localStorage.setItem('rt_volumes', JSON.stringify(volumes));

    const staffData = staff.map(s => ({
      id: s.id,
      level: s.level
    }));
    localStorage.setItem('rt_staff_v2', JSON.stringify(staffData));
  }, [money, upgrades, staff, stats, dailyStats, menuState, itemRatings, dailySpecials, recentReviews, autoOrderEnabled, autoAmountEnabled, volumes]);

  useEffect(() => {
    const savedAutoOrder = localStorage.getItem('rt_auto_order');
    const savedAutoAmount = localStorage.getItem('rt_auto_amount');
    if (savedAutoOrder) setAutoOrderEnabled(JSON.parse(savedAutoOrder));
    if (savedAutoAmount) setAutoAmountEnabled(JSON.parse(savedAutoAmount));
  }, []);

  // Auto-automation effects
  useEffect(() => {
    if (selectedTableIndex !== null && tables[selectedTableIndex]) {
      const order = tables[selectedTableIndex]!;
      const cashier = staff.find(s => s.id === 'cashier');
      
      // Auto-order logic (Level 1+)
      if (autoOrderEnabled && cashier && cashier.level >= 1) {
        setRegisterItems([...order.items]);
      } else {
        setRegisterItems([]);
      }
    } else {
      setRegisterItems([]);
      setPosInput('');
    }
  }, [selectedTableIndex, autoOrderEnabled]); // REMOVED 'staff' from deps and removed 'setPosInput('')' here

  useEffect(() => {
    if (autoAmountEnabled && currentOrder && registerItems.length > 0) {
      // If the register items match the current order items perfectly, use the pre-calculated total
      const orderCounts: Record<string, number> = {};
      currentOrder.items.forEach(id => orderCounts[id] = (orderCounts[id] || 0) + 1);
      const registerCounts: Record<string, number> = {};
      registerItems.forEach(id => registerCounts[id] = (registerCounts[id] || 0) + 1);
      
      const allIds = new Set([...Object.keys(orderCounts), ...Object.keys(registerCounts)]);
      let isPerfectMatch = true;
      allIds.forEach(id => { if (orderCounts[id] !== registerCounts[id]) isPerfectMatch = false; });

      if (isPerfectMatch) {
         setPosInput(currentOrder.total.toFixed(2));
      } else {
         // Otherwise, calculate based on whatever is in the register using current table context
         const subtotal = registerItems.reduce((acc, id) => acc + getItemPriceForOrder(id, currentOrder), 0);
         setPosInput(subtotal.toFixed(2));
      }
    }
  }, [registerItems, autoAmountEnabled, currentOrder, menuState, itemRatings, dailySpecials, staff]);

  // --- Game Logic ---

  const generateOrder = useCallback(() => {
    const decorLevel = upgrades.find(u => u.id === 'decor')?.level || 0;
    const chefLevel = staff.find(s => s.id === 'chef')?.level || 0;
    const premiumLevel = upgrades.find(u => u.id === 'premium')?.level || 0;
    const host = staff.find(s => s.id === 'host');
    const hostLevel = host?.level || 0;

    // 10% base chance + 5% per decor level + 3% per host level for VIP
    // Level 4 Host: +15% chance
    const vipChanceBonus = hostLevel >= 4 ? 0.15 : 0;
    // Event: forceType vip (名人光臨)
    const forceVip = activeEvent?.effects.forceType === 'vip';
    // Level 15 Perk: Customer Magnet (+50% VIP spawn rate)
    const levelVipMod = restaurantLevel >= 15 ? 1.5 : 1;
    const isVipSpawn = forceVip || Math.random() < ((0.05 + decorLevel * 0.05 + hostLevel * 0.03 + vipChanceBonus) * levelVipMod);
    const possibleTypes = isVipSpawn 
      ? CUSTOMER_TYPES.filter(t => (t as any).isVip) 
      : CUSTOMER_TYPES.filter(t => !(t as any).isVip);
    
    const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
    const isVip = (type as any).isVip || false;

    // Get available food items based on upgrades AND current stock
    const availableFood = FOOD_ITEMS.filter(item => {
      // Check stock
      if (menuState[item.id]?.outOfStock) return false;
      
      if (!item.requiredUpgradeId) return true;
      const upgrade = upgrades.find(u => u.id === item.requiredUpgradeId);
      return upgrade && upgrade.level > 0;
    });

    if (availableFood.length === 0) return; 

    const mainPool = availableFood.filter(f => f.category === 'main');
    const drinkPool = availableFood.filter(f => f.category === 'drink');

    // Handle high-value target selection for VIPs
    let selectionPool = [...availableFood];
    if (isVip) {
      const expensiveItems = availableFood.filter(f => f.price > 10);
      if (expensiveItems.length > 0) selectionPool = expensiveItems;
    } else {
      const weightedPool: FoodItem[] = [];
      availableFood.forEach(item => {
        const rating = itemRatings[item.id];
        const avg = rating.count > 0 ? rating.totalStars / rating.count : 4; 
        const isSpecial = dailySpecials.includes(item.id);
        const specialWeight = isSpecial ? 3 : 1;
        const weight = Math.ceil(Math.pow(avg, 1.5)) * specialWeight;
        for (let i = 0; i < weight; i++) weightedPool.push(item);
      });
      if (weightedPool.length > 0) selectionPool = weightedPool;
    }

    // Handle specialized pools and counts based on customer type
    let finalItems: string[] = [];
    // Level 7 Host: +20 baseline patience
    const lobbyBonus = hostLevel >= 7 ? 20 : 0;
    // Event: patienceMod (廚房小意外)
    const eventPatienceMod = activeEvent?.effects.patienceMod || 1;
    
    // Level 20 Perk: Golden Patience (+20% patience)
    const levelPatienceMod = restaurantLevel >= 20 ? 1.2 : 1;
    
    let waitTime = (30 + decorLevel * 8 + lobbyBonus) * eventPatienceMod * levelPatienceMod; 

    if (type.id === 'student') {
      const cheapPool = mainPool.filter(f => f.price < 10);
      const pool = cheapPool.length > 0 ? cheapPool : mainPool;
      const itemCount = Math.floor(Math.random() * 2) + 1; 
      for (let i = 0; i < itemCount; i++) {
        finalItems.push(pool[Math.floor(Math.random() * pool.length)].id);
      }
      // Chance for a drink
      if (drinkPool.length > 0 && Math.random() < 0.6) {
        finalItems.push(drinkPool[Math.floor(Math.random() * drinkPool.length)].id);
      }
      waitTime = 20; 
    } else if (type.id === 'executive') {
      const expensivePool = mainPool.filter(f => f.price > 15);
      const pool = expensivePool.length > 0 ? expensivePool : mainPool;
      const itemCount = Math.floor(Math.random() * 2) + 2; 
      for (let i = 0; i < itemCount; i++) {
        finalItems.push(pool[Math.floor(Math.random() * pool.length)].id);
      }
      // Executive always gets a drink
      if (drinkPool.length > 0) {
        finalItems.push(drinkPool[Math.floor(Math.random() * drinkPool.length)].id);
      }
      waitTime = 60; 
    } else if (type.id === 'critic') {
      const itemCount = Math.floor(Math.random() * 3) + 3;
      const criticPool = [...availableFood];
      for (let i = 0; i < itemCount; i++) {
        if (criticPool.length === 0) break;
        const idx = Math.floor(Math.random() * criticPool.length);
        finalItems.push(criticPool[idx].id);
        criticPool.splice(idx, 1); 
      }
      waitTime = 45;
    } else if (nextOrderPreview && !isVip) {
      finalItems = [...nextOrderPreview];
    } else {
      const gSize = Math.floor(Math.random() * (type.maxSize - type.minSize + 1)) + type.minSize;
      const minItems = gSize;
      const maxItems = Math.min(10, gSize * 2 + Math.floor(decorLevel / 2) + (isVip ? 3 : 0));
      const itemCount = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
      for (let i = 0; i < itemCount; i++) {
        finalItems.push(selectionPool[Math.floor(Math.random() * selectionPool.length)].id);
      }
      // General group drink chance
      if (drinkPool.length > 0 && Math.random() < 0.5) {
        const dCount = Math.floor(Math.random() * gSize) + 1;
        for (let j = 0; j < dCount; j++) {
           finalItems.push(drinkPool[Math.floor(Math.random() * drinkPool.length)].id);
        }
      }
    }

    const groupSize = Math.floor(Math.random() * (type.maxSize - type.minSize + 1)) + type.minSize;
    
    let total = 0;
    const unitPrices: Record<string, number> = {};
    finalItems.forEach(itemId => {
      const price = calculateItemPrice(itemId, isVip);
      total += price; // price is already rounded inside calculateItemPrice
      unitPrices[itemId] = price;
    });

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      items: finalItems,
      total: Math.round(total * 100) / 100, // Final safety round
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
    setFeedback(null);

    // Generate next preview using available food
    const nextType = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
    const nextGroupSize = Math.floor(Math.random() * (nextType.maxSize - nextType.minSize + 1)) + nextType.minSize;
    const nextMinItems = nextGroupSize;
    const nextMaxItems = Math.min(10, nextGroupSize * 2 + Math.floor(decorLevel / 2));
    const nextItemCount = Math.floor(Math.random() * (nextMaxItems - nextMinItems + 1)) + nextMinItems;
    const nextItems: string[] = [];
    for (let i = 0; i < nextItemCount; i++) {
      nextItems.push(availableFood[Math.floor(Math.random() * availableFood.length)].id);
    }
    setNextOrderPreview(nextItems);
  }, [upgrades, nextOrderPreview, menuState]);

  // Initial customer
  useEffect(() => {
    const timer = setTimeout(generateOrder, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-spawn customers by Waiter
  useEffect(() => {
    const waiter = staff.find(s => s.id === 'waiter');
    const hasFreeTable = tables.some(t => t === null);
    
    if (isWorkHours && waiter && waiter.level > 0 && hasFreeTable) {
      const marketingLevel = upgrades.find(u => u.id === 'marketing')?.level || 0;
      let spawnDelay = Math.max(1000, 4000 - marketingLevel * 500 - waiter.level * 200);

      if (activeEvent?.effects.spawnRateMod) {
        spawnDelay *= activeEvent.effects.spawnRateMod;
      }

      const timer = setTimeout(generateOrder, spawnDelay);
      return () => clearTimeout(timer);
    }
  }, [tables, generateOrder, upgrades, isWorkHours, activeEvent, staff]);

  // Order timeout for all tables
  useEffect(() => {
    const timer = setInterval(() => {
      setTables(prev => {
        let changed = false;
        const next = prev.map((order, idx) => {
          if (order && (Date.now() - order.startTime) / 1000 > order.waitTime) {
            changed = true;
            if (selectedTableIndex === idx) {
               setFeedback({ type: 'error', text: '這桌客人等太久走掉了！' });
               setTimeout(() => setFeedback(null), 2000);
            }
            return null;
          }
          return order;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedTableIndex]);

  const quickServe = () => {
    if (!currentOrder) return;
    const { items, customerType } = currentOrder;
    const isEligible = customerType === 'student' || customerType === 'executive';
    if (!isEligible) return;

    // Small chance of error (10%)
    const hasError = Math.random() < 0.10;
    
    if (hasError) {
      const availableItems = FOOD_ITEMS.filter(f => {
         const isLocked = f.requiredUpgradeId && (upgrades.find(u => u.id === f.requiredUpgradeId)?.level || 0) === 0;
         const isOutOfStock = menuState[f.id]?.outOfStock;
         return !isLocked && !isOutOfStock;
      });
      
      if (availableItems.length > 0) {
        const newItems = [...items];
        const errorItem = availableItems[Math.floor(Math.random() * availableItems.length)].id;
        
        if (newItems.length > 0) {
           const swapIdx = Math.floor(Math.random() * newItems.length);
           newItems[swapIdx] = errorItem;
        } else {
           newItems.push(errorItem);
        }
        setRegisterItems(newItems);
        setFeedback({ type: 'error', text: '出錯了！快速掃描似乎弄錯了部分餐點。' });
      } else {
        setRegisterItems([...items]);
        setFeedback({ type: 'success', text: '快速出餐已填寫！' });
      }
    } else {
      setRegisterItems([...items]);
      setFeedback({ type: 'success', text: '快速出餐已填寫！' });
    }
    
    setTimeout(() => setFeedback(null), 1500);
  };

  const calculateItemPrice = (itemId: string, isVip: boolean = false) => {
    const item = FOOD_ITEMS.find(f => f.id === itemId);
    const mState = menuState[itemId];
    const rating = itemRatings[itemId];
    const chefLevel = staff.find(s => s.id === 'chef')?.level || 0;
    const premiumLevel = upgrades.find(u => u.id === 'premium')?.level || 0;
    
    const vipMultiplier = isVip ? 1.5 : 1;
    // Base multipliers: Chef (+10% per level), Premium Upgrade (+15% per level), VIP (+50%), and Menu Price Mod
    const mod = (1 + chefLevel * 0.1) * (1 + premiumLevel * 0.15) * vipMultiplier * (mState?.priceMod || 1);
    
    // Rating bonus: +5% per star above 3, -5% per star below 3
    const avgRating = rating?.count > 0 ? rating.totalStars / rating.count : 3;
    const ratingMod = 1 + (avgRating - 3) * 0.05;
    
    // Daily Special Bonus (+25% price)
    const specialMod = dailySpecials.includes(itemId) ? 1.25 : 1;
    
    // Level 25 Perk: Brand Premium (+15% base price)
    const levelPriceMod = restaurantLevel >= 25 ? 1.15 : 1;
    
    const rawPrice = (item?.price || 0) * mod * ratingMod * specialMod * levelPriceMod;
    return Math.round(rawPrice * 100) / 100;
  };

  const getItemPriceForOrder = (itemId: string, order: Order | null) => {
    if (order?.unitPrices && order.unitPrices[itemId] !== undefined) {
      return order.unitPrices[itemId];
    }
    return calculateItemPrice(itemId, order?.isVip || false);
  };

  const addToRegister = (itemId: string) => {
    if (!currentOrder) return;
    setRegisterItems(prev => [...prev, itemId]);
    
    // Visual feedback for "scanning"
    const element = document.getElementById(`food-${itemId}`);
    if (element) {
      element.classList.add('scale-90', 'brightness-125', 'ring-4', 'ring-blue-400', 'shadow-[0_0_20px_rgba(96,165,250,0.6)]');
      setTimeout(() => {
        element.classList.remove('scale-90', 'brightness-125', 'ring-4', 'ring-blue-400', 'shadow-[0_0_20px_rgba(96,165,250,0.6)]');
      }, 150);
    }
  };

  const clearRegister = () => {
    setRegisterItems([]);
    setPosInput('');
  };

  const checkout = useCallback((tableIdx?: number, overwriteItems?: string[], forceSkipAmount: boolean = false) => {
    const targetIdx = tableIdx !== undefined ? tableIdx : selectedTableIndex;
    if (targetIdx === null || !tables[targetIdx]) return;

    const targetOrder = tables[targetIdx]!;
    const itemsToVerify = overwriteItems || registerItems;

    // Manual amount check (Skip if forceSkipAmount OR cashier level >= 2 AND auto-amount is enabled)
    const cashier = staff.find(s => s.id === 'cashier');
    const skipAmountCheck = forceSkipAmount || (cashier && cashier.level >= 2 && autoAmountEnabled);
    
    const enteredAmount = parseFloat(posInput);

    if (!skipAmountCheck) {
       // Use stable integer-based comparison (cents) to avoid all floating point issues.
       const targetCents = Math.round(targetOrder.total * 100);
       const enteredCents = Math.round((enteredAmount || 0) * 100);

       if (isNaN(enteredAmount) || posInput === '' || targetCents !== enteredCents) {
          const expectedStr = targetOrder.total.toFixed(2);
          const enteredStr = posInput === '' ? "未輸入" : (isNaN(enteredAmount) ? "格式錯誤" : enteredAmount.toFixed(2));
          setFeedback({ 
            type: 'error', 
            text: `收銀金額不符！顧客應付 $${expectedStr}，閣下輸入了: ${enteredStr}` 
          });
          const display = document.getElementById('pos-display');
          if (display) {
            display.classList.add('ring-4', 'ring-red-500/50', 'animate-shake');
            setTimeout(() => display.classList.remove('ring-4', 'ring-red-500/50', 'animate-shake'), 500);
          }
          setTimeout(() => setFeedback(null), 3000);
          return;
       }
    }

    // Check if items match (ignoring order)
    const orderCounts: Record<string, number> = {};
    targetOrder.items.forEach(id => orderCounts[id] = (orderCounts[id] || 0) + 1);

    const registerCounts: Record<string, number> = {};
    itemsToVerify.forEach(id => registerCounts[id] = (registerCounts[id] || 0) + 1);

    const allIds = new Set([...Object.keys(orderCounts), ...Object.keys(registerCounts)]);
    let isMatch = true;
    allIds.forEach(id => {
      if (orderCounts[id] !== registerCounts[id]) isMatch = false;
    });

    if (isMatch) {
      const waiter = staff.find(s => s.id === 'waiter');
      const chef = staff.find(s => s.id === 'chef');
      
      const elapsedSeconds = (Date.now() - targetOrder.startTime) / 1000;
      // Fast legs logic simplified to level based or removed as per user request to simplify
      const adjustedElapsed = waiter && waiter.level >= 5 ? elapsedSeconds * 0.7 : elapsedSeconds;
      const remainingPatienceRatio = Math.max(0, (targetOrder.waitTime - adjustedElapsed) / targetOrder.waitTime);
      
      let baseTipRate = (waiter?.level || 0) * 0.05;
      if (waiter && waiter.level >= 2) baseTipRate += 0.10; // Simple level bonuses

      let qualityBonusRate = remainingPatienceRatio * 0.15;
      
      let tipMultiplier = activeEvent?.effects.tipMod || 1;
      if (targetOrder.isVip) tipMultiplier *= 2;
      if (targetOrder.customerType === 'executive') tipMultiplier *= 2.5; 
      if (targetOrder.customerType === 'student') tipMultiplier *= 0.2; 

      const totalTipRate = (baseTipRate + qualityBonusRate) * tipMultiplier;
      const tip = Math.round(targetOrder.total * totalTipRate * 100) / 100;
      
      const currentDayBonus = 1 + (dailyStats.bonusMultiplier || 0);
      const finalAmountBeforeBonus = targetOrder.total + tip;
      const eventPriceMod = activeEvent?.effects.priceMod || 1;
      
      // Level 5 Perk: Skilled Management (+10% total income)
      const levelIncomeMod = restaurantLevel >= 5 ? 1.10 : 1;
      
      let finalAmount = finalAmountBeforeBonus * currentDayBonus * eventPriceMod * levelIncomeMod;

      if (chef && chef.level >= 6 && Math.random() < 0.2) {
        finalAmount *= 2;
        setTimeout(() => setFeedback({ type: 'success', text: '主廚特製！獲得雙倍收入！' }), 500);
      }

      const chefLevel = chef?.level || 0;
      const decorLevel = upgrades.find(u => u.id === 'decor')?.level || 0;
      let foodQualityScore = Math.min(5, 2 + (chefLevel * 0.5) + (decorLevel * 0.4) + (Math.random() * 1.5));
      if (chef && chef.level >= 3) foodQualityScore = Math.min(5, foodQualityScore + 0.5);
      if (activeEvent?.effects.qualityMod) foodQualityScore = Math.max(1, Math.min(5, foodQualityScore + activeEvent.effects.qualityMod));

      const waitQualityScore = remainingPatienceRatio * 5;
      const baseRating = Math.max(1, Math.min(5, Math.ceil((foodQualityScore + waitQualityScore) / 2)));
      
      const commentsByRating: Record<number, string[]> = {
        5: ["太完美了！味道好且送餐快！", "這是我吃過最好吃的！", "必點推薦！服務與口味佳！"],
        4: ["很不錯，下次還會再來。", "味道很好，如果能再快一點就更好。", "餐點有水準，環境也舒適。"],
        3: ["普通，還可以改善。", "等得有點久，但餐點還行。", "份量充足，但味道一般。"],
        2: ["不太滿意，等太久了。", "味道不太對勁，希望能改進。", "服務態度普通，餐點也普普。"],
        1: ["太糟糕了！絕對不推薦。", "根本不能吃！", "等了半天結果餐點是冷的。"]
      };
      const reviewerComment = commentsByRating[baseRating][Math.floor(Math.random() * commentsByRating[baseRating].length)];
      
      const ratingWeight = targetOrder.customerType === 'critic' ? 5 : 1; 

      setItemRatings(prev => {
        const next = { ...prev };
        targetOrder.items.forEach(itemId => {
          if (!next[itemId]) next[itemId] = { totalStars: 0, count: 0 };
          const variation = Math.floor(Math.random() * 3) - 1;
          const itemStar = Math.max(1, Math.min(5, baseRating + variation));
          next[itemId] = {
            totalStars: next[itemId].totalStars + (itemStar * ratingWeight),
            count: next[itemId].count + ratingWeight
          };
        });
        return next;
      });

      setRecentReviews(prev => [{ rating: baseRating, comment: reviewerComment, customerType: targetOrder.customerType }, ...prev].slice(0, 10));
      setReviewSummary({ rating: baseRating, comment: reviewerComment, items: targetOrder.items });
      
      setMoney(prev => prev + finalAmount);
      setStats(prev => ({
        ...prev,
        totalEarned: prev.totalEarned + finalAmount,
        customersServed: prev.customersServed + 1,
        currentTime: prev.currentTime + 10
      }));

      setDailyStats(prev => {
        const newItems = { ...prev.items };
        targetOrder.items.forEach(itemId => {
          newItems[itemId] = (newItems[itemId] || 0) + 1;
        });
        const isVip = targetOrder.isVip;
        const newVipsServed = (prev.vipsServed || 0) + (isVip ? 1 : 0);
        const newBonusMultiplier = Math.min(0.5, newVipsServed * 0.1);

        return {
          ...prev,
          customers: prev.customers + 1,
          earnings: prev.earnings + finalAmount,
          items: newItems,
          vipsServed: newVipsServed,
          bonusMultiplier: newBonusMultiplier
        };
      });

      const bonusText = dailyStats.bonusMultiplier > 0 ? ` (含 VIP 加成 x${currentDayBonus.toFixed(1)})` : '';
      setFeedback({ type: 'success', text: `結帳成功！評價: ${'⭐'.repeat(baseRating)}${bonusText}` });
      setTimeout(() => setFeedback(null), 3000);
      setTimeout(() => setReviewSummary(null), 4000);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6']
      });

      // Clear table and set to cleaning
      setTables(prev => {
        const next = [...prev];
        next[targetIdx] = null;
        return next;
      });
      
      setCleaningTables(prev => {
        const next = [...prev];
        next[targetIdx] = Date.now();
        return next;
      });
      if (targetIdx === selectedTableIndex) {
        setRegisterItems([]);
        setPosInput('');
      }

    } else {
      setFeedback({ type: 'error', text: '餐點與顧客點的不符！' });
      const container = document.getElementById('register-display');
      if (container) {
        container.classList.add('animate-shake');
        setTimeout(() => container.classList.remove('animate-shake'), 500);
      }
      setTimeout(() => setFeedback(null), 2000);
    }
  }, [selectedTableIndex, registerItems, staff, dailyStats, activeEvent, tables, posInput]);

  // Clear register when switching tables to avoid confusion
  useEffect(() => {
    setRegisterItems([]);
  }, [selectedTableIndex]);

  // Auto-process flow by Cashier
  useEffect(() => {
    const cashier = staff.find(s => s.id === 'cashier');
    if (cashier && cashier.level > 0 && isWorkHours) {
      const autoScan = cashier.level >= 1;
      const instantPay = cashier.level >= 2;

      const timer = setInterval(() => {
        const currentTables = tablesRef.current;
        // Priority to checkout occupied tables
        const occupiedIdx = currentTables.findIndex(t => t !== null);
        
        if (occupiedIdx !== -1) {
          const tableToProcess = currentTables[occupiedIdx]!;
          
          if (instantPay) {
            checkout(occupiedIdx, [...tableToProcess.items], true);
          } else if (autoScan) {
             // Fill register for the current selected if it's the target and empty
             if (selectedTableIndex === occupiedIdx && registerItems.length === 0) {
                setRegisterItems([...tableToProcess.items]);
             }
          }
        }
      }, Math.max(800, 5000 / cashier.level)); 
      
      return () => clearInterval(timer);
    }
  }, [staff, isWorkHours, selectedTableIndex, registerItems.length, checkout]);

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    if (upgrade.maxLevel !== undefined && upgrade.level >= upgrade.maxLevel) {
      setFeedback({ type: 'error', text: '已買到最高等級！' });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    const cost = Math.round(upgrade.baseCost * Math.pow(1.5, upgrade.level));
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setUpgrades(prev => prev.map(u => 
        u.id === upgradeId ? { ...u, level: u.level + 1 } : u
      ));
      const isSinglePurchase = upgrade.maxLevel === 1;
      setFeedback({ type: 'success', text: isSinglePurchase ? `成功購買：${upgrade.name}！` : `升級成功：${upgrade.name} Lv.${upgrade.level + 1}` });
      setTimeout(() => setFeedback(null), 2000);
    } else {
      setFeedback({ type: 'error', text: '金幣不足！' });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const trainStaff = (staffId: string) => {
    const member = staff.find(s => s.id === staffId);
    if (!member) return;

    const cost = Math.round(member.baseCost * Math.pow(1.8, member.level));
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setStaff(prev => prev.map(s => 
        s.id === staffId ? { ...s, level: s.level + 1 } : s
      ));
      setFeedback({ type: 'success', text: member.level === 0 ? `成功招聘：${member.name}！` : `晉升成功：${member.name} Lv.${member.level + 1}` });
      setTimeout(() => setFeedback(null), 2000);
    } else {
      setFeedback({ type: 'error', text: '金幣不足！' });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const startNextDay = () => {
    // Generate new menu state
    const newMenuState: MenuState = {};
    
    // Choose one item to be out of stock
    const stockCandidates = FOOD_ITEMS.filter(f => !['burger', 'fries', 'cola'].includes(f.id));
    const outOfStockId = Math.random() < 0.3 && stockCandidates.length > 0 
      ? stockCandidates[Math.floor(Math.random() * stockCandidates.length)].id 
      : null;

    FOOD_ITEMS.forEach(item => {
      const rand = Math.random();
      let priceMod = 1;
      if (rand < 0.15) priceMod = 0.8;
      else if (rand < 0.3) priceMod = 1.2;
      else if (rand < 0.4) priceMod = 1.4;
      else if (rand < 0.5) priceMod = 0.7;
      else priceMod = 1;
      
      newMenuState[item.id] = {
        priceMod: priceMod,
        outOfStock: item.id === outOfStockId
      };
    });

    // Generate daily specials: 1-2 random available items
    const possibleSpecials = FOOD_ITEMS.filter(f => {
      if (f.id === outOfStockId) return false;
      if (!f.requiredUpgradeId) return true;
      const upgrade = upgrades.find(u => u.id === f.requiredUpgradeId);
      return upgrade && upgrade.level > 0;
    });

    const numSpecials = Math.random() < 0.3 ? 2 : 1;
    const selectedSpecials: string[] = [];
    const pool = [...possibleSpecials];
    for (let i = 0; i < numSpecials; i++) {
      if (pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        selectedSpecials.push(pool[idx].id);
        pool.splice(idx, 1);
      }
    }
    setDailySpecials(selectedSpecials);

    setMenuState(newMenuState);
    setTables(new Array(6).fill(null));
    setCleaningTables(new Array(6).fill(null));
    setSelectedTableIndex(null);
    setRegisterItems([]);

    setStats(prev => ({
      ...prev,
      day: prev.day + 1,
      currentTime: 540
    }));
    setDailyStats({ customers: 0, earnings: 0, items: {}, vipsServed: 0, bonusMultiplier: 0 });
    setFeedback({ type: 'success', text: `第 ${stats.day + 1} 天開始！菜單價格已更新。` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h;
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const [isResetting, setIsResetting] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<{ rating: number, items: string[], comment: string } | null>(null);

  // --- Random Event Logic ---
  useEffect(() => {
    if (isWorkHours && !activeEvent) {
      const interval = setInterval(() => {
        // 8% chance every 15 seconds to trigger an event if none active
        // During rush hours (11:00-14:00 and 17:00-18:00), chance is higher
        const currentHour = stats.currentTime / 60;
        const isPeak = (currentHour >= 11 && currentHour <= 14) || (currentHour >= 17);
        
        // Level 30 Perk: Popularity Peak (+30% event frequency)
        const levelEventMod = restaurantLevel >= 30 ? 1.3 : 1;
        const chance = (isPeak ? 0.12 : 0.06) * levelEventMod;

        if (Math.random() < chance) {
          const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
          setActiveEvent(event);
          setEventTimeLeft(event.duration);
          setFeedback({ type: 'success', text: `突發事件：${event.name}！` });
          setTimeout(() => setFeedback(null), 3000);
        }
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isWorkHours, activeEvent, stats.currentTime]);

  // --- Table Cleaning Logic ---
  useEffect(() => {
    const cleaner = staff.find(s => s.id === 'cleaner');
    const timer = setInterval(() => {
      setCleaningTables(prev => {
        let changed = false;
        const next = prev.map(startTime => {
          if (startTime === null) return null;
          
          // Level 10 Perk: Efficient Cleaning (Speed +25%)
          const levelCleaningMod = restaurantLevel >= 10 ? 0.75 : 1;
          const cleaningDuration = Math.max(1, (10 - (cleaner?.level || 0) * 1.5) * levelCleaningMod); 
          const elapsed = (Date.now() - startTime) / 1000;
          
          if (elapsed >= cleaningDuration) {
            changed = true;
            return null;
          }
          return startTime;
        });
        return changed ? next : prev;
      });
    }, 500);
    return () => clearInterval(timer);
  }, [staff]);

  // Event Timer
  useEffect(() => {
    if (activeEvent && eventTimeLeft > 0) {
      const timer = setInterval(() => {
        setEventTimeLeft(prev => {
          if (prev <= 1) {
            setActiveEvent(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeEvent, eventTimeLeft]);

  // --- Render Helpers ---

  const getFoodIcon = (id: string) => FOOD_ITEMS.find(f => f.id === id)?.icon;
  const getFoodName = (id: string) => FOOD_ITEMS.find(f => f.id === id)?.name;
  const getFoodColor = (id: string) => FOOD_ITEMS.find(f => f.id === id)?.color;

  const getCustomerInfo = (id: string | undefined) => {
    if (!id) return CUSTOMER_TYPES[0];
    return CUSTOMER_TYPES.find(c => c.id === id) || CUSTOMER_TYPES[0];
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
             className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-orange-100/30 to-amber-100/30 blur-[100px] rounded-full"
           />
           <motion.div 
             animate={{ rotate: -360 }}
             transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
             className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tr from-blue-100/30 to-emerald-100/30 blur-[100px] rounded-full"
           />
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-orange-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30 relative">
              <Store className="w-12 h-12 text-white" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white"
              >
                <Zap className="w-4 h-4 fill-current" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">餐廳大亨</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Restaurant Tycoon Extreme</p>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setGameState('mode_select')}
              className="group relative flex items-center justify-center gap-3 py-5 bg-orange-500 text-white rounded-3xl font-black text-xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all hover:bg-orange-600 overflow-hidden"
            >
              <Play className="w-6 h-6 fill-current" />
              遊戲開始
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
            
            <button 
              onClick={() => {
                setGameState('playing_free');
                setActiveTab('settings');
              }}
              className="flex items-center justify-center gap-3 py-5 bg-white text-slate-600 border-2 border-slate-100 rounded-3xl font-black text-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            >
              <Settings className="w-6 h-6" />
              遊戲設定
            </button>

            <button 
              onClick={() => {
                if(confirm('確定要退出並清除所有資料嗎？')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="flex items-center justify-center gap-3 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black text-xl hover:bg-red-50 hover:text-red-500 border-2 border-transparent hover:border-red-100 active:scale-95 transition-all"
            >
              <LogOut className="w-6 h-6" />
              退出遊戲
            </button>
          </div>

          <p className="text-center mt-12 text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Powered by AI Studio</p>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'mode_select') {
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
           <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-orange-100/40 blur-[120px] rounded-full" />
           <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-blue-100/40 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-16">
             <button 
               onClick={() => setGameState('start')}
               className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest mx-auto group"
             >
               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               返回首頁
             </button>
             <h2 className="text-4xl font-black text-slate-800 tracking-tight">選擇遊戲模式</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">CHOOSE YOUR RESTAURANT EXPERIENCE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <motion.div 
               whileHover={{ y: -10 }}
               className="bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-orange-500/5 border border-slate-100 hover:border-orange-500/20 transition-all group flex flex-col"
             >
                <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform">
                   <Store className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">餐廳大亨 (自由模式)</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-1">
                  扮演餐廳經營者，從桌椅擺設、招聘員工到設計菜單，全方位打造你的美食帝國。考驗你的經營策略與即時管理能力。
                </p>
                <button 
                  onClick={() => setGameState('playing_free')}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-orange-500 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                >
                  開始經營之旅
                </button>
             </motion.div>

             <motion.div 
               whileHover={{ y: -10 }}
               className="bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-blue-500/5 border border-slate-100 hover:border-blue-500/20 transition-all group flex flex-col"
             >
                <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                   <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">打工達人 (職業模式)</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-1">
                  從基層員工做起！不論是行政主廚、金牌收銀員或環境清潔員，透過不同的小遊戲磨練技能，賺取穩定薪水並提升職場地位。
                </p>
                <button 
                  onClick={() => setGameState('playing_career')}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-blue-500 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                >
                  開始職業生涯
                </button>
             </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'playing_career') {
    return (
      <CareerMode 
        onExit={() => setGameState('mode_select')}
        onEarnMoney={(amount) => {
          setMoney(prev => prev + amount);
          setStats(prev => ({ ...prev, totalEarned: prev.totalEarned + amount }));
        }}
        restaurantMoney={money}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-slate-900 font-sans selection:bg-orange-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-2 flex flex-col gap-2 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white shadow-lg shadow-orange-200/50">
              <Store className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black tracking-tight text-slate-800">餐廳大亨</h1>
          </div>
          
          <AnimatePresence>
            {isDayComplete && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="bg-white rounded-[4rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] w-full max-w-2xl text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" />
                  
                  <div className="mb-8">
                     <div className="w-24 h-24 bg-orange-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-100/50">
                        <Store className="w-12 h-12 text-orange-600" />
                     </div>
                     <h2 className="text-4xl font-black text-slate-900 mb-2">本日營業大成功！</h2>
                     <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Day {stats.day} Daily report</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-left">
                     <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                        <Users className="w-12 h-12 text-slate-200 absolute -bottom-2 -right-2 opacity-50 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-black text-slate-400 uppercase mb-2">服務總桌數</p>
                        <p className="text-4xl font-black text-slate-800">{dailyStats.customers} <span className="text-lg font-bold text-slate-400">位</span></p>
                     </div>
                     <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 relative group overflow-hidden">
                        <DollarSign className="w-12 h-12 text-emerald-200 absolute -bottom-2 -right-2 opacity-50 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-black text-emerald-600 uppercase mb-2">本日營收</p>
                        <p className="text-4xl font-black text-emerald-700 font-mono">${dailyStats.earnings.toFixed(2)}</p>
                     </div>
                  </div>

                  <button 
                    onClick={startNextDay}
                    className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-slate-400/20 active:scale-95 group"
                  >
                    <Zap className="w-6 h-6 text-amber-400 fill-current group-hover:animate-bounce" />
                    開始新的一天
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-500 px-3 py-1 rounded-xl shadow-md flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-white" />
                <span className="text-sm font-black text-white font-mono tracking-tight">${money.toFixed(2)}</span>
             </div>
             <div className="flex items-center gap-2 px-2 py-1 bg-white/50 backdrop-blur-md rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2">
                   <span className="text-[7px] font-black text-orange-600 uppercase">Lv.{restaurantLevel}</span>
                </div>
                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2">
                   <span className="text-[7px] font-black text-slate-500 tabular-nums">{formatTime(stats.currentTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <span className="text-[7px] font-black text-slate-400">D{stats.day}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Global Notifications - COMPACT */}
        <div className="flex flex-col gap-1 mt-2">
          {activeEvent && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`px-3 py-0.5 ${activeEvent.color} text-white rounded-full flex items-center justify-between text-[8px] font-black uppercase tracking-wider relative overflow-hidden`}
            >
              <div className="flex items-center gap-2">
                {React.cloneElement(activeEvent.icon as React.ReactElement, { className: 'w-2 h-2' })}
                <span>{activeEvent.name}</span>
              </div>
              <div className="flex items-center gap-1 tabular-nums">
                <div className="w-12 h-0.5 bg-white/20 rounded-full overflow-hidden mr-1">
                   <div className="h-full bg-white/60" style={{ width: `${(eventTimeLeft / activeEvent.duration) * 100}%` }} />
                </div>
                {eventTimeLeft}S
              </div>
            </motion.div>
          )}

          {dailyStats.bonusMultiplier > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-3 py-0.5 bg-amber-400 text-white rounded-full flex items-center justify-between text-[8px] font-black uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-2 h-2" />
                <span>VIP BUFF: +{(dailyStats.bonusMultiplier * 100).toFixed(0)}%</span>
              </div>
              <span>接待 {dailyStats.vipsServed} 位</span>
            </motion.div>
          )}
        </div>

        {/* Order Preview Area */}
        {nextOrderPreview && isWorkHours && (
          <div className="bg-slate-50 rounded-xl p-1.5 border border-dashed border-slate-300 flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-400 text-[8px] font-black uppercase tracking-widest border-r border-slate-200 pr-3">
              <Zap className="w-2.5 h-2.5" />
              Next
            </div>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {nextOrderPreview.map((id, idx) => (
                <div key={idx} className="bg-white p-1 rounded-md shadow-sm border border-slate-100 flex items-center gap-1 shrink-0">
                  <div className="scale-50 origin-center">{getFoodIcon(id)}</div>
                  <span className="text-[9px] font-bold text-slate-600 line-clamp-1">{getFoodName(id)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 pt-4 flex gap-1 overflow-x-auto custom-scrollbar no-scrollbar">
        <button 
          onClick={() => setActiveTab('game')}
          className={`px-4 py-2 rounded-t-xl font-black text-xs flex items-center gap-2 transition-all min-w-[100px] justify-center shrink-0 ${activeTab === 'game' ? 'bg-white border-x border-t border-slate-200 text-orange-600 shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.03)]' : 'text-slate-400 hover:text-slate-600 bg-slate-100/50'}`}
        >
          <Zap className="w-4 h-4" />
          餐廳經營
        </button>
        <button 
          onClick={() => setActiveTab('research')}
          className={`px-4 py-2 rounded-t-xl font-black text-xs flex items-center gap-2 transition-all min-w-[100px] justify-center shrink-0 ${activeTab === 'research' ? 'bg-white border-x border-t border-slate-200 text-amber-600 shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.03)]' : 'text-slate-400 hover:text-slate-600 bg-slate-100/50'}`}
        >
          <Plus className="w-4 h-4" />
          成就與研發
        </button>
        <button 
          onClick={() => setActiveTab('shop')}
          className={`px-4 py-2 rounded-t-xl font-black text-xs flex items-center gap-2 transition-all min-w-[100px] justify-center shrink-0 ${activeTab === 'shop' ? 'bg-white border-x border-t border-slate-200 text-blue-600 shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.03)]' : 'text-slate-400 hover:text-slate-600 bg-slate-100/50'}`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          商店升級
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-t-xl font-black text-xs flex items-center gap-2 transition-all min-w-[100px] justify-center shrink-0 ${activeTab === 'staff' ? 'bg-white border-x border-t border-slate-200 text-emerald-600 shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.03)]' : 'text-slate-400 hover:text-slate-600 bg-slate-100/50'}`}
        >
          <Users className="w-4 h-4" />
          招募員工
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-t-xl font-black text-xs flex items-center gap-2 transition-all min-w-[100px] justify-center shrink-0 ${activeTab === 'settings' ? 'bg-white border-x border-t border-slate-200 text-slate-800 shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.03)]' : 'text-slate-400 hover:text-slate-600 bg-slate-100/50'}`}
        >
          <Settings className="w-4 h-4" />
          遊戲設定
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 bg-white border border-slate-200 rounded-b-3xl rounded-tr-3xl min-h-[650px] shadow-sm mb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'game' && (
            <motion.div 
              key="game"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Top Section: Table Grid */}
              <section className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Store className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">餐廳內部 (多桌營運)</h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">點擊桌位以處理訂單</p>
                    </div>
                  </div>
                  {isWorkHours && (
                    <button 
                      onClick={generateOrder}
                      className="px-4 py-2 bg-orange-500 text-white text-[10px] font-black rounded-full hover:bg-orange-400 transition-all shadow-md uppercase tracking-wider"
                    >
                      招攬顧客
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-6">
                  {tables.map((order, idx) => {
                    const isCleaning = cleaningTables[idx] !== null;
                    const cleaner = staff.find(s => s.id === 'cleaner');
                    const cleaningDuration = Math.max(2, 10 - (cleaner?.level || 0) * 1.5);
                    const cleaningElapsed = isCleaning ? (Date.now() - cleaningTables[idx]!) / 1000 : 0;
                    const cleaningProgress = isCleaning ? Math.min(100, (cleaningElapsed / cleaningDuration) * 100) : 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (selectedTableIndex !== idx) {
                            setSelectedTableIndex(idx);
                            setPosInput('');
                          }
                        }}
                        className={`
                          relative aspect-square rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-2 group
                          ${selectedTableIndex === idx ? 'bg-blue-50 border-blue-400 shadow-xl ring-4 ring-blue-100 scale-105 z-10' : order || isCleaning ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm' : 'bg-slate-100/50 border-slate-100 border-dashed opacity-40 hover:opacity-100'}
                        `}
                      >
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110
                          ${order ? 'bg-blue-100 text-blue-600 shadow-inner' : isCleaning ? 'bg-amber-50 text-amber-500' : 'bg-slate-200 text-slate-400'}
                        `}>
                          {order ? getCustomerInfo(order.customerType).icon : isCleaning ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Plus className="w-4 h-4 opacity-20" />}
                        </div>
                        <div className="text-center">
                          <p className={`font-black text-[8px] uppercase tracking-tighter ${selectedTableIndex === idx ? 'text-blue-600' : 'text-slate-500'}`}>T {idx + 1}</p>
                        </div>

                        {order && (
                          <>
                            <div className="absolute top-2 right-2 flex gap-0.5">
                               {order.isVip && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 animate-pulse" />}
                            </div>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: '100%', backgroundColor: '#10B981' }}
                                animate={{ 
                                  width: '0%', 
                                  backgroundColor: ['#10B981', '#F59E0B', '#EF4444'] 
                                }}
                                className="h-full rounded-full"
                              />
                            </div>
                          </>
                        )}

                        {isCleaning && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               style={{ width: `${cleaningProgress}%` }}
                               className="h-full bg-amber-400 transition-all duration-300"
                             />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Bottom Section: Side-by-Side Register */}
              <section className="bg-slate-900 rounded-[2.5rem] p-4 sm:p-8 shadow-2xl text-white">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Menu Panel - Scrollable 2xGrid */}
                  <div className="lg:w-1/2 flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 px-2">
                       <h3 className="text-xl font-black flex items-center gap-2">
                          <Utensils className="w-6 h-6 text-orange-400" />
                          備餐面板
                       </h3>
                       <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 py-1 px-3 rounded-full">
                          <ArrowRight className="w-3 h-3 animate-pulse" /> 左右滑動切換
                       </div>
                    </div>

                    <div className="relative group/menu flex-1 flex flex-col gap-8 overflow-y-auto no-scrollbar pt-2 pr-2">
                      {/* Food Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-4 shadow-sm">
                           <Utensils className="w-4 h-4 text-orange-400" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">主餐餐點</span>
                        </div>
                        <div className="overflow-x-auto no-scrollbar pb-6 px-4">
                          <div className="grid grid-rows-2 grid-flow-col gap-4 w-max">
                            {FOOD_ITEMS.filter(f => f.category === 'main').map(item => {
                              const isLocked = item.requiredUpgradeId && (upgrades.find(u => u.id === item.requiredUpgradeId)?.level || 0) === 0;
                              const mState = menuState[item.id];
                              const rating = itemRatings[item.id];
                              const isOutOfStock = mState?.outOfStock;
                              const avgRating = rating?.count > 0 ? rating.totalStars / rating.count : null;
                              const currentPrice = item.price * (mState?.priceMod || 1) * (avgRating ? 1 + (avgRating - 3) * 0.05 : 1);
                              
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => addToRegister(item.id)}
                                  disabled={!currentOrder || isLocked || isOutOfStock}
                                  className={`
                                    relative p-4 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 min-w-[120px] transition-all active:scale-95 border-2
                                    ${!currentOrder || isLocked || isOutOfStock 
                                      ? 'bg-slate-800/40 border-slate-800 text-slate-600 grayscale opacity-40' 
                                      : `bg-slate-800 border-white/5 hover:border-${item.color.split('-')[1]}-500/50 hover:bg-slate-700 shadow-xl text-white`}
                                  `}
                                >
                                  {isLocked ? (
                                    <Lock className="w-6 h-6 text-slate-700" />
                                  ) : (
                                    <>
                                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg scale-90 group-hover:scale-100 transition-transform`}>
                                        {getFoodIcon(item.id)}
                                      </div>
                                      <div className="text-center">
                                        <p className="text-[10px] font-black leading-tight mb-1">{item.name}</p>
                                        <p className="text-[8px] font-mono font-black text-emerald-400 opacity-80">${currentPrice.toFixed(2)}</p>
                                      </div>
                                    </>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Drinks Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-4 shadow-sm">
                           <Coffee className="w-4 h-4 text-emerald-400" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">飲品備餐</span>
                        </div>
                        <div className="overflow-x-auto no-scrollbar pb-6 px-4">
                          <div className="grid grid-rows-2 grid-flow-col gap-4 w-max">
                            {FOOD_ITEMS.filter(f => f.category === 'drink').map(item => {
                              const isLocked = item.requiredUpgradeId && (upgrades.find(u => u.id === item.requiredUpgradeId)?.level || 0) === 0;
                              const mState = menuState[item.id];
                              const rating = itemRatings[item.id];
                              const isOutOfStock = mState?.outOfStock;
                              const avgRating = rating?.count > 0 ? rating.totalStars / rating.count : null;
                              const currentPrice = item.price * (mState?.priceMod || 1) * (avgRating ? 1 + (avgRating - 3) * 0.05 : 1);
                              
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => addToRegister(item.id)}
                                  disabled={!currentOrder || isLocked || isOutOfStock}
                                  className={`
                                    relative p-4 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 min-w-[120px] transition-all active:scale-95 border-2
                                    ${!currentOrder || isLocked || isOutOfStock 
                                      ? 'bg-slate-800/40 border-slate-800 text-slate-600 grayscale opacity-40' 
                                      : `bg-slate-800 border-white/5 hover:border-${item.color.split('-')[1]}-500/50 hover:bg-slate-700 shadow-xl text-white`}
                                  `}
                                >
                                  {isLocked ? (
                                    <Lock className="w-6 h-6 text-slate-700" />
                                  ) : (
                                    <>
                                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg scale-90 group-hover:scale-100 transition-transform`}>
                                        {getFoodIcon(item.id)}
                                      </div>
                                      <div className="text-center">
                                        <p className="text-[10px] font-black leading-tight mb-1">{item.name}</p>
                                        <p className="text-[8px] font-mono font-black text-emerald-400 opacity-80">${currentPrice.toFixed(2)}</p>
                                      </div>
                                    </>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Smart Tablet POS - NOW WITH INTEGRATED ORDER DETAILS & KEYPAD */}
                  <div id="register-display" className="lg:w-1/2 flex flex-col h-[750px] bg-slate-800 rounded-[3rem] p-4 sm:p-6 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border-[12px] border-slate-900 relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 mb-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Tablet className="w-3 h-3" /> Smart POS v2.5
                      </div>
                    </div>

                    {/* Main Screen Container */}
                    <div className="flex-1 bg-slate-50 rounded-[2rem] overflow-hidden flex flex-col shadow-inner border border-white/10">
                      {/* Top Action Bar */}
                      <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                               {currentOrder ? getCustomerInfo(currentOrder.customerType).icon : <Store className="w-4 h-4" />}
                            </div>
                            <div>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Target Account</p>
                               <h2 className="text-sm font-black text-slate-800 leading-none">
                                  {selectedTableIndex !== null ? `Table ${selectedTableIndex + 1}` : 'STANDBY'}
                               </h2>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            {staff.find(s => s.id === 'cashier')?.level! >= 1 && (
                              <button 
                                onClick={() => setAutoOrderEnabled(!autoOrderEnabled)}
                                className={`px-2 py-1 rounded-lg text-[6px] font-black border-2 transition-all ${autoOrderEnabled ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                              >
                                AUTO ITEM
                              </button>
                            )}
                         </div>
                      </div>

                      {/* INTEGRATED CUSTOMER ORDER REFERENCE (The "Receipt View") */}
                      <div className="bg-slate-100 p-4 border-b border-slate-200 h-48 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Customer's Order</p>
                           {currentOrder && <span className="text-[9px] font-mono font-black text-blue-600">${currentOrder.total.toFixed(2)}</span>}
                        </div>
                        {currentOrder ? (
                           <div className="space-y-1.5 px-1">
                              {currentOrder.items.map((itId, i) => (
                                <div key={i} className="flex justify-between items-center text-[10px] bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                  <div className="flex items-center gap-2">
                                     <span className="opacity-70">{getFoodIcon(itId)}</span>
                                     <span className="font-bold text-slate-600">{getFoodName(itId)}</span>
                                  </div>
                                  <span className="font-mono font-black text-slate-400">${getItemPriceForOrder(itId, currentOrder).toFixed(2)}</span>
                                </div>
                              ))}
                           </div>
                        ) : (
                           <div className="h-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">
                              Please select a table to see receipt
                           </div>
                        )}
                      </div>

                      {/* POS REGISTER (items being billed) */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Register</p>
                        {registerItems.length > 0 ? (
                           <div className="space-y-1.5 h-full overflow-y-auto">
                               {registerItems.map((itemId, idx) => (
                                 <motion.div 
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={`${itemId}-${idx}`}
                                    className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group"
                                 >
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-base">{getFoodIcon(itemId)}</div>
                                      <div>
                                        <p className="text-[10px] font-black text-slate-800 leading-tight">{getFoodName(itemId)}</p>
                                        <p className="text-[7px] font-bold text-slate-400">QTY 1</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[10px] font-black text-slate-700">${getItemPriceForOrder(itemId, currentOrder).toFixed(2)}</span>
                                      <button 
                                        onClick={() => setRegisterItems(prev => prev.filter((_, i) => i !== idx))}
                                        className="p-1 bg-red-50 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                 </motion.div>
                               ))}
                           </div>
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center opacity-30 text-slate-400 py-4">
                              <ShoppingBag className="w-10 h-10 mb-2 stroke-[1.5]" />
                              <p className="font-black text-[8px] uppercase tracking-widest">Register Empty</p>
                           </div>
                        )}
                      </div>

                      {/* Display & Keypad Section */}
                      <div className="bg-white p-6 border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                         {/* Status Indicators & Numeric Display */}
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col gap-1.5">
                               <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${registerItems.length > 0 && (() => {
                                 const orderCounts: Record<string, number> = {};
                                 currentOrder?.items.forEach(id => orderCounts[id] = (orderCounts[id] || 0) + 1);
                                 const registerCounts: Record<string, number> = {};
                                 registerItems.forEach(id => registerCounts[id] = (registerCounts[id] || 0) + 1);
                                 const allIds = new Set([...Object.keys(orderCounts), ...Object.keys(registerCounts)]);
                                 let isFoodMatch = true;
                                 allIds.forEach(id => { if (orderCounts[id] !== registerCounts[id]) isFoodMatch = false; });
                                 return isFoodMatch;
                               })() ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                 <Utensils className="w-3 h-3" /> Food Correct
                               </div>
                               <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${posInput !== '' && currentOrder && Math.round(parseFloat(posInput) * 100) === Math.round(currentOrder.total * 100) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                 <DollarSign className="w-3 h-3" /> Amount Match
                               </div>
                            </div>
                            
                            <div className="text-right">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Balance</p>
                               <div className="bg-slate-900 px-6 py-4 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border-t border-white/10 flex flex-col items-end ring-1 ring-white/5">
                                  <span className="text-blue-400 text-[10px] font-black uppercase mb-1 tracking-widest">Items: {registerItems.length}</span>
                                  <div className="flex items-baseline gap-3">
                                     <span className="text-emerald-400 font-mono text-5xl font-black tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                        ${posInput || '0.00'}
                                     </span>
                                     <div className="flex flex-col items-end">
                                        <span className="text-slate-500 font-mono text-xs uppercase font-bold tracking-tight">Required</span>
                                        <span className="text-white font-mono text-xl font-black">${currentOrder?.total.toFixed(2) || '0.00'}</span>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>

                         {/* Integrated Smart Controller */}
                         <div className="grid grid-cols-12 gap-4">
                            {/* Keypad */}
                            <div className="col-span-8 grid grid-cols-3 gap-2">
                               {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map(k => (
                                 <button
                                   key={k}
                                   onClick={() => {
                                     if (k === 'C') setPosInput('');
                                     else if (k === '.') { 
                                       if (!posInput.includes('.')) {
                                         setPosInput(prev => prev === '' ? '0.' : prev + '.');
                                       }
                                     } else {
                                       if (posInput.includes('.') && posInput.split('.')[1].length >= 2) return;
                                       setPosInput(prev => prev + k);
                                     }
                                   }}
                                   className={`h-12 rounded-xl text-lg font-black transition-all active:scale-90 shadow-sm border ${k === 'C' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-white hover:border-blue-400'}`}
                                 >
                                   {k}
                                 </button>
                               ))}
                            </div>

                            {/* Main Actions */}
                            <div className="col-span-4 flex flex-col gap-2">
                               <button 
                                 onClick={clearRegister}
                                 className="flex-1 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                               >
                                 Clear
                               </button>
                               {currentOrder && !autoOrderEnabled && (
                                 <button 
                                   onClick={() => {
                                     setRegisterItems(currentOrder.items);
                                     setFeedback({ type: 'success', text: '已從顧客訂單同步餐點！' });
                                     setTimeout(() => setFeedback(null), 1500);
                                   }}
                                   className="flex-1 bg-blue-100 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 animate-pulse"
                                 >
                                   Sync Order
                                 </button>
                               )}
                               <button 
                                 onClick={() => checkout()}
                                 disabled={!currentOrder || registerItems.length === 0 || posInput === ''}
                                 className={`flex-[2] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center gap-2 ${currentOrder && registerItems.length > 0 && posInput !== '' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'}`}
                               >
                                 <CreditCard className="w-6 h-6" />
                                 Collect
                               </button>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'staff' && (
            <motion.div 
              key="staff"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(member => {
                  const cost = Math.round(member.baseCost * Math.pow(1.8, member.level));
                  const canAfford = money >= cost;

                  return (
                    <div key={member.id} className="group p-6 rounded-[2rem] border border-slate-100 bg-emerald-50/30 hover:bg-white hover:shadow-xl transition-all flex flex-col h-full relative overflow-hidden">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-4 rounded-2xl transition-colors ${canAfford ? 'bg-white shadow-md text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                          {member.icon}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 leading-none mb-1">{member.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                              等級 {member.level}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1 font-medium">{member.description}</p>
                      
                      <button
                        onClick={() => trainStaff(member.id)}
                        disabled={!canAfford}
                        className={`
                          w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all
                          ${canAfford 
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                        `}
                      >
                        <Plus className="w-4 h-4" />
                        ${cost} {member.level === 0 ? '招聘' : '訓練 / 晉升'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 flex items-center gap-8 shadow-sm">
                <div className="bg-white p-4 rounded-3xl shadow-emerald-200 shadow-lg shrink-0">
                  <Users className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-black text-emerald-900 text-lg mb-2">團隊效益說明</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    <li className="text-sm text-emerald-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      服務生：自動接客
                    </li>
                    <li className="text-sm text-emerald-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      廚師：提升所有餐點
                    </li>
                    <li className="text-sm text-emerald-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      收銀員：自動結帳
                    </li>
                    <li className="text-sm text-emerald-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      接待員：縮短顧客等待時間，並提高 VIP 出現率
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'research' && (
            <motion.div 
              key="research"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Level Perks Section */}
              <div className="bg-slate-900 rounded-[3rem] p-8 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] -z-0" />
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <div className="bg-amber-500 p-2 rounded-xl text-white shadow-lg shadow-amber-500/20">
                             <TrendingUp className="w-5 h-5" />
                          </div>
                          <div>
                             <h2 className="text-xl font-black text-white">餐廳成就里程碑</h2>
                             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Restaurant Milestones & Perks</p>
                          </div>
                       </div>
                       <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-amber-500 font-black text-sm">
                          目前等級: Lv.{restaurantLevel}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {LEVEL_PERKS.map((perk, idx) => {
                          const isUnlocked = restaurantLevel >= perk.level;
                          return (
                             <div 
                               key={idx} 
                               className={`
                                 group p-5 rounded-3xl border transition-all relative overflow-hidden
                                 ${isUnlocked 
                                   ? 'bg-amber-500/10 border-amber-500/30 text-white' 
                                   : 'bg-white/5 border-white/5 text-slate-500 opacity-60'}
                               `}
                             >
                                <div className="flex items-start justify-between mb-3">
                                   <div className={`p-3 rounded-2xl ${isUnlocked ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/10 text-slate-500'}`}>
                                      {perk.icon}
                                   </div>
                                   <div className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? 'text-amber-500' : 'text-slate-600'}`}>
                                      Lv.{perk.level}
                                   </div>
                                </div>
                                <h4 className={`font-black text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{perk.name}</h4>
                                <p className="text-[10px] font-medium opacity-80 leading-relaxed">{perk.description}</p>
                                
                                {isUnlocked && (
                                   <div className="absolute -bottom-2 -right-2 opacity-10">
                                      {perk.icon && React.cloneElement(perk.icon as React.ReactElement, { className: 'w-12 h-12' })}
                                   </div>
                                )}
                             </div>
                          );
                       })}
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2 px-2">
                    <ChefHat className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl font-black text-slate-800">新菜單研發</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upgrades.filter(u => u.id.startsWith('menu_')).map(upgrade => {
                  const cost = Math.round(upgrade.baseCost * Math.pow(1.5, upgrade.level));
                  const canAfford = money >= cost;
                  const isMaxed = upgrade.maxLevel !== undefined && upgrade.level >= upgrade.maxLevel;
                  const foodItem = FOOD_ITEMS.find(f => f.requiredUpgradeId === upgrade.id);

                  return (
                    <div key={upgrade.id} className="group p-6 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all flex flex-col h-full relative overflow-hidden">
                      {isMaxed && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> 已解鎖
                        </div>
                      )}
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-4 rounded-2xl transition-all duration-500 ${isMaxed ? 'bg-emerald-500 text-white' : canAfford ? 'bg-white shadow-md text-amber-600 scale-105' : 'bg-slate-200 text-slate-400 grayscale'}`}>
                          {upgrade.icon}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 leading-none mb-1">{upgrade.name}</h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{isMaxed ? '菜單項目' : '即將解鎖'}</span>
                        </div>
                      </div>

                      <div className="mb-6 flex-1">
                        <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">{upgrade.description}</p>
                        
                        {!isMaxed && foodItem && (
                          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 border-dashed">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-2">解鎖預覽</span>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${foodItem.color} text-white shadow-sm`}>
                                {React.cloneElement(foodItem.icon as React.ReactElement, { className: 'w-6 h-6' })}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-700">{foodItem.name}</div>
                                <div className="text-[10px] font-medium text-slate-500">預計獲利: <span className="text-emerald-600 font-bold">${foodItem.price}</span></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {!isMaxed && (
                        <button
                          onClick={() => buyUpgrade(upgrade.id)}
                          disabled={!canAfford}
                          className={`
                            w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all
                            ${canAfford 
                              ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-xl' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                          `}
                        >
                          <DollarSign className="w-4 h-4" />
                          ${cost} 解鎖
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-slate-50 rounded-[3rem] p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl">
                      <Settings className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">遊戲設定</h2>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Game Preferences & Audio</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">存檔狀態</p>
                      <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        已自動存檔
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setFeedback({ type: 'success', text: '進度已手動保存！' });
                        // Success toast will appear, and useEffect handles the actual stringify
                      }}
                      className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs hover:bg-white hover:shadow-lg transition-all border border-slate-200 flex items-center gap-2 group"
                    >
                      <Save className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      立即存檔
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">
                      <Music className="w-5 h-5 text-blue-500" />
                      音量設置
                    </h3>
                    
                    {[
                      { id: 'master', name: '主音量', icon: <Volume2 className="w-4 h-4 text-slate-400" /> },
                      { id: 'bgm', name: '背景音樂 (BGM)', icon: <Mic2 className="w-4 h-4 text-slate-400" /> },
                      { id: 'sfx', name: '效果音 (SFX)', icon: <Zap className="w-4 h-4 text-slate-400" /> },
                    ].map(vol => (
                      <div key={vol.id} className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                          <div className="flex items-center gap-2">
                            {vol.icon}
                            {vol.name}
                          </div>
                          <span className="font-mono text-blue-600">{(volumes as any)[vol.id]}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={(volumes as any)[vol.id]}
                          onChange={(e) => setVolumes(prev => ({ ...prev, [vol.id]: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-amber-500" />
                      遊戲性能與輔助
                    </h3>
                    <div className="space-y-4">
                       <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-slate-100 transition-all">
                          <div>
                            <p className="text-xs font-black text-slate-700">自動計算金額</p>
                            <p className="text-[10px] text-slate-400">POS機將自動填寫正確金額</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={autoAmountEnabled}
                            onChange={(e) => setAutoAmountEnabled(e.target.checked)}
                            className="w-5 h-5 accent-emerald-500"
                          />
                       </label>
                       <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-slate-100 transition-all">
                          <div>
                            <p className="text-xs font-black text-slate-700">快速出餐模式</p>
                            <p className="text-[10px] text-slate-400">啟用後收銀員將自動帶入餐點項目</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={autoOrderEnabled}
                            onChange={(e) => setAutoOrderEnabled(e.target.checked)}
                            className="w-5 h-5 accent-blue-500"
                          />
                       </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upgrades.filter(u => !u.id.startsWith('menu_')).map(upgrade => {
                  const cost = Math.round(upgrade.baseCost * Math.pow(1.5, upgrade.level));
                  const canAfford = money >= cost;
                  const isMaxed = upgrade.maxLevel !== undefined && upgrade.level >= upgrade.maxLevel;

                  const getUpgradeEffect = (id: string, currentLevel: number) => {
                    const next = currentLevel + 1;
                    switch(id) {
                      case 'premium': return `所有餐點與飲品價格提升至 ${(1 + next * 15)}%`;
                      case 'decor': return `吸引力提升，解鎖更多 VIP 並增加顧客耐心至 ${30 + next * 8}秒`;
                      case 'marketing': return `客人出現頻率提升 (目前加成: ${next * 500}ms)`;
                      default: return '';
                    }
                  };

                  return (
                    <div key={upgrade.id} className="group p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all flex flex-col h-full relative overflow-hidden">
                      {isMaxed && <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">已完成</div>}
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-4 rounded-2xl transition-all duration-500 ${isMaxed ? 'bg-blue-500 text-white' : canAfford ? 'bg-white shadow-md text-blue-600 scale-105' : 'bg-slate-200 text-slate-400 grayscale'}`}>
                          {upgrade.icon}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 leading-none mb-1">{upgrade.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                              {isMaxed ? 'Max' : `Lv.${upgrade.level}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6 flex-1">
                        <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">{upgrade.description}</p>
                        
                        {!isMaxed && (
                          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 border-dashed">
                             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">下級預載效益</span>
                             <div className="text-[11px] font-bold text-slate-600 leading-tight">
                               {getUpgradeEffect(upgrade.id, upgrade.level)}
                             </div>
                          </div>
                        )}
                      </div>
                      
                      {!isMaxed && (
                        <button
                          onClick={() => buyUpgrade(upgrade.id)}
                          disabled={!canAfford}
                          className={`
                            w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all
                            ${canAfford 
                              ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                          `}
                        >
                          <DollarSign className="w-4 h-4" />
                          ${cost} 升級
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex items-center gap-8">
                <div className="bg-white p-4 rounded-3xl shadow-amber-200 shadow-lg shrink-0">
                  <Zap className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-black text-amber-900 text-lg mb-2">經營建議</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    <li className="text-sm text-amber-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      在「員工招募」找專人幫忙。
                    </li>
                    <li className="text-sm text-amber-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      「廚師」等級越高收益越高。
                    </li>
                    <li className="text-sm text-amber-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      「收銀員」等級越高結帳越快
                    </li>
                    <li className="text-sm text-amber-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      招待 VIP 客人可獲得「全日收益加成」，最高累計至 +50%！
                    </li>
                    <li className="text-sm text-amber-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      「裝潢」等級越高，出現「VIP顧客」的機率越高。
                    </li>
                    <li className="text-sm text-amber-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      記得定時解鎖新餐點來豐富菜單！
                    </li>
                    <li className="text-sm text-amber-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      「上班族」點餐豪邁且小費豐厚，「學生」平價。
                    </li>
                    <li className="text-sm text-amber-800/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      招待「美食評論家」時要格外小心，他們的評價影響力巨大！
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Reset Button (Small) */}
        {(!isWorkHours && activeTab === 'game') ? null : (
          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
            {!isResetting ? (
              <button 
                onClick={() => setIsResetting(true)}
                className="text-[10px] font-bold text-slate-300 hover:text-red-400 tracking-widest uppercase transition-colors"
                id="reset-game-btn"
              >
                重置所有遊戲進度
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-red-50 px-6 py-3 rounded-2xl border border-red-100 animate-in fade-in zoom-in">
                <p className="text-xs font-black text-red-600 uppercase tracking-wider">確定要捨棄所有金幣與升級嗎？</p>
                <button 
                  onClick={() => setIsResetting(false)}
                  className="px-4 py-1.5 text-[10px] font-black bg-white text-slate-600 rounded-lg shadow-sm border border-slate-200"
                >
                  保留進度
                </button>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="px-4 py-1.5 text-[10px] font-black bg-red-600 text-white rounded-lg shadow-lg shadow-red-200"
                >
                  確認重置
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className={`
              px-6 py-3 rounded-full shadow-2xl border flex items-center gap-3 font-bold
              ${feedback.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'}
            `}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {feedback.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
