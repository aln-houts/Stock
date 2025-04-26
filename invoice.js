let pricingData = [];
let lineItemIndex = 0;

// Load pricing.json
fetch('pricing.json')
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
          ${pricingData.map(p => `<option value="${p.garment}">${p.garment}</option>`).join('')}
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
  const garment = selectEl.value;
  const designEl = container.querySelector('.design');
  const transferEl = container.querySelector('.transfer');

  const garmentData = pricingData.find(p => p.garment === garment);

  designEl.innerHTML = `<option value="">--</option>`;
  if (garmentData?.design) {
    for (let designType in garmentData.design) {
      designEl.innerHTML += `<option value="${designType}">${designType}</option>`;
    }
  }

  transferEl.innerHTML = `<option value="">--</option>`;
  if (garmentData?.transfer) {
    for (let transferType in garmentData.transfer) {
      transferEl.innerHTML += `<option value="${transferType}">${transferType}</option>`;
    }
  }
}

function getPriceFromTier(tiers, totalQty) {
  if (!tiers) return 0;
  for (let range in tiers) {
    const [min, max] = range.split('-');
    if (range.includes('+') && totalQty >= parseInt(range)) {
      return tiers[range];
    }
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
    const garment = item.querySelect
