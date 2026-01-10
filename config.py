import os
from dotenv import load_dotenv
from db_config import get_database_config

# Load environment variables from .env file
load_dotenv()

# Get database configuration
db_config = get_database_config()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'telkom-dashboard-secret'
    
    # Database configuration - supports both MySQL and PostgreSQL
    MYSQL_HOST = db_config['host']
    MYSQL_PORT = db_config['port']
    MYSQL_USER = db_config['user']
    MYSQL_PASSWORD = db_config['password']
    MYSQL_DB = db_config['database']
    
    # SQLAlchemy URI
    SQLALCHEMY_DATABASE_URI = db_config['sqlalchemy_uri']
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Database type flag
    DB_TYPE = db_config['type']
