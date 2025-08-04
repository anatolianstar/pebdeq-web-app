from flask import Blueprint, request, jsonify
from app.models.models import Order, OrderItem, User, Product, Cart, CartItem, UserAddress
from app import db
import jwt
import os
from functools import wraps
from datetime import datetime, timedelta
import uuid
import string
import random

orders_bp = Blueprint('orders', __name__)

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token required'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, os.environ.get('SECRET_KEY') or 'dev-secret-key', algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
            
            return f(current_user, *args, **kwargs)
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token required'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, os.environ.get('SECRET_KEY') or 'dev-secret-key', algorithms=['HS256'])
            user = User.query.get(data['user_id'])
            
            if not user or not user.is_admin:
                return jsonify({'error': 'Admin access required'}), 403
            
            return f(*args, **kwargs)
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated_function

def generate_order_number():
    """Generate a unique order number"""
    timestamp = datetime.now().strftime('%Y%m%d')
    random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{timestamp}-{random_chars}"

@orders_bp.route('/orders/create', methods=['POST'])
@token_required
def create_order(current_user):
    try:
        # Safely get JSON data
        try:
            data = request.get_json()
        except Exception as json_error:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if not data.get('shipping_address_id'):
            return jsonify({'error': 'Shipping address is required'}), 400
        
        if not data.get('payment_method'):
            return jsonify({'error': 'Payment method is required'}), 400
        
        # Get user's cart
        cart = Cart.query.filter_by(user_id=current_user.id).first()
        if not cart or not cart.items:
            return jsonify({'error': 'Cart is empty'}), 400
        
        # Get shipping address
        shipping_address = UserAddress.query.filter_by(
            id=data['shipping_address_id'], 
            user_id=current_user.id
        ).first()
        
        if not shipping_address:
            return jsonify({'error': 'Shipping address not found'}), 400
        
        # Calculate totals
        subtotal = sum(item.price * item.quantity for item in cart.items)
        shipping_cost = 10.0 if subtotal < 100 else 0.0  # Free shipping over $100
        tax_amount = (subtotal + shipping_cost) * 0.18  # 18% tax
        total_amount = subtotal + shipping_cost + tax_amount
        
        # Create order
        order = Order(
            order_number=generate_order_number(),
            user_id=current_user.id,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax_amount=tax_amount,
            total_amount=total_amount,
            status='pending',
            payment_method=data['payment_method'],
            payment_status='pending' if data['payment_method'] == 'credit_card' else 'cash_on_delivery',
            shipping_address_id=data['shipping_address_id'],
            billing_address_id=data.get('billing_address_id', data['shipping_address_id']),
            notes=data.get('notes', '')
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Create order items
        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price=cart_item.price,
                product_name=cart_item.product.name if cart_item.product else f"Product {cart_item.product_id}",
                product_slug=cart_item.product.slug if cart_item.product else None
            )
            db.session.add(order_item)
        
        # Clear cart
        CartItem.query.filter_by(cart_id=cart.id).delete()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/user/orders', methods=['GET'])
@token_required
def get_user_orders(current_user):
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get user's orders
        orders_query = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc())
        
        # Count total orders
        total_orders = orders_query.count()
        
        # Apply pagination
        orders = orders_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Format orders for response
        orders_data = []
        for order in orders.items:
            order_data = {
                'id': order.id,
                'order_number': order.order_number,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'payment_status': order.payment_status,
                'payment_method': order.payment_method,
                'created_at': order.created_at.isoformat(),
                'updated_at': order.updated_at.isoformat() if order.updated_at else None,
                'shipping_address': {
                    'full_name': order.shipping_full_name,
                    'address_line_1': order.shipping_address_line_1,
                    'address_line_2': order.shipping_address_line_2,
                    'city': order.shipping_city,
                    'state': order.shipping_state,
                    'postal_code': order.shipping_postal_code,
                    'country': order.shipping_country,
                    'phone': order.shipping_phone
                },
                'items': []
            }
            
            # Add order items
            for item in order.items:
                product = item.product
                item_data = {
                    'id': item.id,
                    'product_id': product.id,
                    'product_name': product.name,
                    'product_image': product.image_url,
                    'quantity': item.quantity,
                    'price': float(item.price),
                    'total': float(item.quantity * item.price)
                }
                order_data['items'].append(item_data)
            
            orders_data.append(order_data)
        
        return jsonify({
            'success': True,
            'orders': orders_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_orders,
                'pages': orders.pages,
                'has_next': orders.has_next,
                'has_prev': orders.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching orders: {str(e)}'
        }), 500

@orders_bp.route('/user/orders/<int:order_id>', methods=['GET'])
@token_required
def get_user_order(current_user, order_id):
    try:
        order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify({'order': order.to_dict()})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders', methods=['GET'])
