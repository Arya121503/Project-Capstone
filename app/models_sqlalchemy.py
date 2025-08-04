from app import db
from datetime import datetime
from sqlalchemy import Index

class RentalAsset(db.Model):
    __tablename__ = 'rental_assets'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    asset_type = db.Column(db.Enum('tanah', 'bangunan'), nullable=False)
    kecamatan = db.Column(db.String(100), nullable=False)
    alamat = db.Column(db.Text, nullable=False)
    luas_tanah = db.Column(db.Float, nullable=False)
    luas_bangunan = db.Column(db.Float, nullable=True)
    kamar_tidur = db.Column(db.Integer, nullable=True)
    kamar_mandi = db.Column(db.Integer, nullable=True)
    jumlah_lantai = db.Column(db.Integer, nullable=True)
    njop_per_m2 = db.Column(db.Float, nullable=False)
    harga_sewa = db.Column(db.Float, nullable=False)
    sertifikat = db.Column(db.Enum('SHM', 'HGB', 'Lainnya'), nullable=False)
    jenis_zona = db.Column(db.Enum('Perumahan', 'Komersial', 'Industri'), nullable=False)
    aksesibilitas = db.Column(db.String(100), default='Baik')
    tingkat_keamanan = db.Column(db.Enum('Tinggi', 'Sedang', 'Rendah'), default='Sedang')
    daya_listrik = db.Column(db.String(50), nullable=True)
    kondisi_properti = db.Column(db.String(50), default='Baik')
    deskripsi = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum('available', 'rented', 'maintenance', 'reserved'), default='available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Add indexes for better performance
    __table_args__ = (
        Index('idx_status_kecamatan', 'status', 'kecamatan'),
        Index('idx_asset_type_status', 'asset_type', 'status'),
        Index('idx_harga_sewa', 'harga_sewa'),
    )
    
    def __repr__(self):
        return f'<RentalAsset {self.name}>'
    
    def to_dict(self):
        # Convert enum values to user-friendly text
        asset_type_display = {
            'tanah': 'Tanah',
            'bangunan': 'Bangunan + Tanah'
        }.get(self.asset_type, self.asset_type)
        
        status_display = {
            'available': 'Tersedia',
            'rented': 'Disewa', 
            'maintenance': 'Maintenance',
            'reserved': 'Dipesan'
        }.get(self.status, self.status)
        
        return {
            'id': self.id,
            'name': self.name,
            'asset_type': self.asset_type,  # Keep original for logic
            'asset_type_display': asset_type_display,  # Display text
            'kecamatan': self.kecamatan,
            'alamat': self.alamat,
            'luas_tanah': self.luas_tanah,
            'luas_bangunan': self.luas_bangunan,
            'kamar_tidur': self.kamar_tidur,
            'kamar_mandi': self.kamar_mandi,
            'jumlah_lantai': self.jumlah_lantai,
            'njop_per_m2': self.njop_per_m2,
            'harga_sewa': self.harga_sewa,
            'sertifikat': self.sertifikat,
            'jenis_zona': self.jenis_zona,
            'aksesibilitas': self.aksesibilitas,
            'tingkat_keamanan': self.tingkat_keamanan,
            'daya_listrik': self.daya_listrik,
            'kondisi_properti': self.kondisi_properti,
            'deskripsi': self.deskripsi,
            'status': self.status,  # Keep original for logic
            'status_display': status_display,  # Display text
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def get_available_assets(cls):
        """Get all available rental assets"""
        return cls.query.filter_by(status='available').all()
    
    @classmethod
    def get_rented_assets(cls):
        """Get all rented assets"""
        return cls.query.filter_by(status='rented').all()
    
    @classmethod
    def search_assets(cls, search_term=None, asset_type=None, kecamatan=None, status=None):
        """Search assets with filters"""
        query = cls.query
        
        if search_term:
            query = query.filter(
                db.or_(
                    cls.name.contains(search_term),
                    cls.alamat.contains(search_term),
                    cls.deskripsi.contains(search_term)
                )
            )
        
        if asset_type:
            query = query.filter_by(asset_type=asset_type)
        
        if kecamatan:
            query = query.filter_by(kecamatan=kecamatan)
        
        if status:
            query = query.filter_by(status=status)
        
        return query.all()

class RentalRequest(db.Model):
    __tablename__ = 'rental_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('rental_assets.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=True)  # Reference to user table
    nama_penyewa = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    telepon = db.Column(db.String(20), nullable=False)
    durasi_sewa = db.Column(db.Integer, nullable=False)
    tanggal_mulai = db.Column(db.Date, nullable=False)
    tanggal_selesai = db.Column(db.Date, nullable=True)
    total_harga = db.Column(db.Numeric(15, 2), nullable=True)
    pesan = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'), default='pending')
    admin_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    asset = db.relationship('RentalAsset', backref='rental_requests')
    
    def __repr__(self):
        return f'<RentalRequest {self.nama_penyewa} - {self.asset.name if self.asset else self.asset_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'asset_id': self.asset_id,
            'asset_name': self.asset.name if self.asset else None,
            'asset_type': self.asset.asset_type if self.asset else None,
            'user_id': self.user_id,
            'user_name': self.nama_penyewa,
            'user_email': self.email,
            'user_phone': self.telepon,
            'total_months': self.durasi_sewa,
            'start_date': self.tanggal_mulai.isoformat() if self.tanggal_mulai else None,
            'end_date': self.tanggal_selesai.isoformat() if self.tanggal_selesai else None,
            'monthly_price': float(self.total_harga / self.durasi_sewa) if self.total_harga and self.durasi_sewa else 0,
            'total_price': float(self.total_harga) if self.total_harga else None,
            'pesan': self.pesan,
            'status': self.status,
            'admin_notes': self.admin_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # Backward compatibility fields
            'nama_penyewa': self.nama_penyewa,
            'email': self.email,
            'telepon': self.telepon,
            'durasi_sewa': self.durasi_sewa,
            'tanggal_mulai': self.tanggal_mulai.isoformat() if self.tanggal_mulai else None,
            'tanggal_selesai': self.tanggal_selesai.isoformat() if self.tanggal_selesai else None,
            'total_harga': float(self.total_harga) if self.total_harga else None
        }
    
    # Backward compatibility properties
    @property
    def user_name(self):
        return self.nama_penyewa
    
    @property
    def user_email(self):
        return self.email
    
    @property
    def user_phone(self):
        return self.telepon
    
    @property
    def total_months(self):
        return self.durasi_sewa
    
    @property
    def start_date(self):
        return self.tanggal_mulai
    
    @property
    def end_date(self):
        return self.tanggal_selesai
    
    @property
    def monthly_price(self):
        return float(self.total_harga / self.durasi_sewa) if self.total_harga and self.durasi_sewa else 0
    
    @property
    def total_price(self):
        return float(self.total_harga) if self.total_harga else None

class AdminNotification(db.Model):
    __tablename__ = 'admin_notifications'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    related_type = db.Column(db.String(50), nullable=False)  # 'rental_request', 'user_registration', etc.
    related_id = db.Column(db.Integer, nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<AdminNotification {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'related_type': self.related_type,
            'related_id': self.related_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
