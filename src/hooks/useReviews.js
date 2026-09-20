import { useEffect, useMemo, useState } from 'react';
import { subscribeReviews } from '../services/realtime';

// Live reviews for a user's public profile. Bubbles the raw subscription up
// so the page renders immediately and refreshes in real time when a new
// review is posted.
export function useReviews(targetUid) {
  const [reviewState, setReviewState] = useState({
    targetUid: null,
    reviews: [],
  });

  useEffect(() => {
    if (!targetUid) return undefined;
    const unsubscribe = subscribeReviews(targetUid, (list) => {
      setReviewState({ targetUid, reviews: list });
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [targetUid]);

  const reviews = useMemo(
    () => (reviewState.targetUid === targetUid ? reviewState.reviews : []),
    [reviewState, targetUid]
  );
  const loading = Boolean(targetUid && reviewState.targetUid !== targetUid);

  const summary = useMemo(() => {
    if (reviews.length === 0) {
      return { count: 0, average: 0, hasReviews: false };
    }
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return {
      count: reviews.length,
      average: sum / reviews.length,
      hasReviews: true,
    };
  }, [reviews]);

  return { reviews, loading, ...summary };
}
