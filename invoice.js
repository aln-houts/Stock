// invoice.js
import { pricingData } from './pricing.js';

document.addEventListener('DOMContentLoaded', () => {
  const lineItemsContainer = document.getElementById('line-items');
  const addLineItemBtn     = document.getElementById('add-line-item-btn');
  const previewBtn         = document.getElementById('preview-invoice-btn');
  const downloadBtn        = document.getElementById('download-invoice-btn');

  // ---- Create a new line-item row ----
  function createLineItem() {
    const row = document.createElement('div');
    row.className = 'row g-3 align-items-end mb-2';
    row.innerHTML = `
      <div class="col-md-3">
        <label class="form-label">Garment</label>
        <select class="form-select garment-select" required>
          <option value="">Select garment</option>
          ${pricingData.map(i =>
            `<option value="${i.garment}">${i.garment}</option>`
          ).join('')}
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Design</label>
        <select class="form-select design-select" disabled required>
          <option value="">Select design</option>
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label">Qty</label>
        <input type="number" class="form-control qty-input" value="1" min="1" required />
      </div>
      <div class="col-md-2">
        <label class="form-label">Unit Price</label>
        <input type="number" class="form-control price-input" value="0.00" min="0" step="0.01" readonly />
      </div>
      <div class="col-md-1">
        <button type="button" class="btn btn-danger remove-line-item-btn">–</button>
      </div>
    `;
    const garmentSelect = row.querySelector('.garment-select');
    const designSelect  = row.querySelector('.design-select');
    const qtyInput      = row.querySelector('.qty-input');
    const priceInput    = row.querySelector('.price-input');

    // Remove‐row handler
    row.querySelector('.remove-line-item-btn')
      .addEventListener('click', () => row.remove());

    // When garment changes → populate design dropdown
    garmentSelect.addEventListener('change', () => {
      const sel = pricingData.find(i => i.garment === garmentSelect.value);
      designSelect.innerHTML = '<option value="">Select design</option>';
      if (sel) {
        Object.keys(sel.design).forEach(d => {
          const opt = document.createElement('option');
          opt.value = d; opt.textContent = d;
          designSelect.appendChild(opt);
        });
        designSelect.disabled = false;
      } else {
        designSelect.disabled = true;
      }
      // reset price when garment changes
      priceInput.value = '0.00';
    });

    // Recalculate price when design or qty changes
    function updatePrice() {
      const sel = pricingData.find(i => i.garment === garmentSelect.value);
      const design = designSelect.value;
      const qty    = parseInt(qtyInput.value, 10);
      if (!sel || !design || qty < 1) {
        priceInput.value = '0.00';
        return;
      }

      // pick correct tier
      const tiers = sel.design[design];
      let unitPrice = 0;
      for (const [range, p] of Object.entries(tiers)) {
        if (range.endsWith('+')) {
          const min = parseInt(range);
          if (qty >= min) unitPrice = p;
        } else {
          const [min, max] = range.split('-').map(Number);
          if (qty >= min && qty <= max) unitPrice = p;
        }
      }

      priceInput.value = unitPrice.toFixed(2);
    }
    designSelect.addEventListener('change', updatePrice);
    qtyInput.addEventListener('input', updatePrice);

    lineItemsContainer.append(row);
  }

  // wire up add‐row button & start with one
  addLineItemBtn.addEventListener('click', createLineItem);
  createLineItem();

  // ---- Preview logic (unchanged) ----
  previewBtn.addEventListener('click', () => {
    /* ...your existing preview code (filling #invoice-summary, subtotal, etc.)... */
    // after you set row totals, show the preview as before
  });

  // ---- PDF logic (unchanged) ----
  downloadBtn.addEventListener('click', () => {
    html2pdf().from(document.getElementById('invoice-preview'))
             .save(`invoice_${document.getElementById('invoice-number').value}.pdf`);
  });
});
