'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, RefreshCw, ImageIcon, Home, Grid, Tag, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BannerImageUploader } from '@/components/banner-image-uploader';

interface BannerImages {
  home: string;
  collections: string;
  categories: Record<string, string>;
}

const DEFAULT_CATEGORY_SLUGS = [
  { slug: 'bedroom', label: 'Bedroom' },
  { slug: 'living-room', label: 'Living Room' },
  { slug: 'dining', label: 'Dining' },
  { slug: 'office', label: 'Office' },
  { slug: 'outdoor', label: 'Outdoor' },
];

export default function AdminBannerPanel() {
  const [banners, setBanners] = useState<BannerImages>({
    home: '',
    collections: '',
    categories: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [activeSection, setActiveSection] = useState<'home' | 'collections' | 'categories'>('home');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/banner-images');
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (error) {
      toast.error('Failed to load banner settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/banner-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banners),
      });

      if (res.ok) {
        toast.success('Banner images saved successfully! Changes will appear on the site.');
      } else {
        throw new Error('Save failed');
      }
    } catch {
      toast.error('Failed to save banner images');
    } finally {
      setSaving(false);
    }
  };

  const updateCategoryBanner = (slug: string, url: string) => {
    setBanners(prev => ({
      ...prev,
      categories: { ...prev.categories, [slug]: url },
    }));
  };

  const removeCategory = (slug: string) => {
    const updated = { ...banners.categories };
    delete updated[slug];
    setBanners(prev => ({ ...prev, categories: updated }));
  };

  const addCustomCategory = () => {
    const slug = newCategorySlug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!slug) return;
    if (banners.categories[slug] !== undefined) {
      toast.error('Category already exists');
      return;
    }
    setBanners(prev => ({
      ...prev,
      categories: { ...prev.categories, [slug]: '' },
    }));
    setNewCategorySlug('');
    toast.success(`Added category "${slug}"`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C47456]" />
      </div>
    );
  }

  const allCategorySlugs = Array.from(
    new Set([
      ...DEFAULT_CATEGORY_SLUGS.map(c => c.slug),
      ...Object.keys(banners.categories),
    ])
  );

  const tabs = [
    { id: 'home' as const, label: 'Homepage', icon: Home },
    { id: 'collections' as const, label: 'Collections', icon: Grid },
    { id: 'categories' as const, label: 'Categories', icon: Tag },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Banner Images</h3>
          <p className="text-sm text-gray-500 mt-1">
            Control the hero banner images displayed on your storefront pages
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchBanners}
            disabled={saving}
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#C47456] hover:bg-[#B36646] text-white"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save All Changes
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === id
                ? 'bg-white text-[#C47456] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Homepage Banner */}
      {activeSection === 'home' && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Home className="w-5 h-5 text-[#C47456]" />
              Homepage Hero Banner
            </CardTitle>
            <p className="text-sm text-gray-500">
              The main hero image displayed at the top of your homepage
            </p>
          </CardHeader>
          <CardContent>
            {/* Live preview */}
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <div
                className="relative h-40 bg-cover bg-center"
                style={{ backgroundImage: `url('${banners.home}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-end p-4">
                  <div className="text-white">
                    <p className="text-[10px] uppercase tracking-widest opacity-80">WELCOME TO FurnZ</p>
                    <p className="font-bold text-sm leading-tight">Crafted for Comfort.</p>
                    <p className="font-bold text-sm leading-tight">Designed for Life.</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Live Preview
                </div>
              </div>
            </div>

            <BannerImageUploader
              label="Homepage Hero Image"
              currentImage={banners.home}
              onImageChange={(url) => setBanners(prev => ({ ...prev, home: url }))}
              aspectHint="Recommended: 1920×800px — Wide, high-resolution landscape photo"
            />
          </CardContent>
        </Card>
      )}

      {/* Collections Banner */}
      {activeSection === 'collections' && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Grid className="w-5 h-5 text-[#C47456]" />
              Collections Page Hero Banner
            </CardTitle>
            <p className="text-sm text-gray-500">
              The hero image shown at the top of the /collections page
            </p>
          </CardHeader>
          <CardContent>
            {/* Live preview */}
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <div
                className="relative h-40 bg-cover bg-center"
                style={{ backgroundImage: `url('${banners.collections}')` }}
              >
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                  <p className="font-bold text-lg font-serif">Our Collections</p>
                  <p className="text-xs opacity-80 mt-1">Curated furniture collections that tell a story</p>
                </div>
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Live Preview
                </div>
              </div>
            </div>

            <BannerImageUploader
              label="Collections Page Hero Image"
              currentImage={banners.collections}
              onImageChange={(url) => setBanners(prev => ({ ...prev, collections: url }))}
              aspectHint="Recommended: 1920×700px — Wide, atmospheric interior photo"
            />
          </CardContent>
        </Card>
      )}

      {/* Category Banners */}
      {activeSection === 'categories' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="w-5 h-5 text-[#C47456]" />
                Category Page Banners
              </CardTitle>
              <p className="text-sm text-gray-500">
                Set individual hero images for each product category page
              </p>
            </CardHeader>
            <CardContent>
              {/* Add custom category */}
              <div className="flex gap-2 mb-6 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Input
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value)}
                  placeholder="Add custom category slug (e.g. kids-room)"
                  className="flex-1 text-sm h-9"
                  onKeyDown={(e) => e.key === 'Enter' && addCustomCategory()}
                />
                <Button
                  size="sm"
                  onClick={addCustomCategory}
                  className="bg-[#2C2C2C] hover:bg-[#3a3a3a] shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-6 divide-y divide-gray-100">
                {allCategorySlugs.map((slug) => {
                  const defaultLabel = DEFAULT_CATEGORY_SLUGS.find(c => c.slug === slug)?.label;
                  const label = defaultLabel || slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
                  const isCustom = !DEFAULT_CATEGORY_SLUGS.some(c => c.slug === slug);
                  const currentImage = banners.categories[slug] || '';

                  return (
                    <div key={slug} className="pt-6 first:pt-0">
                      <div className="flex items-start gap-4">
                        {/* Mini preview */}
                        <div className="shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative">
                          {currentImage ? (
                            <>
                              <img
                                src={currentImage}
                                alt={label}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <span className="text-white text-[9px] font-bold text-center leading-tight px-1">
                                  {label}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1">
                              <ImageIcon className="w-4 h-4" />
                              <span className="text-[9px] text-center">{label}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{label}</span>
                              <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                /categories/{slug}
                              </span>
                              {isCustom && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                  Custom
                                </span>
                              )}
                            </div>
                            {isCustom && (
                              <button
                                onClick={() => removeCategory(slug)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Remove category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <BannerImageUploader
                            label={`${label} Category Banner`}
                            currentImage={currentImage}
                            onImageChange={(url) => updateCategoryBanner(slug, url)}
                            aspectHint="Recommended: 1920×600px"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Footer */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">!</span>
        </div>
        <div>
          <p className="text-sm font-medium text-amber-800">Save before previewing on the site</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Click "Save All Changes" above, then visit the page to see your new banner images live.
          </p>
        </div>
      </div>
    </div>
  );
}