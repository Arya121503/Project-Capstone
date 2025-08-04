/**
 * Admin Rental Requests
 * Handles admin rental request management
 */

// Global variables
let adminRentalRequests = [];

// Load rental requests from API
async function loadAdminRentalRequests(filters = {}) {
    try {
        // Show loading state
        document.getElementById('rentalRequestsContainer').innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Memuat permintaan sewa...</p>
            </div>
        `;
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        
        // Fetch data from API
        const response = await fetch(`/api/admin/rental-requests?${queryParams.toString()}`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load rental requests');
        }
        
        // Store rental requests
        adminRentalRequests = result.data;
        
        // Update UI
        updateAdminRentalRequestsUI();
        
        // Update request counts
        updateRentalRequestCounts();
        
        return adminRentalRequests;
    } catch (error) {
        console.error('Error loading rental requests:', error);
        
        // Show error message
        document.getElementById('rentalRequestsContainer').innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
                <h5>Gagal memuat data</h5>
                <p class="text-muted">${error.message}</p>
            </div>
        `;
        
        return [];
    }
}

// Update rental requests UI
function updateAdminRentalRequestsUI() {
    const container = document.getElementById('rentalRequestsContainer');
    
    if (!container) return;
    
    if (adminRentalRequests.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                <h5>Tidak ada permintaan sewa</h5>
                <p class="text-muted">Belum ada permintaan sewa yang diajukan</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Sort by created_at (newest first)
    const sortedRequests = [...adminRentalRequests].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    sortedRequests.forEach(request => {
        // Format dates
        const createdDate = new Date(request.created_at);
        const startDate = new Date(request.start_date);
        const endDate = request.end_date ? new Date(request.end_date) : null;
        
        const formattedCreatedDate = createdDate.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        });
        
        const formattedStartDate = startDate.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        });
        
        const formattedEndDate = endDate ? endDate.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        }) : '-';
        
        // Determine status badge
        let statusBadge = '';
        switch (request.status) {
            case 'pending':
                statusBadge = '<span class="badge bg-warning text-dark">Menunggu</span>';
                break;
            case 'approved':
                statusBadge = '<span class="badge bg-success">Disetujui</span>';
                break;
            case 'rejected':
                statusBadge = '<span class="badge bg-danger">Ditolak</span>';
                break;
            case 'active':
                statusBadge = '<span class="badge bg-primary">Aktif</span>';
                break;
            case 'completed':
                statusBadge = '<span class="badge bg-secondary">Selesai</span>';
                break;
            default:
                statusBadge = '<span class="badge bg-secondary">Unknown</span>';
        }
        
        // Action buttons based on status
        let actionButtons = '';
        if (request.status === 'pending') {
            actionButtons = `
                <button class="btn btn-sm btn-success me-2" onclick="showApproveModal(${request.id})">
                    <i class="fas fa-check me-1"></i>Setujui
                </button>
                <button class="btn btn-sm btn-danger" onclick="showRejectModal(${request.id})">
                    <i class="fas fa-times me-1"></i>Tolak
                </button>
            `;
        } else {
            actionButtons = `
                <button class="btn btn-sm btn-outline-primary" onclick="viewRentalDetails(${request.id})">
                    <i class="fas fa-eye me-1"></i>Lihat Detail
                </button>
            `;
        }
        
        html += `
            <div class="card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Pengajuan #${request.id}</strong>
                        <small class="text-muted ms-2">${formattedCreatedDate}</small>
                    </div>
                    <div>
                        ${statusBadge}
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <h6>${request.asset_name || 'Aset tidak ditemukan'}</h6>
                            <p class="text-muted mb-0">ID Aset: ${request.asset_id}</p>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <h6 class="text-danger">Rp ${new Intl.NumberFormat('id-ID').format(request.monthly_price)}/bulan</h6>
                            <p class="text-muted mb-0">Total: Rp ${new Intl.NumberFormat('id-ID').format(request.total_price)}</p>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <small class="text-muted d-block">Tanggal Mulai</small>
                            <strong>${formattedStartDate}</strong>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Tanggal Berakhir</small>
                            <strong>${formattedEndDate}</strong>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted d-block">Durasi</small>
                            <strong>${request.total_months} bulan</strong>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <small class="text-muted d-block">Nama Penyewa</small>
                            <strong>${request.user_name}</strong>
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted d-block">Kontak</small>
                            <strong>${request.user_email} / ${request.user_phone || '-'}</strong>
                        </div>
                    </div>
                    
                    ${request.admin_notes ? `
                        <div class="alert alert-${request.status === 'rejected' ? 'danger' : 'info'} mb-3">
                            <small class="d-block fw-bold">Catatan Admin:</small>
                            ${request.admin_notes}
                        </div>
                    ` : ''}
                    
                    <div class="d-flex justify-content-end">
                        ${actionButtons}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}//
 //Update rental request counts
async function updateRentalRequestCounts() {
    try {
        const response = await fetch('/api/admin/rental-request-count');
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load request counts');
        }
        
        const counts = result.data;
        
        // Update counts in UI
        document.getElementById('pendingRequestCount').textContent = counts.pending;
        document.getElementById('totalRequestCount').textContent = counts.total;
        
        // Update notification badge if there are pending requests
        const notificationBadge = document.getElementById('adminNotificationBadge');
        if (notificationBadge) {
            if (counts.pending > 0) {
                notificationBadge.textContent = counts.pending;
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
        
        return counts;
    } catch (error) {
        console.error('Error updating request counts:', error);
        return null;
    }
}

// Show approve modal
function showApproveModal(requestId) {
    const request = adminRentalRequests.find(r => r.id === requestId);
    
    if (!request) {
        alert('Data permintaan sewa tidak ditemukan');
        return;
    }
    
    // Create modal if it doesn't exist
    let approveModal = document.getElementById('approveRentalModal');
    if (!approveModal) {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = `
            <div class="modal fade" id="approveRentalModal" tabindex="-1" aria-labelledby="approveRentalModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title" id="approveRentalModalLabel">Setujui Permintaan Sewa</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Anda akan menyetujui permintaan sewa berikut:</p>
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h6 id="approveAssetName">Nama Aset</h6>
                                    <p class="text-muted mb-0" id="approveAssetDetails">Detail Aset</p>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="approveAdminNotes" class="form-label">Catatan Admin (opsional)</label>
                                <textarea class="form-control" id="approveAdminNotes" rows="3" placeholder="Tambahkan catatan untuk penyewa..."></textarea>
                            </div>
                            
                            <div class="alert alert-warning">
                                <i class="fas fa-info-circle me-1"></i>
                                Setelah disetujui, status aset akan berubah menjadi "Disewa" dan tidak akan tersedia untuk penyewa lain.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                            <button type="button" class="btn btn-success" id="confirmApproveBtn">Setujui Permintaan</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv.firstElementChild);
        approveModal = document.getElementById('approveRentalModal');
    }
    
    // Update modal content
    document.getElementById('approveAssetName').textContent = request.asset_name || 'Aset tidak ditemukan';
    document.getElementById('approveAssetDetails').textContent = `Disewa oleh ${request.user_name} untuk ${request.total_months} bulan`;
    document.getElementById('approveAdminNotes').value = '';
    
    // Set up confirm button
    document.getElementById('confirmApproveBtn').onclick = async function() {
        try {
            // Close modal
            bootstrap.Modal.getInstance(approveModal).hide();
            
            // Show loading
            showAdminAlert('info', 'Memproses persetujuan...', false);
            
            // Submit request to API
            const response = await fetch(`/api/admin/approve-rental-request/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    admin_notes: document.getElementById('approveAdminNotes').value
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to approve rental request');
            }
            
            // Show success message
            showAdminAlert('success', 'Permintaan sewa berhasil disetujui!');
            
            // Reload rental requests
            loadAdminRentalRequests();
        } catch (error) {
            console.error('Error approving rental request:', error);
            showAdminAlert('error', `Gagal menyetujui permintaan sewa: ${error.message}`);
        }
    };
    
    // Show modal
    const modal = new bootstrap.Modal(approveModal);
    modal.show();
}// Show
//reject modal
function showRejectModal(requestId) {
    const request = adminRentalRequests.find(r => r.id === requestId);
    
    if (!request) {
        alert('Data permintaan sewa tidak ditemukan');
        return;
    }
    
    // Create modal if it doesn't exist
    let rejectModal = document.getElementById('rejectRentalModal');
    if (!rejectModal) {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = `
            <div class="modal fade" id="rejectRentalModal" tabindex="-1" aria-labelledby="rejectRentalModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title" id="rejectRentalModalLabel">Tolak Permintaan Sewa</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Anda akan menolak permintaan sewa berikut:</p>
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h6 id="rejectAssetName">Nama Aset</h6>
                                    <p class="text-muted mb-0" id="rejectAssetDetails">Detail Aset</p>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="rejectAdminNotes" class="form-label">Alasan Penolakan <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="rejectAdminNotes" rows="3" placeholder="Berikan alasan penolakan untuk penyewa..." required></textarea>
                                <div class="invalid-feedback">Alasan penolakan harus diisi</div>
                            </div>
                            
                            <div class="alert alert-warning">
                                <i class="fas fa-info-circle me-1"></i>
                                Setelah ditolak, permintaan sewa tidak dapat diubah kembali.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                            <button type="button" class="btn btn-danger" id="confirmRejectBtn">Tolak Permintaan</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv.firstElementChild);
        rejectModal = document.getElementById('rejectRentalModal');
    }
    
    // Update modal content
    document.getElementById('rejectAssetName').textContent = request.asset_name || 'Aset tidak ditemukan';
    document.getElementById('rejectAssetDetails').textContent = `Diajukan oleh ${request.user_name} untuk ${request.total_months} bulan`;
    document.getElementById('rejectAdminNotes').value = '';
    
    // Set up confirm button
    document.getElementById('confirmRejectBtn').onclick = async function() {
        const rejectNotes = document.getElementById('rejectAdminNotes').value.trim();
        
        if (!rejectNotes) {
            document.getElementById('rejectAdminNotes').classList.add('is-invalid');
            return;
        }
        
        try {
            // Close modal
            bootstrap.Modal.getInstance(rejectModal).hide();
            
            // Show loading
            showAdminAlert('info', 'Memproses penolakan...', false);
            
            // Submit request to API
            const response = await fetch(`/api/admin/reject-rental-request/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    admin_notes: rejectNotes
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to reject rental request');
            }
            
            // Show success message
            showAdminAlert('success', 'Permintaan sewa berhasil ditolak!');
            
            // Reload rental requests
            loadAdminRentalRequests();
        } catch (error) {
            console.error('Error rejecting rental request:', error);
            showAdminAlert('error', `Gagal menolak permintaan sewa: ${error.message}`);
        }
    };
    
    // Reset validation
    document.getElementById('rejectAdminNotes').addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
    
    // Show modal
    const modal = new bootstrap.Modal(rejectModal);
    modal.show();
}

// View rental details
function viewRentalDetails(requestId) {
    const request = adminRentalRequests.find(r => r.id === requestId);
    
    if (!request) {
        alert('Data permintaan sewa tidak ditemukan');
        return;
    }
    
    // Format dates
    const startDate = new Date(request.start_date);
    const endDate = request.end_date ? new Date(request.end_date) : null;
    
    const formattedStartDate = startDate.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
    });
    
    const formattedEndDate = endDate ? endDate.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
    }) : '-';
    
    // Create modal if it doesn't exist
    let detailModal = document.getElementById('adminRentalDetailModal');
    if (!detailModal) {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = `
            <div class="modal fade" id="adminRentalDetailModal" tabindex="-1" aria-labelledby="adminRentalDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="adminRentalDetailModalLabel">Detail Sewa</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="adminRentalDetailContent">
                            <!-- Content will be inserted here -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv.firstElementChild);
        detailModal = document.getElementById('adminRentalDetailModal');
    }
    
    // Populate modal content
    const modalContent = document.getElementById('adminRentalDetailContent');
    modalContent.innerHTML = `
        <div class="mb-3">
            <h5>${request.asset_name || 'Aset tidak ditemukan'}</h5>
            <span class="badge bg-${request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'primary'} mb-2">
                ${request.status === 'approved' ? 'Disetujui' : request.status === 'rejected' ? 'Ditolak' : 'Aktif'}
            </span>
        </div>
        
        <div class="row mb-3">
            <div class="col-6">
                <small class="text-muted d-block">Tanggal Mulai</small>
                <strong>${formattedStartDate}</strong>
            </div>
            <div class="col-6">
                <small class="text-muted d-block">Tanggal Berakhir</small>
                <strong>${formattedEndDate}</strong>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-6">
                <small class="text-muted d-block">Durasi</small>
                <strong>${request.total_months} bulan</strong>
            </div>
            <div class="col-6">
                <small class="text-muted d-block">Harga per Bulan</small>
                <strong>Rp ${new Intl.NumberFormat('id-ID').format(request.monthly_price)}</strong>
            </div>
        </div>
        
        <div class="alert alert-info mb-3">
            <strong>Total Biaya Sewa:</strong> Rp ${new Intl.NumberFormat('id-ID').format(request.total_price)}
        </div>
        
        <div class="row mb-3">
            <div class="col-12">
                <h6>Informasi Penyewa</h6>
            </div>
            <div class="col-6">
                <small class="text-muted d-block">Nama</small>
                <strong>${request.user_name}</strong>
            </div>
            <div class="col-6">
                <small class="text-muted d-block">Email</small>
                <strong>${request.user_email}</strong>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-6">
                <small class="text-muted d-block">Telepon</small>
                <strong>${request.user_phone || '-'}</strong>
            </div>
            <div class="col-6">
                <small class="text-muted d-block">User ID</small>
                <strong>${request.user_id}</strong>
            </div>
        </div>
        
        ${request.admin_notes ? `
            <div class="mb-3">
                <small class="text-muted d-block">Catatan Admin</small>
                <p>${request.admin_notes}</p>
            </div>
        ` : ''}
    `;
    
    // Show modal
    const modal = new bootstrap.Modal(detailModal);
    modal.show();
}

// Show alert message
function showAdminAlert(type, message, autoClose = true) {
    const alertContainer = document.getElementById('adminAlertContainer');
    
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

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load rental requests if we're on the admin page
    const rentalRequestsContainer = document.getElementById('rentalRequestsContainer');
    if (rentalRequestsContainer) {
        loadAdminRentalRequests();
    }
    
    // Set up filter button
    const reloadRequestsBtn = document.getElementById('reloadRequestsBtn');
    if (reloadRequestsBtn) {
        reloadRequestsBtn.addEventListener('click', function() {
            const filters = {
                status: document.getElementById('filterStatusRequests').value
            };
            
            loadAdminRentalRequests(filters);
        });
    }
});