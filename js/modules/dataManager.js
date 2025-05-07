export class DataManager {
    constructor() {
        this.dataTypes = ['invoices', 'inventory', 'categories', 'settings'];
    }

    async exportData() {
        try {
            // Collect all data from localStorage
            const exportData = {};
            this.dataTypes.forEach(type => {
                const data = localStorage.getItem(type);
                if (data) {
                    const parsedData = JSON.parse(data);
                    if (type === 'settings' && parsedData.logoUrl) {
                        // Store logo URL separately
                        exportData.logoUrl = parsedData.logoUrl;
                        // Remove logo from settings to keep the file size smaller
                        delete parsedData.logoUrl;
                    }
                    exportData[type] = parsedData;
                    console.log(`Exporting ${type}:`, exportData[type]);
                }
            });

            // Create a blob with the data
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw new Error('Failed to export data');
        }
    }

    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            console.log('Imported data structure:', data);

            // Validate the data structure
            if (!this.validateImportData(data)) {
                console.error('Validation failed. Data structure:', data);
                throw new Error('Invalid data format');
            }

            // Import each data type
            for (const [type, items] of Object.entries(data)) {
                if (this.dataTypes.includes(type)) {
                    if (type === 'settings' && data.logoUrl) {
                        // Add logo URL back to settings
                        items.logoUrl = data.logoUrl;
                    }
                    console.log(`Importing ${type}:`, items);
                    localStorage.setItem(type, JSON.stringify(items));
                }
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Failed to import data: ' + error.message);
        }
    }

    validateImportData(data) {
        console.log('Validating data structure:', data);
        
        // Check if data is an object
        if (typeof data !== 'object' || data === null) {
            console.error('Data is not an object');
            return false;
        }

        // Initialize missing data types with empty values
        for (const type of this.dataTypes) {
            if (!(type in data)) {
                console.log(`Initializing missing data type: ${type}`);
                switch (type) {
                    case 'invoices':
                    case 'inventory':
                    case 'categories':
                        data[type] = [];
                        break;
                    case 'settings':
                        data[type] = {
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
                        break;
                }
            }

            // Validate data structure based on type
            switch (type) {
                case 'invoices':
                case 'inventory':
                case 'categories':
                    if (!Array.isArray(data[type])) {
                        console.error(`${type} is not an array`);
                        return false;
                    }
                    break;
                case 'settings':
                    if (typeof data[type] !== 'object') {
                        console.error('Settings is not an object');
                        return false;
                    }
                    break;
            }
        }

        console.log('Data validation passed');
        return true;
    }

    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="container mt-4">
                <h2>Data Management</h2>
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Backup and Restore</h5>
                        <p class="card-text">Export your data to a JSON file or import from a previous backup.</p>
                        
                        <div class="d-flex gap-3">
                            <button class="btn btn-primary" id="exportData">
                                <i class="bi bi-download"></i> Export Data
                            </button>
                            
                            <div class="input-group" style="max-width: 300px;">
                                <input type="file" class="form-control" id="importFile" accept=".json">
                                <button class="btn btn-outline-primary" id="importData" disabled>
                                    <i class="bi bi-upload"></i> Import
                                </button>
                            </div>
                        </div>

                        <div class="alert alert-info mt-3">
                            <i class="bi bi-info-circle"></i>
                            <strong>Note:</strong> Make sure to keep your backup files safe. They contain all your inventory data.
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Export button
        document.getElementById('exportData').addEventListener('click', async () => {
            try {
                await this.exportData();
                alert('Data exported successfully!');
            } catch (error) {
                alert('Error exporting data: ' + error.message);
            }
        });

        // Import file input
        const importFile = document.getElementById('importFile');
        const importButton = document.getElementById('importData');

        importFile.addEventListener('change', () => {
            importButton.disabled = !importFile.files.length;
        });

        // Import button
        importButton.addEventListener('click', async () => {
            if (!importFile.files.length) return;

            try {
                if (confirm('Importing data will replace your current data. Are you sure?')) {
                    await this.importData(importFile.files[0]);
                    alert('Data imported successfully!');
                    // Reload the page to reflect changes
                    window.location.reload();
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        });
    }
} 