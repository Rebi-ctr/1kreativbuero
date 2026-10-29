const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

// Prüft den echten Dialog-Lebenszyklus. Darstellung und Schwerkraft brauchen eine Sichtprüfung.
function setup({ reduced = false, scrollbarResizeOnOpen = false, snapshotError = false, animationErrorAt = 0, width = 1200, extraImages = [], canvasContext = true, canvasDrawError = false, pixelRatio = 2 } = {}) {
  const animations = [], signals = [];
  const createdImages = [], createdCanvases = [];
  let focus, snapshots = 0, animationCalls = 0;
  class Target {
    events = new Map();
    addEventListener(name, fn) {
      if (!this.events.has(name)) this.events.set(name, []);
      this.events.get(name).push(fn);
    }
    emit(name, event = {}) { for (const fn of this.events.get(name) || []) fn(event); }
    dispatchEvent(event) { this.emit(event.type, event); }
  }
  class Element extends Target {
    children = [];
    attributes = {};
    classes = new Set();
    style = { setProperty(key, value) { this[key] = value; } };
    classList = { add: name => this.classes.add(name), remove: name => this.classes.delete(name) };
    isConnected = true;
    hidden = false;
    constructor(tag = 'div') { super(); this.tagName = tag.toUpperCase(); }
    get className() { return [...this.classes].join(' '); }
    set className(value) { this.classes = new Set(value.split(/\s+/).filter(Boolean)); }
    setAttribute(key, value) { this.attributes[key] = value; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    closest() { return null; }
    getBoundingClientRect() { return { left: 30, right: 330, top: 100, bottom: 140, width: 300, height: 40 }; }
    focus() { focus = this; }
    animate(frames, options) {
      if (++animationCalls === animationErrorAt) throw new Error('Animation nicht verfügbar');
      let resolve;
      const animation = {
        element: this, frames, options, cancelled: false,
        finished: new Promise(done => { resolve = done; }),
        finish() { resolve(); },
        cancel() { this.cancelled = true; resolve(); },
      };
      animations.push(animation);
      return animation;
    }
  }
  const trigger = new Element('button');
  trigger.hidden = true;
  const scene = new Element(), message = new Element(), resume = new Element('button');
  class Dialog extends Element {
    open = false;
    querySelector(selector) {
      return { '.creative-pause-scene': scene, '.creative-pause-message': message, '.creative-pause-resume': resume }[selector];
    }
    showModal() { this.open = true; }
    close() { this.open = false; this.emit('close'); }
  }
  const root = new Element('main'), body = new Element('body'), html = new Element('html');
  html.clientWidth = width;
  const text = { textContent: 'Etwas im Kopf?', parentElement: root };
  root.children.push(text);
  const image = new Element('img');
  image.src = 'assets/LogoNavbar.svg';
  image.currentSrc = image.src;
  image.complete = true;
  image.naturalWidth = 842;
  image.naturalHeight = 113;
  const sources = extraImages.map((item, index) => {
    const source = new Element('img');
    const { left = 100, top = -1000 - index * 250, width: sourceWidth = 320, height = 180 } = item.rect || {};
    source.src = item.url;
    source.currentSrc = item.currentSrc ?? item.url;
    source.complete = item.complete ?? true;
    source.naturalWidth = item.naturalWidth ?? 1600;
    source.naturalHeight = item.naturalHeight ?? 900;
    source.computed = item.styles || {};
    source.getBoundingClientRect = () => ({ left, top, width: sourceWidth, height, right: left + sourceWidth, bottom: top + height });
    source.closest = selector => item.team && selector === '.person-card' ? {} : null;
    return source;
  });
  const video = new Element('video');
  video.paused = false;
  video.pause = () => { video.paused = true; };
  video.play = () => { video.paused = false; return Promise.resolve(); };
  const field = { value: 'Meine Idee bleibt erhalten.' };
  const document = new Target();
  Object.assign(document, {
    body, documentElement: html, hidden: false,
    querySelector: selector => selector === '[data-creative-pause]' ? trigger : null,
    querySelectorAll(selector) {
      if (selector === 'body > header, body > main, body > footer') return [root];
      if (selector.includes('header img')) return [image];
      if (selector.includes('.person-card img')) return sources;
      if (selector === 'video') return [video];
      return [root];
    },
    createElement(tag) {
      if (tag === 'dialog') return new Dialog(tag);
      const node = new Element(tag);
      if (tag === 'img') createdImages.push(node);
      if (tag === 'canvas') {
        createdCanvases.push(node);
        node.getContext = kind => kind !== '2d' || !canvasContext ? null : {
          drawImage(source, ...dimensions) {
            if (canvasDrawError) throw new Error('Bild konnte nicht gezeichnet werden');
            node.drawnSource = source;
            node.drawnDimensions = dimensions;
          },
        };
      }
      return node;
    },
    createTreeWalker() { let done = false; return { nextNode() { if (done) return null; done = true; return text; } }; },
    createRange() {
      snapshots++;
      if (snapshotError) throw new Error('Momentaufnahme nicht verfügbar');
      let start = 0, end = 0;
      return {
        setStart(node, index) { start = index; },
        setEnd(node, index) { end = index; },
        getBoundingClientRect() { const left = 30 + start * 10, width = (end - start) * 10; return { left, right: left + width, top: 100, bottom: 120, width, height: 20 }; },
      };
    },
  });
  const motion = new Target();
  motion.matches = reduced;
  const window = new Target();
  window.innerWidth = width + 15;
  window.innerHeight = 800;
  window.devicePixelRatio = pixelRatio;
  window.visualViewport = new Target();
  window.visualViewport.width = width;
  window.visualViewport.height = 800;
  if (scrollbarResizeOnOpen) {
    const addClass = html.classList.add;
    html.classList.add = name => {
      addClass(name);
      if (name !== 'is-creative-paused') return;
      html.clientWidth = 1215;
      window.visualViewport.width = 1215;
      window.visualViewport.emit('resize');
      window.emit('resize');
    };
  }
  window.matchMedia = () => motion;
  window.addEventListener('creativepausechange', event => signals.push(event.detail.active));
  const context = vm.createContext({
    document, window, HTMLDialogElement: Dialog, NodeFilter: { SHOW_TEXT: 4 }, console: { warn() {} },
    CustomEvent: class { constructor(type, options) { this.type = type; Object.assign(this, options); } },
    getComputedStyle: element => ({
      visibility: 'visible', display: 'block', opacity: '1', transform: 'none', backgroundColor: 'rgb(17, 17, 16)',
      objectFit: 'contain', objectPosition: '50% 50%', borderRadius: '0px',
      getPropertyValue: property => ({ color: 'rgb(240, 239, 233)', 'font-size': '20px' }[property] || ''),
      ...element.computed,
    }),
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'creative-pause.js'), 'utf8'), context);
  const dialog = body.children[0];
  return { trigger, dialog, scene, resume, root, text, field, html, window, motion, video, animations, signals, sources, createdImages, createdCanvases,
    snapshots: () => snapshots, focused: () => focus,
    failNextAnimation() { animationErrorAt = animationCalls + 1; },
    async finish() { animations.forEach(animation => animation.finish()); await new Promise(resolve => setImmediate(resolve)); },
  };
}

