const $ = (selector, parent = document) => parent.querySelector(selector);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const projectURL = (project) => `projekt.html?projekt=${encodeURIComponent(project.slug)}`;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function renderFeature() {
  const stage = $('#feature-stage');
  if (!stage) return;
  stage.innerHTML = `${featuredProject.views.map((view, index) => `<button class="feature-card${index === 0 ? ' is-active' : ''}" type="button" aria-label="${escapeHTML(view.season)}bild in den Vordergrund holen" aria-pressed="${index === 0}">
      <span class="feature-sheet"><img src="${view.image}" alt="${escapeHTML(view.alt)}" width="${view.width}" height="${view.height}" loading="lazy"></span>
    </button>`).join('')}
    <h3 class="feature-title">${escapeHTML(featuredProject.title)}</h3>
    <a class="feature-open" data-project="${featuredProject.slug}" href="${projectURL(featuredProject)}" aria-label="Ab ins Projektbüro: Wiriehorn-Projekt im Detail">Ab ins Projektbüro <span aria-hidden="true">↗</span></a>`;

  const cards = stage.querySelectorAll('.feature-card');
  const hoverAvailable = window.matchMedia('(hover: hover) and (pointer: fine)');
  const selectCard = (selected) => {
    if (!selected || selected.classList.contains('is-active')) return;
    cards.forEach((card) => {
      const active = card === selected;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-pressed', String(active));
    });
  };
  cards.forEach((card) => {
    // Die Trefferflächen bleiben fest; nur das innere Bild bewegt sich.
    card.addEventListener('pointerenter', (event) => {
      if (hoverAvailable.matches && event.pointerType !== 'touch') selectCard(card);
    });
    card.addEventListener('focus', () => selectCard(card));
  });
  stage.addEventListener('click', (event) => selectCard(event.target.closest('.feature-card')));
}

function renderStudio() {
  const deck = $('#people-grid');
  if (!deck) return;
  const switches = $('#people-switches');
  const panel = $('#person-panel');
  const initial = Math.min(1, people.length - 1);
  const title = $('#creative-title', deck)?.textContent || 'Das Kreative.';
  deck.innerHTML = `<h3 class="creative-title creative-title-fill" id="creative-title"><span>${escapeHTML(title)}</span></h3>` + people.map((person, index) => `<article class="person-card${index === initial ? ' is-active' : ''}" data-person="${index}" aria-labelledby="person-name-${index}">
    <div class="person-sheet"><div class="person-visual">
      <img src="${person.image}" class="${person.imageClass}" alt="Referenzporträt für den vorläufigen Personenplatz ${person.number}; kein Mitglied von 1Kreativbüro." loading="lazy" width="${index === 1 ? 354 : 1080}" height="${index === 1 ? 500 : 1440}">
      <span class="person-no meta">[ ${person.number} ]</span>
      ${index === 1 ? '<div class="person-grid-tiles" aria-hidden="true"></div>' : '<div class="focus-frame" aria-hidden="true"></div>'}
      <span class="person-strength">${escapeHTML(person.strengths[0])}</span>
      <span class="image-note meta">Referenzporträt</span>
    </div>
    <div class="person-info"><div class="person-title"><h4 id="person-name-${index}">${escapeHTML(person.name)}</h4><span class="draft-tag">Platzhalter</span></div>
    <p class="person-role">${escapeHTML(person.role)} / Vorschlag</p></div></div>
    <button class="person-select" type="button" data-person="${index}" aria-label="Perspektive von ${escapeHTML(person.name)} anzeigen" aria-controls="person-panel" aria-pressed="${index === initial}"></button>
  </article>`).join('') + `<svg class="creative-clip" aria-hidden="true" focusable="false"><defs><clipPath id="creative-card-clip" clipPathUnits="userSpaceOnUse">${people.map(() => '<polygon></polygon>').join('')}</clipPath></defs></svg><div class="creative-title creative-title-outline" aria-hidden="true"><span>${escapeHTML(title)}</span></div>`;
  switches.innerHTML = people.map((person, index) => `<button class="people-switch meta" type="button" data-person="${index}" aria-controls="person-panel" aria-pressed="${index === initial}"><span>${person.number}</span> ${escapeHTML(person.name)}</button>`).join('');
  const cards = Array.from(deck.querySelectorAll('.person-card'));
  const controls = [...deck.querySelectorAll('.person-select'), ...switches.querySelectorAll('button')];
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const refreshTitle = setupCreativeTitle(deck, cards);
  let current = -1;
  const selectPerson = (index) => {
    if (index === current || !people[index]) return;
    current = index;
    cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
    controls.forEach((control) => control.setAttribute('aria-pressed', String(Number(control.dataset.person) === index)));
    const person = people[index];
    panel.innerHTML = `<div><span class="meta muted">${person.number} / PERSPEKTIVE</span><h4>${escapeHTML(person.name)}</h4><p class="person-panel-role">${escapeHTML(person.role)} / Vorschlag</p></div><div><p class="person-description">${escapeHTML(person.description)}</p><div class="strength-tags">${person.strengths.map((strength) => `<span>${escapeHTML(strength)}</span>`).join('')}</div></div>`;
    refreshTitle();
  };
  cards.forEach((card, index) => {
    card.addEventListener('pointerenter', (event) => {
      if (hover.matches && event.pointerType !== 'touch') selectPerson(index);
    });
    card.addEventListener('focusin', () => selectPerson(index));
  });
  controls.forEach((control) => control.addEventListener('click', () => selectPerson(Number(control.dataset.person))));
  selectPerson(initial);

  // Ein funktionierender Kontaktlink erscheint, sobald eine echte Adresse vorliegt.
  if (studio.email) {
    const container = $('#contact-action');
    const link = document.createElement('a');
    link.className = 'contact-placeholder';
    link.href = `mailto:${studio.email}`;
    link.textContent = `${studio.email} ↗`;
    container.replaceChildren(link);
  }
}

