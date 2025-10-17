import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../../lib/database-service';
import { verifyJWT } from '../../../../../lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const payload = await verifyJWT(token);
    if (!payload || !['admin', 'editor'].includes(payload.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { menuType, category, orderedIds } = body as { menuType?: 'breakfast' | 'lunch' | 'dinner'; category?: string; orderedIds?: string[] };
    if (!menuType || !['breakfast', 'lunch', 'dinner'].includes(menuType)) {
      return NextResponse.json({ error: 'Invalid or missing menuType' }, { status: 400 });
    }
    if (!category || !category.trim()) {
      return NextResponse.json({ error: 'Invalid or missing category' }, { status: 400 });
    }
    if (!Array.isArray(orderedIds) || orderedIds.length === 0 || !orderedIds.every(id => typeof id === 'string')) {
      return NextResponse.json({ error: 'orderedIds must be a non-empty array of strings' }, { status: 400 });
    }

    const updated = await DatabaseService.reorderMenuItems(menuType, category.trim(), orderedIds);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error reordering menu items:', error);
    return NextResponse.json({ error: 'Failed to reorder menu items' }, { status: 500 });
  }
}
