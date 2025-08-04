#!/usr/bin/env python3
"""
Advanced debug script to check for specific errors in the admin dashboard
"""

import requests
import time
import json
from urllib.parse import urljoin

def check_admin_dashboard_detailed():
    """Check admin dashboard with detailed error analysis"""
    
    print("🔍 DETAILED ADMIN DASHBOARD ERROR CHECK")
    print("=" * 60)
    
    # Test 1: Check if admin dashboard loads (might redirect to login)
    print("\n1. Testing Admin Dashboard Access...")
    try:
        response = requests.get('http://127.0.0.1:5000/admin-dashboard', 
                               allow_redirects=False, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 302:
            location = response.headers.get('Location', '')
            print(f"   Redirected to: {location}")
            print("   ⚠️  Redirect detected - likely needs admin login")
            return False
        elif response.status_code == 200:
            print("   ✅ Dashboard loads successfully")
            
            # Check for specific elements
            content = response.text
            checks = {
                'availableAssetsList': 'availableAssetsList' in content,
                'sewakan_aset section': 'id="sewakan_aset"' in content,
                'RentalAssetManager': 'sewakan_aset_new.js' in content,
                'Bootstrap': 'bootstrap' in content
            }
            
            print("   Element checks:")
            for check, result in checks.items():
                status = "✅" if result else "❌"
                print(f"     {status} {check}")
                
            return all(checks.values())
        else:
            print(f"   ❌ Unexpected status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def check_javascript_console_errors():
    """Check for potential JavaScript errors"""
    print("\n2. Checking JavaScript File Dependencies...")
    
    js_files = [
        'static/js/dash-admin.js',
        'static/js/sewakan_aset_new.js',
        'static/js/direct_asset_actions.js',
        'static/js/admin-rental-requests.js'
    ]
    
    all_good = True
    for js_file in js_files:
        try:
            response = requests.get(f'http://127.0.0.1:5000/{js_file}', timeout=10)
            if response.status_code == 200:
                content = response.text
                # Check for key functions/classes
                if 'sewakan_aset_new.js' in js_file:
                    has_manager = 'RentalAssetManager' in content
                    has_load_function = 'loadAvailableAssets' in content
                    has_error_message = 'Failed to load available assets' in content
                    
                    print(f"   ✅ {js_file}")
                    print(f"     - RentalAssetManager class: {'✅' if has_manager else '❌'}")
                    print(f"     - loadAvailableAssets function: {'✅' if has_load_function else '❌'}")
                    print(f"     - Error message exists: {'✅' if has_error_message else '❌'}")
                    
                    if not (has_manager and has_load_function):
                        all_good = False
                        
                elif 'dash-admin.js' in js_file:
                    has_sewakan_trigger = 'sewakan_aset' in content
                    print(f"   ✅ {js_file}")
                    print(f"     - Sewakan aset trigger: {'✅' if has_sewakan_trigger else '❌'}")
                    
                    if not has_sewakan_trigger:
                        all_good = False
                else:
                    print(f"   ✅ {js_file}")
            else:
                print(f"   ❌ {js_file} - Status: {response.status_code}")
                all_good = False
        except Exception as e:
            print(f"   ❌ {js_file} - Error: {e}")
            all_good = False
    
    return all_good

def check_api_endpoints():
    """Check all related API endpoints"""
    print("\n3. Testing API Endpoints...")
    
    endpoints = [
        ('Available Assets', '/rental/api/assets/available?page=1&per_page=5'),
        ('Rental Requests', '/api/rental-requests'),
        ('Dashboard Stats', '/api/dashboard/stats'),
        ('Admin Notifications', '/api/admin/notifications/count')
    ]
    
    all_good = True
    for name, endpoint in endpoints:
        try:
            response = requests.get(f'http://127.0.0.1:5000{endpoint}', timeout=10)
            if response.status_code == 200:
                print(f"   ✅ {name}: {endpoint}")
                
                # For available assets, check data structure
                if 'assets/available' in endpoint:
                    try:
                        data = response.json()
                        if data.get('success') and data.get('assets'):
                            asset_count = len(data['assets'])
                            total = data.get('pagination', {}).get('total', 0)
                            print(f"     - Assets returned: {asset_count}")
                            print(f"     - Total available: {total}")
                        else:
                            print(f"     ⚠️  Unexpected data structure: {data}")
                    except:
                        print(f"     ⚠️  Non-JSON response")
                        
            else:
                print(f"   ❌ {name}: {endpoint} - Status: {response.status_code}")
                if response.status_code == 404:
                    print(f"     (404 might be expected for some endpoints)")
                else:
                    all_good = False
        except Exception as e:
            print(f"   ❌ {name}: {endpoint} - Error: {e}")
            all_good = False
    
    return all_good

def simulate_user_flow():
    """Simulate the user flow that was causing the error"""
    print("\n4. Simulating User Flow...")
    
    try:
        # Step 1: Try to access admin dashboard
        print("   Step 1: Accessing admin dashboard...")
        response = requests.get('http://127.0.0.1:5000/admin-dashboard', 
                               allow_redirects=True, timeout=10)
        
        if 'login' in response.url.lower():
            print("   ⚠️  Redirected to login - authentication required")
            print("   To test full flow, you need to:")
            print("     1. Login as admin in browser")
            print("     2. Navigate to Sewakan Aset section")
            print("     3. Check for 'Failed to load available assets' error")
            return False
        
        # Step 2: Check if assets API is called
        print("   Step 2: Testing direct assets API call...")
        response = requests.get('http://127.0.0.1:5000/rental/api/assets/available?page=1&per_page=10&search=&type=all&kecamatan=all&status=available&sort=newest', 
                               timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("   ✅ Assets API returns data successfully")
                return True
            else:
                print(f"   ❌ API returned error: {data.get('error', 'Unknown')}")
                return False
        else:
            print(f"   ❌ API request failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error in user flow: {e}")
        return False

def main():
    print("🔧 ADMIN DASHBOARD ERROR DIAGNOSTIC")
    print("Checking for 'Failed to load available assets' error...")
    print()
    
    # Run all checks
    dashboard_ok = check_admin_dashboard_detailed()
    js_ok = check_javascript_console_errors()
    api_ok = check_api_endpoints()
    flow_ok = simulate_user_flow()
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 DIAGNOSTIC SUMMARY:")
    print(f"   Dashboard Access: {'✅ PASS' if dashboard_ok else '❌ FAIL'}")
    print(f"   JavaScript Files: {'✅ PASS' if js_ok else '❌ FAIL'}")
    print(f"   API Endpoints: {'✅ PASS' if api_ok else '❌ FAIL'}")
    print(f"   User Flow: {'✅ PASS' if flow_ok else '⚠️  REQUIRES LOGIN'}")
    
    if dashboard_ok and js_ok and api_ok and flow_ok:
        print("\n🎉 ALL CHECKS PASSED!")
        print("The 'Failed to load available assets' error should be resolved.")
    elif api_ok and js_ok:
        print("\n✅ CORE FUNCTIONALITY IS WORKING")
        print("API and JavaScript are fine. Error might be:")
        print("1. Authentication issue (need admin login)")
        print("2. Browser cache (try hard refresh)")
        print("3. Timing issue (assets loading before DOM ready)")
    else:
        print("\n⚠️  ISSUES DETECTED!")
        print("Check the failed components above.")
    
    print("\n📝 NEXT STEPS:")
    print("1. Login as admin: http://127.0.0.1:5000/login")
    print("2. Go to admin dashboard: http://127.0.0.1:5000/admin-dashboard")
    print("3. Click 'Sewakan Aset' in sidebar")
    print("4. Check browser console (F12) for any errors")

if __name__ == "__main__":
    main()
