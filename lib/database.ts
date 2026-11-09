// Local database simulation - in production, you'd use a real database

export const MENU_TYPES = ['breakfast', 'lunch', 'happy-hour', 'dinner'] as const;
export type MenuType = (typeof MENU_TYPES)[number];

export const MENU_LABELS: Record<MenuType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  'happy-hour': 'Happy Hour',
  dinner: 'Dinner',
};

export function isMenuType(value: string): value is MenuType {
  return (MENU_TYPES as readonly string[]).includes(value);
}

export function menuTypeLabel(menuType: string): string {
  if (isMenuType(menuType)) return MENU_LABELS[menuType];
  return menuType.charAt(0).toUpperCase() + menuType.slice(1);
}

export function compareMenuTypes(a: string, b: string): number {
  const rank = (menuType: string) => {
    const index = MENU_TYPES.indexOf(menuType as MenuType);
    // Unknown keys sort after the known service order, never before it.
    return index === -1 ? MENU_TYPES.length : index;
  };
  return rank(a) - rank(b);
}

/** Stable public/CMS tab order: breakfast → lunch → happy-hour → dinner */
export function sortMenuTypes<T extends string>(menuTypes: T[]): T[] {
  return [...menuTypes].sort(compareMenuTypes);
}

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  menuType: MenuType;
  imageUrl?: string;
  isAvailable: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  menuType: MenuType;
  displayOrder: number;
  createdAt: Date;
}

export interface MenuStatus {
  id: string;
  menuType: MenuType;
  isEnabled: boolean;
  updatedAt: Date;
}

