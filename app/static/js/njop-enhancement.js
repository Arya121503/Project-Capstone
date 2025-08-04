/**
 * Script untuk menangani fitur Kelas Bumi dinamis berdasarkan kecamatan
 * Menggunakan data dari PERWALI NO 2 TH 2017
 */

// Global object untuk menyimpan data NJOP
window.njopData = {};

/**
 * Inisialisasi event listeners untuk kedua form prediksi
 */
function initializeNJOPFeatures() {
    console.log('🏗️ Initializing NJOP Features...');
    
    // Event listeners untuk form tanah
    const landKecamatanSelect = document.getElementById('land_kecamatan');
    if (landKecamatanSelect) {
        landKecamatanSelect.addEventListener('change', function() {
            handleKecamatanChange('land', this.value);
        });
    }
    
    // Event listeners untuk form bangunan
    const buildingKecamatanSelect = document.getElementById('building_kecamatan');
    if (buildingKecamatanSelect) {
        buildingKecamatanSelect.addEventListener('change', function() {
            handleKecamatanChange('building', this.value);
        });
    }
    
    console.log('✅ NJOP Features initialized');
}

/**
 * Menangani perubahan kecamatan
 */
function handleKecamatanChange(formType, kecamatan) {
    if (!kecamatan) {
        clearKelasbumiSelect(formType);
        clearNJOPField(formType);
        clearRangeSuggestion(formType);
        return;
    }
    
    console.log(`📍 Kecamatan changed: ${kecamatan} for ${formType} form`);
    
    // Load kelas bumi berdasarkan kecamatan
    loadKelasBumi(formType, kecamatan);
    
    // Load dan tampilkan range suggestion
    loadRangeSuggestion(formType, kecamatan);
}

/**
 * Memuat daftar kelas bumi berdasarkan kecamatan
 */
async function loadKelasBumi(formType, kecamatan) {
    try {
        showLoadingState(formType, 'kelas_bumi');
        
        const response = await fetch(`/api/kelas-bumi/${encodeURIComponent(kecamatan)}`);
        const data = await response.json();
        
        if (data.success && data.kelas_bumi.length > 0) {
            populateKelasbumiSelect(formType, data.kelas_bumi);
            console.log(`✅ Loaded ${data.kelas_bumi.length} kelas bumi for ${kecamatan}`);
        } else {
            showNoDataMessage(formType, 'kelas_bumi');
            console.warn(`⚠️ No kelas bumi found for ${kecamatan}`);
        }
        
    } catch (error) {
        console.error('❌ Error loading kelas bumi:', error);
        showErrorMessage(formType, 'kelas_bumi', 'Gagal memuat data kelas bumi');
    }
}

/**
 * Memuat range suggestion NJOP
 */
async function loadRangeSuggestion(formType, kecamatan) {
    try {
        const response = await fetch(`/api/njop-range/${encodeURIComponent(kecamatan)}`);
        const data = await response.json();
        
        if (data.success) {
            showRangeSuggestion(formType, data);
            console.log(`📊 Range suggestion loaded for ${kecamatan}: ${data.formatted_range}`);
        } else {
            clearRangeSuggestion(formType);
        }
        
    } catch (error) {
        console.error('❌ Error loading range suggestion:', error);
        clearRangeSuggestion(formType);
    }
}

/**
 * Menangani perubahan kelas bumi
 */
function handleKelasBumiChange(formType, kelasBumi, kecamatan) {
    if (!kelasBumi || !kecamatan) {
        clearNJOPField(formType);
        return;
    }
    
    console.log(`🏷️ Kelas bumi changed: ${kelasBumi} for ${kecamatan}`);
    loadNJOPSuggestion(formType, kecamatan, kelasBumi);
}

/**
 * Memuat saran NJOP berdasarkan kecamatan dan kelas bumi
 */
async function loadNJOPSuggestion(formType, kecamatan, kelasBumi) {
    try {
        const response = await fetch(`/api/njop-suggestion?kecamatan=${encodeURIComponent(kecamatan)}&kelas_bumi=${encodeURIComponent(kelasBumi)}`);
        const data = await response.json();
        
        if (data.success) {
            setNJOPValue(formType, data.recommended_njop);
            showNJOPSuggestion(formType, data);
            console.log(`💰 NJOP suggestion: ${data.formatted_njop} for ${kecamatan} ${kelasBumi}`);
        } else {
            console.warn(`⚠️ No NJOP data found for ${kecamatan} ${kelasBumi}`);
        }
        
    } catch (error) {
        console.error('❌ Error loading NJOP suggestion:', error);
    }
}

/**
 * Mengisi select kelas bumi
 */
function populateKelasbumiSelect(formType, kelasbumiList) {
    const selectId = `${formType}_kelas_bumi`;
    const containerId = `${formType}_kelas_bumi_container`;
    
    let selectElement = document.getElementById(selectId);
    let container = document.getElementById(containerId);
    
    // Show the container
    if (container) {
        container.style.display = 'block';
    }
    
    // Clear existing options
    if (selectElement) {
        selectElement.innerHTML = '<option value="">Pilih Kelas Bumi</option>';
        
        // Add new options
        kelasbumiList.forEach(item => {
            const option = document.createElement('option');
            option.value = item.kelas;
            option.textContent = item.label;
            option.dataset.recommendedNjop = item.recommended_njop;
            option.dataset.rangeText = item.range_text;
            selectElement.appendChild(option);
        });
        
        // Add event listener
        selectElement.removeEventListener('change', handleKelasBumiChangeWrapper);
        selectElement.addEventListener('change', handleKelasBumiChangeWrapper);
        
        // Enable the select
        selectElement.disabled = false;
    }
}

