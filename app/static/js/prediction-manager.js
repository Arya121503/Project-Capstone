/**
 * Prediction Feature JavaScript Handler
 * Handles land prediction, building prediction, and model update forms
 */

class PredictionManager {
    constructor() {
        this.initializeForms();
        this.loadModelStatus();
        this.checkBackendStatus();
    }

    async checkBackendStatus() {
        try {
            const response = await fetch('/prediction/get_prediction_stats');
            if (!response.ok) {
                console.warn('Backend prediction service may not be available');
            }
        } catch (error) {
            console.warn('Cannot connect to prediction backend:', error);
        }
    }

    initializeForms() {
        // Land prediction form handler
        const landForm = document.getElementById('landPredictionForm');
        if (landForm) {
            landForm.addEventListener('submit', (e) => this.handleLandPrediction(e));
        }

        // Building prediction form handler
        const buildingForm = document.getElementById('buildingPredictionForm');
        if (buildingForm) {
            buildingForm.addEventListener('submit', (e) => this.handleBuildingPrediction(e));
        }

        // Model update form handler
        const updateForm = document.getElementById('modelUpdateForm');
        if (updateForm) {
            updateForm.addEventListener('submit', (e) => this.handleModelUpdate(e));
        }
    }

    async handleLandPrediction(event) {
        event.preventDefault();
        
        const form = event.target;
        const resultDiv = document.getElementById('landPredictionResult');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        try {
            // Show loading state
            this.showLoadingState(resultDiv, submitBtn);
            
            // Collect form data
            const formData = new FormData(form);
            
            // Validate required fields
            if (!this.validateLandForm(formData)) {
                throw new Error('Mohon lengkapi semua field yang diperlukan');
            }
            
            // Make API request with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch('/prediction/predict_land_price', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccessResult(resultDiv, data.prediction, 'Tanah');
                // Update the specific result value element
                const valueElement = document.getElementById('landPredictionValue');
                if (valueElement) {
                    valueElement.textContent = data.prediction;
                }
            } else {
                throw new Error(data.error || 'Gagal melakukan prediksi');
            }
            
        } catch (error) {
            console.error('Land prediction error:', error);
            
            let errorMessage = 'Terjadi kesalahan saat melakukan prediksi';
            
            if (error.name === 'AbortError') {
                errorMessage = 'Request timeout - Coba lagi dalam beberapa saat';
            } else if (error.message.includes('HTTP Error')) {
                errorMessage = 'Server error - Periksa koneksi dan coba lagi';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Tidak dapat terhubung ke server - Periksa koneksi internet';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.showErrorResult(resultDiv, errorMessage);
        } finally {
            // Always reset button state
            this.resetButtonState(submitBtn);
        }
    }

    async handleBuildingPrediction(event) {
        event.preventDefault();
        
        const form = event.target;
        const resultDiv = document.getElementById('buildingPredictionResult');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        try {
            // Show loading state
            this.showLoadingState(resultDiv, submitBtn);
            
            // Collect form data
            const formData = new FormData(form);
            
            // Validate required fields
            if (!this.validateBuildingForm(formData)) {
                throw new Error('Mohon lengkapi semua field yang diperlukan');
            }
            
            // Make API request with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch('/prediction/predict_building_price', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccessResult(resultDiv, data.prediction, 'Bangunan');
                // Update the specific result value element
                const valueElement = document.getElementById('buildingPredictionValue');
                if (valueElement) {
                    valueElement.textContent = data.prediction;
                }
            } else {
                throw new Error(data.error || 'Gagal melakukan prediksi');
            }
            
        } catch (error) {
            console.error('Building prediction error:', error);
            
            let errorMessage = 'Terjadi kesalahan saat melakukan prediksi';
            
            if (error.name === 'AbortError') {
                errorMessage = 'Request timeout - Coba lagi dalam beberapa saat';
            } else if (error.message.includes('HTTP Error')) {
                errorMessage = 'Server error - Periksa koneksi dan coba lagi';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Tidak dapat terhubung ke server - Periksa koneksi internet';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.showErrorResult(resultDiv, errorMessage);
        } finally {
            // Always reset button state
            this.resetButtonState(submitBtn);
        }
    }

