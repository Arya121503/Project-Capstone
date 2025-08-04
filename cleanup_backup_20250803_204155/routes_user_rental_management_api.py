from flask import Blueprint, request, jsonify, session
from app import db
from app.models_sqlalchemy import RentalRequest, RentalAsset
from app.models_rental_transaction import RentalTransaction
from app.models_user_notification import UserNotification
from datetime import datetime, timedelta
import json

user_rental_management_api = Blueprint('user_rental_management_api', __name__)

@user_rental_management_api.route('/api/user/rental-applications')
def get_user_rental_applications():
    """API untuk mendapatkan riwayat pengajuan sewa user"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status_filter = request.args.get('status', None)
        
        # Build query
        query = RentalRequest.query.filter_by(user_id=user_id)
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        # Order by latest first
        query = query.order_by(RentalRequest.created_at.desc())
        
        # Paginate
        applications = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        result = []
        for app in applications.items:
            app_data = app.to_dict()
            
            # Add additional status information
            app_data['status_label'] = {
                'pending': 'Menunggu Persetujuan',
                'approved': 'Disetujui',
                'active': 'Aktif',
                'rejected': 'Ditolak',
                'completed': 'Selesai'
            }.get(app.status, app.status.title())
            
            # Add action capabilities
            app_data['can_edit'] = app.status == 'pending'
            app_data['can_cancel'] = app.status == 'pending'
            app_data['can_view_transaction'] = app.status in ['approved', 'active']
            
            # Add asset details if available
            if app.asset:
                app_data['asset_details'] = {
                    'id': app.asset.id,
                    'name': app.asset.name,
                    'asset_type': app.asset.asset_type,
                    'kecamatan': app.asset.kecamatan,
                    'alamat': app.asset.alamat
                }
            
            # Check if there's an active transaction
            if app.status in ['approved', 'active']:
                transaction = RentalTransaction.query.filter_by(
                    rental_request_id=app.id
                ).first()
                if transaction:
                    app_data['transaction'] = transaction.to_dict()
            
            result.append(app_data)
        
        return jsonify({
            'success': True,
            'data': result,
            'pagination': {
                'page': applications.page,
                'pages': applications.pages,
                'per_page': applications.per_page,
                'total': applications.total,
                'has_next': applications.has_next,
                'has_prev': applications.has_prev
            }
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_rental_management_api.route('/api/user/rental-applications/<int:application_id>')
def get_rental_application_detail(application_id):
    """API untuk mendapatkan detail pengajuan sewa"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        
        application = RentalRequest.query.filter_by(
            id=application_id,
            user_id=user_id
        ).first()
        
        if not application:
            return jsonify({'success': False, 'error': 'Application not found'}), 404
        
        app_data = application.to_dict()
        
        # Add status label
        app_data['status_label'] = {
            'pending': 'Menunggu Persetujuan',
            'approved': 'Disetujui',
            'active': 'Aktif',
            'rejected': 'Ditolak',
            'completed': 'Selesai'
        }.get(application.status, application.status.title())
        
        # Add action capabilities
        app_data['can_edit'] = application.status == 'pending'
        app_data['can_cancel'] = application.status == 'pending'
        app_data['can_view_transaction'] = application.status in ['approved', 'active']
        
        # Add asset details
        if application.asset:
            app_data['asset_details'] = application.asset.to_dict()
        
        # Add transaction details if exists
        if application.status in ['approved', 'active']:
            transaction = RentalTransaction.query.filter_by(
                rental_request_id=application.id
            ).first()
            if transaction:
                app_data['transaction'] = transaction.to_dict()
        
        # Get related notifications
        notifications = UserNotification.query.filter_by(
            user_id=user_id,
            related_type='rental_request',
            related_id=application.id
        ).order_by(UserNotification.created_at.desc()).all()
        
        app_data['notifications'] = [notif.to_dict() for notif in notifications]
        
        return jsonify({
            'success': True,
            'data': app_data
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_rental_management_api.route('/api/user/rental-applications/<int:application_id>/cancel', methods=['POST'])
def cancel_rental_application(application_id):
    """API untuk membatalkan pengajuan sewa"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        
        application = RentalRequest.query.filter_by(
            id=application_id,
            user_id=user_id
        ).first()
        
        if not application:
            return jsonify({'success': False, 'error': 'Application not found'}), 404
        
        # Check if can be cancelled
        if application.status != 'pending':
            return jsonify({
                'success': False, 
                'error': f'Cannot cancel application with status: {application.status}'
            }), 400
        
        # Update status
        application.status = 'cancelled'
        application.updated_at = datetime.utcnow()
        
        # Create notification for user
        user_notification = UserNotification(
            user_id=user_id,
            title='Pengajuan Sewa Dibatalkan',
            message=f'Anda telah membatalkan pengajuan sewa untuk {application.asset.name if application.asset else "aset"}.',
            related_type='rental_request',
            related_id=application.id
        )
        db.session.add(user_notification)
        
        # Create notification for admin
        try:
            from app.models_sqlalchemy import AdminNotification
            admin_notification = AdminNotification(
                title='Pengajuan Sewa Dibatalkan',
                message=f'Pengguna {application.user_name} membatalkan pengajuan sewa untuk {application.asset.name if application.asset else "aset"}.',
                related_type='rental_request',
                related_id=application.id
            )
            db.session.add(admin_notification)
        except Exception as e:
            print(f"Error creating admin notification: {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Application cancelled successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@user_rental_management_api.route('/api/user/rental-applications/<int:application_id>/edit', methods=['PUT'])
def edit_rental_application(application_id):
    """API untuk mengedit pengajuan sewa yang masih pending"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        application = RentalRequest.query.filter_by(
            id=application_id,
            user_id=user_id
        ).first()
        
        if not application:
            return jsonify({'success': False, 'error': 'Application not found'}), 404
        
        # Check if can be edited
        if application.status != 'pending':
            return jsonify({
                'success': False, 
                'error': f'Cannot edit application with status: {application.status}'
            }), 400
        
        # Update allowed fields
        if 'start_date' in data:
            application.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        
        if 'total_months' in data:
            application.total_months = int(data['total_months'])
            # Recalculate end date and total price
            if application.start_date:
                application.end_date = application.start_date + timedelta(days=application.total_months * 30)
            application.total_price = application.monthly_price * application.total_months
        
        if 'user_phone' in data:
            application.user_phone = data['user_phone']
        
        application.updated_at = datetime.utcnow()
        
        # Create notification for user
        user_notification = UserNotification(
            user_id=user_id,
            title='Pengajuan Sewa Diperbarui',
            message=f'Anda telah memperbarui pengajuan sewa untuk {application.asset.name if application.asset else "aset"}.',
            related_type='rental_request',
            related_id=application.id
        )
        db.session.add(user_notification)
        
        # Create notification for admin
        try:
            from app.models_sqlalchemy import AdminNotification
            admin_notification = AdminNotification(
                title='Pengajuan Sewa Diperbarui',
                message=f'Pengguna {application.user_name} memperbarui pengajuan sewa untuk {application.asset.name if application.asset else "aset"}.',
                related_type='rental_request',
                related_id=application.id
            )
            db.session.add(admin_notification)
        except Exception as e:
            print(f"Error creating admin notification: {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Application updated successfully',
            'data': application.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
