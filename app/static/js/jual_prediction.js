/**
 * Prediksi Harga Jual Tanah dan Bangunan
 * JavaScript untuk form prediksi menggunakan machine learning
 */

// Global variables
let validValues = {};

// Load valid values for dropdowns on page load
document.addEventListener('DOMContentLoaded', function() {
    loadValidValues();
});

/**
 * Load valid values from API for dropdown population
 */
async function loadValidValues() {
    try {
        const response = await fetch('/jual-prediction/valid-values');
        const data = await response.json();
        
        if (data.success) {
            validValues = data.valid_values;
            console.log('✅ Valid values loaded:', validValues);
            populateDropdowns();
        }
    } catch (error) {
        console.error('❌ Error loading valid values:', error);
    }
}

/**
 * Populate dropdowns with valid values
 */
function populateDropdowns() {
    // Populate Tanah dropdowns
    if (validValues.tanah) {
        populateSelect('prediksi_jual_tanah_kecamatan', validValues.tanah.Kecamatan);
        populateSelect('prediksi_jual_tanah_sertifikat', validValues.tanah.Sertifikat);
        populateSelect('prediksi_jual_tanah_zona', validValues.tanah['Jenis Zona']);
        populateSelect('prediksi_jual_tanah_aksesibilitas', validValues.tanah.Aksesibilitas);
        populateSelect('prediksi_jual_tanah_keamanan', validValues.tanah['Tingkat Keamanan']);
    }
    
    // Populate Bangunan dropdowns
    if (validValues.bangunan) {
        populateSelect('prediksi_jual_bangunan_kecamatan', validValues.bangunan.Kecamatan);
        populateSelect('prediksi_jual_bangunan_sertifikat', validValues.bangunan.Sertifikat);
        populateSelect('prediksi_jual_bangunan_zona', validValues.bangunan['Jenis Zona']);
        populateSelect('prediksi_jual_bangunan_kondisi', validValues.bangunan['Kondisi Bangunan']);
        populateSelect('prediksi_jual_bangunan_aksesibilitas', validValues.bangunan.Aksesibilitas);
        populateSelect('prediksi_jual_bangunan_keamanan', validValues.bangunan['Tingkat Keamanan']);
    }
}

/**
 * Helper function to populate select element
 */
