import requests
import json

session = requests.Session()

# Login as user
login_response = session.post('http://localhost:5000/login', data={
    'email': 'arya@gmail.com',
    'password': '123'
})
print(f'Login status: {login_response.status_code}')

# Get user rental applications
response = session.get('http://localhost:5000/api/user/rental-applications')
print(f'API status: {response.status_code}')

if response.status_code == 200:
    data = response.json()
    if data['success']:
        print(f"Total applications: {len(data['data'])}")
        for app in data['data']:
            print(f"\nID: {app['id']}")
            print(f"Status: {app['status']}")
            print(f"Status Label: {app['status_label']}")
            print(f"Asset Name: {app.get('asset_details', {}).get('name', 'N/A')}")
            print(f"Created: {app.get('created_at', 'N/A')}")
            if 'can_edit' in app:
                print(f"Can Edit: {app['can_edit']}")
            if 'can_cancel' in app:
                print(f"Can Cancel: {app['can_cancel']}")
            if 'can_view_transaction' in app:
                print(f"Can View Transaction: {app['can_view_transaction']}")
    else:
        print(f'API Error: {data["error"]}')
else:
    print(f'Response: {response.text}')
    
print("\n" + "="*50)
print("Checking specific approved request #48:")

# Get specific request details
response = session.get('http://localhost:5000/api/user/rental-applications/48')
if response.status_code == 200:
    data = response.json()
    print(json.dumps(data, indent=2))
else:
    print(f'Error: {response.status_code} - {response.text}')
