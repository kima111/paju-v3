import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../../lib/database-service';
import { BlobService } from '../../../../../lib/blob-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updates = {
      ...(body.title && { title: body.title }),
      ...(body.description && { description: body.description }),
      ...(body.price !== undefined && { price: parseFloat(body.price) }),
      ...(body.category && { category: body.category }),
      ...(body.menuType && { menuType: body.menuType }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
      updatedAt: new Date()
    };

    const menuItem = await DatabaseService.updateMenuItem(id, updates);

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
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
    const menuItem = await DatabaseService.deleteMenuItem(id);

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Delete associated image if it exists
    if (menuItem.imageUrl) {
      await BlobService.deleteImage(menuItem.imageUrl);
    }

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}