// Gemeinsame Browserregeln für Apache und die lokale Vorschau.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'kontakt.html', 'projekt.html', 'projekt-wiriehorn.html', 'projekt-rigi.html'];

function securityHeaders() {
  const hashes = new Set();
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8').replace(/\r\n?/g, '\n');
    for (const [, attributes, script] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (!/\bsrc\s*=/i.test(attributes)) hashes.add(`'sha256-${createHash('sha256').update(script).digest('base64')}'`);
    }
  }
  return {
    'Content-Security-Policy': [
      "default-src 'self'", `script-src 'self' ${[...hashes].join(' ')}`,
      "script-src-attr 'none'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com", "img-src 'self' data:",
      "media-src 'self'", "connect-src 'self'", 'frame-src https://erlebniskarte.wiriehorn.ch',
      "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'self'",
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    // Browser beachten HSTS nur über HTTPS. Keine Subdomains und kein Preload.
    'Strict-Transport-Security': 'max-age=86400',
  };
}

function writeApacheHeaders() {
  const file = path.join(root, '.htaccess');
  const source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\n# SECURITY:START[\s\S]*?# SECURITY:END\n?/g, '\n');
  const lines = Object.entries(securityHeaders()).flatMap(([name, value]) => [
    `  Header onsuccess unset ${name}`, `  Header always set ${name} "${value}"`,
  ]);
  fs.writeFileSync(file, `${source.trimEnd()}\n\n# SECURITY:START — generiert durch scripts/build-seo.cjs\n<IfModule mod_headers.c>\n${lines.join('\n')}\n</IfModule>\n# SECURITY:END\n`);
}
module.exports = { securityHeaders, writeApacheHeaders };
