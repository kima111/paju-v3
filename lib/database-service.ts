import { sql } from '@vercel/postgres';
import { compareMenuTypes, type MenuItem, type MenuCategory, type MenuType, type RestaurantHours, type MenuStatus, type User, type Announcement, type Accolade, type ChefBio } from './database';

// Configure database connection for Neon (map env vars in all environments)
// This lets local dev connect to Neon/Postgres when desired.
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

// Development fallback
let devDB: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db?: any;
  getMenuStatuses?: () => MenuStatus[];
  updateMenuStatus?: (menuType: MenuType, isEnabled: boolean) => MenuStatus[];
} | null = null;

// Initialize development database synchronously
function initDevDB() {
  // Allow forcing real DB usage in development
  if (process.env.NODE_ENV !== 'production' && process.env.USE_DEV_DB === 'false') {
    return null;
  }
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

function clockTime(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

const HAPPY_HOUR_CATEGORIES = [
  { name: 'Small Plates', displayOrder: 1 },
  { name: 'Cocktails', displayOrder: 2 },
  { name: 'Beer, Wine & Rice Wine', displayOrder: 3 },
  { name: 'Zero-Proof', displayOrder: 4 }
] as const;

const HAPPY_HOUR_ITEMS: { title: string; description: string; price: number; category: string }[] = [
  { title: 'Cucumber Salad', description: 'Eggplant, Sesame Dressing', price: 7, category: 'Small Plates' },
  { title: 'Little Gem (2 pc.)', description: 'Pistachio Cream, Parmesan, Crown Daisy', price: 12, category: 'Small Plates' },
  { title: 'Chicken Wings (6 pc.)', description: 'Sweet Chili, Soy Garlic, or Plain', price: 12, category: 'Small Plates' },
  { title: 'Chips & Dip', description: 'Salmon Rillette, Meyer Lemon, Kakdugi', price: 15, category: 'Small Plates' },
  { title: 'Cauliflower', description: 'Almond, Sesame Seed, Mint', price: 15, category: 'Small Plates' },
  { title: 'Mushroom', description: 'Parmesan, White Kimchi, Truffle Aioli', price: 18, category: 'Small Plates' },
  { title: 'Gochujang Margarita', description: 'Tequila, Lemongrass Mezcal, Curaçao, Gochujang, Honey, Lime', price: 14, category: 'Cocktails' },
  { title: 'Plum Luck', description: 'Vodka, Aperol, Green Plum, Lemon', price: 14, category: 'Cocktails' },
  { title: 'Sesame Negroni', description: 'Sesame-Washed Gin, Cocci Americano, Gentian Liquor, Ginseng', price: 15, category: 'Cocktails' },
  { title: 'Paju Vesper', description: 'Gin, Omija Soju, House Vermouth Blend, Orange Bitters', price: 15, category: 'Cocktails' },
  { title: 'Terra', description: 'Korean lager', price: 6, category: 'Beer, Wine & Rice Wine' },
  { title: "No Boat 'Bia Hoi' Lager", description: 'Draft lager', price: 8, category: 'Beer, Wine & Rice Wine' },
  { title: "No Boat 'Farmer Soldier' Pilsner", description: 'Draft pilsner', price: 8, category: 'Beer, Wine & Rice Wine' },
  { title: "No Boat 'Mozzie' IPA", description: 'Draft IPA', price: 8, category: 'Beer, Wine & Rice Wine' },
  { title: 'Kook Soon Dang Makgeolli', description: 'Unfiltered rice wine, Korea', price: 7, category: 'Beer, Wine & Rice Wine' },
  { title: '2024 Bargemone Rosé', description: 'Grenache, Cabernet Sauvignon, Cinsault - Provence, France', price: 11, category: 'Beer, Wine & Rice Wine' },
  { title: '2024 Auntsfield', description: 'Sauvignon Blanc - Marlborough, New Zealand', price: 12, category: 'Beer, Wine & Rice Wine' },
  { title: '2023 Domaine Jean-Michel Dupré', description: 'Gamay Noir - Beaujolais, France', price: 13, category: 'Beer, Wine & Rice Wine' },
  { title: 'Soda', description: 'Coke, Diet Coke, Sprite, Ginger Beer', price: 4, category: 'Zero-Proof' },
  { title: 'Seasonal Shrub', description: 'House shrub, served chilled', price: 8, category: 'Zero-Proof' },
  { title: 'Barley Palmer', description: 'Boricha Tea, Yuja, Sparkling Water', price: 10, category: 'Zero-Proof' },
  { title: 'Honey Bee', description: 'Lemon, Honey, Ginger, Tonic', price: 10, category: 'Zero-Proof' }
];

let happyHourReady: Promise<void> | null = null;

export async function ensureHappyHourSupport(): Promise<void> {
  if (process.env.NODE_ENV !== 'production' && process.env.USE_DEV_DB !== 'false') {
    return;
  }
  if (!happyHourReady) {
    happyHourReady = applyHappyHourSupport().catch((error) => {
      happyHourReady = null;
      throw error;
    });
  }
  return happyHourReady;
}

async function applyHappyHourSupport(): Promise<void> {
  await sql`ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_menu_type_check`;
  await sql`ALTER TABLE menu_items ADD CONSTRAINT menu_items_menu_type_check CHECK (menu_type IN ('breakfast', 'lunch', 'happy-hour', 'dinner'))`;
  await sql`ALTER TABLE menu_categories DROP CONSTRAINT IF EXISTS menu_categories_menu_type_check`;
  await sql`ALTER TABLE menu_categories ADD CONSTRAINT menu_categories_menu_type_check CHECK (menu_type IN ('breakfast', 'lunch', 'happy-hour', 'dinner'))`;
  await sql`ALTER TABLE menu_status DROP CONSTRAINT IF EXISTS menu_status_menu_type_check`;
  await sql`ALTER TABLE menu_status ADD CONSTRAINT menu_status_menu_type_check CHECK (menu_type IN ('breakfast', 'lunch', 'happy-hour', 'dinner'))`;

  await sql`
    INSERT INTO menu_status (menu_type, is_enabled)
    VALUES ('happy-hour', true)
    ON CONFLICT (menu_type) DO NOTHING
  `;

  await sql`ALTER TABLE restaurant_hours ADD COLUMN IF NOT EXISTS is_happy_hour_service BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE restaurant_hours ADD COLUMN IF NOT EXISTS happy_hour_open_time TIME`;
  await sql`ALTER TABLE restaurant_hours ADD COLUMN IF NOT EXISTS happy_hour_close_time TIME`;
  await sql`
    UPDATE restaurant_hours
    SET is_happy_hour_service = true,
        happy_hour_open_time = '14:00',
        happy_hour_close_time = '17:00'
    WHERE happy_hour_open_time IS NULL
      AND happy_hour_close_time IS NULL
  `;

  for (const category of HAPPY_HOUR_CATEGORIES) {
    await sql`
      INSERT INTO menu_categories (name, menu_type, display_order)
      SELECT ${category.name}, 'happy-hour', ${category.displayOrder}
      WHERE NOT EXISTS (
        SELECT 1 FROM menu_categories
        WHERE menu_type = 'happy-hour' AND name = ${category.name}
      )
    `;
  }

  const existing = await sql`SELECT COUNT(*)::int AS count FROM menu_items WHERE menu_type = 'happy-hour'`;
  if (Number(existing.rows[0]?.count || 0) > 0) return;

  const orderByCategory = new Map<string, number>();
  for (const item of HAPPY_HOUR_ITEMS) {
    const displayOrder = (orderByCategory.get(item.category) || 0) + 1;
    orderByCategory.set(item.category, displayOrder);
    await sql`
      INSERT INTO menu_items (title, description, price, category, menu_type, is_available, display_order)
      VALUES (${item.title}, ${item.description}, ${item.price}, ${item.category}, 'happy-hour', true, ${displayOrder})
    `;
  }
}

function mapRestaurantHours(row: Record<string, unknown>): RestaurantHours {
  return {
    id: String(row.id),
    dayOfWeek: String(row.day_of_week),
    openTime: clockTime(row.open_time) || '',
    closeTime: clockTime(row.close_time) || '',
    isBreakfastService: Boolean(row.is_breakfast_service),
    breakfastOpenTime: clockTime(row.breakfast_open_time),
    breakfastCloseTime: clockTime(row.breakfast_close_time),
    isLunchService: Boolean(row.is_lunch_service),
    lunchOpenTime: clockTime(row.lunch_open_time),
    lunchCloseTime: clockTime(row.lunch_close_time),
    isHappyHourService: Boolean(row.is_happy_hour_service),
    happyHourOpenTime: clockTime(row.happy_hour_open_time),
    happyHourCloseTime: clockTime(row.happy_hour_close_time),
    isDinnerService: Boolean(row.is_dinner_service),
    dinnerOpenTime: clockTime(row.dinner_open_time),
    dinnerCloseTime: clockTime(row.dinner_close_time),
    isClosed: Boolean(row.is_closed),
    updatedAt: row.updated_at ? new Date(String(row.updated_at)) : new Date()
  };
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

  // Announcements
  static async getAnnouncements(): Promise<Announcement[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getAnnouncements();
    }

    try {
      const result = await sql`
        SELECT id, title, message, is_active as "isActive", priority,
               start_date as "startDate", end_date as "endDate",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM announcements 
        ORDER BY 
          CASE priority 
            WHEN 'high' THEN 3 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 1 
          END DESC,
          created_at DESC
      `;
      return result.rows as Announcement[];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async getActiveAnnouncements(): Promise<Announcement[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getActiveAnnouncements();
    }

    try {
      const result = await sql`
        SELECT id, title, message, is_active as "isActive", priority,
               start_date as "startDate", end_date as "endDate",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM announcements 
        WHERE is_active = true
          AND (start_date IS NULL OR start_date <= NOW())
          AND (end_date IS NULL OR end_date >= NOW())
        ORDER BY 
          CASE priority 
            WHEN 'high' THEN 3 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 1 
          END DESC,
          created_at DESC
      `;
      return result.rows as Announcement[];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async createAnnouncement(announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.createAnnouncement(announcementData);
    }

    try {
      const result = await sql`
        INSERT INTO announcements (title, message, is_active, priority, start_date, end_date)
        VALUES (${announcementData.title}, ${announcementData.message}, ${announcementData.isActive}, 
                ${announcementData.priority}, ${announcementData.startDate?.toISOString() || null}, ${announcementData.endDate?.toISOString() || null})
        RETURNING id, title, message, is_active as "isActive", priority,
                  start_date as "startDate", end_date as "endDate",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      return result.rows[0] as Announcement;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async updateAnnouncement(id: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt'>>): Promise<Announcement | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.updateAnnouncement(id, updates);
    }

    try {
      // Build dynamic query based on provided updates
      let query = 'UPDATE announcements SET updated_at = NOW()';
      const params: (string | boolean | Date | null)[] = [id];
      let paramIndex = 2;

      if (updates.title !== undefined) {
        query += `, title = $${paramIndex}`;
        params.push(updates.title);
        paramIndex++;
      }
      if (updates.message !== undefined) {
        query += `, message = $${paramIndex}`;
        params.push(updates.message);
        paramIndex++;
      }
      if (updates.isActive !== undefined) {
        query += `, is_active = $${paramIndex}`;
        params.push(updates.isActive);
        paramIndex++;
      }
      if (updates.priority !== undefined) {
        query += `, priority = $${paramIndex}`;
        params.push(updates.priority);
        paramIndex++;
      }
      if (updates.startDate !== undefined) {
        query += `, start_date = $${paramIndex}`;
        params.push(updates.startDate);
        paramIndex++;
      }
      if (updates.endDate !== undefined) {
        query += `, end_date = $${paramIndex}`;
        params.push(updates.endDate);
        paramIndex++;
      }

      query += ' WHERE id = $1 RETURNING id, title, message, is_active as "isActive", priority, start_date as "startDate", end_date as "endDate", created_at as "createdAt", updated_at as "updatedAt"';

      const result = await sql.query(query, params);
      return result.rows[0] as Announcement || null;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async deleteAnnouncement(id: string): Promise<Announcement | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.deleteAnnouncement(id);
    }

    try {
      const result = await sql`
        DELETE FROM announcements WHERE id = ${id}
        RETURNING id, title, message, is_active as "isActive", priority,
                  start_date as "startDate", end_date as "endDate",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      return result.rows[0] as Announcement || null;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  // Accolades
  private static mapAccoladeRow(row: {
    id: string | number;
    title: string;
    description: string | null;
    link: string | null;
    images: string[] | string | null;
    displayOrder: number | null;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): Accolade {
    let images: string[] = [];
    if (Array.isArray(row.images)) {
      images = row.images;
    } else if (typeof row.images === 'string') {
      try {
        const parsed = JSON.parse(row.images);
        images = Array.isArray(parsed) ? parsed : [];
      } catch {
        images = row.images ? [row.images] : [];
      }
    }

    return {
      id: String(row.id),
      title: row.title,
      description: row.description || '',
      link: row.link || undefined,
      images,
      displayOrder: row.displayOrder ?? 0,
      isActive: row.isActive,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  static async getAccolades(): Promise<Accolade[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getAccolades();
    }

    try {
      const result = await sql`
        SELECT id, title, description, link, images,
               display_order as "displayOrder", is_active as "isActive",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM accolades
        ORDER BY display_order ASC, created_at DESC
      `;
      return result.rows.map((row) => this.mapAccoladeRow(row as Parameters<typeof DatabaseService.mapAccoladeRow>[0]));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async getActiveAccolades(): Promise<Accolade[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getActiveAccolades();
    }

    try {
      const result = await sql`
        SELECT id, title, description, link, images,
               display_order as "displayOrder", is_active as "isActive",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM accolades
        WHERE is_active = true
        ORDER BY display_order ASC, created_at DESC
      `;
      return result.rows.map((row) => this.mapAccoladeRow(row as Parameters<typeof DatabaseService.mapAccoladeRow>[0]));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async createAccolade(accoladeData: Omit<Accolade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Accolade | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.createAccolade(accoladeData);
    }

    try {
      const imagesJson = JSON.stringify(accoladeData.images || []);
      const result = await sql`
        INSERT INTO accolades (title, description, link, images, display_order, is_active)
        VALUES (
          ${accoladeData.title},
          ${accoladeData.description || ''},
          ${accoladeData.link || null},
          ${imagesJson}::jsonb,
          ${accoladeData.displayOrder ?? 0},
          ${accoladeData.isActive ?? true}
        )
        RETURNING id, title, description, link, images,
                  display_order as "displayOrder", is_active as "isActive",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      return this.mapAccoladeRow(result.rows[0] as Parameters<typeof DatabaseService.mapAccoladeRow>[0]);
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async updateAccolade(id: string, updates: Partial<Omit<Accolade, 'id' | 'createdAt'>>): Promise<Accolade | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.updateAccolade(id, updates);
    }

    try {
      let query = 'UPDATE accolades SET updated_at = NOW()';
      const params: (string | boolean | number | null)[] = [id];
      let paramIndex = 2;

      if (updates.title !== undefined) {
        query += `, title = $${paramIndex}`;
        params.push(updates.title);
        paramIndex++;
      }
      if (updates.description !== undefined) {
        query += `, description = $${paramIndex}`;
        params.push(updates.description);
        paramIndex++;
      }
      if (updates.link !== undefined) {
        query += `, link = $${paramIndex}`;
        params.push(updates.link || null);
        paramIndex++;
      }
      if (updates.images !== undefined) {
        query += `, images = $${paramIndex}::jsonb`;
        params.push(JSON.stringify(updates.images));
        paramIndex++;
      }
      if (updates.displayOrder !== undefined) {
        query += `, display_order = $${paramIndex}`;
        params.push(updates.displayOrder);
        paramIndex++;
      }
      if (updates.isActive !== undefined) {
        query += `, is_active = $${paramIndex}`;
        params.push(updates.isActive);
        paramIndex++;
      }

      query += ' WHERE id = $1 RETURNING id, title, description, link, images, display_order as "displayOrder", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"';

      const result = await sql.query(query, params);
      if (!result.rows[0]) return null;
      return this.mapAccoladeRow(result.rows[0] as Parameters<typeof DatabaseService.mapAccoladeRow>[0]);
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async deleteAccolade(id: string): Promise<Accolade | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.deleteAccolade(id);
    }

    try {
      const result = await sql`
        DELETE FROM accolades WHERE id = ${id}
        RETURNING id, title, description, link, images,
                  display_order as "displayOrder", is_active as "isActive",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      if (!result.rows[0]) return null;
      return this.mapAccoladeRow(result.rows[0] as Parameters<typeof DatabaseService.mapAccoladeRow>[0]);
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  // Chef Bios
  private static mapChefBioRow(row: {
    id: string | number;
    name: string;
    role: string | null;
    title: string | null;
    quote: string | null;
    bio: string | null;
    imageUrl: string | null;
    displayOrder: number | null;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): ChefBio {
    return {
      id: String(row.id),
      name: row.name,
      role: row.role || '',
      title: row.title || '',
      quote: row.quote || '',
      bio: row.bio || '',
      imageUrl: row.imageUrl || '',
      displayOrder: row.displayOrder ?? 0,
      isActive: row.isActive,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  static async getChefBios(): Promise<ChefBio[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getChefBios();
    }

    try {
      const result = await sql`
        SELECT id, name, role, title, quote, bio,
               image_url as "imageUrl",
               display_order as "displayOrder", is_active as "isActive",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM chef_bios
        ORDER BY display_order ASC, created_at DESC
      `;
      return result.rows.map((row) => this.mapChefBioRow(row as Parameters<typeof DatabaseService.mapChefBioRow>[0]));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async getActiveChefBios(): Promise<ChefBio[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getActiveChefBios();
    }

    try {
      const result = await sql`
        SELECT id, name, role, title, quote, bio,
               image_url as "imageUrl",
               display_order as "displayOrder", is_active as "isActive",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM chef_bios
        WHERE is_active = true
        ORDER BY display_order ASC, created_at DESC
      `;
      return result.rows.map((row) => this.mapChefBioRow(row as Parameters<typeof DatabaseService.mapChefBioRow>[0]));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async createChefBio(chefData: Omit<ChefBio, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChefBio | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.createChefBio(chefData);
    }

    try {
      const result = await sql`
        INSERT INTO chef_bios (name, role, title, quote, bio, image_url, display_order, is_active)
        VALUES (
          ${chefData.name},
          ${chefData.role || ''},
          ${chefData.title || ''},
          ${chefData.quote || ''},
          ${chefData.bio || ''},
          ${chefData.imageUrl || ''},
          ${chefData.displayOrder ?? 0},
          ${chefData.isActive ?? true}
        )
        RETURNING id, name, role, title, quote, bio,
                  image_url as "imageUrl",
                  display_order as "displayOrder", is_active as "isActive",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      return this.mapChefBioRow(result.rows[0] as Parameters<typeof DatabaseService.mapChefBioRow>[0]);
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async updateChefBio(id: string, updates: Partial<Omit<ChefBio, 'id' | 'createdAt'>>): Promise<ChefBio | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.updateChefBio(id, updates);
    }

    try {
      let query = 'UPDATE chef_bios SET updated_at = NOW()';
      const params: (string | boolean | number | null)[] = [id];
      let paramIndex = 2;

      if (updates.name !== undefined) {
        query += `, name = $${paramIndex}`;
        params.push(updates.name);
        paramIndex++;
      }
      if (updates.role !== undefined) {
        query += `, role = $${paramIndex}`;
        params.push(updates.role);
        paramIndex++;
      }
      if (updates.title !== undefined) {
        query += `, title = $${paramIndex}`;
        params.push(updates.title);
        paramIndex++;
      }
      if (updates.quote !== undefined) {
        query += `, quote = $${paramIndex}`;
        params.push(updates.quote);
        paramIndex++;
      }
      if (updates.bio !== undefined) {
        query += `, bio = $${paramIndex}`;
        params.push(updates.bio);
        paramIndex++;
      }
      if (updates.imageUrl !== undefined) {
        query += `, image_url = $${paramIndex}`;
        params.push(updates.imageUrl);
        paramIndex++;
      }
      if (updates.displayOrder !== undefined) {
        query += `, display_order = $${paramIndex}`;
        params.push(updates.displayOrder);
        paramIndex++;
      }
      if (updates.isActive !== undefined) {
        query += `, is_active = $${paramIndex}`;
        params.push(updates.isActive);
        paramIndex++;
      }

      query += ' WHERE id = $1 RETURNING id, name, role, title, quote, bio, image_url as "imageUrl", display_order as "displayOrder", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"';

      const result = await sql.query(query, params);
      if (!result.rows[0]) return null;
      return this.mapChefBioRow(result.rows[0] as Parameters<typeof DatabaseService.mapChefBioRow>[0]);
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async deleteChefBio(id: string): Promise<ChefBio | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.deleteChefBio(id);
    }

    try {
      const result = await sql`
        DELETE FROM chef_bios WHERE id = ${id}
        RETURNING id, name, role, title, quote, bio,
                  image_url as "imageUrl",
                  display_order as "displayOrder", is_active as "isActive",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      if (!result.rows[0]) return null;
      return this.mapChefBioRow(result.rows[0] as Parameters<typeof DatabaseService.mapChefBioRow>[0]);
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  // Menu Items
  static async getMenuItems(menuType?: MenuType): Promise<MenuItem[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getMenuItems(menuType);
    }

    try {
      await ensureHappyHourSupport();
      const query = menuType 
        ? sql`SELECT * FROM menu_items WHERE menu_type = ${menuType} ORDER BY display_order NULLS LAST, created_at DESC`
        : sql`SELECT * FROM menu_items ORDER BY display_order NULLS LAST, created_at DESC`;

      const result = await query;
      return result.rows.map(row => ({
        id: row.id?.toString?.() ?? String(row.id),
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        category: row.category,
        menuType: row.menu_type as MenuType,
        imageUrl: row.image_url,
        isAvailable: row.is_available,
        displayOrder: row.display_order ?? undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      // If display_order column doesn't exist, add it and fall back to created_at ordering
      // NeonDbError code 42703 = undefined column
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = error;
      if (err?.code === '42703') {
        try {
          await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS display_order INTEGER`;
        } catch (alterError) {
          console.warn('Could not add display_order to menu_items (may already exist):', alterError);
        }
        try {
          const fallbackQuery = menuType
            ? sql`SELECT * FROM menu_items WHERE menu_type = ${menuType} ORDER BY created_at DESC`
            : sql`SELECT * FROM menu_items ORDER BY created_at DESC`;
          const result = await fallbackQuery;
          return result.rows.map(row => ({
            id: row.id?.toString?.() ?? String(row.id),
            title: row.title,
            description: row.description,
            price: parseFloat(row.price),
            category: row.category,
            menuType: row.menu_type as MenuType,
            imageUrl: row.image_url,
            isAvailable: row.is_available,
            displayOrder: row.display_order ?? undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
          }));
        } catch (fallbackError) {
          console.error('Fallback query failed:', fallbackError);
          return [];
        }
      }
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
      // Determine next display order for this category/menuType
      const next = await sql`SELECT COALESCE(MAX(display_order), 0) + 1 as next FROM menu_items WHERE menu_type = ${item.menuType} AND category = ${item.category}`;
      const nextOrder = (next.rows?.[0]?.next as number) || 1;

      const result = await sql`
        INSERT INTO menu_items (title, description, price, category, menu_type, image_url, is_available, display_order)
        VALUES (${item.title}, ${item.description}, ${item.price}, ${item.category}, ${item.menuType}, ${item.imageUrl || null}, ${item.isAvailable}, ${nextOrder})
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
        displayOrder: row.display_order ?? undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async updateMenuItem(
    id: string,
    updates: Partial<Pick<MenuItem, 'title' | 'description' | 'price' | 'category' | 'menuType' | 'imageUrl' | 'isAvailable' | 'displayOrder'>>
  ): Promise<MenuItem | null> {
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
            display_order = COALESCE(${updates.displayOrder}, display_order),
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
        displayOrder: row.display_order ?? undefined,
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
        displayOrder: row.display_order ?? undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  static async reorderMenuItems(
    menuType: MenuType,
    category: string,
    orderedIds: string[]
  ): Promise<MenuItem[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.reorderMenuItems(menuType, category, orderedIds);
    }

    try {
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        await sql`UPDATE menu_items SET display_order = ${i + 1} WHERE id = ${id} AND menu_type = ${menuType} AND category = ${category}`;
      }
      const result = await sql`SELECT * FROM menu_items WHERE menu_type = ${menuType} AND category = ${category} ORDER BY display_order NULLS LAST, created_at DESC`;
      return result.rows.map(row => ({
        id: row.id.toString(),
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        category: row.category,
        menuType: row.menu_type as MenuType,
        imageUrl: row.image_url,
        isAvailable: row.is_available,
        displayOrder: row.display_order ?? undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  // Menu Categories
  static async getMenuCategories(menuType?: MenuType): Promise<MenuCategory[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getMenuCategories(menuType);
    }

    try {
      await ensureHappyHourSupport();
      const query = menuType
        ? sql`SELECT * FROM menu_categories WHERE menu_type = ${menuType} ORDER BY display_order`
        : sql`SELECT * FROM menu_categories ORDER BY display_order`;
      
      const result = await query;
      return result.rows.map(row => ({
        id: row.id.toString(),
        name: row.name,
        menuType: row.menu_type as MenuType,
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

  static async updateMenuCategory(id: string, updates: Partial<Pick<MenuCategory, 'name' | 'displayOrder'>>): Promise<MenuCategory | null> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.updateMenuCategory(id, updates);
    }

    try {
      const result = await sql`
        UPDATE menu_categories
        SET name = COALESCE(${updates.name}, name),
            display_order = COALESCE(${updates.displayOrder}, display_order)
        WHERE id = ${id}
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

  static async renameCategoryInItems(
    menuType: MenuType,
    oldName: string,
    newName: string
  ): Promise<number> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.renameCategoryInItems(menuType, oldName, newName);
    }
    try {
      const result = await sql`
        UPDATE menu_items
        SET category = ${newName}
        WHERE menu_type = ${menuType} AND category = ${oldName}
      `;
      // @vercel/postgres doesn't return affected rows count reliably; return 0
      return 0;
    } catch (error) {
      console.error('Database error:', error);
      return 0;
    }
  }

  static async reorderMenuCategories(
    menuType: MenuType,
    orderedIds: string[]
  ): Promise<MenuCategory[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.reorderMenuCategories(menuType, orderedIds);
    }

    try {
      // Update each category's display_order based on the provided order
      // Using sequential updates for simplicity
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        await sql`UPDATE menu_categories SET display_order = ${i + 1} WHERE id = ${id} AND menu_type = ${menuType}`;
      }

      // Return the updated list
      const result = await sql`SELECT * FROM menu_categories WHERE menu_type = ${menuType} ORDER BY display_order`;
      return result.rows.map(row => ({
        id: row.id.toString(),
        name: row.name,
        menuType: row.menu_type as MenuType,
        displayOrder: row.display_order,
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  // Restaurant Hours
  static async getRestaurantHours(): Promise<RestaurantHours[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.db) {
      return devDatabase.db.getRestaurantHours();
    }

    try {
      await ensureHappyHourSupport();
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
      
      return result.rows.map(row => mapRestaurantHours(row));
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
      await ensureHappyHourSupport();
      const result = await sql`
        INSERT INTO restaurant_hours (
          day_of_week, is_closed, 
          is_breakfast_service, breakfast_open_time, breakfast_close_time,
          is_lunch_service, lunch_open_time, lunch_close_time,
          is_happy_hour_service, happy_hour_open_time, happy_hour_close_time,
          is_dinner_service, dinner_open_time, dinner_close_time,
          open_time, close_time
        ) VALUES (
          ${hoursData.dayOfWeek}, ${hoursData.isClosed},
          ${hoursData.isBreakfastService}, ${hoursData.breakfastOpenTime ?? null}, ${hoursData.breakfastCloseTime ?? null},
          ${hoursData.isLunchService}, ${hoursData.lunchOpenTime ?? null}, ${hoursData.lunchCloseTime ?? null},
          ${hoursData.isHappyHourService}, ${hoursData.happyHourOpenTime ?? null}, ${hoursData.happyHourCloseTime ?? null},
          ${hoursData.isDinnerService}, ${hoursData.dinnerOpenTime ?? null}, ${hoursData.dinnerCloseTime ?? null},
          ${hoursData.openTime}, ${hoursData.closeTime}
        )
        RETURNING *
      `;

      return result.rows[0] ? mapRestaurantHours(result.rows[0]) : null;
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
      await ensureHappyHourSupport();
      const result = await sql`
        UPDATE restaurant_hours
        SET is_closed = COALESCE(${updates.isClosed}, is_closed),
            is_breakfast_service = COALESCE(${updates.isBreakfastService}, is_breakfast_service),
            breakfast_open_time = COALESCE(${updates.breakfastOpenTime}, breakfast_open_time),
            breakfast_close_time = COALESCE(${updates.breakfastCloseTime}, breakfast_close_time),
            is_lunch_service = COALESCE(${updates.isLunchService}, is_lunch_service),
            lunch_open_time = COALESCE(${updates.lunchOpenTime}, lunch_open_time),
            lunch_close_time = COALESCE(${updates.lunchCloseTime}, lunch_close_time),
            is_happy_hour_service = COALESCE(${updates.isHappyHourService}, is_happy_hour_service),
            happy_hour_open_time = COALESCE(${updates.happyHourOpenTime}, happy_hour_open_time),
            happy_hour_close_time = COALESCE(${updates.happyHourCloseTime}, happy_hour_close_time),
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

      return mapRestaurantHours(result.rows[0]);
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  // Menu Status
  static async getMenuStatuses(): Promise<MenuStatus[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.getMenuStatuses) {
      return [...devDatabase.getMenuStatuses()].sort((a, b) => compareMenuTypes(a.menuType, b.menuType));
    }

    try {
      await ensureHappyHourSupport();
      const result = await sql`SELECT * FROM menu_status`;
      const statuses = result.rows.map(row => ({
        id: row.id.toString(),
        menuType: row.menu_type as MenuType,
        isEnabled: row.is_enabled,
        updatedAt: new Date(row.updated_at)
      }));
      return statuses.sort((a, b) => compareMenuTypes(a.menuType, b.menuType));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  static async updateMenuStatus(menuType: MenuType, isEnabled: boolean): Promise<MenuStatus[]> {
    const devDatabase = initDevDB();
    if (process.env.NODE_ENV !== 'production' && devDatabase?.updateMenuStatus) {
      return devDatabase.updateMenuStatus(menuType, isEnabled);
    }

    try {
      await ensureHappyHourSupport();
      await sql`
        INSERT INTO menu_status (menu_type, is_enabled)
        VALUES (${menuType}, ${isEnabled})
        ON CONFLICT (menu_type) DO UPDATE
        SET is_enabled = ${isEnabled}, updated_at = CURRENT_TIMESTAMP
      `;

      return this.getMenuStatuses();
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }
}