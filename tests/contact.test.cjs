const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function setup({ configured = true, valid = true, success = true } = {}) {
  const button = {}, status = { dataset: {} };
  let submit, resets = 0, requests = 0;
  const form = {
    querySelector() { return button; }, addEventListener(_, handler) { submit = handler; },
    reportValidity() { return valid; }, setAttribute() {}, removeAttribute() {}, reset() { resets++; },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'contact.js'), 'utf8'), {
    document: { querySelector(selector) { return selector === '#kontaktformular' ? form : status; } },
    studio: { contactForm: { endpoint: configured ? 'https://forms.example.test/contact' : '', fields: {} } },
    FormData: class { set() {} },
    async fetch() { requests++; return { ok: success, async json() { return { success }; } }; },
  });
  return { button, status, send: () => submit({ preventDefault() {} }), counts: () => ({ requests, resets }) };
}

test('Ohne Dienst wird kein Versand vorgetäuscht oder eine Anfrage ausgelöst', async () => {
  const page = setup({ configured: false });
  await page.send();
  assert(page.button.disabled);
  assert.deepEqual(page.counts(), { requests: 0, resets: 0 });
});

test('Ungültige Formularfelder verhindern den Versand', async () => {
  const page = setup({ valid: false });
  await page.send();
  assert.equal(page.counts().requests, 0);
});

test('Bestätigter Versand leert das Formular und meldet Erfolg', async () => {
  const page = setup();
  await page.send();
  assert.deepEqual(page.counts(), { requests: 1, resets: 1 });
  assert.equal(page.status.dataset.state, 'success');
  assert(!page.button.disabled);
});

test('Fehlgeschlagener Versand behält die Eingaben und erlaubt einen neuen Versuch', async () => {
  const page = setup({ success: false });
  await page.send();
  assert.deepEqual(page.counts(), { requests: 1, resets: 0 });
  assert.equal(page.status.dataset.state, 'error');
  assert(!page.button.disabled);
});

test('Eigener PHP-Endpunkt aktiviert den Versand erst nach einem gültigen Token', async () => {
  const button = {}, status = { dataset: {} }, fields = new Map();
  let submit;
  const requests = [];
  const form = {
    querySelector() { return button; }, addEventListener(_, handler) { submit = handler; },
    reportValidity() { return true; }, setAttribute() {}, removeAttribute() {}, reset() {},
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'contact.js'), 'utf8'), {
    document: { querySelector(selector) { return selector === '#kontaktformular' ? form : status; } },
    studio: { contactForm: { endpoint: 'api/contact.php', native: true } },
    FormData: class { set(key, value) { fields.set(key, value); } },
    async fetch(url, options) {
      requests.push({ url, options });
      return { ok: true, async json() { return options.method === 'POST' ? { success: true } : { success: true, token: 'test-token' }; } };
    },
  });
  assert(button.disabled);
  await new Promise(resolve => setImmediate(resolve));
  assert(!button.disabled);
  await submit({ preventDefault() {} });
  assert.equal(fields.get('_token'), 'test-token');
  assert.equal(requests[1].options.credentials, 'same-origin');
  assert.equal(status.dataset.state, 'success');
});

test('Nicht aktivierter PHP-Endpunkt lässt das Formular deaktiviert', async () => {
  const button = {}, status = { dataset: {} };
  const form = { querySelector() { return button; }, addEventListener() {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'contact.js'), 'utf8'), {
    document: { querySelector(selector) { return selector === '#kontaktformular' ? form : status; } },
    studio: { contactForm: { endpoint: 'api/contact.php', native: true } },
    async fetch() { return { ok: false, async json() { return { success: false }; } }; },
  });
  await new Promise(resolve => setImmediate(resolve));
  assert(button.disabled);
});
