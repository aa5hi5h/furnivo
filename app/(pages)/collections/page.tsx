'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  description: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const { toast } = useToast();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections((data || []) as Collection[]);
      setFilteredCollections((data || []) as Collection[]);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({ title: 'Error', description: 'Failed to load collections' });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    let sorted = [...collections];
    if (value === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    setFilteredCollections(sorted);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative w-full h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600')` }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            Our Collections
          </h1>
          <p className="text-white text-xl md:text-2xl max-w-2xl">
            Curated furniture collections that tell a story
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filter/Sort Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div className="text-sm text-gray-600">
            Showing {filteredCollections.length} collections
          </div>
          <div className="flex gap-4 flex-wrap">
            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Masonry Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Loading collections...</p>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">No collections found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {filteredCollections.map((collection, index) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className={`group relative overflow-hidden rounded-lg aspect-square ${
                  index % 5 === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                }`}
              >
                <img
                  src={collection.image_url}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

                {/* Collection Info */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-white font-serif text-2xl md:text-3xl font-bold mb-2 group-hover:text-[#C47456] transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-2 mb-4">
                    {collection.description}
                  </p>
                  <Button
                    className="bg-white text-[#2C2C2C] hover:bg-[#C47456] hover:text-white w-full"
                  >
                    Explore Collection →
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}