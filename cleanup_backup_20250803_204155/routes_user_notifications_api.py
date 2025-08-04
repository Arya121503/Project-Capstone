from flask import Blueprint, request, jsonify, session
from app import db
from app.models_user_notification import UserNotification
from app.models_sqlalchemy import RentalRequest
from datetime import datetime

user_notifications_api = Blueprint('user_notifications_api', __name__)

@user_notifications_api.route('/api/user/notifications')
def get_user_notifications():
    """API untuk mendapatkan notifikasi user"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        notification_type = request.args.get('type', None)  # rental, general, etc.
        
        # Build query
        query = UserNotification.query.filter_by(user_id=user_id)
        
        if notification_type:
            query = query.filter_by(related_type=notification_type)
        
        # Order by latest first
        query = query.order_by(UserNotification.created_at.desc())
        
        # Paginate
        notifications = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        result = []
        for notification in notifications.items:
            notif_data = notification.to_dict()
            
            # Add additional info for rental-related notifications
            if notification.related_type == 'rental_request' and notification.related_id:
                try:
                    rental_request = RentalRequest.query.get(notification.related_id)
                    if rental_request:
                        notif_data['rental_request'] = {
                            'id': rental_request.id,
                            'asset_name': rental_request.asset.name if rental_request.asset else None,
                            'status': rental_request.status,
                            'start_date': rental_request.start_date.isoformat() if rental_request.start_date else None,
                            'total_months': rental_request.total_months,
                            'total_price': rental_request.total_price
                        }
                except Exception as e:
                    print(f"Error getting rental request info: {str(e)}")
            
            result.append(notif_data)
        
        return jsonify({
            'success': True,
            'data': result,
            'pagination': {
                'page': notifications.page,
                'pages': notifications.pages,
                'per_page': notifications.per_page,
                'total': notifications.total,
                'has_next': notifications.has_next,
                'has_prev': notifications.has_prev
            },
            'unread_count': UserNotification.get_unread_count(user_id)
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_notifications_api.route('/api/user/notifications/unread-count')
def get_unread_notifications_count():
    """API untuk mendapatkan jumlah notifikasi yang belum dibaca"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        count = UserNotification.get_unread_count(user_id)
        
        return jsonify({
            'success': True,
            'unread_count': count
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_notifications_api.route('/api/user/notifications/<int:notification_id>/mark-read', methods=['POST'])
def mark_notification_read(notification_id):
    """API untuk menandai notifikasi sebagai sudah dibaca"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        
        notification = UserNotification.query.filter_by(
            id=notification_id,
            user_id=user_id
        ).first()
        
        if not notification:
            return jsonify({'success': False, 'error': 'Notification not found'}), 404
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as read',
            'unread_count': UserNotification.get_unread_count(user_id)
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@user_notifications_api.route('/api/user/notifications/mark-all-read', methods=['POST'])
def mark_all_notifications_read():
    """API untuk menandai semua notifikasi sebagai sudah dibaca"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        
        # Update all unread notifications for this user
        UserNotification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).update({'is_read': True})
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'All notifications marked as read',
            'unread_count': 0
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@user_notifications_api.route('/api/user/notifications/rental-updates')
def get_rental_notification_updates():
    """API khusus untuk mendapatkan update notifikasi rental"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        
        # Get recent rental-related notifications
        notifications = UserNotification.query.filter_by(
            user_id=user_id,
            related_type='rental_request'
        ).order_by(UserNotification.created_at.desc()).limit(5).all()
        
        result = []
        for notification in notifications:
            notif_data = notification.to_dict()
            
            # Add rental request details
            if notification.related_id:
                try:
                    rental_request = RentalRequest.query.get(notification.related_id)
                    if rental_request:
                        notif_data['rental_request'] = {
                            'id': rental_request.id,
                            'asset_name': rental_request.asset.name if rental_request.asset else None,
                            'status': rental_request.status,
                            'status_label': {
                                'pending': 'Menunggu Persetujuan',
                                'approved': 'Disetujui',
                                'active': 'Aktif',
                                'rejected': 'Ditolak',
                                'completed': 'Selesai'
                            }.get(rental_request.status, rental_request.status.title()),
                            'start_date': rental_request.start_date.isoformat() if rental_request.start_date else None,
                            'total_months': rental_request.total_months,
                            'total_price': rental_request.total_price,
                            'admin_notes': rental_request.admin_notes
                        }
                except Exception as e:
                    print(f"Error getting rental request info: {str(e)}")
            
            result.append(notif_data)
        
        return jsonify({
            'success': True,
            'data': result,
            'unread_count': UserNotification.get_unread_count(user_id)
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
