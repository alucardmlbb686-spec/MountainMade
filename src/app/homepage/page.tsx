import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HeroSection from './components/HeroSection';
import TrustIndicators from './components/TrustIndicators';
import FeaturedCategories from './components/FeaturedCategories';
import FeaturedProducts from './components/FeaturedProducts';
import SourcingStory from './components/SourcingStory';
import Testimonials from './components/Testimonials';
import CTASection from './components/CTASection';

export const metadata: Metadata = {
  title: 'MountainMade - Pure Organic Foods from the Himalayas',
  description: 'Discover 100% organic, mountain-sourced foods directly from Himalayan farmers. Honey, grains, spices, herbs, and artisan products with complete traceability.',
  keywords: 'organic food, himalayan honey, mountain grains, sustainable farming, farmer direct, pure spices',
};

export default function Homepage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustIndicators />
        <FeaturedCategories />
        <FeaturedProducts />
        <SourcingStory />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}