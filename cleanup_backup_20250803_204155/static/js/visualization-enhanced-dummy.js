/**
 * Enhanced Visualization with Complete Dummy Data
 * Includes rental transactions, user activities, and comprehensive analytics
 */

// Override the original visualization handler to provide immediate dummy data
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the page to load completely
    setTimeout(() => {
        console.log('Loading enhanced visualization with dummy data...');
        
        // Force show visualization data immediately
        forceDisplayVisualization();
        
        // Setup periodic updates to simulate real-time data
        startDataSimulation();
        
    }, 1000);
});

function forceDisplayVisualization() {
    // Hide any loading states
    hideAllLoadingStates();
    
    // Display KPI data
    displayKPIData();
    
    // Display all charts
    displayAllCharts();
    
    // Show success message
    showVisualizationSuccess();
}

function hideAllLoadingStates() {
    // Hide spinner elements
    const spinners = document.querySelectorAll('.fa-spinner');
    spinners.forEach(spinner => {
        if (spinner.parentElement) {
            const content = getKPIContent(spinner.parentElement.id);
            if (content) {
                spinner.parentElement.innerHTML = content;
            }
        }
    });
    
    // Hide loading message
    const messageEl = document.getElementById('visualization-message');
    if (messageEl) {
        messageEl.style.display = 'none';
    }
}

function getKPIContent(elementId) {
    // Return empty/loading state - will be loaded from real API
    const kpiData = {
        'totalAssets': '0',
        'occupancyRate': '0%',
        'monthlyRevenue': 'Rp 0',
        'avgRentalPrice': 'Rp 0',
        'activeRenters': '0',
        'activeAssetsCount': '0 Aktif',
        'rentedAssetsCount': '0 Tersewa',
        'revenueGrowth': '0% MoM',
        'newRentersThisMonth': '0 Bulan Ini',
        'priceRange': 'Rp 0 - Rp 0'
    };
    
    return kpiData[elementId] || null;
}

function displayKPIData() {
    // Return empty data - will be loaded from real API
    const kpiData = {
        'totalAssets': '0',
        'occupancyRate': '0%',
        'monthlyRevenue': 'Rp 0',
        'avgRentalPrice': 'Rp 0',
        'activeRenters': '0'
    };
    
    // Update main KPI elements
    Object.keys(kpiData).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = kpiData[id];
            element.style.color = getKPIColor(id);
        }
    });
    
    // Update badges
    updateElement('activeAssetsCount', '40 Aktif');
    updateElement('rentedAssetsCount', '87 Tersewa');
    updateElement('revenueGrowth', '+15.2% MoM');
    updateElement('newRentersThisMonth', '+12 Bulan Ini');
    updateElement('priceRange', 'Rp 2M - Rp 25M');
    
    // Update progress bar
    const occupancyProgress = document.getElementById('occupancyProgress');
    if (occupancyProgress) {
        occupancyProgress.style.width = '68.5%';
        occupancyProgress.setAttribute('aria-valuenow', '68.5');
    }
    
    // Update location table
    updateLocationTable();
}

function getKPIColor(id) {
    const colorMap = {
        'totalAssets': '#DC143C',      // Telkom red
        'occupancyRate': '#28a745',    // Success green
        'monthlyRevenue': '#ffc107',   // Warning yellow
        'avgRentalPrice': '#dc3545',   // Danger red
        'activeRenters': '#17a2b8'     // Info blue
    };
    return colorMap[id] || '#333';
}

function displayAllCharts() {
    // Wait for Chart.js to be available
    if (typeof Chart === 'undefined') {
        setTimeout(displayAllCharts, 500);
        return;
    }
    
    try {
        displayMonthlyTrendsChart();
        displayAssetTypeChart();
        displayLocationChart();
        displayStatusChart();
        displayPriceRangeChart();
        displayRevenueChart();
        displayMarketTrendChart();
    } catch (error) {
        console.error('Error displaying charts:', error);
    }
}

function displayMonthlyTrendsChart() {
    const ctx = document.getElementById('monthlyTrendsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Pendapatan (Juta Rp)',
                data: [320, 298, 350, 382, 415, 450],
                backgroundColor: 'rgba(220, 20, 60, 0.1)',
                borderColor: '#DC143C',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#DC143C',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#DC143C',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value + 'M';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function displayAssetTypeChart() {
    const ctx = document.getElementById('assetTypeChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Tanah', 'Bangunan + Tanah'],
            datasets: [{
                data: [72, 55],
                backgroundColor: ['#DC143C', '#28a745'],
                borderWidth: 0,
                cutout: '60%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function displayLocationChart() {
    const ctx = document.getElementById('locationChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Gubeng', 'Sukolilo', 'Wonokromo', 'Tegalsari', 'Genteng'],
            datasets: [{
                label: 'Harga Rata-rata (Juta Rp)',
                data: [12.5, 9.8, 8.2, 7.5, 11.2],
                backgroundColor: ['#DC143C', '#28a745', '#ffc107', '#17a2b8', '#6c757d'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value + 'M';
                        }
                    }
                }
            }
        }
    });
}

function displayStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Pending',
                    data: [15, 12, 18, 20, 16, 22],
                    backgroundColor: '#ffc107'
                },
                {
                    label: 'Disetujui',
                    data: [28, 25, 32, 35, 38, 42],
                    backgroundColor: '#28a745'
                },
                {
                    label: 'Ditolak',
                    data: [3, 2, 4, 3, 2, 5],
                    backgroundColor: '#dc3545'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayPriceRangeChart() {
    const ctx = document.getElementById('priceRangeChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['< 5M', '5M-10M', '10M-15M', '15M-20M', '> 20M'],
            datasets: [{
                label: 'Jumlah Properti',
                data: [25, 42, 35, 18, 7],
                backgroundColor: '#DC143C',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [320, 298, 350, 382, 415, 450],
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                borderColor: '#28a745',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value + 'M';
                        }
                    }
                }
            }
        }
    });
}

function displayMarketTrendChart() {
    const ctx = document.getElementById('marketTrendChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Harga Tanah',
                    data: [7.2, 7.5, 7.8, 8.1, 8.4, 8.7],
                    borderColor: '#DC143C',
                    backgroundColor: 'rgba(220, 20, 60, 0.1)',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Harga Bangunan',
                    data: [8.8, 8.9, 9.2, 9.5, 9.8, 10.1],
                    borderColor: '#17a2b8',
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + value + 'M';
                        }
                    }
                }
            }
        }
    });
}

function updateLocationTable() {
    const tableBody = document.getElementById('topPriceTable');
    if (!tableBody) return;
    
    const locationData = [
        { kecamatan: 'Gubeng', avg_price: 12500000, total_properties: 25 },
        { kecamatan: 'Sukolilo', avg_price: 9800000, total_properties: 18 },
        { kecamatan: 'Wonokromo', avg_price: 8200000, total_properties: 22 },
        { kecamatan: 'Tegalsari', avg_price: 7500000, total_properties: 15 },
        { kecamatan: 'Genteng', avg_price: 11200000, total_properties: 20 }
    ];
    
    tableBody.innerHTML = '';
    
    locationData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center"><strong>${index + 1}</strong></td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-map-marker-alt text-danger me-2"></i>
                    ${item.kecamatan}
                </div>
            </td>
            <td class="text-end">
                <strong class="text-success">Rp ${formatCurrency(item.avg_price)}</strong>
            </td>
            <td class="text-center">
                <span class="badge bg-primary">${item.total_properties}</span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = value;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID').format(amount);
}

function showVisualizationSuccess() {
    const messageEl = document.getElementById('visualization-message');
    if (messageEl) {
        messageEl.style.display = 'block';
        messageEl.className = 'alert alert-success text-center';
        messageEl.innerHTML = '<i class="fas fa-check-circle me-2"></i>Data visualisasi berhasil dimuat dengan data simulasi!';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 4000);
    }
}

function startDataSimulation() {
    // Simulate data updates every 30 seconds
    setInterval(() => {
        simulateDataUpdate();
    }, 30000);
}

function simulateDataUpdate() {
    // Add small random variations to simulate real-time data
    const occupancyRate = Math.max(60, Math.min(80, 68.5 + (Math.random() * 4 - 2)));
    const monthlyRevenue = 382.5 + (Math.random() * 20 - 10);
    
    updateElement('occupancyRate', occupancyRate.toFixed(1) + '%');
    updateElement('monthlyRevenue', 'Rp ' + monthlyRevenue.toFixed(1) + 'M');
    
    const occupancyProgress = document.getElementById('occupancyProgress');
    if (occupancyProgress) {
        occupancyProgress.style.width = occupancyRate + '%';
    }
}

// Force initialization when visualization tab is clicked
document.addEventListener('click', function(e) {
    if (e.target.closest('[data-target="visualisasi"]')) {
        setTimeout(() => {
            forceDisplayVisualization();
        }, 500);
    }
});

console.log('Enhanced visualization dummy data script loaded successfully!');
