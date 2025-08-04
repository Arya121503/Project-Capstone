#!/usr/bin/env python3
"""
Final comprehensive test for user assets loading
"""

import requests
import time
import json

def test_dashboard_page_loads():
    """Test that dashboard page loads correctly"""
    print("🔍 Testing dashboard page loading...")
    
    try:
        response = requests.get('http://127.0.0.1:5000/test-user-dashboard')
        print(f"✅ Dashboard status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            
            # Check critical elements
            critical_checks = [
                ('assetGrid container', 'id="assetGrid"' in content),
                ('loadAvailableAssets function call', 'loadAvailableAssets()' in content),
                ('dashboard-user-database.js', 'dashboard-user-database.js' in content),
                ('Bootstrap CSS', 'bootstrap' in content),
                ('Font Awesome', 'font-awesome' in content or 'fontawesome' in content),
                ('Asset loading indicator', 'assetLoadingIndicator' in content),
                ('Total aset element', 'totalAset' in content)
            ]
            
            print("\n📋 Critical elements check:")
            all_good = True
            for check_name, result in critical_checks:
                status = "✅" if result else "❌"
                print(f"   {status} {check_name}: {result}")
                if not result:
                    all_good = False
            
            if all_good:
                print("✅ All critical elements present")
            else:
                print("❌ Some critical elements missing")
                
            return all_good
            
    except Exception as e:
        print(f"❌ Error testing dashboard: {e}")
        return False

def test_api_endpoints():
    """Test all API endpoints used by the dashboard"""
    print(f"\n🔍 Testing API endpoints...")
    
    endpoints = [
        ('/api/assets', 'Main assets endpoint'),
        ('/api/assets/available', 'Available assets endpoint'),
        ('/rental/api/assets/available', 'Rental assets endpoint')
    ]
    
    api_results = {}
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f'http://127.0.0.1:5000{endpoint}')
            print(f"📍 {description}: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if 'success' in data and data['success']:
                    assets = data.get('data') or data.get('assets', [])
                    print(f"   ✅ Assets available: {len(assets)}")
                    
                    if assets:
                        api_results[endpoint] = {
                            'status': 'success',
                            'count': len(assets),
                            'sample_asset': assets[0]
                        }
                    else:
                        api_results[endpoint] = {'status': 'no_data'}
                else:
                    api_results[endpoint] = {'status': 'error', 'data': data}
            else:
                api_results[endpoint] = {'status': 'http_error', 'code': response.status_code}
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            api_results[endpoint] = {'status': 'exception', 'error': str(e)}
    
    return api_results

def test_javascript_files():
    """Test JavaScript files accessibility and content"""
    print(f"\n🔍 Testing JavaScript files...")
    
    js_files = [
        '/static/js/dashboard-user-database.js',
        '/static/js/dashboard-user-assets-interactive.js',
        '/static/js/dashboard-user-inline-functions.js',
        '/static/js/dashboard-user-rental.js'
    ]
    
    js_results = {}
    
    for js_file in js_files:
        try:
            response = requests.get(f'http://127.0.0.1:5000{js_file}')
            print(f"📄 {js_file.split('/')[-1]}: {response.status_code}")
            
            if response.status_code == 200:
                content = response.text
                
                # Check for key functions
                functions = [
                    'loadAvailableAssets',
                    'displayAssets', 
                    'createAssetCard',
                    'showAsetDetail',
                    'showRentalForm'
                ]
                
                found_functions = []
                for func in functions:
                    if func in content:
                        found_functions.append(func)
                        print(f"   ✅ Contains {func}")
                
                js_results[js_file] = {
                    'status': 'success',
                    'functions': found_functions
                }
            else:
                js_results[js_file] = {'status': 'error', 'code': response.status_code}
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            js_results[js_file] = {'status': 'exception', 'error': str(e)}
    
    return js_results

def test_data_flow():
    """Test the complete data flow from API to frontend"""
    print(f"\n🔍 Testing complete data flow...")
    
    # Test the exact endpoint used by dashboard-user-database.js
    try:
        response = requests.get('http://127.0.0.1:5000/rental/api/assets/available')
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"✅ API Response received")
            print(f"   Success: {data.get('success')}")
            
            # Get assets (handle both 'data' and 'assets' field names)
            assets = data.get('data') or data.get('assets', [])
            print(f"   Assets count: {len(assets)}")
            
            if assets:
                # Check asset data structure
                sample_asset = assets[0]
                
                required_fields = ['id', 'name', 'asset_type', 'kecamatan', 'harga_sewa']
                missing_fields = []
                
                for field in required_fields:
                    if field not in sample_asset or sample_asset[field] is None:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ⚠️  Missing required fields: {missing_fields}")
                else:
                    print(f"   ✅ All required fields present")
                
                # Check data quality
                quality_issues = []
                
                # Check name/address
                if not sample_asset.get('name') and not sample_asset.get('alamat'):
                    quality_issues.append('No name or address')
                
                # Check price
                price = sample_asset.get('harga_sewa')
                if not price or not isinstance(price, (int, float)) or price <= 0:
                    quality_issues.append('Invalid price')
                
                # Check location
                if not sample_asset.get('kecamatan'):
                    quality_issues.append('No location data')
                
                if quality_issues:
                    print(f"   ⚠️  Data quality issues: {quality_issues}")
                else:
                    print(f"   ✅ Data quality good")
                
                return {
                    'status': 'success',
                    'count': len(assets),
                    'quality_good': len(quality_issues) == 0
                }
            else:
                print(f"   ❌ No assets returned")
                return {'status': 'no_data'}
        else:
            print(f"   ❌ API error: {response.status_code}")
            return {'status': 'api_error', 'code': response.status_code}
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return {'status': 'exception', 'error': str(e)}

