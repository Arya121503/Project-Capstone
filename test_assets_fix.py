#!/usr/bin/env python3
"""
Test script to verify the admin dashboard and available assets API are working correctly
"""

import requests
import time
import json

def test_admin_dashboard():
    """Test if admin dashboard loads correctly"""
    try:
        response = requests.get('http://127.0.0.1:5000/admin-dashboard', timeout=10)
        print(f"Admin Dashboard Status: {response.status_code}")
        if response.status_code == 200:
            if 'availableAssetsList' in response.text:
                print("✅ Admin dashboard loads correctly")
                print("✅ availableAssetsList element found in HTML")
                return True
            else:
                print("❌ availableAssetsList element not found in HTML")
                return False
        else:
            print(f"❌ Admin dashboard failed to load: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error accessing admin dashboard: {e}")
        return False

def test_available_assets_api():
    """Test if available assets API works correctly"""
    try:
        response = requests.get('http://127.0.0.1:5000/rental/api/assets/available?page=1&per_page=5', timeout=10)
        print(f"Available Assets API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                assets = data.get('assets', [])
                pagination = data.get('pagination', {})
                
                print(f"✅ API working correctly")
                print(f"✅ Found {len(assets)} assets on current page")
                print(f"✅ Total assets: {pagination.get('total', 0)}")
                print(f"✅ Pages: {pagination.get('pages', 0)}")
                
                if assets:
                    print("\n📋 Sample asset:")
                    asset = assets[0]
                    print(f"   Name: {asset.get('name', 'N/A')}")
                    print(f"   Type: {asset.get('asset_type_display', 'N/A')}")
                    print(f"   Location: {asset.get('kecamatan', 'N/A')}")
                    print(f"   Price: Rp {asset.get('harga_sewa', 0):,.0f}")
                    print(f"   Status: {asset.get('status_display', 'N/A')}")
                
                return True
            else:
                print(f"❌ API returned error: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ API request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error accessing API: {e}")
        return False

def test_javascript_files():
    """Test if required JavaScript files are accessible"""
    js_files = [
        'js/dash-admin.js',
        'js/sewakan_aset_new.js'
    ]
    
    all_accessible = True
    for js_file in js_files:
        try:
            response = requests.get(f'http://127.0.0.1:5000/static/{js_file}', timeout=10)
            if response.status_code == 200:
                print(f"✅ {js_file} is accessible")
            else:
                print(f"❌ {js_file} failed to load: {response.status_code}")
                all_accessible = False
        except Exception as e:
            print(f"❌ Error accessing {js_file}: {e}")
            all_accessible = False
    
    return all_accessible

def main():
    print("🧪 Testing Admin Dashboard - Available Assets Fix")
    print("=" * 60)
    
    # Test 1: Admin dashboard loads
    print("\n1. Testing Admin Dashboard Page...")
    dashboard_ok = test_admin_dashboard()
    
    # Test 2: Available assets API works
    print("\n2. Testing Available Assets API...")
    api_ok = test_available_assets_api()
    
    # Test 3: JavaScript files are accessible
    print("\n3. Testing JavaScript Files...")
    js_ok = test_javascript_files()
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 TEST SUMMARY:")
    print(f"   Admin Dashboard: {'✅ PASS' if dashboard_ok else '❌ FAIL'}")
    print(f"   Available Assets API: {'✅ PASS' if api_ok else '❌ FAIL'}")
    print(f"   JavaScript Files: {'✅ PASS' if js_ok else '❌ FAIL'}")
    
    if dashboard_ok and api_ok and js_ok:
        print("\n🎉 ALL TESTS PASSED!")
        print("The 'failed to load available assets' issue should now be fixed.")
        print("\n📝 To verify:")
        print("1. Open http://127.0.0.1:5000/admin-dashboard")
        print("2. Click on 'Sewakan Aset' in the sidebar")
        print("3. Check that the assets table loads with data")
    else:
        print("\n⚠️  SOME TESTS FAILED!")
        print("The issue may still exist. Check the failed components above.")

if __name__ == "__main__":
    main()
