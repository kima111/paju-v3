'use client';

import { useState, useEffect } from 'react';
import type { User } from '../../lib/database';

interface UserFormData {
  username: string;
  password?: string;
  role: 'admin' | 'editor';
  isActive: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    role: 'editor',
    isActive: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      // Don't send password if it's empty during edit
      const payload: Partial<UserFormData> = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingUser ? 'User updated successfully' : 'User created successfully');
        setShowForm(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', role: 'editor', isActive: true });
        fetchUsers();
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Error saving user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't populate password for security
      role: user.role,
      isActive: user.isActive
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('User deleted successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error deleting user');
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (response.ok) {
        setSuccess(`User ${!user.isActive ? 'enabled' : 'disabled'} successfully`);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Error updating user status');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'editor', isActive: true });
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white/60">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-light tracking-wide text-white">User Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-black px-4 py-2 text-xs tracking-wider uppercase transition-all duration-300 hover:bg-white/90"
        >
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600/30 text-red-400 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-600/30 text-green-400 px-4 py-3 rounded text-sm">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-light text-white">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <button
              onClick={resetForm}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-white/60 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-white/30 focus:outline-none text-white"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-white/60 mb-2">
                Password {editingUser && '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-white/30 focus:outline-none text-white"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-white/60 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'editor' })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-white/30 focus:outline-none text-white"
              >
                <option value="editor">Editor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="bg-zinc-800 border-zinc-700"
              />
              <label htmlFor="isActive" className="text-xs tracking-wider uppercase text-white/60">
                Active Account
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-white text-black px-6 py-2 text-xs tracking-wider uppercase transition-all duration-300 hover:bg-white/90"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-zinc-700 text-white px-6 py-2 text-xs tracking-wider uppercase transition-all duration-300 hover:bg-zinc-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="text-left p-4 text-xs tracking-wider uppercase text-white/60">Username</th>
                <th className="text-left p-4 text-xs tracking-wider uppercase text-white/60">Role</th>
                <th className="text-left p-4 text-xs tracking-wider uppercase text-white/60">Status</th>
                <th className="text-left p-4 text-xs tracking-wider uppercase text-white/60">Created</th>
                <th className="text-left p-4 text-xs tracking-wider uppercase text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-zinc-800">
                  <td className="p-4 text-white">{user.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.role === 'admin' 
                        ? 'bg-blue-900/20 text-blue-400 border border-blue-600/30' 
                        : 'bg-green-900/20 text-green-400 border border-green-600/30'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.isActive 
                        ? 'bg-green-900/20 text-green-400 border border-green-600/30' 
                        : 'bg-red-900/20 text-red-400 border border-red-600/30'
                    }`}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-white/60">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`text-xs ${
                          user.isActive 
                            ? 'text-yellow-400 hover:text-yellow-300' 
                            : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        {user.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}