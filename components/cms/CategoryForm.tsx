'use client';

import { useState } from 'react';

interface CategoryFormProps {
  onSubmit: (categoryName: string, menuType: 'breakfast' | 'lunch' | 'dinner') => void;
  onCancel: () => void;
  menuType: 'breakfast' | 'lunch' | 'dinner';
}

export default function CategoryForm({ onSubmit, onCancel, menuType }: CategoryFormProps) {
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(categoryName.trim(), menuType);
      setCategoryName('');
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-800 border border-zinc-700 p-6 mb-6">
      <h3 className="text-lg font-medium text-white mb-4">
        Create New {menuType.charAt(0).toUpperCase() + menuType.slice(1)} Category
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Category Name
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full p-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:border-zinc-500 focus:outline-none"
            placeholder="Enter category name..."
            required
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || !categoryName.trim()}
            className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
          >
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-zinc-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}