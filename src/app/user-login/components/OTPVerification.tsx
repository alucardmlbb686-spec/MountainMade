"use client";

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface OTPVerificationProps {
  email: string;
  onVerify: () => void;
  onBack: () => void;
}

export default function OTPVerification({ email, onVerify, onBack }: OTPVerificationProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpValue = otp.join('');
    if (otpValue === '123456') {
      onVerify();
    } else {
      setError('Invalid OTP. Please try: 123456');
    }
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    alert('New OTP sent to ' + email);
  };

  return (
    <div className={`${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <Icon name="ArrowLeftIcon" size={20} />
        Back to login
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="EnvelopeIcon" size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground font-serif mb-2">
          Verify Your Email
        </h2>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to<br />
          <span className="font-semibold text-foreground">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
            <Icon name="ExclamationCircleIcon" size={20} className="text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex gap-3 justify-center">
          {otp.map((digit, index) => (
            <input
              key={`otp_input_${index}`}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
            />
          ))}
        </div>

        {/* Timer & Resend */}
        <div className="text-center text-sm">
          {timer > 0 ? (
            <p className="text-muted-foreground">
              Resend code in <span className="font-semibold text-foreground">{timer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary hover:text-primary/80 transition-colors font-semibold"
            >
              Resend Code
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={otp.some((d) => !d)}
          className="btn btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify & Continue
          <Icon name="CheckIcon" size={20} />
        </button>
      </form>
    </div>
  );
}