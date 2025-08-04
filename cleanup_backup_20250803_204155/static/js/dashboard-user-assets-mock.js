/**
 * Dashboard User Assets Mock
 * Provides mock data for assets when API is not available
 */

// Load asset data with retry mechanism
async function loadAsetDataWithRetry(page = 1, retryCount = 0) {
  try {
    // Show loading state first
    const container = document.getElementById("assetGrid");
    if (container) {
      container.innerHTML = `
        <div class="col-12 text-center">
          <div class="spinner-border text-danger mb-3" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h4>Memuat aset tersedia...</h4>
          <p class="text-muted">Mohon tunggu sebentar${retryCount > 0 ? ` (Percobaan ke-${retryCount + 1})` : ''}</p>
        </div>
      `;
    }

    // Get filter values if elements exist
    const assetTypeFilter = document.getElementById("assetTypeFilter");
    const locationFilter = document.getElementById("locationFilter");
    const priceFilter = document.getElementById("priceFilter");

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("per_page", 9); // 9 items per page
    
    if (assetTypeFilter && assetTypeFilter.value) {
      params.append("asset_type", assetTypeFilter.value);
    }
    
    if (locationFilter && locationFilter.value) {
      params.append("location", locationFilter.value);
    }
    
    if (priceFilter && priceFilter.value) {
      params.append("price_range", priceFilter.value);
    }

    console.log(`Loading assets with params: ${params.toString()} (Attempt: ${retryCount + 1})`);
    
    // Define all API endpoints to try - only use the working endpoint
    const endpoints = [
      `/api/aset-tersedia?${params}`,
      `/rental/api/assets/available?${params}`
    ];
    
    let lastError = null;
    
    // Try each endpoint in sequence
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(endpoint, { 
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' } // Prevent caching
        });
        clearTimeout(timeoutId);
        
        // Check if response is ok
        if (!response.ok) {
          console.warn(`Endpoint ${endpoint} returned status: ${response.status}`);
          continue; // Try next endpoint
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log(`Successfully loaded data from ${endpoint}`);
          // The API returns data in 'data' or 'assets' field
          const assetData = data.data || data.assets || [];
          displayAsetData(assetData);
          if (data.pagination) {
            updatePaginationControls(data.pagination);
            currentPage = data.pagination.current_page || data.pagination.page || 1;
          }
          
          // Clear any previous error messages
          const alertContainer = document.getElementById("alertContainer");
          if (alertContainer) {
            alertContainer.innerHTML = '';
          }
          
          // Update dashboard stats after loading assets
          if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
          }
          
          return; // Success! Exit the function
        } else {
          console.warn(`Endpoint ${endpoint} returned error:`, data);
          lastError = data.message || "Unknown error";
        }
      } catch (endpointError) {
        console.warn(`Error with endpoint ${endpoint}:`, endpointError);
        lastError = endpointError.message;
      }
    }
    
    // If we get here, all endpoints failed
    throw new Error(lastError || "All API endpoints failed");
    
  } catch (error) {
    console.error("Error loading aset data:", error);
    
    // All retries failed, show mock data
    console.log("All retries failed, showing mock data");
    showMockData();
  }
}

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
  
  // Mock pagination
  updatePaginationControls({
    current_page: 1,
    total_pages: 1,
    has_prev: false,
    has_next: false
  });
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

// Update pagination controls
function updatePaginationControls(pagination) {
  const paginationList = document.getElementById("assetPagination");
  
  if (!paginationList) return;

  // Show/hide pagination controls
  if (pagination.total_pages <= 1) {
    paginationList.style.display = "none";
    return;
  } else {
    paginationList.style.display = "flex";
  }

  // Generate pagination buttons
  let html = "";

  // Previous button
  html += `
    <li class="page-item disabled">
      <button class="page-link" disabled>
        <i class="fas fa-chevron-left me-1"></i>Previous
      </button>
    </li>
  `;

  // Page number
  html += `
    <li class="page-item active">
      <button class="page-link" disabled>
        1
      </button>
    </li>
  `;

  // Next button
  html += `
    <li class="page-item disabled">
      <button class="page-link" disabled>
        Next<i class="fas fa-chevron-right ms-1"></i>
      </button>
    </li>
  `;

  paginationList.innerHTML = html;
}

// Format currency helper function
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}