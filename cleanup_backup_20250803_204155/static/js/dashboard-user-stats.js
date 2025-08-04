/**
 * Dashboard User Stats
 * Handles user dashboard statistics
 */

// Global variables
let dashboardStats = {
    totalAssets: 0,
    totalFavorites: 0,
    totalHistory: 0
};

// Load dashboard stats
async function loadDashboardStats() {
    try {
        // Fetch data from API
        const response = await fetch('/api/user-dashboard-stats');
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load dashboard stats');
        }
        
        // Store stats but override favorites to prevent dummy data
        dashboardStats = result.data;
        dashboardStats.totalFavorites = 0; // Force to 0 to prevent dummy data
        
        // Update UI
        updateDashboardStatsUI();
        
        return dashboardStats;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Set safe defaults
        dashboardStats = {
            totalAssets: 0,
            totalFavorites: 0,
            totalHistory: 0
        };
        return dashboardStats;
    }
}

// Update dashboard stats UI
function updateDashboardStatsUI() {
    // Update total assets
    const totalAsetElement = document.getElementById('totalAset');
    if (totalAsetElement) {
        totalAsetElement.textContent = dashboardStats.totalAssets;
    }
    
    // Update total favorites - COMMENTED OUT to avoid conflicts
    // const totalFavoritElement = document.getElementById('totalFavorit');
    // if (totalFavoritElement) {
    //     totalFavoritElement.textContent = dashboardStats.totalFavorites;
    // }
    
    // Update total history
    const totalHistoriElement = document.getElementById('totalHistori');
    if (totalHistoriElement) {
        totalHistoriElement.textContent = dashboardStats.totalHistory;
    }
}

// Alternative function that doesn't update favorites
function loadDashboardStatsExceptFavorites() {
    return loadDashboardStats().then(() => {
        // Update only assets and history, not favorites
        const totalAsetElement = document.getElementById('totalAset');
        if (totalAsetElement) {
            totalAsetElement.textContent = dashboardStats.totalAssets;
        }
        
        const totalHistoriElement = document.getElementById('totalHistori');
        if (totalHistoriElement) {
            totalHistoriElement.textContent = dashboardStats.totalHistory;
        }
        
        console.log('Dashboard stats loaded (excluding favorites)');
    });
}

// Initialize event listeners - DISABLED to avoid conflicts with main.js
// document.addEventListener('DOMContentLoaded', function() {
//     // Load dashboard stats
//     loadDashboardStats();
// });