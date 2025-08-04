from flask import Blueprint, request, jsonify, current_app, session
from datetime import datetime, date
import json
import uuid
import hashlib
import hmac
import base64
import midtransclient
from app import mysql

# Create Blueprint
midtrans_bp = Blueprint('midtrans', __name__)

# Midtrans Configuration
MIDTRANS_SERVER_KEY = 'SB-Mid-server-LIonO2Yv2RaQIFsLcBpWH_jO'
MIDTRANS_CLIENT_KEY = 'SB-Mid-client-Qda8j_JcCCIAoyKc'
MIDTRANS_MERCHANT_ID = 'G343890589'
MIDTRANS_IS_PRODUCTION = False  # Set to True for production

# Initialize Midtrans Snap
snap = midtransclient.Snap(
    is_production=MIDTRANS_IS_PRODUCTION,
    server_key=MIDTRANS_SERVER_KEY,
    client_key=MIDTRANS_CLIENT_KEY
)

# Initialize Midtrans Core API for status checking
core_api = midtransclient.CoreApi(
    is_production=MIDTRANS_IS_PRODUCTION,
    server_key=MIDTRANS_SERVER_KEY,
    client_key=MIDTRANS_CLIENT_KEY
)

def create_signature(order_id, status_code, gross_amount, server_key):
    """Create signature for Midtrans verification"""
    signature_string = f"{order_id}{status_code}{gross_amount}{server_key}"
    signature = hashlib.sha512(signature_string.encode('utf-8')).hexdigest()
    return signature

def require_login():
    """Simple login check"""
    if 'user_id' not in session:
        return False
    return True

def get_current_user():
    """Get current user from session"""
    if 'user_id' not in session:
        return None
    
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, name, email, phone FROM users WHERE id = %s", (session['user_id'],))
    user_data = cursor.fetchone()
    cursor.close()
    
    if user_data:
        return {
            'id': user_data[0],
            'name': user_data[1],
            'email': user_data[2],
            'phone': user_data[3]
        }
    return None

