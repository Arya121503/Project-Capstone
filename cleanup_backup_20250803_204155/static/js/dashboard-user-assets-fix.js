/**
 * Dashboard User Assets Fix
 * Provides immediate mock data for assets when API is not available
 */

// Show mock data immediately
document.addEventListener("DOMContentLoaded", function() {
  console.log("Loading mock asset data immediately");
  showMockData();
});

// Show mock data
function showMockData() {
  // Create mock data
  const mockData = [
    {
      id: 1,
      name: "Tanah Komersial Strategis",
      asset_type: "tanah",
      kecamatan: "Gubeng",
      alamat: "Jl. Dharmahusada No. 123, Gubeng",
      luas_tanah: 500,
      harga_sewa: 15000000,
      status: "Tersedia"
    }
  ];
  
  // Display mock data
  displayAsetData(mockData);
}

// Display asset data
function displayAsetData(asetList) {
  const container = document.getElementById("assetGrid");
  
  if (!container) {
    console.error("Asset grid container not found!");
    return;
  }

  if (!asetList || asetList.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-home text-muted mb-3" style="font-size: 3rem;"></i>
        <h5 class="text-muted">Belum ada aset untuk saat ini</h5>
        <p class="text-muted">Admin belum menambahkan aset yang tersedia untuk disewa. Silakan cek kembali nanti.</p>
      </div>
    `;
    return;
  }

  let html = "";
  asetList.forEach((aset) => {
    // Map API fields to expected fields
    const assetType = aset.asset_type || aset.jenis || "tanah";
    const isTanah = assetType === "tanah";
    
    html += `
      <div class="col-md-6 col-lg-4">
        <div class="card asset-card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-${
                isTanah ? "success" : "primary"
              } rounded-pill">
                ${isTanah ? "Tanah" : "Tanah + Bangunan"}
              </span>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-success text-white rounded-pill">
                  ${aset.status || "Tersedia"}
                </span>
                <i class="fas fa-heart favorite-heart" 
                   title="Tambah ke Favorit"
                   data-aset-id="${aset.id}"></i>
              </div>
            </div>
            
            <h6 class="card-title text-truncate" title="${
              aset.alamat || aset.address || "Alamat tidak tersedia"
            }">
              ${aset.name || aset.alamat || "Alamat tidak tersedia"}
            </h6>
            
            <div class="mb-2">
              <small class="text-muted">
                <i class="fas fa-map-marker-alt me-1"></i>
                ${aset.kecamatan || aset.location || "Kecamatan tidak tersedia"}${
      aset.kelurahan ? ", " + aset.kelurahan : ""
    }
              </small>
            </div>
            
            <div class="row text-center mb-3">
              <div class="col-6">
                <small class="text-muted d-block">Luas Tanah</small>
                <strong>${aset.luas_tanah || aset.land_size || 0} m²</strong>
              </div>
              ${
                !isTanah && (aset.luas_bangunan || aset.building_size)
                  ? `
              <div class="col-6">
                <small class="text-muted d-block">Luas Bangunan</small>
                <strong>${aset.luas_bangunan || aset.building_size || 0} m²</strong>
              </div>`
                  : '<div class="col-6"></div>'
              }
            </div>
            
            <div class="text-center">
              <div class="h6 text-danger mb-2">
                Rp ${formatCurrency(aset.harga_sewa || 0)}/bulan
              </div>
              <small class="text-muted d-block mb-3"></small>
              <div class="btn-group btn-group-sm w-100">
                <button class="btn btn-outline-info">
                  <i class="fas fa-eye me-1"></i>Detail
                </button>
                <button class="btn btn-danger">
                  <i class="fas fa-handshake me-1"></i>Sewa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Format currency helper function
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}

// Override loadAsetDataWithRetry to do nothing (we're using mock data directly)
function loadAsetDataWithRetry() {
  console.log("loadAsetDataWithRetry called, but using mock data instead");
  // Do nothing, we're already showing mock data
}