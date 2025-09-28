import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';
import { verifyJWT } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const menuType = searchParams.get('menuType') as 'lunch' | 'dinner' | null;
  
  const menuItems = db.getMenuItems(menuType || undefined);
  return NextResponse.json(menuItems);
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, price, category, menuType, isAvailable } = body;

    if (!title || !description || !price || !category || !menuType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newItem = db.createMenuItem({
      title,
      description,
      price: parseFloat(price),
      category,
      menuType,
      isAvailable: isAvailable !== false,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}