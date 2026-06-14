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
import { FoodItem, Upgrade, Staff, GameEvent, Achievement, Skill, GachaCard } from './types';

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
  { id: 'menu_cake', name: '解鎖：蛋糕', description: '菜單中加入蛋糕', baseCost: 250, level: 0, maxLevel: 1, icon: <Cake className="w-5 h-5" /> },
  { id: 'menu_tea', name: '解鎖：綠茶', description: '飲品中加入綠茶', baseCost: 100, level: 0, maxLevel: 1, icon: <Coffee className="w-5 h-5 text-green-400" /> },
  { id: 'menu_juice', name: '解鎖：果汁', description: '飲品中加入果汁', baseCost: 180, level: 0, maxLevel: 1, icon: <Coffee className="w-5 h-5 text-orange-400" /> },
  { id: 'menu_milktea', name: '解鎖：珍奶', description: '飲品中加入珍奶', baseCost: 300, level: 0, maxLevel: 1, icon: <Coffee className="w-5 h-5 text-amber-600" /> },
  { id: 'menu_pasta', name: '解鎖：義大利麵', description: '菜單中加入義大利麵', baseCost: 180, level: 0, maxLevel: 1, icon: <Utensils className="w-5 h-5 text-orange-400" /> },
  { id: 'menu_dimsum', name: '解鎖：港式點心', description: '菜單中加入點心', baseCost: 220, level: 0, maxLevel: 1, icon: <Soup className="w-5 h-5 text-amber-300" /> },
  { id: 'menu_taco', name: '解鎖：墨西哥塔可', description: '菜單中加入塔可', baseCost: 160, level: 0, maxLevel: 1, icon: <ShoppingBag className="w-5 h-5 text-yellow-600" /> },
  { id: 'menu_coffee', name: '解鎖：豪華咖啡', description: '飲品中加入精品咖啡', baseCost: 140, level: 0, maxLevel: 1, icon: <Coffee className="w-5 h-5" /> },
  { id: 'menu_smoothie', name: '解鎖：水果冰沙', description: '飲品中加入冰沙', baseCost: 190, level: 0, maxLevel: 1, icon: <IceCream className="w-5 h-5 text-pink-400" /> },
  { id: 'decor', name: '店內裝修與裝潢', description: '提升餐廳吸引力，增加客人流量、滿意度與 VIP 比例。', baseCost: 150, level: 0, icon: <Store className="w-5 h-5" /> },
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
  { id: 'pizza_master', name: '披薩大師', description: '解鎖披薩並獲得超過 50 次點單', icon: <Pizza className="w-5 h-5 text-amber-500" />, check: (_, __, upgrades) => (upgrades.find(u => u.id === 'menu_pizza')?.level || 0) > 0 },
  { id: 'staff_full', name: '團隊規模', description: '所有員工均至少達到等級 1', icon: <Briefcase className="w-5 h-5 text-indigo-500" />, check: (_, __, ___, staff) => staff.every(s => s.level >= 1) },
  { id: 'decor_pro', name: '五星裝潢', description: '店內裝修達到等級 5', icon: <Store className="w-5 h-5 text-purple-500" />, check: (_, __, upgrades) => (upgrades.find(u => u.id === 'decor')?.level || 0) >= 5 },
  { id: 'rich_tycoon', name: '億萬富翁', description: '當前持有金元達到 $5,000', icon: <Award className="w-5 h-5 text-yellow-500" />, check: (_, money) => money >= 5000 }
];

