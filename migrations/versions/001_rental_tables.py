"""Create rental assets and rental requests tables

Revision ID: 001_rental_tables
Revises: 
Create Date: 2025-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_rental_tables'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create rental_assets table
    op.create_table('rental_assets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('asset_type', sa.Enum('tanah', 'bangunan'), nullable=False),
        sa.Column('kecamatan', sa.String(length=100), nullable=False),
        sa.Column('alamat', sa.Text(), nullable=False),
        sa.Column('luas_tanah', sa.Float(), nullable=False),
        sa.Column('luas_bangunan', sa.Float(), nullable=True),
        sa.Column('kamar_tidur', sa.Integer(), nullable=True),
        sa.Column('kamar_mandi', sa.Integer(), nullable=True),
        sa.Column('jumlah_lantai', sa.Integer(), nullable=True),
        sa.Column('njop_per_m2', sa.Float(), nullable=False),
        sa.Column('harga_sewa', sa.Float(), nullable=False),
        sa.Column('sertifikat', sa.Enum('SHM', 'HGB', 'Lainnya'), nullable=False),
        sa.Column('jenis_zona', sa.Enum('Perumahan', 'Komersial', 'Industri'), nullable=False),
        sa.Column('aksesibilitas', sa.String(length=100), nullable=True),
        sa.Column('tingkat_keamanan', sa.String(length=100), nullable=True),
        sa.Column('daya_listrik', sa.String(length=50), nullable=True),
        sa.Column('kondisi_properti', sa.String(length=50), nullable=True),
        sa.Column('deskripsi', sa.Text(), nullable=True),
        sa.Column('photos', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('available', 'rented', 'maintenance', 'reserved'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('idx_status_kecamatan', 'rental_assets', ['status', 'kecamatan'], unique=False)
    op.create_index('idx_asset_type_status', 'rental_assets', ['asset_type', 'status'], unique=False)
    op.create_index('idx_harga_sewa', 'rental_assets', ['harga_sewa'], unique=False)
    
    # Create rental_requests table
    op.create_table('rental_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('asset_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('user_name', sa.String(length=255), nullable=False),
        sa.Column('user_email', sa.String(length=255), nullable=False),
        sa.Column('user_phone', sa.String(length=20), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('total_months', sa.Integer(), nullable=False),
        sa.Column('monthly_price', sa.Float(), nullable=False),
        sa.Column('total_price', sa.Float(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'approved', 'rejected', 'active', 'completed'), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['asset_id'], ['rental_assets.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('rental_requests')
    op.drop_index('idx_harga_sewa', table_name='rental_assets')
    op.drop_index('idx_asset_type_status', table_name='rental_assets')
    op.drop_index('idx_status_kecamatan', table_name='rental_assets')
    op.drop_table('rental_assets')
