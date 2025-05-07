export class GoogleSheetsManager {
    constructor() {
        this.sheetId = localStorage.getItem('googleSheetId') || '';
        this.isConnected = false;
        this.sheets = {
            invoices: 'Invoices',
            inventory: 'Inventory',
            categories: 'Categories',
            settings: 'Settings'
        };
    }

    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Google Sheets Integration</h5>
                        </div>
                        <div class="card-body">
                            <form id="sheetsForm">
                                <div class="mb-4">
                                    <label for="sheetUrl" class="form-label">Google Sheet URL</label>
                                    <div class="input-group">
                                        <input type="url" class="form-control" id="sheetUrl" 
                                               placeholder="https://docs.google.com/spreadsheets/d/..." 
                                               value="${this.sheetId ? `https://docs.google.com/spreadsheets/d/${this.sheetId}` : ''}">
                                        <button class="btn btn-primary" type="submit" id="connectSheetBtn">
                                            ${this.isConnected ? 'Reconnect' : 'Connect'}
                                        </button>
                                    </div>
                                    <div class="form-text">
                                        Create a new Google Sheet and paste its URL here. Make sure to share it with edit access.
                                    </div>
                                </div>

                                ${this.isConnected ? `
                                    <div class="alert alert-success">
                                        <i class="bi bi-check-circle"></i> Connected to Google Sheet
                                    </div>
                                    <div class="mb-3">
                                        <button type="button" class="btn btn-outline-primary" id="syncNowBtn">
                                            <i class="bi bi-arrow-repeat"></i> Sync Now
                                        </button>
                                        <button type="button" class="btn btn-outline-danger" id="disconnectBtn">
                                            <i class="bi bi-x-circle"></i> Disconnect
                                        </button>
                                    </div>
                                ` : ''}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('sheetsForm');
        const syncBtn = document.getElementById('syncNowBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.connectToSheet();
        });

        if (syncBtn) {
            syncBtn.addEventListener('click', async () => {
                await this.syncData();
            });
        }

        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => {
                this.disconnect();
            });
        }
    }

    async connectToSheet() {
        const sheetUrl = document.getElementById('sheetUrl').value;
        const sheetId = this.extractSheetId(sheetUrl);

        if (!sheetId) {
            alert('Please enter a valid Google Sheet URL');
            return;
        }

        try {
            // Store the sheet ID
            this.sheetId = sheetId;
            localStorage.setItem('googleSheetId', sheetId);
            
            // Initialize the sheet
            await this.initializeSheet();
            
            this.isConnected = true;
            this.render();
            
            // Initial sync
            await this.syncData();
        } catch (error) {
            console.error('Error connecting to sheet:', error);
            alert('Error connecting to Google Sheet. Please check the URL and sharing settings.');
        }
    }

    extractSheetId(url) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : null;
    }

    async initializeSheet() {
        // Create sheets if they don't exist
        const sheets = Object.values(this.sheets);
        for (const sheetName of sheets) {
            await this.createSheetIfNotExists(sheetName);
        }
    }

    async createSheetIfNotExists(sheetName) {
        // Implementation will be added when we set up the Google Sheets API
    }

    async syncData() {
        if (!this.isConnected) return;

        try {
            // Sync invoices
            await this.syncInvoices();
            
            // Sync inventory
            await this.syncInventory();
            
            // Sync categories
            await this.syncCategories();
            
            // Sync settings
            await this.syncSettings();

            alert('Data synchronized successfully!');
        } catch (error) {
            console.error('Error syncing data:', error);
            alert('Error synchronizing data. Please try again.');
        }
    }

    async syncInvoices() {
        const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        // Implementation will be added when we set up the Google Sheets API
    }

    async syncInventory() {
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        // Implementation will be added when we set up the Google Sheets API
    }

    async syncCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        // Implementation will be added when we set up the Google Sheets API
    }

    async syncSettings() {
        const settings = JSON.parse(localStorage.getItem('settings')) || {};
        // Implementation will be added when we set up the Google Sheets API
    }

    disconnect() {
        this.sheetId = '';
        this.isConnected = false;
        localStorage.removeItem('googleSheetId');
        this.render();
    }
} 