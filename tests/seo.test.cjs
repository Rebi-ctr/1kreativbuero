const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
test('Öffentliche Seiten sind indexierbar und haben eindeutige Canonicals sowie statische Social-Vorschauen',()=>{
 const routes={'index.html':'/','kontakt.html':'/kontakt','projekt-wiriehorn.html':'/projekte/wiriehorn','projekt-rigi.html':'/projekte/rigi'};
 for(const [file,route] of Object.entries(routes)){
  const html=read(file);
  assert.doesNotMatch(html, /noindex|nofollow/);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert(html.includes(`rel="canonical" href="https://1kreativbuero.ch${route}"`));
  assert(html.includes(`property="og:url" content="https://1kreativbuero.ch${route}"`));
  const image=html.match(/property="og:image" content="https:\/\/1kreativbuero.ch\/([^\"]+)"/)[1];
  assert(fs.existsSync(path.join(root,image)));
  assert(html.includes('name="twitter:card" content="summary_large_image"'));
  assert(read('sitemap.xml').includes(`<loc>https://1kreativbuero.ch${route}</loc>`));
 }
 assert.doesNotMatch(read('projekt.html'),/noindex|nofollow/);
 assert.match(read('index.html'),/<h1 class="hero-site-title" id="home-title">1Kreativbüro<\/h1>/);
 assert.match(read('.htaccess'),/projekt-\$1\.html \[END\]/);
 assert.match(read('robots.txt'),/Sitemap: https:\/\/1kreativbuero.ch\/sitemap.xml/);
});
