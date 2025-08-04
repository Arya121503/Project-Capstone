import sys
sys.path.append('.')
from app.models_sqlalchemy import db
from app import create_app
from sqlalchemy import text

app = create_app()
with app.app_context():
    # Check users in database
    try:
        result = db.session.execute(text("SELECT id, name, email FROM users"))
        users = result.fetchall()
        
        print("👥 Users in database:")
        for user in users:
            print(f"   ID: {user[0]}, Name: {user[1]}, Email: {user[2]}")
            
    except Exception as e:
        print(f"❌ Error checking users: {e}")
        
    # Also check rental requests for user context
    try:
        result = db.session.execute(text("SELECT id, user_id, user_email, status FROM pengajuan_sewa LIMIT 5"))
        requests = result.fetchall()
        
        print("\n📋 Recent rental requests:")
        for req in requests:
            print(f"   Request #{req[0]}: User ID {req[1]}, Email: {req[2]}, Status: {req[3]}")
            
    except Exception as e:
        print(f"❌ Error checking requests: {e}")
