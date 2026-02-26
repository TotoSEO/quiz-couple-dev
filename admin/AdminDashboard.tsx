import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, Star, Clock, CheckCircle, FileText, MessageSquare } from 'lucide-react';
import { AdminReviewCard } from './AdminReviewCard';
import { useAdminReviews } from '@/hooks/useAdminReviews';
import { AdminBlogDashboard } from './blog/AdminBlogDashboard';

interface AdminDashboardProps {
  onLogout: () => void;
  getToken: () => string | null;
}

type Tab = 'reviews' | 'blog';

export const AdminDashboard = ({ onLogout, getToken }: AdminDashboardProps) => {
  const { reviews, isLoading, error, fetchAllReviews, approveReview, rejectReview, deleteReview } = useAdminReviews(getToken);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [tab, setTab] = useState<Tab>('blog');

  useEffect(() => {
    if (tab === 'reviews') fetchAllReviews();
  }, [tab, fetchAllReviews]);

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.is_approved;
    if (filter === 'approved') return review.is_approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Administration</h1>
            <div className="flex items-center gap-1">
              <Button variant={tab === 'blog' ? 'default' : 'outline'} size="sm" onClick={() => setTab('blog')}>
                <FileText className="w-4 h-4 mr-1" /> Blog
              </Button>
              <Button variant={tab === 'reviews' ? 'default' : 'outline'} size="sm" onClick={() => setTab('reviews')}>
                <MessageSquare className="w-4 h-4 mr-1" /> Avis
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-destructive hover:text-destructive">
            <LogOut className="w-4 h-4 mr-1" /> Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {tab === 'blog' && <AdminBlogDashboard getToken={getToken} />}

        {tab === 'reviews' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgRating}/5</p>
                  <p className="text-sm text-muted-foreground">Note moyenne</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">En attente</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Approuvés</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6">
              <Button variant="outline" size="sm" onClick={fetchAllReviews} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Actualiser
              </Button>
              <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
                Tous ({reviews.length})
              </Button>
              <Button variant={filter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('pending')}>
                En attente ({pendingCount})
              </Button>
              <Button variant={filter === 'approved' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('approved')}>
                Approuvés ({approvedCount})
              </Button>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">{error}</div>
            )}

            {isLoading && reviews.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Chargement des avis...</p>
            ) : filteredReviews.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Aucun avis pour le moment.</p>
            ) : (
              <div className="grid gap-4">
                {filteredReviews.map(review => (
                  <AdminReviewCard
                    key={review.id}
                    review={review}
                    onApprove={approveReview}
                    onReject={rejectReview}
                    onDelete={deleteReview}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
