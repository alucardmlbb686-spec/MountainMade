"use client";

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';



interface ShippingFormProps {
  onSubmit: (data: any) => void;
  savedAddresses?: any[];
  loadingAddresses?: boolean;
  userId?: string;
}

export default function ShippingForm({ onSubmit, savedAddresses = [], loadingAddresses = false, userId }: ShippingFormProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Auto-select default address if available
    if (savedAddresses.length > 0 && !selectedAddressId && !useNewAddress) {
      const defaultAddress = savedAddresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setFormData({
          fullName: defaultAddress.full_name,
          email: defaultAddress.email,
          phone: defaultAddress.phone,
          address: defaultAddress.address,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
        });
      }
    }
  }, [savedAddresses, selectedAddressId, useNewAddress]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setFormData({
        fullName: address.full_name,
        email: address.email,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      });
    }
  };

  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${isHydrated ? 'animate-fade-in-up' : 'opacity-0'}`}>
      <div>
        <h2 className="text-2xl font-bold text-foreground font-serif mb-6">
          Shipping Information
        </h2>
      </div>

      {/* Saved Addresses Section */}
      {userId && savedAddresses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Select Saved Address</h3>
          {loadingAddresses ? (
            <div className="text-center py-4">
              <Icon name="ArrowPathIcon" size={24} className="animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              {savedAddresses?.map((address) => (
                <div
                  key={address.id}
                  onClick={() => handleAddressSelect(address.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAddressId === address.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{address.full_name}</h4>
                        {address.is_default && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                            <Icon name="CheckCircleIcon" size={12} />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{address.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                    </div>
                    {selectedAddressId === address.id && (
                      <Icon name="CheckCircleIcon" size={24} className="text-primary" />
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleUseNewAddress}
                className={`w-full border rounded-lg p-4 text-left transition-all ${
                  useNewAddress
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="PlusIcon" size={20} className="text-primary" />
                  <span className="font-semibold text-foreground">Use a new address</span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Show form only if using new address or no saved addresses */}
      {(useNewAddress || savedAddresses.length === 0 || !userId) && (
        <>
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-foreground mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="input-base"
              placeholder="Rajesh Kumar"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-base"
                placeholder="rajesh@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="input-base"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-foreground mb-2">
              Street Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="input-base"
              placeholder="123 Main Street, Apartment 4B"
            />
          </div>

          {/* City, State, Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-foreground mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="input-base"
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-foreground mb-2">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="input-base"
                placeholder="Maharashtra"
              />
            </div>
            <div>
              <label htmlFor="pincode" className="block text-sm font-semibold text-foreground mb-2">
                Pincode *
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                className="input-base"
                placeholder="400001"
              />
            </div>
          </div>
        </>
      )}

      {/* Submit */}
      <button type="submit" className="btn btn-primary w-full text-lg py-3">
        Continue to Payment
        <Icon name="ArrowRightIcon" size={20} />
      </button>

      {userId && (
        <div className="text-center">
          <a
            href="/my-account/addresses"
            className="text-sm text-primary hover:underline font-medium"
          >
            Manage saved addresses
          </a>
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Icon name="ShieldCheckIcon" size={16} className="text-success" />
        Your information is protected with 256-bit encryption
      </div>
    </form>
  );
}