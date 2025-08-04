/**
 * Dashboard User Debug
 * Debug utilities for user dashboard
 */

// Log initialization
console.log('Dashboard User Debug initialized');

// Check if required functions are available
function checkRequiredFunctions() {
    const requiredFunctions = [
        'showAsetDetail',
        'showRentalForm',
        'toggleFavorite',
        'loadAvailableAssets',
        'fetchNotifications',
        'loadRentalRequests'
    ];
    
    const missingFunctions = [];
    
    requiredFunctions.forEach(func => {
        if (typeof window[func] !== 'function') {
            missingFunctions.push(func);
        }
    });
    
    if (missingFunctions.length > 0) {
        console.warn('Missing required functions:', missingFunctions);
    } else {
        console.log('All required functions are available');
    }
}

// Check if required elements are available
function checkRequiredElements() {
    const requiredElements = [
        'assetGrid',
        'assetPagination',
        'alertContainer',
        'notificationToggleBtn',
        'userNotificationsDropdown'
    ];
    
    const missingElements = [];
    
    requiredElements.forEach(elem => {
        if (!document.getElementById(elem)) {
            missingElements.push(elem);
        }
    });
    
    if (missingElements.length > 0) {
        console.warn('Missing required elements:', missingElements);
    } else {
        console.log('All required elements are available');
    }
}

// Run checks on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    checkRequiredFunctions();
    checkRequiredElements();
});