from app import db
from datetime import datetime
import json

# User notification model
class UserNotification(db.Model):
    __tablename__ = 'user_notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    related_type = db.Column(db.String(50))  # Type of related entity (rental_request, asset, etc.)
    related_id = db.Column(db.Integer)  # ID of related entity
    
    @classmethod
    def get_unread_count(cls, user_id):
        """Get count of unread notifications for a user"""
        try:
            return cls.query.filter_by(user_id=user_id, is_read=False).count()
        except Exception as e:
            print(f"Error getting unread count: {str(e)}")
            return 0
    
    def __repr__(self):
        return f'<UserNotification {self.id} - {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'related_type': self.related_type,
            'related_id': self.related_id
        }
