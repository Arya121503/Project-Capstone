import os
import sys
sys.path.append('c:/Users/bobok/project_KP')

from app import create_app, mysql

app = create_app()

with app.app_context():
    try:
        cur = mysql.connection.cursor()
        
        # Check available asset price
        cur.execute("SELECT id, name, harga_sewa FROM rental_assets WHERE status = 'available' LIMIT 1")
        asset = cur.fetchone()
        
        print(f"Asset: {asset}")
        print(f"Type of harga_sewa: {type(asset[2])}")
        print(f"Value of harga_sewa: {repr(asset[2])}")
        
        # Try to extract numeric value
        harga_str = str(asset[2])
        print(f"Harga as string: {harga_str}")
        
        # Extract numeric part
        import re
        numeric_match = re.search(r'[\d,\.]+', harga_str)
        if numeric_match:
            numeric_value = numeric_match.group().replace(',', '')
            print(f"Extracted numeric: {numeric_value}")
            try:
                float_value = float(numeric_value)
                print(f"As float: {float_value}")
            except ValueError as e:
                print(f"Cannot convert to float: {e}")
        
        cur.close()
        
    except Exception as e:
        print(f"Database error: {e}")
