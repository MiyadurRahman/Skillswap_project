import React, { useState } from 'react';

// Star picker + comment form for reviewing a completed session partner.
export const ReviewModal = ({
  session,
  authorName,
  authorAvatar,
  targetUid,
  onSubmitReview,
  onClose,
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmitReview({
        sessionId: session?.id,
        targetUid,
        rating,
        comment: comment.trim(),
      });
      onClose();
    } catch (err) {
      // Parent shows the toast with the specific message.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white text-[#201a1b] w-full max-w-md rounded-3xl shadow-2xl border border-[#ccc4cd]/40 p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#f7ebeb] text-[#7b757d]"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-[#efdbfd] flex items-center justify-center text-[#52445f]">
            <span className="material-symbols-outlined text-2xl">rate_review</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#201a1b]">Rate this session</h3>
            <p className="text-xs text-[#4a454c]">
              Share how the swap went — your review stays on their profile.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className={`text-3xl transition-transform hover:scale-110 cursor-pointer ${
                  (hover || rating) >= star
                    ? 'text-amber-500'
                    : 'text-[#e7dde2]'
                }`}
                aria-label={`${star} star${star === 1 ? '' : 's'}`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-[#7b757d]">
            {rating === 0
              ? 'Tap a star to rate'
              : rating <= 2
                ? 'Needs improvement'
                : rating === 3
                  ? 'Good session'
                  : rating === 4
                    ? 'Great session'
                    : 'Outstanding session!'}
          </p>

          <div>
            <label className="block text-xs font-bold text-[#201a1b] mb-1.5">
              Written review <span className="text-[#7b757d] font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What went well? What could improve?"
              className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3.5 py-2.5 text-xs text-[#201a1b] focus:outline-none focus:border-[#57445f] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#705e69] hover:text-[#201a1b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating < 1 || submitting}
              className="px-5 py-2.5 bg-[#57445f] hover:bg-[#43334a] disabled:bg-[#d8ccd4] disabled:text-[#8a7d8f] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};