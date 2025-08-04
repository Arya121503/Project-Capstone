// Admin Notification Fix - Enhanced notification system
// This file provides enhanced admin notification functionality

console.log('🔔 Admin notification fix script loaded');

class AdminNotificationFix {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        console.log('🔧 Setting up admin notification fixes...');
        
        // Ensure notification system is working
        this.ensureNotificationSystem();
        
        // Fix any missing elements
        this.fixMissingElements();
        
        // Start periodic checks
        this.startPeriodicChecks();
        
        console.log('✅ Admin notification fixes applied');
    }

    ensureNotificationSystem() {
        // Check if main notification system is loaded
        if (typeof window.adminNotificationSystem === 'undefined') {
            console.log('🔄 Main notification system not found, initializing fallback...');
            this.initializeFallbackSystem();
        } else {
            console.log('✅ Main notification system is available');
        }
    }

    initializeFallbackSystem() {
        // Create a simple fallback notification system
        window.adminNotificationSystem = {
            loadNotifications: () => this.loadNotificationsFallback(),
            loadNotificationCount: () => this.loadNotificationCountFallback(),
            markAsRead: (id) => this.markAsReadFallback(id),
            markAllAsRead: () => this.markAllAsReadFallback()
        };
    }

    async loadNotificationsFallback() {
        try {
            const response = await fetch('/api/admin/notifications?per_page=5');
            const data = await response.json();
            
            if (data.success) {
                this.updateNotificationUI(data.data);
                this.updateBadge(data.data);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    async loadNotificationCountFallback() {
        try {
            const response = await fetch('/api/admin/notifications/count');
            const data = await response.json();
            
            if (data.success) {
                this.updateBadgeCount(data.unread_count);
            }
        } catch (error) {
            console.error('Error loading notification count:', error);
        }
    }

    async markAsReadFallback(notificationId) {
        try {
            const response = await fetch(`/api/admin/notifications/${notificationId}/mark-read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                console.log(`✅ Notification ${notificationId} marked as read`);
                this.loadNotificationsFallback();
                this.loadNotificationCountFallback();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsReadFallback() {
        try {
            const response = await fetch('/api/admin/notifications/mark-all-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                console.log('✅ All notifications marked as read');
                this.loadNotificationsFallback();
                this.loadNotificationCountFallback();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    updateNotificationUI(notifications) {
        const container = document.getElementById('notificationsDropdownContent');
        if (!container) return;

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="notification-empty text-center p-3">
                    <i class="fas fa-bell-slash fa-2x text-muted mb-2"></i>
                    <p class="mb-0">Tidak ada notifikasi</p>
                </div>
            `;
            return;
        }

        let html = '';
        notifications.forEach(notification => {
            const timeAgo = this.timeAgo(new Date(notification.created_at));
            const unreadClass = notification.is_read ? '' : 'fw-bold bg-light';
            
            html += `
                <div class="notification-item ${unreadClass} p-2 border-bottom" onclick="window.adminNotificationSystem.markAsRead(${notification.id})">
                    <h6 class="mb-1">${notification.title}</h6>
                    <p class="mb-1 small text-muted">${notification.message}</p>
                    <small class="text-muted">${timeAgo}</small>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    updateBadge(notifications) {
        const unreadCount = notifications.filter(n => !n.is_read).length;
        this.updateBadgeCount(unreadCount);
    }

    updateBadgeCount(count) {
        const badges = document.querySelectorAll('.notification-badge, .badge');
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count.toString();
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }
        });
    }

    fixMissingElements() {
        // Ensure notification dropdown exists
        if (!document.getElementById('notificationDropdown')) {
            console.log('🔧 Creating missing notification dropdown...');
            this.createNotificationDropdown();
        }

        // Ensure notification bell exists
        if (!document.getElementById('notificationBell')) {
            console.log('🔧 Creating missing notification bell...');
            this.createNotificationBell();
        }
    }

    createNotificationDropdown() {
        const dropdown = document.createElement('div');
        dropdown.id = 'notificationDropdown';
        dropdown.className = 'notification-dropdown d-none';
        dropdown.innerHTML = `
            <div class="notification-header p-2 bg-primary text-white">
                <h6 class="mb-0">Notifikasi</h6>
            </div>
            <div id="notificationsDropdownContent" class="notification-content">
                <div class="text-center p-3">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
            <div class="notification-footer p-2 text-center border-top">
                <a href="#" class="text-decoration-none" onclick="window.adminNotificationSystem.markAllAsRead()">
                    Tandai Semua Dibaca
                </a>
            </div>
        `;
        
        document.body.appendChild(dropdown);
    }

    createNotificationBell() {
        // Try to find a suitable location for the notification bell
        const navbar = document.querySelector('.navbar, .topbar, header');
        if (navbar) {
            const bell = document.createElement('div');
            bell.id = 'notificationBell';
            bell.className = 'notification-bell position-relative cursor-pointer';
            bell.innerHTML = `
                <i class="fas fa-bell fa-lg"></i>
                <span class="notification-badge badge bg-danger position-absolute top-0 start-100 translate-middle d-none">0</span>
            `;
            
            bell.addEventListener('click', () => {
                const dropdown = document.getElementById('notificationDropdown');
                if (dropdown) {
                    dropdown.classList.toggle('d-none');
                }
            });
            
            navbar.appendChild(bell);
        }
    }

    startPeriodicChecks() {
        // Load initial data
        this.loadNotificationsFallback();
        this.loadNotificationCountFallback();
        
        // Set up periodic refresh
        setInterval(() => {
            this.loadNotificationCountFallback();
        }, 30000); // Check every 30 seconds
    }

    timeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Baru saja';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
        return `${Math.floor(seconds / 86400)} hari lalu`;
    }
}

// Initialize the admin notification fix system
const adminNotificationFix = new AdminNotificationFix();

// Make it globally available
window.adminNotificationFix = adminNotificationFix;
