import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Helper function for fuzzy matching (same as customer search)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1: string, s2: string): number {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const filterStock = searchParams.get('stock'); // "low", "out", "all"

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ success: true, data: [] });
    }

    const searchQuery = query.trim().toLowerCase();
    const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0);

    // Fetch all products with admin-specific fields
    let products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        price: true,
        originalPrice: true,
        category: true,
        stock: true,
        rating: true,
        reviewCount: true,
        featured: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply stock filter if specified
    if (filterStock) {
      if (filterStock === 'low') {
        products = products.filter(p => p.stock > 0 && p.stock <= 10);
      } else if (filterStock === 'out') {
        products = products.filter(p => p.stock === 0);
      }
      // 'all' or undefined = no filter
    }

    // Score and filter products
    const scoredProducts = products
      .map((product) => {
        let score = 0;
        const name = product.name.toLowerCase();
        const category = product.category.toLowerCase();
        const id = product.id.toLowerCase();

        // Exact phrase match
        if (name.includes(searchQuery)) {
          score += 100;
        }
        if (category.includes(searchQuery)) {
          score += 80;
        }

        // Individual word matches
        searchWords.forEach((word) => {
          if (name.includes(word)) {
            score += 50;
          }
          if (category.includes(word)) {
            score += 40;
          }
          if (id.includes(word)) {
            score += 30;
          }
        });

        // Fuzzy matching
        const nameSimilarity = calculateSimilarity(searchQuery, name);
        const categorySimilarity = calculateSimilarity(searchQuery, category);
        
        if (nameSimilarity > 0.6) {
          score += Math.floor(nameSimilarity * 40);
        }
        if (categorySimilarity > 0.6) {
          score += Math.floor(categorySimilarity * 30);
        }

        return {
          ...product,
          matchScore: score,
        };
      })
      .filter((product) => product.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 15) // Show more results for admin
      .map(({ matchScore, ...product }) => product);

    return NextResponse.json({ 
      success: true, 
      data: scoredProducts,
      count: scoredProducts.length,
    });
  } catch (error) {
    console.error('Admin search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}