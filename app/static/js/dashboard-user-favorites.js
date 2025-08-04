/**
 * Dashboard User Favorites
 * Handles user favorites functionality
 */

// Global variables
let userFavorites = [];

// Load user favorites
async function loadUserFavorites() {
    try {
        // Show loading state
        document.getElementById('favoritContainer').innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Memuat aset favorit...</p>
            </div>
        `;
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        const assetType = document.getElementById('filterJenisFavorit').value;
        const kecamatan = document.getElementById('filterKecamatanFavorit').value;
        
        if (assetType) queryParams.append('asset_type', assetType);
        if (kecamatan) queryParams.append('kecamatan', kecamatan);
        
        // Fetch data from API
        const response = await fetch(`/api/user-favorites?${queryParams.toString()}`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load favorites');
        }
        
        // Store favorites
        userFavorites = result.data;
        
        // Update UI
        updateFavoritesUI();
        
        // Update stats with strict number checking
        const favCount = userFavorites ? userFavorites.length : 0;
        console.log('Updating favorite count to:', favCount);
        
        // Update all UI elements
        updateFavoriteUIElements(favCount);
        
        // Also update the count via API to ensure consistency
        updateFavoriteCount();
        
        // Synchronize favorite hearts across all sections
        setTimeout(() => {
            synchronizeFavoriteHearts();
        }, 100);
        
        return userFavorites;
    } catch (error) {
        console.error('Error loading favorites:', error);
        
        // Show error message
        document.getElementById('favoritContainer').innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
                <h5>Gagal memuat data</h5>
                <p class="text-muted">${error.message}</p>
            </div>
        `;
        
        return [];
    }
}

