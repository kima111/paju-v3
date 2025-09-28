import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '../../../lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const image = formData.get('image') as File;

    console.log('Upload request received:', {
      hasImage: !!image,
      imageSize: image?.size,
      imageType: image?.type,
      imageName: image?.name
    });

    if (!image) {
      console.log('No image provided in form data');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum 5MB allowed.' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG and PNG are allowed.' }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = image.name.split('.').pop();
    const filename = `menu-${timestamp}.${fileExtension}`;

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory already exists or was created
    }

    // Save file
    const buffer = Buffer.from(await image.arrayBuffer());
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Return the URL that can be used to access the image
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: imageUrl }, { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}