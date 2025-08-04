#!/usr/bin/env python3
"""
Test Script untuk user dashboard - debugging history, timeline, dan pengajuan sewa
"""

import requests
import time

def test_user_dashboard_issues():
    print("🔍 TESTING USER DASHBOARD ISSUES")
    print("=" * 60)
    
    base_url = "http://127.0.0.1:5000"
    
    # Test 1: Verify server is running
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"✅ Server running - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Server not accessible: {e}")
        return
    
    # Test 2: Check all JS files are accessible
    js_files = [
        'utils.js',
        'dash-admin.js',
        'dashboard-user-utils.js',
        'dashboard-user-notifications.js',
        'dashboard-user-favorites.js',
        'dashboard-user-history.js',
        'dashboard-user-inline-functions.js',
        'dashboard-user-rental.js',
        'dashboard-user-stats.js',
        'dashboard-user-main.js',
        'dashboard-user-refresh.js',
        'dashboard-user-transactions.js',
        'dashboard-user-database.js',
        'favorite-handler.js',
        'favorite-notification-handler.js'
    ]
    
    print("\n📁 CHECKING JS FILES:")
    for js_file in js_files:
        try:
            js_response = requests.get(f"{base_url}/static/js/{js_file}", timeout=5)
            if js_response.status_code == 200:
                print(f"✅ {js_file} - accessible")
            else:
                print(f"❌ {js_file} - Status: {js_response.status_code}")
        except Exception as e:
            print(f"❌ {js_file} - Error: {e}")
    
    # Test 3: Check API endpoints used in user dashboard
    api_endpoints = [
        '/api/assets',
        '/api/user-favorites',
        '/api/user/rental-applications',
        '/api/user/rental-transactions',
        '/api/user/rental-transactions/dashboard-summary'
    ]
    
    print("\n🌐 CHECKING API ENDPOINTS:")
    for endpoint in api_endpoints:
        try:
            api_response = requests.get(f"{base_url}{endpoint}", timeout=5)
            status_text = "✅" if api_response.status_code in [200, 401] else "❌"
            print(f"{status_text} {endpoint} - Status: {api_response.status_code}")
            
            if api_response.status_code not in [200, 401]:
                try:
                    error_data = api_response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Raw response: {api_response.text[:100]}...")
                    
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")
    
    # Test 4: Check specific JS functions in dashboard-user-history.js
    try:
        print("\n🔍 ANALYZING dashboard-user-history.js:")
        history_js_response = requests.get(f"{base_url}/static/js/dashboard-user-history.js", timeout=5)
        if history_js_response.status_code == 200:
            js_content = history_js_response.text
            
            # Check for critical functions
            functions_to_check = [
                'loadRentalRequests',
                'updateRentalRequestsUI', 
                'updateTimelineUI',
                'DOMContentLoaded'
            ]
            
            for func in functions_to_check:
                if func in js_content:
                    print(f"✅ Function '{func}' found")
                else:
                    print(f"❌ Function '{func}' NOT found")
            
            # Check for API endpoint usage
            if '/api/user/rental-applications' in js_content:
                print("✅ Correct API endpoint '/api/user/rental-applications' found")
            else:
                print("❌ API endpoint not found or incorrect")
                
            # Check for timeline container references
            if 'timelineContainer' in js_content:
                print("✅ Timeline container references found")
            else:
                print("❌ Timeline container references NOT found")
                
        else:
            print(f"❌ Could not load dashboard-user-history.js - Status: {history_js_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error analyzing dashboard-user-history.js: {e}")
    
    # Test 5: Create HTML test page for timeline issues
    html_test = f"""
<!DOCTYPE html>
<html>
<head>
    <title>User Dashboard Timeline Test</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .test-container {{ background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
        .success {{ color: green; font-weight: bold; }}
        .error {{ color: red; font-weight: bold; }}
        pre {{ background: #f8f9fa; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; }}
    </style>
</head>
<body>
    <h1>🧪 User Dashboard Timeline Test</h1>
    
    <div class="test-container">
        <h2>Function Tests</h2>
        <div id="function-tests"></div>
    </div>
    
    <div class="test-container">
        <h2>Timeline Container Test</h2>
        <div id="timeline-test">
            <!-- Mock timeline container -->
            <div id="timelineContainer">
                <div class="text-center py-4">
                    <div class="spinner-border text-danger" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Memuat timeline aktivitas...</p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="test-container">
        <h2>Pengajuan Container Test</h2>
        <div id="pengajuan-test">
            <!-- Mock pengajuan container -->
            <div id="pengajuanContainer">
                <div class="text-center py-4">
                    <div class="spinner-border text-warning" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Memuat riwayat pengajuan...</p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="test-container">
        <h2>Console Logs</h2>
        <pre id="console-logs"></pre>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{base_url}/static/js/utils.js"></script>
    <script src="{base_url}/static/js/dashboard-user-history.js"></script>
    
    <script>
        // Override console.log to capture logs
        const originalLog = console.log;
        const originalError = console.error;
        let logs = [];
        
        console.log = function(...args) {{
            logs.push('[LOG] ' + args.join(' '));
            originalLog.apply(console, arguments);
            updateConsoleLogs();
        }};
        
        console.error = function(...args) {{
            logs.push('[ERROR] ' + args.join(' '));
            originalError.apply(console, arguments);
            updateConsoleLogs();
        }};
        
        function updateConsoleLogs() {{
            document.getElementById('console-logs').textContent = logs.join('\\n');
        }}
        
        document.addEventListener('DOMContentLoaded', function() {{
            const output = document.getElementById('function-tests');
            
            // Test function availability
            const functions = [
                'loadRentalRequests',
                'updateRentalRequestsUI',
                'updateTimelineUI'
            ];
            
            functions.forEach(funcName => {{
                const exists = typeof window[funcName] === 'function';
                const status = exists ? '✅' : '❌';
                const className = exists ? 'success' : 'error';
                output.innerHTML += `<p class="${{className}}">${{status}} ${{funcName}}: ${{exists ? 'Available' : 'Not found'}}</p>`;
            }});
            
            // Test DOM elements
            const elements = [
                'timelineContainer',
                'pengajuanContainer'
            ];
            
            elements.forEach(elemId => {{
                const elem = document.getElementById(elemId);
                const exists = elem !== null;
                const status = exists ? '✅' : '❌';
                const className = exists ? 'success' : 'error';
                output.innerHTML += `<p class="${{className}}">${{status}} Element #${{elemId}}: ${{exists ? 'Found' : 'Not found'}}</p>`;
            }});
            
            // Test API call (simulate)
            console.log('🧪 Testing timeline functionality...');
            
            setTimeout(() => {{
                if (typeof loadRentalRequests === 'function') {{
                    console.log('Testing loadRentalRequests function...');
                    // Don't actually call it to avoid authentication errors
                    output.innerHTML += '<p class="success">✅ loadRentalRequests function is callable</p>';
                }}
            }}, 1000);
        }});
    </script>
</body>
</html>
    """
    
    # Save the test HTML
    with open('user_dashboard_timeline_test.html', 'w', encoding='utf-8') as f:
        f.write(html_test)
    
    print("\n🔧 ISSUES IDENTIFIED:")
    print("1. Timeline & Pengajuan sections may not load due to authentication")
    print("2. Need to check if session is properly maintained in user dashboard")
    print("3. API endpoints expect authenticated session")
    
    print("\n📝 TO INVESTIGATE:")
    print("1. Open: file:///c:/Users/bobok/project_KP/user_dashboard_timeline_test.html")
    print("2. Login as regular user: http://127.0.0.1:5000/login")
    print("3. Go to user dashboard: http://127.0.0.1:5000/user-dashboard")
    print("4. Navigate to 'Histori Sewa' and check browser console (F12)")
    print("5. Check each tab: Semua Aktivitas, Pengajuan Sewa, Transaksi Sewa")

if __name__ == "__main__":
    test_user_dashboard_issues()