function populateSelect(elementId, values) {
    const select = document.getElementById(elementId);
    if (!select || !values) return;
    
    // Clear existing options except the first (placeholder)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add new options
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

/**
 * Predict harga jual tanah
 */
async function predictJualTanah() {
    try {
        // Get form values
        const kecamatan = document.getElementById('prediksi_jual_tanah_kecamatan').value;
        const sertifikat = document.getElementById('prediksi_jual_tanah_sertifikat').value;
        const luas_tanah = document.getElementById('prediksi_jual_tanah_luas').value;
        const jenis_zona = document.getElementById('prediksi_jual_tanah_zona').value;
        const aksesibilitas = document.getElementById('prediksi_jual_tanah_aksesibilitas').value;
        const tingkat_keamanan = document.getElementById('prediksi_jual_tanah_keamanan').value;
        const kepadatan_penduduk = document.getElementById('prediksi_jual_tanah_kepadatan').value;
        const jarak_ke_pusat = document.getElementById('prediksi_jual_tanah_jarak').value;
        
        // Validate inputs
        if (!kecamatan || !sertifikat || !luas_tanah || !jenis_zona || 
            !aksesibilitas || !tingkat_keamanan || !kepadatan_penduduk || !jarak_ke_pusat) {
            alert('Mohon lengkapi semua field!');
            return;
        }
        
        // Show loading
        const resultDiv = document.getElementById('prediksi_jual_tanah_result');
        resultDiv.innerHTML = '<div class="alert alert-info"><i class="fas fa-spinner fa-spin"></i> Menghitung prediksi...</div>';
        
        // Prepare request data
        const requestData = {
            kecamatan: kecamatan,
            sertifikat: sertifikat,
            luas_tanah: parseFloat(luas_tanah),
            jenis_zona: jenis_zona,
            aksesibilitas: aksesibilitas,
            tingkat_keamanan: tingkat_keamanan,
            kepadatan_penduduk: parseInt(kepadatan_penduduk),
            jarak_ke_pusat: parseFloat(jarak_ke_pusat)
        };
        
        // Make prediction request
        const response = await fetch('/jual-prediction/predict-tanah', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayTanahResult(data);
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> Error: ${data.error}</div>`;
        }
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('prediksi_jual_tanah_result').innerHTML = 
            `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> Terjadi kesalahan: ${error.message}</div>`;
    }
}

/**
 * Display tanah prediction result
 */
function displayTanahResult(data) {
    const resultDiv = document.getElementById('prediksi_jual_tanah_result');
    
    // Calculate price per m²
    const pricePerSqm = Math.round(data.all_predictions.ensemble / data.input_data.luas_tanah);
    
    // Determine confidence level styling
    let confidenceBadge = 'success';
    let reliabilityText = 'Tinggi';
    let recommendationText = 'Harga ini dapat digunakan sebagai acuan utama untuk keputusan bisnis.';
    
    if (data.confidence < 80) {
        confidenceBadge = 'warning';
        reliabilityText = 'Sedang';
        recommendationText = 'Disarankan untuk melakukan evaluasi tambahan sebelum mengambil keputusan.';
    }
    if (data.confidence < 70) {
        confidenceBadge = 'danger';
        reliabilityText = 'Rendah';
        recommendationText = 'Perlu survey pasar dan penilaian ahli sebelum menetapkan harga.';
    }
    
    const resultHTML = `
        <div class="card shadow-sm border-0">
            <div class="card-header bg-gradient text-white" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>Hasil Analisis Harga Jual Tanah</h5>
                    <span class="badge bg-white text-primary">Machine Learning Analysis</span>
                </div>
            </div>
            <div class="card-body p-4">
                <!-- Main Price Display -->
                <div class="text-center py-4 mb-4" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 10px;">
                    <p class="text-muted mb-2">Estimasi Harga Jual</p>
                    <h2 class="text-primary mb-2" style="font-size: 2.5rem; font-weight: 700;">
                        ${data.formatted_prediction}
                    </h2>
                    <p class="text-muted mb-0">
                        <i class="fas fa-calculator me-1"></i>
                        Rp ${pricePerSqm.toLocaleString('id-ID')} per m²
                    </p>
                </div>

                <!-- Confidence & Reliability -->
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <div class="card border-0 h-100" style="background-color: #f8f9fa;">
                            <div class="card-body">
                                <h6 class="text-muted mb-3"><i class="fas fa-shield-alt me-2"></i>Tingkat Kepercayaan</h6>
                                <div class="d-flex align-items-center mb-2">
                                    <div class="progress flex-grow-1 me-3" style="height: 25px;">
                                        <div class="progress-bar bg-${confidenceBadge}" role="progressbar" 
                                             style="width: ${data.confidence}%;" 
                                             aria-valuenow="${data.confidence}" aria-valuemin="0" aria-valuemax="100">
                                            ${data.confidence}%
                                        </div>
                                    </div>
                                    <span class="badge bg-${confidenceBadge}">${reliabilityText}</span>
                                </div>
                                <small class="text-muted">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Variasi: ${data.cv_percentage}%
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-0 h-100" style="background-color: #f8f9fa;">
                            <div class="card-body">
                                <h6 class="text-muted mb-3"><i class="fas fa-lightbulb me-2"></i>Rekomendasi</h6>
                                <p class="mb-0 small">${recommendationText}</p>
                                <small class="text-muted">
                                    <i class="fas fa-robot me-1"></i>
                                    Algoritma: Ensemble Learning (3 Model)
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Details Summary -->
                <div class="card border-0" style="background-color: #f8f9fa;">
                    <div class="card-body">
                        <h6 class="text-muted mb-3"><i class="fas fa-map-marker-alt me-2"></i>Ringkasan Properti</h6>
                        <div class="row g-3">
                            <div class="col-md-3 col-6">
                                <div class="text-center">
                                    <i class="fas fa-location-dot text-primary mb-2" style="font-size: 1.5rem;"></i>
                                    <p class="mb-0 small text-muted">Lokasi</p>
                                    <strong>${data.input_data.kecamatan}</strong>
                                </div>
                            </div>
                            <div class="col-md-3 col-6">
                                <div class="text-center">
                                    <i class="fas fa-file-contract text-success mb-2" style="font-size: 1.5rem;"></i>
                                    <p class="mb-0 small text-muted">Sertifikat</p>
                                    <strong>${data.input_data.sertifikat}</strong>
                                </div>
                            </div>
                            <div class="col-md-3 col-6">
                                <div class="text-center">
                                    <i class="fas fa-ruler-combined text-warning mb-2" style="font-size: 1.5rem;"></i>
                                    <p class="mb-0 small text-muted">Luas Tanah</p>
                                    <strong>${data.input_data.luas_tanah} m²</strong>
                                </div>
                            </div>
                            <div class="col-md-3 col-6">
                                <div class="text-center">
                                    <i class="fas fa-building text-info mb-2" style="font-size: 1.5rem;"></i>
                                    <p class="mb-0 small text-muted">Zona</p>
                                    <strong>${data.input_data.jenis_zona}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Additional Details (Collapsible) -->
                        <div class="mt-3">
                            <a class="btn btn-sm btn-outline-secondary w-100" data-bs-toggle="collapse" href="#detailsCollapse" role="button" aria-expanded="false">
                                <i class="fas fa-chevron-down me-2"></i>Lihat Detail Lengkap
                            </a>
                            <div class="collapse mt-3" id="detailsCollapse">
                                <div class="row g-2">
                                    <div class="col-md-6">
                                        <small class="text-muted d-block">Aksesibilitas:</small>
                                        <strong>${data.input_data.aksesibilitas}</strong>
                                    </div>
                                    <div class="col-md-6">
                                        <small class="text-muted d-block">Tingkat Keamanan:</small>
                                        <strong class="text-capitalize">${data.input_data.tingkat_keamanan}</strong>
                                    </div>
                                    <div class="col-md-6">
                                        <small class="text-muted d-block">Kepadatan Penduduk:</small>
                                        <strong>${data.input_data.kepadatan_penduduk.toLocaleString('id-ID')} jiwa/km²</strong>
                                    </div>
                                    <div class="col-md-6">
                                        <small class="text-muted d-block">Jarak ke Pusat Kota:</small>
                                        <strong>${data.input_data.jarak_ke_pusat} km</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="text-center mt-4">
                    <button class="btn btn-primary" onclick="predictJualTanah()">
                        <i class="fas fa-redo me-2"></i>Prediksi Baru
                    </button>
                </div>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = resultHTML;
}

/**
 * Predict harga jual bangunan
 */
async function predictJualBangunan() {
    try {
        // Get form values
        const kecamatan = document.getElementById('prediksi_jual_bangunan_kecamatan').value;
        const sertifikat = document.getElementById('prediksi_jual_bangunan_sertifikat').value;
        const luas_tanah = document.getElementById('prediksi_jual_bangunan_luas_tanah').value;
        const luas_bangunan = document.getElementById('prediksi_jual_bangunan_luas_bangunan').value;
        const jenis_zona = document.getElementById('prediksi_jual_bangunan_zona').value;
        const kondisi_bangunan = document.getElementById('prediksi_jual_bangunan_kondisi').value;
        const jumlah_lantai = document.getElementById('prediksi_jual_bangunan_lantai').value;
        const tahun_dibangun = document.getElementById('prediksi_jual_bangunan_tahun').value;
        const aksesibilitas = document.getElementById('prediksi_jual_bangunan_aksesibilitas').value;
        const tingkat_keamanan = document.getElementById('prediksi_jual_bangunan_keamanan').value;
        const kepadatan_penduduk = document.getElementById('prediksi_jual_bangunan_kepadatan').value;
        const jarak_ke_pusat = document.getElementById('prediksi_jual_bangunan_jarak').value;
        
        // Validate inputs
        if (!kecamatan || !sertifikat || !luas_tanah || !luas_bangunan || !jenis_zona || 
            !kondisi_bangunan || !jumlah_lantai || !tahun_dibangun || !aksesibilitas || 
            !tingkat_keamanan || !kepadatan_penduduk || !jarak_ke_pusat) {
            alert('Mohon lengkapi semua field!');
            return;
        }
        
        // Show loading
        const resultDiv = document.getElementById('prediksi_jual_bangunan_result');
        resultDiv.innerHTML = '<div class="alert alert-info"><i class="fas fa-spinner fa-spin"></i> Menghitung prediksi...</div>';
        
        // Prepare request data
        const requestData = {
            kecamatan: kecamatan,
            sertifikat: sertifikat,
            luas_tanah: parseFloat(luas_tanah),
            luas_bangunan: parseFloat(luas_bangunan),
            jenis_zona: jenis_zona,
            kondisi_bangunan: kondisi_bangunan,
            jumlah_lantai: parseInt(jumlah_lantai),
            tahun_dibangun: parseInt(tahun_dibangun),
            aksesibilitas: aksesibilitas,
            tingkat_keamanan: tingkat_keamanan,
            kepadatan_penduduk: parseInt(kepadatan_penduduk),
            jarak_ke_pusat: parseFloat(jarak_ke_pusat)
        };
        
        // Make prediction request
        const response = await fetch('/jual-prediction/predict-bangunan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayBangunanResult(data);
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> Error: ${data.error}</div>`;
        }
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('prediksi_jual_bangunan_result').innerHTML = 
            `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> Terjadi kesalahan: ${error.message}</div>`;
    }
}

/**
 * Display bangunan prediction result - Professional business format
 */
function displayBangunanResult(data) {
    const resultDiv = document.getElementById('prediksi_jual_bangunan_result');
    
    // Calculate price per m² for building
    const pricePerSqmBuilding = Math.round(data.all_predictions.ensemble / data.input_data.luas_bangunan);
    const pricePerSqmLand = Math.round(data.all_predictions.ensemble / data.input_data.luas_tanah);
    
    // Calculate building age
    const currentYear = new Date().getFullYear();
    const buildingAge = currentYear - data.input_data.tahun_dibangun;
    
    // Determine confidence level styling
    let confidenceBadge = 'success';
    let reliabilityText = 'Tinggi';
    let recommendationText = 'Harga ini dapat digunakan sebagai acuan utama untuk keputusan bisnis.';
    
    if (data.confidence < 80) {
        confidenceBadge = 'warning';
        reliabilityText = 'Sedang';
        recommendationText = 'Disarankan untuk melakukan evaluasi tambahan sebelum mengambil keputusan.';
    }
    if (data.confidence < 70) {
        confidenceBadge = 'danger';
        reliabilityText = 'Rendah';
        recommendationText = 'Perlu survey pasar dan penilaian ahli sebelum menetapkan harga.';
    }
    
    const resultHTML = `
        <div class="card shadow-sm border-0">
            <div class="card-header bg-gradient text-white" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="fas fa-building me-2"></i>Hasil Analisis Harga Jual Bangunan</h5>
                    <span class="badge bg-white text-danger">Machine Learning Analysis</span>
                </div>
            </div>
            <div class="card-body p-4">
                <!-- Main Price Display -->
                <div class="text-center py-4 mb-4" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 10px;">
                    <p class="text-muted mb-2">Estimasi Harga Jual</p>
                    <h2 class="text-danger mb-2" style="font-size: 2.5rem; font-weight: 700;">
                        ${data.formatted_prediction}
                    </h2>
                    <div class="d-flex justify-content-center gap-4">
                        <p class="text-muted mb-0">
                            <i class="fas fa-home me-1"></i>
                            Rp ${pricePerSqmBuilding.toLocaleString('id-ID')} per m² bangunan
                        </p>
                        <p class="text-muted mb-0">
                            <i class="fas fa-map me-1"></i>
                            Rp ${pricePerSqmLand.toLocaleString('id-ID')} per m² tanah
                        </p>
                    </div>
                </div>

                <!-- Confidence & Reliability -->
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <div class="card border-0 h-100" style="background-color: #fff5f5;">
                            <div class="card-body">
                                <h6 class="text-muted mb-3"><i class="fas fa-shield-alt me-2"></i>Tingkat Kepercayaan</h6>
                                <div class="d-flex align-items-center mb-2">
                                    <div class="progress flex-grow-1 me-3" style="height: 25px;">
                                        <div class="progress-bar bg-${confidenceBadge}" role="progressbar" 
                                             style="width: ${data.confidence}%;" 
                                             aria-valuenow="${data.confidence}" aria-valuemin="0" aria-valuemax="100">
                                            ${data.confidence}%
                                        </div>
                                    </div>
                                    <span class="badge bg-${confidenceBadge}">${reliabilityText}</span>
                                </div>
                                <small class="text-muted">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Variasi: ${data.cv_percentage}%
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-0 h-100" style="background-color: #fff5f5;">
                            <div class="card-body">
                                <h6 class="text-muted mb-3"><i class="fas fa-lightbulb me-2"></i>Rekomendasi</h6>
                                <p class="mb-0 small">${recommendationText}</p>
                                <small class="text-muted">
                                    <i class="fas fa-robot me-1"></i>
                                    Algoritma: Ensemble Learning (3 Model)
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Details Summary -->
                <div class="card border-0" style="background-color: #fff5f5;">
                    <div class="card-body">
                        <h6 class="text-muted mb-3"><i class="fas fa-building me-2"></i>Ringkasan Properti</h6>
                        <div class="row g-3">
                            <div class="col-md-2 col-6">
                                <div class="text-center">
                                    <i class="fas fa-location-dot text-danger mb-2" style="font-size: 1.5rem;"></i>
                                    <p class="mb-0 small text-muted">Lokasi</p>
                                    <strong>${data.input_data.kecamatan}</strong>
                                </div>
                            </div>
                            <div class="col-md-2 col-6">
                                <div class="text-center">
                                    <i class="fas fa-file-contract text-success mb-2" style="font-size: 1.5rem;"></i>
                                    <p class="mb-0 small text-muted">Sertifikat</p>
                                    <strong>${data.input_data.sertifikat}</strong>
                                </div>
                            </div>
                            <div class="col-md-2 col-6">
                                <div class="text-center">
                                    <i class="fas fa-layer-group text-warning mb-2" style="font-size: 1.5rem;"></i>
                                    <p class="mb-0 small text-muted">Lantai</p>
                                    <strong>${data.input_data.jumlah_lantai} Lantai</strong>
                                </div>
                            </div>
                            <div class="col-md-2 col-6">
                                <div class="text-center">
                                    <i class="fas fa-ruler-combined text-info mb-2" style="font-size: 1.5rem;"></i>
                                    <p class="mb-0 small text-muted">LB/LT</p>
                                    <strong>${data.input_data.luas_bangunan}/${data.input_data.luas_tanah}</strong>
                                </div>
                            </div>
                            <div class="col-md-2 col-6">
                                <div class="text-center">
                                    <i class="fas fa-calendar text-primary mb-2" style="font-size: 1.5rem;"></i>
                                    <p class="mb-0 small text-muted">Usia</p>
                                    <strong>${buildingAge} Tahun</strong>
                                </div>
                            </div>
                            <div class="col-md-2 col-6">
                                <div class="text-center">
                                    <i class="fas fa-star text-warning mb-2" style="font-size: 1.5rem;"></i>
                                    <p class="mb-0 small text-muted">Kondisi</p>
                                    <strong class="text-capitalize">${data.input_data.kondisi_bangunan}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Additional Details (Collapsible) -->
                        <div class="mt-3">
                            <a class="btn btn-sm btn-outline-secondary w-100" data-bs-toggle="collapse" href="#bangunanDetailsCollapse" role="button" aria-expanded="false">
                                <i class="fas fa-chevron-down me-2"></i>Lihat Detail Lengkap
                            </a>
                            <div class="collapse mt-3" id="bangunanDetailsCollapse">
                                <div class="row g-2">
                                    <div class="col-md-4">
                                        <small class="text-muted d-block">Jenis Zona:</small>
                                        <strong>${data.input_data.jenis_zona}</strong>
                                    </div>
                                    <div class="col-md-4">
                                        <small class="text-muted d-block">Aksesibilitas:</small>
                                        <strong>${data.input_data.aksesibilitas}</strong>
                                    </div>
                                    <div class="col-md-4">
                                        <small class="text-muted d-block">Tingkat Keamanan:</small>
                                        <strong class="text-capitalize">${data.input_data.tingkat_keamanan}</strong>
                                    </div>
                                    <div class="col-md-4">
                                        <small class="text-muted d-block">Tahun Dibangun:</small>
                                        <strong>${data.input_data.tahun_dibangun}</strong>
                                    </div>
                                    <div class="col-md-4">
                                        <small class="text-muted d-block">Kepadatan Penduduk:</small>
                                        <strong>${data.input_data.kepadatan_penduduk.toLocaleString('id-ID')} jiwa/km²</strong>
                                    </div>
                                    <div class="col-md-4">
                                        <small class="text-muted d-block">Jarak ke Pusat Kota:</small>
                                        <strong>${data.input_data.jarak_ke_pusat} km</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="text-center mt-4">
                    <button class="btn btn-primary" onclick="predictJualBangunan()">
                        <i class="fas fa-redo me-2"></i>Prediksi Baru
                    </button>
                </div>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = resultHTML;
}

/**
 * Reset tanah form
 */
function resetJualTanahForm() {
    document.getElementById('prediksi_jual_tanah_form').reset();
    document.getElementById('prediksi_jual_tanah_result').innerHTML = '';
}

/**
 * Reset bangunan form
 */
function resetJualBangunanForm() {
    document.getElementById('prediksi_jual_bangunan_form').reset();
    document.getElementById('prediksi_jual_bangunan_result').innerHTML = '';
}

// Export functions to global scope
window.predictJualTanah = predictJualTanah;
window.predictJualBangunan = predictJualBangunan;
window.resetJualTanahForm = resetJualTanahForm;
window.resetJualBangunanForm = resetJualBangunanForm;
