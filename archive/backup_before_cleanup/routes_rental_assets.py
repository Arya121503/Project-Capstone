from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from app import db
from app.models_sqlalchemy import RentalAsset, RentalRequest
from datetime import datetime, timedelta
import json

rental_assets = Blueprint('rental_assets', __name__)

@rental_assets.route('/api/available-assets')
def get_available_assets():
    """API untuk mendapatkan daftar aset yang tersedia untuk disewa"""
    try:
        # Filter parameter
        asset_type = request.args.get('asset_type', '')
        kecamatan = request.args.get('kecamatan', '')
        price_range = request.args.get('price_range', '')
        
        # Buat query dasar
        query = RentalAsset.query.filter_by(status='available')
        
        # Terapkan filter
        if asset_type:
            query = query.filter_by(asset_type=asset_type)
        
        if kecamatan:
            query = query.filter_by(kecamatan=kecamatan)
        
        if price_range:
            try:
                min_price, max_price = price_range.split('-')
                if min_price:
                    query = query.filter(RentalAsset.harga_sewa >= float(min_price))
                if max_price:
                    query = query.filter(RentalAsset.harga_sewa <= float(max_price))
            except:
                pass
        
        # Ambil data
        assets = query.all()
        
        # Format data untuk response
        result = []
        for asset in assets:
            asset_data = asset.to_dict()
            result.append(asset_data)
        
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

@rental_assets.route('/api/asset-detail/<int:asset_id>')
def get_asset_detail(asset_id):
    """API untuk mendapatkan detail aset berdasarkan ID"""
    try:
        asset = RentalAsset.query.get(asset_id)
        
        if not asset:
            return jsonify({
                'success': False,
                'error': 'Aset tidak ditemukan'
            }), 404
        
        return jsonify({
            'success': True,
            'data': asset.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rental_assets.route('/api/submit-rental-request', methods=['POST'])
def submit_rental_request():
    """API untuk mengajukan permintaan sewa aset"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        data = request.get_json()
        
        # Validasi data
        required_fields = ['asset_id', 'start_date', 'total_months']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Field {field} diperlukan'
                }), 400
        
        # Cek apakah aset tersedia
        asset = RentalAsset.query.get(data['asset_id'])
        if not asset:
            return jsonify({
                'success': False,
                'error': 'Aset tidak ditemukan'
            }), 404
        
        if asset.status != 'available':
            return jsonify({
                'success': False,
                'error': 'Aset tidak tersedia untuk disewa'
            }), 400
        
        # Hitung tanggal akhir dan total harga
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        total_months = int(data['total_months'])
        end_date = start_date + timedelta(days=30 * total_months)
        monthly_price = asset.harga_sewa
        total_price = monthly_price * total_months
        
        # Buat permintaan sewa baru
        rental_request = RentalRequest(
            asset_id=asset.id,
            user_id=session['user_id'],
            nama_penyewa=session['user_name'],
            email=session['user_email'],
            telepon=session.get('user_phone', ''),
            tanggal_mulai=start_date,
            tanggal_selesai=end_date,
            durasi_sewa=total_months,
            total_harga=total_price,
            status='pending'
        )
        
        db.session.add(rental_request)
        db.session.commit()
        
        # Buat notifikasi untuk admin
        try:
            from app.notification_helper import create_admin_notification
            create_admin_notification(
                title='Pengajuan Sewa Baru',
                message=f'Pengajuan sewa baru dari {session["user_name"]} untuk aset "{asset.name}". Durasi: {total_months} bulan, Total biaya: Rp {total_price:,.0f}. Klik untuk melihat detail dan memproses pengajuan.',
                related_type='rental_request',
                related_id=rental_request.id
            )
        except Exception as e:
            print(f"Error creating admin notification: {e}")
        
        return jsonify({
            'success': True,
            'message': 'Permintaan sewa berhasil diajukan',
            'data': {
                'request_id': rental_request.id,
                'asset_name': asset.name,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'total_months': total_months,
                'monthly_price': monthly_price,
                'total_price': total_price
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rental_assets.route('/api/user-rental-requests')
def get_user_rental_requests():
    """API untuk mendapatkan daftar permintaan sewa dari pengguna"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        user_id = session['user_id']
        
        # Filter parameter
        status = request.args.get('status', '')
        
        # Buat query dasar
        query = RentalRequest.query.filter_by(user_id=user_id)
        
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

@rental_assets.route('/api/cancel-rental-request/<int:request_id>', methods=['POST'])
def cancel_rental_request(request_id):
    """API untuk membatalkan permintaan sewa"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        user_id = session['user_id']
        
        # Cari permintaan sewa
        rental_request = RentalRequest.query.filter_by(id=request_id, user_id=user_id).first()
        
        if not rental_request:
            return jsonify({
                'success': False,
                'error': 'Permintaan sewa tidak ditemukan'
            }), 404
        
        # Cek apakah permintaan masih dalam status pending
        if rental_request.status != 'pending':
            return jsonify({
                'success': False,
                'error': 'Hanya permintaan dengan status pending yang dapat dibatalkan'
            }), 400
        
        # Ubah status menjadi rejected
        rental_request.status = 'rejected'
        rental_request.admin_notes = 'Dibatalkan oleh pengguna'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Permintaan sewa berhasil dibatalkan'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rental_assets.route('/api/user-notifications')
def get_user_notifications():
    """API untuk mendapatkan notifikasi pengguna"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        user_id = session['user_id']
        
        # Ambil permintaan sewa yang disetujui atau ditolak
        requests = RentalRequest.query.filter_by(user_id=user_id).filter(
            RentalRequest.status.in_(['approved', 'rejected'])
        ).order_by(RentalRequest.updated_at.desc()).all()
        
        # Format data untuk notifikasi
        notifications = []
        for req in requests:
            asset_name = req.asset.name if req.asset else 'Aset tidak ditemukan'
            
            if req.status == 'approved':
                message = f'Permintaan sewa untuk {asset_name} telah DISETUJUI. Silakan lihat detail di histori sewa.'
                type_notif = 'success'
            else:
                message = f'Permintaan sewa untuk {asset_name} telah DITOLAK. Alasan: {req.admin_notes or "Tidak ada alasan yang diberikan"}.'
                type_notif = 'danger'
            
            notifications.append({
                'id': req.id,
                'message': message,
                'type': type_notif,
                'created_at': req.updated_at.isoformat() if req.updated_at else req.created_at.isoformat(),
                'is_read': False  # Implementasi status baca dapat ditambahkan nanti
            })
        
        return jsonify({
            'success': True,
            'data': notifications,
            'total': len(notifications)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rental_assets.route('/api/kecamatan-list')
def get_kecamatan_list():
    """API untuk mendapatkan daftar kecamatan dari aset yang tersedia"""
    try:
        # Ambil daftar kecamatan unik dari aset yang tersedia
        kecamatan_list = db.session.query(RentalAsset.kecamatan).filter_by(status='available').distinct().all()
        
        # Format data untuk response
        result = [k[0] for k in kecamatan_list]
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500