/* =========================================================
   Central de Links | João Filipe
   1. Configuração
   2. Tema claro/escuro
   3. Grupo de ofertas
   4. Navegação entre telas (hash) e animações
   ========================================================= */
(() => {
  'use strict';

  /* ---------- 1. Configuração ----------
     Para ativar o grupo de ofertas, cole o link do grupo do WhatsApp aqui.
     Exemplo: 'https://chat.whatsapp.com/XXXXXXXX'
     Enquanto estiver vazio, os cards mostram "Em breve". */
  const OFERTAS_URL = '';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* ---------- 2. Tema claro/escuro ---------- */
  const THEME_KEY = 'theme';
  const themeBtn = document.getElementById('themeToggle');
  const themeMeta = document.getElementById('themeColor');

  const readTheme = () => {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  };
  const saveTheme = (value) => {
    try { localStorage.setItem(THEME_KEY, value); } catch (e) { /* armazenamento indisponível */ }
  };

  function updateThemeColor() {
    if (!themeMeta) return;
    const dark = root.dataset.theme === 'dark';
    themeMeta.setAttribute('content', dark ? '#0d0e0e' : '#f3f3f0');
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
    updateThemeColor();
  }

  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');

  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });

  // Acompanha o tema do sistema enquanto a pessoa não escolher um manualmente
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (!readTheme()) applyTheme(event.matches ? 'dark' : 'light');
  });

  /* ---------- 3. Grupo de ofertas ---------- */
  document.querySelectorAll('[data-offers]').forEach((el) => {
    if (OFERTAS_URL) {
      el.setAttribute('href', OFERTAS_URL);
      return;
    }
    el.classList.add('is-soon');
    el.removeAttribute('href');
    el.removeAttribute('target');
    el.removeAttribute('rel');
    el.setAttribute('aria-disabled', 'true');
    el.insertAdjacentHTML('beforeend', '<span class="badge">Em breve</span>');
  });

  /* ---------- 4. Navegação entre telas ---------- */
  const views = {
    home:   { el: document.getElementById('view-home'),   title: 'João Filipe | Links' },
    topdev: { el: document.getElementById('view-topdev'), title: 'Top Dev | João Filipe' },
    sobre:  { el: document.getElementById('view-sobre'),  title: 'Sobre mim | João Filipe' },
  };
  const navLinks = document.querySelectorAll('[data-nav]');
  const curtain = document.getElementById('curtain');

  let active = null;
  let busy = false;
  // Seção que deve ficar em destaque ao abrir a próxima tela (ex.: card "Empresa Top Dev")
  let pendingSection = null;

  document.querySelectorAll('[data-goto]').forEach((link) => {
    link.addEventListener('click', () => { pendingSection = link.dataset.goto; });
  });

  const routeFromHash = () => {
    const key = location.hash.replace(/^#\/?/, '').split(/[?&]/)[0];
    return Object.prototype.hasOwnProperty.call(views, key) ? key : 'home';
  };

  function show(route, { moveFocus = true } = {}) {
    Object.entries(views).forEach(([key, view]) => {
      const on = key === route;
      view.el.hidden = !on;
      view.el.classList.toggle('is-active', on);
      view.el.classList.remove('is-leaving');
    });

    root.dataset.view = route;
    document.title = views[route].title;
    navLinks.forEach((link) => {
      if (link.dataset.nav === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    updateThemeColor();
    window.scrollTo(0, 0);

    const section = pendingSection ? views[route].el.querySelector('#' + pendingSection) : null;
    pendingSection = null;

    if (section) {
      // Leva a seção para o topo, logo abaixo da barra fixa
      const bar = document.querySelector('.topbar');
      const offset = (bar ? bar.offsetHeight : 0) + 20;
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    } else if (moveFocus) {
      const target = views[route].el.querySelector('[data-focus]');
      if (target) target.focus({ preventScroll: true });
    }
  }

  // Troca simples: a tela atual some e a nova entra
  async function fadeTo(route) {
    const current = views[active].el;
    current.classList.add('is-leaving');
    await wait(180);
    show(route);
  }

  // Troca com a cortina: usada ao abrir a Top Dev
  async function curtainTo(route) {
    curtain.className = 'curtain is-covering';
    await wait(450);

    curtain.className = 'curtain is-covered is-loading';
    await wait(800);

    show(route);

    curtain.className = 'curtain is-revealing';
    await wait(560);

    curtain.className = 'curtain';
  }

  async function onRouteChange() {
    if (busy) return;
    const next = routeFromHash();
    if (next === active) return;

    busy = true;
    try {
      if (active === null) {
        show(next, { moveFocus: false });
      } else if (reduceMotion.matches) {
        show(next);
      } else if (next === 'topdev') {
        await curtainTo(next);
      } else {
        await fadeTo(next);
      }
      active = next;
    } finally {
      busy = false;
    }

    // Se a pessoa clicou em outra tela durante a animação, segue para ela
    if (routeFromHash() !== active) onRouteChange();
  }

  window.addEventListener('hashchange', onRouteChange);
  onRouteChange();
})();
