import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '4');

    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product ID required' 
      }, { status: 400 });
    }

    // Get the current product to find related products
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        category: true,
        collectionId: true,
        price: true,
      },
    });

    if (!currentProduct) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }

    // Find related products using multiple criteria
    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } }, // Exclude current product
          { stock: { gt: 0 } }, // Only in-stock products
          {
            OR: [
              // Same collection (highest priority)
              currentProduct.collectionId 
                ? { collectionId: currentProduct.collectionId }
                : {},
              // Same category
              { category: currentProduct.category },
              // Similar price range (±30%)
              {
                AND: [
                  { price: { gte: currentProduct.price * 0.7 } },
                  { price: { lte: currentProduct.price * 1.3 } },
                ],
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        images: true,
        price: true,
        originalPrice: true,
        rating: true,
        reviewCount: true,
        category: true,
        stock: true,
        colors: true,
        featured: true,
      },
      orderBy: [
        { featured: 'desc' }, // Featured products first
        { rating: 'desc' }, // Then by rating
        { reviewCount: 'desc' }, // Then by review count
      ],
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch related products' 
    }, { status: 500 });
  }
}