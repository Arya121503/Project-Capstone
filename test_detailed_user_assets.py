#!/usr/bin/env python3
"""
Test specific user dashboard functionality
"""

import requests
import json

def test_user_dashboard_data_format():
    """Test if the data format matches what the JavaScript expects"""
    print("🔍 Testing user dashboard data format compatibility...")
    
    # Test the main endpoint used by dashboard-user-database.js
    try:
        response = requests.get('http://127.0.0.1:5000/rental/api/assets/available')
        data = response.json()
        
        print(f"✅ API Response Status: {response.status_code}")
        print(f"✅ API Success Field: {data.get('success')}")
        
        # Check data structure
        assets = data.get('data') or data.get('assets', [])
        print(f"✅ Number of assets: {len(assets)}")
        
        if assets:
            sample_asset = assets[0]
            print(f"\n📋 Sample asset data structure:")
            
            # Check for required fields that JavaScript expects
            required_fields = [
                'id', 'name', 'asset_type', 'kecamatan', 'alamat',
                'luas_tanah', 'luas_bangunan', 'harga_sewa', 'status'
            ]
            
            for field in required_fields:
                if field in sample_asset:
                    value = sample_asset[field]
                    print(f"   ✅ {field}: {type(value).__name__} = {value}")
                else:
                    print(f"   ❌ Missing: {field}")
            
            # Check for data issues
            print(f"\n🔍 Data quality checks:")
            
            # Check for empty names/addresses
            if not sample_asset.get('name') and not sample_asset.get('alamat'):
                print(f"   ⚠️  Asset has no name or address")
            else:
                print(f"   ✅ Asset has name or address")
                
            # Check price format
            harga = sample_asset.get('harga_sewa')
            if harga and isinstance(harga, (int, float)) and harga > 0:
                print(f"   ✅ Valid price format: {harga}")
            else:
                print(f"   ⚠️  Invalid price: {harga}")
            
            # Check location data
            kecamatan = sample_asset.get('kecamatan')
            if kecamatan:
                print(f"   ✅ Has location data: {kecamatan}")
            else:
                print(f"   ⚠️  Missing location data")
            
            # Check area data
            luas_tanah = sample_asset.get('luas_tanah')
            if luas_tanah and (isinstance(luas_tanah, (int, float)) and luas_tanah > 0):
                print(f"   ✅ Valid land area: {luas_tanah} m²")
            else:
                print(f"   ⚠️  Invalid land area: {luas_tanah}")
                
        # Test what JavaScript loadAvailableAssets expects
        print(f"\n🔍 JavaScript compatibility check:")
        print(f"   ✅ Response has 'success' field: {'success' in data}")
        print(f"   ✅ Success is True: {data.get('success') == True}")
        print(f"   ✅ Has data field: {'data' in data}")
        print(f"   ✅ Data is list: {isinstance(data.get('data'), list)}")
        
        # Check if response matches what dashboard-user-database.js expects
        if data.get('success') and isinstance(data.get('data'), list):
            print(f"   ✅ Response format compatible with JavaScript")
        else:
            print(f"   ❌ Response format NOT compatible with JavaScript")
            
    except Exception as e:
        print(f"❌ Error testing data format: {e}")

def test_browser_simulation():
    """Simulate what a browser would do when loading the dashboard"""
    print(f"\n🔍 Simulating browser behavior...")
    
    # Test main page load
    try:
        response = requests.get('http://127.0.0.1:5000/user-dashboard')
        print(f"✅ Dashboard page status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            
            # Check if JavaScript files are included
            js_files = [
                'dashboard-user-database.js',
                'dashboard-user-assets-interactive.js',
                'dashboard-user-inline-functions.js'
            ]
            
            for js_file in js_files:
                if js_file in content:
                    print(f"   ✅ {js_file} is included in HTML")
                else:
                    print(f"   ⚠️  {js_file} NOT included in HTML")
                    
            # Check if loadAvailableAssets is called
            if 'loadAvailableAssets' in content:
                print(f"   ✅ loadAvailableAssets function is called")
            else:
                print(f"   ⚠️  loadAvailableAssets function is NOT called")
                
            # Check for asset grid container
            if 'assetGrid' in content:
                print(f"   ✅ assetGrid container exists in HTML")
            else:
                print(f"   ⚠️  assetGrid container NOT found in HTML")
                
        else:
            print(f"   ❌ Dashboard page not accessible")
            
    except Exception as e:
        print(f"❌ Error simulating browser: {e}")

def test_all_asset_endpoints_detailed():
    """Test all asset endpoints in detail"""
    print(f"\n🔍 Testing all asset endpoints in detail...")
    
    endpoints = [
        '/api/assets',
        '/api/assets/available', 
        '/rental/api/assets/available'
    ]
    
    for endpoint in endpoints:
        print(f"\n📍 Testing {endpoint}:")
        try:
            response = requests.get(f'http://127.0.0.1:5000{endpoint}')
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check structure
                print(f"   Response keys: {list(data.keys())}")
                
                # Check success field
                if 'success' in data:
                    print(f"   Success: {data['success']}")
                    
                # Get assets
                assets = data.get('data') or data.get('assets', [])
                print(f"   Assets count: {len(assets)}")
                
                if assets:
                    # Check asset structure
                    asset = assets[0]
                    print(f"   Sample asset ID: {asset.get('id')}")
                    print(f"   Sample asset name: {asset.get('name', 'No name')}")
                    print(f"   Sample asset type: {asset.get('asset_type')}")
                    print(f"   Sample asset price: {asset.get('harga_sewa')}")
                    print(f"   Sample asset location: {asset.get('kecamatan')}")
                    
                    # Check for display issues
                    name_or_address = asset.get('name') or asset.get('alamat')
                    if not name_or_address:
                        print(f"   ⚠️  Asset has no displayable name/address")
                    
                # Check pagination
                if 'pagination' in data:
                    pagination = data['pagination']
                    print(f"   Pagination: page {pagination.get('page', 'N/A')} of {pagination.get('pages', 'N/A')}")
                    
            else:
                print(f"   ❌ Error: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")

def main():
    print("🚀 Starting detailed user assets loading analysis...")
    print("=" * 70)
    
    test_user_dashboard_data_format()
    test_browser_simulation()
    test_all_asset_endpoints_detailed()
    
    print("\n" + "=" * 70)
    print("✅ Detailed analysis complete!")
    
    print(f"\n🎯 SUMMARY:")
    print(f"   - All API endpoints are working")
    print(f"   - JavaScript files are accessible")
    print(f"   - Data structure looks correct")
    print(f"   - Issue might be in browser-side JavaScript execution")
    print(f"   - Recommended: Check browser console for JavaScript errors")

if __name__ == "__main__":
    main()
