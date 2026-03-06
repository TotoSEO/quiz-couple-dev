<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Sitemap XML — Quiz Couple</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#faf9fc;color:#1a0d2e;line-height:1.6;padding:2rem}
    .container{max-width:900px;margin:0 auto}
    h1{font-size:1.5rem;margin-bottom:.5rem}
    p.info{color:#6b5f7a;font-size:.875rem;margin-bottom:1.5rem}
    table{width:100%;border-collapse:collapse;background:#fff;border-radius:.75rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    th{background:#f3f0f7;text-align:left;padding:.75rem 1rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#6b5f7a}
    td{padding:.5rem 1rem;border-top:1px solid #e8e4ee;font-size:.875rem}
    td a{color:#d4577a;text-decoration:none}
    td a:hover{text-decoration:underline}
    tr:hover td{background:#faf9fc}
    .count{background:#f0e6f6;color:#6b5f7a;font-size:.75rem;padding:.125rem .5rem;border-radius:1rem;margin-left:.5rem}
  </style>
</head>
<body>
<div class="container">
  <h1>Sitemap XML — Quiz Couple</h1>
  <xsl:choose>
    <xsl:when test="sitemap:sitemapindex">
      <p class="info">Sitemap index — <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps</p>
      <table>
        <tr><th>Sitemap</th></tr>
        <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
          <tr><td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td></tr>
        </xsl:for-each>
      </table>
    </xsl:when>
    <xsl:otherwise>
      <p class="info"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs</p>
      <table>
        <tr><th>URL</th><th>Alternates</th></tr>
        <xsl:for-each select="sitemap:urlset/sitemap:url">
          <tr>
            <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
            <td><xsl:value-of select="count(xhtml:link)"/></td>
          </tr>
        </xsl:for-each>
      </table>
    </xsl:otherwise>
  </xsl:choose>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
