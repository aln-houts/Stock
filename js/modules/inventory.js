export class InventoryManager {
    constructor() {
        this.inventory = [];
        this.styles = new Set();
        this.colors = new Set();
        this.currentCategory = null;
    }

    async render(categoryId = null) {
        this.currentCategory = categoryId;
        const mainContent = document.getElementById('mainContent');
        
        // Get category name if viewing a specific category
        let categoryName = 'All Inventory';
        if (categoryId) {
            const category = app.modules.categories.getCategory(categoryId);
            if (category) {
                categoryName = category.name;
            }
        }

        mainContent.innerHTML = `
            <div class="row mb-3">
                <div class="col-12">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item">
                                <a href="#" onclick="app.navigateTo('inventory')">Inventory</a>
                            </li>
                            ${categoryId ? `
                                <li class="breadcrumb-item active" aria-current="page">${categoryName}</li>
                            ` : ''}
                        </ol>
                    </nav>
                </div>
            </div>

            <div class="row">
                <!-- Add Item Form -->
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Add New Item</h5>
                        </div>
                        <div class="card-body">
                            <form id="addItemForm">
                                ${categoryId ? '' : `
                                    <div class="mb-3">
                                        <label for="category" class="form-label">Category</label>
                                        <select class="form-select" id="category" required>
                                            <option value="">Select Category</option>
                                            ${app.modules.categories.categories.map(cat => `
                                                <option value="${cat.id}">${cat.name}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                `}
                                
                                <div class="mb-3">
                                    <label for="style" class="form-label">Style</label>
                                    <input type="text" class="form-control" id="style" list="styleSuggestions" required>
                                    <datalist id="styleSuggestions"></datalist>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="color" class="form-label">Color</label>
                                    <input type="text" class="form-control" id="color" list="colorSuggestions" required>
                                    <datalist id="colorSuggestions"></datalist>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="size" class="form-label">Size</label>
                                    <select class="form-select" id="size" required>
                                        <option value="">Select Size</option>
                                        <option value="XS">XS</option>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                        <option value="3X">3X</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="quantity" class="form-label">Quantity</label>
                                    <input type="number" class="form-control" id="quantity" min="1" required>
                                </div>
                                
                                <button type="submit" class="btn btn-primary w-100">Add to Inventory</button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Inventory Display -->
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">${categoryName}</h5>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary" id="refreshBtn">
                                    <i class="bi bi-arrow-clockwise"></i> Refresh
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" id="exportBtn">
                                    <i class="bi bi-download"></i> Export
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            ${categoryId ? '' : '<th>Category</th>'}
                                            <th>Style</th>
                                            <th>Color</th>
                                            <th>XS</th>
                                            <th>S</th>
                                            <th>M</th>
                                            <th>L</th>
                                            <th>XL</th>
                                            <th>XXL</th>
                                            <th>3X</th>
                                            <th>Total</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="inventoryTableBody">
                                        <!-- Inventory items will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadInventory();
    }

    setupEventListeners() {
        const form = document.getElementById('addItemForm');
        const refreshBtn = document.getElementById('refreshBtn');
        const exportBtn = document.getElementById('exportBtn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addItem();
        });

        refreshBtn.addEventListener('click', () => {
            this.loadInventory();
        });

        exportBtn.addEventListener('click', () => {
            this.exportInventory();
        });
    }

    async loadInventory() {
        try {
            const response = await fetch('/api/inventory');
            this.inventory = await response.json();
            this.updateInventoryDisplay();
            this.updateSuggestions();
        } catch (error) {
            console.error('Error loading inventory:', error);
            // Fallback to localStorage if API is not available
            const savedInventory = localStorage.getItem('inventory');
            if (savedInventory) {
                this.inventory = JSON.parse(savedInventory);
                this.updateInventoryDisplay();
                this.updateSuggestions();
            }
        }
    }

    async addItem() {
        const categoryId = this.currentCategory || document.getElementById('category').value;
        const style = document.getElementById('style').value;
        const color = document.getElementById('color').value;
        const size = document.getElementById('size').value;
        const quantity = parseInt(document.getElementById('quantity').value);

        // Add to suggestions
        this.styles.add(style);
        this.colors.add(color);

        // Find existing item or create new one
        let item = this.inventory.find(i => 
            i.categoryId === categoryId && 
            i.style === style && 
            i.color === color
        );
        
        if (!item) {
            item = {
                categoryId,
                style,
                color,
                sizes: {
                    XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3X': 0
                }
            };
            this.inventory.push(item);
        }

        // Update quantity
        item.sizes[size] = (item.sizes[size] || 0) + quantity;

        try {
            // Try to save to API
            await fetch('/api/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });
        } catch (error) {
            console.error('Error saving to API:', error);
            // Fallback to localStorage
            localStorage.setItem('inventory', JSON.stringify(this.inventory));
        }

        this.updateInventoryDisplay();
        this.updateSuggestions();
        document.getElementById('addItemForm').reset();
    }

    updateInventoryDisplay() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Filter items by category if viewing a specific category
        const items = this.currentCategory 
            ? this.inventory.filter(item => item.categoryId === this.currentCategory)
            : this.inventory;

        items.forEach(item => {
            const row = document.createElement('tr');
            const total = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
            const category = app.modules.categories.getCategory(item.categoryId);

            row.innerHTML = `
                ${this.currentCategory ? '' : `
                    <td>
                        <a href="#" class="category-link" data-category="${item.categoryId}">
                            ${category ? category.name : 'Unknown Category'}
                        </a>
                    </td>
                `}
                <td>${item.style}</td>
                <td>${item.color}</td>
                <td>${item.sizes.XS || 0}</td>
                <td>${item.sizes.S || 0}</td>
                <td>${item.sizes.M || 0}</td>
                <td>${item.sizes.L || 0}</td>
                <td>${item.sizes.XL || 0}</td>
                <td>${item.sizes.XXL || 0}</td>
                <td>${item.sizes['3X'] || 0}</td>
                <td>${total}</td>
                <td>
                    <button class="btn btn-sm btn-danger remove-item" 
                            data-category="${item.categoryId}"
                            data-style="${item.style}"
                            data-color="${item.color}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Add event listeners for category links
        tbody.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = e.currentTarget.dataset.category;
                app.navigateToCategory(categoryId);
            });
        });

        // Add event listeners for remove buttons
        tbody.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = e.currentTarget.dataset.category;
                const style = e.currentTarget.dataset.style;
                const color = e.currentTarget.dataset.color;
                this.removeItem(categoryId, style, color);
            });
        });
    }

    updateSuggestions() {
        const styleList = document.getElementById('styleSuggestions');
        const colorList = document.getElementById('colorSuggestions');
        
        if (!styleList || !colorList) return;

        styleList.innerHTML = Array.from(this.styles)
            .map(style => `<option value="${style}">`)
            .join('');

        colorList.innerHTML = Array.from(this.colors)
            .map(color => `<option value="${color}">`)
            .join('');
    }

    async removeItem(categoryId, style, color) {
        if (confirm('Are you sure you want to remove this item?')) {
            try {
                await fetch(`/api/inventory/${encodeURIComponent(categoryId)}/${encodeURIComponent(style)}/${encodeURIComponent(color)}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.error('Error removing item:', error);
            }

            this.inventory = this.inventory.filter(
                item => !(item.categoryId === categoryId && item.style === style && item.color === color)
            );
            
            localStorage.setItem('inventory', JSON.stringify(this.inventory));
            this.updateInventoryDisplay();
        }
    }

    exportInventory() {
        const headers = ['Category', 'Style', 'Color', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3X', 'Total'];
        const items = this.currentCategory 
            ? this.inventory.filter(item => item.categoryId === this.currentCategory)
            : this.inventory;

        const rows = items.map(item => {
            const total = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
            const category = app.modules.categories.getCategory(item.categoryId);
            return [
                category ? category.name : 'Unknown Category',
                item.style,
                item.color,
                item.sizes.XS || 0,
                item.sizes.S || 0,
                item.sizes.M || 0,
                item.sizes.L || 0,
                item.sizes.XL || 0,
                item.sizes.XXL || 0,
                item.sizes['3X'] || 0,
                total
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
} 