// Admin Notification System
// Prevent duplicate class declaration
if (typeof AdminNotificationSystem === 'undefined') {
    window.AdminNotificationSystem = class AdminNotificationSystem {
        constructor() {
            this.isInitialized = false;
            this.notificationDropdown = null;
            this.notificationBell = null;
            this.notificationBadge = null;
            this.currentNotifications = [];
            this.pollInterval = null;
            this.init();
        }

        init() {
            if (this.isInitialized) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        // Get DOM elements
        this.notificationBell = document.getElementById('notificationBell');
        this.notificationDropdown = document.getElementById('notificationDropdown');
        this.notificationBadge = this.notificationBell?.querySelector('.notification-badge');
        
        if (!this.notificationBell || !this.notificationDropdown) {
            console.warn('Notification elements not found in DOM');
            return;
        }

        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial notifications
        this.loadNotifications();
        
        // Start polling for new notifications every 30 seconds
        this.startPolling();
        
        this.isInitialized = true;
        console.log('Admin notification system initialized');
    }

    setupEventListeners() {
        // Toggle dropdown on bell click
        this.notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.notificationDropdown.contains(e.target) && 
                !this.notificationBell.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Mark all as read button
        const markAllReadBtn = document.getElementById('markAllNotificationsRead');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => this.markAllAsRead());
        }

        // View all notifications link
        const viewAllLink = this.notificationDropdown.querySelector('.notification-footer a');
        if (viewAllLink) {
            viewAllLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAllNotificationsModal();
            });
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('/api/admin/notifications?per_page=5&only_unread=false');
            const data = await response.json();
            
            if (data.success) {
                this.currentNotifications = data.data;
                this.updateBadge();
                this.renderNotifications();
            } else {
                console.error('Failed to load notifications:', data.error);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    async loadNotificationCount() {
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

    updateBadge() {
        const unreadCount = this.currentNotifications.filter(n => !n.is_read).length;
        this.updateBadgeCount(unreadCount);
    }

    updateBadgeCount(count) {
        if (!this.notificationBadge) return;
        
        if (count > 0) {
            this.notificationBadge.textContent = count > 99 ? '99+' : count.toString();
            this.notificationBadge.classList.remove('d-none');
        } else {
            this.notificationBadge.classList.add('d-none');
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationsDropdownContent');
        if (!container) return;

        if (this.currentNotifications.length === 0) {
            container.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <h6>Tidak ada notifikasi</h6>
                    <p>Semua notifikasi akan muncul di sini</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.currentNotifications.forEach(notification => {
            const timeAgo = this.timeAgo(new Date(notification.created_at));
            const unreadClass = notification.is_read ? '' : 'unread';
            
            html += `
                <div class="notification-item ${unreadClass}" data-notification-id="${notification.id}">
                    <div class="notification-content">
                        <h6 class="notification-title">${notification.title}</h6>
                        <p class="notification-message">${notification.message}</p>
                        <p class="notification-time">${timeAgo}</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add click handlers for notification items
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const notificationId = item.dataset.notificationId;
                const notification = this.currentNotifications.find(n => n.id == notificationId);
                if (notification) {
                    this.handleNotificationClick(notification);
                }
            });
        });
    }

    toggleDropdown() {
        if (this.notificationDropdown.classList.contains('d-none')) {
            this.openDropdown();
        } else {
            this.closeDropdown();
        }
    }

    openDropdown() {
        this.notificationDropdown.classList.remove('d-none');
        // Refresh notifications when opening
        this.loadNotifications();
    }

    closeDropdown() {
        this.notificationDropdown.classList.add('d-none');
    }

    async handleNotificationClick(notification) {
        // Mark as read if unread
        if (!notification.is_read) {
            await this.markAsRead(notification.id);
        }

        // Handle different notification types
        if (notification.related_type === 'rental_request' && notification.related_id) {
            this.showRentalRequestDetail(notification.related_id);
        }

        this.closeDropdown();
    }

    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/api/admin/notifications/${notificationId}/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Update local state
                const notification = this.currentNotifications.find(n => n.id == notificationId);
                if (notification) {
                    notification.is_read = true;
                }
                this.updateBadge();
                this.renderNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const response = await fetch('/api/admin/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Update all notifications to read
                this.currentNotifications.forEach(n => n.is_read = true);
                this.updateBadge();
                this.renderNotifications();
                this.showToast('Semua notifikasi telah ditandai sebagai dibaca', 'success');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            this.showToast('Gagal menandai notifikasi sebagai dibaca', 'error');
        }
    }

    async showRentalRequestDetail(requestId) {
        try {
            const response = await fetch(`/api/admin/rental-requests/${requestId}`);
            const data = await response.json();
            
            if (data.success) {
                this.openRentalRequestModal(data.data);
            } else {
                this.showToast('Gagal memuat detail permintaan sewa', 'error');
            }
        } catch (error) {
            console.error('Error loading rental request detail:', error);
            this.showToast('Gagal memuat detail permintaan sewa', 'error');
        }
    }

    openRentalRequestModal(rentalRequest) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('rentalRequestDetailModal');
        if (!modal) {
            modal = this.createRentalRequestModal();
            document.body.appendChild(modal);
        }

        // Populate modal with rental request data
        this.populateRentalRequestModal(modal, rentalRequest);
        
        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    createRentalRequestModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade notification-detail-modal';
        modal.id = 'rentalRequestDetailModal';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detail Permintaan Sewa</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="rentalRequestContent">
                            <!-- Content will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    populateRentalRequestModal(modal, rentalRequest) {
        const content = modal.querySelector('#rentalRequestContent');
        const statusClass = this.getStatusClass(rentalRequest.status);
        const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount);
        
        content.innerHTML = `
            <div class="rental-request-card">
                <div class="rental-request-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1">${rentalRequest.asset_details?.name || 'Asset tidak ditemukan'}</h5>
                            <p class="mb-0 opacity-75">ID Request: #${rentalRequest.id}</p>
                        </div>
                        <span class="status-badge status-${rentalRequest.status}">
                            <i class="fas fa-${this.getStatusIcon(rentalRequest.status)}"></i>
                            ${this.getStatusText(rentalRequest.status)}
                        </span>
                    </div>
                </div>
                <div class="rental-request-body">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Nama Penyewa</span>
                            <span class="info-value">${rentalRequest.nama_penyewa}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email</span>
                            <span class="info-value">${rentalRequest.email}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Telepon</span>
                            <span class="info-value">${rentalRequest.telepon}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Durasi Sewa</span>
                            <span class="info-value">${rentalRequest.durasi_sewa} bulan</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tanggal Mulai</span>
                            <span class="info-value">${new Date(rentalRequest.tanggal_mulai).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Total Harga</span>
                            <span class="info-value">Rp ${formatCurrency(rentalRequest.total_harga || 0)}</span>
                        </div>
                    </div>
                    
                    ${rentalRequest.pesan ? `
                        <div class="mt-3">
                            <span class="info-label">Pesan dari Penyewa</span>
                            <div class="alert alert-light mt-1">
                                ${rentalRequest.pesan}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${rentalRequest.admin_notes ? `
                        <div class="mt-3">
                            <span class="info-label">Catatan Admin</span>
                            <div class="alert alert-info mt-1">
                                ${rentalRequest.admin_notes}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Action buttons removed - notifications are view-only now -->
                </div>
            </div>
        `;
    }

    async showAllNotificationsModal() {
        // Create all notifications modal if it doesn't exist
        let modal = document.getElementById('allNotificationsModal');
        if (!modal) {
            modal = this.createAllNotificationsModal();
            document.body.appendChild(modal);
        }

        // Load all notifications
        await this.loadAllNotifications(modal);
        
        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    createAllNotificationsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'allNotificationsModal';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Semua Notifikasi</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <button class="btn btn-outline-primary btn-sm" onclick="adminNotificationSystem.filterNotifications('all')">Semua</button>
                                <button class="btn btn-outline-warning btn-sm" onclick="adminNotificationSystem.filterNotifications('unread')">Belum Dibaca</button>
                                <button class="btn btn-outline-success btn-sm" onclick="adminNotificationSystem.filterNotifications('read')">Sudah Dibaca</button>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="adminNotificationSystem.markAllAsRead()">
                                <i class="fas fa-check-double me-1"></i>Tandai Semua Dibaca
                            </button>
                        </div>
                        <div id="allNotificationsContent">
                            <div class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2">Memuat notifikasi...</p>
                            </div>
                        </div>
                        <div id="allNotificationsPagination" class="d-flex justify-content-center mt-3">
                            <!-- Pagination will be added here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    async loadAllNotifications(modal, page = 1, filter = 'all') {
        try {
            let url = `/api/admin/notifications?page=${page}&per_page=10`;
            if (filter === 'unread') {
                url += '&only_unread=true';
            }

            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.renderAllNotifications(modal, data.data, data.pagination);
            }
        } catch (error) {
            console.error('Error loading all notifications:', error);
        }
    }

    renderAllNotifications(modal, notifications, pagination) {
        const content = modal.querySelector('#allNotificationsContent');
        
        if (notifications.length === 0) {
            content.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                    <h5>Tidak ada notifikasi</h5>
                    <p class="text-muted">Semua notifikasi akan muncul di sini</p>
                </div>
            `;
            return;
        }

        let html = '<div class="list-group">';
        notifications.forEach(notification => {
            const timeAgo = this.timeAgo(new Date(notification.created_at));
            const readClass = notification.is_read ? '' : 'list-group-item-warning';
            
            html += `
                <div class="list-group-item ${readClass}" data-notification-id="${notification.id}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1" style="cursor: pointer;" onclick="adminNotificationSystem.handleNotificationClickFromModal(${notification.id})">
                            <h6 class="mb-1">${notification.title}</h6>
                            <p class="mb-1">${notification.message}</p>
                            <small class="text-muted">${timeAgo}</small>
                        </div>
                        <div class="ms-2">
                            ${!notification.is_read ? `
                                <button class="btn btn-sm btn-outline-primary" onclick="adminNotificationSystem.markAsReadFromModal(${notification.id})">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        content.innerHTML = html;

        // Render pagination
        this.renderPagination(modal, pagination);
    }

    renderPagination(modal, pagination) {
        const paginationContainer = modal.querySelector('#allNotificationsPagination');
        
        if (pagination.total_pages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '<nav><ul class="pagination">';
        
        // Previous button
        html += `
            <li class="page-item ${!pagination.has_prev ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="adminNotificationSystem.loadAllNotifications(document.getElementById('allNotificationsModal'), ${pagination.current_page - 1})">Previous</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= pagination.total_pages; i++) {
            const active = i === pagination.current_page ? 'active' : '';
            html += `
                <li class="page-item ${active}">
                    <a class="page-link" href="#" onclick="adminNotificationSystem.loadAllNotifications(document.getElementById('allNotificationsModal'), ${i})">${i}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${!pagination.has_next ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="adminNotificationSystem.loadAllNotifications(document.getElementById('allNotificationsModal'), ${pagination.current_page + 1})">Next</a>
            </li>
        `;

        html += '</ul></nav>';
        paginationContainer.innerHTML = html;
    }

    async handleNotificationClickFromModal(notificationId) {
        const notification = this.currentNotifications.find(n => n.id == notificationId) ||
                           await this.getNotificationById(notificationId);
        
        if (notification) {
            // Close all notifications modal first
            const allNotificationsModal = bootstrap.Modal.getInstance(document.getElementById('allNotificationsModal'));
            if (allNotificationsModal) allNotificationsModal.hide();
            
            // Handle the notification
            await this.handleNotificationClick(notification);
        }
    }

    async markAsReadFromModal(notificationId) {
        await this.markAsRead(notificationId);
        
        // Refresh the all notifications modal
        const modal = document.getElementById('allNotificationsModal');
        await this.loadAllNotifications(modal);
    }

    async getNotificationById(notificationId) {
        try {
            const response = await fetch(`/api/admin/notifications?per_page=100`);
            const data = await response.json();
            
            if (data.success) {
                return data.data.find(n => n.id == notificationId);
            }
        } catch (error) {
            console.error('Error getting notification by ID:', error);
        }
        return null;
    }

    filterNotifications(filter) {
        const modal = document.getElementById('allNotificationsModal');
        this.loadAllNotifications(modal, 1, filter);
    }

    startPolling() {
        // Poll every 30 seconds for new notifications
        this.pollInterval = setInterval(() => {
            this.loadNotificationCount();
        }, 30000);
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    // Utility methods
    timeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
        
        return date.toLocaleDateString('id-ID');
    }

    getStatusClass(status) {
        switch (status) {
            case 'pending': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            default: return 'secondary';
        }
    }

    getStatusIcon(status) {
        switch (status) {
            case 'pending': return 'clock';
            case 'approved': return 'check-circle';
            case 'rejected': return 'times-circle';
            default: return 'info-circle';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'pending': return 'Menunggu';
            case 'approved': return 'Disetujui';
            case 'rejected': return 'Ditolak';
            default: return status;
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.alert-floating');
        existingToasts.forEach(toast => toast.remove());

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-floating`;
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    // Cleanup method
    destroy() {
        this.stopPolling();
        this.isInitialized = false;
    }
}

// Initialize the notification system when DOM is loaded
let adminNotificationSystem;

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on admin dashboard pages
    if (document.getElementById('notificationBell')) {
        adminNotificationSystem = new AdminNotificationSystem();
        
        // Make it globally accessible for onclick handlers
        window.adminNotificationSystem = adminNotificationSystem;
    }
});

} // End of AdminNotificationSystem class check

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (window.adminNotificationSystem) {
        window.adminNotificationSystem.destroy();
    }
});
