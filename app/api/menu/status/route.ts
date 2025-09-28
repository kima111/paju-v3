import { NextRequest, NextResponse } from 'next/server';
import { getMenuStatuses, updateMenuStatus } from '../../../../lib/database';
import { verifyJWT } from '../../../../lib/auth';

// GET /api/menu/status
export async function GET() {
  try {
    const statuses = getMenuStatuses();
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching menu statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu statuses' },
      { status: 500 }
    );
  }
}

// PUT /api/menu/status
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { menuType, isEnabled } = await request.json();

    if (!menuType || typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Menu type and enabled status are required' },
        { status: 400 }
      );
    }

    if (!['breakfast', 'lunch', 'dinner'].includes(menuType)) {
      return NextResponse.json(
        { error: 'Invalid menu type' },
        { status: 400 }
      );
    }

    const updatedStatuses = updateMenuStatus(menuType, isEnabled);
    return NextResponse.json(updatedStatuses);
  } catch (error) {
    console.error('Error updating menu status:', error);
    return NextResponse.json(
      { error: 'Failed to update menu status' },
      { status: 500 }
    );
  }
}