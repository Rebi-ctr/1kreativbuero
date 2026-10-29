const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL, fileURLToPath } = require('node:url');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function page(file, address) {
  const html = read(file), ready = [];
  let baseURI = address;
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map(match => ({
    href: match[1], getAttribute() { return this.href; }, setAttribute(name, value) { this.href = value; },
  }));
  const document = {
    createElement() { return {}; }, head: { append(base) { baseURI = base.href; } },
    querySelectorAll() { return links; },
    addEventListener(name, callback) { if (name === 'DOMContentLoaded') ready.push(callback); },
  };
  const context = vm.createContext({
    document, URL, URLSearchParams,
    window: { location: new URL(address), matchMedia() { return { matches: false }; } },
  });
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) vm.runInContext(script[1], context);
  vm.runInContext(read('navigation.js'), context);
  vm.runInContext(read('shared.js'), context);
  ready.forEach(callback => callback());
  return { html, links, context, baseURI };
}

test('Direkt geöffnete HTML-Dateien laden Styles, Scripts und Bilder aus dem Projektordner', () => {
  for (const file of ['index.html', 'kontakt.html', 'projekt.html']) {
    const address = pathToFileURL(path.join(root, file)).href + (file === 'projekt.html' ? '?projekt=rigi' : '');
    const view = page(file, address);
    const resources = [...view.html.matchAll(/(?:src|href)="([^"#]+)"/g)]
      .map(match => match[1]).filter(source => /^(?:assets\/|[a-z-]+\.(?:css|js))/.test(source));
    assert(resources.some(source => source.startsWith('styles.css')));
    for (const source of resources) {
      const resource = new URL(source, view.baseURI);
      assert(fs.existsSync(fileURLToPath(resource)), `${file}: ${resource.href}`);
    }
    for (const link of view.links.filter(link => !/^(?:mailto:|https?:)/.test(link.href))) {
      const destination = new URL(link.href, view.baseURI);
      assert(fs.existsSync(fileURLToPath(destination)), `Lokaler Link: ${destination.href}`);
    }
    assert.equal(vm.runInContext('projectURL({ slug: "rigi" })', view.context), 'projekt.html?projekt=rigi');
  }
});

test('Einfache lokale Server behalten funktionierende Dateilinks auch in Unterordnern', () => {
  for (const address of ['http://127.0.0.1:5500/index.html', 'http://localhost:5500/entwurf/index.html']) {
    const view = page('index.html', address);
    const destinations = view.links.map(link => new URL(link.href, view.baseURI));
    const directory = new URL('.', address);
    assert(destinations.some(url => url.href === new URL('kontakt.html', directory).href));
    assert(destinations.some(url => url.href === new URL('index.html#projekte', directory).href));
    assert.equal(vm.runInContext('projectURL({ slug: "wiriehorn" })', view.context), 'projekt.html?projekt=wiriehorn');
  }
});

test('Saubere Projekt-URLs lösen Ressourcen zur Website und Kapitelanker zur Projektseite auf', () => {
  for (const address of ['https://1kreativbuero.ch/projekte/rigi', 'https://1kreativbuero.ch/projekte/rigi/']) {
    const view = page('projekt.html', address);
    assert.equal(new URL('styles.css', view.baseURI).href, 'https://1kreativbuero.ch/styles.css');
    assert.equal(new URL('assets/Rigi8-verkleinert.jpg', view.baseURI).href, 'https://1kreativbuero.ch/assets/Rigi8-verkleinert.jpg');
    assert(view.links.some(link => link.href === new URL('#inhalt', address).href));
    assert(view.links.some(link => link.href === '/#projekte'));
    assert.equal(vm.runInContext('projectURL({ slug: "wiriehorn" })', view.context), '/projekte/wiriehorn');
  }
});
