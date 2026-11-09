'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ChefBio {
  id: string;
  name: string;
  role: string;
  title: string;
  quote: string;
  bio: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ChefBioFormData {
  name: string;
  role: string;
  title: string;
  quote: string;
  bio: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm: ChefBioFormData = {
  name: '',
  role: 'Executive Chef',
  title: 'Culinary Vision',
  quote: '',
  bio: '',
  imageUrl: '',
  displayOrder: 0,
  isActive: true,
};

export default function ChefBioManagement() {
  const [chefs, setChefs] = useState<ChefBio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ChefBioFormData>(emptyForm);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchChefs = async () => {
    try {
      const response = await fetch('/api/chef-bios');
      if (response.ok) {
        const data = await response.json();
        setChefs(data);
      } else {
        setError('Failed to fetch chef bios');
      }
    } catch (err) {
      console.error('Error fetching chef bios:', err);
      setError('Failed to fetch chef bios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setImageUrlInput('');
    setEditingId(null);
    setShowForm(false);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const uploadForm = new FormData();
    uploadForm.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: uploadForm,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url as string;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    try {
      const url = await uploadImage(file);
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        setImageUrlInput('');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const applyImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    const isRelative = url.startsWith('/');
    if (!isRelative) {
      try {
        new URL(url);
      } catch {
        setError('Please enter a valid image URL or path');
        return;
      }
    }
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImageUrlInput('');
    setError('');
  };

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setImageUrlInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const submitData = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        title: formData.title.trim(),
        quote: formData.quote.trim(),
        bio: formData.bio.trim(),
        imageUrl: formData.imageUrl.trim(),
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      };

      const response = editingId
        ? await fetch(`/api/chef-bios/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData),
          })
        : await fetch('/api/chef-bios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData),
          });

      if (response.ok) {
        await fetchChefs();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save chef bio');
      }
    } catch (err) {
      console.error('Error saving chef bio:', err);
      setError('Failed to save chef bio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (chef: ChefBio) => {
    setFormData({
      name: chef.name,
      role: chef.role || '',
      title: chef.title || '',
      quote: chef.quote || '',
      bio: chef.bio || '',
      imageUrl: chef.imageUrl || '',
      displayOrder: chef.displayOrder ?? 0,
      isActive: chef.isActive,
    });
    setEditingId(chef.id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chef bio?')) return;

    try {
      const response = await fetch(`/api/chef-bios/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchChefs();
      } else {
        setError('Failed to delete chef bio');
      }
    } catch (err) {
      console.error('Error deleting chef bio:', err);
      setError('Failed to delete chef bio');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/chef-bios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        await fetchChefs();
      } else {
        setError('Failed to update chef bio status');
      }
    } catch (err) {
      console.error('Error updating chef bio status:', err);
      setError('Failed to update chef bio status');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8 text-white/60">Loading chef bios...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl font-light text-white">Chef Bio Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-black px-6 py-2 text-xs tracking-wider uppercase hover:bg-white/90 transition-colors"
        >
          Add Chef Bio
        </button>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 px-6 py-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-zinc-900 p-6 border border-zinc-700 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-light text-white/90">
              {editingId ? 'Edit Chef Bio' : 'Create Chef Bio'}
            </h3>
            <button
              onClick={resetForm}
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors"
                  placeholder="e.g. Bill"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                  Role / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors"
                  placeholder="e.g. Executive Chef"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                Section Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors"
                placeholder="e.g. Culinary Vision"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                Quote (optional)
              </label>
              <textarea
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors resize-none"
                rows={3}
                placeholder='e.g. “Korean cuisine is about balance...”'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                Bio / Experience
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors resize-none"
                rows={6}
                placeholder="Enter one or two paragraphs about the chef. Separate paragraphs with a blank line."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors"
                  min={0}
                />
              </div>

              <div className="flex items-end pb-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="chefIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-white bg-zinc-800 border-zinc-600 focus:ring-zinc-500"
                  />
                  <label
                    htmlFor="chefIsActive"
                    className="text-sm font-medium text-white/70 tracking-wider uppercase"
                  >
                    Active Chef Bio
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                Image
              </label>

              {formData.imageUrl && (
                <div className="relative group w-48">
                  <div className="w-48 h-48 bg-zinc-800 border border-zinc-700 overflow-hidden relative">
                    <Image
                      src={formData.imageUrl}
                      alt="Chef preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 px-2 py-1 text-xs tracking-wider uppercase bg-black/70 text-red-400 border border-red-600/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 bg-zinc-800 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-600 transition-colors"
              >
                <p className="text-sm text-white/50">
                  {isUploading ? 'Uploading...' : 'Click to upload image'}
                </p>
                <p className="text-xs text-white/30 mt-1">JPG, PNG, WebP</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex gap-3">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors"
                  placeholder="Or paste an image URL / path"
                />
                <button
                  type="button"
                  onClick={applyImageUrl}
                  className="px-6 py-2 text-xs tracking-wider uppercase border border-zinc-600 text-white/60 hover:text-white hover:border-zinc-500 transition-all"
                >
                  Use URL
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-700">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 text-xs tracking-wider uppercase border border-zinc-600 text-white/60 hover:text-white hover:border-zinc-500 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="bg-white text-black px-6 py-2 text-xs tracking-wider uppercase hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingId ? 'Update Chef Bio' : 'Create Chef Bio'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-700 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Bio
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {chefs.map((chef) => (
                <tr key={chef.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-6">
                    {chef.imageUrl ? (
                      <div className="w-16 h-16 relative bg-zinc-800 border border-zinc-700 overflow-hidden">
                        <Image
                          src={chef.imageUrl}
                          alt={chef.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-white/30">No image</span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-sm font-medium text-white">
                    <div>{chef.name}</div>
                    {chef.title && (
                      <div className="text-xs text-white/40 mt-1">{chef.title}</div>
                    )}
                  </td>
                  <td className="px-6 py-6 text-sm text-white/60">{chef.role || '—'}</td>
                  <td className="px-6 py-6 text-sm text-white/60 max-w-xs">
                    <div className="truncate">{chef.bio || '—'}</div>
                  </td>
                  <td className="px-6 py-6 text-sm text-white/40">{chef.displayOrder}</td>
                  <td className="px-6 py-6">
                    <button
                      onClick={() => toggleStatus(chef.id, chef.isActive)}
                      className={`inline-flex px-3 py-1 text-xs font-medium tracking-wider uppercase border transition-all ${
                        chef.isActive
                          ? 'text-green-400 border-green-400/30 bg-green-400/10 hover:bg-green-400/20'
                          : 'text-red-400 border-red-400/30 bg-red-400/10 hover:bg-red-400/20'
                      }`}
                    >
                      {chef.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(chef)}
                        className="px-3 py-1 text-xs tracking-wider uppercase border border-zinc-600 text-white/60 hover:text-white hover:border-zinc-500 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(chef.id)}
                        className="px-3 py-1 text-xs tracking-wider uppercase border border-red-600/30 text-red-400/60 hover:text-red-400 hover:border-red-500/50 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {chefs.length === 0 && (
            <div className="text-center py-12 text-white/40">
              <div className="text-lg font-light mb-2">No chef bios found</div>
              <div className="text-sm">Create a chef bio to manage the public Chef section.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
