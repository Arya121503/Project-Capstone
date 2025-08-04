#!/usr/bin/env python3
"""
Create a test asset that can be safely deleted (no transaction history)
"""

import requests
import json

def create_test_asset():
    """Create a test asset for deletion testing"""
    
    base_url = "http://localhost:5000"
    
    print("🔨 Creating test asset for deletion testing...")
    print("=" * 50)
    
    # Asset data
    test_asset = {
        "asset_name": "Test Asset for Deletion",
        "asset_type": "tanah",
        "location": "Surabaya Utara",
        "address": "Jl. Test No.123, Surabaya Utara",
        "land_size": 100,
        "building_size": "",
        "bedrooms": "",
        "bathrooms": "",
        "floors": "",
        "njop_per_m2": 1500000,
        "rental_price": 2000000,
        "certificate": "SHM",
        "zone_type": "Perumahan",
        "description": "Test asset yang bisa dihapus dengan aman",
        "status": "available",
        "daya_listrik": "1300 VA"
    }
    
    try:
        # Create the asset
        response = requests.post(
            f"{base_url}/rental/api/assets",
            headers={
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            json=test_asset,
            timeout=10
        )
        
        print(f"📡 Create Asset Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            data = response.json()
            if data.get('success'):
                asset_id = data.get('asset_id')
                print(f"✅ Test asset created successfully!")
                print(f"   Asset ID: {asset_id}")
                print(f"   Name: {test_asset['asset_name']}")
                print(f"   Location: {test_asset['location']}")
                
                print(f"\n🎯 Testing delete functionality...")
                
                # Test delete
                delete_response = requests.delete(
                    f"{base_url}/rental/api/assets/{asset_id}",
                    timeout=10
                )
                
                print(f"📡 Delete Status: {delete_response.status_code}")
                
                if delete_response.status_code == 200:
                    delete_data = delete_response.json()
                    if delete_data.get('success'):
                        print(f"✅ Asset deleted successfully!")
                        print(f"   Message: {delete_data.get('message')}")
                    else:
                        print(f"❌ Delete failed: {delete_data.get('error')}")
                else:
                    print(f"❌ Delete HTTP error: {delete_response.status_code}")
                    try:
                        error_data = delete_response.json()
                        print(f"   Error: {error_data.get('error')}")
                    except:
                        print(f"   Raw response: {delete_response.text}")
                        
            else:
                print(f"❌ Create failed: {data.get('error')}")
                print(f"   Full response: {data}")
        else:
            print(f"❌ Create HTTP error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error')}")
            except:
                print(f"   Raw response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print(f"❌ CONNECTION ERROR - Server might not be running")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print(f"\n🔍 Testing asset 171 (with transaction history)...")
    
    try:
        # Test delete asset 171 (should fail)
        delete_response = requests.delete(
            f"{base_url}/rental/api/assets/171",
            timeout=10
        )
        
        print(f"📡 Delete Asset 171 Status: {delete_response.status_code}")
        
        if delete_response.status_code == 400:
            delete_data = delete_response.json()
            print(f"✅ Correctly prevented deletion!")
            print(f"   Error: {delete_data.get('error')}")
            print(f"   Transaction Count: {delete_data.get('transaction_count')}")
        else:
            print(f"⚠️  Unexpected response: {delete_response.status_code}")
            
    except Exception as e:
        print(f"❌ ERROR testing asset 171: {str(e)}")

if __name__ == "__main__":
    create_test_asset()
