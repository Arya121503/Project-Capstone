// Simple Chart Creator - DISABLED to prevent conflicts with notebook_analytics_integration.js
console.log('⚠️ Simple Chart Creator DISABLED - Using notebook_analytics_integration.js instead');

// DISABLED: This file conflicts with notebook_analytics_integration.js
// All chart creation is now handled by notebook_analytics_integration.js
return;

/*
// DISABLED ORIGINAL CODE BELOW
function createSimpleCharts() {
    console.log('📊 Creating simple charts...');
    
    // Wait for Chart.js
    if (typeof Chart === 'undefined') {
        console.log('⏳ Chart.js not ready, waiting...');
        setTimeout(createSimpleCharts, 1000);
        return;
    }
    
    // Simple data
    const simpleData = {
        property: {
            labels: ['Bangunan', 'Tanah'],
            datasets: [{
                data: [1000, 1000],
                backgroundColor: ['#FF6B6B', '#4ECDC4']
            }]
        },
        kecamatan: {
            labels: ['Genteng', 'Asemrowo', 'Sukomanunggal', 'Bubutan', 'Bulak'],
            datasets: [{
                data: [67, 66, 66, 65, 65],
                backgroundColor: '#17a2b8'
            }]
        },
        price: {
            labels: ['< 5 Juta', '5-10 Juta', '10-20 Juta', '20-50 Juta', '> 50 Juta'],
            datasets: [{
                data: [147, 118, 206, 492, 1037],
                backgroundColor: ['#FF6B6B', '#FFA726', '#4ECDC4', '#45B7D1', '#9C27B0']
            }]
        },
        revenue: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                data: [11.5, 12.7, 13.5, 13.8, 13.5, 12.7],
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 3,
                fill: true
            }]
        }
    };
    
    // Create charts with simple approach
    const charts = [
        { id: 'notebookPropertyChart', type: 'doughnut', data: simpleData.property },
        { id: 'notebookKecamatanChart', type: 'bar', data: simpleData.kecamatan },
        { id: 'notebookPriceChart', type: 'bar', data: simpleData.price },
        { id: 'notebookRevenueChart', type: 'line', data: simpleData.revenue }
    ];
    
    charts.forEach(chart => {
        const canvas = document.getElementById(chart.id);
        if (canvas) {
            console.log(`✅ Found canvas: ${chart.id}`);
            
            // Destroy existing chart
            const existing = Chart.getChart(canvas);
            if (existing) {
                existing.destroy();
                console.log(`🗑️ Destroyed existing chart: ${chart.id}`);
            }
            
            // Create new chart
            try {
                new Chart(canvas, {
                    type: chart.type,
                    data: chart.data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        },
                        scales: chart.type !== 'doughnut' ? {
                            y: { beginAtZero: true }
                        } : {}
                    }
                });
                console.log(`🎉 Created chart: ${chart.id}`);
            } catch (error) {
                console.error(`❌ Error creating ${chart.id}:`, error);
            }
        } else {
            console.error(`❌ Canvas not found: ${chart.id}`);
        }
    });
    
    // Update message
    const messageEl = document.getElementById('visualization-message');
    if (messageEl) {
        messageEl.style.display = 'block';
        messageEl.innerHTML = '<i class="fas fa-check-circle me-2"></i>Charts berhasil dimuat! Check browser console untuk debug info.';
        messageEl.className = 'alert alert-success text-center mb-4';
    }
    
    console.log('🎯 Simple chart creation completed!');
}

// Multiple triggers
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, waiting for charts...');
    setTimeout(createSimpleCharts, 2000);
});

// Click trigger
document.addEventListener('click', function(e) {
    if (e.target.getAttribute('data-target') === 'visualisasi' || 
        e.target.closest('[data-target="visualisasi"]')) {
        console.log('🖱️ Visualisasi clicked!');
        setTimeout(createSimpleCharts, 1000);
    }
});

// Hash change trigger
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#visualisasi') {
        console.log('🔗 Hash changed to visualisasi!');
        setTimeout(createSimpleCharts, 1000);
    }
});

// Force trigger after 5 seconds
setTimeout(() => {
    console.log('⏰ Force trigger after 5 seconds');
    createSimpleCharts();
}, 5000);

// END OF DISABLED CODE */

console.log('⚠️ Simple Chart Creator DISABLED - Using notebook_analytics_integration.js instead');