test('Pause friert eine Kopie ein und stellt Inhalt, Formular, Fokus und Medien wieder her', async () => {
  const page = setup();
  const original = page.root.children[0];
  assert(!page.trigger.hidden);
  page.trigger.emit('click');
  assert(page.dialog.open);
  assert(page.html.classes.has('is-creative-paused'));
  assert(page.scene.children.length > 3);
  assert.equal(page.focused(), page.resume);
  assert(page.video.paused);
  page.resume.emit('click');
  await page.finish();
  assert(!page.dialog.open);
  assert(!page.html.classes.has('is-creative-paused'));
  assert.equal(page.scene.children.length, 0);
  assert.equal(page.root.children[0], original);
  assert.equal(page.text.textContent, 'Etwas im Kopf?');
  assert.equal(page.field.value, 'Meine Idee bleibt erhalten.');
  assert.equal(page.focused(), page.trigger);
  assert(!page.video.paused);
  assert.deepEqual(page.signals, [true, false]);
});

test('Frühes Esc und mehrfaches Klicken erzeugen nur eine Pause und einen Wiederaufbau', async () => {
  const page = setup();
  page.trigger.emit('click');
  const count = page.animations.length;
  page.trigger.emit('click');
  assert.equal(page.animations.length, count);
  let prevented = false;
  page.dialog.emit('cancel', { preventDefault() { prevented = true; } });
  assert(prevented);
  const returning = page.animations.length;
  page.resume.emit('click');
  assert.equal(page.animations.length, returning);
  await page.finish();
  assert(!page.dialog.open);
  page.trigger.emit('click');
  assert(page.dialog.open);
  page.window.innerWidth += 200;
  page.window.emit('resize');
  assert(!page.dialog.open);
  assert.deepEqual(page.signals, [true, false, true, false]);
});

