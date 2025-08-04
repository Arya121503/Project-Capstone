#!/usr/bin/env python3
"""
Test rental applications endpoint and check request ID 48
"""

import requests
import json

def test_rental_applications():
    """Test rental applications endpoint"""
    print("🔍 Testing rental applications endpoint...")
    
    try:
        response = requests.get('http://127.0.0.1:5000/api/user/rental-applications')
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            
            requests_data = data.get('data', [])
            print(f"Number of requests: {len(requests_data)}")
            
            if requests_data:
                # Look for request with ID 48
                request_48 = None
                for r in requests_data:
                    if r.get('id') == 48:
                        request_48 = r
                        break
                
                if request_48:
                    print("\n✅ Found request 48:")
                    for key, value in request_48.items():
                        print(f"  {key}: {value}")
                else:
                    print("\n❌ Request 48 not found")
                    ids = [r.get('id') for r in requests_data[:10]]
                    print(f"Available IDs: {ids}")
                    
                    # Show sample request structure
                    if requests_data:
                        print(f"\nSample request structure:")
                        sample = requests_data[0]
                        for key, value in sample.items():
                            print(f"  {key}: {type(value).__name__} = {value}")
                            
        elif response.status_code == 401:
            print("❌ Authentication required")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_viewRentalDetails_function():
    """Test if viewRentalDetails function is accessible"""
    print(f"\n🔍 Testing viewRentalDetails function accessibility...")
    
    try:
        # Test if the JS file is accessible
        response = requests.get('http://127.0.0.1:5000/static/js/dashboard-user-history.js')
        print(f"JS file status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            
            # Check for viewRentalDetails function
            if 'function viewRentalDetails(' in content:
                print("✅ viewRentalDetails function found in JS file")
                
                # Find the function definition
                start_idx = content.find('function viewRentalDetails(')
                if start_idx != -1:
                    # Get first 500 chars of function
                    func_preview = content[start_idx:start_idx+500]
                    print(f"\nFunction preview:")
                    print(func_preview)
                    
            else:
                print("❌ viewRentalDetails function NOT found in JS file")
                
        else:
            print(f"❌ JS file not accessible: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_dashboard_includes_js():
    """Test if dashboard includes the required JS file"""
    print(f"\n🔍 Testing if dashboard includes dashboard-user-history.js...")
    
    try:
        response = requests.get('http://127.0.0.1:5000/test-user-dashboard')
        print(f"Dashboard status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            
            # Check if JS file is included
            if 'dashboard-user-history.js' in content:
                print("✅ dashboard-user-history.js is included in dashboard")
            else:
                print("❌ dashboard-user-history.js is NOT included in dashboard")
                
            # Check for modal elements
            if 'rentalDetailModal' in content:
                print("✅ rentalDetailModal element found")
            else:
                print("⚠️  rentalDetailModal element not found (will be created dynamically)")
                
        else:
            print(f"❌ Dashboard not accessible: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("🚀 Testing viewRentalDetails functionality...")
    print("=" * 60)
    
    test_rental_applications()
    test_viewRentalDetails_function()
    test_dashboard_includes_js()
    
    print("\n" + "=" * 60)
    print("📋 DIAGNOSIS:")
    print("1. Check if request ID 48 exists in the data")
    print("2. Check if viewRentalDetails function is properly loaded")
    print("3. Check if dashboard includes the required JS files")
    print("4. Check browser console for JavaScript errors")

if __name__ == "__main__":
    main()
