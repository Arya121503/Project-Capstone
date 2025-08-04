#!/usr/bin/env python3
"""
Quick verification script to test admin dashboard after merge fixes
"""

import requests
import time

def test_admin_dashboard():
    """Test admin dashboard loading and CSS/JS files"""
    base_url = "http://127.0.0.1:5000"
    
    print("🧪 TESTING ADMIN DASHBOARD AFTER MERGE FIXES")
    print("=" * 60)
    
    # Test main dashboard page
    try:
        response = requests.get(f"{base_url}/admin-dashboard", timeout=10)
        print(f"📊 Admin Dashboard: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Dashboard loads successfully")
        else:
            print(f"❌ Dashboard failed to load: {response.status_code}")
            return
            
    except Exception as e:
        print(f"❌ Error accessing dashboard: {e}")
        return
    
    # Test CSS files
    css_files = [
        "css/dash-admin.css",
        "css/admin_notifications.css",
        "css/telkom-style.css"
    ]
    
    print(f"\n🎨 Testing CSS Files:")
    for css_file in css_files:
        try:
            response = requests.get(f"{base_url}/static/{css_file}", timeout=5)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"   {status} {css_file}: {response.status_code}")
        except Exception as e:
            print(f"   ❌ {css_file}: Error - {e}")
    
    # Test JS files
    js_files = [
        "js/dash-admin.js",
        "js/admin_notifications.js",
        "js/admin-rental-requests.js",
        "js/direct_asset_actions.js"
    ]
    
    print(f"\n🔧 Testing JavaScript Files:")
    for js_file in js_files:
        try:
            response = requests.get(f"{base_url}/static/{js_file}", timeout=5)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"   {status} {js_file}: {response.status_code}")
        except Exception as e:
            print(f"   ❌ {js_file}: Error - {e}")
    
    # Test APIs that should work
    print(f"\n🚀 Testing API Endpoints:")
    api_endpoints = [
        "rental/api/stats",
        "api/admin/notifications?per_page=5",
        "rental/api/assets/available?page=1&per_page=5"
    ]
    
    for endpoint in api_endpoints:
        try:
            response = requests.get(f"{base_url}/{endpoint}", timeout=5)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"   {status} {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"   ❌ {endpoint}: Error - {e}")
    
    print(f"\n" + "=" * 60)
    print("🎯 VERIFICATION COMPLETE")
    print("💡 If all items show ✅, the dashboard should work correctly")
    print("🌐 Visit: http://127.0.0.1:5000/admin-dashboard")

if __name__ == "__main__":
    test_admin_dashboard()
