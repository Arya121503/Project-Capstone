// User Notification System
class UserNotificationSystem {
    constructor() {
        this.notificationContainer = document.getElementById('notificationToggleBtn');
        this.notificationDropdown = document.getElementById('userNotificationsDropdown');
        this.notificationBadge = document.querySelector('.user-notification-badge');
        this.dropdownContent = document.getElementById('userNotificationsDropdownContent');
        this.markAllReadBtn = document.getElementById('markAllUserNotificationsRead');
        
        this.init();
    }
    
    init() {
        if (!this.notificationContainer) return;
        
        // Event listeners
        this.notificationContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        if (this.markAllReadBtn) {
            this.markAllReadBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.notificationContainer.contains(e.target) && 
                !this.notificationDropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // Initial load
        this.loadNotifications();
        this.updateUnreadCount();
        
        // Auto refresh every 30 seconds
        setInterval(() => {
            this.updateUnreadCount();
        }, 30000);
    }
    
    toggleDropdown() {
        if (this.notificationDropdown.style.display === 'none' || 
            this.notificationDropdown.style.display === '') {
            this.openDropdown();
        } else {
            this.closeDropdown();
        }
    }
    
    openDropdown() {
        this.notificationDropdown.style.display = 'block';
        this.loadNotifications();
        
        // Add animation
        this.notificationDropdown.style.opacity = '0';
        this.notificationDropdown.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            this.notificationDropdown.style.opacity = '1';
            this.notificationDropdown.style.transform = 'translateY(0)';
        }, 10);
    }
    
    closeDropdown() {
        this.notificationDropdown.style.opacity = '0';
        this.notificationDropdown.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            this.notificationDropdown.style.display = 'none';
        }, 200);
    }
    
    async loadNotifications() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/user/notifications?per_page=10');
            const data = await response.json();
            
            if (data.success) {
                this.renderNotifications(data.data);
                this.updateBadge(data.unread_count);
            } else {
                this.showError('Gagal memuat notifikasi');
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showError('Terjadi kesalahan saat memuat notifikasi');
        }
    }
    
    async updateUnreadCount() {
        try {
            const response = await fetch('/api/user/notifications/unread-count');
            const data = await response.json();
            
            if (data.success) {
                this.updateBadge(data.unread_count);
            }
        } catch (error) {
            console.error('Error updating unread count:', error);
        }
    }
    
    renderNotifications(notifications) {
        if (notifications.length === 0) {
            this.dropdownContent.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-bell-slash text-muted mb-2" style="font-size: 2rem;"></i>
                    <p class="text-muted mb-0">Tidak ada notifikasi</p>
                </div>
            `;
            return;
        }
        
        const notificationHtml = notifications.map(notification => {
            const isUnread = !notification.is_read;
            const createdAt = new Date(notification.created_at);
            const timeAgo = this.getTimeAgo(createdAt);
            
            // Icon based on notification type
            let icon = 'fas fa-info-circle';
            let iconColor = 'text-info';
            
            if (notification.related_type === 'rental_request') {
                if (notification.title.includes('Disetujui')) {
                    icon = 'fas fa-check-circle';
                    iconColor = 'text-success';
                } else if (notification.title.includes('Ditolak')) {
                    icon = 'fas fa-times-circle';
                    iconColor = 'text-danger';
                } else {
                    icon = 'fas fa-home';
                    iconColor = 'text-primary';
                }
            }
            
            return `
                <div class="notification-item p-3 border-bottom ${isUnread ? 'bg-light' : ''}" 
                     data-notification-id="${notification.id}" 
                     data-related-type="${notification.related_type}"
                     data-related-id="${notification.related_id}">
                    <div class="d-flex">
                        <div class="flex-shrink-0 me-2">
                            <i class="${icon} ${iconColor}"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start">
                                <h6 class="mb-1 ${isUnread ? 'fw-bold' : ''}">${notification.title}</h6>
                                ${isUnread ? '<span class="badge bg-primary rounded-pill">Baru</span>' : ''}
                            </div>
                            <p class="mb-1 text-muted small">${notification.message}</p>
                            <small class="text-muted">${timeAgo}</small>
                            ${isUnread ? `
                                <div class="mt-2">
                                    <button class="btn btn-sm btn-outline-primary mark-read-btn" 
                                            data-notification-id="${notification.id}">
                                        Tandai Dibaca
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.dropdownContent.innerHTML = notificationHtml;
        
        // Add event listeners to mark read buttons
        this.dropdownContent.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const notificationId = btn.getAttribute('data-notification-id');
                this.markAsRead(notificationId);
            });
        });
        
        // Add click handlers for notification items
        this.dropdownContent.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const relatedType = item.getAttribute('data-related-type');
                const relatedId = item.getAttribute('data-related-id');
                const notificationId = item.getAttribute('data-notification-id');
                
                // Mark as read if unread
                if (item.classList.contains('bg-light')) {
                    this.markAsRead(notificationId);
                }
                
                // Navigate to related content
                this.handleNotificationClick(relatedType, relatedId);
            });
        });
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
                // Update UI
                const notificationItem = document.querySelector(`[data-notification-id="${notificationId}"]`);
                if (notificationItem) {
                    notificationItem.classList.remove('bg-light');
                    notificationItem.querySelector('.fw-bold')?.classList.remove('fw-bold');
                    notificationItem.querySelector('.badge')?.remove();
                    notificationItem.querySelector('.mark-read-btn')?.remove();
                }
                
                this.updateBadge(data.unread_count);
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
                // Refresh notifications
                this.loadNotifications();
                this.updateBadge(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
    
    updateBadge(count) {
        if (count > 0) {
            this.notificationBadge.textContent = count > 99 ? '99+' : count;
            this.notificationBadge.style.display = 'flex';
        } else {
            this.notificationBadge.style.display = 'none';
        }
    }
    
    handleNotificationClick(relatedType, relatedId) {
        // Close dropdown
        this.closeDropdown();
        
        // Navigate based on notification type
        if (relatedType === 'rental_request' && relatedId) {
            // Navigate to rental application detail
            window.location.href = `/user/rental-applications/${relatedId}`;
        } else if (relatedType === 'rental_extension' && relatedId) {
            // Navigate to rental transaction detail
            window.location.href = `/user/rental-transactions/${relatedId}`;
        } else {
            // Default: go to notifications page
            window.location.href = '/user/history#notifications';
        }
    }
    
    showLoading() {
        this.dropdownContent.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mb-0 mt-2 text-muted">Memuat notifikasi...</p>
            </div>
        `;
    }
    
    showError(message) {
        this.dropdownContent.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-exclamation-triangle text-warning mb-2" style="font-size: 2rem;"></i>
                <p class="text-muted mb-0">${message}</p>
            </div>
        `;
    }
    
    getTimeAgo(date) {
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new UserNotificationSystem();
});

// Export for use in other scripts
window.UserNotificationSystem = UserNotificationSystem;
