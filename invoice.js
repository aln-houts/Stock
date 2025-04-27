let pricingData = [];
let lineItemIndex = 0;

fetch('Stock/pricing.json')
  .then(res => res.json())
  .then(data => {
    pricingData = data;
    addLineItem();
  });

function addLineItem() {
  const container = document.getElementById('line-items');

  const div = document.createElement('div');
  div.className = 'line-item';
  div.dataset.index = lineItemIndex;

  div.innerHTML = `
    <div class="row mb-3">
      <div class="col-md-4">
        <label>Garment:</label>
        <select onchange="populateDesigns(this)" class="form-select garment">
          <option value="">-- Select Garment --</option>
          ${Object.keys(pricingData.garments).map(g => `<option value="${g}">${g}</option>`).join('')}
        </select>
      </div>
      <div class="col-md-4">
        <label>Design:</label>
        <select class="form-select design"><option value="">--</option></select>
      </div>
      <div class="col-md-4">
        <label>Transfer:</label>
        <select class="form-select transfer"><option value="">--</option></select>
      </div>
      <div class="col-md-4 mt-2">
        <label>Quantity:</label>
        <input type="number" class="form-control quantity" min="1" value="1">
      </div>
    </div>
    <hr>
  `;

  container.appendChild(div);
  lineItemIndex++;
}


function populateDesigns(selectEl) {
  const container = selectEl.closest('.line-item');
  const designEl = container.querySelector('.design');
  const transferEl = container.querySelector('.transfer');

  designEl.innerHTML = `<option value="">--</option>`;
  if (pricingData.designs) {
    for (let designType in pricingData.designs) {
      designEl.innerHTML += `<option value="${designType}">${designType}</option>`;
    }
  }

  transferEl.innerHTML = `<option value="">--</option>`;
  if (pricingData.transfers) {
    for (let transferType in pricingData.transfers) {
      transferEl.innerHTML += `<option value="${transferType}">${transferType}</option>`;
    }
  }
}

function getPriceFromTier(tiers, totalQty) {
  if (!tiers) return 0;
  for (let range in tiers) {
    if (range.includes('+') && totalQty >= parseInt(range)) {
      return tiers[range];
    }
    const [min, max] = range.split('-');
    if (totalQty >= parseInt(min) && totalQty <= parseInt(max)) {
      return tiers[range];
    }
  }
  return 0;
}

function generateInvoice() {
  const lineItems = document.querySelectorAll('.line-item');
  let totalQty = 0;
  let grandTotal = 0;

  const summaryDiv = document.getElementById('invoice-summary');
  summaryDiv.innerHTML = "";

  document.getElementById('preview-invoice-number').textContent = document.getElementById('invoice-number').value;

  lineItems.forEach(item => {
    const qty = parseInt(item.querySelector('.quantity').value, 10);
    totalQty += qty;
  });

  lineItems.forEach(item => {
    const garment = item.querySelector('.garment').value;
    const designType = item.querySelector('.design').value;
    const transfer = item.querySelector('.transfer').value;
    const qty = parseInt(item.querySelector('.quantity').value, 10);

    const basePrice = pricingData.garments[garment] || 0;

    let designPrice = 0;
    if (designType && pricingData.designs[designType]) {
      designPrice = getPriceFromTier(pricingData.designs[designType], totalQty);
    }

    const transferPrice = transfer ? pricingData.transfers[transfer] || 0 : 0;

    const unitPrice = basePrice + designPrice + transferPrice;
    const lineTotal = unitPrice * qty;
    grandTotal += lineTotal;

    summaryDiv.innerHTML += `
      <tr>
        <td style="padding:8px; border:1px solid #ddd;">${garment}${designType ? ` - ${designType}` : ''}${transfer ? ` (${transfer})` : ''}</td>
        <td style="padding:8px; border:1px solid #ddd;">${qty}</td>
        <td style="padding:8px; border:1px solid #ddd;">$${unitPrice.toFixed(2)}</td>
        <td style="padding:8px; border:1px solid #ddd;">$${lineTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  document.getElementById('invoice-total').textContent = `$${grandTotal.toFixed(2)}`;

  document.getElementById('invoice-preview').style.display = 'block';
}

function downloadInvoice() {
  const element = document.getElementById('invoice-preview');

  const opt = {
    margin: 0.5,
    filename: `Invoice-${document.getElementById('invoice-number').value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}
