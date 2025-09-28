'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { MenuItem, MenuCategory, MenuStatus } from '../../lib/database';
import MenuItemForm from './MenuItemForm';
import CategoryForm from './CategoryForm';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuStatuses, setMenuStatuses] = useState<MenuStatus[]>([]);
  const [activeMenuType, setActiveMenuType] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchMenuStatuses();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu/items');
      if (response.ok) {
        const items = await response.json();
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      if (response.ok) {
        const cats = await response.json();
        setCategories(cats);
      } else if (response.status === 401) {
        console.error('Unauthorized access to categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuStatuses = async () => {
    try {
      const response = await fetch('/api/menu/status');
      if (response.ok) {
        const statuses = await response.json();
        console.log('Menu statuses fetched:', statuses);
        setMenuStatuses(statuses);
      } else {
        console.error('Failed to fetch menu statuses:', response.status);
      }
    } catch (error) {
      console.error('Error fetching menu statuses:', error);
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategories();
        alert('Category deleted successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const toggleMenuStatus = async (menuType: 'breakfast' | 'lunch' | 'dinner') => {
    try {
      const currentStatus = menuStatuses.find(status => status.menuType === menuType);
      const response = await fetch('/api/menu/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuType,
          isEnabled: !currentStatus?.isEnabled
        }),
      });

      if (response.ok) {
        const updatedStatuses = await response.json();
        setMenuStatuses(updatedStatuses);
      } else {
        alert('Failed to update menu status');
      }
    } catch (error) {
      console.error('Error updating menu status:', error);
      alert('Error updating menu status');
    }
  };

  const filteredItems = menuItems.filter(item => item.menuType === activeMenuType);
  const activeCategories = categories.filter(cat => cat.menuType === activeMenuType);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-white/60">Loading menu items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl font-light">Menu Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="bg-zinc-800 text-white px-4 py-2 text-xs tracking-wider uppercase hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Create {activeMenuType.charAt(0).toUpperCase() + activeMenuType.slice(1)} Category
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-black px-6 py-2 text-xs tracking-wider uppercase hover:bg-white/90 transition-colors"
          >
            Add New Item
          </button>
        </div>
      </div>

      {/* Menu Type Selector and Status Controls */}
      <div className="space-y-4">
        {/* Menu Type Tabs */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveMenuType('breakfast')}
            className={`px-6 py-2 text-xs tracking-wider uppercase border ${
              activeMenuType === 'breakfast'
                ? 'border-white text-white bg-white/5'
                : 'border-white/30 text-white/60 hover:text-white hover:border-white/60'
            } transition-all`}
          >
            Breakfast Menu
          </button>
          <button
            onClick={() => setActiveMenuType('lunch')}
            className={`px-6 py-2 text-xs tracking-wider uppercase border ${
              activeMenuType === 'lunch'
                ? 'border-white text-white bg-white/5'
                : 'border-white/30 text-white/60 hover:text-white hover:border-white/60'
            } transition-all`}
          >
            Lunch Menu
          </button>
          <button
            onClick={() => setActiveMenuType('dinner')}
            className={`px-6 py-2 text-xs tracking-wider uppercase border ${
              activeMenuType === 'dinner'
                ? 'border-white text-white bg-white/5'
                : 'border-white/30 text-white/60 hover:text-white hover:border-white/60'
            } transition-all`}
          >
            Dinner Menu
          </button>
        </div>

        {/* Menu Status Controls */}
        <div className="bg-zinc-900 p-4 border border-zinc-700 space-y-3">
          <h3 className="text-sm font-medium text-white/90 tracking-wider uppercase">Menu Status Controls</h3>
          {menuStatuses.length === 0 ? (
            <div className="text-white/50 text-xs">Loading menu status...</div>
          ) : (
            <div className="flex space-x-6">
              {menuStatuses.map(status => (
                <label key={status.menuType} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status.isEnabled}
                    onChange={() => toggleMenuStatus(status.menuType)}
                    className="w-4 h-4 text-white bg-transparent border-zinc-600 focus:ring-white focus:ring-2"
                  />
                  <span className="text-xs text-white/70 tracking-wider uppercase">
                    {status.menuType} Menu
                  </span>
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-white/50">
            Disabled menus will not be shown to customers on the public website.
          </p>
        </div>
      </div>

      {/* Menu Items by Category */}
      <div className="space-y-8">
        {activeCategories.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            No categories found for {activeMenuType} menu. Add some categories to get started.
          </div>
        ) : (
          activeCategories.map(category => (
            <div key={category.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-light text-white/80 border-b border-white/10 pb-2 flex-1">
                  {category.name}
                </h3>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    + Add {activeMenuType.charAt(0).toUpperCase() + activeMenuType.slice(1)} Category
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id, category.name)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="space-y-8">
                {(() => {
                  const categoryItems = filteredItems.filter(item => item.category === category.name);
                  const itemsWithImages = categoryItems.filter(item => item.imageUrl);
                  const itemsWithoutImages = categoryItems.filter(item => !item.imageUrl);
                  
                  return (
                    <>
                      {/* Grid layout for items WITH images - responsive */}
                      {itemsWithImages.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {itemsWithImages.map(item => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              onEdit={setEditingItem}
                              onRefresh={fetchMenuItems}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Linear layout for items WITHOUT images - text-only format */}
                      {itemsWithoutImages.length > 0 && (
                        <div className="space-y-4">
                          {itemsWithoutImages.map(item => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              onEdit={setEditingItem}
                              onRefresh={fetchMenuItems}
                            />
                          ))}
                        </div>
                      )}
                      
                      {categoryItems.length === 0 && (
                        <div className="text-white/40 text-sm italic">No items in this category</div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingItem) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <MenuItemForm
              onSubmit={async (itemData) => {
                try {
                  const url = editingItem ? `/api/menu/items/${editingItem.id}` : '/api/menu/items';
                  const method = editingItem ? 'PUT' : 'POST';

                  const response = await fetch(url, {
                    method,
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(itemData),
                  });

                  if (response.ok) {
                    fetchMenuItems();
                    setShowAddForm(false);
                    setEditingItem(null);
                  } else {
                    const data = await response.json();
                    alert(data.error || 'Failed to save menu item');
                  }
                } catch (error) {
                  console.error('Error saving item:', error);
                  alert('Error saving menu item');
                }
              }}
              onCancel={() => {
                setShowAddForm(false);
                setEditingItem(null);
              }}
              categories={categories}
              editingItem={editingItem || undefined}
              menuType={activeMenuType}
            />
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 max-w-md w-full mx-4">
            <CategoryForm
              onSubmit={async (categoryName, menuType) => {
                try {
                  const response = await fetch('/api/categories', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: categoryName, menuType }),
                  });

                  if (response.ok) {
                    fetchCategories();
                    setShowCategoryForm(false);
                  } else {
                    const data = await response.json();
                    alert(data.error || 'Failed to create category');
                  }
                } catch (error) {
                  console.error('Error creating category:', error);
                  alert('Error creating category');
                }
              }}
              onCancel={() => setShowCategoryForm(false)}
              menuType={activeMenuType}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onRefresh: () => void;
}

function MenuItemCard({ item, onEdit, onRefresh }: MenuItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/menu/items/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert('Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting menu item');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const response = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert('Failed to update item availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  return (
    <div className={`bg-zinc-900 border border-zinc-800 p-6 ${!item.isAvailable ? 'opacity-60' : ''}`}>
      {item.imageUrl ? (
        // Layout with image
        <div className="flex justify-between items-start mb-4">
          <div className="flex space-x-4 flex-1">
            {/* Image preview */}
            <div className="w-16 h-16 bg-zinc-800 rounded overflow-hidden flex-shrink-0 relative">
              <Image 
                src={item.imageUrl} 
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-lg font-light text-white">{item.title}</h4>
                <span className={`px-2 py-1 text-xs ${item.isAvailable ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-3">{item.description}</p>
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">${item.price}</span>
                <span className="text-xs text-white/40 uppercase tracking-wider">{item.category}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Text-only layout without image
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-2 py-1 text-xs ${item.isAvailable ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            {/* Text-only format with responsive leading dots from title to price */}
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-lg font-light text-white flex-shrink-0 pr-3">{item.title}</h4>
              <div className="flex-1 border-b border-dotted border-white/30 mb-1"></div>
              <span className="text-white font-medium text-lg flex-shrink-0 pl-3">${item.price}</span>
            </div>
            
            <p className="text-white/60 text-sm leading-relaxed mb-2">{item.description}</p>
            <span className="text-xs text-white/40 uppercase tracking-wider">{item.category}</span>
          </div>
        </div>
      )}
      
      {/* Action buttons - always visible */}
      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-zinc-800">
        <button
          onClick={toggleAvailability}
          className={`px-3 py-1 text-xs ${
            item.isAvailable 
              ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
              : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
          } transition-colors`}
        >
          {item.isAvailable ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={() => onEdit(item)}
          className="px-3 py-1 text-xs bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1 text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

