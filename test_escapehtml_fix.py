#!/usr/bin/env python3
"""
Test Script untuk memverifikasi fix escapeHtml error
"""

import requests
import time

def test_escapehml_fix():
    print("🧪 TESTING ESCAPEHTML FIX")
    print("=" * 60)
    
    base_url = "http://127.0.0.1:5000"
    
    # Test 1: Verify server is running
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"✅ Server running - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Server not accessible: {e}")
        return
    
    # Test 2: Check sewakan_aset_new.js file directly
    try:
        js_response = requests.get(f"{base_url}/static/js/sewakan_aset_new.js", timeout=5)
        if js_response.status_code == 200:
            print("✅ sewakan_aset_new.js accessible")
            
            # Check if escapeHtml function is defined
            js_content = js_response.text
            if "function escapeHtml(" in js_content:
                print("✅ escapeHtml function found in sewakan_aset_new.js")
                
                # Check the implementation
                lines = js_content.split('\n')
                for i, line in enumerate(lines):
                    if "function escapeHtml(" in line:
                        # Show the function definition
                        func_lines = []
                        for j in range(i, min(i+15, len(lines))):
                            func_lines.append(lines[j])
                            if lines[j].strip() == '}' and j > i:
                                break
                        
                        print("📝 escapeHtml function definition:")
                        for line in func_lines:
                            print(f"   {line}")
                        break
                        
            else:
                print("❌ escapeHtml function NOT found in sewakan_aset_new.js")
        else:
            print(f"❌ sewakan_aset_new.js not accessible - Status: {js_response.status_code}")
    except Exception as e:
        print(f"❌ Error checking JS file: {e}")
    
    # Test 3: Check assets API
    try:
        assets_response = requests.get(f"{base_url}/api/assets", timeout=5)
        if assets_response.status_code == 200:
            assets_data = assets_response.json()
            total_assets = len(assets_data.get('data', []))
            print(f"✅ Assets API working - {total_assets} assets available")
            
            if total_assets > 0:
                sample_asset = assets_data['data'][0]
                print(f"📝 Sample asset: {sample_asset.get('name', 'N/A')} ({sample_asset.get('type', 'N/A')})")
        else:
            print(f"❌ Assets API error - Status: {assets_response.status_code}")
    except Exception as e:
        print(f"❌ Error checking assets API: {e}")
    
    # Test 4: Create a simple HTML test page to verify the fix
    html_test = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Quick EscapeHtml Test</title>
</head>
<body>
    <h1>Quick EscapeHtml Fix Verification</h1>
    <div id="test-output"></div>
    
    <script src="{base_url}/static/js/sewakan_aset_new.js?v=20250803110000"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {{
            const output = document.getElementById('test-output');
            
            try {{
                // Test if escapeHtml is available
                if (typeof escapeHtml === 'function') {{
                    const testString = '<script>alert("test")</script>';
                    const escaped = escapeHtml(testString);
                    output.innerHTML += '<p>✅ escapeHtml function working</p>';
                    output.innerHTML += '<p>Input: ' + testString + '</p>';
                    output.innerHTML += '<p>Output: ' + escaped + '</p>';
                }} else {{
                    output.innerHTML += '<p>❌ escapeHtml function not found</p>';
                }}
                
                // Test RentalAssetManager
                if (typeof RentalAssetManager === 'function') {{
                    output.innerHTML += '<p>✅ RentalAssetManager class available</p>';
                }} else {{
                    output.innerHTML += '<p>❌ RentalAssetManager class not found</p>';
                }}
                
            }} catch (error) {{
                output.innerHTML += '<p>❌ Error: ' + error.message + '</p>';
                console.error('Test error:', error);
            }}
        }});
    </script>
</body>
</html>
    """
    
    # Save the test HTML
    with open('quick_escapehtml_test.html', 'w', encoding='utf-8') as f:
        f.write(html_test)
    
    print("\n🔧 FIX SUMMARY:")
    print("1. Added escapeHtml function directly to sewakan_aset_new.js")
    print("2. This eliminates dependency on utils.js")
    print("3. Function should now be available when sewakan_aset_new.js loads")
    
    print("\n📝 TO VERIFY THE FIX:")
    print("1. Open: file:///c:/Users/bobok/project_KP/quick_escapehtml_test.html")
    print("2. Check that all tests show ✅ green checkmarks") 
    print("3. Login as admin: http://127.0.0.1:5000/login")
    print("4. Go to admin dashboard: http://127.0.0.1:5000/admin-dashboard")
    print("5. Click 'Sewakan Aset' - should now work without escapeHtml error")
    print("6. Open browser console (F12) to see detailed logs")

if __name__ == "__main__":
    test_escapehml_fix()
