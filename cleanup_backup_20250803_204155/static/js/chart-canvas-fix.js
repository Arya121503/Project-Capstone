
// Chart.js Canvas Fix
// Prevents "Canvas is already in use" errors

window.ChartManager = {
    charts: {},
    
    // Destroy existing chart if it exists
    destroyChart: function(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
            console.log(`🗑️ Destroyed existing chart: ${canvasId}`);
        }
    },
    
    // Create new chart with automatic cleanup
    createChart: function(canvasId, config) {
        // First destroy any existing chart
        this.destroyChart(canvasId);
        
        // Get canvas element
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`❌ Canvas element not found: ${canvasId}`);
            return null;
        }
        
        try {
            // Create new chart
            const chart = new Chart(canvas, config);
            this.charts[canvasId] = chart;
            console.log(`✅ Created chart: ${canvasId}`);
            return chart;
        } catch (error) {
            console.error(`❌ Error creating chart ${canvasId}:`, error);
            return null;
        }
    },
    
    // Destroy all charts
    destroyAllCharts: function() {
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
        console.log('🗑️ All charts destroyed');
    }
};

// Auto-cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (window.ChartManager) {
        window.ChartManager.destroyAllCharts();
    }
});

// Helper function for safe chart creation
function createSafeChart(canvasId, config) {
    return window.ChartManager.createChart(canvasId, config);
}

console.log('🛠️ Chart.js canvas fix script loaded');
