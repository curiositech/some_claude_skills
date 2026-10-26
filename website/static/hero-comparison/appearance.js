/* This standalone static report shares Docusaurus's `theme` preference.
   Framework routes retain Docusaurus's native appearance provider. */
(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const parse = value => value === 'light' || value === 'dark' ? value : 'system';
  let choice = 'system';
  try { choice = parse(localStorage.getItem('theme')); } catch { /* Optional storage. */ }
  function apply() {
    root.dataset.themeChoice = choice;
    root.dataset.theme = choice === 'system' ? (system.matches ? 'dark' : 'light') : choice;
    const button = document.getElementById('appearance-toggle');
    if (button) {
      button.textContent = `Appearance: ${choice[0].toUpperCase()}${choice.slice(1)}`;
      button.setAttribute('aria-label', `Switch between dark and light mode (currently ${choice} mode)`);
    }
  }
  apply(); // Before the stylesheet paints.
  system.addEventListener('change', () => { if (choice === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key === 'theme' || event.key === null) { choice = parse(event.newValue); apply(); }
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('appearance-toggle')?.addEventListener('click', () => {
      choice = choice === 'system' ? 'light' : choice === 'light' ? 'dark' : 'system';
      try { if (choice === 'system') localStorage.removeItem('theme'); else localStorage.setItem('theme', choice); } catch { /* In-memory choice still works. */ }
      apply();
    });
  }, { once: true });
})();
