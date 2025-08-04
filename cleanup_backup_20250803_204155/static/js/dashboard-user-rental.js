/**
 * Dashboard User Rental
 * Handles user rental form interactions
 */

// Global variables
let currentAsset = null;
let rentalFormData = {};

// Show asset detail modal
function showAsetDetail(assetId, assetType) {
    // Show loading state
    showLoadingModal('Memuat detail aset...');
    
    // Fetch asset details from API
    fetch(`/api/asset-detail/${assetId}`)
        .then(response => response.json())
        .then(result => {
            hideLoadingModal();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load asset details');
            }
            
            // Store current asset
            currentAsset = result.data;
            
            // Display asset details in modal
            displayAssetDetailModal(currentAsset);
        })
        .catch(error => {
            hideLoadingModal();
            console.error('Error loading asset details:', error);
            showAlert('error', `Gagal memuat detail aset: ${error.message}`);
        });
}

// Display asset detail modal
function displayAssetDetailModal(asset) {
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
    
    // Add photo gallery if available
    let photoGallery = '';
    if (asset.photos && asset.photos.length > 0) {
        photoGallery = `
            <div class="row mb-4">
                <div class="col-12">
                    <h6 class="mb-3">Foto Properti</h6>
                    <div class="row g-2">
        `;
        
        asset.photos.forEach(photo => {
            photoGallery += `
                <div class="col-md-4 col-6">
                    <img src="/static/uploads/assets/${photo}" class="img-fluid rounded" alt="${asset.name}">
                </div>
            `;
        });
        
        photoGallery += `
                    </div>
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
        
        ${photoGallery}
        
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
                <h6>Deskripsi</h6>
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
        showRentalForm(asset.id, asset.asset_type);
    };
    
    // Show modal
    const modal = new bootstrap.Modal(detailModal);
    modal.show();
}

// Show rental form modal
function showRentalForm(assetId, assetType) {
    // Show loading state
    showLoadingModal('Memuat form sewa...');
    
    // Fetch asset details from API if not already loaded
    if (!currentAsset || currentAsset.id !== assetId) {
        fetch(`/api/asset-detail/${assetId}`)
            .then(response => response.json())
            .then(result => {
                hideLoadingModal();
                
                if (!result.success) {
                    throw new Error(result.error || 'Failed to load asset details');
                }
                
                // Store current asset
                currentAsset = result.data;
                
                // Display rental form
                displayRentalFormModal(currentAsset);
            })
            .catch(error => {
                hideLoadingModal();
                console.error('Error loading asset details:', error);
                showAlert('error', `Gagal memuat detail aset: ${error.message}`);
            });
    } else {
        hideLoadingModal();
        displayRentalFormModal(currentAsset);
    }
}

// Display rental form modal
function displayRentalFormModal(asset) {
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
    const asset = currentAsset;
    
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
    
    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + totalMonths);
    
    // Calculate total cost
    const totalCost = asset.harga_sewa * totalMonths;
    
    // Show loading
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
    
    // Get payment token from backend
    fetch('/api/midtrans/create-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })
    .then(response => response.json())
    .then(result => {
        hideLoadingModal();
        
        if (!result.success) {
            throw new Error(result.error || 'Gagal membuat pembayaran');
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
                showAlert('info', 'Pembayaran dibatalkan');
            }
        });
    })
    .catch(error => {
        hideLoadingModal();
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
            if (typeof loadRentalRequests === 'function') {
                loadRentalRequests();
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
function submitRentalRequest(asset) {
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
    
    // Collect form data
    rentalFormData = {
        asset_id: asset.id,
        start_date: startDate,
        total_months: totalMonths
    };
    
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
            showLoadingModal('Memproses pengajuan sewa...');
            
            // Submit request to API
            const response = await fetch('/api/submit-rental-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rentalFormData)
            });
            
            const result = await response.json();
            
            hideLoadingModal();
            
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
            hideLoadingModal();
            console.error('Error submitting rental request:', error);
            showAlert('error', `Gagal mengajukan sewa: ${error.message}`);
        }
    };
    
    // Show modal
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
}

// Show loading modal
function showLoadingModal(message = 'Loading...') {
    // Create modal if it doesn't exist
    let loadingModal = document.getElementById('loadingModal');
    if (!loadingModal) {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = `
            <div class="modal fade" id="loadingModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content">
                        <div class="modal-body text-center p-4">
                            <div class="spinner-border text-danger mb-3" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mb-0" id="loadingMessage">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv.firstElementChild);
        loadingModal = document.getElementById('loadingModal');
    }
    
    // Update message
    document.getElementById('loadingMessage').textContent = message;
    
    // Show modal
    const modal = new bootstrap.Modal(loadingModal);
    modal.show();
}

// Hide loading modal
function hideLoadingModal() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        const modal = bootstrap.Modal.getInstance(loadingModal);
        if (modal) {
            modal.hide();
        }
    }
}

// Show alert message
function showAlert(type, message, autoClose = true) {
    const alertContainer = document.getElementById('alertContainer');
    
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