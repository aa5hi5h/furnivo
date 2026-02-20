'use client';

import { useState, useEffect } from 'react';
import { StaticImageData } from 'next/image';
import { useBannerImage } from '@/hooks/use-banner-image';

interface CategoryHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string | StaticImageData;
  breadcrumb?: string;
  categorySlug?: string;
}

export function CategoryHero({
  title,
  subtitle,
  backgroundImage,
  breadcrumb = 'Home',
  categorySlug,
}: CategoryHeroProps) {
  const staticFallback =
    typeof backgroundImage === 'string' ? backgroundImage : backgroundImage.src;

  const resolvedImage = useBannerImage(
    categorySlug ? { category: categorySlug } : null,
    staticFallback
  );

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
      setDisplayImage(staticFallback);
      requestAnimationFrame(() => setImageLoaded(true));
    };
    img.src = resolvedImage;
  }, [resolvedImage, staticFallback]);

  return (
    <div className="relative w-full h-[60vh] overflow-hidden bg-[#2C2C2C]">
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#3a3a3a] via-[#2C2C2C] to-[#4a4a4a] transition-opacity duration-500 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      {displayImage && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${displayImage}')` }}
        />
      )}

      <div className="absolute inset-0 bg-black/30" />
      <div className="relative h-full flex flex-col justify-end p-8 md:p-16">
        {breadcrumb && (
          <p className="text-white text-sm mb-4 opacity-90">{breadcrumb}</p>
        )}
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-2">
          {title}
        </h1>
        <p className="text-white text-lg md:text-xl max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}