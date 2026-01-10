import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ success: true, data: [] });
    }

    const searchQuery = query.trim().toLowerCase();
    const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0);

    // Fetch all products (we'll filter in-memory for better matching)
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        price: true,
        category: true,
        description: true,
        rating: true,
        reviewCount: true,
        materials: true,
        colors: true,
      },
      take: 100, 
    });

    // Score and filter products based on multiple criteria
    const scoredProducts = allProducts
      .map((product) => {
        let score = 0;
        const name = product.name.toLowerCase();
        const category = product.category.toLowerCase();
        const description = product.description?.toLowerCase() || '';
        const materials = product.materials?.toLowerCase() || '';

        // 1. Exact phrase match (highest priority)
        if (name.includes(searchQuery)) {
          score += 100;
        }
        if (category.includes(searchQuery)) {
          score += 80;
        }

        // 2. Individual word matches
        searchWords.forEach((word) => {
          // Name matches
          if (name.includes(word)) {
            score += 50;
          }
          // Category matches
          if (category.includes(word)) {
            score += 40;
          }
          // Description matches
          if (description.includes(word)) {
            score += 20;
          }
          // Materials matches
          if (materials.includes(word)) {
            score += 30;
          }
          // Color matches
          if (product.colors?.some(c => c.toLowerCase().includes(word))) {
            score += 25;
          }
        });

        // 3. Fuzzy matching for typos (lower priority)
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
      .slice(0, 10)
      .map(({ matchScore, ...product }) => product);

    return NextResponse.json({ success: true, data: scoredProducts });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}