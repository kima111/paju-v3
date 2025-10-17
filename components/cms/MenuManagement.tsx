"use client";

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
      const response = await fetch('/api/categories', { credentials: 'include' });
      if (response.ok) {
        const cats = await response.json();
        setCategories(cats);
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
        setMenuStatuses(statuses);
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
      const response = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuType, isEnabled: !currentStatus?.isEnabled }),
      });
      if (response.ok) {
        const updated = await response.json();
        setMenuStatuses(updated);
      } else {
        alert('Failed to update menu status');
      }
    } catch (error) {
      console.error('Error updating menu status:', error);
      alert('Error updating menu status');
    }
  };

  const filteredItems = menuItems.filter(item => item.menuType === activeMenuType);
  const activeCategories = categories
    .filter(cat => cat.menuType === activeMenuType)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const reorderCategories = async (direction: 'up' | 'down', index: number) => {
    const cats = activeCategories.slice();
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === cats.length - 1)) return;
    const swapWith = direction === 'up' ? index - 1 : index + 1;

    const newOrderForType = cats.map(c => c.id);
    [newOrderForType[index], newOrderForType[swapWith]] = [newOrderForType[swapWith], newOrderForType[index]];

    const updatedCategories = categories.map(c => {
      const pos = newOrderForType.indexOf(c.id);
      if (c.menuType === activeMenuType && pos !== -1) {
        return { ...c, displayOrder: pos + 1 };
      }
      return c;
    });
    setCategories(updatedCategories);

    try {
      const resp = await fetch('/api/menu/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ menuType: activeMenuType, orderedIds: newOrderForType })
      });
      if (!resp.ok) {
        console.error('Failed to reorder categories');
        await fetchCategories();
      } else {
        const updated = await resp.json();
        const merged = categories.map(c => {
          if (c.menuType !== activeMenuType) return c;
          const found = updated.find((u: MenuCategory) => u.id === c.id);
          return found ? { ...c, displayOrder: found.displayOrder } : c;
        });
        setCategories(merged);
      }
    } catch (e) {
      console.error('Error reordering categories:', e);
      await fetchCategories();
    }
  };

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
          activeCategories.map((category, idx) => (
            <div key={category.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <InlineCategoryHeader
                  category={category}
                  onRenamed={async (newName: string) => {
                    try {
                      const resp = await fetch(`/api/categories/${category.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ name: newName })
                      });
                      if (resp.ok) {
                        const updated = await resp.json();
                        setCategories(categories.map(c => c.id === updated.id ? { ...c, name: updated.name } : c));
                        setMenuItems(menuItems.map(mi => mi.category === category.name ? { ...mi, category: updated.name } : mi));
                      } else {
                        const data = await resp.json();
                        alert(data.error || 'Failed to rename category');
                      }
                    } catch (e) {
                      console.error('Error renaming category:', e);
                    }
                  }}
                />
                <div className="flex items-center space-x-2 ml-4">
                  <div className="flex items-center space-x-1">
                    <button
                      aria-label="Move up"
                      disabled={idx === 0}
                      onClick={() => reorderCategories('up', idx)}
                      className={`px-2 py-1 text-xs border ${idx === 0 ? 'opacity-30 cursor-not-allowed border-white/20 text-white/30' : 'border-white/30 text-white/60 hover:text-white hover:border-white/60'}`}
                    >
                      ↑
                    </button>
                    <button
                      aria-label="Move down"
                      disabled={idx === activeCategories.length - 1}
                      onClick={() => reorderCategories('down', idx)}
                      className={`px-2 py-1 text-xs border ${idx === activeCategories.length - 1 ? 'opacity-30 cursor-not-allowed border-white/20 text-white/30' : 'border-white/30 text-white/60 hover:text-white hover:border-white/60'}`}
                    >
                      ↓
                    </button>
                  </div>
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
                      {itemsWithImages.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {itemsWithImages.map((item) => {
                            // Reorder within image-only subgroup, then merge back into full list
                            const allIds = categoryItems.map(ci => ci.id);
                            const imageIds = itemsWithImages.map(ii => ii.id);
                            const pos = imageIds.indexOf(item.id);
                            const canUp = pos > 0;
                            const canDown = pos < imageIds.length - 1;
                            const move = async (dir: 'up' | 'down') => {
                              const newImageIds = [...imageIds];
                              const swapWith = dir === 'up' ? pos - 1 : pos + 1;
                              if (swapWith < 0 || swapWith >= newImageIds.length) return;
                              [newImageIds[swapWith], newImageIds[pos]] = [newImageIds[pos], newImageIds[swapWith]];

                              // Merge new image order into full order, preserving non-image positions
                              const imageSet = new Set(imageIds);
                              const merged: string[] = [];
                              let idx = 0;
                              for (const id of allIds) {
                                if (imageSet.has(id)) {
                                  merged.push(newImageIds[idx++]);
                                } else {
                                  merged.push(id);
                                }
                              }

                              await fetch('/api/menu/items/reorder', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ menuType: activeMenuType, category: category.name, orderedIds: merged })
                              });
                              fetchMenuItems();
                            };
                            return (
                              <MenuItemCard
                                key={item.id}
                                item={item}
                                onEdit={setEditingItem}
                                onRefresh={fetchMenuItems}
                                onMoveLeft={canUp ? () => move('up') : undefined}
                                onMoveUp={canUp ? () => move('up') : undefined}
                                onMoveDown={canDown ? () => move('down') : undefined}
                                onMoveRight={canDown ? () => move('down') : undefined}
                              />
                            );
                          })}
                        </div>
                      )}

                      {itemsWithoutImages.length > 0 && (
                        <div className="space-y-4">
                          {itemsWithoutImages.map((item) => {
                            // Reorder within text-only subgroup, then merge back into full list
                            const allIds = categoryItems.map(ci => ci.id);
                            const textIds = itemsWithoutImages.map(ii => ii.id);
                            const pos = textIds.indexOf(item.id);
                            const canUp = pos > 0;
                            const canDown = pos < textIds.length - 1;
                            const move = async (dir: 'up' | 'down') => {
                              const newTextIds = [...textIds];
                              const swapWith = dir === 'up' ? pos - 1 : pos + 1;
                              if (swapWith < 0 || swapWith >= newTextIds.length) return;
                              [newTextIds[swapWith], newTextIds[pos]] = [newTextIds[pos], newTextIds[swapWith]];

                              // Merge new text-only order into full order, preserving image positions
                              const textSet = new Set(textIds);
                              const merged: string[] = [];
                              let idx = 0;
                              for (const id of allIds) {
                                if (textSet.has(id)) {
                                  merged.push(newTextIds[idx++]);
                                } else {
                                  merged.push(id);
                                }
                              }

                              await fetch('/api/menu/items/reorder', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ menuType: activeMenuType, category: category.name, orderedIds: merged })
                              });
                              fetchMenuItems();
                            };
                            return (
                              <MenuItemCard
                                key={item.id}
                                item={item}
                                onEdit={setEditingItem}
                                onRefresh={fetchMenuItems}
                                onMoveLeft={canUp ? () => move('up') : undefined}
                                onMoveUp={canUp ? () => move('up') : undefined}
                                onMoveDown={canDown ? () => move('down') : undefined}
                                onMoveRight={canDown ? () => move('down') : undefined}
                              />
                            );
                          })}
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

function InlineCategoryHeader({ category, onRenamed }: { category: MenuCategory; onRenamed: (newName: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(category.name);
  return (
    <div className="flex-1 border-b border-white/10 pb-2">
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = value.trim();
            if (!name) return;
            onRenamed(name);
            setEditing(false);
          }}
          className="flex items-center space-x-2"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-zinc-900 border border-white/20 text-white px-2 py-1 text-sm flex-1"
          />
          <button type="submit" className="text-xs bg-white text-black px-2 py-1">Save</button>
          <button type="button" onClick={() => { setEditing(false); setValue(category.name); }} className="text-xs text-white/60 px-2 py-1">Cancel</button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-light text-white/80">{category.name}</h3>
          <button onClick={() => setEditing(true)} className="text-xs text-white/40 hover:text-white/60">Rename</button>
        </div>
      )}
    </div>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onRefresh: () => void;
  onMoveUp?: () => void | Promise<void>;
  onMoveDown?: () => void | Promise<void>;
  onMoveLeft?: () => void | Promise<void>;
  onMoveRight?: () => void | Promise<void>;
}

function MenuItemCard({ item, onEdit, onRefresh, onMoveUp, onMoveDown, onMoveLeft, onMoveRight }: MenuItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/menu/items/${item.id}`, { method: 'DELETE' });
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
        headers: { 'Content-Type': 'application/json' },
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
        <div className="flex justify-between items-start mb-4">
          <div className="flex space-x-4 flex-1">
            <div className="w-16 h-16 bg-zinc-800 rounded overflow-hidden flex-shrink-0 relative">
              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
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
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-2 py-1 text-xs ${item.isAvailable ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
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

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center space-x-1">
          <button aria-label="Move left" onClick={() => onMoveLeft && onMoveLeft()} disabled={!onMoveLeft} className={`px-2 py-1 text-xs border ${onMoveLeft ? 'border-white/30 text-white/60 hover:text-white hover:border-white/60' : 'opacity-30 cursor-not-allowed border-white/20 text-white/30'}`}>
            ←
          </button>
          <button aria-label="Move up" onClick={() => onMoveUp && onMoveUp()} disabled={!onMoveUp} className={`px-2 py-1 text-xs border ${onMoveUp ? 'border-white/30 text-white/60 hover:text-white hover:border-white/60' : 'opacity-30 cursor-not-allowed border-white/20 text-white/30'}`}>
            ↑
          </button>
          <button aria-label="Move down" onClick={() => onMoveDown && onMoveDown()} disabled={!onMoveDown} className={`px-2 py-1 text-xs border ${onMoveDown ? 'border-white/30 text-white/60 hover:text-white hover:border-white/60' : 'opacity-30 cursor-not-allowed border-white/20 text-white/30'}`}>
            ↓
          </button>
          <button aria-label="Move right" onClick={() => onMoveRight && onMoveRight()} disabled={!onMoveRight} className={`px-2 py-1 text-xs border ${onMoveRight ? 'border-white/30 text-white/60 hover:text-white hover:border-white/60' : 'opacity-30 cursor-not-allowed border-white/20 text-white/30'}`}>
            →
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleAvailability} className={`px-3 py-1 text-xs ${item.isAvailable ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'} transition-colors`}>
            {item.isAvailable ? 'Disable' : 'Enable'}
          </button>
          <button onClick={() => onEdit(item)} className="px-3 py-1 text-xs bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors">
            Edit
          </button>
          <button onClick={handleDelete} disabled={isDeleting} className="px-3 py-1 text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

