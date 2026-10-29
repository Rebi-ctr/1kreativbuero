// Lokale Vorschau ohne Abhängigkeiten. PHP wird hier bewusst nicht ausgeführt.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = new Map([
  ['/', 'index.html'],
  ['/kontakt', 'kontakt.html'],
  ['/projekte/wiriehorn', 'projekt.html'],
  ['/projekte/rigi', 'projekt.html'],
]);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function createPreviewServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const redirect = target => { response.writeHead(301, { Location: target }); response.end(); };
    if (url.pathname === '/api/contact.php') {
      response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ success: false, message: 'PHP ist in der lokalen Vorschau nicht verfügbar.' }));
      return;
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }
    if (url.pathname === '/index.html') return redirect(`/${url.search}`);
    if (url.pathname === '/kontakt.html') return redirect(`/kontakt${url.search}`);
    const slug = url.searchParams.get('projekt');
    if (url.pathname === '/projekt.html' && /^[a-z0-9-]+$/.test(slug || '')) return redirect(`/projekte/${slug}`);
    if (/^\/(?:kontakt|projekte\/[a-z0-9-]+)\/$/.test(url.pathname)) return redirect(`${url.pathname.slice(0, -1)}${url.search}`);

    let relative;
    try { relative = pages.get(url.pathname) || decodeURIComponent(url.pathname).slice(1); }
    catch { response.writeHead(400); response.end(); return; }
    const file = path.resolve(root, relative);
    const extension = path.extname(file).toLowerCase();
    // Keine Konfigurationen, PHP-Quellen oder Dateien ausserhalb des Projekts ausgeben.
    const publicPath = /^(?:assets\/|[a-z-]+\.(?:html|js|css)$)/.test(relative);
    if (!publicPath || !types[extension] || !file.startsWith(root + path.sep) || relative.includes('\\')) {
      response.writeHead(404); response.end(); return;
    }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) { response.writeHead(404); response.end(); return; }
      response.writeHead(200, { 'Content-Type': types[extension], 'Content-Length': stat.size, 'Cache-Control': 'no-store' });
      if (request.method === 'HEAD') { response.end(); return; }
      fs.createReadStream(file).on('error', () => response.destroy()).pipe(response);
    });
  });
}

if (require.main === module) {
  const port = Number(process.argv[2] || 4173);
  createPreviewServer().listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
}

module.exports = { createPreviewServer };
