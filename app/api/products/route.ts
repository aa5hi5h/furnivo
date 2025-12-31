import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "12");

    const where: any = {};
    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: {
        created_at: "desc",
      },
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({ products, total });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      category,
      price,
      original_price,
      stock,
      featured,
      images,
      dimensions,
      materials,
      colors,
      collection_id,
    } = body;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        price,
        original_price,
        stock,
        featured: featured || false,
        images: images || [],
        dimensions: dimensions || {},
        materials,
        colors: colors || [],
        collection_id: collection_id || null,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
