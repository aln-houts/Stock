// Item Management Module
const ItemManager = {
    // State
    inventory: [],
    styles: new Set(),
    colors: new Set(),

    // Initialize the module
    init() {
        this.loadInventory();
        this.setupEventListeners();
        this.updateSuggestions();
    },

    // Load inventory from localStorage
    loadInventory() {
        const savedInventory = localStorage.getItem('inventory');
        if (savedInventory) {
            this.inventory = JSON.parse(savedInventory);
            this.updateInventoryDisplay();
        }
    },

    // Save inventory to localStorage
    saveInventory() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
    },

    // Setup event listeners
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
    },

    // Add new item to inventory
    addItem() {
        const style = document.getElementById('style').value;
        const color = document.getElementById('color').value;
        const size = document.getElementById('size').value;
        const quantity = parseInt(document.getElementById('quantity').value);

        // Add to suggestions
        this.styles.add(style);
        this.colors.add(color);

        // Find existing item or create new one
        let item = this.inventory.find(i => i.style === style && i.color === color);
        
        if (!item) {
            item = {
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

        // Save and update display
        this.saveInventory();
        this.updateInventoryDisplay();
        this.updateSuggestions();

        // Reset form
        document.getElementById('addItemForm').reset();
    },

    // Update inventory display
    updateInventoryDisplay() {
        const tbody = document.getElementById('inventoryTableBody');
        tbody.innerHTML = '';

        this.inventory.forEach(item => {
            const row = document.createElement('tr');
            const total = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);

    // ─── inside updateInventoryDisplay() ───
    row.innerHTML = `
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
            <!-- EDIT button -->
            <button 
              class="btn btn-sm btn-secondary me-1" 
              onclick="ItemManager.editItem('${item.style}', '${item.color}')">
                <i class="bi bi-pencil"></i>
            </button>

            <!-- DELETE button -->
            <button 
              class="btn btn-sm btn-danger" 
              onclick="ItemManager.removeItem('${item.style}', '${item.color}')">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;

            tbody.appendChild(row);
        });
    },

    // Update style and color suggestions
    updateSuggestions() {
        const styleList = document.getElementById('styleSuggestions');
        const colorList = document.getElementById('colorSuggestions');

        styleList.innerHTML = Array.from(this.styles)
            .map(style => `<option value="${style}">`)
            .join('');

        colorList.innerHTML = Array.from(this.colors)
            .map(color => `<option value="${color}">`)
            .join('');
    },

    // Remove item from inventory
    removeItem(style, color) {
        if (confirm('Are you sure you want to remove this item?')) {
            this.inventory = this.inventory.filter(
                item => !(item.style === style && item.color === color)
            );
            this.saveInventory();
            this.updateInventoryDisplay();
        }
    },
        /**
     * Load an existing item into the form for editing,
     * then remove it from inventory so re-adding updates correctly.
     */
    editItem(style, color) {
        // Find the item
        const idx = this.inventory.findIndex(i => i.style === style && i.color === color);
        if (idx === -1) return;

        const item = this.inventory[idx];

        // Populate the form fields
        document.getElementById('style').value = item.style;
        document.getElementById('color').value = item.color;

        // Pick the first non-zero size
        const firstSize = Object.keys(item.sizes).find(s => item.sizes[s] > 0);
        if (firstSize) {
            document.getElementById('size').value = firstSize;
            document.getElementById('quantity').value = item.sizes[firstSize];
        }

        // Remove the item so the updated values get re-added on submit
        this.inventory.splice(idx, 1);
        this.saveInventory();
        this.updateInventoryDisplay();
    },
    

    // Export inventory to CSV
    exportInventory() {
        const headers = ['Style', 'Color', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3X', 'Total'];
        const rows = this.inventory.map(item => {
            const total = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
            return [
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
};

// Export the module
export default ItemManager; 
