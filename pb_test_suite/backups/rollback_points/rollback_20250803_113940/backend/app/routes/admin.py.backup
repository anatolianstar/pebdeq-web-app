from flask import Blueprint, request, jsonify, send_file
from app.models.models import User, Product, Category, Order, ContactMessage, SiteSettings, UserAddress, Invoice
from app import db
import jwt
import os
from functools import wraps
import pandas as pd
from io import BytesIO
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

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

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    """Get admin statistics"""
    try:
        stats = {
            'totalProducts': Product.query.count(),
            'totalCategories': Category.query.count(),
            'totalOrders': Order.query.count(),
            'totalUsers': User.query.count(),
            'unreadMessages': ContactMessage.query.filter_by(is_read=False).count(),
            'activeProducts': Product.query.filter_by(is_active=True).count(),
            'inactiveProducts': Product.query.filter_by(is_active=False).count(),
            'pendingOrders': Order.query.filter_by(status='pending').count(),
            'deliveredOrders': Order.query.filter_by(status='delivered').count(),
            'totalRevenue': db.session.query(db.func.sum(Order.total_amount)).filter_by(payment_status='paid').scalar() or 0,
            'recentOrders': Order.query.order_by(Order.created_at.desc()).limit(5).all(),
            'recentMessages': ContactMessage.query.order_by(ContactMessage.created_at.desc()).limit(5).all()
        }
        
        # Format recent orders
        stats['recentOrders'] = [{
            'id': o.id,
            'orderNumber': o.order_number,
            'userEmail': o.user.email if o.user else 'Guest',
            'totalAmount': o.total_amount,
            'status': o.status,
            'createdAt': o.created_at.isoformat()
        } for o in stats['recentOrders']]
        
        # Format recent messages
        stats['recentMessages'] = [{
            'id': m.id,
            'name': m.name,
            'email': m.email,
            'subject': m.subject,
            'isRead': m.is_read,
            'createdAt': m.created_at.isoformat()
        } for m in stats['recentMessages']]
        
        return jsonify(stats)
    
    except Exception as e:
        print(f'❌ Error fetching admin stats: {str(e)}')
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def dashboard():
    """Admin dashboard with statistics"""
    try:
        stats = {
            'total_products': Product.query.count(),
            'total_categories': Category.query.count(),
            'total_orders': Order.query.count(),
            'unread_messages': ContactMessage.query.filter_by(is_read=False).count(),
            'active_products': Product.query.filter_by(is_active=True).count(),
            'inactive_products': Product.query.filter_by(is_active=False).count(),
            'recent_orders': Order.query.order_by(Order.created_at.desc()).limit(5).all(),
            'recent_messages': ContactMessage.query.order_by(ContactMessage.created_at.desc()).limit(5).all()
        }
        
        # Format recent orders
        stats['recent_orders'] = [{
            'id': o.id,
            'order_number': o.order_number,
            'user_email': o.user.email if o.user else o.guest_email,
            'total_amount': o.total_amount,
            'status': o.status,
            'created_at': o.created_at.isoformat()
        } for o in stats['recent_orders']]
        
        # Format recent messages
        stats['recent_messages'] = [{
            'id': m.id,
            'name': m.name,
            'email': m.email,
            'subject': m.subject,
            'is_read': m.is_read,
            'created_at': m.created_at.isoformat()
        } for m in stats['recent_messages']]
        
        return jsonify(stats)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/health', methods=['GET'])
