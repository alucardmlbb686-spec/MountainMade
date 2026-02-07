'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ProductGallery from './components/ProductGallery';
import ProductInfo from './components/ProductInfo';
import ProductTabs from './components/ProductTabs';
import RelatedProducts from './components/RelatedProducts';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  is_active: boolean;
}

function ProductDetailsContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('No product ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase.
        from('products').
        select('*').
        eq('id', productId).
        single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Product not found');

        setProduct(data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <main className="pt-24 pb-16">
        <div className="container mx-auto text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </main>);

  }

  if (error || !product) {
    return (
      <main className="pt-24 pb-16">
        <div className="container mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">{error || 'The product you are looking for does not exist.'}</p>
          <a href="/categories" className="btn btn-primary">Back to Shop</a>
        </div>
      </main>);

  }

  const productImages = [
  {
    id: 'img_1',
    url: product.image_url || "https://images.unsplash.com/photo-1515624424395-231050e373d2",
    alt: `${product.name} - main product image`
  }];


  const productData = {
    name: product.name,
    price: Number(product.price),
    originalPrice: Number(product.price) * 1.33,
    rating: 5,
    reviewCount: 0,
    origin: product.category,
    description: product.description || 'No description available',
    weights: [
    { id: 'weight_1', value: '1 unit', price: Number(product.price) }],

    inStock: product.stock > 0,
    organic: true
  };

  const farmerStoryData = {
    name: 'Local Farmer',
    location: 'Mountain Region',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ff066bfc-1770372051224.png",
    alt: 'Portrait of local mountain farmer',
    story: "Our farmers work with dedication to bring you the finest quality products directly from the mountains. Each product is carefully sourced and handled with care to preserve its natural goodness.",
    farmingSince: 2000
  };

  const nutritionData = [
  { id: 'nut_1', label: 'Category', value: product.category },
  { id: 'nut_2', label: 'Stock', value: `${product.stock} units` },
  { id: 'nut_3', label: 'Quality', value: 'Premium' }];


  const reviewsData = [
  {
    id: 'review_1',
    name: 'Customer',
    rating: 5,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    comment: 'Great product! Highly recommended.',
    verified: true
  }];


  const relatedProductsData: any[] = [];

  return (
    <main className="pt-24 pb-16">
      {/* Breadcrumb */}
      <div className="container mx-auto mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/homepage" className="hover:text-primary transition-colors">Home</a>
          <span>/</span>
          <a href="/categories" className="hover:text-primary transition-colors">Shop</a>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductGallery images={productImages} />
          <ProductInfo product={productData} />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto mb-16">
        <ProductTabs
          farmerStory={farmerStoryData}
          nutrition={nutritionData}
          reviews={reviewsData} />
        
      </div>

      {/* Related Products */}
      {relatedProductsData.length > 0 &&
      <RelatedProducts products={relatedProductsData} />
      }
    </main>);

}

export default function ProductDetailsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
      <main className="pt-24 pb-16">
          <div className="container mx-auto text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </main>
      }>
        <ProductDetailsContent />
      </Suspense>
      <Footer />
    </>);

}