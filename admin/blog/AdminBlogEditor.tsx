import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { BlogContentEditor } from './BlogContentEditor';
import { parseHtmlToSections, sectionsToHtml } from '@/utils/blog-html-parser';

const LANGS = ['fr', 'en', 'es', 'de', 'it'] as const;
const LANG_LABELS: Record<string, string> = { fr: '🇫🇷 FR', en: '🇬🇧 EN', es: '🇪🇸 ES', de: '🇩🇪 DE', it: '🇮🇹 IT' };

interface TranslationForm {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  featured_image_alt: string;
  excerpt: string;
  quick_summary: string[];
  is_complete: boolean;
  // Unified HTML content (introduction + sections combined)
  htmlContent: string;
}

const emptyTranslation = (): TranslationForm => ({
  slug: '',
  title: '',
  meta_title: '',
  meta_description: '',
  featured_image_alt: '',
  excerpt: '',
  quick_summary: [''],
  is_complete: false,
  htmlContent: '',
});

interface Props {
  articleId: string | null;
  getArticle: (id: string, lang: string) => Promise<any>;
  createArticle: (body: any) => Promise<any>;
  updateArticle: (body: any) => Promise<void>;
  saveTranslation: (body: any) => Promise<void>;
  uploadImage: (file: File, path: string) => Promise<string>;
  onBack: () => void;
}

