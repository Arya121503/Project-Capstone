/**
 * Prediction System JavaScript - Terintegrasi dengan Sistem Prediksi Standar
 * ============================================================================
 * 
 * JavaScript untuk menangani prediksi harga sewa tanah dan bangunan
 * yang terintegrasi dengan sistem prediksi backend yang telah distandarisasi.
 * 
 * Fitur:
 * - Prediksi harga sewa tanah
 * - Prediksi harga sewa bangunan  
 * - Status model real-time
 * - Upload dan training model
 * - Validasi form yang komprehensif
 * 
 * Author: System Integration Team
 * Date: August 3, 2025
 */

// Global variables
let modelStatus = {
    tanah: { available: false },
    bangunan: { available: false }
};

// Initialize prediction system when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Prediction System...');
    loadModelStatus();
    setupFormHandlers();
    setupModelUpdateHandlers();
});

/**
 * Load model status from backend
 */
async function loadModelStatus() {
    try {
        console.log('📊 Loading model status...');
        const response = await fetch('/prediction/model_status');
        const data = await response.json();
        
        if (response.ok) {
            modelStatus = data;
            updateModelStatusDisplay();
            console.log('✅ Model status loaded:', modelStatus);
        } else {
            console.error('❌ Failed to load model status:', data.error);
            showErrorMessage('Gagal memuat status model: ' + data.error);
        }
    } catch (error) {
        console.error('❌ Error loading model status:', error);
        showErrorMessage('Gagal memuat status model: ' + error.message);
    }
}

/**
 * Update model status display in UI
 */
