/**
 * Utility Functions - Shared JavaScript utilities
 * Consolidated common functions used across multiple files
 */

// Currency formatting
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0';
    }
    return new Intl.NumberFormat('id-ID').format(amount);
}

// Date formatting
function formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.warn('Error formatting date:', dateString, error);
        return '-';
    }
}

// Date and time formatting
function formatDateTime(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.warn('Error formatting datetime:', dateString, error);
        return '-';
    }
}

// HTML escaping
function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Number formatting
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    return new Intl.NumberFormat('id-ID').format(num);
}

// Percentage formatting
function formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0%';
    }
    return `${parseFloat(value).toFixed(decimals)}%`;
}

// Show loading spinner
function showLoadingSpinner(containerId = null) {
    const loaderId = 'globalLoader';
    let loader = document.getElementById(loaderId);
    
    if (!loader) {
        loader = document.createElement('div');
        loader.id = loaderId;
        loader.className = 'position-fixed top-50 start-50 translate-middle bg-white rounded p-3 shadow';
        loader.style.zIndex = '9999';
        loader.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm text-danger me-2" role="status"></div>
                <span>Loading...</span>
            </div>
        `;
        document.body.appendChild(loader);
    }
    
    loader.style.display = 'block';
}

// Hide loading spinner
function hideLoadingSpinner() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Show notification/alert
function showNotification(message, type = 'info', autoClose = true) {
    const alertTypes = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    };
    
    const alertClass = alertTypes[type] || 'alert-info';
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    const icon = icons[type] || 'fa-info-circle';
    
    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas ${icon} me-2"></i>
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    if (autoClose) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    return notification;
}

// Debounce function
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Asset type badge helper
function getAssetTypeBadge(assetType) {
    if (assetType === 'tanah' || assetType === '3') {
        return '<span class="badge bg-success">Tanah</span>';
    } else if (assetType === 'bangunan' || assetType === '1') {
        return '<span class="badge bg-danger">Bangunan + Tanah</span>';
    } else {
        return '<span class="badge bg-secondary">Unknown</span>';
    }
}

// Status badge helper
function getStatusBadge(status) {
    const statusMap = {
        'available': '<span class="badge bg-success">Tersedia</span>',
        'rented': '<span class="badge bg-primary">Disewa</span>',
        'maintenance': '<span class="badge bg-warning">Maintenance</span>',
        'reserved': '<span class="badge bg-info">Reserved</span>',
        'pending': '<span class="badge bg-warning text-dark">Menunggu</span>',
        'approved': '<span class="badge bg-success">Disetujui</span>',
        'rejected': '<span class="badge bg-danger">Ditolak</span>',
        'active': '<span class="badge bg-success">Aktif</span>'
    };
    
    return statusMap[status] || '<span class="badge bg-secondary">Unknown</span>';
}

// Modal utilities
window.modalUtils = {
    show: function(modalId, options = {}) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.error(`Modal ${modalId} not found`);
            return false;
        }
        
        try {
            const modal = new bootstrap.Modal(modalElement, options);
            modal.show();
            return modal;
        } catch (error) {
            console.error(`Error showing modal ${modalId}:`, error);
            return false;
        }
    },
    
    hide: function(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return false;
        
        try {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
            return true;
        } catch (error) {
            console.error(`Error hiding modal ${modalId}:`, error);
            return false;
        }
    },
    
    cleanup: function() {
        // Remove any stuck backdrops
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.remove();
        });
        
        // Reset body classes
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
};

// Storage utilities
window.storageUtils = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('localStorage not available:', error);
            return false;
        }
    },
    
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Error removing from localStorage:', error);
            return false;
        }
    }
};

// URL utilities
window.urlUtils = {
    getParam: function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    setParam: function(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    },
    
    removeParam: function(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.replaceState({}, '', url);
    }
};

// Make functions globally available
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatNumber = formatNumber;
window.formatPercentage = formatPercentage;
window.escapeHtml = escapeHtml;
window.showLoadingSpinner = showLoadingSpinner;
window.hideLoadingSpinner = hideLoadingSpinner;
window.showNotification = showNotification;
window.debounce = debounce;
window.throttle = throttle;
window.getAssetTypeBadge = getAssetTypeBadge;
window.getStatusBadge = getStatusBadge;

console.log('✅ Utility functions loaded and available globally');
