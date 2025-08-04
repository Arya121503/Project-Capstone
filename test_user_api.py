import requests
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
        for app in data['data']:
            print(f'ID: {app["id"]}, Status: {app["status"]}, Label: {app["status_label"]}')
    else:
        print(f'API Error: {data["error"]}')
else:
    print(f'Response: {response.text}')
