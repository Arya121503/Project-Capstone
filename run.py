from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Note: Database initialization is now handled separately
    # Run 'python fix_database_init.py' first if database tables don't exist
    
    print("🚀 Starting Flask application...")
    print("📝 If you encounter database errors, run: python fix_database_init.py")
    
    # Get port from environment variable (Railway sets this)
    port = int(os.environ.get('PORT', 5000))
    # Set debug to False for production
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
