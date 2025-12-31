import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        product_id: productId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      userId,
      rating,
      title,
      comment,
      images,
      verified_purchase,
    } = body;

    if (!productId || !userId || !rating) {
      return NextResponse.json(
        { error: "Product ID, User ID, and rating are required" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        product_id: productId,
        user_id: userId,
        rating,
        title: title || "",
        comment: comment || "",
        images: images || [],
        verified_purchase: verified_purchase || false,
      },
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { reviews: true },
    });

    if (product) {
      const avgRating =
        product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        product.reviews.length;
      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: avgRating,
          review_count: product.reviews.length,
        },
      });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
