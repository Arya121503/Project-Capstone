#!/usr/bin/env python3
"""
Check rented assets status
This script checks which assets have rental transactions but still show as 'available'
"""

import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app import create_app
from app.models_sqlalchemy import RentalAsset
from app.models_rental_transaction import RentalTransaction

def check_rented_assets_status():
    app = create_app()
    
    with app.app_context():
        print("🔍 Checking Rented Assets Status")
        print("=" * 60)
        
        # Get all assets with their status
        all_assets = RentalAsset.query.all()
        print(f"📊 Total assets in database: {len(all_assets)}")
        
        # Count by status
        status_counts = {}
        for asset in all_assets:
            status = asset.status or 'unknown'
            status_counts[status] = status_counts.get(status, 0) + 1
        
        print("\n📈 Assets by status:")
        for status, count in status_counts.items():
            print(f"   {status}: {count}")
        
        # Check for assets that have active transactions but wrong status
        print("\n🔍 Checking for status inconsistencies...")
        
        # Get all active rental transactions
        active_transactions = RentalTransaction.query.filter_by(
            status='active', 
            payment_status='paid'
        ).all()
        
        print(f"\n💼 Found {len(active_transactions)} active paid transactions")
        
        inconsistent_assets = []
        
        for transaction in active_transactions:
            asset = RentalAsset.query.get(transaction.asset_id)
            if asset:
                if asset.status != 'rented':
                    inconsistent_assets.append({
                        'asset_id': asset.id,
                        'asset_name': asset.name,
                        'current_status': asset.status,
                        'should_be': 'rented',
                        'transaction_id': transaction.id,
                        'transaction_status': transaction.status,
                        'payment_status': transaction.payment_status
                    })
                    
                print(f"   Asset ID {asset.id}: {asset.name}")
                print(f"      Current Status: {asset.status}")
                print(f"      Transaction ID: {transaction.id}")
                print(f"      Transaction Status: {transaction.status}")
                print(f"      Payment Status: {transaction.payment_status}")
                print()
        
        if inconsistent_assets:
            print(f"❌ Found {len(inconsistent_assets)} assets with status inconsistencies:")
            for asset in inconsistent_assets:
                print(f"   - {asset['asset_name']} (ID: {asset['asset_id']})")
                print(f"     Current: {asset['current_status']} → Should be: {asset['should_be']}")
            
            print("\n🔧 Do you want to fix these inconsistencies? (y/n):", end=" ")
            response = input().strip().lower()
            
            if response == 'y':
                print("\n🔧 Fixing status inconsistencies...")
                from app import db
                
                for asset_info in inconsistent_assets:
                    asset = RentalAsset.query.get(asset_info['asset_id'])
                    if asset:
                        old_status = asset.status
                        asset.status = 'rented'
                        print(f"   ✅ Updated {asset.name}: {old_status} → rented")
                
                db.session.commit()
                print("\n✅ All inconsistencies fixed!")
            else:
                print("\n⏭️  Skipping fixes.")
        else:
            print("✅ No status inconsistencies found!")
        
        # Check specific asset mentioned by user
        print("\n🔍 Checking for 'kantor cabang genteng' specifically...")
        genteng_assets = RentalAsset.query.filter(
            RentalAsset.name.like('%genteng%')
        ).all()
        
        if genteng_assets:
            print(f"Found {len(genteng_assets)} assets with 'genteng' in name:")
            for asset in genteng_assets:
                transactions = RentalTransaction.query.filter_by(
                    asset_id=asset.id,
                    status='active',
                    payment_status='paid'
                ).all()
                
                print(f"   - {asset.name} (ID: {asset.id})")
                print(f"     Status: {asset.status}")
                print(f"     Active transactions: {len(transactions)}")
                
                if transactions and asset.status != 'rented':
                    print(f"     ⚠️  Should be 'rented' but is '{asset.status}'")
        else:
            print("   No assets found with 'genteng' in name")

if __name__ == "__main__":
    check_rented_assets_status()
