import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogArticleRow {
  id: string;
  internal_slug: string;
  featured_image_url: string | null;
  author_id: string;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  status: string;
  blog_article_translations?: {
    lang: string;
    slug: string;
    title: string;
    is_complete: boolean;
  }[];
}

export interface BlogTranslationRow {
  id: string;
  article_id: string;
  lang: string;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  featured_image_alt: string;
  excerpt: string;
  introduction: string;
  quick_summary: string[];
  sections: any[];
  is_complete: boolean;
}

export const useAdminBlog = (getToken: () => string | null) => {
  const [articles, setArticles] = useState<BlogArticleRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invoke = useCallback(async (action: string, body?: any, method = 'POST') => {
    const token = getToken();
    if (!token) throw new Error('Non authentifié');

    if (method === 'GET') {
      const params = new URLSearchParams({ action, ...(body || {}) });
      const { data, error } = await supabase.functions.invoke('admin-blog', {
        method: 'GET',
        headers: { 'x-admin-token': token },
        body: undefined,
      });
      // For GET we need to use query params - use fetch directly
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-blog?${params.toString()}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'x-admin-token': token,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      return res.json();
    }

    const params = new URLSearchParams({ action });
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-blog?${params.toString()}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-admin-token': token,
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return res.json();
  }, [getToken]);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await invoke('list', {}, 'GET');
      if (data.success) {
        setArticles(data.articles);
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [invoke]);

  const getArticle = useCallback(async (id: string, lang: string) => {
    const data = await invoke('get', { id, lang }, 'GET');
    if (!data.success) throw new Error(data.error);
    return data;
  }, [invoke]);

  const createArticle = useCallback(async (body: any) => {
    const data = await invoke('create', body);
    if (!data.success) throw new Error(data.error);
    return data.article;
  }, [invoke]);

  const updateArticle = useCallback(async (body: any) => {
    const data = await invoke('update', body);
    if (!data.success) throw new Error(data.error);
  }, [invoke]);

  const saveTranslation = useCallback(async (body: any) => {
    const data = await invoke('save-translation', body);
    if (!data.success) throw new Error(data.error);
  }, [invoke]);

  const deleteArticle = useCallback(async (id: string) => {
    const data = await invoke('delete', { id });
    if (!data.success) throw new Error(data.error);
  }, [invoke]);

  const uploadImage = useCallback(async (file: File, path: string): Promise<string> => {
    const token = getToken();
    if (!token) throw new Error('Non authentifié');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-blog?action=upload-image`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-admin-token': token,
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.url;
  }, [getToken]);

  return {
    articles,
    isLoading,
    error,
    fetchArticles,
    getArticle,
    createArticle,
    updateArticle,
    saveTranslation,
    deleteArticle,
    uploadImage,
  };
};
