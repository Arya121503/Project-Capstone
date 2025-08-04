/* 
 * Direct Asset Actions - An alternative to modal-based asset management
 * This provides direct implementations of asset actions that don't rely on modals
 */

class DirectAssetActions {
    constructor() {
        this.apiBasePath = '/rental/api/assets';
        this.init();
    }
    
    init() {
        console.log('DirectAssetActions initialized - providing modal-free alternatives');
        
        // Add global access
        window.directAssetActions = this;
    }
    
    // View asset details directly, optionally in a new page or as an overlay
    async viewAssetDetail(assetId) {
        try {
            const response = await fetch(`${this.apiBasePath}/${assetId}`);
            const result = await response.json();
            
            if (!result.success) {
                this.showMessage('Error loading asset details: ' + (result.error || 'Unknown error'));
                return;
            }
            
            const asset = result.data; // Fixed: changed from result.asset to result.data
            
            // Create a content overlay instead of a modal
            const overlayContainer = document.createElement('div');
            overlayContainer.className = 'asset-detail-overlay';
            overlayContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.75);
                z-index: 2000;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: auto;
            `;
            
            const detailCard = document.createElement('div');
            detailCard.className = 'card';
            detailCard.style.cssText = `
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow: auto;
                position: relative;
            `;
            
            const assetType = asset.asset_type === 'tanah' ? 'Tanah' : 'Bangunan + Tanah';
            
            detailCard.innerHTML = `
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Detail Asset: ${this.escapeHtml(asset.name || 'Asset #' + asset.id)}</h5>
                    <button type="button" class="btn-close btn-close-white" aria-label="Close"></button>
                </div>
                <div class="card-body p-4">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Informasi Dasar</h6>
                            <table class="table table-sm">
                                <tr><td>Nama Aset:</td><td><strong>${this.escapeHtml(asset.name || '')}</strong></td></tr>
                                <tr><td>Jenis:</td><td>${assetType}</td></tr>
                                <tr><td>Lokasi:</td><td>${this.escapeHtml(asset.kecamatan || '')}, Surabaya</td></tr>
                                <tr><td>Ukuran Tanah:</td><td>${asset.luas_tanah || 0} m²</td></tr>
                                ${asset.luas_bangunan ? `<tr><td>Ukuran Bangunan:</td><td>${asset.luas_bangunan} m²</td></tr>` : ''}
                                <tr><td>Harga Sewa:</td><td class="text-danger"><strong>Rp ${this.formatCurrency(asset.harga_sewa || 0)}</strong></td></tr>
                                <tr><td>Status:</td><td><span class="badge bg-primary">Tersedia</span></td></tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>Detail Tambahan</h6>
                            <table class="table table-sm">
                                <tr><td>Sertifikat:</td><td>${this.escapeHtml(asset.sertifikat || 'N/A')}</td></tr>
                                <tr><td>Zona:</td><td>${this.escapeHtml(asset.jenis_zona || 'N/A')}</td></tr>
                                <tr><td>NJOP per m²:</td><td>Rp ${this.formatCurrency(asset.njop_per_m2 || 0)}</td></tr>
                                ${asset.asset_type === 'bangunan' ? `
                                <tr><td>Kamar Tidur:</td><td>${asset.kamar_tidur || 0}</td></tr>
                                <tr><td>Kamar Mandi:</td><td>${asset.kamar_mandi || 0}</td></tr>
                                <tr><td>Jumlah Lantai:</td><td>${asset.jumlah_lantai || 1}</td></tr>
                                <tr><td>Daya Listrik:</td><td>${asset.daya_listrik || 'N/A'} VA</td></tr>
                                <tr><td>Kondisi:</td><td>${this.escapeHtml(asset.kondisi_properti || 'N/A')}</td></tr>
                                ` : ''}
                                <tr><td>Deskripsi:</td><td>${this.escapeHtml(asset.deskripsi || asset.description || 'N/A')}</td></tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-end mt-3">
                        <button class="btn btn-secondary btn-sm me-2 close-overlay">Tutup</button>
                        <button class="btn btn-warning btn-sm me-2" onclick="window.directAssetActions.editAsset(${asset.id})">
                            <i class="fas fa-edit me-1"></i>Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.directAssetActions.deleteAsset(${asset.id}, '${this.escapeHtml(asset.name || 'Asset #' + asset.id)}')">
                            <i class="fas fa-trash me-1"></i>Hapus
                        </button>
                    </div>
                </div>
            `;
            
            overlayContainer.appendChild(detailCard);
            document.body.appendChild(overlayContainer);
            
            // Add close handlers
            const closeBtn = overlayContainer.querySelector('.btn-close');
            const closeButton = overlayContainer.querySelector('.close-overlay');
            
            const closeOverlay = () => {
                overlayContainer.remove();
            };
            
            closeBtn.addEventListener('click', closeOverlay);
            closeButton.addEventListener('click', closeOverlay);
            
            // Close on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') closeOverlay();
            }, { once: true });
            
            // Close when clicking outside the card
            overlayContainer.addEventListener('click', function(e) {
                if (e.target === overlayContainer) closeOverlay();
            });
            
        } catch (error) {
            console.error('Error viewing asset details:', error);
            this.showMessage('Error loading asset details: ' + error.message);
        }
    }
    
    // Edit asset directly, optionally in a new page or as an overlay
    async editAsset(assetId) {
        try {
            const response = await fetch(`${this.apiBasePath}/${assetId}`);
            const result = await response.json();
            
            if (!result.success) {
                this.showMessage('Error loading asset for editing: ' + (result.error || 'Unknown error'));
                return;
            }
            
            const asset = result.data; // Fixed: changed from result.asset to result.data
            
            // Create a content overlay instead of a modal
            const overlayContainer = document.createElement('div');
            overlayContainer.className = 'asset-edit-overlay';
            overlayContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.75);
                z-index: 2000;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: auto;
            `;
            
            const editCard = document.createElement('div');
            editCard.className = 'card';
            editCard.style.cssText = `
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow: auto;
                position: relative;
            `;
            
            // Create a form for editing the asset
            editCard.innerHTML = `
                <div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Edit Asset: ${this.escapeHtml(asset.name || 'Asset #' + asset.id)}</h5>
                    <button type="button" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="card-body p-4">
                    <form id="directEditAssetForm">
                        <input type="hidden" name="asset_id" value="${asset.id}">
                        
                        <!-- Basic Info -->
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Nama Aset</label>
                                <input type="text" class="form-control" name="asset_name" value="${this.escapeHtml(asset.name || '')}" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Jenis Aset</label>
                                <select class="form-select" name="asset_type" id="directEditAssetType">
                                    <option value="tanah" ${asset.asset_type === 'tanah' ? 'selected' : ''}>Tanah</option>
                                    <option value="bangunan" ${asset.asset_type === 'bangunan' ? 'selected' : ''}>Bangunan + Tanah</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Location -->
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Kecamatan</label>
                                <input type="text" class="form-control" name="kecamatan" value="${this.escapeHtml(asset.kecamatan || '')}" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Alamat Lengkap</label>
                                <input type="text" class="form-control" name="address" value="${this.escapeHtml(asset.address || '')}">
                            </div>
                        </div>
                        
                        <!-- Size and Price -->
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label class="form-label">Luas Tanah (m²)</label>
                                <input type="number" class="form-control" name="luas_tanah" value="${asset.luas_tanah || 0}" min="0" required>
                            </div>
                            <div class="col-md-4 building-field" ${asset.asset_type !== 'bangunan' ? 'style="display:none"' : ''}>
                                <label class="form-label">Luas Bangunan (m²)</label>
                                <input type="number" class="form-control" name="luas_bangunan" value="${asset.luas_bangunan || 0}" min="0">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">NJOP per m²</label>
                                <input type="number" class="form-control" name="njop_per_m2" value="${asset.njop_per_m2 || 0}" min="0">
                            </div>
                        </div>
                        
                        <!-- Building details -->
                        <div class="row mb-3 building-field" ${asset.asset_type !== 'bangunan' ? 'style="display:none"' : ''}>
                            <div class="col-md-3">
                                <label class="form-label">Kamar Tidur</label>
                                <input type="number" class="form-control" name="kamar_tidur" value="${asset.kamar_tidur || 0}" min="0">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Kamar Mandi</label>
                                <input type="number" class="form-control" name="kamar_mandi" value="${asset.kamar_mandi || 0}" min="0">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Jumlah Lantai</label>
                                <input type="number" class="form-control" name="jumlah_lantai" value="${asset.jumlah_lantai || 1}" min="1">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Daya Listrik (VA)</label>
                                <input type="text" class="form-control" name="daya_listrik" value="${asset.daya_listrik || ''}">
                            </div>
                        </div>
                        
                        <!-- Additional details -->
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Sertifikat</label>
                                <select class="form-select" name="sertifikat">
                                    <option value="SHM" ${asset.sertifikat === 'SHM' ? 'selected' : ''}>SHM</option>
                                    <option value="HGB" ${asset.sertifikat === 'HGB' ? 'selected' : ''}>HGB</option>
                                    <option value="Girik" ${asset.sertifikat === 'Girik' ? 'selected' : ''}>Girik</option>
                                    <option value="AJB" ${asset.sertifikat === 'AJB' ? 'selected' : ''}>AJB</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Jenis Zona</label>
                                <select class="form-select" name="jenis_zona">
                                    <option value="Perumahan" ${asset.jenis_zona === 'Perumahan' ? 'selected' : ''}>Perumahan</option>
                                    <option value="Komersial" ${asset.jenis_zona === 'Komersial' ? 'selected' : ''}>Komersial</option>
                                    <option value="Industri" ${asset.jenis_zona === 'Industri' ? 'selected' : ''}>Industri</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Rental price -->
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <label class="form-label">Harga Sewa (Rp/bulan)</label>
                                <input type="number" class="form-control" name="harga_sewa" value="${asset.harga_sewa || 0}" min="0" required>
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <label class="form-label">Deskripsi</label>
                                <textarea class="form-control" name="description" rows="3">${this.escapeHtml(asset.deskripsi || asset.description || '')}</textarea>
                            </div>
                        </div>
                        
                        <!-- Building condition -->
                        <div class="row mb-3 building-field" ${asset.asset_type !== 'bangunan' ? 'style="display:none"' : ''}>
                            <div class="col-md-12">
                                <label class="form-label">Kondisi Properti</label>
                                <select class="form-select" name="kondisi_properti">
                                    <option value="Sangat Baik" ${asset.kondisi_properti === 'Sangat Baik' ? 'selected' : ''}>Sangat Baik</option>
                                    <option value="Baik" ${asset.kondisi_properti === 'Baik' ? 'selected' : ''}>Baik</option>
                                    <option value="Cukup" ${asset.kondisi_properti === 'Cukup' ? 'selected' : ''}>Cukup</option>
                                    <option value="Butuh Renovasi" ${asset.kondisi_properti === 'Butuh Renovasi' ? 'selected' : ''}>Butuh Renovasi</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-end mt-4">
                            <button type="button" class="btn btn-secondary me-2 close-overlay">Batal</button>
                            <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                        </div>
                    </form>
                </div>
            `;
            
            overlayContainer.appendChild(editCard);
            document.body.appendChild(overlayContainer);
            
            // Add close handlers
            const closeBtn = overlayContainer.querySelector('.btn-close');
            const closeButton = overlayContainer.querySelector('.close-overlay');
            
            const closeOverlay = () => {
                overlayContainer.remove();
            };
            
            closeBtn.addEventListener('click', closeOverlay);
            closeButton.addEventListener('click', closeOverlay);
            
            // Close on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') closeOverlay();
            }, { once: true });
            
