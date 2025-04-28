// invoice.js
document.addEventListener('DOMContentLoaded', () => {
  const lineItemsContainer = document.getElementById('line-items');
  const addLineItemBtn     = document.getElementById('add-line-item-btn');
  const previewBtn         = document.getElementById('preview-invoice-btn');
  const downloadBtn        = document.getElementById('download-invoice-btn');

  // Create a new line‐item row
  function createLineItem() {
    const row = document.createElement('div');
    row.className = 'row g-3 align-items-end mb-2';
    row.innerHTML = `
      <div class="col-md-6">
        <label class="form-label">Description</label>
        <input type="text" class="form-control desc-input" placeholder="Item description" required />
      </div>
      <div class="col-md-2">
        <label class="form-label">Qty</label>
        <input type="number" class="form-control qty-input" value="1" min="1" required />
      </div>
      <div class="col-md-2">
        <label class="form-label">Unit Price</label>
        <input type="number" class="form-control price-input" value="0" min="0" step="0.01" required />
      </div>
      <div class="col-md-1">
        <button type="button" class="btn btn-danger remove-line-item-btn">–</button>
      </div>
    `;
    row.querySelector('.remove-line-item-btn').addEventListener('click', () => row.remove());
    lineItemsContainer.append(row);
  }

  // Add‐item button
  addLineItemBtn.addEventListener('click', () => createLineItem());
  // Start with one
  createLineItem();

  // Build and show preview
  previewBtn.addEventListener('click', () => {
    // Header fields
    const invoiceNumber = document.getElementById('invoice-number').value;
    const invoiceDate   = document.getElementById('invoice-date-input').value;
    const customer      = document.getElementById('invoice-customer-input').value;
    const project       = document.getElementById('invoice-project-input').value;
    const dueDate       = document.getElementById('invoice-due-input').value;
    const status        = document.getElementById('invoice-status-input').value;

    // Fill in preview header
    document.getElementById('preview-invoice-number').textContent = invoiceNumber;
    document.getElementById('invoice-date').textContent           = invoiceDate;
    document.getElementById('invoice-customer').textContent       = customer;
    document.getElementById('invoice-project').textContent        = project;
    document.getElementById('invoice-due').textContent            = dueDate;
    document.getElementById('invoice-status').textContent         = status;

    // Items table
    const tbody = document.getElementById('invoice-summary');
    tbody.innerHTML = '';
    let subtotal = 0;

    lineItemsContainer.querySelectorAll('.row').forEach(row => {
      const desc  = row.querySelector('.desc-input').value;
      const qty   = parseFloat(row.querySelector('.qty-input').value) || 0;
      const price = parseFloat(row.querySelector('.price-input').value) || 0;
      const total = qty * price;
      subtotal += total;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${desc}</td>
        <td>${qty}</td>
        <td>${price.toFixed(2)}</td>
        <td>${total.toFixed(2)}</td>
      `;
      tbody.append(tr);
    });

    document.getElementById('invoice-total').textContent      = subtotal.toFixed(2);
    document.getElementById('invoice-preview').style.display = 'block';
    document.getElementById('invoice-preview').scrollIntoView({ behavior: 'smooth' });
  });

  // PDF download
  downloadBtn.addEventListener('click', () => {
    html2pdf().from(document.getElementById('invoice-preview'))
             .save(`invoice_${document.getElementById('invoice-number').value}.pdf`);
  });
});
