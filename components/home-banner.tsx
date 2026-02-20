'use client';

// components/home-banner.tsx

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBannerImage } from '@/hooks/use-banner-image';

const DEFAULT_HOME_BANNER = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg';

export default function HomeBanner() {
  const resolvedImage = useBannerImage('home', DEFAULT_HOME_BANNER);

  const [displayImage, setDisplayImage] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!resolvedImage) return;

    const img = new window.Image();
    img.onload = () => {
      setDisplayImage(resolvedImage);
      requestAnimationFrame(() => setImageLoaded(true));
    };
    img.onerror = () => {
      setDisplayImage(DEFAULT_HOME_BANNER);
      requestAnimationFrame(() => setImageLoaded(true));
    };
    img.src = resolvedImage;
  }, [resolvedImage]);

  return (
    <section className="relative h-[70vh] min-h-[600px] overflow-hidden bg-[#2C2C2C]">
      {/* Dark skeleton while loading */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#3a3a3a] via-[#2C2C2C] to-[#4a4a4a] transition-opacity duration-500 ${
          imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Banner image — fades in after preload */}
      {displayImage && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${displayImage}')` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-end pb-16">
        <div className="text-white max-w-xl">
          <p className="text-lg mb-2 font-light tracking-wide">WELCOME TO FurnZ</p>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Crafted for Comfort. Designed for Life.
          </h1>
          <p className="text-xl mb-8 text-gray-100 font-light">
            Discover furniture that transforms your space into a sanctuary of style and comfort
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-[#C47456] hover:bg-[#C47456]/90 text-white text-lg px-8 rounded-lg">
              Explore Collections
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}