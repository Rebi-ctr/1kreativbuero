const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

// Das echte Hintergrundskript ausführen und Arbeit pro Ereignis beobachten.
// WebGL selbst wird hier nicht gerendert; eine visuelle GPU-Prüfung bleibt separat.
function setup({ enabled = true, gpu = true } = {}) {
  let now = 0, nextFrame = 0;
  const frames = new Map(), canvases = [];
  const counts = { measures: 0, uploads: 0, draws: 0, paintedFlow: false };
  function element(color = 'rgb(240, 239, 233)', top = 0) {
    const events = new Map(), classes = new Set();
    return {
      color, classes,
      classList: { add(name) { classes.add(name); }, remove(name) { classes.delete(name); } },
      addEventListener(name, handler) { if (!events.has(name)) events.set(name, []); events.get(name).push(handler); },
      emit(name, event = {}) { for (const handler of events.get(name) || []) handler(event); },
      setAttribute() {},
      getBoundingClientRect() { counts.measures++; return { left: 0, top, bottom: top + 500, width: 1200, height: 500 }; },
    };
  }
  const surfaces = [element('rgb(240, 239, 233)', 0), element('rgb(36, 36, 36)', 500)];
  const body = element(), document = element(), window = element(), media = element();
  media.matches = enabled;
  document.body = body;
  document.hidden = false;
  document.documentElement = element();
  document.documentElement.clientWidth = 1200;
  document.querySelectorAll = () => surfaces;
  body.prepend = node => { node.attached = true; };
  const gl = new Proxy({
    getShaderParameter() { return true; }, getProgramParameter() { return true; },
    getAttribLocation() { return 0; },
    texImage2D() { counts.uploads++; },
    texSubImage2D(...args) {
      counts.uploads++;
      const data = args.at(-1);
      if (data instanceof Uint8Array) counts.paintedFlow ||= data.some((value, i) => i % 4 === 2 && value > 0);
    },
    drawArrays() { counts.draws++; },
  }, { get(target, name) {
    if (name in target) return target[name];
    return /^[A-Z0-9_]+$/.test(name) ? name : () => ({});
  } });
  document.createElement = () => {
    const canvas = element();
    canvas.remove = () => { canvas.attached = false; };
    canvas.getContext = kind => kind === 'webgl' ? (gpu ? gl : null) : { fillRect() {} };
    canvases.push(canvas);
    return canvas;
  };
  const context = vm.createContext({
    window, document, Float32Array, Uint8Array, innerWidth: 1200, innerHeight: 800, devicePixelRatio: 2,
    performance: { now: () => now }, console: { warn() {} },
    getComputedStyle: node => ({ backgroundColor: node.color, getPropertyValue() { return '#f0efe9'; } }),
    matchMedia: () => media,
    requestAnimationFrame(callback) { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    ResizeObserver: class { observe() {} disconnect() {} },
  });
  window.ResizeObserver = context.ResizeObserver;
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'background-motion.js'), 'utf8'), context);
  const move = (x, y = 480) => { now += 16; window.emit('pointermove', { pointerType: 'mouse', buttons: 0, clientX: x, clientY: y, timeStamp: now }); };
  const tick = (elapsed = 16) => {
    now += elapsed;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback(now));
  };
  return { window, document, body, media, surfaces, canvases, counts, frames, context, move, tick,
    advance(ms) { now += ms; },
    active: () => body.classes.has('has-fluid-background'),
  };
}

test('Kreative Pause stoppt den Wasserfarbenzug und gibt die nativen Flächen zurück', () => {
  const page = setup();
  page.move(100); page.move(140); page.tick();
  assert(page.active());
  page.window.emit('creativepausechange', { detail: { active: true } });
  assert(!page.active());
  assert.equal(page.frames.size, 0);
  assert(page.canvases.every(canvas => !canvas.attached));
  const draws = page.counts.draws;
  page.move(180); page.move(220); page.tick();
  assert.equal(page.counts.draws, draws);
  page.window.emit('creativepausechange', { detail: { active: false } });
  page.move(260); page.move(300); page.tick();
  assert(page.active());
});

