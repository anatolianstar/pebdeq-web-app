from flask import Blueprint, request, jsonify, current_app
from app.models.models import CustomTheme, User, SiteSettings
from app import db
import jwt
import os
from functools import wraps
import json
from datetime import datetime
from werkzeug.utils import secure_filename

# Helper function to extract site settings colors for theme export
def extract_site_settings_colors():
    """Extract current site settings colors for theme export"""
    settings = SiteSettings.query.first()
    if not settings:
        return {}
    
    # Extract all color and font fields from site settings
    color_fields = [
        'header_background_color', 'header_text_color', 'header_border_color',
        'nav_link_color', 'nav_link_hover_color', 'nav_link_active_color',
        'mobile_nav_hamburger_color', 'mobile_nav_background_color',
        'marquee_color', 'marquee_background_color',
        'welcome_background_color', 'welcome_text_color', 'welcome_button_color',
        'homepage_background_color', 'about_page_background_color',
        'footer_background_color', 'footer_text_color',
        'products_page_background_color', 'products_page_title_color',
        'products_page_product_name_color', 'products_page_product_price_color',
        'products_page_product_category_color', 'products_page_stock_info_color',
        'products_page_view_details_button_color', 'products_page_view_details_button_text_color',
        'products_page_add_to_cart_button_color', 'products_page_add_to_cart_button_text_color',
        'homepage_products_product_name_color', 'homepage_products_product_price_color',
        'homepage_products_product_category_color', 'homepage_products_stock_info_color',
        'homepage_products_view_details_button_color', 'homepage_products_view_details_button_text_color',
        'homepage_products_add_to_cart_button_color', 'homepage_products_add_to_cart_button_text_color',
        'homepage_products2_product_name_color', 'homepage_products2_product_price_color',
        'homepage_products2_product_category_color', 'homepage_products2_stock_info_color',
        'homepage_products2_view_details_button_color', 'homepage_products2_view_details_button_text_color',
        'homepage_products2_add_to_cart_button_color', 'homepage_products2_add_to_cart_button_text_color',
        'product_detail_add_to_cart_button_color', 'product_detail_add_to_cart_button_text_color',
        'product_detail_buy_now_button_color', 'product_detail_buy_now_button_text_color',
        'product_detail_continue_shopping_button_color', 'product_detail_continue_shopping_button_text_color',
        'product_detail_product_name_color', 'product_detail_product_price_color',
        'product_detail_product_description_color', 'product_detail_product_details_label_color',
        'product_detail_product_details_value_color'
    ]
    
    font_fields = [
        'nav_link_font_size', 'nav_link_font_weight', 'nav_link_font_family',
        'marquee_font_family', 'marquee_font_size', 'marquee_font_weight',
        'product_detail_product_name_font_family', 'product_detail_product_name_font_size',
        'product_detail_product_name_font_weight', 'product_detail_product_name_font_style',
        'product_detail_product_price_font_family', 'product_detail_product_price_font_size',
        'product_detail_product_price_font_weight', 'product_detail_product_price_font_style',
        'product_detail_product_description_font_family', 'product_detail_product_description_font_size',
        'product_detail_product_description_font_weight', 'product_detail_product_description_font_style',
        'product_detail_product_details_label_font_family', 'product_detail_product_details_label_font_size',
        'product_detail_product_details_label_font_weight', 'product_detail_product_details_label_font_style',
        'product_detail_product_details_value_font_family', 'product_detail_product_details_value_font_size',
        'product_detail_product_details_value_font_weight', 'product_detail_product_details_value_font_style',
        'products_page_product_name_font_family', 'products_page_product_name_font_size',
        'products_page_product_name_font_weight', 'products_page_product_name_font_style',
        'products_page_title_font_family', 'products_page_title_font_size',
        'products_page_title_font_weight', 'products_page_title_font_style',
        'products_page_subtitle_font_family', 'products_page_subtitle_font_size',
        'products_page_subtitle_font_weight', 'products_page_subtitle_font_style',
        'products_page_product_price_font_family', 'products_page_product_price_font_size',
        'products_page_product_price_font_weight', 'products_page_product_price_font_style',
        'products_page_product_category_font_family', 'products_page_product_category_font_size',
        'products_page_product_category_font_weight', 'products_page_product_category_font_style',
        'products_page_stock_info_font_family', 'products_page_stock_info_font_size',
        'products_page_stock_info_font_weight', 'products_page_stock_info_font_style',
        'products_page_view_details_button_font_family', 'products_page_view_details_button_font_size',
        'products_page_view_details_button_font_weight', 'products_page_view_details_button_font_style',
        'products_page_add_to_cart_button_font_family', 'products_page_add_to_cart_button_font_size',
        'products_page_add_to_cart_button_font_weight', 'products_page_add_to_cart_button_font_style',
        'homepage_products_product_name_font_family', 'homepage_products_product_name_font_size',
        'homepage_products_product_name_font_weight', 'homepage_products_product_name_font_style',
        'homepage_products_product_price_font_family', 'homepage_products_product_price_font_size',
        'homepage_products_product_price_font_weight', 'homepage_products_product_price_font_style',
        'homepage_products_product_category_font_family', 'homepage_products_product_category_font_size',
        'homepage_products_product_category_font_weight', 'homepage_products_product_category_font_style',
        'homepage_products_stock_info_font_family', 'homepage_products_stock_info_font_size',
        'homepage_products_stock_info_font_weight', 'homepage_products_stock_info_font_style',
        'homepage_products_view_details_button_font_family', 'homepage_products_view_details_button_font_size',
        'homepage_products_view_details_button_font_weight', 'homepage_products_view_details_button_font_style',
        'homepage_products_add_to_cart_button_font_family', 'homepage_products_add_to_cart_button_font_size',
        'homepage_products_add_to_cart_button_font_weight', 'homepage_products_add_to_cart_button_font_style',
        'homepage_products2_product_name_font_family', 'homepage_products2_product_name_font_size',
        'homepage_products2_product_name_font_weight', 'homepage_products2_product_name_font_style',
        'homepage_products2_product_price_font_family', 'homepage_products2_product_price_font_size',
        'homepage_products2_product_price_font_weight', 'homepage_products2_product_price_font_style',
        'homepage_products2_product_category_font_family', 'homepage_products2_product_category_font_size',
        'homepage_products2_product_category_font_weight', 'homepage_products2_product_category_font_style',
        'homepage_products2_stock_info_font_family', 'homepage_products2_stock_info_font_size',
        'homepage_products2_stock_info_font_weight', 'homepage_products2_stock_info_font_style',
        'homepage_products2_view_details_button_font_family', 'homepage_products2_view_details_button_font_size',
        'homepage_products2_view_details_button_font_weight', 'homepage_products2_view_details_button_font_style',
        'homepage_products2_add_to_cart_button_font_family', 'homepage_products2_add_to_cart_button_font_size',
        'homepage_products2_add_to_cart_button_font_weight', 'homepage_products2_add_to_cart_button_font_style'
    ]
    
    site_settings_data = {}
    
    # Extract colors
    for field in color_fields:
        value = getattr(settings, field, None)
        if value:
            site_settings_data[field] = value
    
    # Extract fonts 
    for field in font_fields:
        value = getattr(settings, field, None)
        if value:
            site_settings_data[field] = value
    
    print(f"🎨 EXTRACT - Extracted {len(site_settings_data)} settings fields")
    return site_settings_data

