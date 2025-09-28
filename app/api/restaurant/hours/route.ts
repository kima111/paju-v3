import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';
import { verifyJWT } from '../../../../lib/auth';

export async function GET() {
  const hours = db.getRestaurantHours();
  return NextResponse.json(hours);
}

export async function PUT(request: NextRequest) {
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
    const { dayId, ...updates } = body;

    if (!dayId) {
      return NextResponse.json({ error: 'Day ID is required' }, { status: 400 });
    }

    const updatedHour = db.updateRestaurantHours(dayId, updates);

    if (!updatedHour) {
      return NextResponse.json({ error: 'Restaurant hours not found' }, { status: 404 });
    }

    return NextResponse.json(updatedHour);
  } catch (error) {
    console.error('Error updating restaurant hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}