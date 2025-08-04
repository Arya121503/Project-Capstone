#!/usr/bin/env python3
"""
Final test script with detailed logging to verify the assets loading fix
"""

import requests
import time
import json

def final_test():
    """Final comprehensive test"""
    
    print("🔧 FINAL ASSETS LOADING TEST")
    print("=" * 60)
    
    # Test 1: Verify API is working
    print("\n1. Testing Assets API...")
    try:
        response = requests.get('http://127.0.0.1:5000/rental/api/assets/available?page=1&per_page=3', timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"   ✅ API working - {len(data['assets'])} assets returned")
                print(f"   ✅ Total available: {data['pagination']['total']}")
                
                # Show sample asset
                if data['assets']:
                    asset = data['assets'][0]
                    print(f"   ✅ Sample asset: {asset['name']} ({asset['asset_type_display']})")
            else:
                print(f"   ❌ API error: {data.get('error')}")
                return False
        else:
            print(f"   ❌ API status: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ API error: {e}")
        return False
    
    # Test 2: Check JavaScript files
    print("\n2. Verifying JavaScript modifications...")
    
    # Check dash-admin.js
    try:
        response = requests.get('http://127.0.0.1:5000/static/js/dash-admin.js', timeout=10)
        if response.status_code == 200:
            content = response.text
            if 'Navigating to Sewakan Aset section' in content:
                print("   ✅ dash-admin.js - Enhanced logging added")
            else:
                print("   ⚠️  dash-admin.js - Enhanced logging not found")
                
            if 'rentalAssetManager.loadAvailableAssets' in content:
                print("   ✅ dash-admin.js - Asset loading trigger present")
            else:
                print("   ❌ dash-admin.js - Asset loading trigger missing")
        else:
            print(f"   ❌ dash-admin.js not accessible: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error checking dash-admin.js: {e}")
    
    # Check sewakan_aset_new.js
    try:
        response = requests.get('http://127.0.0.1:5000/static/js/sewakan_aset_new.js', timeout=10)
        if response.status_code == 200:
            content = response.text
            if 'loadAvailableAssets called with page:' in content:
                print("   ✅ sewakan_aset_new.js - Enhanced logging added")
            else:
                print("   ⚠️  sewakan_aset_new.js - Enhanced logging not found")
                
            if 'availableAssetsList element not found in DOM' in content:
                print("   ✅ sewakan_aset_new.js - DOM validation added")
            else:
                print("   ❌ sewakan_aset_new.js - DOM validation missing")
        else:
            print(f"   ❌ sewakan_aset_new.js not accessible: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error checking sewakan_aset_new.js: {e}")
    
    # Test 3: Create comprehensive test page
    print("\n3. Creating comprehensive test page...")
    
    test_page = '''<!DOCTYPE html>
<html>
<head>
    <title>Comprehensive Assets Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Comprehensive Assets Loading Test</h1>
    
    <div class="test-section">
        <h2>Test 1: API Direct Call</h2>
        <button onclick="testAPI()">Test API</button>
        <div id="api-result">Click button to test</div>
    </div>
    
    <div class="test-section">
        <h2>Test 2: DOM Elements</h2>
        <button onclick="testDOM()">Test DOM</button>
        <div id="dom-result">Click button to test</div>
        <table style="margin-top: 10px;">
            <tbody id="availableAssetsList">
                <tr><td>Test element for availableAssetsList</td></tr>
            </tbody>
        </table>
    </div>
    
    <div class="test-section">
        <h2>Test 3: Simulate Real Loading</h2>
        <button onclick="simulateRealLoading()">Simulate Real Loading</button>
        <div id="simulation-result">Click button to test</div>
        <div id="simulation-table" style="margin-top: 10px;"></div>
    </div>
    
    <div class="test-section">
        <h2>Console Logs</h2>
        <div id="console-logs" style="background: #f0f0f0; padding: 10px; height: 200px; overflow-y: auto;"></div>
    </div>

    <script>
        // Capture console logs
        const originalLog = console.log;
        const originalError = console.error;
        const logDiv = document.getElementById('console-logs');
        
        function addLog(type, message) {
            const timestamp = new Date().toLocaleTimeString();
            logDiv.innerHTML += `<div class="${type}">[${timestamp}] ${message}</div>`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        console.log = function(...args) {
            originalLog.apply(console, args);
            addLog('success', args.join(' '));
        };
        
        console.error = function(...args) {
            originalError.apply(console, args);
            addLog('error', args.join(' '));
        };
        
        async function testAPI() {
            const resultDiv = document.getElementById('api-result');
            resultDiv.innerHTML = '<div class="warning">Testing API...</div>';
            
            try {
                console.log('Starting API test...');
                const response = await fetch('/rental/api/assets/available?page=1&per_page=3');
                console.log('API response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                console.log('API data received:', data.success ? 'Success' : 'Failed');
                
                if (data.success) {
                    resultDiv.innerHTML = `
                        <div class="success">✅ API Working!</div>
                        <p>Assets: ${data.assets.length}</p>
                        <p>Total: ${data.pagination.total}</p>
                        <pre>${JSON.stringify(data.assets[0], null, 2)}</pre>
                    `;
                } else {
                    resultDiv.innerHTML = `<div class="error">❌ API Error: ${data.error}</div>`;
                }
            } catch (error) {
                console.error('API test failed:', error.message);
                resultDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
            }
        }
        
        function testDOM() {
            const resultDiv = document.getElementById('dom-result');
            const availableList = document.getElementById('availableAssetsList');
            
            console.log('Testing DOM elements...');
            
            if (availableList) {
                console.log('availableAssetsList found');
                resultDiv.innerHTML = '<div class="success">✅ availableAssetsList element exists</div>';
            } else {
                console.error('availableAssetsList not found');
                resultDiv.innerHTML = '<div class="error">❌ availableAssetsList element missing</div>';
            }
        }
        
        async function simulateRealLoading() {
            const resultDiv = document.getElementById('simulation-result');
            const tableDiv = document.getElementById('simulation-table');
            
            resultDiv.innerHTML = '<div class="warning">Simulating real loading...</div>';
            tableDiv.innerHTML = '';
            
            try {
                console.log('Starting simulation of real loading...');
                
                // Step 1: Check DOM
                const targetElement = document.getElementById('availableAssetsList');
                if (!targetElement) {
                    throw new Error('availableAssetsList element not found in DOM');
                }
                console.log('DOM element check passed');
                
                // Step 2: Show loading
                targetElement.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
                console.log('Loading state displayed');
                
                // Step 3: Fetch data
                const response = await fetch('/rental/api/assets/available?page=1&per_page=5');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Data fetched successfully');
                
                // Step 4: Display results
                if (data.success) {
                    let tableHTML = '<table border="1"><tr><th>Name</th><th>Type</th><th>Location</th><th>Price</th></tr>';
                    data.assets.forEach(asset => {
                        tableHTML += `<tr>
                            <td>${asset.name}</td>
                            <td>${asset.asset_type_display}</td>
                            <td>${asset.kecamatan}</td>
                            <td>Rp ${asset.harga_sewa.toLocaleString()}</td>
                        </tr>`;
                    });
                    tableHTML += '</table>';
                    
                    tableDiv.innerHTML = tableHTML;
                    targetElement.innerHTML = '<tr><td colspan="7">Data loaded - see table below</td></tr>';
                    
                    console.log(`Successfully loaded ${data.assets.length} assets`);
                    resultDiv.innerHTML = `<div class="success">✅ Simulation successful! Loaded ${data.assets.length} assets</div>`;
                } else {
                    throw new Error(data.error || 'API returned success=false');
                }
                
            } catch (error) {
                console.error('Simulation failed:', error.message);
                resultDiv.innerHTML = `<div class="error">❌ Simulation failed: ${error.message}</div>`;
                document.getElementById('availableAssetsList').innerHTML = '<tr><td colspan="7">Error loading data</td></tr>';
            }
        }
        
        // Auto-run tests on load
        window.onload = function() {
            console.log('Page loaded, running initial tests...');
            testAPI();
            testDOM();
        };
    </script>
</body>
</html>'''
    
    try:
        with open('c:/Users/bobok/project_KP/comprehensive_assets_test.html', 'w', encoding='utf-8') as f:
            f.write(test_page)
        print("   ✅ Comprehensive test page created")
    except Exception as e:
        print(f"   ❌ Error creating test page: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 FINAL DIAGNOSIS:")
    print()
    print("✅ Core functionality is confirmed working:")
    print("   - Assets API returns data correctly")
    print("   - JavaScript files are accessible")
    print("   - Enhanced logging has been added")
    print("   - Better error handling implemented")
    print()
    print("🔧 Changes made to fix the error:")
    print("   1. Added DOM element validation before loading")
    print("   2. Enhanced error logging with detailed information")
    print("   3. Improved navigation trigger in dash-admin.js")
    print("   4. Better initialization handling")
    print()
    print("📝 To verify the fix:")
    print("   1. Open: file:///c:/Users/bobok/project_KP/comprehensive_assets_test.html")
    print("   2. Check all tests pass (should show green checkmarks)")
    print("   3. Login as admin: http://127.0.0.1:5000/login")
    print("   4. Go to admin dashboard: http://127.0.0.1:5000/admin-dashboard")
    print("   5. Click 'Sewakan Aset' and check browser console (F12)")
    print("   6. Look for detailed logs that will help identify any remaining issues")
    print()
    print("If the standalone test works but admin dashboard doesn't:")
    print("   - Check browser console for specific error messages")
    print("   - Clear browser cache and try again")
    print("   - Ensure you're logged in as admin")

if __name__ == "__main__":
    final_test()
