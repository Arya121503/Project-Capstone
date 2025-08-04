/**
 * Dashboard User Inline Functions
 * Contains functions that are called directly from HTML
 */

// Global variables
let currentAssetId = null;
let currentAssetType = null;

// Show asset detail
function showAsetDetail(assetId, assetType) {
    currentAssetId = assetId;
    currentAssetType = assetType;
    
    // Call the function from dashboard-user-rental.js
    if (typeof window.showAsetDetail === 'function') {
        window.showAsetDetail(assetId, assetType);
    } else {
        // Fallback implementation
        alert(`Detail aset ID: ${assetId} (${assetType})`);
    }
}

// Show rental form
function showRentalForm(assetId, assetType) {
    currentAssetId = assetId;
    currentAssetType = assetType;
    
    // Call the function from dashboard-user-rental.js
    if (typeof window.showRentalForm === 'function') {
        window.showRentalForm(assetId, assetType);
    } else {
        // Fallback implementation
        alert(`Form sewa aset ID: ${assetId} (${assetType})`);
    }
}

// Toggle favorite
function toggleFavorite(assetId, element) {
    // Call the function from dashboard-user-favorites.js
    if (typeof window.toggleFavorite === 'function') {
        window.toggleFavorite(assetId, element);
    } else {
        // Fallback implementation
        const isFavorited = element.classList.contains('favorited');
        
        if (isFavorited) {
            element.classList.remove('favorited');
            alert('Aset dihapus dari favorit');
        } else {
            element.classList.add('favorited');
            alert('Aset ditambahkan ke favorit');
        }
    }
}

// View rental details
function viewRentalDetails(requestId) {
    // Call the function from dashboard-user-history.js
    if (typeof window.viewRentalDetails === 'function') {
        window.viewRentalDetails(requestId);
    } else {
        // Fallback implementation
        alert(`Detail sewa ID: ${requestId}`);
    }
}

// Cancel rental request
function cancelRentalRequest(requestId) {
    // Call the function from dashboard-user-history.js
    if (typeof window.cancelRentalRequest === 'function') {
        window.cancelRentalRequest(requestId);
    } else {
        // Fallback implementation
        if (confirm('Apakah Anda yakin ingin membatalkan pengajuan sewa ini?')) {
            alert(`Pengajuan sewa ID: ${requestId} dibatalkan`);
        }
    }
}

// Show alert message
function showAlert(type, message, autoClose = true) {
    const alertContainer = document.getElementById('alertContainer');
    
    if (!alertContainer) return;
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    alertContainer.appendChild(alertDiv);
    
    // Auto close after 5 seconds
    if (autoClose) {
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }
    
    return alertDiv;
}