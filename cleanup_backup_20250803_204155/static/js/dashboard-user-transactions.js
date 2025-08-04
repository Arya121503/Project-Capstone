/**
 * User Rental Transactions Manager for Dashboard
 * Handles displaying transaction history and rental extensions
 */

// Constants
const TRANSACTION_ENDPOINT = '/api/user/rental-transactions';
const ITEMS_PER_PAGE = 5;

// Global variables
let currentTransactionPage = 1;
let transactionData = [];
let totalTransactions = 0;

// Initialize transactions when the sewa tab is shown
document.addEventListener('DOMContentLoaded', function() {
    console.log('Transactions module initialized');
    
    // Add event listener for tab show
    const sewaTab = document.getElementById('sewa-tab');
    if (sewaTab) {
        sewaTab.addEventListener('shown.bs.tab', function (e) {
            console.log('Sewa tab shown, loading transactions');
            
            // When switching to the sewa tab, update the activity type filter
            const filterJenisAktivitas = document.getElementById('filterJenisAktivitas');
            if (filterJenisAktivitas && filterJenisAktivitas.value !== 'sewa') {
                filterJenisAktivitas.value = 'sewa';
            }
            
            loadRentalTransactions();
        });
    } else {
        console.warn('Sewa tab element not found');
    }
    
    // Add event listener for status filter to immediately update transaction view
    const filterStatusHistori = document.getElementById('filterStatusHistori');
    if (filterStatusHistori) {
        filterStatusHistori.addEventListener('change', function() {
            console.log('Status filter changed:', this.value);
            
            // If we're on the transaction tab, reload with the new filter
            if (document.getElementById('sewa-tab').classList.contains('active')) {
                loadRentalTransactions(1); // Reset to page 1 when filtering
            }
        });
    }
    
    // Add event listener for period filter to immediately update transaction view
    const filterPeriode = document.getElementById('filterPeriode');
    if (filterPeriode) {
        filterPeriode.addEventListener('change', function() {
            console.log('Period filter changed:', this.value);
            
            // If we're on the transaction tab, reload with the new filter
            if (document.getElementById('sewa-tab').classList.contains('active')) {
                loadRentalTransactions(1); // Reset to page 1 when filtering
            }
        });
    }
});

/**
 * Load rental transactions from the API
 */
