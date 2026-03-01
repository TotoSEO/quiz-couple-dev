import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const lang = url.searchParams.get("lang") || "fr";
  const siteUrl = "https://quiz-couple.com";

  if (!slug) {
    return Response.redirect(`${siteUrl}/blog`, 302);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: translation } = await supabase
      .from("blog_article_translations")
      .select("meta_title, meta_description, featured_image_alt, article_id, slug")
      .eq("slug", slug)
      .eq("lang", lang)
      .single();

    if (!translation) {
      return Response.redirect(`${siteUrl}/blog`, 302);
    }

    const { data: article } = await supabase
      .from("blog_articles")
      .select("featured_image_url")
      .eq("id", translation.article_id)
      .single();

    const langPrefix = lang === "fr" ? "" : `/${lang}`;
    const canonicalUrl = `${siteUrl}${langPrefix}/blog/${translation.slug}`;
    const ogImage = article?.featured_image_url || `${siteUrl}/og-image.webp`;
    const title = translation.meta_title || "Quiz Couple - Blog";
    const description = translation.meta_description || "";

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(ogImage)}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:site_name" content="Quiz Couple">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(ogImage)}">
<link rel="canonical" href="${canonicalUrl}">
<meta http-equiv="refresh" content="0;url=${canonicalUrl}">
</head>
<body>
<p>Redirecting to <a href="${canonicalUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    console.error("blog-og error:", e);
    return Response.redirect(`${siteUrl}/blog`, 302);
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
