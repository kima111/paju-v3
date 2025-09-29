import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database-service';
import { verifyJWT } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const categories = await DatabaseService.getMenuCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, menuType } = body;

    if (!name || !menuType) {
      return NextResponse.json(
        { error: 'Name and menu type are required' },
        { status: 400 }
      );
    }

    if (!['breakfast', 'lunch', 'dinner'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type' },
        { status: 400 }
      );
    }

    const category = await DatabaseService.createMenuCategory({
      name: name.trim(),
      menuType,
      displayOrder: 1
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}