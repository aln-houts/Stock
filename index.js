// index.js – Refactored with syntax fixes and unified DOMContentLoaded

// 1) Section registry: maps URL params to section files and init functions
const sectionRegistry = {
  tees:       { file: 'sections/sectionItem.html',    title: 'Tees',        init: () => typeof setupItems === 'function' && setupItems() },
  hoodies:    { file: 'sections/sectionItem.html',    title: 'Hoodies',     init: () => typeof setupItems === 'function' && setupItems() },
  tanks:      { file: 'sections/sectionItem.html',    title: 'Tanks',       init: () => typeof setupItems === 'function' && setupItems() },
  bags:       { file: 'sections/sectionItem.html',    title: 'Bags',        init: () => typeof setupItems === 'function' && setupItems() },
  raglan:     { file: 'sections/sectionItem.html',    title: 'Raglan',      init: () => typeof setupItems === 'function' && setupItems() },
  longsleeve: { file: 'sections/sectionItem.html',    title: 'Long Sleeve', init: () => typeof setupItems === 'function' && setupItems() },
  transfers:  { file: 'sections/sectionItem.html',    title: 'Transfers',   init: () => typeof setupItems === 'function' && setupItems() },
  printtees:  { file: 'sections/sectionItem.html',    title: 'Print Tees',  init: () => typeof setupItems === 'function' && setupItems() },
  hats:       { file: 'sections/sectionItem.html',    title: 'Hats',        init: () => typeof setupItems === 'function' && setupItems() },
  invoice:    { file: 'sections/sectionInvoice.html', title: 'Invoice',     init: () => typeof setupInvoice === 'function' && setupInvoice() },
  save:       { file: 'sections/sectionSave.html',    title: 'Save to GitHub', init: () => typeof setupSave === 'function' && setupSave() }
};

// 2) Determine desired section key from URL
const params = new URLSearchParams(window.location.search);
const rawType = params.get('type') || params.get('page') || window.location.hash.slice(1) || 'tees';
const type = rawType.toLowerCase();

// 3) Function: fetch & inject a section HTML, re-run scripts, update title, init
async function loadSection(key) {
  const section = sectionRegistry[key] || sectionRegistry['tees'];
  const container = document.getElementById('section-placeholder');
  try {
    // Resolve URL against baseURI
    const sectionUrl = new URL(section.file, document.baseURI).href;
    const res = await fetch(sectionUrl);
    if (!res.ok) throw new Error(`Failed to load ${section.file}: ${res.status}`);

    container.innerHTML = await res.text();

    // Re‑execute both external src and inline scripts
    container.querySelectorAll('script').forEach(old => {
      const ne = document.createElement('script');
      if (old.src) {
        ne.src = old.src;
      } else {
        ne.textContent = old.textContent;
      }
      old.replaceWith(ne);
    });

    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = section.title;

    // Run section initializer
    section.init();
  } catch (err) {
    console.error('loadSection error', err);
    container.innerHTML = '<p class="text-danger">Error loading section.</p>';
  }
}

// 4) Helper: load an HTML partial into an element
async function loadPartial(url, elementId) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    document.getElementById(elementId).innerHTML = await res.text();
  } catch (err) {
    console.error('loadPartial error', err);
  }
}

// 5) On DOM ready: load shared UI, seed inventory, load section, setup nav handlers

document.addEventListener('DOMContentLoaded', async () => {
  // Load header & menu partials
  await loadPartial('head.html', 'head-placeholder');
  await loadPartial('menu.html', 'menu-placeholder');

  // Seed inventory JSON into localStorage
  try {
    const res = await fetch('data/inventory.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    Object.entries(data).forEach(([sectionKey, items]) => {
      const keyName = sectionKey.toLowerCase() === 'print' ? 'printtees' : sectionKey.toLowerCase();
      const storageKey = `${keyName}Inventory`;
      localStorage.setItem(storageKey, JSON.stringify(items));
    });
  } catch (err) {
    console.error('Error loading inventory.json', err);
  }

  // Load the initial section
  await loadSection(type);

  // Intercept offcanvas menu clicks
  document.getElementById('menu-placeholder').addEventListener('click', e => {
    const link = e.target.closest('a.nav-link');
    if (!link) return;
    e.preventDefault();
    const href = link.getAttribute('href');
    const url = new URL(href, window.location.origin);
    const newRaw = url.searchParams.get('type') || url.searchParams.get('page') || url.hash.slice(1) || 'tees';
    const newType = newRaw.toLowerCase();
    window.history.pushState({}, '', href);
    loadSection(newType);
    bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('sidebarMenu')).hide();
  });

  // Handle back/forward
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search);
    const raw = p.get('type') || p.get('page') || window.location.hash.slice(1) || 'tees';
    loadSection(raw.toLowerCase());
  });
});
