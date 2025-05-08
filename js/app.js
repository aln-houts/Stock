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
        this.initializeTheme();
    }

    setupNavigation() {
        document.addEventListener('click', async (e) => {
            const navLink = e.target.closest('.nav-link');
            if (!navLink) return;
            
            e.preventDefault();
            const page = navLink.dataset.page;
            if (page) {
                await this.navigateTo(page);
            }
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

        // Get category name
        const category = this.modules.categories.getCategory(categoryId);
        if (!category) {
            console.error('Category not found:', categoryId);
            return;
        }

        // Create URL-friendly category name
        const categorySlug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Update URL
        window.history.pushState(
            { page: 'inventory', categoryId }, 
            '', 
            `#inventory/${categorySlug}`
        );

        // Render inventory with category filter
        await this.modules.inventory.render(categoryId);
    }

    initializeTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }

        // Add theme toggle button
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
        themeToggle.title = 'Toggle Dark Theme';
        document.body.appendChild(themeToggle);

        // Add click handler
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.innerHTML = isDark ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
        });
    }

    // Make navigation methods available globally
    static init() {
        const app = new App();
        window.app = app;
        
        // Handle initial page load
        const hash = window.location.hash.slice(1);
        if (hash) {
            const [page, categorySlug] = hash.split('/');
            if (categorySlug) {
                // Find category by slug
                const category = app.modules.categories.categories.find(cat => 
                    cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === categorySlug
                );
                if (category) {
                    app.navigateToCategory(category.id);
                } else {
                    app.navigateTo(page);
                }
            } else {
                app.navigateTo(page);
            }
        } else {
            app.navigateTo('inventory');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', App.init); 