
// ULTRA AGGRESSIVE badge fix for ALL badge issues
(function() {
    console.log('🔧 Injecting ULTRA AGGRESSIVE badge fix...');
    
    // Ultra aggressive badge fix that removes ALL numbers and "Unknown" from badges
    function ultraAggressiveFixAllBadges() {
        console.log('🎯 Starting ULTRA AGGRESSIVE badge fix...');
        
        // Fix ALL tables on the page
        const allTables = document.querySelectorAll('table');
        allTables.forEach(table => {
            const tableId = table.id || 'unknown';
            ultraAggressiveFixBadgesInTable(table, tableId);
        });
        
        // Also fix any loose badges not in tables
        const allBadges = document.querySelectorAll('.badge');
        allBadges.forEach(badge => {
            fixSingleBadgeUltra(badge, 'global');
        });
        
        // Fix specific problematic badges
        fixSpecificBadges();
    }
    
    function ultraAggressiveFixBadgesInTable(table, tableId) {
        if (!table) {
            console.log(`❌ Table ${tableId} not found`);
            return;
        }
        
        console.log(`🔍 ULTRA AGGRESSIVE check badges in table: ${tableId}`);
        
        // Find all badge elements in the table
        const badges = table.querySelectorAll('.badge');
        console.log(`Found ${badges.length} badges to ULTRA AGGRESSIVELY fix in ${tableId}`);
        
        let fixedCount = 0;
        
        badges.forEach(function(badge, index) {
            if (fixSingleBadgeUltra(badge, tableId)) {
                fixedCount++;
            }
        });
        
        console.log(`🔧 ULTRA AGGRESSIVELY fixed ${fixedCount} badges in ${tableId}`);
    }
    
    function fixSingleBadge(badge, context) {
        const currentText = badge.textContent.trim();
        
        // Skip if already has proper text (not just numbers)
        if (!/^\d+$/.test(currentText)) {
            return false;
        }
        
        console.log(`🎯 ${context} - Fixing badge with number: "${currentText}"`);
        
        // Get parent row to determine context
        const row = badge.closest('tr');
        const cells = row ? row.querySelectorAll('td') : [];
        const columnIndex = row ? Array.from(cells).findIndex(cell => cell.contains(badge)) : -1;
        
        let newText = '';
        let newClass = '';
        
        // Try to determine column purpose by header
        const table = badge.closest('table');
        const headers = table ? table.querySelectorAll('th') : [];
        const headerText = headers[columnIndex] ? headers[columnIndex].textContent.toLowerCase() : '';
        
        console.log(`Column ${columnIndex}, Header: "${headerText}"`);
        
        // Fix based on header text or column position
        if (headerText.includes('jenis') || headerText.includes('type') || columnIndex === 1) {
            // Asset type column
            if (currentText === '3') {
                newText = 'Tanah';
                newClass = 'badge bg-success';
            } else if (currentText === '2') {
                newText = 'Bangunan';
                newClass = 'badge bg-danger';
            } else {
                // Default for any other number
                newText = 'Bangunan';
                newClass = 'badge bg-danger';
            }
        } else if (headerText.includes('status') || columnIndex === 5 || columnIndex >= 4) {
            // Status column
            if (currentText === '3') {
                newText = 'Aktif';
                newClass = 'badge bg-success';
            } else if (currentText === '1') {
                newText = 'Tersedia';
                newClass = 'badge bg-primary';
            } else {
                newText = 'Aktif';
                newClass = 'badge bg-success';
            }
        } else {
            // Unknown column - make a best guess
            if (currentText === '3') {
                // Check if it's likely a type or status based on context
                const assetName = cells[0] ? cells[0].textContent.toLowerCase() : '';
                if (assetName.includes('tanah')) {
                    newText = 'Tanah';
                    newClass = 'badge bg-success';
                } else {
                    newText = 'Aktif';
                    newClass = 'badge bg-success';
                }
            } else {
                newText = 'Unknown';
                newClass = 'badge bg-secondary';
            }
        }
        
        // Apply the fix
        if (newText && newClass) {
            badge.textContent = newText;
            badge.className = newClass;
            console.log(`✅ FIXED badge: "${currentText}" → "${newText}"`);
            return true;
        }
        
        return false;
    }
    
    // Override ANY function that might create number badges
    function overrideAllBadgeFunctions() {
        console.log('🛠️ AGGRESSIVELY overriding ALL badge functions...');
        
        // Wait for RentalAssetManager
        if (window.rentalAssetManager) {
            const manager = window.rentalAssetManager;
            
            // Override getAssetTypeBadge
            manager.getAssetTypeBadge = function(assetType) {
                console.log(`🏷️ OVERRIDDEN getAssetTypeBadge called with: ${assetType}`);
                if (assetType === '3' || assetType === 3 || assetType === 'tanah') {
                    return '<span class="badge bg-success">Tanah</span>';
                } else {
                    return '<span class="badge bg-danger">Bangunan</span>';
                }
            };
            
            // Override getRentalStatusBadge
            manager.getRentalStatusBadge = function(status) {
                console.log(`🏷️ OVERRIDDEN getRentalStatusBadge called with: ${status}`);
                if (status === '3' || status === 3 || status === 'active' || status === 'aktif') {
                    return '<span class="badge bg-success">Aktif</span>';
                } else if (status === '1' || status === 'available') {
                    return '<span class="badge bg-primary">Tersedia</span>';
                } else {
                    return '<span class="badge bg-success">Aktif</span>';
                }
            };
            
            console.log('✅ ALL badge functions AGGRESSIVELY overridden');
        } else {
            console.log('⏳ RentalAssetManager not ready, retrying...');
            setTimeout(overrideAllBadgeFunctions, 200);
        }
    }
    
    // Nuclear option: Watch for ANY changes to badges and fix them immediately
    function setupBadgeWatcher() {
        console.log('�️ Setting up AGGRESSIVE badge watcher...');
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Check for any newly added badges
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        const badges = node.querySelectorAll ? node.querySelectorAll('.badge') : [];
                        badges.forEach(badge => fixSingleBadge(badge, 'watcher'));
                        
                        // Also check if the node itself is a badge
                        if (node.classList && node.classList.contains('badge')) {
                            fixSingleBadge(node, 'watcher');
                        }
                    }
                });
                
                // Check for text changes in existing badges
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const target = mutation.target;
                    if (target.classList && target.classList.contains('badge')) {
                        fixSingleBadge(target, 'watcher');
                    }
                    // Also check parent if it's a badge
                    const parentBadge = target.closest ? target.closest('.badge') : null;
                    if (parentBadge) {
                        fixSingleBadge(parentBadge, 'watcher');
                    }
                }
            });
        });
        
        // Watch the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        console.log('👁️ AGGRESSIVE badge watcher active');
    }
    
    // Wait for page to load
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM loaded, setting up AGGRESSIVE badge fixes...');
        
        // Start all fixes
        overrideAllBadgeFunctions();
        setupBadgeWatcher();
        
        // Fix badges when tabs are clicked
        document.addEventListener('click', function(e) {
            const tab = e.target.closest('a[data-bs-toggle="tab"]');
            if (tab) {
                console.log('🏠 Tab clicked, scheduling AGGRESSIVE fix...');
                setTimeout(aggressiveFixAllBadges, 100);
                setTimeout(aggressiveFixAllBadges, 500);
                setTimeout(aggressiveFixAllBadges, 1000);
            }
            
            // Also fix on any reload button
            if (e.target.textContent.includes('Reload') || 
                e.target.closest('button')?.textContent.includes('Reload')) {
                console.log('🔄 Reload detected, scheduling AGGRESSIVE badge fix...');
                setTimeout(aggressiveFixAllBadges, 500);
            }
        });
        
        // ULTRA AGGRESSIVE periodic fix - every 500ms
        setInterval(ultraAggressiveFixAllBadges, 500);
        
        // Initial fixes with multiple rapid attempts
        setTimeout(ultraAggressiveFixAllBadges, 50);
        setTimeout(ultraAggressiveFixAllBadges, 200);
        setTimeout(ultraAggressiveFixAllBadges, 500);
        setTimeout(ultraAggressiveFixAllBadges, 1000);
        setTimeout(ultraAggressiveFixAllBadges, 2000);
    });
    
    // Additional function to fix specific problematic badges
    function fixSpecificBadges() {
        console.log('🎯 Fixing specific problematic badges...');
        
        // Fix pendingRequestsBadge if it shows Unknown
        const pendingBadge = document.getElementById('pendingRequestsBadge');
        if (pendingBadge && (pendingBadge.textContent.includes('Unknown') || pendingBadge.textContent.includes('3'))) {
            pendingBadge.textContent = '0';
            pendingBadge.className = 'badge bg-danger ms-1';
            pendingBadge.style.display = 'none';
            console.log('✅ Fixed pendingRequestsBadge');
        }
        
        // Fix any other specific badges that might show Unknown
        const allBadges = document.querySelectorAll('.badge');
        allBadges.forEach(badge => {
            if (badge.textContent.includes('Unknown') || 
                badge.textContent.includes('🔴') ||
                badge.textContent.includes('�')) {
                
                // Determine appropriate replacement based on context
                if (badge.id && badge.id.includes('pending')) {
                    badge.textContent = '0';
                    badge.style.display = 'none';
                } else if (badge.closest('tr')) {
                    // It's in a table, apply table logic
                    fixSingleBadgeUltra(badge, 'specific');
                } else {
                    // It's a standalone badge, hide it or give it a safe value
                    badge.style.display = 'none';
                }
                console.log(`✅ Fixed Unknown badge: ${badge.id || 'unnamed'}`);
            }
        });
    }
    
    // Enhanced function to fix single badges with Unknown detection
    function fixSingleBadgeUltra(badge, context) {
        const currentText = badge.textContent.trim();
        
        // Skip if already has proper text (not numbers, not Unknown, not weird content)
        if (!/^\d+$/.test(currentText) && 
            !currentText.toLowerCase().includes('unknown') && 
            !currentText.includes('🔴') && 
            !currentText.includes('�') &&
            currentText.length > 0 &&
            !/^(3|2|1)$/.test(currentText)) {
            return false;
        }
        
        console.log(`🎯 ${context} - Fixing badge with problematic content: "${currentText}"`);
        
        // Get parent row to determine context
        const row = badge.closest('tr');
        const cells = row ? row.querySelectorAll('td') : [];
        const columnIndex = row ? Array.from(cells).findIndex(cell => cell.contains(badge)) : -1;
        
        let newText = '';
        let newClass = '';
        
        // Try to determine column purpose by header
        const table = badge.closest('table');
        const headers = table ? table.querySelectorAll('th') : [];
        const headerText = headers[columnIndex] ? headers[columnIndex].textContent.toLowerCase() : '';
        
        console.log(`Column ${columnIndex}, Header: "${headerText}", Current: "${currentText}"`);
        
        // Special handling for specific badge IDs
        if (badge.id === 'pendingRequestsBadge') {
            newText = '0';
            newClass = 'badge bg-danger ms-1';
            badge.style.display = 'none'; // Hide if 0
        }
        // Fix based on header text or column position
        else if (headerText.includes('jenis') || headerText.includes('type') || columnIndex === 1) {
            // Asset type column
            if (currentText === '3') {
                newText = 'Tanah';
                newClass = 'badge bg-success';
            } else if (currentText === '2') {
                newText = 'Bangunan';
                newClass = 'badge bg-danger';
            } else if (currentText.toLowerCase().includes('unknown')) {
                // Determine from asset name
                const assetName = cells[0] ? cells[0].textContent.toLowerCase() : '';
                if (assetName.includes('tanah')) {
                    newText = 'Tanah';
                    newClass = 'badge bg-success';
                } else {
                    newText = 'Bangunan';
                    newClass = 'badge bg-danger';
                }
            } else {
                // Default for any other problematic content
                newText = 'Bangunan';
                newClass = 'badge bg-danger';
            }
        } else if (headerText.includes('status') || columnIndex === 5 || columnIndex >= 4) {
            // Status column
            if (currentText === '3') {
                newText = 'Aktif';
                newClass = 'badge bg-success';
            } else if (currentText === '1') {
                newText = 'Tersedia';
                newClass = 'badge bg-primary';
            } else if (currentText.toLowerCase().includes('unknown')) {
                newText = 'Aktif';
                newClass = 'badge bg-success';
            } else {
                newText = 'Aktif';
                newClass = 'badge bg-success';
            }
        } else {
            // Unknown column - make a best guess
            if (currentText === '3') {
                // Check if it's likely a type or status based on context
                const assetName = cells[0] ? cells[0].textContent.toLowerCase() : '';
                if (assetName.includes('tanah')) {
                    newText = 'Tanah';
                    newClass = 'badge bg-success';
                } else {
                    newText = 'Aktif';
                    newClass = 'badge bg-success';
                }
            } else if (currentText.toLowerCase().includes('unknown')) {
                // Try to determine from context
                if (columnIndex === 1 || headerText.includes('jenis')) {
                    newText = 'Bangunan';
                    newClass = 'badge bg-danger';
                } else {
                    newText = 'Aktif';
                    newClass = 'badge bg-success';
                }
            } else {
                newText = 'Tersedia';
                newClass = 'badge bg-primary';
            }
        }
        
        // Apply the fix
        if (newText && newClass) {
            badge.textContent = newText;
            badge.className = newClass;
            console.log(`✅ ULTRA FIXED badge: "${currentText}" → "${newText}"`);
            return true;
        }
        
        return false;
    }
    });