export const GACHA_CARDS: GachaCard[] = [
  // ==================== 1. 餐廳設備 (equipment) ====================
  // 高級烤箱 (oven)
  { id: 'oven_r_1', name: '簡易陶瓷披薩烤箱', rarity: 'R', professionId: 'equipment', description: '入門款陶瓷烤圈，導熱均勻但聚溫一般。可為食物增色。', buffLabel: '食物星級約 +0.3 ★ & 製作速率 +10%', stats: { extraSpeed: 0.1, priceMod: 0.03 } },
  { id: 'oven_s_1', name: '雙層熱風熱流烤箱', rarity: 'S', professionId: 'equipment', description: '自帶雙通風循環，烤出的麵包與披薩受熱均勻，外酥內嫩。', buffLabel: '食物星級約 +0.6 ★ & 製作速率 +20%', stats: { extraSpeed: 0.2, priceMod: 0.06 } },
  { id: 'oven_sr_1', name: '智能觸控高精溫控烤箱', rarity: 'SR', professionId: 'equipment', description: '微電腦全自動恆溫，自帶蒸汽微噴。出爐瞬間香氣鋪鼻。', buffLabel: '食物星級約 +0.9 ★ & 製作速率 +35%', stats: { extraSpeed: 0.35, priceMod: 0.12 } },
  { id: 'oven_ssr_1', name: '【廚神御用】太空金屬粒子烤爐', rarity: 'SSR', professionId: 'equipment', description: '超輕合金複合艙體，利用高能迴旋粒子瞬間滲透美味。', buffLabel: '食物星級約 +1.3 ★ & 製作速率 +50% & 全營收 +18%', stats: { extraSpeed: 0.5, priceMod: 0.18 } },

  // 自動洗碗機 (dishwasher)
  { id: 'dishwasher_r_1', name: '家用超聲波洗碗槽', rarity: 'R', professionId: 'equipment', description: '比純手洗稍微省心，利用高頻震落頑固油脂。', buffLabel: '服務星級約 +0.2 ★ & 翻桌清理速度 +15%', stats: { extraSpeed: 0.15 } },
  { id: 'dishwasher_s_1', name: '商用高頻旋流水力噴淋機', rarity: 'S', professionId: 'equipment', description: '商用升級款，加壓水柱一鍵出泡快洗，洗淨效率翻倍。', buffLabel: '服務星級約 +0.4 ★ & 翻桌清理速度 +30%', stats: { extraSpeed: 0.30 } },
  { id: 'dishwasher_sr_1', name: '奈米高溫蒸汽除菌洗碗大師', rarity: 'SR', professionId: 'equipment', description: '80度熱浪烘乾與奈米粒子殺菌，潔淨無瑕。', buffLabel: '服務星級約 +0.7 ★ & 翻桌清理速度 +45%', stats: { extraSpeed: 0.45 } },
  { id: 'dishwasher_ssr_1', name: '【閃電流轉】量子重力光速洗滌艙', rarity: 'SSR', professionId: 'equipment', description: '使用力學重置光束，在一微秒之內分子級剝落所有髒污不留水痕。', buffLabel: '服務星級約 +1.1 ★ & 翻桌清理速度 +70%', stats: { extraSpeed: 0.70 } },

  // 輔助收銀機 (register)
  { id: 'register_r_1', name: '語音出單播報收銀機', rarity: 'R', professionId: 'equipment', description: '自動朗讀明細與交易款項，減少工作人員核對與漏單流程。', buffLabel: '服務星級約 +0.2 ★ & 結帳速度 +20%', stats: { extraSpeed: 0.20 } },
  { id: 'register_s_1', name: '雙重智能打票POS機', rarity: 'S', professionId: 'equipment', description: '快捷一鍵輸入與高速雲端出單打印，大幅提升結算流暢感。', buffLabel: '服務星級約 +0.4 ★ & 結帳速度 +40%', stats: { extraSpeed: 0.40 } },
  { id: 'register_sr_1', name: 'AI視覺全自動收銀系統', rarity: 'SR', professionId: 'equipment', description: '採用先進光學傳感器完美對焦辨識商品，免人工手動錄入。', buffLabel: '服務星級約 +0.7 ★ & 結帳速度 +70%', stats: { extraSpeed: 0.70 } },
  { id: 'register_ssr_1', name: '【創世未來】分子智能結算終端', rarity: 'SSR', professionId: 'equipment', description: '加載高能粒子雷射，在結帳處縈繞斑斕流光，引聚海量小費與極速結帳！', buffLabel: '服務星級約 +1.1 ★ & 結帳速度 +90% & 小費機率 +15%', stats: { extraSpeed: 0.90, extraTipChance: 0.15 } },

  // 高級冰箱 (fridge)
  { id: 'fridge_r_1', name: '商用單門保鮮冰箱', rarity: 'R', professionId: 'equipment', description: '基本恆溫保鮮，保證食材新鮮不過期。', buffLabel: '食物星級約 +0.2 ★ & 顧客初始耐心 +10%', stats: { patienceMod: 0.10 } },
  { id: 'fridge_s_1', name: '超大分區風冷無霜展示櫃', rarity: 'S', professionId: 'equipment', description: '保鮮度優良，不形成冰霜，且極度省電低震動。', buffLabel: '食物星級約 +0.5 ★ & 顧客初始耐心 +18%', stats: { patienceMod: 0.18 } },
  { id: 'fridge_sr_1', name: '零度保濕分子靜息保鮮櫃', rarity: 'SR', professionId: 'equipment', description: '鎖死水分流失！食材在極限冷鮮下一整天宛如剛採摘。', buffLabel: '食物星級約 +0.8 ★ & 顧客初始耐心 +28%', stats: { patienceMod: 0.28 } },
  { id: 'fridge_ssr_1', name: '【生命原力】液氮零下分子熟成庫', rarity: 'SSR', professionId: 'equipment', description: '採用絕對低溫，在分子級凍結食材老化同時進行極限熟成提鮮。', buffLabel: '食物星級約 +1.2 ★ & 顧客初始耐心 +40% & 售價 +10%', stats: { patienceMod: 0.40, priceMod: 0.10 } },


  // ==================== 2. 全新技能卡 (skills) ====================
  // 尖峰時段 (peak_hour)
  { id: 'peak_hour_r_1', name: '「技能」街頭大喇叭午間廣播', rarity: 'R', professionId: 'skills', description: '在門口安置大聲公，不斷循環宣傳。', buffLabel: '客流量生成速度 +10%', stats: { spawnRateBonus: 0.10 } },
  { id: 'peak_hour_s_1', name: '「技能」派單突擊小分隊之術', rarity: 'S', professionId: 'skills', description: '派遣員工去附近寫字樓 and 商場發放折價宣傳單。', buffLabel: '客流量生成速度 +20%', stats: { spawnRateBonus: 0.20 } },
  { id: 'peak_hour_sr_1', name: '「技能」特色鑼鼓舞獅攬客大作戰', rarity: 'SR', professionId: 'skills', description: '在街頭組織熱鬧的舞獅表演，圍觀客流量如潮水湧入。', buffLabel: '客流量生成速度 +35%', stats: { spawnRateBonus: 0.35 } },
  { id: 'peak_hour_ssr_1', name: '【客流風暴】全球社群平台頂流引爆', rarity: 'SSR', professionId: 'skills', description: '千萬級網紅爭相來探店打卡，全網引爆超級熱度排隊風暴！', buffLabel: '客流量生成速度 +50% & 滿意度 +10%', stats: { spawnRateBonus: 0.50, priceMod: 0.05 } },

  // 大胃王挑戰 (glutton)
  { id: 'glutton_r_1', name: '「技能」巨無霸漢堡速食PK賽', rarity: 'R', professionId: 'skills', description: '小活動挑動食慾，顧客不知不覺消費更多。', buffLabel: '平均客單價 +5%', stats: { priceMod: 0.05 } },
  { id: 'glutton_s_1', name: '「技能」大碗寬麵大肚王克星賽', rarity: 'S', professionId: 'skills', description: '店內主推豪華大份量套餐，激發顧客的終極戰鬥力。', buffLabel: '平均客單價 +10%', stats: { priceMod: 0.10 } },
  { id: 'glutton_sr_1', name: '「技能」熔岩爆辣魔王牛排大對決', rarity: 'SR', professionId: 'skills', description: '牛排香氣瀰漫全店，大家都忍不住點大份，小費飆升。', buffLabel: '平均客單價 +15% & 小費機率 +10%', stats: { priceMod: 0.15, extraTipChance: 0.10 } },
  { id: 'glutton_ssr_1', name: '【奢華盛宴】皇家滿漢海陸盛宴爭奪戰', rarity: 'SSR', professionId: 'skills', description: '主推夢幻頂級大餐，顧客滿意並大快朵頤。平均客單價 +22% & 小費機率 +15%', buffLabel: '平均客單價 +22% & 小費機率 +15%', stats: { priceMod: 0.22, extraTipChance: 0.15 } },


  // ==================== 3. 裝飾 (decor) ====================
  // 牆壁壁紙 (wallpaper)
  { id: 'wallpaper_r_1', name: '簡約溫馨碎花牆紙', rarity: 'R', professionId: 'decor', description: '溫馨淡雅的手繪碎花，能讓進店的顧客感到放鬆。', buffLabel: '布置星級約 +0.1 ★ & 顧客耐心 +10%', stats: { patienceMod: 0.10 } },
  { id: 'wallpaper_s_1', name: '英倫復古紅磚貼面', rarity: 'S', professionId: 'decor', description: '帶有工業風與典雅設計感的復古紅磚，格調拉滿。', buffLabel: '布置星級約 +0.3 ★ & 顧客耐心 +18%', stats: { patienceMod: 0.18 } },
  { id: 'wallpaper_sr_1', name: '極簡北歐白大理石牆紙', rarity: 'SR', professionId: 'decor', description: '冰裂紋大理石質感，透出高貴不凡與自然靈氣。', buffLabel: '布置星級約 +0.5 ★ & 顧客耐心 +28%', stats: { patienceMod: 0.28 } },
  { id: 'wallpaper_ssr_1', name: '【繁星漫步】裸眼 3D 銀河流光動態牆繪', rarity: 'SSR', professionId: 'decor', description: '動態光影交錯，點點繁星流瀉，給顧客置身宇航太空般的頂奢感。', buffLabel: '布置星級約 +0.8 ★ & 顧客耐心 +30% & 營收 +5%', stats: { patienceMod: 0.30, priceMod: 0.05 } },

  // 招牌 (sign)
  { id: 'sign_r_1', name: '「布置」文青溫馨彩繪手搖粉筆繪板', rarity: 'R', professionId: 'decor', description: '手寫粉筆配菜單，溫馨文雅，路過都會駐足。', buffLabel: '布置星級約 +0.2 ★ & 客流量 +5%', stats: { spawnRateBonus: 0.05 } },
  { id: 'sign_s_1', name: '「布置」流金歲月電鍍霓虹炫彩字牌', rarity: 'S', professionId: 'decor', description: '閃爍亮麗的彩虹流光字：【歡迎光臨】，黑夜裡分外吸睛。', buffLabel: '布置星級約 +0.5 ★ & 客流量 +12%', stats: { spawnRateBonus: 0.12 } },
  { id: 'sign_sr_1', name: '「布置」3D 空氣懸浮激光粒子投影看板', rarity: 'SR', professionId: 'decor', description: '一塊在空中發光旋轉的立體 3D 美食圖章看板，引爆街頭圍觀。', buffLabel: '布置星級約 +0.8 ★ & 客流量 +22%', stats: { spawnRateBonus: 0.22 } },
  { id: 'sign_ssr_1', name: '【星塵幻幕】萬華巨幅雷射射頻無感招貼', rarity: 'SSR', professionId: 'decor', description: '全光學等離子巨幕，散發吸引路人口味的星空引力，進店率達歷史極限！', buffLabel: '布置星級約 +1.2 ★ & 客流量 +35% & 售價 +5%', stats: { spawnRateBonus: 0.35, priceMod: 0.05 } },

  // 員工服裝 (uniform)
  { id: 'uniform_r_1', name: '「布置」卡其棉質休閒圍裙帽子組', rarity: 'R', professionId: 'decor', description: '整齊劃一的圍裙與球帽，大方利索。', buffLabel: '布置星級約 +0.1 ★ & 全員移速 +5%', stats: { extraSpeed: 0.05 } },
  { id: 'uniform_s_1', name: '「布置」日式和風純麻和式作務衣', rarity: 'S', professionId: 'decor', description: '採用東方傳統布織，具有靜謐低調的和風禪境，令人心折。', buffLabel: '布置星級約 +0.2 ★ & 全員移速 +12%', stats: { extraSpeed: 0.12 } },
  { id: 'uniform_sr_1', name: '「布置」黃銅機械蒸氣龐克工作服', rarity: 'SR', professionId: 'decor', description: '護目鏡、銅質齒輪跟背帶，有一種瘋狂發明家的硬派帥感。', buffLabel: '布置星級約 +0.4 ★ & 全員移速 +20%', stats: { extraSpeed: 0.20 } },
  { id: 'uniform_ssr_1', name: '【流光鎧影】創世液態纖光超阻納戰袍', rarity: 'SSR', professionId: 'decor', description: '光纖導線隨著員工心跳同步呼吸流動，穿戴後跑動起來有殘影特效。', buffLabel: '布置星級約 +0.7 ★ & 全員速 +30% & 滿意度加成', stats: { extraSpeed: 0.30, priceMod: 0.05 } },


  // ==================== 4. 職別與店長專業裝備/特權/證照 (waiter, cashier, chef, host, cleaner, manager) ====================
  // 廚師裝備 (chef)
  { id: 'chef_r_1', name: '「主廚裝備」專業不鏽鋼料理刀', rarity: 'R', professionId: 'chef', description: '出色而簡潔的鍛造刀，雖然基礎但鋒利，能顯著提昇切菜備膳流暢度。', buffLabel: '全店出餐與備料速度 +5% & 全店餐點售價 +2%', stats: { extraSpeed: 0.05, priceMod: 0.02 } },
  { id: 'chef_s_1', name: '「主廚裝備」恆溫微電腦真空低溫慢煮機', rarity: 'S', professionId: 'chef', description: '精準溫控慢煮，水流迴旋導熱完美鎖水，使肉類料理更加鮮嫩多汁。', buffLabel: '全店出餐與備料速度 +12% & 全店餐點售價 +5%', stats: { extraSpeed: 0.12, priceMod: 0.05 } },
  { id: 'chef_sr_1', name: '「主廚裝備」多功能奈米全能料理機器人', rarity: 'SR', professionId: 'chef', description: '高科技一體化自動料理機，揉麵、切碎、翻炒全能搞定，釋放主廚雙手。', buffLabel: '全店出餐與備料速度 +22% & 全店餐點售價 +10%', stats: { extraSpeed: 0.22, priceMod: 0.10 } },
  { id: 'chef_ssr_1', name: '【主廚神話】反物質超光速分子料理工作站', rarity: 'SSR', professionId: 'chef', description: '頂級太空科技量子控溫，進行粒子級食材熟成與風味微波，打造五星絕世口感！', buffLabel: '全店出餐與備料速度 +35% & 全店餐點售價 +16% & 小費機率 +10%', stats: { extraSpeed: 0.35, priceMod: 0.16, extraTipChance: 0.10 } },

  // 服務生裝備 (waiter)
  { id: 'waiter_r_1', name: '「服務裝備」符合人體工學智慧防滑托盤', rarity: 'R', professionId: 'waiter', description: '防滑矽膠塗層，底座極佳避震，不擔心打翻，大幅提升端菜自信。', buffLabel: '服務生移動速度 +5%', stats: { extraSpeed: 0.05 } },
  { id: 'waiter_s_1', name: '「服務裝備」碳纖維避震高彈氣墊跑鞋', rarity: 'S', professionId: 'waiter', description: '輕量化碳纖維彈力中底，每一步都能獲得額外推進力，穿梭大廳如履平地。', buffLabel: '服務生移動速度 +12% & 全局顧客初始耐心 +8%', stats: { extraSpeed: 0.12, patienceMod: 0.08 } },
  { id: 'waiter_sr_1', name: '「服務裝備」智能全息點單手環與骨傳導耳機', rarity: 'SR', professionId: 'waiter', description: '點單直接雲端同步廚房排單，骨傳導呼叫免除噪音干擾，大廳通訊的核心。', buffLabel: '服務生催促效率 +20% & 全店餐點售價 +8% & 小費機率 +10%', stats: { extraSpeed: 0.20, priceMod: 0.08, extraTipChance: 0.10 } },
  { id: 'waiter_ssr_1', name: '【服務神話】量子力學重力懸浮滑板與氣動外骨骼', rarity: 'SSR', professionId: 'waiter', description: '零阻力懸浮於地表，自帶大腦意念導航，大廳穿梭僅留下一道流光殘影，極速至極！', buffLabel: '服務生移動/清潔翻桌速度 +35% & 顧客耐心 +25% & 小費機率 +15%', stats: { extraSpeed: 0.35, patienceMod: 0.25, extraTipChance: 0.15 } },

  // 收銀員裝備 (cashier)
  { id: 'cashier_r_1', name: '「收銀裝備」多功能手持紅外線掃碼槍', rarity: 'R', professionId: 'cashier', description: '具備寬幅高解析度解碼感應，秒讀斑駁螢幕，結帳不再排隊。', buffLabel: '全店結帳出單速度 +5% & 小費加成 +3%', stats: { extraSpeed: 0.05, extraTipChance: 0.03 } },
  { id: 'cashier_s_1', name: '「收銀裝備」雙面液晶觸控式點單一體機', rarity: 'S', professionId: 'cashier', description: '顧客可同步預覽菜單與價格，流暢度大幅提升，減少找零糾紛。', buffLabel: '全店結帳速度 +12% & 全店餐點售價 +5%', stats: { extraSpeed: 0.12, priceMod: 0.05 } },
  { id: 'cashier_sr_1', name: '「收銀裝備」奈米滾輪專用點鈔除塵機', rarity: 'SR', professionId: 'cashier', description: '機械式高速抓取紙鈔，秒辨真偽同時進行紫外線消殺，保障營收萬無一失。', buffLabel: '全店結帳與收銀速度 +22% & 全店餐點售價 +8% & 小費機率 +5%', stats: { extraSpeed: 0.22, priceMod: 0.08, extraTipChance: 0.05 } },
  { id: 'cashier_ssr_1', name: '【收銀神話】超維度光學掌靜脈無感自動結算台', rarity: 'SSR', professionId: 'cashier', description: '利用暗物質掌靜脈掃瞄，顧客甚至無須掏出皮夾，跨過收銀線瞬間即刻秒速結算完畢！', buffLabel: '全店收銀速度 +35% & 全店餐點售價 +15% & 小費機率 +15%', stats: { extraSpeed: 0.35, priceMod: 0.15, extraTipChance: 0.15 } },

  // 接待員裝備 (host)
  { id: 'host_r_1', name: '「接待裝備」不鏽鋼鋼索排隊引導隔離帶', rarity: 'R', professionId: 'host', description: '穩重的鑄鐵底座配上防滑隔離帶，讓等候隊伍井然有序，安撫焦慮情緒。', buffLabel: '排隊顧客初始耐心 +10% & VIP顧客出現機率 +3%', stats: { patienceMod: 0.10, extraTipChance: 0.03 } },
  { id: 'host_s_1', name: '「接待裝備」智能迎賓大聲公與感應歡迎地毯', rarity: 'S', professionId: 'host', description: '踩下地毯自動觸發清脆悅耳的「歡迎光臨」，自帶和藹立體環繞音效。', buffLabel: '排隊顧客初始耐心 +18% & 客流量生成速度 +10%', stats: { patienceMod: 0.18, spawnRateBonus: 0.10 } },
  { id: 'host_sr_1', name: '「接待裝備」5G多語種觸控自助候位預約機', rarity: 'SR', professionId: 'host', description: '自助點擊領號碼牌，排隊狀態即時傳送手機，顯著減輕排隊焦躁感與客流流失。', buffLabel: '排隊顧客初始耐心 +28% & 客流量生成速度 +18% & 全員虛擬等級 +1', stats: { patienceMod: 0.28, spawnRateBonus: 0.18, staffLevelBonus: 1 } },
  { id: 'host_ssr_1', name: '【接待神話】超空間全息迎賓投影柱與擬真管家', rarity: 'SSR', professionId: 'host', description: '折射出絕美夢幻的全息尊榮管家，完美安撫等位顧客，尊貴無比，驚艷整條街區！', buffLabel: '顧客耐心 +30% & VIP概率 +15%', stats: { patienceMod: 0.30, extraTipChance: 0.15, staffLevelBonus: 2 } },

  // 清潔工裝備 (cleaner)
  { id: 'cleaner_r_1', name: '「清潔裝備」超細纖維吸水奈米科技魔術拖把', rarity: 'R', professionId: 'cleaner', description: '採用獨家專利奈米絨，一拖即乾，不留任何水漬，瞬間完成大堂去汙。', buffLabel: '清潔翻桌效率 +10% & 全體員工虛擬等級 +1', stats: { extraSpeed: 0.10, staffLevelBonus: 1 } },
  { id: 'cleaner_s_1', name: '「清潔裝備」高溫高壓蒸汽無縫消殺噴槍', rarity: 'S', professionId: 'cleaner', description: '釋放百度高溫無水乾蒸汽，秒速瓦解死角的頑固焦油與油污。', buffLabel: '清潔翻桌效率 +20% & 全店餐點售價 +5%', stats: { extraSpeed: 0.20, priceMod: 0.05 } },
  { id: 'cleaner_sr_1', name: '「清潔裝備」紫外線除味消殺負離子空氣網', rarity: 'SR', professionId: 'cleaner', description: '主動式吸附大堂煙霧與異味，除菌率達99.9%，空氣清新如雨後森林。', buffLabel: '清潔翻桌效率 +30% & 顧客初始耐心 +15%', stats: { extraSpeed: 0.30, patienceMod: 0.15 } },
  { id: 'cleaner_ssr_1', name: '【清潔神話】超靜音量子粒子重力吸落掃地姬', rarity: 'SSR', professionId: 'cleaner', description: '利用重力場引力改變髒污結構，微秒級吸除桌面、地板與空氣中的灰塵盤盞，一塵不染！', buffLabel: '清潔經理虛擬等級 +3 & 清潔效率 +35%', stats: { extraSpeed: 0.35, staffLevelBonus: 3 } },

  // 店長裝備 (manager)
  { id: 'manager_r_1', name: '「經營證照」實用營運與利潤管理速成手冊', rarity: 'R', professionId: 'manager', description: '涵蓋基礎店務排班、成本優化與口碑營利心得，新手店長之友。', buffLabel: '客流量生成速度 +5%', stats: { spawnRateBonus: 0.05 } },
  { id: 'manager_r_2', name: '「辦公裝備」精裝黃金發光水晶招財貓', rarity: 'R', professionId: 'manager', description: '水晶折射出迷人財運金光，傳奇的大吉招財加之萌系外觀完美招攬眼球。', buffLabel: '排隊顧客初始耐心 +10%', stats: { patienceMod: 0.10 } },
  { id: 'manager_s_1', name: '「經營特權」頂級生態農場契合直供協議', rarity: 'S', professionId: 'manager', description: '直配最鮮美的非基改有機蔬果 and 高級肉品，使店內餐點售價溢價飆升。', buffLabel: '全店餐點售價 +8%', stats: { priceMod: 0.08 } },
  { id: 'manager_s_2', name: '「辦公裝備」店長專用高性能賽車電競椅', rarity: 'S', professionId: 'manager', description: '酷炫外觀，超強腰托，坐上後精力無限，全店督導效率加倍。', buffLabel: '全體移動與管理速度 +12%', stats: { extraSpeed: 0.12 } },
  { id: 'manager_sr_1', name: '「經營特權」知名吃播網紅打卡引流邀請函', rarity: 'SR', professionId: 'manager', description: '邀請一線美食博主與千萬級網紅親自探店，在社群平台掀起排隊熱潮。', buffLabel: '小費加倍機率 +20%', stats: { extraTipChance: 0.20 } },
  { id: 'manager_sr_2', name: '「經營特權」一站式全自動智能保養工具箱', rarity: 'SR', professionId: 'manager', description: '店務保養、廚具校正一氣痕成，全體店員在此精細保養加持下幹勁十足。', buffLabel: '全體員工虛擬等級 +1', stats: { staffLevelBonus: 1 } },
  { id: 'manager_sr_3', name: '「辦公裝備」舒緩心神茉莉精油高級香薰機', rarity: 'SR', professionId: 'manager', description: '高頻超聲波霧化幽香，令人心神安定。顧客在香氛縈繞下等待耐心狂增。', buffLabel: '排隊顧客初始耐心 +25%', stats: { patienceMod: 0.25 } },
  { id: 'manager_ssr_1', name: '【經營神話】哈佛商學院大師級跨國經營祕籍', rarity: 'SSR', professionId: 'manager', description: '世界級殿堂戰略教材，將排隊、廚備、品控、收銀之策提升到前所未見的全新高度！', buffLabel: '全體員工虛擬等級 +3 & 全店餐點售價 +15%', stats: { staffLevelBonus: 3, priceMod: 0.15 } },
  { id: 'manager_ssr_2', name: '【店長天賦】神機妙算高級行銷管理決策矩陣儀', rarity: 'SSR', professionId: 'manager', description: '超強AI算力協助即時營控調度，點石成金般化解各種用餐疑難雜症。', buffLabel: '全體員工虛擬等級 +3 & 初始等待耐心 +30%', stats: { staffLevelBonus: 3, patienceMod: 0.30 } },
  { id: 'manager_ssr_3', name: '【店長特權】奢華至臻招牌加盟連鎖授權王座', rarity: 'SSR', professionId: 'manager', description: '座下是榮耀！帝王般全局俯瞰調配，使客流量與口碑達到完美的極緻巔峰！', buffLabel: '全體員工虛擬等級 +4 & 全店客生成流量 +25%', stats: { staffLevelBonus: 4, spawnRateBonus: 0.25 } }
];
