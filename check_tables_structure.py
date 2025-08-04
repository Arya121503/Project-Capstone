import os
import sys
sys.path.append('c:/Users/bobok/project_KP')

from app import create_app, mysql
import MySQLdb

app = create_app()

with app.app_context():
    try:
        cur = mysql.connection.cursor()
        
        # Show all tables
        cur.execute("SHOW TABLES")
        tables = cur.fetchall()
        
        print("Available tables:")
        for table in tables:
            print(f"- {table[0]}")
        
        # Check users table structure
        if any('users' in str(table[0]).lower() for table in tables):
            cur.execute("DESCRIBE users")
            user_columns = cur.fetchall()
            print("\nUsers table structure:")
            for col in user_columns:
                print(f"- {col[0]} ({col[1]})")
        
        # Check assets table structure  
        for table in tables:
            table_name = table[0]
            if 'aset' in table_name.lower() or 'asset' in table_name.lower():
                cur.execute(f"DESCRIBE {table_name}")
                asset_columns = cur.fetchall()
                print(f"\n{table_name} table structure:")
                for col in asset_columns:
                    print(f"- {col[0]} ({col[1]})")
        
        cur.close()
        
    except Exception as e:
        print(f"Database error: {e}")
