from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from app import db
from app.models_sqlalchemy import RentalAsset, RentalRequest, AdminNotification
from datetime import datetime
import json

admin_routes = Blueprint('admin', __name__)

@admin_routes.route('/api/admin/rental-requests')
def get_admin_rental_requests():
    """API untuk mendapatkan daftar permintaan sewa untuk admin"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    try:
        # Filter parameter
        status = request.args.get('status', '')
        
        # Buat query dasar
        query = RentalRequest.query
        
        # Terapkan filter
        if status:
            query = query.filter_by(status=status)
        
        # Urutkan berdasarkan tanggal terbaru
        query = query.order_by(RentalRequest.created_at.desc())
        
        # Ambil data
        requests = query.all()
        
        # Format data untuk response
        result = []
        for req in requests:
            req_data = req.to_dict()
            result.append(req_data)
        
        return jsonify({
            'success': True,
            'data': result,
            'total': len(result)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_routes.route('/api/admin/rental-requests/<int:request_id>')
def get_rental_request_detail(request_id):
    """API untuk mendapatkan detail permintaan sewa individual"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    try:
        # Cari permintaan sewa
        rental_request = RentalRequest.query.get(request_id)
        
        if not rental_request:
            return jsonify({
                'success': False,
                'error': 'Permintaan sewa tidak ditemukan'
            }), 404
        
        # Format data detail
        result = rental_request.to_dict()
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_routes.route('/api/admin/approve-rental-request/<int:request_id>', methods=['POST'])
def approve_rental_request(request_id):
    """API untuk menyetujui permintaan sewa"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    try:
        # Cari permintaan sewa
        rental_request = RentalRequest.query.get(request_id)
        
        if not rental_request:
            return jsonify({
                'success': False,
                'error': 'Permintaan sewa tidak ditemukan'
            }), 404
        
        # Cek apakah permintaan masih dalam status pending
        if rental_request.status != 'pending':
            return jsonify({
                'success': False,
                'error': 'Hanya permintaan dengan status pending yang dapat disetujui'
            }), 400
        
        # Ambil data dari request body
        data = request.get_json() or {}
        admin_notes = data.get('admin_notes', '')
        
        # Ubah status menjadi approved
        rental_request.status = 'approved'
        rental_request.admin_notes = admin_notes
        rental_request.updated_at = datetime.utcnow()
        
        # Ubah status aset menjadi rented
        asset = RentalAsset.query.get(rental_request.asset_id)
        if asset:
            asset.status = 'rented'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Permintaan sewa berhasil disetujui'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_routes.route('/api/admin/reject-rental-request/<int:request_id>', methods=['POST'])
def reject_rental_request(request_id):
    """API untuk menolak permintaan sewa"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    try:
        # Cari permintaan sewa
        rental_request = RentalRequest.query.get(request_id)
        
        if not rental_request:
            return jsonify({
                'success': False,
                'error': 'Permintaan sewa tidak ditemukan'
            }), 404
        
        # Cek apakah permintaan masih dalam status pending
        if rental_request.status != 'pending':
            return jsonify({
                'success': False,
                'error': 'Hanya permintaan dengan status pending yang dapat ditolak'
            }), 400
        
        # Ambil data dari request body
        data = request.get_json() or {}
        admin_notes = data.get('admin_notes', '')
        
        if not admin_notes:
            return jsonify({
                'success': False,
                'error': 'Alasan penolakan harus diisi'
            }), 400
        
        # Ubah status menjadi rejected
        rental_request.status = 'rejected'
        rental_request.admin_notes = admin_notes
        rental_request.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Permintaan sewa berhasil ditolak'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_routes.route('/api/admin/rental-request-count')
