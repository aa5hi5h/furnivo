import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: userId, // Changed from user_id
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
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { error: "User ID and Product ID are required" },
        { status: 400 }
      );
    }

    // Check if item already exists
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        userId: userId, // Changed from user_id
        productId: productId, // Changed from product_id
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
        userId: userId, // Changed from user_id
        productId: productId, // Changed from product_id
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
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}