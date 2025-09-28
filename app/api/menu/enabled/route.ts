import { NextResponse } from 'next/server';
import { getMenuStatuses } from '../../../../lib/database';

// GET /api/menu/enabled - Public endpoint to get enabled menus
export async function GET() {
  try {
    const statuses = getMenuStatuses();
    const enabledMenus = statuses.filter(status => status.isEnabled);
    return NextResponse.json(enabledMenus.map(status => status.menuType));
  } catch (error) {
    console.error('Error fetching enabled menus:', error);
    return NextResponse.json([], { status: 500 });
  }
}