import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menuType = searchParams.get('menuType') as 'breakfast' | 'lunch' | 'dinner' | null;

    const menuItems = await DatabaseService.getMenuItems(menuType || undefined);

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const menuItem = await DatabaseService.createMenuItem({
      title: body.title,
      description: body.description,
      price: parseFloat(body.price),
      category: body.category,
      menuType: body.menuType,
      imageUrl: body.imageUrl,
      isAvailable: body.isAvailable ?? true
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Failed to create menu item' },
        { status: 500 }
      );
    }

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}