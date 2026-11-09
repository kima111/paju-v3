import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database-service';
import { verifyJWT } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    if (activeOnly) {
      const chefs = await DatabaseService.getActiveChefBios();
      return NextResponse.json(chefs);
    }

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

    const chefs = await DatabaseService.getChefBios();
    return NextResponse.json(chefs);
  } catch (error) {
    console.error('Error fetching chef bios:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const {
      name,
      role = '',
      title = '',
      quote = '',
      bio = '',
      imageUrl = '',
      displayOrder = 0,
      isActive = true,
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
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

    const newChefBio = await DatabaseService.createChefBio({
      name: name.trim(),
      role: typeof role === 'string' ? role.trim() : '',
      title: typeof title === 'string' ? title.trim() : '',
      quote: typeof quote === 'string' ? quote.trim() : '',
      bio: typeof bio === 'string' ? bio : '',
      imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      isActive: Boolean(isActive),
    });

    if (!newChefBio) {
      return NextResponse.json(
        { error: 'Failed to create chef bio' },
        { status: 500 }
      );
    }

    return NextResponse.json(newChefBio, { status: 201 });
  } catch (error) {
    console.error('Error creating chef bio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
