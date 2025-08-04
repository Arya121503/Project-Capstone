from app import db
from datetime import datetime
from sqlalchemy import text

class UserFavorite(db.Model):
    __tablename__ = 'user_favorites'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    asset_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserFavorite user_id={self.user_id} asset_id={self.asset_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'asset_id': self.asset_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def add_favorite(cls, user_id, asset_id, asset_type='tanah', asset_source='prediksi_tanah', notes=None):
        """Add a favorite for a user"""
        try:
            # Check if already exists (only check fields that actually exist)
            existing = cls.query.filter_by(
                user_id=user_id, 
                asset_id=asset_id
            ).first()
            
            if existing:
                return existing
            
            # Create new favorite (only use fields that exist in the table)
            favorite = cls()
            favorite.user_id = user_id
            favorite.asset_id = asset_id
            
            db.session.add(favorite)
            db.session.commit()
            return favorite
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    @classmethod
    def remove_favorite(cls, user_id, asset_id, asset_source='prediksi_tanah'):
        """Remove a favorite for a user"""
        try:
            favorite = cls.query.filter_by(
                user_id=user_id, 
                asset_id=asset_id
            ).first()
            
            if favorite:
                db.session.delete(favorite)
                db.session.commit()
                return True
            return False
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    @classmethod
    def is_favorite(cls, user_id, asset_id, asset_source='prediksi_tanah'):
        """Check if an asset is favorited by a user"""
        return cls.query.filter_by(
            user_id=user_id, 
            asset_id=asset_id, 
            asset_source=asset_source
        ).first() is not None
    
    @classmethod
    def get_user_favorites(cls, user_id, asset_type=None, limit=None, offset=None):
        """Get all favorites for a user with optional filtering"""
        query = cls.query.filter_by(user_id=user_id)
        
        if asset_type:
            query = query.filter_by(asset_type=asset_type)
        
        query = query.order_by(cls.created_at.desc())
        
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        
        return query.all()
    
    @classmethod
    def get_user_favorites_count(cls, user_id, asset_type=None):
        """Get count of favorites for a user - Robust implementation"""
        try:
            print(f"DEBUG: get_user_favorites_count called with user_id: {user_id}, asset_type: '{asset_type}'")
            
            # Simple approach: filter directly at database level
            query = cls.query.filter_by(user_id=user_id)
            
            # Filter by asset_type if specified (same approach as "Aset Tersedia")
            if asset_type and asset_type.strip() and asset_type != 'all':
                query = query.filter_by(asset_type=asset_type)
                print(f"DEBUG: Added asset_type filter: '{asset_type}'")
            
            count = query.count()
            print(f"DEBUG: Count result: {count}")
            
            return count
            
        except Exception as e:
            print(f"ERROR in get_user_favorites_count: {e}")
            import traceback
            traceback.print_exc()
            return 0
    
    @classmethod
    def get_favorites_with_asset_data(cls, user_id, asset_type=None, kecamatan=None, limit=None, offset=None):
        """Get favorites with full asset data - Simple and bulletproof implementation"""
        try:
            print(f"DEBUG: Starting get_favorites_with_asset_data")
            print(f"  - user_id: {user_id}")
            print(f"  - asset_type filter: '{asset_type}'")
            print(f"  - kecamatan filter: '{kecamatan}'")
            
            # Step 1: Get ALL user favorites first (no filtering at database level)
            all_favorites = cls.query.filter_by(user_id=user_id).order_by(cls.created_at.desc()).all()
            print(f"DEBUG: Found {len(all_favorites)} total favorites for user {user_id}")
            
            if not all_favorites:
                return []
            
            # Step 2: Process each favorite and apply filters
            result_data = []
            
            for fav in all_favorites:
                print(f"\nDEBUG: Processing favorite ID {fav.id}")
                print(f"  - asset_id: {fav.asset_id}")
                print(f"  - asset_type in DB: '{fav.asset_type}'")
                print(f"  - asset_source: '{fav.asset_source}'")
                
                # Get asset data based on source
                asset_data = None
                
                try:
                    if fav.asset_source == 'prediksi_tanah':
                        query = text("""
                            SELECT id, kecamatan, kelurahan, luas_tanah, 
                                   harga_prediksi_tanah as harga_sewa, 'SHM' as jenis_sertifikat,
                                   'tanah' as jenis, created_at, created_at as updated_at
                            FROM prediksi_properti_tanah WHERE id = :asset_id
                        """)
                        asset_result = db.session.execute(query, {'asset_id': fav.asset_id}).fetchone()
                        
                    elif fav.asset_source == 'prediksi_bangunan':
                        query = text("""
                            SELECT id, kecamatan, kelurahan, luas_tanah, luas_bangunan,
                                   harga_prediksi_bangunan_tanah as harga_sewa, 'SHM' as jenis_sertifikat,
                                   'bangunan' as jenis, created_at, created_at as updated_at
                            FROM prediksi_properti_bangunan_tanah WHERE id = :asset_id
                        """)
                        asset_result = db.session.execute(query, {'asset_id': fav.asset_id}).fetchone()
                        
                    elif fav.asset_source == 'rental_assets':
                        query = text("""
                            SELECT id, kecamatan, alamat as kelurahan, luas_tanah, luas_bangunan,
                                   harga_sewa, sertifikat as jenis_sertifikat,
                                   asset_type as jenis, created_at, updated_at
                            FROM rental_assets WHERE id = :asset_id AND status = 'available'
                        """)
                        asset_result = db.session.execute(query, {'asset_id': fav.asset_id}).fetchone()
                    else:
                        print(f"DEBUG: Unknown asset_source: {fav.asset_source}")
                        continue
                    
                    if not asset_result:
                        print(f"DEBUG: No asset data found for asset_id {fav.asset_id}")
                        continue
                    
                    print(f"DEBUG: Asset data found - jenis: '{asset_result.jenis}', kecamatan: '{asset_result.kecamatan}'")
                    
                    # Apply asset_type filter - ROBUST: Use both favorites.asset_type and actual asset jenis
                    if asset_type and asset_type.strip():
                        print(f"DEBUG: Applying asset_type filter: '{asset_type}'")
                        print(f"  - favorites.asset_type: '{fav.asset_type}'")
                        print(f"  - actual asset.jenis: '{asset_result.jenis}'")
                        
                        # Check both favorites.asset_type and actual asset jenis for flexibility
                        type_match = (fav.asset_type == asset_type) or (asset_result.jenis == asset_type)
                        
                        if not type_match:
                            print(f"DEBUG: FILTERED OUT - no type match ('{fav.asset_type}' != '{asset_type}' and '{asset_result.jenis}' != '{asset_type}')")
                            continue
                        else:
                            print(f"DEBUG: TYPE MATCH - keeping this favorite")
                    
                    # Apply kecamatan filter
                    if kecamatan and kecamatan.strip():
                        print(f"DEBUG: Applying kecamatan filter: '{kecamatan}' vs asset.kecamatan: '{asset_result.kecamatan}'")
                        if asset_result.kecamatan != kecamatan:
                            print(f"DEBUG: FILTERED OUT - kecamatan mismatch")
                            continue
                    
                    # Build result
                    asset_data = {
                        'id': fav.id,
                        'aset_id': asset_result.id,
                        'jenis': asset_result.jenis,
                        'kecamatan': asset_result.kecamatan,
                        'kelurahan': asset_result.kelurahan or '',
                        'luas_tanah': asset_result.luas_tanah or 0,
                        'luas_bangunan': getattr(asset_result, 'luas_bangunan', 0) or 0,
                        'harga_sewa': asset_result.harga_sewa or 0,
                        'status': 'Tersedia',
                        'catatan': fav.notes or '',
                        'created_at': fav.created_at.isoformat() if fav.created_at else None,
                        'asset_source': fav.asset_source
                    }
                    
                    result_data.append(asset_data)
                    print(f"DEBUG: ADDED to results - Total so far: {len(result_data)}")
                    
                except Exception as e:
                    print(f"DEBUG: Error processing favorite {fav.id}: {e}")
                    continue
            
            # Apply limit and offset after filtering
            if offset:
                result_data = result_data[offset:]
            if limit:
                result_data = result_data[:limit]
            
            print(f"DEBUG: Final result count after limit/offset: {len(result_data)}")
            return result_data
            
        except Exception as e:
            print(f"ERROR in get_favorites_with_asset_data: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def update_notes(self, notes):
        """Update notes for this favorite"""
        try:
            self.notes = notes
            self.updated_at = datetime.utcnow()
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
    
    @classmethod
    def remove_asset_from_all_favorites(cls, asset_id, asset_source='rental_assets'):
        """Remove an asset from all users' favorites when it gets rented"""
        try:
            # Log for debugging
            print(f"Removing asset {asset_id} from all favorites (source: {asset_source})...")
            
            # Find all favorites for this asset (only filter by asset_id since asset_source field doesn't exist)
            favorites = cls.query.filter_by(
                asset_id=asset_id
            ).all()
            
            # Get count of affected rows for reporting
            count = len(favorites)
            print(f"Found {count} favorites to remove")
            
            # Store user_ids for notification purposes
            affected_users = [fav.user_id for fav in favorites]
            
            # Delete all matching favorites
            if count > 0:
                cls.query.filter_by(
                    asset_id=asset_id
                ).delete()
                db.session.commit()
                print(f"Successfully removed {count} favorites")
            
            # Return both count and affected users
            return count, affected_users
            
        except Exception as e:
            print(f"Error removing favorites: {str(e)}")
            db.session.rollback()
            raise e