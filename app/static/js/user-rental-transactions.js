// User Rental Transactions Management
class UserRentalTransactionsManager {
    constructor() {
        this.currentPage = 1;
        this.perPage = 10;
        this.currentFilter = {
            status: '',
            search: ''
        };
        this.currentTransaction = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSummary();
        this.loadTransactions();
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
        
        // Extension form events
        document.getElementById('extensionMonths').addEventListener('change', () => {
            this.calculateExtensionCost();
        });
        
        document.getElementById('extensionRequestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitExtensionRequest();
        });
    }
    
    applyFilters() {
        this.currentFilter.status = document.getElementById('statusFilter').value;
        this.currentFilter.search = document.getElementById('searchInput').value;
        this.currentPage = 1;
        this.loadTransactions();
    }
    
    resetFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('searchInput').value = '';
        this.currentFilter = { status: '', search: '' };
        this.currentPage = 1;
        this.loadTransactions();
    }
    
    async loadSummary() {
        try {
            const response = await fetch('/api/user/rental-transactions/dashboard-summary');
            const data = await response.json();
            
            if (data.success) {
                this.renderSummary(data.summary);
            }
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    }
    
    renderSummary(summary) {
        const container = document.getElementById('summaryCards');
        
        const summaryHtml = `
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0 me-3">
                                <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                    <i class="fas fa-play"></i>
                                </div>
                            </div>
                            <div>
                                <h5 class="card-title mb-1">${summary.total_active}</h5>
                                <p class="card-text text-muted mb-0">Transaksi Aktif</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0 me-3">
                                <div class="bg-info text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                    <i class="fas fa-flag-checkered"></i>
                                </div>
                            </div>
                            <div>
                                <h5 class="card-title mb-1">${summary.total_completed}</h5>
                                <p class="card-text text-muted mb-0">Transaksi Selesai</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0 me-3">
                                <div class="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                            </div>
                            <div>
                                <h5 class="card-title mb-1">${summary.expiring_soon}</h5>
                                <p class="card-text text-muted mb-0">Akan Berakhir</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0 me-3">
                                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                    <i class="fas fa-money-bill"></i>
                                </div>
                            </div>
                            <div>
                                <h5 class="card-title mb-1">Rp ${summary.total_spent.toLocaleString('id-ID')}</h5>
                                <p class="card-text text-muted mb-0">Total Dibayar</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = summaryHtml;
    }
    
    async loadTransactions() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                per_page: this.perPage
            });
            
            if (this.currentFilter.status) {
                params.append('status', this.currentFilter.status);
            }
            
            const response = await fetch(`/api/user/rental-transactions?${params}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderTransactions(data.data);
                this.renderPagination(data.pagination);
            } else {
                this.showError(data.error || 'Gagal memuat data');
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.showError('Terjadi kesalahan saat memuat data');
        }
    }
    
    renderTransactions(transactions) {
        const container = document.getElementById('transactionsContainer');
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-handshake text-muted mb-3" style="font-size: 4rem;"></i>
                    <h4 class="text-muted">Belum Ada Transaksi Sewa</h4>
                    <p class="text-muted mb-4">Anda belum memiliki transaksi sewa aktif. Mulai dengan mengajukan sewa aset.</p>
                    <button class="btn btn-primary" onclick="window.location.href='/user/rental-applications'">
                        <i class="fas fa-plus me-2"></i>Lihat Pengajuan Sewa
                    </button>
                </div>
            `;
            return;
        }
        
        const transactionsHtml = transactions.map(transaction => {
            const statusClass = this.getStatusClass(transaction.status);
            const statusIcon = this.getStatusIcon(transaction.status);
            const paymentStatusClass = this.getPaymentStatusClass(transaction.payment_status);
            
            // Calculate progress percentage
            const progressPercentage = Math.min(100, (transaction.rental_duration?.progress_percentage || 0));
            
            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="d-flex align-items-start">
                                    <div class="me-3">
                                        <div class="bg-light rounded d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                            <i class="fas fa-home text-muted"></i>
                                        </div>
                                    </div>
                                    <div class="flex-grow-1">
                                        <h5 class="card-title mb-2">${transaction.asset_name || 'Aset Tidak Ditemukan'}</h5>
                                        
                                        <div class="mb-2">
                                            <span class="badge ${statusClass} me-2">
                                                <i class="${statusIcon} me-1"></i>${transaction.status_label}
                                            </span>
                                            <span class="badge ${paymentStatusClass}">
                                                <i class="fas fa-credit-card me-1"></i>${transaction.payment_status_label}
                                            </span>
                                        </div>
                                        
                                        <!-- Rental Progress -->
                                        <div class="mb-2">
                                            <div class="d-flex justify-content-between align-items-center mb-1">
                                                <small class="text-muted">Progress Sewa</small>
                                                <small class="text-muted">${Math.round(progressPercentage)}%</small>
                                            </div>
                                            <div class="progress" style="height: 8px;">
                                                <div class="progress-bar" role="progressbar" style="width: ${progressPercentage}%"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="row text-muted small">
                                            <div class="col-sm-6">
                                                <i class="fas fa-calendar me-1"></i>
                                                Mulai: ${transaction.start_date ? new Date(transaction.start_date).toLocaleDateString('id-ID') : '-'}
                                            </div>
                                            <div class="col-sm-6">
                                                <i class="fas fa-calendar-check me-1"></i>
                                                Berakhir: ${transaction.current_end_date ? new Date(transaction.current_end_date).toLocaleDateString('id-ID') : '-'}
                                            </div>
                                        </div>
                                        
                                        <div class="row text-muted small mt-1">
                                            <div class="col-sm-6">
                                                <i class="fas fa-clock me-1"></i>
                                                Sisa: ${transaction.days_remaining} hari
                                            </div>
                                            <div class="col-sm-6">
                                                <i class="fas fa-money-bill me-1"></i>
                                                Bulanan: Rp ${transaction.monthly_price ? transaction.monthly_price.toLocaleString('id-ID') : '0'}
                                            </div>
                                        </div>
                                        
                                        ${transaction.extension_count > 0 ? `
                                            <div class="mt-2">
                                                <small class="text-info">
                                                    <i class="fas fa-plus-circle me-1"></i>
                                                    Diperpanjang ${transaction.extension_count} kali
                                                </small>
                                            </div>
                                        ` : ''}
                                        
                                        ${transaction.warnings && transaction.warnings.length > 0 ? `
                                            <div class="mt-2">
                                                ${transaction.warnings.map(warning => `
                                                    <small class="text-warning d-block">
                                                        <i class="fas fa-exclamation-triangle me-1"></i>${warning}
                                                    </small>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="d-flex flex-column gap-2">
                                    <button class="btn btn-outline-primary btn-sm" onclick="transactionsManager.viewDetail(${transaction.id})">
                                        <i class="fas fa-eye me-1"></i>Detail
                                    </button>
                                    
                                    ${transaction.can_extend ? `
                                        <button class="btn btn-outline-success btn-sm" onclick="transactionsManager.requestExtension(${transaction.id})">
                                            <i class="fas fa-plus me-1"></i>Perpanjang
                                        </button>
                                    ` : ''}
                                    
                                    <button class="btn btn-outline-info btn-sm" onclick="window.location.href='/user/rental-applications/${transaction.rental_request_id}'">
                                        <i class="fas fa-file-contract me-1"></i>Pengajuan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = transactionsHtml;
    }
    
    async viewDetail(transactionId) {
        try {
            const response = await fetch(`/api/user/rental-transactions/${transactionId}`);
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
    
    showDetailModal(transaction) {
        const statusClass = this.getStatusClass(transaction.status);
        const statusIcon = this.getStatusIcon(transaction.status);
        const paymentStatusClass = this.getPaymentStatusClass(transaction.payment_status);
        
        const content = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Informasi Transaksi</h6>
                    <table class="table table-sm">
                        <tr><td>ID Transaksi</td><td>#${transaction.id}</td></tr>
                        <tr><td>Status</td><td><span class="badge ${statusClass}"><i class="${statusIcon} me-1"></i>${transaction.status_label}</span></td></tr>
                        <tr><td>Status Pembayaran</td><td><span class="badge ${paymentStatusClass}">${transaction.payment_status_label}</span></td></tr>
                        <tr><td>Tanggal Mulai</td><td>${transaction.start_date ? new Date(transaction.start_date).toLocaleDateString('id-ID') : '-'}</td></tr>
                        <tr><td>Tanggal Berakhir</td><td>${transaction.current_end_date ? new Date(transaction.current_end_date).toLocaleDateString('id-ID') : '-'}</td></tr>
                        <tr><td>Total Durasi</td><td>${transaction.total_months} bulan</td></tr>
                        <tr><td>Sisa Hari</td><td>${transaction.days_remaining} hari</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>Informasi Keuangan</h6>
                    <table class="table table-sm">
                        <tr><td>Harga per Bulan</td><td>Rp ${transaction.monthly_price ? transaction.monthly_price.toLocaleString('id-ID') : '0'}</td></tr>
                        <tr><td>Total yang Dibayar</td><td>Rp ${transaction.paid_amount ? transaction.paid_amount.toLocaleString('id-ID') : '0'}</td></tr>
                        <tr><td>Sisa Tagihan</td><td>Rp ${transaction.remaining_amount ? transaction.remaining_amount.toLocaleString('id-ID') : '0'}</td></tr>
                        <tr><td>Perpanjangan</td><td>${transaction.extension_count} kali</td></tr>
                    </table>
                </div>
            </div>
            
            ${transaction.rental_duration ? `
                <div class="mt-3">
                    <h6>Progress Sewa</h6>
                    <div class="progress mb-2" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${transaction.rental_duration.progress_percentage}%">
                            ${Math.round(transaction.rental_duration.progress_percentage)}%
                        </div>
                    </div>
                    <div class="row text-center">
                        <div class="col">
                            <small class="text-muted">Total Hari</small>
                            <div class="fw-bold">${transaction.rental_duration.total_days}</div>
                        </div>
                        <div class="col">
                            <small class="text-muted">Total Bulan</small>
                            <div class="fw-bold">${transaction.rental_duration.total_months}</div>
                        </div>
                        <div class="col">
                            <small class="text-muted">Sisa Hari</small>
                            <div class="fw-bold">${transaction.rental_duration.days_remaining}</div>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${transaction.extension_history && transaction.extension_history.length > 0 ? `
                <div class="mt-3">
                    <h6>Riwayat Perpanjangan</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Durasi</th>
                                    <th>Tanggal Berakhir Baru</th>
                                    <th>Catatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transaction.extension_history.map(ext => `
                                    <tr>
                                        <td>${new Date(ext.date).toLocaleDateString('id-ID')}</td>
                                        <td>${ext.additional_months} bulan</td>
                                        <td>${new Date(ext.new_end_date).toLocaleDateString('id-ID')}</td>
                                        <td>${ext.admin_notes || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        `;
        
        document.getElementById('transactionDetailContent').innerHTML = content;
        new bootstrap.Modal(document.getElementById('transactionDetailModal')).show();
    }
    
    requestExtension(transactionId) {
        this.currentTransaction = { id: transactionId };
        
        // Reset form
        document.getElementById('extensionRequestForm').reset();
        document.getElementById('extensionCostInfo').style.display = 'none';
        
        new bootstrap.Modal(document.getElementById('extensionRequestModal')).show();
    }
    
    async calculateExtensionCost() {
        const months = parseInt(document.getElementById('extensionMonths').value);
        if (!months || !this.currentTransaction) return;
        
        try {
            const response = await fetch(`/api/user/rental-transactions/${this.currentTransaction.id}`);
            const data = await response.json();
            
            if (data.success) {
                const transaction = data.data;
                const additionalCost = months * transaction.monthly_price;
                
                document.getElementById('extensionCostInfo').innerHTML = `
                    <strong>Biaya Perpanjangan:</strong><br>
                    ${months} bulan × Rp ${transaction.monthly_price.toLocaleString('id-ID')} = 
                    <strong>Rp ${additionalCost.toLocaleString('id-ID')}</strong>
                `;
                document.getElementById('extensionCostInfo').style.display = 'block';
            }
        } catch (error) {
            console.error('Error calculating extension cost:', error);
        }
    }
    
    async submitExtensionRequest() {
        try {
            const months = parseInt(document.getElementById('extensionMonths').value);
            const notes = document.getElementById('extensionNotes').value;
            
            const data = {
                additional_months: months,
                notes: notes
            };
            
            const response = await fetch(`/api/user/rental-transactions/${this.currentTransaction.id}/request-extension`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showAlert('success', 'Permintaan perpanjangan berhasil dikirim ke admin');
                bootstrap.Modal.getInstance(document.getElementById('extensionRequestModal')).hide();
                this.loadTransactions();
            } else {
                this.showAlert('error', result.error || 'Gagal mengirim permintaan perpanjangan');
            }
        } catch (error) {
            console.error('Error submitting extension request:', error);
            this.showAlert('error', 'Terjadi kesalahan saat mengirim permintaan');
        }
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
                <a class="page-link" href="#" onclick="transactionsManager.goToPage(${pagination.page - 1})" ${!pagination.has_prev ? 'tabindex="-1"' : ''}>
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
                    <a class="page-link" href="#" onclick="transactionsManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHtml += `
            <li class="page-item ${!pagination.has_next ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="transactionsManager.goToPage(${pagination.page + 1})" ${!pagination.has_next ? 'tabindex="-1"' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
        
        paginationList.innerHTML = paginationHtml;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.loadTransactions();
    }
    
    getStatusClass(status) {
        const statusClasses = {
            'active': 'bg-success',
            'extended': 'bg-info',
            'completed': 'bg-secondary',
            'terminated': 'bg-danger'
        };
        return statusClasses[status] || 'bg-secondary';
    }
    
    getStatusIcon(status) {
        const statusIcons = {
            'active': 'fas fa-play',
            'extended': 'fas fa-plus-circle',
            'completed': 'fas fa-flag-checkered',
            'terminated': 'fas fa-stop'
        };
        return statusIcons[status] || 'fas fa-question-circle';
    }
    
    getPaymentStatusClass(paymentStatus) {
        const statusClasses = {
            'unpaid': 'bg-warning',
            'partial': 'bg-info',
            'paid': 'bg-success',
            'failed': 'bg-danger'
        };
        return statusClasses[paymentStatus] || 'bg-secondary';
    }
    
    showLoading() {
        document.getElementById('transactionsContainer').innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Memuat transaksi sewa...</p>
            </div>
        `;
    }
    
    showError(message) {
        document.getElementById('transactionsContainer').innerHTML = `
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
    window.transactionsManager = new UserRentalTransactionsManager();
});
