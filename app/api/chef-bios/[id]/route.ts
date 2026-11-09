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
    const { name, role, title, quote, bio, imageUrl, displayOrder, isActive } = body;

    if (imageUrl !== undefined && imageUrl !== null && imageUrl !== '' && typeof imageUrl === 'string') {
      const value = imageUrl.trim();
      const isRelative = value.startsWith('/');
      if (!isRelative) {
        try {
          new URL(value);
        } catch {
          return NextResponse.json(
            { error: 'Image URL must be a valid URL or path' },
            { status: 400 }
          );
        }
      }
    }

    const updates: Partial<{
      name: string;
      role: string;
      title: string;
      quote: string;
      bio: string;
      imageUrl: string;
      displayOrder: number;
      isActive: boolean;
    }> = {};

    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (title !== undefined) updates.title = title;
    if (quote !== undefined) updates.quote = quote;
    if (bio !== undefined) updates.bio = bio;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl || '';
    if (displayOrder !== undefined) updates.displayOrder = displayOrder;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedChefBio = await DatabaseService.updateChefBio(id, updates);

    if (!updatedChefBio) {
      return NextResponse.json(
        { error: 'Chef bio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedChefBio);
  } catch (error) {
    console.error('Error updating chef bio:', error);
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

    const deletedChefBio = await DatabaseService.deleteChefBio(id);

    if (!deletedChefBio) {
      return NextResponse.json(
        { error: 'Chef bio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedChefBio);
  } catch (error) {
    console.error('Error deleting chef bio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
