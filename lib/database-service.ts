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

// Initialize development database synchronously
function initDevDB() {
  if (process.env.NODE_ENV !== 'production' && !devDB) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const db = require('./database');
      devDB = {
        db: db.db,
        getMenuStatuses: db.getMenuStatuses,
        updateMenuStatus: db.updateMenuStatus
      };
      console.log('Development database initialized successfully');
    } catch (error) {
      console.warn('Could not load development database:', error);
    }
  }
  return devDB;
}

// Production Database Operations
export class DatabaseService {
  // Users
  static async getUserByUsername(username: string): Promise<User | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getUser(username);
    }
    
    try {
      const result = await sql`
        SELECT id, username, password_hash as "passwordHash", role, is_active as "isActive",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM users WHERE username = ${username}
      `;
      return result.rows[0] as User || null;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async getUsers(): Promise<User[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getUsers();
    }

    try {
      const result = await sql`
        SELECT id, username, role, is_active as "isActive", 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM users ORDER BY created_at DESC
      `;
      return result.rows as User[];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.createUser(userData);
    }

    try {
      const result = await sql`
        INSERT INTO users (username, password_hash, role, is_active)
        VALUES (${userData.username}, ${userData.passwordHash}, ${userData.role}, ${userData.isActive})
        RETURNING id, username, role, is_active as "isActive", 
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      return result.rows[0] as User;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.updateUser(id, updates);
    }

    try {
      // Build dynamic query based on provided updates
      let query = 'UPDATE users SET updated_at = NOW()';
      const params: (string | boolean)[] = [id];
      let paramIndex = 2;

      if (updates.username !== undefined) {
        query += `, username = $${paramIndex}`;
        params.push(updates.username);
        paramIndex++;
      }
      if (updates.passwordHash !== undefined) {
        query += `, password_hash = $${paramIndex}`;
        params.push(updates.passwordHash);
        paramIndex++;
      }
      if (updates.role !== undefined) {
        query += `, role = $${paramIndex}`;
        params.push(updates.role);
        paramIndex++;
      }
      if (updates.isActive !== undefined) {
        query += `, is_active = $${paramIndex}`;
        params.push(updates.isActive);
        paramIndex++;
      }

      query += ' WHERE id = $1 RETURNING id, username, role, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"';

      const result = await sql.query(query, params);
      return result.rows[0] as User || null;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async deleteUser(id: string): Promise<User | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.deleteUser(id);
    }

    try {
      const result = await sql`
        DELETE FROM users WHERE id = ${id}
        RETURNING id, username, role, is_active as "isActive", 
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      return result.rows[0] as User || null;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  // Menu Items
  static async getMenuItems(menuType?: 'breakfast' | 'lunch' | 'dinner'): Promise<MenuItem[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getMenuItems(menuType);
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
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.createMenuItem(item);
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
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.updateMenuItem(id, updates);
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
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      console.log('Using devDB for delete, ID:', id);
      const result = devDatabase.db.deleteMenuItem(id);
      console.log('DevDB delete result:', result);
      return result;
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
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getMenuCategories(menuType);
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
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.createMenuCategory(category);
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
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.deleteMenuCategory(id);
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
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getRestaurantHours();
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

  static async createRestaurantHours(hoursData: Omit<RestaurantHours, 'id' | 'updatedAt'>): Promise<RestaurantHours | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.createRestaurantHours(hoursData);
    }

    try {
      const result = await sql`
        INSERT INTO restaurant_hours (
          day_of_week, is_closed, 
          is_breakfast_service, breakfast_open_time, breakfast_close_time,
          is_lunch_service, lunch_open_time, lunch_close_time,
          is_dinner_service, dinner_open_time, dinner_close_time
        ) VALUES (
          ${hoursData.dayOfWeek}, ${hoursData.isClosed},
          ${hoursData.isBreakfastService}, ${hoursData.breakfastOpenTime}, ${hoursData.breakfastCloseTime},
          ${hoursData.isLunchService}, ${hoursData.lunchOpenTime}, ${hoursData.lunchCloseTime},
          ${hoursData.isDinnerService}, ${hoursData.dinnerOpenTime}, ${hoursData.dinnerCloseTime}
        )
        RETURNING id, day_of_week as "dayOfWeek", is_closed as "isClosed",
                  is_breakfast_service as "isBreakfastService", 
                  breakfast_open_time as "breakfastOpenTime", 
                  breakfast_close_time as "breakfastCloseTime",
                  is_lunch_service as "isLunchService", 
                  lunch_open_time as "lunchOpenTime", 
                  lunch_close_time as "lunchCloseTime",
                  is_dinner_service as "isDinnerService", 
                  dinner_open_time as "dinnerOpenTime", 
                  dinner_close_time as "dinnerCloseTime",
                  updated_at as "updatedAt"
      `;
      
      return result.rows[0] as RestaurantHours;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async updateRestaurantHours(dayId: string, updates: Partial<Omit<RestaurantHours, 'id' | 'dayOfWeek'>>): Promise<RestaurantHours | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.updateRestaurantHours(dayId, updates);
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
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.getMenuStatuses) {
      return devDatabase.getMenuStatuses();
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
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.updateMenuStatus) {
      return devDatabase.updateMenuStatus(menuType, isEnabled);
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