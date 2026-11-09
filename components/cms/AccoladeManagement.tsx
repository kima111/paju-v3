'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Accolade {
  id: string;
  title: string;
  description: string;
  link?: string;
  images: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AccoladeFormData {
  title: string;
  description: string;
  link: string;
  images: string[];
  displayOrder: number;
  isActive: boolean;
}

const emptyForm: AccoladeFormData = {
  title: '',
  description: '',
  link: '',
  images: [],
  displayOrder: 0,
  isActive: true,
};

export default function AccoladeManagement() {
  const [accolades, setAccolades] = useState<Accolade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AccoladeFormData>(emptyForm);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAccolades = async () => {
    try {
      const response = await fetch('/api/accolades');
      if (response.ok) {
        const data = await response.json();
        setAccolades(data);
      } else {
        setError('Failed to fetch accolades');
      }
    } catch (err) {
      console.error('Error fetching accolades:', err);
      setError('Failed to fetch accolades');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccolades();
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setError('');
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        if (url) uploadedUrls.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid image URL');
      return;
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    setImageUrlInput('');
    setError('');
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        link: formData.link.trim() || undefined,
        images: formData.images,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      };

      const response = editingId
        ? await fetch(`/api/accolades/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData),
          })
        : await fetch('/api/accolades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData),
          });

      if (response.ok) {
        await fetchAccolades();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save accolade');
      }
    } catch (err) {
      console.error('Error saving accolade:', err);
      setError('Failed to save accolade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (accolade: Accolade) => {
    setFormData({
      title: accolade.title,
      description: accolade.description || '',
      link: accolade.link || '',
      images: accolade.images || [],
      displayOrder: accolade.displayOrder ?? 0,
      isActive: accolade.isActive,
    });
    setEditingId(accolade.id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this accolade?')) return;

    try {
      const response = await fetch(`/api/accolades/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchAccolades();
      } else {
        setError('Failed to delete accolade');
      }
    } catch (err) {
      console.error('Error deleting accolade:', err);
      setError('Failed to delete accolade');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/accolades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        await fetchAccolades();
      } else {
        setError('Failed to update accolade status');
      }
    } catch (err) {
      console.error('Error updating accolade status:', err);
      setError('Failed to update accolade status');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8 text-white/60">Loading accolades...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl font-light text-white">Accolades Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-black px-6 py-2 text-xs tracking-wider uppercase hover:bg-white/90 transition-colors"
        >
          Add New Accolade
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
              {editingId ? 'Edit Accolade' : 'Create New Accolade'}
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
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors"
                  placeholder="Enter accolade title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                  Link (URL)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors"
                  placeholder="https://example.com/article"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors resize-none"
                rows={4}
                placeholder="Enter accolade description"
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
                    id="accoladeIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-white bg-zinc-800 border-zinc-600 focus:ring-zinc-500"
                  />
                  <label
                    htmlFor="accoladeIsActive"
                    className="text-sm font-medium text-white/70 tracking-wider uppercase"
                  >
                    Active Accolade
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                Images
              </label>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative group">
                      <div className="w-full h-32 bg-zinc-800 border border-zinc-700 overflow-hidden relative">
                        <Image src={url} alt={`Accolade image ${index + 1}`} fill unoptimized className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 px-2 py-1 text-xs tracking-wider uppercase bg-black/70 text-red-400 border border-red-600/30 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 bg-zinc-800 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-600 transition-colors"
              >
                <p className="text-sm text-white/50">
                  {isUploading ? 'Uploading...' : 'Click to upload images'}
                </p>
                <p className="text-xs text-white/30 mt-1">JPG, PNG — multiple files supported</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex gap-3">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors"
                  placeholder="Or paste an image URL"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="px-6 py-2 text-xs tracking-wider uppercase border border-zinc-600 text-white/60 hover:text-white hover:border-zinc-500 transition-all"
                >
                  Add URL
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
                {isSubmitting ? 'Saving...' : editingId ? 'Update Accolade' : 'Create Accolade'}
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
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Description
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
              {accolades.map((accolade) => (
                <tr key={accolade.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-6">
                    {accolade.images?.[0] ? (
                      <div className="w-16 h-16 relative bg-zinc-800 border border-zinc-700 overflow-hidden">
                        <Image
                          src={accolade.images[0]}
                          alt={accolade.title}
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
                    <div>{accolade.title}</div>
                    {accolade.link && (
                      <a
                        href={accolade.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white/40 hover:text-white/70 transition-colors"
                      >
                        View link
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-6 text-sm text-white/60 max-w-xs">
                    <div className="truncate">{accolade.description || '—'}</div>
                  </td>
                  <td className="px-6 py-6 text-sm text-white/40">{accolade.displayOrder}</td>
                  <td className="px-6 py-6">
                    <button
                      onClick={() => toggleStatus(accolade.id, accolade.isActive)}
                      className={`inline-flex px-3 py-1 text-xs font-medium tracking-wider uppercase border transition-all ${
                        accolade.isActive
                          ? 'text-green-400 border-green-400/30 bg-green-400/10 hover:bg-green-400/20'
                          : 'text-red-400 border-red-400/30 bg-red-400/10 hover:bg-red-400/20'
                      }`}
                    >
                      {accolade.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(accolade)}
                        className="px-3 py-1 text-xs tracking-wider uppercase border border-zinc-600 text-white/60 hover:text-white hover:border-zinc-500 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(accolade.id)}
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

          {accolades.length === 0 && (
            <div className="text-center py-12 text-white/40">
              <div className="text-lg font-light mb-2">No accolades found</div>
              <div className="text-sm">Create your first accolade to get started.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
