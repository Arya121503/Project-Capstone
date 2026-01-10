from app import db
from datetime import datetime, timedelta
import json

class RentalTransaction(db.Model):
    __tablename__ = 'rental_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    rental_request_id = db.Column(db.Integer, db.ForeignKey('rental_requests.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    asset_id = db.Column(db.Integer, db.ForeignKey('rental_assets.id'), nullable=False)
    
    # Contract details
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    current_end_date = db.Column(db.Date, nullable=False)  # For extensions
    
    # Financial details
    monthly_price = db.Column(db.Float, nullable=False)
    total_months = db.Column(db.Integer, nullable=False)
    paid_amount = db.Column(db.Float, default=0.0)
    remaining_amount = db.Column(db.Float, nullable=False)
    
    # Status tracking
    status = db.Column(db.Enum('active', 'extended', 'completed', 'terminated', name='rental_transaction_status_enum'), default='active')
    payment_status = db.Column(db.Enum('unpaid', 'partial', 'paid', 'failed', name='payment_status_enum'), default='unpaid')
    
    # Extension tracking
    extension_count = db.Column(db.Integer, default=0)
    extension_history = db.Column(db.Text, nullable=True)  # JSON string
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rental_request = db.relationship('RentalRequest', backref='transaction')
    asset = db.relationship('RentalAsset', backref='transactions')
    
    def __repr__(self):
        return f'<RentalTransaction {self.id} - User {self.user_id}>'
    
    def to_dict(self):
        extension_history_data = []
        if self.extension_history:
            try:
                extension_history_data = json.loads(self.extension_history)
            except:
                extension_history_data = []
        
        return {
            'id': self.id,
            'rental_request_id': self.rental_request_id,
            'user_id': self.user_id,
            'asset_id': self.asset_id,
            'asset_name': self.asset.name if self.asset else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'current_end_date': self.current_end_date.isoformat() if self.current_end_date else None,
            'monthly_price': self.monthly_price,
            'total_months': self.total_months,
            'paid_amount': self.paid_amount,
            'remaining_amount': self.remaining_amount,
            'status': self.status,
            'payment_status': self.payment_status,
            'extension_count': self.extension_count,
            'extension_history': extension_history_data,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'days_remaining': self.get_days_remaining(),
            'is_active': self.is_active(),
            'can_extend': self.can_extend()
        }
    
    def get_days_remaining(self):
        """Calculate days remaining in rental period"""
        if not self.current_end_date:
            return 0
        
        today = datetime.utcnow().date()
        if self.current_end_date > today:
            return (self.current_end_date - today).days
        return 0
    
    def is_active(self):
        """Check if rental is currently active"""
        return self.status == 'active' and self.get_days_remaining() > 0
    
    def can_extend(self):
        """Check if rental can be extended"""
        return (self.status in ['active', 'extended'] and 
                self.payment_status in ['paid', 'partial'] and
                self.get_days_remaining() <= 30)  # Allow extension 30 days before expiry
    
    def add_extension(self, additional_months, admin_notes=None):
        """Add extension to the rental"""
        if not self.can_extend():
            return False, "Rental cannot be extended"
        
        # Calculate new end date
        new_end_date = self.current_end_date + timedelta(days=additional_months * 30)
        
        # Create extension record
        extension_record = {
            'date': datetime.utcnow().isoformat(),
            'additional_months': additional_months,
            'previous_end_date': self.current_end_date.isoformat(),
            'new_end_date': new_end_date.isoformat(),
            'admin_notes': admin_notes
        }
        
        # Update extension history
        history = []
        if self.extension_history:
            try:
                history = json.loads(self.extension_history)
            except:
                history = []
        
        history.append(extension_record)
        
        # Update transaction
        self.current_end_date = new_end_date
        self.total_months += additional_months
        self.remaining_amount += (additional_months * self.monthly_price)
        self.extension_count += 1
        self.extension_history = json.dumps(history)
        self.status = 'extended'
        self.updated_at = datetime.utcnow()
        
        return True, "Extension added successfully"
    
    @classmethod
    def create_from_approved_request(cls, rental_request):
        """Create transaction from approved rental request"""
        transaction = cls(
            rental_request_id=rental_request.id,
            user_id=rental_request.user_id,
            asset_id=rental_request.asset_id,
            start_date=rental_request.start_date,
            end_date=rental_request.end_date,
            current_end_date=rental_request.end_date,
            monthly_price=rental_request.monthly_price,
            total_months=rental_request.total_months,
            remaining_amount=rental_request.total_price,
            status='active',
            payment_status='unpaid'
        )
        return transaction
