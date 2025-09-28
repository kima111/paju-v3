import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';
import { verifyJWT } from '../../../../lib/auth';
import type { MenuItem, MenuCategory } from '../../../../lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if category is being used by any menu items
    const menuItems = db.getMenuItems();
    const categoryInUse = menuItems.some((item: MenuItem) => {
      const categories = db.getMenuCategories();
      const category = categories.find((cat: MenuCategory) => cat.id === id);
      return category && item.category === category.name;
    });

    if (categoryInUse) {
      return NextResponse.json({ 
        error: 'Cannot delete category. It is being used by menu items.' 
      }, { status: 409 });
    }

    const deletedCategory = db.deleteMenuCategory(id);
    
    if (!deletedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Category deleted successfully',
      category: deletedCategory 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}