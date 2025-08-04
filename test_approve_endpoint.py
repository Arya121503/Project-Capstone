import requests
from app import create_app, mysql

session = requests.Session()

# Login as admin
login_response = session.post('http://localhost:5000/login', data={
    'email': 'admin@example.com',
    'password': 'admin123'
})
print(f'Admin login status: {login_response.status_code}')

# Check pending request first
app = create_app()
with app.app_context():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, status FROM rental_requests WHERE status = 'pending' ORDER BY id DESC LIMIT 1")
    pending_req = cur.fetchone()
    if pending_req:
        print(f'Found pending request: ID {pending_req[0]}, Status: {pending_req[1]}')
        
        # Test approve
        response = session.post(f'http://localhost:5000/api/admin/approve-rental-request/{pending_req[0]}', 
                              json={'admin_notes': 'Test approval'})
        print(f'Approve response: {response.status_code}')
        print(f'Response: {response.text}')
        
        # Check status after
        cur.execute(f'SELECT id, status FROM rental_requests WHERE id = {pending_req[0]}')
        updated_req = cur.fetchone()
        print(f'Updated status: ID {updated_req[0]}, Status: {updated_req[1]}')
    else:
        print('No pending requests found')
    cur.close()
