export interface Review {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  ip_address: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface ReviewStats {
  avgRating: number;
  totalReviews: number;
}

export interface CreateReviewData {
  author_name: string;
  rating: number;
  comment?: string;
}
