// Local database simulation - in production, you'd use a real database
export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  menuType: 'breakfast' | 'lunch' | 'dinner';
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  menuType: 'breakfast' | 'lunch' | 'dinner';
  displayOrder: number;
  createdAt: Date;
}

export interface MenuStatus {
  id: string;
  menuType: 'breakfast' | 'lunch' | 'dinner';
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
  role: 'admin' | 'manager';
  createdAt: Date;
}

// In-memory storage (replace with actual database in production)
let menuItems: MenuItem[] = [
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
  }
];

let restaurantHours: RestaurantHours[] = [
  {
    id: '1',
    dayOfWeek: 'Monday',
    openTime: '11:00',
    closeTime: '21:00',
    isBreakfastService: false,
    isLunchService: true,
    lunchOpenTime: '11:00',
    lunchCloseTime: '15:00',
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
    closeTime: '15:00',
    isBreakfastService: true,
    breakfastOpenTime: '09:00',
    breakfastCloseTime: '12:00',
    isLunchService: true,
    lunchOpenTime: '12:00',
    lunchCloseTime: '15:00',
    isDinnerService: false,
    isClosed: false,
    updatedAt: new Date()
  }
];

// Default categories
let menuCategories: MenuCategory[] = [
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
  }
];

// Menu status - controls which menus are enabled/disabled
let menuStatus: MenuStatus[] = [
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
    id: '3',
    menuType: 'dinner',
    isEnabled: true,
    updatedAt: new Date()
  }
];

// Default admin user (password: admin123)
let users: User[] = [
  {
    id: '1',
    username: 'admin',
    passwordHash: '$2b$10$ZQli4KsPF.oReH2gtcvOzu47zW3NZaU/viXHIVS44eA5SDaoXK8xm', // admin123
    role: 'admin',
    createdAt: new Date()
  }
];

// Database operations
export const db = {
  // Menu Items
  getMenuItems: (menuType?: 'lunch' | 'dinner') => {
    return menuType ? menuItems.filter(item => item.menuType === menuType) : menuItems;
  },
  
  getMenuItem: (id: string) => {
    return menuItems.find(item => item.id === id);
  },
  
  createMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
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
    const index = menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = menuItems.splice(index, 1)[0];
      return deleted;
    }
    return null;
  },

  // Restaurant Hours
  getRestaurantHours: () => restaurantHours,
  
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

  // Menu Categories
  getMenuCategories: (menuType?: 'breakfast' | 'lunch' | 'dinner') => {
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
  }
};

// Menu Status Functions
export function getMenuStatuses(): MenuStatus[] {
  return [...menuStatus];
}

export function updateMenuStatus(menuType: 'breakfast' | 'lunch' | 'dinner', isEnabled: boolean): MenuStatus[] {
  const status = menuStatus.find(s => s.menuType === menuType);
  if (status) {
    status.isEnabled = isEnabled;
    status.updatedAt = new Date();
  }
  return [...menuStatus];
}