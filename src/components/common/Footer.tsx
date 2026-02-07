import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function Footer() {
  const shopLinks = [
    { id: 'footer_categories', label: 'Categories', href: '/categories' },
    { id: 'footer_bestsellers', label: 'Bestsellers', href: '/categories?filter=bestseller' },
    { id: 'footer_new', label: 'New Arrivals', href: '/categories?filter=new' },
  ];

  const aboutLinks = [
    { id: 'footer_story', label: 'Our Story', href: '/homepage#about' },
    { id: 'footer_sustainability', label: 'Sustainability', href: '/homepage#sustainability' },
    { id: 'footer_farmers', label: 'Our Farmers', href: '/homepage#farmers' },
  ];

  const supportLinks = [
    { id: 'footer_faq', label: 'FAQ', href: '/homepage#faq' },
    { id: 'footer_contact', label: 'Contact Us', href: '/homepage#contact' },
    { id: 'footer_track', label: 'Track Order', href: '/homepage#track' },
  ];

  const socialLinks = [
    { id: 'social_instagram', icon: 'Instagram', href: '#', label: 'Instagram' },
    { id: 'social_facebook', icon: 'Facebook', href: '#', label: 'Facebook' },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-white border-t border-border pt-20 pb-10">
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Icon name="MountainIcon" size={32} className="text-primary" variant="solid" />
              <span className="text-2xl font-bold font-serif text-foreground tracking-tight">MountainMade</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Pure, organic foods sourced directly from mountain farmers. Experience authenticity from the Himalayas to your home.
            </p>
            {/* Newsletter */}
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="input-base flex-1 text-sm"
              />
              <button type="submit" className="btn btn-primary px-5 py-3">
                <Icon name="PaperAirplaneIcon" size={18} />
              </button>
            </form>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-5">Shop</h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-5">About</h3>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-5">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground font-medium">
            © 2026 MountainMade. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.href}
                aria-label={social.label}
                className="p-3 hover:bg-primary/10 rounded-full transition-all duration-300 border border-transparent hover:border-primary/20"
              >
                <Icon name={`${social.icon}Icon` as any} size={20} className="text-muted-foreground hover:text-primary transition-colors" />
              </a>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
            <Link href="/homepage#privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/homepage#terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}