// Die gemeinsame Kontur wird nur auf den tatsächlichen Kartenflächen gezeichnet.
// Der Mittelpunkt kommt aus dem DOM, die gedrehten Ecken aus den CSS-Matrizen.
function creativeCardPolygon(width, height, centreX, centreY, matrix) {
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
    const dx = x * width / 2, dy = y * height / 2;
    return [centreX + matrix.a * dx + matrix.c * dy, centreY + matrix.b * dx + matrix.d * dy];
  });
}

function setupCreativeTitle(deck, cards) {
  const outline = $('.creative-title-outline', deck);
  if (!outline || !window.DOMMatrixReadOnly) return () => {};
  const polygons = Array.from(deck.querySelectorAll('.creative-clip polygon'));
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
      const sheet = $('.person-sheet', card);
      const bounds = sheet.getBoundingClientRect();
      const matrix = matrixOf(card).multiply(matrixOf(sheet));
      const style = getComputedStyle(sheet);
      return creativeCardPolygon(parseFloat(style.width) || sheet.offsetWidth, parseFloat(style.height) || sheet.offsetHeight, bounds.left + bounds.width / 2 - origin.left, bounds.top + bounds.height / 2 - origin.top, matrix);
    });
    shapes.forEach((points, index) => polygons[index].setAttribute('points', points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')));
    outline.style.clipPath = 'url("#creative-card-clip")';
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
    cards.forEach((card) => observer.observe($('.person-sheet', card)));
  }
  refresh(false);
  return refresh;
}

function setupStudioTitle() {
  const label = $('#studio-title-label');
  if (!label) return;
  const visual = $('span', label);
  const original = label.getAttribute('aria-label');
  visual.innerHTML = Array.from(original, (letter) => `<span class="studio-title-char">${escapeHTML(letter)}</span>`).join('');
  const letters = Array.from(visual.children);
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0, start = 0;
  function restore() {
    cancelAnimationFrame(frame);
    frame = 0;
    letters.forEach((letter, index) => { letter.textContent = original[index]; });
  }
  function measure() {
    restore();
    letters.forEach((letter) => { letter.style.width = ''; });
    const widths = letters.map((letter) => letter.getBoundingClientRect().width);
    letters.forEach((letter, index) => { letter.style.width = `${widths[index]}px`; });
  }
  function tick(time) {
    const progress = Math.min(1, (time - start) / 520);
    letters.forEach((letter, index) => {
      letter.textContent = /\p{L}/u.test(original[index]) ? studioGlyph(original, index, progress, 31).character : original[index];
    });
    if (progress < 1) frame = requestAnimationFrame(tick);
    else frame = 0;
  }
  function play() {
    restore();
    if (reducedMotion.matches) return;
    start = performance.now();
    frame = requestAnimationFrame(tick);
  }
  label.addEventListener('pointerenter', (event) => { if (hover.matches && event.pointerType !== 'touch') play(); });
  label.addEventListener('pointerleave', restore);
  label.addEventListener('focus', play);
  label.addEventListener('blur', restore);
  label.addEventListener('click', play);
  window.addEventListener('resize', measure, { passive: true });
  reducedMotion.addEventListener('change', restore);
  document.addEventListener('visibilitychange', () => { if (document.hidden) restore(); });
  measure();
}