export function AdminBlogEditor({ articleId, getArticle, createArticle, updateArticle, saveTranslation, uploadImage, onBack }: Props) {
  const [activeLang, setActiveLang] = useState<string>('fr');
  const [internalSlug, setInternalSlug] = useState('');
  const [authorId, setAuthorId] = useState('mathieu-courtin');
  const [status, setStatus] = useState('draft');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [translation, setTranslation] = useState<TranslationForm>(emptyTranslation());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedArticleId, setSavedArticleId] = useState<string | null>(articleId);
  const [allTranslations, setAllTranslations] = useState<{ lang: string; is_complete: boolean }[]>([]);

  // Load article data
  const loadArticle = useCallback(async (id: string, lang: string) => {
    setIsLoading(true);
    try {
      const data = await getArticle(id, lang);
      setInternalSlug(data.article.internal_slug);
      setAuthorId(data.article.author_id);
      setStatus(data.article.status);
      setFeaturedImageUrl(data.article.featured_image_url || '');
      setAllTranslations(data.allTranslations || []);

      if (data.translation) {
        // Reconstruct monolithic HTML from introduction + sections
        const html = sectionsToHtml(
          data.translation.introduction || '',
          data.translation.sections || []
        );
        setTranslation({
          slug: data.translation.slug,
          title: data.translation.title,
          meta_title: data.translation.meta_title,
          meta_description: data.translation.meta_description,
          featured_image_alt: data.translation.featured_image_alt,
          excerpt: data.translation.excerpt,
          quick_summary: data.translation.quick_summary?.length ? data.translation.quick_summary : [''],
          is_complete: data.translation.is_complete,
          htmlContent: html,
        });
      } else {
        setTranslation(emptyTranslation());
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getArticle]);

  useEffect(() => {
    if (savedArticleId) {
      loadArticle(savedArticleId, activeLang);
    }
  }, [savedArticleId, activeLang]);

  // Save — parse HTML back into introduction + sections
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { introduction, sections } = parseHtmlToSections(translation.htmlContent);

      if (!savedArticleId) {
        if (!internalSlug) { toast.error('Slug requis'); setIsSaving(false); return; }
        const article = await createArticle({
          internal_slug: internalSlug,
          featured_image_url: featuredImageUrl || null,
          author_id: authorId,
          status,
          slug: translation.slug,
          title: translation.title,
          meta_title: translation.meta_title,
          meta_description: translation.meta_description,
          featured_image_alt: translation.featured_image_alt,
          excerpt: translation.excerpt,
          introduction,
          quick_summary: translation.quick_summary,
          sections,
          is_complete: translation.is_complete,
        });
        setSavedArticleId(article.id);
        toast.success('Article créé !');
      } else {
        await updateArticle({
          id: savedArticleId,
          internal_slug: internalSlug,
          featured_image_url: featuredImageUrl || null,
          author_id: authorId,
          status,
        });
        await saveTranslation({
          article_id: savedArticleId,
          lang: activeLang,
          slug: translation.slug,
          title: translation.title,
          meta_title: translation.meta_title,
          meta_description: translation.meta_description,
          featured_image_alt: translation.featured_image_alt,
          excerpt: translation.excerpt,
          introduction,
          quick_summary: translation.quick_summary,
          sections,
          is_complete: translation.is_complete,
        });
        toast.success('Sauvegardé !');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = `featured/${Date.now()}-${file.name}`;
      const url = await uploadImage(file, path);
      setFeaturedImageUrl(url);
      toast.success('Image uploadée');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Quick summary helpers
  const updateQuickSummary = (idx: number, value: string) => {
    setTranslation(prev => {
      const qs = [...prev.quick_summary];
      qs[idx] = value;
      return { ...prev, quick_summary: qs };
    });
  };

  const addQuickSummary = () => {
    setTranslation(prev => ({
      ...prev,
      quick_summary: [...prev.quick_summary, ''],
    }));
  };

  const removeQuickSummary = (idx: number) => {
    setTranslation(prev => ({
      ...prev,
      quick_summary: prev.quick_summary.filter((_, i) => i !== idx),
    }));
  };

  if (isLoading) {
    return <p className="text-center py-12 text-muted-foreground">Chargement…</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <h2 className="text-xl font-bold flex-1">
          {savedArticleId ? "Modifier l'article" : 'Nouvel article'}
        </h2>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          <Save className="w-4 h-4 mr-1" /> {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Language tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-2">
        {LANGS.map(l => {
          const tr = allTranslations.find(t => t.lang === l);
          return (
            <Button
              key={l}
              variant={activeLang === l ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLang(l)}
              className="relative"
            >
              {LANG_LABELS[l]}
              {tr?.is_complete && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Article metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card border border-border rounded-xl p-4">
        <div>
          <Label>Slug interne</Label>
          <Input value={internalSlug} onChange={e => setInternalSlug(e.target.value)} placeholder="mon-article" />
        </div>
        <div>
          <Label>Auteur</Label>
          <Select value={authorId} onValueChange={setAuthorId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mathieu-courtin">Mathieu Courtin</SelectItem>
              <SelectItem value="lucie-courtin">Lucie Courtin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Statut</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="published">Publié</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Image à la une (URL)</Label>
          <div className="flex gap-2">
            <Input value={featuredImageUrl} onChange={e => setFeaturedImageUrl(e.target.value)} placeholder="https://..." className="flex-1" />
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button variant="outline" size="sm" asChild>
                <span><Upload className="w-4 h-4 mr-1" /> Upload</span>
              </Button>
            </label>
          </div>
          {featuredImageUrl && (
            <img src={featuredImageUrl} alt="" className="mt-2 h-24 rounded-lg object-cover" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={translation.is_complete}
            onCheckedChange={v => setTranslation(prev => ({ ...prev, is_complete: v }))}
          />
          <Label>{LANG_LABELS[activeLang]} complète</Label>
        </div>
      </div>

      {/* SEO & Meta fields */}
      <div className="space-y-4 bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-lg">SEO & Méta — {LANG_LABELS[activeLang]}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Slug URL ({activeLang})</Label>
            <Input value={translation.slug} onChange={e => setTranslation(prev => ({ ...prev, slug: e.target.value }))} />
          </div>
          <div>
            <Label>Titre (H1)</Label>
            <Input value={translation.title} onChange={e => setTranslation(prev => ({ ...prev, title: e.target.value }))} />
          </div>
          <div>
            <Label>Meta Title</Label>
            <Input value={translation.meta_title} onChange={e => setTranslation(prev => ({ ...prev, meta_title: e.target.value }))} />
            <p className="text-xs text-muted-foreground mt-1">{translation.meta_title.length}/60</p>
          </div>
          <div>
            <Label>Meta Description</Label>
            <Input value={translation.meta_description} onChange={e => setTranslation(prev => ({ ...prev, meta_description: e.target.value }))} />
            <p className="text-xs text-muted-foreground mt-1">{translation.meta_description.length}/160</p>
          </div>
          <div>
            <Label>Alt image à la une</Label>
            <Input value={translation.featured_image_alt} onChange={e => setTranslation(prev => ({ ...prev, featured_image_alt: e.target.value }))} />
          </div>
          <div>
            <Label>Extrait (85 car.)</Label>
            <Input value={translation.excerpt} onChange={e => setTranslation(prev => ({ ...prev, excerpt: e.target.value }))} />
            <p className="text-xs text-muted-foreground mt-1">{translation.excerpt.length}/85</p>
          </div>
        </div>

        {/* Quick Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Quick Summary</Label>
            <Button type="button" variant="outline" size="sm" onClick={addQuickSummary}>
              <Plus className="w-3 h-3 mr-1" /> Ajouter
            </Button>
          </div>
          {translation.quick_summary.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <Input
                value={item}
                onChange={e => updateQuickSummary(idx, e.target.value)}
                placeholder={`Point ${idx + 1}`}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => removeQuickSummary(idx)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Content Editor — single unified WYSIWYG */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-lg mb-4">Contenu — {LANG_LABELS[activeLang]}</h3>
        <BlogContentEditor
          value={translation.htmlContent}
          onChange={html => setTranslation(prev => ({ ...prev, htmlContent: html }))}
          onSave={handleSave}
          isSaving={isSaving}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Les H2 séparent les sections. Les encarts « Astuce » sont automatiquement rattachés à leur section.
        </p>
      </div>

      {/* Bottom save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-1" /> {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  );
}
