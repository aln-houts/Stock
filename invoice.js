// invoice.js
document.addEventListener('DOMContentLoaded', () => {
  // 1) Grab & parse your inline JSON
  let pricing = {};
  try {
    pricing = JSON.parse(
      document.getElementById('pricing-data').textContent
    );
  } catch (e) {
    console.error('Failed to parse pricing-data JSON:', e);
    alert('Error loading pricing data—check console.');
    return;
  }

  const lineItems = document.getElementById('line-items');
  const addBtn     = document.getElementById('add-line-item-btn');
  const previewBtn = document.getElementById('preview-invoice-btn');
  const downloadBtn= document.getElementById('download-invoice-btn');

  // 2) Build global option lists
  const garmentOpts  = pricing.garments.map(g =>
    `<option value="${g.name}">${g.name}</option>`
  ).join('');
  const designOpts   = Object.keys(pricing.designTiers || {})
    .map(d => `<option value="${d}">${d}</option>`).join('');
  const transferOpts = Object.keys(pricing.transferCosts || {})
    .map(t => `<option value="${t}">${t}</option>`).join('');

  // 3) Row-creation helper
  function createRow() {
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
    // remove-row button
    row.querySelector('.remove-line-item-btn')
       .addEventListener('click', () => row.remove());

    lineItems.append(row);
  }

  // 4) Wire up add & initial row
  addBtn.addEventListener('click', createRow);
  createRow();

  // 5) Stub out preview/download so nothing breaks
  previewBtn.addEventListener('click', () => {
    alert('Preview clicked — rows: ' + document.querySelectorAll('.row-item').length);
  });
  downloadBtn.addEventListener('click', () => {
    alert('Download clicked');
  });
});
