import requests
import sys
sys.path.append('.')
from app.models_sqlalchemy import RentalRequest
from app import create_app

def test_rental_payment():
    """Test rental payment functionality"""
    
    print("🔍 Testing Rental Payment Functionality")
    print("=" * 50)
    
    app = create_app()
    with app.app_context():
        # Find an approved rental request
        approved_request = RentalRequest.query.filter_by(status='approved').first()
        
        if not approved_request:
            print("❌ No approved rental requests found")
            return
            
        print(f"✅ Found approved request #{approved_request.id}")
        print(f"   Asset: {approved_request.asset_name}")
        print(f"   User: {approved_request.user_name}")
        print(f"   Total: Rp {approved_request.total_harga or approved_request.total_price}")
        
    # Test payment endpoint (this would normally require login session)
    try:
        print(f"\n🔍 Testing payment endpoint...")
        
        # Create a mock session for testing
        session = requests.Session()
        
        # Test the payment endpoint
        response = session.post(f'http://127.0.0.1:5000/api/rental-payment/{approved_request.id}')
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 401:
            print("⚠️  Payment endpoint requires authentication (expected)")
        elif response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Payment endpoint working!")
                print(f"   Snap token: {data.get('snap_token', 'N/A')[:20]}...")
                print(f"   Order ID: {data.get('order_id')}")
            else:
                print(f"❌ Payment failed: {data.get('error')}")
        else:
            print(f"❌ Unexpected status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Error testing payment: {e}")
    
    print(f"\n🎯 Manual Test Instructions:")
    print(f"1. Login to dashboard: http://127.0.0.1:5000/test-user-dashboard")
    print(f"2. Go to 'Riwayat Pengajuan Sewa' tab")
    print(f"3. Look for 'Approved' status requests")
    print(f"4. Click 'Bayar Sekarang' button")
    print(f"5. Complete payment via Midtrans")

if __name__ == "__main__":
    test_rental_payment()
