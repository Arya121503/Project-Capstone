import requests

def test_assets_api():
    """Test assets API with increased per_page"""
    
    print("🔍 Testing Assets API with per_page=1000")
    print("=" * 50)
    
    try:
        # Test API with per_page=1000
        response = requests.get('http://127.0.0.1:5000/rental/api/assets/available?per_page=1000')
        data = response.json()
        
        if data['success']:
            print(f"✅ Total assets fetched: {len(data['assets'])}")
            print(f"✅ Total in pagination: {data['pagination']['total']}")
            print(f"✅ Pages: {data['pagination']['pages']}")
            print(f"✅ Per page: {data['pagination']['per_page']}")
            
            # Test different asset types
            bangunan_count = sum(1 for asset in data['assets'] if asset['asset_type'] == 'bangunan')
            tanah_count = sum(1 for asset in data['assets'] if asset['asset_type'] == 'tanah')
            
            print(f"📊 Bangunan: {bangunan_count}")
            print(f"📊 Tanah: {tanah_count}")
            
        else:
            print(f"❌ Error: {data['error']}")
            
        # Test default API (should return only 10)
        print(f"\n🔍 Testing default API (should return 10):")
        response_default = requests.get('http://127.0.0.1:5000/rental/api/assets/available')
        data_default = response_default.json()
        
        if data_default['success']:
            print(f"✅ Default API - Total fetched: {len(data_default['assets'])}")
            print(f"✅ Default API - Per page: {data_default['pagination']['per_page']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_assets_api()
