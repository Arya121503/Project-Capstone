import requests
import time

def test_user_dashboard_and_js():
    """Test user dashboard and JavaScript function availability"""
    
    print("🔧 Testing User Dashboard and JavaScript Functions")
    print("=" * 60)
    
    # Test 1: Access user dashboard
    try:
        response = requests.get('http://127.0.0.1:5000/user-dashboard')
        print(f"✅ User dashboard status: {response.status_code}")
        
        # Check if dashboard-user-history.js is referenced
        if 'dashboard-user-history.js' in response.text:
            print("✅ dashboard-user-history.js is referenced in HTML")
        else:
            print("❌ dashboard-user-history.js NOT referenced in HTML")
            
        # Check if viewRentalDetails function call exists
        if 'viewRentalDetails(' in response.text:
            print("✅ viewRentalDetails function call found in HTML")
        else:
            print("❌ viewRentalDetails function call NOT found in HTML")
            
    except Exception as e:
        print(f"❌ Error accessing user dashboard: {e}")
    
    # Test 2: Access JavaScript file directly
    try:
        response = requests.get('http://127.0.0.1:5000/static/js/dashboard-user-history.js')
        print(f"✅ JavaScript file status: {response.status_code}")
        
        # Check if viewRentalDetails function exists
        if 'function viewRentalDetails(' in response.text:
            print("✅ viewRentalDetails function exists in JS file")
        else:
            print("❌ viewRentalDetails function NOT found in JS file")
            
        # Check if fetchRentalDetailFromAPI function exists
        if 'function fetchRentalDetailFromAPI(' in response.text:
            print("✅ fetchRentalDetailFromAPI function exists in JS file")
        else:
            print("❌ fetchRentalDetailFromAPI function NOT found in JS file")
            
    except Exception as e:
        print(f"❌ Error accessing JavaScript file: {e}")
    
    # Test 3: Test API endpoints
    try:
        response = requests.get('http://127.0.0.1:5000/test-rental-detail/48')
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Test rental detail endpoint working")
                print(f"   Asset: {data['data']['asset_name']}")
                print(f"   Status: {data['data']['status']}")
            else:
                print(f"❌ Test endpoint error: {data.get('error')}")
        else:
            print(f"❌ Test endpoint HTTP error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing endpoint: {e}")
    
    # Test 4: Test debug page
    try:
        response = requests.get('http://127.0.0.1:5000/debug-lihat-detail')
        print(f"✅ Debug page status: {response.status_code}")
        
        if 'viewRentalDetails(48)' in response.text:
            print("✅ Debug page has test button")
        else:
            print("❌ Debug page missing test button")
            
    except Exception as e:
        print(f"❌ Error accessing debug page: {e}")
    
    print("\n🎯 Summary:")
    print("- Open http://127.0.0.1:5000/debug-lihat-detail in browser")
    print("- Check browser console for JavaScript errors")
    print("- Click both test buttons and observe behavior")
    print("- If function not found, JS file may not be loading")

if __name__ == "__main__":
    test_user_dashboard_and_js()
