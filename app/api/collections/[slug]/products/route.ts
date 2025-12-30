import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const collection = await prisma.collection.findUnique({
      where: {
        slug: slug,
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        collection_id: collection.id,
      },
      take: 4,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching collection products:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection products" },
      { status: 500 }
    );
  }
}