test('Resize während des Wiederaufbaus räumt auf und lässt eine neue Pause unangetastet', async () => {
  const page = setup();
  page.trigger.emit('click');
  page.resume.emit('click');
  page.window.innerHeight -= 100;
  page.window.visualViewport.emit('resize');
  assert(!page.dialog.open);
  assert.equal(page.scene.children.length, 0);
  page.trigger.emit('click');
  await new Promise(resolve => setImmediate(resolve));
  assert(page.dialog.open);
  assert(page.html.classes.has('is-creative-paused'));
  page.window.emit('pagehide');
  assert(!page.dialog.open);
  assert(page.video.paused, 'Beim Verlassen der Seite keinen Film neu starten');
});

test('Reduzierte Bewegung öffnet eine ruhige Pause ohne Momentaufnahme oder Animation', () => {
  const page = setup({ reduced: true });
  page.trigger.emit('click');
  assert(page.dialog.open);
  assert.equal(page.snapshots(), 0);
  assert.equal(page.animations.length, 0);
  page.resume.emit('click');
  assert(!page.dialog.open);
  assert.equal(page.focused(), page.trigger);
});

test('Wechsel zu reduzierter Bewegung beendet die laufende Animation vollständig', () => {
  const page = setup();
  page.trigger.emit('click');
  page.motion.matches = true;
  page.motion.emit('change');
  assert(!page.dialog.open);
  assert(page.animations.every(animation => animation.cancelled));
  assert(!page.html.classes.has('is-creative-paused'));
});

test('Resize durch Dialog und Scrollsperre beendet die gerade gestartete Pause nicht', async () => {
  const page = setup({ scrollbarResizeOnOpen: true });
  page.trigger.emit('click');
  assert(page.dialog.open, 'Der Dialog muss nach dem durch Scrollsperre ausgelösten Resize offen bleiben');
  assert(page.html.classes.has('is-creative-paused'));
  assert.deepEqual(page.signals, [true]);
  assert(page.scene.children.length > 3);
  page.resume.emit('click');
  await page.finish();
  assert(!page.dialog.open);
  assert(!page.html.classes.has('is-creative-paused'));
});

test('Resize ohne geänderte Fensterabmessungen und scrollbarbedingter VisualViewport-Resize bleiben folgenlos', async () => {
  const page = setup();
  page.trigger.emit('click');
  page.window.emit('resize');
  assert(page.dialog.open, 'Ein Resize-Ereignis allein ist kein Grund zum Schliessen');
  page.html.clientWidth = page.window.innerWidth;
  page.window.visualViewport.width = page.window.innerWidth;
  page.window.visualViewport.emit('resize');
  assert(page.dialog.open, 'Die verschwundene Scrollbar verändert das Fenster nicht');
  assert.deepEqual(page.signals, [true]);
  page.resume.emit('click');
  await page.finish();
  assert(!page.dialog.open);
});

