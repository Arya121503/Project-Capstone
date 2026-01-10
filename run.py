from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Note: Database initialization is now handled separately
    # Run 'python fix_database_init.py' first if database tables don't exist
    
    # Check if running in production
    is_production = os.environ.get('DATABASE_URL') is not None
    
    if is_production:
        print("🚀 Starting Flask application in PRODUCTION mode...")
        # Production settings - Gunicorn will handle this
        port = int(os.environ.get('PORT', 10000))
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        print("🚀 Starting Flask application in DEVELOPMENT mode...")
        print("📝 If you encounter database errors, run: python fix_database_init.py")
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True
        )
