from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from app import db
from app.models_sqlalchemy import RentalAsset, RentalRequest
from app.models_user_favorites import UserFavorite
from datetime import datetime
import json

favorites_bp = Blueprint('favorites', __name__)

@favorites_bp.route('/api/user-favorites')
def get_user_favorites():
    """API untuk mendapatkan daftar aset favorit pengguna"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        user_id = session['user_id']
        
        # Filter parameter
        asset_type = request.args.get('asset_type', '')
        kecamatan = request.args.get('kecamatan', '')
        
        # Ambil semua favorit user
        favorites = UserFavorite.query.filter_by(user_id=user_id).order_by(UserFavorite.created_at.desc()).all()
        
        # Format data untuk response dengan informasi aset
        result = []
        for fav in favorites:
            # Ambil informasi aset
            asset = RentalAsset.query.get(fav.asset_id)
            if asset:
                # Filter berdasarkan parameter jika ada
                if asset_type and asset.asset_type != asset_type:
                    continue
                    
                if kecamatan and asset.kecamatan != kecamatan:
                    continue
                
                # Buat data response
                fav_data = fav.to_dict()
                fav_data['asset'] = asset.to_dict()
                result.append(fav_data)
        
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

@favorites_bp.route('/api/toggle-favorite/<int:asset_id>', methods=['POST'])
def toggle_favorite(asset_id):
    """API untuk menambah atau menghapus aset dari favorit"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        user_id = session['user_id']
        
        # Cek apakah aset ada dan tersedia
        asset = RentalAsset.query.get(asset_id)
        if not asset:
            return jsonify({
                'success': False,
                'error': 'Aset tidak ditemukan'
            }), 404
        
        # Check if asset is available when trying to add to favorites
        request_data = request.json or {}
        action = request_data.get('action', 'add')
        
        if action == 'add' and asset.status != 'available':
            return jsonify({
                'success': False,
                'error': 'Aset ini tidak lagi tersedia untuk disewa',
                'status': asset.status
            }), 404
        
        # Cek apakah aset sudah ada di favorit
        favorite = UserFavorite.query.filter_by(user_id=user_id, asset_id=asset_id).first()
        
        if favorite:
            # Hapus dari favorit
            db.session.delete(favorite)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Aset dihapus dari favorit',
                'is_favorited': False
            })
        else:
            # Tambahkan ke favorit
            favorite = UserFavorite(user_id=user_id, asset_id=asset_id)
            db.session.add(favorite)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Aset ditambahkan ke favorit',
                'is_favorited': True
            })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@favorites_bp.route('/api/user-favorites/count')
def get_user_favorites_count():
    """API untuk mendapatkan jumlah aset favorit pengguna"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        user_id = session['user_id']
        
        # Hitung jumlah favorit
        count = UserFavorite.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            'success': True,
            'count': count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@favorites_bp.route('/api/check-favorite/<int:asset_id>')
def check_favorite(asset_id):
    """API untuk mengecek apakah aset ada di favorit pengguna"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Anda harus login terlebih dahulu'
        }), 401
    
    try:
        user_id = session['user_id']
        
        # Cek apakah aset ada di favorit
        favorite = UserFavorite.query.filter_by(user_id=user_id, asset_id=asset_id).first()
        
        return jsonify({
            'success': True,
            'is_favorited': favorite is not None
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500