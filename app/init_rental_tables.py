import mysql.connector
import os
import sys
import datetime
import json
from flask import Flask, current_app

# Get the parent directory
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

def init_rental_tables():
    """Initialize the rental_assets tables in the database"""
    from app import create_app
    app = create_app()
    
    with app.app_context():
        conn = None
        try:
            # Connect to the database
            conn = mysql.connector.connect(
                host=current_app.config['MYSQL_HOST'],
                user=current_app.config['MYSQL_USER'],
                password=current_app.config['MYSQL_PASSWORD'],
                database=current_app.config['MYSQL_DB']
            )
            cursor = conn.cursor()
            
            # Create the rental_assets table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS rental_assets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    asset_type VARCHAR(50) NOT NULL COMMENT 'tanah or bangunan',
                    location VARCHAR(255) NOT NULL,
                    address TEXT NOT NULL,
                    land_size FLOAT NOT NULL,
                    building_size FLOAT NULL,
                    njop_per_m2 FLOAT NOT NULL,
                    rental_price FLOAT NOT NULL,
                    certificate VARCHAR(100) NOT NULL,
                    zone_type VARCHAR(100) NOT NULL,
                    description TEXT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'available' COMMENT 'available, maintenance, rented',
                    bedrooms INT NULL,
                    bathrooms INT NULL,
                    floors INT NULL,
                    photos TEXT NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            ''')
            
            # Check if we need to insert sample data
            cursor.execute("SELECT COUNT(*) FROM rental_assets")
            count = cursor.fetchone()[0]
            
            if count == 0:
                # Insert sample data
                cursor.execute('''
                    INSERT INTO rental_assets (
                        name, asset_type, location, address, land_size, building_size,
                        njop_per_m2, rental_price, certificate, zone_type, description,
                        status, bedrooms, bathrooms, floors, photos, created_at, updated_at
                    ) VALUES (
                        'Tanah Komersial Rungkut', 
                        'tanah', 
                        'Rungkut', 
                        'Jl. Raya Rungkut Madya No. 45, Rungkut, Surabaya', 
                        500, 
                        NULL, 
                        5000000, 
                        8500000, 
                        'SHM', 
                        'Komersial', 
                        'Tanah komersial strategis di area berkembang Rungkut. Cocok untuk berbagai jenis usaha seperti ritel, kantor, atau F&B. Akses jalan raya utama dengan visibilitas tinggi.', 
                        'available',
                        NULL,
                        NULL,
                        NULL,
                        '["tanah1.jpg", "tanah2.jpg"]',
                        NOW(),
                        NOW()
                    )
                ''')
                
                cursor.execute('''
                    INSERT INTO rental_assets (
                        name, asset_type, location, address, land_size, building_size,
                        njop_per_m2, rental_price, certificate, zone_type, description,
                        status, bedrooms, bathrooms, floors, photos, created_at, updated_at
                    ) VALUES (
                        'Ruko 2 Lantai Wonokromo', 
                        'bangunan', 
                        'Wonokromo', 
                        'Jl. Wonokromo Raya No. 78, Wonokromo, Surabaya', 
                        250, 
                        400, 
                        7500000, 
                        15000000, 
                        'HGB', 
                        'Komersial', 
                        'Ruko 2 lantai di lokasi premium Wonokromo. Cocok untuk berbagai usaha komersial dengan visibility tinggi. Bangunan dalam kondisi terawat dengan akses mudah dari jalan utama.', 
                        'available',
                        0,
                        2,
                        2,
                        '["ruko1.jpg", "ruko2.jpg", "ruko3.jpg"]',
                        NOW(),
                        NOW()
                    )
                ''')
            
            conn.commit()
            print("Rental tables initialized successfully!")
            
            # Check if sample data was inserted
            cursor.execute("SELECT COUNT(*) FROM rental_assets")
            count = cursor.fetchone()[0]
            print(f"Total rental assets in database: {count}")
            
            conn.close()
            
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            if conn:
                conn.close()

if __name__ == "__main__":
    init_rental_tables()
