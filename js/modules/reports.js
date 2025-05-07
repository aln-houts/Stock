export class ReportsManager {
    constructor() {
        this.charts = {};
    }

    async render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Inventory Reports</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6 mb-4">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6 class="card-title">Inventory by Category</h6>
                                            <canvas id="categoryChart"></canvas>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-4">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6 class="card-title">Inventory by Size</h6>
                                            <canvas id="sizeChart"></canvas>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadData();
    }

    async loadData() {
        try {
            // Try to load from API
            const response = await fetch('/api/inventory');
            const inventory = await response.json();
            this.updateCharts(inventory);
        } catch (error) {
            console.error('Error loading inventory data:', error);
            // Fallback to localStorage
            const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
            this.updateCharts(inventory);
        }
    }

    updateCharts(inventory) {
        this.updateCategoryChart(inventory);
        this.updateSizeChart(inventory);
    }

    updateCategoryChart(inventory) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        // Group items by category
        const categoryData = {};
        inventory.forEach(item => {
            const category = app.modules.categories.getCategory(item.categoryId);
            const categoryName = category ? category.name : 'Unknown';
            const total = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
            
            categoryData[categoryName] = (categoryData[categoryName] || 0) + total;
        });

        // Create chart
        if (this.charts.category) {
            this.charts.category.destroy();
        }

        this.charts.category = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                        '#858796', '#5a5c69', '#2e59d9', '#17a673', '#2c9faf'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    updateSizeChart(inventory) {
        const ctx = document.getElementById('sizeChart');
        if (!ctx) return;

        // Group items by size
        const sizeData = {
            XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3X': 0
        };

        inventory.forEach(item => {
            Object.entries(item.sizes).forEach(([size, quantity]) => {
                sizeData[size] += quantity;
            });
        });

        // Create chart
        if (this.charts.size) {
            this.charts.size.destroy();
        }

        this.charts.size = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(sizeData),
                datasets: [{
                    label: 'Quantity',
                    data: Object.values(sizeData),
                    backgroundColor: '#4e73df'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
} 