            // Toggle building fields based on asset type
            const assetTypeSelect = document.getElementById('directEditAssetType');
            const buildingFields = document.querySelectorAll('.building-field');
            
            assetTypeSelect.addEventListener('change', function() {
                if (this.value === 'bangunan') {
                    buildingFields.forEach(field => field.style.display = 'block');
                } else {
                    buildingFields.forEach(field => field.style.display = 'none');
                }
            });
            
            // Form submission handler
            const form = document.getElementById('directEditAssetForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    
                    // Debug log untuk melihat data yang dikirim
                    console.log('Data yang akan dikirim untuk update:', data);
                    
                    // Convert numeric fields
                    ['luas_tanah', 'luas_bangunan', 'njop_per_m2', 'kamar_tidur', 
                     'kamar_mandi', 'jumlah_lantai', 'harga_sewa'].forEach(field => {
                        if (data[field]) data[field] = Number(data[field]);
                    });
                    
                    // Ensure asset_name is being sent correctly
                    if (data.asset_name) {
                        console.log('Asset name yang akan diupdate:', data.asset_name);
                    }
                    
                    const response = await fetch(`${this.apiBasePath}/${assetId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify(data),
                        credentials: 'same-origin'
                    });
                    
                    const result = await response.json();
                    console.log('Response dari server:', result);
                    
                    if (result.success) {
                        this.showMessage('Aset berhasil diperbarui', 'success');
                        closeOverlay();
                        
                        // Refresh the asset list
                        if (window.rentalAssetManager && window.rentalAssetManager.loadAvailableAssets) {
                            window.rentalAssetManager.loadAvailableAssets();
                        }
                    } else {
                        this.showMessage('Error: ' + (result.error || 'Unknown error'), 'error');
                    }
                } catch (error) {
                    console.error('Error updating asset:', error);
                    this.showMessage('Error: ' + error.message, 'error');
                }
            });
            
        } catch (error) {
            console.error('Error editing asset:', error);
            this.showMessage('Error loading asset for editing: ' + error.message);
        }
    }
    
    // Delete asset directly with a simple confirmation
    async deleteAsset(assetId, assetName) {
        // Use a simple confirmation dialog instead of a modal
        if (!confirm(`Apakah Anda yakin ingin menghapus aset "${assetName || 'Asset #' + assetId}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBasePath}/${assetId}`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Aset berhasil dihapus', 'success');
                
                // Refresh the asset list
                if (window.rentalAssetManager && window.rentalAssetManager.loadAvailableAssets) {
                    window.rentalAssetManager.loadAvailableAssets();
                }
            } else {
                // Check if it's a constraint error and offer force delete option
                if (result.error && (result.error.includes('rental transaction history') || result.error.includes('rental request history'))) {
                    const forceDelete = confirm(
                        `${result.error}\n\nApakah Anda ingin menghapus aset beserta semua riwayat transaksi dan permintaan sewa? ` +
                        `PERINGATAN: Tindakan ini tidak dapat dibatalkan!`
                    );
                    
                    if (forceDelete) {
                        await this.forceDeleteAsset(assetId, assetName);
                        return;
                    }
                }
                
                this.showMessage('Error: ' + (result.error || 'Failed to delete asset'), 'error');
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
            this.showMessage('Error: ' + error.message, 'error');
        }
    }
    
    // Force delete asset with all related data
    async forceDeleteAsset(assetId, assetName) {
        try {
            const response = await fetch(`${this.apiBasePath}/${assetId}/force-delete`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Aset dan semua data terkait berhasil dihapus', 'success');
                
                // Refresh the asset list
                if (window.rentalAssetManager && window.rentalAssetManager.loadAvailableAssets) {
                    window.rentalAssetManager.loadAvailableAssets();
                }
            } else {
                this.showMessage('Error: ' + (result.error || 'Failed to force delete asset'), 'error');
            }
        } catch (error) {
            console.error('Error force deleting asset:', error);
            this.showMessage('Error: ' + error.message, 'error');
        }
    }
    
    // Show a toast message
    showMessage(message, type = 'info') {
        // Create a toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                toast.style.backgroundColor = '#28a745';
                break;
            case 'error':
                toast.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                toast.style.backgroundColor = '#ffc107';
                toast.style.color = '#212529';
                break;
            default:
                toast.style.backgroundColor = '#17a2b8';
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Remove the toast after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3000);
    }
    
    // Helper functions
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID').format(amount);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new DirectAssetActions();
});
