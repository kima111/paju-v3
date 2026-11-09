import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';
import { verifyJWT } from '../../../../lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { title, description, link, images, displayOrder, isActive } = body;

    if (link !== undefined && link !== null && link !== '' && typeof link === 'string') {
      try {
        new URL(link);
      } catch {
        return NextResponse.json(
          { error: 'Link must be a valid URL' },
          { status: 400 }
        );
      }
    }

    const updates: Partial<{
      title: string;
      description: string;
      link: string | undefined;
      images: string[];
      displayOrder: number;
      isActive: boolean;
    }> = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (link !== undefined) updates.link = link || undefined;
    if (images !== undefined) {
      updates.images = Array.isArray(images)
        ? images.filter((img: unknown): img is string => typeof img === 'string' && img.trim().length > 0)
        : [];
    }
    if (displayOrder !== undefined) updates.displayOrder = displayOrder;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedAccolade = await DatabaseService.updateAccolade(id, updates);

    if (!updatedAccolade) {
      return NextResponse.json(
        { error: 'Accolade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAccolade);
  } catch (error) {
    console.error('Error updating accolade:', error);
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

    const deletedAccolade = await DatabaseService.deleteAccolade(id);

    if (!deletedAccolade) {
      return NextResponse.json(
        { error: 'Accolade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedAccolade);
  } catch (error) {
    console.error('Error deleting accolade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
