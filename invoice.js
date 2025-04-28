// invoice.js

// --- pricingData + lookupTier as before ---
const pricingData = {
  garments: [
    { name: "T-shirt G6400",   basePrice: 5.5 },
    { name: "T-shirt G500",   basePrice: 4.50 },
        { name: "T-shirt Fruit essential",   basePrice: 4.5 },
        { name: "Long Sleeve G240",   basePrice: 8.5 },
        { name: "Pocket Tee G230",   basePrice: 8.75 },
        { name: "Raglan G570",   basePrice: 8.75 },
        { name: "Tank Top",   basePrice: 6.75 },
    { name: "Bucket Hat",   basePrice: 3.5 },
    { name: "Hoodie G185", basePrice: 14.5 }
    // …add your other garments…
  ],
  designTiers: {
    "Single Press": { "1-11": 6, "12-24": 5, "25-48": 4, "49+": 3.5 },
    "Double Side":   { "1-11": 7, "12-24": 5.5, "25-48": 4.5, "49+": 3.75 }
  },
  transferCosts: {
    "12x5.4": 0.75,
        "4x4": 0.25,
        "12x11": 1.5,
        "12x11 plus pocket": 1.75,
        "11x18": 2.25,
    "12x22": 2.75
    // …add other transfers…
  }
};
function lookupTier(tiers, qty) { /*…same as before…*/ }

(function() {
  // Grab DOM elements
  const lineItems    = document.getElementById('line-items');
  const addBtn       = document.getElementById('add-line-item-btn');
  const previewBtn   = document.getElementById('preview-invoice-btn');
  const downloadBtn  = document.getElementById('download-invoice-btn');
  const saveBtn      = document.getElementById('save-invoice-btn');

  // Load or init invoices array
  const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');

  // …build garmentOpts, designOpts, transferOpts, updateAllPrices(), createLineItem()… (unchanged)…

  // Wire up Add‐Item & initial row
  addBtn.addEventListener('click', createLineItem);
  createLineItem();

  // Preview logic (unchanged) …
  previewBtn.addEventListener('click', () => { /*…*/ });

  // Download logic (unchanged, or your html2pdf options)… 
  downloadBtn.addEventListener('click', () => { /*…*/ });

  // --- NEW: Save Invoice handler ---
  saveBtn.addEventListener('click', () => {
    // Gather header info
    const invoiceNumber = document.getElementById('invoice-number').value;
    const invoiceDate   = document.getElementById('invoice-date-input').value;
    const customer      = document.getElementById('invoice-customer-input').value;
    const project       = document.getElementById('invoice-project-input').value;
    const dueDate       = document.getElementById('invoice-due-input').value;
    const status        = document.getElementById('invoice-status-input').value;

    // Build line-item array
    const items = Array.from(document.querySelectorAll('.row-item')).map(row => {
      const g   = row.querySelector('.garment-select').value;
      const d   = row.querySelector('.design-select').value;
      const t   = row.querySelector('.transfer-select').value;
      const q   = parseInt(row.querySelector('.qty-input').value,10) || 0;
      const u   = parseFloat(row.querySelector('.price-input').value) || 0;
      return { garment: g, design: d, transfer: t, qty: q, unitPrice: u };
    });

    // Compute subtotal
    const subtotal = items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);

    // Create invoice object
    const invoiceObj = {
      invoiceNumber,
      invoiceDate,
      customer,
      project,
      dueDate,
      status,
      items,
      subtotal
    };

    // Save and confirm
    invoices.push(invoiceObj);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    alert(`Invoice ${invoiceNumber} saved!`);

    // Optionally redirect to list view
    // window.location = 'invoices.html';
  });
})();
