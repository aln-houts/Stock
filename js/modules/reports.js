export class ReportsManager {
    constructor() {
        this.inventory = [];
        this.categories = [];
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
                                <div class="col-md-6">
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <h6 class="card-title">Category Distribution</h6>
                                            <canvas id="categoryChart"></canvas>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <h6 class="card-title">Top Styles</h6>
                                            <canvas id="styleChart"></canvas>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <h6 class="card-title">Color Distribution</h6>
                                            <canvas id="colorChart"></canvas>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <h6 class="card-title">Size Distribution</h6>
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
        this.generateReports();
    }

    async loadData() {
        // Load inventory
        const savedInventory = localStorage.getItem('inventory');
        if (savedInventory) {
            try {
                this.inventory = JSON.parse(savedInventory);
            } catch (error) {
                console.error('Error parsing inventory data:', error);
                this.inventory = [];
            }
        }

        // Load categories
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            try {
                this.categories = JSON.parse(savedCategories);
            } catch (error) {
                console.error('Error parsing categories data:', error);
                this.categories = [];
            }
        }
    }

    generateReports() {
        this.generateCategoryChart();
        this.generateStyleChart();
        this.generateColorChart();
        this.generateSizeChart();
    }

    generateCategoryChart() {
        const categoryData = {};
        this.inventory.forEach(item => {
            const category = this.categories.find(c => c.id === item.categoryId);
            if (category) {
                if (!categoryData[category.name]) {
                    categoryData[category.name] = 0;
                }
                if (item.sizes) {
                    // For sized items, sum up all sizes
                    categoryData[category.name] += Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
                } else {
                    // For non-sized items, add the quantity directly
                    categoryData[category.name] += parseInt(item.quantity) || 0;
                }
            }
        });

        const ctx = document.getElementById('categoryChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
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

    generateStyleChart() {
        const styleData = {};
        this.inventory.forEach(item => {
            if (!styleData[item.style]) {
                styleData[item.style] = 0;
            }
            if (item.sizes) {
                // For sized items, sum up all sizes
                styleData[item.style] += Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
            } else {
                // For non-sized items, add the quantity directly
                styleData[item.style] += parseInt(item.quantity) || 0;
            }
        });

        // Sort styles by quantity and get top 5
        const topStyles = Object.entries(styleData)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const ctx = document.getElementById('styleChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topStyles.map(([style]) => style),
                datasets: [{
                    label: 'Quantity',
                    data: topStyles.map(([,quantity]) => quantity),
                    backgroundColor: '#36A2EB'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    generateColorChart() {
        const colorData = {};
        this.inventory.forEach(item => {
            if (!colorData[item.color]) {
                colorData[item.color] = 0;
            }
            if (item.sizes) {
                // For sized items, sum up all sizes
                colorData[item.color] += Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
            } else {
                // For non-sized items, add the quantity directly
                colorData[item.color] += parseInt(item.quantity) || 0;
            }
        });

        const ctx = document.getElementById('colorChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(colorData),
                datasets: [{
                    data: Object.values(colorData),
                    backgroundColor: Object.keys(colorData).map(color => {
                        // Map color names to actual colors
                        const colorMap = {
                            'black': '#000000',
                            'white': '#FFFFFF',
                            'red': '#FF0000',
                            'blue': '#0000FF',
                            'green': '#00FF00',
                            'yellow': '#FFFF00',
                            'purple': '#800080',
                            'orange': '#FFA500',
                            'pink': '#FFC0CB',
                            'gray': '#808080',
                            'brown': '#A52A2A'

                        };
                        return colorMap[color.toLowerCase()] || '#CCCCCC';
                    })
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

    generateSizeChart() {
        const sizeData = {
            'XS': 0, 'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0, '3X': 0
        };

        this.inventory.forEach(item => {
            if (item.sizes) {
                Object.entries(item.sizes).forEach(([size, quantity]) => {
                    sizeData[size] = (sizeData[size] || 0) + quantity;
                });
            }
        });

        const ctx = document.getElementById('sizeChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(sizeData),
                datasets: [{
                    label: 'Quantity',
                    data: Object.values(sizeData),
                    backgroundColor: '#4BC0C0'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
} 
