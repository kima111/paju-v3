import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database-service';
import { verifyJWT } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    if (activeOnly) {
      const accolades = await DatabaseService.getActiveAccolades();
      return NextResponse.json(accolades);
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

    const accolades = await DatabaseService.getAccolades();
    return NextResponse.json(accolades);
  } catch (error) {
    console.error('Error fetching accolades:', error);
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
      title,
      description = '',
      link,
      images = [],
      displayOrder = 0,
      isActive = true,
    } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (link && typeof link === 'string' && link.trim()) {
      try {
        new URL(link);
      } catch {
        return NextResponse.json(
          { error: 'Link must be a valid URL' },
          { status: 400 }
        );
      }
    }

    const imageList = Array.isArray(images)
      ? images.filter((img: unknown): img is string => typeof img === 'string' && img.trim().length > 0)
      : [];

    const newAccolade = await DatabaseService.createAccolade({
      title: title.trim(),
      description: typeof description === 'string' ? description : '',
      link: typeof link === 'string' && link.trim() ? link.trim() : undefined,
      images: imageList,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      isActive: Boolean(isActive),
    });

    if (!newAccolade) {
      return NextResponse.json(
        { error: 'Failed to create accolade' },
        { status: 500 }
      );
    }

    return NextResponse.json(newAccolade, { status: 201 });
  } catch (error) {
    console.error('Error creating accolade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
