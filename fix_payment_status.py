#!/usr/bin/env python3
"""
Fix payment status values in rental_transactions table
"""
from app import create_app, db

def fix_payment_status():
    app = create_app()
    with app.app_context():
        try:
            # Update empty strings to 'unpaid'
            result1 = db.session.execute(db.text("UPDATE rental_transactions SET payment_status = 'unpaid' WHERE payment_status = '' OR payment_status IS NULL"))
            print(f"Updated empty/null records to 'unpaid'")
            
            db.session.commit()
            print('Database update committed successfully')
            
            # Check the results
            all_statuses = db.session.execute(db.text('SELECT DISTINCT payment_status FROM rental_transactions')).fetchall()
            print('Payment statuses after update:', [row[0] for row in all_statuses])
            
        except Exception as e:
            print(f"Error: {e}")
            db.session.rollback()

if __name__ == "__main__":
    fix_payment_status()
