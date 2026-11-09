import { NextResponse } from 'next/server';
import { sortMenuTypes } from '../../../../lib/database';
import { DatabaseService } from '../../../../lib/database-service';

export async function GET() {
  try {
    const statuses = await DatabaseService.getMenuStatuses();

    // Enabled types in canonical order: breakfast → lunch → happy-hour → dinner
    const enabledMenus = sortMenuTypes(
      statuses.filter(status => status.isEnabled).map(status => status.menuType)
    );

    return NextResponse.json(enabledMenus);
  } catch (error) {
    console.error('Error fetching enabled menus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}