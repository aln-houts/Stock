// invoice.js
import { pricingData } from './pricing.js';

document.addEventListener('DOMContentLoaded', () => {
  const lineItemsContainer = document.getElementById('line-items');
  const addLineItemBtn     = document.getElementById('add-line-item-btn');
  const previewBtn         = document.getElementById('preview-invoice-btn');
  const downloadBtn        = document.getElementById('download-invoice-btn');

  // 1) Helper: recalc *all* unit prices based on totalQty
  function updateAllPrices() {
    // sum total quantity across all lines
    let totalQty = 0;
    document.querySelectorAll('.qty-input').forEach(qEl => {
      const v = parseInt(qEl.value, 10);
      if (!isNaN(v)) totalQty += v;
    });

    // update each row’s price
    document.querySelectorAll('.row-item').forEach(row => {
      const garment  = row.querySelector('.garment-select').value;
      const design   = row.querySelector('.design-select').value;
      const transfer = row.querySelector('.transfer-select').value;
      const priceEl  = row.querySelector('.price-input');

      // find the pricing entry
      const entry = pricingData.find(e => e.garment === garment);
      let unitPrice = 0;
      if (entry) {
        // base garment cost
        unitPrice += entry.basePrice;

        // design tier cost
        const tiers = entry.design?.[design];
        if (tiers) {
          for (const [range, cost] of Object.entries(tiers)) {
            if (range.endsWith('+')) {
              const min = parseInt(range);
              if (totalQty >= min) unitPrice += cost;
            } else {
              const [low, high] = range.split('-').map(Number);
              if (totalQty >= low && totalQty <= high) unitPrice += cost;
            }
          }
        }

        // transfer cost per item
        if (entry.transfer && entry.transfer[transfer] != null) {
          unitPrice += entry.transfer[transfer];
        }
      }

      priceEl.value = unitPrice.toFixed(2);
    });
  }

  // 2) Create a new line‐item row
  function createLineItem() {
    const row = document.createElement('div');
    row.className = 'row g-3 align-items-end mb-2 row-item';
    row.innerHTML = `
      <div class="col-md-3">
        <label class="form-label">Garment</label>
        <select class="form-select garment-select" required>
          <option value="">Select garment</option>
          ${pricingData.map(o =>
            `<option value="${o.garment}">${o.garment}</option>`
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
        <label class="form-label">Transfer</label>
        <select class="form-select transfer-select" disabled required>
          <option value="">Select transfer</option>
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
    lineItemsContainer.append(row);

    // grab row elements
    const garmentSel  = row.querySelector('.garment-select');
    const designSel   = row.querySelector('.design-select');
    const transferSel = row.querySelector('.transfer-select');
    const qtyInput    = row.querySelector('.qty-input');

    // remove‐row handler
    row.querySelector('.remove-line-item-btn')
       .addEventListener('click', () => {
         row.remove();
         updateAllPrices();
       });

    // when garment changes → populate design & transfer
    garmentSel.addEventListener('change', () => {
      const entry = pricingData.find(e => e.garment === garmentSel.value) || {};
      // design options
      designSel.innerHTML = '<option value="">Select design</option>';
      if (entry.design) {
        Object.keys(entry.design).forEach(d => {
          designSel.innerHTML += `<option value="${d}">${d}</option>`;
        });
        designSel.disabled = false;
      } else {
        designSel.disabled = true;
      }
      // transfer options
      transferSel.innerHTML = '<option value="">Select transfer</option>';
      if (entry.transfer) {
        Object.keys(entry.transfer).forEach(t => {
          transferSel.innerHTML += `<option value="${t}">${t}</option>`;
        });
        transferSel.disabled = false;
      } else {
        transferSel.disabled = true;
      }
      // recalc prices
      updateAllPrices();
    });

    // recalc whenever design, transfer, or qty changes
    designSel.addEventListener('change', updateAllPrices);
    transferSel.addEventListener('change', updateAllPrices);
    qtyInput.addEventListener('input', updateAllPrices);
  }

  // wire up add‐row button & start with one row
  addLineItemBtn.addEventListener('click', createLineItem);
  createLineItem();

  // 3) Preview logic (unchanged aside from using updated unit prices)
  previewBtn.addEventListener('click', () => {
    // fill in header fields...
    /* your existing code to set
         preview-invoice-number, invoice-date, invoice-customer,
         invoice-project, invoice-due, invoice-status */
    // then build the items table:
    const tbody = document.getElementById('invoice-summary');
    tbody.innerHTML = '';
    let subtotal = 0;
    document.querySelectorAll('.row-item').forEach(row => {
      const desc     = row.querySelector('.garment-select').value + ' / ' +
                       row.querySelector('.design-select').value + ' / ' +
                       row.querySelector('.transfer-select').value;
      const qty      = parseInt(row.querySelector('.qty-input').value, 10) || 0;
      const unit     = parseFloat(row.querySelector('.price-input').value) || 0;
      const total    = qty * unit;
      subtotal      += total;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${desc}</td>
        <td>${qty}</td>
        <td>${unit.toFixed(2)}</td>
        <td>${total.toFixed(2)}</td>
      `;
      tbody.append(tr);
    });
    document.getElementById('invoice-total').textContent = subtotal.toFixed(2);
    document.getElementById('invoice-preview').style.display = 'block';
  });

  // 4) PDF download (unchanged)
  downloadBtn.addEventListener('click', () => {
    html2pdf().from(document.getElementById('invoice-preview'))
             .save(`invoice_${document.getElementById('invoice-number').value}.pdf`);
  });
});
