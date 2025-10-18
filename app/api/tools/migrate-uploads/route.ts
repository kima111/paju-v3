import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database-service';
import { BlobService } from '../../../../lib/blob-service';
import type { MenuItem } from '../../../../lib/database';

export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (process.env.NODE_ENV === 'production' && secret !== process.env.INIT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    // Load all items and find those using local /uploads paths
  const items: MenuItem[] = await DatabaseService.getMenuItems();
  const needsMigration = items.filter((i: MenuItem) => i.imageUrl && i.imageUrl.startsWith('/uploads/'));

    const fs = await import('fs');
    const path = await import('path');

    const results: Array<{ id: string; from: string; to?: string; status: 'migrated' | 'skipped' | 'missing' | 'failed'; reason?: string }>
      = [];

    for (const item of needsMigration) {
      const relPath = item.imageUrl!; // starts with /uploads/...
      const localPath = path.join(process.cwd(), 'public', relPath);
      if (!fs.existsSync(localPath)) {
        results.push({ id: item.id, from: relPath, status: 'missing', reason: 'Local file not found' });
        continue;
      }

      try {
        const buffer = fs.readFileSync(localPath);
        const basename = path.basename(localPath);
        const filename = BlobService.generateFilename(basename);
        // Construct a File from buffer; Node 18+ supports Web File
        const type = basename.toLowerCase().endsWith('.png')
          ? 'image/png'
          : basename.toLowerCase().endsWith('.webp')
          ? 'image/webp'
          : basename.toLowerCase().endsWith('.jpg') || basename.toLowerCase().endsWith('.jpeg')
          ? 'image/jpeg'
          : 'application/octet-stream';
        const file = new File([buffer], basename, { type });

        const uploaded = await BlobService.uploadImage(file, filename);
        if (!uploaded) {
          results.push({ id: item.id, from: relPath, status: 'failed', reason: 'Blob upload failed' });
          continue;
        }

        await DatabaseService.updateMenuItem(item.id, { imageUrl: uploaded.url });
        results.push({ id: item.id, from: relPath, to: uploaded.url, status: 'migrated' });
      } catch (e) {
        results.push({ id: item.id, from: relPath, status: 'failed', reason: e instanceof Error ? e.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      checked: items.length,
      toMigrate: needsMigration.length,
      results,
    }, { headers });
  } catch (error) {
    console.error('Upload migration error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
