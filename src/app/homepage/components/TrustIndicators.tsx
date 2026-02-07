import Icon from '@/components/ui/AppIcon';

interface TrustBadge {
  id: string;
  icon: string;
  label: string;
  value: string;
  subtext?: string;
}

export default function TrustIndicators() {
  const badges: TrustBadge[] = [
    { id: 'badge_certified', icon: 'CheckBadgeIcon', label: 'USDA Organic', value: 'Certified', subtext: 'Lab-tested purity' },
    { id: 'badge_farmers', icon: 'UsersIcon', label: '500+ Farmers', value: 'Verified Partners', subtext: 'Direct sourcing' },
    { id: 'badge_customers', icon: 'HeartIcon', label: '50,000+', value: 'Happy Customers', subtext: '4.9★ average rating' },
    { id: 'badge_traceability', icon: 'MapPinIcon', label: '100% Traceable', value: 'Farm to Table', subtext: 'QR code tracking' },
    { id: 'badge_shipping', icon: 'TruckIcon', label: 'Fast Delivery', value: '2-3 Days', subtext: 'Free on ₹999+' },
    { id: 'badge_guarantee', icon: 'ShieldCheckIcon', label: 'Money-Back', value: '30-Day Guarantee', subtext: 'Risk-free purchase' },
  ];

  return (
    <section className="hidden md:block py-20 border-t border-b border-border bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-serif tracking-tight">Why 50,000+ Families Trust Us</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">Uncompromising quality, transparency, and sustainability in every product</p>
        </div>

        {/* Trust Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-border">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon name={badge.icon as any} size={32} className="text-primary" variant="solid" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground mb-1.5 tracking-tight">{badge.label}</p>
                <p className="text-sm font-semibold text-primary mb-1">{badge.value}</p>
                {badge.subtext && (
                  <p className="text-xs text-muted-foreground font-medium">{badge.subtext}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Trust Signals */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-sm">
              <Icon name="CheckCircleIcon" size={28} className="text-green-600" variant="solid" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground tracking-tight">ISO 22000 Certified</p>
              <p className="text-xs text-muted-foreground font-medium">Food Safety Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm">
              <Icon name="GlobeAltIcon" size={28} className="text-blue-600" variant="solid" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground tracking-tight">Carbon Neutral Shipping</p>
              <p className="text-xs text-muted-foreground font-medium">Eco-friendly packaging</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shadow-sm">
              <Icon name="AcademicCapIcon" size={28} className="text-amber-600" variant="solid" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground tracking-tight">Fair Trade Certified</p>
              <p className="text-xs text-muted-foreground font-medium">Ethical sourcing practices</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}