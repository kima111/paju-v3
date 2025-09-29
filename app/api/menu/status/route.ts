import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';

export async function GET() {
  try {
    const statuses = await DatabaseService.getMenuStatuses();
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching menu statuses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { menuType, isEnabled } = body;

    const statuses = await DatabaseService.updateMenuStatus(menuType, isEnabled);

    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error updating menu status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}