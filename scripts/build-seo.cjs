// Nach Änderungen an projekt.html oder SEO-Daten ausführen: node scripts/build-seo.cjs
// Metadaten stehen bereits in der HTTP-Antwort, auch für Vorschau-Bots ohne JavaScript.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = 'https://1kreativbuero.ch';
const read = name => fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n');
const write = (name, value) => fs.writeFileSync(path.join(root, name), value);
const escape = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const pages = [
  { source: 'index.html', file: 'index.html', url: '/', title: '1Kreativbüro — Drei Köpfe. Ein Büro.', description: '1Kreativbüro: Beni, Rebecca und Mathis. Drei kreative Köpfe für Film, Fotografie, Illustration und Web. Entdecke unsere Projekte.', image: 'studio', alt: '1Kreativbüro als farbige Materialbuchstaben auf schwarzem Hintergrund.' },
  { source: 'kontakt.html', file: 'kontakt.html', url: '/kontakt', title: 'Kontakt — 1Kreativbüro', description: 'Eine Idee im Kopf? Schreib Beni, Rebecca und Mathis vom 1Kreativbüro. Gemeinsam geben wir deiner Idee eine Form.', image: 'studio', alt: '1Kreativbüro als farbige Materialbuchstaben auf schwarzem Hintergrund.' },
  { source: 'projekt.html', file: 'projekt-wiriehorn.html', url: '/projekte/wiriehorn', title: 'Wiriehorn – Eine Bergwelt wird interaktiv. — 1Kreativbüro', description: 'Von der ersten Skizze zur interaktiven Wiriehorn-Erlebniskarte: Illustration, Sommer und Winter, Betriebsinformationen und 360°-Panoramen.', image: 'wiriehorn', alt: 'Illustrierte Sommer-Erlebniskarte des Wiriehorns.' },
  { source: 'projekt.html', file: 'projekt-rigi.html', url: '/projekte/rigi', title: 'Rigi – Imagefilm & Fotoshooting — 1Kreativbüro', description: 'Rigi: Ein Imagefilm von unterwegs und neue Bilder für das Familienangebot in Rigi Kaltbad.', image: 'rigi', alt: 'Zwei Kinder klettern in einem Seilnetz, fotografiert durch eine runde Öffnung im Holzturm.' },
];
for (const page of pages) {
  let html = read(page.source).replace(/\n  <!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/g, '');
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(page.description)}">`);
  const image = `${origin}/assets/social/${page.image}.jpg`;
  const tags = [
    `<link rel="canonical" href="${origin}${page.url}">`,
    ...Object.entries({ 'og:type':'website', 'og:site_name':'1Kreativbüro', 'og:locale':'de_CH', 'og:title':page.title, 'og:description':page.description, 'og:url':origin+page.url, 'og:image':image, 'og:image:type':'image/jpeg', 'og:image:width':'1200', 'og:image:height':'630', 'og:image:alt':page.alt }).map(([property,value])=>`<meta property="${property}" content="${escape(value)}">`),
    ...Object.entries({ 'twitter:card':'summary_large_image', 'twitter:title':page.title, 'twitter:description':page.description, 'twitter:image':image, 'twitter:image:alt':page.alt }).map(([name,value])=>`<meta name="${name}" content="${escape(value)}">`),
  ];
  if (page.url === '/') {
    const organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: '1Kreativbüro',
      url: `${origin}/`,
      logo: `${origin}/assets/LogoNavbar.svg`,
      email: 'team@1kreativbuero.ch',
      description: 'Drei kreative Köpfe für Film, Fotografie, Illustration und Web.',
    };
    tags.push(`<script type="application/ld+json">${JSON.stringify(organization, null, 2)}</script>`);
  }
  html = html.replace('</title>', `</title>\n  <!-- SEO:START -->\n  ${tags.join('\n  ')}\n  <!-- SEO:END -->`);
  write(page.file, html);
}
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + pages.map(page=>`  <url><loc>${origin}${page.url}</loc></url>`).join('\n') + '\n</urlset>\n');
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log('SEO: vier Seiten, Sitemap und robots.txt erzeugt.');
