from flask import Blueprint, request, jsonify
from app.models.models import Category, Product, User
from app import db
import jwt
import os
from functools import wraps

categories_bp = Blueprint('categories', __name__)

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

@categories_bp.route('/categories', methods=['GET'])
@admin_required
def get_categories():
    try:
        print('🔍 DEBUG: Fetching categories from database...')
        categories = Category.query.all()
        print(f'📋 DEBUG: Found {len(categories)} categories')
        
        categories_data = [{
            'id': c.id,
            'name': c.name,
            'slug': c.slug,
            'description': c.description,
            'image_url': c.image_url,
            'background_image_url': c.background_image_url,
            'is_active': c.is_active,
            'sort_order': c.sort_order,
            'product_count': Product.query.filter_by(category_id=c.id).count()
        } for c in categories]
        
        print(f'📋 DEBUG: Categories data: {[cat["name"] for cat in categories_data]}')
        
        return jsonify({
            'categories': categories_data
        })
    
    except Exception as e:
        print(f'❌ DEBUG: Error fetching categories: {str(e)}')
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    try:
        # Safely get JSON data
        try:
            data = request.get_json()
        except Exception as json_error:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Category name is required'}), 400
        
        # Check if category with same name already exists
        existing_category = Category.query.filter_by(name=data['name']).first()
        if existing_category:
            return jsonify({'error': 'Category with this name already exists'}), 400
        
        category = Category(
            name=data['name'],
            slug=data.get('slug', ''),
            description=data.get('description', ''),
            image_url=data.get('image_url'),
            background_image_url=data.get('background_image_url'),
            background_color=data.get('background_color', '#667eea'),
            is_active=data.get('is_active', True),
            is_featured=data.get('is_featured', False),
            sort_order=data.get('sort_order', 0),
            # SEO Fields
            meta_title=data.get('meta_title', ''),
            meta_description=data.get('meta_description', ''),
            meta_keywords=data.get('meta_keywords', ''),
            # Display Settings
            products_per_page=data.get('products_per_page', 12),
            default_sort=data.get('default_sort', 'newest'),
            show_filters=data.get('show_filters', True)
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({'message': 'Category created successfully'}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['PUT'])
@admin_required
def update_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check if name is being changed and if new name already exists
        if 'name' in data and data['name'] != category.name:
            existing_category = Category.query.filter_by(name=data['name']).first()
            if existing_category:
                return jsonify({'error': 'Category with this name already exists'}), 400
        
        # Update fields
        if 'name' in data:
            category.name = data['name']
        if 'slug' in data:
            category.slug = data['slug']
        if 'description' in data:
            category.description = data['description']
        if 'image_url' in data:
            category.image_url = data['image_url']
        if 'background_image_url' in data:
            category.background_image_url = data['background_image_url']
        if 'background_color' in data:
            category.background_color = data['background_color']
        if 'is_active' in data:
            category.is_active = data['is_active']
        if 'is_featured' in data:
            category.is_featured = data['is_featured']
        if 'sort_order' in data:
            category.sort_order = data['sort_order']
        
        # SEO Fields
        if 'meta_title' in data:
            category.meta_title = data['meta_title']
        if 'meta_description' in data:
            category.meta_description = data['meta_description']
        if 'meta_keywords' in data:
            category.meta_keywords = data['meta_keywords']
        
        # Display Settings
        if 'products_per_page' in data:
            category.products_per_page = data['products_per_page']
        if 'default_sort' in data:
            category.default_sort = data['default_sort']
        if 'show_filters' in data:
            category.show_filters = data['show_filters']
        
        db.session.commit()
        
        return jsonify({'message': 'Category updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@admin_required
def delete_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        
        # Check if category has products
        product_count = Product.query.filter_by(category_id=category_id).count()
        if product_count > 0:
            return jsonify({
                'error': f'Cannot delete category. It has {product_count} products. Please move or delete products first.'
            }), 400
        
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({'message': 'Category deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/analytics', methods=['GET'])
@admin_required
def get_category_analytics():
    try:
        from sqlalchemy import func
        
        # Get category analytics
        category_analytics = db.session.query(
            Category.id,
            Category.name,
            Category.slug,
            func.count(Product.id).label('product_count'),
            func.sum(Product.stock_quantity).label('total_stock'),
            func.avg(Product.price).label('avg_price'),
            func.min(Product.price).label('min_price'),
            func.max(Product.price).label('max_price')
        ).outerjoin(Product, Category.id == Product.category_id)\
         .group_by(Category.id)\
         .all()
        
        # Get order analytics per category
        from app.models.models import Order, OrderItem
        order_analytics = db.session.query(
            Category.id,
            func.count(OrderItem.id).label('total_orders'),
            func.sum(OrderItem.quantity).label('total_sold'),
            func.sum(OrderItem.price * OrderItem.quantity).label('total_revenue')
        ).join(Product, Category.id == Product.category_id)\
         .join(OrderItem, Product.id == OrderItem.product_id)\
         .join(Order, OrderItem.order_id == Order.id)\
         .group_by(Category.id)\
         .all()
        
        # Convert to dictionaries
        order_data = {row.id: {
            'total_orders': row.total_orders,
            'total_sold': row.total_sold,
            'total_revenue': float(row.total_revenue) if row.total_revenue else 0
        } for row in order_analytics}
        
        analytics_data = []
        for row in category_analytics:
            category_orders = order_data.get(row.id, {
                'total_orders': 0,
                'total_sold': 0,
                'total_revenue': 0
            })
            
            analytics_data.append({
                'id': row.id,
                'name': row.name,
                'slug': row.slug,
                'product_count': row.product_count,
                'total_stock': row.total_stock or 0,
                'avg_price': float(row.avg_price) if row.avg_price else 0,
                'min_price': float(row.min_price) if row.min_price else 0,
                'max_price': float(row.max_price) if row.max_price else 0,
                'total_orders': category_orders['total_orders'],
                'total_sold': category_orders['total_sold'],
                'total_revenue': category_orders['total_revenue']
            })
        
        return jsonify({
            'analytics': analytics_data,
            'summary': {
                'total_categories': len(analytics_data),
                'total_products': sum(row['product_count'] for row in analytics_data),
                'total_revenue': sum(row['total_revenue'] for row in analytics_data),
                'total_orders': sum(row['total_orders'] for row in analytics_data)
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/bulk-operations', methods=['POST'])
@admin_required
def bulk_category_operations():
    try:
        data = request.get_json()
        
        if not data or not data.get('operation') or not data.get('category_ids'):
            return jsonify({'error': 'Operation and category_ids are required'}), 400
        
        operation = data['operation']
        category_ids = data['category_ids']
        
        categories = Category.query.filter(Category.id.in_(category_ids)).all()
        
        if operation == 'activate':
            for category in categories:
                category.is_active = True
            message = f'{len(categories)} categories activated successfully'
            
        elif operation == 'deactivate':
            for category in categories:
                category.is_active = False
            message = f'{len(categories)} categories deactivated successfully'
            
        elif operation == 'delete':
            # Check if any category has products
            for category in categories:
                product_count = Product.query.filter_by(category_id=category.id).count()
                if product_count > 0:
                    return jsonify({
                        'error': f'Cannot delete category "{category.name}". It has {product_count} products.'
                    }), 400
            
            for category in categories:
                db.session.delete(category)
            message = f'{len(categories)} categories deleted successfully'
            
        else:
            return jsonify({'error': 'Invalid operation'}), 400
        
        db.session.commit()
        return jsonify({'message': message})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/reorder', methods=['POST'])
@admin_required
def reorder_categories():
    try:
        data = request.get_json()
        
        if not data or not data.get('category_orders'):
            return jsonify({'error': 'Category orders are required'}), 400
        
        category_orders = data['category_orders']  # [{'id': 1, 'sort_order': 1}, ...]
        
        for order_data in category_orders:
            category = Category.query.get(order_data['id'])
            if category:
                category.sort_order = order_data['sort_order']
        
        db.session.commit()
        return jsonify({'message': 'Categories reordered successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 