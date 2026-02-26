import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Globe, MapPin, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BlogArticleRow } from '@/hooks/useAdminBlog';

const LANG_FLAGS: Record<string, string> = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', it: '🇮🇹' };

interface Props {
  articles: BlogArticleRow[];
  isLoading: boolean;
  onRefresh: () => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getToken: () => string | null;
}

export function AdminBlogList({ articles, isLoading, onRefresh, onCreate, onEdit, onDelete, getToken }: Props) {
  const [sitemapLoading, setSitemapLoading] = useState<string | null>(null);
  const [sitemapDone, setSitemapDone] = useState<Set<string>>(new Set());

  useEffect(() => { onRefresh(); }, []);

  const handleAddToSitemap = async (articleId: string) => {
    const token = getToken();
    if (!token) return;

    setSitemapLoading(articleId);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-blog?action=add-to-sitemap`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-admin-token': token,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: articleId }),
      });
      const data = await res.json();
      if (data.success) {
        setSitemapDone(prev => new Set(prev).add(articleId));
        toast.success(`Article ajouté aux ${data.count} sitemaps`);
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSitemapLoading(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Articles de blog</h2>
        <Button onClick={onCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Nouvel article
        </Button>
      </div>

      {isLoading && articles.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Chargement…</p>
      ) : articles.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Aucun article.</p>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => {
            const translations = a.blog_article_translations || [];
            const frTitle = translations.find(t => t.lang === 'fr')?.title || a.internal_slug;
            const isPublished = a.status === 'published';
            const isSitemapDone = sitemapDone.has(a.id);

            return (
              <div
                key={a.id}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{frTitle}</p>
                  <p className="text-sm text-muted-foreground truncate">/{a.internal_slug}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={isPublished ? 'default' : 'secondary'}>
                      {isPublished ? 'Publié' : 'Brouillon'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Globe className="w-3 h-3" />
                      {['fr', 'en', 'es', 'de', 'it'].map(l => {
                        const tr = translations.find(t => t.lang === l);
                        return (
                          <span
                            key={l}
                            className={tr?.is_complete ? 'opacity-100' : 'opacity-30'}
                            title={tr?.is_complete ? `${l.toUpperCase()} complet` : `${l.toUpperCase()} incomplet`}
                          >
                            {LANG_FLAGS[l]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isPublished && (
                    <Button
                      variant={isSitemapDone ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAddToSitemap(a.id)}
                      disabled={sitemapLoading === a.id}
                      title="Ajouter aux sitemaps"
                      className={isSitemapDone ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                    >
                      {sitemapLoading === a.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isSitemapDone ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span className="ml-1 text-xs">Sitemap</span>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => onEdit(a.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm('Supprimer cet article et toutes ses traductions ?')) {
                        onDelete(a.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
