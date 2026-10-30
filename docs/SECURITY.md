# Sicherheitsmassnahmen und Veröffentlichung

Stand: 30. Oktober 2026. Für die kleine Website ohne Benutzerkonten oder Zahlungsverkehr ergänzt. Die Serverregeln gelten erst nach dem Upload der `.htaccess` und müssen beim Hoster überprüft werden.

## Neu umgesetzt

| Massnahme | Wirkung |
| --- | --- |
| Content Security Policy (CSP) | JavaScript darf von der eigenen Website kommen. Die zwei vorhandenen Inline-Inhalte sind über ihren SHA-256-Fingerabdruck freigegeben; beliebiger Inline-JavaScript-Code und `eval` bleiben gesperrt. Google Fonts und Wiriehorn-Einbettungen sind gezielt erlaubt. |
| Schutz vor fremder Einbettung | `frame-ancestors 'self'` und `X-Frame-Options: SAMEORIGIN` erschweren Klickfallen, bei denen die Website unsichtbar in fremden Seiten liegt. Unsere eigenen Wiriehorn-Iframes funktionieren weiterhin. |
| `nosniff` | Browser sollen Dateien anhand ihres angegebenen Dateityps verarbeiten und nicht beispielsweise Text als JavaScript interpretieren. |
| Referrer-Policy | Externe Ziele erhalten bei HTTPS-Verweisen nur die Herkunftsdomain statt des vollständigen Seitenpfads und der URL-Parameter. |
| Permissions-Policy | Kamera, Mikrofon und Standort sind gesperrt; die Website benötigt diese Funktionen nicht. |
| HSTS | Nach einem HTTPS-Besuch merkt sich der Browser für einen Tag, die Domain nur verschlüsselt aufzurufen. Ohne Subdomain-Zwang und ohne dauerhaften Preload-Eintrag. Ersetzt weder Zertifikat noch HTTP-Weiterleitung beim Hoster. |
| Gesperrte interne Dateien | Direkte Webzugriffe auf versteckte Dateien wie `.git`/`.env`, die Ordner `scripts`, `tests`, `docs`, `node_modules`, die Kontakt-Konfiguration und typische Sicherungsdateien werden abgewiesen. `.well-known` bleibt für Zertifikate erreichbar. PHP kann seine Konfiguration weiterhin intern laden. |
| Keine Verzeichnislisten | Ordnerinhalte werden nicht automatisch als Dateiliste angezeigt. |

Inline-CSS bleibt erlaubt: Die Gestaltung und Animationen setzen dynamische Styles. Das ist getrennt von der strengeren JavaScript-Regel. Die CSP ist eine zusätzliche Hürde, kein Ersatz für korrekte Eingabeprüfung. Die Kamera-/Standort-Sperre betrifft auch eingebettete Inhalte; Drag/Zoom im Panorama benötigt diese Rechte nicht.

## Bereits vorhandener Schutz des Kontaktformulars

Unverändert vorhanden: Sicherheitstoken gegen fremd ausgelöste Formularanfragen, Host-/Origin-Prüfung, sichere Sitzungscookies, Honeypot gegen einfache Bots, Längen- und E-Mail-Prüfung, Schutz vor eingeschleusten E-Mail-Headern und feste Absender-/Empfängeradressen. Versandbegrenzung: fünf Versuche pro Client in 15 Minuten und 30 insgesamt pro Stunde. Der PHP-Endpunkt gibt keine internen Fehlermeldungen aus.

## Vor dem Upload

1. Nach Änderungen an HTML-Inline-Scripts oder SEO-Daten `node scripts/build-seo.cjs` ausführen. Dadurch werden auch die CSP-Fingerabdrücke in `.htaccess` aktualisiert.
2. `node --test` ausführen.
3. `.htaccess`, HTML-Seiten, CSS und benötigte öffentliche Dateien gemeinsam hochladen. Entwicklungsdateien möglichst gar nicht hochladen. Die versteckte `.htaccess` darf im FTP-Programm nicht übersehen werden.

## Nach dem Upload prüfen

- Startseite, Kontaktseite und beide Projektseiten öffnen: kein Serverfehler 500. Bei einem solchen Fehler die vorherige `.htaccess` wiederherstellen und das Hosting-Fehlerprotokoll prüfen.
- In den Browser-Entwicklerwerkzeugen unter Netzwerk die Antwortheader kontrollieren: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` und bei HTTPS `Strict-Transport-Security`. Alternativ `curl.exe -I https://1kreativbuero.ch/`. Auch eine Unterseite und `/api/contact.php` kontrollieren. Apache muss `mod_headers` und die bestehenden Rewrite-Regeln unterstützen. Falls der vorgeschaltete nginx `.htaccess` umgeht, muss der Hoster gleichwertige Regeln setzen.
- `http://1kreativbuero.ch/` muss auf HTTPS weiterleiten; auch die www-Variante prüfen. Eine nötige Weiterleitung im Hosting einstellen, nicht blind eine Proxy-abhängige Redirect-Regel ergänzen.
- `https://1kreativbuero.ch/api/contact-config.php`, `/.git/config` und `/scripts/build-seo.cjs` müssen 403 oder 404 liefern, niemals Quelltext oder Konfiguration. Vorhandene Asset-Ordner dürfen keine Dateiliste zeigen.
- Hero-Gucklöcher, Navigation, Kreative Pause, Bilder, Videos, Sommer-/Winter-Vergleich, die aktivierbare Erlebniskarte und das 360°-Panorama auf Desktop und Smartphone ausprobieren. In der Konsole dürfen keine Meldungen „violates Content Security Policy“ auftauchen.
- Über das Kontaktformular eine eigene Testnachricht senden: Erfolgsmeldung und tatsächlichen Eingang bei `team@1kreativbuero.ch` prüfen; ungültige Eingaben müssen abgewiesen werden. Den Versand nicht mehrfach in kurzer Zeit wiederholen, um die Begrenzung nicht auszulösen.

Die lokale Node-Vorschau verwendet dieselben Browserheader, führt aber weder Apache-Regeln noch PHP aus. Die automatisierten Tests ersetzen daher den Hosting- und Mailtest nicht. Eine reale E-Mail wurde bei der Umsetzung nicht versendet.

Grundlagen: [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [Apache: Header](https://httpd.apache.org/docs/2.4/mod/mod_headers.html), [MDN: HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security).
