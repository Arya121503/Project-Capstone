#!/usr/bin/env python3
"""
Test Script untuk memverifikasi fix formatCurrency error
"""

import requests
import time

def test_all_utilities_fix():
    print("🧪 TESTING ALL UTILITIES FIX")
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
            
            js_content = js_response.text
            
            # Check for all utility functions
            utilities = [
                ("escapeHtml", "function escapeHtml("),
                ("formatCurrency", "function formatCurrency("),
                ("formatDate", "function formatDate("),
                ("showNotification", "function showNotification(")
            ]
            
            for util_name, search_pattern in utilities:
                if search_pattern in js_content:
                    print(f"✅ {util_name} function found in sewakan_aset_new.js")
                else:
                    print(f"❌ {util_name} function NOT found in sewakan_aset_new.js")
                        
        else:
            print(f"❌ sewakan_aset_new.js not accessible - Status: {js_response.status_code}")
    except Exception as e:
        print(f"❌ Error checking JS file: {e}")
    
    # Test 3: Create a comprehensive HTML test
    html_test = f"""
<!DOCTYPE html>
<html>
<head>
    <title>All Utilities Fix Test</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .test-container {{ background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
        .success {{ color: green; font-weight: bold; }}
        .error {{ color: red; font-weight: bold; }}
        pre {{ background: #f8f9fa; padding: 10px; border-radius: 4px; }}
    </style>
</head>
<body>
    <h1>🧪 All Utilities Fix Verification</h1>
    <div class="test-container">
        <h2>Test Results</h2>
        <div id="test-output"></div>
    </div>
    
    <div class="test-container">
        <h2>Sample Asset with Formatting</h2>
        <div id="sample-output"></div>
    </div>
    
    <script src="{base_url}/static/js/sewakan_aset_new.js?v=20250803120000"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {{
            const output = document.getElementById('test-output');
            const sampleOutput = document.getElementById('sample-output');
            
            try {{
                // Test all utility functions
                const tests = [
                    {{
                        name: 'escapeHtml',
                        test: () => {{
                            if (typeof escapeHtml === 'function') {{
                                const result = escapeHtml('<script>alert("test")</script>');
                                return result.includes('&lt;') && result.includes('&gt;');
                            }}
                            return false;
                        }}
                    }},
                    {{
                        name: 'formatCurrency',
                        test: () => {{
                            if (typeof formatCurrency === 'function') {{
                                const result = formatCurrency(1500000);
                                return result.includes('1.500.000') || result.includes('1,500,000');
                            }}
                            return false;
                        }}
                    }},
                    {{
                        name: 'formatDate',
                        test: () => {{
                            if (typeof formatDate === 'function') {{
                                const result = formatDate('2025-08-03');
                                return result.length > 5 && !result.includes('Invalid');
                            }}
                            return false;
                        }}
                    }},
                    {{
                        name: 'showNotification',
                        test: () => {{
                            if (typeof showNotification === 'function') {{
                                const notification = showNotification('Test notification', 'success', false);
                                if (notification) {{
                                    notification.remove(); // Clean up
                                    return true;
                                }}
                            }}
                            return false;
                        }}
                    }},
                    {{
                        name: 'RentalAssetManager',
                        test: () => {{
                            return typeof RentalAssetManager === 'function';
                        }}
                    }}
                ];
                
                tests.forEach(test => {{
                    try {{
                        const result = test.test();
                        const status = result ? '✅' : '❌';
                        const className = result ? 'success' : 'error';
                        output.innerHTML += `<p class="${{className}}">${{status}} ${{test.name}}: ${{result ? 'Working' : 'Failed'}}</p>`;
                    }} catch (error) {{
                        output.innerHTML += `<p class="error">❌ ${{test.name}}: Error - ${{error.message}}</p>`;
                    }}
                }});
                
                // Test sample asset rendering with all formatting
                const sampleAsset = {{
                    id: 1,
                    name: 'Test Asset <script>alert("hack")</script>',
                    kecamatan: 'Surabaya',
                    alamat: 'Jl. Test & Co.',
                    harga_sewa: 1500000,
                    created_at: '2025-08-03T10:00:00Z'
                }};
                
                sampleOutput.innerHTML = `
                    <table border="1" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th>Field</th>
                            <th>Original</th>
                            <th>Formatted</th>
                        </tr>
                        <tr>
                            <td>Name</td>
                            <td>${{sampleAsset.name}}</td>
                            <td>${{escapeHtml(sampleAsset.name)}}</td>
                        </tr>
                        <tr>
                            <td>Harga Sewa</td>
                            <td>${{sampleAsset.harga_sewa}}</td>
                            <td>Rp ${{formatCurrency(sampleAsset.harga_sewa)}}</td>
                        </tr>
                        <tr>
                            <td>Created At</td>
                            <td>${{sampleAsset.created_at}}</td>
                            <td>${{formatDate(sampleAsset.created_at)}}</td>
                        </tr>
                    </table>
                `;
                
            }} catch (error) {{
                output.innerHTML += `<p class="error">❌ General Error: ${{error.message}}</p>`;
                console.error('Test failed:', error);
            }}
        }});
    </script>
</body>
</html>
    """
    
    # Save the test HTML
    with open('all_utilities_test.html', 'w', encoding='utf-8') as f:
        f.write(html_test)
    
    print("\n🔧 COMPREHENSIVE FIX SUMMARY:")
    print("1. ✅ Added escapeHtml function to sewakan_aset_new.js")
    print("2. ✅ Added formatCurrency function to sewakan_aset_new.js") 
    print("3. ✅ Added formatDate function to sewakan_aset_new.js")
    print("4. ✅ Added showNotification function to sewakan_aset_new.js")
    print("5. ✅ Updated all class methods to use local functions instead of window.*")
    
    print("\n📝 TO VERIFY ALL FIXES:")
    print("1. Open: file:///c:/Users/bobok/project_KP/all_utilities_test.html")
    print("2. Check that all tests show ✅ green checkmarks") 
    print("3. Login as admin: http://127.0.0.1:5000/login")
    print("4. Go to admin dashboard: http://127.0.0.1:5000/admin-dashboard")
    print("5. Click 'Sewakan Aset' - should now work without any utility errors")
    print("6. Open browser console (F12) to verify no errors")

if __name__ == "__main__":
    test_all_utilities_fix()
