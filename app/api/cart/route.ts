
// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get user's cart
// GET - Get user's cart
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            image: true,  // Add this
            stock: true,
          },
        },
      },
    });

    // Transform the data to match what the frontend expects
    const transformedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        name: item.product.name,
        price: item.product.price,
        image: item.product.image || item.product.images[0] || '', // Use first image or main image
        stock: item.product.stock,
      },
    }));

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return NextResponse.json({
      success: true,
      data: transformedItems,
      total,
      count: cartItems.length,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    let cartItem;

    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
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
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
        },
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
    }

    return NextResponse.json({ 
      success: true, 
      data: cartItem,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Clear cart
export async function DELETE(req: NextRequest) {
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

    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}