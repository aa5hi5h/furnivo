'use client';

import { useState, useEffect } from 'react';
import { Star, Loader } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  userName: string;
  createdAt: string;
  verified: boolean;
}

interface ReviewSectionProps {
  productId: string;
  userId?: string;
}

export default function ReviewSection({ productId, userId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !productId) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || null,
          userName,
          userId: userId || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setComment('');
        setUserName('');
        setRating(5);
        await fetchReviews();
      }
    } catch (error) {
      console.error('Submit review error:', error);
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
          <span className="text-gray-500">({reviewCount} reviews)</span>
        </div>
      </div>

      {/* Review Form */}
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
          <label className="block text-sm font-medium mb-2">Your Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#C47456]"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Review (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#C47456]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !userName.trim()}
          className="px-6 py-2 bg-[#C47456] text-white rounded hover:bg-[#B65A45] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-gray-200 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">
                    {review.userName}
                    {review.verified && (
                      <span className="ml-2 text-xs text-green-600">✓ Verified</span>
                    )}
                  </p>
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
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p className="text-gray-700 mt-2">{review.comment}</p>}
            </div>
          ))
        ) : (
          <p className="text-gray-500 py-8 text-center">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}