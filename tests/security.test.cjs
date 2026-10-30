const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { securityHeaders } = require('../scripts/security.cjs');
const root = path.resolve(__dirname, '..');

test('Ausgelieferte Apache-CSP erlaubt bestehende Inline-Scripts nur per passendem Hash', () => {
  const config = fs.readFileSync(path.join(root, '.htaccess'), 'utf8');
  const csp = config.match(/Header always set Content-Security-Policy "([^"]+)"/)[1];
  assert.equal(csp, securityHeaders()['Content-Security-Policy'], 'Nach Änderungen an Inline-Scripts build-seo ausführen');
  const scripts = csp.match(/(?:^|; )script-src ([^;]+)/)[1];
  assert.doesNotMatch(scripts, /unsafe-inline|unsafe-eval|https:|\*/);
  for (const page of ['index.html', 'kontakt.html', 'projekt-wiriehorn.html', 'projekt-rigi.html']) {
    const html = fs.readFileSync(path.join(root, page), 'utf8').replace(/\r\n?/g, '\n');
    for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/.test(attrs)) continue;
      assert.ok(scripts.includes(`'sha256-${createHash('sha256').update(body).digest('base64')}'`), page);
    }
  }
  assert.match(csp, /frame-src https:\/\/erlebniskarte\.wiriehorn\.ch;/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /form-action 'self'/);
});
