"""
Database initialization script for Railway deployment
"""
from app import create_app, db
from app.models_sqlalchemy import RentalAsset, RentalRequest
from app.models_rental_transaction import RentalTransaction
from app.models_user_notification import UserNotification
import sys

def init_database():
    """Initialize database tables"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🔄 Creating database tables...")
            db.create_all()
            print("✅ Database tables created successfully!")
            
            # Test connection
            print("\n🔍 Testing database connection...")
            from sqlalchemy import text
            result = db.session.execute(text("SELECT 1"))
            print("✅ Database connection test passed!")
            
            return True
            
        except Exception as e:
            print(f"❌ Error creating database tables: {e}")
            return False

if __name__ == '__main__':
    success = init_database()
    sys.exit(0 if success else 1)
