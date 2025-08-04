from flask import Blueprint, request, jsonify, session
from app.models.models import Cart, CartItem, Product, User, Order, OrderItem, UserAddress
from app import db
import jwt
import os
from functools import wraps
import uuid
import datetime

cart_bp = Blueprint('cart', __name__)

def get_user_from_token():
    """Extract user from token, return None if not authenticated"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return None
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        data = jwt.decode(token, os.environ.get('SECRET_KEY') or 'dev-secret-key', algorithms=['HS256'])
        user = User.query.get(data['user_id'])
        return user
    except:
        return None

def get_or_create_cart():
    """Get or create cart for authenticated user or guest"""
    user = get_user_from_token()
    
    if user:
        # Authenticated user
        cart = Cart.query.filter_by(user_id=user.id).first()
        if not cart:
            cart = Cart(user_id=user.id)
            db.session.add(cart)
            db.session.commit()
        return cart
    else:
        # Guest user
        session_id = request.headers.get('X-Session-ID')
        if not session_id:
            return None
        
        cart = Cart.query.filter_by(session_id=session_id).first()
        if not cart:
            cart = Cart(session_id=session_id)
            db.session.add(cart)
            db.session.commit()
        return cart

def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_token()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        return f(user, *args, **kwargs)
    return decorated_function

def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    random_suffix = str(uuid.uuid4())[:8].upper()
    return f'ORD-{timestamp}-{random_suffix}'

@cart_bp.route('/cart', methods=['GET'])
def get_cart():
    """Get cart contents"""
    try:
        cart = get_or_create_cart()
        
        if not cart:
            return jsonify({
                'cart': {
                    'id': None,
                    'items': [],
                    'total_items': 0,
                    'total_price': 0
                }
            })
        
        return jsonify({
            'cart': cart.to_dict()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/cart/add', methods=['POST'])
def add_to_cart():
    """Add item to cart"""
    try:
        data = request.get_json()
        
        if not data or 'product_id' not in data:
            return jsonify({'error': 'Product ID is required'}), 400
        
        product_id = data['product_id']
        quantity = data.get('quantity', 1)
        
        # Validate product exists
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Check stock
        if product.stock_quantity and product.stock_quantity < quantity:
            return jsonify({'error': 'Insufficient stock'}), 400
        
        # Get or create cart
        cart = get_or_create_cart()
        if not cart:
            return jsonify({'error': 'Unable to create cart'}), 400
        
        # Check if item already exists in cart
        existing_item = CartItem.query.filter_by(
            cart_id=cart.id,
            product_id=product_id
        ).first()
        
        if existing_item:
            # Update quantity
            new_quantity = existing_item.quantity + quantity
            
            # Check stock for new quantity
            if product.stock_quantity and product.stock_quantity < new_quantity:
                return jsonify({'error': 'Insufficient stock'}), 400
            
            existing_item.quantity = new_quantity
            existing_item.updated_at = db.func.now()
        else:
            # Add new item
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity,
                price=product.price  # Store current price
            )
            db.session.add(cart_item)
        
        # Update cart timestamp
        cart.updated_at = db.func.now()
        db.session.commit()
        
        return jsonify({
            'message': 'Item added to cart successfully',
            'cart': cart.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/cart/update', methods=['PUT'])
def update_cart_item():
    """Update cart item quantity"""
    try:
        data = request.get_json()
        
        if not data or 'item_id' not in data or 'quantity' not in data:
            return jsonify({'error': 'Item ID and quantity are required'}), 400
        
        item_id = data['item_id']
        quantity = data['quantity']
        
        if quantity < 0:
            return jsonify({'error': 'Quantity must be non-negative'}), 400
        
        # Get cart
        cart = get_or_create_cart()
        if not cart:
            return jsonify({'error': 'Cart not found'}), 404
        
        # Find cart item
        cart_item = CartItem.query.filter_by(
            id=item_id,
            cart_id=cart.id
        ).first()
        
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        # Check stock
        if cart_item.product.stock_quantity and cart_item.product.stock_quantity < quantity:
            return jsonify({'error': 'Insufficient stock'}), 400
        
        if quantity == 0:
            # Remove item
            db.session.delete(cart_item)
        else:
            # Update quantity
            cart_item.quantity = quantity
            cart_item.updated_at = db.func.now()
        
        # Update cart timestamp
        cart.updated_at = db.func.now()
        db.session.commit()
        
        return jsonify({
            'message': 'Cart updated successfully',
            'cart': cart.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/cart/remove', methods=['DELETE'])
def remove_from_cart():
    """Remove item from cart"""
    try:
        data = request.get_json()
        
        if not data or 'item_id' not in data:
            return jsonify({'error': 'Item ID is required'}), 400
        
        item_id = data['item_id']
        
        # Get cart
        cart = get_or_create_cart()
        if not cart:
            return jsonify({'error': 'Cart not found'}), 404
        
        # Find cart item
        cart_item = CartItem.query.filter_by(
            id=item_id,
            cart_id=cart.id
        ).first()
        
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        # Remove item
        db.session.delete(cart_item)
        
        # Update cart timestamp
        cart.updated_at = db.func.now()
        db.session.commit()
        
        return jsonify({
            'message': 'Item removed from cart successfully',
            'cart': cart.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/cart/clear', methods=['DELETE'])
def clear_cart():
    """Clear all items from cart"""
    try:
        # Get cart
        cart = get_or_create_cart()
        if not cart:
            return jsonify({'error': 'Cart not found'}), 404
        
        # Remove all items
        CartItem.query.filter_by(cart_id=cart.id).delete()
        
        # Update cart timestamp
        cart.updated_at = db.func.now()
        db.session.commit()
        
        return jsonify({
            'message': 'Cart cleared successfully',
            'cart': cart.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/cart/merge', methods=['POST'])
def merge_guest_cart():
    """Merge guest cart with user cart after login"""
    try:
        user = get_user_from_token()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
        
        # Get guest cart
        guest_cart = Cart.query.filter_by(session_id=session_id).first()
        if not guest_cart or not guest_cart.items:
            return jsonify({'message': 'No guest cart to merge'})
        
        # Get or create user cart
        user_cart = Cart.query.filter_by(user_id=user.id).first()
        if not user_cart:
            user_cart = Cart(user_id=user.id)
            db.session.add(user_cart)
            db.session.commit()
        
        # Merge items
        for guest_item in guest_cart.items:
            existing_item = CartItem.query.filter_by(
                cart_id=user_cart.id,
                product_id=guest_item.product_id
            ).first()
            
            if existing_item:
                # Update quantity
                existing_item.quantity += guest_item.quantity
                existing_item.updated_at = db.func.now()
            else:
                # Add new item to user cart
                new_item = CartItem(
                    cart_id=user_cart.id,
                    product_id=guest_item.product_id,
                    quantity=guest_item.quantity,
                    price=guest_item.price
                )
                db.session.add(new_item)
        
        # Delete guest cart
        db.session.delete(guest_cart)
        
        # Update user cart timestamp
        user_cart.updated_at = db.func.now()
        db.session.commit()
        
        return jsonify({
            'message': 'Guest cart merged successfully',
            'cart': user_cart.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/cart/session', methods=['POST'])
def create_session():
    """Create a new session ID for guest cart"""
    try:
        session_id = str(uuid.uuid4())
        
        return jsonify({
            'session_id': session_id,
            'message': 'Session created successfully'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/orders/create', methods=['POST'])
@auth_required
def create_order(user):
    """Create a new order from cart"""
    try:
        # Safely get JSON data
        try:
            data = request.get_json()
        except Exception as json_error:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        if not data:
            return jsonify({'error': 'Order data is required'}), 400
        
        # Validate required fields
        shipping_address_id = data.get('shipping_address_id')
        payment_method = data.get('payment_method')
        
        if not shipping_address_id:
            return jsonify({'error': 'Shipping address is required'}), 400
        
        if not payment_method:
            return jsonify({'error': 'Payment method is required'}), 400
        
        # Get user cart
        cart = Cart.query.filter_by(user_id=user.id).first()
        if not cart or not cart.items:
            return jsonify({'error': 'Cart is empty'}), 400
        
        # Validate shipping address
        shipping_address = UserAddress.query.filter_by(
            id=shipping_address_id,
            user_id=user.id
        ).first()
        
        if not shipping_address:
            return jsonify({'error': 'Invalid shipping address'}), 400
        
        # Get billing address (same as shipping if not provided)
        billing_address_id = data.get('billing_address_id', shipping_address_id)
        billing_address = UserAddress.query.filter_by(
            id=billing_address_id,
            user_id=user.id
        ).first()
        
        if not billing_address:
            billing_address = shipping_address
        
        # Calculate totals
        subtotal = sum(item.quantity * item.price for item in cart.items)
        shipping_cost = 10.0 if subtotal < 100 else 0.0  # Free shipping over $100
        tax_rate = 0.18  # 18% tax
        tax_amount = (subtotal + shipping_cost) * tax_rate
        total_amount = subtotal + shipping_cost + tax_amount
        
        # Check stock for all items
        for cart_item in cart.items:
            if cart_item.product.stock_quantity < cart_item.quantity:
                return jsonify({
                    'error': f'Insufficient stock for {cart_item.product.name}. Available: {cart_item.product.stock_quantity}, Requested: {cart_item.quantity}'
                }), 400
        
        # Generate unique order number
        order_number = generate_order_number()
        
        # Create order
        order = Order(
            order_number=order_number,
            user_id=user.id,
            total_amount=total_amount,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax_amount=tax_amount,
            status='pending',
            shipping_address_id=shipping_address.id,
            billing_address_id=billing_address.id,
            payment_method=payment_method,
            payment_status='pending',
            notes=data.get('notes', '')
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Create order items and update stock
        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price=cart_item.price,
                product_name=cart_item.product.name,
                product_slug=cart_item.product.slug
            )
            db.session.add(order_item)
            
            # Update product stock
            cart_item.product.stock_quantity -= cart_item.quantity
        
        # Clear cart
        CartItem.query.filter_by(cart_id=cart.id).delete()
        
        # Commit all changes
        db.session.commit()
        
        # Send order confirmation email
        try:
            from app.utils.email_service import get_email_service
            email_service = get_email_service()
            
            # Use the dedicated send_order_confirmation method which includes product images
            success, result = email_service.send_order_confirmation(order.id)
            if success:
                print(f"✅ Order confirmation email queued for order {order.id}")
            else:
                print(f"❌ Failed to send order confirmation email for order {order.id}: {result}")
            
        except Exception as email_error:
            # Don't fail order creation if email fails
            print(f"❌ Failed to send order confirmation email for order {order.id}: {str(email_error)}")
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 