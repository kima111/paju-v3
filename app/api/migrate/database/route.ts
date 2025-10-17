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

    console.log('Running database migration...');

    // Migration 1: Add missing columns to users table
    try {
      await sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
      `;
      console.log('✅ Added is_active column to users table');
    } catch (error) {
      console.log('is_active column might already exist:', error);
    }

    try {
      await sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `;
      console.log('✅ Added created_at column to users table');
    } catch (error) {
      console.log('created_at column might already exist:', error);
    }

    try {
      await sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `;
      console.log('✅ Added updated_at column to users table');
    } catch (error) {
      console.log('updated_at column might already exist:', error);
    }

    // Migration 2: Create announcements table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Ensured announcements table exists');

    // Migration 3: Add display_order to menu_items and backfill
    try {
      await sql`
        ALTER TABLE menu_items 
        ADD COLUMN IF NOT EXISTS display_order INTEGER
      `;
      console.log('✅ Ensured display_order column exists on menu_items');
      // Backfill only where null
      await sql`
        WITH ranked AS (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY menu_type, category ORDER BY created_at) AS rn
          FROM menu_items
          WHERE display_order IS NULL
        )
        UPDATE menu_items m
        SET display_order = r.rn
        FROM ranked r
        WHERE m.id = r.id
      `;
      console.log('✅ Backfilled display_order for existing menu_items');
    } catch (error) {
      console.log('display_order migration for menu_items may have been applied already:', error);
    }

    // Check current users
    const userCheck = await sql`SELECT username, role, is_active FROM users`;
    console.log('Current users after migration:', userCheck.rows);

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      migrations: [
        'Added is_active column to users table',
        'Added created_at column to users table', 
        'Added updated_at column to users table',
        'Ensured announcements table exists',
        'Ensured display_order column on menu_items and backfilled nulls'
      ],
      users: userCheck.rows
    }, { headers });

  } catch (error) {
    console.error('Database migration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to migrate database', details: errorMessage },
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