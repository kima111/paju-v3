import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';

export async function GET(request: NextRequest) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Only allow this in production with a secret; always allow in development
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (process.env.NODE_ENV === 'production' && secret !== process.env.INIT_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized', expectedSecret: process.env.INIT_SECRET ? 'Set' : 'Not Set' },
        { status: 401, headers }
      );
    }

    const [allCategories, allItems, statuses] = await Promise.all([
      DatabaseService.getMenuCategories(),
      DatabaseService.getMenuItems(),
      DatabaseService.getMenuStatuses(),
    ]);

    const enabledMenus = statuses.filter(s => s.isEnabled).map(s => s.menuType);

    // Per-menu counts
    const byMenuType = ['breakfast', 'lunch', 'dinner'].map(mt => ({
      menuType: mt as 'breakfast' | 'lunch' | 'dinner',
      categories: allCategories.filter(c => c.menuType === mt).length,
      items: allItems.filter(i => i.menuType === mt).length,
      enabled: enabledMenus.includes(mt as 'breakfast' | 'lunch' | 'dinner'),
    }));

    // Sample a few items for quick visibility
    const sampleItems = allItems.slice(0, 5).map(i => ({
      id: i.id,
      title: i.title,
      category: i.category,
      menuType: i.menuType,
      isAvailable: i.isAvailable,
      displayOrder: i.displayOrder,
    }));

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      useDevDB: process.env.USE_DEV_DB,
      enabledMenus,
      total: { categories: allCategories.length, items: allItems.length },
      byMenuType,
      sampleItems,
    }, { headers });
  } catch (error) {
    console.error('Menu debug error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to debug menu', details: errorMessage },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
