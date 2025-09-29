import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';

export async function GET() {
  try {
    const hours = await DatabaseService.getRestaurantHours();
    return NextResponse.json(hours);
  } catch (error) {
    console.error('Error fetching restaurant hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { dayId, ...updates } = body;

    const updatedHours = await DatabaseService.updateRestaurantHours(dayId, updates);

    if (!updatedHours) {
      return NextResponse.json(
        { error: 'Failed to update restaurant hours' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedHours);
  } catch (error) {
    console.error('Error updating restaurant hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}