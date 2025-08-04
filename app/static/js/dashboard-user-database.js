/**
 * Dashboard User Database Integration
 * Handles API calls and data display for the user dashboard
 */

// Global variables
let currentPage = 1;
const itemsPerPage = 6;
let totalAssets = 0;
let allAssets = [];
let filteredAssets = [];

// Load available assets from database
async function loadAvailableAssets(page = 1, filters = {}) {
    try {
        // Show loading state
        document.getElementById('assetGrid').innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Memuat data aset tersedia...</p>
            </div>
        `;

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (filters.assetType) queryParams.append('asset_type', filters.assetType);
        if (filters.location) queryParams.append('kecamatan', filters.location);
        if (filters.priceRange) queryParams.append('price_range', filters.priceRange);
        
        // Add per_page parameter to get more assets (default was only 10)
        queryParams.append('per_page', '1000'); // Fetch up to 1000 assets

        // Fetch data from API
        const response = await fetch(`/rental/api/assets/available?${queryParams.toString()}`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to load assets');
        }

        // Store all assets - handle both 'data' and 'assets' field names
        allAssets = result.data || result.assets || [];
        totalAssets = result.total || allAssets.length;
        
        // Update filtered assets
        filteredAssets = [...allAssets];

        // Update stats
        document.getElementById('totalAset').textContent = totalAssets;

        // Display assets with pagination
        displayAssets(page);
        
        // Update location filter options
        updateLocationFilter();

        return result.data;
    } catch (error) {
        console.error('Error loading assets:', error);
        showAlert('error', `Gagal memuat data aset: ${error.message}`);
        return [];
    }
}

// Display assets with pagination
function displayAssets(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const assetsToDisplay = filteredAssets.slice(startIndex, endIndex);
    
    const assetGrid = document.getElementById('assetGrid');
    
    if (assetsToDisplay.length === 0) {
        assetGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5>Tidak ada aset yang tersedia</h5>
                <p class="text-muted">Coba ubah filter pencarian Anda</p>
            </div>
        `;
        document.getElementById('assetPagination').innerHTML = '';
        return;
    }
    
    // Clear previous content
    assetGrid.innerHTML = '';
    
    // Add asset cards
    assetsToDisplay.forEach(asset => {
        const assetCard = createAssetCard(asset);
        assetGrid.appendChild(assetCard);
    });
    
    // Update pagination
    updatePagination(page, Math.ceil(filteredAssets.length / itemsPerPage));
}

