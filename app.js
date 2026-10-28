// Projektübersicht, Projektseiten und native Seitenübergänge.
(() => {
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
  renderProjects();
  renderCase();
  setupProjectTransitions();
})();
