import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    console.log('Checking database status...');

    // Check if users table exists and get users
    let users: Array<{id: number, username: string, role: string, is_active: boolean, created_at: string}> = [];
    try {
      const result = await sql`
        SELECT id, username, role, is_active, created_at 
        FROM users 
        ORDER BY created_at
      `;
      users = result.rows as typeof users;
    } catch (error) {
      console.log('Users table error:', error);
    }

    // Check if announcements table exists
    let announcements: Array<{id: number, title: string, is_active: boolean, priority: string, created_at: string}> = [];
    try {
      const result = await sql`
        SELECT id, title, is_active, priority, created_at 
        FROM announcements 
        ORDER BY created_at
      `;
      announcements = result.rows as typeof announcements;
    } catch (error) {
      console.log('Announcements table error:', error);
    }

    // Check database connection
    const dbInfo = await sql`SELECT current_database(), current_user, version()`;

    return NextResponse.json({
      success: true,
      database: dbInfo.rows[0],
      users,
      announcements,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { headers });

  } catch (error) {
    console.error('Database check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to check database', details: errorMessage },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}