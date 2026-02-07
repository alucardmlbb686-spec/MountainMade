"use client";

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PaymentFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export default function PaymentForm({ onSubmit, onBack, isSubmitting = false }: PaymentFormProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentData =
      paymentMethod === 'card'
        ? { method: 'card', ...cardData }
        : paymentMethod === 'upi'
        ? { method: 'upi', upiId }
        : { method: 'cod' };
    onSubmit(paymentData);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}>
      <div>
        <h2 className="text-2xl font-bold text-foreground font-serif mb-6">
          Payment Method
        </h2>
      </div>

      {/* Payment Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setPaymentMethod('card')}
          className={`p-4 rounded-xl border-2 transition-all ${
            paymentMethod === 'card' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
          }`}
        >
          <Icon name="CreditCardIcon" size={32} className={paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground'} />
          <p className="font-semibold text-foreground mt-2">Card</p>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod('upi')}
          className={`p-4 rounded-xl border-2 transition-all ${
            paymentMethod === 'upi' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
          }`}
        >
          <Icon name="QrCodeIcon" size={32} className={paymentMethod === 'upi' ? 'text-primary' : 'text-muted-foreground'} />
          <p className="font-semibold text-foreground mt-2">UPI</p>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod('cod')}
          className={`p-4 rounded-xl border-2 transition-all ${
            paymentMethod === 'cod' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
          }`}
        >
          <Icon name="BanknotesIcon" size={32} className={paymentMethod === 'cod' ? 'text-primary' : 'text-muted-foreground'} />
          <p className="font-semibold text-foreground mt-2">Cash on Delivery</p>
        </button>
      </div>

      {/* Card Form */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Card Number *
            </label>
            <input
              type="text"
              required
              value={cardData.cardNumber}
              onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
              className="input-base"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Cardholder Name *
            </label>
            <input
              type="text"
              required
              value={cardData.cardName}
              onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
              className="input-base"
              placeholder="RAJESH KUMAR"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Expiry Date *
              </label>
              <input
                type="text"
                required
                value={cardData.expiry}
                onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                className="input-base"
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                CVV *
              </label>
              <input
                type="text"
                required
                value={cardData.cvv}
                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                className="input-base"
                placeholder="123"
                maxLength={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* UPI Form */}
      {paymentMethod === 'upi' && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            UPI ID *
          </label>
          <input
            type="text"
            required
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="input-base"
            placeholder="yourname@upi"
          />
        </div>
      )}

      {/* COD Message */}
      {paymentMethod === 'cod' && (
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <div className="flex items-start gap-3">
            <Icon name="InformationCircleIcon" size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">
                Pay with cash when your order is delivered. Please keep exact change ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 py-4 border-t border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="LockClosedIcon" size={16} className="text-success" />
          SSL Encrypted
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="ShieldCheckIcon" size={16} className="text-success" />
          PCI-DSS Compliant
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary flex-1"
          disabled={isSubmitting}
        >
          <Icon name="ArrowLeftIcon" size={20} />
          Back
        </button>
        <button 
          type="submit" 
          className="btn btn-primary flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Place Order
              <Icon name="CheckIcon" size={20} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}