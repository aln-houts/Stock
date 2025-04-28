// invoice.js

// 1) Pricing data baked into the JS
const pricingData = {
  garments: [
    { name: "T-shirt G6400",   basePrice: 5.3 },
    { name: "Pocket Tee G230", basePrice: 7.2 }
    // …add your other garments here…
  ],
  designTiers: {
    "Single Press": { "1-11": 6, "12-24": 5, "25-48": 4, "49+": 3.5 },
    "Double Side":   { "1-11": 7, "12-24": 5.5, "25-48": 4.5, "49+": 3.75 }
  },
  transferCosts: {
    "12x5.4": 0.6875,
    "12x22": 2.75
    // …add your other transfer sizes…
  }
};

// 2) Helper to pick the right tier cost
function lookupTier(tiers, qty) {
  for (const range in tiers) {
    const cost = tiers[range];
    if (range.endsWith('+')) {
      if (qty >= parseInt(range, 10)) return cost;
    } else {
      const [min, max] = range.split('-').map(Number);
      if (qty >= min && qty <= max) return cost;
    }
  }
  return 0;
}

// 3) Main setup (defer ensures DOM is ready)
(function() {
  const lineItems  = document.getElementById('line-items');
  const addBtn     = document.getElementById('add-line-item-btn');
  const previewBtn = document.getElementById('preview-invoice-btn');
  const downloadBtn= document.getElementById('download-invoice-btn');

  // Build global <option> strings
  const garmentOpts  = pricingData.garments
    .map(g => `<option>${g.name}</option>`).join('');
  const designOpts   = Object.keys(pricingData.designTiers)
    .map(d => `<option>${d}</option>`).join('');
  const transferOpts = Object.keys(pricingData.transferCosts)
    .map(t => `<option>${t}</option>`).join('');

  // Recalculate every row’s unit price based on the grand total qty
  function updateAllPrices() {
    let totalQty = 0;
    document.querySelectorAll('.qty-input').forEach(el => {
      const v = parseInt(el.value, 10);
      if (!isNaN(v)) totalQty += v;
    });

    document.querySelectorAll('.row-item').forEach(row => {
      const g = row.querySelector('.garment-select').value;
      const d = row.querySelector('.design-select').value;
      const t = row.querySelector('.transfer-select').value;
      const priceEl = row.querySelector('.price-input');

      // base price
      const entry = pricingData.garments.find(x => x.name === g);
      let unit = entry ? entry.basePrice : 0;

      // add design tier
      if (pricingData.designTiers[d]) {
        unit += lookupTier(pricingData.designTiers[d], totalQty);
      }

      // add transfer cost
      if (pricingData.transferCosts[t] != null) {
        unit += pricingData.transferCosts[t];
      }

      priceEl.value = unit.toFixed(2);
    });
  }

  // Create one line‐item row
  function createLineItem() {
    const row = document.createElement('div');
    row.className = 'row g-3 align-items-end mb-2 row-item';
    row.innerHTML = `
      <div class="col-md-3">
        <label>Garment</label>
        <select class="form-select garment-select" required>
          <option value="">Select garment</option>
          ${garmentOpts}
        </select>
      </div>
      <div class="col-md-3">
        <label>Design</label>
        <select class="form-select design-select" required>
          <option value="">Select design</option>
          ${designOpts}
        </select>
      </div>
      <div class="col-md-2">
        <label>Transfer</label>
        <select class="form-select transfer-select" required>
          <option value="">Select transfer</option>
          ${transferOpts}
        </select>
      </div>
      <div class="col-md-1">
        <label>Qty</label>
        <input type="number" class="form-control qty-input" value="1" min="1" required>
      </div>
      <div class="col-md-2">
        <label>Unit Price</label>
        <input type="number" class="form-control price-input" value="0.00" readonly>
      </div>
      <div class="col-md-1">
        <button type="button" class="btn btn-danger remove-line-item-btn">–</button>
      </div>
    `;
    lineItems.append(row);

    // remove row
    row.querySelector('.remove-line-item-btn')
       .addEventListener('click', () => {
         row.remove();
         updateAllPrices();
       });

    // recalc on any change
    ['change','input'].forEach(evt => {
      row.querySelector('.garment-select') .addEventListener(evt, updateAllPrices);
      row.querySelector('.design-select')  .addEventListener(evt, updateAllPrices);
      row.querySelector('.transfer-select').addEventListener(evt, updateAllPrices);
      row.querySelector('.qty-input')      .addEventListener(evt, updateAllPrices);
    });
  }

  // wire up Add‐Item
  addBtn.addEventListener('click', createLineItem);
  createLineItem();  // initial row

  // Preview logic
  previewBtn.addEventListener('click', () => {
    // fill header info...
    document.getElementById('preview-invoice-number').textContent =
      document.getElementById('invoice-number').value;
    document.getElementById('invoice-date').textContent =
      document.getElementById('invoice-date-input').value;
    document.getElementById('invoice-customer').textContent =
      document.getElementById('invoice-customer-input').value;
    document.getElementById('invoice-project').textContent =
      document.getElementById('invoice-project-input').value;
    document.getElementById('invoice-due').textContent =
      document.getElementById('invoice-due-input').value;
    document.getElementById('invoice-status').textContent =
      document.getElementById('invoice-status-input').value;

    updateAllPrices();

    // build summary
    const tbody = document.getElementById('invoice-summary');
    tbody.innerHTML = '';
    let subtotal = 0;
    document.querySelectorAll('.row-item').forEach(row => {
      const g   = row.querySelector('.garment-select').value;
      const d   = row.querySelector('.design-select').value;
      const t   = row.querySelector('.transfer-select').value;
      co// invoice.js

// 1) Pricing data baked into the JS
const pricingData = {
  garments: [
    { name: "T-shirt G6400",   basePrice: 5.3 },
    { name: "Pocket Tee G230", basePrice: 7.2 }
    // …add your other garments here…
  ],
  designTiers: {
    "Single Press": { "1-11": 6,   "12-24": 5,   "25-48": 4,   "49+": 3.5 },
    "Double Side":   { "1-11": 7,   "12-24": 5.5, "25-48": 4.5, "49+": 3.75 }
  },
  transferCosts: {
    "12x5.4":  0.6875,
    "12x22":   2.75
    // …add other transfer sizes…
  }
};

// 2) Helper to pick the right bulk tier
function lookupTier(tiers, qty) {
  for (const range in tiers) {
    const cost = tiers[range];
    if (range.endsWith('+')) {
      if (qty >= parseInt(range, 10)) return cost;
    } else {
      const [min, max] = range.split('-').map(Number);
      if (qty >= min && qty <= max) return cost;
    }
  }
  return 0;
}

// 3) Main setup (defer on script ensures DOM is ready)
(function() {
  const lineItems   = document.getElementById('line-items');
  const addBtn      = document.getElementById('add-line-item-btn');
  const previewBtn  = document.getElementById('preview-invoice-btn');
  const downloadBtn = document.getElementById('download-invoice-btn');

  // Build <option> HTML for each dropdown
  const garmentOpts  = pricingData.garments.map(g => `<option>${g.name}</option>`).join('');
  const designOpts   = Object.keys(pricingData.designTiers)
    .map(d => `<option>${d}</option>`).join('');
  const transferOpts = Object.keys(pricingData.transferCosts)
    .map(t => `<option>${t}</option>`).join('');

  // Recalculate unit prices on all rows when anything changes
  function updateAllPrices() {
    let totalQty = 0;
    document.querySelectorAll('.qty-input').forEach(el => {
      const v = parseInt(el.value, 10);
      if (!isNaN(v)) totalQty += v;
    });

    document.querySelectorAll('.row-item').forEach(row => {
      const g      = row.querySelector('.garment-select').value;
      const d      = row.querySelector('.design-select').value;
      const t      = row.querySelector('.transfer-select').value;
      const priceEl= row.querySelector('.price-input');

      // base price
      const entry = pricingData.garments.find(x => x.name === g);
      let unit = entry ? entry.basePrice : 0;

      // bulk design cost
      if (pricingData.designTiers[d]) {
        unit += lookupTier(pricingData.designTiers[d], totalQty);
      }

      // transfer cost
      if (pricingData.transferCosts[t] != null) {
        unit += pricingData.transferCosts[t];
      }

      priceEl.value = unit.toFixed(2);
    });
  }

  // Create one line‐item row
  function createLineItem() {
    const row = document.createElement('div');
    row.className = 'row g-3 align-items-end mb-2 row-item';
    row.innerHTML = `
      <div class="col-md-3">
        <label class="form-label">Garment</label>
        <select class="form-select garment-select" required>
          <option value="">Select garment</option>
          ${garmentOpts}
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Design</label>
        <select class="form-select design-select" required>
          <option value="">Select design</option>
          ${designOpts}
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label">Transfer</label>
        <select class="form-select transfer-select" required>
          <option value="">Select transfer</option>
          ${transferOpts}
        </select>
      </div>
      <div class="col-md-1">
        <label class="form-label">Qty</label>
        <input type="number" class="form-control qty-input" value="1" min="1" required>
      </div>
      <div class="col-md-2">
        <label class="form-label">Unit Price</label>
        <input type="number" class="form-control price-input" value="0.00" readonly>
      </div>
      <div class="col-md-1">
        <button type="button" class="btn btn-danger remove-line-item-btn">–</button>
      </div>
    `;
    lineItems.append(row);

    // Remove‐row
    row.querySelector('.remove-line-item-btn')
       .addEventListener('click', () => {
         row.remove();
         updateAllPrices();
       });

    // Recalc on any change
    ['change','input'].forEach(evt => {
      row.querySelector('.garment-select') .addEventListener(evt, updateAllPrices);
      row.querySelector('.design-select')  .addEventListener(evt, updateAllPrices);
      row.querySelector('.transfer-select').addEventListener(evt, updateAllPrices);
      row.querySelector('.qty-input')      .addEventListener(evt, updateAllPrices);
    });
  }

  // Init: wire up Add button + initial row
  addBtn.addEventListener('click', createLineItem);
  createLineItem();

  // Preview logic (unchanged)
  previewBtn.addEventListener('click', () => {
    document.getElementById('preview-invoice-number').textContent =
      document.getElementById('invoice-number').value;
    document.getElementById('invoice-date').textContent =
      document.getElementById('invoice-date-input').value;
    document.getElementById('invoice-customer').textContent =
      document.getElementById('invoice-customer-input').value;
    document.getElementById('invoice-project').textContent =
      document.getElementById('invoice-project-input').value;
    document.getElementById('invoice-due').textContent =
      document.getElementById('invoice-due-input').value;
    document.getElementById('invoice-status').textContent =
      document.getElementById('invoice-status-input').value;

    updateAllPrices();

    const tbody = document.getElementById('invoice-summary');
    tbody.innerHTML = '';
    let subtotal = 0;
    document.querySelectorAll('.row-item').forEach(row => {
      const g   = row.querySelector('.garment-select').value;
      const d   = row.querySelector('.design-select').value;
      const t   = row.querySelector('.transfer-select').value;
      const q   = parseInt(row.querySelector('.qty-input').value, 10) || 0;
      const u   = parseFloat(row.querySelector('.price-input').value) || 0;
      const tot = q * u;
      subtotal += tot;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g} / ${d} / ${t}</td>
        <td>${q}</td>
        <td>${u.toFixed(2)}</td>
        <td>${tot.toFixed(2)}</td>
      `;
      tbody.append(tr);
    });
    document.getElementById('invoice-total').textContent = subtotal.toFixed(2);
    document.getElementById('invoice-preview').style.display = 'block';
  });

  // PDF download with full-content capture
  downloadBtn.addEventListener('click', () => {
    const element = document.getElementById('invoice-preview');
    html2pdf().set({
      margin:       10,
      filename:     `invoice_${document.getElementById('invoice-number').value}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save();
  });
})();
nst q   = parseInt(row.querySelector('.qty-input').value,10) || 0;
      const u   = parseFloat(row.querySelector('.price-input').value) || 0;
      const tot = q * u;
      subtotal += tot;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g} / ${d} / ${t}</td>
        <td>${q}</td>
        <td>${u.toFixed(2)}</td>
        <td>${tot.toFixed(2)}</td>
      `;
      tbody.append(tr);
    });
    document.getElementById('invoice-total').textContent = subtotal.toFixed(2);
    document.getElementById('invoice-preview').style.display = 'block';
  });

  // PDF download
  downloadBtn.addEventListener('click', () => {
    html2pdf().from(document.getElementById('invoice-preview'))
             .save(`invoice_${document.getElementById('invoice-number').value}.pdf`);
  });
})();
