import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminToken = req.headers.get('x-admin-token');
    if (!adminToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token admin requis' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // ===== LIST ARTICLES =====
    if (req.method === 'GET' && action === 'list') {
      const { data: articles, error } = await supabase
        .from('blog_articles')
        .select('*, blog_article_translations(lang, slug, title, is_complete)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, articles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== GET SINGLE ARTICLE WITH TRANSLATION =====
    if (req.method === 'GET' && action === 'get') {
      const articleId = url.searchParams.get('id');
      const lang = url.searchParams.get('lang') || 'fr';

      if (!articleId) {
        return new Response(
          JSON.stringify({ success: false, error: 'ID requis' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: article, error: artError } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (artError) throw artError;

      const { data: translation, error: trError } = await supabase
        .from('blog_article_translations')
        .select('*')
        .eq('article_id', articleId)
        .eq('lang', lang)
        .maybeSingle();

      if (trError) throw trError;

      // Also get all translations summary
      const { data: allTranslations } = await supabase
        .from('blog_article_translations')
        .select('lang, is_complete')
        .eq('article_id', articleId);

      return new Response(
        JSON.stringify({ success: true, article, translation, allTranslations: allTranslations || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== CREATE ARTICLE =====
    if (req.method === 'POST' && action === 'create') {
      const body = await req.json();

      const { data: article, error: artError } = await supabase
        .from('blog_articles')
        .insert({
          internal_slug: body.internal_slug,
          featured_image_url: body.featured_image_url || null,
          author_id: body.author_id || 'mathieu-courtin',
          status: body.status || 'draft',
          published_at: body.status === 'published' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (artError) throw artError;

      // Create initial FR translation
      const { error: trError } = await supabase
        .from('blog_article_translations')
        .insert({
          article_id: article.id,
          lang: 'fr',
          slug: body.internal_slug,
          title: body.title || '',
          meta_title: body.meta_title || '',
          meta_description: body.meta_description || '',
          featured_image_alt: body.featured_image_alt || '',
          excerpt: body.excerpt || '',
          introduction: body.introduction || '',
          quick_summary: body.quick_summary || [],
          sections: body.sections || [],
        });

      if (trError) throw trError;

      return new Response(
        JSON.stringify({ success: true, article }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== UPDATE ARTICLE METADATA =====
    if (req.method === 'POST' && action === 'update') {
      const body = await req.json();

      const updates: Record<string, unknown> = {};
      if (body.internal_slug !== undefined) updates.internal_slug = body.internal_slug;
      if (body.featured_image_url !== undefined) updates.featured_image_url = body.featured_image_url;
      if (body.author_id !== undefined) updates.author_id = body.author_id;
      if (body.status !== undefined) {
        updates.status = body.status;
        if (body.status === 'published') {
          // Set published_at only if not already set
          const { data: existing } = await supabase
            .from('blog_articles')
            .select('published_at')
            .eq('id', body.id)
            .single();
          if (!existing?.published_at) {
            updates.published_at = new Date().toISOString();
          }
        }
      }

      const { error } = await supabase
        .from('blog_articles')
        .update(updates)
        .eq('id', body.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== SAVE TRANSLATION =====
    if (req.method === 'POST' && action === 'save-translation') {
      const body = await req.json();

      const translationData = {
        article_id: body.article_id,
        lang: body.lang,
        slug: body.slug,
        title: body.title || '',
        meta_title: body.meta_title || '',
        meta_description: body.meta_description || '',
        featured_image_alt: body.featured_image_alt || '',
        excerpt: body.excerpt || '',
        introduction: body.introduction || '',
        quick_summary: body.quick_summary || [],
        sections: body.sections || [],
        is_complete: body.is_complete || false,
      };

      // Upsert by article_id + lang
      const { data: existing } = await supabase
        .from('blog_article_translations')
        .select('id')
        .eq('article_id', body.article_id)
        .eq('lang', body.lang)
        .maybeSingle();

      let error;
      if (existing) {
        ({ error } = await supabase
          .from('blog_article_translations')
          .update(translationData)
          .eq('id', existing.id));
      } else {
        ({ error } = await supabase
          .from('blog_article_translations')
          .insert(translationData));
      }

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== DELETE ARTICLE =====
    if (req.method === 'POST' && action === 'delete') {
      const body = await req.json();

      const { error } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', body.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== UPLOAD IMAGE =====
    if (req.method === 'POST' && action === 'upload-image') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const path = formData.get('path') as string;

      if (!file || !path) {
        return new Response(
          JSON.stringify({ success: false, error: 'File and path required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase.storage
        .from('blog-images')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(path);

      return new Response(
        JSON.stringify({ success: true, url: urlData.publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== ADD TO SITEMAP =====
    if (req.method === 'POST' && action === 'add-to-sitemap') {
      const body = await req.json();
      const articleId = body.id;

      if (!articleId) {
        return new Response(
          JSON.stringify({ success: false, error: 'ID requis' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get all translations for this article
      const { data: translations, error: trErr } = await supabase
        .from('blog_article_translations')
        .select('lang, slug')
        .eq('article_id', articleId);

      if (trErr) throw trErr;
      if (!translations || translations.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Aucune traduction trouvée' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const BASE = 'https://quiz-couple.com';
      const langs = ['fr', 'en', 'es', 'de', 'it'];
      const prefixes: Record<string, string> = { fr: '', en: '/en', es: '/es', de: '/de', it: '/it' };
      const slugMap: Record<string, string> = {};
      for (const t of translations) slugMap[t.lang] = t.slug;
      const frSlug = slugMap['fr'] || translations[0].slug;
      const today = new Date().toISOString().split('T')[0];

      let count = 0;
      for (const lang of langs) {
        const slug = slugMap[lang];
        if (!slug) continue;

        const sitemapKey = `sitemap-${lang}.xml`;
        // Download current sitemap from storage
        const { data: fileData, error: dlErr } = await supabase.storage
          .from('blog-images')
          .download(`sitemaps/${sitemapKey}`);

        let xml: string;
        if (dlErr || !fileData) {
          // Sitemap doesn't exist in storage yet - we can't modify it here
          // This is OK - sitemaps are generated at build time
          continue;
        } else {
          xml = await fileData.text();
        }

        const locUrl = `${BASE}${prefixes[lang]}/blog/${slug}`;
        if (xml.includes(locUrl)) { count++; continue; } // Already present

        // Build entry
        let entry = `  <url>\n    <loc>${locUrl}</loc>\n`;
        for (const l of langs) {
          if (slugMap[l]) {
            entry += `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}${prefixes[l]}/blog/${slugMap[l]}"/>\n`;
          }
        }
        entry += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/blog/${frSlug}"/>\n`;
        entry += `    <lastmod>${today}</lastmod>\n`;
        entry += `    <changefreq>monthly</changefreq>\n`;
        entry += `    <priority>0.7</priority>\n`;
        entry += `  </url>`;

        xml = xml.replace('</urlset>', `${entry}\n</urlset>`);

        // Upload back
        await supabase.storage
          .from('blog-images')
          .upload(`sitemaps/${sitemapKey}`, new Blob([xml], { type: 'application/xml' }), { upsert: true, contentType: 'application/xml' });

        count++;
      }

      return new Response(
        JSON.stringify({ success: true, count, message: `Ajouté aux ${count} sitemaps. Les sitemaps seront aussi auto-générés au prochain build.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== SEED ARTICLES (bulk import) =====
    if (req.method === 'POST' && action === 'seed') {
      const body = await req.json();
      const articles = body.articles; // Array of { internal_slug, featured_image_url, author_id, status, published_at, translations: [{ lang, slug, title, meta_title, meta_description, featured_image_alt, excerpt, introduction, quick_summary, sections }] }

      if (!articles || !Array.isArray(articles)) {
        return new Response(
          JSON.stringify({ success: false, error: 'articles array required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let created = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const art of articles) {
        // Check if article already exists
        const { data: existing } = await supabase
          .from('blog_articles')
          .select('id')
          .eq('internal_slug', art.internal_slug)
          .maybeSingle();

        if (existing) {
          // Update existing article and upsert translations
          await supabase
            .from('blog_articles')
            .update({
              featured_image_url: art.featured_image_url || null,
              author_id: art.author_id || 'mathieu-courtin',
              status: art.status || 'published',
              published_at: art.published_at || new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (art.translations) {
            for (const tr of art.translations) {
              const { data: existingTr } = await supabase
                .from('blog_article_translations')
                .select('id')
                .eq('article_id', existing.id)
                .eq('lang', tr.lang)
                .maybeSingle();

              const trData = {
                article_id: existing.id,
                lang: tr.lang,
                slug: tr.slug,
                title: tr.title || '',
                meta_title: tr.meta_title || '',
                meta_description: tr.meta_description || '',
                featured_image_alt: tr.featured_image_alt || '',
                excerpt: tr.excerpt || '',
                introduction: tr.introduction || '',
                quick_summary: tr.quick_summary || [],
                sections: tr.sections || [],
                is_complete: true,
              };

              if (existingTr) {
                await supabase.from('blog_article_translations').update(trData).eq('id', existingTr.id);
              } else {
                await supabase.from('blog_article_translations').insert(trData);
              }
            }
          }
          skipped++;
          continue;
        }

        // Create new article
        const { data: newArt, error: artErr } = await supabase
          .from('blog_articles')
          .insert({
            internal_slug: art.internal_slug,
            featured_image_url: art.featured_image_url || null,
            author_id: art.author_id || 'mathieu-courtin',
            status: art.status || 'published',
            published_at: art.published_at || new Date().toISOString(),
          })
          .select()
          .single();

        if (artErr) {
          errors.push(`${art.internal_slug}: ${artErr.message}`);
          continue;
        }

        // Insert translations
        if (art.translations) {
          for (const tr of art.translations) {
            const { error: trErr } = await supabase
              .from('blog_article_translations')
              .insert({
                article_id: newArt.id,
                lang: tr.lang,
                slug: tr.slug,
                title: tr.title || '',
                meta_title: tr.meta_title || '',
                meta_description: tr.meta_description || '',
                featured_image_alt: tr.featured_image_alt || '',
                excerpt: tr.excerpt || '',
                introduction: tr.introduction || '',
                quick_summary: tr.quick_summary || [],
                sections: tr.sections || [],
                is_complete: true,
              });
            if (trErr) errors.push(`${art.internal_slug}/${tr.lang}: ${trErr.message}`);
          }
        }
        created++;
      }

      return new Response(
        JSON.stringify({ success: true, created, skipped, errors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Action non reconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