function updateModelStatusDisplay() {
    // Update tanah model status
    const tanahStatusEl = document.getElementById('tanahModelStatus');
    if (tanahStatusEl) {
        if (modelStatus.tanah && modelStatus.tanah.available) {
            tanahStatusEl.innerHTML = `
                <div class="text-success">
                    <i class="fas fa-check-circle me-2"></i>Model Tersedia
                </div>
                <small class="text-muted">
                    R² Score: ${modelStatus.tanah.performance.r2_score.toFixed(4)}<br>
                    Timestamp: ${modelStatus.tanah.timestamp}
                </small>
            `;
        } else {
            tanahStatusEl.innerHTML = `
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
    const bangunanStatusEl = document.getElementById('bangunanModelStatus');
    if (bangunanStatusEl) {
        if (modelStatus.bangunan && modelStatus.bangunan.available) {
            bangunanStatusEl.innerHTML = `
                <div class="text-success">
                    <i class="fas fa-check-circle me-2"></i>Model Tersedia
                </div>
                <small class="text-muted">
                    R² Score: ${modelStatus.bangunan.performance.r2_score.toFixed(4)}<br>
                    Timestamp: ${modelStatus.bangunan.timestamp}
                </small>
            `;
        } else {
            bangunanStatusEl.innerHTML = `
                <div class="text-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>Model Tidak Tersedia
                </div>
                <small class="text-muted">
                    Silakan upload data untuk melatih model
                </small>
            `;
        }
    }
    
    // Update prediction result displays if models are not available
    updatePredictionErrorDisplays();
}

/**
 * Update prediction error displays
 */
function updatePredictionErrorDisplays() {
    // Land prediction error
    const landResultEl = document.getElementById('landPredictionResult');
    if (landResultEl && (!modelStatus.tanah || !modelStatus.tanah.available)) {
        landResultEl.innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="fas fa-exclamation-triangle me-2"></i>Error</h5>
                <p class="mb-0">Model tanah tidak ditemukan</p>
            </div>
        `;
        landResultEl.style.display = 'block';
    }
    
    // Building prediction - hide error if model is available
    const buildingResultEl = document.getElementById('buildingPredictionResult');
    if (buildingResultEl && modelStatus.bangunan && modelStatus.bangunan.available) {
        buildingResultEl.style.display = 'none';
    }
}

/**
 * Setup form handlers for prediction forms
 */
function setupFormHandlers() {
    // Land prediction form
    const landForm = document.getElementById('landPredictionForm');
    if (landForm) {
        landForm.addEventListener('submit', handleLandPrediction);
    }
    
    // Building prediction form
    const buildingForm = document.getElementById('buildingPredictionForm');
    if (buildingForm) {
        buildingForm.addEventListener('submit', handleBuildingPrediction);
    }
}

/**
 * Setup model update handlers
 */
function setupModelUpdateHandlers() {
    // Model update form
    const modelUpdateForm = document.getElementById('modelUpdateForm');
    if (modelUpdateForm) {
        modelUpdateForm.addEventListener('submit', handleModelUpdate);
    }
}

/**
 * Handle land price prediction
 */
async function handleLandPrediction(event) {
    event.preventDefault();
    
    // Check if model is available
    if (!modelStatus.tanah || !modelStatus.tanah.available) {
        showPredictionError('landPredictionResult', 'Model tanah tidak tersedia. Silakan upload data untuk melatih model.');
        return;
    }
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Memproses...';
        
        // Hide previous results
        hideElement('landPredictionResult');
        
        // Get form data
        const formData = new FormData(form);
        
        // Validate form
        if (!validateLandForm(formData)) {
            return;
        }
        
        // Make prediction request
        const response = await fetch('/prediction/predict_land_price', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showPredictionSuccess('landPredictionResult', result);
        } else {
            showPredictionError('landPredictionResult', result.error || 'Gagal melakukan prediksi');
        }
        
    } catch (error) {
        console.error('Error in land prediction:', error);
        showPredictionError('landPredictionResult', 'Terjadi kesalahan saat melakukan prediksi');
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

/**
 * Handle building price prediction
 */
async function handleBuildingPrediction(event) {
    event.preventDefault();
    
    // Check if model is available
    if (!modelStatus.bangunan || !modelStatus.bangunan.available) {
        showPredictionError('buildingPredictionResult', 'Model bangunan tidak tersedia. Silakan upload data untuk melatih model.');
        return;
    }
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Memproses...';
        
        // Hide previous results
        hideElement('buildingPredictionResult');
        
        // Get form data
        const formData = new FormData(form);
        
        // Validate form
        if (!validateBuildingForm(formData)) {
            return;
        }
        
        // Make prediction request
        const response = await fetch('/prediction/predict_building_price', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showPredictionSuccess('buildingPredictionResult', result);
        } else {
            showPredictionError('buildingPredictionResult', result.error || 'Gagal melakukan prediksi');
        }
        
    } catch (error) {
        console.error('Error in building prediction:', error);
        showPredictionError('buildingPredictionResult', 'Terjadi kesalahan saat melakukan prediksi');
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

/**
 * Handle model update
 */
async function handleModelUpdate(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        // Check if any files are selected
        const tanahFile = form.querySelector('#tanah_file').files[0];
        const bangunanFile = form.querySelector('#bangunan_file').files[0];
        
        if (!tanahFile && !bangunanFile) {
            showErrorMessage('Silakan pilih minimal satu file untuk diupload');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mengupload...';
        showElement('updateProgress');
        hideElement('updateResult');
        
        // Prepare form data
        const formData = new FormData(form);
        
        // Upload files
        const response = await fetch('/prediction/update_prediction_models', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        // Hide progress
        hideElement('updateProgress');
        
        if (response.ok && result.success) {
            showUpdateSuccess(result);
            // Reload model status
            setTimeout(() => {
                loadModelStatus();
            }, 1000);
        } else {
            showUpdateError(result.error || 'Gagal mengupload file');
        }
        
    } catch (error) {
        console.error('Error updating models:', error);
        hideElement('updateProgress');
        showUpdateError('Terjadi kesalahan saat mengupload file');
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

/**
 * Validate land prediction form
 */
function validateLandForm(formData) {
    const requiredFields = ['kecamatan', 'njop', 'sertifikat', 'luas_tanah', 'jenis_zona', 'aksesibilitas', 'tingkat_keamanan', 'kepadatan_penduduk'];
    
    for (const field of requiredFields) {
        const value = formData.get(field);
        if (!value || value.trim() === '') {
            showErrorMessage(`Field ${field} harus diisi`);
            return false;
        }
    }
    
    // Validate numeric fields
    const numericFields = ['njop', 'luas_tanah', 'kepadatan_penduduk'];
    for (const field of numericFields) {
        const value = parseFloat(formData.get(field));
        if (isNaN(value) || value <= 0) {
            showErrorMessage(`${field} harus berupa angka yang valid dan lebih dari 0`);
            return false;
        }
    }
    
    return true;
}

/**
 * Validate building prediction form
 */
function validateBuildingForm(formData) {
    // Update: Model bangunan hanya memerlukan field berikut (tidak perlu tingkat_keamanan dan kepadatan_penduduk)
    const requiredFields = ['kecamatan', 'njop', 'sertifikat', 'luas_tanah', 'luas_bangunan', 'jumlah_lantai', 'jenis_zona', 'aksesibilitas'];
    
    for (const field of requiredFields) {
        const value = formData.get(field);
        if (!value || value.trim() === '') {
            showErrorMessage(`Field ${field} harus diisi`);
            return false;
        }
    }
    
    // Validate numeric fields (hanya field yang diperlukan)
    const numericFields = ['njop', 'luas_tanah', 'luas_bangunan'];
    for (const field of numericFields) {
        const value = parseFloat(formData.get(field));
        if (isNaN(value) || value <= 0) {
            showErrorMessage(`${field} harus berupa angka yang valid dan lebih dari 0`);
            return false;
        }
    }
    
    // Validate jumlah_lantai
    const jumlahLantai = parseInt(formData.get('jumlah_lantai'));
    if (isNaN(jumlahLantai) || jumlahLantai < 1 || jumlahLantai > 10) {
        showErrorMessage('Jumlah lantai harus antara 1-10');
        return false;
    }
    
    return true;
}

/**
 * Show prediction success result
 */
function showPredictionSuccess(elementId, result) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="alert alert-success">
                <h5><i class="fas fa-check-circle me-2"></i>Hasil Prediksi</h5>
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-2"><strong>Estimasi Harga Sewa per Bulan:</strong></p>
                        <h4 class="text-success">${result.prediction}</h4>
                    </div>
                    <div class="col-md-6">
                        <small class="text-muted">
                            <strong>Informasi Model:</strong><br>
                            Type: ${result.model_info.type}<br>
                            R² Score: ${result.model_info.r2_score.toFixed(4)}<br>
                            Timestamp: ${result.model_info.timestamp}
                        </small>
                    </div>
                </div>
            </div>
        `;
        element.style.display = 'block';
    }
}

/**
 * Show prediction error
 */
function showPredictionError(elementId, errorMessage) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="fas fa-exclamation-triangle me-2"></i>Error</h5>
                <p class="mb-0">${errorMessage}</p>
            </div>
        `;
        element.style.display = 'block';
    }
}

/**
 * Show update success
 */
function showUpdateSuccess(result) {
    const element = document.getElementById('updateResult');
    if (element) {
        let resultHtml = `
            <div class="alert alert-success">
                <h6><i class="fas fa-check-circle me-2"></i>Upload Berhasil</h6>
                <p>${result.message}</p>
        `;
        
        if (result.results.training_instructions) {
            resultHtml += `
                <div class="mt-3">
                    <strong>${result.results.training_instructions.message}</strong>
                    <ol class="mt-2">
                        ${result.results.training_instructions.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            `;
        }
        
        resultHtml += `</div>`;
        element.innerHTML = resultHtml;
        element.style.display = 'block';
    }
}

/**
 * Show update error
 */
function showUpdateError(errorMessage) {
    const element = document.getElementById('updateResult');
    if (element) {
        element.innerHTML = `
            <div class="alert alert-danger">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>Error</h6>
                <p class="mb-0">${errorMessage}</p>
            </div>
        `;
        element.style.display = 'block';
    }
}

/**
 * Utility functions
 */
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function showErrorMessage(message) {
    // You can customize this to use your preferred notification system
    alert(message);
}

/**
 * Functions that can be called from HTML (for backward compatibility)
 */
window.predictLandPrice = function() {
    const form = document.getElementById('landPredictionForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
};

window.predictBuildingPrice = function() {
    const form = document.getElementById('buildingPredictionForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
};

window.updateModels = function() {
    const form = document.getElementById('modelUpdateForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
};

// ============================================================================
// FASE 2: JUAL PREDICTION AUTO-UPLOAD & TRAINING
// ============================================================================

/**
 * Setup handlers for jual model update form
 */
function setupJualModelUpdateHandlers() {
    const jualModelUpdateForm = document.getElementById('jualModelUpdateForm');
    if (jualModelUpdateForm) {
        jualModelUpdateForm.addEventListener('submit', handleJualModelUpdate);
        console.log('✅ Jual model update form handler initialized');
    }
}

/**
 * Handle jual model update (upload & auto-train ensemble models)
 */
async function handleJualModelUpdate(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        // Check if any files are selected
        const jualTanahFile = form.querySelector('#jual_tanah_file').files[0];
        const jualBangunanFile = form.querySelector('#jual_bangunan_file').files[0];
        
        if (!jualTanahFile && !jualBangunanFile) {
            alert('Silakan pilih minimal satu file untuk diupload');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mengupload & Training...';
        showElement('jualUpdateProgress');
        hideElement('jualUpdateResult');
        
        // Prepare form data
        const formData = new FormData(form);
        
        // Upload files and trigger auto-training
        console.log('📤 Uploading jual dataset and starting auto-training...');
        const response = await fetch('/jual-prediction/upload-dataset', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        // Hide progress
        hideElement('jualUpdateProgress');
        
        if (response.ok && result.success) {
            showJualUpdateSuccess(result);
            
            // Clear file inputs
            form.querySelector('#jual_tanah_file').value = '';
            form.querySelector('#jual_bangunan_file').value = '';
        } else {
            showJualUpdateError(result.error || result.message || 'Gagal mengupload file atau training model');
        }
        
    } catch (error) {
        console.error('Error updating jual models:', error);
        hideElement('jualUpdateProgress');
        showJualUpdateError('Terjadi kesalahan saat mengupload file atau training model');
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

/**
 * Show jual model update success message
 */
function showJualUpdateSuccess(result) {
    const resultDiv = document.getElementById('jualUpdateResult');
    const contentDiv = document.getElementById('jualUpdateResultContent');
    
    if (!resultDiv || !contentDiv) return;
    
    let html = '<div class="mb-3">';
    html += '<p class="fw-bold text-success mb-2">✅ Ensemble models berhasil dilatih!</p>';
    
    // Show training results
    if (result.results && result.results.training && result.results.training.models_trained) {
        html += '<hr class="my-3">';
        html += '<h6 class="mb-2">📊 Model Performance:</h6>';
        
        result.results.training.models_trained.forEach(model => {
            const perf = model.performance;
            const info = model.data_info;
            
            html += `
                <div class="card bg-light mb-2">
                    <div class="card-body p-3">
                        <h6 class="text-primary mb-2">
                            <i class="fas fa-${model.model_type === 'jual_tanah' ? 'map' : 'building'} me-2"></i>
                            ${model.model_type === 'jual_tanah' ? 'Jual Tanah' : 'Jual Bangunan'}
                        </h6>
                        <div class="row g-2">
                            <div class="col-md-3">
                                <small class="text-muted d-block">Voting R²:</small>
                                <strong class="text-success">${perf.voting_r2.toFixed(4)}</strong>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted d-block">XGBoost R²:</small>
                                <strong>${perf.xgboost_r2.toFixed(4)}</strong>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted d-block">Random Forest R²:</small>
                                <strong>${perf.random_forest_r2.toFixed(4)}</strong>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted d-block">CatBoost R²:</small>
                                <strong>${perf.catboost_r2.toFixed(4)}</strong>
                            </div>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">
                                <i class="fas fa-database me-1"></i>${info.total_samples} samples
                                | <i class="fas fa-chart-line me-1"></i>MAPE: ${perf.voting_mape.toFixed(4)}
                            </small>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    html += `<p class="text-muted mb-0"><i class="fas fa-clock me-1"></i>Timestamp: ${result.results.training.timestamp}</p>`;
    
    contentDiv.innerHTML = html;
    resultDiv.className = 'alert alert-success mt-4';
    showElement('jualUpdateResult');
}

/**
 * Show jual model update error message
 */
function showJualUpdateError(errorMessage) {
    const resultDiv = document.getElementById('jualUpdateResult');
    const contentDiv = document.getElementById('jualUpdateResultContent');
    
    if (!resultDiv || !contentDiv) return;
    
    contentDiv.innerHTML = `
        <p class="mb-0">
            <i class="fas fa-exclamation-circle me-2"></i>${errorMessage}
        </p>
    `;
    resultDiv.className = 'alert alert-danger mt-4';
    showElement('jualUpdateResult');
}

// Call setup function when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupJualModelUpdateHandlers();
});

// Export functions for use in other modules
window.PredictionSystem = {
    loadModelStatus,
    updateModelStatusDisplay,
    handleLandPrediction,
    handleBuildingPrediction,
    handleModelUpdate,
    handleJualModelUpdate  // Add new function
};

console.log('✅ Prediction System JavaScript loaded successfully!');

