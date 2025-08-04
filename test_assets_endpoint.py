import requests

try:
    response = requests.get('http://127.0.0.1:5000/api/assets/available', timeout=5)
    print(f'Available Assets - Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Total assets: {len(data.get("data", []))}')
    else:
        print(f'Response: {response.text[:200]}')
except Exception as e:
    print(f'Error: {e}')
