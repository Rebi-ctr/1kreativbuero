// Gemeinsame Hilfsfunktionen. Vor den Seiten-Scripts laden.
const $ = (selector, parent = document) => parent.querySelector(selector);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const projectURL = (project) => `projekt.html?projekt=${encodeURIComponent(project.slug)}`;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

