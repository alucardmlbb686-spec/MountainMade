"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import OTPVerification from './components/OTPVerification';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function UserLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');

  const handleOTPRequest = (userEmail: string) => {
    setEmail(userEmail);
    setStep('otp');
  };

  const handleSignupSuccess = (userEmail: string) => {
    setEmail(userEmail);
    // Simulate account creation and redirect
    setTimeout(() => {
      alert('Account created successfully! Welcome to MountainMade.');
      router.push('/homepage');
    }, 1500);
  };

  const handleVerify = () => {
    alert('Login successful! Welcome to MountainMade.');
    router.push('/homepage');
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setStep('form');
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 bg-background min-h-screen">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Side - Branding */}
            <div className="hidden lg:block">
              <div className="relative rounded-xl-organic overflow-hidden premium-shadow">
                <AppImage
                  src="https://images.unsplash.com/photo-1727296629037-514d0d351428"
                  alt="Majestic mountain peaks with morning mist and green valley below"
                  className="w-full aspect-portrait object-cover" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-12">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="MountainIcon" size={40} className="text-white" variant="solid" />
                    <span className="text-3xl font-bold text-white font-serif">MountainMade</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4 font-serif">
                    Pure. Authentic. Direct from the Mountains.
                  </h2>
                  <p className="text-white/90 leading-relaxed">
                    Join thousands of conscious consumers who choose quality over convenience. Experience the taste of mountain heritage.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Forms */}
            <div>
              <div className="bg-card rounded-xl-organic border border-border p-8 lg:p-12 premium-shadow">
                {/* Logo (Mobile) */}
                <div className="lg:hidden flex items-center gap-2 mb-8">
                  <Icon name="MountainIcon" size={32} className="text-primary" variant="solid" />
                  <span className="text-2xl font-bold text-foreground font-serif">MountainMade</span>
                </div>

                {/* Header */}
                {step === 'form' && (
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
                      {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-muted-foreground">
                      {mode === 'login' ?'Sign in to your MountainMade account' :'Join the MountainMade community today'}
                    </p>
                  </div>
                )}

                {/* Forms */}
                {step === 'form' && mode === 'login' && (
                  <LoginForm onOTPRequest={handleOTPRequest} onSwitchToSignup={handleSwitchMode} />
                )}
                {step === 'form' && mode === 'signup' && (
                  <SignupForm onSignupSuccess={handleSignupSuccess} onSwitchToLogin={handleSwitchMode} />
                )}
                {step === 'otp' && (
                  <OTPVerification
                    email={email}
                    onVerify={handleVerify}
                    onBack={() => setStep('form')} />
                )}

                {/* Security Badge */}
                {step === 'form' && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Icon name="ShieldCheckIcon" size={16} className="text-success" />
                      Your data is protected with 256-bit encryption
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}