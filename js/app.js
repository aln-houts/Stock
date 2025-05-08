// Import modules
import { InventoryManager } from './modules/inventory.js';
import { ReportsManager } from './modules/reports.js';
import { SettingsManager } from './modules/settings.js';
import { CategoryManager } from './modules/categories.js';
import { InvoiceManager } from './modules/invoices.js';
import { DataManager } from './modules/dataManager.js';

export class App {
    constructor() {
        this.modules = {
            inventory: new InventoryManager(),
            categories: new CategoryManager(),
            reports: new ReportsManager(),
            settings: new SettingsManager(),
            invoices: new InvoiceManager(),
            dataManager: new DataManager()
        };
        
        this.currentPage = 'inventory';
        this.setupNavigation();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const page = e.target.closest('.nav-link').dataset.page;
                await this.navigateTo(page);
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
            case 'categories':
                await this.modules.categories.render();
                break;
            case 'reports':
                await this.modules.reports.render();
                break;
            case 'settings':
                await this.modules.settings.render();
                break;
            case 'invoices':
                await this.modules.invoices.render();
                break;
            case 'dataManager':
                await this.modules.dataManager.render();
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