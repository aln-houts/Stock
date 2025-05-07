// index.js (cleaned and modernized)

const sectionRegistry = {
    tees:       {file: 'sections/sectionItem.html', title: 'Tees', init: () => {if (typeof setupItems === 'function') setupItems();} },
    hoodies:    { file: 'sections/sectionItem.html', title: 'Hoodies', init: () => { if (typeof setupItems === 'function') setupItems(); } },
    tanks:      { file: 'sections/sectionItem.html', title: 'Tanks', init: () => { if (typeof setupItems === 'function') setupItems(); } },
    bags:       { file: 'sections/sectionItem.html', title: 'Bags', init: () => { if (typeof setupItems === 'function') setupItems(); } },
    raglan:     { file: 'sections/sectionItem.html', title: 'Raglan', init: () => { if (typeof setupItems === 'function') setupItems(); } },
    longsleeve: { file: 'sections/sectionItem.html', title: 'Long Sleeve', init: () => { if (typeof setupItems === 'function') setupItems(); } },
    transfers:  { file: 'sections/sectionItem.html', title: 'Transfers', init: () => { if (typeof setupItems === 'function') setupItems(); } },
    printtees:  { file: 'sections/sectionItem.html', title: 'Print Tees', init: () => { if (typeof setupItems === 'function') setupItems(); } },
    hats:       { file: 'sections/sectionItem.html', title: 'Hats', init: () => { if (typeof setupItems === 'function') setupItems(); } },
    invoice:    { file: 'sections/sectionInvoice.html', title: 'Invoice',  init: () => {if (typeof setupInvoice === 'function') setupInvoice(); }},
    save:       { file: 'sections/sectionSave.html', title: 'Save to GitHub',init: () => { if (typeof setupSave === 'function') setupSave(); }}, 
     };
  
  
  async function loadSection(type) {
    const section = sectionRegistry[type] || sectionRegistry['tees'];
    const container = document.getElementById('section-placeholder');
  
    try {
      const res = await fetch(section.file);
      if (!res.ok) throw new Error(`Failed to load ${section.file}`);
      const html = await res.text();
      container.innerHTML = html;
  
      // Re-run any inline scripts
      const scripts = container.querySelectorAll("script");
      scripts.forEach(oldScript => {
        const newScript = document.createElement("script");
        newScript.text = oldScript.text;
        oldScript.replaceWith(newScript);
      });
  
      // Update page title
      const pageTitle = document.getElementById('page-title');
      if (pageTitle) pageTitle.textContent = section.title;
  
      // Run section-specific init
      section.init();
    } catch (err) {
      console.error('Failed to load section:', err);
      container.innerHTML = '<p class="text-danger">Error loading section.</p>';
    }
  }
  
  const params = new URLSearchParams(window.location.search);
  const rawType = params.get('type') || params.get('page') || window.location.hash.slice(1) || 'tees';
  const type = rawType.toLowerCase();
  
  
  document.addEventListener('DOMContentLoaded', async () => {
    // 1) Fetch the master inventory JSON and seed localStorage
    try {
      const res = await fetch('data/inventory.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      Object.entries(json).forEach(([section, items]) => {
        // map "print" → "printtees" to match your sectionRegistry key
        const keyName = section.toLowerCase() === 'print'
          ? 'printtees'
          : section.toLowerCase();
        const storageKey = `${keyName}Inventory`;
        localStorage.setItem(storageKey, JSON.stringify(items));
      });
    } catch (err) {
      console.error('Error loading inventory.json:', err);
    }
  
    // 2) Finally, load whichever section the URL requested
    loadSection(type);
  });
  
  
    // 2) Intercept clicks on your offcanvas menu links
    document
      .getElementById('menu-placeholder')
      .addEventListener('click', (e) => {
        const link = e.target.closest('a.nav-link');
        if (!link) return;             // only care about nav-links
        e.preventDefault();            // don’t do a full reload
        const href = link.getAttribute('href');
        const url  = new URL(href, window.location.origin);
  
        // figure out which key in sectionRegistry we want
        const raw   = url.searchParams.get('type')
                     || url.searchParams.get('page')
                     || url.hash.slice(1)
                     || 'tees';
        const newType = raw.toLowerCase();
  
        // update the browser’s URL bar (history)
        window.history.pushState({}, '', href);
  
        // load that section in-place
        loadSection(newType);
  
        // and then close the offcanvas menu
        const offcanvasEl = document.getElementById('sidebarMenu');
        const offcanvas   = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
        offcanvas.hide();
      });
  
    // 3) Support back/forward navigation
    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(window.location.search);
      const raw    = params.get('type')
                  || params.get('page')
                  || window.location.hash.slice(1)
                  || 'tees';
      loadSection(raw.toLowerCase());
    });
    
  
  
