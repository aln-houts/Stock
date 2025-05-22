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
    // 1) Tally up quantities by color
    const colorData = {};
    this.inventory.forEach(item => {
        const qty = item.sizes
            ? Object.values(item.sizes).reduce((sum, q) => sum + q, 0)
            : parseInt(item.quantity) || 0;
        if (qty > 0) {
            colorData[item.color] = (colorData[item.color] || 0) + qty;
        }
    });

    // 2) Full color→hex map from your screenshot
    const colorMap = {
      "Antiq Heliconia":    "#E75480",
      "Azalea":             "#E26DA4",
      "Graphite Heather":   "#606060",
      "Antiq Cherry Red":   "#C72C48",
      "Antque Sapphire":    "#0089CF",
      "Cardinal Red":       "#8E001C",
      "Carolina Blue":      "#99CCFF",
      "Charcoal":           "#555555",
      "Cherry Red":         "#DA0037",
      "Coral Silk":         "#E88F8F",
      "Cornsilk":           "#FFF5BA",
      "Daisy":              "#FFDE54",
      "Dark Chocolate":     "#4B3621",
      "Dark Heather":       "#555A5E",
      "Gold":               "#F0B323",
      "Heather Berry":      "#D060A1",
      "Heather Cardinal":   "#9F1D35",
      "Heather Indigo":     "#4B627D",
      "Heather Maroon":     "#A45A64",
      "Heather Navy":       "#1F305E",
      "Heather Orange":     "#FF8B4A",
      "Heather Purple":     "#6B5B95",
      "Heather Red":        "#D62E29",
      "Heather Royal":      "#4682B4",
      "Heather Sapphire":   "#0D4F8B",
      "Hth Military Grn":   "#6B8E23",
      "Hthr Heliconia":     "#E75480",
      "Hthr Irish Green":   "#00A550",
      "Hthr Rdnt Orchid":   "#C120A2",
      "Htr Galops Blue":    "#008DAE",
      "Ice Grey":           "#D3D3D3",
      "Indigo Blue":        "#26466D",
      "Iris":               "#5A9DD5",
      "Irish Green":        "#00843D",
      "Jade Dome":          "#009C91",
      "Kelly Green":        "#4CBB17",
      "Kiwi":               "#97D700",
      "Light Blue":         "#A1C6EA",
      "Lime":               "#C7EA46",
      "Metro Blue":         "#005F89",
      "Military Green":     "#4B5320"
    };

    // 3) Build labels + data + hex array
    const labels = Object.keys(colorData);
    const data   = labels.map(c => colorData[c]);
    const bg     = labels.map(c => colorMap[c] || '#CCCCCC');

    // 4) Render the Chart.js doughnut
    const ctx = document.getElementById('colorChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bg,
                borderColor: '#FFFFFF',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 8
                    }
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
