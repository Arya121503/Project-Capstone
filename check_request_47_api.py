import requests

try:
    response = requests.get('http://localhost:5000/api/user-rental-requests')
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            requests_list = data.get('data', [])
            request_47 = next((r for r in requests_list if r['id'] == 47), None)
            if request_47:
                print('✅ Request #47 ditemukan:')
                print(f'   ID: {request_47["id"]}')
                print(f'   Asset: {request_47.get("asset_name", "N/A")}')
                print(f'   Status: {request_47["status"]}')
                print(f'   User: {request_47.get("user_name", "N/A")}')
                print(f'   Total: Rp {request_47.get("total_price", 0):,.0f}')
                print(f'   Admin Notes: {request_47.get("admin_notes", "N/A")}')
            else:
                print('❌ Request #47 tidak ditemukan dalam response API')
                print(f'Total requests found: {len(requests_list)}')
                if requests_list:
                    print('Available request IDs:', [r.get('id') for r in requests_list[:10]])
        else:
            print(f'❌ API error: {data.get("error", "Unknown")}')
    else:
        print(f'❌ HTTP Error: {response.status_code}')
except Exception as e:
    print(f'❌ Error: {e}')