def run_comprehensive_test():
    """Run all tests and provide summary"""
    print("🚀 Running comprehensive user assets loading test...")
    print("=" * 70)
    
    # Run all tests
    dashboard_ok = test_dashboard_page_loads()
    api_results = test_api_endpoints()
    js_results = test_javascript_files()
    data_flow_result = test_data_flow()
    
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    
    # Dashboard
    print(f"🌐 Dashboard Page: {'✅ PASS' if dashboard_ok else '❌ FAIL'}")
    
    # APIs
    api_success = sum(1 for result in api_results.values() if result.get('status') == 'success')
    api_total = len(api_results)
    print(f"🔌 API Endpoints: {'✅ PASS' if api_success == api_total else f'⚠️  {api_success}/{api_total}'}")
    
    # JavaScript
    js_success = sum(1 for result in js_results.values() if result.get('status') == 'success')
    js_total = len(js_results)
    print(f"📜 JavaScript Files: {'✅ PASS' if js_success == js_total else f'⚠️  {js_success}/{js_total}'}")
    
    # Data Flow
    data_flow_ok = data_flow_result.get('status') == 'success' and data_flow_result.get('quality_good', False)
    print(f"🔄 Data Flow: {'✅ PASS' if data_flow_ok else '❌ FAIL'}")
    
    # Overall status
    all_pass = dashboard_ok and api_success == api_total and js_success == js_total and data_flow_ok
    
    print(f"\n🎯 OVERALL STATUS: {'✅ ALL SYSTEMS GO' if all_pass else '⚠️  ISSUES DETECTED'}")
    
    if all_pass:
        print(f"\n💡 RECOMMENDATION:")
        print(f"   - User assets should load correctly in the dashboard")
        print(f"   - All JavaScript functions are available") 
        print(f"   - All API endpoints are working")
        print(f"   - Data quality is good")
        print(f"   - Test with actual user login to confirm end-to-end functionality")
    else:
        print(f"\n💡 NEXT STEPS:")
        if not dashboard_ok:
            print(f"   - Fix dashboard page loading issues")
        if api_success < api_total:
            print(f"   - Fix API endpoint issues")
        if js_success < js_total:
            print(f"   - Fix JavaScript file issues")
        if not data_flow_ok:
            print(f"   - Fix data flow or quality issues")

if __name__ == "__main__":
    run_comprehensive_test()