# Helper function to sync custom theme colors with site settings
def sync_custom_theme_colors_to_site_settings(theme_colors, site_settings_colors=None):
    """Sync custom theme colors to site settings"""
    settings = SiteSettings.query.first()
    if not settings:
        settings = SiteSettings()
        db.session.add(settings)
    
    print(f"🎨 SYNC - Starting sync process...")
    print(f"   Theme colors available: {bool(theme_colors)}")
    print(f"   Site settings colors available: {bool(site_settings_colors)}")
    
    # Priority 1: If explicit site_settings_colors provided, use them directly
    if site_settings_colors:
        print(f"🎨 SYNC - Using provided site_settings_colors ({len(site_settings_colors)} colors)")
        for color_key, color_value in site_settings_colors.items():
            if hasattr(settings, color_key) and color_value:
                setattr(settings, color_key, color_value)
                print(f"   ✅ Updated {color_key}: {color_value}")
    
    # Priority 2: If theme has site_settings_colors embedded, use them
    elif theme_colors and 'site_settings_colors' in theme_colors:
        embedded_site_settings = theme_colors['site_settings_colors']
        print(f"🎨 SYNC - Using embedded site_settings_colors ({len(embedded_site_settings)} colors)")
        for color_key, color_value in embedded_site_settings.items():
            if hasattr(settings, color_key) and color_value:
                setattr(settings, color_key, color_value)
                print(f"   ✅ Updated {color_key}: {color_value}")
    
    # Priority 3: Fallback - Map theme primary colors to key site settings
    elif theme_colors:
        print(f"🎨 SYNC - Using fallback mapping from theme colors")
        print(f"🎨 SYNC - Available theme colors: {list(theme_colors.keys())}")
        
        # Debug: Check for #111827 color in theme colors
        for key, value in theme_colors.items():
            if isinstance(value, str) and '#111827' in value.lower():
                print(f"🎯 FOUND #111827 in theme_colors['{key}'] = {value}")
        
        # Priority A: Direct field mapping from template (highest priority)
        direct_mappings = {}
        # All site settings fields (colors + fonts) for direct mapping
        site_settings_fields = [
            # Color fields
            'header_background_color', 'header_text_color', 'header_border_color',
            'nav_link_color', 'nav_link_hover_color', 'nav_link_active_color',
            'mobile_nav_hamburger_color', 'mobile_nav_background_color',
            'marquee_color', 'marquee_background_color',
            'welcome_background_color', 'welcome_text_color', 'welcome_button_color',
            'homepage_background_color', 'about_page_background_color',
            'footer_background_color', 'footer_text_color',
            'products_page_background_color', 'products_page_title_color',
            'products_page_product_name_color', 'products_page_product_price_color',
            'products_page_product_category_color', 'products_page_stock_info_color',
            'products_page_view_details_button_color', 'products_page_view_details_button_text_color',
            'products_page_add_to_cart_button_color', 'products_page_add_to_cart_button_text_color',
            'homepage_products_product_name_color', 'homepage_products_product_price_color',
            'homepage_products_product_category_color', 'homepage_products_stock_info_color',
            'homepage_products_view_details_button_color', 'homepage_products_view_details_button_text_color',
            'homepage_products_add_to_cart_button_color', 'homepage_products_add_to_cart_button_text_color',
            'homepage_products2_product_name_color', 'homepage_products2_product_price_color',
            'homepage_products2_product_category_color', 'homepage_products2_stock_info_color',
            'homepage_products2_view_details_button_color', 'homepage_products2_view_details_button_text_color',
            'homepage_products2_add_to_cart_button_color', 'homepage_products2_add_to_cart_button_text_color',
            'product_detail_add_to_cart_button_color', 'product_detail_add_to_cart_button_text_color',
            'product_detail_buy_now_button_color', 'product_detail_buy_now_button_text_color',
            'product_detail_continue_shopping_button_color', 'product_detail_continue_shopping_button_text_color',
            'product_detail_product_name_color', 'product_detail_product_price_color',
            'product_detail_product_description_color', 'product_detail_product_details_label_color',
            'product_detail_product_details_value_color',
            # Font fields
            'nav_link_font_size', 'nav_link_font_weight', 'nav_link_font_family',
            'marquee_font_family', 'marquee_font_size', 'marquee_font_weight',
            'product_detail_product_name_font_family', 'product_detail_product_name_font_size',
            'product_detail_product_name_font_weight', 'product_detail_product_name_font_style',
            'product_detail_product_price_font_family', 'product_detail_product_price_font_size',
            'product_detail_product_price_font_weight', 'product_detail_product_price_font_style',
            'product_detail_product_description_font_family', 'product_detail_product_description_font_size',
            'product_detail_product_description_font_weight', 'product_detail_product_description_font_style',
            'product_detail_product_details_label_font_family', 'product_detail_product_details_label_font_size',
            'product_detail_product_details_label_font_weight', 'product_detail_product_details_label_font_style',
            'product_detail_product_details_value_font_family', 'product_detail_product_details_value_font_size',
            'product_detail_product_details_value_font_weight', 'product_detail_product_details_value_font_style',
            'products_page_product_name_font_family', 'products_page_product_name_font_size',
            'products_page_product_name_font_weight', 'products_page_product_name_font_style',
            'products_page_title_font_family', 'products_page_title_font_size',
            'products_page_title_font_weight', 'products_page_title_font_style',
            'products_page_subtitle_font_family', 'products_page_subtitle_font_size',
            'products_page_subtitle_font_weight', 'products_page_subtitle_font_style',
            'products_page_product_price_font_family', 'products_page_product_price_font_size',
            'products_page_product_price_font_weight', 'products_page_product_price_font_style',
            'products_page_product_category_font_family', 'products_page_product_category_font_size',
            'products_page_product_category_font_weight', 'products_page_product_category_font_style',
            'products_page_stock_info_font_family', 'products_page_stock_info_font_size',
            'products_page_stock_info_font_weight', 'products_page_stock_info_font_style',
            'products_page_view_details_button_font_family', 'products_page_view_details_button_font_size',
            'products_page_view_details_button_font_weight', 'products_page_view_details_button_font_style',
            'products_page_add_to_cart_button_font_family', 'products_page_add_to_cart_button_font_size',
            'products_page_add_to_cart_button_font_weight', 'products_page_add_to_cart_button_font_style',
            'homepage_products_product_name_font_family', 'homepage_products_product_name_font_size',
            'homepage_products_product_name_font_weight', 'homepage_products_product_name_font_style',
            'homepage_products_product_price_font_family', 'homepage_products_product_price_font_size',
            'homepage_products_product_price_font_weight', 'homepage_products_product_price_font_style',
            'homepage_products_product_category_font_family', 'homepage_products_product_category_font_size',
            'homepage_products_product_category_font_weight', 'homepage_products_product_category_font_style',
            'homepage_products_stock_info_font_family', 'homepage_products_stock_info_font_size',
            'homepage_products_stock_info_font_weight', 'homepage_products_stock_info_font_style',
            'homepage_products_view_details_button_font_family', 'homepage_products_view_details_button_font_size',
            'homepage_products_view_details_button_font_weight', 'homepage_products_view_details_button_font_style',
            'homepage_products_add_to_cart_button_font_family', 'homepage_products_add_to_cart_button_font_size',
            'homepage_products_add_to_cart_button_font_weight', 'homepage_products_add_to_cart_button_font_style',
            'homepage_products2_product_name_font_family', 'homepage_products2_product_name_font_size',
            'homepage_products2_product_name_font_weight', 'homepage_products2_product_name_font_style',
            'homepage_products2_product_price_font_family', 'homepage_products2_product_price_font_size',
            'homepage_products2_product_price_font_weight', 'homepage_products2_product_price_font_style',
            'homepage_products2_product_category_font_family', 'homepage_products2_product_category_font_size',
            'homepage_products2_product_category_font_weight', 'homepage_products2_product_category_font_style',
            'homepage_products2_stock_info_font_family', 'homepage_products2_stock_info_font_size',
            'homepage_products2_stock_info_font_weight', 'homepage_products2_stock_info_font_style',
            'homepage_products2_view_details_button_font_family', 'homepage_products2_view_details_button_font_size',
            'homepage_products2_view_details_button_font_weight', 'homepage_products2_view_details_button_font_style',
            'homepage_products2_add_to_cart_button_font_family', 'homepage_products2_add_to_cart_button_font_size',
            'homepage_products2_add_to_cart_button_font_weight', 'homepage_products2_add_to_cart_button_font_style'
        ]
        
        for field in site_settings_fields:
            if field in theme_colors:
                direct_mappings[field] = theme_colors[field]
                print(f"🎯 DIRECT MAPPING: {field} = {theme_colors[field]}")
        
        # Priority B: Fallback logic for missing direct mappings
        # Try different possible fields for dark background
        dark_bg_color = (
            theme_colors.get('header_background_color', None) or
            theme_colors.get('backgroundDark', None) or 
            theme_colors.get('backgroundPrimary', None) or 
            theme_colors.get('background', None) or 
            theme_colors.get('bgPrimary', None) or
            '#111827'  # Fallback to the specific color
        )
        
        homepage_bg_color = (
            theme_colors.get('homepage_background_color', None) or
            theme_colors.get('backgroundPrimary', None) or
            theme_colors.get('background', None) or 
            theme_colors.get('bgPrimary', None) or
            dark_bg_color  # Use dark background as fallback
        )
        
        print(f"🎨 SYNC - Selected dark_bg_color: {dark_bg_color}")
        print(f"🎨 SYNC - Selected homepage_bg_color: {homepage_bg_color}")
        
        # Fallback mappings for fields not directly mapped
        fallback_mappings = {
            'header_background_color': dark_bg_color,
            'header_text_color': theme_colors.get('header_text_color', theme_colors.get('textLight', '#ffffff')),
            'header_border_color': theme_colors.get('header_border_color', theme_colors.get('borderColor', '#dee2e6')),
            'nav_link_color': theme_colors.get('nav_link_color', theme_colors.get('primary', '#007bff')),
            'nav_link_hover_color': theme_colors.get('nav_link_hover_color', theme_colors.get('primaryHover', '#0056b3')),
            'footer_background_color': theme_colors.get('footer_background_color', dark_bg_color),
            'footer_text_color': theme_colors.get('footer_text_color', theme_colors.get('textLight', '#ffffff')),
            'welcome_background_color': theme_colors.get('welcome_background_color', theme_colors.get('backgroundSecondary', '#f8f9fa')),
            'welcome_text_color': theme_colors.get('welcome_text_color', theme_colors.get('textPrimary', '#212529')),
            'welcome_button_color': theme_colors.get('welcome_button_color', theme_colors.get('primary', '#007bff')),
            'homepage_background_color': homepage_bg_color,
            'marquee_background_color': theme_colors.get('marquee_background_color', theme_colors.get('primary', '#007bff')),
            'marquee_color': theme_colors.get('marquee_color', theme_colors.get('textLight', '#ffffff')),
            'products_page_background_color': theme_colors.get('products_page_background_color', homepage_bg_color),
            'products_page_title_color': theme_colors.get('products_page_title_color', theme_colors.get('textPrimary', '#212529')),
            'products_page_product_name_color': theme_colors.get('products_page_product_name_color', theme_colors.get('primary', '#007bff')),
            'products_page_product_price_color': theme_colors.get('products_page_product_price_color', theme_colors.get('success', '#28a745')),
            'products_page_product_category_color': theme_colors.get('products_page_product_category_color', theme_colors.get('textSecondary', '#6c757d')),
            'homepage_products_product_name_color': theme_colors.get('homepage_products_product_name_color', theme_colors.get('primary', '#007bff')),
            'homepage_products_product_price_color': theme_colors.get('homepage_products_product_price_color', theme_colors.get('success', '#28a745')),
            'homepage_products_product_category_color': theme_colors.get('homepage_products_product_category_color', theme_colors.get('textSecondary', '#6c757d')),
            'product_detail_product_name_color': theme_colors.get('product_detail_product_name_color', theme_colors.get('textPrimary', '#212529')),
            'product_detail_product_price_color': theme_colors.get('product_detail_product_price_color', theme_colors.get('success', '#28a745')),
            'product_detail_product_description_color': theme_colors.get('product_detail_product_description_color', theme_colors.get('textSecondary', '#6c757d'))
        }
        
        # Combine direct mappings with fallbacks (direct mappings take priority)
        color_mappings = {**fallback_mappings, **direct_mappings}
        
        for setting_key, color_value in color_mappings.items():
            if hasattr(settings, setting_key) and color_value:
                setattr(settings, setting_key, color_value)
                print(f"   ✅ Mapped {setting_key}: {color_value}")
    
    try:
        db.session.commit()
        print(f"✅ SYNC - Site settings successfully committed to database")
        return True
    except Exception as e:
        db.session.rollback()
        print(f"❌ SYNC - Database commit failed: {str(e)}")
        return False

