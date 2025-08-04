from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from app import db
from app.models_sqlalchemy import RentalAsset, RentalRequest
from app.routes_user_favorites import UserFavorite
from datetime import datetime
import json

user_dashboard_api = Blueprint('user_dashboard_api', __name__)

@user_dashboard_api.route('/api/user-dashboard-stats')
def get_user_dashboard_stats():
    """API untuk mendapatkan statistik dashboard pengguna"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        user_id = session['user_id']
        
        # Hitung jumlah aset tersedia
        total_assets = RentalAsset.query.filter_by(status='available').count()
        
        # Hitung jumlah favorit
        total_favorites = UserFavorite.query.filter_by(user_id=user_id).count()
        
        # Hitung jumlah histori sewa
        total_history = RentalRequest.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            'success': True,
            'data': {
                'totalAssets': total_assets,
                'totalFavorites': total_favorites,
                'totalHistory': total_history
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500