// Create asset card element
function createAssetCard(asset) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    // Format price
    const formattedPrice = new Intl.NumberFormat('id-ID').format(asset.harga_sewa);
    
    // Determine badge class based on asset type
    const badgeClass = asset.asset_type === 'tanah' ? 'bg-success' : 'bg-primary';
    const assetTypeLabel = asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan';
    
    col.innerHTML = `
        <div class="card asset-card h-100 shadow-sm">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge ${badgeClass} rounded-pill">
                        ${assetTypeLabel}
                    </span>
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-success text-white rounded-pill">
                            Tersedia
                        </span>
                        <i class="fas fa-heart favorite-heart" data-aset-id="${asset.id}" title="Tambah ke Favorit"></i>
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
                        <button class="btn btn-danger" onclick="showRentalForm(${asset.id}, '${asset.asset_type}')">
                            <i class="fas fa-handshake me-1"></i>Sewa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener for favorite button
    const favoriteBtn = col.querySelector('.favorite-heart');
    favoriteBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(asset.id, this);
    });
    
    return col;
}

// Update pagination controls
function updatePagination(currentPage, totalPages) {
    const pagination = document.getElementById('assetPagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
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
    
    pagination.innerHTML = paginationHTML;
    
    // Add event listeners to pagination links
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page && page !== currentPage) {
                displayAssets(page);
            }
        });
    });
}

// Update location filter options based on available assets
function updateLocationFilter() {
    const locationFilter = document.getElementById('locationFilter');
    
    // Get unique locations
    const locations = [...new Set(allAssets.map(asset => asset.kecamatan))].sort();
    
    // Save current selection
    const currentSelection = locationFilter.value;
    
    // Clear options except first one
    while (locationFilter.options.length > 1) {
        locationFilter.remove(1);
    }
    
    // Add location options
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
    
    // Restore selection if possible
    if (currentSelection && locations.includes(currentSelection)) {
        locationFilter.value = currentSelection;
    }
}

// Show asset detail modal
function showAsetDetail(assetId, assetType) {
    // Find asset data
    const asset = allAssets.find(a => a.id === assetId);
    
    if (!asset) {
        showAlert('error', 'Data aset tidak ditemukan');
        return;
    }
    
    // Format price
    const formattedPrice = new Intl.NumberFormat('id-ID').format(asset.harga_sewa);
    
    // Create modal if it doesn't exist
    let detailModal = document.getElementById('assetDetailModal');
    if (!detailModal) {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = `
            <div class="modal fade" id="assetDetailModal" tabindex="-1" aria-labelledby="assetDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title" id="assetDetailModalLabel">Detail Aset</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="assetDetailContent">
                            <!-- Content will be inserted here -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                            <button type="button" class="btn btn-danger" id="rentNowBtn">Sewa Sekarang</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv.firstElementChild);
        detailModal = document.getElementById('assetDetailModal');
    }
    
    // Populate modal content
    const modalContent = document.getElementById('assetDetailContent');
    
    // Determine asset type specific content
    let assetTypeSpecificContent = '';
    if (asset.asset_type === 'bangunan') {
        assetTypeSpecificContent = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <p><strong>Luas Bangunan:</strong> ${asset.luas_bangunan} m²</p>
                    <p><strong>Jumlah Lantai:</strong> ${asset.jumlah_lantai || '-'}</p>
                    <p><strong>Kamar Tidur:</strong> ${asset.kamar_tidur || '-'}</p>
                    <p><strong>Kamar Mandi:</strong> ${asset.kamar_mandi || '-'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Daya Listrik:</strong> ${asset.daya_listrik || '-'}</p>
                    <p><strong>Kondisi Properti:</strong> ${asset.kondisi_properti || '-'}</p>
                </div>
            </div>
        `;
    }
    
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-12 mb-3">
                <h4>${asset.name}</h4>
                <span class="badge ${asset.asset_type === 'tanah' ? 'bg-success' : 'bg-primary'} mb-2">
                    ${asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan'}
                </span>
                <span class="badge bg-success mb-2">Tersedia</span>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-md-6">
                <p><strong>Lokasi:</strong> ${asset.kecamatan}, ${asset.alamat}</p>
                <p><strong>Luas Tanah:</strong> ${asset.luas_tanah} m²</p>
                <p><strong>Sertifikat:</strong> ${asset.sertifikat}</p>
                <p><strong>Jenis Zona:</strong> ${asset.jenis_zona}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Aksesibilitas:</strong> ${asset.aksesibilitas}</p>
                <p><strong>Tingkat Keamanan:</strong> ${asset.tingkat_keamanan}</p>
                <p><strong>NJOP per m²:</strong> Rp ${new Intl.NumberFormat('id-ID').format(asset.njop_per_m2)}</p>
                <p><strong>Harga Sewa:</strong> <span class="text-danger fw-bold">Rp ${formattedPrice}/bulan</span></p>
            </div>
        </div>
        
        ${assetTypeSpecificContent}
        
        <div class="row">
            <div class="col-12">
                <h5>Deskripsi</h5>
                <p>${asset.deskripsi || 'Tidak ada deskripsi'}</p>
            </div>
        </div>
    `;
    
    // Set up rent now button
    const rentNowBtn = document.getElementById('rentNowBtn');
    rentNowBtn.onclick = function() {
        // Close detail modal
        bootstrap.Modal.getInstance(detailModal).hide();
        // Show rental form
        showRentalForm(assetId, assetType);
    };
    
    // Show modal
    const modal = new bootstrap.Modal(detailModal);
    modal.show();
}

// Show rental form modal
function showRentalForm(assetId, assetType) {
    // Find asset data
    const asset = allAssets.find(a => a.id === assetId);
    
    if (!asset) {
        showAlert('error', 'Data aset tidak ditemukan');
        return;
    }
    
    // Format price
    const formattedPrice = new Intl.NumberFormat('id-ID').format(asset.harga_sewa);
    
    // Create modal if it doesn't exist
    let rentalModal = document.getElementById('rentalFormModal');
    if (!rentalModal) {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = `
            <div class="modal fade" id="rentalFormModal" tabindex="-1" aria-labelledby="rentalFormModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title" id="rentalFormModalLabel">Form Pengajuan Sewa</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="rentalRequestForm">
                                <div class="mb-3">
                                    <label class="form-label">Aset yang akan disewa:</label>
                                    <div class="d-flex align-items-center">
                                        <span class="badge me-2 asset-type-badge">Tanah</span>
                                        <strong class="asset-name">Nama Aset</strong>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Harga Sewa:</label>
                                    <div class="h5 text-danger rental-price">Rp 0/bulan</div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="startDate" class="form-label">Tanggal Mulai Sewa:</label>
                                    <input type="date" class="form-control" id="startDate" name="startDate" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="rentalDuration" class="form-label">Durasi Sewa:</label>
                                    <select class="form-select" id="rentalDuration" name="rentalDuration" required>
                                        <option value="">Pilih Durasi</option>
                                        <option value="1">1 Bulan</option>
                                        <option value="3">3 Bulan</option>
                                        <option value="6">6 Bulan</option>
                                        <option value="12">12 Bulan (1 Tahun)</option>
                                        <option value="24">24 Bulan (2 Tahun)</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Total Biaya Sewa:</label>
                                    <div class="h5 text-danger" id="totalRentalCost">Rp 0</div>
                                </div>
                                
                                <input type="hidden" id="assetId" name="assetId">
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                            <button type="button" class="btn btn-midtrans" id="payNowBtn" disabled>
                                <i class="fas fa-credit-card me-2"></i>Bayar Sekarang
                            </button>
                            <button type="button" class="btn btn-danger" id="submitRentalBtn">Ajukan Sewa</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv.firstElementChild);
        rentalModal = document.getElementById('rentalFormModal');
        
        // Set up event listeners for rental duration
        document.getElementById('rentalDuration').addEventListener('change', updateTotalCost);
    }
    
    // Update modal content
    document.querySelector('#rentalFormModal .asset-name').textContent = asset.name;
    document.querySelector('#rentalFormModal .asset-type-badge').textContent = asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan';
    document.querySelector('#rentalFormModal .asset-type-badge').className = `badge me-2 ${asset.asset_type === 'tanah' ? 'bg-success' : 'bg-primary'}`;
    document.querySelector('#rentalFormModal .rental-price').textContent = `Rp ${formattedPrice}/bulan`;
    document.getElementById('assetId').value = asset.id;
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('startDate').min = tomorrow.toISOString().split('T')[0];
    
    // Reset form
    document.getElementById('rentalRequestForm').reset();
    document.getElementById('totalRentalCost').textContent = 'Rp 0';
    
    // Set up submit button
    document.getElementById('submitRentalBtn').onclick = function() {
        submitRentalRequest(asset);
    };
    
    // Set up payment button
    document.getElementById('payNowBtn').onclick = function() {
        handlePayment(asset);
    };
    
    // Initially disable payment button
    document.getElementById('payNowBtn').disabled = true;
    
    // Show modal
    const modal = new bootstrap.Modal(rentalModal);
    modal.show();
}

// Update total cost based on rental duration
function updateTotalCost() {
    const assetId = document.getElementById('assetId').value;
    const asset = allAssets.find(a => a.id === parseInt(assetId));
    
    if (!asset) return;
    
    const duration = parseInt(document.getElementById('rentalDuration').value) || 0;
    const totalCost = asset.harga_sewa * duration;
    
    document.getElementById('totalRentalCost').textContent = `Rp ${new Intl.NumberFormat('id-ID').format(totalCost)}`;
    
    // Enable/disable pay now button based on duration selection
    const payNowBtn = document.getElementById('payNowBtn');
    if (payNowBtn) {
        payNowBtn.disabled = duration === 0;
    }
}

// Handle payment with Midtrans
function handlePayment(asset) {
    const form = document.getElementById('rentalRequestForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const startDate = document.getElementById('startDate').value;
    const totalMonths = parseInt(document.getElementById('rentalDuration').value);
    
    if (!startDate || !totalMonths) {
        showAlert('error', 'Mohon lengkapi semua field');
        return;
    }
    
    // Prevent multiple clicks
    const payNowBtn = document.getElementById('payNowBtn');
    if (payNowBtn) {
        payNowBtn.disabled = true;
    }
    
    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + totalMonths);
    
    // Calculate total cost
    const totalCost = asset.harga_sewa * totalMonths;
    
    // Show loading with timeout
    showLoadingModal('Memproses pembayaran...');
    
    // Create payment data
    const paymentData = {
        asset_id: asset.id,
        asset_name: asset.name,
        asset_type: asset.asset_type,
        start_date: startDate,
        total_months: totalMonths,
        end_date: endDate.toISOString().split('T')[0],
        monthly_price: asset.harga_sewa,
        total_amount: totalCost,
        payment_type: 'full_payment'
    };
    
    // Add timeout to prevent freeze
    const paymentTimeout = setTimeout(() => {
        hideLoadingModal();
        if (payNowBtn) payNowBtn.disabled = false;
        showAlert('error', 'Pembayaran timeout. Silakan coba lagi.');
    }, 30000); // 30 seconds timeout
    
    // Get payment token from backend
    fetch('/api/midtrans/create-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        clearTimeout(paymentTimeout);
        hideLoadingModal();
        
        if (!result.success) {
            throw new Error(result.error || 'Gagal membuat pembayaran');
        }
        
        // Check if Midtrans Snap is available
        if (typeof window.snap === 'undefined') {
            throw new Error('Midtrans Snap tidak tersedia. Silakan refresh halaman.');
        }
        
        // Process payment with Midtrans Snap
        window.snap.pay(result.token, {
            onSuccess: function(result) {
                console.log('Payment success:', result);
                handlePaymentSuccess(result, paymentData);
            },
            onPending: function(result) {
                console.log('Payment pending:', result);
                handlePaymentPending(result, paymentData);
            },
            onError: function(result) {
                console.log('Payment error:', result);
                handlePaymentError(result);
            },
            onClose: function() {
                console.log('Payment popup closed');
                if (payNowBtn) payNowBtn.disabled = false;
                showAlert('info', 'Pembayaran dibatalkan');
            }
        });
    })
    .catch(error => {
        clearTimeout(paymentTimeout);
        hideLoadingModal();
        if (payNowBtn) payNowBtn.disabled = false;
        console.error('Error creating payment:', error);
        showAlert('error', `Gagal memproses pembayaran: ${error.message}`);
    });
}

// Handle successful payment
function handlePaymentSuccess(result, paymentData) {
    showLoadingModal('Memverifikasi pembayaran...');
    
    // Verify payment with backend
    fetch('/api/midtrans/verify-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...paymentData,
            payment_result: result
        })
    })
    .then(response => response.json())
    .then(verifyResult => {
        hideLoadingModal();
        
        if (verifyResult.success) {
            // Close rental form modal
            const rentalModal = document.getElementById('rentalFormModal');
            if (rentalModal) {
                bootstrap.Modal.getInstance(rentalModal).hide();
            }
            
            showAlert('success', 'Pembayaran berhasil! Transaksi sewa Anda telah aktif.');
            
            // Refresh data if needed
            if (typeof loadUserAssets === 'function') {
                loadUserAssets();
            }
        } else {
            showAlert('error', 'Pembayaran berhasil tetapi terjadi kesalahan dalam memproses transaksi. Silakan hubungi admin.');
        }
    })
    .catch(error => {
        hideLoadingModal();
        console.error('Error verifying payment:', error);
        showAlert('error', 'Pembayaran berhasil tetapi gagal memverifikasi. Silakan hubungi admin.');
    });
}

// Handle pending payment
function handlePaymentPending(result, paymentData) {
    showAlert('warning', 'Pembayaran sedang diproses. Anda akan mendapat notifikasi setelah pembayaran dikonfirmasi.');
    
    // Close modal
    const rentalModal = document.getElementById('rentalFormModal');
    if (rentalModal) {
        bootstrap.Modal.getInstance(rentalModal).hide();
    }
}

// Handle payment error
function handlePaymentError(result) {
    showAlert('error', 'Pembayaran gagal. Silakan coba lagi.');
}

// Submit rental request
async function submitRentalRequest(asset) {
    const form = document.getElementById('rentalRequestForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const startDate = document.getElementById('startDate').value;
    const totalMonths = parseInt(document.getElementById('rentalDuration').value);
    
    if (!startDate || !totalMonths) {
        showAlert('error', 'Mohon lengkapi semua field');
        return;
    }
    
    // Show confirmation modal
    showConfirmationModal(asset, startDate, totalMonths);
}

// Show confirmation modal before submitting rental request
function showConfirmationModal(asset, startDate, totalMonths) {
    // Format dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setMonth(endDateObj.getMonth() + totalMonths);
    
    const formattedStartDate = startDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedEndDate = endDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Calculate total cost
    const totalCost = asset.harga_sewa * totalMonths;
    
    // Create modal if it doesn't exist
    let confirmModal = document.getElementById('confirmRentalModal');
    if (!confirmModal) {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = `
            <div class="modal fade" id="confirmRentalModal" tabindex="-1" aria-labelledby="confirmRentalModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title" id="confirmRentalModalLabel">Konfirmasi Pengajuan Sewa</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="confirmRentalContent">
                            <!-- Content will be inserted here -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                            <button type="button" class="btn btn-danger" id="confirmRentalBtn">Ya, Ajukan Sewa</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv.firstElementChild);
        confirmModal = document.getElementById('confirmRentalModal');
    }
    
    // Populate modal content
    const modalContent = document.getElementById('confirmRentalContent');
    modalContent.innerHTML = `
        <p>Anda akan mengajukan sewa untuk aset berikut:</p>
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${asset.name}</h5>
                <p class="card-text">
                    <span class="badge ${asset.asset_type === 'tanah' ? 'bg-success' : 'bg-primary'} mb-2">
                        ${asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan'}
                    </span>
                </p>
                <p class="card-text"><small class="text-muted">${asset.kecamatan}, ${asset.alamat.split(',')[0]}</small></p>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-6">
                <p><strong>Tanggal Mulai:</strong><br>${formattedStartDate}</p>
            </div>
            <div class="col-6">
                <p><strong>Tanggal Berakhir:</strong><br>${formattedEndDate}</p>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-6">
                <p><strong>Durasi Sewa:</strong><br>${totalMonths} bulan</p>
            </div>
            <div class="col-6">
                <p><strong>Harga per Bulan:</strong><br>Rp ${new Intl.NumberFormat('id-ID').format(asset.harga_sewa)}</p>
            </div>
        </div>
        
        <div class="alert alert-warning">
            <strong>Total Biaya Sewa:</strong> Rp ${new Intl.NumberFormat('id-ID').format(totalCost)}
        </div>
        
        <p class="text-muted small">
            <i class="fas fa-info-circle me-1"></i>
            Pengajuan sewa akan diproses oleh admin. Anda akan mendapatkan notifikasi setelah pengajuan disetujui atau ditolak.
        </p>
    `;
    
    // Set up confirm button
    document.getElementById('confirmRentalBtn').onclick = async function() {
        try {
            // Close confirmation modal
            bootstrap.Modal.getInstance(confirmModal).hide();
            
            // Show loading
            showAlert('info', 'Memproses pengajuan sewa...', false);
            
            // Submit request to API
            const response = await fetch('/api/submit-rental', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aset_id: asset.id,
                    tanggal_mulai: startDate,
                    durasi_sewa: totalMonths
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Gagal mengajukan sewa');
            }
            
            // Close rental form modal
            const rentalModal = document.getElementById('rentalFormModal');
            if (rentalModal) {
                bootstrap.Modal.getInstance(rentalModal).hide();
            }
            
            // Show success message
            showAlert('success', 'Pengajuan sewa berhasil diajukan! Silakan tunggu persetujuan dari admin.');
            
            // Refresh rental requests if we're on the history tab
            if (typeof loadRentalRequests === 'function') {
                loadRentalRequests();
            }
        } catch (error) {
            console.error('Error submitting rental request:', error);
            showAlert('error', `Gagal mengajukan sewa: ${error.message}`);
        }
    };
    
    // Show modal
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
}

