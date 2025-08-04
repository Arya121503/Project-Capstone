import requests
from bs4 import BeautifulSoup

def analyze_user_dashboard():
    """Analyze user dashboard HTML for JavaScript loading issues"""
    
    print("🔍 Analyzing User Dashboard HTML")
    print("=" * 50)
    
    try:
        # Get the dashboard HTML
        response = requests.get('http://127.0.0.1:5000/user-dashboard')
        
        if response.status_code != 200:
            print(f"❌ Dashboard not accessible: {response.status_code}")
            return
            
        html_content = response.text
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Check for script tags
        script_tags = soup.find_all('script', src=True)
        js_files = [tag.get('src') for tag in script_tags if tag.get('src')]
        
        print(f"📁 Found {len(js_files)} external JS files:")
        
        target_file = None
        for js_file in js_files:
            print(f"   - {js_file}")
            if 'dashboard-user-history.js' in js_file:
                target_file = js_file
                
        print()
        
        if target_file:
            print(f"✅ dashboard-user-history.js found: {target_file}")
            
            # Try to access the JS file directly
            if target_file.startswith('/static/'):
                js_url = f"http://127.0.0.1:5000{target_file}"
            else:
                js_url = target_file
                
            js_response = requests.get(js_url)
            if js_response.status_code == 200:
                print(f"✅ JS file accessible: {js_response.status_code}")
                
                # Check file content
                js_content = js_response.text
                if 'function viewRentalDetails(' in js_content:
                    print("✅ viewRentalDetails function found in JS file")
                else:
                    print("❌ viewRentalDetails function NOT found in JS file")
                    
                if 'function fetchRentalDetailFromAPI(' in js_content:
                    print("✅ fetchRentalDetailFromAPI function found in JS file")
                else:
                    print("❌ fetchRentalDetailFromAPI function NOT found in JS file")
                    
            else:
                print(f"❌ JS file not accessible: {js_response.status_code}")
        else:
            print("❌ dashboard-user-history.js NOT found in HTML")
            
        # Check for inline scripts that might define viewRentalDetails
        inline_scripts = soup.find_all('script', src=False)
        print(f"\n📄 Found {len(inline_scripts)} inline script blocks")
        
        view_rental_found = False
        for i, script in enumerate(inline_scripts):
            if script.string and 'viewRentalDetails' in script.string:
                print(f"✅ viewRentalDetails mentioned in inline script #{i+1}")
                view_rental_found = True
                
        if not view_rental_found:
            print("❌ viewRentalDetails not found in any inline scripts")
            
        # Check for onclick attributes
        onclick_elements = soup.find_all(attrs={"onclick": True})
        print(f"\n🖱️  Found {len(onclick_elements)} elements with onclick:")
        
        for element in onclick_elements:
            onclick_value = element.get('onclick')
            if 'viewRentalDetails' in onclick_value:
                print(f"✅ Found: {onclick_value}")
                
        print("\n🎯 Analysis Complete!")
        
    except Exception as e:
        print(f"❌ Error analyzing dashboard: {e}")

if __name__ == "__main__":
    analyze_user_dashboard()
