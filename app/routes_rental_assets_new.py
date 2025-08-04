from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for, current_app, session
from werkzeug.utils import secure_filename
from app import db
from app.models_sqlalchemy import RentalAsset, RentalRequest, AdminNotification
from app.models_rental_transaction import RentalTransaction
from functools import wraps
from datetime import datetime, date
import json
import os
from sqlalchemy import or_

rental_assets = Blueprint('rental_assets', __name__, url_prefix='/rental')

# Custom decorator to check admin
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Custom decorator to check login
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

# CRUD API Endpoints

@rental_assets.route('/api/assets', methods=['GET'])
def get_all_assets():
    """Get all rental assets with optional filters"""
    try:
        search = request.args.get('search', '')
        asset_type = request.args.get('type', '')
        kecamatan = request.args.get('kecamatan', '')
        status = request.args.get('status', '')
        min_price = request.args.get('min_price', None)
        max_price = request.args.get('max_price', None)
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        query = RentalAsset.query
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    RentalAsset.name.contains(search),
                    RentalAsset.alamat.contains(search),
                    RentalAsset.deskripsi.contains(search)
                )
            )
        
        if asset_type and asset_type != 'all':
            query = query.filter_by(asset_type=asset_type)
        
        if kecamatan and kecamatan != 'all':
            query = query.filter_by(kecamatan=kecamatan)
        
        if status and status != 'all':
            query = query.filter_by(status=status)
        
        if min_price is not None:
            query = query.filter(RentalAsset.harga_sewa >= float(min_price))
        
        if max_price is not None:
            query = query.filter(RentalAsset.harga_sewa <= float(max_price))
        
        # Pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        assets = pagination.items
        
        return jsonify({
            'success': True,
            'assets': [asset.to_dict() for asset in assets],
            'pagination': {
                'page': page,
                'pages': pagination.pages,
                'per_page': per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@rental_assets.route('/api/assets/available', methods=['GET'])
def get_available_assets():
    """Get all available rental assets"""
    try:
        search = request.args.get('search', '')
        asset_type = request.args.get('asset_type', request.args.get('type', ''))
        location = request.args.get('location', request.args.get('kecamatan', ''))
        price_range = request.args.get('price_range', '')
        sort_by = request.args.get('sort', 'newest')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        query = RentalAsset.query.filter_by(status='available')
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    RentalAsset.name.contains(search),
                    RentalAsset.alamat.contains(search),
                    RentalAsset.deskripsi.contains(search)
                )
            )
        
        if asset_type and asset_type != 'all':
            query = query.filter_by(asset_type=asset_type)
        
        if location and location != 'all':
            query = query.filter_by(kecamatan=location)
        
        # Apply price range filter
        if price_range and price_range != 'all':
            if '-' in price_range:
                try:
                    min_price, max_price = price_range.split('-')
                    min_price = int(min_price)
                    max_price = int(max_price)
                    query = query.filter(
                        RentalAsset.harga_sewa >= min_price,
                        RentalAsset.harga_sewa <= max_price
                    )
                except (ValueError, TypeError):
                    pass  # Ignore invalid price range format
        
        # Apply sorting
        if sort_by == 'newest':
            query = query.order_by(RentalAsset.created_at.desc())
        elif sort_by == 'price-asc':
            query = query.order_by(RentalAsset.harga_sewa.asc())
        elif sort_by == 'price-desc':
            query = query.order_by(RentalAsset.harga_sewa.desc())
        elif sort_by == 'name-asc':
            query = query.order_by(RentalAsset.name.asc())
        
        # Pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        assets = pagination.items
        
        return jsonify({
            'success': True,
            'assets': [asset.to_dict() for asset in assets],
            'pagination': {
                'page': page,
                'pages': pagination.pages,
                'per_page': per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@rental_assets.route('/api/assets/rented', methods=['GET'])
def get_rented_assets():
    """Get all rented assets with rental transaction information"""
    try:
        search = request.args.get('search', '')
        asset_type = request.args.get('type', '')
        sort_by = request.args.get('sort', 'newest')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        # Use raw SQL to join with rental_transactions table
        from flask import current_app
        import mysql.connector
        from config import Config
        
        # Buat koneksi MySQL secara langsung
        conn = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB
        )
        cursor = conn.cursor()
        
        # Base query to get rented assets with transaction info
        base_query = """
            SELECT DISTINCT
                ra.id as asset_id,
                ra.name,
                ra.asset_type,
                ra.kecamatan,
                ra.alamat,
                ra.luas_tanah,
                ra.luas_bangunan,
                ra.harga_sewa,
                ra.status,
                rt.id as transaction_id,
                rt.user_id,
                rt.start_date,
                rt.end_date,
                rt.current_end_date,
                rt.total_months,
                rt.monthly_price,
                rt.status as transaction_status,
                rt.payment_status,
                rt.created_at as transaction_created,
                u.name as user_name,
                u.email as user_email
            FROM rental_assets ra
            INNER JOIN rental_transactions rt ON ra.id = rt.asset_id
            INNER JOIN users u ON rt.user_id = u.id
            WHERE ra.status = 'rented' 
            AND rt.status = 'active'
            AND rt.payment_status = 'paid'
        """
        
        # Add search filter
        search_conditions = []
        params = []
        
        if search:
            search_conditions.append("(ra.name LIKE %s OR ra.alamat LIKE %s OR u.name LIKE %s)")
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])
        
        if asset_type and asset_type != 'all':
            search_conditions.append("ra.asset_type = %s")
            params.append(asset_type)
        
        if search_conditions:
            base_query += " AND " + " AND ".join(search_conditions)
        
        # Add sorting
        if sort_by == 'newest':
            base_query += " ORDER BY rt.created_at DESC"
        elif sort_by == 'end-date':
            base_query += " ORDER BY rt.end_date ASC"
        elif sort_by == 'tenant-name':
            base_query += " ORDER BY u.name ASC"
        else:
            base_query += " ORDER BY rt.created_at DESC"
        
        # Get total count for pagination
        count_query = """
            SELECT COUNT(DISTINCT ra.id) 
            FROM rental_assets ra
            INNER JOIN rental_transactions rt ON ra.id = rt.asset_id
            INNER JOIN users u ON rt.user_id = u.id
            WHERE ra.status = 'rented' 
            AND rt.status = 'active'
            AND rt.payment_status = 'paid'
        """
        
        # Add search conditions to count query if needed
        if search_conditions:
            count_query += " AND " + " AND ".join(search_conditions)
            
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]
        
        # Add pagination
        offset = (page - 1) * per_page
        base_query += f" LIMIT {per_page} OFFSET {offset}"
        
        cursor.execute(base_query, params)
        results = cursor.fetchall()
        
        rented_assets = []
        for row in results:
            asset_data = {
                'id': row[0],
                'name': row[1],
                'asset_type': row[2],
                'kecamatan': row[3],
                'alamat': row[4],
                'luas_tanah': row[5],
                'luas_bangunan': row[6],
                'harga_sewa': float(row[7]) if row[7] else 0,
                'status': row[8],
                'rental_info': {
                    'id': row[9],
                    'user_id': row[10],
                    'start_date': row[11].strftime('%Y-%m-%d') if row[11] else None,
                    'end_date': row[12].strftime('%Y-%m-%d') if row[12] else None,
                    'current_end_date': row[13].strftime('%Y-%m-%d') if row[13] else None,
                    'total_months': row[14],
                    'monthly_price': float(row[15]) if row[15] else 0,
                    'status': row[16],
                    'payment_status': row[17],
                    'created_at': row[18].strftime('%Y-%m-%d %H:%M:%S') if row[18] else None,
                    'user_name': row[19],
                    'user_email': row[20]
                }
            }
            rented_assets.append(asset_data)
        
        cursor.close()
        conn.close()
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return jsonify({
            'success': True,
            'assets': rented_assets,
            'pagination': {
                'page': page,
                'pages': total_pages,
                'per_page': per_page,
                'total': total_count,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        })
    except Exception as e:
        print(f"Error in get_rented_assets: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@rental_assets.route('/api/assets', methods=['POST'])
def create_asset():
    """Create a new rental asset"""
    # Temporarily removed authentication requirements for development
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        print(f"DEBUG: Received data for asset creation: {data}")  # Debug print
        
        # Map form fields to database fields
        field_mapping = {
            'asset_name': 'name',
            'location': 'kecamatan',
            'address': 'alamat',
            'land_size': 'luas_tanah',
            'building_size': 'luas_bangunan',
            'bedrooms': 'kamar_tidur',
            'bathrooms': 'kamar_mandi',
            'floors': 'jumlah_lantai',
            'rental_price': 'harga_sewa',
            'certificate': 'sertifikat',
            'zone_type': 'jenis_zona',
            'description': 'deskripsi'
        }
        
        # Apply field mapping
        mapped_data = {}
        for form_field, db_field in field_mapping.items():
            if form_field in data:
                mapped_data[db_field] = data[form_field]
        
        # Add fields that are already in database format
        db_direct_fields = ['name', 'kecamatan', 'alamat', 'luas_tanah', 'luas_bangunan', 
                           'kamar_tidur', 'kamar_mandi', 'jumlah_lantai', 'harga_sewa', 
                           'sertifikat', 'jenis_zona', 'deskripsi']
        for field in db_direct_fields:
            if field in data and field not in mapped_data:
                mapped_data[field] = data[field]
        
        # Add other fields directly
        direct_fields = ['asset_type', 'njop_per_m2', 'status', 'daya_listrik', 
                        'aksesibilitas', 'tingkat_keamanan', 'kondisi_properti', 'description']
        for field in direct_fields:
            if field in data:
                if field == 'description':
                    mapped_data['deskripsi'] = data[field]  # Map description to deskripsi
                else:
                    mapped_data[field] = data[field]
        
        # Validate required fields
        required_fields = ['name', 'asset_type', 'kecamatan', 'alamat', 'luas_tanah', 
                          'njop_per_m2', 'harga_sewa', 'sertifikat', 'jenis_zona']
        
        for field in required_fields:
            if field not in mapped_data or not mapped_data[field]:
                return jsonify({'success': False, 'error': f'Field {field} is required'}), 400
        
        print(f"DEBUG: Final mapped data: {mapped_data}")  # Debug print
        
        # Create new asset
        new_asset = RentalAsset(
            name=mapped_data['name'],
            asset_type=mapped_data['asset_type'],
            kecamatan=mapped_data['kecamatan'],
            alamat=mapped_data['alamat'],
            luas_tanah=float(mapped_data['luas_tanah']),
            luas_bangunan=float(mapped_data.get('luas_bangunan', 0)) if mapped_data.get('luas_bangunan') else None,
            kamar_tidur=int(mapped_data.get('kamar_tidur', 0)) if mapped_data.get('kamar_tidur') else None,
            kamar_mandi=int(mapped_data.get('kamar_mandi', 0)) if mapped_data.get('kamar_mandi') else None,
            jumlah_lantai=int(mapped_data.get('jumlah_lantai', 1)) if mapped_data.get('jumlah_lantai') else None,
            njop_per_m2=float(mapped_data['njop_per_m2']),
            harga_sewa=float(mapped_data['harga_sewa']),
            sertifikat=mapped_data['sertifikat'],
            jenis_zona=mapped_data['jenis_zona'],
            aksesibilitas=mapped_data.get('aksesibilitas', 'Baik'),
            tingkat_keamanan=mapped_data.get('tingkat_keamanan', 'Sedang'),
            daya_listrik=mapped_data.get('daya_listrik'),
            kondisi_properti=mapped_data.get('kondisi_properti', 'Baik'),
            deskripsi=mapped_data.get('deskripsi'),
            status=mapped_data.get('status', 'available')
        )
        
        db.session.add(new_asset)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Asset created successfully',
            'asset': new_asset.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        if "NoneType" in error_msg and "not subscriptable" in error_msg:
            error_msg = "Error saat memproses data formulir. Pastikan semua field terisi dengan benar."
        elif "IntegrityError" in error_msg or "UNIQUE constraint" in error_msg:
            error_msg = "Aset dengan nama yang sama sudah ada. Gunakan nama aset yang berbeda."
        elif "foreign key constraint" in error_msg:
            error_msg = "Error referensi data. Pastikan semua referensi data valid."
        
        print(f"Error adding asset: {str(e)}")
        return jsonify({'success': False, 'error': error_msg}), 500

@rental_assets.route('/api/assets/<int:asset_id>', methods=['PUT'])
def update_asset(asset_id):
    """Update a rental asset"""
    # Temporarily removed authentication requirements for development
    try:
        asset = RentalAsset.query.get_or_404(asset_id)
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        print(f"DEBUG: Received data for asset update: {data}")  # Debug print
        
        # Handle special fields: map 'description' to 'deskripsi'
        if 'description' in data:
            data['deskripsi'] = data['description']
        
        # Handle asset_name field mapping
        if 'asset_name' in data:
            data['name'] = data['asset_name']
            
        # Handle address field mapping
        if 'address' in data:
            data['alamat'] = data['address']
        
        # Update fields
        updatable_fields = [
            'name', 'asset_type', 'kecamatan', 'alamat', 'luas_tanah', 'luas_bangunan',
            'kamar_tidur', 'kamar_mandi', 'jumlah_lantai', 'njop_per_m2', 'harga_sewa',
            'sertifikat', 'jenis_zona', 'aksesibilitas', 'tingkat_keamanan',
            'daya_listrik', 'kondisi_properti', 'deskripsi', 'status'
        ]
        
        for field in updatable_fields:
            if field in data:
                old_value = getattr(asset, field, None)
                if field in ['luas_tanah', 'luas_bangunan', 'njop_per_m2', 'harga_sewa']:
                    new_value = float(data[field]) if data[field] else None
                elif field in ['kamar_tidur', 'kamar_mandi', 'jumlah_lantai']:
                    new_value = int(data[field]) if data[field] else None
                else:
                    new_value = data[field]
                
                setattr(asset, field, new_value)
                print(f"DEBUG: Updated {field} from '{old_value}' to '{new_value}'")  # Debug print
        
        asset.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Asset updated successfully',
            'asset': asset.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@rental_assets.route('/api/assets/<int:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    """Delete a rental asset"""
    # Temporarily removed authentication requirements for development
    try:
        asset = RentalAsset.query.get_or_404(asset_id)
        
        # Check if asset is currently rented
        if asset.status == 'rented':
            return jsonify({
                'success': False, 
                'error': 'Cannot delete asset that is currently rented'
            }), 400
        
        # Check for existing rental transactions
        from app.models_rental_transaction import RentalTransaction
        existing_transactions = RentalTransaction.query.filter_by(asset_id=asset_id).count()
        if existing_transactions > 0:
            return jsonify({
                'success': False,
                'error': 'Cannot delete asset that has rental transaction history. Please contact administrator.'
            }), 400
        
        # Check for existing rental requests
        existing_requests = RentalRequest.query.filter_by(asset_id=asset_id).count()
        if existing_requests > 0:
            return jsonify({
                'success': False,
                'error': 'Cannot delete asset that has rental request history. Please contact administrator.'
            }), 400
        
        db.session.delete(asset)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Asset deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting asset {asset_id}: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@rental_assets.route('/api/assets/<int:asset_id>/force-delete', methods=['DELETE'])
def force_delete_asset(asset_id):
    """Force delete a rental asset with all its related data"""
    # This should only be used by administrators and with extreme caution
    try:
        asset = RentalAsset.query.get_or_404(asset_id)
        
        # First, delete all related rental transactions
        from app.models_rental_transaction import RentalTransaction
        RentalTransaction.query.filter_by(asset_id=asset_id).delete()
        
        # Delete all related rental requests
        RentalRequest.query.filter_by(asset_id=asset_id).delete()
        
        # Finally, delete the asset
        db.session.delete(asset)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Asset and all related data deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error force deleting asset {asset_id}: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Rental Request Management

@rental_assets.route('/api/rental-requests', methods=['GET'])
@login_required
@admin_required
def get_rental_requests():
    """Get all rental requests"""
    try:
        status_filter = request.args.get('status', '')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        query = RentalRequest.query
        
        if status_filter and status_filter != 'all':
            query = query.filter_by(status=status_filter)
        
        query = query.order_by(RentalRequest.created_at.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        requests = pagination.items
        
        return jsonify({
            'success': True,
            'requests': [req.to_dict() for req in requests],
            'pagination': {
                'page': page,
                'pages': pagination.pages,
                'per_page': per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@rental_assets.route('/api/rental-requests/<int:request_id>/approve', methods=['POST'])
@login_required
@admin_required
def approve_rental_request(request_id):
    """Approve a rental request"""
    try:
        rental_request = RentalRequest.query.get_or_404(request_id)
        
        if rental_request.status != 'pending':
            return jsonify({
                'success': False,
                'error': 'Only pending requests can be approved'
            }), 400
        
        # Update request status
        rental_request.status = 'active'  # Changed from 'approved' to 'active'
        
        # Update asset status to rented
        asset = RentalAsset.query.get(rental_request.asset_id)
        asset.status = 'rented'
        
        # Remove this asset from all users' favorites
        try:
            from app.models_user_favorites import UserFavorite
            removed_count = UserFavorite.remove_asset_from_all_favorites(
                asset_id=asset.id,
                asset_source='rental_assets'
            )
            print(f"Removed asset {asset.id} from {removed_count} users' favorites")
        except Exception as e:
            print(f"Error removing asset from favorites: {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Rental request approved successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@rental_assets.route('/api/rental-requests/<int:request_id>/reject', methods=['POST'])
@login_required
@admin_required
def reject_rental_request(request_id):
    """Reject a rental request"""
    try:
        rental_request = RentalRequest.query.get_or_404(request_id)
        
        if rental_request.status != 'pending':
            return jsonify({
                'success': False,
                'error': 'Only pending requests can be rejected'
            }), 400
        
        # Get admin notes if provided
        data = request.get_json() or {}
        admin_notes = data.get('notes', '')
        
        # Update request status
        rental_request.status = 'rejected'
        if admin_notes:
            rental_request.admin_notes = admin_notes
        
        # Asset remains available since request was rejected
        asset = RentalAsset.query.get(rental_request.asset_id)
        asset.status = 'available'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Rental request rejected successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# User Rental Request Submission
@rental_assets.route('/api/rental-requests', methods=['POST'])
@login_required
def create_rental_request():
    """Create a new rental request from user"""
    try:
        data = request.json
        
        # Check if the asset exists and is available
        asset = RentalAsset.query.get_or_404(data.get('asset_id'))
        if asset.status != 'available':
            return jsonify({
                'success': False,
                'error': 'Asset is not available for rent'
            }), 400
        
        # Get user ID from session
        user_id = session.get('user_id')
        
        # Calculate end date based on start date and duration
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        duration_months = data.get('total_months', data.get('duration_months', 1))
        
        # Calculate end date by adding duration_months * 30 days
        from datetime import timedelta
        end_date = start_date + timedelta(days=duration_months * 30)
        
        # Create new rental request
        new_request = RentalRequest(
            asset_id=data['asset_id'],
            user_id=user_id,
            nama_penyewa=data['user_name'],
            email=data['user_email'],
            telepon=data['user_phone'],
            tanggal_mulai=start_date,
            tanggal_selesai=end_date,
            durasi_sewa=duration_months,
            total_harga=data['total_price'],
            status='pending',
            admin_notes=data.get('admin_notes', '')
        )
        
        db.session.add(new_request)
        db.session.flush()  # Flush to get the ID
        
        # Create admin notification using helper function
        try:
            from app.notification_helper import create_admin_notification_for_rental_request
            create_admin_notification_for_rental_request(new_request.id)
        except Exception as e:
            print(f"Error creating admin notification: {e}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Rental request submitted successfully',
            'request_id': new_request.id
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating rental request: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Statistics and Dashboard Data

@rental_assets.route('/api/stats', methods=['GET'])
def get_rental_stats():
    """Get rental assets statistics"""
    try:
        total_assets = RentalAsset.query.count()
        available_assets = RentalAsset.query.filter_by(status='available').count()
        rented_assets = RentalAsset.query.filter_by(status='rented').count()
        
        avg_price = db.session.query(db.func.avg(RentalAsset.harga_sewa)).scalar() or 0
        
        stats = {
            'total_assets': total_assets,
            'available_assets': available_assets,
            'rented_assets': rented_assets,
            'maintenance_assets': RentalAsset.query.filter_by(status='maintenance').count(),
            'avg_rental_price': float(avg_price),
            'pending_requests': RentalRequest.query.filter_by(status='pending').count()
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# View Routes

@rental_assets.route('/admin/assets')
@login_required
@admin_required
def admin_assets_page():
    """Admin page for managing rental assets"""
    return render_template('admin/rental_assets.html')

@rental_assets.route('/assets')
def public_assets_page():
    """Public page for viewing available rental assets"""
    return render_template('public/rental_assets.html')

@rental_assets.route('/api/assets/<int:asset_id>', methods=['GET'])
def get_asset_by_id(asset_id):
    """Get a rental asset by ID"""
    try:
        print(f"DEBUG: Getting asset with ID: {asset_id}")
        asset = RentalAsset.query.get(asset_id)
        
        if not asset:
            print(f"DEBUG: Asset with ID {asset_id} not found")
            return jsonify({
                'success': False,
                'error': 'Asset not found'
            }), 404
        
        print(f"DEBUG: Found asset: {asset.name}")
        asset_dict = asset.to_dict()
        print(f"DEBUG: Asset dict: {asset_dict}")
        
        return jsonify({
            'success': True,
            'data': asset_dict
        })
    except Exception as e:
        print(f"Error in get_asset_by_id: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rental_assets.route('/api/kecamatan-list', methods=['GET'])
def get_kecamatan_list():
    """Get list of all kecamatan from rental assets"""
    try:
        # Get distinct kecamatan from database
        distinct_kecamatan = db.session.query(RentalAsset.kecamatan).distinct().all()
        kecamatan_list = [kec[0] for kec in distinct_kecamatan if kec[0]]
        
        # If no data in database, return the 31 kecamatan of Surabaya
        if not kecamatan_list:
            kecamatan_list = [
                "Asemrowo", "Benowo", "Bubutan", "Bulak", "Dukuh Pakis",
                "Gayungan", "Genteng", "Gubeng", "Gunung Anyar", "Jambangan",
                "Karang Pilang", "Kenjeran", "Krembangan", "Lakarsantri", "Mulyorejo",
                "Pabean Cantian", "Pakal", "Rungkut", "Sambikerep", "Sawahan",
                "Semampir", "Simokerto", "Sukolilo", "Sukomanunggal", "Tambaksari",
                "Tandes", "Tegalsari", "Tenggilis Mejoyo", "Wiyung", "Wonocolo",
                "Wonokromo"
            ]
        
        # Sort the list alphabetically
        kecamatan_list.sort()
        
        return jsonify({
            'success': True,
            'data': kecamatan_list
        })
    except Exception as e:
        print(f"Error in get_kecamatan_list: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rental_assets.route('/api/rental-detail/<int:asset_id>', methods=['GET'])
@admin_required
def get_rental_detail(asset_id):
    """Get detailed rental information for a specific asset"""
    try:
        # Get the asset
        asset = RentalAsset.query.get(asset_id)
        if not asset:
            return jsonify({
                'success': False,
                'error': 'Asset not found'
            }), 404
        
        # Get current rental request for this asset
        # Check for both 'approved' and 'active' status
        current_rental = RentalRequest.query.filter_by(
            asset_id=asset_id
        ).filter(
            RentalRequest.status.in_(['approved', 'active'])
        ).first()
        
        # If no active rental found, get the most recent rental for this asset
        if not current_rental:
            current_rental = RentalRequest.query.filter_by(
                asset_id=asset_id
            ).order_by(RentalRequest.created_at.desc()).first()
        
        # Prepare asset data
        asset_data = asset.to_dict()
        
        # Prepare rental data
        rental_data = None
        if current_rental:
            rental_data = {
                'id': current_rental.id,
                'user_id': current_rental.user_id,
                'user_name': current_rental.user_name,
                'user_email': current_rental.user_email,
                'user_phone': current_rental.user_phone,
                'total_months': current_rental.total_months,
                'monthly_price': current_rental.monthly_price,
                'start_date': current_rental.start_date.isoformat() if current_rental.start_date else None,
                'end_date': current_rental.end_date.isoformat() if current_rental.end_date else None,
                'total_price': float(current_rental.total_price) if current_rental.total_price else 0,
                'created_at': current_rental.created_at.isoformat() if current_rental.created_at else None,
                'admin_notes': current_rental.admin_notes,
                'status': current_rental.status
            }
        
        return jsonify({
            'success': True,
            'data': {
                'asset': asset_data,
                'rental': rental_data,
                'is_rented': rental_data is not None and current_rental.status in ['approved', 'active']
            }
        })
        
    except Exception as e:
        print(f"Error in get_rental_detail: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@rental_assets.route('/api/end-rental/<int:rental_id>', methods=['POST'])
@admin_required
def end_rental(rental_id):
    """End a rental and make the asset available again"""
    try:
        # First, try to find the rental transaction (for "Bayar Sekarang" flow)
        rental_transaction = RentalTransaction.query.get(rental_id)
        rental_request = None
        asset = None
        asset_id = None
        asset_name = ""
        
        if rental_transaction:
            # This is a direct payment transaction
            if rental_transaction.status not in ['active']:
                return jsonify({
                    'success': False,
                    'error': f'Rental transaction is not currently active (status: {rental_transaction.status})'
                }), 400
            
            # Get the associated asset
            asset = RentalAsset.query.get(rental_transaction.asset_id)
            if not asset:
                return jsonify({
                    'success': False,
                    'error': 'Associated asset not found'
                }), 404
            
            asset_id = asset.id
            asset_name = asset.name
            
            # Update rental transaction status
            rental_transaction.status = 'completed'
            rental_transaction.current_end_date = datetime.now().date()
            rental_transaction.updated_at = datetime.now()
            
            # Update asset status to available
            asset.status = 'available'
            
        else:
            # Fall back to rental request (for "Ajukan Sewa" flow)
            rental_request = RentalRequest.query.get(rental_id)
            if not rental_request:
                return jsonify({
                    'success': False,
                    'error': 'Rental not found'
                }), 404
            
            # Check if rental is currently active
            if rental_request.status not in ['approved', 'active']:
                return jsonify({
                    'success': False,
                    'error': f'Rental is not currently active (status: {rental_request.status})'
                }), 400
            
            # Get the associated asset
            asset = RentalAsset.query.get(rental_request.asset_id)
            if not asset:
                return jsonify({
                    'success': False,
                    'error': 'Associated asset not found'
                }), 404
            
            asset_id = asset.id
            asset_name = asset.name
            
            # Update rental request status
            rental_request.status = 'completed'
            rental_request.tanggal_selesai = datetime.now().date()
            
            # Update asset status to available
            asset.status = 'available'
            
            # Also update any related rental transaction
            related_transaction = RentalTransaction.query.filter_by(
                rental_request_id=rental_request.id
            ).first()
            
            if related_transaction:
                related_transaction.status = 'completed'
                related_transaction.current_end_date = datetime.now().date()
                related_transaction.updated_at = datetime.now()
        
        # Create admin notification
        notification = AdminNotification(
            title='Rental Ended',
            message=f'Rental for {asset_name} has been ended by admin. Asset is now available.',
            related_type='rental_transaction' if rental_transaction else 'rental_request',
            related_id=rental_id,
            is_read=False
        )
        
        # Save changes
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Rental ended successfully',
            'data': {
                'rental_id': rental_id,
                'asset_id': asset_id,
                'asset_name': asset_name,
                'new_status': asset.status,
                'transaction_type': 'transaction' if rental_transaction else 'request'
            }
        })
        
    except Exception as e:
        print(f"Error in end_rental: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
