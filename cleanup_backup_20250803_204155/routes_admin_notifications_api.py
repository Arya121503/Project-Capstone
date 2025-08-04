from flask import Blueprint, jsonify, request, session
from app import db
from app.models_sqlalchemy import AdminNotification, RentalRequest, RentalAsset
from datetime import datetime
from sqlalchemy import desc, and_, or_

admin_notifications_api = Blueprint('admin_notifications_api', __name__)

@admin_notifications_api.route('/api/admin/notifications')
def get_admin_notifications():
    """Get all admin notifications with pagination"""
    try:
        # Check if user is admin
        if 'user_id' not in session or session.get('role') != 'admin':
            return jsonify({
                'success': False,
                'error': 'Unauthorized access'
            }), 401
            
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        only_unread = request.args.get('only_unread', 'false').lower() == 'true'
        
        # Build query
        query = AdminNotification.query
        
        if only_unread:
            query = query.filter(AdminNotification.is_read == False)
            
        # Order by most recent first
        query = query.order_by(desc(AdminNotification.created_at))
        
        # Paginate
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        notifications = []
        for notification in pagination.items:
            notif_data = notification.to_dict()
            
            # Add related data if it's a rental request
            if notification.related_type == 'rental_request' and notification.related_id:
                try:
                    rental_request = RentalRequest.query.get(notification.related_id)
                    if rental_request:
                        notif_data['rental_request'] = {
                            'id': rental_request.id,
                            'nama_penyewa': rental_request.nama_penyewa,
                            'email': rental_request.email,
                            'telepon': rental_request.telepon,
                            'status': rental_request.status,
                            'asset_name': rental_request.asset.name if rental_request.asset else 'Asset tidak ditemukan',
                            'tanggal_mulai': rental_request.tanggal_mulai.isoformat() if rental_request.tanggal_mulai else None,
                            'durasi_sewa': rental_request.durasi_sewa,
                            'total_harga': float(rental_request.total_harga) if rental_request.total_harga else None
                        }
                except Exception as e:
                    print(f"Error loading rental request data: {e}")
                    
            notifications.append(notif_data)
        
        return jsonify({
            'success': True,
            'data': notifications,
            'pagination': {
                'current_page': pagination.page,
                'total_pages': pagination.pages,
                'total_items': pagination.total,
                'per_page': per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
        
    except Exception as e:
        print(f"Error getting admin notifications: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to load notifications'
        }), 500

@admin_notifications_api.route('/api/admin/notifications/count')
def get_notification_count():
    """Get count of unread notifications"""
    try:
        # Check if user is admin
        if 'user_id' not in session or session.get('role') != 'admin':
            return jsonify({
                'success': False,
                'error': 'Unauthorized access'
            }), 401
            
        unread_count = AdminNotification.query.filter(
            AdminNotification.is_read == False
        ).count()
        
        return jsonify({
            'success': True,
            'unread_count': unread_count
        })
        
    except Exception as e:
        print(f"Error getting notification count: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get notification count'
        }), 500

@admin_notifications_api.route('/api/admin/notifications/<int:notification_id>/mark-read', methods=['POST'])
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        # Check if user is admin
        if 'user_id' not in session or session.get('role') != 'admin':
            return jsonify({
                'success': False,
                'error': 'Unauthorized access'
            }), 401
            
        notification = AdminNotification.query.get(notification_id)
        if not notification:
            return jsonify({
                'success': False,
                'error': 'Notification not found'
            }), 404
            
        notification.is_read = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as read'
        })
        
    except Exception as e:
        print(f"Error marking notification as read: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to mark notification as read'
        }), 500

@admin_notifications_api.route('/api/admin/notifications/mark-all-read', methods=['POST'])
def mark_all_notifications_read():
    """Mark all notifications as read"""
    try:
        # Check if user is admin
        if 'user_id' not in session or session.get('role') != 'admin':
            return jsonify({
                'success': False,
                'error': 'Unauthorized access'
            }), 401
            
        AdminNotification.query.filter(
            AdminNotification.is_read == False
        ).update({'is_read': True})
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'All notifications marked as read'
        })
        
    except Exception as e:
        print(f"Error marking all notifications as read: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to mark all notifications as read'
        }), 500

@admin_notifications_api.route('/api/admin/rental-requests/<int:request_id>')
def get_rental_request_detail(request_id):
    """Get detailed information about a rental request"""
    try:
        # Check if user is admin
        if 'user_id' not in session or session.get('role') != 'admin':
            return jsonify({
                'success': False,
                'error': 'Unauthorized access'
            }), 401
            
        rental_request = RentalRequest.query.get(request_id)
        if not rental_request:
            return jsonify({
                'success': False,
                'error': 'Rental request not found'
            }), 404
            
        # Get detailed data
        request_data = rental_request.to_dict()
        
        # Add asset details
        if rental_request.asset:
            asset_data = rental_request.asset.to_dict()
            request_data['asset_details'] = asset_data
            
        return jsonify({
            'success': True,
            'data': request_data
        })
        
    except Exception as e:
        print(f"Error getting rental request detail: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to load rental request details'
        }), 500