test('Echte Änderungen der Fensterbreite oder Fensterhöhe beenden die Pause weiterhin', () => {
  for (const [dimension, target] of [['innerWidth', 'window'], ['innerHeight', 'visualViewport']]) {
    const page = setup();
    page.trigger.emit('click');
    page.window[dimension] += 100;
    (target === 'window' ? page.window : page.window.visualViewport).emit('resize');
    assert(!page.dialog.open, `Geänderte ${dimension} muss den Dialog schliessen`);
    assert(!page.html.classes.has('is-creative-paused'));
    assert.equal(page.scene.children.length, 0);
  }
});

test('Fehler in der Momentaufnahme lassen eine ruhige und normal schliessbare Pause offen', async () => {
  const page = setup({ snapshotError: true });
  page.trigger.emit('click');
  assert(page.dialog.open, 'Ein optionaler Snapshot darf den Button nicht wirkungslos machen');
  assert(page.html.classes.has('is-creative-paused'));
  assert.equal(page.scene.children.length, 0, 'Unvollständige Kopien dürfen nicht über dem Pausentext liegen');
  assert.equal(page.focused(), page.resume);
  assert.deepEqual(page.signals, [true]);
  page.resume.emit('click');
  await page.finish();
  assert(!page.dialog.open);
  assert.equal(page.focused(), page.trigger);
  assert.deepEqual(page.signals, [true, false]);
});

test('Fehler nach Beginn der Animation räumen Kopien auf und erhalten die ruhige Pause', async () => {
  const page = setup({ animationErrorAt: 2 });
  page.trigger.emit('click');
  assert(page.dialog.open, 'Fehlende Animation darf den geöffneten Dialog nicht wieder schliessen');
  assert(page.html.classes.has('is-creative-paused'));
  assert.equal(page.scene.children.length, 0);
  assert(page.animations.every(animation => animation.cancelled));
  assert.equal(page.focused(), page.resume);
  let prevented = false;
  page.dialog.emit('cancel', { preventDefault() { prevented = true; } });
  await page.finish();
  assert(prevented);
  assert(!page.dialog.open);
  assert.equal(page.focused(), page.trigger);
});

test('Animationsfehler erst beim Wiederaufbau gibt die Originalseite frei und erlaubt eine neue Pause', async () => {
  const page = setup();
  const original = page.root.children[0];
  page.trigger.emit('click');
  await page.finish();
  assert(page.dialog.open);
  page.failNextAnimation();
  page.resume.emit('click');
  await page.finish();
  assert(!page.dialog.open, 'Auch bei einem Fehler im Wiederaufbau muss der Dialog schliessen');
  assert(!page.html.classes.has('is-creative-paused'), 'Die Originalseite muss wieder sichtbar und scrollbar sein');
  assert.equal(page.scene.children.length, 0);
  assert.equal(page.root.children[0], original);
  assert.equal(page.field.value, 'Meine Idee bleibt erhalten.');
  assert.equal(page.focused(), page.trigger);
  assert(!page.video.paused);
  assert.deepEqual(page.signals, [true, false]);
  page.trigger.emit('click');
  assert(page.dialog.open, 'Ein fehlgeschlagener Wiederaufbau darf die nächste Pause nicht blockieren');
  page.resume.emit('click');
  await page.finish();
  assert(!page.dialog.open);
  assert(!page.html.classes.has('is-creative-paused'));
  assert.equal(page.focused(), page.trigger);
  assert.deepEqual(page.signals, [true, false, true, false]);
});

