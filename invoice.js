let pricingData = [];
let lineItemIndex = 0;

// Load pricing.json
fetch('pricing.json')
  .then(res => res.json())
  .then(data => {
    pricingData = data;
    addLineItem(); // Add first line item on page load
  });

function addLineItem() {
  const container = document.getElementById('line-items');

  const div = document.createElement('div');
  div.className = 'line-item';
  div.dataset.index = lineItemIndex;

  div.innerHTML = `
    <label>Garment:</label>
    <select onchange="populateDesigns(this)" class="garment">
      <option value="">-- Select Garment --</option>
      ${pricingData.map(p => `<option value="${p.garment}">${p.garment}</option>`).join('')}
    </select>

    <label>Design:</label>
    <select class="design"><option value="">--</option></select>

    <label>Transfer:</label>
    <select class="transfer"><option value="">--</option></select>

    <label>Quantity:</label>
    <input type="number" class="quantity" min="1" value="1">
    <hr>
  `;

  container.appendChild(div);
  lineItemIndex++;
}

function populateDesigns(selectEl) {
  const container = selectEl.closest('.line-item');
  const garment = selectEl.value;
  const designEl = container.querySelector('.design');
  const transferEl = container.querySelector('.transfer');

  const garmentData = pricingData.find(p => p.garment === garment);

  // Populate Design Options
  designEl.innerHTML = `<option value="">--</option>`;
  if (garmentData.design) {
    for (let designType in garmentData.design) {
      designEl.innerHTML += `<option value="${designType}">${designType}</option>`;
    }
  }

  // Populate Transfer Options
  transferEl.innerHTML = `<option value="">--</option>`;
  if (garmentData.transfer) {
    for (let transfer in garmentData.transfer) {
      transferEl.innerHTML += `<option value="${transfer}">${transfer}</option>`;
    }
  }
}

function getPriceFromTier(tiers, totalQty) {
  for (let range in tiers) {
    const [min, max] = range.split('-');
    if (range === "49+" && totalQty >= 49) return tiers[range];
    if (totalQty >= parseInt(min) && totalQty <= parseInt(max)) {
      return tiers[range];
    }
  }
  return null;
}

function generateInvoice() {
  const lineItems = document.querySelectorAll('.line-item');
  let totalQty = 0;
  const invoiceRows = [];

  // First, calculate total quantity
  lineItems.forEach(item => {
    const qty = parseInt(item.querySelector('.quantity').value, 10);
    totalQty += qty;
  });

  let grandTotal = 0;
  const summaryDiv = document.getElementById('invoice-summary');
  summaryDiv.innerHTML = "";

  lineItems.forEach(item => {
    const garment = item.querySelector('.garment').value;
    const design = item.querySelector('.design').value;
    const transfer = item.querySelector('.transfer').value;
    const qty = parseInt(item.querySelector('.quantity').value, 10);

    const garmentData = pricingData.find(p => p.garment === garment);
    const base = garmentData?.basePrice || 0;
    const designPrice = design ? getPriceFromTier(garmentData?.design?.[design], totalQty) || 0 : 0;
    const transferPrice = transfer ? garmentData?.transfer?.[transfer] || 0 : 0;

    const unitPrice = base + designPrice + transferPrice;
    const lineTotal = unitPrice * qty;
    grandTotal += lineTotal;

    summaryDiv.innerHTML += `
      <p>
        ${qty} × ${garment} (${design || 'No Design'} + ${transfer || 'No Transfer'}) = $${lineTotal.toFixed(2)}<br>
        <small>($${base.toFixed(2)} + $${designPrice.toFixed(2)} + $${transferPrice.toFixed(2)} × ${qty})</small>
      </p>
    `;
  });

  document.getElementById('total-qty').textContent = totalQty;
  document.getElementById('invoice-total').textContent = grandTotal.toFixed(2);
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
