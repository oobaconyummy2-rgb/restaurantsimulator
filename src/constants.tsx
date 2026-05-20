import React from 'react';
import { 
  Utensils, 
  ShoppingBag, 
  Pizza, 
  Fish, 
  Soup, 
  Beef, 
  Cake, 
  IceCream, 
  Coffee, 
  ChefHat,
  TrendingUp, 
  Store, 
  Users, 
  CreditCard, 
  Trash2, 
  Flame, 
  ShieldCheck, 
  Camera, 
  Trophy, 
  Smile, 
  Zap,
  GraduationCap,
  Briefcase,
  Award,
  DollarSign,
  Sparkles,
  Heart,
  Clock
} from 'lucide-react';
import { FoodItem, Upgrade, Staff, GameEvent, Achievement, Skill } from './types';

export const FOOD_ITEMS: FoodItem[] = [
  { id: 'burger', name: '漢堡', price: 12, icon: <Utensils className="w-10 h-10" />, color: 'bg-orange-500', category: 'main' },
  { id: 'fries', name: '薯條', price: 6, icon: <ShoppingBag className="w-10 h-10" />, color: 'bg-yellow-400', category: 'main' },
  { id: 'pizza', name: '披薩', price: 18, icon: <Pizza className="w-10 h-10" />, color: 'bg-amber-500', category: 'main', requiredUpgradeId: 'menu_pizza' },
  { id: 'sushi', name: '壽司', price: 25, icon: <Fish className="w-10 h-10" />, color: 'bg-rose-400', category: 'main', requiredUpgradeId: 'menu_sushi' },
  { id: 'ramen', name: '拉麵', price: 20, icon: <Soup className="w-10 h-10" />, color: 'bg-indigo-500', category: 'main', requiredUpgradeId: 'menu_ramen' },
  { id: 'steak', name: '牛排', price: 35, icon: <Beef className="w-10 h-10" />, color: 'bg-red-800', category: 'main', requiredUpgradeId: 'menu_steak' },
  { id: 'cake', name: '蛋糕', price: 15, icon: <Cake className="w-10 h-10" />, color: 'bg-purple-400', category: 'main', requiredUpgradeId: 'menu_cake' },
  { id: 'icecream', name: '冰淇淋', price: 8, icon: <IceCream className="w-10 h-10" />, color: 'bg-pink-300', category: 'main', requiredUpgradeId: 'menu_icecream' },
  { id: 'pasta', name: '義大利麵', price: 16, icon: <Utensils className="w-10 h-10" />, color: 'bg-orange-400', category: 'main', requiredUpgradeId: 'menu_pasta' },
  { id: 'dimsum', name: '點心', price: 10, icon: <Soup className="w-10 h-10" />, color: 'bg-amber-300', category: 'main', requiredUpgradeId: 'menu_dimsum' },
  { id: 'taco', name: '塔可', price: 9, icon: <ShoppingBag className="w-10 h-10" />, color: 'bg-yellow-600', category: 'main', requiredUpgradeId: 'menu_taco' },
  { id: 'cola', name: '可樂', price: 4, icon: <Coffee className="w-10 h-10" />, color: 'bg-red-600', category: 'drink' },
  { id: 'tea', name: '綠茶', price: 3, icon: <Coffee className="w-10 h-10 text-green-200" />, color: 'bg-emerald-600', category: 'drink', requiredUpgradeId: 'menu_tea' },
  { id: 'juice', name: '果汁', price: 5, icon: <Coffee className="w-10 h-10 text-orange-200" />, color: 'bg-orange-400', category: 'drink', requiredUpgradeId: 'menu_juice' },
  { id: 'milktea', name: '珍奶', price: 7, icon: <Coffee className="w-10 h-10 text-amber-100" />, color: 'bg-amber-700', category: 'drink', requiredUpgradeId: 'menu_milktea' },
  { id: 'coffee', name: '黑咖啡', price: 6, icon: <Coffee className="w-10 h-10" />, color: 'bg-slate-700', category: 'drink', requiredUpgradeId: 'menu_coffee' },
  { id: 'smoothie', name: '水果冰沙', price: 9, icon: <IceCream className="w-10 h-10" />, color: 'bg-pink-400', category: 'drink', requiredUpgradeId: 'menu_smoothie' },
];