// Update favorites UI
function updateFavoritesUI() {
    const container = document.getElementById('favoritContainer');
    
    if (!container) return;
    
    if (userFavorites.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                <h5>Belum ada aset favorit</h5>
                <p class="text-muted">Anda belum menambahkan aset ke favorit</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    userFavorites.forEach(favorite => {
        const asset = favorite.asset;
        
        // Format price
        const formattedPrice = new Intl.NumberFormat('id-ID').format(asset.harga_sewa);
        
        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card asset-card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge ${asset.asset_type === 'tanah' ? 'bg-success' : 'bg-primary'} rounded-pill">
                                ${asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan'}
                            </span>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-${asset.status === 'available' ? 'success' : 'secondary'} text-white rounded-pill">
                                    ${asset.status === 'available' ? 'Tersedia' : 'Tidak Tersedia'}
                                </span>
                                <i class="fas fa-heart favorite-heart favorited" data-aset-id="${asset.id}" title="Hapus dari Favorit"></i>
                            </div>
                        </div>

                        <h6 class="card-title text-truncate" title="${asset.name}">
                            ${asset.name}
                        </h6>

                        <div class="mb-2">
                            <small class="text-muted">
                                <i class="fas fa-map-marker-alt me-1"></i>
                                ${asset.kecamatan}, ${asset.alamat.split(',')[0]}
                            </small>
                        </div>

                        <div class="row text-center mb-3">
                            <div class="col-6">
                                <small class="text-muted d-block">Luas Tanah</small>
                                <strong>${asset.luas_tanah} m²</strong>
                            </div>
                            <div class="col-6">
                                ${asset.asset_type === 'bangunan' ? `
                                    <small class="text-muted d-block">Luas Bangunan</small>
                                    <strong>${asset.luas_bangunan} m²</strong>
                                ` : ''}
                            </div>
                        </div>

                        <div class="text-center">
                            <div class="h6 text-danger mb-2">
                                Rp ${formattedPrice}/bulan
                            </div>
                            <small class="text-muted d-block mb-3"></small>
                            <div class="btn-group btn-group-sm w-100">
                                <button class="btn btn-outline-info" onclick="showAsetDetail(${asset.id}, '${asset.asset_type}')">
                                    <i class="fas fa-eye me-1"></i>Detail
                                </button>
                                ${asset.status === 'available' ? `
                                    <button class="btn btn-danger" onclick="showRentalForm(${asset.id}, '${asset.asset_type}')">
                                        <i class="fas fa-handshake me-1"></i>Sewa
                                    </button>
                                ` : `
                                    <button class="btn btn-secondary" disabled>
                                        <i class="fas fa-ban me-1"></i>Tidak Tersedia
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners for favorite buttons
    container.querySelectorAll('.favorite-heart').forEach(heart => {
        heart.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const assetId = this.getAttribute('data-aset-id');
            toggleFavorite(assetId, this);
        });
    });
}

// Toggle favorite status
async function toggleFavorite(assetId, element) {
    try {
        // Optimistic UI update for ALL hearts with this asset ID
        const isFavorited = element.classList.contains('favorited');
        const allHearts = document.querySelectorAll(`[data-aset-id="${assetId}"]`);
        
        // Update all hearts with the same asset ID
        allHearts.forEach(heart => {
            if (isFavorited) {
                heart.classList.remove('favorited');
                heart.title = 'Tambah ke Favorit';
            } else {
                heart.classList.add('favorited');
                heart.title = 'Hapus dari Favorit';
            }
        });
        
        // Make API request
        const response = await fetch(`/api/toggle-favorite/${assetId}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (!result.success) {
            // Revert UI change for ALL hearts if API call fails
            allHearts.forEach(heart => {
                if (isFavorited) {
                    heart.classList.add('favorited');
                    heart.title = 'Hapus dari Favorit';
                } else {
                    heart.classList.remove('favorited');
                    heart.title = 'Tambah ke Favorit';
                }
            });
            
            throw new Error(result.error || 'Failed to toggle favorite');
        }
        
        // Show success message
        showAlert(isFavorited ? 'info' : 'success', 
                 isFavorited ? 'Aset dihapus dari favorit' : 'Aset ditambahkan ke favorit');
        
        // Reload favorites if we're on the favorites tab
        if (document.querySelector('.content-section.active').id === 'favorit-aset') {
            loadUserFavorites();
        }
        
        // Update favorite count
        if (typeof updateFavoriteCount === 'function') {
            updateFavoriteCount();
        }
        
        console.log(`Favorite toggled for asset ${assetId}: ${!isFavorited ? 'added' : 'removed'}`);
        
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showAlert('error', `Gagal mengubah status favorit: ${error.message}`);
    }
}

// Update favorite count
async function updateFavoriteCount() {
    try {
        console.log('Calling /api/user-favorites/count');
        
        // Try the API call
        const response = await fetch('/api/user-favorites/count');
        
        if (!response.ok) {
            console.warn(`API returned ${response.status}: ${response.statusText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Favorite count API response:', result);
        
        if (!result.success) {
            console.warn('API returned success=false:', result.error);
            throw new Error(result.error || 'Failed to get favorite count');
        }

        let count = parseInt(result.count) || 0;
        
        console.log('Setting favorite count to:', count);
        
        // Update UI elements
        updateFavoriteUIElements(count);
        
    } catch (error) {
        console.error('Error updating favorite count:', error);
        console.log('Falling back to local favorite count calculation');
        
        // Fallback: try to get count from loaded favorites
        const localCount = Array.isArray(userFavorites) ? userFavorites.length : 0;
        console.log('Using local favorite count:', localCount);
        
        updateFavoriteUIElements(localCount);
    }
}

// Synchronize favorite hearts across all sections
function synchronizeFavoriteHearts() {
    console.log('Synchronizing favorite hearts across all sections');
    
    // Get all favorited asset IDs from the favorites container
    const favoritedAssets = new Set();
    
    // Check favorites in the favoritContainer
    document.querySelectorAll('#favoritContainer [data-aset-id]').forEach(heart => {
        if (heart.classList.contains('favorited')) {
            favoritedAssets.add(heart.getAttribute('data-aset-id'));
        }
    });
    
    // Also check from userFavorites array if available
    if (Array.isArray(userFavorites)) {
        userFavorites.forEach(favorite => {
            if (favorite.asset && favorite.asset.id) {
                favoritedAssets.add(favorite.asset.id.toString());
            }
        });
    }
    
    console.log('Favorited assets found:', Array.from(favoritedAssets));
    
    // Update all hearts across the entire page
    document.querySelectorAll('.favorite-heart[data-aset-id]').forEach(heart => {
        const assetId = heart.getAttribute('data-aset-id');
        
        if (favoritedAssets.has(assetId)) {
            // Should be favorited (red)
            if (!heart.classList.contains('favorited')) {
                heart.classList.add('favorited');
                heart.title = 'Hapus dari Favorit';
                console.log(`Added favorited class to asset ${assetId}`);
            }
        } else {
            // Should not be favorited (gray)
            if (heart.classList.contains('favorited')) {
                heart.classList.remove('favorited');
                heart.title = 'Tambah ke Favorit';
                console.log(`Removed favorited class from asset ${assetId}`);
            }
        }
    });
}
function updateFavoriteUIElements(count) {
    const numCount = parseInt(count) || 0;
    
    // Update count displays
    const totalFavoritElement = document.getElementById('totalFavorit');
    const favoritCountElement = document.getElementById('favoritCount');
    const favoriteBadge = document.getElementById('favoriteBadge');
    
    if (totalFavoritElement) {
        totalFavoritElement.textContent = numCount;
    }
    if (favoritCountElement) {
        favoritCountElement.textContent = numCount;
    }
    
    // Update favorite badge with strict checking
    if (favoriteBadge) {
        if (numCount > 0) {
            favoriteBadge.textContent = numCount;
            favoriteBadge.style.display = 'inline-block';
            console.log('Showing favorite badge with count:', numCount);
        } else {
            favoriteBadge.textContent = '0';
            favoriteBadge.style.display = 'none';
            console.log('Hiding favorite badge (count is 0)');
        }
    }
}

// Aggressive override function to prevent any dummy data
function forceResetFavoriteElements() {
    const totalFavoritElement = document.getElementById('totalFavorit');
    const favoritCountElement = document.getElementById('favoritCount');
    const favoriteBadge = document.getElementById('favoriteBadge');
    
    if (totalFavoritElement && totalFavoritElement.textContent !== '0') {
        console.warn('Detected non-zero favorite count, forcing to 0');
        totalFavoritElement.textContent = '0';
    }
    if (favoritCountElement && favoritCountElement.textContent !== '0') {
        console.warn('Detected non-zero favorite count badge, forcing to 0');
        favoritCountElement.textContent = '0';
    }
    if (favoriteBadge) {
        favoriteBadge.textContent = '0';
        favoriteBadge.style.display = 'none';
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('Favorites module initializing...');
    
    // Force reset badge on load
    const favoriteBadge = document.getElementById('favoriteBadge');
    if (favoriteBadge) {
        favoriteBadge.style.display = 'none';
        favoriteBadge.textContent = '0';
        console.log('Favorites module: Badge reset to hidden');
    }
    
    // Load favorites if we're on the favorites tab
    if (document.getElementById('favoritContainer')) {
        loadUserFavorites();
    }
    
    // Set up filter button
    const reloadFavoritBtn = document.getElementById('reloadFavoritBtn');
    if (reloadFavoritBtn) {
        reloadFavoritBtn.addEventListener('click', function() {
            loadUserFavorites();
        });
    }
    
    // Update favorite count after initialization
    setTimeout(() => {
        updateFavoriteCount();
    }, 100);
});