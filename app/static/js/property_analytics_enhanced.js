// Enhanced Property Analytics Dashboard Charts
const propertyAnalytics = {
    // Chart instances
    charts: {},
    
    // Chart Data (Enhanced with more comprehensive data)
    chartData: {
        "monthly_trends": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            "datasets": [{
                "label": "Total Aset",
                "data": [320, 335, 345, 360, 375, 385, 390, 395, 395, 395, 395, 395],
                "borderColor": "#FF6B6B",
                "backgroundColor": "rgba(255, 107, 107, 0.1)",
                "borderWidth": 3,
                "fill": false,
                "tension": 0.4
            }, {
                "label": "Permintaan",
                "data": [280, 295, 310, 325, 340, 350, 355, 360, 365, 365, 365, 365],
                "borderColor": "#4ECDC4",
                "backgroundColor": "rgba(78, 205, 196, 0.1)",
                "borderWidth": 3,
                "fill": false,
                "tension": 0.4
            }]
        },
        "asset_type_distribution": {
            "labels": ["Tanah", "Bangunan"],
            "datasets": [{
                "data": [154, 156],
                "backgroundColor": ["#28a745", "#007bff"],
                "borderWidth": 2,
                "borderColor": "#ffffff"
            }]
        },
        "location_distribution": {
            "labels": ["Gubeng", "Sukolilo", "Mulyorejo", "Rungkut", "Tenggilis Mejoyo", "Wonokromo", "Tegalsari", "Genteng", "Bubutan", "Simokerto"],
            "datasets": [{
                "label": "Jumlah Aset",
                "data": [42, 41, 40, 38, 37, 35, 34, 33, 32, 31],
                "backgroundColor": "#17a2b8",
                "borderWidth": 1,
                "borderColor": "#117a8b"
            }]
        },
        "status_distribution": {
            "labels": ["Tersedia", "Tersewa", "Maintenance"],
            "datasets": [{
                "data": [215, 120, 60],
                "backgroundColor": ["#28a745", "#007bff", "#ffc107"],
                "borderWidth": 2,
                "borderColor": "#ffffff"
            }]
        },
        "price_range_distribution": {
            "labels": ["< 10 Juta", "10-25 Juta", "25-50 Juta", "50-100 Juta", "> 100 Juta"],
            "datasets": [{
                "label": "Jumlah Properti",
                "data": [89, 134, 98, 52, 22],
                "backgroundColor": ["#FF6B6B", "#FFA726", "#4ECDC4", "#45B7D1", "#9C27B0"],
                "borderWidth": 1
            }]
        },
        "revenue_analysis": {
            "labels": ["Revenue Aktif", "Potensi Revenue"],
            "datasets": [{
                "data": [45750000, 52400000],
                "backgroundColor": ["#007bff", "#ffc107"],
                "borderWidth": 2,
                "borderColor": "#ffffff"
            }]
        }
    },
    
    // Initialize all charts
    initCharts: function() {
        this.initMonthlyTrends();
        this.initAssetTypeChart();
        this.initLocationChart();
        this.initStatusChart();
        this.initPriceRangeChart();
        this.initRevenueChart();
        this.initMarketTrendChart();
        this.updateDashboardKPIs();
    },
    
    // Monthly Trends Chart
    initMonthlyTrends: function() {
        const ctx = document.getElementById('monthlyTrendsChart');
        if (ctx) {
            this.charts.monthlyTrends = new Chart(ctx, {
                type: 'line',
                data: this.chartData.monthly_trends,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    },
    
    // Asset Type Distribution
    initAssetTypeChart: function() {
        const ctx = document.getElementById('assetTypeChart');
        if (ctx) {
            this.charts.assetType = new Chart(ctx, {
                type: 'doughnut',
                data: this.chartData.asset_type_distribution,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    },
    
    // Location Distribution Chart
    initLocationChart: function() {
        const ctx = document.getElementById('locationChart');
        if (ctx) {
            this.charts.location = new Chart(ctx, {
                type: 'bar',
                data: this.chartData.location_distribution,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    },
    
    // Status Distribution Chart
    initStatusChart: function() {
        const ctx = document.getElementById('statusChart');
        if (ctx) {
            this.charts.status = new Chart(ctx, {
                type: 'pie',
                data: this.chartData.status_distribution,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    },
    
    // Price Range Distribution Chart
    initPriceRangeChart: function() {
        const ctx = document.getElementById('priceRangeChart');
        if (ctx) {
            this.charts.priceRange = new Chart(ctx, {
                type: 'bar',
                data: this.chartData.price_range_distribution,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    },
    
    // Revenue Analysis Chart
    initRevenueChart: function() {
        const ctx = document.getElementById('revenueChart');
        if (ctx) {
            this.charts.revenue = new Chart(ctx, {
                type: 'doughnut',
                data: this.chartData.revenue_analysis,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    },
    
    // Market Trend Chart
    initMarketTrendChart: function() {
        const ctx = document.getElementById('marketTrendChart');
        if (ctx) {
            this.charts.marketTrend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024", "Q1 2025"],
                    datasets: [{
                        label: "Harga Sewa Rata-rata",
                        data: [25000000, 27000000, 28500000, 30000000, 32000000],
                        borderColor: "#FF6B6B",
                        backgroundColor: "rgba(255, 107, 107, 0.1)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: function(value) {
                                    return 'Rp ' + (value / 1000000).toFixed(0) + 'M';
                                }
                            }
                        }
                    }
                }
            });
        }
    },
    
    // Update Dashboard KPIs
    updateDashboardKPIs: function() {
        // Update KPI values
        document.getElementById('totalAssets').textContent = '395';
        document.getElementById('activeAssetsCount').innerHTML = '<span class="badge bg-success">275 Aktif</span>';
        document.getElementById('rentedAssetsCount').innerHTML = '<span class="badge bg-info">120 Tersewa</span>';
        
        document.getElementById('occupancyRate').textContent = '68.2%';
        document.getElementById('occupancyProgress').style.width = '68.2%';
        
        document.getElementById('monthlyRevenue').textContent = 'Rp 376.3M';
        document.getElementById('avgRentalPrice').textContent = 'Rp 32.5M';
        document.getElementById('priceRange').innerHTML = '<span class="badge bg-warning">Rp 5M - Rp 250M</span>';
        
        // Update other stats
        document.getElementById('totalAssetCount').textContent = '100';
        document.getElementById('totalRequestsCount').textContent = '2';
        document.getElementById('tanahCount').textContent = '50';
        document.getElementById('bangunanCount').textContent = '50';
        document.getElementById('availableStatusCount').textContent = '100';
        document.getElementById('rentedStatusCount').textContent = '0';
        
        // Update performance table
        this.loadLocationPerformance();
    },
    
    // Load Location Performance Data
    loadLocationPerformance: function() {
        const tableBody = document.getElementById('locationPerformanceTable');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td><strong>Gubeng</strong></td>
                    <td><span class="badge bg-primary">75%</span></td>
                    <td><strong>Rp 8.2M</strong></td>
                </tr>
                <tr>
                    <td><strong>Sukolilo</strong></td>
                    <td><span class="badge bg-primary">72%</span></td>
                    <td><strong>Rp 7.8M</strong></td>
                </tr>
                <tr>
                    <td><strong>Mulyorejo</strong></td>
                    <td><span class="badge bg-primary">68%</span></td>
                    <td><strong>Rp 7.1M</strong></td>
                </tr>
                <tr>
                    <td><strong>Rungkut</strong></td>
                    <td><span class="badge bg-primary">65%</span></td>
                    <td><strong>Rp 6.5M</strong></td>
                </tr>
                <tr>
                    <td><strong>Tenggilis Mejoyo</strong></td>
                    <td><span class="badge bg-primary">62%</span></td>
                    <td><strong>Rp 6.1M</strong></td>
                </tr>
            `;
        }
    },
    
    // Update dashboard dengan data terbaru
    updateDashboard: function(newData) {
        // Update chart data dan refresh charts
        Object.assign(this.chartData, newData);
        this.initCharts();
    }
};

// Global functions untuk interaksi
function updateTrendChart() {
    const period = document.getElementById('trendPeriod').value;
    const metric = document.getElementById('trendMetric').value;
    
    console.log(`Updating trend chart for ${period} - ${metric}`);
    // Implement trend chart update logic
}

function loadLocationPerformance() {
    propertyAnalytics.loadLocationPerformance();
}

function exportReport(format) {
    console.log(`Exporting report in ${format} format`);
    alert(`Export ${format.toUpperCase()} functionality will be implemented soon.`);
}

// Initialize charts saat DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Add delay to ensure all elements are loaded
    setTimeout(() => {
        propertyAnalytics.initCharts();
        
        // Show success message
        const messageEl = document.getElementById('visualization-message');
        if (messageEl) {
            messageEl.style.display = 'block';
            messageEl.innerHTML = '<i class="fas fa-check-circle me-2"></i>Data visualisasi berhasil dimuat dengan data simulasi!';
            messageEl.className = 'alert alert-success text-center';
        }
    }, 1000);
});

// Initialize on visualization section active
document.addEventListener('click', function(e) {
    if (e.target.getAttribute('data-target') === 'visualisasi' || 
        e.target.closest('[data-target="visualisasi"]')) {
        setTimeout(() => {
            propertyAnalytics.initCharts();
        }, 500);
    }
});