async function loadRentalTransactions(page = 1) {
    try {
        console.log("Loading rental transactions...");
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('transactionLoadingIndicator');
        const noTransactionsIndicator = document.getElementById('noTransactionsIndicator');
        const transactionsListContainer = document.getElementById('transactionsListContainer');
        
        if (loadingIndicator) loadingIndicator.classList.remove('d-none');
        if (noTransactionsIndicator) noTransactionsIndicator.classList.add('d-none');
        if (transactionsListContainer) transactionsListContainer.classList.add('d-none');
        
        // Get filters
        const statusFilter = document.getElementById('filterStatusHistori').value;
        const periodFilter = document.getElementById('filterPeriode').value;
        const activityTypeFilter = document.getElementById('filterJenisAktivitas').value;
        
        console.log('Applied transaction filters:', {
            status: statusFilter,
            period: periodFilter,
            activityType: activityTypeFilter
        });
        
        // Build query parameters
        const params = new URLSearchParams({
            page: page,
            per_page: ITEMS_PER_PAGE
        });
        
        // For transactions tab, we're only interested in 'sewa' type activities
        // but we'll still respect the status and period filters
        if (statusFilter) {
            // Map UI filter values to API values
            const statusMap = {
                'pending': 'pending',
                'approved': 'approved',
                'rejected': 'rejected',
                'aktif': 'active',
                'berakhir': 'completed'
            };
            params.append('status', statusMap[statusFilter] || statusFilter);
        }
        
        if (periodFilter) {
            params.append('period', periodFilter);
        }
        
        // Always set activity_type to 'sewa' for the transactions tab
        params.append('activity_type', 'sewa');
        
        // Fetch data from API
        console.log(`Fetching from endpoint: ${TRANSACTION_ENDPOINT}?${params.toString()}`);
        const response = await fetch(`${TRANSACTION_ENDPOINT}?${params.toString()}`);
        const result = await response.json();
        
        console.log("API response:", result);
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load transactions');
        }
        
        // Store transaction data
        transactionData = result.data;
        totalTransactions = result.pagination.total;
        currentTransactionPage = page;
        
        console.log(`Loaded ${transactionData.length} transactions, total: ${totalTransactions}`);
        
        // Display transactions
        displayTransactions(transactionData, result.pagination);
        
    } catch (error) {
        console.error('Error loading rental transactions:', error);
        showError('Gagal memuat data transaksi sewa');
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('transactionLoadingIndicator');
        if (loadingIndicator) loadingIndicator.classList.add('d-none');
        
        // Show error message
        const transactionsListContainer = document.getElementById('transactionsListContainer');
        if (transactionsListContainer) {
            transactionsListContainer.classList.remove('d-none');
            transactionsListContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Gagal memuat data transaksi sewa: ${error.message}
                </div>
            `;
        }
    }
}

/**
 * Display transactions in the UI
 */
function displayTransactions(transactions, pagination) {
    console.log("Displaying transactions...");
    
    // Get elements
    const loadingIndicator = document.getElementById('transactionLoadingIndicator');
    const noTransactionsIndicator = document.getElementById('noTransactionsIndicator');
    const transactionsListContainer = document.getElementById('transactionsListContainer');
    const transactionList = transactionsListContainer.querySelector('.transaction-list');
    const paginationContainer = document.getElementById('transactionPagination');
    
    // Hide loading indicator
    if (loadingIndicator) loadingIndicator.classList.add('d-none');
    
    // Check if we have transactions
    if (!transactions || transactions.length === 0) {
        console.log("No transactions found");
        if (noTransactionsIndicator) noTransactionsIndicator.classList.remove('d-none');
        if (transactionsListContainer) transactionsListContainer.classList.add('d-none');
        if (paginationContainer) paginationContainer.classList.add('d-none');
        return;
    }
    
    console.log(`Displaying ${transactions.length} transactions`);
    
    // Show transactions container
    if (transactionsListContainer) transactionsListContainer.classList.remove('d-none');
    if (noTransactionsIndicator) noTransactionsIndicator.classList.add('d-none');
    
    // Build transactions HTML
    let transactionsHTML = '';
    
    transactions.forEach(transaction => {
        console.log(`Processing transaction ${transaction.id}: ${transaction.asset_name}, status: ${transaction.status}`);
        
        // Format dates
        const startDate = new Date(transaction.start_date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const endDate = new Date(transaction.current_end_date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Format price
        const formattedPrice = new Intl.NumberFormat('id-ID').format(transaction.monthly_price);
        
        // Get status badge class
        const statusClass = getStatusBadgeClass(transaction.status);
        
        // Check if can extend
        const canExtend = transaction.can_extend;
        
        // Calculate progress percentage
        const totalDays = transaction.total_months * 30;
        const today = new Date();
        const startDateObj = new Date(transaction.start_date);
        const daysPassed = Math.floor((today - startDateObj) / (1000 * 60 * 60 * 24));
        const progressPercentage = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
        
        // Add transaction card
        transactionsHTML += `
            <div class="card mb-3 transaction-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${transaction.asset_name || 'Aset Sewa'}</h6>
                    <span class="badge ${statusClass}">${transaction.status_label}</span>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <small class="text-muted d-block">Periode Sewa</small>
                            <p class="mb-0">${startDate} - ${endDate}</p>
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted d-block">Biaya Bulanan</small>
                            <p class="mb-0">Rp ${formattedPrice}</p>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <small class="text-muted d-block mb-1">Durasi Kontrak (${transaction.total_months} bulan)</small>
                        <div class="progress" style="height: 10px;">
                            <div class="progress-bar ${transaction.status === 'active' ? 'bg-success' : 'bg-info'}" 
                                 role="progressbar" 
                                 style="width: ${progressPercentage}%;" 
                                 aria-valuenow="${progressPercentage}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100"></div>
                        </div>
                        <div class="d-flex justify-content-between mt-1">
                            <small>${startDate}</small>
                            <small>${endDate}</small>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            ${transaction.days_remaining > 0 ? 
                                `<span class="badge bg-secondary">${transaction.days_remaining} hari tersisa</span>` : 
                                `<span class="badge bg-dark">Kontrak berakhir</span>`
                            }
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="showTransactionDetail(${transaction.id})">
                                <i class="fas fa-eye me-1"></i>Detail
                            </button>
                            ${canExtend ? 
                                `<button class="btn btn-sm btn-success ms-1" 
                                        onclick="showExtensionForm(${transaction.id})">
                                    <i class="fas fa-calendar-plus me-1"></i>Perpanjang
                                </button>` : 
                                ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Update transaction list
    if (transactionList) {
        console.log("Updating transaction list HTML");
        transactionList.innerHTML = transactionsHTML;
    } else {
        console.error("Transaction list element not found");
    }
    
    // Update pagination
    if (pagination && pagination.pages > 1) {
        console.log(`Setting up pagination: ${pagination.page} of ${pagination.pages} pages`);
        if (paginationContainer) {
            paginationContainer.classList.remove('d-none');
            paginationContainer.innerHTML = createPaginationHTML(pagination);
            
            // Add pagination event listeners
            paginationContainer.querySelectorAll('.page-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const page = parseInt(this.getAttribute('data-page'));
                    loadRentalTransactions(page);
                });
            });
        } else {
            console.error("Pagination container not found");
        }
    } else {
        if (paginationContainer) paginationContainer.classList.add('d-none');
    }
}

