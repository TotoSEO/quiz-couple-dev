import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Review, ReviewStats, CreateReviewData } from '@/types/review';

export function useReviews() {
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch client IP from edge function
  const fetchClientIp = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-client-ip');
      if (error) throw error;
      const ip = data?.ip || 'unknown';
      setClientIp(ip);
      return ip;
    } catch (error) {
      console.error('Error fetching IP:', error);
      return 'unknown';
    }
  }, []);

  // Check if IP has already submitted a review
  const checkIfAlreadyReviewed = useCallback(async (ip: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('ip_address', ip)
        .maybeSingle();
      
      if (error) throw error;
      setHasAlreadyReviewed(!!data);
      return !!data;
    } catch (error) {
      console.error('Error checking IP:', error);
      return false;
    }
  }, []);

  // Fetch approved reviews
  const fetchApprovedReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const reviews = (data || []) as Review[];
      setApprovedReviews(reviews);
      
      // Calculate stats
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;
        setStats({ avgRating, totalReviews: reviews.length });
      } else {
        setStats({ avgRating: 0, totalReviews: 0 });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, []);

  // Create a new review
  const createReview = useCallback(async (reviewData: CreateReviewData) => {
    setSubmitting(true);
    try {
      // Get IP if not already fetched
      let ip = clientIp;
      if (!ip) {
        ip = await fetchClientIp();
      }

      // Check if already reviewed
      const alreadyReviewed = await checkIfAlreadyReviewed(ip);
      if (alreadyReviewed) {
        throw new Error('Vous avez déjà laissé un avis. Merci pour votre soutien !');
      }

      // Validate input
      const authorName = reviewData.author_name.trim().slice(0, 60);
      const comment = reviewData.comment?.trim().slice(0, 200) || null;
      const rating = Math.min(5, Math.max(1, reviewData.rating));

      if (!authorName) {
        throw new Error('Le pseudo est obligatoire');
      }

      // Insert review
      const { error } = await supabase
        .from('reviews')
        .insert({
          author_name: authorName,
          rating,
          comment,
          ip_address: ip,
          is_approved: false
        });

      if (error) throw error;

      setHasAlreadyReviewed(true);
    } finally {
      setSubmitting(false);
    }
  }, [clientIp, fetchClientIp, checkIfAlreadyReviewed]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchApprovedReviews();
      const ip = await fetchClientIp();
      await checkIfAlreadyReviewed(ip);
      setLoading(false);
    };
    init();
  }, [fetchApprovedReviews, fetchClientIp, checkIfAlreadyReviewed]);

  return {
    approvedReviews,
    stats,
    loading,
    submitting,
    createReview,
    hasAlreadyReviewed,
    refetch: fetchApprovedReviews
  };
}
