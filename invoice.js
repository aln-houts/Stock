// invoice.js
document.addEventListener('DOMContentLoaded', () => {
  fetch('pricing.json')
    .then(response => response.json())
    .then(pricing => {
      const lineItemsContainer = document.getElementById('line-items');
      const addLineItemBtn     = document.getElementById('add-line-item-btn');
      const previewBtn         = document.getElementById('preview-invoice-btn');
      const downloadBtn        = document.getElementById('download-invoice-btn');

      function lookupTier(tiers, qty) {
        for (const range in tiers) {
          const cost = tiers[range];
          if (range.endsWith('+')) {
            const min = parseInt(range, 10);
            if (qty >= min) return cost;
          } else {
            const [min, max] = range.split('-').map(Number);
            if (qty >= min && qty <= max) return cost;
          }
        }
        return 0;
      }

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

          const garmentEntry = pricing.garments.find(item => item.name === g);
          let unit = garmentEntry ? garmentEntry.basePrice : 0;

          if (pricing.designTiers[d]) {
            unit += lookupTier(pricing.designTiers[d], totalQty);
          }
          if (pricing.transferCosts[t] != null) {
            unit += pricing.transferCosts[t];
          }

          priceEl.value = unit.toFixed(2);
        });
      }

      function createLineItem() {
        const row = document.createElement('div');
        row.className = 'row g-3 align-items-end mb-2 row-item';
        row.innerHTML = `
          <div class="col-md-3">
            <label class="form-label">Garment</label>
            <select class="form-select garment-select" required>
              <option value="">Select garment</option>
              ${pricing.garments.map(item => `<option>${item.name}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Design</label>
            <select class="form-select design-select" required>
              <option value="">Select design</option>
              ${Object.keys(pricing.designTiers).map(d => `<option>${d}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Transfer</label>
            <select class="form-select transfer-select" required>
              <option value="">Select transfer</option>
              ${Object.keys(pricing.transferCosts).map(t => `<option>${t}</option>`).join('')}
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

        row.querySelector('.remove-line-item-btn')
           .addEventListener('click', () => {
             row.remove();
             updateAllPrices();
           });

        ['change','input'].forEach(evt => {
          row.querySelector('.garment-select') .addEventListener(evt, updateAllPrices);
          row.querySelector('.design-select')  .addEventListener(evt, updateAllPrices);
          row.querySelector('.transfer-select').addEventListener(evt, updateAllPrices);
          row.querySelector('.qty-input')      .addEventListener(evt, updateAllPrices);
        });
      }

      addLineItemBtn.addEventListener('click', createLineItem);
      createLineItem();

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
          const qty = parseInt(row.querySelector('.qty-input').value, 10) || 0;
          const unit= parseFloat(row.querySelector('.price-input').value) || 0;
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

      downloadBtn.addEventListener('click', () => {
        html2pdf().from(document.getElementById('invoice-preview'))
                 .save(`invoice_${document.getElementById('invoice-number').value}.pdf`);
      });
    });
});
