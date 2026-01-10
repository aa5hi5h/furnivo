import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { category: true, collectionId: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } },
          {
            OR: [
              { category: product.category },
              { collectionId: product.collectionId },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        price: true,
        originalPrice: true,
        rating: true,
        reviewCount: true,
        category: true,
      },
      take: 8,
    });

    return NextResponse.json({ products: relatedProducts });
  } catch (error) {
    console.error('Related products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    );
  }
}