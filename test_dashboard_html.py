#!/usr/bin/env python3
"""
Test user dashboard HTML output
"""

import requests
from requests.auth import HTTPBasicAuth

def test_user_dashboard_access():
    """Test accessing user dashboard with session"""
    print("🔍 Testing user dashboard access...")
    
    # Create session
    session = requests.Session()
    
    # Try to login first
    login_data = {
        'username': 'user',  # or any test user
        'password': 'user123'
    }
    
    try:
        # Try login
        login_response = session.post('http://127.0.0.1:5000/login', data=login_data)
        print(f"Login status: {login_response.status_code}")
        
        # Now access dashboard
        dashboard_response = session.get('http://127.0.0.1:5000/user-dashboard')
        print(f"Dashboard status: {dashboard_response.status_code}")
        
        if dashboard_response.status_code == 200:
            content = dashboard_response.text
            
            # Check for specific content
            checks = [
                ('dashboard-user-database.js', 'dashboard-user-database.js' in content),
                ('assetGrid element', 'id="assetGrid"' in content),
                ('loadAvailableAssets call', 'loadAvailableAssets' in content),
                ('JavaScript includes', '<script' in content and 'static/js/' in content),
                ('Bootstrap CSS', 'bootstrap' in content),
                ('Font Awesome', 'font-awesome' in content or 'fontawesome' in content),
                ('Dashboard container', 'dashboard' in content.lower()),
                ('Asset content area', 'aset' in content.lower() or 'asset' in content.lower())
            ]
            
            print("\n📋 Content checks:")
            for check_name, result in checks:
                status = "✅" if result else "❌"
                print(f"   {status} {check_name}: {result}")
            
            # Show a sample of the content
            print(f"\n📄 Content sample (first 1000 chars):")
            print(content[:1000])
            print("...")
            print(f"\n📄 Content sample (around 'assetGrid'):")
            if 'assetGrid' in content:
                idx = content.find('assetGrid')
                print(content[max(0, idx-200):idx+200])
            else:
                print("'assetGrid' not found in content")
                
            print(f"\n📄 Content sample (around JavaScript includes):")
            if 'dashboard-user-database.js' in content:
                idx = content.find('dashboard-user-database.js')
                print(content[max(0, idx-200):idx+200])
            else:
                print("'dashboard-user-database.js' not found in content")
                
        else:
            print(f"❌ Dashboard not accessible: {dashboard_response.status_code}")
            if dashboard_response.status_code == 302:
                print(f"Redirect location: {dashboard_response.headers.get('Location')}")
                
    except Exception as e:
        print(f"❌ Error testing dashboard access: {e}")

def test_direct_template():
    """Test accessing dashboard without login requirement"""
    print(f"\n🔍 Testing direct access to dashboard (bypass login)...")
    
    try:
        # Try accessing dashboard directly
        response = requests.get('http://127.0.0.1:5000/user-dashboard')
        print(f"Direct access status: {response.status_code}")
        
        if response.status_code == 302:
            print(f"Redirected to: {response.headers.get('Location')}")
            print("This confirms login is required")
        elif response.status_code == 200:
            content = response.text
            print("✅ Direct access successful")
            
            # Quick content checks
            has_assetGrid = 'assetGrid' in content
            has_js = 'dashboard-user-database.js' in content
            
            print(f"   assetGrid found: {has_assetGrid}")
            print(f"   JavaScript found: {has_js}")
            
    except Exception as e:
        print(f"❌ Error testing direct access: {e}")

def test_static_js_files():
    """Test if JavaScript files are accessible"""
    print(f"\n🔍 Testing JavaScript files accessibility...")
    
    js_files = [
        '/static/js/dashboard-user-database.js',
        '/static/js/dashboard-user-assets-interactive.js',
        '/static/js/dashboard-user-inline-functions.js'
    ]
    
    for js_file in js_files:
        try:
            response = requests.get(f'http://127.0.0.1:5000{js_file}')
            print(f"📄 {js_file}: {response.status_code}")
            
            if response.status_code == 200:
                content = response.text
                # Check for key functions
                functions = ['loadAvailableAssets', 'displayAssets', 'showAsetDetail']
                for func in functions:
                    if func in content:
                        print(f"   ✅ Contains {func}")
                        
        except Exception as e:
            print(f"   ❌ Error accessing {js_file}: {e}")

def main():
    print("🚀 Testing user dashboard HTML output...")
    print("=" * 60)
    
    test_direct_template()
    test_user_dashboard_access()
    test_static_js_files()
    
    print("\n" + "=" * 60)
    print("✅ Dashboard HTML testing complete!")

if __name__ == "__main__":
    main()
