"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

export default function AdminUploadPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'admin')) {
      router.push('/admin-login');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
        
        // Set first category as default
        if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0].name }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [supabase]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        setUploadError('Only JPEG, PNG, WebP, and GIF images are allowed');
        return;
      }
      setSelectedFile(file);
      setUploadError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      let imageUrl = '';

      // Upload image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Insert product
      const { error: insertError } = await supabase.from('products').insert({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image_url: imageUrl,
        is_active: true,
      });

      if (insertError) throw insertError;

      // Log activity
      await supabase.from('user_activity').insert({
        user_id: user?.id,
        action_type: 'product_create',
        description: `Created new product: ${formData.name}`,
        metadata: { category: formData.category, price: formData.price },
      });

      setUploadSuccess(true);
      setFormData({ name: '', description: '', price: '', category: categories[0]?.name || '', stock: '' });
      setImagePreview(null);
      setSelectedFile(null);

      setTimeout(() => {
        router.push('/admin-dashboard/products');
      }, 2000);
    } catch (error: any) {
      console.error('Error uploading product:', error);
      setUploadError(error.message || 'Failed to upload product');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user || userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin-dashboard" className="text-muted-foreground hover:text-foreground">
                <Icon name="ArrowLeftIcon" size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-serif">Upload Food Item</h1>
                <p className="text-sm text-muted-foreground">Add new products to your store</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Product Image</label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                      }}
                      className="btn btn-secondary"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Icon name="CloudArrowUpIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mb-4">PNG, JPG, WebP or GIF (max. 5MB)</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="btn btn-primary cursor-pointer">
                      Select Image
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input-base"
                placeholder="e.g., Himalayan Honey"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input-base"
                placeholder="Describe your product..."
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-foreground mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="input-base"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-semibold text-foreground mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="input-base"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-foreground mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="input-base"
                disabled={loadingCategories}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg flex items-center gap-2">
                <Icon name="ExclamationCircleIcon" size={20} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="bg-green-500/10 border border-green-500 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={20} />
                <span>Product uploaded successfully! Redirecting...</span>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" disabled={uploading} className="btn btn-primary w-full">
              {uploading ? (
                <>
                  <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Icon name="CloudArrowUpIcon" size={20} />
                  Upload Product
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}