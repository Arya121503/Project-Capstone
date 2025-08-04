#!/usr/bin/env python3
"""
Fix duplicate assets issue
This script identifies and handles duplicate asset entries
"""

import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app import create_app
from app.models_sqlalchemy import RentalAsset
from app.models_rental_transaction import RentalTransaction

def fix_duplicate_assets():
    app = create_app()
    
    with app.app_context():
        print("🔍 Finding Duplicate Assets")
        print("=" * 50)
        
        # Find assets with duplicate names
        from sqlalchemy import func
        from app import db
        
        duplicate_names = db.session.query(
            RentalAsset.name,
            func.count(RentalAsset.id).label('count')
        ).group_by(RentalAsset.name).having(func.count(RentalAsset.id) > 1).all()
        
        print(f"📊 Found {len(duplicate_names)} asset names with duplicates:")
        
        for name, count in duplicate_names:
            print(f"\n📝 '{name}' appears {count} times:")
            
            # Get all assets with this name
            assets = RentalAsset.query.filter_by(name=name).all()
            
            for asset in assets:
                # Check if this asset has active transactions
                active_transactions = RentalTransaction.query.filter_by(
                    asset_id=asset.id,
                    status='active',
                    payment_status='paid'
                ).count()
                
                print(f"   - ID {asset.id}: Status = {asset.status}, Active Transactions = {active_transactions}")
                print(f"     Created: {asset.created_at}")
                print(f"     Address: {asset.alamat}")
                print(f"     Type: {asset.asset_type}")
                
        print("\n" + "="*50)
        print("🛠️  RECOMMENDATION FOR DUPLICATES:")
        print("=" * 50)
        
        for name, count in duplicate_names:
            print(f"\n📝 Asset: '{name}'")
            assets = RentalAsset.query.filter_by(name=name).all()
            
            # Categorize assets
            rented_assets = []
            available_assets = []
            
            for asset in assets:
                active_transactions = RentalTransaction.query.filter_by(
                    asset_id=asset.id,
                    status='active',
                    payment_status='paid'
                ).count()
                
                if active_transactions > 0 or asset.status == 'rented':
                    rented_assets.append(asset)
                else:
                    available_assets.append(asset)
            
            print(f"   - Rented assets: {len(rented_assets)}")
            print(f"   - Available assets: {len(available_assets)}")
            
            if len(available_assets) > 1:
                print(f"   ⚠️  WARNING: Multiple available assets with same name!")
                print(f"   💡 SUGGESTION: Keep only 1 available asset, delete others")
                
                # Show details of available assets to help decide which to keep
                print(f"   📋 Available assets details:")
                for i, asset in enumerate(available_assets):
                    print(f"      {i+1}. ID {asset.id} - Created: {asset.created_at}")
                    print(f"         Address: {asset.alamat}")
                    print(f"         Price: Rp {asset.harga_sewa:,.0f}")
            
            if len(rented_assets) > 1:
                print(f"   ⚠️  WARNING: Multiple rented assets with same name!")
                print(f"   💡 This might be legitimate if same property has multiple transactions")
        
        # Offer to fix duplicates automatically
        print("\n" + "="*50)
        print("🔧 AUTOMATIC FIX OPTIONS")
        print("=" * 50)
        
        print("Do you want to automatically remove duplicate available assets?")
        print("This will keep only the newest available asset for each name.")
        print("(Rented assets will NOT be touched)")
        
        response = input("\nProceed with automatic cleanup? (y/n): ").strip().lower()
        
        if response == 'y':
            print("\n🔧 Performing automatic cleanup...")
            
            for name, count in duplicate_names:
                assets = RentalAsset.query.filter_by(name=name).all()
                
                # Get only available assets
                available_assets = []
                for asset in assets:
                    active_transactions = RentalTransaction.query.filter_by(
                        asset_id=asset.id,
                        status='active', 
                        payment_status='paid'
                    ).count()
                    
                    if active_transactions == 0 and asset.status != 'rented':
                        available_assets.append(asset)
                
                if len(available_assets) > 1:
                    # Sort by creation date (newest first)
                    available_assets.sort(key=lambda x: x.created_at, reverse=True)
                    
                    # Keep the newest, delete the rest
                    keep_asset = available_assets[0]
                    delete_assets = available_assets[1:]
                    
                    print(f"\n   📝 Asset: '{name}'")
                    print(f"      ✅ Keeping: ID {keep_asset.id} (created {keep_asset.created_at})")
                    
                    for asset in delete_assets:
                        print(f"      🗑️  Deleting: ID {asset.id} (created {asset.created_at})")
                        db.session.delete(asset)
            
            # Commit changes
            db.session.commit()
            print("\n✅ Cleanup completed!")
            
            # Show final status
            print("\n📊 Final status:")
            remaining_duplicates = db.session.query(
                RentalAsset.name,
                func.count(RentalAsset.id).label('count')
            ).group_by(RentalAsset.name).having(func.count(RentalAsset.id) > 1).all()
            
            if remaining_duplicates:
                print(f"   Still have {len(remaining_duplicates)} names with duplicates (these are likely legitimate)")
                for name, count in remaining_duplicates:
                    print(f"   - '{name}': {count} assets")
            else:
                print("   ✅ No more duplicate available assets!")
                
        else:
            print("\n⏭️  Skipping automatic cleanup.")

if __name__ == "__main__":
    fix_duplicate_assets()
