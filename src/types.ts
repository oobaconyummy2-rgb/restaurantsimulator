import React from 'react';

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  color: string;
  category: 'main' | 'drink';
  requiredUpgradeId?: string;
}

export interface Order {
  id: string;
  items: string[];
  total: number;
  startTime: number;
  waitTime: number;
  customerType: string;
  groupSize: number;
  rating?: number;
  isVip: boolean;
  unitPrices?: Record<string, number>;
}

export interface MenuState {
  [itemId: string]: {
    priceMod: number;
    outOfStock: boolean;
  };
}

export interface ItemRating {
  totalStars: number;
  count: number;
  averageRating: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  check: (stats: any, money: number, upgrades: Upgrade[], staff: Staff[], menuState: MenuState) => boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  level: number;
  maxLevel?: number;
  icon: React.ReactNode;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  cost: number;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  effect?: (level: number) => any;
  requiredSkillId?: string;
  requiredStaffLevel?: number;
}

export interface Staff {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  level: number;
  icon: React.ReactNode;
  skillPoints: number;
  skills: Record<string, number>; // skillId -> level
}

export interface GameEvent {
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
  duration: number;
  icon: React.ReactNode;
}

export interface GameStats {
  totalEarned: number;
  customersServed: number;
  day: number;
  currentTime: number;
}

export interface DailyStats {
  customers: number;
  earnings: number;
  items: Record<string, number>;
  vipsServed: number;
  bonusMultiplier: number;
}

export interface GachaCard {
  id: string;
  name: string;
  rarity: 'R' | 'S' | 'SR' | 'SSR';
  professionId: string;
  description: string;
  buffLabel: string;
  stats: {
    staffLevelBonus?: number;
    extraTipChance?: number;
    extraSpeed?: number;
    priceMod?: number;
    patienceMod?: number;
    spawnRateBonus?: number;
  };
}

export interface DailyQuest {
  id: string;
  description: string;
  target: number;
  current: number;
  rewardGems: number;
  completed: boolean;
  claimed: boolean;
}


