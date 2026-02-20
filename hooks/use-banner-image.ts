'use client';

import { useState, useEffect } from 'react';

interface BannerImages {
  home: string;
  collections: string;
  categories: Record<string, string>;
}

let cachedBanners: BannerImages | null = null;
let fetchPromise: Promise<BannerImages> | null = null;

export function invalidateBannerCache() {
  cachedBanners = null;
  fetchPromise = null;
}

async function loadBanners(): Promise<BannerImages> {
  if (cachedBanners) return cachedBanners;

  if (!fetchPromise) {
    fetchPromise = fetch('/api/admin/banner-images')
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((data: BannerImages) => {
        cachedBanners = data;
        fetchPromise = null;
        return data;
      })
      .catch(() => {
        fetchPromise = null;
        return { home: '', collections: '', categories: {} };
      });
  }

  return fetchPromise;
}

/**
 * @param section - 'home' | 'collections' | { category: 'bedroom' } | null (null = skip, use fallback)
 * @param fallback - shown immediately while loading, and if no dynamic URL is stored
 */
export function useBannerImage(
  section: 'home' | 'collections' | { category: string } | null,
  fallback: string
): string {
  const [imageUrl, setImageUrl] = useState<string>(fallback);

  useEffect(() => {
    if (section === null) {
      setImageUrl(fallback);
      return;
    }

    let cancelled = false;

    loadBanners().then(banners => {
      if (cancelled) return;

      let dynamicUrl = '';

      if (section === 'home') {
        dynamicUrl = banners.home || '';
      } else if (section === 'collections') {
        dynamicUrl = banners.collections || '';
      } else if (typeof section === 'object' && section.category) {
        dynamicUrl = banners.categories?.[section.category] || '';
      }

      if (dynamicUrl) {
        setImageUrl(dynamicUrl);
      }
    });

    return () => { cancelled = true; };
  }, [
    section === null ? 'null' :
    typeof section === 'string' ? section :
    `cat:${section.category}`,
  ]);

  return imageUrl;
}