/**
 * Fungsi untuk memuat ulang data aset
 */
function refreshAssets() {
    // Tampilkan loading spinner
    document.getElementById('assetGrid').innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat ulang data aset...</p>
        </div>
    `;

    // Reset filter jika diperlukan
    const resetFilters = confirm("Apakah Anda ingin mereset filter pencarian?");
    if (resetFilters) {
        document.getElementById('assetTypeFilter').value = '';
        document.getElementById('locationFilter').value = '';
        document.getElementById('priceFilter').value = '';
    }

    // Panggil fungsi untuk memuat aset
    if (typeof loadAvailableAssets === 'function') {
        // Ambil filter yang saat ini aktif
        const filters = {
            assetType: document.getElementById('assetTypeFilter').value,
            location: document.getElementById('locationFilter').value,
            priceRange: document.getElementById('priceFilter').value
        };
        
        // Muat data aset dengan filter
        loadAvailableAssets(1, filters);
    } else {
        // Fallback jika fungsi loadAvailableAssets tidak tersedia
        alert('Fungsi untuk memuat data aset tidak tersedia. Silakan muat ulang halaman.');
    }
}
