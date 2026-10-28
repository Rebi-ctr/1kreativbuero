const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// Ohne Ersatz für Anwendungsfunktionen: die echten Scripts in HTML-Reihenfolge laden.
function renderProject(slug) {
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
      location: { search: `?projekt=${slug}` },
      matchMedia() { return { matches: false, addEventListener() {} }; },
      addEventListener() {},
    },
  });
  const scripts = [...read('projekt.html').matchAll(/<script\b[^>]*src="([^"?]+)(?:\?[^"]*)?"/g)].map(match => match[1]);
  for (const file of scripts.filter(file => file !== 'background-motion.js')) {
    vm.runInContext(read(file), context, { filename: file });
  }
  return { html: container.innerHTML, context };
}

test('HTML lädt lokale Assets und Scripts eindeutig in Abhängigkeitsreihenfolge', () => {
  for (const file of ['index.html', 'projekt.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /^(<<<<<<<|=======|>>>>>>>)/m);
    const scripts = [...html.matchAll(/<script\b[^>]*src="([^"?]+)(?:\?[^"]*)?"/g)].map(match => match[1]);
    assert.equal(new Set(scripts).size, scripts.length);
    assert(scripts.indexOf('shared.js') < scripts.indexOf('app.js'));
    assert(scripts.indexOf('content.js') < scripts.indexOf('app.js'));
    if (file === 'projekt.html') assert(scripts.indexOf('wiriehorn.js') < scripts.indexOf('app.js'));
    for (const match of html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
      if (/^(https?:|mailto:)/.test(match[1])) continue;
      assert(fs.existsSync(path.join(root, match[1])), `Fehlende Datei: ${match[1]}`);
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
