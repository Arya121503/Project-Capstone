/* 
 * Modal Fix - Prevents modal backdrop issues and ensures proper modal cleanup
 * This script fixes issues with modals getting stuck and preventing further interaction
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Modal fix script loaded');
    
    // Function to properly remove modal backdrops
    function cleanupModals() {
        // Remove any stuck backdrops
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.remove();
        });
        
        // Reset body classes
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
    
    // Patch Bootstrap modals to ensure proper cleanup
    if (typeof bootstrap !== 'undefined') {
        // Listen for when any modal is hidden
        document.addEventListener('hidden.bs.modal', function() {
            // Give a small delay to ensure Bootstrap has done its work
            setTimeout(cleanupModals, 100);
        });
    }
    
    // Add event listeners to all close buttons within modals
    document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(cleanupModals, 100);
        });
    });
    
    // Setup direct modal control functions for global use
    window.modalControls = {
        show: function(modalId) {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) return false;
            
            try {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                return true;
            } catch (error) {
                console.error(`Error showing modal ${modalId}:`, error);
                return false;
            }
        },
        
        hide: function(modalId) {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) return false;
            
            try {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                    setTimeout(cleanupModals, 100);
                    return true;
                }
            } catch (error) {
                console.error(`Error hiding modal ${modalId}:`, error);
            }
            
            // Fallback method if the Bootstrap instance method fails
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            cleanupModals();
            return true;
        },
        
        cleanup: cleanupModals
    };
    
    // Patch the existing viewAssetDetail, editAsset, and deleteAsset functions
    if (window.rentalAssetManager) {
        // Store original functions
        const originalViewAsset = window.rentalAssetManager.viewAssetDetail;
        const originalEditAsset = window.rentalAssetManager.editAsset;
        const originalDeleteAsset = window.rentalAssetManager.deleteAsset;
        
        // Replace with patched versions that ensure cleanup
        if (originalViewAsset) {
            window.rentalAssetManager.viewAssetDetail = function(assetId) {
                cleanupModals(); // Clean up any existing modals first
                return originalViewAsset.call(window.rentalAssetManager, assetId);
            };
        }
        
        if (originalEditAsset) {
            window.rentalAssetManager.editAsset = function(assetId) {
                cleanupModals(); // Clean up any existing modals first
                return originalEditAsset.call(window.rentalAssetManager, assetId);
            };
        }
        
        if (originalDeleteAsset) {
            window.rentalAssetManager.deleteAsset = function(assetId, assetName) {
                cleanupModals(); // Clean up any existing modals first
                return originalDeleteAsset.call(window.rentalAssetManager, assetId, assetName);
            };
        }
    }
    
    // Initial cleanup in case the page loaded with stuck modals
    cleanupModals();
});
