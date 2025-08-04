#!/usr/bin/env python3
"""
Update Request Status
Script to update rental request status from pending to approved
"""

import sys
import os

# Add the project root to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

try:
    from app import create_app, db
    from app.models import RentalRequest
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

def update_request_status():
    """Update request #47 status to approved"""
    try:
        app = create_app()
        
        with app.app_context():
            # Find request #47
            request = RentalRequest.query.filter_by(id=47).first()
            
            if not request:
                print("❌ Request #47 tidak ditemukan")
                return
            
            print(f"📋 Request #47 saat ini:")
            print(f"   Asset: {request.asset_name}")
            print(f"   Status: {request.status}")
            print(f"   Admin Notes: {request.admin_notes}")
            
            # Update status to approved
            request.status = 'approved'
            db.session.commit()
            
            print(f"✅ Request #47 berhasil diupdate ke status 'approved'")
            
    except Exception as e:
        print(f"❌ Error updating request: {e}")

if __name__ == "__main__":
    update_request_status()
