import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
      where: {
        original_price: {
          not: null,
        },
      },
      orderBy: {
        created_at: "desc",
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
