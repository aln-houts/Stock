export class CategoryManager {
    constructor() {
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
        this.editingCategoryId = null;
    }

    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">Categories</h5>
                            <button class="btn btn-primary btn-sm" id="addCategoryBtn">
                                <i class="bi bi-plus"></i> Add Category
                            </button>
                        </div>
                        <div class="card-body">
                            <div class="row" id="categoriesList">
                                ${this.renderCategories()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add/Edit Category Modal -->
            <div class="modal fade" id="categoryModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="categoryModalTitle">Add New Category</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="categoryForm">
                                <div class="mb-3">
                                    <label for="categoryName" class="form-label">Category Name</label>
                                    <input type="text" class="form-control" id="categoryName" required>
                                    <div class="invalid-feedback">Category name is required and must be unique.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="categoryDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="categoryDescription" rows="3"></textarea>
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

        this.setupEventListeners();
        this.updateCategoriesDropdown();
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

    saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const description = document.getElementById('categoryDescription').value.trim();

        const category = {
            id: crypto.randomUUID(),
            name,
            description,
            createdAt: new Date().toISOString()
        };

        this.categories.push(category);
        this.saveCategories();
        this.render();
        this.updateCategoriesDropdown();
    }

    editCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        this.editingCategoryId = categoryId;
        document.getElementById('categoryModalTitle').textContent = 'Edit Category';
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';

        const modalElement = document.getElementById('categoryModal');
        const modal = modalElement ? new bootstrap.Modal(modalElement) : null;
        if (modal) {
            modal.show();
        } else {
            console.error('Bootstrap modal not initialized. Make sure Bootstrap is properly loaded.');
        }
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
} 