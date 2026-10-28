const $ = (selector, parent = document) => parent.querySelector(selector);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const projectURL = (project) => `projekt.html?projekt=${encodeURIComponent(project.slug)}`;
const twoDigits = (value) => String(value).padStart(2, '0');
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
  const intro = $('#studio-intro');
  if (!intro) return;
  intro.textContent = studio.intro;
  $('#people-grid').innerHTML = people.map((person, index) => `<article class="person-card">
    <div class="person-visual">
      <img src="${person.image}" class="${person.imageClass}" alt="Referenzporträt für den vorläufigen Personenplatz ${person.number}; kein Mitglied von 1Kreativbüro." loading="lazy" width="${index === 1 ? 354 : 1080}" height="${index === 1 ? 500 : 1440}">
      <span class="person-no meta">[ ${person.number} ]</span>
      ${index === 1 ? '<div class="person-grid-tiles" aria-hidden="true"></div>' : '<div class="focus-frame" aria-hidden="true"></div>'}
      <span class="person-strength">${escapeHTML(person.strengths[0])}</span>
      <span class="image-note meta">Referenzporträt</span>
    </div>
    <div class="person-title"><h4>${escapeHTML(person.name)}</h4><span class="draft-tag">Platzhalter</span></div>
    <p class="person-role">${escapeHTML(person.role)} / Vorschlag</p>
    <details><summary>Perspektive kennenlernen</summary><p class="person-description">${escapeHTML(person.description)}</p><div class="strength-tags">${person.strengths.map((strength) => `<span>${escapeHTML(strength)}</span>`).join('')}</div></details>
  </article>`).join('');

  const keywordHTML = studio.keywords.map((word) => `<span>${escapeHTML(word)}</span>`).join('');
  $('#keyword-track').innerHTML = `<div class="keyword-set">${keywordHTML}</div><div class="keyword-set" aria-hidden="true">${keywordHTML}</div>`;
  const toggle = $('#motion-toggle');
  let paused = false;
  toggle.addEventListener('click', () => {
    paused = !paused;
    $('#keyword-window').classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.innerHTML = paused ? 'Bewegung fortsetzen <span aria-hidden="true">▷</span>' : 'Bewegung pausieren <span aria-hidden="true">Ⅱ</span>';
  });

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

