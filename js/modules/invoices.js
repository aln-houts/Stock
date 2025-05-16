export class InvoiceManager {
    constructor() {
        this.invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        this.currentInvoice = null;
        this.lineItems = [];
        this.settings = JSON.parse(localStorage.getItem('settings')) || {
            companyName: '',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            companyWebsite: '',
            logoUrl: '',
            taxRate: 10
        };
        this.pricing = {
            garments: [
                { name: "T-shirt G6400",            basePrice: 5.5  },
                { name: "T-shirt G500",             basePrice: 4.50 },
                { name: "T-shirt Fruit essential",  basePrice: 4.5  },
                { name: "Long Sleeve G240",         basePrice: 8.5  },
                { name: "Pocket Tee G230",          basePrice: 8.75 },
                { name: "Raglan G570",              basePrice: 8.75 },
                { name: "Tank Top",                 basePrice: 6.75 },
                { name: "Bucket Hat",               basePrice: 3.5  },
                { name: "Hoodie G185",              basePrice: 14.5 }
            ],
            designTiers: {
                "Single Press": { "1-11": 6,   "12-24": 5.5,   "25-48": 5,   "49-96": 4.5,  "97+": 4 },
                "Double Side":   { "1-11": 7,   "12-24": 6.5, "25-48": 6, "49-96": 5.5,  "97+": 5}
            },
            transferCosts: {
                "12x5.4":             0.75,
                "4x4":                0.25,
                "12x11":              1.5,
                "12x11 plus pocket":  1.75,
                "11x18":              2.25,
                "12x22":              2.75
            }
        };
    }

    getQuantityTier(quantity) {
        if (quantity >= 97) return "97+";
        if (quantity >= 49) return "49-96";
        if (quantity >= 25) return "25-48";
        if (quantity >= 12) return "12-24";
        return "1-11";
    }

    getTotalQuantity() {
        let total = 0;
        document.querySelectorAll('.line-item').forEach(item => {
            const quantity = parseInt(item.querySelector('.quantity').value) || 0;
            total += quantity;
        });
        return total;
    }

    calculateItemPrice(garment, designType, transferSize, quantity) {
        const garmentInfo = this.pricing.garments.find(g => g.name === garment);
        if (!garmentInfo) return 0;

        // Use total quantity across all items for tier pricing
        const totalQuantity = this.getTotalQuantity();
        const quantityTier = this.getQuantityTier(totalQuantity);
        const designPrice = this.pricing.designTiers[designType]?.[quantityTier] || 0;
        const transferCost = this.pricing.transferCosts[transferSize] || 0;

        const price = garmentInfo.basePrice + designPrice + transferCost;
        return isNaN(price) ? 0 : price;
    }

    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">Create Invoice</h5>
                            <div class="btn-group">
                                <button class="btn btn-outline-primary btn-sm" id="previewInvoiceBtn">
                                    <i class="bi bi-eye"></i> Preview
                                </button>
                                <button class="btn btn-primary btn-sm" id="saveInvoiceBtn">
                                    <i class="bi bi-save"></i> Save Invoice
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <form id="invoiceForm">
                                <!-- Invoice Header -->
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="invoiceNumber" class="form-label">Invoice Number</label>
                                            <input type="text" class="form-control" id="invoiceNumber" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="invoiceDate" class="form-label">Date</label>
                                            <input type="date" class="form-control" id="invoiceDate" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="customerName" class="form-label">Customer Name</label>
                                            <input type="text" class="form-control" id="customerName" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="customerEmail" class="form-label">Customer Email</label>
                                            <input type="email" class="form-control" id="customerEmail">
                                        </div>
                                    </div>
                                </div>

                                <!-- Line Items -->
                                <div class="mb-4">
                                    <h6>Line Items</h6>
                                    <div id="lineItems">
                                        ${this.renderLineItems()}
                                    </div>
                                    <button type="button" class="btn btn-outline-primary btn-sm mt-2" id="addLineItemBtn">
                                        <i class="bi bi-plus"></i> Add Item
                                    </button>
                                </div>

                                <!-- Totals -->
                                <div class="row">
                                    <div class="col-md-6 offset-md-6">
                                        <table class="table table-sm">
                                            <tr>
                                                <td>Subtotal:</td>
                                                <td class="text-end" id="subtotal">$0.00</td>
                                            </tr>
                                            <tr>
                                                <td>Tax (10%):</td>
                                                <td class="text-end" id="tax">$0.00</td>
                                            </tr>
                                            <tr class="fw-bold">
                                                <td>Total:</td>
                                                <td class="text-end" id="total">$0.00</td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Line Item Template -->
            <template id="lineItemTemplate">
                <div class="line-item row mb-2">
                    <div class="col-md-3">
                        <select class="form-select form-select-sm garment-type" required>
                            <option value="">Select Garment</option>
                            ${this.pricing.garments.map(garment => `
                                <option value="${garment.name}">${garment.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select form-select-sm design-type" required>
                            <option value="">Select Design</option>
                            ${Object.keys(this.pricing.designTiers).map(type => `
                                <option value="${type}">${type}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select form-select-sm transfer-size" required>
                            <option value="">Select Size</option>
                            ${Object.keys(this.pricing.transferCosts).map(size => `
                                <option value="${size}">${size}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="col-md-2">
                        <input type="number" class="form-control form-control-sm quantity" placeholder="Qty" min="1" value="1" required>
                    </div>
                    <div class="col-md-2">
                        <input type="text" class="form-control form-control-sm price" placeholder="Price" readonly>
                    </div>
                    <div class="col-md-1">
                        <button type="button" class="btn btn-outline-danger btn-sm remove-item">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </template>

            <!-- Preview Modal -->
            <div class="modal fade" id="previewModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Invoice Preview</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="previewContent">
                            <!-- Preview content will be inserted here -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="downloadInvoiceBtn">
                                <i class="bi bi-download"></i> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.updateTotals();
    }

    renderLineItems() {
        if (this.lineItems.length === 0) {
            return `
                <div class="text-center text-muted py-3">
                    No items added yet. Click "Add Item" to start.
                </div>
            `;
        }

        return this.lineItems.map((item, index) => `
            <div class="line-item row mb-2">
                <div class="col-md-3">
                    <select class="form-select form-select-sm garment-type" required>
                        <option value="">Select Garment</option>
                        ${this.pricing.garments.map(garment => `
                            <option value="${garment.name}" ${item.garment === garment.name ? 'selected' : ''}>${garment.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <select class="form-select form-select-sm design-type" required>
                        <option value="">Select Design</option>
                        ${Object.keys(this.pricing.designTiers).map(type => `
                            <option value="${type}" ${item.designType === type ? 'selected' : ''}>${type}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <select class="form-select form-select-sm transfer-size" required>
                        <option value="">Select Size</option>
                        ${Object.keys(this.pricing.transferCosts).map(size => `
                            <option value="${size}" ${item.transferSize === size ? 'selected' : ''}>${size}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control form-control-sm quantity" placeholder="Qty" min="1" value="${item.quantity || 1}" required>
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control form-control-sm price" placeholder="Price" readonly>
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-outline-danger btn-sm remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        const addLineItemBtn = document.getElementById('addLineItemBtn');
        const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
        const previewInvoiceBtn = document.getElementById('previewInvoiceBtn');
        const downloadInvoiceBtn = document.getElementById('downloadInvoiceBtn');
        const lineItems = document.getElementById('lineItems');

        // Add new line item
        addLineItemBtn.addEventListener('click', () => {
            const template = document.getElementById('lineItemTemplate');
            const clone = template.content.cloneNode(true);
            lineItems.appendChild(clone);
            this.setupLineItemListeners(lineItems.lastElementChild);
            this.updateTotals();
        });

        // Save invoice
        saveInvoiceBtn.addEventListener('click', () => {
            if (this.validateInvoiceForm()) {
                this.saveInvoice();
            }
        });

        // Preview invoice
        previewInvoiceBtn.addEventListener('click', () => {
            if (this.validateInvoiceForm()) {
                this.previewInvoice();
            }
        });

        // Download invoice
        downloadInvoiceBtn.addEventListener('click', () => {
            this.downloadInvoice();
        });

        // Setup existing line items
        document.querySelectorAll('.line-item').forEach(item => {
            this.setupLineItemListeners(item);
        });
    }

    setupLineItemListeners(lineItem) {
        const garmentSelect = lineItem.querySelector('.garment-type');
        const designSelect = lineItem.querySelector('.design-type');
        const transferSelect = lineItem.querySelector('.transfer-size');
        const quantityInput = lineItem.querySelector('.quantity');
        const priceInput = lineItem.querySelector('.price');
        const removeBtn = lineItem.querySelector('.remove-item');

        const updatePrice = () => {
            const garment = garmentSelect.value;
            const designType = designSelect.value;
            const transferSize = transferSelect.value;
            const quantity = parseInt(quantityInput.value) || 0;

            if (garment && designType && transferSize && quantity > 0) {
                const price = this.calculateItemPrice(garment, designType, transferSize, quantity);
                priceInput.value = `$${price.toFixed(2)}`;
                this.updateLineItemTotal(lineItem);
            } else {
                priceInput.value = '';
            }
        };

        // Update price when any selection changes
        [garmentSelect, designSelect, transferSelect, quantityInput].forEach(element => {
            element.addEventListener('change', () => {
                updatePrice();
                // Update all other line items when quantity changes
                document.querySelectorAll('.line-item').forEach(item => {
                    if (item !== lineItem) {
                        const itemGarment = item.querySelector('.garment-type').value;
                        const itemDesign = item.querySelector('.design-type').value;
                        const itemTransfer = item.querySelector('.transfer-size').value;
                        const itemQuantity = parseInt(item.querySelector('.quantity').value) || 0;
                        
                        if (itemGarment && itemDesign && itemTransfer && itemQuantity > 0) {
                            const itemPrice = this.calculateItemPrice(itemGarment, itemDesign, itemTransfer, itemQuantity);
                            item.querySelector('.price').value = `$${itemPrice.toFixed(2)}`;
                            this.updateLineItemTotal(item);
                        }
                    }
                });
            });
        });

        // Initial price update if all fields are filled
        updatePrice();

        // Remove line item
        removeBtn.addEventListener('click', () => {
            lineItem.remove();
            // Update prices for remaining items after removal
            document.querySelectorAll('.line-item').forEach(item => {
                const itemGarment = item.querySelector('.garment-type').value;
                const itemDesign = item.querySelector('.design-type').value;
                const itemTransfer = item.querySelector('.transfer-size').value;
                const itemQuantity = parseInt(item.querySelector('.quantity').value) || 0;
                
                if (itemGarment && itemDesign && itemTransfer && itemQuantity > 0) {
                    const itemPrice = this.calculateItemPrice(itemGarment, itemDesign, itemTransfer, itemQuantity);
                    item.querySelector('.price').value = `$${itemPrice.toFixed(2)}`;
                    this.updateLineItemTotal(item);
                }
            });
            this.updateTotals();
        });
    }

/**
 * Recalculates and displays:
 * 1) The unit price in the .price input
 * 2) The line-item total (unit price × quantity) in the total-display
 * 3) Updates the invoice subtotals
 */
/**
 * Recalculate unit price & total for one line, 
 * store the total on the element, then refresh the invoice summary.
 */
updateLineItemTotal(lineItem) {
  // Read quantity and selections
  const qty = parseFloat(lineItem.querySelector('.quantity').value) || 0;
  const g   = lineItem.querySelector('.garment-type').value;
  const d   = lineItem.querySelector('.design-type').value;
  const t   = lineItem.querySelector('.transfer-size').value;

  // Compute unit price (quantity = 1) and line total
  const unitPrice = this.calculateItemPrice(g, d, t, 1);
  const lineTotal = unitPrice * qty;

  // Show unit price
  const priceInput = lineItem.querySelector('.price');
  priceInput.value = `$${unitPrice.toFixed(2)}`;

  // Show line total in .total-display
  let disp = lineItem.querySelector('.total-display');
  if (!disp) {
    disp = document.createElement('div');
    disp.className = 'col-md-2 total-display';
    lineItem.appendChild(disp);
  }
  disp.textContent = `$${lineTotal.toFixed(2)}`;

  // **Stash** the numeric total onto the element for easy summing
  lineItem.dataset.lineTotal = lineTotal;

  // Recompute the invoice summary
  this.updateTotals();
}


    validateInvoiceForm() {
        const form = document.getElementById('invoiceForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        return true;
    }

/**
 * Sum the previously stored line-totals and update Subtotal, Tax, Total.
 */
updateTotals() {
  // Sum all line-item totals (from dataset)
  const subtotal = Array.from(document.querySelectorAll('.line-item'))
    .reduce((sum, li) => {
      return sum + (parseFloat(li.dataset.lineTotal) || 0);
    }, 0);

  // Load dynamic taxRate (%) from settings
  const settings = this.app.modules.settings.getSettings();
  const taxRate  = (parseFloat(settings.taxRate) || 0) / 100;

  const tax        = subtotal * taxRate;
  const grandTotal = subtotal + tax;

  // Update the DOM
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent      = `$${tax.toFixed(2)}`;
  document.getElementById('total').textContent    = `$${grandTotal.toFixed(2)}`;
}

    saveInvoice() {
        const invoice = {
            id: crypto.randomUUID(),
            number: document.getElementById('invoiceNumber').value,
            date: document.getElementById('invoiceDate').value,
            customerName: document.getElementById('customerName').value,
            customerEmail: document.getElementById('customerEmail').value,
            items: Array.from(document.querySelectorAll('.line-item')).map(item => ({
                garment: item.querySelector('.garment-type').value,
                designType: item.querySelector('.design-type').value,
                transferSize: item.querySelector('.transfer-size').value,
                quantity: parseFloat(item.querySelector('.quantity').value),
                price: parseFloat(item.querySelector('.price').value),
                total: parseFloat(item.querySelector('input[readonly]').value.replace('$', ''))
            })),
            subtotal: parseFloat(document.getElementById('subtotal').textContent.replace('$', '')),
            tax: parseFloat(document.getElementById('tax').textContent.replace('$', '')),
            total: parseFloat(document.getElementById('total').textContent.replace('$', '')),
            createdAt: new Date().toISOString()
        };

        this.invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(this.invoices));
        
        // Reset form
        document.getElementById('invoiceForm').reset();
        document.getElementById('lineItems').innerHTML = '';
        this.updateTotals();
        
        alert('Invoice saved successfully!');
    }

    getItemCostBreakdown(garment, designType, transferSize, quantity) {
        const garmentInfo = this.pricing.garments.find(g => g.name === garment);
        if (!garmentInfo) return null;

        const quantityTier = this.getQuantityTier(quantity);
        const designPrice = this.pricing.designTiers[designType][quantityTier];
        const transferCost = this.pricing.transferCosts[transferSize] || 0;
        const totalPerItem = garmentInfo.basePrice + designPrice + transferCost;

        return {
            garment: garmentInfo.basePrice,
            design: designPrice,
            transfer: transferCost,
            totalPerItem: totalPerItem
        };
    }

    previewInvoice() {
        const previewContent = document.getElementById('previewContent');
        const invoiceData = this.getCurrentInvoiceData();
        
        previewContent.innerHTML = `
            <div class="invoice-preview p-4">
                <div class="row mb-4">
                    <div class="col-6">
                        ${this.settings.logoUrl ? `
                            <img src="${this.settings.logoUrl}" alt="Company Logo" style="max-height: 100px; margin-bottom: 1rem;">
                        ` : ''}
                        <h4>${this.settings.companyName || 'INVOICE'}</h4>
                        ${this.settings.companyAddress ? `<p class="mb-1">${this.settings.companyAddress}</p>` : ''}
                        ${this.settings.companyPhone ? `<p class="mb-1">Phone: ${this.settings.companyPhone}</p>` : ''}
                        ${this.settings.companyEmail ? `<p class="mb-1">Email: ${this.settings.companyEmail}</p>` : ''}
                        ${this.settings.companyWebsite ? `<p class="mb-1">Website: ${this.settings.companyWebsite}</p>` : ''}
                    </div>
                    <div class="col-6 text-end">
                        <h5>Bill To:</h5>
                        <p class="mb-1">${invoiceData.customerName}</p>
                        <p class="mb-1">${invoiceData.customerEmail}</p>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-6">
                        <p class="mb-1"><strong>Invoice #:</strong> ${invoiceData.number}</p>
                        <p class="mb-1"><strong>Date:</strong> ${new Date(invoiceData.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Garment</th>
                            <th>Design Type</th>
                            <th>Transfer Size</th>
                            <th class="text-end">Quantity</th>
                            <th class="text-end">Price</th>
                            <th class="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoiceData.items.map(item => `
                            <tr>
                                <td>${item.garment}</td>
                                <td>${item.designType}</td>
                                <td>${item.transferSize}</td>
                                <td class="text-end">${item.quantity}</td>
                                <td class="text-end">$${item.price.toFixed(2)}</td>
                                <td class="text-end">$${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5" class="text-end"><strong>Subtotal:</strong></td>
                            <td class="text-end">$${invoiceData.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="5" class="text-end"><strong>Tax (${this.settings.taxRate}%):</strong></td>
                            <td class="text-end">$${invoiceData.tax.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="5" class="text-end"><strong>Total:</strong></td>
                            <td class="text-end"><strong>$${invoiceData.total.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('previewModal'));
        modal.show();
    }

    downloadInvoice() {
        const invoiceData = this.getCurrentInvoiceData();
        const invoiceHtml = document.getElementById('previewContent').innerHTML;
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoiceData.number}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${invoiceHtml}
                <div class="text-center mt-4 no-print">
                    <button onclick="window.print()" class="btn btn-primary">Print Invoice</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    /**
 * Gather all current line-items, recalc totals properly,
 * then pull subtotal/tax/total from the DOM summary for preview.
 */
		getCurrentInvoiceData() {
  // 1) Collect each row’s data into an array
  const items = Array.from(document.querySelectorAll('.line-item')).map(line => {
    const garment      = line.querySelector('.garment-type').value;
    const designType   = line.querySelector('.design-type').value;
    const transferSize = line.querySelector('.transfer-size').value;
    const quantity     = parseInt(line.querySelector('.quantity').value.replace(/[^0-9\-]+/g, ''), 10) || 0;
    const price        = parseFloat(
      line.querySelector('.price').value.replace(/[^0-9.-]+/g, '')
    ) || 0;

    // **TOTAL** is always quantity × unit price
    const total = quantity * price;

    return { garment, designType, transferSize, quantity, price, total };
  });

  // 2) Read the invoice summary fields (subtotal, tax, total)
  const subtotal = parseFloat(
    document.getElementById('subtotal').textContent.replace(/[^0-9.-]+/g, '')
  ) || 0;
  const tax      = parseFloat(
    document.getElementById('tax').textContent.replace(/[^0-9.-]+/g, '')
  ) || 0;
  const total    = parseFloat(
    document.getElementById('total').textContent.replace(/[^0-9.-]+/g, '')
  ) || 0;

  // 3) Return the full dataset
  return { items, subtotal, tax, total };
}
