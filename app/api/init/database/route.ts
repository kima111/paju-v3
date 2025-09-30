import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import * as bcrypt from 'bcryptjs';

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
        { error: 'Unauthorized', expectedSecret: process.env.INIT_SECRET ? 'Set' : 'Not Set' },
        { status: 401, headers }
      );
    }

    console.log('Initializing database...');

    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create announcements table if it doesn't exist
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

    // Hash the default admin password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert default admin user
    await sql`
      INSERT INTO users (username, password_hash, role, is_active) 
      VALUES ('admin', ${hashedPassword}, 'admin', true)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = ${hashedPassword},
        role = 'admin',
        is_active = true,
        updated_at = CURRENT_TIMESTAMP
    `;

    // Insert default editor user  
    const editorPassword = await bcrypt.hash('editor123', 10);
    await sql`
      INSERT INTO users (username, password_hash, role, is_active) 
      VALUES ('editor', ${editorPassword}, 'editor', true)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = ${editorPassword},
        role = 'editor',
        is_active = true,
        updated_at = CURRENT_TIMESTAMP
    `;

    console.log('Database initialization completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      users: [
        { username: 'admin', role: 'admin' },
        { username: 'editor', role: 'editor' }
      ]
    }, { headers });

  } catch (error) {
    console.error('Database initialization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to initialize database', details: errorMessage },
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