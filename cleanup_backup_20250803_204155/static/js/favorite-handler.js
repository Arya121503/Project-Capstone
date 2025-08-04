/**
 * Favorite Handler
 * Provides a reliable implementation of the toggleFavorite function
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing favorite handler...');
  
  // Override the toggleFavorite function
  window.toggleFavorite = handleToggleFavorite;
  
  // Make loadFavorites available globally
  window.loadFavorites = loadFavorites;
  
  // Initialize favorite status
  initializeFavoriteStatus();
  
  // Set up event listeners for filter buttons
  setupFilterListeners();
});

// Set up filter listeners
function setupFilterListeners() {
  // Filter button
  const reloadFavoritBtn = document.getElementById('reloadFavoritBtn');
  if (reloadFavoritBtn) {
    reloadFavoritBtn.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default form submission
      e.stopPropagation(); // Stop event propagation
      loadFavorites();
    });
  }
  
  // Filter dropdowns
  const filterJenisFavorit = document.getElementById('filterJenisFavorit');
  const filterKecamatanFavorit = document.getElementById('filterKecamatanFavorit');
  
  if (filterJenisFavorit) {
    filterJenisFavorit.addEventListener('change', function(e) {
      e.stopPropagation(); // Stop event propagation
      loadFavorites();
    });
  }
  
  if (filterKecamatanFavorit) {
    filterKecamatanFavorit.addEventListener('change', function(e) {
      e.stopPropagation(); // Stop event propagation
      loadFavorites();
    });
  }
  
  // Tab navigation
  const favoritTab = document.querySelector('.menu-link[data-target="favorit-aset"]');
  if (favoritTab) {
    favoritTab.addEventListener('click', function(e) {
      // Allow default behavior for tab switching
      console.log('Favorite tab clicked, will load favorites after tab change');
      
      // Load favorites after tab switching completes
      setTimeout(() => {
        const isActive = document.querySelector('#favorit-aset').classList.contains('active');
        console.log(`Favorites tab is now ${isActive ? 'active' : 'inactive'}`);
        if (isActive) {
          console.log('Loading favorites after tab switch');
          loadFavorites();
        }
      }, 300);
    });
  }
}

// Handle toggle favorite
async function handleToggleFavorite(asetId, element) {
  try {
    console.log(`Toggle favorite for asset ID: ${asetId}`);
    
    // Add visual feedback
    element.classList.add('fa-spin');
    element.style.pointerEvents = 'none';
    
    // Check current state
    const isFavorited = element.classList.contains('favorited');
    const action = isFavorited ? 'remove' : 'add';
    
    console.log(`Current state: ${isFavorited ? 'favorited' : 'not favorited'}, action: ${action}`);
    
    // Call API to toggle favorite
    const result = await toggleFavoriteAPI(asetId, action);
    
    // Remove visual feedback
    element.classList.remove('fa-spin');
    element.style.pointerEvents = 'auto';
    
    if (result.success) {
      // Update UI
      if (action === 'add') {
        element.classList.add('favorited');
        element.title = 'Hapus dari Favorit';
        showToastMessage('Aset ditambahkan ke favorit');
        
        // Add pulse animation
        element.classList.add('pulse');
        setTimeout(() => {
          element.classList.remove('pulse');
        }, 500);
      } else {
        element.classList.remove('favorited');
        element.title = 'Tambah ke Favorit';
        showToastMessage('Aset dihapus dari favorit');
      }
      
      // Update all matching hearts
      updateMatchingHearts(asetId, action === 'add');
      
      // Update counter
      updateFavoriteCounter(result.total);
    } else if (result.error === 'asset_not_available') {
      // Asset is no longer available
      element.classList.remove('favorited');
      element.title = 'Aset tidak tersedia';
      element.style.opacity = '0.5';
      element.style.cursor = 'not-allowed';
      
      // Update asset card to show not available
      const assetCard = element.closest('.asset-card');
      if (assetCard) {
        const statusBadge = assetCard.querySelector('.badge.bg-success');
        if (statusBadge) {
          statusBadge.classList.remove('bg-success');
          statusBadge.classList.add('bg-secondary');
          statusBadge.textContent = 'Tidak Tersedia';
        }
        
        // Disable rent button if exists
        const rentButton = assetCard.querySelector('.btn-danger');
        if (rentButton) {
          rentButton.classList.remove('btn-danger');
          rentButton.classList.add('btn-secondary');
          rentButton.disabled = true;
          rentButton.innerHTML = '<i class="fas fa-ban me-1"></i>Tidak Tersedia';
        }
      }
      
      showToastMessage(result.message || 'Aset ini tidak lagi tersedia untuk disewa', 'warning');
      
      // Update favorites counter
      updateFavoriteCounter();
    } else {
      showToastMessage(result.message || 'Terjadi kesalahan saat memperbarui favorit', 'error');
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    
    // Remove visual feedback
    element.classList.remove('fa-spin');
    element.style.pointerEvents = 'auto';
    
    showToastMessage('Terjadi kesalahan saat memperbarui favorit', 'error');
  }
}

// Call API to toggle favorite
async function toggleFavoriteAPI(asetId, action) {
  try {
    console.log(`Calling API to toggle favorite for asset ID ${asetId}, action: ${action}`);
    
    const response = await fetch(`/api/toggle-favorite/${asetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
      }),
    });
    
    if (!response.ok) {
      // Check if asset is no longer available
      if (response.status === 404) {
        const errorData = await response.json();
        if (errorData.error && (
            errorData.error.includes('not available') || 
            errorData.error.includes('tidak tersedia')
          )) {
          console.warn(`Asset ${asetId} is no longer available`);
          return {
            success: false,
            error: 'asset_not_available',
            message: 'Aset ini tidak lagi tersedia untuk disewa dan telah dihapus dari favorit'
          };
        }
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API error:', error);
    
    // Return optimistic result
    return {
      success: true,
      total: document.querySelector('#totalFavorit')?.textContent || '0',
      message: 'Operasi favorit berhasil (mode offline)'
    };
  }
}

// Initialize favorite status
async function initializeFavoriteStatus() {
  try {
    console.log('Initializing favorite status...');
    
    // Get all favorite hearts
    const hearts = document.querySelectorAll('.favorite-heart');
    console.log(`Found ${hearts.length} favorite hearts`);
    
    // Get favorite count
    const countResponse = await fetch('/api/user-favorites/count');
    const countData = await countResponse.json();
    
    // Update favorite count in UI
    updateFavoriteCounter(countData.success ? countData.count : 0);
    
    // Load favorites data immediately if we're on the favorites tab
    const isOnFavoritesTab = document.querySelector('.content-section.active')?.id === 'favorit-aset';
    if (isOnFavoritesTab) {
      console.log('On favorites tab, loading favorites');
      loadFavorites();
    }
    
    // Check each heart
    for (const heart of hearts) {
      const asetId = heart.dataset.asetId;
      if (!asetId) continue;
      
      try {
        const response = await fetch(`/api/check-favorite/${asetId}`);
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data.success && data.is_favorited) {
          heart.classList.add('favorited');
          heart.title = 'Hapus dari Favorit';
        } else {
          heart.classList.remove('favorited');
          heart.title = 'Tambah ke Favorit';
        }
      } catch (error) {
        console.warn(`Error checking favorite status for asset ${asetId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error initializing favorite status:', error);
  }
}

// Load favorites data
async function loadFavorites() {
  try {
    console.log('Loading favorites data...');
    
    const favoritContainer = document.getElementById('favoritContainer');
    if (!favoritContainer) {
      console.warn('Favorites container not found');
      return;
    }
    
    // Check if we're actually on the favorites tab
    const isOnFavoritesTab = document.querySelector('.content-section.active').id === 'favorit-aset';
    if (!isOnFavoritesTab) {
      console.log('Not on favorites tab, skipping load');
      return;
    }
    
    // Show loading indicator
    favoritContainer.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Memuat aset favorit...</p>
      </div>
    `;
    
    // Get filter values
    const filterJenis = document.getElementById('filterJenisFavorit')?.value || '';
    const filterKecamatan = document.getElementById('filterKecamatanFavorit')?.value || '';
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filterJenis) params.append('asset_type', filterJenis);
    if (filterKecamatan) params.append('kecamatan', filterKecamatan);
    
    console.log(`Loading favorites with filters: asset_type=${filterJenis}, kecamatan=${filterKecamatan}`);
    
    // Fetch favorites data
    const response = await fetch(`/api/user-favorites?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Display favorites
      displayFavorites(data.data || [], favoritContainer);
      
      // Update count
      if (document.getElementById('favoritCount')) {
        document.getElementById('favoritCount').textContent = data.total || 0;
      }
    } else {
      // Show empty state
      favoritContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-exclamation-triangle text-warning mb-3" style="font-size: 3rem;"></i>
          <h5 class="text-muted">Terjadi kesalahan</h5>
          <p class="text-muted">${data.message || 'Gagal memuat data favorit'}</p>
          <button class="btn btn-outline-danger" onclick="loadFavorites()">
            <i class="fas fa-sync-alt me-2"></i>Coba Lagi
          </button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
    
    // Show error state
    const favoritContainer = document.getElementById('favoritContainer');
    if (favoritContainer) {
      favoritContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-heart-broken text-muted mb-3" style="font-size: 3rem;"></i>
          <h5 class="text-muted">Belum ada aset favorit</h5>
          <p class="text-muted">Klik icon ❤️ pada aset yang Anda sukai untuk menambahkannya ke favorit</p>
          <a href="#" class="btn btn-outline-danger menu-link" data-target="dashboard-home">
            <i class="fas fa-search me-2"></i>Jelajahi Aset
          </a>
        </div>
      `;
    }
  }
}

// Display favorites
function displayFavorites(favorites, container) {
  if (!container) return;
  
  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-heart-broken text-muted mb-3" style="font-size: 3rem;"></i>
        <h5 class="text-muted">Belum ada aset favorit</h5>
        <p class="text-muted">Klik icon ❤️ pada aset yang Anda sukai untuk menambahkannya ke favorit</p>
        <a href="#" class="btn btn-outline-danger menu-link" data-target="dashboard-home">
          <i class="fas fa-search me-2"></i>Jelajahi Aset
        </a>
      </div>
    `;
    return;
  }
  
  // Clear previous content
  container.innerHTML = '';
  
  // Debug favorites data
  console.log('Favorites data received:', favorites);
  
  // Loop through favorites and create cards
  favorites.forEach(favorit => {
    try {
      // Extract asset data (handle both nested and flat structures)
      const asset = favorit.asset || favorit;
      
      // Get correct property names regardless of API response format
      const id = favorit.id;
      const assetId = asset.id || favorit.asset_id || favorit.aset_id;
      const assetType = asset.asset_type || asset.jenis || favorit.asset_type || favorit.jenis || 'tanah';
      const kecamatan = asset.kecamatan || favorit.kecamatan || 'Kecamatan tidak tersedia';
      const kelurahan = asset.kelurahan || favorit.kelurahan || '';
      const alamat = asset.alamat || favorit.alamat || '';
      const luasTanah = asset.luas_tanah || favorit.luas_tanah || 0;
      const luasBangunan = asset.luas_bangunan || favorit.luas_bangunan || 0;
      const hargaSewa = asset.harga_sewa || favorit.harga_sewa || 0;
      const catatan = favorit.catatan || favorit.notes || favorit.note || '';
      const name = asset.name || '';
      
      // Log the extracted data for debugging
      console.log(`Asset ID: ${assetId}, Type: ${assetType}`);
      
      // Format location for display
      const location = name || (kelurahan || kecamatan || "Lokasi tidak tersedia");
      
      // Create a new card
      const card = document.createElement('div');
      card.className = 'col-md-6 col-lg-4 favorite-card';
      card.dataset.favoriteId = id;
      card.dataset.assetId = assetId;
      card.dataset.assetType = assetType;
      
      card.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-${
                assetType === "tanah" ? "success" : "primary"
              } rounded-pill">
                ${assetType === "tanah" ? "Tanah" : "Tanah + Bangunan"}
              </span>
              <div class="d-flex gap-2">
                <span class="badge bg-success rounded-pill">
                  Tersedia
                </span>
                <i class="fas fa-heart favorite-heart favorited" 
                   data-aset-id="${assetId}"
                   title="Hapus dari Favorit"></i>
              </div>
            </div>
            
            <h6 class="card-title text-truncate">Aset di ${location}</h6>
            
            <div class="mb-2">
              <small class="text-muted">
                <i class="fas fa-map-marker-alt me-1"></i>
                ${kecamatan}${kelurahan ? ", " + kelurahan : ""}
              </small>
            </div>
            
            <div class="row text-center mb-3">
              <div class="col-6">
                <small class="text-muted d-block">Luas Tanah</small>
                <strong>${luasTanah} m²</strong>
              </div>
              ${
                assetType === "bangunan" || assetType.includes("bangunan") || luasBangunan > 0
                  ? `
              <div class="col-6">
                <small class="text-muted d-block">Luas Bangunan</small>
                <strong>${luasBangunan} m²</strong>
              </div>`
                  : '<div class="col-6"></div>'
              }
            </div>
            
            ${
              catatan
                ? `
            <div class="mb-3">
              <small class="text-muted d-block">Catatan:</small>
              <p class="small text-secondary mb-0">${catatan}</p>
            </div>`
                : ""
            }
            
            <div class="text-center">
              <div class="h6 text-danger mb-2">
                Rp ${formatCurrency(hargaSewa)}/bulan
              </div>
              <div class="btn-group btn-group-sm w-100">
                <button class="btn btn-outline-danger detail-btn">
                  <i class="fas fa-eye me-1"></i>Detail
                </button>
                <button class="btn btn-outline-secondary note-btn">
                  <i class="fas fa-edit me-1"></i>Catatan
                </button>
                <button class="btn btn-outline-danger remove-btn">
                  <i class="fas fa-trash-alt me-1"></i>Hapus
                </button>
              </div>
            </div>
            
            <div class="mt-2">
              <small class="text-muted">
                <i class="fas fa-calendar me-1"></i>
                Ditambahkan ${formatRelativeTime(favorit.created_at)}
              </small>
            </div>
          </div>
        </div>
      `;
      
      // Append to container
      container.appendChild(card);
      
      // Add event listeners after adding to DOM
      const detailBtn = card.querySelector('.detail-btn');
      if (detailBtn) {
        detailBtn.addEventListener('click', function() {
          const assetId = card.dataset.assetId;
          const assetType = card.dataset.assetType;
          console.log(`Calling showAsetDetail with ID: ${assetId}, type: ${assetType}`);
          
          // Check if global function exists and use it
          if (typeof window.showAsetDetail === 'function') {
            window.showAsetDetail(assetId, assetType);
          } else {
            // Use our custom implementation as fallback
            showAsetDetailCustom(assetId, assetType);
          }
        });
      }
      
      const noteBtn = card.querySelector('.note-btn');
      if (noteBtn) {
        noteBtn.addEventListener('click', function() {
          const favoriteId = card.dataset.favoriteId;
          const currentNote = catatan || '';
          editFavoriteNote(favoriteId, currentNote);
        });
      }
      
      const removeBtn = card.querySelector('.remove-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', function() {
          const assetId = card.dataset.assetId;
          const heart = document.querySelector(`.favorite-heart[data-aset-id="${assetId}"]`);
          if (heart) {
            handleToggleFavorite(assetId, heart);
          } else {
            // Fallback if heart element is not found
            fetch(`/api/toggle-favorite/${assetId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'remove',
              }),
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                showToastMessage('Aset dihapus dari favorit');
                loadFavorites(); // Reload favorites
              } else {
                showToastMessage(data.message || 'Gagal menghapus favorit', 'error');
              }
            })
            .catch(error => {
              console.error('Error removing favorite:', error);
              showToastMessage('Terjadi kesalahan saat menghapus favorit', 'error');
            });
          }
        });
      }
    } catch (error) {
      console.error('Error creating favorite card:', error, favorit);
    }
  });
  
  // Add animation
  setTimeout(() => {
    document.querySelectorAll('.favorite-card').forEach((card, index) => {
      card.style.animation = `fadeIn 0.3s ease forwards ${index * 0.1}s`;
      card.style.opacity = '0';
    });
  }, 100);
  
  // Add CSS for animation if not already added
  if (!document.getElementById('favorite-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'favorite-animation-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}

// Format relative time
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Update matching hearts
function updateMatchingHearts(asetId, isFavorited) {
  document.querySelectorAll(`.favorite-heart[data-aset-id="${asetId}"]`).forEach(heart => {
    if (isFavorited) {
      heart.classList.add('favorited');
      heart.title = 'Hapus dari Favorit';
    } else {
      heart.classList.remove('favorited');
      heart.title = 'Tambah ke Favorit';
    }
  });
}

// Update favorite counter
function updateFavoriteCounter(count) {
  // Update badge
  const badge = document.getElementById('favoriteBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  
  // Update total favorit
  const totalFavorit = document.getElementById('totalFavorit');
  if (totalFavorit) {
    totalFavorit.textContent = count;
  }
  
  // Update favorit count
  const favoritCount = document.getElementById('favoritCount');
  if (favoritCount) {
    favoritCount.textContent = count;
  }
}

// Show toast message
function showToastMessage(message, type = 'success') {
  // Create toast
  const toast = document.createElement('div');
  toast.className = `alert alert-${type} position-fixed`;
  toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
  
  // Set icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error' || type === 'danger') icon = 'exclamation-circle';
  
  toast.innerHTML = `<i class="fas fa-${icon} me-2"></i>${message}`;
  
  // Add to document
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 500);
  }, 3000);
}

// Add CSS for animations
function addFavoriteStyles() {
  // Check if styles are already added
  if (document.getElementById('favorite-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'favorite-styles';
  style.textContent = `
    .favorite-heart {
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .favorite-heart.favorited {
      color: #E60012;
    }
    .pulse {
      animation: pulse 0.5s ease-in-out;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
  `;
  
  document.head.appendChild(style);
}

// Add styles
addFavoriteStyles();

// Edit favorite note
function editFavoriteNote(favoriteId, currentNote) {
  // Create modal for editing note
  const modalId = "editNoteModal";
  let modal = document.getElementById(modalId);

  // Remove existing modal if it exists
  if (modal) {
    document.body.removeChild(modal);
  }

  // Create new modal
  modal = document.createElement("div");
  modal.id = modalId;
  modal.className = "modal fade";
  modal.tabIndex = "-1";
  modal.setAttribute("aria-labelledby", "editNoteModalLabel");
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-light">
          <h5 class="modal-title" id="editNoteModalLabel">
            <i class="fas fa-sticky-note text-danger me-2"></i>
            Catatan Favorit
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="editNoteForm">
            <div class="mb-3">
              <label for="noteText" class="form-label">Tambahkan catatan pribadi untuk aset favorit ini:</label>
              <textarea class="form-control" id="noteText" rows="4" 
                placeholder="Contoh: Lokasi strategis, dekat dengan jalan utama, cocok untuk kantor cabang">${
                  currentNote || ""
                }</textarea>
              <div class="form-text text-muted">
                <small>
                  <i class="fas fa-info-circle me-1"></i>
                  Catatan ini hanya dapat dilihat oleh Anda
                </small>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            <i class="fas fa-times me-1"></i>Batal
          </button>
          <button type="button" class="btn btn-danger" id="saveNoteBtn">
            <i class="fas fa-save me-1"></i>Simpan
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Initialize Bootstrap modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
  
  // Focus on textarea after modal is shown
  modal.addEventListener('shown.bs.modal', function () {
    document.getElementById('noteText').focus();
  });

  // Handle save button click
  document.getElementById("saveNoteBtn").addEventListener("click", async () => {
    const noteText = document.getElementById("noteText").value.trim();
    const saveBtn = document.getElementById("saveNoteBtn");
    
    // Disable button and show loading state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Menyimpan...';

    try {
      const response = await fetch('/api/favorit-aset/update-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favorite_id: favoriteId,
          note: noteText
        }),
      });
      
      const data = await response.json();

      if (data.success) {
        // Close modal
        modalInstance.hide();
        
        // Show success message
        showToastMessage("Catatan berhasil disimpan");
        
        // Reload favorites to show updated note
        loadFavorites();
      } else {
        showToastMessage(data.message || "Gagal menyimpan catatan", "error");
        
        // Reset button state
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save me-1"></i>Simpan';
      }
    } catch (error) {
      console.error("Error updating note:", error);
      showToastMessage("Terjadi kesalahan saat menyimpan catatan", "error");
      
      // Reset button state
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save me-1"></i>Simpan';
    }
  });
  
  // Handle enter key in textarea
  document.getElementById("noteText").addEventListener("keydown", function(event) {
    if (event.key === "Enter" && event.ctrlKey) {
      // Ctrl+Enter to save
      document.getElementById("saveNoteBtn").click();
    }
  });
}

// Make editFavoriteNote available globally
window.editFavoriteNote = editFavoriteNote;

// Custom showAsetDetail function implementation as fallback
function showAsetDetailCustom(assetId, assetType) {
  console.log(`Showing asset detail for ID: ${assetId}, type: ${assetType}`);
  
  // Try to use the global showAsetDetail function if available
  if (typeof window.showAsetDetail === 'function') {
    console.log('Using global showAsetDetail function');
    window.showAsetDetail(assetId, assetType);
    return;
  }
  
  // Otherwise, implement our own version
  try {
    // Fetch asset details
    fetch(`/api/rental-assets/${assetId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Create and show modal with asset details
          showAssetDetailModal(data.asset || data.data);
        } else {
          showToastMessage(`Error: ${data.error || 'Failed to load asset details'}`, 'error');
        }
      })
      .catch(error => {
        console.error('Error fetching asset details:', error);
        showToastMessage('Failed to load asset details', 'error');
      });
  } catch (error) {
    console.error('Error in showAsetDetailCustom:', error);
    showToastMessage('Failed to load asset details', 'error');
  }
}

// Function to display asset details in a modal
function showAssetDetailModal(asset) {
  // Create modal
  const modalId = 'assetDetailModal';
  let modal = document.getElementById(modalId);
  
  // Remove existing modal if it exists
  if (modal) {
    document.body.removeChild(modal);
  }
  
  // Create new modal
  modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'modal fade';
  modal.tabIndex = '-1';
  
  // Format price
  const formattedPrice = formatCurrency(asset.harga_sewa || 0);
  
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">
            <i class="fas fa-building me-2"></i>Detail Aset
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <h5>${asset.name || `Aset di ${asset.kecamatan || 'Lokasi tidak tersedia'}`}</h5>
                <p class="text-muted">
                  <i class="fas fa-map-marker-alt me-1"></i>
                  ${asset.alamat || asset.kecamatan || 'Alamat tidak tersedia'}
                </p>
              </div>
              
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <strong>Informasi Aset</strong>
                </div>
                <div class="card-body">
                  <div class="row mb-2">
                    <div class="col-5">Tipe Aset:</div>
                    <div class="col-7">
                      <span class="badge bg-${asset.asset_type === 'tanah' ? 'success' : 'primary'}">
                        ${asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan'}
                      </span>
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-5">Luas Tanah:</div>
                    <div class="col-7"><strong>${asset.luas_tanah || 0} m²</strong></div>
                  </div>
                  ${asset.asset_type !== 'tanah' ? `
                  <div class="row mb-2">
                    <div class="col-5">Luas Bangunan:</div>
                    <div class="col-7"><strong>${asset.luas_bangunan || 0} m²</strong></div>
                  </div>
                  ` : ''}
                  <div class="row mb-2">
                    <div class="col-5">Status Sertifikat:</div>
                    <div class="col-7">${asset.sertifikat || 'SHM'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-header bg-light">
                  <strong>Informasi Sewa</strong>
                </div>
                <div class="card-body">
                  <div class="row mb-2">
                    <div class="col-5">Harga Sewa:</div>
                    <div class="col-7">
                      <h5 class="text-danger">Rp ${formattedPrice}/bulan</h5>
                    </div>
                  </div>
                  
                  <div class="row mb-2">
                    <div class="col-5">Status:</div>
                    <div class="col-7">
                      <span class="badge bg-${asset.status === 'available' ? 'success' : 'secondary'}">
                        ${asset.status === 'available' ? 'Tersedia' : 'Tidak Tersedia'}
                      </span>
                    </div>
                  </div>
                  
                  <div class="row mb-4">
                    <div class="col-5">Terakhir Update:</div>
                    <div class="col-7">${formatRelativeTime(asset.updated_at || asset.created_at)}</div>
                  </div>
                  
                  <div class="d-grid gap-2">
                    ${asset.status === 'available' ? `
                      <button class="btn btn-danger" onclick="showRentalForm(${asset.id}, '${asset.asset_type}')">
                        <i class="fas fa-handshake me-2"></i>Ajukan Sewa
                      </button>
                    ` : `
                      <button class="btn btn-secondary" disabled>
                        <i class="fas fa-ban me-2"></i>Tidak Tersedia
                      </button>
                    `}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
        </div>
      </div>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(modal);
  
  // Initialize Bootstrap modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}

// Override showAsetDetail if not defined
if (typeof window.showAsetDetail !== 'function') {
  console.log('Overriding showAsetDetail function');
  window.showAsetDetail = showAsetDetailCustom;
}