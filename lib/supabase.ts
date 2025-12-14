import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  original_price: number | null;
  stock: number;
  featured: boolean;
  images: string[];
  dimensions: Record<string, any>;
  materials: string;
  colors: string[];
  collection_id: string | null;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_color: string;
  created_at: string;
  updated_at: string;
  product?: Product;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
};

export type Order = {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: Record<string, any>;
  payment_method: string;
  payment_status: string;
  delivery_option: string;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
};
