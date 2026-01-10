"""
Script untuk inisialisasi database Railway - Simplified Version
Untuk dijalankan HANYA di Railway environment
"""

def init_db_simple():
    """Simple database initialization for Railway"""
    import os
    import sys
    
    # Check if running in Railway
    if not os.environ.get('RAILWAY_ENVIRONMENT'):
        print("⚠️  This script should only be run in Railway environment!")
        print("   For local development, use the regular init_db.py")
        return
    
    print("🚀 Railway Database Initialization")
    print("=" * 60)
    
    try:
        from app import create_app, db
        from app.models_sqlalchemy import RentalAsset, RentalRequest, AdminNotification
        from app.models_user_notification import UserNotification
        from app.models_user_favorites import UserFavorite
        from app.models_rental_transaction import RentalTransaction
        
        app = create_app()
        
        with app.app_context():
            database_url = os.environ.get('DATABASE_URL')
            if not database_url:
                print("❌ DATABASE_URL not found!")
                print("   Add PostgreSQL database in Railway Dashboard")
                return False
            
            print(f"✅ Connected to PostgreSQL")
            
            # Create all tables
            print("\n🏗️  Creating database tables...")
            db.create_all()
            
            # Verify
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            
            print("\n📋 Created tables:")
            for table in sorted(tables):
                print(f"   ✓ {table}")
            
            print(f"\n✅ Success! Created {len(tables)} tables")
            return True
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = init_db_simple()
    sys.exit(0 if success else 1)
