// invoice.js
import { pricingData } from './pricing.js';

document.addEventListener('DOMContentLoaded', () => {
  const lineItems = document.getElementById('line-items');
  const addBtn     = document.getElementById('add-line-item-btn');
  const previewBtn = document.getElementById('preview-invoice-btn');
  const dlBtn      = document.getElementById('download-invoice-btn');

  // build global lists
  const allDesigns   = [...new Set(pricingData.flatMap(i => Object.keys(i.design  || {})))];
  const allTransfers = [...new Set(pricingData.flatMap(i => Object.keys(i.transfer|| {})))];

  // recalc *every* row based on totalQty
  function updateAllPrices() {
    let totalQty = 0;
    document.querySelectorAll('.qty-input').forEach(el => {
      const v = parseInt(el.value,10);
      if (!isNaN(v)) totalQty += v;
    });

    document.querySelectorAll('.row-item').forEach(row => {
      const g = row.querySelector('.garment-select').value;
      const d = row.querySelector('.design-select').value;
      const t = row.querySelector('.transfer-select').value;
      const priceEl = row.querySelector('.price-input');

      const e = pricingData.find(x => x.garment === g);
      let unit = 0;
      if (e) {
        unit += e.basePrice;
        // find design tier
        const tiers = e.design?.[d];
        if (tiers) {
          for (let [rng, cost] of Object.entries(tiers)) {
            if (rng.endsWith('+')) {
              if (totalQty >= parseInt(rng,10)) unit += cost;
            } else {
              const [low,high] = rng.split('-').map(Number);
              if (totalQty >= low && totalQty <= high) unit += cost;
            }
          }
        }
        // add transfer cost
        if (e.transfer?.[t] != null) unit += e.transfer[t];
      }
      priceEl.value = unit.toFixed(2);
    });
  }

  // create a new row
  function createLine() {
    const row = document.createElement('div');
    row.className = 'row g-3 align-items-end mb-2 row-item';
    row.innerHTML = `
      <div class="col-md-3">
        <label>Garment</label>
        <select class="form-select garment-select" required>
          <option value="">Select garment</option>
          ${pricingData.map(x => `<option>${x.garment}</option>`).join('')}
        </select>
      </div>
      <div class="col-md-3">
        <label>Design</label>
        <select class="form-select design-select" required>
          <option value="">Select design</option>
          ${allDesigns.map(d => `<option>${d}</option>`).join('')}
        </select>
      </div>
      <div class="col-md-2">
        <label>Transfer</label>
        <select class="form-select transfer-select" required>
          <option value="">Select transfer</option>
          ${allTransfers.map(t => `<option>${t}</option>`).join('')}
        </select>
      </div>
      <div class="col-md-1">
        <label>Qty</label>
        <input type="number" class="form-control qty-input" value="1" min="1" required />
      </div>
      <div class="col-md-2">
        <label>Unit Price</label>
        <input type="number" class="form-control price-input" value="0.00" readonly />
      </div>
      <div class="col-md-1">
        <button class="btn btn-danger remove-line-item-btn">–</button>
      </div>
    `;
    lineItems.append(row);

    // wire up recalc on any change
    ['change','input'].forEach(evt => {
      row.querySelector('.garment-select') .addEventListener(evt, updateAllPrices);
      row.querySelector('.design-select')  .addEventListener(evt, updateAllPrices);
      row.querySelector('.transfer-select').addEventListener(evt, updateAllPrices);
      row.querySelector('.qty-input')      .addEventListener(evt, updateAllPrices);
    });

    // remove row
    row.querySelector('.remove-line-item-btn')
       .addEventListener('click', () => {
         row.remove();
         updateAllPrices();
       });
  }

  addBtn.addEventListener('click', createLine);
  createLine();  // start with one

  // preview & PDF logic left unchanged…
  previewBtn.addEventListener('click', () => {
    // fill headers…
    updateAllPrices(); // make sure latest prices
    // build table…
  });
  dlBtn.addEventListener('click', () => {
    html2pdf().from(document.getElementById('invoice-preview'))
             .save(`invoice_${document.getElementById('invoice-number').value}.pdf`);
  });
});
