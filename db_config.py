"""
Database configuration utility
Supports both MySQL (local) and PostgreSQL (production)
"""
import os
from urllib.parse import urlparse

def get_database_config():
    """
    Get database configuration based on environment
    Returns dict with connection parameters
    """
    # Check if DATABASE_URL is set (PostgreSQL on Render/Heroku)
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # Parse PostgreSQL URL
        # Format: postgresql://user:password@host:port/database
        url = urlparse(database_url)
        
        return {
            'type': 'postgresql',
            'host': url.hostname,
            'port': url.port or 5432,
            'user': url.username,
            'password': url.password,
            'database': url.path[1:],  # Remove leading slash
            'sqlalchemy_uri': database_url.replace('postgres://', 'postgresql://')  # Fix scheme
        }
    else:
        # Use MySQL configuration (local development)
        return {
            'type': 'mysql',
            'host': os.environ.get('MYSQL_HOST', 'localhost'),
            'port': int(os.environ.get('MYSQL_PORT', 3306)),
            'user': os.environ.get('MYSQL_USER', 'root'),
            'password': os.environ.get('MYSQL_PASSWORD', ''),
            'database': os.environ.get('MYSQL_DB', 'db_kp'),
            'sqlalchemy_uri': f"mysql+pymysql://{os.environ.get('MYSQL_USER', 'root')}:{os.environ.get('MYSQL_PASSWORD', '')}@{os.environ.get('MYSQL_HOST', 'localhost')}:{os.environ.get('MYSQL_PORT', 3306)}/{os.environ.get('MYSQL_DB', 'db_kp')}"
        }

def is_production():
    """Check if running in production environment"""
    return os.environ.get('DATABASE_URL') is not None
