"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

export default function WholesaleLoginPage() {
  const router = useRouter();
  const { signIn, user, userProfile, loading } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!loading && user && userProfile?.role === 'wholesale') {
      router.push('/wholesale-dashboard');
    }
  }, [user, userProfile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signIn(formData.email, formData.password);

      if (userProfile?.role !== 'wholesale') {
        setError('Access denied. Wholesale account required.');
        setIsSubmitting(false);
        return;
      }

      router.push('/wholesale-dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="relative rounded-xl-organic overflow-hidden premium-shadow">
            <AppImage
              src="https://images.unsplash.com/photo-1729774288643-1ae4839df482"
              alt="Warehouse with stacked boxes and inventory for wholesale business operations"
              className="w-full aspect-portrait object-cover" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-12">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="BuildingStorefrontIcon" size={40} className="text-primary" variant="solid" />
                <span className="text-3xl font-bold text-white font-serif">Wholesale Portal</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-serif">
                Bulk Orders Made Simple
              </h2>
              <p className="text-white/90 leading-relaxed">
                Access exclusive wholesale pricing, manage bulk orders, and grow your business with MountainMade's premium organic products.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div>
          <div className="bg-card rounded-xl-organic border border-border p-8 lg:p-12 premium-shadow">
            {/* Back Button */}
            <Link 
              href="/homepage" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
            >
              <Icon name="ArrowLeftIcon" size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            {/* Logo (Mobile) */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <Icon name="BuildingStorefrontIcon" size={32} className="text-primary" variant="solid" />
              <span className="text-2xl font-bold text-foreground font-serif">Wholesale Portal</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
                Wholesale Sign In
              </h1>
              <p className="text-muted-foreground">
                Enter your credentials to access wholesale pricing and bulk ordering
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="InformationCircleIcon" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground mb-1">Demo Wholesale Credentials:</p>
                  <p className="text-muted-foreground">Email: wholesale@mountainmade.com</p>
                  <p className="text-muted-foreground">Password: Wholesale@123</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={`space-y-6 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {/* Error Message */}
              {error &&
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
                  <Icon name="ExclamationCircleIcon" size={20} className="text-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              }

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-base"
                  placeholder="wholesale@mountainmade.com"
                  disabled={isSubmitting} />
                
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-base pr-12"
                    placeholder="••••••••"
                    disabled={isSubmitting} />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isSubmitting}>
                    
                    <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    disabled={isSubmitting} />
                  
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full text-lg py-3"
                disabled={isSubmitting}>
                
                {isSubmitting ?
                <>
                    <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                    Signing In...
                  </> :

                <>
                    Sign In to Wholesale Portal
                    <Icon name="ArrowRightIcon" size={20} />
                  </>
                }
              </button>
            </form>

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground mb-2">
                Need a wholesale account?
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Contact us at <span className="text-primary font-semibold">wholesale@mountainmade.com</span> or call <span className="text-primary font-semibold">(555) 123-4567</span>
              </p>
            </div>

            {/* Security Badge */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Icon name="LockClosedIcon" size={16} className="text-success" />
                Secured with enterprise-grade encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>);

}