@midtrans_bp.route('/api/midtrans/create-payment', methods=['POST'])
def create_payment():
    """Create Midtrans payment token"""
    try:
        # Check if user is logged in
        if not require_login():
            return jsonify({
                'success': False,
                'error': 'Please login first'
            }), 401
        
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 401
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['asset_id', 'asset_name', 'total_amount', 'total_months', 'start_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Field {field} is required'
                }), 400
        
        # Generate unique order ID
        order_id = f"RENT-{current_user['id']}-{data['asset_id']}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Get asset information - use fallback if database unavailable
        asset_data = None
        try:
            if mysql.connection:
                cursor = mysql.connection.cursor()
                cursor.execute("SELECT id, name, status FROM rental_assets WHERE id = %s", (data['asset_id'],))
                asset_data = cursor.fetchone()
                cursor.close()
        except Exception as db_error:
            current_app.logger.warning(f"MySQL connection error: {str(db_error)}")
            # Continue with fallback data
        
        if not asset_data:
            # Use data from frontend as fallback
            current_app.logger.info(f"Using frontend data for asset_id: {data['asset_id']}")
            asset_data = {
                'id': data['asset_id'],
                'name': data.get('asset_name', f"Asset {data['asset_id']}"),
                'status': 'tersedia'
            }
        
        # Prepare Midtrans transaction data
        transaction_data = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": int(data['total_amount'])
            },
            "credit_card": {
                "secure": True
            },
            "customer_details": {
                "first_name": current_user['name'],
                "email": current_user['email'],
                "phone": current_user['phone'] or ""
            },
            "item_details": [{
                "id": f"asset-{data['asset_id']}",
                "price": int(data['total_amount']),
                "quantity": 1,
                "name": f"Sewa {data['asset_name']} - {data['total_months']} bulan",
                "category": "Property Rental"
            }],
            "callbacks": {
                "finish": f"{request.host_url}payment/finish"
            }
        }
        
        try:
            # Create proper transaction for real Midtrans
            transaction_data = {
                "transaction_details": {
                    "order_id": order_id,
                    "gross_amount": int(data['total_amount'])
                },
                "credit_card": {
                    "secure": True
                },
                "customer_details": {
                    "first_name": current_user.get('name', 'User'),
                    "email": current_user.get('email', 'user@example.com'),
                    "phone": current_user.get('phone', '081234567890')
                },
                "item_details": [{
                    "id": f"asset-{data['asset_id']}",
                    "price": int(data['total_amount']),
                    "quantity": 1,
                    "name": f"Sewa {asset_data.get('name', 'Asset')} - {data['total_months']} bulan",
                    "category": "Property Rental"
                }],
                "callbacks": {
                    "finish": f"{request.host_url}payment/finish"
                }
            }
            
            # Create transaction using Midtrans Snap
            transaction_response = snap.create_transaction(transaction_data)
            
            return jsonify({
                'success': True,
                'token': transaction_response['token'],
                'redirect_url': transaction_response.get('redirect_url', ''),
                'order_id': order_id
            })
            
        except Exception as midtrans_error:
            current_app.logger.error(f"Midtrans API error: {str(midtrans_error)}")
            return jsonify({
                'success': False,
                'error': f"Payment gateway error: {str(midtrans_error)}"
            }), 400
            
    except Exception as e:
        current_app.logger.error(f"Error creating Midtrans payment: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@midtrans_bp.route('/api/midtrans/verify-payment', methods=['POST'])
def verify_payment():
    """Verify payment and create rental transaction"""
    try:
        # Check if user is logged in
        if not require_login():
            return jsonify({
                'success': False,
                'error': 'Please login first'
            }), 401
        
        current_user = get_current_user()
        if not current_user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 401
        
        data = request.get_json()
        payment_result = data.get('payment_result', {})
        order_id = payment_result.get('order_id')
        
        if not order_id:
            return jsonify({
                'success': False,
                'error': 'Order ID not found in payment result'
            }), 400
        
        # Check payment status from Midtrans using Core API
        try:
            status_response = core_api.transactions.status(order_id)
            
            transaction_status = status_response.get('transaction_status')
            fraud_status = status_response.get('fraud_status')
            
            # Check if payment is successful
            if transaction_status in ['capture', 'settlement'] and fraud_status == 'accept':
                # Get asset information
                cursor = mysql.connection.cursor()
                cursor.execute("SELECT id, name, status FROM rental_assets WHERE id = %s", (data['asset_id'],))
                asset_data = cursor.fetchone()
                
                if not asset_data:
                    cursor.close()
                    return jsonify({
                        'success': False,
                        'error': 'Asset not found'
                    }), 404
                
                # Parse dates
                start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
                end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
                
                # Create rental transaction in database
                cursor.execute("""
                    INSERT INTO rental_transactions 
                    (user_id, asset_id, start_date, end_date, current_end_date, total_months, 
                     monthly_price, paid_amount, remaining_amount, status, payment_status, 
                     payment_method, midtrans_order_id, midtrans_transaction_id, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    current_user['id'],
                    data['asset_id'],
                    start_date,
                    end_date,
                    end_date,  # current_end_date same as end_date initially
                    data['total_months'],
                    data['monthly_price'],
                    data['total_amount'],  # paid_amount (paid in full)
                    0.0,  # remaining_amount (paid in full, so 0)
                    'active',
                    'paid',
                    'midtrans',
                    order_id,
                    status_response.get('transaction_id'),
                    datetime.utcnow()
                ))
                
                # Get the inserted transaction ID
                transaction_id = cursor.lastrowid
                
                # Update asset status to rented
                cursor.execute("UPDATE rental_assets SET status = 'rented' WHERE id = %s", (data['asset_id'],))
                
                # Commit the transaction
                mysql.connection.commit()
                cursor.close()
                
                return jsonify({
                    'success': True,
                    'message': 'Payment verified and rental transaction created',
                    'transaction_id': transaction_id
                })
            
            else:
                return jsonify({
                    'success': False,
                    'error': f'Payment not successful. Status: {transaction_status}, Fraud: {fraud_status}'
                }), 400
                
        except Exception as midtrans_error:
            current_app.logger.error(f"Error checking payment status: {str(midtrans_error)}")
            return jsonify({
                'success': False,
                'error': f'Payment verification failed: {str(midtrans_error)}'
            }), 400
            
    except Exception as e:
        current_app.logger.error(f"Error verifying payment: {str(e)}")
        # Rollback on error
        try:
            mysql.connection.rollback()
        except:
            pass
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@midtrans_bp.route('/api/midtrans/notification', methods=['POST'])
def payment_notification():
    """Handle Midtrans payment notification (webhook)"""
    try:
        notification_data = request.get_json()
        
        order_id = notification_data.get('order_id')
        status_code = notification_data.get('status_code')
        gross_amount = notification_data.get('gross_amount')
        signature_key = notification_data.get('signature_key')
        
        # Verify signature
        expected_signature = create_signature(order_id, status_code, gross_amount, MIDTRANS_SERVER_KEY)
        
        if signature_key != expected_signature:
            current_app.logger.warning(f"Invalid signature for order {order_id}")
            return jsonify({'status': 'error', 'message': 'Invalid signature'}), 400
        
        # Process the notification
        transaction_status = notification_data.get('transaction_status')
        fraud_status = notification_data.get('fraud_status')
        
        # Find the rental transaction
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT id, user_id, asset_id, payment_status, status 
            FROM rental_transactions 
            WHERE midtrans_order_id = %s
        """, (order_id,))
        transaction_data = cursor.fetchone()
        
        if transaction_data:
            transaction_id, user_id, asset_id, current_payment_status, current_status = transaction_data
            
            if transaction_status in ['capture', 'settlement']:
                if fraud_status == 'accept':
                    # Payment successful
                    cursor.execute("""
                        UPDATE rental_transactions 
                        SET payment_status = 'paid', status = 'active' 
                        WHERE id = %s
                    """, (transaction_id,))
                    
                    # Update asset status
                    cursor.execute("""
                        UPDATE rental_assets 
                        SET status = 'rented' 
                        WHERE id = %s
                    """, (asset_id,))
                        
            elif transaction_status in ['cancel', 'deny', 'expire']:
                # Payment failed
                cursor.execute("""
                    UPDATE rental_transactions 
                    SET payment_status = 'failed', status = 'cancelled' 
                    WHERE id = %s
                """, (transaction_id,))
                
                # Update asset status back to available
                cursor.execute("""
                    UPDATE rental_assets 
                    SET status = 'available' 
                    WHERE id = %s
                """, (asset_id,))
                    
            elif transaction_status == 'pending':
                # Payment pending
                cursor.execute("""
                    UPDATE rental_transactions 
                    SET payment_status = 'pending', status = 'pending' 
                    WHERE id = %s
                """, (transaction_id,))
            
            mysql.connection.commit()
        
        cursor.close()
        return jsonify({'status': 'success'})
        
    except Exception as e:
        current_app.logger.error(f"Error processing Midtrans notification: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

@midtrans_bp.route('/payment/finish')
def payment_finish():
    """Handle payment finish redirect"""
    order_id = request.args.get('order_id')
    status_code = request.args.get('status_code')
    transaction_status = request.args.get('transaction_status')
    
    # You can redirect to a success page or back to dashboard
    if transaction_status in ['capture', 'settlement']:
        return f"""
        <html>
        <head>
            <title>Pembayaran Berhasil</title>
            <script>
                alert('Pembayaran berhasil! Transaksi sewa Anda telah aktif.');
                window.close();
            </script>
        </head>
        <body>
            <h1>Pembayaran Berhasil</h1>
            <p>Terima kasih! Pembayaran Anda telah berhasil diproses.</p>
            <p>Order ID: {order_id}</p>
        </body>
        </html>
        """
    else:
        return f"""
        <html>
        <head>
            <title>Pembayaran Gagal</title>
            <script>
                alert('Pembayaran gagal atau dibatalkan.');
                window.close();
            </script>
        </head>
        <body>
            <h1>Pembayaran Gagal</h1>
            <p>Pembayaran gagal atau dibatalkan.</p>
            <p>Order ID: {order_id}</p>
        </body>
        </html>
        """
