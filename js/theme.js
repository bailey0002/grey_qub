// Light/dark toggle. Initial theme is set synchronously in an inline
// <head> script (see each page's <head>) to avoid a flash of the wrong
// theme; this file only wires up the toggle control and persistence.
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const label = document.getElementById('themeLabel');
  if (!toggle) return;

  function reflect() {
    const dark = root.getAttribute('data-theme') === 'dark';
    if (label) label.textContent = dark ? 'Dark' : 'Light';
    toggle.setAttribute('aria-pressed', String(dark));
  }

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('gq-theme', next);
    const meta = document.getElementById('themeColorMeta');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#1b1917' : '#f1ede6');
    reflect();
    window.dispatchEvent(new CustomEvent('gq-theme-change', { detail: { theme: next } }));
  });

  reflect();
});