// Wrapper function untuk event listener
function handleKelasBumiChangeWrapper(event) {
    const selectElement = event.target;
    const formType = selectElement.id.includes('land') ? 'land' : 'building';
    const kecamatan = document.getElementById(`${formType}_kecamatan`).value;
    handleKelasBumiChange(formType, selectElement.value, kecamatan);
}

/**
 * Membuat elemen select kelas bumi baru
 */
function createKelasbumiSelect(formType) {
    const kecamatanContainer = document.getElementById(`${formType}_kecamatan`).closest('.col-md-6');
    const newContainer = kecamatanContainer.cloneNode(false);
    
    // Create new form group for kelas bumi
    newContainer.innerHTML = `
        <label for="${formType}_kelas_bumi" class="form-label">
            Kelas Bumi <span class="text-danger">*</span>
            <small class="text-muted">(Berdasarkan PERWALI NO 2 TH 2017)</small>
        </label>
        <select class="form-select" id="${formType}_kelas_bumi" name="kelas_bumi" required>
            <option value="">Pilih Kelas Bumi</option>
        </select>
        <div class="invalid-feedback">Mohon pilih kelas bumi</div>
        <div class="form-text" id="${formType}_kelas_bumi_info">
            Pilih kecamatan terlebih dahulu untuk melihat kelas bumi yang tersedia
        </div>
    `;
    
    // Insert after kecamatan field
    kecamatanContainer.parentNode.insertBefore(newContainer, kecamatanContainer.nextSibling);
}

/**
 * Mengatur nilai NJOP
 */
function setNJOPValue(formType, njopValue) {
    const njopField = document.getElementById(`${formType}_njop`);
    if (njopField) {
        njopField.value = njopValue;
        
        // Add visual feedback
        njopField.style.backgroundColor = '#e8f5e8';
        setTimeout(() => {
            njopField.style.backgroundColor = '';
        }, 2000);
    }
}

/**
 * Menampilkan saran NJOP
 */
function showNJOPSuggestion(formType, data) {
    const njopField = document.getElementById(`${formType}_njop`);
    if (!njopField) return;
    
    // Remove existing suggestion
    const existingSuggestion = document.getElementById(`${formType}_njop_suggestion`);
    if (existingSuggestion) {
        existingSuggestion.remove();
    }
    
    // Create suggestion element
    const suggestionDiv = document.createElement('div');
    suggestionDiv.id = `${formType}_njop_suggestion`;
    suggestionDiv.className = 'alert alert-info alert-sm mt-2';
    suggestionDiv.innerHTML = `
        <small>
            <i class="fas fa-info-circle me-1"></i>
            ${data.suggestion_message}
            <br>
            <strong>Range:</strong> ${data.range_text}
        </small>
    `;
    
    njopField.parentNode.appendChild(suggestionDiv);
}

/**
 * Menampilkan saran range NJOP untuk kecamatan
 */
function showRangeSuggestion(formType, data) {
    const kecamatanField = document.getElementById(`${formType}_kecamatan`);
    if (!kecamatanField) return;
    
    // Remove existing range suggestion
    const existingRange = document.getElementById(`${formType}_range_suggestion`);
    if (existingRange) {
        existingRange.remove();
    }
    
    // Create range suggestion element
    const rangeDiv = document.createElement('div');
    rangeDiv.id = `${formType}_range_suggestion`;
    rangeDiv.className = 'alert alert-warning alert-sm mt-2';
    rangeDiv.innerHTML = `
        <small>
            <i class="fas fa-chart-line me-1"></i>
            <strong>Info NJOP ${data.kecamatan}:</strong>
            <br>
            ${data.suggestion_text}
        </small>
    `;
    
    kecamatanField.parentNode.appendChild(rangeDiv);
}

/**
 * Helper functions untuk UI state management
 */
function showLoadingState(formType, fieldType) {
    const selectId = `${formType}_${fieldType}`;
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
        selectElement.innerHTML = '<option value="">Memuat data...</option>';
        selectElement.disabled = true;
    }
}

function clearKelasbumiSelect(formType) {
    const selectElement = document.getElementById(`${formType}_kelas_bumi`);
    const container = document.getElementById(`${formType}_kelas_bumi_container`);
    
    if (selectElement) {
        selectElement.innerHTML = '<option value="">Pilih Kelas Bumi</option>';
        selectElement.disabled = false;
    }
    
    if (container) {
        container.style.display = 'none';
    }
}

function clearNJOPField(formType) {
    const njopField = document.getElementById(`${formType}_njop`);
    if (njopField) {
        // Don't clear the value, just remove styling
        njopField.style.backgroundColor = '';
    }
    
    // Remove suggestion
    const suggestion = document.getElementById(`${formType}_njop_suggestion`);
    if (suggestion) {
        suggestion.remove();
    }
}

function clearRangeSuggestion(formType) {
    const rangeSuggestion = document.getElementById(`${formType}_range_suggestion`);
    if (rangeSuggestion) {
        rangeSuggestion.remove();
    }
}

function showNoDataMessage(formType, fieldType) {
    const selectId = `${formType}_${fieldType}`;
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
        selectElement.innerHTML = '<option value="">Tidak ada data tersedia</option>';
        selectElement.disabled = true;
    }
}

function showErrorMessage(formType, fieldType, message) {
    const selectId = `${formType}_${fieldType}`;
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
        selectElement.innerHTML = `<option value="">Error: ${message}</option>`;
        selectElement.disabled = true;
    }
}

/**
 * Initialize when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure all other scripts are loaded
    setTimeout(initializeNJOPFeatures, 500);
});

// Export functions for global access
window.handleKecamatanChange = handleKecamatanChange;
window.handleKelasBumiChange = handleKelasBumiChange;
window.loadNJOPSuggestion = loadNJOPSuggestion;
