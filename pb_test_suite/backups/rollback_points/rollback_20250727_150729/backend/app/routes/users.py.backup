from flask import Blueprint, request, jsonify
from app.models.models import User, UserAddress, Order, Cart, Invoice
from app import db
import jwt
import os
from functools import wraps
from datetime import datetime

users_bp = Blueprint('users', __name__)

def auth_required(f):
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
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Pass user to the decorated function
            return f(user, *args, **kwargs)
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated_function

# Address Management Endpoints
@users_bp.route('/addresses', methods=['GET'])
@auth_required
def get_addresses(user):
    try:
        addresses = UserAddress.query.filter_by(user_id=user.id).order_by(UserAddress.is_default.desc(), UserAddress.created_at.desc()).all()
        
        return jsonify({
            'addresses': [{
                'id': addr.id,
                'title': addr.title,
                'first_name': addr.first_name,
                'last_name': addr.last_name,
                'company': addr.company,
                'address_line1': addr.address_line1,
                'address_line2': addr.address_line2,
                'city': addr.city,
                'state': addr.state,
                'postal_code': addr.postal_code,
                'country': addr.country,
                'phone': addr.phone,
                'is_default': addr.is_default,
                'created_at': addr.created_at.isoformat(),
                'updated_at': addr.updated_at.isoformat()
            } for addr in addresses]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/addresses', methods=['POST'])
@auth_required
def create_address(user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'first_name', 'last_name', 'address_line1', 'city', 'postal_code', 'country']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # If this is set as default, remove default from other addresses
        if data.get('is_default', False):
            UserAddress.query.filter_by(user_id=user.id, is_default=True).update({'is_default': False})
        
        # Create new address
        address = UserAddress(
            user_id=user.id,
            title=data['title'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            company=data.get('company', ''),
            address_line1=data['address_line1'],
            address_line2=data.get('address_line2', ''),
            city=data['city'],
            state=data.get('state', ''),
            postal_code=data['postal_code'],
            country=data['country'],
            phone=data.get('phone', ''),
            is_default=data.get('is_default', False)
        )
        
        db.session.add(address)
        db.session.commit()
        
        return jsonify({
            'message': 'Address created successfully',
            'address': {
                'id': address.id,
                'title': address.title,
                'first_name': address.first_name,
                'last_name': address.last_name,
                'company': address.company,
                'address_line1': address.address_line1,
                'address_line2': address.address_line2,
                'city': address.city,
                'state': address.state,
                'postal_code': address.postal_code,
                'country': address.country,
                'phone': address.phone,
                'is_default': address.is_default,
                'created_at': address.created_at.isoformat(),
                'updated_at': address.updated_at.isoformat()
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/addresses/<int:address_id>', methods=['PUT'])
@auth_required
def update_address(user, address_id):
    try:
        address = UserAddress.query.filter_by(id=address_id, user_id=user.id).first()
        
        if not address:
            return jsonify({'error': 'Address not found'}), 404
        
        data = request.get_json()
        
        # If this is set as default, remove default from other addresses
        if data.get('is_default', False) and not address.is_default:
            UserAddress.query.filter_by(user_id=user.id, is_default=True).update({'is_default': False})
        
        # Update address fields
        if 'title' in data:
            address.title = data['title']
        if 'first_name' in data:
            address.first_name = data['first_name']
        if 'last_name' in data:
            address.last_name = data['last_name']
        if 'company' in data:
            address.company = data['company']
        if 'address_line1' in data:
            address.address_line1 = data['address_line1']
        if 'address_line2' in data:
            address.address_line2 = data['address_line2']
        if 'city' in data:
            address.city = data['city']
        if 'state' in data:
            address.state = data['state']
        if 'postal_code' in data:
            address.postal_code = data['postal_code']
        if 'country' in data:
            address.country = data['country']
        if 'phone' in data:
            address.phone = data['phone']
        if 'is_default' in data:
            address.is_default = data['is_default']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Address updated successfully',
            'address': {
                'id': address.id,
                'title': address.title,
                'first_name': address.first_name,
                'last_name': address.last_name,
                'company': address.company,
                'address_line1': address.address_line1,
                'address_line2': address.address_line2,
                'city': address.city,
                'state': address.state,
                'postal_code': address.postal_code,
                'country': address.country,
                'phone': address.phone,
                'is_default': address.is_default,
                'created_at': address.created_at.isoformat(),
                'updated_at': address.updated_at.isoformat()
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/addresses/<int:address_id>', methods=['DELETE'])
@auth_required
def delete_address(user, address_id):
    try:
        address = UserAddress.query.filter_by(id=address_id, user_id=user.id).first()
        
        if not address:
            return jsonify({'error': 'Address not found'}), 404
        
        db.session.delete(address)
        db.session.commit()
        
        return jsonify({'message': 'Address deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# User Orders Endpoint
@users_bp.route('/orders', methods=['GET'])
@auth_required
def get_user_orders(user):
    try:
        orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()
        
        return jsonify({
            'orders': [order.to_dict() for order in orders]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Single Order Endpoint
@users_bp.route('/orders/<int:order_id>', methods=['GET'])
@auth_required
def get_user_order(user, order_id):
    try:
        order = Order.query.filter_by(id=order_id, user_id=user.id).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify({
            'order': order.to_dict()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Settings Endpoints
@users_bp.route('/settings', methods=['GET'])
@auth_required
def get_user_settings(user):
    """Get user settings"""
    try:
        print(f"🔍 Fetching settings for user: {user.email} (Google ID: {user.google_id})")
        print(f"🔍 Current user.settings: {user.settings}")
        print(f"🔍 user.settings type: {type(user.settings)}")
        print(f"🔍 user.settings is None: {user.settings is None}")
        # Default settings structure
        default_settings = {
            # Account Preferences
            'language': 'en',
            'currency': 'USD',
            'timezone': 'UTC',
            'theme': 'light',
            
            # Notification Settings
            'emailNotifications': True,
            'orderUpdates': True,
            'promotionalEmails': False,
            'weeklyNewsletter': False,
            'smsNotifications': False,
            'pushNotifications': True,
            
            # Privacy Settings
            'profileVisibility': 'private',
            'dataSharing': False,
            'analyticsTracking': True,
            'cookiesAccepted': True,
            
            # Display Settings
            'productsPerPage': 12,
            'defaultView': 'grid',
            'showPrices': True,
            'showStockStatus': True
        }
        
        # Get user settings and merge with defaults
        user_settings = user.settings or {}
        
        # Initialize settings if None (for Google OAuth users)
        if user.settings is None:
            user.settings = {}
            db.session.commit()
            print(f"✅ Initialized settings for user {user.email} (Google OAuth)")
        
        merged_settings = {**default_settings, **user_settings}
        
        print(f"✅ Returning merged settings for {user.email}: {len(merged_settings)} items")
        
        return jsonify({
            'settings': merged_settings
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/settings', methods=['PUT'])
@auth_required
def update_user_settings(user):
    """Update user settings"""
    try:
        data = request.get_json()
        
        if not data or 'settings' not in data:
            return jsonify({'error': 'Settings data required'}), 400
        
        # Update user settings
        current_settings = user.settings or {}
        updated_settings = {**current_settings, **data['settings']}
        
        user.settings = updated_settings
        db.session.commit()
        
        return jsonify({
            'message': 'Settings updated successfully',
            'settings': updated_settings
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/export', methods=['GET'])
@auth_required
def export_user_data(user):
    """Export all user data in JSON format"""
    try:
        print(f"📥 Data export requested for user: {user.email}")
        
        # Collect all user data
        user_data = {
            'export_info': {
                'export_date': datetime.utcnow().isoformat(),
                'user_email': user.email,
                'export_type': 'complete_user_data'
            },
            
            # Basic user information
            'profile': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'address': user.address,
                'is_admin': user.is_admin,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'google_id': user.google_id,
                'authentication_method': 'Google OAuth' if user.google_id else 'Email/Password'
            },
            
            # User settings
            'settings': user.settings or {},
            
            # User addresses
            'addresses': [],
            
            # User orders
            'orders': [],
            
            # User invoices
            'invoices': [],
            
            # User carts
            'carts': []
        }
        
        # Get user addresses
        user_addresses = UserAddress.query.filter_by(user_id=user.id).all()
        print(f"🏠 Found {len(user_addresses)} addresses")
        
        for address in user_addresses:
            user_data['addresses'].append({
                'id': address.id,
                'title': address.title,
                'first_name': address.first_name,
                'last_name': address.last_name,
                'company': address.company,
                'address_line1': address.address_line1,
                'address_line2': address.address_line2,
                'city': address.city,
                'state': address.state,
                'postal_code': address.postal_code,
                'country': address.country,
                'phone': address.phone,
                'is_default': address.is_default,
                'created_at': address.created_at.isoformat() if address.created_at else None,
                'updated_at': address.updated_at.isoformat() if address.updated_at else None
            })
        
        # Get user orders
        user_orders = Order.query.filter_by(user_id=user.id).all()
        print(f"📦 Found {len(user_orders)} orders")
        
        for order in user_orders:
            user_data['orders'].append(order.to_dict())
        
        # Get user invoices
        user_invoices = Invoice.query.filter_by(user_id=user.id).all()
        print(f"🧾 Found {len(user_invoices)} invoices")
        
        for invoice in user_invoices:
            user_data['invoices'].append(invoice.to_dict())
        
        # Get user carts
        user_carts = Cart.query.filter_by(user_id=user.id).all()
        print(f"🛒 Found {len(user_carts)} carts")
        
        for cart in user_carts:
            user_data['carts'].append(cart.to_dict())
        
        # Add summary statistics
        user_data['summary'] = {
            'total_addresses': len(user_addresses),
            'total_orders': len(user_orders),
            'total_invoices': len(user_invoices),
            'total_carts': len(user_carts),
            'account_age_days': (datetime.utcnow() - user.created_at).days if user.created_at else None,
            'total_order_value': sum(order.total_amount for order in user_orders) if user_orders else 0
        }
        
        print(f"✅ Data export completed successfully for: {user.email}")
        
        return jsonify(user_data)
        
    except Exception as e:
        print(f"❌ Error exporting data for {user.email}: {str(e)}")
        return jsonify({'error': 'Failed to export data'}), 500

@users_bp.route('/account', methods=['DELETE'])
@auth_required
def delete_account(user):
    """Delete user account with proper data handling"""
    try:
        print(f"🗑️ Account deletion requested for user: {user.email}")
        
        # Double confirmation - check password for regular users
        data = request.get_json()
        if not data or 'password' not in data:
            return jsonify({'error': 'Password confirmation required'}), 400
        
        # For Google OAuth users, password check is skipped
        if not user.google_id and not user.check_password(data['password']):
            return jsonify({'error': 'Invalid password'}), 401
        
        print(f"🔍 Password confirmed for user: {user.email}")
        
        # Step 1: Handle Orders (preserve for business records)
        user_orders = Order.query.filter_by(user_id=user.id).all()
        print(f"📦 Found {len(user_orders)} orders to anonymize")
        
        for order in user_orders:
            # Anonymize order but keep for records
            order.user_id = None
            order.shipping_address = f"[DELETED USER] {order.shipping_address}" if order.shipping_address else "[DELETED USER]"
            order.billing_address = f"[DELETED USER] {order.billing_address}" if order.billing_address else "[DELETED USER]"
            order.notes = f"[DELETED USER] {order.notes}" if order.notes else "[DELETED USER]"
        
        # Step 2: Handle Return/Cancel references
        processed_returns = Order.query.filter_by(return_processed_by=user.id).all()
        cancelled_orders = Order.query.filter_by(cancelled_by=user.id).all()
        
        print(f"📋 Found {len(processed_returns)} processed returns and {len(cancelled_orders)} cancelled orders to update")
        
        for order in processed_returns:
            order.return_processed_by = None
            
        for order in cancelled_orders:
            order.cancelled_by = None
        
        # Step 3: Handle Invoices (preserve for legal/accounting)
        user_invoices = Invoice.query.filter_by(user_id=user.id).all()
        print(f"🧾 Found {len(user_invoices)} invoices to anonymize")
        
        for invoice in user_invoices:
            # Anonymize invoice but keep for records
            invoice.user_id = None
            invoice.customer_name = "[DELETED USER]"
            invoice.customer_email = "[DELETED USER]"
            invoice.customer_phone = "[DELETED USER]"
            invoice.billing_address = f"[DELETED USER] {invoice.billing_address}" if invoice.billing_address else "[DELETED USER]"
            invoice.internal_notes = f"[DELETED USER] {invoice.internal_notes}" if invoice.internal_notes else "[DELETED USER]"
        
        # Step 4: Delete User Carts (safe to delete)
        user_carts = Cart.query.filter_by(user_id=user.id).all()
        print(f"🛒 Found {len(user_carts)} carts to delete")
        
        for cart in user_carts:
            db.session.delete(cart)
        
        # Step 5: Delete User Addresses (will be cascade deleted anyway)
        user_addresses = UserAddress.query.filter_by(user_id=user.id).all()
        print(f"🏠 Found {len(user_addresses)} addresses to delete")
        
        # Step 6: Delete User Account
        user_email = user.email
        db.session.delete(user)
        
        # Commit all changes
        db.session.commit()
        
        print(f"✅ Account deletion completed successfully for: {user_email}")
        
        return jsonify({
            'message': 'Account deleted successfully',
            'summary': {
                'orders_anonymized': len(user_orders),
                'returns_processed': len(processed_returns),
                'cancellations_processed': len(cancelled_orders),
                'invoices_anonymized': len(user_invoices),
                'carts_deleted': len(user_carts),
                'addresses_deleted': len(user_addresses)
            }
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting account for {user.email}: {str(e)}")
        return jsonify({'error': 'Failed to delete account'}), 500

@users_bp.route('/favorites', methods=['GET'])
@auth_required
def get_user_favorites(user):
    """Get user's favorite products and blogs"""
    try:
        from app.models.models import ProductLike, BlogLike, Product, BlogPost
        
        # Get liked products
        liked_products = db.session.query(Product).join(ProductLike).filter(
            ProductLike.user_id == user.id,
            Product.is_active == True
        ).all()
        
        # Get liked blogs  
        liked_blogs = db.session.query(BlogPost).join(BlogLike).filter(
            BlogLike.user_id == user.id,
            BlogPost.is_published == True
        ).all()
        
        return jsonify({
            'products': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': p.price,
                'original_price': p.original_price,
                'images': p.images,
                'category': p.category.name,
                'category_slug': p.category.slug,
                'stock_quantity': p.stock_quantity,
                'is_featured': p.is_featured
            } for p in liked_products],
            'blogs': [{
                'id': b.id,
                'title': b.title,
                'slug': b.slug,
                'excerpt': b.excerpt,
                'author': b.author,
                'category': b.category,
                'featured_image': b.featured_image,
                'created_at': b.created_at.isoformat()
            } for b in liked_blogs]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Theme Management Endpoints
@users_bp.route('/theme', methods=['GET'])
@auth_required
def get_user_theme(user):
    """Get user's current theme preference"""
    try:
        return jsonify({
            'theme': user.theme_preference or 'default',
            'available_themes': ['default', 'dark', 'blue', 'green']
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/theme', methods=['PUT'])
@auth_required
def update_user_theme(user):
    """Update user's theme preference"""
    try:
        data = request.get_json()
        
        if not data or 'theme' not in data:
            return jsonify({'error': 'Theme is required'}), 400
        
        theme = data['theme']
        available_themes = ['default', 'dark', 'blue', 'green']
        
        if theme not in available_themes:
            return jsonify({'error': f'Invalid theme. Available themes: {available_themes}'}), 400
        
        user.theme_preference = theme
        db.session.commit()
        
        return jsonify({
            'message': 'Theme updated successfully',
            'theme': theme
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Global Theme Endpoints (no auth required)
@users_bp.route('/themes', methods=['GET'])
def get_available_themes():
    """Get all available themes"""
    try:
        themes = {
            'default': {
                'id': 'default',
                'name': 'Default Light',
                'description': 'Clean, modern light interface',
                'icon': '☀️',
                'type': 'light'
            },
            'dark': {
                'id': 'dark',
                'name': 'Dark Mode',
                'description': 'Sleek, modern dark interface',
                'icon': '🌙',
                'type': 'dark'
            },
            'blue': {
                'id': 'blue',
                'name': 'Professional Blue',
                'description': 'Corporate blue-focused interface',
                'icon': '💙',
                'type': 'light'
            },
            'green': {
                'id': 'green',
                'name': 'Natural Green',
                'description': 'Eco-friendly green interface',
                'icon': '🌱',
                'type': 'light'
            }
        }
        
        return jsonify({
            'themes': themes,
            'default_theme': 'default'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/themes/<theme_id>', methods=['GET'])
def get_theme_details(theme_id):
    """Get details of a specific theme"""
    try:
        themes = {
            'default': {
                'id': 'default',
                'name': 'Default Light',
                'description': 'Clean, modern light interface',
                'icon': '☀️',
                'type': 'light',
                'colors': {
                    'primary': '#007bff',
                    'secondary': '#6c757d',
                    'background': '#ffffff',
                    'text': '#222222'
                }
            },
            'dark': {
                'id': 'dark',
                'name': 'Dark Mode',
                'description': 'Sleek, modern dark interface',
                'icon': '🌙',
                'type': 'dark',
                'colors': {
                    'primary': '#0d6efd',
                    'secondary': '#6c757d',
                    'background': '#1a1a1a',
                    'text': '#ffffff'
                }
            },
            'blue': {
                'id': 'blue',
                'name': 'Professional Blue',
                'description': 'Corporate blue-focused interface',
                'icon': '💙',
                'type': 'light',
                'colors': {
                    'primary': '#0066cc',
                    'secondary': '#4d79a4',
                    'background': '#f8f9fa',
                    'text': '#1a202c'
                }
            },
            'green': {
                'id': 'green',
                'name': 'Natural Green',
                'description': 'Eco-friendly green interface',
                'icon': '🌱',
                'type': 'light',
                'colors': {
                    'primary': '#38a169',
                    'secondary': '#68d391',
                    'background': '#f7fafc',
                    'text': '#1a202c'
                }
            }
        }
        
        if theme_id not in themes:
            return jsonify({'error': 'Theme not found'}), 404
        
        return jsonify({
            'theme': themes[theme_id]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500