// Show alert message
function showAlert(type, message, autoClose = true) {
    window.showNotification(message, type, autoClose);
}

// Show loading modal
function showLoadingModal(message = 'Loading...') {
    // Remove existing loading modal if any
    hideLoadingModal();
    
    // Create loading modal
    const loadingModal = document.createElement('div');
    loadingModal.id = 'loadingModal';
    loadingModal.className = 'modal fade';
    loadingModal.setAttribute('data-bs-backdrop', 'static');
    loadingModal.setAttribute('data-bs-keyboard', 'false');
    loadingModal.style.zIndex = '9999';
    
    loadingModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body text-center p-4">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mb-0">${message}</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loadingModal);
    
    // Show modal
    const modal = new bootstrap.Modal(loadingModal);
    modal.show();
    
    return modal;
}

// Hide loading modal
function hideLoadingModal() {
    const existingModal = document.getElementById('loadingModal');
    if (existingModal) {
        const modal = bootstrap.Modal.getInstance(existingModal);
        if (modal) {
            modal.hide();
        }
        // Remove modal after animation
        setTimeout(() => {
            if (existingModal.parentNode) {
                existingModal.parentNode.removeChild(existingModal);
            }
        }, 300);
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load available assets
    loadAvailableAssets();
    
    // Set up filter form
    const filterForm = document.getElementById('assetFilterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const filters = {
                assetType: document.getElementById('assetTypeFilter').value,
                location: document.getElementById('locationFilter').value,
                priceRange: document.getElementById('priceFilter').value
            };
            
            loadAvailableAssets(1, filters);
        });
    }
});