def get_rental_request_count():
    """API untuk mendapatkan jumlah permintaan sewa berdasarkan status"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    try:
        # Hitung jumlah permintaan sewa berdasarkan status
        pending_count = RentalRequest.query.filter_by(status='pending').count()
        approved_count = RentalRequest.query.filter_by(status='approved').count()
        rejected_count = RentalRequest.query.filter_by(status='rejected').count()
        active_count = RentalRequest.query.filter_by(status='active').count()
        completed_count = RentalRequest.query.filter_by(status='completed').count()
        
        return jsonify({
            'success': True,
            'data': {
                'pending': pending_count,
                'approved': approved_count,
                'rejected': rejected_count,
                'active': active_count,
                'completed': completed_count,
                'total': pending_count + approved_count + rejected_count + active_count + completed_count
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



@admin_routes.route('/admin/notifications')
def admin_notifications_page():
    """Halaman notifikasi admin"""
    if 'user_id' not in session or session.get('role') != 'admin':
        flash('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.', 'error')
        return redirect(url_for('main.login'))
    
    return render_template('admin_notifications.html')

@admin_routes.route('/api/admin/notifications')
def get_admin_notifications():
    """API untuk mendapatkan notifikasi admin"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    try:
        # Parameter untuk pagination
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Query notifikasi
        query = AdminNotification.query.order_by(AdminNotification.created_at.desc())
        
        # Pagination
        notifications = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Hitung notifikasi yang belum dibaca
        unread_count = AdminNotification.query.filter_by(is_read=False).count()
        
        # Format data untuk response
        result = []
        for notif in notifications.items:
            notif_data = notif.to_dict()
            result.append(notif_data)
        
        return jsonify({
            'success': True,
            'data': result,
            'total': notifications.total,
            'pages': notifications.pages,
            'current_page': notifications.page,
            'unread_count': unread_count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_routes.route('/api/admin/notifications/mark-read/<int:notification_id>', methods=['POST'])
def mark_notification_read(notification_id):
    """API untuk menandai notifikasi sebagai dibaca"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    try:
        from app.notification_helper import mark_notification_as_read
        
        success = mark_notification_as_read(notification_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Notifikasi berhasil ditandai sebagai dibaca'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Notifikasi tidak ditemukan'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_routes.route('/api/admin/notifications/mark-all-read', methods=['POST'])
def mark_all_notifications_read():
    """API untuk menandai semua notifikasi sebagai dibaca"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    try:
        from app.notification_helper import mark_all_notifications_as_read
        
        success = mark_all_notifications_as_read()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Semua notifikasi berhasil ditandai sebagai dibaca'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Gagal menandai notifikasi sebagai dibaca'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_routes.route('/api/admin/rental-requests/<int:request_id>/approve', methods=['POST'])
def approve_rental_request_api(request_id):
    """API untuk menyetujui permintaan sewa"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    try:
        # Cari permintaan sewa dengan locking untuk mencegah race condition
        rental_request = RentalRequest.query.filter_by(id=request_id).with_for_update().first()
        
        if not rental_request:
            return jsonify({
                'success': False,
                'error': 'Permintaan sewa tidak ditemukan'
            }), 404
        
        # Cek apakah permintaan masih dalam status pending
        if rental_request.status != 'pending':
            return jsonify({
                'success': False,
                'error': f'Permintaan sudah dalam status {rental_request.status}. Hanya permintaan dengan status pending yang dapat disetujui.'
            }), 400
        
        # Ambil data dari request body
        try:
            data = request.get_json() or {}
        except Exception:
            data = {}
        admin_notes = data.get('notes', 'Disetujui oleh admin')
        
        # Ubah status menjadi approved
        rental_request.status = 'approved'
        rental_request.admin_notes = admin_notes
        rental_request.updated_at = datetime.utcnow()
        
        # Ubah status aset menjadi rented
        asset = RentalAsset.query.get(rental_request.asset_id)
        if asset:
            asset.status = 'rented'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Permintaan sewa berhasil disetujui'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_routes.route('/api/admin/rental-requests/<int:request_id>/reject', methods=['POST'])
def reject_rental_request_api(request_id):
    """API untuk menolak permintaan sewa"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    try:
        # Cari permintaan sewa dengan locking untuk mencegah race condition
        rental_request = RentalRequest.query.filter_by(id=request_id).with_for_update().first()
        
        if not rental_request:
            return jsonify({
                'success': False,
                'error': 'Permintaan sewa tidak ditemukan'
            }), 404
        
        # Cek apakah permintaan masih dalam status pending
        if rental_request.status != 'pending':
            return jsonify({
                'success': False,
                'error': f'Permintaan sudah dalam status {rental_request.status}. Hanya permintaan dengan status pending yang dapat ditolak.'
            }), 400
        
        # Ambil data dari request body
        try:
            data = request.get_json() or {}
        except Exception:
            data = {}
        admin_notes = data.get('reason', data.get('notes', 'Ditolak oleh admin'))
        
        # Ubah status menjadi rejected
        rental_request.status = 'rejected'
        rental_request.admin_notes = admin_notes
        rental_request.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Permintaan sewa berhasil ditolak'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def create_admin_notification(title, message, related_type, related_id=None):
    """Fungsi helper untuk membuat notifikasi admin"""
    try:
        notification = AdminNotification()
        notification.title = title
        notification.message = message
        notification.related_type = related_type
        notification.related_id = related_id
        notification.is_read = False
        notification.created_at = datetime.utcnow()
        
        db.session.add(notification)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Error creating admin notification: {e}")
        return False