import { NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';

export async function GET() {
  try {
    const statuses = await DatabaseService.getMenuStatuses();
    
    // Return only the enabled menu types as an array
    const enabledMenus = statuses
      .filter(status => status.isEnabled)
      .map(status => status.menuType);

    return NextResponse.json(enabledMenus);
  } catch (error) {
    console.error('Error fetching enabled menus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}