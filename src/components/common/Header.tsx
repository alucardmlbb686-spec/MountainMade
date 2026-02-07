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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'glass-card shadow-lg py-3' : 'bg-transparent py-4'
      }`}
    >
      {/* Top Banner */}
      {!isScrolled && (
        <div className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground py-2.5 text-center text-sm font-medium">
          <div className="container mx-auto flex items-center justify-center gap-2">
            <Icon name="SparklesIcon" size={18} variant="solid" />
            <span className="font-semibold">New Customer Offer: 15% OFF + Free Shipping | Code: MOUNTAIN15</span>
          </div>
        </div>
      )}

      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/homepage" className="flex items-center gap-3 group">
            <AppImage
              src="/assets/images/WhatsApp_Image_2026-02-04_at_1.00.46_PM-1770372538730.jpeg"
              alt="MountainMade Logo"
              className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
            />
            <div>
              <span className="text-2xl font-bold text-foreground font-serif block leading-none tracking-tight">MountainMade</span>
              <span className="text-xs text-muted-foreground font-medium">100% Organic Certified</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks?.map((link) => (
              <Link
                key={link?.id}
                href={link?.href}
                className={`text-sm font-semibold transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full ${
                  pathname === link?.href ? 'text-primary after:w-full' : 'text-foreground'
                }`}
              >
                {link?.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Trust Badge */}
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <Icon name="StarIcon" size={14} variant="solid" className="text-amber-500" />
              <span className="font-bold text-amber-700">4.9/5</span>
            </div>

            <Link
              href="/cart"
              className="relative p-2.5 hover:bg-muted rounded-full transition-colors"
            >
              <Icon name="ShoppingCartIcon" size={24} className="text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link href="/my-account" className="hidden sm:flex items-center gap-2 btn btn-secondary text-sm px-4 py-2">
                <Icon name="UserCircleIcon" size={18} />
                My Account
              </Link>
            ) : (
              <>
                <Link href="/admin-login" className="hidden sm:flex items-center gap-2 btn btn-secondary text-sm px-4 py-2">
                  <Icon name="ShieldCheckIcon" size={18} />
                  Admin
                </Link>

                <Link href="/wholesale-login" className="hidden sm:flex items-center gap-2 btn btn-secondary text-sm px-4 py-2">
                  <Icon name="BuildingStorefrontIcon" size={18} />
                  Wholesale
                </Link>

                <Link href="/user-login" className="hidden sm:block btn btn-primary text-sm px-6 py-2.5">
                  Sign In
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Icon name={isMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full glass-card shadow-lg">
          <nav className="container mx-auto py-6 flex flex-col gap-4">
            {navLinks?.map((link) => (
              <Link
                key={link?.id}
                href={link?.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                  pathname === link?.href ? 'text-primary' : 'text-foreground'
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