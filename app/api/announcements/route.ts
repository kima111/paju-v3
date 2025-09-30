import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database-service';
import { verifyJWT } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if requesting only active announcements
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    if (activeOnly) {
      // Public endpoint for active announcements
      const announcements = await DatabaseService.getActiveAnnouncements();
      return NextResponse.json(announcements);
    }

    // Admin/Editor access for all announcements
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || !['admin', 'editor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Admin or editor access required' },
        { status: 403 }
      );
    }

    const announcements = await DatabaseService.getAnnouncements();
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    if (!payload || !['admin', 'editor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Admin or editor access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, message, isActive = true, priority = 'medium', startDate, endDate } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json(
        { error: 'Priority must be low, medium, or high' },
        { status: 400 }
      );
    }

    const announcementData = {
      title,
      message,
      isActive,
      priority,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    };

    const newAnnouncement = await DatabaseService.createAnnouncement(announcementData);

    if (!newAnnouncement) {
      return NextResponse.json(
        { error: 'Failed to create announcement' },
        { status: 500 }
      );
    }

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}