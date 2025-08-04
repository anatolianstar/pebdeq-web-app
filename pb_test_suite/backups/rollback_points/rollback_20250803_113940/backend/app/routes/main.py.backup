from flask import Blueprint, request, jsonify, current_app
from app.models.models import Category, Product, BlogPost, ContactMessage, SiteSettings, Order, OrderItem, User
from app import db
from functools import wraps
import time
import jwt
import os
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import uuid

# Simple cache implementation
_cache = {}

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

def cached(timeout=300):  # 5 minutes default timeout
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Skip cache in debug mode
            if current_app.debug and request.args.get('no_cache') != '1':
                return f(*args, **kwargs)

            cache_key = f.__name__ + str(args) + str(sorted(request.args.items()))

            # Check if we have a valid cached response
            if cache_key in _cache:
                cached_result, timestamp = _cache[cache_key]
                if timestamp > time.time() - timeout:
                    return cached_result

            # If not cached or expired, generate new response
            result = f(*args, **kwargs)
            _cache[cache_key] = (result, time.time())
            return result
        return decorated_function
    return decorator

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/health', methods=['GET'])
def health_check():
    """Public health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'PEBDEQ API is running',
        'timestamp': datetime.now().isoformat()
    })

# Simple visitor tracking
visitor_stats = {
    'today_count': 0,
    'yesterday_count': 0,
    'last_reset': datetime.now().date(),
    'unique_ips': set()
}

def update_visitor_stats():
    """Update daily visitor statistics"""
    today = datetime.now().date()

    # Reset counters if it's a new day
    if today > visitor_stats['last_reset']:
        visitor_stats['yesterday_count'] = visitor_stats['today_count']
        visitor_stats['today_count'] = 0
        visitor_stats['unique_ips'] = set()
        visitor_stats['last_reset'] = today

    # Count visit
    ip = request.remote_addr
    if ip not in visitor_stats['unique_ips']:
        visitor_stats['unique_ips'].add(ip)
        visitor_stats['today_count'] += 1

@main_bp.route('/')
@cached(timeout=60)  # Cache for 1 minute
def home():
    try:
        # Update visitor stats (outside of cache to track accurately)
        update_visitor_stats()
        # Featured products
        featured_products = Product.query.filter_by(
            is_featured=True, 
            is_active=True
        ).limit(8).all()
        
        # Categories
        categories = Category.query.filter_by(is_active=True).all()
        
        # Latest blog posts
        latest_posts = BlogPost.query.filter_by(
            is_published=True
        ).order_by(BlogPost.created_at.desc()).limit(3).all()

        # Discounted products (products with original_price > price)
        discounted_products = Product.query.filter(
            Product.is_active == True,
            Product.original_price.isnot(None),
            Product.original_price > Product.price
        ).order_by(((Product.original_price - Product.price) / Product.original_price).desc()).limit(4).all()

        # Most popular products (based on order count)
        popular_products = Product.query.join(OrderItem).group_by(Product.id).order_by(
            db.func.count(OrderItem.id).desc()
        ).filter(Product.is_active == True).limit(4).all()
        
        # Function to format product data
        def format_product(p):
            return {
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': p.price,
                'original_price': p.original_price,
                'discount_percentage': round((p.original_price - p.price) / p.original_price * 100) if p.original_price else None,
                'images': p.images,
                'category': p.category.name,
                'category_slug': p.category.slug,
                'stock_quantity': p.stock_quantity,
                'is_featured': p.is_featured
            }

        # Get site settings
        site_settings = SiteSettings.query.first()

        # Get total products and orders counts
        total_products = Product.query.filter_by(is_active=True).count()
        total_orders = Order.query.count()

        return jsonify({
            'featured_products': [format_product(p) for p in featured_products],
            'categories': [{
                'id': c.id,
                'name': c.name,
                'slug': c.slug,
                'description': c.description,
                'image_url': c.image_url,
                'background_image_url': c.background_image_url,
                'background_color': c.background_color,
                'is_active': c.is_active,
                'product_count': Product.query.filter_by(category_id=c.id, is_active=True).count()
            } for c in categories],
            'latest_posts': [{
                'id': p.id,
                'title': p.title,
                'slug': p.slug,
                'excerpt': p.excerpt,
                'featured_image': p.featured_image,
                'created_at': p.created_at.isoformat()
            } for p in latest_posts],
            'discounted_products': [format_product(p) for p in discounted_products],
            'popular_products': [format_product(p) for p in popular_products],
            'site_stats': {
                'total_products': total_products,
                'total_orders': total_orders,
                'visitors_today': visitor_stats['today_count'],
                'visitors_yesterday': visitor_stats['yesterday_count']
            },
            'site_settings': {
                'site_name': site_settings.site_name if site_settings else 'PEBDEQ',
                'welcome_title': site_settings.welcome_title if site_settings else 'Welcome to PEBDEQ',
                'welcome_subtitle': site_settings.welcome_subtitle if site_settings else 'Crafted. Vintage. Smart.'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/categories')
def categories():
    try:
        categories = Category.query.filter_by(is_active=True).order_by(Category.sort_order.asc()).all()
        
        categories_data = []
        for c in categories:
            product_count = Product.query.filter_by(category_id=c.id, is_active=True).count()
            categories_data.append({
                'id': c.id,
                'name': c.name,
                'slug': c.slug,
                'description': c.description,
                'image_url': c.image_url,
                'background_image_url': c.background_image_url,
                'background_color': c.background_color,
                'is_active': c.is_active,
                'product_count': product_count,
                'sort_order': c.sort_order
            })
        
        return jsonify({
            'categories': categories_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/products')
def products():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        category = request.args.get('category')
        search = request.args.get('search')
        sort = request.args.get('sort', 'newest')
        
        # Build query
        query = Product.query.filter_by(is_active=True)
        
        # Filter by category if specified
        if category:
            cat = Category.query.filter_by(slug=category, is_active=True).first()
            if cat:
                query = query.filter_by(category_id=cat.id)
        
        # Search if specified
        if search:
            query = query.filter(Product.name.contains(search))
        
        # Sort products
        if sort == 'newest':
            query = query.order_by(Product.created_at.desc())
        elif sort == 'oldest':
            query = query.order_by(Product.created_at.asc())
        elif sort == 'price_low':
            query = query.order_by(Product.price.asc())
        elif sort == 'price_high':
            query = query.order_by(Product.price.desc())
        elif sort == 'name':
            query = query.order_by(Product.name.asc())
        elif sort == 'featured':
            query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())
        else:
            query = query.order_by(Product.created_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        products = pagination.items
        
        # Get category names
        categories = {}
        for p in products:
            if p.category_id not in categories:
                cat = Category.query.get(p.category_id)
                categories[p.category_id] = cat.name if cat else 'Unknown'
        
        return jsonify({
            'products': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'description': p.description,
                'price': p.price,
                'original_price': p.original_price,
                'stock_quantity': p.stock_quantity,
                'category_id': p.category_id,
                'category': categories.get(p.category_id, 'Unknown'),
                'images': p.images,
                'video_url': p.video_url,
                'is_featured': p.is_featured,
                'is_active': p.is_active,
                'has_variations': p.has_variations,
                'variation_type': p.variation_type,
                'variation_name': p.variation_name,
                'created_at': p.created_at.isoformat(),
                'updated_at': p.updated_at.isoformat()
            } for p in products],
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/contact', methods=['POST'])
def contact():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('name', 'email', 'message')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        message = ContactMessage(
            name=data['name'],
            email=data['email'],
            subject=data.get('subject', ''),
            message=data['message']
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify({'message': 'Message sent successfully'}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/blog')
def blog_list():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        posts = BlogPost.query.filter_by(
            is_published=True
        ).order_by(BlogPost.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'posts': [{
                'id': p.id,
                'title': p.title,
                'slug': p.slug,
                'excerpt': p.excerpt,
                'author': p.author,
                'category': p.category,
                'featured_image': p.featured_image,
                'created_at': p.created_at.isoformat()
            } for p in posts.items],
            'pagination': {
                'page': posts.page,
                'pages': posts.pages,
                'per_page': posts.per_page,
                'total': posts.total
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/blog/<slug>')
def blog_detail(slug):
    try:
        post = BlogPost.query.filter_by(slug=slug, is_published=True).first()
        
        if not post:
            return jsonify({'error': 'Blog post not found'}), 404
        
        return jsonify({
            'id': post.id,
            'title': post.title,
            'slug': post.slug,
            'content': post.content,
            'author': post.author,
            'category': post.category,
            'featured_image': post.featured_image,
            'created_at': post.created_at.isoformat(),
            'updated_at': post.updated_at.isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== ADMIN BLOG ENDPOINTS ==========

@main_bp.route('/api/admin/blog', methods=['GET'])
@token_required
def admin_blog_list(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        posts = BlogPost.query.order_by(BlogPost.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'posts': [{
                'id': p.id,
                'title': p.title,
                'slug': p.slug,
                'excerpt': p.excerpt,
                'author': p.author,
                'category': p.category,
                'featured_image': p.featured_image,
                'is_published': p.is_published,
                'created_at': p.created_at.isoformat(),
                'updated_at': p.updated_at.isoformat()
            } for p in posts.items],
            'pagination': {
                'page': posts.page,
                'pages': posts.pages,
                'per_page': posts.per_page,
                'total': posts.total
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/admin/blog', methods=['POST'])
@token_required
def admin_create_blog_post(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        if not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        
        # Generate slug from title if not provided
        slug = data.get('slug', '').strip()
        if not slug:
            slug = data['title'].lower().replace(' ', '-').replace('_', '-')
            # Remove special characters
            import re
            slug = re.sub(r'[^a-z0-9-]', '', slug)
            slug = re.sub(r'-+', '-', slug).strip('-')
        
        # Check if slug already exists
        existing_post = BlogPost.query.filter_by(slug=slug).first()
        if existing_post:
            return jsonify({'error': 'A blog post with this slug already exists'}), 400
        
        # Create new blog post
        new_post = BlogPost(
            title=data['title'],
            slug=slug,
            content=data['content'],
            excerpt=data.get('excerpt', ''),
            author=data.get('author', 'Admin'),
            category=data.get('category', ''),
            featured_image=data.get('featured_image', ''),
            is_published=data.get('is_published', False)
        )
        
        db.session.add(new_post)
        db.session.commit()
        
        return jsonify({
            'message': 'Blog post created successfully',
            'post': {
                'id': new_post.id,
                'title': new_post.title,
                'slug': new_post.slug,
                'excerpt': new_post.excerpt,
                'author': new_post.author,
                'category': new_post.category,
                'featured_image': new_post.featured_image,
                'is_published': new_post.is_published,
                'created_at': new_post.created_at.isoformat(),
                'updated_at': new_post.updated_at.isoformat()
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/admin/blog/<int:post_id>', methods=['GET'])
@token_required
def admin_get_blog_post(current_user, post_id):
    try:
        post = BlogPost.query.get(post_id)
        
        if not post:
            return jsonify({'error': 'Blog post not found'}), 404
        
        return jsonify({
            'id': post.id,
            'title': post.title,
            'slug': post.slug,
            'content': post.content,
            'excerpt': post.excerpt,
            'author': post.author,
            'category': post.category,
            'featured_image': post.featured_image,
            'is_published': post.is_published,
            'created_at': post.created_at.isoformat(),
            'updated_at': post.updated_at.isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/admin/blog/<int:post_id>', methods=['PUT'])
@token_required
def admin_update_blog_post(current_user, post_id):
    try:
        post = BlogPost.query.get(post_id)
        
        if not post:
            return jsonify({'error': 'Blog post not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        if not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        
        # Update slug if title changed
        if data['title'] != post.title:
            new_slug = data.get('slug', '').strip()
            if not new_slug:
                new_slug = data['title'].lower().replace(' ', '-').replace('_', '-')
                import re
                new_slug = re.sub(r'[^a-z0-9-]', '', new_slug)
                new_slug = re.sub(r'-+', '-', new_slug).strip('-')
            
            # Check if new slug conflicts with existing posts (excluding current post)
            existing_post = BlogPost.query.filter(
                BlogPost.slug == new_slug,
                BlogPost.id != post_id
            ).first()
            if existing_post:
                return jsonify({'error': 'A blog post with this slug already exists'}), 400
            
            post.slug = new_slug
        
        # Update fields
        post.title = data['title']
        post.content = data['content']
        post.excerpt = data.get('excerpt', post.excerpt)
        post.author = data.get('author', post.author)
        post.category = data.get('category', post.category)
        post.featured_image = data.get('featured_image', post.featured_image)
        post.is_published = data.get('is_published', post.is_published)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Blog post updated successfully',
            'post': {
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'excerpt': post.excerpt,
                'author': post.author,
                'category': post.category,
                'featured_image': post.featured_image,
                'is_published': post.is_published,
                'created_at': post.created_at.isoformat(),
                'updated_at': post.updated_at.isoformat()
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/admin/blog/<int:post_id>', methods=['DELETE'])
@token_required
def admin_delete_blog_post(current_user, post_id):
    try:
        post = BlogPost.query.get(post_id)
        
        if not post:
            return jsonify({'error': 'Blog post not found'}), 404
        
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({'message': 'Blog post deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/admin/blog/<int:post_id>/toggle-publish', methods=['POST'])
@token_required
def admin_toggle_blog_publish(current_user, post_id):
    try:
        post = BlogPost.query.get(post_id)
        
        if not post:
            return jsonify({'error': 'Blog post not found'}), 404
        
        post.is_published = not post.is_published
        db.session.commit()
        
        status = 'published' if post.is_published else 'unpublished'
        return jsonify({
            'message': f'Blog post {status} successfully',
            'is_published': post.is_published
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/site-settings')
def get_site_settings():
    try:
        settings = SiteSettings.query.first()
        if settings:
            return jsonify({
                # Site Identity
                'site_name': settings.site_name,
                'site_logo': settings.site_logo,
                'use_logo': settings.use_logo,
                'logo_width': settings.logo_width,
                'logo_height': settings.logo_height,
                'site_logo2': settings.site_logo2,
                'use_logo2': settings.use_logo2,
                'logo2_width': settings.logo2_width,
                'logo2_height': settings.logo2_height,
                'logo_shadow_enabled': settings.logo_shadow_enabled,
                'logo_shadow_color': settings.logo_shadow_color,
                'logo_shadow_blur': settings.logo_shadow_blur,
                'logo_shadow_offset_x': settings.logo_shadow_offset_x,
                'logo_shadow_offset_y': settings.logo_shadow_offset_y,
                'logo_shadow_opacity': settings.logo_shadow_opacity,
                'logo2_shadow_enabled': settings.logo2_shadow_enabled,
                'logo2_shadow_color': settings.logo2_shadow_color,
                'logo2_shadow_blur': settings.logo2_shadow_blur,
                'logo2_shadow_offset_x': settings.logo2_shadow_offset_x,
                'logo2_shadow_offset_y': settings.logo2_shadow_offset_y,
                'logo2_shadow_opacity': settings.logo2_shadow_opacity,

                # Marquee
                'marquee_enabled': settings.marquee_enabled,
                'marquee_text': settings.marquee_text,
                'marquee_font_family': settings.marquee_font_family,
                'marquee_font_size': settings.marquee_font_size,
                'marquee_font_weight': settings.marquee_font_weight,
                'marquee_color': settings.marquee_color,
                'marquee_background_color': settings.marquee_background_color,
                'marquee_speed': settings.marquee_speed,
                'marquee_direction': settings.marquee_direction,
                'marquee_pause_on_hover': settings.marquee_pause_on_hover,

                # Header
                'header_background_color': settings.header_background_color,
                'header_text_color': settings.header_text_color,
                'header_padding': settings.header_padding,
                'header_sticky': settings.header_sticky,
                'header_shadow': settings.header_shadow,
                'header_border_bottom': settings.header_border_bottom,
                'header_border_color': settings.header_border_color,
                'header_logo_position': getattr(settings, 'header_logo_position', 'left'),
                'header_nav_position': getattr(settings, 'header_nav_position', 'right'),
                'header_nav_spacing': getattr(settings, 'header_nav_spacing', 20),

                # Navigation
                'navigation_links': settings.navigation_links or [],
                'nav_link_color': settings.nav_link_color,
                'nav_link_hover_color': settings.nav_link_hover_color,
                'nav_link_active_color': settings.nav_link_active_color,
                'nav_link_font_size': settings.nav_link_font_size,
                'nav_link_font_weight': settings.nav_link_font_weight,
                'nav_link_text_transform': settings.nav_link_text_transform,
                'nav_link_underline': settings.nav_link_underline,
                'nav_link_hover_effect': settings.nav_link_hover_effect,
                'nav_link_font_family': settings.nav_link_font_family,
                'nav_link_text_shadow': settings.nav_link_text_shadow,
                
                # Footer
                'footer_show_section': settings.footer_show_section,
                'footer_background_color': settings.footer_background_color,
                'footer_text_color': settings.footer_text_color,
                'footer_company_name': settings.footer_company_name,
                'footer_company_description': settings.footer_company_description,
                'footer_copyright_text': settings.footer_copyright_text,
                'footer_use_logo': settings.footer_use_logo,
                'footer_logo': settings.footer_logo,
                'footer_logo_width': settings.footer_logo_width,
                'footer_logo_height': settings.footer_logo_height,
                'footer_support_title': settings.footer_support_title,
                'footer_support_show_section': settings.footer_support_show_section,
                'footer_support_links': settings.footer_support_links,
                'footer_quick_links_title': settings.footer_quick_links_title,
                'footer_quick_links_show_section': settings.footer_quick_links_show_section,
                'footer_quick_links': settings.footer_quick_links,
                'footer_social_title': settings.footer_social_title,
                'footer_social_show_section': settings.footer_social_show_section,
                'footer_newsletter_title': settings.footer_newsletter_title,
                'footer_newsletter_show_section': settings.footer_newsletter_show_section,
                'footer_newsletter_description': settings.footer_newsletter_description,
                'footer_newsletter_placeholder': settings.footer_newsletter_placeholder,
                'footer_newsletter_button_text': settings.footer_newsletter_button_text,
                'footer_legal_title': settings.footer_legal_title,
                'footer_legal_show_section': settings.footer_legal_show_section,
                'footer_legal_privacy_policy_title': settings.footer_legal_privacy_policy_title,
                'footer_legal_terms_of_service_title': settings.footer_legal_terms_of_service_title,
                'footer_legal_return_policy_title': settings.footer_legal_return_policy_title,
                'footer_legal_shipping_policy_title': settings.footer_legal_shipping_policy_title,
                'footer_legal_cookie_policy_title': settings.footer_legal_cookie_policy_title,
                'footer_legal_dmca_notice_title': settings.footer_legal_dmca_notice_title,
                'footer_legal_accessibility_statement_title': settings.footer_legal_accessibility_statement_title,

                # Social
                'social_instagram': settings.social_instagram,
                'social_facebook': settings.social_facebook,
                'social_twitter': settings.social_twitter,
                'social_youtube': settings.social_youtube,
                'social_linkedin': settings.social_linkedin,

                # Welcome Section
                'welcome_title': settings.welcome_title,
                'welcome_subtitle': settings.welcome_subtitle,
                'welcome_background_image': settings.welcome_background_image,
                'welcome_background_color': settings.welcome_background_color,
                'welcome_text_color': settings.welcome_text_color,
                'welcome_button_text': settings.welcome_button_text,
                'welcome_button_link': settings.welcome_button_link,
                'welcome_button_color': settings.welcome_button_color,
                
                # Homepage General
                'homepage_background_color': settings.homepage_background_color,
                
                # Collections Section
                'collections_title': settings.collections_title,
                'collections_show_categories': settings.collections_show_categories,
                'collections_categories_per_row': settings.collections_categories_per_row,
                'collections_max_rows': settings.collections_max_rows,
                'collections_show_section': settings.collections_show_section,
                
                # About Page Settings
                'about_page_title': settings.about_page_title,
                'about_page_subtitle': settings.about_page_subtitle,
                'about_page_content': settings.about_page_content,
                'about_page_mission_title': settings.about_page_mission_title,
                'about_page_mission_content': settings.about_page_mission_content,
                'about_page_values_title': settings.about_page_values_title,
                'about_page_values_content': settings.about_page_values_content,
                'about_page_team_title': settings.about_page_team_title,
                'about_page_team_content': settings.about_page_team_content,
                'about_page_history_title': settings.about_page_history_title,
                'about_page_history_content': settings.about_page_history_content,
                'about_page_contact_title': settings.about_page_contact_title,
                'about_page_contact_content': settings.about_page_contact_content,
                'about_page_show_mission': settings.about_page_show_mission,
                'about_page_show_values': settings.about_page_show_values,
                'about_page_show_team': settings.about_page_show_team,
                'about_page_show_history': settings.about_page_show_history,
                'about_page_show_contact': settings.about_page_show_contact,
                'about_page_background_image': settings.about_page_background_image,
                'about_page_background_color': settings.about_page_background_color,
                
                # Homepage Products Section 1
                'homepage_products_show_section': settings.homepage_products_show_section,
                'homepage_products_title': settings.homepage_products_title,
                'homepage_products_subtitle': settings.homepage_products_subtitle,
                'homepage_products_max_rows': settings.homepage_products_max_rows,
                'homepage_products_per_row': settings.homepage_products_per_row,
                'homepage_products_max_items': settings.homepage_products_max_items,
                'homepage_products_show_images': settings.homepage_products_show_images,
                'homepage_products_image_height': settings.homepage_products_image_height,
                'homepage_products_image_width': settings.homepage_products_image_width,
                'homepage_products_show_favorite': settings.homepage_products_show_favorite,
                'homepage_products_show_buy_now': settings.homepage_products_show_buy_now,
                'homepage_products_show_details': settings.homepage_products_show_details,
                'homepage_products_show_price': settings.homepage_products_show_price,
                'homepage_products_show_original_price': settings.homepage_products_show_original_price,
                'homepage_products_show_stock': settings.homepage_products_show_stock,
                'homepage_products_show_category': settings.homepage_products_show_category,
                'homepage_products_sort_by': settings.homepage_products_sort_by,
                'homepage_products_filter_categories': settings.homepage_products_filter_categories,
                'homepage_products_show_view_all': settings.homepage_products_show_view_all,
                'homepage_products_view_all_text': settings.homepage_products_view_all_text,
                'homepage_products_view_all_link': settings.homepage_products_view_all_link,
                'homepage_products_card_style': settings.homepage_products_card_style,
                'homepage_products_card_shadow': settings.homepage_products_card_shadow,
                'homepage_products_card_hover_effect': settings.homepage_products_card_hover_effect,
                'homepage_products_show_badges': settings.homepage_products_show_badges,
                'homepage_products_show_rating': settings.homepage_products_show_rating,
                'homepage_products_show_quick_view': settings.homepage_products_show_quick_view,
                'homepage_products_enable_image_preview': settings.homepage_products_enable_image_preview,
                
                # Homepage Products Section 2
                'homepage_products2_show_section': settings.homepage_products2_show_section,
                'homepage_products2_title': settings.homepage_products2_title,
                'homepage_products2_subtitle': settings.homepage_products2_subtitle,
                'homepage_products2_max_rows': settings.homepage_products2_max_rows,
                'homepage_products2_per_row': settings.homepage_products2_per_row,
                'homepage_products2_max_items': settings.homepage_products2_max_items,
                'homepage_products2_show_images': settings.homepage_products2_show_images,
                'homepage_products2_image_height': settings.homepage_products2_image_height,
                'homepage_products2_image_width': settings.homepage_products2_image_width,
                'homepage_products2_show_favorite': settings.homepage_products2_show_favorite,
                'homepage_products2_show_buy_now': settings.homepage_products2_show_buy_now,
                'homepage_products2_show_details': settings.homepage_products2_show_details,
                'homepage_products2_show_price': settings.homepage_products2_show_price,
                'homepage_products2_show_original_price': settings.homepage_products2_show_original_price,
                'homepage_products2_show_stock': settings.homepage_products2_show_stock,
                'homepage_products2_show_category': settings.homepage_products2_show_category,
                'homepage_products2_sort_by': settings.homepage_products2_sort_by,
                'homepage_products2_filter_categories': settings.homepage_products2_filter_categories,
                'homepage_products2_show_view_all': settings.homepage_products2_show_view_all,
                'homepage_products2_view_all_text': settings.homepage_products2_view_all_text,
                'homepage_products2_view_all_link': settings.homepage_products2_view_all_link,
                'homepage_products2_card_style': settings.homepage_products2_card_style,
                'homepage_products2_card_shadow': settings.homepage_products2_card_shadow,
                'homepage_products2_card_hover_effect': settings.homepage_products2_card_hover_effect,
                'homepage_products2_show_badges': settings.homepage_products2_show_badges,
                'homepage_products2_show_rating': settings.homepage_products2_show_rating,
                'homepage_products2_show_quick_view': settings.homepage_products2_show_quick_view,
                'homepage_products2_enable_image_preview': settings.homepage_products2_enable_image_preview,

                # Products Page Settings
                'products_page_background_color': settings.products_page_background_color,
                'products_page_per_row': settings.products_page_per_row,
                'products_page_max_items_per_page': settings.products_page_max_items_per_page,
                'products_page_show_images': settings.products_page_show_images,
                'products_page_show_favorite': settings.products_page_show_favorite,
                'products_page_show_buy_now': settings.products_page_show_buy_now,
                'products_page_show_details': settings.products_page_show_details,
                'products_page_show_price': settings.products_page_show_price,
                'products_page_show_original_price': settings.products_page_show_original_price,
                'products_page_show_stock': settings.products_page_show_stock,
                'products_page_show_category': settings.products_page_show_category,
                'products_page_default_sort_by': settings.products_page_default_sort_by,
                'products_page_card_style': settings.products_page_card_style,
                'products_page_card_shadow': settings.products_page_card_shadow,
                'products_page_card_hover_effect': settings.products_page_card_hover_effect,
                'products_page_show_badges': settings.products_page_show_badges,
                'products_page_enable_pagination': getattr(settings, 'products_page_enable_pagination', True),
                'products_page_enable_filters': getattr(settings, 'products_page_enable_filters', True),
                'products_page_enable_search': getattr(settings, 'products_page_enable_search', True),
                'products_page_enable_image_preview': getattr(settings, 'products_page_enable_image_preview', True),
                
                # Button Colors
                'homepage_products_view_details_button_color': settings.homepage_products_view_details_button_color,
                'homepage_products_view_details_button_text_color': settings.homepage_products_view_details_button_text_color,
                'homepage_products_add_to_cart_button_color': settings.homepage_products_add_to_cart_button_color,
                'homepage_products_add_to_cart_button_text_color': settings.homepage_products_add_to_cart_button_text_color,
                'homepage_products2_view_details_button_color': settings.homepage_products2_view_details_button_color,
                'homepage_products2_view_details_button_text_color': settings.homepage_products2_view_details_button_text_color,
                'homepage_products2_add_to_cart_button_color': settings.homepage_products2_add_to_cart_button_color,
                'homepage_products2_add_to_cart_button_text_color': settings.homepage_products2_add_to_cart_button_text_color,
                'products_page_view_details_button_color': settings.products_page_view_details_button_color,
                'products_page_view_details_button_text_color': settings.products_page_view_details_button_text_color,
                'products_page_add_to_cart_button_color': settings.products_page_add_to_cart_button_color,
                'products_page_add_to_cart_button_text_color': settings.products_page_add_to_cart_button_text_color,
                'product_detail_add_to_cart_button_color': settings.product_detail_add_to_cart_button_color,
                'product_detail_add_to_cart_button_text_color': settings.product_detail_add_to_cart_button_text_color,
                'product_detail_buy_now_button_color': settings.product_detail_buy_now_button_color,
                'product_detail_buy_now_button_text_color': settings.product_detail_buy_now_button_text_color,
                'product_detail_continue_shopping_button_color': settings.product_detail_continue_shopping_button_color,
                'product_detail_continue_shopping_button_text_color': settings.product_detail_continue_shopping_button_text_color,
            })
        else:
            # Return default settings if none are in the database
            return jsonify({
                'site_name': 'pebdeq',
                'site_logo': None,
                'use_logo': False,
                'logo_width': 120,
                'logo_height': 40,
                'site_logo2': None,
                'use_logo2': False,
                'logo2_width': 120,
                'logo2_height': 40,
                'marquee_enabled': False,
                'marquee_text': 'Welcome to our store! Special offers available now.',
                'marquee_font_family': 'Arial, sans-serif',
                'marquee_font_size': '14px',
                'marquee_font_weight': 'normal',
                'marquee_color': '#ffffff',
                'marquee_background_color': '#ff6b6b',
                'marquee_speed': 30,
                'marquee_direction': 'left',
                'marquee_pause_on_hover': True,
                'welcome_title': 'Welcome to Pebdeq',
                'welcome_subtitle': 'Crafted. Vintage. Smart.',
                'welcome_background_image': None,
                'welcome_background_color': '#667eea',
                'welcome_text_color': '#ffffff',
                'welcome_button_text': 'Explore Products',
                'welcome_button_link': '/products',
                'welcome_button_color': '#00b894',
                'homepage_background_color': '#ffffff',
                'collections_title': 'Our Collections',
                'collections_show_categories': [],
                'collections_categories_per_row': 4,
                'collections_max_rows': 1,
                'collections_show_section': True,
                'homepage_products_show_section': True,
                'homepage_products_title': 'Featured Products',
                'homepage_products_subtitle': 'Discover our most popular items',
                'homepage_products_max_rows': 2,
                'homepage_products_per_row': 4,
                'homepage_products_max_items': 8,
                'homepage_products_show_images': True,
                'homepage_products_image_height': 200,
                'homepage_products_image_width': 300,
                'homepage_products_show_favorite': True,
                'homepage_products_show_buy_now': True,
                'homepage_products_show_details': True,
                'homepage_products_show_price': True,
                'homepage_products_show_original_price': True,
                'homepage_products_show_stock': True,
                'homepage_products_show_category': True,
                'homepage_products_sort_by': 'featured',
                'homepage_products_filter_categories': [],
                'homepage_products_show_view_all': True,
                'homepage_products_view_all_text': 'View All Products',
                'homepage_products_view_all_link': '/products',
                'homepage_products_card_style': 'modern',
                'homepage_products_card_shadow': True,
                'homepage_products_card_hover_effect': True,
                'homepage_products_show_badges': True,
                'homepage_products_show_rating': False,
                'homepage_products_show_quick_view': False,
                'homepage_products_enable_image_preview': True,
                'homepage_products2_show_section': False,
                'homepage_products2_title': '',
                'homepage_products2_subtitle': '',
                'homepage_products2_max_rows': 0,
                'homepage_products2_per_row': 0,
                'homepage_products2_max_items': 0,
                'homepage_products2_show_images': False,
                'homepage_products2_image_height': 0,
                'homepage_products2_image_width': 0,
                'homepage_products2_show_favorite': False,
                'homepage_products2_show_buy_now': False,
                'homepage_products2_show_details': False,
                'homepage_products2_show_price': False,
                'homepage_products2_show_original_price': False,
                'homepage_products2_show_stock': False,
                'homepage_products2_show_category': False,
                'homepage_products2_sort_by': 'newest',
                'homepage_products2_filter_categories': [],
                'homepage_products2_show_view_all': False,
                'homepage_products2_view_all_text': '',
                'homepage_products2_view_all_link': '',
                'homepage_products2_card_style': 'modern',
                'homepage_products2_card_shadow': True,
                'homepage_products2_card_hover_effect': True,
                'homepage_products2_show_badges': True,
                'homepage_products2_show_rating': False,
                'homepage_products2_show_quick_view': False,
                'homepage_products2_enable_image_preview': True,
                'navigation_links': [
                    {'id': 1, 'title': 'Home', 'url': '/', 'enabled': True, 'order': 1, 'is_internal': True, 'show_for': 'all', 'type': 'page'},
                    {'id': 2, 'title': 'Products', 'url': '/products', 'enabled': True, 'order': 2, 'is_internal': True, 'show_for': 'all', 'type': 'page'},
                    {'id': 3, 'title': 'About', 'url': '/about', 'enabled': True, 'order': 3, 'is_internal': True, 'show_for': 'all', 'type': 'page'},
                    {'id': 4, 'title': 'Contact', 'url': '/contact', 'enabled': True, 'order': 4, 'is_internal': True, 'show_for': 'all', 'type': 'page'},
                    {'id': 5, 'title': 'Login', 'url': '/login', 'enabled': True, 'order': 5, 'is_internal': True, 'show_for': 'guest', 'type': 'auth'},
                    {'id': 6, 'title': 'Profile', 'url': '/profile', 'enabled': True, 'order': 6, 'is_internal': True, 'show_for': 'user', 'type': 'page'},
                    {'id': 7, 'title': 'Admin', 'url': '/admin', 'enabled': True, 'order': 7, 'is_internal': True, 'show_for': 'admin', 'type': 'page'},
                    {'id': 8, 'title': 'Logout', 'url': 'logout', 'enabled': True, 'order': 8, 'is_internal': True, 'show_for': 'user', 'type': 'auth'}
                ],
                'nav_link_color': '#2c3e50',
                'nav_link_hover_color': '#007bff',
                'nav_link_font_size': 16,
                'nav_link_font_weight': '500',
                'nav_link_text_transform': 'none',
                'nav_link_underline': False,
                'header_background_color': '#ffffff',
                'header_text_color': '#2c3e50',
                'header_height': 60,
                'header_padding': 15,
                'header_nav_spacing': 20,
                'header_logo_position': 'left',
                'header_nav_position': 'right',
                'header_sticky': False,
                'header_border_bottom': True,
                'header_border_color': '#e9ecef',
                'header_shadow': False,
                'products_page_background_color': '#ffffff',
                'products_page_per_row': 4,
                'products_page_max_items_per_page': 12,
                'products_page_show_images': True,
                'products_page_show_favorite': True,
                'products_page_show_buy_now': True,
                'products_page_show_details': True,
                'products_page_show_price': True,
                'products_page_show_original_price': True,
                'products_page_show_stock': True,
                'products_page_show_category': True,
                'products_page_default_sort_by': 'newest',
                'products_page_card_style': 'modern',
                'products_page_card_shadow': True,
                'products_page_card_hover_effect': True,
                'products_page_show_badges': True,
                'products_page_show_rating': False,
                'products_page_show_quick_view': False,
                'products_page_enable_pagination': True,
                'products_page_enable_filters': True,
                'products_page_enable_search': True,
                'products_page_enable_image_preview': True,
            })
    except Exception as e:
        current_app.logger.error(f"Error fetching public site settings: {str(e)}")
        # Fallback to a minimal safe default
        return jsonify({
            'site_name': 'Pebdeq',
            'error': 'Could not load site settings.'
        }), 500 

# ========== ADMIN UPLOAD ENDPOINTS ==========

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_unique_filename(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return f"{uuid.uuid4().hex}.{ext}"

@main_bp.route('/api/admin/upload-image', methods=['POST'])
@token_required
def admin_upload_image(current_user):
    try:
        if not current_user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
            
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, GIF, and WebP are allowed'}), 400
        
        # Create blog upload folder if it doesn't exist - use correct path one level up from app
        blog_upload_folder = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'blog')
        if not os.path.exists(blog_upload_folder):
            os.makedirs(blog_upload_folder)
        
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        
        # Save file
        file_path = os.path.join(blog_upload_folder, filename)
        file.save(file_path)
        
        # Return the URL path
        url = f'/uploads/blog/{filename}'
        
        return jsonify({
            'success': True,
            'message': 'Image uploaded successfully',
            'url': url
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500 

# ============ BLOG LIKE ENDPOINTS ============

@main_bp.route('/api/blog/<int:blog_id>/like-status', methods=['GET'])
def get_blog_like_status(blog_id):
    """Get like status for a blog post"""
    try:
        from app.models.models import BlogLike
        
        # Get current user if authenticated
        user_id = None
        token = request.headers.get('Authorization')
        if token:
            try:
                if token.startswith('Bearer '):
                    token = token[7:]
                data = jwt.decode(token, os.environ.get('SECRET_KEY') or 'dev-secret-key', algorithms=['HS256'])
                user_id = data.get('user_id')
            except:
                pass
        
        # Get blog post
        blog_post = BlogPost.query.get_or_404(blog_id)
        
        # Get like count
        like_count = BlogLike.query.filter_by(blog_post_id=blog_id).count()
        
        # Check if user has liked this blog post
        is_liked = False
        if user_id:
            is_liked = BlogLike.query.filter_by(blog_post_id=blog_id, user_id=user_id).first() is not None
        
        return jsonify({
            'is_liked': is_liked,
            'like_count': like_count
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/blog/<int:blog_id>/like', methods=['POST'])
def toggle_blog_like(blog_id):
    """Toggle like status for a blog post"""
    try:
        from app.models.models import BlogLike
        
        # Get current user
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Authentication required'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, os.environ.get('SECRET_KEY') or 'dev-secret-key', algorithms=['HS256'])
            user_id = data['user_id']
        except:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get blog post
        blog_post = BlogPost.query.get_or_404(blog_id)
        
        # Check if already liked
        existing_like = BlogLike.query.filter_by(blog_post_id=blog_id, user_id=user_id).first()
        
        if existing_like:
            # Remove like
            db.session.delete(existing_like)
            action = 'unliked'
            is_liked = False
        else:
            # Add like
            new_like = BlogLike(blog_post_id=blog_id, user_id=user_id)
            db.session.add(new_like)
            action = 'liked'
            is_liked = True
        
        db.session.commit()
        
        # Get updated like count
        like_count = BlogLike.query.filter_by(blog_post_id=blog_id).count()
        
        return jsonify({
            'is_liked': is_liked,
            'like_count': like_count,
            'action': action
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 