@admin_required
def health_check():
    """Admin health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Admin panel is running'
    })

# Products Import/Export endpoints
@admin_bp.route('/products/export-excel', methods=['GET'])
@admin_required
def export_products_excel():
    """Export all products to Excel file"""
    try:
        products = Product.query.all()
        
        # Create product data for Excel
        product_data = []
        for product in products:
            product_data.append({
                'ID': product.id,
                'Name': product.name,
                'Slug': product.slug,
                'Description': product.description,
                'Price': product.price,
                'Original Price': product.original_price,
                'Stock Quantity': product.stock_quantity,
                'Category ID': product.category_id,
                'Category Name': product.category.name,
                'Images': ', '.join(product.images) if product.images else '',
                'Video URL': product.video_url,
                'Is Featured': product.is_featured,
                'Is Active': product.is_active,
                'Has Variations': product.has_variations,
                'Variation Type': product.variation_type,
                'Variation Name': product.variation_name,
                'Weight': product.weight,
                'Dimensions': product.dimensions,
                'Material': product.material,
                'Created At': product.created_at.strftime('%Y-%m-%d %H:%M:%S') if product.created_at else '',
                'Updated At': product.updated_at.strftime('%Y-%m-%d %H:%M:%S') if product.updated_at else ''
            })
        
        # Create DataFrame
        df = pd.DataFrame(product_data)
        
        # Create Excel file in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Products', index=False)
        
        output.seek(0)
        
        filename = f"products_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products/export-template', methods=['GET'])
@admin_required
def export_products_template():
    """Export empty products template for import"""
    try:
        # Get categories for reference
        categories = Category.query.all()
        
        # Create template data with one example row
        template_data = [{
            'ID': '',  # Empty for new products, fill for updates
            'Name': 'Example Product',
            'Slug': 'example-product',
            'Description': 'This is an example product description',
            'Price': 29.99,
            'Original Price': 39.99,
            'Stock Quantity': 10,
            'Category ID': categories[0].id if categories else 1,
            'Images': '/uploads/products/image1.jpg, /uploads/products/image2.jpg',
            'Video URL': 'https://example.com/video.mp4',
            'Is Featured': False,
            'Is Active': True,
            'Has Variations': False,
            'Variation Type': '',
            'Variation Name': '',
            'Weight': '1 kg',
            'Dimensions': '10x10x5 cm',
            'Material': 'Cotton'
        }]
        
        # Create categories data for reference
        category_data = []
        for cat in categories:
            category_data.append({
                'ID': cat.id,
                'Name': cat.name,
                'Slug': cat.slug
            })
        
        # Create Excel file in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Products template sheet
            df_template = pd.DataFrame(template_data)
            df_template.to_excel(writer, sheet_name='Products Template', index=False)
            
            # Categories reference sheet
            df_categories = pd.DataFrame(category_data)
            df_categories.to_excel(writer, sheet_name='Categories Reference', index=False)
        
        output.seek(0)
        
        filename = f"products_import_template_{datetime.now().strftime('%Y%m%d')}.xlsx"
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Products Management endpoints
@admin_bp.route('/products', methods=['GET'])
@admin_required
def get_admin_products():
    try:
        products = Product.query.order_by(Product.created_at.desc()).all()
        
        return jsonify({
            'products': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'description': p.description,
                'price': p.price,
                'original_price': p.original_price,
                'stock_quantity': p.stock_quantity,
                'category': p.category.name,
                'category_id': p.category_id,
                'images': p.images or [],
                'video_url': p.video_url,
                'is_featured': p.is_featured,
                'is_active': p.is_active,
                'has_variations': p.has_variations,
                'variation_type': p.variation_type,
                'variation_name': p.variation_name,
                'variation_options': p.variation_options or []
            } for p in products]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def filter_empty_variations(variation_options):
    """Boş varyasyonları filtrele"""
    if not variation_options:
        return []
    
    filtered_options = []
    for option in variation_options:
        if isinstance(option, dict) and option.get('name', '').strip():
            filtered_options.append(option)
    
    return filtered_options

@admin_bp.route('/products', methods=['POST'])
@admin_required
def create_admin_product():
    try:
        # Safely get JSON data
        try:
            data = request.get_json()
        except Exception as json_error:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        if not data or not all(k in data for k in ('name', 'slug', 'price', 'category_id')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Boş varyasyonları filtrele
        variation_options = filter_empty_variations(data.get('variation_options', []))
        
        product = Product(
            name=data['name'],
            slug=data['slug'],
            description=data.get('description', ''),
            price=data['price'],
            original_price=data.get('original_price'),
            stock_quantity=data.get('stock_quantity', 0),
            category_id=data['category_id'],
            images=data.get('images', []),
            video_url=data.get('video_url'),
            is_featured=data.get('is_featured', False),
            is_active=data.get('is_active', True),
            has_variations=data.get('has_variations', False),
            variation_type=data.get('variation_type', ''),
            variation_name=data.get('variation_name', ''),
            variation_options=variation_options,
            weight=data.get('weight', ''),
            dimensions=data.get('dimensions', ''),
            material=data.get('material', '')
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({'message': 'Product created successfully'}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_admin_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = data['price']
        if 'original_price' in data:
            product.original_price = data['original_price']
        if 'stock_quantity' in data:
            product.stock_quantity = data['stock_quantity']
        if 'category_id' in data:
            product.category_id = data['category_id']
        if 'images' in data:
            product.images = data['images']
        if 'video_url' in data:
            product.video_url = data['video_url']

        if 'is_featured' in data:
            product.is_featured = data['is_featured']
        if 'is_active' in data:
            product.is_active = data['is_active']
        if 'has_variations' in data:
            product.has_variations = data['has_variations']
        if 'variation_type' in data:
            product.variation_type = data['variation_type']
        if 'variation_name' in data:
            product.variation_name = data['variation_name']
        if 'variation_options' in data:
            product.variation_options = filter_empty_variations(data['variation_options'])
        if 'weight' in data:
            product.weight = data['weight']
        if 'dimensions' in data:
            product.dimensions = data['dimensions']
        if 'material' in data:
            product.material = data['material']
        
        db.session.commit()
        
        return jsonify({'message': 'Product updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_admin_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products/import-excel', methods=['POST'])
@admin_required
def import_products_excel():
    """Import products from Excel file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith(('.xlsx', '.xls')):
            return jsonify({'error': 'File must be Excel format (.xlsx or .xls)'}), 400
        
        # Try to read Excel file - support both export and template formats
        df = None
        sheet_name = None
        
        try:
            # First try to read as export format (Products sheet)
            df = pd.read_excel(file, sheet_name='Products')
            sheet_name = 'Products'
        except:
            try:
                # Then try template format (Products Template sheet)
                df = pd.read_excel(file, sheet_name='Products Template')
                sheet_name = 'Products Template'
            except:
                # Finally try first sheet
                df = pd.read_excel(file, sheet_name=0)
                sheet_name = 'First Sheet'
        
        if df is None:
            return jsonify({'error': 'Could not read Excel file'}), 400
        
        success_count = 0
        error_count = 0
        errors = []
        updated_count = 0
        
        for index, row in df.iterrows():
            try:
                # Validate required fields
                if pd.isna(row['Name']) or pd.isna(row['Price']):
                    errors.append(f"Row {index + 2}: Name and Price are required")
                    error_count += 1
                    continue
                
                # Check if category exists
                category = Category.query.get(row['Category ID'])
                if not category:
                    errors.append(f"Row {index + 2}: Category ID {row['Category ID']} not found")
                    error_count += 1
                    continue
                
                # Process images
                images = []
                if not pd.isna(row['Images']) and row['Images']:
                    images = [img.strip() for img in str(row['Images']).split(',')]
                
                # Helper function to convert string boolean to actual boolean
                def str_to_bool(value):
                    if pd.isna(value):
                        return False
                    if isinstance(value, bool):
                        return value
                    if isinstance(value, str):
                        return value.upper() in ['TRUE', '1', 'YES', 'Y']
                    return bool(value)
                
                # Helper function to generate unique slug
                def generate_unique_slug(base_slug, product_id=None):
                    slug = base_slug
                    counter = 1
                    while True:
                        # Check if slug exists (excluding current product if updating)
                        query = Product.query.filter_by(slug=slug)
                        if product_id:
                            query = query.filter(Product.id != product_id)
                        
                        if not query.first():
                            return slug
                        
                        slug = f"{base_slug}-{counter}"
                        counter += 1
                
                # Check if this is an update (has ID) or new product
                product_id = None
                if 'ID' in row and not pd.isna(row['ID']):
                    product_id = int(row['ID'])
                    product = Product.query.get(product_id)
                    if product:
                        # Update existing product
                        product.name = str(row['Name'])
                        # Generate unique slug for update
                        base_slug = str(row['Slug']) if not pd.isna(row['Slug']) else str(row['Name']).lower().replace(' ', '-')
                        product.slug = generate_unique_slug(base_slug, product.id)
                        product.description = str(row['Description']) if not pd.isna(row['Description']) else ''
                        product.price = float(row['Price'])
                        product.original_price = float(row['Original Price']) if not pd.isna(row['Original Price']) else None
                        product.stock_quantity = int(row['Stock Quantity']) if not pd.isna(row['Stock Quantity']) else 0
                        product.category_id = int(row['Category ID'])
                        product.images = images
                        product.video_url = str(row['Video URL']) if not pd.isna(row['Video URL']) else None
                        product.is_featured = str_to_bool(row['Is Featured'])
                        product.is_active = str_to_bool(row['Is Active']) if not pd.isna(row['Is Active']) else True
                        product.has_variations = str_to_bool(row['Has Variations'])
                        product.variation_type = str(row['Variation Type']) if not pd.isna(row['Variation Type']) else ''
                        product.variation_name = str(row['Variation Name']) if not pd.isna(row['Variation Name']) else ''
                        product.weight = str(row['Weight']) if not pd.isna(row['Weight']) else ''
                        product.dimensions = str(row['Dimensions']) if not pd.isna(row['Dimensions']) else ''
                        product.material = str(row['Material']) if not pd.isna(row['Material']) else ''
                        
                        updated_count += 1
                        continue
                
                # Create new product
                # Generate unique slug for new product
                base_slug = str(row['Slug']) if not pd.isna(row['Slug']) else str(row['Name']).lower().replace(' ', '-')
                unique_slug = generate_unique_slug(base_slug)
                
                product = Product(
                    name=str(row['Name']),
                    slug=unique_slug,
                    description=str(row['Description']) if not pd.isna(row['Description']) else '',
                    price=float(row['Price']),
                    original_price=float(row['Original Price']) if not pd.isna(row['Original Price']) else None,
                    stock_quantity=int(row['Stock Quantity']) if not pd.isna(row['Stock Quantity']) else 0,
                    category_id=int(row['Category ID']),
                    images=images,
                    video_url=str(row['Video URL']) if not pd.isna(row['Video URL']) else None,
                    is_featured=str_to_bool(row['Is Featured']),
                    is_active=str_to_bool(row['Is Active']) if not pd.isna(row['Is Active']) else True,
                    has_variations=str_to_bool(row['Has Variations']),
                    variation_type=str(row['Variation Type']) if not pd.isna(row['Variation Type']) else '',
                    variation_name=str(row['Variation Name']) if not pd.isna(row['Variation Name']) else '',
                    weight=str(row['Weight']) if not pd.isna(row['Weight']) else '',
                    dimensions=str(row['Dimensions']) if not pd.isna(row['Dimensions']) else '',
                    material=str(row['Material']) if not pd.isna(row['Material']) else ''
                )
                
                db.session.add(product)
                success_count += 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
                error_count += 1
                # Rollback session on error to prevent further issues
                db.session.rollback()
        
        # Commit successful imports
        try:
            if success_count > 0 or updated_count > 0:
                db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Database commit failed: {str(e)}'}), 500
        
        # Create a more detailed message
        if success_count > 0 and updated_count > 0:
            message = f'✅ Excel import completed: {success_count} new products added, {updated_count} products updated'
        elif success_count > 0:
            message = f'✅ Excel import completed: {success_count} new products added'
        elif updated_count > 0:
            message = f'✅ Excel import completed: {updated_count} products updated'
        else:
            message = f'⚠️ Excel import completed but no products were processed'
        
        if error_count > 0:
            message += f' ({error_count} errors)'
        
        if sheet_name:
            message += f' - Source: {sheet_name}'
        
        return jsonify({
            'message': message,
            'imported_count': success_count,  # Frontend expects imported_count
            'updated_count': updated_count,
            'failed_count': error_count,      # Frontend expects failed_count
            'errors': errors[:10]  # Limit to first 10 errors
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 

# User Management Endpoints
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_admin_users():
    """Get all users for admin management"""
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get filter parameters
        search_term = request.args.get('search', '')
        is_admin_filter = request.args.get('is_admin', '')
        
        # Build query
        query = User.query
        
        # Apply search filter
        if search_term:
            query = query.filter(
                db.or_(
                    User.username.ilike(f'%{search_term}%'),
                    User.email.ilike(f'%{search_term}%'),
                    User.first_name.ilike(f'%{search_term}%'),
                    User.last_name.ilike(f'%{search_term}%')
                )
            )
        
        # Apply admin filter
        if is_admin_filter == 'true':
            query = query.filter(User.is_admin == True)
        elif is_admin_filter == 'false':
            query = query.filter(User.is_admin == False)
        
        # Order by creation date (newest first)
        query = query.order_by(User.created_at.desc())
        
        # Get total count before pagination
        total_users = query.count()
        
        # Apply pagination
        users_paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Format users data
        users_data = []
        for user in users_paginated.items:
            # Get user statistics
            user_orders = Order.query.filter_by(user_id=user.id).count()
            user_total_spent = db.session.query(db.func.sum(Order.total_amount)).filter_by(user_id=user.id, payment_status='paid').scalar() or 0
            
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'address': user.address,
                'is_admin': user.is_admin,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'total_orders': user_orders,
                'total_spent': float(user_total_spent)
            })
        
        return jsonify({
            'users': users_data,
            'page': page,
            'per_page': per_page,
            'total': total_users,
            'pages': users_paginated.pages,
            'has_next': users_paginated.has_next,
            'has_prev': users_paginated.has_prev
        })
        
    except Exception as e:
        print(f'❌ Error fetching users: {str(e)}')
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_admin_user(user_id):
    """Get specific user details"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Get user statistics
        user_orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).limit(10).all()
        total_orders = Order.query.filter_by(user_id=user.id).count()
        total_spent = db.session.query(db.func.sum(Order.total_amount)).filter_by(user_id=user.id, payment_status='paid').scalar() or 0
        
        # Get user addresses
        addresses = UserAddress.query.filter_by(user_id=user.id).all()
        
        return jsonify({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'address': user.address,
                'is_admin': user.is_admin,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'total_orders': total_orders,
                'total_spent': float(total_spent)
            },
            'orders': [{
                'id': order.id,
                'order_number': order.order_number,
                'total_amount': order.total_amount,
                'status': order.status,
                'payment_status': order.payment_status,
                'created_at': order.created_at.isoformat()
            } for order in user_orders],
            'addresses': [{
                'id': addr.id,
                'title': addr.title,
                'address_line1': addr.address_line1,
                'address_line2': addr.address_line2,
                'city': addr.city,
                'state': addr.state,
                'postal_code': addr.postal_code,
                'country': addr.country,
                'is_default': addr.is_default
            } for addr in addresses]
        })
        
    except Exception as e:
        print(f'❌ Error fetching user {user_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_admin_user(user_id):
    """Update user information"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Update user fields
        if 'username' in data:
            # Check if username is already taken by another user
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Username already taken'}), 400
            user.username = data['username']
        
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Email already registered'}), 400
            user.email = data['email']
        
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'address' in data:
            user.address = data['address']
        if 'is_admin' in data:
            user.is_admin = data['is_admin']
        
        # Update password if provided
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({'message': 'User updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        print(f'❌ Error updating user {user_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_admin_user(user_id):
    """Delete user (soft delete - deactivate)"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Prevent deleting admin users
        if user.is_admin:
            return jsonify({'error': 'Cannot delete admin users'}), 400
        
        # Check if user has orders
        user_orders = Order.query.filter_by(user_id=user.id).count()
        if user_orders > 0:
            return jsonify({'error': 'Cannot delete user with existing orders'}), 400
        
        # Delete user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        print(f'❌ Error deleting user {user_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500 

@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_admin_orders():
    """Get all orders for admin"""
    try:
        orders = Order.query.all()
        
        orders_data = []
        for order in orders:
            user = User.query.get(order.user_id)
            orders_data.append({
                'id': order.id,
                'user_id': order.user_id,
                'user_email': user.email if user else 'Unknown',
                'total_amount': float(order.total_amount) if order.total_amount else 0,
                'status': order.status,
                'created_at': order.created_at.isoformat() if order.created_at else None,
                'updated_at': order.updated_at.isoformat() if order.updated_at else None
            })
        
        return jsonify(orders_data)
        
    except Exception as e:
        print(f'Error fetching admin orders: {str(e)}')
        return jsonify({'error': str(e)}), 500 


# Invoice Management Endpoints
@admin_bp.route('/invoices', methods=['GET'])
@admin_required
def get_admin_invoices():
    """Get all invoices for admin"""
    try:
        invoices = Invoice.query.order_by(Invoice.created_at.desc()).all()
        
        invoices_data = []
        for invoice in invoices:
            order = Order.query.get(invoice.order_id) if invoice.order_id else None
            user = User.query.get(invoice.user_id) if invoice.user_id else None
            
            invoices_data.append({
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'order_id': invoice.order_id,
                'order_number': order.order_number if order else None,
                'user_id': invoice.user_id,
                'user_email': user.email if user else None,
                'customer_name': invoice.customer_name,
                'customer_email': invoice.customer_email,
                'subtotal': float(invoice.subtotal) if invoice.subtotal else 0,
                'tax_rate': float(invoice.tax_rate) if invoice.tax_rate else 0,
                'tax_amount': float(invoice.tax_amount) if invoice.tax_amount else 0,
                'discount_amount': float(invoice.discount_amount) if invoice.discount_amount else 0,
                'total_amount': float(invoice.total_amount) if invoice.total_amount else 0,
                'status': invoice.status,
                'payment_status': invoice.payment_status,
                'invoice_date': invoice.invoice_date.isoformat() if invoice.invoice_date else None,
                'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
                'created_at': invoice.created_at.isoformat() if invoice.created_at else None
            })
            
        return jsonify(invoices_data)
        
    except Exception as e:
        print(f'Error fetching admin invoices: {str(e)}')
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/invoices', methods=['POST'])
@admin_required
def create_admin_invoice():
    """Create new invoice (admin endpoint)"""
    try:
        # Safely get JSON data
        try:
            data = request.get_json()
        except Exception as json_error:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['order_id', 'customer_name', 'customer_email']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if order exists
        order = Order.query.get(data['order_id'])
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Generate invoice number
        from app.utils.invoice_pdf import generate_invoice_number
        invoice_number = generate_invoice_number()
        
        # Calculate amounts
        subtotal = data.get('subtotal', order.subtotal if hasattr(order, 'subtotal') else order.total_amount)
        tax_rate = data.get('tax_rate', 0.06)
        tax_amount = subtotal * tax_rate
        discount_amount = data.get('discount_amount', 0.0)
        total_amount = subtotal + tax_amount - discount_amount
        
        # Calculate due date (default 30 days)
        from datetime import datetime, timedelta
        due_date = datetime.utcnow() + timedelta(days=data.get('due_days', 30))
        
        # Create invoice
        invoice = Invoice(
            invoice_number=invoice_number,
            order_id=order.id,
            user_id=order.user_id,
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            total_amount=total_amount,
            due_date=due_date,
            status=data.get('status', 'draft'),
            payment_status=data.get('payment_status', 'pending'),
            notes=data.get('notes', ''),
            invoice_date=datetime.utcnow()
        )
        
        db.session.add(invoice)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Invoice created successfully',
            'invoice': {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'order_id': invoice.order_id,
                'total_amount': float(invoice.total_amount)
            }
        }), 201
        
    except Exception as e:
        print(f'Error creating admin invoice: {str(e)}')
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/invoices/stats', methods=['GET'])
@admin_required
def get_admin_invoice_stats():
    """Get invoice statistics for admin"""
    try:
        stats = {
            'total_invoices': Invoice.query.count(),
            'total_amount': db.session.query(db.func.sum(Invoice.total_amount)).scalar() or 0,
            'paid_invoices': Invoice.query.filter_by(payment_status='paid').count(),
            'pending_invoices': Invoice.query.filter_by(payment_status='pending').count(),
            'overdue_invoices': Invoice.query.filter(
                Invoice.due_date < db.func.current_date(),
                Invoice.payment_status != 'paid'
            ).count()
        }
        
        return jsonify(stats)
        
    except Exception as e:
        print(f'Error fetching invoice stats: {str(e)}')
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/orders/<int:order_id>/create-invoice', methods=['POST'])
@admin_required
def create_invoice_from_order_admin(order_id):
    """Create invoice from existing order (admin endpoint)"""
    try:
        from app.models.models import Invoice, InvoiceItem
        
        order = Order.query.get_or_404(order_id)
        
        # Check if invoice already exists for this order
        existing_invoice = Invoice.query.filter_by(order_id=order.id).first()
        if existing_invoice:
            # Get replace parameter from request
            replace_existing = False
            if request.is_json and request.json:
                replace_existing = request.json.get('replaceExisting', False)
            
            if not replace_existing:
                return jsonify({
                    'error': 'Invoice already exists',
                    'invoice_exists': True,
                    'existing_invoice_id': existing_invoice.id,
                    'existing_invoice_number': existing_invoice.invoice_number,
                    'message': 'An invoice already exists for this order. Do you want to delete the existing invoice and create a new one?'
                }), 409
            else:
                # Delete existing invoice if user confirmed to replace
                db.session.delete(existing_invoice)
                db.session.commit()
        
        # Generate invoice number
        def generate_invoice_number():
            """Generate unique invoice number"""
            year = datetime.now().year
            month = datetime.now().month
            
            # Find the last invoice number for this month
            last_invoice = Invoice.query.filter(
                Invoice.invoice_number.like(f'PBD-{year}-{month:02d}-%')
            ).order_by(Invoice.created_at.desc()).first()
            
            if last_invoice:
                # Extract the sequence number and increment
                parts = last_invoice.invoice_number.split('-')
                if len(parts) >= 4:
                    sequence = int(parts[3]) + 1
                else:
                    sequence = 1
            else:
                sequence = 1
            
            return f'PBD-{year}-{month:02d}-{sequence:04d}'
        
        # Get customer information
        customer_name = f"{order.user.first_name} {order.user.last_name}"
        customer_email = order.user.email
        
        # Get billing address
        billing_address = ""
        if order.billing_address_obj:
            addr = order.billing_address_obj
            billing_address = f"{addr.address_line1}\n"
            if addr.address_line2:
                billing_address += f"{addr.address_line2}\n"
            billing_address += f"{addr.city}, {addr.state} {addr.postal_code}\n{addr.country}"
        elif order.billing_address:
            billing_address = order.billing_address
        
        # Generate invoice number
        invoice_number = generate_invoice_number()
        
        # Calculate amounts
        subtotal = order.subtotal if hasattr(order, 'subtotal') else order.total_amount
        tax_rate = 0.06  # US Sales Tax 6%
        tax_amount = subtotal * tax_rate
        discount_amount = 0.0
        total_amount = subtotal + tax_amount - discount_amount
        
        # Calculate due date (default 30 days)
        from datetime import timedelta
        due_date = datetime.utcnow() + timedelta(days=30)
        
        # Create invoice
        invoice = Invoice(
            invoice_number=invoice_number,
            order_id=order.id,
            user_id=order.user_id,
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            total_amount=total_amount,
            due_date=due_date,
            status='draft',
            payment_status='pending',
            
            # Company information
            company_name='PEBDEQ',
            company_address='',
            company_tax_number='',
            company_phone='',
            company_email='',
            
            # Customer information
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=order.user.phone or '',
            billing_address=billing_address,
            
            notes='',
            internal_notes=f'Invoice created automatically from order #{order.order_number}'
        )
        
        db.session.add(invoice)
        db.session.flush()  # Get the invoice ID
        
        # Create invoice items from order items
        for order_item in order.order_items:
            invoice_item = InvoiceItem(
                invoice_id=invoice.id,
                product_id=order_item.product_id,
                product_name=order_item.product_name,
                product_description=order_item.product.description if order_item.product else '',
                quantity=order_item.quantity,
                unit_price=order_item.price,
                discount_percentage=0.0,
                line_total=order_item.quantity * order_item.price,
                tax_rate=tax_rate,
                tax_amount=(order_item.quantity * order_item.price) * tax_rate
            )
            db.session.add(invoice_item)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice created successfully from order',
            'invoice': {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'order_id': invoice.order_id,
                'total_amount': float(invoice.total_amount),
                'status': invoice.status,
                'payment_status': invoice.payment_status,
                'created_at': invoice.created_at.isoformat() if invoice.created_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f'❌ Error creating invoice from order {order_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/upload/product-images', methods=['POST'])
@admin_required
def upload_product_images():
    try:
        from werkzeug.utils import secure_filename
        import uuid
        from flask import current_app
        
        # Check for both 'files' and 'images' field names
        files = request.files.getlist('files') or request.files.getlist('images')
        
        if not files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        if all(f.filename == '' for f in files):
            return jsonify({'error': 'No files selected'}), 400
        
        # Create upload folders
        upload_dir = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'products')
        os.makedirs(upload_dir, exist_ok=True)
        
        uploaded_files = []
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        
        for file in files:
            if file.filename == '':
                continue
            
            # Check file extension
            file_ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
            if file_ext not in allowed_extensions:
                continue
            
            # Generate unique filename
            filename = f"{uuid.uuid4().hex}.{file_ext}"
            
            # Save file
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)
            
            # Add file info to list
            url = f'/uploads/products/{filename}'
            uploaded_files.append({
                'filename': filename,
                'url': url
            })
        
        if not uploaded_files:
            return jsonify({'error': 'No valid image files uploaded'}), 400
        
        return jsonify({
            'message': f'{len(uploaded_files)} product images uploaded successfully',
            'files': uploaded_files
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/upload/product-video', methods=['POST'])
@admin_required
def upload_product_video():
    try:
        from werkzeug.utils import secure_filename
        import uuid
        from flask import current_app
        
        # Check for both 'file' and 'video' field names
        file = request.files.get('file') or request.files.get('video')
        
        if not file:
            return jsonify({'error': 'No file uploaded'}), 400
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        allowed_extensions = {'mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'}
        file_ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
        if file_ext not in allowed_extensions:
            return jsonify({'error': 'Invalid file type. Only videos are allowed.'}), 400
        
        # Create upload folders
        upload_dir = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'videos')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        filename = f"{uuid.uuid4().hex}.{file_ext}"
        
        # Save file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Return the URL path
        url = f'/uploads/videos/{filename}'
        
        return jsonify({
            'message': 'Product video uploaded successfully',
            'file_url': url,
            'url': url  # Provide both for compatibility
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500