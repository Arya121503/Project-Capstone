// Immediate Chart Creation - DISABLED to prevent conflicts with notebook_analytics_integration.js
(function() {
    'use strict';
    
    console.log('⚠️ IMMEDIATE CHART CREATION DISABLED - Using notebook_analytics_integration.js instead');
    
    // DISABLED: This file conflicts with notebook_analytics_integration.js
    // All chart creation is now handled by notebook_analytics_integration.js
    return;
    
    console.log('🎯 IMMEDIATE CHART CREATION STARTING...');
    
    function forceCreateCharts() {
        console.log('🚀 Force creating charts NOW...');
        
        // Check Chart.js availability
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js not available!');
            return;
        }
        
        console.log('✅ Chart.js is available');
        
        const chartConfigs = [
            {
                id: 'notebookPropertyChart',
                type: 'doughnut',
                data: {
                    labels: ['Bangunan', 'Tanah'],
                    datasets: [{
                        data: [1000, 1000],
                        backgroundColor: ['#FF6B6B', '#4ECDC4'],
                        borderWidth: 2
                    }]
                }
            },
            {
                id: 'notebookKecamatanChart',
                type: 'bar',
                data: {
                    labels: ['Genteng', 'Asemrowo', 'Sukomanunggal', 'Bubutan', 'Bulak'],
                    datasets: [{
                        label: 'Properti',
                        data: [67, 66, 66, 65, 65],
                        backgroundColor: '#17a2b8'
                    }]
                }
            },
            {
                id: 'notebookPriceChart',
                type: 'bar',
                data: {
                    labels: ['< 5M', '5-10M', '10-20M', '20-50M', '> 50M'],
                    datasets: [{
                        label: 'Jumlah',
                        data: [147, 118, 206, 492, 1037],
                        backgroundColor: ['#FF6B6B', '#FFA726', '#4ECDC4', '#45B7D1', '#9C27B0']
                    }]
                }
            },
            {
                id: 'notebookRevenueChart',
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Revenue (B)',
                        data: [11.5, 12.7, 13.5, 13.8, 13.5, 12.7],
                        borderColor: '#FF6B6B',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderWidth: 3,
                        fill: true
                    }]
                }
            }
        ];
        
        let successCount = 0;
        
        chartConfigs.forEach(config => {
            const canvas = document.getElementById(config.id);
            if (canvas) {
                console.log(`📍 Creating chart for: ${config.id}`);
                
                // Destroy existing
                const existing = Chart.getChart(canvas);
                if (existing) {
                    existing.destroy();
                    console.log(`🗑️ Destroyed existing: ${config.id}`);
                }
                
                try {
                    const chart = new Chart(canvas, {
                        type: config.type,
                        data: config.data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: config.type === 'doughnut' ? 'bottom' : 'top'
                                }
                            },
                            scales: config.type !== 'doughnut' ? {
                                y: { beginAtZero: true }
                            } : undefined
                        }
                    });
                    
                    console.log(`✅ SUCCESS: ${config.id} chart created!`);
                    successCount++;
                    
                } catch (error) {
                    console.error(`❌ FAILED: ${config.id}`, error);
                }
            } else {
                console.error(`❌ Canvas NOT FOUND: ${config.id}`);
            }
        });
        
        console.log(`🎉 Chart creation completed! Success: ${successCount}/${chartConfigs.length}`);
        
        // Update status message
        const messageEl = document.getElementById('visualization-message');
        if (messageEl) {
            messageEl.style.display = 'block';
            messageEl.innerHTML = `<i class="fas fa-check-circle me-2"></i>Charts created successfully! (${successCount}/${chartConfigs.length}) - Check console for details.`;
            messageEl.className = 'alert alert-success text-center mb-4';
        }
    }
    
    // Try to create charts immediately
    forceCreateCharts();
    
    // Also try when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceCreateCharts);
    }
    
    // Try again after 1 second
    setTimeout(forceCreateCharts, 1000);
    
    // Try again after 3 seconds
    setTimeout(forceCreateCharts, 3000);
    
    console.log('📊 Immediate chart creator initialized');
    
})();
