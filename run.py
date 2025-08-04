from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Note: Database initialization is now handled separately
    # Run 'python fix_database_init.py' first if database tables don't exist
    
    print("🚀 Starting Flask application...")
    print("📝 If you encounter database errors, run: python fix_database_init.py")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
