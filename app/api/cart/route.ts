// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to get user from session OR userId parameter
async function getUserFromRequest(req: NextRequest) {
  // Try to get from session first (preferred method)
  const session = await getServerSession(authOptions);
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (user) {
      return { user, source: 'session' };
    }
  }
  
  // Fallback: Try to get userId from query params (old method)
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (user) {
      return { user, source: 'parameter' };
    }
  }
  
  return { user: null, source: null };
}

// Helper function to get userId from body OR session
async function getUserIdFromBody(body: any, req: NextRequest) {
  // If userId is in the body, use it (old method)
  if (body.userId) {
    return { userId: body.userId, source: 'body' };
  }
  
  // Otherwise get from session (new method)
  const session = await getServerSession(authOptions);
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (user) {
      return { userId: user.id, source: 'session' };
    }
  }
  
  return { userId: null, source: null };
}

// GET - Get user's cart
export async function GET(req: NextRequest) {
  try {
    const { user, source } = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
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
            image: true,
            stock: true,
          },
        },
      },
    });

    const transformedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        name: item.product.name,
        price: item.product.price,
        image: item.product.image || item.product.images[0] || '',
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
      _meta: { authenticatedVia: source }, // Debug info
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get userId from either body OR session
    const { userId, source } = await getUserIdFromBody(body, req);

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: userId,
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
          userId: userId,
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
      message: 'Item added to cart successfully',
      _meta: { authenticatedVia: source }, // Debug info
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE - Clear cart
export async function DELETE(req: NextRequest) {
  try {
    const { user } = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }

    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Cart cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}