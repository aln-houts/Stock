export class CategoryManager {
    constructor() {
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
        this.editingCategoryId = null;
    }

    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="row mb-3">
                <div class="col-12">
                    <button class="btn btn-primary" id="addCategoryBtn">
                        <i class="bi bi-plus-lg"></i> Add Category
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Categories</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Fields</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.categories.map(category => `
                                            <tr>
                                                <td>${category.name}</td>
                                                <td>${category.description || ''}</td>
                                                <td>
                                                    ${category.fields.map(field => 
                                                        `<span class="badge bg-primary me-1">${field.type}${field.required ? ' (required)' : ''}</span>`
                                                    ).join('')}
                                                </td>
                                                <td>
                                                    <div class="btn-group btn-group-sm">
                                                        <a href="#" class="btn btn-outline-primary view-category" 
                                                            data-category="${category.id}">
                                                            <i class="bi bi-eye"></i>
                                                        </a>
                                                        <button class="btn btn-outline-secondary edit-category" 
                                                            data-category="${category.id}">
                                                            <i class="bi bi-pencil"></i>
                                                        </button>
                                                        <button class="btn btn-outline-danger delete-category"
                                                            data-category="${category.id}">
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Category Modal -->
            <div class="modal fade" id="categoryModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="categoryModalLabel">Add Category</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="categoryForm">
                                <div class="mb-3">
                                    <label for="categoryName" class="form-label">Name</label>
                                    <input type="text" class="form-control" id="categoryName" required>
                                </div>
                                <div class="mb-3">
                                    <label for="categoryDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="categoryDescription" rows="3"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Available Fields</label>
                                    <div class="row">
                                        <div class="col-6">
                                            <div class="form-check">
                                                <input class="form-check-input field-checkbox" type="checkbox" data-field="style" id="fieldStyle">
                                                <label class="form-check-label" for="fieldStyle">Style</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input field-checkbox" type="checkbox" data-field="color" id="fieldColor">
                                                <label class="form-check-label" for="fieldColor">Color</label>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="form-check">
                                                <input class="form-check-input field-checkbox" type="checkbox" data-field="size" id="fieldSize">
                                                <label class="form-check-label" for="fieldSize">Size</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input field-checkbox" type="checkbox" data-field="quantity" id="fieldQuantity">
                                                <label class="form-check-label" for="fieldQuantity">Quantity</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Required Fields</label>
                                    <div class="row">
                                        <div class="col-6">
                                            <div class="form-check">
                                                <input class="form-check-input required-checkbox" type="checkbox" data-field="style" id="requiredStyle" disabled>
                                                <label class="form-check-label" for="requiredStyle">Style</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input required-checkbox" type="checkbox" data-field="color" id="requiredColor" disabled>
                                                <label class="form-check-label" for="requiredColor">Color</label>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="form-check">
                                                <input class="form-check-input required-checkbox" type="checkbox" data-field="size" id="requiredSize" disabled>
                                                <label class="form-check-label" for="requiredSize">Size</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input required-checkbox" type="checkbox" data-field="quantity" id="requiredQuantity" disabled>
                                                <label class="form-check-label" for="requiredQuantity">Quantity</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveCategoryBtn">Save Category</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for field checkboxes
        document.querySelectorAll('.field-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const field = e.target.dataset.field;
                const requiredCheckbox = document.querySelector(`.required-checkbox[data-field="${field}"]`);
                if (requiredCheckbox) {
                    requiredCheckbox.disabled = !e.target.checked;
                    if (!e.target.checked) {
                        requiredCheckbox.checked = false;
                    }
                }
            });
        });

        // Add event listeners for view buttons
        document.querySelectorAll('.view-category').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = e.currentTarget.dataset.category;
                window.app.navigateToCategory(categoryId);
            });
        });

        // Add event listener for Add Category button
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.showAddCategoryModal();
            });
        }

        // Add event listener for Save Category button
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        if (saveCategoryBtn) {
            saveCategoryBtn.addEventListener('click', () => {
                if (this.validateCategoryForm()) {
                    this.saveCategory();
                }
            });
        }
    }

    updateCategoriesDropdown() {
        const dropdown = document.getElementById('categoriesDropdown');
        if (!dropdown) return;

        // Get the static items (just Manage Categories)
        const staticItems = `
            <li>
                <a class="nav-link" href="#" data-page="categories">
                    <i class="bi bi-gear"></i> Manage Categories
                </a>
            </li>
            <li><hr class="dropdown-divider"></li>
        `;
        
        // Add category items
        const categoryItems = this.categories.map(category => {
            const categorySlug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return `
                <li>
                    <a class="nav-link" href="#" data-page="inventory" data-category="${category.id}">
                        <i class="bi bi-folder"></i> ${category.name}
                    </a>
                </li>
            `;
        }).join('');

        // Update dropdown content
        dropdown.innerHTML = staticItems + categoryItems;

        // Add event listeners to all links
        dropdown.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                const categoryId = link.dataset.category;

                if (categoryId) {
                    window.app.navigateToCategory(categoryId);
                } else if (page) {
                    window.app.navigateTo(page);
                }
            });
        });

        // Close dropdown after clicking
        dropdown.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const dropdownToggle = document.querySelector('.dropdown-toggle');
                if (dropdownToggle) {
                    const bsDropdown = bootstrap.Dropdown.getInstance(dropdownToggle);
                    if (bsDropdown) {
                        bsDropdown.hide();
                    }
                }
            });
        });
    }

    renderCategories() {
        if (this.categories.length === 0) {
            return `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">No categories yet. Click "Add Category" to create one.</p>
                </div>
            `;
        }

        return this.categories.map(category => `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${category.name}</h5>
                        <p class="card-text text-muted">${category.description || 'No description'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <a href="#" class="btn btn-primary btn-sm view-category" data-category="${category.id}">
                                View Inventory
                            </a>
                            <div class="btn-group">
                                <button class="btn btn-outline-secondary btn-sm edit-category" data-category="${category.id}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm delete-category" data-category="${category.id}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        const categoryForm = document.getElementById('categoryForm');
        const modalElement = document.getElementById('categoryModal');
        const modal = modalElement ? new bootstrap.Modal(modalElement) : null;

        if (!modal) {
            console.error('Bootstrap modal not initialized. Make sure Bootstrap is properly loaded.');
            return;
        }

        addCategoryBtn.addEventListener('click', () => {
            this.editingCategoryId = null;
            document.getElementById('categoryModalTitle').textContent = 'Add New Category';
            categoryForm.reset();
            modal.show();
        });

        saveCategoryBtn.addEventListener('click', () => {
            if (this.validateCategoryForm()) {
                if (this.editingCategoryId) {
                    this.updateCategory();
                } else {
                    this.saveCategory();
                }
                modal.hide();
            }
        });

        // Setup category view links
        document.querySelectorAll('.view-category').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = e.currentTarget.dataset.category;
                window.app.navigateToCategory(categoryId);
            });
        });

        // Setup edit buttons
        document.querySelectorAll('.edit-category').forEach(button => {
            button.addEventListener('click', (e) => {
                const categoryId = e.currentTarget.dataset.category;
                this.editCategory(categoryId);
            });
        });

        // Setup delete buttons
        document.querySelectorAll('.delete-category').forEach(button => {
            button.addEventListener('click', (e) => {
                const categoryId = e.currentTarget.dataset.category;
                this.deleteCategory(categoryId);
            });
        });
    }

    validateCategoryForm() {
        const nameInput = document.getElementById('categoryName');
        const name = nameInput.value.trim();
        
        // Reset validation state
        nameInput.classList.remove('is-invalid');
        
        // Check if name is empty
        if (!name) {
            nameInput.classList.add('is-invalid');
            return false;
        }

        // Check for duplicate names (excluding current category when editing)
        const isDuplicate = this.categories.some(c => 
            c.name.toLowerCase() === name.toLowerCase() && 
            c.id !== this.editingCategoryId
        );

        if (isDuplicate) {
            nameInput.classList.add('is-invalid');
            return false;
        }

        return true;
    }

    editCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        // Reset all checkboxes first
        document.querySelectorAll('.field-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('.required-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.disabled = true;
        });

        // Set category name and description
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';

        // Set field checkboxes based on category fields
        category.fields.forEach(field => {
            const fieldCheckbox = document.querySelector(`.field-checkbox[data-field="${field.type}"]`);
            const requiredCheckbox = document.querySelector(`.required-checkbox[data-field="${field.type}"]`);
            
            if (fieldCheckbox) {
                fieldCheckbox.checked = true;
                if (requiredCheckbox) {
                    requiredCheckbox.disabled = false;
                    requiredCheckbox.checked = field.required;
                }
            }
        });

        // Store the category ID for saving
        document.getElementById('categoryForm').dataset.editId = categoryId;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    }

    async saveCategory() {
        const form = document.getElementById('categoryForm');
        const name = document.getElementById('categoryName').value.trim();
        const description = document.getElementById('categoryDescription').value.trim();
        const editId = form.dataset.editId;

        if (!name) {
            alert('Please enter a category name');
            return;
        }

        // Get selected fields
        const fields = this.getFieldDefinitions();

        if (editId) {
            // Update existing category
            const categoryIndex = this.categories.findIndex(c => c.id === editId);
            if (categoryIndex !== -1) {
                this.categories[categoryIndex] = {
                    ...this.categories[categoryIndex],
                    name,
                    description,
                    fields
                };
            }
        } else {
            // Create new category
            const newCategory = {
                id: crypto.randomUUID(),
                name,
                description,
                fields,
                createdAt: new Date().toISOString()
            };
            this.categories.push(newCategory);
        }

        // Save to localStorage
        localStorage.setItem('categories', JSON.stringify(this.categories));

        // Hide the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
        if (modal) {
            modal.hide();
        }

        // Reset the form
        form.reset();
        form.removeAttribute('data-edit-id');

        // Update the display
        this.render();
    }

    getFieldDefinitions() {
        const fields = [];
        const fieldCheckboxes = document.querySelectorAll('.field-checkbox:checked');
        
        fieldCheckboxes.forEach(checkbox => {
            const fieldType = checkbox.dataset.field;
            const requiredCheckbox = document.querySelector(`.required-checkbox[data-field="${fieldType}"]`);
            fields.push({
                type: fieldType,
                required: requiredCheckbox ? requiredCheckbox.checked : false
            });
        });

        return fields;
    }

    updateCategory() {
        const category = this.categories.find(c => c.id === this.editingCategoryId);
        if (!category) return;

        category.name = document.getElementById('categoryName').value.trim();
        category.description = document.getElementById('categoryDescription').value.trim();
        category.updatedAt = new Date().toISOString();

        this.saveCategories();
        this.render();
        this.updateCategoriesDropdown();
    }

    deleteCategory(categoryId) {
        if (confirm('Are you sure you want to delete this category? This will also delete all items in this category.')) {
            // Delete category
            this.categories = this.categories.filter(c => c.id !== categoryId);
            this.saveCategories();

            // Delete associated inventory items
            const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
            const updatedInventory = inventory.filter(item => item.categoryId !== categoryId);
            localStorage.setItem('inventory', JSON.stringify(updatedInventory));

            // Update inventory display if we're on the inventory page
            if (app.modules.inventory) {
                app.modules.inventory.inventory = updatedInventory;
                app.modules.inventory.updateInventoryDisplay();
            }

            this.render();
            this.updateCategoriesDropdown();
        }
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    getCategory(categoryId) {
        return this.categories.find(c => c.id === categoryId);
    }

    showAddCategoryModal() {
        // Reset form
        const form = document.getElementById('categoryForm');
        if (form) {
            form.reset();
            form.removeAttribute('data-edit-id');
        }

        // Reset all checkboxes
        document.querySelectorAll('.field-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('.required-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.disabled = true;
        });

        // Update modal title
        const modalTitle = document.getElementById('categoryModalLabel');
        if (modalTitle) {
            modalTitle.textContent = 'Add Category';
        }

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    }
} 