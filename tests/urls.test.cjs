const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { Writable } = require('node:stream');
const { test } = require('node:test');
const { createPreviewServer } = require('../scripts/preview.cjs');

// Den echten Request-Handler samt Dateistreams prüfen, ohne Ports zu öffnen.
function request(server, address, method = 'GET') {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let status = 200, headers = {};
    const response = new Writable({ write(chunk, encoding, done) { chunks.push(Buffer.from(chunk)); done(); } });
    response.writeHead = (code, values = {}) => { status = code; headers = values; return response; };
    response.on('error', reject);
    response.on('finish', () => resolve(new Response(Buffer.concat(chunks), { status, headers })));
    server.emit('request', { url: address, method }, response);
  });
}

test('HTTP-Anfragen für saubere URLs, Weiterleitungen und lokale Ressourcen werden korrekt verarbeitet', async () => {
  const server = createPreviewServer();
  const origin = 'http://127.0.0.1:4173';
  const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const checked = new Set();

  for (const [address, expected] of [
    ['/', /<title>1Kreativbüro/], ['/kontakt', /id="kontaktformular"/],
    ['/projekte/wiriehorn', /id="case-content"/], ['/projekte/rigi', /id="case-content"/],
  ]) {
    const response = await request(server, address);
    assert.equal(response.status, 200, address);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'self'/);
    const html = await response.text();
    assert.match(html, expected);
    assert.doesNotMatch(html, /href="(?:index|kontakt|projekt)\.html/);
    let baseURI = origin + address;
    const pageContext = vm.createContext({
      window: { location: new URL(baseURI) }, URL,
      document: { createElement() { return {}; }, head: { append(base) { baseURI = base.href; } } },
    });
    for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) vm.runInContext(script[1], pageContext);
    // Browserauflösung der Ressourcen gegen die sichtbare, verschachtelte URL.
    const sources = [...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)].map(match => match[1]);
    const context = vm.createContext({ window: { matchMedia() { return { matches: false }; } }, URL, URLSearchParams });
    vm.runInContext(read('shared.js'), context);
    vm.runInContext(read('content.js'), context);
    sources.push(...vm.runInContext('people.map(person => person.image).concat(projects.map(project => project.image), rigiFilmFrames.map(frame => frame.image), projects.flatMap(project => project.photoshoot?.images.map(view => view.image) || []))', context));
    for (const source of sources) {
      const resource = new URL(source.replaceAll('&amp;', '&'), baseURI);
      if (resource.origin !== origin || checked.has(resource.href)) continue;
      checked.add(resource.href);
      const result = await request(server, resource.pathname + resource.search, 'HEAD');
      assert.equal(result.status, 200, `${address}: ${resource.pathname}`);
    }
    if (address === '/kontakt') {
      const endpoint = vm.runInContext('studio.contactForm.endpoint', context);
      assert.equal(new URL(endpoint, origin + address).pathname, '/api/contact.php');
    }
  }

  for (const [address, destination] of [
    ['/index.html', '/'], ['/index.html?utm_source=test', '/?utm_source=test'],
    ['/kontakt.html', '/kontakt'], ['/kontakt.html?utm_source=test', '/kontakt?utm_source=test'],
    ['/projekt.html?projekt=wiriehorn', '/projekte/wiriehorn'],
    ['/projekt.html?utm_source=test&projekt=rigi', '/projekte/rigi'],
    ['/kontakt/', '/kontakt'], ['/projekte/rigi/?utm_source=test', '/projekte/rigi?utm_source=test'],
  ]) {
    const response = await request(server, address);
    assert.equal(response.status, 301, address);
    assert.equal(response.headers.get('location'), destination);
    assert.equal((await request(server, destination)).status, 200);
  }
  for (const address of ['/projekte/unbekannt', '/nicht-vorhanden', '/api/contact-config.php', '/.htaccess', '/.git/config']) {
    assert.equal((await request(server, address)).status, 404, address);
  }
  const api = await request(server, '/api/contact.php');
  assert.equal(api.status, 503);
  assert.equal((await api.json()).success, false);
});
