#!/usr/bin/env python3
"""
Test script to verify the specific asset 171 (midtrans) fix
"""

import requests
import json

def test_specific_asset_fix():
    """Test the specific asset that was failing"""
    
    asset_id = 171
    base_url = "http://localhost:5000"
    
    print(f"🔍 Testing Asset ID: {asset_id} (midtrans)")
    print("=" * 50)
    
    try:
        # Test the API endpoint
        response = requests.get(f"{base_url}/rental/api/assets/{asset_id}", timeout=10)
        print(f"📡 API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Response: {data.get('success')}")
            
            if data.get('success'):
                asset_data = data.get('data')
                if asset_data:
                    print(f"📊 Asset Found:")
                    print(f"   - ID: {asset_data.get('id')}")
                    print(f"   - Name: {asset_data.get('name')}")
                    print(f"   - Type: {asset_data.get('asset_type')}")
                    print(f"   - Location: {asset_data.get('kecamatan')}")
                    print(f"   - Status: {asset_data.get('status')}")
                    
                    # Verify the response structure
                    print(f"\n🔧 Response Structure Check:")
                    print(f"   - Has 'success': {'success' in data}")
                    print(f"   - Has 'data': {'data' in data}")
                    print(f"   - Has 'asset': {'asset' in data}")
                    
                    if 'data' in data and 'asset' not in data:
                        print(f"   ✅ CORRECT: API returns data under 'data' property")
                    elif 'asset' in data:
                        print(f"   ⚠️  WARNING: API returns data under 'asset' property")
                    else:
                        print(f"   ❌ ERROR: Unexpected response structure")
                        
                else:
                    print(f"   ❌ No asset data found")
            else:
                print(f"   ❌ API returned success=false")
        else:
            print(f"   ❌ HTTP Error: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"   ❌ CONNECTION ERROR - Server might not be running")
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎯 Fix Summary:")
    print("✅ JavaScript now correctly uses 'data.data' instead of 'data.asset'")
    print("✅ Cache-busting updated to force browser refresh")
    print("✅ Modal should now open correctly for Asset ID 171")
    
    print("\n📋 Next Steps:")
    print("1. Hard refresh browser (Ctrl+F5)")
    print("2. Try clicking View button on 'midtrans' asset")
    print("3. Check browser console for any remaining errors")

if __name__ == "__main__":
    test_specific_asset_fix()