    async handleModelUpdate(event) {
        event.preventDefault();
        
        const form = event.target;
        const progressDiv = document.getElementById('updateProgress');
        const resultDiv = document.getElementById('updateResult');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        try {
            // Check if at least one file is selected
            const tanahFile = form.querySelector('#tanah_file').files[0];
            const bangunanFile = form.querySelector('#bangunan_file').files[0];
            
            if (!tanahFile && !bangunanFile) {
                throw new Error('Mohon pilih minimal satu file untuk diupload');
            }
            
            // Show progress
            this.showUpdateProgress(progressDiv, resultDiv);
            submitBtn.disabled = true;
            
            // Prepare form data
            const formData = new FormData(form);
            
            // Make API request
            const response = await fetch('/prediction/update_prediction_models', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success || (data.tanah && !data.tanah.error) || (data.bangunan && !data.bangunan.error)) {
                this.showUpdateSuccess(progressDiv, resultDiv, data);
                // Refresh model status
                setTimeout(() => this.loadModelStatus(), 1000);
            } else {
                throw new Error('Gagal memperbarui model');
            }
            
        } catch (error) {
            this.showUpdateError(progressDiv, resultDiv, error.message);
        } finally {
            submitBtn.disabled = false;
        }
    }

    validateLandForm(formData) {
        const required = ['kecamatan', 'njop', 'sertifikat', 'luas_tanah', 'jenis_zona', 'aksesibilitas', 'tingkat_keamanan', 'kepadatan_penduduk'];
        
        console.log('Validating land form with data:', Object.fromEntries(formData.entries()));
        
        for (const field of required) {
            const value = formData.get(field);
            console.log(`Field ${field}:`, value);
            
            if (!value || value.trim() === '') {
                console.error(`Field ${field} is empty or missing`);
                return false;
            }
            
            // Additional validation for numeric fields
            if (['njop', 'luas_tanah', 'kepadatan_penduduk'].includes(field)) {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue <= 0) {
                    console.error(`Field ${field} has invalid numeric value:`, value);
                    return false;
                }
            }
        }
        
