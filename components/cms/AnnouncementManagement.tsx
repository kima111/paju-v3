'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AnnouncementFormData {
  title: string;
  message: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
}

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    message: '',
    isActive: true,
    priority: 'medium',
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState<string>('');

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      } else {
        setError('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to fetch announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      isActive: true,
      priority: 'medium',
      startDate: '',
      endDate: ''
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      };

      const response = editingId
        ? await fetch(`/api/announcements/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData)
          })
        : await fetch('/api/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData)
          });

      if (response.ok) {
        await fetchAnnouncements();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      setError('Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      isActive: announcement.isActive,
      priority: announcement.priority,
      startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().slice(0, 16) : '',
      endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().slice(0, 16) : ''
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAnnouncements();
      } else {
        setError('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError('Failed to delete announcement');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        await fetchAnnouncements();
      } else {
        setError('Failed to update announcement status');
      }
    } catch (error) {
      console.error('Error updating announcement status:', error);
      setError('Failed to update announcement status');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8 text-white/60">Loading announcements...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl font-light text-white">Announcement Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-black px-6 py-2 text-xs tracking-wider uppercase hover:bg-white/90 transition-colors"
        >
          Add New Announcement
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
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
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
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors resize-none"
                rows={4}
                placeholder="Enter announcement message"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                  Start Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-3 tracking-wider uppercase">
                  End Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white focus:border-zinc-500 focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-white bg-zinc-800 border-zinc-600 focus:ring-zinc-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-white/70 tracking-wider uppercase">
                Active Announcement
              </label>
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
                disabled={isSubmitting}
                className="bg-white text-black px-6 py-2 text-xs tracking-wider uppercase hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (editingId ? 'Update Announcement' : 'Create Announcement')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-700 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Message
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Schedule
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-white/50 uppercase tracking-widest border-b border-zinc-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-6 text-sm font-medium text-white">
                    {announcement.title}
                  </td>
                  <td className="px-6 py-6 text-sm text-white/60 max-w-xs">
                    <div className="truncate">{announcement.message}</div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="inline-flex px-3 py-1 text-xs font-medium tracking-wider uppercase bg-zinc-800 text-white/70 border border-zinc-600">
                      {announcement.priority}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <button
                      onClick={() => toggleStatus(announcement.id, announcement.isActive)}
                      className={`inline-flex px-3 py-1 text-xs font-medium tracking-wider uppercase border transition-all ${
                        announcement.isActive 
                          ? 'text-green-400 border-green-400/30 bg-green-400/10 hover:bg-green-400/20' 
                          : 'text-red-400 border-red-400/30 bg-red-400/10 hover:bg-red-400/20'
                      }`}
                    >
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-6 text-sm text-white/40">
                                        {announcement.startDate || announcement.endDate ? (
                      <div className="space-y-1">
                        {announcement.startDate && (
                          <div className="text-xs">Start: {new Date(announcement.startDate).toLocaleDateString()}</div>
                        )}
                        {announcement.endDate && (
                          <div className="text-xs">End: {new Date(announcement.endDate).toLocaleDateString()}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs">No schedule</span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="px-3 py-1 text-xs tracking-wider uppercase border border-zinc-600 text-white/60 hover:text-white hover:border-zinc-500 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
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
          
          {announcements.length === 0 && (
            <div className="text-center py-12 text-white/40">
              <div className="text-lg font-light mb-2">No announcements found</div>
              <div className="text-sm">Create your first announcement to get started.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};