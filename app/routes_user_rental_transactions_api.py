from flask import Blueprint, request, jsonify, session
from app import db
from app.models_rental_transaction import RentalTransaction
from app.models_sqlalchemy import RentalRequest
from app.models_user_notification import UserNotification
from datetime import datetime, timedelta
import json

user_rental_transactions_api = Blueprint('user_rental_transactions_api', __name__)

@user_rental_transactions_api.route('/api/user/rental-transactions')
def get_user_rental_transactions():
    """API untuk mendapatkan transaksi sewa user"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status_filter = request.args.get('status', None)
        
        # Build query
        query = RentalTransaction.query.filter_by(user_id=user_id)
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        # Order by latest first
        query = query.order_by(RentalTransaction.created_at.desc())
        
        # Paginate
        transactions = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        result = []
        for transaction in transactions.items:
            transaction_data = transaction.to_dict()
            
            # Add status labels
            transaction_data['status_label'] = {
                'active': 'Aktif',
                'extended': 'Diperpanjang',
                'completed': 'Selesai',
                'terminated': 'Dihentikan'
            }.get(transaction.status, transaction.status.title())
            
            transaction_data['payment_status_label'] = {
                'unpaid': 'Menunggu Pembayaran',
                'partial': 'Dibayar Sebagian',
                'paid': 'Lunas',
                'failed': 'Gagal'
            }.get(transaction.payment_status, transaction.payment_status.title())
            
            # Add warning flags
            days_remaining = transaction.get_days_remaining()
            transaction_data['warnings'] = []
            
            if days_remaining <= 0 and transaction.status == 'active':
                transaction_data['warnings'].append('Kontrak sudah berakhir')
            elif days_remaining <= 7 and transaction.status == 'active':
                transaction_data['warnings'].append('Kontrak akan berakhir dalam 7 hari')
            elif days_remaining <= 30 and transaction.status == 'active':
                transaction_data['warnings'].append('Kontrak akan berakhir dalam 30 hari')
            
            if transaction.payment_status == 'failed':
                transaction_data['warnings'].append('Pembayaran terlambat')
            
            result.append(transaction_data)
        
        return jsonify({
            'success': True,
            'data': result,
            'pagination': {
                'page': transactions.page,
                'pages': transactions.pages,
                'per_page': transactions.per_page,
                'total': transactions.total,
                'has_next': transactions.has_next,
                'has_prev': transactions.has_prev
            }
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_rental_transactions_api.route('/api/user/rental-transactions/<int:transaction_id>')
def get_rental_transaction_detail(transaction_id):
    """API untuk mendapatkan detail transaksi sewa"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        
        transaction = RentalTransaction.query.filter_by(
            id=transaction_id,
            user_id=user_id
        ).first()
        
        if not transaction:
            return jsonify({'success': False, 'error': 'Transaction not found'}), 404
        
        transaction_data = transaction.to_dict()
        
        # Add status labels
        transaction_data['status_label'] = {
            'active': 'Aktif',
            'extended': 'Diperpanjang',
            'completed': 'Selesai',
            'terminated': 'Dihentikan'
        }.get(transaction.status, transaction.status.title())
        
        transaction_data['payment_status_label'] = {
            'unpaid': 'Menunggu Pembayaran',
            'partial': 'Dibayar Sebagian',
            'paid': 'Lunas',
            'failed': 'Gagal'
        }.get(transaction.payment_status, transaction.payment_status.title())
        
        # Add rental request details
        if transaction.rental_request:
            transaction_data['rental_request'] = transaction.rental_request.to_dict()
        
        # Calculate rental duration stats
        if transaction.start_date:
            start_date = transaction.start_date
            current_date = datetime.utcnow().date()
            total_days = (current_date - start_date).days
            transaction_data['rental_duration'] = {
                'total_days': max(0, total_days),
                'total_months': round(total_days / 30, 1),
                'days_remaining': transaction.get_days_remaining(),
                'progress_percentage': min(100, (total_days / (transaction.total_months * 30)) * 100) if transaction.total_months > 0 else 0
            }
        
        return jsonify({
            'success': True,
            'data': transaction_data
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_rental_transactions_api.route('/api/user/rental-transactions/<int:transaction_id>/request-extension', methods=['POST'])
def request_rental_extension(transaction_id):
    """API untuk mengajukan perpanjangan sewa"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        transaction = RentalTransaction.query.filter_by(
            id=transaction_id,
            user_id=user_id
        ).first()
        
        if not transaction:
            return jsonify({'success': False, 'error': 'Transaction not found'}), 404
        
        # Validate extension request
        additional_months = data.get('additional_months', 0)
        if not additional_months or additional_months < 1:
            return jsonify({'success': False, 'error': 'Invalid extension period'}), 400
        
        if additional_months > 12:
            return jsonify({'success': False, 'error': 'Maximum extension is 12 months'}), 400
        
        # Check if extension is allowed
        if not transaction.can_extend():
            return jsonify({
                'success': False, 
                'error': 'Extension not allowed for this transaction'
            }), 400
        
        # Calculate extension details
        additional_cost = additional_months * transaction.monthly_price
        user_notes = data.get('notes', '')
        
        # Create extension request notification for admin
        try:
            from app.models_sqlalchemy import AdminNotification
            admin_notification = AdminNotification(
                title='Permintaan Perpanjangan Sewa',
                message=f'Pengguna {session.get("user_name", "Unknown")} meminta perpanjangan sewa untuk {transaction.asset.name if transaction.asset else "aset"} selama {additional_months} bulan. Biaya tambahan: Rp {additional_cost:,.0f}',
                related_type='rental_extension',
                related_id=transaction.id
            )
            db.session.add(admin_notification)
        except Exception as e:
            print(f"Error creating admin notification: {str(e)}")
        
        # Create user notification
        user_notification = UserNotification(
            user_id=user_id,
            title='Permintaan Perpanjangan Dikirim',
            message=f'Permintaan perpanjangan sewa untuk {transaction.asset.name if transaction.asset else "aset"} selama {additional_months} bulan telah dikirim ke admin. Menunggu persetujuan.',
            related_type='rental_extension',
            related_id=transaction.id
        )
        db.session.add(user_notification)
        
        # Store extension request data (you might want to create a separate table for this)
        extension_request_data = {
            'requested_at': datetime.utcnow().isoformat(),
            'additional_months': additional_months,
            'additional_cost': additional_cost,
            'user_notes': user_notes,
            'status': 'pending'
        }
        
        # Update transaction's extension history (temporary storage)
        history = []
        if transaction.extension_history:
            try:
                history = json.loads(transaction.extension_history)
            except:
                history = []
        
        # Check if there's already a pending request
        for item in history:
            if item.get('status') == 'pending':
                return jsonify({
                    'success': False, 
                    'error': 'There is already a pending extension request'
                }), 400
        
        history.append(extension_request_data)
        transaction.extension_history = json.dumps(history)
        transaction.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Extension request submitted successfully',
            'extension_details': {
                'additional_months': additional_months,
                'additional_cost': additional_cost,
                'status': 'pending'
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@user_rental_transactions_api.route('/api/user/rental-transactions/dashboard-summary')
def get_rental_dashboard_summary():
    """API untuk mendapatkan ringkasan transaksi untuk dashboard"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        
        # Get active transactions
        active_transactions = RentalTransaction.query.filter_by(
            user_id=user_id,
            status='active'
        ).all()
        
        # Get extended transactions
        extended_transactions = RentalTransaction.query.filter_by(
            user_id=user_id,
            status='extended'
        ).all()
        
        # Calculate summary
        total_active = len(active_transactions) + len(extended_transactions)
        total_completed = RentalTransaction.query.filter_by(
            user_id=user_id,
            status='completed'
        ).count()
        
        # Calculate expiring soon (within 30 days)
        expiring_soon = 0
        for transaction in active_transactions + extended_transactions:
            if transaction.get_days_remaining() <= 30:
                expiring_soon += 1
        
        # Calculate total spent
        total_spent = db.session.query(
            db.func.sum(RentalTransaction.paid_amount)
        ).filter_by(user_id=user_id).scalar() or 0
        
        # Get recent transactions
        recent_transactions = RentalTransaction.query.filter_by(
            user_id=user_id
        ).order_by(RentalTransaction.created_at.desc()).limit(5).all()
        
        recent_data = []
        for transaction in recent_transactions:
            transaction_data = transaction.to_dict()
            transaction_data['status_label'] = {
                'active': 'Aktif',
                'extended': 'Diperpanjang',
                'completed': 'Selesai',
                'terminated': 'Dihentikan'
            }.get(transaction.status, transaction.status.title())
            recent_data.append(transaction_data)
        
        return jsonify({
            'success': True,
            'summary': {
                'total_active': total_active,
                'total_completed': total_completed,
                'expiring_soon': expiring_soon,
                'total_spent': total_spent
            },
            'recent_transactions': recent_data
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
