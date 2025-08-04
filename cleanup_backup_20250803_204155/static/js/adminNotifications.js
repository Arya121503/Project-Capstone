// Redirect to the correct admin notifications file
// This file exists to maintain compatibility with template references

// Import functionality from the main admin notifications file
document.addEventListener('DOMContentLoaded', function() {
    // Load the main admin notifications script
    const script = document.createElement('script');
    script.src = '/static/js/admin_notifications.js';
    script.onload = function() {
        console.log('Admin notifications system loaded via compatibility layer');
    };
    document.head.appendChild(script);
});
