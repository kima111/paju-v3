import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';
import { verifyJWT } from '../../../../lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { title, message, isActive, priority, startDate, endDate } = body;

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json(
        { error: 'Priority must be low, medium, or high' },
        { status: 400 }
      );
    }

    const updates: Partial<{
      title: string;
      message: string;
      isActive: boolean;
      priority: 'low' | 'medium' | 'high';
      startDate: Date | undefined;
      endDate: Date | undefined;
    }> = {};
    if (title !== undefined) updates.title = title;
    if (message !== undefined) updates.message = message;
    if (isActive !== undefined) updates.isActive = isActive;
    if (priority !== undefined) updates.priority = priority as 'low' | 'medium' | 'high';
    if (startDate !== undefined) updates.startDate = startDate ? new Date(startDate) : undefined;
    if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : undefined;

    const updatedAnnouncement = await DatabaseService.updateAnnouncement(id, updates);

    if (!updatedAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const deletedAnnouncement = await DatabaseService.deleteAnnouncement(id);

    if (!deletedAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedAnnouncement);
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}