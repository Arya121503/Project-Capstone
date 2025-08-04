from app import db
from app.models_sqlalchemy import AdminNotification
from datetime import datetime

def create_admin_notification(title, message, related_type, related_id=None):
    """
    Helper function untuk membuat notifikasi admin
    
    Args:
        title (str): Judul notifikasi
        message (str): Pesan notifikasi
        related_type (str): Tipe relasi (rental_request, user_registration, etc.)
        related_id (int, optional): ID yang terkait
    
    Returns:
        bool: True jika berhasil, False jika gagal
    """
    try:
        notification = AdminNotification(
            title=title,
            message=message,
            related_type=related_type,
            related_id=related_id,
            is_read=False,
            created_at=datetime.utcnow()
        )
        
        db.session.add(notification)
        db.session.commit()
        
        print(f"[OK] Admin notification created: {title}")
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed to create admin notification: {e}")
        return False

def get_unread_notification_count():
    """
    Mendapatkan jumlah notifikasi yang belum dibaca
    
    Returns:
        int: Jumlah notifikasi yang belum dibaca
    """
    try:
        count = AdminNotification.query.filter_by(is_read=False).count()
        return count
    except Exception as e:
        print(f"[ERROR] Failed to get unread notification count: {e}")
        return 0

def mark_notification_as_read(notification_id):
    """
    Menandai notifikasi sebagai sudah dibaca
    
    Args:
        notification_id (int): ID notifikasi
    
    Returns:
        bool: True jika berhasil, False jika gagal
    """
    try:
        notification = AdminNotification.query.get(notification_id)
        if notification:
            notification.is_read = True
            db.session.commit()
            return True
        return False
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed to mark notification as read: {e}")
        return False

def mark_all_notifications_as_read():
    """
    Menandai semua notifikasi sebagai sudah dibaca
    
    Returns:
        bool: True jika berhasil, False jika gagal
    """
    try:
        AdminNotification.query.filter_by(is_read=False).update({'is_read': True})
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed to mark all notifications as read: {e}")
        return False

def create_admin_notification_for_rental_request(rental_request_id):
    """
    Create an admin notification when a new rental request is submitted
    
    Args:
        rental_request_id (int): ID of the rental request
    
    Returns:
        bool: True if successful, False if failed
    """
    try:
        from app.models_sqlalchemy import RentalRequest
        
        rental_request = RentalRequest.query.get(rental_request_id)
        if not rental_request:
            print(f"Rental request {rental_request_id} not found")
            return False
            
        # Create notification
        title = f"Permintaan Sewa Baru dari {rental_request.nama_penyewa}"
        message = f"Permintaan sewa untuk aset '{rental_request.asset.name if rental_request.asset else 'Asset tidak ditemukan'}' perlu ditinjau. Durasi: {rental_request.durasi_sewa} bulan."
        
        return create_admin_notification(
            title=title,
            message=message,
            related_type='rental_request',
            related_id=rental_request.id
        )
        
    except Exception as e:
        print(f"Error creating admin notification for rental request {rental_request_id}: {e}")
        return False