/**
 * Script untuk menangani fitur Kelas Bumi dinamis berdasarkan kecamatan
 * Menggunakan data dari PERWALI NO 2 TH 2017
 * Version 2.0 - Simplified and optimized
 */

/**
 * Inisialisasi event listeners untuk kedua form prediksi
 */
function initializeNJOPFeatures() {
    console.log('🏗️ Initializing NJOP Features v2.0...');
    
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
        hideKelasbumiSelect(formType);
        clearNJOPSuggestions(formType);
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
        showLoadingState(formType);
        
        const response = await fetch(`/api/kelas-bumi/${encodeURIComponent(kecamatan)}`);
        const data = await response.json();
        
        if (data.success && data.kelas_bumi.length > 0) {
            populateKelasbumiSelect(formType, data.kelas_bumi);
            console.log(`✅ Loaded ${data.kelas_bumi.length} kelas bumi for ${kecamatan}`);
        } else {
            showNoDataMessage(formType);
            console.warn(`⚠️ No kelas bumi found for ${kecamatan}`);
        }
        
    } catch (error) {
        console.error('❌ Error loading kelas bumi:', error);
        showErrorMessage(formType, 'Gagal memuat data kelas bumi');
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
 * Mengisi select kelas bumi
 */
function populateKelasbumiSelect(formType, kelasbumiList) {
    const selectElement = document.getElementById(`${formType}_kelas_bumi`);
    const container = document.getElementById(`${formType}_kelas_bumi_container`);
    
    if (!selectElement || !container) {
        console.error(`❌ Kelas bumi elements not found for ${formType}`);
        return;
    }
    
    // Show the container
    container.style.display = 'block';
    
    // Clear existing options
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
    
    // Remove existing event listener and add new one
    selectElement.removeEventListener('change', handleKelasBumiChangeEvent);
    selectElement.addEventListener('change', handleKelasBumiChangeEvent);
    
    // Enable the select
    selectElement.disabled = false;
}

/**
 * Event handler untuk perubahan kelas bumi
 */
function handleKelasBumiChangeEvent(event) {
    const selectElement = event.target;
    const formType = selectElement.id.includes('land') ? 'land' : 'building';
    const kecamatan = document.getElementById(`${formType}_kecamatan`).value;
    const kelasBumi = selectElement.value;
    
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
 * Mengatur nilai NJOP
 */
function setNJOPValue(formType, njopValue) {
    const njopField = document.getElementById(`${formType}_njop`);
    if (njopField) {
        njopField.value = njopValue;
        
        // Add visual feedback
        njopField.style.backgroundColor = '#e8f5e8';
        njopField.style.transition = 'background-color 0.3s';
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
    clearNJOPSuggestion(formType);
    
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
    clearRangeSuggestion(formType);
    
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
function showLoadingState(formType) {
    const selectElement = document.getElementById(`${formType}_kelas_bumi`);
    if (selectElement) {
        selectElement.innerHTML = '<option value="">Memuat data...</option>';
        selectElement.disabled = true;
    }
}

function hideKelasbumiSelect(formType) {
    const container = document.getElementById(`${formType}_kelas_bumi_container`);
    if (container) {
        container.style.display = 'none';
    }
}

function clearNJOPField(formType) {
    const njopField = document.getElementById(`${formType}_njop`);
    if (njopField) {
        njopField.style.backgroundColor = '';
    }
    clearNJOPSuggestion(formType);
}

function clearNJOPSuggestion(formType) {
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

function clearNJOPSuggestions(formType) {
    clearNJOPSuggestion(formType);
    clearRangeSuggestion(formType);
}

function showNoDataMessage(formType) {
    const selectElement = document.getElementById(`${formType}_kelas_bumi`);
    if (selectElement) {
        selectElement.innerHTML = '<option value="">Tidak ada data tersedia</option>';
        selectElement.disabled = true;
    }
}

function showErrorMessage(formType, message) {
    const selectElement = document.getElementById(`${formType}_kelas_bumi`);
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
window.loadNJOPSuggestion = loadNJOPSuggestion;
