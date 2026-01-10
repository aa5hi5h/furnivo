import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch reviews for a product
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId'); // To get user's vote status

    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product ID required' 
      }, { status: 400 });
    }

    // Fetch only top-level reviews (parentId = null) with comment body
    // Sort by voteCount descending (most upvoted first)
    const reviews = await prisma.review.findMany({
      where: { 
        productId,
        parentId: null, // Only top-level reviews
        comment: { not: '' } // Only show reviews with actual comments
      },
      orderBy: { voteCount: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        userName: true,
        verified: true,
        createdAt: true,
        voteCount: true,
        depth: true,
        userId: true,
        replies: {
          where: {
            comment: { not: '' } // Only show replies with actual comments
          },
          orderBy: { voteCount: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            userName: true,
            verified: true,
            createdAt: true,
            voteCount: true,
            depth: true,
            userId: true,
            parentId: true,
            replies: {
              where: {
                comment: { not: '' }
              },
              orderBy: { voteCount: 'desc' },
              select: {
                id: true,
                rating: true,
                comment: true,
                userName: true,
                verified: true,
                createdAt: true,
                voteCount: true,
                depth: true,
                userId: true,
                parentId: true,
                replies: {
                  where: {
                    comment: { not: '' }
                  },
                  orderBy: { voteCount: 'desc' },
                  select: {
                    id: true,
                    rating: true,
                    comment: true,
                    userName: true,
                    verified: true,
                    createdAt: true,
                    voteCount: true,
                    depth: true,
                    userId: true,
                    parentId: true,
                  }
                }
              }
            }
          }
        },
        votes: userId ? {
          where: { userId },
          select: { voteType: true }
        } : false
      },
    });

    // Fetch product with ratings
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        rating: true,
        reviewCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        product,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch reviews' 
    }, { status: 500 });
  }
}

// POST - Create a review or reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, rating, comment, userName, userId, parentId } = body;

    // Validation
    if (!productId || !comment || !userName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product ID, comment, and user name are required' 
      }, { status: 400 });
    }

    // Validate comment is not empty
    if (!comment.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Comment cannot be empty' 
      }, { status: 400 });
    }

    // If it's a top-level review, rating is required
    if (!parentId && (!rating || rating < 1 || rating > 5)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rating must be between 1 and 5 for reviews' 
      }, { status: 400 });
    }

    // Check if user has purchased this product (for verified badge)
    let isVerifiedPurchase = false;
    if (userId) {
      const hasPurchased = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId,
            status: { in: ['completed', 'delivered'] } // Only count completed orders
          }
        }
      });
      isVerifiedPurchase = !!hasPurchased;
    }

    // Calculate depth for nested replies
    let depth = 0;
    if (parentId) {
      const parentReview = await prisma.review.findUnique({
        where: { id: parentId },
        select: { depth: true }
      });
      depth = parentReview ? parentReview.depth + 1 : 0;
    }

    // Create review/reply
    const review = await prisma.review.create({
      data: {
        productId,
        rating: parentId ? 0 : rating, // Only top-level reviews have ratings
        comment: comment.trim(),
        userName,
        userId: userId || null,
        verified: isVerifiedPurchase,
        parentId: parentId || null,
        depth,
      },
    });

    // Only recalculate product rating for top-level reviews (not replies)
    if (!parentId) {
      const allTopLevelReviews = await prisma.review.findMany({
        where: { 
          productId,
          parentId: null, // Only count top-level reviews
          comment: { not: '' } // Only count reviews with comments
        },
        select: { rating: true },
      });

      if (allTopLevelReviews.length > 0) {
        const avgRating = allTopLevelReviews.reduce((sum, r) => sum + r.rating, 0) / allTopLevelReviews.length;
        const reviewCount = allTopLevelReviews.length;

        await prisma.product.update({
          where: { id: productId },
          data: {
            rating: Math.round(avgRating * 10) / 10,
            reviewCount,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: parentId ? 'Reply posted successfully' : 'Review submitted successfully',
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create review' 
    }, { status: 500 });
  }
}