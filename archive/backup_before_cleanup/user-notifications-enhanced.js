// Enhanced User Notifications Management
class UserNotificationManager {
    constructor() {
        this.notificationDropdown = document.getElementById('userNotificationsDropdown');
        this.notificationToggle = document.getElementById('notificationToggleBtn');
        this.notificationBadge = document.querySelector('.user-notification-badge');
        this.notificationContent = document.getElementById('userNotificationsDropdownContent') || 
                                   document.querySelector('#userNotificationsDropdown .dropdown-content');
        
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
            if (e.target.closest('.notification-item:not(.read)')) {
                const notificationItem = e.target.closest('.notification-item');
                const notificationId = notificationItem.dataset.notificationId;
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
        if (!this.notificationContent) {
            console.warn('Notification content container not found');
            return;
        }
        
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
                                        ${notification.rental_request.status_label || notification.rental_request.status}
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
    
    getStatusIcon(notification) {
        if (notification.related_type === 'rental_request' && notification.rental_request) {
            const status = notification.rental_request.status;
            switch (status) {
                case 'approved':
                case 'active':
                    return '<i class="fas fa-check-circle text-success"></i>';
                case 'rejected':
                    return '<i class="fas fa-times-circle text-danger"></i>';
                case 'pending':
                    return '<i class="fas fa-clock text-warning"></i>';
                default:
                    return '<i class="fas fa-info-circle text-info"></i>';
            }
        }
        return '<i class="fas fa-bell text-primary"></i>';
    }
    
    getStatusBadgeClass(status) {
        switch (status) {
            case 'approved':
            case 'active':
                return 'bg-success';
            case 'rejected':
                return 'bg-danger';
            case 'pending':
                return 'bg-warning';
            default:
                return 'bg-secondary';
        }
    }
    
    truncateMessage(message, maxLength) {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    }
    
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Baru saja';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} menit yang lalu`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} jam yang lalu`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} hari yang lalu`;
        } else {
            return date.toLocaleDateString('id-ID');
        }
    }
    
    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        if (this.notificationDropdown) {
            this.notificationDropdown.style.display = 'block';
            this.isOpen = true;
            
            // Load fresh notifications when opening
            this.loadNotifications();
        }
    }
    
    closeDropdown() {
        if (this.notificationDropdown) {
            this.notificationDropdown.style.display = 'none';
            this.isOpen = false;
        }
    }
    
    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/api/user/notifications/${notificationId}/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update local notification state
                const notification = this.notifications.find(n => n.id == notificationId);
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
    
    async markAllAsRead() {
        try {
            const response = await fetch('/api/user/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update all notifications to read
                this.notifications.forEach(notification => {
                    notification.is_read = true;
                });
                
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
    
    startPolling() {
        // Poll for new notifications every 30 seconds
        setInterval(() => {
            if (!this.isOpen) {
                this.loadUnreadCount();
            }
        }, 30000);
    }
    
    showSuccess(message) {
        this.showToast(message, 'success');
    }
    
    showError(message) {
        this.showToast(message, 'error');
    }
    
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

// Initialize notification manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window !== 'undefined') {
        window.userNotificationManager = new UserNotificationManager();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserNotificationManager;
}
