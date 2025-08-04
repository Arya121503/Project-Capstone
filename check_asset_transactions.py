#!/usr/bin/env python3
"""
Check transactions for asset 171 to understand the foreign key constraint issue
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models_rental_transaction import RentalTransaction
from app.models_sqlalchemy import RentalAsset

def check_asset_transactions():
    app = create_app()
    
    with app.app_context():
        asset_id = 171
        
        print(f"🔍 Checking transactions for Asset ID: {asset_id}")
        print("=" * 50)
        
        # Check if asset exists
        asset = RentalAsset.query.get(asset_id)
        if asset:
            print(f"📊 Asset Found: {asset.name} ({asset.status})")
        else:
            print(f"❌ Asset not found")
            return
        
        # Check transactions
        transactions = RentalTransaction.query.filter_by(asset_id=asset_id).all()
        
        print(f"\n💼 Found {len(transactions)} transactions for this asset:")
        
        for transaction in transactions:
            print(f"   - Transaction ID: {transaction.id}")
            print(f"     Status: {transaction.status}")
            print(f"     Payment Status: {transaction.payment_status}")
            print(f"     Start Date: {transaction.start_date}")
            print(f"     End Date: {transaction.end_date}")
            print(f"     Created: {transaction.created_at}")
            print(f"     User ID: {transaction.user_id}")
            print()
        
        # Check active transactions
        active_transactions = RentalTransaction.query.filter_by(
            asset_id=asset_id, 
            status='active'
        ).all()
        
        print(f"🔴 Active transactions: {len(active_transactions)}")
        
        if len(active_transactions) > 0:
            print("⚠️  Cannot delete asset - has active transactions")
            print("💡 Recommendation: End the active transactions first")
        elif len(transactions) > 0:
            print("⚠️  Asset has historical transactions")
            print("💡 Options:")
            print("   1. Keep asset and mark as archived")
            print("   2. Handle cascade deletion properly")
            print("   3. Allow NULL asset_id in transactions table")
        else:
            print("✅ Safe to delete - no transactions found")

if __name__ == "__main__":
    check_asset_transactions()
