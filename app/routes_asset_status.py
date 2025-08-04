from flask import Blueprint, jsonify, request, session
from app import db
from app.models_sqlalchemy import RentalAsset

assets_status_bp = Blueprint('assets_status', __name__)

@assets_status_bp.route('/api/check-assets-status', methods=['POST'])
def check_assets_status():
    """Check if assets are still available"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401
    
    data = request.json
    if not data or 'asset_ids' not in data:
        return jsonify({
            'success': False,
            'error': 'Missing asset_ids'
        }), 400
    
    asset_ids = data['asset_ids']
    if not asset_ids or not isinstance(asset_ids, list):
        return jsonify({
            'success': False,
            'error': 'Invalid asset_ids format'
        }), 400
    
    try:
        # Get all assets that are unavailable
        unavailable_assets = []
        for asset_id in asset_ids:
            asset = RentalAsset.query.get(asset_id)
            if not asset or asset.status != 'available':
                unavailable_assets.append(asset_id)
        
        return jsonify({
            'success': True,
            'unavailable_assets': unavailable_assets,
            'total_checked': len(asset_ids),
            'total_unavailable': len(unavailable_assets)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
