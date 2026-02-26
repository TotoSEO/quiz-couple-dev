import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Review } from '@/types/review';

export const useAdminReviews = (getToken: () => string | null) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllReviews = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('admin-reviews', {
        method: 'GET',
        headers: {
          'x-admin-token': token
        }
      });

      if (fnError) {
        setError('Erreur de chargement');
        return;
      }

      if (!data.success) {
        setError(data.error || 'Erreur inconnue');
        return;
      }

      setReviews(data.reviews || []);
    } catch (err) {
      setError('Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  const approveReview = useCallback(async (reviewId: string) => {
    const token = getToken();
    if (!token) return false;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('admin-reviews', {
        body: { reviewId, action: 'approve' },
        headers: {
          'x-admin-token': token
        }
      });

      if (fnError || !data.success) {
        return false;
      }

      // Update local state
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, is_approved: true } : r
      ));
      return true;
    } catch {
      return false;
    }
  }, [getToken]);

  const rejectReview = useCallback(async (reviewId: string) => {
    const token = getToken();
    if (!token) return false;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('admin-reviews', {
        body: { reviewId, action: 'reject' },
        headers: {
          'x-admin-token': token
        }
      });

      if (fnError || !data.success) {
        return false;
      }

      // Update local state
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, is_approved: false } : r
      ));
      return true;
    } catch {
      return false;
    }
  }, [getToken]);

  const deleteReview = useCallback(async (reviewId: string) => {
    const token = getToken();
    if (!token) return false;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('admin-reviews', {
        body: { reviewId, action: 'delete' },
        headers: {
          'x-admin-token': token
        }
      });

      if (fnError || !data.success) {
        return false;
      }

      // Update local state
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      return true;
    } catch {
      return false;
    }
  }, [getToken]);

  return {
    reviews,
    isLoading,
    error,
    fetchAllReviews,
    approveReview,
    rejectReview,
    deleteReview
  };
};
