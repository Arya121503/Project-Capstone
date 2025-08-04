// User Rental Applications Management
class UserRentalApplicationsManager {
    constructor() {
        this.currentPage = 1;
        this.perPage = 10;
        this.currentFilter = {
            status: '',
            search: ''
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadApplications();
    }
    
    bindEvents() {
        // Filter events
        document.getElementById('filterBtn').addEventListener('click', () => {
            this.applyFilters();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetFilters();
        });
        
        // Search input enter key
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyFilters();
            }
        });
        
        // Edit form submission
        document.getElementById('editApplicationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitEdit();
        });
        
        // Confirm cancel
        document.getElementById('confirmCancelBtn').addEventListener('click', () => {
            this.confirmCancel();
        });
    }
    
    applyFilters() {
        this.currentFilter.status = document.getElementById('statusFilter').value;
        this.currentFilter.search = document.getElementById('searchInput').value;
        this.currentPage = 1;
        this.loadApplications();
    }
    
    resetFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('searchInput').value = '';
        this.currentFilter = { status: '', search: '' };
        this.currentPage = 1;
        this.loadApplications();
    }
    
    async loadApplications() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                per_page: this.perPage
            });
            
            if (this.currentFilter.status) {
                params.append('status', this.currentFilter.status);
            }
            
            const response = await fetch(`/api/user/rental-applications?${params}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderApplications(data.data);
                this.renderPagination(data.pagination);
            } else {
                this.showError(data.error || 'Gagal memuat data');
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            this.showError('Terjadi kesalahan saat memuat data');
        }
    }
    
    renderApplications(applications) {
        const container = document.getElementById('applicationsContainer');
        
        if (applications.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-file-contract text-muted mb-3" style="font-size: 4rem;"></i>
                    <h4 class="text-muted">Belum Ada Pengajuan Sewa</h4>
                    <p class="text-muted mb-4">Anda belum memiliki pengajuan sewa. Mulai dengan mengajukan sewa aset yang tersedia.</p>
                    <button class="btn btn-primary" onclick="window.location.href='/user/rental-assets'">
                        <i class="fas fa-plus me-2"></i>Ajukan Sewa Sekarang
                    </button>
                </div>
            `;
            return;
        }
        
        const applicationsHtml = applications.map(app => {
            const statusClass = this.getStatusClass(app.status);
            const statusIcon = this.getStatusIcon(app.status);
            
            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="d-flex align-items-start">
                                    <div class="me-3">
                                        ${app.asset_details && app.asset_details.photos && app.asset_details.photos.length > 0 ? 
                                            `<img src="/static/uploads/rental_assets/${app.asset_details.photos[0]}" alt="Asset" class="rounded" style="width: 80px; height: 80px; object-fit: cover;">` :
                                            `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                                <i class="fas fa-home text-muted"></i>
                                            </div>`
                                        }
                                    </div>
                                    <div class="flex-grow-1">
                                        <h5 class="card-title mb-2">${app.asset_name || 'Aset Tidak Ditemukan'}</h5>
                                        <div class="mb-2">
                                            <span class="badge ${statusClass} me-2">
                                                <i class="${statusIcon} me-1"></i>${app.status_label}
                                            </span>
                                        </div>
                                        <div class="row text-muted small">
                                            <div class="col-sm-6">
                                                <i class="fas fa-calendar me-1"></i>
                                                Mulai: ${app.start_date ? new Date(app.start_date).toLocaleDateString('id-ID') : '-'}
                                            </div>
                                            <div class="col-sm-6">
                                                <i class="fas fa-clock me-1"></i>
                                                Durasi: ${app.total_months} bulan
                                            </div>
                                        </div>
                                        <div class="row text-muted small mt-1">
                                            <div class="col-sm-6">
                                                <i class="fas fa-money-bill me-1"></i>
                                                Total: Rp ${app.total_price ? app.total_price.toLocaleString('id-ID') : '0'}
                                            </div>
                                            <div class="col-sm-6">
                                                <i class="fas fa-clock me-1"></i>
                                                Diajukan: ${new Date(app.created_at).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>
                                        ${app.admin_notes ? `
                                            <div class="mt-2">
                                                <small class="text-info">
                                                    <i class="fas fa-sticky-note me-1"></i>
                                                    Catatan Admin: ${app.admin_notes}
                                                </small>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="d-flex flex-column gap-2">
                                    <button class="btn btn-outline-primary btn-sm" onclick="rentalAppsManager.viewDetail(${app.id})">
                                        <i class="fas fa-eye me-1"></i>Detail
                                    </button>
                                    
                                    ${app.can_edit ? `
                                        <button class="btn btn-outline-warning btn-sm" onclick="rentalAppsManager.editApplication(${app.id})">
                                            <i class="fas fa-edit me-1"></i>Edit
                                        </button>
                                    ` : ''}
                                    
                                    ${app.can_cancel ? `
                                        <button class="btn btn-outline-danger btn-sm" onclick="rentalAppsManager.cancelApplication(${app.id})">
                                            <i class="fas fa-times me-1"></i>Batalkan
                                        </button>
                                    ` : ''}
                                    
                                    ${app.can_view_transaction ? `
                                        <button class="btn btn-outline-success btn-sm" onclick="window.location.href='/user/rental-transactions/${app.transaction ? app.transaction.id : ''}'">
                                            <i class="fas fa-handshake me-1"></i>Transaksi
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = applicationsHtml;
    }
    
    renderPagination(pagination) {
        const container = document.getElementById('paginationContainer');
        
        if (pagination.pages <= 1) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        const paginationList = container.querySelector('.pagination');
        
        let paginationHtml = '';
        
        // Previous button
        paginationHtml += `
            <li class="page-item ${!pagination.has_prev ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="rentalAppsManager.goToPage(${pagination.page - 1})" ${!pagination.has_prev ? 'tabindex="-1"' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
        
        // Page numbers
        const startPage = Math.max(1, pagination.page - 2);
        const endPage = Math.min(pagination.pages, pagination.page + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === pagination.page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="rentalAppsManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHtml += `
            <li class="page-item ${!pagination.has_next ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="rentalAppsManager.goToPage(${pagination.page + 1})" ${!pagination.has_next ? 'tabindex="-1"' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
        
        paginationList.innerHTML = paginationHtml;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.loadApplications();
    }
    
    async viewDetail(applicationId) {
        try {
            const response = await fetch(`/api/user/rental-applications/${applicationId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showDetailModal(data.data);
            } else {
                this.showAlert('error', data.error || 'Gagal memuat detail');
            }
        } catch (error) {
            console.error('Error loading detail:', error);
            this.showAlert('error', 'Terjadi kesalahan saat memuat detail');
        }
    }
    
    showDetailModal(application) {
        const statusClass = this.getStatusClass(application.status);
        const statusIcon = this.getStatusIcon(application.status);
        
        const content = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Informasi Aset</h6>
                    <table class="table table-sm">
                        <tr><td>Nama Aset</td><td>${application.asset_name || '-'}</td></tr>
                        <tr><td>Tipe</td><td>${application.asset_details ? application.asset_details.asset_type : '-'}</td></tr>
                        <tr><td>Lokasi</td><td>${application.asset_details ? application.asset_details.kecamatan : '-'}</td></tr>
                        <tr><td>Alamat</td><td>${application.asset_details ? application.asset_details.alamat : '-'}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>Informasi Sewa</h6>
                    <table class="table table-sm">
                        <tr><td>Status</td><td><span class="badge ${statusClass}"><i class="${statusIcon} me-1"></i>${application.status_label}</span></td></tr>
                        <tr><td>Tanggal Mulai</td><td>${application.start_date ? new Date(application.start_date).toLocaleDateString('id-ID') : '-'}</td></tr>
                        <tr><td>Tanggal Berakhir</td><td>${application.end_date ? new Date(application.end_date).toLocaleDateString('id-ID') : '-'}</td></tr>
                        <tr><td>Durasi</td><td>${application.total_months} bulan</td></tr>
                        <tr><td>Harga per Bulan</td><td>Rp ${application.monthly_price ? application.monthly_price.toLocaleString('id-ID') : '0'}</td></tr>
                        <tr><td>Total Harga</td><td>Rp ${application.total_price ? application.total_price.toLocaleString('id-ID') : '0'}</td></tr>
                    </table>
                </div>
            </div>
            
            ${application.admin_notes ? `
                <div class="alert alert-info mt-3">
                    <h6><i class="fas fa-sticky-note me-2"></i>Catatan Admin</h6>
                    <p class="mb-0">${application.admin_notes}</p>
                </div>
            ` : ''}
            
            ${application.transaction ? `
                <div class="alert alert-success mt-3">
                    <h6><i class="fas fa-handshake me-2"></i>Informasi Transaksi</h6>
                    <p class="mb-1">Status Transaksi: <span class="badge bg-success">${application.transaction.status_label || application.transaction.status}</span></p>
                    <p class="mb-0">Sisa Waktu: ${application.transaction.days_remaining} hari</p>
                </div>
            ` : ''}
        `;
        
        document.getElementById('applicationDetailContent').innerHTML = content;
        new bootstrap.Modal(document.getElementById('applicationDetailModal')).show();
    }
    
    async editApplication(applicationId) {
        try {
            const response = await fetch(`/api/user/rental-applications/${applicationId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showEditModal(data.data);
            } else {
                this.showAlert('error', data.error || 'Gagal memuat data untuk edit');
            }
        } catch (error) {
            console.error('Error loading application for edit:', error);
            this.showAlert('error', 'Terjadi kesalahan saat memuat data');
        }
    }
    
    showEditModal(application) {
        document.getElementById('editStartDate').value = application.start_date;
        document.getElementById('editTotalMonths').value = application.total_months;
        document.getElementById('editUserPhone').value = application.user_phone;
        
        // Store application ID for submission
        document.getElementById('editApplicationForm').setAttribute('data-application-id', application.id);
        
        new bootstrap.Modal(document.getElementById('editApplicationModal')).show();
    }
    
    async submitEdit() {
        try {
            const form = document.getElementById('editApplicationForm');
            const applicationId = form.getAttribute('data-application-id');
            
            const data = {
                start_date: document.getElementById('editStartDate').value,
                total_months: parseInt(document.getElementById('editTotalMonths').value),
                user_phone: document.getElementById('editUserPhone').value
            };
            
            const response = await fetch(`/api/user/rental-applications/${applicationId}/edit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showAlert('success', 'Pengajuan berhasil diperbarui');
                bootstrap.Modal.getInstance(document.getElementById('editApplicationModal')).hide();
                this.loadApplications();
            } else {
                this.showAlert('error', result.error || 'Gagal memperbarui pengajuan');
            }
        } catch (error) {
            console.error('Error updating application:', error);
            this.showAlert('error', 'Terjadi kesalahan saat memperbarui pengajuan');
        }
    }
    
    cancelApplication(applicationId) {
        // Store application ID for confirmation
        document.getElementById('confirmCancelBtn').setAttribute('data-application-id', applicationId);
        new bootstrap.Modal(document.getElementById('confirmCancelModal')).show();
    }
    
    async confirmCancel() {
        try {
            const applicationId = document.getElementById('confirmCancelBtn').getAttribute('data-application-id');
            
            const response = await fetch(`/api/user/rental-applications/${applicationId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showAlert('success', 'Pengajuan berhasil dibatalkan');
                bootstrap.Modal.getInstance(document.getElementById('confirmCancelModal')).hide();
                this.loadApplications();
            } else {
                this.showAlert('error', result.error || 'Gagal membatalkan pengajuan');
            }
        } catch (error) {
            console.error('Error cancelling application:', error);
            this.showAlert('error', 'Terjadi kesalahan saat membatalkan pengajuan');
        }
    }
    
    getStatusClass(status) {
        const statusClasses = {
            'pending': 'bg-warning',
            'active': 'bg-success',
            'approved': 'bg-success',
            'rejected': 'bg-danger',
            'completed': 'bg-info',
            'cancelled': 'bg-secondary'
        };
        return statusClasses[status] || 'bg-secondary';
    }
    
    getStatusIcon(status) {
        const statusIcons = {
            'pending': 'fas fa-clock',
            'active': 'fas fa-check-circle',
            'approved': 'fas fa-check-circle',
            'rejected': 'fas fa-times-circle',
            'completed': 'fas fa-flag-checkered',
            'cancelled': 'fas fa-ban'
        };
        return statusIcons[status] || 'fas fa-question-circle';
    }
    
    showLoading() {
        document.getElementById('applicationsContainer').innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Memuat pengajuan sewa...</p>
            </div>
        `;
    }
    
    showError(message) {
        document.getElementById('applicationsContainer').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>${message}
            </div>
        `;
    }
    
    showAlert(type, message) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const alertIcon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
        
        const alert = document.createElement('div');
        alert.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `
            <i class="${alertIcon} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.rentalAppsManager = new UserRentalApplicationsManager();
});