        console.log('Land form validation passed');
        return true;
    }

    validateBuildingForm(formData) {
        // Field yang diperlukan untuk prediksi bangunan (tidak termasuk tingkat_keamanan dan kepadatan_penduduk)
        const required = ['kecamatan', 'njop', 'sertifikat', 'luas_tanah', 'luas_bangunan', 'jumlah_lantai', 'jenis_zona', 'aksesibilitas'];
        
        for (const field of required) {
            const value = formData.get(field);
            if (!value || value.trim() === '') {
                console.log(`Field ${field} is empty or missing`);
                return false;
            }
            // Additional validation for numeric fields
            if (['njop', 'luas_tanah', 'luas_bangunan'].includes(field)) {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue <= 0) {
                    console.log(`Field ${field} has invalid numeric value: ${value}`);
                    return false;
                }
            }
            // Special validation for jumlah_lantai
            if (field === 'jumlah_lantai') {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 1 || numValue > 10) {
                    console.log(`Field ${field} has invalid value: ${value}`);
                    return false;
                }
            }
        }
        return true;
    }

    showLoadingState(resultDiv, submitBtn) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="alert alert-info">
                <h5><i class="fas fa-spinner fa-spin me-2"></i>Memproses Prediksi</h5>
                <p class="mb-0">Mohon tunggu, sedang menghitung prediksi harga...</p>
            </div>
        `;
        
        if (submitBtn) {
            submitBtn.disabled = true;
            // Store original text to restore later if not already stored
            if (!submitBtn.dataset.originalText) {
                submitBtn.dataset.originalText = submitBtn.innerHTML;
            }
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Memproses...';
        }
    }

    showSuccessResult(resultDiv, prediction, type) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="alert alert-success">
                <h5><i class="fas fa-chart-line me-2"></i>Hasil Prediksi ${type}</h5>
                <p class="mb-0">Estimasi harga sewa per bulan: <strong>${prediction}</strong></p>
            </div>
        `;
    }

    showErrorResult(resultDiv, message) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="fas fa-exclamation-triangle me-2"></i>Error</h5>
                <p class="mb-0">${message}</p>
            </div>
        `;
    }

    resetButtonState(submitBtn) {
        if (submitBtn) {
            submitBtn.disabled = false;
            
            // Restore original text if available
            if (submitBtn.dataset.originalText) {
                submitBtn.innerHTML = submitBtn.dataset.originalText;
            } else {
                // Fallback to default texts
                if (submitBtn.closest('#landPredictionForm')) {
                    submitBtn.innerHTML = '<i class="fas fa-calculator me-2"></i>Prediksi Harga Sewa Tanah';
                } else if (submitBtn.closest('#buildingPredictionForm')) {
                    submitBtn.innerHTML = '<i class="fas fa-calculator me-2"></i>Prediksi Harga Sewa Bangunan';
                }
            }
        }
    }

    showUpdateProgress(progressDiv, resultDiv) {
        progressDiv.style.display = 'block';
        resultDiv.style.display = 'none';
    }

    showUpdateSuccess(progressDiv, resultDiv, data) {
        progressDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        
        let content = '<h6><i class="fas fa-check-circle me-2"></i>Update Berhasil</h6>';
        
        if (data.tanah && !data.tanah.error) {
            content += `<p class="mb-1"><strong>Model Tanah:</strong> ${data.tanah.message || 'Berhasil diperbarui'}</p>`;
        }
        
        if (data.bangunan && !data.bangunan.error) {
            content += `<p class="mb-1"><strong>Model Bangunan:</strong> ${data.bangunan.message || 'Berhasil diperbarui'}</p>`;
        }
        
        document.getElementById('updateResultContent').innerHTML = content;
    }

    showUpdateError(progressDiv, resultDiv, message) {
        progressDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.className = 'mt-4 alert alert-danger';
        
        document.getElementById('updateResultContent').innerHTML = `
            <h6><i class="fas fa-exclamation-triangle me-2"></i>Error Update Model</h6>
            <p class="mb-0">${message}</p>
        `;
    }

    async loadModelStatus() {
        try {
            const response = await fetch('/prediction/get_prediction_stats');
            const data = await response.json();
            
            if (data.success && data.stats) {
                this.updateModelStatusDisplay(data.stats);
            }
        } catch (error) {
            console.error('Failed to load model status:', error);
            this.showModelStatusError();
        }
    }

    updateModelStatusDisplay(stats) {
        // Update tanah model status
        const tanahStatus = document.getElementById('tanahModelStatus');
        if (tanahStatus) {
            if (stats.tanah && stats.tanah.available) {
                tanahStatus.innerHTML = `
                    <div class="text-success">
                        <i class="fas fa-check-circle me-2"></i>Model Tersedia
                    </div>
                    <small class="text-muted">
                        Terakhir diperbarui: ${this.formatTimestamp(stats.tanah.last_updated)}
                    </small>
                `;
            } else {
                tanahStatus.innerHTML = `
                    <div class="text-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>Model Tidak Tersedia
                    </div>
                    <small class="text-muted">
                        Silakan upload data untuk melatih model
                    </small>
                `;
            }
        }

        // Update bangunan model status
        const bangunanStatus = document.getElementById('bangunanModelStatus');
        if (bangunanStatus) {
            if (stats.bangunan && stats.bangunan.available) {
                bangunanStatus.innerHTML = `
                    <div class="text-success">
                        <i class="fas fa-check-circle me-2"></i>Model Tersedia
                    </div>
                    <small class="text-muted">
                        Terakhir diperbarui: ${this.formatTimestamp(stats.bangunan.last_updated)}
                    </small>
                `;
            } else {
                bangunanStatus.innerHTML = `
                    <div class="text-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>Model Tidak Tersedia
                    </div>
                    <small class="text-muted">
                        Silakan upload data untuk melatih model
                    </small>
                `;
            }
        }
    }

    showModelStatusError() {
        const tanahStatus = document.getElementById('tanahModelStatus');
        const bangunanStatus = document.getElementById('bangunanModelStatus');
        
        const errorHtml = `
            <div class="text-danger">
                <i class="fas fa-times-circle me-2"></i>Error
            </div>
            <small class="text-muted">Gagal memuat status model</small>
        `;
        
        if (tanahStatus) tanahStatus.innerHTML = errorHtml;
        if (bangunanStatus) bangunanStatus.innerHTML = errorHtml;
    }

    formatTimestamp(timestamp) {
        if (!timestamp || timestamp === 'Unknown') return 'Tidak diketahui';
        
        try {
            // Handle timestamp format from filename (YYYYMMDD_HHMMSS)
            if (typeof timestamp === 'string' && timestamp.includes('_')) {
                const [datePart, timePart] = timestamp.split('_');
                
                if (datePart.length === 8 && timePart.length === 6) {
                    const year = datePart.substr(0, 4);
                    const month = datePart.substr(4, 2);
                    const day = datePart.substr(6, 2);
                    const hour = timePart.substr(0, 2);
                    const minute = timePart.substr(2, 2);
                    
                    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
                    
                    return date.toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            }
            
            // Handle regular date string
            const date = new Date(timestamp);
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Format tanggal tidak valid';
        }
    }

    showAlertMessage(element, type, message) {
        const card = element.closest('.card-body');
        if (!card) return;
        
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const iconClass = type === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle';
        
        const alert = document.createElement('div');
        alert.className = `alert ${alertClass} alert-dismissible fade show mt-2`;
        alert.innerHTML = `
            <i class="${iconClass} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        card.appendChild(alert);
        
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new PredictionManager();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PredictionManager;
}
