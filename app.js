// Import modules
import { InventoryManager } from './modules/inventory.js';
import { ReportsManager } from './modules/reports.js';
import { SettingsManager } from './modules/settings.js';
import { CategoryManager } from './modules/categories.js';
import { InvoiceManager } from './modules/invoices.js';

class App {
    constructor() {
        this.modules = {
            inventory: new InventoryManager(),
            reports: new ReportsManager(),
            settings: new SettingsManager(),
            categories: new CategoryManager(),
            invoices: new InvoiceManager()
        };
        
        this.currentPage = 'inventory';
        this.setupNavigation();
    }

    setupNavigation() {
        // Navigation links
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateTo(e.state.page, false);
            }
        });
    }

    async navigateTo(page, pushState = true) {
        this.currentPage = page;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        // Update URL
        if (pushState) {
            window.history.pushState({ page }, '', `#${page}`);
        }

        // Render page content
        switch (page) {
            case 'inventory':
                await this.modules.inventory.render();
                break;
            case 'reports':
                await this.modules.reports.render();
                break;
            case 'settings':
                await this.modules.settings.render();
                break;
            case 'categories':
                await this.modules.categories.render();
                break;
            case 'invoices':
                await this.modules.invoices.render();
                break;
            default:
                await this.modules.inventory.render();
        }
    }

    async navigateToCategory(categoryId) {
        this.currentPage = 'inventory';
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === 'inventory') {
                link.classList.add('active');
            }
        });

        // Update URL
        window.history.pushState(
            { page: 'inventory', categoryId }, 
            '', 
            `#inventory/${categoryId}`
        );

        // Render inventory with category filter
        await this.modules.inventory.render(categoryId);
    }

    // Make navigation methods available globally
    static init() {
        window.app = new App();
        window.app.navigateTo = window.app.navigateTo.bind(window.app);
        window.app.navigateToCategory = window.app.navigateToCategory.bind(window.app);
        
        // Setup event listeners
        window.app.setupNavigation();
        
        // Handle initial page load
        const hash = window.location.hash.slice(1);
        if (hash) {
            const [page, categoryId] = hash.split('/');
            if (categoryId) {
                window.app.navigateToCategory(categoryId);
            } else {
                window.app.navigateTo(page);
            }
        } else {
            window.app.navigateTo('inventory');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', App.init); 