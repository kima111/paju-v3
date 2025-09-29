import { sql } from '@vercel/postgres';
import type { MenuItem, MenuCategory, RestaurantHours, MenuStatus, User } from './database';

// Configure database connection for Neon
if (process.env.NODE_ENV === 'production') {
  // Map Neon variables to what @vercel/postgres expects
  if (process.env.DATABASE_POSTGRES_URL) {
    process.env.POSTGRES_URL = process.env.DATABASE_POSTGRES_URL;
  } else if (process.env.DATABASE_DATABASE_URL) {
    process.env.POSTGRES_URL = process.env.DATABASE_DATABASE_URL;
  }
  
  if (process.env.DATABASE_POSTGRES_URL_NON_POOLING) {
    process.env.POSTGRES_URL_NON_POOLING = process.env.DATABASE_POSTGRES_URL_NON_POOLING;
  } else if (process.env.DATABASE_DATABASE_URL_UNPOOLED) {
    process.env.POSTGRES_URL_NON_POOLING = process.env.DATABASE_DATABASE_URL_UNPOOLED;
  }
}

// Development fallback
let devDB: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db?: any;
  getMenuStatuses?: () => MenuStatus[];
  updateMenuStatus?: (menuType: 'breakfast' | 'lunch' | 'dinner', isEnabled: boolean) => MenuStatus[];
} | null = null;
if (process.env.NODE_ENV !== 'production') {
  import('./database').then((db) => {
    devDB = {
      db: db.db,
      getMenuStatuses: db.getMenuStatuses,
      updateMenuStatus: db.updateMenuStatus
    };
  }).catch(() => {
    console.warn('Could not load development database');
  });
}