function renderProjects() {
  const list = $('#project-list');
  if (!list) return;
  const categories = ['Alle', ...new Set(projects.map((project) => project.category))];
  const filters = $('#project-filters');
  filters.innerHTML = categories.map((category, index) => `<button type="button" class="filter-button" aria-pressed="${index === 0}" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join('');
  const render = (category) => {
    const visibleProjects = projects.filter((project) => category === 'Alle' || project.category === category);
    list.innerHTML = visibleProjects.map((project) => `<a class="project-row" data-project="${project.slug}" href="${projectURL(project)}" aria-label="${escapeHTML(project.title)} — ${escapeHTML(project.category)}, Layoutstudie ansehen">
      <div><h3 class="project-row-title">${escapeHTML(project.title)}</h3><span class="project-row-label">LAYOUTSTUDIE / ${project.number}</span></div>
      <div class="project-row-image"><img src="${project.image}" alt="${escapeHTML(project.alt)}" loading="lazy" width="1600" height="1100"></div>
      <div class="project-row-type"><span class="meta">${escapeHTML(project.category)}</span><span class="project-row-arrow" aria-hidden="true">↗</span></div>
      <span class="project-row-number" aria-hidden="true">[ ${project.number} ]</span>
    </a>`).join('');
    $('#project-result-count').textContent = `(${twoDigits(visibleProjects.length)})`;
  };
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    render(button.dataset.category);
  });
  render('Alle');
}

function renderCase() {
  const container = $('#case-content');
  if (!container) return;
  const slug = new URLSearchParams(window.location.search).get('projekt');
  if (slug === featuredProject.slug) {
    const [cover, ...gallery] = featuredProject.views;
    document.title = `${featuredProject.title} — 1Kreativbüro`;
    $('.preview-badge .badge-detail').textContent = '/ Projektvorschau';
    container.innerHTML = `
      <section class="case-intro" aria-labelledby="case-title">
        <div class="case-breadcrumb meta"><a href="index.html#highlight">← Zurück zum Projekt</a><span>WIRIEHORN</span></div>
        <h1 class="case-title" id="case-title">${escapeHTML(featuredProject.title)}</h1>
        <div class="case-meta"><p>${escapeHTML(featuredProject.lead)}</p></div>
      </section>
      <figure class="case-hero"><img data-case-cover="${featuredProject.slug}" src="${cover.image}" alt="${escapeHTML(cover.alt)}" width="${cover.width}" height="${cover.height}" fetchpriority="high"></figure>
      <div class="case-gallery case-gallery-featured">${gallery.map((view) => `<figure><img src="${view.image}" alt="${escapeHTML(view.alt)}" width="${view.width}" height="${view.height}" loading="lazy"><figcaption class="meta">${escapeHTML(view.season)}</figcaption></figure>`).join('')}</div>`;
    return;
  }
  const project = projects.find((item) => item.slug === slug);
  if (!project) {
    document.title = 'Projekt nicht gefunden — 1Kreativbüro';
    container.innerHTML = '<section class="case-not-found"><span class="meta">404 / PROJEKT</span><h1>Hier ist noch<br>Raum für Ideen.</h1><p>Dieses Projekt gibt es im Entwurf noch nicht.</p><a class="text-link" href="index.html#projekte">Zur Projektübersicht <span>↗</span></a></section>';
    return;
  }
  const index = projects.indexOf(project);
  const nextProject = projects[(index + 1) % projects.length];
  const stages = project.stages || projects[0].stages;
  const captions = ['01 / Erste Richtung · Bildplatzhalter', '02 / Entwicklung · Bildplatzhalter', '03 / Anwendung · Bildplatzhalter'];
  document.title = `${project.title} — 1Kreativbüro`;
  container.innerHTML = `
    <section class="case-intro" aria-labelledby="case-title">
      <div class="case-breadcrumb meta"><a href="index.html#projekte">← Projektübersicht</a><span>LAYOUTSTUDIE ${project.number} / ${twoDigits(projects.length)}</span></div>
      <h1 class="case-title" id="case-title">${escapeHTML(project.title)}</h1>
      <div class="case-meta"><p>${escapeHTML(project.lead)}</p><div class="case-tags"><span class="meta">DISZIPLIN<br>${escapeHTML(project.category)}</span><span class="meta">STATUS<br>Visuelle Studie</span><span class="meta">INHALTE<br>Platzhalter</span></div></div>
    </section>
    <figure class="case-hero"><img data-case-cover="${project.slug}" src="${project.image}" alt="${escapeHTML(project.alt)}" width="1600" height="1100" fetchpriority="high"></figure>
    <section class="case-description"><span class="meta">01 / DIE AUSGANGSLAGE<br><span class="muted">Inhaltsvorlage</span></span><div><h2>${escapeHTML(stages[0].title)}</h2><p>${escapeHTML(stages[0].text)}</p><p class="content-note">Diese Seite zeigt den Aufbau einer Projektgeschichte. Texte und Bilder werden durch eure echte Arbeit ersetzt.</p></div></section>
    <div class="case-stages">${[1, 2].map((stage) => `<section class="case-stage"><span class="meta">${twoDigits(stage + 1)} / ${stage === 1 ? 'DIE IDEE' : 'DIE ENTWICKLUNG'}</span><h2>${escapeHTML(stages[stage].title)}</h2><p>${escapeHTML(stages[stage].text)}</p></section>`).join('')}</div>
    <div class="case-gallery">${project.gallery.map((image, imageIndex) => `<figure><img src="${image}" alt="Visuelle Layoutstudie als Platzhalter für Projektbild ${imageIndex + 1}." width="1600" height="1100" loading="lazy"><figcaption class="meta">${captions[imageIndex]}</figcaption></figure>`).join('')}</div>
    <section class="case-outcome"><div><span class="meta">04 / DAS ERGEBNIS</span><h2>${escapeHTML(stages[3].title)}</h2></div><p>${escapeHTML(stages[3].text)}</p></section>
    <section class="case-next" aria-label="Nächstes Projekt"><a data-project="${nextProject.slug}" href="${projectURL(nextProject)}"><div><span class="meta">DER NÄCHSTE GEDANKE / ${nextProject.number}</span><h2>${escapeHTML(nextProject.title)}</h2><span class="text-link">Layoutstudie ansehen <span aria-hidden="true">↗</span></span></div><img src="${nextProject.image}" alt="${escapeHTML(nextProject.alt)}" loading="lazy" width="1600" height="1100"></a></section>`;
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
renderProjects();
renderCase();
setupProjectTransitions();
