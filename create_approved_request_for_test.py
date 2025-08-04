import os
import sys
sys.path.append('c:/Users/bobok/project_KP')

from app import create_app, mysql
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    try:
        cur = mysql.connection.cursor()
        
        # Cari user yang akan digunakan untuk test (user ID 1)
        cur.execute("SELECT * FROM users WHERE id = 1")
        user = cur.fetchone()
        if not user:
            print("User with ID 1 not found!")
            cur.close()
            exit()
        
        # Cari asset yang tersedia untuk disewa
        cur.execute("SELECT * FROM rental_assets WHERE status = 'available' LIMIT 1")
        available_asset = cur.fetchone()
        if not available_asset:
            print("No available assets found!")
            cur.close()
            exit()
        
        # Hitung tanggal dan total harga
        start_date = datetime.now() + timedelta(days=1)
        end_date = datetime.now() + timedelta(days=3)
        
        # Pastikan harga_sewa adalah Decimal atau float yang valid
        harga_sewa = available_asset[16]  # harga_sewa column
        if isinstance(harga_sewa, str):
            import re
            numeric_match = re.search(r'[\d,\.]+', harga_sewa)
            if numeric_match:
                harga_sewa = float(numeric_match.group().replace(',', ''))
            else:
                harga_sewa = 100000  # default price
        
        total_harga = float(harga_sewa) * 2  # 2 days rental
        
        print(f"Debug: harga_sewa = {harga_sewa}, total_harga = {total_harga}")
        
        # Buat rental request yang sudah approved
        insert_query = """
        INSERT INTO rental_requests 
        (user_id, asset_id, nama_penyewa, email, telepon, durasi_sewa, tanggal_mulai, tanggal_selesai, total_harga, status, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cur.execute(insert_query, (
            user[0],  # user id
            available_asset[0],  # asset id
            user[1],  # nama_penyewa
            user[2],  # email
            user[5] or '08123456789',  # phone (use default if null)
            2,  # durasi sewa
            start_date.date(),
            end_date.date(),
            total_harga,
            'approved',  # status sudah approved
            datetime.now()
        ))
        
        mysql.connection.commit()
        
        # Get the inserted ID
        request_id = cur.lastrowid
        
        print(f"Created approved rental request:")
        print(f"- Request ID: {request_id}")
        print(f"- User: {user[1]}")  # name
        print(f"- Asset: {available_asset[1]}")  # name
        print(f"- Total Price: Rp {total_harga:,.0f}")
        print(f"- Status: approved")
        print(f"- Start Date: {start_date}")
        print(f"- End Date: {end_date}")
        
        cur.close()
        
    except Exception as e:
        print(f"Database error: {e}")
