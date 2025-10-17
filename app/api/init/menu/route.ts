import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Only allow this in development or if a specific secret is provided
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (process.env.NODE_ENV === 'production' && secret !== process.env.INIT_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers }
      );
    }

    console.log('Initializing menu data...');

    // Create menu_categories table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        menu_type VARCHAR(20) NOT NULL CHECK (menu_type IN ('breakfast', 'lunch', 'dinner')),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create menu_items table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        menu_type VARCHAR(20) NOT NULL CHECK (menu_type IN ('breakfast', 'lunch', 'dinner')),
        image_url TEXT,
        is_available BOOLEAN DEFAULT true,
        display_order INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create menu_status table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS menu_status (
        id SERIAL PRIMARY KEY,
        menu_type VARCHAR(20) NOT NULL UNIQUE CHECK (menu_type IN ('breakfast', 'lunch', 'dinner')),
        is_enabled BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default menu categories
    await sql`
      INSERT INTO menu_categories (name, menu_type, display_order) VALUES 
      ('Appetizers', 'dinner', 1),
      ('Main Courses', 'dinner', 2),
      ('Desserts', 'dinner', 3),
      ('Hot Breakfast', 'breakfast', 1),
      ('Pastries', 'breakfast', 2),
      ('Soups', 'lunch', 1),
      ('Entrees', 'lunch', 2)
      ON CONFLICT DO NOTHING
    `;

    // Insert sample menu items
    await sql`
      INSERT INTO menu_items (title, description, price, category, menu_type, is_available) VALUES 
      ('Korean BBQ Bulgogi', 'Thinly sliced marinated beef grilled to perfection, served with steamed rice and banchan', 28.00, 'Main Courses', 'dinner', true),
      ('Bibimbap', 'Traditional mixed rice bowl with seasoned vegetables, choice of protein, and gochujang', 22.00, 'Main Courses', 'dinner', true),
      ('Kimchi Jjigae', 'Spicy kimchi stew with pork belly and tofu, served with steamed rice', 18.00, 'Main Courses', 'dinner', true),
      ('Korean Fried Chicken', 'Crispy double-fried chicken wings with sweet and spicy glaze', 16.00, 'Appetizers', 'dinner', true),
      ('Pajeon', 'Savory scallion pancake with dipping sauce', 14.00, 'Appetizers', 'dinner', true),
      ('Hotteok', 'Sweet Korean pancake filled with brown sugar, cinnamon, and nuts', 8.00, 'Desserts', 'dinner', true),
      ('Korean Toast', 'Fluffy sandwich with egg, cabbage, and special sauce', 12.00, 'Hot Breakfast', 'breakfast', true),
      ('Kimchi Pancake', 'Crispy pancake made with fermented kimchi', 10.00, 'Hot Breakfast', 'breakfast', true),
      ('Sweet Red Bean Bun', 'Soft steamed bun filled with sweet red bean paste', 6.00, 'Pastries', 'breakfast', true),
      ('Korean Corn Dog', 'Rice batter coated sausage on a stick', 8.00, 'Entrees', 'lunch', true),
      ('Ramen Bowl', 'Rich pork bone broth with fresh noodles and toppings', 16.00, 'Soups', 'lunch', true)
      ON CONFLICT DO NOTHING
    `;

    // Enable all menus by default
    await sql`
      INSERT INTO menu_status (menu_type, is_enabled) VALUES 
      ('breakfast', true),
      ('lunch', true),
      ('dinner', true)
      ON CONFLICT (menu_type) DO UPDATE SET
        is_enabled = true,
        updated_at = CURRENT_TIMESTAMP
    `;

    console.log('Menu initialization completed successfully');

    // Get counts to return
    const itemsCount = await sql`SELECT COUNT(*) as count FROM menu_items`;
    const categoriesCount = await sql`SELECT COUNT(*) as count FROM menu_categories`;
    const statusCount = await sql`SELECT COUNT(*) as count FROM menu_status WHERE is_enabled = true`;

    return NextResponse.json({
      success: true,
      message: 'Menu data initialized successfully',
      stats: {
        menuItems: itemsCount.rows[0].count,
        categories: categoriesCount.rows[0].count,
        enabledMenus: statusCount.rows[0].count
      }
    }, { headers });

  } catch (error) {
    console.error('Menu initialization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to initialize menu data', details: errorMessage },
      { status: 500, headers }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}