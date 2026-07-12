// Shared hamburger nav toggle — used on every page
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.querySelector('.navmenu-wrap');
  const toggle = document.querySelector('.bars');
  if (!wrap || !toggle) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) wrap.classList.remove('open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') wrap.classList.remove('open');
  });
});
