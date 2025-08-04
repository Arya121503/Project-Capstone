#!/usr/bin/env python3
"""
Simple script to approve request #47
"""

import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def update_request_47():
    """Update request #47 to approved status"""
    try:
        # Database connection
        connection = pymysql.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            port=int(os.environ.get('MYSQL_PORT', 3306)),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            database=os.environ.get('MYSQL_DB', 'db_kp'),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection:
            with connection.cursor() as cursor:
                # Check current status
                cursor.execute("SELECT id, nama_penyewa, status, admin_notes FROM rental_requests WHERE id = %s", (47,))
                result = cursor.fetchone()
                
                if result:
                    print(f"📋 Request #47 saat ini:")
                    print(f"   Nama Penyewa: {result['nama_penyewa']}")
                    print(f"   Status: {result['status']}")
                    print(f"   Admin Notes: {result.get('admin_notes', 'None')}")
                    
                    # Update to approved
                    cursor.execute(
                        "UPDATE rental_requests SET status = %s WHERE id = %s", 
                        ('approved', 47)
                    )
                    connection.commit()
                    
                    print(f"✅ Request #47 berhasil diupdate ke status 'approved'")
                else:
                    print("❌ Request #47 tidak ditemukan")
                    
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    update_request_47()