// Deterministische Zufallszeichen: Beim Zurückscrollen läuft dieselbe Sequenz zurück.
function studioGlyph(word, index, progress, seed) {
  const settleAt = .55 + index / Math.max(1, word.length - 1) * .4;
  if (progress >= settleAt) return { character: word[index], x: 0, y: 0 };
  const step = Math.floor(progress * 32);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const noise = Math.abs(Math.sin((step + 1) * 12.9898 + (index + seed) * 78.233));
  const remaining = 1 - progress / settleAt;
  return {
    character: alphabet[Math.floor(noise * alphabet.length) % alphabet.length],
    x: Math.sin(step + index * 2.4) * 10 * remaining,
    y: Math.cos(step * .8 + index * 1.7) * 44 * remaining,
  };
}

function setupStudioStory() {
  const story = $('#studio-story');
  if (!story) return;
  const scene = $('#studio-scene');
  const grid = $('#studio-grid');
  const clamp = (value) => Math.max(0, Math.min(1, value));
  // Offener linker Rand; zusätzliche Zeilen führen das Raster bis in die Karten.
  grid.innerHTML = [
    ...Array.from({ length: 8 }, (_, i) => `<span class="studio-line is-vertical" style="--line-position:${(i + 1) * 12.5}%"></span>`),
    ...Array.from({ length: 18 }, (_, i) => `<span class="studio-line is-horizontal" style="--line-row:${i}"></span>`),
  ].join('');
  const lines = Array.from(grid.querySelectorAll('.studio-line'));
  const hotspots = Array.from(story.querySelectorAll('.studio-word')).map((element, index) => {
    const word = element.dataset.word;
    element.innerHTML = Array.from(word, (letter) => `<span class="studio-letter">${escapeHTML(letter)}</span>`).join('');
    return { element: element.parentElement, word, letters: Array.from(element.children), seed: index * 11 };
  });
  const deck = $('#people-grid');
  let frame = 0;
  let lastState = '';

  function paint(progress, wordProgress = hotspots.map(() => progress)) {
    const state = [progress, ...wordProgress].map((value) => value.toFixed(4)).join('|');
    if (state === lastState) return;
    lastState = state;
    lines.forEach((line, index) => {
      const delay = index < 8 ? .06 + index * .035 : (index - 8) * .025;
      line.style.setProperty('--line-progress', clamp((progress - delay) / .55).toFixed(4));
    });
    hotspots.forEach(({ element, word, letters, seed }, hotspotIndex) => {
      const local = wordProgress[hotspotIndex];
      element.style.setProperty('--hotspot-visibility', clamp(local / .15).toFixed(4));
      letters.forEach((letter, index) => {
        const state = studioGlyph(word, index, local, seed);
        letter.textContent = state.character;
        letter.style.setProperty('--letter-x', `${state.x.toFixed(2)}px`);
        letter.style.setProperty('--letter-y', `${state.y.toFixed(2)}px`);
      });
    });
  }

  function update() {
    frame = 0;
    if (reducedMotion.matches) { paint(1); return; }
    const bounds = story.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > innerHeight) return;
    // Der normale Eintritt in den Viewport steuert den Aufbau, ohne Scrollpause.
    const travel = Math.max(1, Math.min(bounds.height, innerHeight) * .9);
    const progress = clamp((innerHeight * .72 - bounds.top) / travel);
    // Jeder Hotspot rattert erst, wenn er selbst sichtbar ins Bild kommt.
    const wordProgress = hotspots.map(({ element }) => clamp((innerHeight * .9 - element.getBoundingClientRect().top) / Math.max(1, innerHeight * .4)));
    paint(progress, wordProgress);
  }
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(update);
  }
  function refresh() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastState = '';
    story.classList.toggle('is-enhanced', !reducedMotion.matches);
    if (deck) {
      const sceneBounds = scene.getBoundingClientRect();
      const deckBounds = deck.getBoundingClientRect();
      const end = deckBounds.top + Math.min(deckBounds.height * .7, 470);
      const overlap = Math.max(80, end - sceneBounds.bottom);
      grid.style.setProperty('--grid-overlap', `${overlap.toFixed(1)}px`);
      grid.style.setProperty('--grid-fade-start', `${Math.max(0, deckBounds.top - sceneBounds.top + deckBounds.height * .08).toFixed(1)}px`);
    }
    if (reducedMotion.matches) paint(1);
    else update();
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('pageshow', refresh);
  reducedMotion.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  refresh();
}

