/**
 * Visualization Dashboard with Dummy Data
 * Provides immediate visualization with mock data when API is not available
 */

class VisualizationDummyData {
    constructor() {
        this.charts = {};
        this.dummyData = this.generateDummyData();
        this.init();
    }

    init() {
        console.log('Initializing Visualization Dashboard with Dummy Data...');
        this.setupEventListeners();
        this.displayDummyData();
    }

    generateDummyData() {
        // Return empty data - will be loaded from real API
        return {
            stats: {
                total_assets: 0,
                avg_price: 0,
                min_price: 0,
                max_price: 0,
                active_renters: 0,
                monthly_revenue: 0,
                occupancy_rate: 0,
                new_renters_this_month: 0,
                revenue_growth: 0
            },
            locationAnalysis: [
                { kecamatan: 'Gubeng', avg_price: 12500000, total_properties: 25 },
                { kecamatan: 'Sukolilo', avg_price: 9800000, total_properties: 18 },
                { kecamatan: 'Wonokromo', avg_price: 8200000, total_properties: 22 },
                { kecamatan: 'Tegalsari', avg_price: 7500000, total_properties: 15 },
                { kecamatan: 'Genteng', avg_price: 11200000, total_properties: 20 }
            ],
            chartData: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Pendapatan (Juta Rp)',
                    data: [320, 298, 350, 382, 415, 450],
                    backgroundColor: 'rgba(220, 20, 60, 0.2)',
                    borderColor: 'rgba(220, 20, 60, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }]
            },
            propertyTypeData: {
                labels: ['Tanah', 'Bangunan + Tanah'],
                data: [72, 55],
                backgroundColor: [
                    'rgba(220, 20, 60, 0.8)',
                    'rgba(40, 167, 69, 0.8)'
                ]
            },
            rentalRequestsData: [
                { month: 'Jan', pending: 15, approved: 28, rejected: 3 },
                { month: 'Feb', pending: 12, approved: 25, rejected: 2 },
                { month: 'Mar', pending: 18, approved: 32, rejected: 4 },
                { month: 'Apr', pending: 20, approved: 35, rejected: 3 },
                { month: 'May', pending: 16, approved: 38, rejected: 2 },
                { month: 'Jun', pending: 22, approved: 42, rejected: 5 }
            ]
        };
    }

    setupEventListeners() {
        const updateButton = document.getElementById('updateChart');
        if (updateButton) {
            updateButton.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Setup chart type toggle
        const chartTypeSelect = document.getElementById('chartType');
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', () => {
                this.updateMainChart();
            });
        }
    }

    displayDummyData() {
        this.updateStatsDisplay();
        this.updateLocationTable();
        this.renderMainChart();
        this.renderPropertyTypeChart();
        this.renderRentalRequestsChart();
        this.renderLocationChart();
        this.renderPriceRangeChart();
        this.renderRevenueChart();
        this.renderMarketTrendChart();
        this.hideLoadingState();
        this.showSuccessMessage();
    }

    updateStatsDisplay() {
        const stats = this.dummyData.stats;

        // Update KPI cards
        this.updateElement('totalAssets', this.formatNumber(stats.total_assets));
        this.updateElement('occupancyRate', stats.occupancy_rate + '%');
        this.updateElement('monthlyRevenue', 'Rp ' + this.formatCurrency(stats.monthly_revenue));
        this.updateElement('avgRentalPrice', 'Rp ' + this.formatCurrency(stats.avg_price));
        this.updateElement('activeRenters', this.formatNumber(stats.active_renters));

        // Update badges and progress bars
        this.updateElement('activeAssetsCount', (stats.total_assets - Math.floor(stats.total_assets * stats.occupancy_rate / 100)) + ' Aktif');
        this.updateElement('rentedAssetsCount', Math.floor(stats.total_assets * stats.occupancy_rate / 100) + ' Tersewa');
        this.updateElement('revenueGrowth', '+' + stats.revenue_growth + '% MoM');
        this.updateElement('newRentersThisMonth', '+' + stats.new_renters_this_month + ' Bulan Ini');
        this.updateElement('priceRange', 'Rp ' + this.formatCurrency(stats.min_price) + ' - Rp ' + this.formatCurrency(stats.max_price));

        // Update progress bar
        const occupancyProgress = document.getElementById('occupancyProgress');
        if (occupancyProgress) {
            occupancyProgress.style.width = stats.occupancy_rate + '%';
        }
    }

    updateLocationTable() {
        const tableBody = document.getElementById('topPriceTable');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        this.dummyData.locationAnalysis.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-center"><strong>${index + 1}</strong></td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-map-marker-alt text-danger me-2"></i>
                        ${item.kecamatan}
                    </div>
                </td>
                <td class="text-end">
                    <strong class="text-success">Rp ${this.formatCurrency(item.avg_price)}</strong>
                </td>
                <td class="text-center">
                    <span class="badge bg-primary">${item.total_properties}</span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    renderMainChart() {
        const ctx = document.getElementById('monthlyTrendsChart');
        if (!ctx) return;

        if (this.charts.mainChart) {
            this.charts.mainChart.destroy();
        }

        const chartType = document.getElementById('chartType')?.value || 'line';

        this.charts.mainChart = new Chart(ctx, {
            type: chartType,
            data: this.dummyData.chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Trend Pendapatan Bulanan',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    renderPropertyTypeChart() {
        const ctx = document.getElementById('assetTypeChart');
        if (!ctx) return;

        if (this.charts.propertyTypeChart) {
            this.charts.propertyTypeChart.destroy();
        }

        this.charts.propertyTypeChart = new Chart(ctx, {
            type: 'doughnut',
            data: this.dummyData.propertyTypeData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribusi Tipe Properti',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderRentalRequestsChart() {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        if (this.charts.rentalRequestsChart) {
            this.charts.rentalRequestsChart.destroy();
        }

        const data = this.dummyData.rentalRequestsData;

        this.charts.rentalRequestsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.month),
                datasets: [
                    {
                        label: 'Pending',
                        data: data.map(item => item.pending),
                        backgroundColor: 'rgba(255, 193, 7, 0.8)',
                        borderColor: 'rgba(255, 193, 7, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Disetujui',
                        data: data.map(item => item.approved),
                        backgroundColor: 'rgba(40, 167, 69, 0.8)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Ditolak',
                        data: data.map(item => item.rejected),
                        backgroundColor: 'rgba(220, 53, 69, 0.8)',
                        borderColor: 'rgba(220, 53, 69, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Status Pengajuan Sewa per Bulan',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        stacked: false
                    },
                    y: {
                        beginAtZero: true,
                        stacked: false
                    }
                }
            }
        });
    }

    renderLocationChart() {
        const ctx = document.getElementById('locationChart');
        if (!ctx) return;

        if (this.charts.locationChart) {
            this.charts.locationChart.destroy();
        }

        const locationData = this.dummyData.locationAnalysis;

        this.charts.locationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: locationData.map(item => item.kecamatan),
                datasets: [{
                    label: 'Harga Rata-rata (Juta Rp)',
                    data: locationData.map(item => Math.round(item.avg_price / 1000000)),
                    backgroundColor: [
                        'rgba(220, 20, 60, 0.8)',
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(23, 162, 184, 0.8)',
                        'rgba(108, 117, 125, 0.8)'
                    ],
                    borderColor: [
                        'rgba(220, 20, 60, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(23, 162, 184, 1)',
                        'rgba(108, 117, 125, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'Rata-rata Harga Sewa per Kecamatan',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    renderPriceRangeChart() {
        const ctx = document.getElementById('priceRangeChart');
        if (!ctx) return;

        if (this.charts.priceRangeChart) {
            this.charts.priceRangeChart.destroy();
        }

        const priceRanges = [
            { range: '< 5M', count: 25 },
            { range: '5M - 10M', count: 42 },
            { range: '10M - 15M', count: 35 },
            { range: '15M - 20M', count: 18 },
            { range: '> 20M', count: 7 }
        ];

        this.charts.priceRangeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: priceRanges.map(item => item.range),
                datasets: [{
                    label: 'Jumlah Properti',
                    data: priceRanges.map(item => item.count),
                    backgroundColor: 'rgba(220, 20, 60, 0.6)',
                    borderColor: 'rgba(220, 20, 60, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribusi Range Harga Sewa',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        if (this.charts.revenueChart) {
            this.charts.revenueChart.destroy();
        }

        const revenueData = [
            { month: 'Jan', revenue: 320 },
            { month: 'Feb', revenue: 298 },
            { month: 'Mar', revenue: 350 },
            { month: 'Apr', revenue: 382 },
            { month: 'May', revenue: 415 },
            { month: 'Jun', revenue: 450 }
        ];

        this.charts.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: revenueData.map(item => item.month),
                datasets: [{
                    label: 'Pendapatan (Juta Rp)',
                    data: revenueData.map(item => item.revenue),
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Trend Pendapatan',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    renderMarketTrendChart() {
        const ctx = document.getElementById('marketTrendChart');
        if (!ctx) return;

        if (this.charts.marketTrendChart) {
            this.charts.marketTrendChart.destroy();
        }

        const trendData = [
            { month: 'Jan', tanah: 7.2, bangunan: 8.8 },
            { month: 'Feb', tanah: 7.5, bangunan: 8.9 },
            { month: 'Mar', tanah: 7.8, bangunan: 9.2 },
            { month: 'Apr', tanah: 8.1, bangunan: 9.5 },
            { month: 'May', tanah: 8.4, bangunan: 9.8 },
            { month: 'Jun', tanah: 8.7, bangunan: 10.1 }
        ];

        this.charts.marketTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.map(item => item.month),
                datasets: [
                    {
                        label: 'Harga Tanah (Juta/m²)',
                        data: trendData.map(item => item.tanah),
                        backgroundColor: 'rgba(220, 20, 60, 0.2)',
                        borderColor: 'rgba(220, 20, 60, 1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Harga Bangunan (Juta/m²)',
                        data: trendData.map(item => item.bangunan),
                        backgroundColor: 'rgba(23, 162, 184, 0.2)',
                        borderColor: 'rgba(23, 162, 184, 1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Trend Harga Pasar',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    updateMainChart() {
        this.renderMainChart();
    }

    refreshData() {
        this.showLoadingState();
        
        // Simulate data refresh with slight variations
        const stats = this.dummyData.stats;
        stats.monthly_revenue += Math.floor(Math.random() * 20000000) - 10000000;
        stats.occupancy_rate = Math.max(50, Math.min(95, stats.occupancy_rate + (Math.random() * 10 - 5)));
        stats.active_renters += Math.floor(Math.random() * 6) - 3;

        setTimeout(() => {
            this.displayDummyData();
            this.showSuccessMessage('Data berhasil dimuat ulang!');
        }, 1000);
    }

    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = value;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID').format(amount);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('id-ID').format(number);
    }

    showLoadingState() {
        const elements = [
            'totalAssets', 'occupancyRate', 'monthlyRevenue', 
            'avgRentalPrice', 'activeRenters'
        ];
        
        elements.forEach(id => {
            this.updateElement(id, '<i class="fas fa-spinner fa-spin"></i>');
        });

        const messageEl = document.getElementById('visualization-message');
        if (messageEl) {
            messageEl.style.display = 'block';
            messageEl.className = 'alert alert-info text-center';
            messageEl.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Memuat data visualisasi...';
        }
    }

    hideLoadingState() {
        const messageEl = document.getElementById('visualization-message');
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }

    showSuccessMessage(message = 'Data visualisasi berhasil dimuat!') {
        const messageEl = document.getElementById('visualization-message');
        if (messageEl) {
            messageEl.style.display = 'block';
            messageEl.className = 'alert alert-success text-center';
            messageEl.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 3000);
        }
    }
}

// Initialize when DOM is loaded or when visualization section is accessed
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Chart.js to be available
    if (typeof Chart !== 'undefined') {
        initializeVisualizationDummy();
    } else {
        // Wait for Chart.js to load
        const checkChart = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                clearInterval(checkChart);
                initializeVisualizationDummy();
            }
        }, 100);
    }
});

function initializeVisualizationDummy() {
    // Check if we're on the visualization section
    const visualizationSection = document.getElementById('visualisasi');
    if (visualizationSection) {
        console.log('Initializing Visualization Dummy Data...');
        window.visualizationDummy = new VisualizationDummyData();
        
        // Also listen for section changes
        const visualizationLink = document.querySelector('[data-target="visualisasi"]');
        if (visualizationLink) {
            visualizationLink.addEventListener('click', function() {
                setTimeout(() => {
                    if (!window.visualizationDummy) {
                        window.visualizationDummy = new VisualizationDummyData();
                    } else {
                        window.visualizationDummy.displayDummyData();
                    }
                }, 100);
            });
        }
    }
}

// Export for global access
window.VisualizationDummyData = VisualizationDummyData;
