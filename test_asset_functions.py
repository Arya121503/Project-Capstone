#!/usr/bin/env python3
"""
Test script to verify asset management functions are working correctly
"""

import requests
import json
import sys

def test_asset_functions():
    """Test if asset management endpoints are accessible"""
    
    base_url = "http://localhost:5000"
    
    print("🔍 Testing Asset Management Functions...")
    print("=" * 50)
    
    # Test endpoints
    endpoints_to_test = [
        ("/rental/api/assets", "GET", "Available Assets List"),
        ("/rental/api/assets/available", "GET", "Available Assets API"),
    ]
    
    for endpoint, method, description in endpoints_to_test:
        print(f"\n📡 Testing {description}")
        print(f"   URL: {base_url}{endpoint}")
        
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
            else:
                response = requests.post(f"{base_url}{endpoint}", timeout=10)
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        if data.get('success'):
                            print(f"   ✅ SUCCESS - Response format correct")
                            if 'assets' in data:
                                print(f"   📊 Found {len(data['assets'])} assets")
                        else:
                            print(f"   ⚠️  API returned success=false: {data.get('message', 'No message')}")
                    else:
                        print(f"   ⚠️  Unexpected response format")
                except json.JSONDecodeError:
                    print(f"   ⚠️  Response is not valid JSON")
            else:
                print(f"   ❌ FAILED - HTTP {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ CONNECTION ERROR - Server might not be running")
        except requests.exceptions.Timeout:
            print(f"   ❌ TIMEOUT - Request took too long")
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🔍 Testing JavaScript Function Availability...")
    
    # Check if the JavaScript files exist
    js_files_to_check = [
        "app/static/js/sewakan_aset_new.js"
    ]
    
    for js_file in js_files_to_check:
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Check for key functions
            functions_to_check = [
                'viewAssetDetail',
                'editAsset', 
                'deleteAsset',
                'window.directAssetActions'
            ]
            
            print(f"\n📄 Checking {js_file}")
            for func in functions_to_check:
                if func in content:
                    print(f"   ✅ {func} found")
                else:
                    print(f"   ❌ {func} NOT found")
                    
        except FileNotFoundError:
            print(f"   ❌ File not found: {js_file}")
        except Exception as e:
            print(f"   ❌ Error reading {js_file}: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎯 Summary:")
    print("1. Make sure Flask development server is running")
    print("2. Check browser console for JavaScript errors")
    print("3. Verify modal elements exist in HTML")
    print("4. Test buttons in browser")

if __name__ == "__main__":
    test_asset_functions()
