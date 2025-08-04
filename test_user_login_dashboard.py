#!/usr/bin/env python3
"""
Create test user and test dashboard
"""

import requests
import json

def create_test_user():
    """Create a test user for testing"""
    print("🔍 Creating test user...")
    
    register_data = {
        'name': 'Test User',
        'email': 'testuser@test.com', 
        'password': 'testpass123',
        'confirm_password': 'testpass123'
    }
    
    try:
        response = requests.post('http://127.0.0.1:5000/register', data=register_data)
        print(f"Register status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ User created successfully")
        elif response.status_code == 302:
            print("✅ User creation redirected (likely successful)")
        else:
            print(f"⚠️  Register response: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Error creating user: {e}")

def test_login_and_dashboard():
    """Test login and then access dashboard"""
    print(f"\n🔍 Testing login and dashboard access...")
    
    session = requests.Session()
    
    # Login data
    login_data = {
        'email': 'testuser@test.com',
        'password': 'testpass123'
    }
    
    try:
        # Attempt login
        login_response = session.post('http://127.0.0.1:5000/login', data=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 302:
            print("✅ Login redirected (likely successful)")
            redirect_url = login_response.headers.get('Location', '')
            print(f"Redirect to: {redirect_url}")
            
            # Follow redirect
            if redirect_url:
                if redirect_url.startswith('/'):
                    redirect_url = 'http://127.0.0.1:5000' + redirect_url
                
                final_response = session.get(redirect_url)
                print(f"Final page status: {final_response.status_code}")
                
                if final_response.status_code == 200:
                    content = final_response.text
                    
                    # Check for dashboard content
                    checks = [
                        'assetGrid',
                        'dashboard-user-database.js',
                        'loadAvailableAssets',
                        'Aset Tersedia',
                        'Dashboard User'
                    ]
                    
                    print(f"\n📋 Dashboard content checks:")
                    for check in checks:
                        found = check in content
                        status = "✅" if found else "❌"
                        print(f"   {status} {check}: {found}")
                    
                    # Show content sample
                    print(f"\n📄 Content sample (first 500 chars):")
                    print(content[:500])
                    
        elif login_response.status_code == 200:
            # Login page returned, check for error messages
            content = login_response.text
            if 'error' in content.lower() or 'gagal' in content.lower():
                print("❌ Login failed (error message in response)")
            else:
                print("⚠️  Login returned 200 but may have failed")
                
    except Exception as e:
        print(f"❌ Error in login test: {e}")

def test_dashboard_direct_with_session():
    """Test accessing dashboard after setting session manually"""
    print(f"\n🔍 Testing dashboard with manual session...")
    
    # Try to access dashboard directly
    response = requests.get('http://127.0.0.1:5000/user-dashboard')
    print(f"Dashboard status: {response.status_code}")
    
    if response.status_code == 200:
        content = response.text
        
        # Check if this is actually the dashboard or login page
        if 'login' in content.lower() and 'password' in content.lower():
            print("❌ Returned login page (authentication required)")
        else:
            print("✅ Returned dashboard page")
            
            # Check for key elements
            has_assetGrid = 'assetGrid' in content
            has_js = 'dashboard-user-database.js' in content
            
            print(f"   assetGrid: {has_assetGrid}")
            print(f"   JavaScript: {has_js}")
            
    elif response.status_code == 302:
        print("❌ Redirected (authentication required)")

def main():
    print("🚀 Testing user creation and dashboard access...")
    print("=" * 60)
    
    create_test_user()
    test_login_and_dashboard()
    test_dashboard_direct_with_session()
    
    print("\n" + "=" * 60)
    print("✅ User test complete!")

if __name__ == "__main__":
    main()
