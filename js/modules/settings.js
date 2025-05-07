export class SettingsManager {
    constructor() {
        this.settings = JSON.parse(localStorage.getItem('settings')) || {
            theme: 'light',
            defaultCategory: '',
            showQuantityWarnings: true,
            lowStockThreshold: 10,
            companyName: '',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
            companyWebsite: '',
            logoUrl: '',
            taxRate: 10
        };
    }

    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Company Information</h5>
                        </div>
                        <div class="card-body">
                            <form id="companyForm">
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="companyName" class="form-label">Company Name</label>
                                            <input type="text" class="form-control" id="companyName" value="${this.settings.companyName}">
                                        </div>
                                        <div class="mb-3">
                                            <label for="companyAddress" class="form-label">Company Address</label>
                                            <textarea class="form-control" id="companyAddress" rows="3">${this.settings.companyAddress}</textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label for="companyPhone" class="form-label">Phone Number</label>
                                            <input type="tel" class="form-control" id="companyPhone" value="${this.settings.companyPhone}">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="companyEmail" class="form-label">Email Address</label>
                                            <input type="email" class="form-control" id="companyEmail" value="${this.settings.companyEmail}">
                                        </div>
                                        <div class="mb-3">
                                            <label for="companyWebsite" class="form-label">Website</label>
                                            <input type="url" class="form-control" id="companyWebsite" value="${this.settings.companyWebsite}">
                                        </div>
                                        <div class="mb-3">
                                            <label for="taxRate" class="form-label">Tax Rate (%)</label>
                                            <input type="number" class="form-control" id="taxRate" value="${this.settings.taxRate}" min="0" max="100" step="0.1">
                                        </div>
                                    </div>
                                </div>

                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="companyLogo" class="form-label">Company Logo URL</label>
                                            <input type="url" class="form-control" id="companyLogo" 
                                                   value="${this.settings.logoUrl}" 
                                                   placeholder="https://example.com/logo.png">
                                            <div class="form-text">Enter the URL of your company logo</div>
                                        </div>
                                        <div id="logoPreview" class="mt-2">
                                            ${this.settings.logoUrl ? `
                                                <img src="${this.settings.logoUrl}" alt="Company Logo" class="img-thumbnail" style="max-height: 100px;">
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Application Settings</h5>
                        </div>
                        <div class="card-body">
                            <form id="appSettingsForm">
                                <div class="mb-3">
                                    <label for="theme" class="form-label">Theme</label>
                                    <select class="form-select" id="theme">
                                        <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Light</option>
                                        <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label for="defaultCategory" class="form-label">Default Category</label>
                                    <select class="form-select" id="defaultCategory">
                                        <option value="">None</option>
                                        ${app.modules.categories.categories.map(cat => `
                                            <option value="${cat.id}" ${this.settings.defaultCategory === cat.id ? 'selected' : ''}>
                                                ${cat.name}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="showQuantityWarnings" 
                                               ${this.settings.showQuantityWarnings ? 'checked' : ''}>
                                        <label class="form-check-label" for="showQuantityWarnings">
                                            Show Low Stock Warnings
                                        </label>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label for="lowStockThreshold" class="form-label">Low Stock Threshold</label>
                                    <input type="number" class="form-control" id="lowStockThreshold" 
                                           value="${this.settings.lowStockThreshold}" min="1">
                                </div>

                                <div class="text-end">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="bi bi-save"></i> Save All Settings
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const companyForm = document.getElementById('companyForm');
        const appSettingsForm = document.getElementById('appSettingsForm');
        const logoInput = document.getElementById('companyLogo');

        appSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        logoInput.addEventListener('input', (e) => {
            const url = e.target.value;
            if (url) {
                this.settings.logoUrl = url;
                const preview = document.getElementById('logoPreview');
                preview.innerHTML = `<img src="${url}" alt="Company Logo" class="img-thumbnail" style="max-height: 100px;">`;
            } else {
                this.settings.logoUrl = '';
                const preview = document.getElementById('logoPreview');
                preview.innerHTML = '';
            }
        });
    }

    saveSettings() {
        this.settings = {
            theme: document.getElementById('theme').value,
            defaultCategory: document.getElementById('defaultCategory').value,
            showQuantityWarnings: document.getElementById('showQuantityWarnings').checked,
            lowStockThreshold: parseInt(document.getElementById('lowStockThreshold').value) || 10,
            companyName: document.getElementById('companyName').value,
            companyAddress: document.getElementById('companyAddress').value,
            companyPhone: document.getElementById('companyPhone').value,
            companyEmail: document.getElementById('companyEmail').value,
            companyWebsite: document.getElementById('companyWebsite').value,
            taxRate: parseFloat(document.getElementById('taxRate').value) || 10,
            logoUrl: document.getElementById('companyLogo').value
        };

        localStorage.setItem('settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        // Apply theme
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${this.settings.theme}`);

        // Show success message
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
        alert.innerHTML = `
            Settings saved successfully!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    getSettings() {
        return this.settings;
    }
} 