export const INITIAL_UPGRADES: Upgrade[] = [
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
  {id: 'menu_pasta', name: '解鎖：義大利麵', description: '菜單中加入義大利麵', baseCost: 180, level: 0, maxLevel: 1, icon: <Utensils className="w-5 h-5 text-orange-400" /> },
  {id: 'menu_dimsum', name: '解鎖：港式點心', description: '菜單中加入點心', baseCost: 220, level: 0, maxLevel: 1, icon: <Soup className="w-5 h-5 text-amber-300" /> },
  {id: 'menu_taco', name: '解鎖：墨西哥塔可', description: '菜單中加入塔可', baseCost: 160, level: 0, maxLevel: 1, icon: <ShoppingBag className="w-5 h-5 text-yellow-600" /> },
  {id: 'menu_coffee', name: '解鎖：豪華咖啡', description: '飲品中加入精品咖啡', baseCost: 140, level: 0, maxLevel: 1, icon: <Coffee className="w-5 h-5" /> },
  {id: 'menu_smoothie', name: '解鎖：水果冰沙', description: '飲品中加入冰沙', baseCost: 190, level: 0, maxLevel: 1, icon: <IceCream className="w-5 h-5 text-pink-400" /> },
  {id: 'decor', name: '店內裝修與裝潢', description: '提升餐廳吸引力，增加客人流量、滿意度與 VIP 比例。', baseCost: 150, level: 0, icon: <Store className="w-5 h-5" /> },
  { id: 'marketing', name: '增加餐廳曝光率', description: '客人出現的頻率提升。', baseCost: 200, level: 0, icon: <TrendingUp className="w-5 h-5" /> },
];

export const STAFF_SKILLS: Record<string, Skill[]> = {
  waiter: [
    { id: 'w_tip_1', name: '親切微笑', description: '小費機率 +10%', icon: <Smile className="w-4 h-4" />, cost: 1, level: 0, maxLevel: 3, unlocked: true },
    { id: 'w_speed_1', name: '快步疾走', description: '移動速度提升 (帶位更快)', icon: <Zap className="w-4 h-4" />, cost: 1, level: 0, maxLevel: 3, unlocked: true },
    { id: 'w_vip_1', name: '貴賓引導', description: 'VIP 出現機率額外 +5%', icon: <Zap className="w-4 h-4 text-amber-400" />, cost: 2, level: 0, maxLevel: 2, unlocked: false, requiredSkillId: 'w_tip_1' },
  ],
  cashier: [
    { id: 'ca_speed_1', name: '熟練算盤', description: '結帳速度提升 20%', icon: <Zap className="w-4 h-4" />, cost: 1, level: 0, maxLevel: 5, unlocked: true },
    { id: 'ca_math_1', name: '找零高手', description: '結帳時有 5% 機率多收入 10% 金額', icon: <DollarSign className="w-4 h-4" />, cost: 2, level: 0, maxLevel: 2, unlocked: true },
    { id: 'ca_auto_1', name: '全自動化', description: '結帳錯誤率降低', icon: <CreditCard className="w-4 h-4" />, cost: 1, level: 0, maxLevel: 1, unlocked: false, requiredSkillId: 'ca_speed_1' },
  ],
  chef: [
    { id: 'ch_price_1', name: '精湛刀工', description: '所有餐點售價 +5%', icon: <TrendingUp className="w-4 h-4" />, cost: 1, level: 0, maxLevel: 5, unlocked: true },
    { id: 'ch_quality_1', name: '黃金配方', description: '觸發「手藝加成」機率提升', icon: <Sparkles className="w-4 h-4" />, cost: 1, level: 0, maxLevel: 3, unlocked: true },
    { id: 'ch_fast_1', name: '快手廚師', description: '出餐速度提升', icon: <Flame className="w-4 h-4 text-orange-500" />, cost: 2, level: 0, maxLevel: 2, unlocked: false, requiredSkillId: 'ch_price_1' },
    { id: 'ch_preprep_1', name: '事前備料', description: '允許預先處理熱門餐點以提升服務速度與滿意度。', icon: <Clock className="w-4 h-4" />, cost: 3, level: 0, maxLevel: 1, unlocked: false, requiredSkillId: 'ch_quality_1' },
  ],
  host: [
    { id: 'h_patience_1', name: '安撫人心', description: '顧客初始耐心 +15%', icon: <Heart className="w-4 h-4 text-rose-500" />, cost: 1, level: 0, maxLevel: 5, unlocked: true },
    { id: 'h_queue_1', name: '隊伍管理', description: '客流量小幅提升', icon: <Users className="w-4 h-4" />, cost: 1, level: 0, maxLevel: 3, unlocked: true },
  ],
  cleaner: [
    { id: 'cl_speed_1', name: '旋風掃帚', description: '清理速度提升 15%', icon: <Zap className="w-4 h-4" />, cost: 1, level: 0, maxLevel: 5, unlocked: true },
    { id: 'cl_sparkle_1', name: '一塵不染', description: '桌子清理後滿意度提升', icon: <Sparkles className="w-4 h-4" />, cost: 2, level: 0, maxLevel: 1, unlocked: false, requiredSkillId: 'cl_speed_1' },
  ],
};