@admin_notifications_api.route('/api/admin/rental-requests/<int:request_id>/approve', methods=['POST'])
def approve_rental_request(request_id):
    """Approve a rental request"""
    try:
        # Check if user is admin
        if 'user_id' not in session or session.get('role') != 'admin':
            return jsonify({
                'success': False,
                'error': 'Unauthorized access'
            }), 401
            
        data = request.get_json()
        admin_notes = data.get('admin_notes', '')
        
        rental_request = RentalRequest.query.get(request_id)
        if not rental_request:
            return jsonify({
                'success': False,
                'error': 'Rental request not found'
            }), 404
            
        if rental_request.status != 'pending':
            return jsonify({
                'success': False,
                'error': 'Request sudah diproses sebelumnya'
            }), 400
            
        # Update rental request status
        rental_request.status = 'approved'
        rental_request.admin_notes = admin_notes
        rental_request.updated_at = datetime.utcnow()
        
        # Update asset status to 'rented'
        if rental_request.asset:
            rental_request.asset.status = 'rented'
            
        # Create notification for user if they have a user_id
        if rental_request.user_id:
            try:
                from app.models_user_notification import UserNotification
                user_notification = UserNotification(
                    user_id=rental_request.user_id,
                    title="Pengajuan Sewa Disetujui",
                    message=f"Pengajuan sewa untuk aset '{rental_request.asset.name if rental_request.asset else 'Asset'}' telah disetujui. {admin_notes if admin_notes else ''}"
                )
                user_notification.related_type = 'rental_request'
                user_notification.related_id = rental_request.id
                db.session.add(user_notification)
            except Exception as e:
                print(f"Error creating user notification: {e}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Pengajuan sewa berhasil disetujui',
            'data': rental_request.to_dict()
        })
        
    except Exception as e:
        print(f"Error approving rental request: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to approve rental request'
        }), 500

@admin_notifications_api.route('/api/admin/rental-requests/<int:request_id>/reject', methods=['POST'])
def reject_rental_request(request_id):
    """Reject a rental request"""
    try:
        # Check if user is admin
        if 'user_id' not in session or session.get('role') != 'admin':
            return jsonify({
                'success': False,
                'error': 'Unauthorized access'
            }), 401
            
        data = request.get_json()
        rejection_reason = data.get('rejection_reason', '')
        admin_notes = data.get('admin_notes', '')
        
        if not rejection_reason:
            return jsonify({
                'success': False,
                'error': 'Alasan penolakan harus diisi'
            }), 400
            
        rental_request = RentalRequest.query.get(request_id)
        if not rental_request:
            return jsonify({
                'success': False,
                'error': 'Rental request not found'
            }), 404
            
        if rental_request.status != 'pending':
            return jsonify({
                'success': False,
                'error': 'Request sudah diproses sebelumnya'
            }), 400
            
        # Update rental request status
        rental_request.status = 'rejected'
        rental_request.admin_notes = f"Ditolak: {rejection_reason}. {admin_notes}"
        rental_request.updated_at = datetime.utcnow()
        
        # Asset remains available (don't change status)
        
        # Create notification for user if they have a user_id
        if rental_request.user_id:
            try:
                from app.models_user_notification import UserNotification
                user_notification = UserNotification(
                    user_id=rental_request.user_id,
                    title="Pengajuan Sewa Ditolak",
                    message=f"Pengajuan sewa untuk aset '{rental_request.asset.name if rental_request.asset else 'Asset'}' ditolak. Alasan: {rejection_reason}"
                )
                user_notification.related_type = 'rental_request'
                user_notification.related_id = rental_request.id
                db.session.add(user_notification)
            except Exception as e:
                print(f"Error creating user notification: {e}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Pengajuan sewa berhasil ditolak',
            'data': rental_request.to_dict()
        })
        
    except Exception as e:
        print(f"Error rejecting rental request: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to reject rental request'
        }), 500

@admin_notifications_api.route('/api/admin/rental-requests/pending')
def get_pending_rental_requests():
    """Get all pending rental requests"""
    try:
        # Check if user is admin
        if 'user_id' not in session or session.get('role') != 'admin':
            return jsonify({
                'success': False,
                'error': 'Unauthorized access'
            }), 401
            
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        # Get pending requests
        query = RentalRequest.query.filter(
            RentalRequest.status == 'pending'
        ).order_by(desc(RentalRequest.created_at))
        
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        requests = []
        for req in pagination.items:
            req_data = req.to_dict()
            # Add asset details
            if req.asset:
                req_data['asset_details'] = req.asset.to_dict()
            requests.append(req_data)
        
        return jsonify({
            'success': True,
            'data': requests,
            'pagination': {
                'current_page': pagination.page,
                'total_pages': pagination.pages,
                'total_items': pagination.total,
                'per_page': per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
        
    except Exception as e:
        print(f"Error getting pending rental requests: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to load pending requests'
        }), 500

# Predefined rejection reasons
REJECTION_REASONS = [
    "Dokumen tidak lengkap",
    "Asset tidak tersedia",
    "Durasi sewa tidak sesuai",
    "Harga yang ditawarkan tidak sesuai",
    "Riwayat sewa kurang baik",
    "Tidak memenuhi persyaratan",
    "Asset sedang dalam perbaikan",
    "Konflik jadwal",
    "Lainnya"
]

@admin_notifications_api.route('/api/admin/rejection-reasons')
def get_rejection_reasons():
    """Get list of predefined rejection reasons"""
    try:
        return jsonify({
            'success': True,
            'data': REJECTION_REASONS
        })
    except Exception as e:
        print(f"Error getting rejection reasons: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to load rejection reasons'
        }), 500
