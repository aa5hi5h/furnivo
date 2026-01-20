// types/product.ts
// Shared product types for the entire application

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number | null;
    images: string[];
    colors?: string[];
    stock: number;
    rating?: number | null;
    reviewCount?: number | null;
    review_count?: number | null; // For backwards compatibility
    createdAt: Date | string;
    updatedAt: Date | string;
    description?: string | null;
    category?: string;
    materials?: string | null;
    featured?: boolean;
  }
  
  export interface Collection {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CollectionWithProducts extends Collection {
    products: Product[];
  }
  
  // Utility function to normalize product data
  export function normalizeProduct(product: any): Product {
    return {
      ...product,
      reviewCount: product.reviewCount ?? product.review_count,
    };
  }