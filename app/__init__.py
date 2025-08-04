from flask import Flask
from flask_mysqldb import MySQL
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Buat objek MySQL sekali di level global
mysql = MySQL()
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Load configuration from environment variables
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'telkom-dashboard-secret'
    app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST') or 'localhost'
    app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER') or 'root'
    app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD') or ''
    app.config['MYSQL_PORT'] = int(os.environ.get('MYSQL_PORT') or 3306)
    app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB') or 'db_kp'
    
    # SQLAlchemy configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{app.config['MYSQL_USER']}:{app.config['MYSQL_PASSWORD']}@{app.config['MYSQL_HOST']}:{app.config['MYSQL_PORT']}/{app.config['MYSQL_DB']}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Init MySQL ke app
    mysql.init_app(app)
    
    # Init SQLAlchemy and Migrate
    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    from .routes import main
    from .routes_user_features import user_features
    from .routes_rental_assets_consolidated import rental_assets
    from .routes_simple_assets_api import assets_api
    from .routes_user_favorites import favorites_bp
    from .routes_user_history_api import user_history_api
    from .routes_user_dashboard_api import user_dashboard_api
    from .routes_admin import admin_routes
    from .routes_user_notifications_api import user_notifications_api
    from .routes_user_rental_management_api import user_rental_management_api
    from .routes_user_rental_transactions_api import user_rental_transactions_api
    from .routes_user_rental_pages import user_rental_pages
    from .routes_asset_status import assets_status_bp
    from .routes_visualization_dynamic import visualization_dynamic
    from .routes_admin_notifications_api import admin_notifications_api
    from .routes_midtrans import midtrans_bp
    from .routes_payment_test import payment_bp
    from .routes_rental_transaction import rental_transaction_bp
    from .routes_prediction import prediction_bp
    # ML routes imports removed - to be rebuilt from scratch
    
    app.register_blueprint(main)
    app.register_blueprint(user_features)
    app.register_blueprint(rental_assets)
    app.register_blueprint(assets_api)
    app.register_blueprint(favorites_bp)
    app.register_blueprint(user_history_api)
    app.register_blueprint(user_dashboard_api)
    app.register_blueprint(visualization_dynamic)
    app.register_blueprint(admin_routes)
    app.register_blueprint(admin_notifications_api)
    app.register_blueprint(user_notifications_api)
    app.register_blueprint(user_rental_management_api)
    app.register_blueprint(user_rental_transactions_api)
    app.register_blueprint(user_rental_pages)
    app.register_blueprint(assets_status_bp)
    app.register_blueprint(midtrans_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(rental_transaction_bp)
    app.register_blueprint(prediction_bp, url_prefix='/prediction')
    # ML blueprint registration removed - to be rebuilt from scratch

    # Initialize DB tables - with better error handling
    with app.app_context():
        try:
            from .database import init_mysql_db
            from .models_sqlalchemy import RentalAsset, RentalRequest
            from .models_rental_transaction import RentalTransaction
            from .models_user_notification import UserNotification
            
            # Try to initialize MySQL database
            success = init_mysql_db()
            if success:
                print("[OK] Database initialized successfully")
            else:
                print("[ERROR] Database initialization failed")
                print("[INFO] Run 'python fix_database_init.py' to fix database issues")
                # Don't return app here, let it continue to start
            
            # Try to create SQLAlchemy tables
            try:
                db.create_all()
                print("[OK] SQLAlchemy tables created successfully")
            except Exception as e:
                if "doesn't exist in engine" in str(e) or "Table" in str(e) and "doesn't exist" in str(e):
                    print(f"[WARNING] Database table check failed: {e}")
                    print("[INFO] Run 'python fix_database_init.py' to initialize tables")
                elif "Tablespace" in str(e):
                    print(f"[ERROR] Tablespace error: {e}")
                    print("[INFO] Run 'python fix_database_tablespace.py' to fix this issue")
                else:
                    print(f"[ERROR] Error creating tables: {e}")
                # Don't return here - let the app start anyway
                
        except Exception as e:
            print(f"[ERROR] Error during database setup: {e}")
            print("[INFO] Run 'python fix_database_init.py' to fix database issues")
            # Let the app continue to start

    return app
