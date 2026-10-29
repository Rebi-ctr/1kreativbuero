// Direkte Dateien und einfache lokale Webserver behalten ihre Dateilinks.
// Das Hosting und die Node-Vorschau leiten diese bei Bedarf auf saubere URLs um.
const siteNavigation = (() => {
  const address = new URL(window.location.href);
  const local = address.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(address.hostname);
  const rootPath = address.pathname.replace(/projekte\/[a-z0-9-]+\/?$/, '');
  const root = new URL('.', new URL(rootPath, address));
  const home = (hash = '') => local ? `index.html${hash}` : `${root.pathname}${hash}`;
  const contact = (hash = '') => local ? `kontakt.html${hash}` : `${root.pathname}kontakt${hash}`;
  const project = slug => local ? `projekt.html?projekt=${encodeURIComponent(slug)}` : `${root.pathname}projekte/${encodeURIComponent(slug)}`;

  document.addEventListener('DOMContentLoaded', () => {
    for (const link of document.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      if (href === '/' || href.startsWith('/#')) link.setAttribute('href', home(href.slice(1)));
      else if (/^\/kontakt(?:#|$)/.test(href)) link.setAttribute('href', contact(href.slice('/kontakt'.length)));
      // Ein <base> für verschachtelte Projektpfade darf Kapitelanker nicht zur Startseite schicken.
      else if (href.startsWith('#')) link.setAttribute('href', new URL(href, address).href);
    }
  });

  return { home, contact, project };
})();
