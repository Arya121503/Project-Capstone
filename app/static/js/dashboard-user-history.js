/**
 * Dashboard User History
 * Handles user rental history display and interaction
 */

// Global variables
let rentalRequests = [];

// Load rental requests from API
async function loadRentalRequests(filters = {}) {
    try {
        console.log('Loading rental requests with filters:', filters);
        
        // Show loading state
        document.getElementById('pengajuanContainer').innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Memuat riwayat pengajuan...</p>
            </div>
        `;
        
        // Show loading state for timeline too
        document.getElementById('timelineContainer').innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Memuat timeline aktivitas...</p>
            </div>
        `;
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (filters.status) {
            console.log(`Adding status filter: ${filters.status}`);
            queryParams.append('status', filters.status);
        }
        if (filters.activityType) {
            console.log(`Adding activity_type filter: ${filters.activityType}`);
            queryParams.append('activity_type', filters.activityType);
        }
        if (filters.period) {
            console.log(`Adding period filter: ${filters.period}`);
            queryParams.append('period', filters.period);
        }
        
        // Fetch data from API
        const apiUrl = `/api/user-rental-requests?${queryParams.toString()}`;
        console.log(`Fetching data from: ${apiUrl}`);
        const response = await fetch(apiUrl);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load rental requests');
        }
        
        // Store rental requests
        rentalRequests = result.data;
        
        // Update UI
        updateRentalRequestsUI();
        updateTimelineUI();
        
        // Update stats
        document.getElementById('totalHistori').textContent = rentalRequests.length;
        
        return rentalRequests;
    } catch (error) {
        console.error('Error loading rental requests:', error);
        
        // Show error message
        document.getElementById('pengajuanContainer').innerHTML = `
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
function updateRentalRequestsUI() {
    console.log('Updating rental requests UI');
    const container = document.getElementById('pengajuanContainer');
    
    if (!container) {
        console.error('Pengajuan container not found');
        return;
    }
    
    // Get current filter values
    const activityTypeFilter = document.getElementById('filterJenisAktivitas').value;
    const statusFilter = document.getElementById('filterStatusHistori').value;
    const periodFilter = document.getElementById('filterPeriode').value;
    
    console.log('Current UI filters:', {
        activityType: activityTypeFilter,
        status: statusFilter,
        period: periodFilter
    });
    
    // Apply filters
    let filteredRequests = [...rentalRequests];
    console.log(`Total requests before filtering: ${filteredRequests.length}`);
    
    // Filter by activity type (for Pengajuan tab, we only show requests, not active rentals)
    filteredRequests = filteredRequests.filter(request => {
        return request.status === 'pending' || request.status === 'approved' || request.status === 'rejected';
    });
    console.log(`After filtering for pengajuan tab: ${filteredRequests.length}`);
    
    // Filter by status
    if (statusFilter) {
        // Map UI status values to API values
        const statusMap = {
            'pending': 'pending',
            'approved': 'approved',
            'rejected': 'rejected',
            'aktif': 'active',
            'berakhir': 'completed'
        };
        
        filteredRequests = filteredRequests.filter(request => {
            return request.status === statusMap[statusFilter];
        });
        console.log(`After status filtering: ${filteredRequests.length}`);
    }
    
    // Filter by period
    if (periodFilter) {
        const now = new Date();
        let dateThreshold = new Date();
        
        switch (periodFilter) {
            case '7hari':
                dateThreshold.setDate(now.getDate() - 7);
                break;
            case '1bulan':
                dateThreshold.setMonth(now.getMonth() - 1);
                break;
            case '3bulan':
                dateThreshold.setMonth(now.getMonth() - 3);
                break;
            case '6bulan':
                dateThreshold.setMonth(now.getMonth() - 6);
                break;
            case '1tahun':
                dateThreshold.setFullYear(now.getFullYear() - 1);
                break;
        }
        
        filteredRequests = filteredRequests.filter(request => {
            const requestDate = new Date(request.created_at);
            return requestDate >= dateThreshold;
        });
    }
    
    if (filteredRequests.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                <h5>Tidak ada pengajuan sewa yang sesuai dengan filter</h5>
                <p class="text-muted">Coba ubah filter untuk melihat pengajuan sewa lainnya</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Sort by created_at (newest first)
    const sortedRequests = [...filteredRequests].sort((a, b) => {
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
                <button class="btn btn-sm btn-outline-danger" onclick="cancelRentalRequest(${request.id})">
                    <i class="fas fa-times me-1"></i>Batalkan
                </button>
            `;
        } else if (request.status === 'approved') {
            actionButtons = `
                <button class="btn btn-sm btn-success me-2" onclick="processApprovedPayment(${request.id})">
                    <i class="fas fa-credit-card me-1"></i>Bayar Sekarang
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="viewRentalDetails(${request.id})">
                    <i class="fas fa-eye me-1"></i>Lihat Detail
                </button>
            `;
        } else if (request.status === 'active') {
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
}

