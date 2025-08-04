/**
 * Dashboard User Utils
 * Utility functions for the Telkom Aset user dashboard
 * Note: Basic utilities now imported from utils.js
 */

// Get time ago
function getTimeAgo(dateString) {
  if (!dateString) return "";

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Show success message
function showSuccess(message) {
  const toast = document.createElement("div");
  toast.className = "alert alert-success position-fixed";
  toast.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; max-width: 300px;";
  toast.innerHTML = `<i class="fas fa-check me-2"></i>${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Show error message  
function showError(message) {
  window.showNotification(message, 'error');
}

// Show error with mock data
function showErrorWithMockData(message) {
  console.log("Showing mock data due to error:", message);
  
  // Create mock data for demonstration
  const mockData = [
    {
      id: 1,
      jenis: "tanah",
      alamat: "Jl. Contoh No. 123",
      kecamatan: "Bandung Utara",
      kelurahan: "Ciumbuleuit",
      luas_tanah: 250,
      harga_sewa: 5000000,
      status: "Tersedia"
    },
    {
      id: 2,
      jenis: "tanah_bangunan",
      alamat: "Jl. Sampel No. 456",
      kecamatan: "Bandung Selatan",
      kelurahan: "Buahbatu",
      luas_tanah: 300,
      luas_bangunan: 200,
      kamar_tidur: 3,
      kamar_mandi: 2,
      harga_sewa: 8000000,
      status: "Tersedia"
    },
    {
      id: 3,
      jenis: "tanah",
      alamat: "Jl. Demo No. 789",
      kecamatan: "Bandung Timur",
      kelurahan: "Antapani",
      luas_tanah: 400,
      harga_sewa: 6500000,
      status: "Tersedia"
    }
  ];
  
  // Display the mock data
  displayAsetData(mockData);
  
  // Show a notification that we're using mock data
  const alertContainer = document.getElementById("alertContainer");
  if (alertContainer) {
    alertContainer.innerHTML = `
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <i class="fas fa-info-circle me-2"></i>
        <strong>Perhatian:</strong> Menampilkan data contoh karena terjadi kesalahan saat memuat data asli.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }
}

// Update favorite badge with enhanced styling
function updateFavoritBadge(count) {
  const badge = document.getElementById("favoriteBadge");
  const totalFavorit = document.getElementById("totalFavorit");

  if (badge) {
    const numCount = parseInt(count) || 0;
    badge.textContent = numCount;
    
    if (numCount > 0) {
      badge.style.display = "inline-block";
      // Add animation class for visual feedback
      badge.classList.add("updated");
      
      // Remove animation class after animation completes
      setTimeout(() => {
        badge.classList.remove("updated");
      }, 600);
    } else {
      badge.style.display = "none";
    }
  }

  if (totalFavorit) {
    totalFavorit.textContent = count || 0;
  }
}

// Load favorite count for the badge
async function loadFavoritCount() {
  try {
    // Try multiple endpoints to find the working one
    const endpoints = ['/favorit-count', '/api/favorit-count'];
    let response = null;
    let data = null;
    
    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint);
        if (response.ok) {
          data = await response.json();
          if (data.success) {
            break; // Found working endpoint
          }
        }
      } catch (e) {
        console.warn(`Endpoint ${endpoint} failed:`, e);
        continue;
      }
    }
    
    if (data && data.success) {
      updateFavoritBadge(data.count);
    } else {
      console.warn('Failed to load favorite count from all endpoints');
      updateFavoritBadge(0);
    }
  } catch (error) {
    console.error("Error loading favorit count:", error);
    updateFavoritBadge(0);
  }
}