test('Laden und Scrollen ohne Mausspur benötigen keine Hintergrundbilder oder Geometriemessungen', () => {
  const page = setup();
  for (let i = 0; i < 60; i++) { page.window.emit('scroll'); page.tick(); }
  assert.equal(page.counts.measures, 0);
  assert.equal(page.counts.uploads, 0);
  assert.equal(page.counts.draws, 0);
  assert.equal(page.frames.size, 0);
  assert(!page.active());
  assert(page.canvases[0].hidden);
});

test('Mausbewegung rendert weiterhin eine Spur; das Mausrad gibt sofort an CSS zurück', () => {
  const page = setup();
  page.move(100); page.move(140); page.tick();
  assert(page.active());
  assert(page.counts.paintedFlow, 'Die erste Mausspur darf bei der verzögerten Initialisierung nicht verloren gehen');
  assert.equal(page.counts.draws, 1);
  assert.equal(page.canvases[0].width, 1200);
  assert.equal(page.canvases[0].height, 800);
  const beforeScroll = { ...page.counts };
  page.window.emit('wheel');
  assert(!page.active());
  assert(page.surfaces.every(surface => !surface.classes.has('has-fluid-surface')));
  for (let i = 0; i < 20; i++) {
    page.window.emit('scroll'); page.move(160 + i * 10); page.tick();
  }
  assert.deepEqual(page.counts, beforeScroll);
  assert.equal(page.frames.size, 0);
  page.advance(180);
  page.move(400); page.move(440); page.tick();
  assert(page.active());
  assert.equal(page.counts.draws, beforeScroll.draws + 1);
});

test('Scrollen verwirft auch eine noch nicht gezeichnete Mausspur', () => {
  const page = setup();
  page.move(100); page.move(140);
  assert.equal(page.frames.size, 1);
  page.window.emit('scroll'); page.tick();
  assert.equal(page.frames.size, 0);
  assert.equal(page.counts.draws, 0);
  assert.equal(page.counts.uploads, 0);
  assert(!page.active());
});

test('Nach dem Ausklingen und bei Resize übernimmt wieder CSS ohne laufende Render-Schleife', () => {
  const page = setup();
  page.move(100); page.move(140); page.tick();
  let iterations = 0;
  while (page.frames.size && iterations++ < 100) page.tick();
  assert(iterations < 100);
  assert(!page.active());
  assert.equal(page.frames.size, 0);
  page.move(200); page.move(240); page.tick();
  assert(page.active());
  page.document.documentElement.clientWidth = 900;
  page.context.innerHeight = 600;
  page.window.emit('resize');
  assert(!page.active());
  page.move(300); page.move(340); page.tick();
  assert.equal(page.canvases[0].width, 900);
  assert.equal(page.canvases[0].height, 600);
  assert(page.active());
});

test('Touch, reduzierte Bewegung, fehlendes WebGL und unsichtbare Tabs behalten native Hintergründe', () => {
  for (const options of [{ enabled: false }, { gpu: false }]) {
    const page = setup(options);
    page.move(100); page.move(140); page.tick();
    assert(!page.active());
    assert.equal(page.counts.draws, 0);
  }
  const page = setup();
  page.move(100); page.move(140); page.tick();
  page.document.hidden = true;
  page.document.emit('visibilitychange');
  assert(!page.active());
  assert.equal(page.frames.size, 0);
  page.document.hidden = false;
  page.document.emit('visibilitychange');
  assert(!page.active());
  page.move(200); page.move(240); page.tick();
  assert(page.active());
  page.media.matches = false;
  page.media.emit('change');
  assert(!page.active());
  assert.equal(page.frames.size, 0);
});
