// Gemeinsame Hilfsfunktionen. Vor den Seiten-Scripts laden.
const $ = (selector, parent = document) => parent.querySelector(selector);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const projectURL = (project) => siteNavigation.project(project.slug);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Dieselbe Zuordnung für Projektinhalt und native Bildübergänge verwenden.
// Alte Projektlinks bleiben auch ohne die Server-Weiterleitung lesbar.
function projectSlugFromURL(url = window.location) {
  const match = url.pathname.match(/\/projekte\/([a-z0-9-]+)\/?$/);
  if (match) return match[1];
  return /\/projekt\.html$/.test(url.pathname) ? new URLSearchParams(url.search).get('projekt') : null;
}


// Die gemeinsame Kontur wird nur auf den tatsächlichen Kartenflächen gezeichnet.
// Der Mittelpunkt kommt aus dem DOM, die gedrehten Ecken aus den CSS-Matrizen.
function transformedCardPolygon(width, height, centreX, centreY, matrix) {
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
    const dx = x * width / 2, dy = y * height / 2;
    return [centreX + matrix.a * dx + matrix.c * dy, centreY + matrix.b * dx + matrix.d * dy];
  });
}

function setupLayeredTitle(deck, cards, {
  sheetSelector = '.person-sheet',
  outlineSelector = '.creative-title-outline',
  clipSelector = '.creative-clip polygon',
  clipId = 'creative-card-clip',
} = {}) {
  const outline = $(outlineSelector, deck);
  if (!outline || !window.DOMMatrixReadOnly) return () => {};
  const polygons = Array.from(deck.querySelectorAll(clipSelector));
  const matrixOf = (element) => {
    const transform = getComputedStyle(element).transform;
    return transform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(transform);
  };
  let frame = 0, until = 0;
  function update(time) {
    frame = 0;
    if (document.hidden) return;
    const origin = deck.getBoundingClientRect();
    const shapes = cards.map((card) => {
      const sheet = $(sheetSelector, card);
      const bounds = sheet.getBoundingClientRect();
      const matrix = matrixOf(card).multiply(matrixOf(sheet));
      const style = getComputedStyle(sheet);
      return transformedCardPolygon(parseFloat(style.width) || sheet.offsetWidth, parseFloat(style.height) || sheet.offsetHeight, bounds.left + bounds.width / 2 - origin.left, bounds.top + bounds.height / 2 - origin.top, matrix);
    });
    shapes.forEach((points, index) => polygons[index].setAttribute('points', points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')));
    outline.style.clipPath = `url("#${clipId}")`;
    if (time < until) frame = requestAnimationFrame(update);
  }
  function refresh(animate = true) {
    until = performance.now() + (animate && !reducedMotion.matches ? 500 : 0);
    if (!frame && !document.hidden) frame = requestAnimationFrame(update);
  }
  window.addEventListener('resize', () => refresh(false), { passive: true });
  window.addEventListener('pageshow', () => refresh(false));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else refresh(false);
  });
  reducedMotion.addEventListener('change', () => refresh(false));
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => refresh(false));
    observer.observe(deck);
    cards.forEach((card) => observer.observe($(sheetSelector, card)));
  }
  refresh(false);
  return refresh;
}


// Zwischenbilder verwenden ausschliesslich Symbole oder die vorgesehenen Zielbuchstaben.
// So entstehen auch beim Anhalten und Zurückscrollen keine zufälligen Wörter.
function studioGlyph(word, index, progress, seed = 0) {
  const settleAt = .55 + index / Math.max(1, word.length - 1) * .4;
  if (progress >= settleAt || !/\p{L}/u.test(word[index])) {
    return { character: word[index] };
  }
  const symbols = '+×○□△◇*';
  const step = Math.floor(progress * 32);
  const noise = Math.abs(Math.sin((step + 1) * 12.9898 + (index + seed) * 78.233));
  return { character: symbols[Math.floor(noise * symbols.length) % symbols.length] };
}

// Ganze, freigegebene Begriffe verhindern problematische Buchstabenkombinationen im Hover.
function studioHoverText(original, progress) {
  if (original !== 'DAS BÜRO.') return original;
  if (progress >= .95) return 'DAS KREATIV.';
  // Zwei Zwischenbegriffe statt vieler schneller Wechsel.
  if (progress < .3) return original;
  if (progress < .6) return 'DAS TEAM.';
  return 'DAS WERK.';
}
