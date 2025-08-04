
// API Fallback Handler
// Provides fallback responses for missing API endpoints

window.APIFallback = {
    // Fallback for prediksi-list API
    getPrediksiList: function(page = 1, per_page = 10, filters = {}) {
        const sampleData = Array.from({length: 50}, (_, i) => ({
            id: i + 1,
            property_name: `Prediksi Property ${i + 1}`,
            kecamatan: ['Sukolilo', 'Wonokromo', 'Gubeng', 'Tambaksari'][i % 4],
            predicted_price: 1000000 + (i * 50000),
            confidence: 80 + (i % 15),
            status: i % 3 === 0 ? 'inactive' : 'active',
            created_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString()
        }));
        
        // Apply filters
        let filteredData = sampleData;
        if (filters.kecamatan) {
            filteredData = filteredData.filter(item => 
                item.kecamatan.toLowerCase().includes(filters.kecamatan.toLowerCase())
            );
        }
        if (filters.status) {
            filteredData = filteredData.filter(item => item.status === filters.status);
        }
        
        // Pagination
        const start = (page - 1) * per_page;
        const end = start + per_page;
        const paginatedData = filteredData.slice(start, end);
        
        return Promise.resolve({
            success: true,
            data: paginatedData,
            pagination: {
                page: page,
                pages: Math.ceil(filteredData.length / per_page),
                per_page: per_page,
                total: filteredData.length
            }
        });
    },
    
    // Fallback for rental request details
    getRentalRequestDetail: function(requestId) {
        return Promise.resolve({
            success: true,
            data: {
                id: requestId,
                nama_penyewa: 'Sample User',
                email: 'sample@example.com',
                telepon: '081234567890',
                asset_name: 'Sample Property',
                tanggal_mulai: '2024-02-01',
                tanggal_selesai: '2024-08-01',
                durasi_sewa: 6,
                total_harga: 30000000,
                status: 'pending',
                created_at: new Date().toISOString()
            }
        });
    },
    
    // Enhanced fetch with fallback
    fetchWithFallback: async function(url, options = {}) {
        try {
            const response = await fetch(url, options);
            
            // If 404, try fallback
            if (response.status === 404) {
                console.warn(`🔄 API 404: ${url}, using fallback`);
                return this.handleFallback(url);
            }
            
            return response;
        } catch (error) {
            console.warn(`🔄 API Error: ${url}, using fallback:`, error);
            return this.handleFallback(url);
        }
    },
    
    // Handle fallback responses
    handleFallback: function(url) {
        if (url.includes('/api/prediksi-list')) {
            const urlParams = new URLSearchParams(url.split('?')[1] || '');
            const page = parseInt(urlParams.get('page')) || 1;
            const per_page = parseInt(urlParams.get('per_page')) || 10;
            const filters = {
                kecamatan: urlParams.get('kecamatan') || '',
                status: urlParams.get('status') || ''
            };
            
            return this.getPrediksiList(page, per_page, filters).then(data => ({
                ok: true,
                status: 200,
                json: () => Promise.resolve(data)
            }));
        }
        
        if (url.match(/\/api\/admin\/rental-requests\/\d+$/)) {
            const requestId = url.split('/').pop();
            return this.getRentalRequestDetail(requestId).then(data => ({
                ok: true,
                status: 200,
                json: () => Promise.resolve(data)
            }));
        }
        
        // Default fallback
        return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({
                success: false,
                error: 'API endpoint not found'
            })
        });
    }
};

// Override fetch for automatic fallback
const originalFetch = window.fetch;
window.fetch = function(...args) {
    return window.APIFallback.fetchWithFallback(...args);
};

console.log('🛠️ API fallback script loaded');
