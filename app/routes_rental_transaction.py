from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """
    Create database connection
    """
    try:
        connection = mysql.connector.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            port=int(os.environ.get('MYSQL_PORT', 3306)),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            database=os.environ.get('MYSQL_DB', 'db_kp')
        )
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# Create blueprint
rental_transaction_bp = Blueprint('rental_transaction', __name__)

@rental_transaction_bp.route('/api/create-rental-transaction', methods=['POST'])
def create_rental_transaction():
    """
    Create a rental transaction when payment is successful
    This will add the transaction to the rented assets list in admin dashboard
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['asset_id', 'customer_email', 'start_date', 'total_months', 'monthly_price', 'total_amount']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Calculate end date
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
        end_date = start_date + timedelta(days=data['total_months'] * 30)
        
        # Get database connection
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'error': 'Database connection failed'
            }), 500
        
        cursor = connection.cursor(dictionary=True)
        
        try:
            # Get user_id from email, create dummy user if not exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (data['customer_email'],))
            user_result = cursor.fetchone()
            
            if user_result:
                user_id = user_result['id']
            else:
                # Create dummy user for payment transactions
                dummy_user_query = """
                INSERT INTO users (name, email, password, role, created_at) 
                VALUES (%s, %s, %s, %s, %s)
                """
                dummy_user_values = (
                    data.get('customer_name', 'Payment User'),
                    data['customer_email'],
                    'payment_user_dummy',  # Dummy password
                    'user',
                    datetime.now()
                )
                
                try:
                    cursor.execute(dummy_user_query, dummy_user_values)
                    user_id = cursor.lastrowid
                    print(f"Created dummy user for payment: {data['customer_email']}")
                except mysql.connector.IntegrityError:
                    # User already exists with different case or similar
                    cursor.execute("SELECT id FROM users WHERE email LIKE %s", (f"%{data['customer_email']}%",))
                    fallback_result = cursor.fetchone()
                    user_id = fallback_result['id'] if fallback_result else 1  # Use user ID 1 as fallback
            
            # Create or find rental request for this transaction
            rental_request_id = None
            
            # Try to find existing rental request for this asset and user
            cursor.execute("""
                SELECT id FROM rental_requests 
                WHERE asset_id = %s AND user_id = %s AND status IN ('pending', 'approved') 
                ORDER BY created_at DESC LIMIT 1
            """, (data['asset_id'], user_id))
            
            request_result = cursor.fetchone()
            if request_result:
                rental_request_id = request_result['id']
                print(f"Found existing rental request: {rental_request_id}")
            else:
                # Create a rental request for this payment
                try:
                    request_query = """
                    INSERT INTO rental_requests (
                        user_id, asset_id, start_date, duration_months, 
                        status, total_amount, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    request_values = (
                        user_id,
                        data['asset_id'],
                        data['start_date'],
                        data['total_months'],
                        'approved',  # Auto-approve for successful payments
                        data['total_amount'],
                        datetime.now()
                    )
                    cursor.execute(request_query, request_values)
                    rental_request_id = cursor.lastrowid
                    print(f"Created rental request: {rental_request_id}")
                except Exception as e:
                    print(f"Could not create rental request: {e}")
                    # Use a default rental request ID if available
                    cursor.execute("SELECT id FROM rental_requests LIMIT 1")
                    fallback = cursor.fetchone()
                    rental_request_id = fallback['id'] if fallback else 1
            
            # Insert into rental_transactions table with existing structure
            insert_query = """
            INSERT INTO rental_transactions (
                rental_request_id, user_id, asset_id, start_date, end_date, current_end_date,
                monthly_price, total_months, paid_amount, remaining_amount,
                status, payment_status, payment_method, midtrans_order_id, 
                midtrans_transaction_id, created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """
            
            insert_values = (
                rental_request_id,  # rental_request_id is required
                user_id,
                data['asset_id'],
                data['start_date'],
                end_date.strftime('%Y-%m-%d'),
                end_date.strftime('%Y-%m-%d'),  # current_end_date same as end_date initially
                data['monthly_price'],
                data['total_months'],
                data['total_amount'],  # paid_amount = total_amount for full payment
                0,  # remaining_amount = 0 for full payment
                'active',  # Status rental
                'paid',  # Payment status
                data.get('payment_method', 'qr_code'),
                data.get('midtrans_order_id'),
                data.get('midtrans_transaction_id'),
                datetime.now(),
                datetime.now()
            )
            
            cursor.execute(insert_query, insert_values)
            rental_id = cursor.lastrowid
            
            # Update asset status to 'rented' if needed
            try:
                update_asset_query = """
                UPDATE rental_assets 
                SET status = 'rented', 
                    updated_at = %s 
                WHERE id = %s
                """
                cursor.execute(update_asset_query, (datetime.now(), data['asset_id']))
            except Exception as e:
                print(f"Warning: Could not update asset status: {e}")
                # Don't fail the transaction creation if asset update fails
            
            connection.commit()
            
            return jsonify({
                'success': True,
                'message': 'Rental transaction created successfully',
                'rental_id': rental_id,
                'start_date': data['start_date'],
                'end_date': end_date.strftime('%Y-%m-%d'),
                'status': 'active'
            })
            
        except mysql.connector.Error as e:
            connection.rollback()
            print(f"MySQL Error: {e}")
            
            # Check if it's a duplicate entry error
            if e.errno == 1062:  # Duplicate entry
                return jsonify({
                    'success': False,
                    'error': 'Rental transaction already exists for this payment'
                }), 409
            
            return jsonify({
                'success': False,
                'error': f'Database error: {str(e)}'
            }), 500
            
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        print(f"Error creating rental transaction: {e}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@rental_transaction_bp.route('/api/rental-transactions', methods=['GET'])
def get_rental_transactions():
    """
    Get all rental transactions for admin dashboard
    """
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'error': 'Database connection failed'
            }), 500
        
        cursor = connection.cursor(dictionary=True)
        
        try:
            # Get all rental transactions with asset and user details
            query = """
            SELECT 
                rt.id, rt.asset_id, rt.user_id, rt.start_date, rt.end_date, 
                rt.current_end_date, rt.monthly_price, rt.total_months, 
                rt.paid_amount, rt.status, rt.payment_status, rt.payment_method,
                rt.midtrans_order_id, rt.created_at,
                ra.name as asset_name, ra.asset_type, ra.kecamatan as location,
                u.name as customer_name, u.email as customer_email
            FROM rental_transactions rt
            LEFT JOIN rental_assets ra ON rt.asset_id = ra.id
            LEFT JOIN users u ON rt.user_id = u.id
            ORDER BY rt.created_at DESC
            """
            
            cursor.execute(query)
            transactions = cursor.fetchall()
            
            # Format data for display
            formatted_transactions = []
            for transaction in transactions:
                formatted_transaction = {
                    'id': transaction['id'],
                    'asset_id': transaction['asset_id'],
                    'asset_name': transaction['asset_name'] or f"Asset ID {transaction['asset_id']}",
                    'asset_type': transaction['asset_type'] or 'tanah',
                    'asset_location': transaction['location'] or 'N/A',
                    'customer_name': transaction['customer_name'] or 'N/A',
                    'customer_email': transaction['customer_email'] or 'N/A',
                    'start_date': transaction['start_date'].strftime('%d/%m/%Y') if transaction['start_date'] else 'N/A',
                    'end_date': transaction['end_date'].strftime('%d/%m/%Y') if transaction['end_date'] else 'N/A',
                    'monthly_price': transaction['monthly_price'] or 0,
                    'total_months': transaction['total_months'] or 0,
                    'paid_amount': transaction['paid_amount'] or 0,
                    'status': transaction['status'] or 'active',
                    'payment_status': transaction['payment_status'] or 'paid',
                    'payment_method': transaction['payment_method'] or 'qr_code',
                    'midtrans_order_id': transaction['midtrans_order_id'] or '',
                    'created_at': transaction['created_at'].strftime('%d/%m/%Y %H:%M') if transaction['created_at'] else 'N/A'
                }
                formatted_transactions.append(formatted_transaction)
            
            return jsonify({
                'success': True,
                'transactions': formatted_transactions,
                'total': len(formatted_transactions)
            })
            
        except mysql.connector.Error as e:
            print(f"MySQL Error: {e}")
            return jsonify({
                'success': False,
                'error': f'Database error: {str(e)}'
            }), 500
            
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        print(f"Error fetching rental transactions: {e}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@rental_transaction_bp.route('/api/end-rental/<int:rental_id>', methods=['POST'])
def end_rental(rental_id):
    """
    End a rental transaction
    """
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'error': 'Database connection failed'
            }), 500
        
        cursor = connection.cursor(dictionary=True)
        
        try:
            # Update rental status to 'completed'
            update_query = """
            UPDATE rental_transactions 
            SET status = 'completed', 
                actual_end_date = %s 
            WHERE id = %s
            """
            
            cursor.execute(update_query, (datetime.now().date(), rental_id))
            
            if cursor.rowcount == 0:
                return jsonify({
                    'success': False,
                    'error': 'Rental transaction not found'
                }), 404
            
            # Get asset_id to update asset status
            cursor.execute("SELECT asset_id FROM rental_transactions WHERE id = %s", (rental_id,))
            result = cursor.fetchone()
            
            if result:
                # Update asset status back to 'available'
                try:
                    update_asset_query = """
                    UPDATE rental_assets 
                    SET status = 'available', 
                        updated_at = %s 
                    WHERE id = %s
                    """
                    cursor.execute(update_asset_query, (datetime.now(), result['asset_id']))
                except Exception as e:
                    print(f"Warning: Could not update asset status: {e}")
            
            connection.commit()
            
            return jsonify({
                'success': True,
                'message': 'Rental ended successfully'
            })
            
        except mysql.connector.Error as e:
            connection.rollback()
            print(f"MySQL Error: {e}")
            return jsonify({
                'success': False,
                'error': f'Database error: {str(e)}'
            }), 500
            
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        print(f"Error ending rental: {e}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500
