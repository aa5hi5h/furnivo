import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Remove item from cart
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Await params
    const { id } = await params;

    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update cart item quantity
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Await params
    const { id } = await params;

    const body = await req.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { 
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            images: true,
            stock: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: cartItem });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}