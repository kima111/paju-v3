import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';
import { verifyJWT } from '../../../../lib/auth';

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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if hours already exist
    const existingHours = await DatabaseService.getRestaurantHours();
    if (existingHours && existingHours.length > 0) {
      return NextResponse.json({
        message: 'Restaurant hours already exist',
        count: existingHours.length
      });
    }

    // Initialize default hours for all days
    const defaultHours = [
      {
        dayOfWeek: 'Monday',
        isClosed: false,
        isBreakfastService: false,
        breakfastOpenTime: undefined,
        breakfastCloseTime: undefined,
        isLunchService: true,
        lunchOpenTime: '11:00',
        lunchCloseTime: '15:00',
        isDinnerService: true,
        dinnerOpenTime: '17:00',
        dinnerCloseTime: '21:00',
        openTime: '11:00',
        closeTime: '21:00'
      },
      {
        dayOfWeek: 'Tuesday',
        isClosed: false,
        isBreakfastService: false,
        breakfastOpenTime: undefined,
        breakfastCloseTime: undefined,
        isLunchService: true,
        lunchOpenTime: '11:00',
        lunchCloseTime: '15:00',
        isDinnerService: true,
        dinnerOpenTime: '17:00',
        dinnerCloseTime: '21:00',
        openTime: '11:00',
        closeTime: '21:00'
      },
      {
        dayOfWeek: 'Wednesday',
        isClosed: false,
        isBreakfastService: false,
        breakfastOpenTime: undefined,
        breakfastCloseTime: undefined,
        isLunchService: true,
        lunchOpenTime: '11:00',
        lunchCloseTime: '15:00',
        isDinnerService: true,
        dinnerOpenTime: '17:00',
        dinnerCloseTime: '21:00',
        openTime: '11:00',
        closeTime: '21:00'
      },
      {
        dayOfWeek: 'Thursday',
        isClosed: false,
        isBreakfastService: false,
        breakfastOpenTime: undefined,
        breakfastCloseTime: undefined,
        isLunchService: true,
        lunchOpenTime: '11:00',
        lunchCloseTime: '15:00',
        isDinnerService: true,
        dinnerOpenTime: '17:00',
        dinnerCloseTime: '21:00',
        openTime: '11:00',
        closeTime: '21:00'
      },
      {
        dayOfWeek: 'Friday',
        isClosed: false,
        isBreakfastService: false,
        breakfastOpenTime: undefined,
        breakfastCloseTime: undefined,
        isLunchService: true,
        lunchOpenTime: '11:00',
        lunchCloseTime: '15:00',
        isDinnerService: true,
        dinnerOpenTime: '17:00',
        dinnerCloseTime: '22:00',
        openTime: '11:00',
        closeTime: '22:00'
      },
      {
        dayOfWeek: 'Saturday',
        isClosed: false,
        isBreakfastService: true,
        breakfastOpenTime: '08:00',
        breakfastCloseTime: '11:00',
        isLunchService: true,
        lunchOpenTime: '11:00',
        lunchCloseTime: '15:00',
        isDinnerService: true,
        dinnerOpenTime: '17:00',
        dinnerCloseTime: '22:00',
        openTime: '08:00',
        closeTime: '22:00'
      },
      {
        dayOfWeek: 'Sunday',
        isClosed: false,
        isBreakfastService: true,
        breakfastOpenTime: '09:00',
        breakfastCloseTime: '12:00',
        isLunchService: true,
        lunchOpenTime: '12:00',
        lunchCloseTime: '15:00',
        isDinnerService: false,
        dinnerOpenTime: undefined,
        dinnerCloseTime: undefined,
        openTime: '09:00',
        closeTime: '15:00'
      }
    ];

    // Create hours for each day
    const createdHours = [];
    for (const dayData of defaultHours) {
      const hours = await DatabaseService.createRestaurantHours(dayData);
      if (hours) {
        createdHours.push(hours);
      }
    }

    return NextResponse.json({
      message: 'Restaurant hours initialized successfully',
      count: createdHours.length,
      hours: createdHours
    });

  } catch (error) {
    console.error('Error initializing restaurant hours:', error);
    return NextResponse.json(
      { error: 'Failed to initialize restaurant hours' },
      { status: 500 }
    );
  }
}