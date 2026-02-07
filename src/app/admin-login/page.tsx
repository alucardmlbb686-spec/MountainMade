"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn, user, userProfile, loading } = useAuth();
  const supabase = createClient();
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
    if (!loading && user && userProfile?.role === 'admin') {
      router.push('/admin-dashboard');
    }
  }, [user, userProfile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(false);

    setIsSubmitting(true);

    try {
      // Sign in first
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (authData.user) {
        // Fetch profile directly
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          const errorMsg = profileError?.message || String(profileError);
          // Only log non-abort errors
          const isAbortError = errorMsg.includes('AbortError') || 
                               errorMsg.includes('abort') || 
                               errorMsg.includes('signal is aborted') ||
                               errorMsg.includes('Request was aborted');
          if (!isAbortError) {
            console.error('Profile fetch error:', errorMsg);
          }
          setError('Unable to verify admin privileges. Please try again.');
          await supabase.auth.signOut();
          setIsSubmitting(false);
          return;
        }

        if (profile?.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
          setIsSubmitting(false);
          return;
        }

        // Success - redirect to dashboard
        router.push('/admin-dashboard');
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err) || 'Invalid credentials';
      // Only log non-abort errors
      const isAbortError = errorMsg.includes('AbortError') || 
                           errorMsg.includes('abort') || 
                           errorMsg.includes('signal is aborted') ||
                           errorMsg.includes('Request was aborted');
      if (!isAbortError) {
        console.error('Login error:', err);
        setError(errorMsg);
      }
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="ArrowPathIcon" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>);

  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="relative rounded-xl-organic overflow-hidden premium-shadow">
            <AppImage
              src="https://img.rocket.new/generatedImages/rocket_gen_img_12f28e152-1766742440887.png"
              alt="Professional workspace with laptop and documents for admin management"
              className="w-full aspect-portrait object-cover" />
            
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-12">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="ShieldCheckIcon" size={40} className="text-primary" variant="solid" />
                <span className="text-3xl font-bold text-white font-serif">Admin Portal</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-serif">
                Manage Your MountainMade Store
              </h2>
              <p className="text-white/90 leading-relaxed">
                Secure access to your admin dashboard. Monitor orders, manage products, and oversee your entire e-commerce operation.
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
              <Icon name="ShieldCheckIcon" size={32} className="text-primary" variant="solid" />
              <span className="text-2xl font-bold text-foreground font-serif">Admin Portal</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
                Admin Sign In
              </h1>
              <p className="text-muted-foreground">
                Enter your credentials to access the admin dashboard
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="InformationCircleIcon" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground mb-1">Demo Admin Credentials:</p>
                  <p className="text-muted-foreground">Email: admin@mountainmade.com</p>
                  <p className="text-muted-foreground">Password: Admin@123</p>
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
                  placeholder="admin@mountainmade.com"
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
                    Sign In to Admin Portal
                    <Icon name="ArrowRightIcon" size={20} />
                  </>
                }
              </button>
            </form>

            {/* Security Badge */}
            <div className="mt-8 pt-6 border-t border-border">
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