'use client';

import { useState, useEffect } from 'react';
import { Star, Loader, ThumbsUp, ThumbsDown, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface ReviewVote {
  voteType: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  verified: boolean;
  voteCount: number;
  depth: number;
  userId?: string;
  parentId?: string;
  replies?: Review[];
  votes?: ReviewVote[];
}

interface ReviewSectionProps {
  productId: string;
  userId?: string; // <-- add this line
}

function ReviewItem({ 
  review, 
  productId, 
  onReply, 
  currentUserId, 
  onVote,
  onOptimisticReply
}: { 
  review: Review; 
  productId: string; 
  onReply: (reviewId: string) => void;
  currentUserId?: string;
  onVote: (reviewId: string, voteType: number) => void;
  onOptimisticReply: (parentId: string, newReply: Review) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  const userVote = review.votes?.[0]?.voteType || 0;
  const hasReplies = review.replies && review.replies.length > 0;
  const replyCount = review.replies?.length || 0;

  const handleVote = async (voteType: number) => {
    if (!currentUserId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to vote',
        variant: 'error',
      });
      return;
    }

    const newVoteType = userVote === voteType ? 0 : voteType;
    onVote(review.id, newVoteType);
  };

  const handleSubmitReply = async () => {
    if (!session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to reply',
        variant: 'error',
      });
      return;
    }

    if (!replyText.trim()) {
      toast({
        title: 'Empty reply',
        description: 'Please write a reply',
        variant: 'error',
      });
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticReply: Review = {
      id: tempId,
      rating: 0,
      comment: replyText.trim(),
      userName: session.user.name || 'You',
      createdAt: new Date().toISOString(),
      verified: false,
      voteCount: 0,
      depth: review.depth + 1,
      userId: session.user.id,
      parentId: review.id,
      replies: [],
      votes: []
    };

    // Optimistically add reply to UI
    onOptimisticReply(review.id, optimisticReply);
    setReplyText('');
    setShowReplyForm(false);
    setShowReplies(true);

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          comment: optimisticReply.comment,
          userName: session.user.name,
          userId: session.user.id,
          parentId: review.id,
          rating: 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Reply posted',
          description: 'Your reply has been posted successfully',
        });
        // Silently refresh in background to get real data
        onReply(review.id);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to post reply',
          variant: 'error',
        });
        // Revert optimistic update on error
        onReply(review.id);
      }
    } catch (error) {
      console.error('Submit reply error:', error);
      toast({
        title: 'Error',
        description: 'Failed to post reply',
        variant: 'error',
      });
      // Revert optimistic update on error
      onReply(review.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Vertical line for nested comments */}
      {review.depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
      )}
      
      <div className={`${review.depth > 0 ? 'pl-6' : ''} pb-4`}>
        <div className="flex items-start gap-3">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
            <button
              onClick={() => handleVote(1)}
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                userVote === 1 ? 'text-orange-500' : 'text-gray-400'
              }`}
              aria-label="Upvote"
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
            <span className={`text-sm font-semibold ${
              review.voteCount > 0 ? 'text-orange-500' : 
              review.voteCount < 0 ? 'text-blue-500' : 
              'text-gray-600'
            }`}>
              {review.voteCount}
            </span>
            <button
              onClick={() => handleVote(-1)}
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                userVote === -1 ? 'text-blue-500' : 'text-gray-400'
              }`}
              aria-label="Downvote"
            >
              <ThumbsDown className="w-5 h-5" />
            </button>
          </div>

          {/* Review content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">
                    {review.userName}
                  </p>
                  {review.verified && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded whitespace-nowrap">
                      ✓ Verified Purchase
                    </span>
                  )}
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {review.depth === 0 && review.rating > 0 && (
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-3 whitespace-pre-wrap break-words">{review.comment}</p>

            {/* Action buttons */}
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-gray-600 hover:text-[#C47456] transition-colors font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Reply
              </button>

              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 text-gray-600 hover:text-[#C47456] transition-colors font-medium"
                >
                  {showReplies ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Reply form */}
            {showReplyForm && (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#C47456] focus:ring-1 focus:ring-[#C47456]"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSubmitReply}
                    disabled={submitting}
                    className="px-4 py-1.5 bg-[#C47456] text-white text-sm rounded-md hover:bg-[#B65A45] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {submitting ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyText('');
                    }}
                    className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nested replies */}
        {hasReplies && showReplies && (
          <div className="mt-4 space-y-4">
            {review.replies!.map((reply) => (
              <ReviewItem
                key={reply.id}
                review={reply}
                productId={productId}
                onReply={onReply}
                currentUserId={currentUserId}
                onVote={onVote}
                onOptimisticReply={onOptimisticReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId, session?.user?.id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const url = session?.user?.id 
        ? `/api/reviews?productId=${productId}&userId=${session.user.id}`
        : `/api/reviews?productId=${productId}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data?.reviews || []);
        setAvgRating(data.data?.product?.rating || 0);
        setReviewCount(data.data?.product?.reviewCount || 0);
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsSilently = async () => {
    try {
      const url = session?.user?.id 
        ? `/api/reviews?productId=${productId}&userId=${session.user.id}`
        : `/api/reviews?productId=${productId}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data?.reviews || []);
        setAvgRating(data.data?.product?.rating || 0);
        setReviewCount(data.data?.product?.reviewCount || 0);
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
    }
  };

  const addOptimisticReply = (parentId: string, newReply: Review) => {
    const addReplyToReviews = (reviewList: Review[]): Review[] => {
      return reviewList.map(review => {
        if (review.id === parentId) {
          return {
            ...review,
            replies: [...(review.replies || []), newReply]
          };
        } else if (review.replies && review.replies.length > 0) {
          return {
            ...review,
            replies: addReplyToReviews(review.replies)
          };
        }
        return review;
      });
    };

    setReviews(prevReviews => addReplyToReviews(prevReviews));
  };

  const handleVote = async (reviewId: string, voteType: number) => {
    if (!session?.user?.id) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to vote',
        variant: 'error',
      });
      return;
    }

    // Optimistically update vote count in UI
    const updateVoteInReviews = (reviewList: Review[]): Review[] => {
      return reviewList.map(review => {
        if (review.id === reviewId) {
          const currentVote = review.votes?.[0]?.voteType || 0;
          const voteDifference = voteType - currentVote;
          
          return {
            ...review,
            voteCount: review.voteCount + voteDifference,
            votes: voteType === 0 ? [] : [{ voteType }]
          };
        } else if (review.replies && review.replies.length > 0) {
          return {
            ...review,
            replies: updateVoteInReviews(review.replies)
          };
        }
        return review;
      });
    };

    setReviews(prevReviews => updateVoteInReviews(prevReviews));

    // Update backend in background
    try {
      const response = await fetch('/api/reviews/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          userId: session.user.id,
          voteType,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to vote',
          variant: 'error',
        });
        // Revert on error
        await fetchReviewsSilently();
      }
    } catch (error) {
      console.error('Vote error:', error);
      toast({
        title: 'Error',
        description: 'Failed to vote',
        variant: 'error',
      });
      // Revert on error
      await fetchReviewsSilently();
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to write a review',
        variant: 'error',
      });
      router.push('/auth');
      return;
    }

    if (!comment.trim()) {
      toast({
        title: 'Empty review',
        description: 'Please write a review',
        variant: 'error',
      });
      return;
    }

    const optimisticReview: Review = {
      id: `temp-${Date.now()}`,
      rating,
      comment: comment.trim(),
      userName: session.user.name || 'You',
      createdAt: new Date().toISOString(),
      verified: false,
      voteCount: 0,
      depth: 0,
      userId: session.user.id,
      replies: [],
      votes: []
    };

    // Optimistically add review to top of list
    setReviews(prev => [optimisticReview, ...prev]);
    setComment('');
    setRating(5);

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: optimisticReview.comment,
          userName: session.user.name,
          userId: session.user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Review submitted',
          description: 'Thank you for your review!',
        });
        // Silently refresh to get accurate data
        await fetchReviewsSilently();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to submit review',
          variant: 'error',
        });
        // Revert optimistic update
        await fetchReviews();
      }
    } catch (error) {
      console.error('Submit review error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'error',
      });
      // Revert optimistic update
      await fetchReviews();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 border-t border-gray-200">
      <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>

      {/* Average Rating */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold">{avgRating.toFixed(1)}</span>
          <span className="text-gray-500">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
        </div>
      </div>

      {/* Review Form */}
      {session?.user ? (
        <form onSubmit={handleSubmitReview} className="mb-8 pb-8 border-b border-gray-200">
          <h4 className="font-semibold mb-4">Write a Review</h4>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-6 h-6 cursor-pointer transition-colors ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#C47456] focus:ring-1 focus:ring-[#C47456]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-[#C47456] text-white rounded-md hover:bg-[#B65A45] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="mb-8 pb-8 border-b border-gray-200 bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Sign in to write a review</p>
          <button
            onClick={() => router.push('/auth')}
            className="px-6 py-2 bg-[#C47456] text-white rounded-md hover:bg-[#B65A45] transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              productId={productId}
              onReply={fetchReviewsSilently}
              currentUserId={session?.user?.id}
              onVote={handleVote}
              onOptimisticReply={addOptimisticReply}
            />
          ))
        ) : (
          <p className="text-gray-500 py-8 text-center">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}