// Production Database Operations
export class DatabaseService {
  // Users
  static async getUserByUsername(username: string): Promise<User | null> {
    if (process.env.NODE_ENV !== 'production' && devDB?.db) {
      return devDB.db.getUserByUsername(username);
    }
    
    try {
      const result = await sql`
        SELECT id, username, password_hash as "passwordHash", role, created_at as "createdAt"
        FROM users WHERE username = ${username}
      `;
      return result.rows[0] as User || null;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  // Menu Items
  static async getMenuItems(menuType?: 'breakfast' | 'lunch' | 'dinner'): Promise<MenuItem[]> {
    if (process.env.NODE_ENV !== 'production' && devDB?.db) {
      return devDB.db.getMenuItems(menuType);
    }

    try {
      const query = menuType 
        ? sql`SELECT * FROM menu_items WHERE menu_type = ${menuType} ORDER BY created_at DESC`
        : sql`SELECT * FROM menu_items ORDER BY created_at DESC`;
      
      const result = await query;
      return result.rows.map(row => ({
        id: row.id.toString(),
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        category: row.category,
        menuType: row.menu_type as 'breakfast' | 'lunch' | 'dinner',
        imageUrl: row.image_url,
        isAvailable: row.is_available,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async createMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem | null> {
    if (process.env.NODE_ENV !== 'production' && devDB?.db) {
      return devDB.db.createMenuItem(item);
    }

    try {
      const result = await sql`
        INSERT INTO menu_items (title, description, price, category, menu_type, image_url, is_available)
        VALUES (${item.title}, ${item.description}, ${item.price}, ${item.category}, ${item.menuType}, ${item.imageUrl || null}, ${item.isAvailable})
        RETURNING *, id::text
      `;
      
      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        category: row.category,
        menuType: row.menu_type,
        imageUrl: row.image_url,
        isAvailable: row.is_available,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async updateMenuItem(id: string, updates: Partial<Omit<MenuItem, 'id' | 'createdAt'>>): Promise<MenuItem | null> {
    if (process.env.NODE_ENV !== 'production' && devDB?.db) {
      return devDB.db.updateMenuItem(id, updates);
    }

    try {
      const result = await sql`
        UPDATE menu_items 
        SET title = COALESCE(${updates.title}, title),
            description = COALESCE(${updates.description}, description),
            price = COALESCE(${updates.price}, price),
            category = COALESCE(${updates.category}, category),
            menu_type = COALESCE(${updates.menuType}, menu_type),
            image_url = COALESCE(${updates.imageUrl}, image_url),
            is_available = COALESCE(${updates.isAvailable}, is_available),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *, id::text
      `;
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        category: row.category,
        menuType: row.menu_type,
        imageUrl: row.image_url,
        isAvailable: row.is_available,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async deleteMenuItem(id: string): Promise<MenuItem | null> {
    if (process.env.NODE_ENV !== 'production' && devDB?.db) {
      return devDB.db.deleteMenuItem(id);
    }

    try {
      const result = await sql`
        DELETE FROM menu_items WHERE id = ${id}
        RETURNING *, id::text
      `;
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        category: row.category,
        menuType: row.menu_type,
        imageUrl: row.image_url,
        isAvailable: row.is_available,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  // Menu Categories
  static async getMenuCategories(menuType?: 'breakfast' | 'lunch' | 'dinner'): Promise<MenuCategory[]> {
    if (process.env.NODE_ENV !== 'production' && devDB?.db) {
      return devDB.db.getMenuCategories(menuType);
    }

    try {
      const query = menuType
        ? sql`SELECT * FROM menu_categories WHERE menu_type = ${menuType} ORDER BY display_order`
        : sql`SELECT * FROM menu_categories ORDER BY display_order`;
      
      const result = await query;
      return result.rows.map(row => ({
        id: row.id.toString(),
        name: row.name,
        menuType: row.menu_type as 'breakfast' | 'lunch' | 'dinner',
        displayOrder: row.display_order,
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async createMenuCategory(category: Omit<MenuCategory, 'id' | 'createdAt'>): Promise<MenuCategory | null> {
    if (process.env.NODE_ENV !== 'production' && devDB?.db) {
      return devDB.db.createMenuCategory(category);
    }

    try {
      const result = await sql`
        INSERT INTO menu_categories (name, menu_type, display_order)
        VALUES (${category.name}, ${category.menuType}, ${category.displayOrder})
        RETURNING *, id::text
      `;
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        menuType: row.menu_type,
        displayOrder: row.display_order,
        createdAt: new Date(row.created_at)
      };
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async deleteMenuCategory(id: string): Promise<MenuCategory | null> {
    if (process.env.NODE_ENV !== 'production' && devDB?.db) {
      return devDB.db.deleteMenuCategory(id);
    }

    try {
      const result = await sql`
        DELETE FROM menu_categories WHERE id = ${id}
        RETURNING *, id::text
      `;
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        menuType: row.menu_type,
        displayOrder: row.display_order,
        createdAt: new Date(row.created_at)
      };
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  // Restaurant Hours
  static async getRestaurantHours(): Promise<RestaurantHours[]> {
    if (process.env.NODE_ENV !== 'production' && devDB?.db) {
      return devDB.db.getRestaurantHours();
    }

    try {
      const result = await sql`
        SELECT * FROM restaurant_hours 
        ORDER BY CASE day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END
      `;
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        dayOfWeek: row.day_of_week,
        openTime: row.open_time,
        closeTime: row.close_time,
        isBreakfastService: row.is_breakfast_service,
        breakfastOpenTime: row.breakfast_open_time,
        breakfastCloseTime: row.breakfast_close_time,
        isLunchService: row.is_lunch_service,
        lunchOpenTime: row.lunch_open_time,
        lunchCloseTime: row.lunch_close_time,
        isDinnerService: row.is_dinner_service,
        dinnerOpenTime: row.dinner_open_time,
        dinnerCloseTime: row.dinner_close_time,
        isClosed: row.is_closed,
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async updateRestaurantHours(dayId: string, updates: Partial<Omit<RestaurantHours, 'id' | 'dayOfWeek'>>): Promise<RestaurantHours | null> {
    if (process.env.NODE_ENV !== 'production' && devDB?.db) {
      return devDB.db.updateRestaurantHours(dayId, updates);
    }

    try {
      const result = await sql`
        UPDATE restaurant_hours
        SET is_closed = COALESCE(${updates.isClosed}, is_closed),
            is_breakfast_service = COALESCE(${updates.isBreakfastService}, is_breakfast_service),
            breakfast_open_time = COALESCE(${updates.breakfastOpenTime}, breakfast_open_time),
            breakfast_close_time = COALESCE(${updates.breakfastCloseTime}, breakfast_close_time),
            is_lunch_service = COALESCE(${updates.isLunchService}, is_lunch_service),
            lunch_open_time = COALESCE(${updates.lunchOpenTime}, lunch_open_time),
            lunch_close_time = COALESCE(${updates.lunchCloseTime}, lunch_close_time),
            is_dinner_service = COALESCE(${updates.isDinnerService}, is_dinner_service),
            dinner_open_time = COALESCE(${updates.dinnerOpenTime}, dinner_open_time),
            dinner_close_time = COALESCE(${updates.dinnerCloseTime}, dinner_close_time),
            open_time = COALESCE(${updates.openTime}, open_time),
            close_time = COALESCE(${updates.closeTime}, close_time),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${dayId}
        RETURNING *, id::text
      `;
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        dayOfWeek: row.day_of_week,
        openTime: row.open_time,
        closeTime: row.close_time,
        isBreakfastService: row.is_breakfast_service,
        breakfastOpenTime: row.breakfast_open_time,
        breakfastCloseTime: row.breakfast_close_time,
        isLunchService: row.is_lunch_service,
        lunchOpenTime: row.lunch_open_time,
        lunchCloseTime: row.lunch_close_time,
        isDinnerService: row.is_dinner_service,
        dinnerOpenTime: row.dinner_open_time,
        dinnerCloseTime: row.dinner_close_time,
        isClosed: row.is_closed,
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  // Menu Status
  static async getMenuStatuses(): Promise<MenuStatus[]> {
    if (process.env.NODE_ENV !== 'production' && devDB?.getMenuStatuses) {
      return devDB.getMenuStatuses();
    }

    try {
      const result = await sql`SELECT * FROM menu_status ORDER BY menu_type`;
      return result.rows.map(row => ({
        id: row.id.toString(),
        menuType: row.menu_type as 'breakfast' | 'lunch' | 'dinner',
        isEnabled: row.is_enabled,
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async updateMenuStatus(menuType: 'breakfast' | 'lunch' | 'dinner', isEnabled: boolean): Promise<MenuStatus[]> {
    if (process.env.NODE_ENV !== 'production' && devDB?.updateMenuStatus) {
      return devDB.updateMenuStatus(menuType, isEnabled);
    }

    try {
      await sql`
        UPDATE menu_status 
        SET is_enabled = ${isEnabled}, updated_at = CURRENT_TIMESTAMP
        WHERE menu_type = ${menuType}
      `;
      
      return this.getMenuStatuses();
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }
}