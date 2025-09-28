import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';
import { verifyJWT } from '../../../lib/auth';
import type { MenuCategory } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = db.getMenuCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, menuType = 'lunch' } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check if category already exists for this menu type
    const existingCategories = db.getMenuCategories();
    const menuTypeCategories = existingCategories.filter(cat => cat.menuType === menuType);
    
    if (menuTypeCategories.some((cat: MenuCategory) => cat.name.toLowerCase() === name.trim().toLowerCase())) {
      return NextResponse.json({ error: `Category already exists in ${menuType} menu` }, { status: 409 });
    }

    const newCategory = db.createMenuCategory({
      name: name.trim(),
      menuType,
      displayOrder: menuTypeCategories.length
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}