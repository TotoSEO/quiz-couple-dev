import { useState } from 'react';
import { AdminBlogList } from './AdminBlogList';
import { AdminBlogEditor } from './AdminBlogEditor';
import { useAdminBlog } from '@/hooks/useAdminBlog';
import { toast } from 'sonner';

interface Props {
  getToken: () => string | null;
}

type View = { type: 'list' } | { type: 'edit'; articleId: string | null };

export function AdminBlogDashboard({ getToken }: Props) {
  const [view, setView] = useState<View>({ type: 'list' });
  const blog = useAdminBlog(getToken);

  const handleDelete = async (id: string) => {
    try {
      await blog.deleteArticle(id);
      toast.success('Article supprimé');
      blog.fetchArticles();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (view.type === 'edit') {
    return (
      <AdminBlogEditor
        articleId={view.articleId}
        getArticle={blog.getArticle}
        createArticle={blog.createArticle}
        updateArticle={blog.updateArticle}
        saveTranslation={blog.saveTranslation}
        uploadImage={blog.uploadImage}
        onBack={() => {
          setView({ type: 'list' });
          blog.fetchArticles();
        }}
      />
    );
  }

  return (
    <AdminBlogList
      articles={blog.articles}
      isLoading={blog.isLoading}
      onRefresh={blog.fetchArticles}
      onCreate={() => setView({ type: 'edit', articleId: null })}
      onEdit={(id) => setView({ type: 'edit', articleId: id })}
      onDelete={handleDelete}
      getToken={getToken}
    />
  );
}
