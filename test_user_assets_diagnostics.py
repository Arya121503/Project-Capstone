#!/usr/bin/env python3
"""
Test script to check user assets loading issue
"""

import requests
import json

def test_asset_endpoint():
    """Test the rental assets endpoint"""
    print("🔍 Testing rental assets endpoint...")
    
    try:
        response = requests.get('http://127.0.0.1:5000/rental/api/assets/available')
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response structure: {list(data.keys())}")
            
            # Check if data has the expected structure
            if 'success' in data:
                print(f"Success: {data['success']}")
                if data['success']:
                    assets = data.get('data') or data.get('assets', [])
                    print(f"Number of assets: {len(assets)}")
                    
                    if assets:
                        print("Sample asset structure:")
                        sample_asset = assets[0]
                        for key, value in sample_asset.items():
                            print(f"  {key}: {type(value).__name__} = {str(value)[:50]}")
                else:
                    print(f"Error from API: {data.get('error', 'Unknown error')}")
            else:
                # Old format without success field
                if isinstance(data, dict) and 'assets' in data:
                    assets = data['assets']
                    print(f"Number of assets (old format): {len(assets)}")
                    
                    if assets:
                        print("Sample asset structure:")
                        sample_asset = assets[0]
                        for key, value in sample_asset.items():
                            print(f"  {key}: {type(value).__name__} = {str(value)[:50]}")
                else:
                    print("Unexpected response format")
                    print(f"Response: {json.dumps(data, indent=2, default=str)[:500]}")
                    
        else:
            print(f"Failed with status {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Error testing endpoint: {e}")

def test_simple_assets_endpoint():
    """Test the simple assets endpoint"""
    print("\n🔍 Testing simple assets endpoint...")
    
    try:
        response = requests.get('http://127.0.0.1:5000/api/assets')
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response structure: {list(data.keys())}")
            
            if 'success' in data:
                print(f"Success: {data['success']}")
                if data['success']:
                    assets = data.get('data', [])
                    print(f"Number of assets: {len(assets)}")
                    
                    if assets:
                        print("Sample asset structure:")
                        sample_asset = assets[0]
                        for key, value in sample_asset.items():
                            print(f"  {key}: {type(value).__name__} = {str(value)[:50]}")
                else:
                    print(f"Error from API: {data.get('error', 'Unknown error')}")
                    
        else:
            print(f"Failed with status {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Error testing simple assets endpoint: {e}")

def test_assets_available_endpoint():
    """Test the assets available endpoint"""
    print("\n🔍 Testing assets available endpoint...")
    
    try:
        response = requests.get('http://127.0.0.1:5000/api/assets/available')
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response structure: {list(data.keys())}")
            
            if 'success' in data:
                print(f"Success: {data['success']}")
                if data['success']:
                    assets = data.get('data', [])
                    print(f"Number of assets: {len(assets)}")
                    
                    if assets:
                        print("Sample asset structure:")
                        sample_asset = assets[0]
                        for key, value in sample_asset.items():
                            print(f"  {key}: {type(value).__name__} = {str(value)[:50]}")
                else:
                    print(f"Error from API: {data.get('error', 'Unknown error')}")
                    
        else:
            print(f"Failed with status {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Error testing assets available endpoint: {e}")

def check_js_files():
    """Check if JavaScript files are accessible"""
    print("\n🔍 Checking JavaScript files accessibility...")
    
    js_files = [
        'http://127.0.0.1:5000/static/js/dashboard-user-database.js',
        'http://127.0.0.1:5000/static/js/dashboard-user-assets-interactive.js',
        'http://127.0.0.1:5000/static/js/dashboard-user-inline-functions.js',
        'http://127.0.0.1:5000/static/js/dashboard-user-rental.js'
    ]
    
    for js_file in js_files:
        try:
            response = requests.get(js_file)
            print(f"📄 {js_file.split('/')[-1]}: {response.status_code}")
            
            if response.status_code == 200:
                content = response.text
                # Check for key functions
                if 'loadAvailableAssets' in content:
                    print(f"   ✅ Contains loadAvailableAssets function")
                if 'displayAssets' in content:
                    print(f"   ✅ Contains displayAssets function")
                if 'createAssetCard' in content:
                    print(f"   ✅ Contains createAssetCard function")
                if 'showAsetDetail' in content:
                    print(f"   ✅ Contains showAsetDetail function")
                    
                # Check for potential issues
                if 'console.error' in content:
                    print(f"   ⚠️  Contains error logging")
                    
            else:
                print(f"   ❌ Not accessible: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error accessing {js_file}: {e}")

def check_all_endpoints():
    """Check all possible asset endpoints"""
    print("\n🔍 Checking all possible asset endpoints...")
    
    endpoints = [
        '/api/aset-tersedia',
        '/api/aset',
        '/api/assets',
        '/api/assets/available',
        '/rental/api/assets',
        '/rental/api/assets/available',
        '/assets/api/available'
    ]
    
    for endpoint in endpoints:
        try:
            url = f'http://127.0.0.1:5000{endpoint}'
            response = requests.get(url)
            print(f"📍 {endpoint}: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        if 'success' in data:
                            print(f"   Success: {data['success']}")
                            if data['success']:
                                assets = data.get('data') or data.get('assets', [])
                                print(f"   Assets count: {len(assets)}")
                        elif 'assets' in data:
                            print(f"   Assets count: {len(data['assets'])}")
                        elif 'data' in data:
                            print(f"   Data count: {len(data['data'])}")
                        else:
                            print(f"   Response keys: {list(data.keys())}")
                    else:
                        print(f"   Response type: {type(data)}")
                        if isinstance(data, list):
                            print(f"   List length: {len(data)}")
                            
                except json.JSONDecodeError:
                    print(f"   ⚠️  Non-JSON response")
                    
            elif response.status_code == 401:
                print(f"   🔒 Requires authentication")
            elif response.status_code == 404:
                print(f"   ❌ Not found")
            else:
                print(f"   ❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")

def main():
    print("🚀 Starting user assets loading diagnostics...")
    print("=" * 60)
    
    # Test main endpoints
    test_asset_endpoint()
    test_simple_assets_endpoint() 
    test_assets_available_endpoint()
    
    # Check JavaScript files
    check_js_files()
    
    # Check all possible endpoints
    check_all_endpoints()
    
    print("\n" + "=" * 60)
    print("✅ Diagnostics complete!")

if __name__ == "__main__":
    main()
