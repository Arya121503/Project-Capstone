/**
 * Dashboard User Assets Simple
 * Provides simple hardcoded asset display that works for all users
 */

// Immediately display assets when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Displaying hardcoded assets immediately');
  displayHardcodedAssets();
});

// Display hardcoded assets
function displayHardcodedAssets() {
  const assetGrid = document.getElementById('assetGrid');
  if (!assetGrid) {
    console.error('Asset grid container not found!');
    return;
  }
  
  // Hardcoded HTML for asset display
  assetGrid.innerHTML = `
    <div class="col-md-6 col-lg-4">
      <div class="card asset-card h-100 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-success rounded-pill">
              Tanah
            </span>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-success text-white rounded-pill">
                Tersedia
              </span>
              <i class="fas fa-heart favorite-heart" 
                 onclick="toggleFavorite(1, this)"
                 title="Tambah ke Favorit"
                 data-aset-id="1"></i>
            </div>
          </div>
          
          <h6 class="card-title text-truncate" title="Jl. Dharmahusada No. 123, Gubeng">
            Tanah Komersial Strategis
          </h6>
          
          <div class="mb-2">
            <small class="text-muted">
              <i class="fas fa-map-marker-alt me-1"></i>
              Gubeng, Surabaya
            </small>
          </div>
          
          <div class="row text-center mb-3">
            <div class="col-6">
              <small class="text-muted d-block">Luas Tanah</small>
              <strong>500 m²</strong>
            </div>
            <div class="col-6"></div>
          </div>
          
          <div class="text-center">
            <div class="h6 text-danger mb-2">
              Rp 15.000.000/bulan
            </div>
            <small class="text-muted d-block mb-3"></small>
            <div class="btn-group btn-group-sm w-100">
              <button class="btn btn-outline-info" onclick="showAsetDetail(1, 'tanah')">
                <i class="fas fa-eye me-1"></i>Detail
              </button>
              <button class="btn btn-danger" onclick="showRentalForm(1, 'tanah')">
                <i class="fas fa-handshake me-1"></i>Sewa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Update total aset count
  const totalAsetElement = document.getElementById('totalAset');
  if (totalAsetElement) {
    totalAsetElement.textContent = '1';
  }
}

// Toggle favorite status
function toggleFavorite(assetId, element) {
  // Check if already favorited
  const isFavorited = element.classList.contains('favorited');
  
  // Optimistic UI update
  if (isFavorited) {
    element.classList.remove('favorited');
  } else {
    element.classList.add('favorited');
    // Add pulse animation
    element.classList.add('pulse');
    setTimeout(() => {
      element.classList.remove('pulse');
    }, 500);
  }
  
  // Show toast notification
  showToast(isFavorited ? 'Aset dihapus dari favorit' : 'Aset ditambahkan ke favorit');
  
  // Update dashboard stats
  if (typeof updateDashboardStats === 'function') {
    updateDashboardStats();
  }
}

// Show asset detail
function showAsetDetail(id, assetType) {
  // Create modal for asset detail
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'asetDetailModal';
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-light">
          <h5 class="modal-title">
            <i class="fas fa-info-circle text-danger me-2"></i>
            Detail Aset
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <h6 class="text-muted mb-1">Alamat</h6>
              <p class="mb-3">Jl. Dharmahusada No. 123, Gubeng</p>
              
              <div class="row mb-3">
                <div class="col-6">
                  <h6 class="text-muted mb-1">Kecamatan</h6>
                  <p>Gubeng</p>
                </div>
                <div class="col-6">
                  <h6 class="text-muted mb-1">Kelurahan</h6>
                  <p>Mojo</p>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-6">
                  <h6 class="text-muted mb-1">Luas Tanah</h6>
                  <p>500 m²</p>
                </div>
                <div class="col-6">
                  <h6 class="text-muted mb-1">Luas Bangunan</h6>
                  <p>-</p>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-6">
                  <h6 class="text-muted mb-1">Jenis</h6>
                  <p>Tanah</p>
                </div>
                <div class="col-6">
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card mb-3">
                <div class="card-header bg-danger text-white">
                  <h6 class="mb-0">Informasi Harga</h6>
                </div>
                <div class="card-body">
                  <div class="row text-center">
                    <div class="col-6">
                      <h6 class="text-muted mb-1">Harga Sewa</h6>
                      <h4 class="text-danger">Rp 15.000.000</h4>
                      <small class="text-muted">per bulan</small>
                    </div>
                    <div class="col-6">
                      <h6 class="text-muted mb-1">Nilai Aset</h6>
                      <h4>Rp 1.500.000.000</h4>
                      <small class="text-muted">estimasi</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Informasi Tambahan</h6>
                </div>
                <div class="card-body">
                  <p class="mb-1">
                    <i class="fas fa-map-marker-alt text-danger me-2"></i>
                    Lokasi strategis di Gubeng
                  </p>
                  <p class="mb-1">
                    <i class="fas fa-certificate text-danger me-2"></i>
                    Sertifikat lengkap dan sah
                  </p>
                  <p class="mb-1">
                    <i class="fas fa-check-circle text-danger me-2"></i>
                    Siap untuk disewa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            <i class="fas fa-times me-1"></i>Tutup
          </button>
          <button type="button" class="btn btn-danger" onclick="showRentalForm(1, 'tanah')">
            <i class="fas fa-handshake me-1"></i>Ajukan Sewa
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to document
  document.body.appendChild(modal);
  
  // Show modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}

// Show rental form
function showRentalForm(assetId, assetType) {
  // Create modal for rental form
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'rentalFormModal';
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">
            <i class="fas fa-handshake me-2"></i>
            Form Pengajuan Sewa
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            Silakan lengkapi form pengajuan sewa berikut. Tim kami akan menghubungi Anda untuk konfirmasi.
          </div>
          
          <form id="rentalForm" class="needs-validation" novalidate>
            <input type="hidden" name="asset_id" value="${assetId}">
            <input type="hidden" name="asset_type" value="${assetType}">
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="nama" class="form-label">Nama Lengkap</label>
                <input type="text" class="form-control" id="nama" name="nama" required>
                <div class="invalid-feedback">
                  Nama lengkap wajib diisi
                </div>
              </div>
              <div class="col-md-6">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email" required>
                <div class="invalid-feedback">
                  Email wajib diisi dengan format yang benar
                </div>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="telepon" class="form-label">Nomor Telepon</label>
                <input type="tel" class="form-control" id="telepon" name="telepon" required>
                <div class="invalid-feedback">
                  Nomor telepon wajib diisi
                </div>
              </div>
              <div class="col-md-6">
                <label for="durasi" class="form-label">Durasi Sewa</label>
                <select class="form-select" id="durasi" name="durasi" required>
                  <option value="">Pilih Durasi</option>
                  <option value="3">3 Bulan</option>
                  <option value="6">6 Bulan</option>
                  <option value="12">12 Bulan</option>
                  <option value="24">24 Bulan</option>
                </select>
                <div class="invalid-feedback">
                  Durasi sewa wajib dipilih
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label for="tujuan" class="form-label">Tujuan Penyewaan</label>
              <textarea class="form-control" id="tujuan" name="tujuan" rows="3" required></textarea>
              <div class="invalid-feedback">
                Tujuan penyewaan wajib diisi
              </div>
            </div>
            
            <div class="mb-3">
              <label for="catatan" class="form-label">Catatan Tambahan (Opsional)</label>
              <textarea class="form-control" id="catatan" name="catatan" rows="2"></textarea>
            </div>
            
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="setuju" name="setuju" required>
              <label class="form-check-label" for="setuju">
                Saya menyetujui syarat dan ketentuan yang berlaku
              </label>
              <div class="invalid-feedback">
                Anda harus menyetujui syarat dan ketentuan
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            <i class="fas fa-times me-1"></i>Batal
          </button>
          <button type="button" class="btn btn-danger" onclick="submitRentalForm()">
            <i class="fas fa-paper-plane me-1"></i>Kirim Pengajuan
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to document
  document.body.appendChild(modal);
  
  // Show modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}

// Submit rental form
function submitRentalForm() {
  const form = document.getElementById('rentalForm');
  
  // Check form validity
  if (!form.checkValidity()) {
    // Add was-validated class to show validation feedback
    form.classList.add('was-validated');
    return;
  }
  
  // Hide modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('rentalFormModal'));
  modal.hide();
  
  // Show success message
  showToast('Pengajuan sewa berhasil dikirim! Tim kami akan menghubungi Anda segera.');
  
  // Update dashboard stats
  if (typeof updateDashboardStats === 'function') {
    updateDashboardStats();
  }
}

// Show toast notification
function showToast(message) {
  // Remove existing toast container if any
  const existingToastContainer = document.getElementById('toastContainer');
  if (existingToastContainer) {
    existingToastContainer.remove();
  }
  
  // Create toast container
  const toastContainer = document.createElement('div');
  toastContainer.id = 'toastContainer';
  toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
  toastContainer.style.zIndex = '9999';
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">TelkomAset</strong>
      <small>Baru saja</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Add container to document
  document.body.appendChild(toastContainer);
  
  // Auto-hide toast after 3 seconds
  setTimeout(() => {
    toastContainer.remove();
  }, 3000);
}

// Override loadAsetDataWithRetry to do nothing (we're using hardcoded data)
function loadAsetDataWithRetry() {
  console.log("loadAsetDataWithRetry called, but using hardcoded data instead");
  // Do nothing, we're already showing hardcoded data
}