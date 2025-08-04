import requests

def simple_dashboard_test():
    """Simple test to check if dashboard loads JS correctly"""
    
    print("🔍 Simple Dashboard JS Test")
    print("=" * 40)
    
    try:
        # Get dashboard HTML
        response = requests.get('http://127.0.0.1:5000/user-dashboard')
        html = response.text
        
        print(f"✅ Dashboard status: {response.status_code}")
        
        # Check for key elements
        checks = [
            ('dashboard-user-history.js', 'Dashboard History JS'),
            ('viewRentalDetails(', 'viewRentalDetails function call'),
            ('onclick=', 'onclick attributes'),
            ('btn-outline-primary', 'Button styling'),
            ('Lihat Detail', 'Lihat Detail text')
        ]
        
        for check_text, description in checks:
            if check_text in html:
                print(f"✅ {description}: Found")
            else:
                print(f"❌ {description}: NOT Found")
                
        # Test JS file directly
        js_response = requests.get('http://127.0.0.1:5000/static/js/dashboard-user-history.js')
        print(f"\n📁 JS file status: {js_response.status_code}")
        
        if js_response.status_code == 200:
            js_content = js_response.text
            js_checks = [
                ('function viewRentalDetails(', 'viewRentalDetails function'),
                ('function fetchRentalDetailFromAPI(', 'fetchRentalDetailFromAPI function'),
                ('function showRentalDetailModal(', 'showRentalDetailModal function'),
                ('rentalRequests =', 'rentalRequests variable'),
                ('onclick="viewRentalDetails(', 'onclick generation')
            ]
            
            for check_text, description in js_checks:
                if check_text in js_content:
                    print(f"✅ {description}: Found")
                else:
                    print(f"❌ {description}: NOT Found")
        
        print("\n🎯 Quick Analysis:")
        if 'dashboard-user-history.js' in html and js_response.status_code == 200:
            print("✅ JS file is referenced and accessible")
            if 'function viewRentalDetails(' in js_content:
                print("✅ viewRentalDetails function exists")
                if 'onclick="viewRentalDetails(' in js_content:
                    print("✅ Function is used in onclick generation")
                    print("\n💡 Issue might be:")
                    print("   1. JS errors preventing function registration")
                    print("   2. Button not being created dynamically")
                    print("   3. Modal/Bootstrap conflicts")
                    print("\n🔧 Next steps:")
                    print("   1. Check browser console for JS errors")
                    print("   2. Test debug page: http://127.0.0.1:5000/debug-lihat-detail")
                    print("   3. Verify button is created for 'approved' status requests")
                else:
                    print("❌ Function not used in onclick generation")
            else:
                print("❌ viewRentalDetails function missing")
        else:
            print("❌ JS file not properly referenced or accessible")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    simple_dashboard_test()
