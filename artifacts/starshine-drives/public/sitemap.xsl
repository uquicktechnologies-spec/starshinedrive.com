<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap — Starshine Drive</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f6f7; color: #222; }
          header { background: #093C71; color: #fff; padding: 24px 32px; }
          header h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
          header p { font-size: 13px; margin-top: 4px; opacity: 0.75; }
          .container { max-width: 900px; margin: 32px auto; padding: 0 16px 48px; }
          .stats { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
          .stat { background: #fff; border: 1px solid #e2e6ea; border-radius: 8px; padding: 14px 20px; font-size: 13px; color: #555; }
          .stat strong { display: block; font-size: 26px; font-weight: 700; color: #093C71; margin-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
          thead { background: #093C71; color: #fff; }
          th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
          td { padding: 11px 16px; font-size: 13px; border-bottom: 1px solid #f0f2f4; vertical-align: middle; }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: #f0f5ff; }
          td a { color: #093C71; text-decoration: none; word-break: break-all; }
          td a:hover { text-decoration: underline; color: #EF6F24; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .pri-high { background: #dcfce7; color: #166534; }
          .pri-med  { background: #fef9c3; color: #854d0e; }
          .pri-low  { background: #f1f5f9; color: #475569; }
          .freq { color: #64748b; font-size: 12px; }
          footer-note { display: block; text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <header>
          <h1>Starshine Drive — XML Sitemap</h1>
          <p>This sitemap helps search engines discover all pages on starshinedrive.com</p>
        </header>
        <div class="container">

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <xsl:variable name="pri" select="sitemap:priority"/>
                <xsl:variable name="priClass">
                  <xsl:choose>
                    <xsl:when test="$pri >= 0.9">pri-high</xsl:when>
                    <xsl:when test="$pri >= 0.7">pri-med</xsl:when>
                    <xsl:otherwise>pri-low</xsl:otherwise>
                  </xsl:choose>
                </xsl:variable>
                <tr>
                  <td style="color:#aaa;width:40px"><xsl:value-of select="position()"/></td>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <span style="display:block;text-align:center;margin-top:20px;font-size:12px;color:#aaa">
            Starshine Drive · starshinedrive.com
          </span>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
