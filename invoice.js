// invoice.js
import { pricingData } from './pricing.js';

document.addEventListener('DOMContentLoaded', () => {
  const lineItemsContainer = document.getElementById('line-items');
  const addLineItemBtn     = document.getElementById('add-line-item-btn');
  const previewBtn         = document.getElementById('preview-invoice-btn');
  const downloadBtn        = document.getElementById('download-invoice-btn');

  // === 1) Build global dropdown lists ===
  const allDesigns = Array.from(
    new Set(pricingData.flatMap(item => Object.keys(item.design || {})))
  );
  const allTransfers = Array.from(
    new Set(pricingData.flatMap(item => Object.keys(item.transfer || {})))
  );

  // === 2) Recalc every row's unit price when anything changes ===
  function updateAllPrices() {
    // 2a) Sum up total quantity across all rows
    let totalQty = 0;
    document.querySelectorAll('.qty-input').forEach(el => {
      const v = parseInt(el.value, 10);
      if (!isNaN(v)) totalQty += v;
    });

    // 2b) For each row, find its garment entry and apply:
    //      basePrice + designTier(totalQty) + transferCost
    document.querySelectorAll('.row-item').forEach(row => {
      const g = row.querySelector('.garment-select').value;
      const d = row.querySelector('.design-select').value;
      const t = row.querySelector('.transfer-select').value;
      const priceEl = row.querySelector('.price-input');

      const entry = pricingData.find(x => x.garment === g);
      let unit = 0;
      if (entry) {
        unit += entry.basePrice;

        // design tier
        const tiers = entry.design?.[d];
        if (tiers) {
          for (const [range, cost] of Object.entries(tiers)) {
            if (range.endsWith('+')) {
              if (totalQty >= parseInt(range,10)) unit += cost;
            } else {
              const [low, high] = range.split('-').map(Number);
              if (totalQty >= low && totalQty <= high) unit += cost;
            }
          }
        }

        // transfer cost
        if (entry.transfer?.[t] != null) {
          unit += entry.transfer[t];
        }
      }

      priceEl.value = unit.toFixed(2);
    });
  }

  // === 3) Create a new line item row ===
  function createLineItem() {
    const row = document.createElement('div');
    row.className = 'row g-3 align-items-end mb-2 row-item';
    row.innerHTML = `
      <div class="col-md-3">
        <label class="form-label">Garment</label>
        <select class="form-select garment-select" required>
          <option value="">Select garment</option>
          ${pricingData.map(x => `<option>${x.garment}</option>`).join('')}
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Design</label>
        <select class="form-select design-select" required>
          <option value="">Select design</option>
          ${allDesigns.map(d => `<option>${d}</option>`).join('')}
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label">Transfer</label>
        <select class="form-select transfer-select" required>
          <option value="">Select transfer</option>
          ${allTransfers.map(t => `<option>${t}</option>`).join('')}
        </select>
      </div>
      <div class="col-md-1">
        <label class="form-label">Qty</label>
        <input type="number" class="form-control qty-input" value="1" min="1" required />
      </div>
      <div class="col-md-2">
        <label class="form-label">Unit Price</label>
        <input type="number" class="form-control price-input" value="0.00" readonly />
      </div>
      <div class="col-md-1">
        <button type="button" class="btn btn-danger remove-line-item-btn">–</button>
      </div>
    `;

    // Remove‐row handler
    row.querySelector('.remove-line-item-btn')
       .addEventListener('click', () => {
         row.remove();
         updateAllPrices();
       });

    // Any change in garment/design/transfer/qty triggers a full recalc
    ['change','input'].forEach(evt => {
      row.querySelector('.garment-select') .addEventListener(evt, updateAllPrices);
      row.querySelector('.design-select')  .addEventListener(evt, updateAllPrices);
      row.querySelector('.transfer-select').addEventListener(evt, updateAllPrices);
      row.querySelector('.qty-input')      .addEventListener(evt, updateAllPrices);
    });

    lineItemsContainer.append(row);
  }

  // Wire up “+ Add Item” and start with one row
  addLineItemBtn.addEventListener('click', createLineItem);
  createLineItem();

  // === 4) Preview logic ===
  previewBtn.addEventListener('click', () => {
    // Fill in the header (invoice#, date, customer, etc.)
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

    // Build the items table
    const tbody = document.getElementById('invoice-summary');
    tbody.innerHTML = '';
    let subtotal = 0;
    document.querySelectorAll('.row-item').forEach(row => {
      const g    = row.querySelector('.garment-select').value;
      const d    = row.querySelector('.design-select').value;
      const t    = row.querySelector('.transfer-select').value;
      const qty  = parseInt(row.querySelector('.qty-input').value, 10) || 0;
      const unit = parseFloat(row.querySelector('.price-input').value) || 0;
      const total = qty * unit;
      subtotal += total;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g} / ${d} / ${t}</td>
        <td>${qty}</td>
        <td>${unit.toFixed(2)}</td>
        <td>${total.toFixed(2)}</td>
      `;
      tbody.append(tr);
    });
    document.getElementById('invoice-total').textContent = subtotal.toFixed(2);
    document.getElementById('invoice-preview').style.display = 'block';
  });

  // === 5) PDF download ===
  downloadBtn.addEventListener('click', () => {
    html2pdf().from(document.getElementById('invoice-preview'))
             .save(`invoice_${document.getElementById('invoice-number').value}.pdf`);
  });
});
