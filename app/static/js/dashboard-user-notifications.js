/**
 * Dashboard User Notifications
 * Handles user notifications display and interaction
 */

// Global variables
let userNotifications = [];
let unreadNotificationsCount = 0;

// Fetch notifications from API
async function fetchNotifications() {
    try {
        const response = await fetch('/api/user-notifications');
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load notifications');
        }
        
        userNotifications = result.data;
        unreadNotificationsCount = userNotifications.filter(n => !n.is_read).length;
        
        // Update notification badge
        updateNotificationBadge();
        
        // Update notification dropdown
        updateNotificationDropdown();
        
        // Update notification tab if it exists
        updateNotificationTab();
        
        return userNotifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

// Update notification badge
function updateNotificationBadge() {
    const badge = document.querySelector('.user-notification-badge');
    
    if (unreadNotificationsCount > 0) {
        badge.textContent = unreadNotificationsCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Update notification dropdown content
function updateNotificationDropdown() {
    const dropdownContent = document.getElementById('userNotificationsDropdownContent');
    
    if (!dropdownContent) return;
    
    if (userNotifications.length === 0) {
        dropdownContent.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-bell-slash fa-2x text-muted mb-2"></i>
                <p class="mb-0">Tidak ada notifikasi</p>
            </div>
        `;
        return;
    }
    
    let notificationHTML = '';
    
    // Sort notifications by date (newest first)
    const sortedNotifications = [...userNotifications].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    // Show only the latest 5 notifications in dropdown
    const recentNotifications = sortedNotifications.slice(0, 5);
    
    recentNotifications.forEach(notification => {
        const date = new Date(notification.created_at);
        const formattedDate = date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        notificationHTML += `
            <div class="notification-item p-2 border-bottom ${notification.is_read ? '' : 'bg-light'}">
                <div class="d-flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-${notification.type === 'success' ? 'check-circle text-success' : 'times-circle text-danger'} fa-lg mt-1"></i>
                    </div>
                    <div class="flex-grow-1 ms-2">
                        <p class="mb-1">${notification.message}</p>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                </div>
            </div>
        `;
    });
    
    dropdownContent.innerHTML = notificationHTML;
}

// Update notification tab content
function updateNotificationTab() {
    const notificationContainer = document.getElementById('notifikasiContainer');
    
    if (!notificationContainer) return;
    
    if (userNotifications.length === 0) {
        notificationContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                <h5>Tidak ada notifikasi</h5>
                <p class="text-muted">Anda belum memiliki notifikasi apapun</p>
            </div>
        `;
        return;
    }
    
    let notificationHTML = '';
    
    // Sort notifications by date (newest first)
    const sortedNotifications = [...userNotifications].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    sortedNotifications.forEach(notification => {
        const date = new Date(notification.created_at);
        const formattedDate = date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        notificationHTML += `
            <div class="card mb-3 ${notification.is_read ? '' : 'border-left-info'}">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-2">
                        <div class="flex-shrink-0">
                            <i class="fas fa-${notification.type === 'success' ? 'check-circle text-success' : 'times-circle text-danger'} fa-2x"></i>
                        </div>
                        <div class="flex-grow-1 ms-3">
                            <h6 class="mb-0">${notification.type === 'success' ? 'Pengajuan Disetujui' : 'Pengajuan Ditolak'}</h6>
                            <small class="text-muted">${formattedDate}</small>
                        </div>
                    </div>
                    <p class="mb-0">${notification.message}</p>
                </div>
            </div>
        `;
    });
    
    notificationContainer.innerHTML = notificationHTML;
}

// Toggle notification dropdown
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('userNotificationsDropdown');
    
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

// Mark all notifications as read
async function markAllNotificationsAsRead() {
    try {
        // In a real implementation, this would call an API endpoint
        // For now, we'll just update the local state
        userNotifications.forEach(notification => {
            notification.is_read = true;
        });
        
        unreadNotificationsCount = 0;
        
        // Update UI
        updateNotificationBadge();
        updateNotificationDropdown();
        updateNotificationTab();
        
        return true;
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return false;
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set up mark all as read button
    const markAllReadBtn = document.getElementById('markAllUserNotificationsRead');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            markAllNotificationsAsRead();
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('userNotificationsDropdown');
        const toggleBtn = document.getElementById('notificationToggleBtn');
        
        if (dropdown && toggleBtn) {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        }
    });
});