@admin_required
def get_orders():
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get filter parameters
        status_filter = request.args.get('status', '')
        payment_status_filter = request.args.get('payment_status', '')
        search_term = request.args.get('search', '')
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        # Build query
        query = Order.query.join(User, Order.user_id == User.id)
        
        # Apply filters
        if status_filter:
            query = query.filter(Order.status == status_filter)
        
        if payment_status_filter:
            query = query.filter(Order.payment_status == payment_status_filter)
        
        if search_term:
            query = query.filter(
                db.or_(
                    Order.order_number.ilike(f'%{search_term}%'),
                    User.email.ilike(f'%{search_term}%'),
                    User.first_name.ilike(f'%{search_term}%'),
                    User.last_name.ilike(f'%{search_term}%')
                )
            )
        
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d')
                query = query.filter(Order.created_at >= from_date)
            except ValueError:
                pass
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d')
                # Add 1 day to include the entire day
                to_date = to_date + timedelta(days=1)
                query = query.filter(Order.created_at < to_date)
            except ValueError:
                pass
        
        # Order by creation date (newest first)
        query = query.order_by(Order.created_at.desc())
        
        # Get total count before pagination
        total_orders = query.count()
        
        # Apply pagination
        orders_paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Format response
        orders_data = []
        for order in orders_paginated.items:
            order_data = order.to_dict()
            # Add user information
            if order.user:
                order_data['user'] = {
                    'id': order.user.id,
                    'first_name': order.user.first_name,
                    'last_name': order.user.last_name,
                    'email': order.user.email,
                    'phone': order.user.phone
                }
            orders_data.append(order_data)
        
        return jsonify({
            'orders': orders_data,
            'page': page,
            'per_page': per_page,
            'total': total_orders,
            'pages': orders_paginated.pages,
            'has_next': orders_paginated.has_next,
            'has_prev': orders_paginated.has_prev
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
@admin_required
def get_order_details(order_id):
    try:
        order = Order.query.get_or_404(order_id)
        order_data = order.to_dict()
        
        # Add user information
        if order.user:
            order_data['user'] = {
                'id': order.user.id,
                'first_name': order.user.first_name,
                'last_name': order.user.last_name,
                'email': order.user.email,
                'phone': order.user.phone
            }
        
        return jsonify({'order': order_data})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/<int:order_id>', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    try:
        order = Order.query.get_or_404(order_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Store old statuses for comparison
        old_status = order.status
        old_payment_status = order.payment_status
        
        # Update order status
        if 'status' in data:
            order.status = data['status']
        
        # Update payment status
        if 'payment_status' in data:
            order.payment_status = data['payment_status']
        
        db.session.commit()
        
        # Send automatic emails based on status changes
        try:
            from app.utils.email_service import get_email_service
            email_service = get_email_service()
            
            # Order status change emails
            if 'status' in data and data['status'] != old_status:
                new_status = data['status']
                
                if new_status == 'processing' and old_status == 'pending':
                    # Order confirmed and processing - use the full order confirmation email
                    email_service.send_order_confirmation(order.id)
                    
                elif new_status == 'shipped':
                    # Order shipped
                    email_service.send_email(
                        recipient_email=order.user.email if order.user else None,
                        subject=f'Your Order #{order.id} Has Shipped!',
                        template_name='shipping_notification',
                        template_variables={
                            'user_name': order.user.first_name if order.user else 'Customer',
                            'order_id': order.id,
                            'tracking_number': 'Will be provided soon',
                            'estimated_delivery': 'Within 3-5 business days',
                            'tracking_url': f'http://localhost:3000/orders/{order.id}/tracking'
                        },
                        email_type='shipping',
                        user_id=order.user_id,
                        order_id=order.id,
                        priority=1
                    )
                    
                elif new_status == 'delivered':
                    # Order delivered
                    email_service.send_email(
                        recipient_email=order.user.email if order.user else None,
                        subject=f'Order #{order.id} Delivered Successfully!',
                        html_content=f'''
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Great News!</h2>
                            <p>Hello {order.user.first_name if order.user else 'Customer'},</p>
                            <p>Your order #{order.id} has been delivered successfully!</p>
                            <p>We hope you're happy with your purchase. If you have any questions or concerns, please don't hesitate to contact us.</p>
                            <p><a href="http://localhost:3000/orders/{order.id}">View Order Details</a></p>
                            <p>Thank you for choosing PEBDEQ!</p>
                        </div>
                        ''',
                        email_type='order',
                        user_id=order.user_id,
                        order_id=order.id,
                        priority=3
                    )
                    
                elif new_status == 'cancelled':
                    # Order cancelled
                    email_service.send_email(
                        recipient_email=order.user.email if order.user else None,
                        subject=f'Order #{order.id} - Cancellation Confirmation',
                        html_content=f'''
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Order Cancelled</h2>
                            <p>Hello {order.user.first_name if order.user else 'Customer'},</p>
                            <p>Your order #{order.id} has been cancelled as requested.</p>
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
                                <h3>Order Details</h3>
                                <p><strong>Order ID:</strong> #{order.id}</p>
                                <p><strong>Total Amount:</strong> ${order.total_amount:.2f}</p>
                                <p><strong>Status:</strong> Cancelled</p>
                            </div>
                            <p>If you have any questions about this cancellation, please contact our support team.</p>
                            <p>Thank you for your understanding.</p>
                        </div>
                        ''',
                        email_type='order',
                        user_id=order.user_id,
                        order_id=order.id,
                        priority=2
                    )
            
            # Payment status change emails
            if 'payment_status' in data and data['payment_status'] != old_payment_status:
                new_payment_status = data['payment_status']
                
                if new_payment_status == 'paid' and old_payment_status == 'pending':
                    # Payment confirmed - use template
                    email_service.send_email(
                        recipient_email=order.user.email if order.user else None,
                        subject=f'Payment Confirmed for Order #{order.id}',
                        template_name='payment_confirmation',
                        template_variables={
                            'user_name': order.user.first_name if order.user else 'Customer',
                            'order_id': order.id,
                            'order_total': f"${order.total_amount:.2f}",
                            'payment_method': order.payment_method.title() if order.payment_method else 'N/A',
                            'payment_date': datetime.utcnow().strftime('%B %d, %Y'),
                            'tracking_url': f'http://localhost:3000/orders/{order.id}'
                        },
                        email_type='order',
                        user_id=order.user_id,
                        order_id=order.id,
                        priority=1
                    )
                    
        except Exception as email_error:
            # Don't fail the status update if email fails
            print(f"❌ Failed to send automatic email for order {order_id}: {str(email_error)}")
        
        return jsonify({'message': 'Order updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# User Return Request
@orders_bp.route('/user/orders/<int:order_id>/return', methods=['POST'])
@token_required
def request_return(current_user, order_id):
    try:
        order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Check if order is eligible for return
        if order.status not in ['delivered']:
            return jsonify({'error': 'Order is not eligible for return'}), 400
        
        # Check if return already requested
        if order.return_status != 'none':
            return jsonify({'error': 'Return already requested for this order'}), 400
        
        data = request.get_json()
        
        if not data or not data.get('reason'):
            return jsonify({'error': 'Return reason is required'}), 400
        
        # Update order with return request
        order.return_status = 'requested'
        order.return_reason = data['reason']
        order.return_notes = data.get('notes', '')
        order.return_requested_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Return request submitted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# User Cancel Order
@orders_bp.route('/user/orders/<int:order_id>/cancel', methods=['POST'])
@token_required
def cancel_order(current_user, order_id):
    try:
        order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Check if order can be cancelled
        if order.status not in ['pending', 'processing']:
            return jsonify({'error': 'Order cannot be cancelled at this stage'}), 400
        
        data = request.get_json()
        
        if not data or not data.get('reason'):
            return jsonify({'error': 'Cancel reason is required'}), 400
        
        # Update order status
        order.status = 'cancelled'
        order.cancel_reason = data['reason']
        order.cancel_notes = data.get('notes', '')
        order.cancelled_at = datetime.utcnow()
        order.cancelled_by = current_user.id
        
        db.session.commit()
        
        return jsonify({'message': 'Order cancelled successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Admin Get Return Requests
@orders_bp.route('/admin/returns', methods=['GET'])
@admin_required
def get_return_requests():
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get filter parameters
        status_filter = request.args.get('status', '')
        
        # Build query for orders with return requests
        query = Order.query.filter(Order.return_status != 'none').join(User, Order.user_id == User.id)
        
        # Apply filters
        if status_filter:
            query = query.filter(Order.return_status == status_filter)
        
        # Order by return request date (newest first)
        query = query.order_by(Order.return_requested_at.desc())
        
        # Get total count before pagination
        total_requests = query.count()
        
        # Apply pagination
        requests_paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Format response
        requests_data = []
        for order in requests_paginated.items:
            order_data = order.to_dict()
            # Add user information
            if order.user:
                order_data['user'] = {
                    'id': order.user.id,
                    'first_name': order.user.first_name,
                    'last_name': order.user.last_name,
                    'email': order.user.email,
                    'phone': order.user.phone
                }
            requests_data.append(order_data)
        
        return jsonify({
            'return_requests': requests_data,
            'page': page,
            'per_page': per_page,
            'total': total_requests,
            'pages': requests_paginated.pages,
            'has_next': requests_paginated.has_next,
            'has_prev': requests_paginated.has_prev
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Process Return Request
@orders_bp.route('/admin/returns/<int:order_id>', methods=['PUT'])
@admin_required
def process_return_request(order_id):
    try:
        order = Order.query.get_or_404(order_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        action = data.get('action')  # 'approve' or 'deny'
        
        if action not in ['approve', 'deny']:
            return jsonify({'error': 'Invalid action. Use "approve" or "deny"'}), 400
        
        if action == 'approve':
            order.return_status = 'approved'
            order.status = 'return_requested'
        else:
            order.return_status = 'denied'
        
        order.return_processed_at = datetime.utcnow()
        order.return_notes = data.get('admin_notes', order.return_notes)
        
        db.session.commit()
        
        return jsonify({'message': f'Return request {action}d successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Admin Complete Return
@orders_bp.route('/admin/returns/<int:order_id>/complete', methods=['PUT'])
@admin_required
def complete_return(order_id):
    try:
        order = Order.query.get_or_404(order_id)
        
        if order.return_status != 'approved':
            return jsonify({'error': 'Return request must be approved first'}), 400
        
        order.return_status = 'returned'
        order.status = 'returned'
        order.return_processed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Return completed successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 