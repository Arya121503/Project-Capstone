from flask import session
from werkzeug.security import generate_password_hash, check_password_hash
from app import mysql

class User:
    """Simple User class to handle user operations"""
    
    def __init__(self, id=None, name=None, email=None, password=None, role='pengguna', 
                 phone=None, address=None, join_date=None):
        self.id = id
        self.name = name
        self.email = email
        self.password = password
        self.role = role
        self.phone = phone
        self.address = address
        self.join_date = join_date
    
    @staticmethod
    def get_by_id(user_id):
        """Get user by ID"""
        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT id, name, email, role, phone, address, updated_at FROM users WHERE id = %s", 
            (user_id,)
        )
        user_data = cursor.fetchone()
        cursor.close()
        
        if not user_data:
            return None
            
        return User(
            id=user_data[0],
            name=user_data[1],
            email=user_data[2],
            role=user_data[3],
            phone=user_data[4],
            address=user_data[5],
            join_date=user_data[6]
        )
    
    @staticmethod
    def get_by_email(email):
        """Get user by email"""
        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT id, name, password, role, email, phone, address, updated_at FROM users WHERE email = %s", 
            (email,)
        )
        user_data = cursor.fetchone()
        cursor.close()
        
        if not user_data:
            return None
            
        return User(
            id=user_data[0],
            name=user_data[1],
            password=user_data[2],  # Hashed password
            role=user_data[3],
            email=user_data[4],
            phone=user_data[5],
            address=user_data[6],
            join_date=user_data[7]
        )
    
    @staticmethod
    def create(name, email, password, role='pengguna', phone=None, address=None):
        """Create a new user"""
        hashed_password = generate_password_hash(password)
        
        cursor = mysql.connection.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (name, email, password, role, phone, address) VALUES (%s, %s, %s, %s, %s, %s)",
                (name, email, hashed_password, role, phone, address)
            )
            mysql.connection.commit()
            user_id = cursor.lastrowid
            cursor.close()
            return user_id
        except Exception as e:
            mysql.connection.rollback()
            cursor.close()
            raise e
    
    @staticmethod
    def authenticate(email, password):
        """Authenticate a user"""
        user = User.get_by_email(email)
        
        if user and check_password_hash(user.password, password):
            return user
        return None
    
    def update_profile(self, name=None, email=None, phone=None, address=None):
        """Update user profile"""
        if name:
            self.name = name
        if email:
            self.email = email
        if phone:
            self.phone = phone
        if address:
            self.address = address
            
        cursor = mysql.connection.cursor()
        try:
            cursor.execute(
                "UPDATE users SET name = %s, email = %s, phone = %s, address = %s WHERE id = %s",
                (self.name, self.email, self.phone, self.address, self.id)
            )
            mysql.connection.commit()
            cursor.close()
            return True
        except Exception as e:
            mysql.connection.rollback()
            cursor.close()
            raise e
    
    def change_password(self, new_password):
        """Change user password"""
        hashed_password = generate_password_hash(new_password)
        
        cursor = mysql.connection.cursor()
        try:
            cursor.execute(
                "UPDATE users SET password = %s WHERE id = %s",
                (hashed_password, self.id)
            )
            mysql.connection.commit()
            cursor.close()
            return True
        except Exception as e:
            mysql.connection.rollback()
            cursor.close()
            raise e
