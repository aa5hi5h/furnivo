// app/api/wishlist/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

export async function GET(request: NextRequest) {
  try {
    const { user, source } = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: user.id,
      },
      include: {
        product: {
          include: {
            collection: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: wishlistItems,
      _meta: { authenticatedVia: source }, // Debug info
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get userId from either body OR session
    const { userId, source } = await getUserIdFromBody(body, request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if item already exists
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Item already in wishlist" },
        { status: 400 }
      );
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: userId,
        productId: productId,
      },
      include: {
        product: {
          include: {
            collection: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: wishlistItem,
      message: 'Added to wishlist',
      _meta: { authenticatedVia: source }, // Debug info
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}