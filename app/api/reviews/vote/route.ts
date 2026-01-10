import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, userId, voteType } = body;

    if (!reviewId || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Review ID and User ID required' 
      }, { status: 400 });
    }

    if (voteType !== 1 && voteType !== -1 && voteType !== 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid vote type. Use 1 for upvote, -1 for downvote, 0 to remove vote' 
      }, { status: 400 });
    }

    // Check if user has already voted
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      }
    });

    let newVoteCount = 0;

    if (voteType === 0) {
      // Remove vote
      if (existingVote) {
        await prisma.reviewVote.delete({
          where: {
            reviewId_userId: {
              reviewId,
              userId
            }
          }
        });

        // Update review vote count
        const review = await prisma.review.findUnique({
          where: { id: reviewId },
          select: { voteCount: true }
        });

        newVoteCount = (review?.voteCount || 0) - existingVote.voteType;

        await prisma.review.update({
          where: { id: reviewId },
          data: { voteCount: newVoteCount }
        });
      }
    } else if (existingVote) {
      // Update existing vote
      const voteDifference = voteType - existingVote.voteType;

      await prisma.reviewVote.update({
        where: {
          reviewId_userId: {
            reviewId,
            userId
          }
        },
        data: { voteType }
      });

      // Update review vote count
      const review = await prisma.review.update({
        where: { id: reviewId },
        data: { 
          voteCount: { increment: voteDifference }
        },
        select: { voteCount: true }
      });

      newVoteCount = review.voteCount;
    } else {
      // Create new vote
      await prisma.reviewVote.create({
        data: {
          reviewId,
          userId,
          voteType
        }
      });

      // Update review vote count
      const review = await prisma.review.update({
        where: { id: reviewId },
        data: { 
          voteCount: { increment: voteType }
        },
        select: { voteCount: true }
      });

      newVoteCount = review.voteCount;
    }

    return NextResponse.json({
      success: true,
      data: {
        voteCount: newVoteCount,
        userVote: voteType
      }
    });
  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to vote on review' 
    }, { status: 500 });
  }
}