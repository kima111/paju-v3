import { put, del } from '@vercel/blob';

export class BlobService {
  /**
   * Upload an image to Vercel Blob storage
   */
  static async uploadImage(file: File, filename: string): Promise<{ url: string; pathname: string } | null> {
    try {
      const isDev = process.env.NODE_ENV !== 'production';
      const usingProdDBInDev = isDev && process.env.USE_DEV_DB === 'false';
      if (isDev && !usingProdDBInDev) {
        // In development (when not using production DB), save files locally to public/uploads
        console.log('Development mode: Saving file locally for', filename);
        
        const fs = await import('fs');
        const path = await import('path');
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Save to public/uploads with simplified filename
        const simplifiedFilename = filename.replace('menu-items/', '');
        const filePath = path.join(uploadsDir, simplifiedFilename);
        fs.writeFileSync(filePath, buffer);
        
        return {
          url: `/uploads/${simplifiedFilename}`,
          pathname: `/uploads/${simplifiedFilename}`
        };
      }

      // Production: Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true, // Prevents naming conflicts
      });

      return {
        url: blob.url,
        pathname: blob.pathname
      };
    } catch (error) {
      console.error('Blob upload error:', error);
      return null;
    }
  }

  /**
   * Delete an image from Vercel Blob storage
   */
  static async deleteImage(url: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV !== 'production') {
        // In development, just log the deletion
        console.log('Development mode: Simulating blob deletion for', url);
        return true;
      }

      // Production: Delete from Vercel Blob
      await del(url);
      return true;
    } catch (error) {
      console.error('Blob deletion error:', error);
      return false;
    }
  }

  /**
   * Generate a unique filename for uploads
   */
  static generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileExtension = originalName.split('.').pop() || 'jpg';
    
    // Clean the original name
    const cleanName = originalName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with hyphens
      .toLowerCase()
      .substring(0, 30); // Limit length

    return `menu-items/${cleanName}-${timestamp}-${randomSuffix}.${fileExtension}`;
  }

  /**
   * Validate file type and size
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Please upload an image smaller than 5MB.'
      };
    }

    return { valid: true };
  }
}