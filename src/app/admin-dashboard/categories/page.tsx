"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const supabase = createClient();

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || userProfile?.role !== 'admin')) {
      router.push('/admin-login');
    }
  }, [user, userProfile, authLoading, router]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && userProfile?.role === 'admin') {
      fetchCategories();
    }
  }, [user, userProfile, supabase]);

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    setLoadingAction(true);
    try {
      const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
      const displayOrder = Math.max(...categories.map(c => c.display_order), 0) + 1;

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCategoryName,
          slug,
          is_active: true,
          display_order: displayOrder,
        })
        .select();

      if (error) throw error;

      setCategories([...categories, data[0]]);
      setNewCategoryName('');
      setShowAddModal(false);
      alert('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!editCategoryName.trim() || !editingCategory) {
      alert('Please enter a category name');
      return;
    }

    setLoadingAction(true);
    try {
      const slug = editCategoryName.toLowerCase().replace(/\s+/g, '-');

      const { data, error } = await supabase
        .from('categories')
        .update({
          name: editCategoryName,
          slug,
        })
        .eq('id', editingCategory.id)
        .select();

      if (error) throw error;

      setCategories(categories.map(c => (c.id === editingCategory.id ? data[0] : c)));
      setEditingCategory(null);
      setEditCategoryName('');
      setShowEditModal(false);
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Toggle category active status
  const handleToggleActive = async (category: Category) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id)
        .select();

      if (error) throw error;

      setCategories(categories.map(c => (c.id === category.id ? data[0] : c)));
    } catch (error) {
      console.error('Error toggling category status:', error);
      alert('Failed to update category status.');
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== id));
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  // Reorder categories
  const handleReorder = async (categoryId: string, newOrder: number) => {
    if (newOrder < 1 || newOrder > categories.length) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({ display_order: newOrder })
        .eq('id', categoryId);

      if (error) throw error;

      const updatedCategories = categories.map(c =>
        c.id === categoryId ? { ...c, display_order: newOrder } : c
      );
      updatedCategories.sort((a, b) => a.display_order - b.display_order);
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error reordering category:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 bg-background min-h-screen">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Categories Management</h1>
              <p className="text-muted-foreground">Add, edit, and manage product categories</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Icon name="PlusIcon" size={20} />
              Add Category
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <Icon name="FolderIcon" size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Categories Yet</h3>
              <p className="text-muted-foreground mb-6">Create your first category to get started</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                Add First Category
              </button>
            </div>
          ) : (
            /* Categories Table */
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full">
                <thead className="bg-card border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Slug</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Order</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-border hover:bg-card/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{category.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{category.slug}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReorder(category.id, category.display_order - 1)}
                            disabled={category.display_order === 1}
                            className="p-1 hover:bg-background rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <Icon name="ArrowUpIcon" size={16} />
                          </button>
                          <span className="w-8 text-center">{category.display_order}</span>
                          <button
                            onClick={() => handleReorder(category.id, category.display_order + 1)}
                            disabled={category.display_order === categories.length}
                            className="p-1 hover:bg-background rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <Icon name="ArrowDownIcon" size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleToggleActive(category)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            category.is_active
                              ? 'bg-green-500/20 text-green-700'
                              : 'bg-gray-500/20 text-gray-700'
                          }`}
                        >
                          {category.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setEditCategoryName(category.name);
                              setShowEditModal(true);
                            }}
                            className="p-2 hover:bg-background rounded text-primary transition-colors"
                            title="Edit"
                          >
                            <Icon name="PencilIcon" size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Icon name="TrashIcon" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Add New Category</h2>
            
            <input
              type="text"
              placeholder="Category name (e.g., Honey, Tea, Spices)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="input-base w-full mb-6"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary flex-1"
                disabled={loadingAction}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="btn btn-primary flex-1"
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <>
                    <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Edit Category</h2>
            
            <input
              type="text"
              placeholder="Category name"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              className="input-base w-full mb-6"
              onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory()}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                  setEditCategoryName('');
                }}
                className="btn btn-secondary flex-1"
                disabled={loadingAction}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                className="btn btn-primary flex-1"
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <>
                    <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
