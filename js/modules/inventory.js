export class InventoryManager {
    constructor() {
        this.inventory = [];
        this.suggestions = {
            styles: {}, // { categoryId: Set(styles) }
            colors: {}, // { categoryId: { style: Set(colors) } }
        };
        this.currentCategory = null;
    }

    // Helper method to calculate total quantity for an item
    calculateTotalQuantity(item) {
        if (item.sizes) {
            return Object.values(item.sizes).reduce((sum, qty) => sum + parseInt(qty), 0);
        }
        return parseInt(item.quantity) || 0;
    }

    // Helper method to create a new item
    createNewItem(categoryId, fields) {
        const newItem = {
            id: crypto.randomUUID(),
            categoryId,
            createdAt: new Date().toISOString()
        };

        // Add fields based on category definition
        fields.forEach(field => {
            const fieldId = `item${field.type.charAt(0).toUpperCase() + field.type.slice(1)}`;
            const value = document.getElementById(fieldId).value;
            if (field.required && !value) {
                throw new Error(`${field.type} is required`);
            }
            newItem[field.type] = value;
        });

        // Handle size and quantity
        if (newItem.size) {
            newItem.sizes = {
                [newItem.size]: parseInt(newItem.quantity)
            };
            delete newItem.size;
            delete newItem.quantity;
        }

        return newItem;
    }

    // Helper method to update suggestions
    updateSuggestionsForItem(item) {
        const { categoryId, style, color } = item;
        
        // Initialize category sets if needed
        if (!this.suggestions.styles[categoryId]) {
            this.suggestions.styles[categoryId] = new Set();
        }
        if (!this.suggestions.colors[categoryId]) {
            this.suggestions.colors[categoryId] = {};
        }
        if (style && !this.suggestions.colors[categoryId][style]) {
            this.suggestions.colors[categoryId][style] = new Set();
        }

        // Add to suggestions
        if (style) {
            this.suggestions.styles[categoryId].add(style);
        }
        if (style && color) {
            this.suggestions.colors[categoryId][style].add(color);
        }
    }

    async addItem() {
        try {
            const categoryId = this.currentCategory || document.getElementById('category')?.value;
            if (!categoryId) {
                throw new Error('Please select a category');
            }

            const category = app.modules.categories.getCategory(categoryId);
            if (!category) {
                throw new Error('Selected category not found');
            }

            // Create new item
            const newItem = {
                id: crypto.randomUUID(),
                categoryId,
                createdAt: new Date().toISOString()
            };

            // Get values for each field defined in the category
            category.fields.forEach(field => {
                if (field.type === 'size') {
                    // Handle size quantities
                    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X'];
                    newItem.sizes = {};
                    let hasAnyQuantity = false;

                    sizes.forEach(size => {
                        const input = document.getElementById(`size_${size}`);
                        if (!input) {
                            console.warn(`Size input for ${size} not found`);
                            return;
                        }
                        const quantity = parseInt(input.value) || 0;
                        // Always add the size to the object, even if quantity is 0
                        newItem.sizes[size] = quantity;
                        if (quantity > 0) {
                            hasAnyQuantity = true;
                        }
                    });

                    if (!hasAnyQuantity) {
                        throw new Error('Please enter at least one quantity greater than 0');
                    }
                } else if (field.type === 'quantity') {
                    // Handle regular quantity
                    const fieldId = `item${field.type.charAt(0).toUpperCase() + field.type.slice(1)}`;
                    const input = document.getElementById(fieldId);
                    if (!input) {
                        console.warn(`Input for ${field.type} not found`);
                        return;
                    }
                    const quantity = parseInt(input.value) || 0;
                    if (field.required && quantity <= 0) {
                        throw new Error('Quantity must be greater than 0');
                    }
                    newItem.quantity = quantity;
                } else {
                    const fieldId = `item${field.type.charAt(0).toUpperCase() + field.type.slice(1)}`;
                    const input = document.getElementById(fieldId);
                    if (!input) {
                        console.warn(`Input for ${field.type} not found`);
                        return;
                    }
                    const value = input.value.trim();
                    if (field.required && !value) {
                        throw new Error(`${field.type} is required`);
                    }
                    newItem[field.type] = value;
                }
            });

            // Validate required fields
            if (!newItem.style) {
                throw new Error('Style is required');
            }
            if (!newItem.color) {
                throw new Error('Color is required');
            }

            // Update suggestions
            this.updateSuggestionsForItem(newItem);

            // Check for existing item
            const existingItem = this.inventory.find(item => 
                item.categoryId === categoryId && 
                item.style === newItem.style && 
                item.color === newItem.color
            );

            if (existingItem) {
                if (newItem.sizes) {
                    // For sized items, update the size quantities
                    Object.entries(newItem.sizes).forEach(([size, qty]) => {
                        existingItem.sizes[size] = (existingItem.sizes[size] || 0) + qty;
                    });
                } else {
                    // For non-sized items, add quantities
                    existingItem.quantity = (parseInt(existingItem.quantity) || 0) + parseInt(newItem.quantity || 0);
                }
            } else {
                this.inventory.push(newItem);
            }

            // Save to localStorage
            localStorage.setItem('inventory', JSON.stringify(this.inventory));

            // Update UI
            this.updateInventoryDisplay();
            this.updateDatalists();
            
            // Reset form
            const form = document.getElementById('addItemForm');
            if (form) {
                form.reset();
                // Reset size inputs to 0
                ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X'].forEach(size => {
                    const input = document.getElementById(`size_${size}`);
                    if (input) input.value = '0';
                });
            }

        } catch (error) {
            alert(error.message);
            console.error('Error adding item:', error);
        }
    }

    async render(categoryId = null) {
        this.currentCategory = categoryId;
        const mainContent = document.getElementById('mainContent');
        
        // Get category name if viewing a specific category
        let categoryName = 'All Inventory';
        let category = null;
        if (categoryId) {
            category = app.modules.categories.getCategory(categoryId);
            if (category) {
                categoryName = category.name;
            }
        }

        // Check if the category uses sizes
        const usesSizes = category ? category.fields.some(field => field.type === 'size') : false;

        // Remove any existing datalists to prevent conflicts
        document.querySelectorAll('datalist').forEach(datalist => datalist.remove());

        mainContent.innerHTML = `
            <div class="row mb-3">
                <div class="col-12">
                    <div class="btn-group">
                        <a href="#" class="btn btn-outline-primary" onclick="app.navigateTo('inventory')">
                            All Inventory
                        </a>
                        ${app.modules.categories.categories.map(cat => `
                            <a href="#" class="btn btn-outline-primary ${cat.id === categoryId ? 'active' : ''}" 
                               onclick="app.navigateToCategory('${cat.id}')">
                                ${cat.name}
                            </a>
                        `).join('')}
                    </div>
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
                                
                                <div id="dynamicFields">
                                    ${category ? this.generateFormFields(category.fields) : ''}
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
                                            ${usesSizes ? `
                                                <th>XS</th>
                                                <th>S</th>
                                                <th>M</th>
                                                <th>L</th>
                                                <th>XL</th>
                                                <th>XXL</th>
                                                <th>3X</th>
                                                <th>Total</th>
                                            ` : `
                                                <th>Quantity</th>
                                            `}
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
        const categorySelect = document.getElementById('category');

        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                const categoryId = e.target.value;
                const category = app.modules.categories.getCategory(categoryId);
                if (category) {
                    const dynamicFields = document.getElementById('dynamicFields');
                    dynamicFields.innerHTML = this.generateFormFields(category.fields);
                    this.updateDatalists(); // Update suggestions when category changes
                }
            });
        }

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

    generateFormFields(fields) {
        // Check if this category uses sizes
        const usesSizes = fields.some(field => field.type === 'size');
        
        // Filter out the quantity field if sizes are used
        const filteredFields = fields.filter(field => {
            if (usesSizes && field.type === 'quantity') {
                return false;
            }
            return true;
        });

        return filteredFields.map(field => this.generateFormField(field)).join('');
    }

    generateFormField(field) {
        const required = field.required ? 'required' : '';
        const fieldId = `item${field.type.charAt(0).toUpperCase() + field.type.slice(1)}`;
        const categoryId = this.currentCategory || document.getElementById('category')?.value;
        const datalistId = categoryId ? `${field.type}Suggestions_${categoryId}` : `${field.type}Suggestions_all`;
        
        switch (field.type) {
            case 'style':
                return `
                    <div class="mb-3">
                        <label for="${fieldId}" class="form-label">Style</label>
                        <input type="text" class="form-control" id="${fieldId}" 
                               list="${datalistId}" ${required}>
                        <datalist id="${datalistId}"></datalist>
                    </div>
                `;
            case 'color':
                return `
                    <div class="mb-3">
                        <label for="${fieldId}" class="form-label">Color</label>
                        <input type="text" class="form-control" id="${fieldId}" 
                               list="${datalistId}" ${required}>
                        <datalist id="${datalistId}"></datalist>
                    </div>
                `;
            case 'size':
                return `
                    <div class="mb-3">
                        <label class="form-label">Size Quantities</label>
                        <div class="row row-cols-7 g-2">
                            <div class="col">
                                <label class="form-label small text-center d-block">XS</label>
                                <input type="number" class="form-control form-control-sm" 
                                       id="size_XS" min="0" value="0">
                            </div>
                            <div class="col">
                                <label class="form-label small text-center d-block">S</label>
                                <input type="number" class="form-control form-control-sm" 
                                       id="size_S" min="0" value="0">
                            </div>
                            <div class="col">
                                <label class="form-label small text-center d-block">M</label>
                                <input type="number" class="form-control form-control-sm" 
                                       id="size_M" min="0" value="0">
                            </div>
                            <div class="col">
                                <label class="form-label small text-center d-block">L</label>
                                <input type="number" class="form-control form-control-sm" 
                                       id="size_L" min="0" value="0">
                            </div>
                            <div class="col">
                                <label class="form-label small text-center d-block">XL</label>
                                <input type="number" class="form-control form-control-sm" 
                                       id="size_XL" min="0" value="0">
                            </div>
                            <div class="col">
                                <label class="form-label small text-center d-block">XXL</label>
                                <input type="number" class="form-control form-control-sm" 
                                       id="size_XXL" min="0" value="0">
                            </div>
                            <div class="col">
                                <label class="form-label small text-center d-block">3X</label>
                                <input type="number" class="form-control form-control-sm" 
                                       id="size_3X" min="0" value="0">
                            </div>
                        </div>
                    </div>
                `;
            case 'quantity':
                return `
                    <div class="mb-3">
                        <label for="${fieldId}" class="form-label">Quantity</label>
                        <input type="number" class="form-control" id="${fieldId}" min="0" ${required}>
                    </div>
                `;
            default:
                return '';
        }
    }

    async loadInventory() {
        // Load from localStorage
        const savedInventory = localStorage.getItem('inventory');
        if (savedInventory) {
            try {
                this.inventory = JSON.parse(savedInventory);
            } catch (error) {
                console.error('Error parsing inventory data:', error);
                this.inventory = [];
            }
        } else {
            this.inventory = [];
        }

        // Update suggestions
        this.updateSuggestions();
        
        // Update display
        this.updateInventoryDisplay();
    }

    updateInventoryDisplay() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Filter items by category if viewing a specific category
        let items = this.currentCategory 
            ? this.inventory.filter(item => item.categoryId === this.currentCategory)
            : this.inventory;

        // Get category to check if it uses sizes
        const category = this.currentCategory ? app.modules.categories.getCategory(this.currentCategory) : null;
        const usesSizes = category ? category.fields.some(field => field.type === 'size') : false;

        // If not viewing a specific category, combine items with same style and color
        if (!this.currentCategory) {
            const combinedItems = new Map();
            
            items.forEach(item => {
                const key = `${item.categoryId}-${item.style}-${item.color}`;
                if (!combinedItems.has(key)) {
                    combinedItems.set(key, {
                        ...item,
                        sizes: item.sizes ? { ...item.sizes } : undefined,
                        quantity: item.quantity || 0
                    });
                } else {
                    const existing = combinedItems.get(key);
                    if (item.sizes) {
                        // Combine sizes
                        Object.entries(item.sizes).forEach(([size, qty]) => {
                            existing.sizes[size] = (existing.sizes[size] || 0) + parseInt(qty);
                        });
                    } else {
                        // Add quantities
                        existing.quantity += parseInt(item.quantity || 0);
                    }
                }
            });
            
            items = Array.from(combinedItems.values());
        }

        items.forEach(item => {
            const row = document.createElement('tr');
            
            // Add category column if not viewing a specific category
            if (!this.currentCategory) {
                const category = app.modules.categories.getCategory(item.categoryId);
                row.innerHTML += `<td>${category ? category.name : 'Unknown'}</td>`;
            }

            // Add style and color
            row.innerHTML += `
                <td>${item.style}</td>
                <td>${item.color}</td>
            `;

            // Add size columns if the item has sizes
            if (usesSizes) {
                const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X'];
                let total = 0;
                sizes.forEach(size => {
                    const quantity = item.sizes && item.sizes[size] ? parseInt(item.sizes[size]) : 0;
                    total += quantity;
                    row.innerHTML += `<td>${quantity}</td>`;
                });
                // Add total using the helper method
                row.innerHTML += `<td>${this.calculateTotalQuantity(item)}</td>`;
            } else {
                // For non-sized items, just show the quantity
                row.innerHTML += `<td>${this.calculateTotalQuantity(item)}</td>`;
            }

            // Add actions
            row.innerHTML += `
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-danger delete-item"
                            data-item-id="${item.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Add event listeners for edit and delete buttons
        tbody.querySelectorAll('.edit-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                this.editItem(itemId);
            });
        });

        tbody.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                if (confirm('Are you sure you want to delete this item?')) {
                    this.removeItem(itemId);
                }
            });
        });
    }

    updateDatalists() {
        const categoryId = this.currentCategory || document.getElementById('category')?.value;
        if (!categoryId) return;

        const styleList = document.getElementById(`styleSuggestions_${categoryId}`);
        const colorList = document.getElementById(`colorSuggestions_${categoryId}`);
        const styleInput = document.getElementById('itemStyle');
        
        if (!styleList || !colorList || !styleInput) return;

        // Update style suggestions for current category only
        styleList.innerHTML = Array.from(this.suggestions.styles[categoryId] || [])
            .map(style => `<option value="${style}">`)
            .join('');

        // Add event listener to style input to update color suggestions
        styleInput.addEventListener('input', (e) => {
            const selectedStyle = e.target.value;
            // Only show colors for the current category and style
            const styleColors = this.suggestions.colors[categoryId]?.[selectedStyle] || new Set();
            
            colorList.innerHTML = Array.from(styleColors)
                .map(color => `<option value="${color}">`)
                .join('');
        });
    }

    updateSuggestions() {
        // Reset suggestions
        this.suggestions = {
            styles: {},
            colors: {}
        };

        // Build suggestions from inventory, keeping them category-specific
        this.inventory.forEach(item => {
            const { categoryId, style, color } = item;
            
            // Initialize category sets if they don't exist
            if (!this.suggestions.styles[categoryId]) {
                this.suggestions.styles[categoryId] = new Set();
            }
            if (!this.suggestions.colors[categoryId]) {
                this.suggestions.colors[categoryId] = {};
            }

            // Add style to category suggestions
            if (style) {
                this.suggestions.styles[categoryId].add(style);
            }

            // Add color to style-specific suggestions for this category only
            if (style && color) {
                if (!this.suggestions.colors[categoryId][style]) {
                    this.suggestions.colors[categoryId][style] = new Set();
                }
                this.suggestions.colors[categoryId][style].add(color);
            }
        });

        // Update the datalists in the form
        this.updateDatalists();
    }

    async removeItem(itemId) {
        this.inventory = this.inventory.filter(item => item.id !== itemId);
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
        this.updateInventoryDisplay();
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

    renderAddItemModal() {
        const modal = document.getElementById('addItemModal');
        const modalContent = modal.querySelector('.modal-content');
        
        // Get categories for dropdown
        const categories = this.app.modules.categories.getCategories();
        const categoryOptions = categories.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('');

        // Get field definitions for the first category (default)
        const defaultCategory = categories[0];
        const fieldDefinitions = defaultCategory ? defaultCategory.fields : [];
        
        // Generate form fields based on field definitions
        const formFields = fieldDefinitions.map(field => this.generateFormField(field)).join('');

        modalContent.innerHTML = `
            <div class="modal-header">
                <h5 class="modal-title">Add New Item</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="addItemForm">
                    <div class="mb-3">
                        <label for="itemCategory" class="form-label">Category</label>
                        <select class="form-select" id="itemCategory" required>
                            <option value="">Select Category</option>
                            ${categoryOptions}
                        </select>
                    </div>
                    ${formFields}
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="saveItemBtn">Save Item</button>
            </div>
        `;

        // Add event listener for category change
        const categorySelect = modalContent.querySelector('#itemCategory');
        categorySelect.addEventListener('change', (e) => {
            const categoryId = e.target.value;
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                const formFields = category.fields.map(field => this.generateFormField(field)).join('');
                const form = modalContent.querySelector('#addItemForm');
                const categorySelect = form.querySelector('#itemCategory');
                form.innerHTML = `
                    <div class="mb-3">
                        <label for="itemCategory" class="form-label">Category</label>
                        <select class="form-select" id="itemCategory" required>
                            <option value="">Select Category</option>
                            ${categoryOptions}
                        </select>
                    </div>
                    ${formFields}
                `;
                form.querySelector('#itemCategory').value = categoryId;
            }
        });

        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    saveItem() {
        const categoryId = document.getElementById('itemCategory').value;
        const category = this.app.modules.categories.getCategory(categoryId);
        if (!category) return;

        const item = {
            id: crypto.randomUUID(),
            categoryId,
            createdAt: new Date().toISOString()
        };

        // Get values for each field defined in the category
        category.fields.forEach(field => {
            const fieldId = `item${field.type.charAt(0).toUpperCase() + field.type.slice(1)}`;
            const value = document.getElementById(fieldId).value;
            if (field.required && !value) {
                throw new Error(`${field.type} is required`);
            }
            item[field.type] = value;
        });

        this.items.push(item);
        this.saveItems();
        this.render();
    }
} 