themes_bp = Blueprint('themes', __name__)

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
            
            return f(user, *args, **kwargs)
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated_function

def validate_theme_data(theme_data):
    """Validate theme data structure"""
    required_fields = ['name', 'id', 'colors', 'typography']
    errors = []
    
    for field in required_fields:
        if field not in theme_data:
            errors.append(f"Missing required field: {field}")
    
    if 'colors' in theme_data:
        required_colors = ['primary', 'secondary', 'backgroundPrimary', 'textPrimary']
        for color in required_colors:
            if color not in theme_data['colors']:
                errors.append(f"Missing required color: {color}")
    
    if 'typography' in theme_data:
        required_typography = ['fontFamilyBase', 'fontSizeBase']
        for typo in required_typography:
            if typo not in theme_data['typography']:
                errors.append(f"Missing required typography: {typo}")
    
    return errors

@themes_bp.route('/themes', methods=['GET'])
def get_themes():
    """Get all available themes"""
    try:
        themes = CustomTheme.query.filter_by(is_active=True).all()
        
        theme_list = []
        for theme in themes:
            theme_data = {
                'id': theme.id,
                'name': theme.name,
                'theme_id': theme.theme_id,
                'description': theme.description,
                'author': theme.author,
                'version': theme.version,
                'type': theme.type,
                'is_default': theme.is_default,
                'is_public': theme.is_public,
                'created_at': theme.created_at.isoformat(),
                'updated_at': theme.updated_at.isoformat(),
                'preview_colors': json.loads(theme.preview_colors) if theme.preview_colors else None,
                'download_count': theme.download_count,
                'rating': theme.rating
            }
            theme_list.append(theme_data)
        
        return jsonify({
            'themes': theme_list,
            'total': len(theme_list)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes', methods=['POST'])
@auth_required
def create_theme(user):
    """Create a new custom theme"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate theme data
        errors = validate_theme_data(data)
        if errors:
            return jsonify({'error': 'Validation failed', 'errors': errors}), 400
        
        # Check if theme ID already exists
        existing_theme = CustomTheme.query.filter_by(theme_id=data['id']).first()
        if existing_theme:
            return jsonify({'error': 'Theme ID already exists'}), 409
        
        # Create preview colors
        preview_colors = {
            'primary': data['colors'].get('primary', '#007bff'),
            'secondary': data['colors'].get('secondary', '#6c757d'),
            'background': data['colors'].get('backgroundPrimary', '#ffffff'),
            'text': data['colors'].get('textPrimary', '#212529'),
            'accent': data['colors'].get('success', '#28a745')
        }
        
        # Create new theme
        theme = CustomTheme(
            name=data['name'],
            theme_id=data['id'],
            description=data.get('description', ''),
            author=data.get('author', user.username or user.email),
            version=data.get('version', '1.0.0'),
            type=data.get('type', 'light'),
            theme_data=json.dumps(data),
            css_content=data.get('css', ''),
            preview_colors=json.dumps(preview_colors),
            creator_id=user.id,
            is_public=data.get('is_public', True),
            is_active=True
        )
        
        db.session.add(theme)
        db.session.commit()
        
        return jsonify({
            'message': 'Theme created successfully',
            'theme': {
                'id': theme.id,
                'name': theme.name,
                'theme_id': theme.theme_id,
                'description': theme.description,
                'author': theme.author,
                'version': theme.version,
                'type': theme.type,
                'preview_colors': preview_colors,
                'created_at': theme.created_at.isoformat()
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/<int:theme_id>', methods=['GET'])
def get_theme(theme_id):
    """Get a specific theme by ID"""
    try:
        theme = CustomTheme.query.get_or_404(theme_id)
        
        if not theme.is_active:
            return jsonify({'error': 'Theme not found'}), 404
        
        # Increment download count
        theme.download_count += 1
        db.session.commit()
        
        return jsonify({
            'theme': {
                'id': theme.id,
                'name': theme.name,
                'theme_id': theme.theme_id,
                'description': theme.description,
                'author': theme.author,
                'version': theme.version,
                'type': theme.type,
                'theme_data': json.loads(theme.theme_data),
                'css_content': theme.css_content,
                'preview_colors': json.loads(theme.preview_colors) if theme.preview_colors else None,
                'is_public': theme.is_public,
                'download_count': theme.download_count,
                'rating': theme.rating,
                'created_at': theme.created_at.isoformat(),
                'updated_at': theme.updated_at.isoformat()
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/<int:theme_id>', methods=['PUT'])
@auth_required
def update_theme(user, theme_id):
    """Update an existing theme"""
    try:
        theme = CustomTheme.query.get_or_404(theme_id)
        
        # Check if user is the creator or admin
        if theme.creator_id != user.id and not user.is_admin:
            return jsonify({'error': 'Permission denied'}), 403
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate theme data
        errors = validate_theme_data(data)
        if errors:
            return jsonify({'error': 'Validation failed', 'errors': errors}), 400
        
        # Update theme fields
        theme.name = data.get('name', theme.name)
        theme.description = data.get('description', theme.description)
        theme.author = data.get('author', theme.author)
        theme.version = data.get('version', theme.version)
        theme.type = data.get('type', theme.type)
        theme.theme_data = json.dumps(data)
        theme.css_content = data.get('css', theme.css_content)
        theme.is_public = data.get('is_public', theme.is_public)
        theme.updated_at = datetime.utcnow()
        
        # Update preview colors
        preview_colors = {
            'primary': data['colors'].get('primary', '#007bff'),
            'secondary': data['colors'].get('secondary', '#6c757d'),
            'background': data['colors'].get('backgroundPrimary', '#ffffff'),
            'text': data['colors'].get('textPrimary', '#212529'),
            'accent': data['colors'].get('success', '#28a745')
        }
        theme.preview_colors = json.dumps(preview_colors)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Theme updated successfully',
            'theme': {
                'id': theme.id,
                'name': theme.name,
                'theme_id': theme.theme_id,
                'description': theme.description,
                'author': theme.author,
                'version': theme.version,
                'type': theme.type,
                'preview_colors': preview_colors,
                'updated_at': theme.updated_at.isoformat()
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/<int:theme_id>', methods=['DELETE'])
@auth_required
def delete_theme(user, theme_id):
    """Delete a theme (soft delete)"""
    try:
        theme = CustomTheme.query.get_or_404(theme_id)
        
        # Check if user is the creator or admin
        if theme.creator_id != user.id and not user.is_admin:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Don't allow deletion of default themes
        if theme.is_default:
            return jsonify({'error': 'Cannot delete default theme'}), 400
        
        # Soft delete
        theme.is_active = False
        theme.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Theme deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/<int:theme_id>/activate', methods=['POST'])
@admin_required
def activate_theme(theme_id):
    """Activate a theme (admin only)"""
    try:
        theme = CustomTheme.query.get_or_404(theme_id)
        
        theme.is_active = True
        theme.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Theme activated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/<int:theme_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_theme(theme_id):
    """Deactivate a theme (admin only)"""
    try:
        theme = CustomTheme.query.get_or_404(theme_id)
        
        # Don't allow deactivation of default themes
        if theme.is_default:
            return jsonify({'error': 'Cannot deactivate default theme'}), 400
        
        theme.is_active = False
        theme.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Theme deactivated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/<int:theme_id>/rate', methods=['POST'])
@auth_required
def rate_theme(user, theme_id):
    """Rate a theme"""
    try:
        theme = CustomTheme.query.get_or_404(theme_id)
        
        data = request.get_json()
        rating = data.get('rating')
        
        if not rating or not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
            return jsonify({'error': 'Invalid rating. Must be between 1 and 5'}), 400
        
        # For simplicity, we'll just update the average rating
        # In a real application, you'd want to track individual ratings
        if theme.rating is None:
            theme.rating = rating
        else:
            # Simple average calculation (in reality, you'd want to store all ratings)
            theme.rating = (theme.rating + rating) / 2
        
        theme.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Theme rated successfully',
            'rating': theme.rating
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/search', methods=['GET'])
def search_themes():
    """Search themes by name, author, or type"""
    try:
        query = request.args.get('q', '')
        theme_type = request.args.get('type', '')
        author = request.args.get('author', '')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        # Build query
        themes_query = CustomTheme.query.filter_by(is_active=True)
        
        if query:
            themes_query = themes_query.filter(
                CustomTheme.name.ilike(f'%{query}%') |
                CustomTheme.description.ilike(f'%{query}%')
            )
        
        if theme_type:
            themes_query = themes_query.filter_by(type=theme_type)
        
        if author:
            themes_query = themes_query.filter(CustomTheme.author.ilike(f'%{author}%'))
        
        # Paginate
        themes = themes_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        theme_list = []
        for theme in themes.items:
            theme_data = {
                'id': theme.id,
                'name': theme.name,
                'theme_id': theme.theme_id,
                'description': theme.description,
                'author': theme.author,
                'version': theme.version,
                'type': theme.type,
                'preview_colors': json.loads(theme.preview_colors) if theme.preview_colors else None,
                'download_count': theme.download_count,
                'rating': theme.rating,
                'created_at': theme.created_at.isoformat()
            }
            theme_list.append(theme_data)
        
        return jsonify({
            'themes': theme_list,
            'total': themes.total,
            'pages': themes.pages,
            'current_page': themes.page,
            'per_page': themes.per_page,
            'has_next': themes.has_next,
            'has_prev': themes.has_prev
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/my-themes', methods=['GET'])
@auth_required
def get_my_themes(user):
    """Get themes created by the current user"""
    try:
        themes = CustomTheme.query.filter_by(creator_id=user.id, is_active=True).all()
        
        theme_list = []
        for theme in themes:
            theme_data = {
                'id': theme.id,
                'name': theme.name,
                'theme_id': theme.theme_id,
                'description': theme.description,
                'author': theme.author,
                'version': theme.version,
                'type': theme.type,
                'is_public': theme.is_public,
                'preview_colors': json.loads(theme.preview_colors) if theme.preview_colors else None,
                'download_count': theme.download_count,
                'rating': theme.rating,
                'created_at': theme.created_at.isoformat(),
                'updated_at': theme.updated_at.isoformat()
            }
            theme_list.append(theme_data)
        
        return jsonify({
            'themes': theme_list,
            'total': len(theme_list)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/export/<int:theme_id>', methods=['GET'])
def export_theme(theme_id):
    """Export theme as JSON file with current site settings colors"""
    try:
        theme = CustomTheme.query.get_or_404(theme_id)
        
        if not theme.is_active:
            return jsonify({'error': 'Theme not found'}), 404
        
        # Get theme data
        theme_data = json.loads(theme.theme_data)
        
        # Extract current site settings colors
        site_settings_colors = extract_site_settings_colors()
        
        # Add site settings colors to theme data
        if site_settings_colors:
            theme_data['site_settings_colors'] = site_settings_colors
        
        print(f"🎨 EXPORT - Exporting theme '{theme.name}' with {len(site_settings_colors)} site settings colors")
        
        return jsonify({
            'theme': theme_data,
            'export_info': {
                'exported_at': datetime.utcnow().isoformat(),
                'exported_from': 'Pebdeq Theme System',
                'original_author': theme.author,
                'version': theme.version,
                'includes_site_settings': len(site_settings_colors) > 0,
                'site_settings_count': len(site_settings_colors)
            }
        })
    
    except Exception as e:
        print(f"❌ EXPORT - Error exporting theme: {str(e)}")
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/import', methods=['POST'])
@auth_required
def import_theme(user):
    """Import theme from JSON data"""
    try:
        data = request.get_json()
        
        if not data or 'theme' not in data:
            return jsonify({'error': 'Invalid import data'}), 400
        
        theme_data = data['theme']
        
        # Validate theme data
        errors = validate_theme_data(theme_data)
        if errors:
            return jsonify({'error': 'Validation failed', 'errors': errors}), 400
        
        # Generate unique theme ID if it already exists
        original_id = theme_data['id']
        unique_id = original_id
        counter = 1
        
        while CustomTheme.query.filter_by(theme_id=unique_id).first():
            unique_id = f"{original_id}-{counter}"
            counter += 1
        
        theme_data['id'] = unique_id
        
        # Create preview colors
        preview_colors = {
            'primary': theme_data['colors'].get('primary', '#007bff'),
            'secondary': theme_data['colors'].get('secondary', '#6c757d'),
            'background': theme_data['colors'].get('backgroundPrimary', '#ffffff'),
            'text': theme_data['colors'].get('textPrimary', '#212529'),
            'accent': theme_data['colors'].get('success', '#28a745')
        }
        
        # Create imported theme
        theme = CustomTheme(
            name=f"{theme_data['name']} (Imported)",
            theme_id=unique_id,
            description=theme_data.get('description', ''),
            author=theme_data.get('author', 'Unknown'),
            version=theme_data.get('version', '1.0.0'),
            type=theme_data.get('type', 'light'),
            theme_data=json.dumps(theme_data),
            css_content='',  # Will be generated on first use
            preview_colors=json.dumps(preview_colors),
            creator_id=user.id,
            is_public=False,  # Imported themes are private by default
            is_active=True
        )
        
        db.session.add(theme)
        db.session.commit()
        
        # Sync imported theme colors with site settings
        if 'colors' in theme_data:
            try:
                print(f"🎨 IMPORT - Syncing imported theme '{theme.name}' colors with site settings")
                site_settings_colors = theme_data.get('site_settings_colors')
                sync_custom_theme_colors_to_site_settings(theme_data['colors'], site_settings_colors)
                print(f"✅ IMPORT - Site settings synchronized with imported theme")
            except Exception as e:
                print(f"⚠️ IMPORT - Warning: Failed to sync site settings: {str(e)}")
                # Don't fail the import if site settings sync fails
        
        return jsonify({
            'message': 'Theme imported successfully',
            'theme': {
                'id': theme.id,
                'name': theme.name,
                'theme_id': theme.theme_id,
                'description': theme.description,
                'author': theme.author,
                'version': theme.version,
                'type': theme.type,
                'preview_colors': preview_colors,
                'created_at': theme.created_at.isoformat()
            },
            'site_settings_synced': 'colors' in theme_data
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/sync-colors', methods=['POST'])
@auth_required
def sync_theme_colors_to_site_settings(user):
    """Sync custom theme colors directly to site settings"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        theme_colors = data.get('theme_colors')
        site_settings_colors = data.get('site_settings_colors')
        
        if not theme_colors:
            return jsonify({'error': 'Theme colors are required'}), 400
        
        print(f"🎨 SYNC - Syncing custom theme colors to site settings")
        print(f"   Theme colors keys: {list(theme_colors.keys()) if theme_colors else 'None'}")
        print(f"   Site settings colors: {'Present' if site_settings_colors else 'None'}")
        
        # Use the existing sync function with the theme colors
        success = sync_custom_theme_colors_to_site_settings(theme_colors, site_settings_colors)
        
        if success:
            print(f"✅ SYNC - Custom theme colors synced successfully to site settings")
            return jsonify({
                'message': 'Theme colors synced successfully to site settings',
                'synced_colors': list(theme_colors.keys()),
                'has_site_settings_colors': bool(site_settings_colors)
            })
        else:
            return jsonify({'error': 'Failed to sync theme colors'}), 500
    
    except Exception as e:
        print(f"❌ SYNC - Error syncing theme colors: {str(e)}")
        return jsonify({'error': str(e)}), 500

@themes_bp.route('/themes/popular', methods=['GET'])
def get_popular_themes():
    """Get popular themes sorted by download count and rating"""
    try:
        limit = int(request.args.get('limit', 10))
        
        themes = CustomTheme.query.filter_by(is_active=True, is_public=True)\
            .order_by(CustomTheme.download_count.desc(), CustomTheme.rating.desc())\
            .limit(limit).all()
        
        theme_list = []
        for theme in themes:
            theme_data = {
                'id': theme.id,
                'name': theme.name,
                'theme_id': theme.theme_id,
                'description': theme.description,
                'author': theme.author,
                'version': theme.version,
                'type': theme.type,
                'preview_colors': json.loads(theme.preview_colors) if theme.preview_colors else None,
                'download_count': theme.download_count,
                'rating': theme.rating,
                'created_at': theme.created_at.isoformat()
            }
            theme_list.append(theme_data)
        
        return jsonify({
            'themes': theme_list,
            'total': len(theme_list)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500 