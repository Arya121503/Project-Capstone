import os
import sys
import json
from datetime import datetime
from flask import Flask
import mysql.connector

# Get the parent directory
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

def test_rental_tables():
    """Test the rental assets implementation"""
    from app import create_app
    app = create_app()
    
    with app.app_context():
        try:
            # Connect to the database
            conn = mysql.connector.connect(
                host=app.config['MYSQL_HOST'],
                user=app.config['MYSQL_USER'],
                password=app.config['MYSQL_PASSWORD'],
                database=app.config['MYSQL_DB']
            )
            cursor = conn.cursor(dictionary=True)
            
            print("Testing rental assets functionality...")
            
            # Check if the table exists and has data
            cursor.execute("SHOW TABLES LIKE 'rental_assets'")
            table_exists = cursor.fetchone() is not None
            
            if not table_exists:
                print("Creating rental_assets table...")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS rental_assets (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        asset_type VARCHAR(50) NOT NULL,
                        location VARCHAR(255) NOT NULL,
                        address TEXT NOT NULL,
                        land_size FLOAT NOT NULL,
                        building_size FLOAT NULL,
                        njop_per_m2 FLOAT NOT NULL,
                        rental_price FLOAT NOT NULL,
                        certificate VARCHAR(100) NOT NULL,
                        zone_type VARCHAR(100) NOT NULL,
                        description TEXT NULL,
                        status VARCHAR(50) NOT NULL DEFAULT 'available',
                        bedrooms INT NULL,
                        bathrooms INT NULL,
                        floors INT NULL,
                        photos TEXT NULL,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
                print("Table created successfully!")
            
            # Check if there's any data
            cursor.execute("SELECT COUNT(*) as count FROM rental_assets")
            count = cursor.fetchone()['count']
            
            print(f"Found {count} rental assets in the database")
            
            if count == 0:
                # Insert sample data
                print("Adding sample data...")
                cursor.execute("""
                    INSERT INTO rental_assets (
                        name, asset_type, location, address, land_size, building_size,
                        njop_per_m2, rental_price, certificate, zone_type, description,
                        status, bedrooms, bathrooms, floors, photos, created_at, updated_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                    )
                """, (
                    'Tanah Komersial Rungkut',
                    'tanah',
                    'Rungkut',
                    'Jl. Raya Rungkut Madya No. 45, Rungkut, Surabaya',
                    500,
                    None,
                    5000000,
                    8500000,
                    'SHM',
                    'Komersial',
                    'Tanah komersial strategis di area berkembang Rungkut. Cocok untuk berbagai jenis usaha seperti ritel, kantor, atau F&B.',
                    'available',
                    None,
                    None,
                    None,
                    json.dumps(['tanah1.jpg', 'tanah2.jpg'])
                ))
                
                cursor.execute("""
                    INSERT INTO rental_assets (
                        name, asset_type, location, address, land_size, building_size,
                        njop_per_m2, rental_price, certificate, zone_type, description,
                        status, bedrooms, bathrooms, floors, photos, created_at, updated_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                    )
                """, (
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
                    'Ruko 2 lantai di lokasi premium Wonokromo. Cocok untuk berbagai usaha komersial dengan visibility tinggi.',
                    'available',
                    0,
                    2,
                    2,
                    json.dumps(['ruko1.jpg', 'ruko2.jpg', 'ruko3.jpg'])
                ))
                
                conn.commit()
                print("Sample data inserted successfully!")
                
                # Verify the data
                cursor.execute("SELECT COUNT(*) as count FROM rental_assets")
                count = cursor.fetchone()['count']
                print(f"Now there are {count} rental assets in the database")
            
            # Test retrieving a specific asset
            cursor.execute("SELECT * FROM rental_assets LIMIT 1")
            asset = cursor.fetchone()
            
            if asset:
                print("\nSample asset in database:")
                print(f"ID: {asset['id']}")
                print(f"Name: {asset['name']}")
                print(f"Type: {asset['asset_type']}")
                print(f"Location: {asset['location']}")
                print(f"Price: {asset['rental_price']}")
                print(f"Status: {asset['status']}")
            
            cursor.close()
            conn.close()
            print("\nTest completed successfully!")
            
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            if 'conn' in locals() and conn:
                conn.close()

if __name__ == "__main__":
    test_rental_tables()
