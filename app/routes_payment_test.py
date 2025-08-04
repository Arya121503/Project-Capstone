from flask import Blueprint, request, jsonify
import midtransclient
from datetime import datetime
import uuid

# Create simple Blueprint for payment
payment_bp = Blueprint('payment_test', __name__)

# Midtrans Configuration dengan API key baru
MIDTRANS_SERVER_KEY = 'SB-Mid-server-LIonO2Yv2RaQIFsLcBpWH_jO'
MIDTRANS_CLIENT_KEY = 'SB-Mid-client-Qda8j_JcCCIAoyKc'
MIDTRANS_IS_PRODUCTION = False

# Initialize Midtrans Snap
snap = midtransclient.Snap(
    is_production=MIDTRANS_IS_PRODUCTION,
    server_key=MIDTRANS_SERVER_KEY,
    client_key=MIDTRANS_CLIENT_KEY
)

@payment_bp.route('/api/test-payment', methods=['POST'])
def test_payment():
    """Simple test payment endpoint yang langsung generate QR Code"""
    try:
        data = request.get_json()
        
        # Generate unique order ID
        order_id = f"TEST-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}"
        
        # Amount dari frontend atau default 50000
        amount = int(data.get('total_amount', 50000))
        
        # Transaction data untuk Midtrans
        transaction_data = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": amount
            },
            "credit_card": {
                "secure": True
            },
            "customer_details": {
                "first_name": data.get('customer_name', 'Test User'),
                "email": data.get('customer_email', 'test@example.com'),
                "phone": data.get('customer_phone', '081234567890')
            },
            "item_details": [{
                "id": "test-item-1",
                "price": amount,
                "quantity": 1,
                "name": data.get('item_name', 'Test Payment'),
                "category": "Test"
            }],
            "callbacks": {
                "finish": f"{request.host_url}payment/finish"
            }
        }
        
        print(f"Creating payment with data: {transaction_data}")
        
        # Create transaction menggunakan Midtrans Snap
        transaction_response = snap.create_transaction(transaction_data)
        
        print(f"Midtrans response: {transaction_response}")
        
        return jsonify({
            'success': True,
            'token': transaction_response['token'],
            'redirect_url': transaction_response.get('redirect_url', ''),
            'order_id': order_id,
            'message': 'QR Code payment token berhasil dibuat!'
        })
        
    except Exception as e:
        print(f"Error creating test payment: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Payment error: {str(e)}',
            'message': 'Gagal membuat QR Code payment'
        }), 400
