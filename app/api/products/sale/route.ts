import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
      where: {
        originalPrice: { not: null }, // ← use the Prisma field name
      },
      orderBy: {
        createdAt: 'desc',            // ← same fix for created_at
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching sale products:", error);
    return NextResponse.json(
      { error: "Failed to fetch sale products" },
      { status: 500 }
    );
  }
}
