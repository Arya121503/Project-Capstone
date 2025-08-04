import requests

def test_with_login():
    """Test dashboard dengan login yang valid"""
    
    print("🔐 Testing Dashboard with Login")
    print("=" * 40)
    
    # Create session
    session = requests.Session()
    
    # Login first
    login_data = {
        'email': 'arya@gmail.com',
        'password': 'arya123'
    }
    
    print("📝 Attempting login...")
    login_response = session.post('http://127.0.0.1:5000/login', data=login_data)
    
    if login_response.status_code == 200:
        if 'Silakan login' in login_response.text:
            print("❌ Login failed - still showing login page")
            return
        else:
            print("✅ Login successful")
    else:
        print(f"❌ Login request failed: {login_response.status_code}")
        return
    
    # Now access dashboard
    print("🎯 Accessing dashboard...")
    dashboard_response = session.get('http://127.0.0.1:5000/user-dashboard')
    
    if dashboard_response.status_code == 200:
        html = dashboard_response.text
        
        # Save for inspection
        with open('debug_dashboard_logged_in.html', 'w', encoding='utf-8') as f:
            f.write(html)
            
        print(f"✅ Dashboard status: {dashboard_response.status_code}")
        print(f"📄 HTML length: {len(html)} characters")
        
        # Check for key patterns
        patterns = [
            ('dashboard-user-history.js', 'History JS reference'),
            ('viewRentalDetails', 'viewRentalDetails mentions'),
            ('Lihat Detail', 'Lihat Detail text'),
            ('onclick=', 'onclick attributes'),
            ('<script', 'Script tags'),
            ('User Dashboard', 'Dashboard title'),
            ('Riwayat Pengajuan', 'Rental history section')
        ]
        
        print("\n🔍 Pattern Analysis:")
        for pattern, desc in patterns:
            count = html.count(pattern)
            status = "✅" if count > 0 else "❌"
            print(f"   {status} {desc}: {count} occurrences")
            
        print(f"\n📁 Logged-in HTML saved to: debug_dashboard_logged_in.html")
        
        # Check if we got the actual dashboard
        if 'dashboard-user-history.js' in html:
            print("🎉 SUCCESS: Dashboard with JS loaded!")
        elif 'User Dashboard' in html or 'Dashboard' in html:
            print("⚠️  Dashboard loaded but JS missing")
        else:
            print("❌ Still not the correct dashboard page")
            
    else:
        print(f"❌ Dashboard request failed: {dashboard_response.status_code}")

if __name__ == "__main__":
    test_with_login()