function projectVisual(project, hero = false) {
  if (!project.image) {
    return `<div class="project-placeholder" aria-hidden="true"><span class="project-placeholder-title">${escapeHTML(project.title)}.</span><span class="meta">Projektbilder folgen</span></div>`;
  }
  return `<img${hero ? ` data-case-cover="${escapeHTML(project.slug)}"` : ''} src="${escapeHTML(project.image)}" alt="${escapeHTML(project.alt)}" width="${project.width}" height="${project.height}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
}

function renderProjects() {
  const list = $('#project-list');
  if (!list) return;
  list.innerHTML = projects.map((project) => `<a class="project-row" data-project="${project.slug}" href="${projectURL(project)}" aria-label="${escapeHTML(project.title)}: Projekt entdecken">
    <div><h3 class="project-row-title">${escapeHTML(project.title)}</h3>${project.category ? `<span class="project-row-label">${escapeHTML(project.category)}</span>` : ''}</div>
    <div class="project-row-image">${projectVisual(project)}</div>
    <div class="project-row-type"><span class="meta">Projekt entdecken</span><span class="project-row-arrow" aria-hidden="true">↗</span></div>
    <span class="project-row-number" aria-hidden="true">[ ${project.number} ]</span>
  </a>`).join('');
}

function caseFigures(images) {
  return images.map((view) => `<figure><img src="${escapeHTML(view.image)}" alt="${escapeHTML(view.alt)}" width="${view.width}" height="${view.height}" loading="lazy" decoding="async">${view.caption ? `<figcaption class="meta">${escapeHTML(view.caption)}</figcaption>` : ''}</figure>`).join('');
}

function renderProjectStory(project) {
  if (project.film) {
    const { film, photoshoot } = project;
    return `<section class="case-section case-film" id="imagefilm" aria-labelledby="case-film-title">
      <header class="case-section-heading"><span class="meta">01 / IMAGEFILM</span><h2 id="case-film-title">${escapeHTML(film.title)}</h2><p>${escapeHTML(film.text)}</p></header>
      ${film.video ? `<video class="case-film-video" src="${escapeHTML(film.video)}" poster="${escapeHTML(project.image)}" controls playsinline preload="none">Dein Browser unterstützt dieses Video nicht. <a href="${escapeHTML(film.video)}">Imagefilm öffnen</a></video>` : ''}
      <div class="case-film-gallery" role="group" aria-label="Filmstills aus dem Rigi-Imagefilm">${caseFigures(film.frames)}</div>
    </section>
    <section class="case-section case-photoshoot" id="fotoshooting" aria-labelledby="case-photo-title">
      <header class="case-section-heading"><span class="meta">02 / FOTOSHOOTING</span><h2 id="case-photo-title">${escapeHTML(photoshoot.title)}</h2><p>${escapeHTML(photoshoot.text)}</p></header>
      ${photoshoot.images.length ? `<div class="case-film-gallery">${caseFigures(photoshoot.images)}</div>` : '<div class="case-photo-placeholder" aria-hidden="true"><span>Fotoshooting.</span><span class="meta">Bilder folgen</span></div>'}
    </section>`;
  }
  const gallery = project.views?.slice(1) || [];
  return gallery.length ? `<div class="case-gallery case-gallery-featured">${gallery.map((view) => `<figure><img src="${view.image}" alt="${escapeHTML(view.alt)}" width="${view.width}" height="${view.height}" loading="lazy"><figcaption class="meta">${escapeHTML(view.season)}</figcaption></figure>`).join('')}</div>` : `<section class="case-description" aria-labelledby="case-story-title"><span class="meta">PROJEKTEINBLICK</span><div><h2 id="case-story-title">Die Geschichte folgt.</h2><p>Hier zeigen wir bald Bilder und Einblicke in unser ${escapeHTML(project.title)}-Projekt.</p></div></section>`;
}

function renderCase() {
  const container = $('#case-content');
  if (!container) return;
  const slug = new URLSearchParams(window.location.search).get('projekt');
  if (slug === featuredProject.slug) {
    renderWiriehorn(container);
    return;
  }
  const project = projects.find((item) => item.slug === slug);
  if (!project) {
    document.title = 'Projekt nicht gefunden - 1Kreativbüro';
    container.innerHTML = '<section class="case-not-found"><span class="meta">404 / PROJEKT</span><h1>Hier ist noch<br>Raum für Ideen.</h1><p>Dieses Projekt gibt es im Entwurf noch nicht.</p><a class="text-link" href="index.html#projekte">Zur Projektübersicht <span>↗</span></a></section>';
    return;
  }
  const index = projects.indexOf(project);
  const nextProject = projects[(index + 1) % projects.length];
  document.title = `${project.title} - 1Kreativbüro`;
  container.innerHTML = `
    <article class="case-project${project.film ? ' case-project-film' : ''}" aria-labelledby="case-title">
    <section class="case-intro" aria-labelledby="case-title">
      <div class="case-breadcrumb meta"><a href="index.html#projekte">← Projektübersicht</a><span>${escapeHTML(project.title.toUpperCase())}</span></div>
      <h1 class="case-title" id="case-title">${escapeHTML(project.title)}</h1>
      <div class="case-meta"><p>${escapeHTML(project.lead)}</p>${project.film ? '<nav class="case-section-links meta" aria-label="Projektbereiche"><a href="#imagefilm">Imagefilm ↓</a><a href="#fotoshooting">Fotoshooting ↓</a></nav>' : ''}</div>
    </section>
    <figure class="case-hero${project.image ? '' : ' is-placeholder'}">${projectVisual(project, true)}${project.coverCaption ? `<figcaption class="case-hero-caption meta">${escapeHTML(project.coverCaption)}</figcaption>` : ''}</figure>
    ${renderProjectStory(project)}
    <section class="case-next" aria-label="Nächstes Projekt"><a data-project="${nextProject.slug}" href="${projectURL(nextProject)}"><div><span class="meta">NÄCHSTES PROJEKT</span><h2>${escapeHTML(nextProject.title)}</h2><span class="text-link">Ab ins Projektbüro <span aria-hidden="true">↗</span></span></div><div class="case-next-visual">${projectVisual(nextProject)}</div></a></section>
    </article>`;
}

// Native, progressive Bild-zu-Bild-Übergänge. Ohne API navigieren normale Links.
function setupProjectTransitions() {
  let activatedImage = null;
  const slugFromURL = (url) => url.searchParams.get('projekt');
  const resetNames = () => document.querySelectorAll('[style*="view-transition-name"]').forEach((element) => element.style.removeProperty('view-transition-name'));
  const coverForLink = (link) => link.querySelector('img') || link.closest('.feature-stage')?.querySelector('.feature-card.is-active img');
  const projectImage = (slug) => {
    const images = Array.from(document.querySelectorAll('a[data-project]')).filter((link) => link.dataset.project === slug).map(coverForLink).filter(Boolean);
    return images.find((image) => {
      const rect = image.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < innerHeight;
    }) || images.at(-1);
  };
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-project]');
    if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) activatedImage = coverForLink(link);
  });
  window.addEventListener('pageswap', (event) => {
    if (!event.viewTransition) return;
    event.viewTransition.ready.catch(() => {});
    event.viewTransition.finished.catch(() => {});
    if (reducedMotion.matches) { event.viewTransition.skipTransition(); return; }
    resetNames();
    const destination = event.activation?.entry?.url;
    if (!destination) return;
    const destinationURL = new URL(destination);
    const slug = slugFromURL(destinationURL);
    const image = slug ? (activatedImage || projectImage(slug)) : $('[data-case-cover]');
    if (image) image.style.viewTransitionName = 'project-cover';
  });
  window.addEventListener('pagereveal', (event) => {
    if (!event.viewTransition) return;
    event.viewTransition.ready.catch(() => {});
    event.viewTransition.finished.catch(() => {});
    if (reducedMotion.matches) { event.viewTransition.skipTransition(); return; }
    resetNames();
    const hero = $('[data-case-cover]');
    const from = window.navigation?.activation?.from?.url;
    const image = hero || (from ? projectImage(slugFromURL(new URL(from))) : null);
    if (image) {
      image.style.viewTransitionName = 'project-cover';
      event.viewTransition.finished.finally(() => image.style.removeProperty('view-transition-name')).catch(() => {});
    }
  });
  window.addEventListener('pageshow', (event) => { if (event.persisted) { resetNames(); activatedImage = null; } });
}

renderFeature();
renderStudio();
setupStudioStory();
setupStudioTitle();
renderProjects();
renderCase();
setupProjectTransitions();
