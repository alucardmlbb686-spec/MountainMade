"use client";

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function FilterSidebar({ onFilterChange, isMobileOpen, onMobileClose }: FilterSidebarProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        // Check for AbortError in both message and details
        if (error) {
          const isAbortError = 
            error?.message?.includes('AbortError') ||
            error?.details?.includes('AbortError');
          
          if (isAbortError) {
            // Silently ignore abort errors - expected during auth init
            return;
          }
          
          throw error;
        }
        
        if (isMounted) {
          setCategories(data || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching categories:', error);
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    onFilterChange({
      categories: selectedCategories,
      priceRange,
      organicOnly,
      sortBy,
    });
  }, [selectedCategories, priceRange, organicOnly, sortBy, isHydrated, onFilterChange]);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 5000]);
    setOrganicOnly(false);
    setSortBy('popularity');
  };

  const sidebarContent = (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Squares2X2Icon" size={20} />
          Categories
        </h3>
        <div className="space-y-3">
          {loadingCategories ? (
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          ) : (
            categories.map((category) => (
              <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => handleCategoryToggle(category.name)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                  {category.name}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="CurrencyRupeeIcon" size={20} />
          Price Range
        </h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full accent-primary"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Organic Filter */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={organicOnly}
            onChange={(e) => setOrganicOnly(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <div className="flex items-center gap-2">
            <Icon name="CheckBadgeIcon" size={20} className="text-success" variant="solid" />
            <span className="text-sm font-medium text-foreground">100% Organic Only</span>
          </div>
        </label>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="AdjustmentsHorizontalIcon" size={20} />
          Sort By
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full input-base"
        >
          <option value="popularity">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="new">New Arrivals</option>
        </select>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full btn btn-secondary text-sm"
      >
        <Icon name="XMarkIcon" size={18} />
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block sticky top-24 h-fit">
        <div className="bg-card rounded-xl-organic p-6 border border-border">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onMobileClose}>
          <div
            className="absolute top-0 left-0 h-full w-80 bg-card p-6 overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Filters</h2>
              <button
                onClick={onMobileClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="XMarkIcon" size={24} className="text-foreground" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}