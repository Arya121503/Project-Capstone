/**
 * Population Data Auto-Fill Handler
 * Automatically fills population density based on selected kecamatan
 */

// Population data mapping
const populationData = {
  "Karangpilang": 74796,
  "Jambangan": 50470,
  "Gayungan": 41289,
  "Wonocolo": 75315,
  "Tenggilis Mejoyo": 61187,
  "Gunung Anyar": 62482,
  "Rungkut": 123757,
  "Sukolilo": 110557,
  "Mulyorejo": 86545,
  "Gubeng": 123961,
  "Wonokromo": 144650,
  "Dukuh Pakis": 56707,
  "Wiyung": 71605,
  "Lakarsantri": 59256,
  "Sambikerep": 63778,
  "Tandes": 87511,
  "Sukomanunggal": 101259,
  "Sawahan": 188693,
  "Tegalsari": 92014,
  "Genteng": 52924,
  "Tambaksari": 214966,
  "Kenjeran": 181325,
  "Bulak": 43764,
  "Simokerto": 86897,
  "Semampir": 172669,
  "Pabean Cantian": 70808,
  "Bubutan": 90646,
  "Krembangan": 109027,
  "Asemrowo": 45547,
  "Benowo": 69938,
  "Pakal": 59971
};

// Function to normalize kecamatan names for matching
function normalizeKecamatanName(name) {
  if (!name) return '';
  
  // Handle common variations in naming
  const nameMapping = {
    "Karang Pilang": "Karangpilang",
    "Pabean Cantikan": "Pabean Cantian"
  };
  
  return nameMapping[name] || name;
}

// Function to auto-fill population data
function autoFillPopulationData(kecamatanSelectId, populationInputId) {
  const kecamatanSelect = document.getElementById(kecamatanSelectId);
  const populationInput = document.getElementById(populationInputId);
  
  if (!kecamatanSelect || !populationInput) {
    console.warn(`Elements not found: ${kecamatanSelectId} or ${populationInputId}`);
    return;
  }
  
  kecamatanSelect.addEventListener('change', function() {
    const selectedKecamatan = this.value;
    console.log('Selected kecamatan:', selectedKecamatan);
    
    if (selectedKecamatan) {
      const normalizedName = normalizeKecamatanName(selectedKecamatan);
      const populationCount = populationData[normalizedName];
      
      if (populationCount) {
        populationInput.value = populationCount;
        console.log(`Auto-filled population for ${normalizedName}: ${populationCount}`);
        
        // Add visual feedback
        populationInput.style.backgroundColor = '#e8f5e8';
        setTimeout(() => {
          populationInput.style.backgroundColor = '';
        }, 1000);
        
        // Remove any previous validation errors
        populationInput.classList.remove('is-invalid');
        populationInput.classList.add('is-valid');
      } else {
        console.warn(`Population data not found for: ${normalizedName}`);
        populationInput.value = '';
        populationInput.classList.remove('is-valid');
      }
    } else {
      populationInput.value = '';
      populationInput.classList.remove('is-valid', 'is-invalid');
    }
  });
}

// Function to setup population auto-fill for both forms
function setupPopulationAutoFill() {
  console.log('Setting up population auto-fill...');
  
  // Setup for land prediction form
  autoFillPopulationData('land_kecamatan', 'land_kepadatan_penduduk');
  
  // Setup for building prediction form (if it has population field in the future)
  // Note: Building form doesn't currently use population data according to the info message
  // but we can add it here if needed
  const buildingKecamatan = document.getElementById('building_kecamatan');
  if (buildingKecamatan) {
    buildingKecamatan.addEventListener('change', function() {
      console.log('Building kecamatan selected:', this.value);
      // Building form doesn't use population data currently
      // This is here for future extensibility
    });
  }
}

// Function to validate population input
function validatePopulationInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  input.addEventListener('input', function() {
    const value = parseInt(this.value);
    if (value && value > 0) {
      this.classList.remove('is-invalid');
      this.classList.add('is-valid');
    } else if (this.value !== '') {
      this.classList.remove('is-valid');
      this.classList.add('is-invalid');
    } else {
      this.classList.remove('is-valid', 'is-invalid');
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Population auto-fill system initializing...');
  
  // Setup auto-fill functionality
  setupPopulationAutoFill();
  
  // Setup validation
  validatePopulationInput('land_kepadatan_penduduk');
  
  console.log('Population auto-fill system ready!');
});

// Export functions for external use
window.populationAutoFill = {
  setupPopulationAutoFill,
  autoFillPopulationData,
  populationData,
  normalizeKecamatanName
};