export const INITIAL_STAFF: Staff[] = [
  { id: 'waiter', name: '服務生', description: '負責帶位。等級越高小費越多；升級後可點擊客人進行『催促』加快用餐與買單！', baseCost: 50, level: 0, icon: <Users className="w-5 h-5" />, skillPoints: 0, skills: {} },
  { id: 'cashier', name: '收銀員', description: '等級 1 自動點單，等級 2 以上自動結帳。', baseCost: 200, level: 0, icon: <CreditCard className="w-5 h-5" />, skillPoints: 0, skills: {} },
  { id: 'chef', name: '廚師', description: '提升餐點售價。高等級可觸發手藝加成。', baseCost: 120, level: 0, icon: <ChefHat className="w-5 h-5" />, skillPoints: 0, skills: {} },
  { id: 'host', name: '接待員', description: '提升客人耐心。', baseCost: 150, level: 0, icon: <Store className="w-5 h-5" />, skillPoints: 0, skills: {} },
  { id: 'cleaner', name: '清潔工', description: '自動清理客人的桌子。等級越高清理速度越快。', baseCost: 80, level: 0, icon: <Trash2 className="w-5 h-5" />, skillPoints: 0, skills: { 'cl_speed_1': 5 } },
];

export const RANDOM_EVENTS: GameEvent[] = [
  { id: 'rush_hour', name: '用餐尖峰！', description: '一大群顧客正在湧入！客流量大幅增加。', color: 'bg-orange-600', effects: { spawnRateMod: 0.3 }, duration: 60, icon: <Users className="w-5 h-5" /> },
  { id: 'happy_hour', name: '歡樂時光 🍻', description: '飲料酒精類熱賣中！顧客耐心提升且小費增加。', color: 'bg-amber-500', effects: { patienceMod: 1.5, tipMod: 1.5, spawnRateMod: 0.8 }, duration: 45, icon: <Coffee className="w-5 h-5" /> },
  { id: 'kitchen_fire', name: '廚房意外 🔥', description: '廚房設備運作不順，出餐速度變慢，顧客耐心下降。', color: 'bg-red-600', effects: { patienceMod: 0.5, qualityMod: -1.5 }, duration: 45, icon: <Flame className="w-5 h-5" /> },
  { id: 'health_inspect', name: '衛生稽查 🚔', description: '稽查員在現場！餐點價格受限，但品質要求變高。', color: 'bg-blue-600', effects: { qualityMod: 1.0, priceMod: 0.8, tipMod: 0.5 }, duration: 40, icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 'celebrity', name: '名人光臨 ✨', description: '一位名人正在附近！這吸引了更多的 VIP 顧客與大筆小費。', color: 'bg-purple-600', effects: { spawnRateMod: 0.7, forceType: 'vip', tipMod: 2.0 }, duration: 50, icon: <Camera className="w-5 h-5" /> },
  { id: 'food_festival', name: '美食嘉年華 🎪', description: '全城美食舉辦美食嘉年華！客流量變大', color: 'bg-pink-600', effects: { spawnRateMod: 0.2, priceMod: 1.3, patienceMod: 0.7 }, duration: 60, icon: <Trophy className="w-5 h-5" /> },
  { id: 'influencer', name: '美食網紅打卡 📸', description: '評論影響力翻倍', color: 'bg-indigo-600', effects: { tipMod: 1.8, qualityMod: 0.5 }, duration: 45, icon: <Smile className="w-5 h-5" /> },
  { id: 'power_outage', name: '斷電 🌑', description: '餐廳陷入黑暗。顧客非常焦慮且不滿', color: 'bg-slate-800', effects: { patienceMod: 0.3, qualityMod: -2.0, spawnRateMod: 2.0 }, duration: 30, icon: <Zap className="w-5 h-5" /> }
];

