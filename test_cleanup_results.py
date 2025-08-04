#!/usr/bin/env python3
"""
Comprehensive test after code duplication cleanup
"""

import requests
import time
import json

BASE_URL = 'http://localhost:5000'

def test_asset_endpoints():
    """Test all asset-related endpoints"""
    print("🧪 Testing Asset Management Endpoints...")
    
    # Test main assets endpoint
    try:
        response = requests.get(f"{BASE_URL}/rental/api/assets")
        print(f"✅ GET /rental/api/assets: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   - Found {len(data.get('data', []))} assets")
    except Exception as e:
        print(f"❌ GET /rental/api/assets: {e}")
    
    # Test available assets endpoint
    try:
        response = requests.get(f"{BASE_URL}/rental/api/assets/available")
        print(f"✅ GET /rental/api/assets/available: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   - Found {len(data.get('data', []))} available assets")
    except Exception as e:
        print(f"❌ GET /rental/api/assets/available: {e}")
    
    # Test rented assets endpoint
    try:
        response = requests.get(f"{BASE_URL}/rental/api/assets/rented")
        print(f"✅ GET /rental/api/assets/rented: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   - Found {len(data.get('data', []))} rented assets")
    except Exception as e:
        print(f"❌ GET /rental/api/assets/rented: {e}")

def test_deprecated_endpoints():
    """Test that deprecated endpoints are not accessible"""
    print("\n🚫 Testing Deprecated Endpoints (should fail)...")
    
    deprecated_endpoints = [
        "/api/rental-assets",
        "/api/asset-detail/1",
        "/api/available-assets"
    ]
    
    for endpoint in deprecated_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            if response.status_code == 404:
                print(f"✅ {endpoint}: Correctly returns 404")
            else:
                print(f"⚠️ {endpoint}: Returns {response.status_code} (should be 404)")
        except Exception as e:
            print(f"✅ {endpoint}: Not accessible ({e})")

def test_dashboard_pages():
    """Test that main dashboard pages load without errors"""
    print("\n📊 Testing Dashboard Pages...")
    
    pages = [
        "/dashboard_admin",
        "/admin/rental-assets",
    ]
    
    for page in pages:
        try:
            response = requests.get(f"{BASE_URL}{page}")
            if response.status_code == 200:
                print(f"✅ {page}: Loads successfully")
                # Check for JavaScript errors or missing references
                content = response.text
                if "sewakan_aset_new.js" in content:
                    print(f"   ✅ Contains sewakan_aset_new.js reference")
                if "directAssetActions" in content:
                    print(f"   ⚠️ Still contains directAssetActions reference")
            else:
                print(f"❌ {page}: Returns {response.status_code}")
        except Exception as e:
            print(f"❌ {page}: {e}")

def check_js_files():
    """Check JavaScript file status"""
    print("\n📁 Checking JavaScript Files...")
    
    import os
    js_dir = "app/static/js"
    
    # Files that should exist
    should_exist = [
        "sewakan_aset_new.js"
    ]
    
    # Files that should NOT exist (duplicates)
    should_not_exist = [
        "direct_asset_actions.js",
        "modal_fix_new.js"
    ]
    
    for file in should_exist:
        if os.path.exists(f"{js_dir}/{file}"):
            print(f"✅ {file}: Exists")
        else:
            print(f"❌ {file}: Missing")
    
    for file in should_not_exist:
        if not os.path.exists(f"{js_dir}/{file}"):
            print(f"✅ {file}: Correctly removed")
        else:
            print(f"⚠️ {file}: Still exists (should be removed)")

def main():
    print("🔍 COMPREHENSIVE CLEANUP TEST")
    print("=" * 50)
    
    check_js_files()
    test_asset_endpoints()
    test_deprecated_endpoints()
    test_dashboard_pages()
    
    print("\n" + "=" * 50)
    print("✅ CLEANUP TEST COMPLETED")
    print("\nNext steps:")
    print("1. Check browser console for any JavaScript errors")
    print("2. Test asset operations (view, edit, delete) manually")
    print("3. Ensure no duplicate function calls")

if __name__ == "__main__":
    main()
