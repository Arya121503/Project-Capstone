import requests

# Test multiple endpoints
endpoints = [
    '/api/assets',
    '/api/assets/available',
    '/admin/assets',
    '/assets'
]

for endpoint in endpoints:
    try:
        response = requests.get(f'http://127.0.0.1:5000{endpoint}', timeout=5)
        print(f'{endpoint} - Status: {response.status_code}')
        if response.status_code == 200:
            try:
                data = response.json()
                print(f'  Response type: JSON, keys: {list(data.keys())}')
            except:
                print(f'  Response type: HTML/Text, length: {len(response.text)}')
    except Exception as e:
        print(f'{endpoint} - Error: {e}')