export const CUSTOMER_TYPES = [
  { id: 'single', name: '單人顧客', icon: <Users className="w-5 h-5" />, minSize: 1, maxSize: 1 },
  { id: 'couple', name: '雙人顧客', icon: <Users className="w-5 h-5" />, minSize: 2, maxSize: 2 },
  { id: 'group', name: '三人顧客', icon: <Users className="w-5 h-5" />, minSize: 3, maxSize: 3 },
  { id: 'family', name: '家庭/四人顧客', icon: <Users className="w-5 h-5" />, minSize: 4, maxSize: 6 },
  { id: 'student', name: '學生', icon: <GraduationCap className="w-5 h-5" />, minSize: 1, maxSize: 2 },
  { id: 'executive', name: '上班族', icon: <Briefcase className="w-5 h-5" />, minSize: 1, maxSize: 1 },
  { id: 'critic', name: '美食評論家', icon: <Award className="w-5 h-5" />, minSize: 1, maxSize: 1 },
  { id: 'vip', name: 'VIP顧客', icon: <Zap className="w-5 h-5" />, minSize: 1, maxSize: 1, isVip: true },
];

export const LEVEL_PERKS = [
  { level: 5, name: '熟練經營', description: '營收加成 +10%', icon: <TrendingUp className="w-4 h-4" /> },
  { level: 10, name: '極速清潔', description: '翻桌清潔速度提升 25%', icon: <Sparkles className="w-4 h-4" /> },
  { level: 15, name: '顧客磁鐵', description: 'VIP 顧客出現機率提升 50%', icon: <Zap className="w-4 h-4" /> },
  { level: 20, name: '黃金耐心', description: '顧客等待耐心額外增加 20%', icon: <Heart className="w-4 h-4" /> },
  { level: 25, name: '品牌溢價', description: '所有餐點基礎售價提升 15%', icon: <DollarSign className="w-4 h-4" /> },
  { level: 30, name: '知名度巔峰', description: '活動觸發頻率提升 30%', icon: <Trophy className="w-4 h-4" /> },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_1000', name: '千金之軀', description: '總營收達到 $1,000', icon: <DollarSign className="w-5 h-5 text-emerald-500" />, check: (stats) => stats.totalEarned >= 1000 },
  { id: 'served_100', name: '人聲鼎沸', description: '服務超過 100 位顧客', icon: <Users className="w-5 h-5 text-blue-500" />, check: (stats) => stats.customersServed >= 100 },
  { id: 'pizza_master', name: '披薩大師', description: '解鎖披薩並獲得超過 50 次點單', icon: <Pizza className="w-5 h-5 text-amber-500" />, check: (_, __, updates) => (updates.find(u => u.id === 'menu_pizza')?.level || 0) > 0 },
  { id: 'staff_full', name: '團隊規模', description: '所有員工均至少達到等級 1', icon: <Briefcase className="w-5 h-5 text-indigo-500" />, check: (_, __, ___, staff) => staff.every(s => s.level >= 1) },
  { id: 'decor_pro', name: '五星裝潢', description: '店內裝修達到等級 5', icon: <Store className="w-5 h-5 text-purple-500" />, check: (_, __, upgrades) => (upgrades.find(u => u.id === 'decor')?.level || 0) >= 5 },
  { id: 'rich_tycoon', name: '億萬富翁', description: '當前持有金元達到 $5,000', icon: <Award className="w-5 h-5 text-yellow-500" />, check: (_, money) => money >= 5000 }
];
