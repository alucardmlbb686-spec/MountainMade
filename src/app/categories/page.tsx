"use client";

import { useState } from 'react';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import FilterSidebar from './components/FilterSidebar';
import ProductGrid from './components/ProductGrid';
import Icon from '@/components/ui/AppIcon';

export default function CategoriesPage() {
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 5000],
    organicOnly: false,
    sortBy: 'popularity',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="pt-16 sm:pt-20 md:pt-24 pb-16 bg-background min-h-screen">
        <div className="container mx-auto px-3 md:px-4">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-serif mb-2 md:mb-3">
              Explore Our Collection
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Curated selections of pure, organic foods from mountain regions
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by name, category, or origin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base w-full pl-10 focus:ring-2 focus:ring-primary"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden btn btn-secondary mb-6 w-full"
          >
            <Icon name="AdjustmentsHorizontalIcon" size={20} />
            Filters & Sort
          </button>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <FilterSidebar
              onFilterChange={setFilters}
              isMobileOpen={isMobileFilterOpen}
              onMobileClose={() => setIsMobileFilterOpen(false)}
            />
            <div className="lg:col-span-3">
              <ProductGrid filters={filters} searchTerm={searchTerm} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}