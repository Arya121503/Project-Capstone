// User Notifications Management
class UserNotificationManager {
    constructor() {
        this.notificationDropdown = document.getElementById('userNotificationsDropdown');
        this.notificationToggle = document.getElementById('notificationToggleBtn');
        this.notificationBadge = document.querySelector('.user-notification-badge');
        this.notificationContent = document.getElementById('userNotificationsDropdownContent') || 
                                   document.querySelector('.notification-dropdown .dropdown-content');
        
        this.unreadCount = 0;
        this.notifications = [];
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadNotifications();
        this.startPolling();
    }
    
    setupEventListeners() {
        // Toggle dropdown
        if (this.notificationToggle) {
            this.notificationToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.notification-container')) {
                this.closeDropdown();
            }
        });
        
        // Mark all as read button
        document.addEventListener('click', (e) => {
            if (e.target.matches('#markAllUserNotificationsRead')) {
                e.preventDefault();
                this.markAllAsRead();
            }
        });
        
        // Individual notification click handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.notification-item:not(.read)')) {
                const notificationId = e.target.dataset.notificationId;
                if (notificationId) {
                    this.markAsRead(notificationId);
                }
            }
        });
    }
    
    async loadNotifications() {
        try {
            const response = await fetch('/api/user/notifications?per_page=10');
            const data = await response.json();
            
            if (data.success) {
                this.notifications = data.data;
                this.unreadCount = data.unread_count;
                this.updateBadge();
                this.renderNotifications();
            } else {
                console.error('Failed to load notifications:', data.error);
                this.showError('Gagal memuat notifikasi');
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showError('Terjadi kesalahan saat memuat notifikasi');
        }
    }
    
    async loadUnreadCount() {
        try {
            const response = await fetch('/api/user/notifications/unread-count');
            const data = await response.json();
            
            if (data.success) {
                this.unreadCount = data.unread_count;
                this.updateBadge();
            }
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    }
    
    updateBadge() {
        if (this.notificationBadge) {
            if (this.unreadCount > 0) {
                this.notificationBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                this.notificationBadge.style.display = 'flex';
            } else {
                this.notificationBadge.style.display = 'none';
            }
        }
    }
    
    renderNotifications() {
        if (!this.notificationContent) return;
        
        if (this.notifications.length === 0) {
            this.notificationContent.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-bell-slash text-muted mb-2" style="font-size: 2rem;"></i>
                    <p class="mb-0 text-muted">Tidak ada notifikasi</p>
                </div>
            `;
            return;
        }
        
        const notificationsHtml = this.notifications.map(notification => {
            const isRead = notification.is_read;
            const timeAgo = this.formatTimeAgo(notification.created_at);
            const statusIcon = this.getStatusIcon(notification);
            
            return `
                <div class="notification-item ${isRead ? 'read' : 'unread'}" 
                     data-notification-id="${notification.id}"
                     style="padding: 12px 16px; border-bottom: 1px solid #eee; cursor: pointer; ${!isRead ? 'background-color: #f8f9ff;' : ''}">
                    <div class="d-flex align-items-start">
                        <div class="notification-icon me-3">
                            ${statusIcon}
                        </div>
                        <div class="notification-content flex-grow-1">
                            <h6 class="notification-title mb-1 ${!isRead ? 'fw-bold' : ''}" 
                                style="font-size: 0.9rem; color: ${!isRead ? '#2c3e50' : '#6c757d'};">
                                ${notification.title}
                            </h6>
                            <p class="notification-message mb-1" 
                               style="font-size: 0.8rem; color: #6c757d; line-height: 1.4;">
                                ${this.truncateMessage(notification.message, 100)}
                            </p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">${timeAgo}</small>
                                ${notification.rental_request ? `
                                    <span class="badge ${this.getStatusBadgeClass(notification.rental_request.status)} badge-sm">
                                        ${notification.rental_request.status_label}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        ${!isRead ? '<div class="notification-dot" style="width: 8px; height: 8px; background: var(--telkom-red); border-radius: 50%; flex-shrink: 0;"></div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        this.notificationContent.innerHTML = notificationsHtml;
    }
    
    async refreshUnreadCount() {
        try {
            const response = await fetch('/api/user/notifications/unread-count');
            const data = await response.json();
            
            if (data.success) {
                this.unreadCount = data.unread_count;
                this.updateBadge();
            }
        } catch (error) {
            console.error('Error refreshing unread count:', error);
        }
    }
    
    updateBadge() {
        if (!this.notificationBadge) return;
        
        if (this.unreadCount > 0) {
            this.notificationBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            this.notificationBadge.style.display = 'flex';
        } else {
            this.notificationBadge.style.display = 'none';
        }
    }
    
    renderNotifications() {
        const container = document.getElementById('userNotificationsDropdownContent');
        if (!container) return;
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-bell-slash fa-2x text-muted mb-2"></i>
                    <p class="mb-0 text-muted">Tidak ada notifikasi</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.notifications.forEach(notification => {
            const isUnread = !notification.is_read;
            const createdDate = new Date(notification.created_at);
            const timeAgo = this.getTimeAgo(createdDate);
            
            html += `
                <div class="dropdown-item notification-item ${isUnread ? 'unread' : ''}" 
                     data-notification-id="${notification.id}">
                    <div class="d-flex align-items-start">
                        <div class="notification-icon me-3">
                            ${this.getNotificationIcon(notification.related_type)}
                        </div>
                        <div class="notification-content flex-grow-1">
                            <h6 class="notification-title mb-1 ${isUnread ? 'fw-bold' : ''}">${notification.title}</h6>
                            <p class="notification-message mb-1 text-muted">${notification.message}</p>
                            ${this.renderNotificationExtra(notification)}
                            <small class="text-muted">${timeAgo}</small>
                        </div>
                        ${isUnread ? '<div class="unread-indicator bg-primary rounded-circle"></div>' : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Add click handlers for notifications
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const notificationId = parseInt(item.dataset.notificationId);
                this.markNotificationRead(notificationId);
                this.handleNotificationClick(notificationId);
            });
        });
    }
    
    renderNotificationExtra(notification) {
        if (notification.related_type === 'rental_request' && notification.rental_request) {
            const request = notification.rental_request;
            const statusClass = this.getStatusClass(request.status);
            
            return `
                <div class="notification-extra mt-2">
                    <small class="text-muted">Aset: ${request.asset_name}</small><br>
                    <span class="badge badge-${statusClass} rounded-pill">${request.status}</span>
                </div>
            `;
        }
        return '';
    }
    
    getNotificationIcon(type) {
        const icons = {
            'rental_request': '<i class="fas fa-home text-primary"></i>',
            'rental_extension': '<i class="fas fa-calendar-plus text-info"></i>',
            'payment': '<i class="fas fa-money-bill text-success"></i>',
            'system': '<i class="fas fa-cog text-secondary"></i>'
        };
        return icons[type] || '<i class="fas fa-bell text-primary"></i>';
    }
    
    getStatusClass(status) {
        const classes = {
            'pending': 'warning',
            'approved': 'success',
            'active': 'success',
            'rejected': 'danger',
            'completed': 'secondary'
        };
        return classes[status] || 'secondary';
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        if (days < 7) return `${days} hari lalu`;
        
        return date.toLocaleDateString('id-ID');
    }
    
    async markNotificationRead(notificationId) {
        try {
            const response = await fetch(`/api/user/notifications/${notificationId}/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            if (data.success) {
                // Update local state
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification) {
                    notification.is_read = true;
                }
                this.unreadCount = data.unread_count;
                this.updateBadge();
                this.renderNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    
    async markAllNotificationsRead() {
        try {
            const response = await fetch('/api/user/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            if (data.success) {
                // Update local state
                this.notifications.forEach(n => n.is_read = true);
                this.unreadCount = 0;
                this.updateBadge();
                this.renderNotifications();
                
                this.showSuccess('Semua notifikasi telah ditandai sebagai dibaca');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            this.showError('Gagal menandai semua notifikasi sebagai dibaca');
        }
    }
    
    handleNotificationClick(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        // Handle different notification types
        if (notification.related_type === 'rental_request') {
            // Navigate to rental applications page
            window.location.href = '/user/rental-applications';
        } else if (notification.related_type === 'rental_extension') {
            // Navigate to rental transactions page
            window.location.href = '/user/rental-transactions';
        }
        
        this.closeDropdown();
    }
    
    showSuccess(message) {
        // You can customize this to use your preferred notification system
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: message,
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            alert(message);
        }
    }
    
    showError(message) {
        // You can customize this to use your preferred notification system
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message
            });
        } else {
            alert(message);
        }
    }
    
    showError(message) {
        console.error(message);
        const container = document.getElementById('userNotificationsDropdownContent');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
                    <p class="mb-0 text-danger">${message}</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.userNotificationsManager = new UserNotificationsManager();
});

// CSS for notification styles
const notificationStyles = `
<style>
.notification-item {
    padding: 12px 16px;
    border-bottom: 1px solid #e9ecef;
    cursor: pointer;
    transition: background-color 0.2s;
}

.notification-item:hover {
    background-color: #f8f9fa;
}

.notification-item.unread {
    background-color: #f0f8ff;
    border-left: 3px solid var(--telkom-red, #e74c3c);
}

.notification-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    border-radius: 50%;
}

.notification-content {
    min-width: 0; /* Allows text to wrap properly */
}

.notification-title {
    font-size: 14px;
    line-height: 1.4;
    margin: 0;
}

.notification-message {
    font-size: 13px;
    line-height: 1.3;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.unread-indicator {
    width: 8px;
    height: 8px;
    margin-left: 8px;
    flex-shrink: 0;
}

.notification-extra {
    font-size: 12px;
}

.notification-extra .badge {
    font-size: 10px;
    padding: 2px 6px;
}

#userNotificationsDropdown {
    min-width: 350px;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #dee2e6;
    border-radius: 8px;
}

.dropdown-header {
    background-color: #f8f9fa !important;
    border-bottom: 1px solid #dee2e6;
    padding: 12px 16px !important;
}

.user-notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 18px;
    height: 18px;
    background-color: var(--telkom-red, #e74c3c);
    color: white;
    font-size: 10px;
    border-radius: 50%;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    font-weight: bold;
    z-index: 10;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', notificationStyles);
