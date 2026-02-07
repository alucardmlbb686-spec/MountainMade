"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'nav_home', label: 'Home', href: '/homepage' },
    { id: 'nav_shop', label: 'Shop', href: '/categories' },
    { id: 'nav_about', label: 'Our Story', href: '/homepage#about' },
    { id: 'nav_sustainability', label: 'Sustainability', href: '/homepage#sustainability' },
    { id: 'nav_track_order', label: 'Track Order', href: '/order-tracking' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 ${
        isScrolled ? 'glass-card shadow-lg py-1.5 md:py-2.5' : 'bg-transparent py-1.5 md:py-3'
      }`}
    >
      {/* Top Banner - Hidden on mobile */}
      {!isScrolled && (
        <div className="hidden sm:block bg-gradient-to-r from-primary to-green-700 text-primary-foreground py-2 text-center text-xs sm:text-sm font-medium">
          <div className="container mx-auto flex items-center justify-center gap-2 px-2">
            <Icon name="SparklesIcon" size={14} variant="solid" />
            <span className="font-semibold">15% OFF + Free Shipping | Code: MOUNTAIN15</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 md:px-3 lg:px-4">
        <div className="flex items-center justify-between gap-1 md:gap-2 lg:gap-4">
          {/* Logo */}
          <Link href="/homepage" className="flex items-center gap-1.5 md:gap-2 lg:gap-3 flex-shrink-0 min-w-0">
            <AppImage
              src="/assets/images/WhatsApp_Image_2026-02-04_at_1.00.46_PM-1770372538730.jpeg"
              alt="MountainMade Logo"
              className="w-7 h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 object-contain flex-shrink-0"
            />
            <div className="hidden sm:block min-w-0">
              <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-foreground font-serif leading-tight block truncate">MountainMade</span>
              <span className="hidden md:block text-xs text-muted-foreground font-medium leading-tight">Organic</span>
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
              <Icon name="ShoppingCartIcon" size={20} className="text-foreground md:w-6 md:h-6" />
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 md:p-2 hover:opacity-70"
              aria-label="Toggle menu"
            >
              <Icon name={isMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={20} className="text-foreground md:w-6 md:h-6" />
            </button>
          </div>
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