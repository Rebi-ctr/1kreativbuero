// Der Versand wird erst mit einer konfigurierten Formular-Adresse aktiviert.
(() => {
  const form = document.querySelector('#kontaktformular');
  if (!form) return;
  const button = form.querySelector('[type="submit"]');
  const status = document.querySelector('#form-status');
  const config = studio.contactForm;
  let configured = !!config?.endpoint && !config.native;
  let token = "";
  let sending = false;

  button.disabled = !configured;
  if (configured) status.textContent = '';
  if (config?.native && config.endpoint) {
    fetch(config.endpoint, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(async response => {
        const result = await response.json();
        if (!response.ok || !result.success || !result.token) return;
        token = result.token;
        configured = true;
        button.disabled = false;
        status.textContent = '';
      })
      .catch(() => {}); // Eine statische Vorschau kann kein PHP ausführen.
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!configured || sending || !form.reportValidity()) return;
    sending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.dataset.state = 'sending';
    status.textContent = 'Deine Nachricht wird gesendet …';
    const data = new FormData(form);
    if (token) data.set('_token', token);
    for (const [name, value] of Object.entries(config.fields || {})) data.set(name, value);

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST', body: data, credentials: 'same-origin', headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (!response.ok || result.success === false || result.errors) throw new Error('Form submission failed');
      status.dataset.state = 'success';
      status.textContent = 'Danke für deine Nachricht! Wir melden uns bei dir.';
      form.reset();
    } catch {
      status.dataset.state = 'error';
      status.textContent = 'Deine Nachricht konnte nicht gesendet werden. Bitte versuche es nochmals oder schreib uns direkt per E-Mail. Deine Eingaben bleiben erhalten.';
    } finally {
      sending = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