const extraPieces = page => page.scene.children.filter(element => element.className.split(/\s+/).includes('creative-pause-extra'));
const imageURL = source => source?.currentSrc || source?.src;
const extraURLs = page => extraPieces(page).map(element => imageURL(element.children[0].drawnSource));
const mediaSet = (team = 5, project = 12) => [
  ...Array.from({ length: team }, (_, i) => ({ url: `assets/team-${i}.png`, team: true })),
  ...Array.from({ length: project }, (_, i) => ({ url: `assets/project-${i}.jpg` })),
];

test('Desktop ergänzt höchstens neun Bilder mit drei Teamfotos und verteilter Projektauswahl', () => {
  const page = setup({ extraImages: mediaSet() });
  page.trigger.emit('click');
  const urls = extraURLs(page);
  assert.equal(urls.length, 9);
  assert.equal(urls.filter(url => url.includes('/team-')).length, 3);
  assert.equal(urls.filter(url => url.includes('/project-')).length, 6);
  assert(urls.includes('assets/team-0.png') && urls.includes('assets/team-4.png'), 'Die Teamauswahl soll sich über die vorhandenen Personen verteilen');
  assert(urls.includes('assets/project-0.jpg') && urls.includes('assets/project-11.jpg'), 'Projektbilder aus mehreren Seitenbereichen berücksichtigen');
  assert(urls[0].includes('/team-') && urls[1].includes('/project-'), 'Team und Projekte sollen abwechselnd nachfallen');
  page.window.emit('pagehide');
});

test('Mobile ergänzt höchstens vier Bilder und begrenzt die Teamfotos auf zwei', () => {
  const page = setup({ width: 390, extraImages: mediaSet() });
  page.trigger.emit('click');
  const urls = extraURLs(page);
  assert.equal(urls.length, 4);
  assert.equal(urls.filter(url => url.includes('/team-')).length, 2);
  assert.equal(urls.filter(url => url.includes('/project-')).length, 2);
  assert(urls.includes('assets/team-0.png') && urls.includes('assets/team-4.png'));
  assert(urls.includes('assets/project-0.jpg') && urls.includes('assets/project-11.jpg'));
  page.window.emit('pagehide');
});

test('Extras überspringen Duplikate, sichtbare, ungeladene, kaputte und ausgeblendete Bilder ohne Nachladen', () => {
  const page = setup({ extraImages: [
    { url: 'assets/LogoNavbar.svg' },
    { url: 'assets/unique.jpg' },
    { url: 'assets/unique.jpg' },
    { url: 'assets/lazy.jpg', complete: false },
    { url: 'assets/broken-width.jpg', naturalWidth: 0 },
    { url: 'assets/broken-height.jpg', naturalHeight: 0 },
    { url: 'assets/visible.jpg', rect: { top: 100 } },
    { url: 'assets/zero-width.jpg', rect: { width: 0 } },
    { url: 'assets/zero-height.jpg', rect: { height: 0 } },
    { url: 'assets/hidden.jpg', styles: { visibility: 'hidden' } },
    { url: 'assets/display-none.jpg', styles: { display: 'none' } },
    { url: 'assets/transparent.jpg', styles: { opacity: '0' } },
    { url: '', currentSrc: '' },
    { url: 'assets/src-fallback.jpg', currentSrc: '' },
  ] });
  page.trigger.emit('click');
  assert.deepEqual(new Set(extraURLs(page)), new Set(['assets/unique.jpg', 'assets/src-fallback.jpg']));
  const copied = [...page.createdImages.map(imageURL), ...page.createdCanvases.map(canvas => imageURL(canvas.drawnSource))];
  for (const url of ['assets/lazy.jpg', 'assets/broken-width.jpg', 'assets/broken-height.jpg', 'assets/visible.jpg', 'assets/zero-width.jpg', 'assets/zero-height.jpg', 'assets/hidden.jpg', 'assets/display-none.jpg', 'assets/transparent.jpg']) {
    assert(!copied.includes(url), `Ausgeschlossene Quelle darf keine neue Bildkopie auslösen: ${url}`);
  }
  page.window.emit('pagehide');
});

