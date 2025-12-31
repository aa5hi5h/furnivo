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

    const cartItems = await prisma.cartItem.findMany({
      where: {
        user_id: userId,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId, quantity, selectedColor } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { error: "User ID and Product ID are required" },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        user_id: userId,
        product_id: productId,
        quantity: quantity || 1,
        selected_color: selectedColor || "",
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
