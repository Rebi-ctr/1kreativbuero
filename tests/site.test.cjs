const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// Ohne Ersatz für Anwendungsfunktionen: die echten Scripts in HTML-Reihenfolge laden.
function renderProject(slug, address = `https://1kreativbuero.ch/projekte/${slug}`) {
  const container = { innerHTML: '' };
  const element = {
    style: { setProperty() {}, removeProperty() {} },
    classList: { add() {}, toggle() {} },
    setAttribute() {}, addEventListener() {},
    querySelector() { return element; },
  };
  const document = {
    body: element,
    querySelector(selector) {
      if (selector === '#case-content') return container;
      if (selector.startsWith('meta[') || selector.startsWith('.season-') || selector.startsWith('.preview-badge')) return element;
      return null;
    },
    querySelectorAll() { return []; },
    addEventListener() {},
  };
  const context = vm.createContext({
    document, URL, URLSearchParams,
    window: {
      location: new URL(address),
      matchMedia() { return { matches: false, addEventListener() {} }; },
      addEventListener() {},
    },
  });
  const scripts = [...read('projekt.html').matchAll(/<script\b[^>]*src="([^"?]+)(?:\?[^"]*)?"/g)].map(match => match[1].replace(/^\//, ''));
  for (const file of scripts.filter(file => file !== 'background-motion.js')) {
    vm.runInContext(read(file), context, { filename: file });
  }
  return { html: container.innerHTML, context };
}

test('HTML lädt lokale Assets und Scripts eindeutig in Abhängigkeitsreihenfolge', () => {
  for (const file of ['index.html', 'projekt.html', 'kontakt.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /^(<<<<<<<|=======|>>>>>>>)/m);
    const scripts = [...html.matchAll(/<script\b[^>]*src="([^"?]+)(?:\?[^"]*)?"/g)].map(match => match[1].replace(/^\//, ''));
    assert.equal(new Set(scripts).size, scripts.length);
    if (file !== 'kontakt.html') {
      assert(scripts.indexOf('shared.js') < scripts.indexOf('app.js'));
      assert(scripts.indexOf('content.js') < scripts.indexOf('app.js'));
    } else assert(scripts.indexOf('content.js') < scripts.indexOf('contact.js'));
    if (file === 'projekt.html') assert(scripts.indexOf('wiriehorn.js') < scripts.indexOf('app.js'));
    for (const match of html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
      if (/^(https?:|mailto:)/.test(match[1])) continue;
      const files = { '/': 'index.html', '/kontakt': 'kontakt.html' };
      assert(fs.existsSync(path.join(root, files[match[1]] || match[1].replace(/^\//, ''))), `Fehlende Datei: ${match[1]}`);
    }
  }
});

test('Wiriehorn rendert zehn Schritte, Videos, Vergleich und existierende Medien', () => {
  const { html } = renderProject('wiriehorn');
  assert.equal((html.match(/class="journey-step"/g) || []).length, 10);
  assert.match(html, /class="season-compare"/);
  assert.match(html, /class="journey-film"/);
  assert.match(html, /Interaktive Karte starten/);
  for (const match of html.matchAll(/(?:src|poster)="(assets\/[^"?#]+)"/g)) {
    assert(fs.existsSync(path.join(root, match[1])), `Fehlendes Medium: ${match[1]}`);
  }
});

test('Alle weiteren Projekte und die Fehlerseite werden aufgebaut', () => {
  const { context } = renderProject('wiriehorn');
  const slugs = vm.runInContext('projects.map(project => project.slug)', context);
  for (const slug of slugs.filter(slug => slug !== 'wiriehorn')) {
    const { html } = renderProject(slug);
    assert.match(html, /id="case-title"/);
    assert.doesNotMatch(html, /case-not-found/);
  }
  assert.match(renderProject('unbekannt').html, /case-not-found/);
});

test('Rigi behält den neuen Projekteinstieg und das gemeinsame Kapitelraster', () => {
  const { html } = renderProject('rigi');
  assert.match(html, /Ein Berg\.<br>Viele Augenblicke\./);
  assert.match(html, /class="journey-nav"/);
  assert.match(html, /class="journey-report rigi-film-gallery"/);
  assert.match(html, /id="fotoshooting"/);
  assert.match(html, /class="journey-end"/);
  assert.doesNotMatch(html, /class="case-section case-film"/);
  for (const match of html.matchAll(/(?:src|poster)="(assets\/[^"?#]+)"/g)) {
    assert(fs.existsSync(path.join(root, match[1])), `Fehlendes Rigi-Medium: ${match[1]}`);
  }
});

test('Header und Footer sind auf beiden Seiten gleich und enthalten das SVG-Logo', () => {
  const home = read('index.html');
  const project = read('projekt.html');
  for (const tag of ['header', 'footer']) {
    const pattern = new RegExp(`<${tag} class="site-${tag}">[\\s\\S]*?<\\/${tag}>`);
    const a = home.match(pattern)?.[0];
    const b = project.match(pattern)?.[0];
    assert(a && b, `${tag} fehlt`);
    assert.equal(a.replace(/\s+/g, ' '), b.replace(/\s+/g, ' '));
    assert.match(a, /assets\/LogoNavbar.svg/);
  }
  assert.doesNotMatch(home + project, /<aside class="preview-badge"/);
});

test('Keine doppelten Seitenfunktionen oder Merge-Marker', () => {
  const functions = [...read('app.js').matchAll(/^  function (\w+)\(/gm)].map(match => match[1]);
  assert.equal(functions.length, new Set(functions).size);
  for (const file of ['app.js', 'studio.js', 'shared.js', 'styles.css', 'index.html', 'projekt.html']) {
    assert.doesNotMatch(read(file), /^(<<<<<<<|=======|>>>>>>>)/m);
  }
});

test('Alle JavaScript-Dateien sind syntaktisch gültig', () => {
  for (const file of fs.readdirSync(root).filter(file => file.endsWith('.js'))) {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }));
  }
});

test('Zeichenanimation erzeugt nur Symbole und vorgesehene Zielbuchstaben', () => {
  const context = vm.createContext({ window: { matchMedia() { return { matches: false }; } } });
  vm.runInContext(read('shared.js'), context);
  const symbols = new Set('+×○□△◇*');
  for (const word of ['FILM', 'WEB', 'FOTO', 'DAS BÜRO.', 'DAS KREATIVE.']) {
    for (const seed of [0, 11, 22, 31]) {
      for (let step = 0; step <= 1000; step++) {
        const progress = step / 1000;
        const frame = Array.from(word, (expected, index) => {
          const { character } = context.studioGlyph(word, index, progress, seed);
          assert(character === expected || symbols.has(character));
          if (!/\p{L}/u.test(expected)) assert.equal(character, expected);
          return character;
        }).join('');
        if (progress === 1) assert.equal(frame, word);
      }
    }
  }
});

test('Titel-Hover verwendet freigegebene Begriffe und behält DAS bei und endet bei DAS KREATIV.', () => {
  const context = vm.createContext({ window: { matchMedia() { return { matches: false }; } } });
  vm.runInContext(read('shared.js'), context);
  const allowed = new Set(['DAS TEAM.', 'DAS BILD.', 'DAS WERK.', 'DAS KINO.', 'DAS FOTO.', 'DAS BÜRO.', 'DAS KREATIV.']);
  for (let step = 0; step <= 1000; step++) {
    const text = context.studioHoverText('DAS BÜRO.', step / 1000);
    assert(allowed.has(text));
    assert(text.startsWith('DAS '));
    assert(text.length <= 'DAS KREATIV.'.length);
  }
  assert.equal(context.studioHoverText('DAS BÜRO.', 1), 'DAS KREATIV.');
});

test('Kontaktseite zeigt nur den kleinen Footer, andere Seiten den Kontaktbereich', () => {
  const pages = ['index.html', 'projekt.html'].map(read);
  const footer = html => html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
  for (const html of pages) {
    assert.equal(footer(html), footer(pages[0]));
    assert.equal((html.match(/id="kontakt"/g) || []).length, 1);
    assert.match(html, /href="\/kontakt">Kontakt/);
    assert.match(footer(html), /href="\/kontakt#kontaktformular"/);
    assert.match(footer(html), /mailto:team@1kreativbuero.ch/);
  }
  assert.doesNotMatch(footer(read('kontakt.html')), /Etwas im Kopf|id="kontakt"/);
  assert.match(footer(read('kontakt.html')), /class="footer-bottom"/);
  assert.match(read('kontakt.html'), /id="kontaktformular"/);
  assert.match(read('kontakt.html'), /type="email"[^>]*required/);
});

test('Projektpfade liefern ohne Query denselben Inhalt wie bisherige Projektlinks', () => {
  for (const slug of ['wiriehorn', 'rigi']) {
    const clean = renderProject(slug);
    const legacy = renderProject(slug, `https://1kreativbuero.ch/projekt.html?projekt=${slug}`);
    assert.equal(clean.html, legacy.html);
    assert.equal(renderProject(slug, `https://1kreativbuero.ch/projekte/${slug}/`).html, clean.html);
    assert.equal(renderProject(slug, `https://1kreativbuero.ch/projekte/${slug}?projekt=unbekannt`).html, clean.html);
    assert.equal(vm.runInContext(`projectURL({ slug: '${slug}' })`, clean.context), `/projekte/${slug}`);
    for (const address of [
      `${pathToFileURL(path.join(root, 'projekt.html')).href}?projekt=${slug}`,
      `http://127.0.0.1:5500/projekt.html?projekt=${slug}`,
    ]) {
      const local = renderProject(slug, address);
      assert.match(local.html, /id="case-title"/);
      assert.doesNotMatch(local.html, /case-not-found/);
      assert.equal(vm.runInContext(`projectURL({ slug: '${slug}' })`, local.context), `projekt.html?projekt=${slug}`);
    }
  }
});

test('Projektzuordnung erkennt Pfade und alte Links auch für Bildübergänge', () => {
  const { context } = renderProject('rigi');
  for (const [address, expected] of [
    ['/projekte/rigi', 'rigi'], ['/projekte/wiriehorn?utm_source=test', 'wiriehorn'],
    ['/projekt.html?projekt=rigi', 'rigi'], ['/', null], ['/kontakt?projekt=rigi', null],
    ['/projekte/rigi/weiter', null],
  ]) {
    assert.equal(context.projectSlugFromURL(new URL(address, 'https://1kreativbuero.ch')), expected);
  }
});
