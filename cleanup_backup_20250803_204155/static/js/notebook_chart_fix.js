// Notebook Chart Fix - DISABLED to prevent conflicts with notebook_analytics_integration.js
const notebookChartFix = {
    // This file is DISABLED - conflicts are now handled properly in notebook_analytics_integration.js
    debug: function(message) {
        console.log('⚠️ [NotebookChartFix DISABLED]', message);
    },
    
    // All methods disabled - using notebook_analytics_integration.js instead
    init: function() {
        console.log('⚠️ NotebookChartFix DISABLED - Using notebook_analytics_integration.js instead');
        return;
    }
};

// Export disabled version
if (typeof module !== 'undefined' && module.exports) {
    module.exports = notebookChartFix;
}

// DISABLED ORIGINAL CODE BELOW
/*
// Notebook Chart Fix - Unique IDs and Better Error Handling
const notebookChartFix = {
    // Debug function
    debug: function(message) {
        console.log('🔧 [NotebookChartFix]', message);
    },
    
    // Check if element exists
    checkElement: function(id) {
        const element = document.getElementById(id);
        if (!element) {
            this.debug(`❌ Element with ID '${id}' not found!`);
            return false;
        }
        this.debug(`✅ Element '${id}' found`);
        return element;
    },
    
    // Force destroy existing charts
    destroyExistingCharts: function() {
        const chartIds = [
            'notebookPropertyChart',
            'notebookKecamatanChart', 
            'notebookPriceChart',
            'notebookRevenueChart'
        ];
        
        chartIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                // Destroy Chart.js instance if exists
                const chartInstance = Chart.getChart(canvas);
                if (chartInstance) {
                    chartInstance.destroy();
                    this.debug(`🗑️ Destroyed existing chart: ${id}`);
                }
            }
        });
    },
    
    // Create charts with error handling
    createCharts: function() {
        this.debug('🎯 Starting chart creation...');
        
        // Wait for DOM and Chart.js to be ready
        if (typeof Chart === 'undefined') {
            this.debug('❌ Chart.js not loaded yet, retrying...');
            setTimeout(() => this.createCharts(), 1000);
            return;
        }
        
        // Destroy existing charts first
        this.destroyExistingCharts();
        
        // Chart data from notebook
        const chartData = {
            property_distribution: {
                labels: ["Bangunan", "Tanah"],
                datasets: [{
                    data: [1000, 1000],
                    backgroundColor: ["#FF6B6B", "#4ECDC4"],
                    borderWidth: 2,
                    borderColor: "#ffffff"
                }]
            },
            top_kecamatan: {
                labels: ["Genteng", "Asemrowo", "Sukomanunggal", "Bubutan", "Bulak", "Dukuh Pakis", "Gayungan", "Benowo", "Tandes", "Sambikerep"],
                datasets: [{
                    label: "Jumlah Properti",
                    data: [67, 66, 66, 65, 65, 65, 65, 65, 65, 65],
                    backgroundColor: "#17a2b8",
                    borderWidth: 1,
                    borderColor: "#117a8b"
                }]
            },
            price_distribution: {
                labels: ["< 5 Juta", "5-10 Juta", "10-20 Juta", "20-50 Juta", "> 50 Juta"],
                datasets: [{
                    label: "Jumlah Properti",
                    data: [147, 118, 206, 492, 1037],
                    backgroundColor: ["#FF6B6B", "#FFA726", "#4ECDC4", "#45B7D1", "#9C27B0"],
                    borderWidth: 1
                }]
            },
            revenue_trend: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: "Proyeksi Pendapatan (Rp)",
                    data: [11539722461, 12693694708, 13538461022, 13847666954, 13538461022, 12693694708, 11539722461, 10385750215, 9540983900, 9231777969, 9540983900, 10385750215],
                    borderColor: "#FF6B6B",
                    backgroundColor: "rgba(255, 107, 107, 0.1)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            }
        };
        
        // Property Distribution Chart
        const propertyCtx = this.checkElement('notebookPropertyChart');
        if (propertyCtx) {
            try {
                new Chart(propertyCtx, {
                    type: 'doughnut',
                    data: chartData.property_distribution,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' },
                            title: { display: false }
                        }
                    }
                });
                this.debug('✅ Property distribution chart created');
            } catch (error) {
                this.debug('❌ Error creating property chart: ' + error.message);
            }
        }
        
        // Top Kecamatan Chart
        const kecamatanCtx = this.checkElement('notebookKecamatanChart');
        if (kecamatanCtx) {
            try {
                new Chart(kecamatanCtx, {
                    type: 'bar',
                    data: chartData.top_kecamatan,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                            title: { display: false },
                            legend: { display: false }
                        },
                        scales: { 
                            y: { beginAtZero: true },
                            x: { 
                                ticks: { 
                                    maxRotation: 45,
                                    fontSize: 10
                                }
                            }
                        }
                    }
                });
                this.debug('✅ Kecamatan chart created');
            } catch (error) {
                this.debug('❌ Error creating kecamatan chart: ' + error.message);
            }
        }
        
        // Price Distribution Chart
        const priceCtx = this.checkElement('notebookPriceChart');
        if (priceCtx) {
            try {
                new Chart(priceCtx, {
                    type: 'bar',
                    data: chartData.price_distribution,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                            title: { display: false },
                            legend: { display: false }
                        },
                        scales: { y: { beginAtZero: true } }
                    }
                });
                this.debug('✅ Price distribution chart created');
            } catch (error) {
                this.debug('❌ Error creating price chart: ' + error.message);
            }
        }
        
        // Revenue Trend Chart
        const revenueCtx = this.checkElement('notebookRevenueChart');
        if (revenueCtx) {
            try {
                new Chart(revenueCtx, {
                    type: 'line',
                    data: chartData.revenue_trend,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                            title: { display: false },
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return 'Rp ' + (value / 1000000000).toFixed(1) + 'B';
                                    }
                                }
                            }
                        }
                    }
                });
                this.debug('✅ Revenue trend chart created');
            } catch (error) {
                this.debug('❌ Error creating revenue chart: ' + error.message);
            }
        }
        
        this.debug('🎉 Chart creation completed!');
    },
    
    // Initialize with retries
    init: function() {
        this.debug('🚀 Initializing notebook charts...');
        
        // Try multiple times with increasing delays
        const attempts = [500, 1500, 3000, 5000];
        
        attempts.forEach((delay, index) => {
            setTimeout(() => {
                this.debug(`🔄 Attempt ${index + 1} at ${delay}ms`);
                this.createCharts();
            }, delay);
        });
    }
};

// Auto-initialize when visualisasi section is accessed
document.addEventListener('click', function(e) {
    if (e.target.getAttribute('data-target') === 'visualisasi' || 
        e.target.closest('[data-target="visualisasi"]')) {
        
        console.log('📊 Visualisasi section clicked - initializing charts...');
        notebookChartFix.init();
    }
});

// Also initialize if already in visualisasi section
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're already on visualisasi page
    if (window.location.hash === '#visualisasi') {
        console.log('📊 Already in visualisasi section - initializing charts...');
        notebookChartFix.init();
    }
    
    // Check for active visualisasi section
    setTimeout(() => {
        const visualisasiSection = document.querySelector('#visualisasi');
        if (visualisasiSection && visualisasiSection.classList.contains('active')) {
            console.log('📊 Visualisasi section is active - initializing charts...');
            notebookChartFix.init();
        }
    }, 2000);
});

// END OF DISABLED CODE */

console.log('⚠️ Notebook Chart Fix DISABLED - Using notebook_analytics_integration.js instead');
