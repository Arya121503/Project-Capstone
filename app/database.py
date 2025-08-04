from app import db
from flask import current_app
from werkzeug.security import generate_password_hash
from sqlalchemy import text

def init_mysql_db():
    """Create users table & default admin"""
    try:
        # Use SQLAlchemy instead of Flask-MySQLdb
        # Handle potential tablespace issues
        try:
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'pengguna') NOT NULL DEFAULT 'pengguna',
                    phone VARCHAR(20),
                    address TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """))
        except Exception as table_error:
            # Handle tablespace issues
            if "Tablespace" in str(table_error):
                print(f"⚠️  Tablespace issue detected: {table_error}")
                print("🔧 Run 'python fix_database_tablespace.py' to fix this issue")
                return False
            else:
                raise table_error

        # Note: rental_assets and rental_requests tables are now managed by SQLAlchemy
        # They are created by models_sqlalchemy.py
        
        # Create pengajuan_sewa table for rental applications
        try:
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS pengajuan_sewa (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    aset_id INT NOT NULL,
                    jenis_aset ENUM('tanah', 'tanah_bangunan') NOT NULL,
                    nama_penyewa VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    telepon VARCHAR(20) NOT NULL,
                    durasi_sewa INT NOT NULL COMMENT 'dalam bulan',
                    tanggal_mulai DATE,
                    pesan TEXT,
                    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """))
        except Exception as table_error:
            # Handle tablespace issues
            if "Tablespace" in str(table_error):
                print(f"⚠️  Tablespace issue detected for pengajuan_sewa: {table_error}")
                print("🔧 Run 'python fix_database_tablespace.py' to fix this issue")
                return False
            else:
                raise table_error
        
        # Harga tanah real table removed - feature no longer used
        # cur.execute("""
        #     CREATE TABLE IF NOT EXISTS harga_tanah_real (
        #         id INT AUTO_INCREMENT PRIMARY KEY,
        #         prediksi_id INT NOT NULL,
        #         harga_real DECIMAL(20,2) NOT NULL,
        #         catatan TEXT,
        #         updated_by VARCHAR(100) NOT NULL,
        #         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        #         INDEX idx_prediksi_id (prediksi_id)
        #     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        # """)
        
        # Harga bangunan tanah real table removed - feature no longer used
        # cur.execute("""
        #     CREATE TABLE IF NOT EXISTS harga_bangunan_tanah_real (
        #         id INT AUTO_INCREMENT PRIMARY KEY,
        #         prediksi_id INT NOT NULL,
        #         harga_real DECIMAL(20,2) NOT NULL,
        #         catatan TEXT,
        #         updated_by VARCHAR(100) NOT NULL,
        #         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        #         INDEX idx_prediksi_id (prediksi_id)
        #     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        # """)

        # Create default admin if none exists
        result = db.session.execute(text('SELECT COUNT(*) FROM users WHERE role = "admin"')).fetchone()
        if result[0] == 0:
            hashed_pw = generate_password_hash('admin123')
            db.session.execute(text("""
                INSERT INTO users (name, email, password, role)
                VALUES (:name, :email, :password, :role)
            """), {'name': 'Administrator', 'email': 'admin@telkom.co.id', 'password': hashed_pw, 'role': 'admin'})

        db.session.commit()
        print("[OK] DB check done: users table ready, admin ensured, pengajuan_sewa table created.")
        return True
    except Exception as e:
        print(f"[ERROR] Error init DB: {e}")
        db.session.rollback()
        return False

class Database:
    """Database connection class for SQLite operations"""
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """Connect to SQLite database"""
        try:
            import sqlite3
            import os
            
            # Path ke database SQLite (untuk data aset)
            db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'db_KP.sql')
            if not os.path.exists(db_path):
                # Jika file tidak ada, gunakan path alternatif
                db_path = os.path.join(os.path.dirname(__file__), '..', 'instance', 'db_KP.sql')
            
            self.connection = sqlite3.connect(db_path)
            self.connection.row_factory = sqlite3.Row  # Enable column access by name
            
        except Exception as e:
            print(f"❌ Error connecting to SQLite: {e}")
            raise
    
    def execute_query(self, query, params=None):
        """Execute a query and return results"""
        try:
            if not self.connection:
                self.connect()
                
            cursor = self.connection.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                return cursor.fetchall()
            else:
                self.connection.commit()
                return cursor.rowcount
                
        except Exception as e:
            print(f"❌ Error executing query: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()