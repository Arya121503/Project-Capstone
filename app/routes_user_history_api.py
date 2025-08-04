from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from app import db
from app.models_sqlalchemy import RentalAsset, RentalRequest
from datetime import datetime, timedelta
import json

user_history_api = Blueprint('user_history_api', __name__)

@user_history_api.route('/api/user-rental-history')
def get_user_rental_history():
    """API untuk mendapatkan histori sewa pengguna"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        user_id = session['user_id']
        
        # Filter parameter
        status = request.args.get('status', '')
        period = request.args.get('period', '')
        
        # Buat query dasar
        query = RentalRequest.query.filter_by(user_id=user_id)
        
        # Terapkan filter status
        if status:
            query = query.filter_by(status=status)
        
        # Terapkan filter periode
        if period:
            now = datetime.utcnow()
            if period == '7hari':
                start_date = now - timedelta(days=7)
                query = query.filter(RentalRequest.created_at >= start_date)
            elif period == '1bulan':
                start_date = now - timedelta(days=30)
                query = query.filter(RentalRequest.created_at >= start_date)
            elif period == '3bulan':
                start_date = now - timedelta(days=90)
                query = query.filter(RentalRequest.created_at >= start_date)
            elif period == '6bulan':
                start_date = now - timedelta(days=180)
                query = query.filter(RentalRequest.created_at >= start_date)
            elif period == '1tahun':
                start_date = now - timedelta(days=365)
                query = query.filter(RentalRequest.created_at >= start_date)
        
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

@user_history_api.route('/api/user-rental-history/timeline')
def get_user_rental_timeline():
    """API untuk mendapatkan timeline aktivitas pengguna"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        user_id = session['user_id']
        
        # Ambil semua permintaan sewa
        requests = RentalRequest.query.filter_by(user_id=user_id).order_by(RentalRequest.created_at.desc()).all()
        
        # Format data untuk timeline
        timeline = []
        for req in requests:
            # Event pengajuan
            timeline.append({
                'id': f'req-{req.id}-created',
                'type': 'request_created',
                'title': 'Pengajuan Sewa Baru',
                'description': f'Anda mengajukan sewa untuk {req.asset.name if req.asset else "Aset tidak ditemukan"} selama {req.total_months} bulan',
                'date': req.created_at.isoformat() if req.created_at else None,
                'status': 'pending',
                'request_id': req.id,
                'asset_id': req.asset_id
            })
            
            # Event perubahan status
            if req.status != 'pending':
                timeline.append({
                    'id': f'req-{req.id}-{req.status}',
                    'type': f'request_{req.status}',
                    'title': f'Pengajuan {req.status.capitalize()}',
                    'description': f'Pengajuan sewa untuk {req.asset.name if req.asset else "Aset tidak ditemukan"} telah {req.status.upper()}',
                    'date': req.updated_at.isoformat() if req.updated_at else req.created_at.isoformat(),
                    'status': req.status,
                    'request_id': req.id,
                    'asset_id': req.asset_id,
                    'notes': req.admin_notes
                })
        
        # Urutkan berdasarkan tanggal terbaru
        timeline.sort(key=lambda x: x['date'], reverse=True)
        
        return jsonify({
            'success': True,
            'data': timeline,
            'total': len(timeline)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500