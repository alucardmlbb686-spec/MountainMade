"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

interface ProductSuggestion {
  id: string;
  name: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const supabase = useSupabaseClient();
  const { authReady } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch suggestions from database
  useEffect(() => {
    if (!searchQuery.trim() || !authReady) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let isMounted = true;

    const fetchSuggestions = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name')
          .eq('is_active', true)
          .gt('stock', 0)
          .ilike('name', `%${searchQuery}%`)
          .limit(8);

        if (error) {
          const isAbortError = 
            error?.message?.includes('AbortError') ||
            error?.details?.includes('AbortError');
          
          if (isAbortError) return;
          throw error;
        }

        if (!isMounted) return;
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching suggestions:', error);
        }
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [searchQuery, authReady, supabase]);

  const navLinks = [
    { id: 'nav_home', label: 'Home', href: '/homepage' },
    { id: 'nav_shop', label: 'Shop', href: '/categories' },
    { id: 'nav_about', label: 'Our Story', href: '/homepage#about' },
    { id: 'nav_sustainability', label: 'Sustainability', href: '/homepage#sustainability' },
    { id: 'nav_track_order', label: 'Track Order', href: '/order-tracking' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/categories?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productName: string) => {
    setSearchQuery(productName);
    router.push(`/categories?search=${encodeURIComponent(productName)}`);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all overflow-x-hidden ${
        isScrolled ? 'glass-card shadow-lg py-1.5 md:py-2.5' : 'bg-white md:bg-transparent py-1.5 md:py-3'
      }`}
    >
      {/* Top Banner - Hidden on mobile */}
      {!isScrolled && (
        <div className="hidden md:block bg-gradient-to-r from-primary to-green-700 text-primary-foreground py-2 text-center text-xs sm:text-sm font-medium">
          <div className="container mx-auto flex items-center justify-center gap-2 px-2">
            <Icon name="SparklesIcon" size={14} variant="solid" />
            <span className="font-semibold">15% OFF + Free Shipping | Code: MOUNTAIN15</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 md:px-3 lg:px-4 py-1 md:py-0 overflow-x-hidden">
        <div className="flex flex-col gap-2 md:gap-0 lg:gap-0">
          {/* First Row: Logo, Nav, Actions */}
          <div className="flex items-center justify-between gap-1 md:gap-2 lg:gap-4">
            {/* Logo */}
            <Link href="/homepage" className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 flex-shrink-0 min-w-0">
              <AppImage
                src="/assets/images/WhatsApp_Image_2026-02-04_at_1.00.46_PM-1770372538730.jpeg"
                alt="MountainMade Logo"
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-foreground font-serif leading-tight block truncate">MountainMade</span>
                <span className="hidden lg:block text-xs text-muted-foreground font-medium leading-tight">Organic</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks?.map((link) => (
                <Link
                  key={link?.id}
                  href={link?.href}
                  className={`text-sm font-semibold hover:text-primary ${
                    pathname === link?.href ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {link?.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:block lg:flex-1 lg:max-w-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  className="w-full px-4 py-2 pl-10 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <Icon name="XMarkIcon" size={16} />
                  </button>
                )}

                {/* Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSuggestionClick(product.name)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors text-sm"
                      >
                        <span className="text-foreground font-medium">{product.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
              {/* Trust Badge - Hidden on small screens */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <Icon name="StarIcon" size={14} variant="solid" className="text-amber-500" />
                <span className="font-bold text-amber-700">4.9/5</span>
              </div>

              <Link
                href="/cart"
                className="relative p-2 md:p-2.5 hover:opacity-70"
              >
                <Icon name="ShoppingCartIcon" size={24} className="text-foreground md:w-6 md:h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center shadow-md">
                    {itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <Link href="/my-account" className="hidden md:flex items-center gap-2 btn btn-secondary text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2">
                  <Icon name="UserCircleIcon" size={16} />
                  <span className="hidden lg:inline">Account</span>
                </Link>
              ) : (
                <>
                  <Link href="/admin-login" className="hidden lg:flex items-center gap-2 btn btn-secondary text-sm px-4 py-2">
                    <Icon name="ShieldCheckIcon" size={18} />
                    Admin
                  </Link>

                  <Link href="/wholesale-login" className="hidden lg:flex items-center gap-2 btn btn-secondary text-sm px-4 py-2">
                    <Icon name="BuildingStorefrontIcon" size={18} />
                    Wholesale
                  </Link>

                  <Link href="/user-login" className="hidden md:block btn btn-primary text-xs md:text-sm px-3 md:px-6 py-1.5 md:py-2.5">
                    Sign In
                  </Link>
                </>
              )}

              {/* Mobile Menu Button - Only on tablet/desktop */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hidden md:block p-1.5 hover:opacity-70"
                aria-label="Toggle menu"
              >
                <Icon name={isMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} className="text-foreground" />
              </button>
            </div>
          </div>

          {/* Second Row: Search Bar (Mobile Only) */}
          <form onSubmit={handleSearch} className="md:hidden w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                className="w-full px-4 py-2.5 pl-10 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <Icon name="XMarkIcon" size={18} />
                </button>
              )}

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSuggestionClick(product.name)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <span className="text-sm text-foreground font-medium">{product.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-card border-b border-border shadow-lg">
          <nav className="container mx-auto px-3 py-4 flex flex-col gap-3">
            {navLinks?.map((link) => (
              <Link
                key={link?.id}
                href={link?.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-medium py-2 ${
                  pathname === link?.href ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
              >
                {link?.label}
              </Link>
            ))}
            {user ? (
              <Link href="/my-account" className="btn btn-primary w-full justify-center mt-4" onClick={() => setIsMenuOpen(false)}>
                My Account
              </Link>
            ) : (
              <>
                <Link href="/admin-login" className="btn btn-secondary w-full justify-center flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <Icon name="ShieldCheckIcon" size={18} />
                  Admin Login
                </Link>
                <Link href="/wholesale-login" className="btn btn-secondary w-full justify-center flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <Icon name="BuildingStorefrontIcon" size={18} />
                  Wholesale Login
                </Link>
                <Link href="/user-login" className="btn btn-primary w-full justify-center mt-2" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}