/**
 * Get badge class based on status
 */
function getStatusBadgeClass(status) {
    switch (status) {
        case 'active':
            return 'bg-success';
        case 'extended':
            return 'bg-info';
        case 'completed':
            return 'bg-secondary';
        case 'terminated':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

/**
 * Create pagination HTML
 */
function createPaginationHTML(pagination) {
    const currentPage = pagination.page;
    const totalPages = pagination.pages;
    
    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    
    // Show max 5 page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    return paginationHTML;
}

/**
 * Show transaction detail in a modal
 */
function showTransactionDetail(transactionId) {
    // Find transaction in data
    const transaction = transactionData.find(t => t.id === transactionId);
    if (!transaction) {
        alert('Transaksi tidak ditemukan');
        return;
    }
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('transactionDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'transactionDetailModal';
        modal.className = 'modal fade';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'transactionDetailModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="transactionDetailModalLabel">Detail Transaksi Sewa</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="transactionDetailContent">
                        <!-- Content will be populated dynamically -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Format dates
    const startDate = new Date(transaction.start_date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const endDate = new Date(transaction.end_date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const currentEndDate = new Date(transaction.current_end_date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format prices
    const formattedMonthlyPrice = new Intl.NumberFormat('id-ID').format(transaction.monthly_price);
    const formattedTotalPrice = new Intl.NumberFormat('id-ID').format(transaction.monthly_price * transaction.total_months);
    const formattedPaidAmount = new Intl.NumberFormat('id-ID').format(transaction.paid_amount);
    const formattedRemainingAmount = new Intl.NumberFormat('id-ID').format(transaction.remaining_amount);
    
    // Process extension history
    let extensionHistoryHTML = '';
    if (transaction.extension_history && transaction.extension_history.length > 0) {
        extensionHistoryHTML = `
            <div class="card mt-3">
                <div class="card-header bg-info text-white">
                    <h6 class="mb-0">Riwayat Perpanjangan</h6>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Durasi</th>
                                    <th>Dari</th>
                                    <th>Hingga</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        transaction.extension_history.forEach(extension => {
            const extensionDate = new Date(extension.date).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const prevEndDate = new Date(extension.previous_end_date).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const newEndDate = new Date(extension.new_end_date).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            extensionHistoryHTML += `
                <tr>
                    <td>${extensionDate}</td>
                    <td>${extension.additional_months} bulan</td>
                    <td>${prevEndDate}</td>
                    <td>${newEndDate}</td>
                </tr>
            `;
        });
        
        extensionHistoryHTML += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Populate modal content
    const modalContent = document.getElementById('transactionDetailContent');
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="card mb-3">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0">Informasi Aset</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Nama Aset:</strong> ${transaction.asset_name || 'Tidak tersedia'}</p>
                            <p class="mb-1"><strong>ID Aset:</strong> ${transaction.asset_id}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Status Transaksi:</strong> <span class="badge ${getStatusBadgeClass(transaction.status)}">${transaction.status_label}</span></p>
                            <p class="mb-1"><strong>Status Pembayaran:</strong> <span class="badge ${getPaymentStatusBadgeClass(transaction.payment_status)}">${transaction.payment_status_label}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header bg-success text-white">
                    <h6 class="mb-0">Detail Kontrak</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Tanggal Mulai:</strong> ${startDate}</p>
                            <p class="mb-1"><strong>Tanggal Berakhir (Awal):</strong> ${endDate}</p>
                            <p class="mb-1"><strong>Tanggal Berakhir (Saat Ini):</strong> ${currentEndDate}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Durasi Total:</strong> ${transaction.total_months} bulan</p>
                            <p class="mb-1"><strong>Sisa Waktu:</strong> ${transaction.days_remaining} hari</p>
                            <p class="mb-1"><strong>Perpanjangan:</strong> ${transaction.extension_count} kali</p>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <strong>Progress Kontrak:</strong>
                        <div class="progress mt-2" style="height: 15px;">
                            <div class="progress-bar ${transaction.status === 'active' ? 'bg-success' : 'bg-info'}" 
                                 role="progressbar" 
                                 style="width: ${transaction.rental_duration ? transaction.rental_duration.progress_percentage : 0}%;" 
                                 aria-valuenow="${transaction.rental_duration ? transaction.rental_duration.progress_percentage : 0}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                                ${Math.round(transaction.rental_duration ? transaction.rental_duration.progress_percentage : 0)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header bg-warning text-dark">
                    <h6 class="mb-0">Informasi Pembayaran</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Harga per Bulan:</strong> Rp ${formattedMonthlyPrice}</p>
                            <p class="mb-1"><strong>Total Harga:</strong> Rp ${formattedTotalPrice}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Jumlah Dibayar:</strong> Rp ${formattedPaidAmount}</p>
                            <p class="mb-1"><strong>Sisa Pembayaran:</strong> Rp ${formattedRemainingAmount}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            ${extensionHistoryHTML}
            
            ${transaction.can_extend ? `
                <div class="text-center mt-3">
                    <button class="btn btn-success" onclick="showExtensionForm(${transaction.id})">
                        <i class="fas fa-calendar-plus me-1"></i>Ajukan Perpanjangan
                    </button>
                </div>
            ` : ''}
        `;
    }
    
    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

/**
 * Get badge class for payment status
 */
function getPaymentStatusBadgeClass(status) {
    switch (status) {
        case 'paid':
            return 'bg-success';
        case 'partial':
            return 'bg-warning';
        case 'pending':
            return 'bg-secondary';
        case 'overdue':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

/**
 * Show extension form in a modal
 */
function showExtensionForm(transactionId) {
    // Find transaction in data
    const transaction = transactionData.find(t => t.id === transactionId);
    if (!transaction) {
        alert('Transaksi tidak ditemukan');
        return;
    }
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('extensionRequestModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'extensionRequestModal';
        modal.className = 'modal fade';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'extensionRequestModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="extensionRequestModalLabel">Perpanjangan Kontrak Sewa</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="extensionRequestForm">
                            <input type="hidden" id="extensionTransactionId" value="">
                            
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-1"></i>
                                Perpanjangan kontrak akan menambah durasi sewa setelah kontrak saat ini berakhir.
                            </div>
                            
                            <div class="mb-3">
                                <label for="extensionMonths" class="form-label">Durasi Perpanjangan</label>
                                <select class="form-select" id="extensionMonths" required>
                                    <option value="">Pilih Durasi</option>
                                    <option value="1">1 Bulan</option>
                                    <option value="3">3 Bulan</option>
                                    <option value="6">6 Bulan</option>
                                    <option value="12">12 Bulan</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="extensionNotes" class="form-label">Catatan (Opsional)</label>
                                <textarea class="form-control" id="extensionNotes" rows="3" placeholder="Tambahkan catatan jika diperlukan..."></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Estimasi Biaya</label>
                                <div class="input-group">
                                    <span class="input-group-text">Rp</span>
                                    <input type="text" class="form-control" id="extensionCost" readonly>
                                </div>
                                <small class="form-text text-muted">Biaya per bulan: Rp <span id="monthlyPriceDisplay"></span></small>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="button" class="btn btn-success" id="submitExtensionBtn">
                            <i class="fas fa-paper-plane me-1"></i>Kirim Permintaan
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up extension months change handler
        const extensionMonths = document.getElementById('extensionMonths');
        if (extensionMonths) {
            extensionMonths.addEventListener('change', function() {
                calculateExtensionCost();
            });
        }
        
        // Set up submit button handler
        const submitExtensionBtn = document.getElementById('submitExtensionBtn');
        if (submitExtensionBtn) {
            submitExtensionBtn.addEventListener('click', function() {
                submitExtensionRequest();
            });
        }
    }
    
    // Set transaction ID
    const extensionTransactionId = document.getElementById('extensionTransactionId');
    if (extensionTransactionId) {
        extensionTransactionId.value = transactionId;
    }
    
    // Set monthly price display
    const monthlyPriceDisplay = document.getElementById('monthlyPriceDisplay');
    if (monthlyPriceDisplay) {
        monthlyPriceDisplay.textContent = new Intl.NumberFormat('id-ID').format(transaction.monthly_price);
    }
    
    // Reset form
    const extensionMonths = document.getElementById('extensionMonths');
    const extensionNotes = document.getElementById('extensionNotes');
    const extensionCost = document.getElementById('extensionCost');
    
    if (extensionMonths) extensionMonths.value = '';
    if (extensionNotes) extensionNotes.value = '';
    if (extensionCost) extensionCost.value = '';
    
    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

/**
 * Calculate extension cost based on selected months
 */
function calculateExtensionCost() {
    const extensionMonths = document.getElementById('extensionMonths');
    const extensionCost = document.getElementById('extensionCost');
    const extensionTransactionId = document.getElementById('extensionTransactionId');
    
    if (!extensionMonths || !extensionCost || !extensionTransactionId) return;
    
    const transactionId = parseInt(extensionTransactionId.value);
    const months = parseInt(extensionMonths.value);
    
    if (isNaN(months) || months <= 0) {
        extensionCost.value = '';
        return;
    }
    
    // Find transaction
    const transaction = transactionData.find(t => t.id === transactionId);
    if (!transaction) {
        extensionCost.value = '';
        return;
    }
    
    // Calculate cost
    const cost = transaction.monthly_price * months;
    
    // Format and display
    extensionCost.value = new Intl.NumberFormat('id-ID').format(cost);
}

/**
 * Submit extension request to the API
 */
async function submitExtensionRequest() {
    try {
        const extensionTransactionId = document.getElementById('extensionTransactionId');
        const extensionMonths = document.getElementById('extensionMonths');
        const extensionNotes = document.getElementById('extensionNotes');
        const submitBtn = document.getElementById('submitExtensionBtn');
        
        if (!extensionTransactionId || !extensionMonths || !submitBtn) return;
        
        const transactionId = parseInt(extensionTransactionId.value);
        const months = parseInt(extensionMonths.value);
        const notes = extensionNotes ? extensionNotes.value : '';
        
        // Validate
        if (isNaN(months) || months <= 0) {
            alert('Silakan pilih durasi perpanjangan');
            return;
        }
        
        // Disable submit button and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Mengirim...';
        
        // Submit request
        const response = await fetch(`${TRANSACTION_ENDPOINT}/${transactionId}/request-extension`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                additional_months: months,
                notes: notes
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Gagal mengirim permintaan perpanjangan');
        }
        
        // Close modal
        const modal = document.getElementById('extensionRequestModal');
        if (modal) {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) modalInstance.hide();
        }
        
        // Show success alert
        alert('Permintaan perpanjangan berhasil dikirim. Admin akan meninjau permintaan Anda.');
        
        // Reload transactions
        loadRentalTransactions(currentTransactionPage);
        
    } catch (error) {
        console.error('Error submitting extension request:', error);
        alert(`Gagal mengirim permintaan perpanjangan: ${error.message}`);
    } finally {
        // Re-enable submit button
        const submitBtn = document.getElementById('submitExtensionBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Kirim Permintaan';
        }
    }
}

/**
 * Show error message
 */
function showError(message) {
    alert(message);
}
