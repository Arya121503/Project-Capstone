/**
 * Dashboard User Main
 * Main initialization script for user dashboard
 */

// Global variables
let currentSection = 'dashboard-home';

// Initialize dashboard
function initDashboard() {
    console.log('Initializing user dashboard');
    
    // Set up menu links
    setupMenuLinks();
    
    // Reset all filters to default values
    resetAllFilters();
    
    // Load available assets
    if (typeof loadAvailableAssets === 'function') {
        loadAvailableAssets();
    }
    
    // Load notifications
    if (typeof fetchNotifications === 'function') {
        fetchNotifications();
    }
    
    // Load favorites (this will also update the favorite count)
    if (typeof updateFavoriteCount === 'function') {
        updateFavoriteCount();
    }
    
    // Load dashboard stats (but skip favorite count since it's handled above)
    if (typeof loadDashboardStatsExceptFavorites === 'function') {
        loadDashboardStatsExceptFavorites();
    } else if (typeof loadDashboardStats === 'function') {
        // Fallback to original function if the new one doesn't exist
        console.warn('Using original loadDashboardStats - may cause favorite count conflicts');
        loadDashboardStats();
    }
    
    // Set up notification toggle button
    setupNotificationToggle();
    
    // Make favorite hearts clickable
    setupFavoriteHearts();
}

// Set up menu links
function setupMenuLinks() {
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section
            const targetSection = this.getAttribute('data-target');
            
            // Remove active class from all links
            document.querySelectorAll('.menu-link').forEach(l => {
                l.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
                currentSection = targetSection;
                
                // Load section-specific data
                loadSectionData(targetSection);
            }
        });
    });
}

// Load section-specific data
function loadSectionData(section) {
    switch (section) {
        case 'favorit-aset':
            if (typeof loadUserFavorites === 'function') {
                loadUserFavorites();
            }
            break;
        case 'histori-sewa':
            if (typeof loadRentalRequests === 'function') {
                loadRentalRequests();
            }
            break;
    }
}

// Set up notification toggle button
function setupNotificationToggle() {
    const notifToggleBtn = document.getElementById('notificationToggleBtn');
    if (notifToggleBtn) {
        notifToggleBtn.addEventListener('click', function() {
            if (typeof toggleNotificationDropdown === 'function') {
                toggleNotificationDropdown();
            } else {
                // Fallback
                const dropdown = document.getElementById('userNotificationsDropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'block' : 'none';
                }
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('userNotificationsDropdown');
        const toggleBtn = document.getElementById('notificationToggleBtn');
        
        if (dropdown && toggleBtn) {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        }
    });
}

// Set up favorite hearts
function setupFavoriteHearts() {
    document.querySelectorAll('.favorite-heart').forEach(heart => {
        heart.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const assetId = this.getAttribute('data-aset-id');
            toggleFavorite(assetId, this);
        });
    });
}

// Reset all filters to default values
function resetAllFilters() {
    console.log('Resetting all filters to default values');
    
    // Reset history filters
    const filterJenisAktivitas = document.getElementById('filterJenisAktivitas');
    const filterStatusHistori = document.getElementById('filterStatusHistori');
    const filterPeriode = document.getElementById('filterPeriode');
    
    if (filterJenisAktivitas) filterJenisAktivitas.value = '';
    if (filterStatusHistori) filterStatusHistori.value = '';
    if (filterPeriode) filterPeriode.value = '';
    
    // Reset asset filters
    const assetTypeFilter = document.getElementById('assetTypeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const priceFilter = document.getElementById('priceFilter');
    
    if (assetTypeFilter) assetTypeFilter.value = '';
    if (locationFilter) locationFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    
    // Reset favorite filters
    const filterJenisFavorit = document.getElementById('filterJenisFavorit');
    const filterKecamatanFavorit = document.getElementById('filterKecamatanFavorit');
    
    if (filterJenisFavorit) filterJenisFavorit.value = '';
    if (filterKecamatanFavorit) filterKecamatanFavorit.value = '';
}

// Initialize dashboard on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});