// app/api/wishlist/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Remove item from wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    // Verify the wishlist item belongs to the user
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!wishlistItem || wishlistItem.userId !== user.id) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }

    await prisma.wishlistItem.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from wishlist' 
    });
  } catch (error) {
    console.error('Error removing wishlist item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}