// Update timeline UI
function updateTimelineUI() {
    console.log('Updating timeline UI');
    const container = document.getElementById('timelineContainer');
    
    if (!container) {
        console.error('Timeline container not found');
        return;
    }
    
    // Get current filter values
    const activityTypeFilter = document.getElementById('filterJenisAktivitas').value;
    const statusFilter = document.getElementById('filterStatusHistori').value;
    const periodFilter = document.getElementById('filterPeriode').value;
    
    console.log('Current timeline filters:', {
        activityType: activityTypeFilter,
        status: statusFilter,
        period: periodFilter
    });
    
    // Apply filters
    let filteredRequests = [...rentalRequests];
    console.log(`Total timeline items before filtering: ${filteredRequests.length}`);
    
    // Filter by activity type
    if (activityTypeFilter) {
        filteredRequests = filteredRequests.filter(request => {
            if (activityTypeFilter === 'pengajuan') {
                return request.status === 'pending' || request.status === 'approved' || request.status === 'rejected';
            } else if (activityTypeFilter === 'sewa') {
                return request.status === 'active' || request.status === 'completed';
            }
            return true;
        });
        console.log(`After activity type filtering: ${filteredRequests.length}`);
    }
    
    // Filter by status
    if (statusFilter) {
        // Map UI status values to API values
        const statusMap = {
            'pending': 'pending',
            'approved': 'approved',
            'rejected': 'rejected',
            'aktif': 'active',
            'berakhir': 'completed'
        };
        
        filteredRequests = filteredRequests.filter(request => {
            return request.status === statusMap[statusFilter];
        });
    }
    
    // Filter by period
    if (periodFilter) {
        const now = new Date();
        let dateThreshold = new Date();
        
        switch (periodFilter) {
            case '7hari':
                dateThreshold.setDate(now.getDate() - 7);
                break;
            case '1bulan':
                dateThreshold.setMonth(now.getMonth() - 1);
                break;
            case '3bulan':
                dateThreshold.setMonth(now.getMonth() - 3);
                break;
            case '6bulan':
                dateThreshold.setMonth(now.getMonth() - 6);
                break;
            case '1tahun':
                dateThreshold.setFullYear(now.getFullYear() - 1);
                break;
        }
        
        filteredRequests = filteredRequests.filter(request => {
            const requestDate = new Date(request.created_at);
            return requestDate >= dateThreshold;
        });
    }
    
    if (filteredRequests.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-history fa-3x text-muted mb-3"></i>
                <h5>Tidak ada aktivitas yang sesuai dengan filter</h5>
                <p class="text-muted">Coba ubah filter untuk melihat aktivitas lainnya</p>
            </div>
        `;
        return;
    }
    
    // Sort by created_at (newest first)
    const sortedRequests = [...filteredRequests].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    let html = '<div class="timeline">';
    
    sortedRequests.forEach(request => {
        // Format dates
        const createdDate = new Date(request.created_at);
        const updatedDate = request.updated_at ? new Date(request.updated_at) : null;
        
        const formattedCreatedDate = createdDate.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const formattedUpdatedDate = updatedDate ? updatedDate.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : '';
        
        // Determine icon and color based on status
        let iconClass = '';
        let colorClass = '';
        
        switch (request.status) {
            case 'pending':
                iconClass = 'fa-clock';
                colorClass = 'warning';
                break;
            case 'approved':
                iconClass = 'fa-check-circle';
                colorClass = 'success';
                break;
            case 'rejected':
                iconClass = 'fa-times-circle';
                colorClass = 'danger';
                break;
            case 'active':
                iconClass = 'fa-play-circle';
                colorClass = 'primary';
                break;
            case 'completed':
                iconClass = 'fa-check-double';
                colorClass = 'secondary';
                break;
            default:
                iconClass = 'fa-question-circle';
                colorClass = 'secondary';
        }
        
        // Create timeline item
        html += `
            <div class="timeline-item">
                <div class="timeline-icon bg-${colorClass}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-time">${formattedCreatedDate}</div>
                    <h6 class="timeline-title">
                        ${request.status === 'pending' ? 'Pengajuan Sewa Baru' : 
                          request.status === 'approved' ? 'Pengajuan Disetujui' :
                          request.status === 'rejected' ? 'Pengajuan Ditolak' :
                          request.status === 'active' ? 'Sewa Aktif' : 'Sewa Selesai'}
                    </h6>
                    <p>
                        ${request.asset_name || 'Aset tidak ditemukan'} - 
                        ${request.total_months} bulan - 
                        Rp ${new Intl.NumberFormat('id-ID').format(request.total_price)}
                    </p>
                    ${request.admin_notes ? `
                        <div class="alert alert-${request.status === 'rejected' ? 'danger' : 'info'} mb-0 mt-2">
                            <small class="d-block fw-bold">Catatan Admin:</small>
                            ${request.admin_notes}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add status update if available
        if (updatedDate && (request.status === 'approved' || request.status === 'rejected')) {
            html += `
                <div class="timeline-item">
                    <div class="timeline-icon bg-${request.status === 'approved' ? 'success' : 'danger'}">
                        <i class="fas fa-${request.status === 'approved' ? 'thumbs-up' : 'thumbs-down'}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-time">${formattedUpdatedDate}</div>
                        <h6 class="timeline-title">
                            Status Diperbarui: ${request.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                        </h6>
                        <p>
                            Pengajuan sewa untuk ${request.asset_name || 'Aset tidak ditemukan'} telah 
                            ${request.status === 'approved' ? 'disetujui oleh admin' : 'ditolak oleh admin'}
                        </p>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Cancel rental request
async function cancelRentalRequest(requestId) {
    if (!confirm('Apakah Anda yakin ingin membatalkan pengajuan sewa ini?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/cancel-rental-request/${requestId}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to cancel rental request');
        }
        
        // Show success message
        alert('Pengajuan sewa berhasil dibatalkan');
        
        // Reload rental requests
        loadRentalRequests();
    } catch (error) {
        console.error('Error canceling rental request:', error);
        alert(`Gagal membatalkan pengajuan sewa: ${error.message}`);
    }
}

// View rental details
function viewRentalDetails(requestId) {
    const request = rentalRequests.find(r => r.id === requestId);
    
    if (!request) {
        alert('Data pengajuan sewa tidak ditemukan');
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
    let detailModal = document.getElementById('rentalDetailModal');
    if (!detailModal) {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = `
            <div class="modal fade" id="rentalDetailModal" tabindex="-1" aria-labelledby="rentalDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="rentalDetailModalLabel">Detail Sewa</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="rentalDetailContent">
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
        detailModal = document.getElementById('rentalDetailModal');
    }
    
    // Populate modal content
    const modalContent = document.getElementById('rentalDetailContent');
    modalContent.innerHTML = `
        <div class="mb-3">
            <h5>${request.asset_name || 'Aset tidak ditemukan'}</h5>
            <span class="badge bg-${request.status === 'approved' ? 'success' : 'primary'} mb-2">
                ${request.status === 'approved' ? 'Disetujui' : 'Aktif'}
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
        
        ${request.admin_notes ? `
            <div class="mb-3">
                <small class="text-muted d-block">Catatan Admin</small>
                <p>${request.admin_notes}</p>
            </div>
        ` : ''}
        
        <div class="alert alert-warning">
            <i class="fas fa-info-circle me-1"></i>
            Untuk perpanjangan sewa atau perubahan lainnya, silakan hubungi admin.
        </div>
    `;
    
    // Show modal
    const modal = new bootstrap.Modal(detailModal);
    modal.show();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard user history: DOM content loaded');
    
    // Load rental requests
    loadRentalRequests();
    
    // Set up filter button
    const reloadHistoriBtn = document.getElementById('reloadHistoriBtn');
    if (reloadHistoriBtn) {
        console.log('Filter button found, attaching click event');
        reloadHistoriBtn.addEventListener('click', function() {
            console.log('Filter button clicked');
            
            // Get the filter values
            const activityTypeFilter = document.getElementById('filterJenisAktivitas').value;
            const statusFilter = document.getElementById('filterStatusHistori').value;
            const periodFilter = document.getElementById('filterPeriode').value;
            
            const filters = {
                status: statusFilter,
                activityType: activityTypeFilter,
                period: periodFilter
            };
            
            console.log('Applied filters:', filters);
            
            // Automatically switch to the appropriate tab based on activity type filter
            if (activityTypeFilter === 'pengajuan') {
                // Switch to Pengajuan Sewa tab
                console.log('Switching to Pengajuan Sewa tab');
                const pengajuanTab = document.getElementById('pengajuan-tab');
                if (pengajuanTab) {
                    const bsTab = new bootstrap.Tab(pengajuanTab);
                    bsTab.show();
                }
                
                // Apply filters for pengajuan
                loadRentalRequests(filters);
            } else if (activityTypeFilter === 'sewa') {
                // Switch to Transaksi Sewa tab
                console.log('Switching to Transaksi Sewa tab');
                const sewaTab = document.getElementById('sewa-tab');
                if (sewaTab) {
                    const bsTab = new bootstrap.Tab(sewaTab);
                    bsTab.show();
                }
                
                // Apply filters for sewa transactions
                if (typeof loadRentalTransactions === 'function') {
                    loadRentalTransactions(1); // Reset to page 1 when filtering
                }
            } else {
                // For "Semua Aktivitas" or empty filter, show the main timeline tab
                console.log('Switching to Semua Aktivitas tab');
                const semuaTab = document.getElementById('semua-tab');
                if (semuaTab) {
                    const bsTab = new bootstrap.Tab(semuaTab);
                    bsTab.show();
                }
                
                // Apply filters for all activities
                loadRentalRequests(filters);
            }
        });
    } else {
        console.warn('Filter button not found');
    }
    
    // Set up tab navigation
    const historiTabs = document.getElementById('historiTabs');
    if (historiTabs) {
        // We'll let Bootstrap handle the tab switching, no need to manually add event listeners
        // The tab switching is handled by Bootstrap's built-in tab functionality
        console.log('History tabs initialized for Bootstrap handling');
        
        // Add event listeners for Bootstrap tab events to respond to tab changes
        document.querySelectorAll('#historiTabs .nav-link').forEach(tab => {
            tab.addEventListener('shown.bs.tab', function(event) {
                console.log(`Tab changed to: ${event.target.getAttribute('data-bs-target')}`);
                // This ensures we update the UI when tabs are switched
                const targetId = event.target.getAttribute('data-bs-target').substring(1);
                
                // If we're switching to the sewa tab, make sure transactions are loaded
                if (targetId === 'sewa' && typeof loadRentalTransactions === 'function') {
                    loadRentalTransactions();
                }
                
                // Update the Jenis Aktivitas filter to match the selected tab
                const filterJenisAktivitas = document.getElementById('filterJenisAktivitas');
                if (filterJenisAktivitas) {
                    if (targetId === 'pengajuan') {
                        filterJenisAktivitas.value = 'pengajuan';
                        
                        // Reload pengajuan data with appropriate filters
                        const filters = {
                            status: document.getElementById('filterStatusHistori').value,
                            activityType: 'pengajuan',
                            period: document.getElementById('filterPeriode').value
                        };
                        loadRentalRequests(filters);
                    } else if (targetId === 'sewa') {
                        filterJenisAktivitas.value = 'sewa';
                    } else {
                        filterJenisAktivitas.value = '';
                        
                        // Reload all data for the timeline
                        const filters = {
                            status: document.getElementById('filterStatusHistori').value,
                            activityType: '',
                            period: document.getElementById('filterPeriode').value
                        };
                        loadRentalRequests(filters);
                    }
                }
            });
        });
    }
    
    // Add event listener for the activity type filter
    const filterJenisAktivitas = document.getElementById('filterJenisAktivitas');
    if (filterJenisAktivitas) {
        filterJenisAktivitas.addEventListener('change', function() {
            console.log('Activity type filter changed:', this.value);
            
            // Automatically switch to the appropriate tab
            if (this.value === 'pengajuan') {
                // Switch to Pengajuan Sewa tab
                const pengajuanTab = document.getElementById('pengajuan-tab');
                if (pengajuanTab) {
                    const bsTab = new bootstrap.Tab(pengajuanTab);
                    bsTab.show();
                }
            } else if (this.value === 'sewa') {
                // Switch to Transaksi Sewa tab
                const sewaTab = document.getElementById('sewa-tab');
                if (sewaTab) {
                    const bsTab = new bootstrap.Tab(sewaTab);
                    bsTab.show();
                }
            } else {
                // For empty value (Semua Aktivitas), show the main timeline tab
                const semuaTab = document.getElementById('semua-tab');
                if (semuaTab) {
                    const bsTab = new bootstrap.Tab(semuaTab);
                    bsTab.show();
                }
            }
        });
    }
    
    // Add event listeners for status and period filters
    const filterStatusHistori = document.getElementById('filterStatusHistori');
    const filterPeriode = document.getElementById('filterPeriode');
    
    if (filterStatusHistori) {
        filterStatusHistori.addEventListener('change', function() {
            console.log('Status filter changed:', this.value);
            
            // Get the current active tab
            const activeTab = document.querySelector('#historiTabs .nav-link.active');
            
            if (activeTab && (activeTab.id === 'semua-tab' || activeTab.id === 'pengajuan-tab')) {
                // For semua or pengajuan tabs, reload rental requests with the new filter
                const filters = {
                    status: this.value,
                    activityType: filterJenisAktivitas ? filterJenisAktivitas.value : '',
                    period: filterPeriode ? filterPeriode.value : ''
                };
                
                loadRentalRequests(filters);
            }
            // Note: sewa tab filtering is handled in dashboard-user-transactions.js
        });
    }
    
    if (filterPeriode) {
        filterPeriode.addEventListener('change', function() {
            console.log('Period filter changed:', this.value);
            
            // Get the current active tab
            const activeTab = document.querySelector('#historiTabs .nav-link.active');
            
            if (activeTab && (activeTab.id === 'semua-tab' || activeTab.id === 'pengajuan-tab')) {
                // For semua or pengajuan tabs, reload rental requests with the new filter
                const filters = {
                    status: filterStatusHistori ? filterStatusHistori.value : '',
                    activityType: filterJenisAktivitas ? filterJenisAktivitas.value : '',
                    period: this.value
                };
                
                loadRentalRequests(filters);
            }
            // Note: sewa tab filtering is handled in dashboard-user-transactions.js
        });
    }
});

// Function to process payment for approved rental requests
async function processApprovedPayment(requestId) {
    try {
        console.log('🚀 Processing payment for approved request:', requestId);
        
        // Find the request data
        const request = rentalRequests.find(r => r.id === requestId);
        if (!request) {
            alert('❌ Data pengajuan tidak ditemukan');
            return;
        }
        
        if (request.status !== 'approved') {
            alert('❌ Pengajuan ini belum disetujui admin');
            return;
        }
        
        // Show confirmation dialog
        const confirmMessage = `Konfirmasi Pembayaran\n\n` +
            `Aset: ${request.asset_name}\n` +
            `Durasi: ${request.total_months} bulan\n` +
            `Total: Rp ${new Intl.NumberFormat('id-ID').format(request.total_price)}\n\n` +
            `Lanjutkan pembayaran?`;
            
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Create asset object for payment function
        const assetForPayment = {
            id: request.asset_id,
            name: request.asset_name,
            asset_type: request.asset_type || 'bangunan',
            harga_sewa: request.monthly_price,
            location: request.location || 'Surabaya'
        };
        
        // Set rental data for payment processing
        window.rentalRequestForPayment = {
            requestId: requestId,
            duration: request.total_months,
            startDate: request.start_date,
            endDate: request.end_date,
            totalAmount: request.total_price
        };
        
        // Use the existing payment system
        if (typeof window.handlePayment === 'function') {
            console.log('💳 Using existing payment handler');
            window.handlePayment(assetForPayment);
        } else if (typeof window.MidtransPayment !== 'undefined') {
            console.log('💳 Using Midtrans payment directly');
            window.MidtransPayment.processPayment(assetForPayment);
        } else {
            alert('❌ Sistem pembayaran tidak tersedia. Silakan refresh halaman.');
        }
        
    } catch (error) {
        console.error('❌ Error processing payment:', error);
        alert('❌ Terjadi kesalahan: ' + error.message);
    }
}

// Function to cancel rental request
async function cancelRentalRequest(requestId) {
    try {
        if (!confirm('Apakah Anda yakin ingin membatalkan pengajuan ini?')) {
            return;
        }
        
        console.log('Cancelling rental request:', requestId);
        
        const response = await fetch(`/api/user-rental-requests/${requestId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Pengajuan berhasil dibatalkan');
            // Reload the rental requests
            loadRentalRequests();
        } else {
            alert('❌ Gagal membatalkan pengajuan: ' + (result.error || 'Unknown error'));
        }
        
    } catch (error) {
        console.error('Error cancelling rental request:', error);
        alert('❌ Terjadi kesalahan: ' + error.message);
    }
}

// Function to view rental details
function viewRentalDetails(requestId) {
    const request = rentalRequests.find(r => r.id === requestId);
    if (!request) {
        alert('❌ Data pengajuan tidak ditemukan');
        return;
    }
    
    // Create modal for rental details
    const modalHtml = `
        <div class="modal fade" id="rentalDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detail Pengajuan #${request.id}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <h6>Informasi Aset</h6>
                                <p><strong>Nama:</strong> ${request.asset_name}</p>
                                <p><strong>ID Aset:</strong> ${request.asset_id}</p>
                                <p><strong>Tipe:</strong> ${request.asset_type || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Informasi Sewa</h6>
                                <p><strong>Tanggal Mulai:</strong> ${new Date(request.start_date).toLocaleDateString('id-ID')}</p>
                                <p><strong>Tanggal Berakhir:</strong> ${new Date(request.end_date).toLocaleDateString('id-ID')}</p>
                                <p><strong>Durasi:</strong> ${request.total_months} bulan</p>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <h6>Biaya</h6>
                                <p><strong>Harga per Bulan:</strong> Rp ${new Intl.NumberFormat('id-ID').format(request.monthly_price)}</p>
                                <p><strong>Total Biaya:</strong> Rp ${new Intl.NumberFormat('id-ID').format(request.total_price)}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Status</h6>
                                <p><strong>Status:</strong> ${request.status}</p>
                                <p><strong>Diajukan:</strong> ${new Date(request.created_at).toLocaleDateString('id-ID')}</p>
                            </div>
                        </div>
                        ${request.admin_notes ? `
                            <div class="alert alert-info">
                                <h6>Catatan Admin:</h6>
                                <p class="mb-0">${request.admin_notes}</p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                        ${request.status === 'approved' ? `
                            <button type="button" class="btn btn-success" onclick="processApprovedPayment(${request.id}); bootstrap.Modal.getInstance(document.getElementById('rentalDetailsModal')).hide();">
                                <i class="fas fa-credit-card me-1"></i>Bayar Sekarang
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('rentalDetailsModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('rentalDetailsModal'));
    modal.show();
}