'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { MenuItem, MenuCategory } from '../../lib/database';

interface MenuItemFormProps {
  onSubmit: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  categories: MenuCategory[];
  editingItem?: MenuItem;
  menuType: 'breakfast' | 'lunch' | 'dinner';
}

export default function MenuItemForm({ onSubmit, onCancel, categories, editingItem, menuType }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    title: editingItem?.title || '',
    description: editingItem?.description || '',
    price: editingItem?.price?.toString() || '',
    category: editingItem?.category || '',
    isAvailable: editingItem?.isAvailable ?? true,
    imageUrl: editingItem?.imageUrl || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    setIsUploading(true);
    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append('file', imageFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataForUpload,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown upload error' }));
        console.error('Upload error:', errorData);
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      await onSubmit({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        isAvailable: formData.isAvailable,
        imageUrl: finalImageUrl || undefined,
        menuType
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-zinc-800 border border-zinc-700 p-6 mb-6">
      <h3 className="text-lg font-medium text-white mb-4">
        {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:border-zinc-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:border-zinc-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:border-zinc-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:border-zinc-500 focus:outline-none"
                required
              >
                <option value="">Select a category</option>
                {categories
                  .filter((category) => category.menuType === menuType)
                  .map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                className="w-4 h-4 text-white bg-zinc-900 border-zinc-700 rounded focus:ring-zinc-500"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-white/80">
                Available
              </label>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Image (Optional)
              </label>
              
              {formData.imageUrl ? (
                <div className="space-y-3">
                  <div className="w-full h-48 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden relative">
                    <Image 
                      src={formData.imageUrl} 
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-600"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-red-900/30 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-900/50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-zinc-600 transition-colors"
                >
                  <div className="text-zinc-500 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-sm">Click to upload image</p>
                    <p className="text-xs text-zinc-600 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-700">
          <button
            type="button"
            onClick={onCancel}
            className="bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-zinc-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
          >
            {isSubmitting ? 'Saving...' : isUploading ? 'Uploading...' : editingItem ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
}