import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ isWishlisted: false });
    }

    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
      },
    });

    return NextResponse.json({ isWishlisted: !!wishlistItem });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return NextResponse.json({ isWishlisted: false });
  }
}