from flask import Blueprint, jsonify, request
from app.models_sqlalchemy import RentalAsset
from app import db

# Create a simple assets API blueprint without prefix
assets_api = Blueprint('assets_api', __name__)

@assets_api.route('/api/assets')
def get_assets():
    """Get all available assets for user dashboard"""
    try:
        # Get query parameters
        search = request.args.get('search', '')
        asset_type = request.args.get('type', '')
        kecamatan = request.args.get('kecamatan', '')
        min_price = request.args.get('min_price', None)
        max_price = request.args.get('max_price', None)
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 12))
        
        # Build query
        query = RentalAsset.query.filter_by(status='available')
        
        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    RentalAsset.name.ilike(f'%{search}%'),
                    RentalAsset.alamat.ilike(f'%{search}%'),
                    RentalAsset.kecamatan.ilike(f'%{search}%')
                )
            )
        
        if asset_type:
            query = query.filter_by(asset_type=asset_type)
            
        if kecamatan:
            query = query.filter_by(kecamatan=kecamatan)
            
        if min_price:
            query = query.filter(RentalAsset.harga_sewa >= float(min_price))
            
        if max_price:
            query = query.filter(RentalAsset.harga_sewa <= float(max_price))
        
        # Order by created_at desc
        query = query.order_by(RentalAsset.created_at.desc())
        
        # Paginate
        paginated = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Convert to dict
        assets = []
        for asset in paginated.items:
            asset_dict = asset.to_dict()
            assets.append(asset_dict)
        
        return jsonify({
            'success': True,
            'data': assets,
            'pagination': {
                'page': paginated.page,
                'pages': paginated.pages,
                'per_page': paginated.per_page,
                'total': paginated.total,
                'has_next': paginated.has_next,
                'has_prev': paginated.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@assets_api.route('/api/assets/available')
def get_available_assets():
    """Alias for /api/assets for backward compatibility"""
    return get_assets()
