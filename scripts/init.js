// scripts/init.js

import { setupItems } from './setupItems.js';
import { setupInvoices } from './setupInvoices.js';
import { setupSave } from './setupSave.js';
// 'inventory.js' is a helper module, no setup function expected
// 'index.js' is likely for loading shared HTML partials

window.addEventListener('DOMContentLoaded', () => {
  // Item entry form + inventory display
  if (document.getElementById('addForm') && document.getElementById('itemDisplay')) {
    setupItems();
  }

  // Invoice listing
  if (document.getElementById('invoiceList')) {
    setupInvoices();
  }

  // GitHub save page
  if (document.getElementById('setup-credentials')) {
    setupSave();
  }
});