test('Zusätzliche Bilder starten oberhalb des Bildschirms, fallen gestaffelt und kehren beim Wiederaufbau nach oben zurück', async () => {
  const page = setup({ extraImages: mediaSet(3, 4) });
  page.trigger.emit('click');
  const extras = extraPieces(page);
  assert.equal(extras.length, 7);
  const delays = [];
  for (const extra of extras) {
    assert(extra.className.split(/\s+/).includes('creative-pause-piece'));
    assert(Number.parseFloat(extra.style.top) + Number.parseFloat(extra.style.height) <= 0, 'Das gesamte Extrabild muss vor dem Fallen oberhalb des Bildschirms liegen');
    const animation = page.animations.find(item => item.element === extra);
    assert(animation, 'Jede Extrakopie erhält eine Fallanimation');
    assert(animation.options.delay >= 300);
    delays.push(animation.options.delay);
  }
  assert.equal(new Set(delays).size, extras.length, 'Die Bilder sollen zeitversetzt nachfallen');
  await page.finish();
  page.resume.emit('click');
  for (const extra of extras) {
    const returning = page.animations.filter(item => item.element === extra).at(-1);
    assert.equal(returning.frames.at(-1).transform, 'none', 'Der Wiederaufbau führt zur Position über dem Bildschirm zurück');
  }
  await page.finish();
  assert(!page.dialog.open);
  assert.equal(extraPieces(page).length, 0);
  assert.equal(page.focused(), page.trigger);
});

test('Reduzierte Bewegung erzeugt auch bei vorhandenen Medien keine zusätzlichen Bildkopien', () => {
  const page = setup({ reduced: true, extraImages: mediaSet() });
  page.trigger.emit('click');
  assert(page.dialog.open);
  assert.equal(extraPieces(page).length, 0);
  assert.equal(page.createdImages.length, 0);
  assert.equal(page.createdCanvases.length, 0);
  assert.equal(page.animations.length, 0);
  page.resume.emit('click');
  assert(!page.dialog.open);
});

test('Extrabild-Kopien verwenden kleine Canvas-Flächen und lösen keine zusätzlichen Bildabrufe aus', () => {
  const page = setup({ extraImages: mediaSet(3, 4), pixelRatio: 3 });
  page.trigger.emit('click');
  const extras = extraPieces(page);
  assert.equal(extras.length, 7);
  assert.equal(page.createdImages.length, 1, 'Nur das bereits sichtbare Logo wird als img kopiert');
  for (const extra of extras) {
    const canvas = extra.children[0];
    assert.equal(canvas.tagName, 'CANVAS');
    assert(page.sources.includes(canvas.drawnSource), 'Canvas muss aus einem bereits vorhandenen Quellelement zeichnen');
    assert(canvas.width <= Math.ceil(Number.parseFloat(extra.style.width) * 1.5));
    assert(canvas.height <= Math.ceil(Number.parseFloat(extra.style.height) * 1.5));
    assert.deepEqual(canvas.drawnDimensions, [0, 0, canvas.width, canvas.height]);
  }
  page.window.emit('pagehide');
});

test('Fehlender Canvas-Kontext oder nicht zeichnbare Bilder überspringen Extras und erhalten die normale Pause', async () => {
  for (const fault of [{ canvasContext: false }, { canvasDrawError: true }]) {
    const page = setup({ extraImages: mediaSet(3, 4), ...fault });
    page.trigger.emit('click');
    assert(page.dialog.open);
    assert.equal(extraPieces(page).length, 0, 'Eine nicht zeichnbare Quelle darf keine leere Extrakarte erzeugen');
    assert(page.animations.length > 0, 'Die normalen sichtbaren Elemente sollen weiter animieren');
    page.resume.emit('click');
    await page.finish();
    assert(!page.dialog.open);
    assert(!page.html.classes.has('is-creative-paused'));
  }
});
