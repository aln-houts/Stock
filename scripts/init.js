// scripts/init.js

import { setupItems } from './setupItems.js';
import { setupOverview } from './overview.js';
import { setupInvoices } from './invoices.js';
import { setupCreateInvoice } from './create-invoice.js';
// Add more as needed...

window.addEventListener('DOMContentLoaded', () => {
  // Item form + table
  if (document.getElementById('addForm') && document.getElementById('itemDisplay')) {
    setupItems();
  }

  // Overview totals page
  if (document.getElementById('overviewDisplay')) {
    setupOverview();
  }

  // Invoice listing page
  if (document.getElementById('invoiceList')) {
    setupInvoices();
  }

  // Create invoice page
  if (document.getElementById('invoiceForm')) {
    setupCreateInvoice();
  }

  // Add any additional sections below with similar checks
});