export interface RestaurantHours {
  id: string;
  dayOfWeek: string;
  // Breakfast service hours
  isBreakfastService: boolean;
  breakfastOpenTime?: string;
  breakfastCloseTime?: string;
  // Lunch service hours
  isLunchService: boolean;
  lunchOpenTime?: string;
  lunchCloseTime?: string;
  // Happy hour service hours
  isHappyHourService: boolean;
  happyHourOpenTime?: string;
  happyHourCloseTime?: string;
  // Dinner service hours
  isDinnerService: boolean;
  dinnerOpenTime?: string;
  dinnerCloseTime?: string;
  // Legacy fields (for backwards compatibility)
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'editor';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Accolade {
  id: string;
  title: string;
  description: string;
  link?: string;
  images: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChefBio {
  id: string;
  name: string;
  role: string;
  title: string;
  quote: string;
  bio: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage (replace with actual database in production)
const menuItems: MenuItem[] = [
  // Sample Lunch Menu
  {
    id: '1',
    title: 'Korean Rice Bowl',
    description: 'Traditional bibimbap with seasonal vegetables, choice of bulgogi beef or grilled tofu',
    price: 18,
    category: 'Main Course',
    menuType: 'lunch',
    imageUrl: '/uploads/menu-1759001579359.png', // Using the uploaded image
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2', 
    title: 'Kimchi Fried Rice',
    description: 'House-made kimchi with jasmine rice, topped with a sunny-side egg',
    price: 16,
    category: 'Main Course',
    menuType: 'lunch',
    imageUrl: '/uploads/menu-1759001579359.png', // Using the uploaded image
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Korean Chicken Sandwich',
    description: 'Crispy fried chicken thigh with gochujang aioli, pickled vegetables on brioche',
    price: 19,
    category: 'Main Course', 
    menuType: 'lunch',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Sample Dinner Menu
  {
    id: '4',
    title: 'Dry Aged New York Steak',
    description: '14oz prime cut served with seasonal banchan and gochujang compound butter',
    price: 65,
    category: 'Main Course',
    menuType: 'dinner',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    title: 'Whole Brazino',
    description: 'Grilled whole fish with Korean pear, scallion oil, and seasonal vegetables',
    price: 58,
    category: 'Main Course',
    menuType: 'dinner', 
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    title: 'Seafood Jeon',
    description: 'Traditional Korean pancake with fresh Pacific Northwest seafood and perilla leaves',
    price: 28,
    category: 'Appetizer',
    menuType: 'dinner',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Sample wine/beverage items without images
  {
    id: '7',
    title: '2021 Two Vintners Syrah',
    description: 'Columbia Valley, Washington',
    price: 17,
    category: 'Wine List',
    menuType: 'dinner',
    // No imageUrl - will display in text-only format
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '8', 
    title: '2020 Quilceda Creek Malbec',
    description: 'Red Mountain, Washington',
    price: 24,
    category: 'Wine List',
    menuType: 'dinner',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '9',
    title: 'Korean Plum Wine',
    description: 'Traditional maesil-ju, served chilled',
    price: 12,
    category: 'Wine List',
    menuType: 'lunch',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Sample Breakfast Menu
  {
    id: '10',
    title: 'Korean Breakfast Bowl',
    description: 'Traditional rice porridge with seasoned vegetables and egg',
    price: 14,
    category: 'Hot Breakfast',
    menuType: 'breakfast',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '11',
    title: 'Matcha Croissant',
    description: 'Flaky pastry infused with premium matcha powder',
    price: 6,
    category: 'Pastries',
    menuType: 'breakfast',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '12',
    title: 'Korean Coffee',
    description: 'House blend with subtle notes of caramel and nuts',
    price: 4,
    category: 'Beverages',
    menuType: 'breakfast',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Happy hour — shareable plates and drinks served between lunch and dinner
  {
    id: '13',
    title: 'Cucumber Salad',
    description: 'Eggplant, Sesame Dressing',
    price: 7,
    category: 'Small Plates',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '14',
    title: 'Little Gem (2 pc.)',
    description: 'Pistachio Cream, Parmesan, Crown Daisy',
    price: 12,
    category: 'Small Plates',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '15',
    title: 'Chicken Wings (6 pc.)',
    description: 'Sweet Chili, Soy Garlic, or Plain',
    price: 12,
    category: 'Small Plates',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '16',
    title: 'Chips & Dip',
    description: 'Salmon Rillette, Meyer Lemon, Kakdugi',
    price: 15,
    category: 'Small Plates',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '17',
    title: 'Cauliflower',
    description: 'Almond, Sesame Seed, Mint',
    price: 15,
    category: 'Small Plates',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '18',
    title: 'Mushroom',
    description: 'Parmesan, White Kimchi, Truffle Aioli',
    price: 18,
    category: 'Small Plates',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '19',
    title: 'Gochujang Margarita',
    description: 'Tequila, Lemongrass Mezcal, Curaçao, Gochujang, Honey, Lime',
    price: 14,
    category: 'Cocktails',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '20',
    title: 'Plum Luck',
    description: 'Vodka, Aperol, Green Plum, Lemon',
    price: 14,
    category: 'Cocktails',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '21',
    title: 'Sesame Negroni',
    description: 'Sesame-Washed Gin, Cocci Americano, Gentian Liquor, Ginseng',
    price: 15,
    category: 'Cocktails',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '22',
    title: 'Paju Vesper',
    description: 'Gin, Omija Soju, House Vermouth Blend, Orange Bitters',
    price: 15,
    category: 'Cocktails',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '23',
    title: 'Terra',
    description: 'Korean lager',
    price: 6,
    category: 'Beer, Wine & Rice Wine',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '24',
    title: "No Boat 'Bia Hoi' Lager",
    description: 'Draft lager',
    price: 8,
    category: 'Beer, Wine & Rice Wine',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '25',
    title: "No Boat 'Farmer Soldier' Pilsner",
    description: 'Draft pilsner',
    price: 8,
    category: 'Beer, Wine & Rice Wine',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '26',
    title: "No Boat 'Mozzie' IPA",
    description: 'Draft IPA',
    price: 8,
    category: 'Beer, Wine & Rice Wine',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '27',
    title: 'Kook Soon Dang Makgeolli',
    description: 'Unfiltered rice wine, Korea',
    price: 7,
    category: 'Beer, Wine & Rice Wine',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '28',
    title: '2024 Bargemone Rosé',
    description: 'Grenache, Cabernet Sauvignon, Cinsault - Provence, France',
    price: 11,
    category: 'Beer, Wine & Rice Wine',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '29',
    title: '2024 Auntsfield',
    description: 'Sauvignon Blanc - Marlborough, New Zealand',
    price: 12,
    category: 'Beer, Wine & Rice Wine',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '30',
    title: '2023 Domaine Jean-Michel Dupré',
    description: 'Gamay Noir - Beaujolais, France',
    price: 13,
    category: 'Beer, Wine & Rice Wine',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '31',
    title: 'Soda',
    description: 'Coke, Diet Coke, Sprite, Ginger Beer',
    price: 4,
    category: 'Zero-Proof',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '32',
    title: 'Seasonal Shrub',
    description: 'House shrub, served chilled',
    price: 8,
    category: 'Zero-Proof',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '33',
    title: 'Barley Palmer',
    description: 'Boricha Tea, Yuja, Sparkling Water',
    price: 10,
    category: 'Zero-Proof',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '34',
    title: 'Honey Bee',
    description: 'Lemon, Honey, Ginger, Tonic',
    price: 10,
    category: 'Zero-Proof',
    menuType: 'happy-hour',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const restaurantHours: RestaurantHours[] = [
  {
    id: '1',
    dayOfWeek: 'Monday',
    openTime: '11:00',
    closeTime: '21:00',
    isBreakfastService: false,
    isLunchService: true,
    lunchOpenTime: '11:00',
    lunchCloseTime: '15:00',
    isHappyHourService: true,
    happyHourOpenTime: '14:00',
    happyHourCloseTime: '17:00',
    isDinnerService: true,
    dinnerOpenTime: '17:00',
    dinnerCloseTime: '21:00',
    isClosed: false,
    updatedAt: new Date()
  },
  {
    id: '2',
    dayOfWeek: 'Tuesday',
    openTime: '11:00',
    closeTime: '21:00',
    isBreakfastService: false,
    isLunchService: true,
    lunchOpenTime: '11:00',
    lunchCloseTime: '15:00',
    isHappyHourService: true,
    happyHourOpenTime: '14:00',
    happyHourCloseTime: '17:00',
    isDinnerService: true,
    dinnerOpenTime: '17:00',
    dinnerCloseTime: '21:00',
    isClosed: false,
    updatedAt: new Date()
  },
  {
    id: '3',
    dayOfWeek: 'Wednesday',
    openTime: '11:00',
    closeTime: '21:00',
    isBreakfastService: false,
    isLunchService: true,
    lunchOpenTime: '11:00',
    lunchCloseTime: '15:00',
    isHappyHourService: true,
    happyHourOpenTime: '14:00',
    happyHourCloseTime: '17:00',
    isDinnerService: true,
    dinnerOpenTime: '17:00',
    dinnerCloseTime: '21:00',
    isClosed: false,
    updatedAt: new Date()
  },
  {
    id: '4',
    dayOfWeek: 'Thursday',
    openTime: '11:00',
    closeTime: '21:00',
    isBreakfastService: false,
    isLunchService: true,
    lunchOpenTime: '11:00',
    lunchCloseTime: '15:00',
    isHappyHourService: true,
    happyHourOpenTime: '14:00',
    happyHourCloseTime: '17:00',
    isDinnerService: true,
    dinnerOpenTime: '17:00',
    dinnerCloseTime: '21:00',
    isClosed: false,
    updatedAt: new Date()
  },
  {
    id: '5',
    dayOfWeek: 'Friday',
    openTime: '11:00',
    closeTime: '22:00',
    isBreakfastService: false,
    isLunchService: true,
    lunchOpenTime: '11:00',
    lunchCloseTime: '15:00',
    isHappyHourService: true,
    happyHourOpenTime: '14:00',
    happyHourCloseTime: '17:00',
    isDinnerService: true,
    dinnerOpenTime: '17:00',
    dinnerCloseTime: '22:00',
    isClosed: false,
    updatedAt: new Date()
  },
  {
    id: '6',
    dayOfWeek: 'Saturday',
    openTime: '08:00',
    closeTime: '22:00',
    isBreakfastService: true,
    breakfastOpenTime: '08:00',
    breakfastCloseTime: '11:00',
    isLunchService: true,
    lunchOpenTime: '11:00',
    lunchCloseTime: '15:00',
    isHappyHourService: true,
    happyHourOpenTime: '14:00',
    happyHourCloseTime: '17:00',
    isDinnerService: true,
    dinnerOpenTime: '17:00',
    dinnerCloseTime: '22:00',
    isClosed: false,
    updatedAt: new Date()
  },
  {
    id: '7',
    dayOfWeek: 'Sunday',
    openTime: '09:00',
    closeTime: '17:00',
    isBreakfastService: true,
    breakfastOpenTime: '09:00',
    breakfastCloseTime: '12:00',
    isLunchService: true,
    lunchOpenTime: '12:00',
    lunchCloseTime: '15:00',
    isHappyHourService: true,
    happyHourOpenTime: '14:00',
    happyHourCloseTime: '17:00',
    isDinnerService: false,
    isClosed: false,
    updatedAt: new Date()
  }
];

// Default categories
const menuCategories: MenuCategory[] = [
  {
    id: '1',
    name: 'Appetizer',
    menuType: 'lunch',
    displayOrder: 1,
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Main Course',
    menuType: 'lunch',
    displayOrder: 2,
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Dessert',
    menuType: 'lunch',
    displayOrder: 3,
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'Appetizer',
    menuType: 'dinner',
    displayOrder: 1,
    createdAt: new Date()
  },
  {
    id: '5',
    name: 'Main Course',
    menuType: 'dinner',
    displayOrder: 2,
    createdAt: new Date()
  },
  {
    id: '6',
    name: 'Dessert',
    menuType: 'dinner',
    displayOrder: 3,
    createdAt: new Date()
  },
  {
    id: '7',
    name: 'Wine List',
    menuType: 'dinner',
    displayOrder: 4,
    createdAt: new Date()
  },
  {
    id: '8',
    name: 'Wine List',
    menuType: 'lunch',
    displayOrder: 4,
    createdAt: new Date()
  },
  // Breakfast categories
  {
    id: '9',
    name: 'Pastries',
    menuType: 'breakfast',
    displayOrder: 1,
    createdAt: new Date()
  },
  {
    id: '10',
    name: 'Hot Breakfast',
    menuType: 'breakfast',
    displayOrder: 2,
    createdAt: new Date()
  },
  {
    id: '11',
    name: 'Beverages',
    menuType: 'breakfast',
    displayOrder: 3,
    createdAt: new Date()
  },
  {
    id: '12',
    name: 'Small Plates',
    menuType: 'happy-hour',
    displayOrder: 1,
    createdAt: new Date()
  },
  {
    id: '13',
    name: 'Cocktails',
    menuType: 'happy-hour',
    displayOrder: 2,
    createdAt: new Date()
  },
  {
    id: '14',
    name: 'Beer, Wine & Rice Wine',
    menuType: 'happy-hour',
    displayOrder: 3,
    createdAt: new Date()
  },
  {
    id: '15',
    name: 'Zero-Proof',
    menuType: 'happy-hour',
    displayOrder: 4,
    createdAt: new Date()
  }
];

// Menu status - controls which menus are enabled/disabled
const menuStatus: MenuStatus[] = [
  {
    id: '1',
    menuType: 'breakfast',
    isEnabled: true,
    updatedAt: new Date()
  },
  {
    id: '2',
    menuType: 'lunch',
    isEnabled: true,
    updatedAt: new Date()
  },
  {
    id: '4',
    menuType: 'happy-hour',
    isEnabled: true,
    updatedAt: new Date()
  },
  {
    id: '3',
    menuType: 'dinner',
    isEnabled: true,
    updatedAt: new Date()
  }
];

// Default admin user (password: admin123)
const users: User[] = [
  {
    id: '1',
    username: 'admin',
    passwordHash: '$2b$10$ZQli4KsPF.oReH2gtcvOzu47zW3NZaU/viXHIVS44eA5SDaoXK8xm', // admin123
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Announcements storage
const announcements: Announcement[] = [];

// Accolades storage
const accolades: Accolade[] = [];

// Chef bios storage
const chefBios: ChefBio[] = [];

// Database operations
export const db = {
  // Menu Items
  getMenuItems: (menuType?: MenuType) => {
    const list = menuType ? menuItems.filter(item => item.menuType === menuType) : menuItems;
    return [...list].sort((a, b) => {
      const ao = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  },
  
  getMenuItem: (id: string) => {
    return menuItems.find(item => item.id === id);
  },
  
  createMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    // determine next display order within category/menuType
    const siblings = menuItems.filter(mi => mi.menuType === item.menuType && mi.category === item.category);
    const nextOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.displayOrder || 0)) + 1 : 1;
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
      displayOrder: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    menuItems.push(newItem);
    return newItem;
  },
  
  updateMenuItem: (id: string, updates: Partial<Omit<MenuItem, 'id' | 'createdAt'>>) => {
    const index = menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
      menuItems[index] = { ...menuItems[index], ...updates, updatedAt: new Date() };
      return menuItems[index];
    }
    return null;
  },
  
  deleteMenuItem: (id: string) => {
    console.log('DevDB deleteMenuItem called with ID:', id);
    console.log('Current menuItems IDs:', menuItems.map(item => item.id));
    const index = menuItems.findIndex(item => item.id === id);
    console.log('Found index:', index);
    if (index !== -1) {
      const deleted = menuItems.splice(index, 1)[0];
      console.log('Deleted item:', deleted);
      return deleted;
    }
    console.log('No item found with ID:', id);
    return null;
  },

  reorderMenuItems: (menuType: MenuType, category: string, orderedIds: string[]) => {
    const target = menuItems.filter(mi => mi.menuType === menuType && mi.category === category);
    const map = new Map(target.map(i => [i.id, i] as const));
    orderedIds.forEach((id, idx) => {
      const it = map.get(id);
      if (it) it.displayOrder = idx + 1;
    });
    return menuItems
      .filter(mi => mi.menuType === menuType && mi.category === category)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  },

  renameCategoryInItems: (menuType: MenuType, oldName: string, newName: string) => {
    let count = 0;
    menuItems.forEach(mi => {
      if (mi.menuType === menuType && mi.category === oldName) {
        mi.category = newName;
        count++;
      }
    });
    return count;
  },

  // Restaurant Hours
  getRestaurantHours: () => restaurantHours,
  
  createRestaurantHours: (hoursData: Omit<RestaurantHours, 'id' | 'updatedAt'>) => {
    const newHours: RestaurantHours = {
      id: (restaurantHours.length + 1).toString(),
      ...hoursData,
      updatedAt: new Date()
    };
    restaurantHours.push(newHours);
    return newHours;
  },
  
  updateRestaurantHours: (dayId: string, updates: Partial<Omit<RestaurantHours, 'id' | 'dayOfWeek'>>) => {
    const index = restaurantHours.findIndex(hour => hour.id === dayId);
    if (index !== -1) {
      restaurantHours[index] = { ...restaurantHours[index], ...updates, updatedAt: new Date() };
      return restaurantHours[index];
    }
    return null;
  },

  // Users
  getUser: (username: string) => {
    return users.find(user => user.username === username);
  },
  
  getUserById: (id: string) => {
    return users.find(user => user.id === id);
  },

  getUsers: () => {
    return users;
  },

  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  updateUser: (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates, updatedAt: new Date() };
      return users[index];
    }
    return null;
  },

  deleteUser: (id: string) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      const deleted = users.splice(index, 1)[0];
      return deleted;
    }
    return null;
  },

  // Announcements
  getAnnouncements: () => {
    return announcements.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  getActiveAnnouncements: () => {
    const now = new Date();
    return announcements.filter(announcement => {
      if (!announcement.isActive) return false;
      if (announcement.startDate && new Date(announcement.startDate) > now) return false;
      if (announcement.endDate && new Date(announcement.endDate) < now) return false;
      return true;
    }).sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  createAnnouncement: (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAnnouncement: Announcement = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...announcementData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    announcements.push(newAnnouncement);
    return newAnnouncement;
  },

  updateAnnouncement: (id: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt'>>) => {
    const index = announcements.findIndex(announcement => announcement.id === id);
    if (index !== -1) {
      announcements[index] = { ...announcements[index], ...updates, updatedAt: new Date() };
      return announcements[index];
    }
    return null;
  },

  deleteAnnouncement: (id: string) => {
    const index = announcements.findIndex(announcement => announcement.id === id);
    if (index !== -1) {
      const deleted = announcements.splice(index, 1)[0];
      return deleted;
    }
    return null;
  },

  // Accolades
  getAccolades: () => {
    return [...accolades].sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  getActiveAccolades: () => {
    return accolades
      .filter((accolade) => accolade.isActive)
      .sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  },

  createAccolade: (accoladeData: Omit<Accolade, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nextOrder =
      accolades.length > 0
        ? Math.max(...accolades.map((a) => a.displayOrder || 0)) + 1
        : 1;
    const newAccolade: Accolade = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...accoladeData,
      displayOrder: accoladeData.displayOrder ?? nextOrder,
      images: accoladeData.images || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    accolades.push(newAccolade);
    return newAccolade;
  },

  updateAccolade: (id: string, updates: Partial<Omit<Accolade, 'id' | 'createdAt'>>) => {
    const index = accolades.findIndex((accolade) => accolade.id === id);
    if (index !== -1) {
      accolades[index] = { ...accolades[index], ...updates, updatedAt: new Date() };
      return accolades[index];
    }
    return null;
  },

  deleteAccolade: (id: string) => {
    const index = accolades.findIndex((accolade) => accolade.id === id);
    if (index !== -1) {
      return accolades.splice(index, 1)[0];
    }
    return null;
  },

  // Chef Bios
  getChefBios: () => {
    return [...chefBios].sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  getActiveChefBios: () => {
    return chefBios
      .filter((chef) => chef.isActive)
      .sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  },

  createChefBio: (chefData: Omit<ChefBio, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nextOrder =
      chefBios.length > 0
        ? Math.max(...chefBios.map((c) => c.displayOrder || 0)) + 1
        : 1;
    const newChefBio: ChefBio = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...chefData,
      displayOrder: chefData.displayOrder ?? nextOrder,
      role: chefData.role || '',
      title: chefData.title || '',
      quote: chefData.quote || '',
      bio: chefData.bio || '',
      imageUrl: chefData.imageUrl || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    chefBios.push(newChefBio);
    return newChefBio;
  },

  updateChefBio: (id: string, updates: Partial<Omit<ChefBio, 'id' | 'createdAt'>>) => {
    const index = chefBios.findIndex((chef) => chef.id === id);
    if (index !== -1) {
      chefBios[index] = { ...chefBios[index], ...updates, updatedAt: new Date() };
      return chefBios[index];
    }
    return null;
  },

  deleteChefBio: (id: string) => {
    const index = chefBios.findIndex((chef) => chef.id === id);
    if (index !== -1) {
      return chefBios.splice(index, 1)[0];
    }
    return null;
  },

  // Menu Categories
  getMenuCategories: (menuType?: MenuType) => {
    const filtered = menuType ? menuCategories.filter(cat => cat.menuType === menuType) : menuCategories;
    return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
  },
  
  createMenuCategory: (category: Omit<MenuCategory, 'id' | 'createdAt'>) => {
    const newCategory: MenuCategory = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    menuCategories.push(newCategory);
    return newCategory;
  },
  
  deleteMenuCategory: (id: string) => {
    const index = menuCategories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      const deleted = menuCategories.splice(index, 1)[0];
      return deleted;
    }
    return null;
  },

  updateMenuCategory: (id: string, updates: Partial<Pick<MenuCategory, 'name' | 'displayOrder'>>) => {
    const idx = menuCategories.findIndex(c => c.id === id);
    if (idx !== -1) {
      menuCategories[idx] = { ...menuCategories[idx], ...updates };
      return menuCategories[idx];
    }
    return null;
  },

  reorderMenuCategories: (menuType: MenuType, orderedIds: string[]) => {
    // Ensure only categories of the given menuType are affected
    const target = menuCategories.filter(cat => cat.menuType === menuType);
    // Map id -> category for quick access
    const map = new Map(target.map(c => [c.id, c] as const));
    orderedIds.forEach((id, idx) => {
      const cat = map.get(id);
      if (cat) {
        cat.displayOrder = idx + 1;
      }
    });
    // Return updated ordered list for this menuType
    return menuCategories
      .filter(cat => cat.menuType === menuType)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }
};

// Menu Status Functions
export function getMenuStatuses(): MenuStatus[] {
  return [...menuStatus];
}

export function updateMenuStatus(menuType: MenuType, isEnabled: boolean): MenuStatus[] {
  const status = menuStatus.find(s => s.menuType === menuType);
  if (status) {
    status.isEnabled = isEnabled;
    status.updatedAt = new Date();
  }
  return [...menuStatus];
}