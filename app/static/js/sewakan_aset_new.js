// HTML escaping utility function
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

// Currency formatting utility function
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0';
    }
    return new Intl.NumberFormat('id-ID').format(amount);
}

// Date formatting utility function
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

// Simple notification function
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

// Sewakan Aset CRUD Functionality
class RentalAssetManager {
    constructor() {
        this.currentPage = 1;
        this.perPage = 10;
        this.currentFilter = {
            search: '',
            type: 'all',
            kecamatan: 'all',
            status: 'all',
            sort: 'newest'
        };
        this.init();
    }

    init() {
        this.bindEvents();
        // Don't auto-load assets on init - wait for user to navigate to section
        // this.loadAvailableAssets();
        this.loadStats();
        
        // Setup global modal cleanup
        this.setupGlobalModalCleanup();
        
        // Load assets only if sewakan_aset section is visible
        setTimeout(() => {
            const sewakanAsetSection = document.getElementById('sewakan_aset');
            if (sewakanAsetSection && this.isSectionVisible(sewakanAsetSection)) {
                console.log('Sewakan aset section is visible, loading assets...');
                this.loadAvailableAssets();
            }
        }, 500);
    }
    
    isSectionVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= window.innerHeight;
    }

    setupGlobalModalCleanup() {
        // Global cleanup for any modal backdrop issues
        document.addEventListener('click', (e) => {
            // If clicking on a modal backdrop, ensure cleanup
            if (e.target.classList.contains('modal-backdrop')) {
                setTimeout(() => {
                    this.cleanupModalBackdrop();
                }, 100);
            }
        });
        
        // Cleanup on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setTimeout(() => {
                    this.cleanupModalBackdrop();
                }, 100);
            }
        });
        
        // Cleanup orphaned backdrops on page interaction
        document.addEventListener('click', (e) => {
            // Check for orphaned backdrops (backdrops without visible modals)
            const backdrops = document.querySelectorAll('.modal-backdrop');
            const visibleModals = document.querySelectorAll('.modal.show');
            
            if (backdrops.length > visibleModals.length) {
                this.cleanupModalBackdrop();
            }
        });
    }

    bindEvents() {
        // Search functionality
        const searchInputs = document.querySelectorAll('#searchAvailableAssets, #searchRentedAssets');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.currentFilter.search = e.target.value;
                window.debounce(() => this.loadAvailableAssets(), 500)();
            });
        });

        // Filter controls
        const filterControls = document.querySelectorAll('#filterAssetType, #filterRentedAssetType');
        filterControls.forEach(select => {
            select.addEventListener('change', (e) => {
                this.currentFilter.type = e.target.value;
                this.loadAvailableAssets();
            });
        });

        // Sort controls
        const sortControls = document.querySelectorAll('#sortAssets, #sortRentedAssets');
        sortControls.forEach(select => {
            select.addEventListener('change', (e) => {
                this.currentFilter.sort = e.target.value;
                this.loadAvailableAssets();
            });
        });

        // Form submissions
        this.bindFormEvents();

        // Asset type change in add form
        const assetTypeSelect = document.getElementById('assetType');
        if (assetTypeSelect) {
            assetTypeSelect.addEventListener('change', this.toggleBuildingFields);
        }

        // Tab switching
        document.querySelectorAll('#rentalAssetTabs a[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const target = e.target.getAttribute('href');
                if (target === '#available-assets') {
                    this.loadAvailableAssets();
                } else if (target === '#rental-requests') {
                    this.loadRentalRequests();
                } else if (target === '#rented-assets') {
                    this.loadRentedAssets();
                }
            });
        });
    }

    bindFormEvents() {
        // Add asset form
        const addForm = document.getElementById('addRentalAssetForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAddAssetForm(e.target);
            });
        }

        // Edit asset form
        const editForm = document.getElementById('editAssetForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitEditAssetForm(e.target);
            });
        }
    }

    async loadAvailableAssets(page = 1) {
        console.log('loadAvailableAssets called with page:', page);
        
        // Check if the target element exists
        const targetElement = document.getElementById('availableAssetsList');
        if (!targetElement) {
            console.error('availableAssetsList element not found in DOM');
            return;
        }
        
        try {
            this.showLoading('#availableAssetsList');
            console.log('Loading assets from API...');
            
            const params = new URLSearchParams({
                page: page,
                per_page: this.perPage,
                search: this.currentFilter.search,
                type: this.currentFilter.type,
                kecamatan: this.currentFilter.kecamatan,
                status: 'available',
                sort: this.currentFilter.sort
            });

            const apiUrl = `/rental/api/assets/available?${params}`;
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API response data:', data);

            if (data.success) {
                console.log(`Successfully loaded ${data.assets.length} assets`);
                this.displayAvailableAssets(data.assets);
                this.updatePagination(data.pagination, 'available');
                this.updateAssetCount(data.pagination.total, 'available');
                console.log('Assets displayed successfully');
            } else {
                console.error('API returned error:', data.error);
                this.showError('#availableAssetsList', data.error);
            }
        } catch (error) {
            console.error('Error loading available assets:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                page: page,
                filters: this.currentFilter
            });
            this.showError('#availableAssetsList', `Failed to load available assets: ${error.message}`);
        }
    }

    async loadRentedAssets(page = 1) {
        try {
            this.showLoading('#rentedAssetsList');
            
            const params = new URLSearchParams({
                page: page,
                per_page: this.perPage,
                search: this.currentFilter.search,
                type: this.currentFilter.type,
                sort: this.currentFilter.sort
            });

            const response = await fetch(`/rental/api/assets/rented?${params}`);
            const data = await response.json();

            if (data.success) {
                this.displayRentedAssets(data.assets);
                this.updatePagination(data.pagination, 'rented');
            } else {
                this.showError('#rentedAssetsList', data.error);
            }
        } catch (error) {
            console.error('Error loading rented assets:', error);
            this.showError('#rentedAssetsList', 'Failed to load rented assets');
        }
    }

    async loadRentalRequests(page = 1) {
        try {
            this.showLoading('#rentalRequestsList');
            
            const statusFilter = document.getElementById('filterRequestStatus')?.value || 'all';
            const sortBy = document.getElementById('sortRequests')?.value || 'newest';
            const search = document.getElementById('searchRentalRequests')?.value || '';

            const params = new URLSearchParams({
                page: page,
                per_page: this.perPage,
                status: statusFilter,
                sort: sortBy,
                search: search
            });

            const response = await fetch(`/api/admin/rental-requests?${params}`);
            const data = await response.json();

            if (data.success) {
                this.displayRentalRequests(data.data);
                this.updateRequestCounts(data.data);
                this.updatePagination(data.pagination || {}, 'requests');
            } else {
                this.showError('#rentalRequestsList', data.error);
            }
        } catch (error) {
            console.error('Error loading rental requests:', error);
            this.showError('#rentalRequestsList', 'Failed to load rental requests');
        }
    }

    displayAvailableAssets(assets) {
        const tbody = document.getElementById('availableAssetsList');
        if (!tbody) return;

        if (assets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Tidak ada aset tersedia</td></tr>';
            return;
        }

        tbody.innerHTML = assets.map(asset => `
            <tr>
                <td>${this.escapeHtml(asset.name)}</td>
                <td>
                    <span class="badge ${asset.asset_type === 'tanah' ? 'bg-success' : 'bg-danger'}">
                        ${asset.asset_type_display || (asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan + Tanah')}
                    </span>
                </td>
                <td>${this.escapeHtml(asset.kecamatan)}, Surabaya</td>
                <td>
                    ${asset.luas_tanah} m²
                    ${asset.luas_bangunan ? `<br><small class="text-muted">Bangunan: ${asset.luas_bangunan} m²</small>` : ''}
                </td>
                <td>Rp ${this.formatCurrency(asset.harga_sewa)}</td>
                <td><span class="badge bg-warning">Tersedia</span></td>
                <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-info btn-sm" 
                                    onclick="window.directAssetActions.viewAssetDetail(${asset.id}); return false;" 
                                    data-bs-toggle="tooltip" title="Lihat Detail">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-warning btn-sm" 
                                    onclick="window.directAssetActions.editAsset(${asset.id}); return false;" 
                                    data-bs-toggle="tooltip" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" 
                                    onclick="window.directAssetActions.deleteAsset(${asset.id}, '${this.escapeHtml(asset.name)}'); return false;" 
                                    data-bs-toggle="tooltip" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
            </tr>
        `).join('');
    }

    displayRentedAssets(assets) {
        const tbody = document.getElementById('rentedAssetsList');
        if (!tbody) return;

        if (assets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Belum ada aset yang disewakan</td></tr>';
            return;
        }

        tbody.innerHTML = assets.map(asset => {
            const rental = asset.rental_info;
            return `
                <tr>
                    <td>${this.escapeHtml(asset.name)}</td>
                    <td>
                        <span class="badge ${asset.asset_type === 'tanah' ? 'bg-success' : 'bg-danger'}">
                            ${asset.asset_type_display || (asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan + Tanah')}
                        </span>
                    </td>
                    <td>
                        ${this.escapeHtml(rental.user_name)}<br>
                        <small class="text-muted">${this.escapeHtml(rental.user_email)}</small>
                    </td>
                    <td>${this.formatDate(rental.start_date)}</td>
                    <td>${this.formatDate(rental.end_date)}</td>
                    <td><span class="badge bg-success">Aktif</span></td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-info" onclick="rentalAssetManager.viewRentalDetail(${asset.id})" data-bs-toggle="tooltip" title="Lihat Detail">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-warning" onclick="rentalAssetManager.endRental(${rental.id})" data-bs-toggle="tooltip" title="Akhiri Sewa">
                                <i class="fas fa-stop-circle"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    displayRentalRequests(requests) {
        const tbody = document.getElementById('rentalRequestsList');
        if (!tbody) return;

        if (requests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4">Tidak ada permintaan sewa</td></tr>';
            return;
        }

        tbody.innerHTML = requests.map(request => {
            const statusBadge = this.getStatusBadge(request.status);
            const actionButtons = this.getActionButtons(request);
            
            return `
                <tr id="request-${request.id}" data-request-id="${request.id}">
                    <td><strong>#REQ-${String(request.id).padStart(3, '0')}</strong></td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-sm bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                                <i class="fas fa-user"></i>
                            </div>
                            <div>
                                <strong>${this.escapeHtml(request.user_name)}</strong><br>
                                <small class="text-muted">${this.escapeHtml(request.user_email)}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <strong>${this.escapeHtml(request.asset_name || 'Asset tidak ditemukan')}</strong><br>
                        <small class="text-muted">ID: ${request.asset_id}</small>
                    </td>
                    <td>
                        <span class="badge ${request.asset_type === 'tanah' ? 'bg-success' : 'bg-danger'}">
                            ${request.asset_type_display || (request.asset_type === 'tanah' ? 'Tanah' : 'Bangunan + Tanah')}
                        </span>
                    </td>
                    <td>${request.total_months} bulan</td>
                    <td>${this.formatDate(request.start_date)}</td>
                    <td>
                        <strong>Rp ${new Intl.NumberFormat('id-ID').format(request.total_price)}</strong><br>
                        <small class="text-muted">Rp ${new Intl.NumberFormat('id-ID').format(request.monthly_price)}/bulan</small>
                    </td>
                    <td>${statusBadge}</td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        }).join('');
    }

    getStatusBadge(status) {
        switch (status) {
            case 'pending':
                return '<span class="badge bg-warning text-dark">Menunggu</span>';
            case 'approved':
            case 'active':
                return '<span class="badge bg-success">Disetujui</span>';
            case 'rejected':
                return '<span class="badge bg-danger">Ditolak</span>';
            default:
                return '<span class="badge bg-secondary">Unknown</span>';
        }
    }

    getActionButtons(request) {
        if (request.status === 'pending') {
            return `
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-success" onclick="rentalAssetManager.approveRequest(${request.id})" data-bs-toggle="tooltip" title="Setujui">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="rentalAssetManager.rejectRequest(${request.id})" data-bs-toggle="tooltip" title="Tolak">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="rentalAssetManager.viewRequestDetail(${request.id})" data-bs-toggle="tooltip" title="Detail">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
        } else {
            return `
                <button class="btn btn-sm btn-info" onclick="rentalAssetManager.viewRequestDetail(${request.id})" data-bs-toggle="tooltip" title="Detail">
                    <i class="fas fa-eye"></i>
                </button>
            `;
        }
    }

    updateRequestCounts(requests) {
        const pending = requests.filter(r => r.status === 'pending').length;
        const approved = requests.filter(r => r.status === 'approved' || r.status === 'active').length;
        const rejected = requests.filter(r => r.status === 'rejected').length;
        const total = requests.length;

        document.getElementById('pendingRequestsCount').textContent = pending;
        document.getElementById('approvedRequestsCount').textContent = approved;
        document.getElementById('rejectedRequestsCount').textContent = rejected;
        document.getElementById('totalRequestsCount').textContent = total;
        
        // Also update card element if exists
        const totalRequestsCard = document.getElementById('totalRequestsCountCard');
        if (totalRequestsCard) {
            totalRequestsCard.textContent = total;
        }
        
        // Update badge on tab
        const badge = document.getElementById('pendingRequestsBadge');
        if (badge) {
            badge.textContent = pending;
            badge.style.display = pending > 0 ? 'inline' : 'none';
        }
    }

    async viewAssetDetail(assetId) {
        try {
            console.log('Viewing asset detail for ID:', assetId);
            
            const response = await fetch(`/rental/api/assets/${assetId}`);
            const data = await response.json();

            if (data.success) {
                // Fix: API returns data under 'data' property, not 'asset'
                this.showAssetDetailModal(data.data);
            } else {
                console.error('API Error:', data.error);
                this.showAlert('Error', data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading asset detail:', error);
            this.showAlert('Error', 'Failed to load asset details', 'error');
        }
    }

    showAssetDetailModal(asset) {
        console.log('Showing asset detail modal for:', asset);
        
        const modalElement = document.getElementById('assetDetailModal');
        const modalContent = document.getElementById('assetDetailContent');
        
        if (!modalElement) {
            console.error('Modal element assetDetailModal not found');
            alert('Error: Modal element not found');
            return;
        }
        
        if (!modalContent) {
            console.error('Modal content element assetDetailContent not found');
            alert('Error: Modal content element not found');
            return;
        }

        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-primary mb-3"><i class="fas fa-home me-2"></i>Informasi Aset</h6>
                    <table class="table table-sm table-borderless">
                        <tbody>
                            <tr><td class="fw-semibold">Nama Aset:</td><td>${this.escapeHtml(asset.name)}</td></tr>
                            <tr><td class="fw-semibold">Jenis:</td><td>
                                <span class="badge ${asset.asset_type === 'tanah' ? 'bg-success' : 'bg-danger'}">
                                    ${asset.asset_type_display || (asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan + Tanah')}
                                </span>
                            </td></tr>
                            <tr><td class="fw-semibold">Lokasi:</td><td>${this.escapeHtml(asset.kecamatan)}, Surabaya</td></tr>
                            <tr><td class="fw-semibold">Alamat:</td><td>${this.escapeHtml(asset.alamat)}</td></tr>
                            <tr><td class="fw-semibold">Luas Tanah:</td><td>${asset.luas_tanah} m²</td></tr>
                            ${asset.luas_bangunan ? `<tr><td class="fw-semibold">Luas Bangunan:</td><td>${asset.luas_bangunan} m²</td></tr>` : ''}
                            ${asset.kamar_tidur ? `<tr><td class="fw-semibold">Kamar Tidur:</td><td>${asset.kamar_tidur}</td></tr>` : ''}
                            ${asset.kamar_mandi ? `<tr><td class="fw-semibold">Kamar Mandi:</td><td>${asset.kamar_mandi}</td></tr>` : ''}
                            ${asset.jumlah_lantai ? `<tr><td class="fw-semibold">Jumlah Lantai:</td><td>${asset.jumlah_lantai}</td></tr>` : ''}
                            <tr><td class="fw-semibold">Sertifikat:</td><td>${this.escapeHtml(asset.sertifikat)}</td></tr>
                            <tr><td class="fw-semibold">Zona:</td><td>${this.escapeHtml(asset.jenis_zona)}</td></tr>
                            <tr><td class="fw-semibold">Harga Sewa:</td><td>Rp ${this.formatCurrency(asset.harga_sewa)}/bulan</td></tr>
                            <tr><td class="fw-semibold">Status:</td><td>
                                <span class="badge bg-warning">Tersedia</span>
                            </td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            ${asset.deskripsi ? `
                <div class="row mt-3">
                    <div class="col-12">
                        <h6 class="text-primary mb-3"><i class="fas fa-info-circle me-2"></i>Deskripsi</h6>
                        <p>${this.escapeHtml(asset.deskripsi)}</p>
                    </div>
                </div>
            ` : ''}
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Aset ini sedang tidak disewakan.
            </div>
        `;

        try {
            // Check if Bootstrap is available
            if (typeof bootstrap === 'undefined') {
                console.error('Bootstrap is not loaded, using fallback');
                // Fallback: show modal manually without backdrop
                modalElement.style.display = 'block';
                modalElement.classList.add('show');
                modalElement.setAttribute('aria-modal', 'true');
                modalElement.setAttribute('role', 'dialog');
                
                // Add close functionality without backdrop
                const closeButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
                closeButtons.forEach(btn => {
                    btn.onclick = () => {
                        modalElement.style.display = 'none';
                        modalElement.classList.remove('show');
                    };
                });
                
                return;
            }
            
            const modal = new bootstrap.Modal(modalElement);
            console.log('Modal instance created, showing...');
            modal.show();
            
            // Store asset ID for edit button
            const editBtn = document.getElementById('editAssetBtn');
            if (editBtn) {
                editBtn.onclick = () => {
                    console.log('Edit button clicked');
                    modal.hide();
                    this.editAsset(asset.id);
                };
            }
        } catch (error) {
            console.error('Error showing modal:', error);
            alert('Error showing modal: ' + error.message);
        }
    }

    async editAsset(assetId) {
        try {
            console.log('Editing asset with ID:', assetId);
            
            const response = await fetch(`/rental/api/assets/${assetId}`);
            const data = await response.json();

            if (data.success) {
                // Fix: API returns data under 'data' property, not 'asset'
                this.showEditAssetModal(data.data);
            } else {
                console.error('API Error:', data.error);
                this.showAlert('Error', data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading asset for edit:', error);
            this.showAlert('Error', 'Failed to load asset for editing', 'error');
        }
    }

    showEditAssetModal(asset) {
        const form = document.getElementById('editAssetForm');
        if (!form) return;

        form.innerHTML = `
            <input type="hidden" id="editAssetId" value="${asset.id}">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Nama Aset</label>
                    <input type="text" class="form-control" name="name" value="${this.escapeHtml(asset.name)}" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Jenis Aset</label>
                    <select class="form-select" name="asset_type" required>
                        <option value="tanah" ${asset.asset_type === 'tanah' ? 'selected' : ''}>Tanah</option>
                        <option value="bangunan" ${asset.asset_type === 'bangunan' ? 'selected' : ''}>Bangunan + Tanah</option>
                    </select>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Kecamatan</label>
                    <input type="text" class="form-control" name="kecamatan" value="${this.escapeHtml(asset.kecamatan)}" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Alamat Detail</label>
                    <input type="text" class="form-control" name="alamat" value="${this.escapeHtml(asset.alamat)}" required>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Luas Tanah (m²)</label>
                    <input type="number" class="form-control" name="luas_tanah" value="${asset.luas_tanah}" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Luas Bangunan (m²)</label>
                    <input type="number" class="form-control" name="luas_bangunan" value="${asset.luas_bangunan || ''}">
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4">
                    <label class="form-label">Kamar Tidur</label>
                    <input type="number" class="form-control" name="kamar_tidur" value="${asset.kamar_tidur || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Kamar Mandi</label>
                    <input type="number" class="form-control" name="kamar_mandi" value="${asset.kamar_mandi || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Jumlah Lantai</label>
                    <input type="number" class="form-control" name="jumlah_lantai" value="${asset.jumlah_lantai || ''}">
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">NJOP per m² (Rp)</label>
                    <input type="number" class="form-control" name="njop_per_m2" value="${asset.njop_per_m2}" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Harga Sewa Bulanan (Rp)</label>
                    <input type="number" class="form-control" name="harga_sewa" value="${asset.harga_sewa}" required>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Jenis Sertifikat</label>
                    <select class="form-select" name="sertifikat" required>
                        <option value="SHM" ${asset.sertifikat === 'SHM' ? 'selected' : ''}>SHM - Sertifikat Hak Milik</option>
                        <option value="HGB" ${asset.sertifikat === 'HGB' ? 'selected' : ''}>HGB - Hak Guna Bangunan</option>
                        <option value="Lainnya" ${asset.sertifikat === 'Lainnya' ? 'selected' : ''}>Lainnya (PPJB,Girik,Adat,dll)</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Jenis Zona</label>
                    <select class="form-select" name="jenis_zona" required>
                        <option value="Perumahan" ${asset.jenis_zona === 'Perumahan' ? 'selected' : ''}>Perumahan</option>
                        <option value="Komersial" ${asset.jenis_zona === 'Komersial' ? 'selected' : ''}>Komersial</option>
                        <option value="Industri" ${asset.jenis_zona === 'Industri' ? 'selected' : ''}>Industri</option>
                    </select>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Status</label>
                    <select class="form-select" name="status" required>
                        <option value="available" ${asset.status === 'available' ? 'selected' : ''}>Tersedia</option>
                        <option value="maintenance" ${asset.status === 'maintenance' ? 'selected' : ''}>Dalam Pemeliharaan</option>
                        <option value="reserved" ${asset.status === 'reserved' ? 'selected' : ''}>Reserved</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Daya Listrik</label>
                    <input type="text" class="form-control" name="daya_listrik" value="${asset.daya_listrik || ''}">
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-12">
                    <label class="form-label">Deskripsi Aset</label>
                    <textarea class="form-control" name="deskripsi" rows="3">${asset.deskripsi || ''}</textarea>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('editAssetModal'));
        modal.show();
    }

    async submitEditAssetForm(form) {
        try {
            const assetId = document.getElementById('editAssetId').value;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch(`/rental/api/assets/${assetId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('Sukses', 'Aset berhasil diperbarui', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editAssetModal')).hide();
                this.loadAvailableAssets();
            } else {
                this.showAlert('Error', result.error, 'error');
            }
        } catch (error) {
            console.error('Error updating asset:', error);
            this.showAlert('Error', 'Failed to update asset', 'error');
        }
    }

    deleteAsset(assetId, assetName) {
        console.log('Deleting asset:', assetId, assetName);
        
        const deleteNameElement = document.getElementById('deleteAssetName');
        const deleteModalElement = document.getElementById('deleteAssetModal');
        
        if (!deleteNameElement) {
            console.error('deleteAssetName element not found');
            alert('Error: Delete confirmation element not found');
            return;
        }
        
        if (!deleteModalElement) {
            console.error('deleteAssetModal element not found');
            alert('Error: Delete modal not found');
            return;
        }
        
        // Update delete confirmation modal
        deleteNameElement.textContent = assetName;
        
        try {
            // Check if Bootstrap is available
            if (typeof bootstrap === 'undefined') {
                console.error('Bootstrap is not loaded');
                alert('Error: Bootstrap library not loaded');
                return;
            }
            
            const modal = new bootstrap.Modal(deleteModalElement);
            console.log('Delete modal instance created, showing...');
            modal.show();

            const confirmBtn = document.getElementById('confirmDeleteAsset');
            if (confirmBtn) {
                confirmBtn.onclick = async () => {
                    console.log('Confirm delete clicked for asset:', assetId);
                    try {
                        const response = await fetch(`/rental/api/assets/${assetId}`, {
                            method: 'DELETE'
                        });

                        const result = await response.json();

                        if (result.success) {
                            this.showAlert('Sukses', 'Aset berhasil dihapus', 'success');
                            modal.hide();
                            this.loadAvailableAssets();
                        } else {
                            console.error('Delete API Error:', result.error);
                            this.showAlert('Error', result.error, 'error');
                        }
                    } catch (error) {
                        console.error('Error deleting asset:', error);
                        this.showAlert('Error', 'Failed to delete asset', 'error');
                    }
                };
            } else {
                console.error('confirmDeleteAsset button not found');
            }
        } catch (error) {
            console.error('Error showing delete modal:', error);
            alert('Error showing delete modal: ' + error.message);
        }
    }

    async submitAddAssetForm(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Map HTML form names to API expected names
            const mappedData = {
                asset_name: data.asset_name,
                asset_type: data.asset_type,
                location: data.location,
                address: data.address,
                land_size: data.land_size,
                building_size: data.building_size,
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                floors: data.floors,
                njop_per_m2: data.njop_per_m2,
                rental_price: data.rental_price,
                certificate: data.certificate,
                zone_type: data.zone_type,
                description: data.description,
                status: data.status,
                daya_listrik: data.daya_listrik
            };

            console.log('Submitting asset data:', mappedData);

            const response = await fetch('/rental/api/assets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(mappedData),
                credentials: 'same-origin' // Send cookies for authentication
            });

            const result = await response.json();

            if (response.status === 401) {
                this.showAlert('Error', 'Anda tidak terautentikasi. Silakan login terlebih dahulu.', 'error');
                return;
            } else if (response.status === 403) {
                this.showAlert('Error', 'Anda tidak memiliki izin untuk menambahkan aset.', 'error');
                return;
            }
            
            if (result.success) {
                this.showAlert('Sukses', 'Aset berhasil ditambahkan', 'success');
                form.reset();
                this.toggleBuildingFields({ target: { value: '' } });
                
                // Switch to available assets tab
                document.getElementById('available-assets-tab').click();
                this.loadAvailableAssets();
            } else {
                this.showAlert('Error', result.error || 'Gagal menambahkan aset', 'error');
            }
        } catch (error) {
            console.error('Error adding asset:', error);
            this.showAlert('Error', 'Gagal menambahkan aset: ' + (error.message || 'Terjadi kesalahan saat mengirim data'), 'error');
        }
    }

    toggleBuildingFields(event) {
        const buildingFields = document.querySelectorAll('.building-field');
        if (event.target.value === 'bangunan') {
            buildingFields.forEach(field => field.style.display = 'block');
        } else {
            buildingFields.forEach(field => field.style.display = 'none');
        }
    }

    async viewRentalDetail(assetId) {
        try {
            console.log('Viewing rental detail for asset ID:', assetId);
            
            const response = await fetch(`/rental/api/rental-detail/${assetId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    this.showAlert('Error', `Aset dengan ID ${assetId} tidak ditemukan. Pastikan aset masih tersedia di database.`, 'error');
                    return;
                } else if (response.status === 403) {
                    this.showAlert('Error', 'Akses ditolak. Diperlukan autentikasi admin.', 'error');
                    return;
                }
            }
            
            const data = await response.json();

            if (data.success) {
                await this.showRentalDetailModal(data.data);
            } else {
                console.error('API Error:', data.error);
                this.showAlert('Error', data.error || 'Failed to load rental details', 'error');
            }
        } catch (error) {
            console.error('Error loading rental detail:', error);
            
            // Clean up any modal issues that might have occurred
            this.cleanupModalBackdrops();
            
            this.showAlert('Error', 'Failed to load rental details', 'error');
        }
    }

    async showRentalDetailModal(rental) {
        console.log('Showing rental detail modal for:', rental);
        
        // Validate rental data
        if (!rental || !rental.asset) {
            console.error('Invalid rental data provided');
            this.showAlert('Error', 'Invalid rental data', 'error');
            return;
        }
        
        let modalElement = document.getElementById('assetDetailModal'); // Use existing modal
        let modalContent = document.getElementById('assetDetailContent'); // Use existing content
        
        if (!modalElement) {
            console.error('Modal element assetDetailModal not found');
            this.showAlert('Error', 'Modal not available. Please refresh the page.', 'error');
            return;
        }
        
        if (!modalContent) {
            console.error('Modal content element assetDetailContent not found');
            this.showAlert('Error', 'Modal content element not found', 'error');
            return;
        }

        // Check if rental has actual rental information
        if (!rental.rental || !rental.rental.start_date) {
            // Asset without active rental
            modalContent.innerHTML = `
                <div class="row">
                    <div class="col-md-12">
                        <h6 class="text-primary mb-3"><i class="fas fa-home me-2"></i>Informasi Aset</h6>
                        <table class="table table-sm table-borderless">
                            <tbody>
                                <tr><td class="fw-semibold">Nama Aset:</td><td>${this.escapeHtml(rental.asset.name)}</td></tr>
                                <tr><td class="fw-semibold">Jenis:</td><td>
                                    <span class="badge ${rental.asset.asset_type === 'tanah' ? 'bg-success' : 'bg-danger'}">
                                        ${rental.asset.asset_type_display || (rental.asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan + Tanah')}
                                    </span>
                                </td></tr>
                                <tr><td class="fw-semibold">Lokasi:</td><td>${this.escapeHtml(rental.asset.kecamatan)}, Surabaya</td></tr>
                                <tr><td class="fw-semibold">Alamat:</td><td>${this.escapeHtml(rental.asset.alamat)}</td></tr>
                                <tr><td class="fw-semibold">Luas Tanah:</td><td>${rental.asset.luas_tanah} m²</td></tr>
                                ${rental.asset.luas_bangunan ? `<tr><td class="fw-semibold">Luas Bangunan:</td><td>${rental.asset.luas_bangunan} m²</td></tr>` : ''}
                                <tr><td class="fw-semibold">Status:</td><td>
                                    <span class="badge bg-warning">Tersedia</span>
                                </td></tr>
                            </tbody>
                        </table>
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Aset ini sedang tidak disewakan.
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Calculate rental duration and remaining time
            const startDate = new Date(rental.rental.start_date);
            const endDate = new Date(rental.rental.end_date);
            const today = new Date();
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            const progressPercent = Math.max(0, Math.min(100, ((totalDays - remainingDays) / totalDays) * 100));

            modalContent.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="text-primary mb-3"><i class="fas fa-home me-2"></i>Informasi Aset</h6>
                        <table class="table table-sm table-borderless">
                            <tbody>
                                <tr><td class="fw-semibold">Nama Aset:</td><td>${this.escapeHtml(rental.asset.name)}</td></tr>
                                <tr><td class="fw-semibold">Jenis:</td><td>
                                    <span class="badge ${rental.asset.asset_type === 'tanah' ? 'bg-success' : 'bg-danger'}">
                                        ${rental.asset.asset_type_display || (rental.asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan + Tanah')}
                                    </span>
                                </td></tr>
                                <tr><td class="fw-semibold">Lokasi:</td><td>${this.escapeHtml(rental.asset.kecamatan)}, Surabaya</td></tr>
                                <tr><td class="fw-semibold">Alamat:</td><td>${this.escapeHtml(rental.asset.alamat)}</td></tr>
                                <tr><td class="fw-semibold">Luas Tanah:</td><td>${rental.asset.luas_tanah} m²</td></tr>
                                ${rental.asset.luas_bangunan ? `<tr><td class="fw-semibold">Luas Bangunan:</td><td>${rental.asset.luas_bangunan} m²</td></tr>` : ''}
                                ${rental.asset.kamar_tidur ? `<tr><td class="fw-semibold">Kamar Tidur:</td><td>${rental.asset.kamar_tidur}</td></tr>` : ''}
                                ${rental.asset.kamar_mandi ? `<tr><td class="fw-semibold">Kamar Mandi:</td><td>${rental.asset.kamar_mandi}</td></tr>` : ''}
                                <tr><td class="fw-semibold">Status:</td><td>
                                    <span class="badge bg-success">Disewa</span>
                                </td></tr>
                            </tbody>
                        </table>
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            Aset ini sedang disewakan dan dalam status aktif.
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6 class="text-success mb-3"><i class="fas fa-user me-2"></i>Informasi Penyewa</h6>
                        <table class="table table-sm table-borderless">
                            <tbody>
                                <tr><td class="fw-semibold">Nama:</td><td>${this.escapeHtml(rental.rental.user_name)}</td></tr>
                                <tr><td class="fw-semibold">Email:</td><td>${this.escapeHtml(rental.rental.user_email)}</td></tr>
                                <tr><td class="fw-semibold">Telepon:</td><td>${this.escapeHtml(rental.rental.user_phone || 'Tidak tersedia')}</td></tr>
                                <tr><td class="fw-semibold">Status Sewa:</td><td>
                                    <span class="badge bg-success">Aktif</span>
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr>

                <div class="row">
                    <div class="col-md-6">
                        <h6 class="text-info mb-3"><i class="fas fa-calendar-days me-2"></i>Periode Sewa</h6>
                        <table class="table table-sm table-borderless">
                            <tbody>
                                <tr><td class="fw-semibold">Tanggal Mulai:</td><td>${this.formatDate(rental.rental.start_date)}</td></tr>
                                <tr><td class="fw-semibold">Tanggal Selesai:</td><td>${this.formatDate(rental.rental.end_date)}</td></tr>
                                <tr><td class="fw-semibold">Durasi:</td><td>${rental.rental.total_months || 1} bulan</td></tr>
                                <tr><td class="fw-semibold">Sisa Waktu:</td><td>
                                    ${remainingDays > 0 ? 
                                        `<span class="text-success">${remainingDays} hari</span>` : 
                                        `<span class="text-danger">Sudah berakhir</span>`
                                    }
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6 class="text-warning mb-3"><i class="fas fa-money-bill-wave me-2"></i>Informasi Finansial</h6>
                        <table class="table table-sm table-borderless">
                            <tbody>
                                <tr><td class="fw-semibold">Harga per Bulan:</td><td class="text-success fw-bold">Rp ${this.formatCurrency(rental.rental.monthly_price)}</td></tr>
                                <tr><td class="fw-semibold">Total Dibayar:</td><td class="text-primary fw-bold">Rp ${this.formatCurrency(rental.rental.total_price)}</td></tr>
                                <tr><td class="fw-semibold">Status Pembayaran:</td><td>
                                    <span class="badge bg-success">Lunas</span>
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="mt-4">
                    <h6 class="mb-2">Progress Masa Sewa</h6>
                    <div class="progress mb-2" style="height: 20px;">
                        <div class="progress-bar ${remainingDays > 30 ? 'bg-success' : remainingDays > 7 ? 'bg-warning' : 'bg-danger'}" 
                             role="progressbar" style="width: ${progressPercent}%">
                            ${progressPercent.toFixed(1)}%
                        </div>
                    </div>
                    <small class="text-muted">
                        ${remainingDays > 0 ? 
                            `Sewa masih berlangsung (${remainingDays} hari tersisa)` : 
                            'Masa sewa telah berakhir'
                        }
                    </small>
                </div>

                ${rental.rental.admin_notes ? `
                    <div class="mt-4">
                        <h6 class="text-secondary mb-2"><i class="fas fa-note-sticky me-2"></i>Catatan Admin</h6>
                        <div class="alert alert-light">
                            ${this.escapeHtml(rental.rental.admin_notes)}
                        </div>
                    </div>
                ` : ''}
            `;
        }
        
        try {
            // Simple modal display without backdrop
            console.log('Showing modal without backdrop...');
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: false,  // No backdrop at all
                keyboard: true,   // Allow ESC key
                focus: true       // Focus on modal
            });
            
            console.log('Rental detail modal instance created, showing...');
            modal.show();
            
        } catch (error) {
            console.error('Error showing rental detail modal:', error);
            
            // Emergency cleanup in case of error
            this.cleanupModalBackdrops();
            
            this.showAlert('Error', 'Error showing rental detail modal: ' + error.message, 'error');
        }
    }

    async endRental(rentalId) {
        try {
            console.log('Ending rental with ID:', rentalId);
            
            // Clean any existing backdrops first
            this.cleanupModalBackdrop();
            
            // Show confirmation dialog
            const confirmed = await this.showConfirmDialog(
                'Akhiri Penyewaan', 
                'Apakah Anda yakin ingin mengakhiri penyewaan ini? Tindakan ini tidak dapat dibatalkan.',
                'warning'
            );
            
            if (!confirmed) {
                // Clean backdrop after cancellation
                this.cleanupModalBackdrop();
                return;
            }

            const response = await fetch(`/rental/api/end-rental/${rentalId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('Sukses', 'Penyewaan berhasil diakhiri. Aset sekarang tersedia untuk disewakan kembali.', 'success');
                this.loadRentedAssets(); // Refresh rented assets list
                this.loadAvailableAssets(); // Refresh available assets list
                this.loadStats(); // Refresh statistics
            } else {
                console.error('End rental API Error:', result.error);
                this.showAlert('Error', result.error || 'Failed to end rental', 'error');
            }
            
            // Final cleanup
            this.cleanupModalBackdrop();
            
        } catch (error) {
            console.error('Error ending rental:', error);
            this.showAlert('Error', 'Failed to end rental: ' + error.message, 'error');
            // Cleanup on error too
            this.cleanupModalBackdrop();
        }
    }

    showConfirmDialog(title, message, type = 'warning') {
        return new Promise((resolve) => {
            // Create confirmation modal dynamically
            const modalHTML = `
                <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="confirmModalLabel">
                                    <i class="fas fa-exclamation-triangle text-${type} me-2"></i>${title}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                ${message}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancelBtn">Batal</button>
                                <button type="button" class="btn btn-${type === 'warning' ? 'warning' : 'danger'}" id="confirmBtn">
                                    <i class="fas fa-check me-2"></i>Ya, Lanjutkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remove existing confirm modal if any
            const existingModal = document.getElementById('confirmModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const modalElement = document.getElementById('confirmModal');
            const modal = new bootstrap.Modal(modalElement);
            
            const confirmBtn = document.getElementById('confirmBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            
            confirmBtn.addEventListener('click', () => {
                modal.hide();
                this.cleanupModalBackdrop();
                resolve(true);
            });
            
            cancelBtn.addEventListener('click', () => {
                modal.hide();
                this.cleanupModalBackdrop();
                resolve(false);
            });
            
            // Cleanup when modal is hidden
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
                this.cleanupModalBackdrop();
            });
            
            modal.show();
        });
    }

    cleanupModalBackdrop() {
        // Remove any existing modal backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.remove();
        });
        
        // Remove modal-open class from body
        document.body.classList.remove('modal-open');
        
        // Reset body style
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Additional cleanup for stubborn backdrops
        setTimeout(() => {
            const remainingBackdrops = document.querySelectorAll('.modal-backdrop');
            remainingBackdrops.forEach(backdrop => {
                backdrop.remove();
            });
            
            // Force reset body classes and styles
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 100);
    }

    async loadStats() {
        try {
            const response = await fetch('/rental/api/stats');
            const data = await response.json();

            if (data.success) {
                this.updateStatsDisplay(data.stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        // Update stats in dashboard if needed
        console.log('Rental stats:', stats);
    }

    updatePagination(pagination, type) {
        const paginationElement = type === 'available' ? 
            document.querySelector('#available-assets .pagination') :
            document.querySelector('#rented-assets .pagination');
        
        if (!paginationElement) return;

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${!pagination.has_prev ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="rentalAssetManager.loadPage(${pagination.page - 1}, '${type}')">Previous</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= pagination.pages; i++) {
            paginationHTML += `
                <li class="page-item ${i === pagination.page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="rentalAssetManager.loadPage(${i}, '${type}')">${i}</a>
                </li>
            `;
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${!pagination.has_next ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="rentalAssetManager.loadPage(${pagination.page + 1}, '${type}')">Next</a>
            </li>
        `;

        paginationElement.innerHTML = paginationHTML;
    }

    loadPage(page, type) {
        if (type === 'available') {
            this.loadAvailableAssets(page);
        } else if (type === 'rented') {
            this.loadRentedAssets(page);
        }
    }

    updateAssetCount(total, type) {
        if (type === 'available') {
            // Update for available assets tab
            const currentCountElement = document.getElementById('currentAssetCount');
            const totalCountElement = document.getElementById('totalAssetsAvailable');
            
            if (currentCountElement) {
                currentCountElement.textContent = total;
            }
            if (totalCountElement) {
                totalCountElement.textContent = total;
            }
        } else if (type === 'rented') {
            // Update for rented assets tab  
            const rentedCountElement = document.getElementById('rentedAssetCount');
            const totalRentedElement = document.getElementById('totalRentedAssetCount');
            
            if (rentedCountElement) {
                rentedCountElement.textContent = total;
            }
            if (totalRentedElement) {
                totalRentedElement.textContent = total;
            }
        }
    }

    showLoading(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = '<tr><td colspan="7" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
        }
    }

    showError(selector, message) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Error: ${message}</td></tr>`;
        }
    }

    showAlert(title, message, type = 'info') {
        // You can implement a toast notification or alert modal here
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 'alert-info';
        
        const alertHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <strong>${title}:</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Find a container to show the alert
        const container = document.querySelector('.content-section.active') || document.body;
        container.insertAdjacentHTML('afterbegin', alertHTML);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        return escapeHtml(text);
    }

    formatCurrency(amount) {
        return formatCurrency(amount);
    }

    formatDate(dateString) {
        return formatDate(dateString);
    }

    showNotification(message, type = 'info', autoClose = true) {
        return showNotification(message, type, autoClose);
    }
    
    // Debug helper function
    testModals() {
        console.log('Testing modals...');
        
        // Test detail modal
        try {
            const detailModal = document.getElementById('assetDetailModal');
            if (detailModal) {
                console.log('Detail modal element found');
                const modal = new bootstrap.Modal(detailModal);
                modal.show();
                setTimeout(() => modal.hide(), 2000);
            } else {
                console.error('Detail modal not found');
            }
        } catch (error) {
            console.error('Error testing detail modal:', error);
        }
    }

    // Rental Request Management Functions (View only)

    async viewRequestDetail(requestId) {
        try {
            const response = await fetch(`/api/admin/rental-requests/${requestId}`);
            const result = await response.json();

            if (result.success) {
                this.showRequestDetailModal(result.data);
            } else {
                this.showAlert('error', `Gagal memuat detail: ${result.error}`);
            }
        } catch (error) {
            console.error('Error loading request detail:', error);
            this.showAlert('error', 'Terjadi kesalahan saat memuat detail');
        }
    }

    showRequestDetailModal(request) {
        const modalHtml = `
            <div class="modal fade" id="requestDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detail Permintaan Sewa #REQ-${String(request.id).padStart(3, '0')}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Informasi Pemohon</h6>
                                    <table class="table table-sm">
                                        <tr><td><strong>Nama:</strong></td><td>${this.escapeHtml(request.user_name)}</td></tr>
                                        <tr><td><strong>Email:</strong></td><td>${this.escapeHtml(request.user_email)}</td></tr>
                                        <tr><td><strong>Telepon:</strong></td><td>${this.escapeHtml(request.user_phone || '-')}</td></tr>
                                        <tr><td><strong>User ID:</strong></td><td>${request.user_id}</td></tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <h6>Detail Sewa</h6>
                                    <table class="table table-sm">
                                        <tr><td><strong>Aset:</strong></td><td>${this.escapeHtml(request.asset_name || 'Asset tidak ditemukan')}</td></tr>
                                        <tr><td><strong>Durasi:</strong></td><td>${request.total_months} bulan</td></tr>
                                        <tr><td><strong>Tanggal Mulai:</strong></td><td>${this.formatDate(request.start_date)}</td></tr>
                                        <tr><td><strong>Tanggal Berakhir:</strong></td><td>${this.formatDate(request.end_date)}</td></tr>
                                        <tr><td><strong>Harga per Bulan:</strong></td><td>Rp ${new Intl.NumberFormat('id-ID').format(request.monthly_price)}</td></tr>
                                        <tr><td><strong>Total Biaya:</strong></td><td><strong>Rp ${new Intl.NumberFormat('id-ID').format(request.total_price)}</strong></td></tr>
                                        <tr><td><strong>Status:</strong></td><td>${this.getStatusBadge(request.status)}</td></tr>
                                    </table>
                                </div>
                            </div>
                            ${request.admin_notes ? `
                                <div class="mt-3">
                                    <h6>Catatan Admin</h6>
                                    <div class="alert alert-info">${this.escapeHtml(request.admin_notes)}</div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('requestDetailModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('requestDetailModal'));
        modal.show();
    }

    // Approve rental request
    async approveRequest(requestId) {
        if (!confirm('Apakah Anda yakin ingin menyetujui permintaan sewa ini?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/rental-requests/${requestId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notes: 'Permintaan disetujui oleh admin'
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('success', 'Permintaan sewa berhasil disetujui!');
                this.loadRentalRequests(); // Refresh the list
                this.updateNotificationCount();
            } else {
                this.showAlert('error', `Gagal menyetujui permintaan: ${result.error}`);
            }
        } catch (error) {
            console.error('Error approving request:', error);
            this.showAlert('error', 'Terjadi kesalahan saat menyetujui permintaan');
        }
    }

    // Reject rental request
    async rejectRequest(requestId) {
        const reason = prompt('Alasan penolakan (opsional):');
        if (reason === null) return; // User cancelled

        if (!confirm('Apakah Anda yakin ingin menolak permintaan sewa ini?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/rental-requests/${requestId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reason: reason || 'Tidak ada alasan spesifik'
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('success', 'Permintaan sewa berhasil ditolak!');
                this.loadRentalRequests(); // Refresh the list
                this.updateNotificationCount();
            } else {
                this.showAlert('error', `Gagal menolak permintaan: ${result.error}`);
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            this.showAlert('error', 'Terjadi kesalahan saat menolak permintaan');
        }
    }

    updateNotificationCount() {
        // This would typically update the notification bell count
        // Implementation depends on your notification system
        console.log('Updating notification count...');
    }

    showAlert(type, message) {
        // Simple alert implementation
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Find alert container or create one
        let alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'alertContainer';
            alertContainer.className = 'position-fixed top-0 end-0 p-3';
            alertContainer.style.zIndex = '9999';
            document.body.appendChild(alertContainer);
        }

        alertContainer.insertAdjacentHTML('beforeend', alertHtml);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alerts = alertContainer.querySelectorAll('.alert');
            if (alerts.length > 0) {
                alerts[0].remove();
            }
        }, 5000);
    }

    // Method to clean up modal state (simplified without backdrop)
    cleanupModalBackdrops() {
        console.log('Cleaning up modal state...');
        
        // Hide any visible modals
        const visibleModals = document.querySelectorAll('.modal.show');
        visibleModals.forEach(modal => {
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
            modal.removeAttribute('role');
        });
        
        console.log('Modal cleanup completed');
    }
}

// Utility function to clean up modal state (simplified without backdrop)
function cleanupModalBackdrops() {
    console.log('🧹 Global cleanup function: Cleaning up modal state...');
    
    // Hide any visible modals
    const visibleModals = document.querySelectorAll('.modal.show');
    visibleModals.forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        modal.removeAttribute('role');
    });
    
    console.log('✅ Global modal cleanup completed');
}

// Make cleanup function globally available
window.cleanupModalBackdrops = cleanupModalBackdrops;

// Add emergency cleanup on Escape key (double press)
let escapeKeyCount = 0;
let escapeTimeout;

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        escapeKeyCount++;
        
        // Clear previous timeout
        clearTimeout(escapeTimeout);
        
        // If Escape is pressed twice within 1 second, force cleanup
        if (escapeKeyCount >= 2) {
            console.log('Emergency cleanup triggered by double Escape');
            cleanupModalBackdrops();
            escapeKeyCount = 0;
        }
        
        // Reset counter after 1 second
        escapeTimeout = setTimeout(() => {
            escapeKeyCount = 0;
        }, 1000);
    }
});

// Initialize the rental asset manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing RentalAssetManager...');
    
    // Enhanced Modal Fix Integration - Prevents modal backdrop issues
    console.log('Setting up enhanced modal fix...');
    
    // Function to properly remove modal backdrops
    function cleanupModals() {
        // Remove any stuck backdrops
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.remove();
        });
        
        // Reset body classes
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
    
    // Patch Bootstrap modals to ensure proper cleanup
    if (typeof bootstrap !== 'undefined') {
        // Listen for when any modal is hidden
        document.addEventListener('hidden.bs.modal', function() {
            // Give a small delay to ensure Bootstrap has done its work
            setTimeout(cleanupModals, 100);
        });
    }
    
    // Add event listeners to all close buttons within modals
    document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(cleanupModals, 100);
        });
    });
    
    // Setup global modal controls
    window.modalControls = {
        show: function(modalId) {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) return false;
            
            try {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                return true;
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
                setTimeout(cleanupModals, 100);
                return true;
            } catch (error) {
                console.error(`Error hiding modal ${modalId}:`, error);
                return false;
            }
        },
        cleanup: cleanupModals
    };
    
    // Make cleanup function globally available
    window.cleanupModalBackdrops = cleanupModals;
    
    // Debug: Check if required elements exist
    const requiredElements = [
        'assetDetailModal',
        'assetDetailContent', 
        'editAssetModal',
        'editAssetForm',
        'deleteAssetModal',
        'deleteAssetName',
        'confirmDeleteAsset'
    ];
    
    console.log('Checking for required elements...');
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✓ ${id} found`);
        } else {
            console.error(`✗ ${id} NOT found`);
        }
    });
    
    // Check if Bootstrap is loaded
    if (typeof bootstrap !== 'undefined') {
        console.log('✓ Bootstrap is loaded');
    } else {
        console.error('✗ Bootstrap NOT loaded');
    }
    
    window.rentalAssetManager = new RentalAssetManager();
    console.log('RentalAssetManager initialized:', window.rentalAssetManager);
    
    // Auto-load available assets if the sewakan_aset section is visible or becomes visible
    setTimeout(() => {
        const sewakanAsetSection = document.getElementById('sewakan_aset');
        if (sewakanAsetSection) {
            console.log('Auto-loading available assets...');
            window.rentalAssetManager.loadAvailableAssets();
        }
        
        // Force load rented assets if the tab is visible (for testing)
        const rentedTab = document.getElementById('rented-assets');
        if (rentedTab && !rentedTab.classList.contains('fade')) {
            console.log('Force loading rented assets for debugging...');
            window.rentalAssetManager.loadRentedAssets();
        }
    }, 1000);
});

// Export for global access
window.RentalAssetManager = RentalAssetManager;

// Create global directAssetActions object to handle button clicks
window.directAssetActions = {
    viewAssetDetail: function(assetId) {
        if (window.rentalAssetManager) {
            window.rentalAssetManager.viewAssetDetail(assetId);
        } else {
            console.error('RentalAssetManager not initialized');
        }
    },
    
    editAsset: function(assetId) {
        if (window.rentalAssetManager) {
            window.rentalAssetManager.editAsset(assetId);
        } else {
            console.error('RentalAssetManager not initialized');
        }
    },
    
    deleteAsset: function(assetId, assetName) {
        if (window.rentalAssetManager) {
            window.rentalAssetManager.deleteAsset(assetId, assetName);
        } else {
            console.error('RentalAssetManager not initialized');
        }
    }
};
