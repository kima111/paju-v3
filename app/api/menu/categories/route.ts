import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';
import { verifyJWT } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const menuType = searchParams.get('menuType') as 'lunch' | 'dinner' | null;
  
  const categories = db.getMenuCategories(menuType || undefined);
  return NextResponse.json(categories);
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
    const { name, menuType, displayOrder } = body;

    if (!name || !menuType) {
      return NextResponse.json({ error: 'Name and menuType are required' }, { status: 400 });
    }

    const newCategory = db.createMenuCategory({
      name,
      menuType,
      displayOrder: displayOrder || 999,
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}