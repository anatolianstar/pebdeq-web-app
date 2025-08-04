from flask import Blueprint, request, jsonify, current_app
from functools import wraps
import os
import jwt
from werkzeug.utils import secure_filename
from app.models.models import SiteSettings, User
from app import db

# Site settings blueprint
site_settings_bp = Blueprint('site_settings', __name__)

# Admin required decorator
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

# Utility functions
def allowed_file(filename, file_type):
    ALLOWED_EXTENSIONS = {
        'image': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
        'video': {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'}
    }
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS.get(file_type, set())

def generate_unique_filename(filename):
    import uuid
    name, ext = os.path.splitext(filename)
    return f"{uuid.uuid4().hex}{ext}"

def create_upload_folders():
    # Use correct path - one level up from app directory to match serving path
    base_path = os.path.join(os.path.dirname(current_app.root_path), 'uploads')
    upload_folders = ['site', 'products', 'categories', 'videos', 'blog']
    for folder in upload_folders:
        folder_path = os.path.join(base_path, folder)
        os.makedirs(folder_path, exist_ok=True)

# Theme color mappings helper function
def get_theme_color_mappings():
    """Get theme color mappings for all themes"""
    return {
        'default': {
            'header_background_color': '#ffffff',
            'header_text_color': '#212529',
            'header_border_color': '#dee2e6',
            'nav_link_color': '#007bff',
            'nav_link_hover_color': '#0056b3',
            'footer_background_color': '#343a40',
            'footer_text_color': '#ffffff',
            'welcome_background_color': '#f8f9fa',
            'welcome_text_color': '#212529',
            'welcome_button_color': '#007bff',
            'homepage_background_color': '#ffffff',
            'marquee_background_color': '#007bff',
            'marquee_color': '#ffffff',
            'products_page_background_color': '#ffffff',
            'products_page_title_color': '#212529',
            'products_page_product_name_color': '#007bff',
            'products_page_product_price_color': '#28a745',
            'products_page_product_category_color': '#6c757d',
            'homepage_products_product_name_color': '#007bff',
            'homepage_products_product_price_color': '#28a745',
            'homepage_products_product_category_color': '#6c757d',
            'product_detail_product_name_color': '#212529',
            'product_detail_product_price_color': '#28a745',
            'product_detail_product_description_color': '#6c757d',
            # Homepage Products Button Colors
            'homepage_products_view_details_button_color': '#007bff',
            'homepage_products_view_details_button_text_color': '#ffffff',
            'homepage_products_add_to_cart_button_color': '#28a745',
            'homepage_products_add_to_cart_button_text_color': '#ffffff',
            # Homepage Products 2 Button Colors
            'homepage_products2_view_details_button_color': '#007bff',
            'homepage_products2_view_details_button_text_color': '#ffffff',
            'homepage_products2_add_to_cart_button_color': '#28a745',
            'homepage_products2_add_to_cart_button_text_color': '#ffffff',
            # Products Page Button Colors
            'products_page_view_details_button_color': '#007bff',
            'products_page_view_details_button_text_color': '#ffffff',
            'products_page_add_to_cart_button_color': '#28a745',
            'products_page_add_to_cart_button_text_color': '#ffffff',
            # Product Detail Button Colors
            'product_detail_add_to_cart_button_color': '#28a745',
            'product_detail_add_to_cart_button_text_color': '#ffffff',
            'product_detail_buy_now_button_color': '#007bff',
            'product_detail_buy_now_button_text_color': '#ffffff',
            'product_detail_continue_shopping_button_color': '#6c757d',
            'product_detail_continue_shopping_button_text_color': '#ffffff'
        },
        'dark': {
            'header_background_color': '#1a1a1a',
            'header_text_color': '#ffffff',
            'header_border_color': '#333333',
            'nav_link_color': '#4dabf7',
            'nav_link_hover_color': '#74c0fc',
            'footer_background_color': '#0d1117',
            'footer_text_color': '#f0f6fc',
            'welcome_background_color': '#21262d',
            'welcome_text_color': '#f0f6fc',
            'welcome_button_color': '#4dabf7',
            'homepage_background_color': '#0d1117',
            'marquee_background_color': '#4dabf7',
            'marquee_color': '#ffffff',
            'products_page_background_color': '#0d1117',
            'products_page_title_color': '#f0f6fc',
            'products_page_product_name_color': '#4dabf7',
            'products_page_product_price_color': '#56d364',
            'products_page_product_category_color': '#8b949e',
            'homepage_products_product_name_color': '#4dabf7',
            'homepage_products_product_price_color': '#56d364',
            'homepage_products_product_category_color': '#8b949e',
            'product_detail_product_name_color': '#f0f6fc',
            'product_detail_product_price_color': '#56d364',
            'product_detail_product_description_color': '#8b949e',
            # Homepage Products Button Colors
            'homepage_products_view_details_button_color': '#4dabf7',
            'homepage_products_view_details_button_text_color': '#ffffff',
            'homepage_products_add_to_cart_button_color': '#56d364',
            'homepage_products_add_to_cart_button_text_color': '#000000',
            # Homepage Products 2 Button Colors
            'homepage_products2_view_details_button_color': '#4dabf7',
            'homepage_products2_view_details_button_text_color': '#ffffff',
            'homepage_products2_add_to_cart_button_color': '#56d364',
            'homepage_products2_add_to_cart_button_text_color': '#000000',
            # Products Page Button Colors
            'products_page_view_details_button_color': '#4dabf7',
            'products_page_view_details_button_text_color': '#ffffff',
            'products_page_add_to_cart_button_color': '#56d364',
            'products_page_add_to_cart_button_text_color': '#000000',
            # Product Detail Button Colors
            'product_detail_add_to_cart_button_color': '#56d364',
            'product_detail_add_to_cart_button_text_color': '#000000',
            'product_detail_buy_now_button_color': '#4dabf7',
            'product_detail_buy_now_button_text_color': '#ffffff',
            'product_detail_continue_shopping_button_color': '#8b949e',
            'product_detail_continue_shopping_button_text_color': '#ffffff'
        },
        'blue': {
            'header_background_color': '#e3f2fd',
            'header_text_color': '#0d47a1',
            'header_border_color': '#bbdefb',
            'nav_link_color': '#1976d2',
            'nav_link_hover_color': '#0d47a1',
            'footer_background_color': '#0d47a1',
            'footer_text_color': '#ffffff',
            'welcome_background_color': '#f3e5f5',
            'welcome_text_color': '#4a148c',
            'welcome_button_color': '#1976d2',
            'homepage_background_color': '#fafafa',
            'marquee_background_color': '#1976d2',
            'marquee_color': '#ffffff',
            'products_page_background_color': '#fafafa',
            'products_page_title_color': '#0d47a1',
            'products_page_product_name_color': '#1976d2',
            'products_page_product_price_color': '#388e3c',
            'products_page_product_category_color': '#5e35b1',
            'homepage_products_product_name_color': '#1976d2',
            'homepage_products_product_price_color': '#388e3c',
            'homepage_products_product_category_color': '#5e35b1',
            'product_detail_product_name_color': '#0d47a1',
            'product_detail_product_price_color': '#388e3c',
            'product_detail_product_description_color': '#5e35b1',
            # Homepage Products Button Colors
            'homepage_products_view_details_button_color': '#1976d2',
            'homepage_products_view_details_button_text_color': '#ffffff',
            'homepage_products_add_to_cart_button_color': '#388e3c',
            'homepage_products_add_to_cart_button_text_color': '#ffffff',
            # Homepage Products 2 Button Colors
            'homepage_products2_view_details_button_color': '#1976d2',
            'homepage_products2_view_details_button_text_color': '#ffffff',
            'homepage_products2_add_to_cart_button_color': '#388e3c',
            'homepage_products2_add_to_cart_button_text_color': '#ffffff',
            # Products Page Button Colors
            'products_page_view_details_button_color': '#1976d2',
            'products_page_view_details_button_text_color': '#ffffff',
            'products_page_add_to_cart_button_color': '#388e3c',
            'products_page_add_to_cart_button_text_color': '#ffffff',
            # Product Detail Button Colors
            'product_detail_add_to_cart_button_color': '#388e3c',
            'product_detail_add_to_cart_button_text_color': '#ffffff',
            'product_detail_buy_now_button_color': '#1976d2',
            'product_detail_buy_now_button_text_color': '#ffffff',
            'product_detail_continue_shopping_button_color': '#5e35b1',
            'product_detail_continue_shopping_button_text_color': '#ffffff'
        },
        'green': {
            'header_background_color': '#e8f5e8',
            'header_text_color': '#1b5e20',
            'header_border_color': '#c8e6c9',
            'nav_link_color': '#388e3c',
            'nav_link_hover_color': '#1b5e20',
            'footer_background_color': '#1b5e20',
            'footer_text_color': '#ffffff',
            'welcome_background_color': '#fff3e0',
            'welcome_text_color': '#e65100',
            'welcome_button_color': '#388e3c',
            'homepage_background_color': '#fafafa',
            'marquee_background_color': '#388e3c',
            'marquee_color': '#ffffff',
            'products_page_background_color': '#fafafa',
            'products_page_title_color': '#1b5e20',
            'products_page_product_name_color': '#388e3c',
            'products_page_product_price_color': '#f57c00',
            'products_page_product_category_color': '#7b1fa2',
            'homepage_products_product_name_color': '#388e3c',
            'homepage_products_product_price_color': '#f57c00',
            'homepage_products_product_category_color': '#7b1fa2',
            'product_detail_product_name_color': '#1b5e20',
            'product_detail_product_price_color': '#f57c00',
            'product_detail_product_description_color': '#7b1fa2',
            # Homepage Products Button Colors
            'homepage_products_view_details_button_color': '#388e3c',
            'homepage_products_view_details_button_text_color': '#ffffff',
            'homepage_products_add_to_cart_button_color': '#f57c00',
            'homepage_products_add_to_cart_button_text_color': '#ffffff',
            # Homepage Products 2 Button Colors
            'homepage_products2_view_details_button_color': '#388e3c',
            'homepage_products2_view_details_button_text_color': '#ffffff',
            'homepage_products2_add_to_cart_button_color': '#f57c00',
            'homepage_products2_add_to_cart_button_text_color': '#ffffff',
            # Products Page Button Colors
            'products_page_view_details_button_color': '#388e3c',
            'products_page_view_details_button_text_color': '#ffffff',
            'products_page_add_to_cart_button_color': '#f57c00',
            'products_page_add_to_cart_button_text_color': '#ffffff',
            # Product Detail Button Colors
            'product_detail_add_to_cart_button_color': '#f57c00',
            'product_detail_add_to_cart_button_text_color': '#ffffff',
            'product_detail_buy_now_button_color': '#388e3c',
            'product_detail_buy_now_button_text_color': '#ffffff',
            'product_detail_continue_shopping_button_color': '#7b1fa2',
            'product_detail_continue_shopping_button_text_color': '#ffffff'
        }
    }

# Main site settings endpoints
@site_settings_bp.route('/site-settings', methods=['GET'])
@admin_required
def get_site_settings():
    print("🔄 BACKEND RESTARTED - NEW CODE ACTIVE!")
    try:
        settings = SiteSettings.query.first()
        if not settings:
            # Create default settings
            settings = SiteSettings(
                site_name='pebdeq',
                use_logo=False
            )
            db.session.add(settings)
            db.session.commit()
        
        print(f"🔍 BACKEND - GET site settings - Google OAuth ayarları:")
        print(f"   enabled: {settings.google_oauth_enabled}")
        print(f"   client_id: {settings.google_oauth_client_id}")
        print(f"   client_secret: {'***HIDDEN***' if settings.google_oauth_client_secret else 'EMPTY'}")
        print(f"   redirect_uri: {settings.google_oauth_redirect_uri}")
        print(f"   scope: {settings.google_oauth_scope}")
        
        # Check database info
        from flask import current_app
        print(f"🔍 BACKEND - Database URI: {current_app.config.get('SQLALCHEMY_DATABASE_URI')}")
        print(f"🔍 BACKEND - Settings ID: {settings.id}")
        print(f"🔍 BACKEND - Settings object: {settings}")
        
        # Check if fields exist in model
        print(f"🔍 BACKEND - Model attribute check:")
        print(f"   hasattr google_oauth_enabled: {hasattr(settings, 'google_oauth_enabled')}")
        print(f"   hasattr google_oauth_client_id: {hasattr(settings, 'google_oauth_client_id')}")
        print(f"   hasattr google_oauth_client_secret: {hasattr(settings, 'google_oauth_client_secret')}")
        
        response_data = {
            # Site Identity - Flat fields for direct use
            'site_name': settings.site_name,
            'site_logo': settings.site_logo,
            'use_logo': settings.use_logo,
            'logo_width': settings.logo_width,
            'logo_height': settings.logo_height,
            'site_logo2': settings.site_logo2,
            'use_logo2': settings.use_logo2,
            'logo2_width': settings.logo2_width,
            'logo2_height': settings.logo2_height,
            
            # Logo Shadow Settings
            'logo_shadow_enabled': settings.logo_shadow_enabled,
            'logo_shadow_color': settings.logo_shadow_color,
            'logo_shadow_blur': settings.logo_shadow_blur,
            'logo_shadow_offset_x': settings.logo_shadow_offset_x,
            'logo_shadow_offset_y': settings.logo_shadow_offset_y,
            'logo_shadow_opacity': settings.logo_shadow_opacity,
            
            # Second Logo Shadow Settings
            'logo2_shadow_enabled': settings.logo2_shadow_enabled,
            'logo2_shadow_color': settings.logo2_shadow_color,
            'logo2_shadow_blur': settings.logo2_shadow_blur,
            'logo2_shadow_offset_x': settings.logo2_shadow_offset_x,
            'logo2_shadow_offset_y': settings.logo2_shadow_offset_y,
            'logo2_shadow_opacity': settings.logo2_shadow_opacity,
            
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
            
            # Header Appearance - Flat fields
            'header_background_color': settings.header_background_color,
            'header_text_color': settings.header_text_color,
            'header_padding': settings.header_padding,
            'header_sticky': settings.header_sticky,
            'header_shadow': settings.header_shadow,
            'header_border_bottom': settings.header_border_bottom,
            'header_border_color': settings.header_border_color,
            
            # Welcome Section - Flat fields
            'welcome_title': settings.welcome_title,
            'welcome_subtitle': settings.welcome_subtitle,
            'welcome_background_image': settings.welcome_background_image,
            'welcome_background_color': settings.welcome_background_color,
            'welcome_text_color': settings.welcome_text_color,
            'welcome_button_text': settings.welcome_button_text,
            'welcome_button_link': settings.welcome_button_link,
            'welcome_button_color': settings.welcome_button_color,
            
            # Homepage General Settings - Flat fields
            'homepage_background_color': settings.homepage_background_color,
            
            # Collections Section - Flat fields
            'collections_title': settings.collections_title,
            'collections_show_categories': settings.collections_show_categories,
            'collections_categories_per_row': settings.collections_categories_per_row,
            'collections_max_rows': settings.collections_max_rows,
            'collections_show_section': settings.collections_show_section,
            
            # Contact & Social - Flat fields
            'contact_phone': settings.contact_phone,
            'contact_email': settings.contact_email,
            'contact_address': settings.contact_address,
            'social_instagram': settings.social_instagram,
            'social_facebook': settings.social_facebook,
            'social_twitter': settings.social_twitter,
            'social_youtube': settings.social_youtube,
            'social_linkedin': settings.social_linkedin,
            
            # SEO Settings - Flat fields
            'meta_title': settings.meta_title,
            'meta_description': settings.meta_description,
            'meta_keywords': settings.meta_keywords,
            
            # Business Settings - Flat fields
            'currency_symbol': settings.currency_symbol,
            'currency_code': settings.currency_code,
            'shipping_cost': settings.shipping_cost,
            'free_shipping_threshold': settings.free_shipping_threshold,
            
            # Feature Flags - Flat fields
            'enable_reviews': settings.enable_reviews,
            'enable_wishlist': settings.enable_wishlist,
            'enable_compare': settings.enable_compare,
            'enable_newsletter': settings.enable_newsletter,
            'maintenance_mode': settings.maintenance_mode,
            
            # About Page Settings - Flat fields
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
            
            # Footer Settings - Flat fields
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
            
            # Footer Legal Links Section
            'footer_legal_title': settings.footer_legal_title,
            'footer_legal_show_section': settings.footer_legal_show_section,
            'footer_legal_privacy_policy_title': settings.footer_legal_privacy_policy_title,
            'footer_legal_privacy_policy_content': settings.footer_legal_privacy_policy_content,
            'footer_legal_terms_of_service_title': settings.footer_legal_terms_of_service_title,
            'footer_legal_terms_of_service_content': settings.footer_legal_terms_of_service_content,
            'footer_legal_return_policy_title': settings.footer_legal_return_policy_title,
            'footer_legal_return_policy_content': settings.footer_legal_return_policy_content,
            'footer_legal_shipping_policy_title': settings.footer_legal_shipping_policy_title,
            'footer_legal_shipping_policy_content': settings.footer_legal_shipping_policy_content,
            'footer_legal_cookie_policy_title': settings.footer_legal_cookie_policy_title,
            'footer_legal_cookie_policy_content': settings.footer_legal_cookie_policy_content,
            'footer_legal_dmca_notice_title': settings.footer_legal_dmca_notice_title,
            'footer_legal_dmca_notice_content': settings.footer_legal_dmca_notice_content,
            'footer_legal_accessibility_statement_title': settings.footer_legal_accessibility_statement_title,
            'footer_legal_accessibility_statement_content': settings.footer_legal_accessibility_statement_content,
            
            # Navigation Settings - Flat field
            'navigation_links': settings.navigation_links or [],
            
            # Navigation Link Styling - Flat fields
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
            
            # Products Page Settings - Flat fields
            'products_page_background_color': settings.products_page_background_color,
            'products_page_per_row': settings.products_page_per_row,
            'products_page_max_items_per_page': settings.products_page_max_items_per_page,
            'products_page_show_images': settings.products_page_show_images,
            'products_page_image_height': settings.products_page_image_height,
            'products_page_image_width': settings.products_page_image_width,
            'products_page_remove_image_background': settings.products_page_remove_image_background,
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
            'products_page_show_rating': settings.products_page_show_rating,
            'products_page_show_quick_view': settings.products_page_show_quick_view,
            'products_page_enable_pagination': settings.products_page_enable_pagination,
            'products_page_enable_filters': settings.products_page_enable_filters,
            'products_page_enable_search': settings.products_page_enable_search,
            'products_page_enable_image_preview': settings.products_page_enable_image_preview,
            
            # Products Page Font & Color Settings - Flat fields
            'products_page_product_name_color': settings.products_page_product_name_color,
            'products_page_product_name_font_family': settings.products_page_product_name_font_family,
            'products_page_product_name_font_size': settings.products_page_product_name_font_size,
            'products_page_product_name_font_weight': settings.products_page_product_name_font_weight,
            'products_page_product_name_font_style': settings.products_page_product_name_font_style,
            'products_page_title_color': settings.products_page_title_color,
            'products_page_title_font_family': settings.products_page_title_font_family,
            'products_page_title_font_size': settings.products_page_title_font_size,
            'products_page_title_font_weight': settings.products_page_title_font_weight,
            'products_page_title_font_style': settings.products_page_title_font_style,
            'products_page_subtitle_color': settings.products_page_subtitle_color,
            'products_page_subtitle_font_family': settings.products_page_subtitle_font_family,
            'products_page_subtitle_font_size': settings.products_page_subtitle_font_size,
            'products_page_subtitle_font_weight': settings.products_page_subtitle_font_weight,
            'products_page_subtitle_font_style': settings.products_page_subtitle_font_style,
            'products_page_product_price_color': settings.products_page_product_price_color,
            'products_page_product_price_font_family': settings.products_page_product_price_font_family,
            'products_page_product_price_font_size': settings.products_page_product_price_font_size,
            'products_page_product_price_font_weight': settings.products_page_product_price_font_weight,
            'products_page_product_price_font_style': settings.products_page_product_price_font_style,
            'products_page_product_category_color': settings.products_page_product_category_color,
            'products_page_product_category_font_family': settings.products_page_product_category_font_family,
            'products_page_product_category_font_size': settings.products_page_product_category_font_size,
            'products_page_product_category_font_weight': settings.products_page_product_category_font_weight,
            'products_page_product_category_font_style': settings.products_page_product_category_font_style,
            'products_page_stock_info_color': settings.products_page_stock_info_color,
            'products_page_stock_info_font_family': settings.products_page_stock_info_font_family,
            'products_page_stock_info_font_size': settings.products_page_stock_info_font_size,
            'products_page_stock_info_font_weight': settings.products_page_stock_info_font_weight,
            'products_page_stock_info_font_style': settings.products_page_stock_info_font_style,
            'products_page_view_details_button_color': settings.products_page_view_details_button_color,
            'products_page_view_details_button_text_color': settings.products_page_view_details_button_text_color,
            'products_page_view_details_button_font_family': settings.products_page_view_details_button_font_family,
            'products_page_view_details_button_font_size': settings.products_page_view_details_button_font_size,
            'products_page_view_details_button_font_weight': settings.products_page_view_details_button_font_weight,
            'products_page_view_details_button_font_style': settings.products_page_view_details_button_font_style,
            'products_page_add_to_cart_button_color': settings.products_page_add_to_cart_button_color,
            'products_page_add_to_cart_button_text_color': settings.products_page_add_to_cart_button_text_color,
            'products_page_add_to_cart_button_font_family': settings.products_page_add_to_cart_button_font_family,
            'products_page_add_to_cart_button_font_size': settings.products_page_add_to_cart_button_font_size,
            'products_page_add_to_cart_button_font_weight': settings.products_page_add_to_cart_button_font_weight,
            'products_page_add_to_cart_button_font_style': settings.products_page_add_to_cart_button_font_style,
            
            # Homepage Products Settings - Flat fields
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
            
            # Homepage Products Font & Color Settings - Flat fields
            'homepage_products_product_name_color': settings.homepage_products_product_name_color,
            'homepage_products_product_name_font_family': settings.homepage_products_product_name_font_family,
            'homepage_products_product_name_font_size': settings.homepage_products_product_name_font_size,
            'homepage_products_product_name_font_weight': settings.homepage_products_product_name_font_weight,
            'homepage_products_product_name_font_style': settings.homepage_products_product_name_font_style,
            'homepage_products_product_price_color': settings.homepage_products_product_price_color,
            'homepage_products_product_price_font_family': settings.homepage_products_product_price_font_family,
            'homepage_products_product_price_font_size': settings.homepage_products_product_price_font_size,
            'homepage_products_product_price_font_weight': settings.homepage_products_product_price_font_weight,
            'homepage_products_product_price_font_style': settings.homepage_products_product_price_font_style,
            'homepage_products_product_category_color': settings.homepage_products_product_category_color,
            'homepage_products_product_category_font_family': settings.homepage_products_product_category_font_family,
            'homepage_products_product_category_font_size': settings.homepage_products_product_category_font_size,
            'homepage_products_product_category_font_weight': settings.homepage_products_product_category_font_weight,
            'homepage_products_product_category_font_style': settings.homepage_products_product_category_font_style,
            'homepage_products_stock_info_color': settings.homepage_products_stock_info_color,
            'homepage_products_stock_info_font_family': settings.homepage_products_stock_info_font_family,
            'homepage_products_stock_info_font_size': settings.homepage_products_stock_info_font_size,
            'homepage_products_stock_info_font_weight': settings.homepage_products_stock_info_font_weight,
            'homepage_products_stock_info_font_style': settings.homepage_products_stock_info_font_style,
            'homepage_products_view_details_button_color': settings.homepage_products_view_details_button_color,
            'homepage_products_view_details_button_text_color': settings.homepage_products_view_details_button_text_color,
            'homepage_products_view_details_button_font_family': settings.homepage_products_view_details_button_font_family,
            'homepage_products_view_details_button_font_size': settings.homepage_products_view_details_button_font_size,
            'homepage_products_view_details_button_font_weight': settings.homepage_products_view_details_button_font_weight,
            'homepage_products_view_details_button_font_style': settings.homepage_products_view_details_button_font_style,
            'homepage_products_add_to_cart_button_color': settings.homepage_products_add_to_cart_button_color,
            'homepage_products_add_to_cart_button_text_color': settings.homepage_products_add_to_cart_button_text_color,
            'homepage_products_add_to_cart_button_font_family': settings.homepage_products_add_to_cart_button_font_family,
            'homepage_products_add_to_cart_button_font_size': settings.homepage_products_add_to_cart_button_font_size,
            'homepage_products_add_to_cart_button_font_weight': settings.homepage_products_add_to_cart_button_font_weight,
            'homepage_products_add_to_cart_button_font_style': settings.homepage_products_add_to_cart_button_font_style,
            
            # Homepage Products 2 Settings - Flat fields
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
            
            # Homepage Products 2 Font & Color Settings - Flat fields
            'homepage_products2_product_name_color': settings.homepage_products2_product_name_color,
            'homepage_products2_product_name_font_family': settings.homepage_products2_product_name_font_family,
            'homepage_products2_product_name_font_size': settings.homepage_products2_product_name_font_size,
            'homepage_products2_product_name_font_weight': settings.homepage_products2_product_name_font_weight,
            'homepage_products2_product_name_font_style': settings.homepage_products2_product_name_font_style,
            'homepage_products2_product_price_color': settings.homepage_products2_product_price_color,
            'homepage_products2_product_price_font_family': settings.homepage_products2_product_price_font_family,
            'homepage_products2_product_price_font_size': settings.homepage_products2_product_price_font_size,
            'homepage_products2_product_price_font_weight': settings.homepage_products2_product_price_font_weight,
            'homepage_products2_product_price_font_style': settings.homepage_products2_product_price_font_style,
            'homepage_products2_product_category_color': settings.homepage_products2_product_category_color,
            'homepage_products2_product_category_font_family': settings.homepage_products2_product_category_font_family,
            'homepage_products2_product_category_font_size': settings.homepage_products2_product_category_font_size,
            'homepage_products2_product_category_font_weight': settings.homepage_products2_product_category_font_weight,
            'homepage_products2_product_category_font_style': settings.homepage_products2_product_category_font_style,
            'homepage_products2_stock_info_color': settings.homepage_products2_stock_info_color,
            'homepage_products2_stock_info_font_family': settings.homepage_products2_stock_info_font_family,
            'homepage_products2_stock_info_font_size': settings.homepage_products2_stock_info_font_size,
            'homepage_products2_stock_info_font_weight': settings.homepage_products2_stock_info_font_weight,
            'homepage_products2_stock_info_font_style': settings.homepage_products2_stock_info_font_style,
            'homepage_products2_view_details_button_color': settings.homepage_products2_view_details_button_color,
            'homepage_products2_view_details_button_text_color': settings.homepage_products2_view_details_button_text_color,
            'homepage_products2_view_details_button_font_family': settings.homepage_products2_view_details_button_font_family,
            'homepage_products2_view_details_button_font_size': settings.homepage_products2_view_details_button_font_size,
            'homepage_products2_view_details_button_font_weight': settings.homepage_products2_view_details_button_font_weight,
            'homepage_products2_view_details_button_font_style': settings.homepage_products2_view_details_button_font_style,
            'homepage_products2_add_to_cart_button_color': settings.homepage_products2_add_to_cart_button_color,
            'homepage_products2_add_to_cart_button_text_color': settings.homepage_products2_add_to_cart_button_text_color,
            'homepage_products2_add_to_cart_button_font_family': settings.homepage_products2_add_to_cart_button_font_family,
            'homepage_products2_add_to_cart_button_font_size': settings.homepage_products2_add_to_cart_button_font_size,
            'homepage_products2_add_to_cart_button_font_weight': settings.homepage_products2_add_to_cart_button_font_weight,
            'homepage_products2_add_to_cart_button_font_style': settings.homepage_products2_add_to_cart_button_font_style,
            
            # Product Detail Page Settings - Flat fields
            'product_detail_show_thumbnails': settings.product_detail_show_thumbnails,
            'product_detail_show_category_badge': settings.product_detail_show_category_badge,
            'product_detail_show_featured_badge': settings.product_detail_show_featured_badge,
            'product_detail_show_stock_info': settings.product_detail_show_stock_info,
            'product_detail_show_variations': settings.product_detail_show_variations,
            'product_detail_show_description': settings.product_detail_show_description,
            'product_detail_show_details_section': settings.product_detail_show_details_section,
            'product_detail_show_video': settings.product_detail_show_video,
            'product_detail_show_buy_now_button': settings.product_detail_show_buy_now_button,
            'product_detail_show_continue_shopping_button': settings.product_detail_show_continue_shopping_button,
            'product_detail_show_quantity_selector': settings.product_detail_show_quantity_selector,
            'product_detail_show_image_lightbox': settings.product_detail_show_image_lightbox,
            
            # Product Detail Button Colors - Flat fields
            'product_detail_add_to_cart_button_color': settings.product_detail_add_to_cart_button_color,
            'product_detail_add_to_cart_button_text_color': settings.product_detail_add_to_cart_button_text_color,
            'product_detail_buy_now_button_color': settings.product_detail_buy_now_button_color,
            'product_detail_buy_now_button_text_color': settings.product_detail_buy_now_button_text_color,
            'product_detail_continue_shopping_button_color': settings.product_detail_continue_shopping_button_color,
            'product_detail_continue_shopping_button_text_color': settings.product_detail_continue_shopping_button_text_color,
            
            # Product Detail Text Colors - Flat fields
            'product_detail_product_name_color': settings.product_detail_product_name_color,
            'product_detail_product_price_color': settings.product_detail_product_price_color,
            'product_detail_product_description_color': settings.product_detail_product_description_color,
            'product_detail_product_details_label_color': settings.product_detail_product_details_label_color,
            'product_detail_product_details_value_color': settings.product_detail_product_details_value_color,
            
            # Product Detail Page Font Settings - Flat fields
            'product_detail_product_name_font_family': settings.product_detail_product_name_font_family,
            'product_detail_product_name_font_size': settings.product_detail_product_name_font_size,
            'product_detail_product_name_font_weight': settings.product_detail_product_name_font_weight,
            'product_detail_product_name_font_style': settings.product_detail_product_name_font_style,
            'product_detail_product_price_font_family': settings.product_detail_product_price_font_family,
            'product_detail_product_price_font_size': settings.product_detail_product_price_font_size,
            'product_detail_product_price_font_weight': settings.product_detail_product_price_font_weight,
            'product_detail_product_price_font_style': settings.product_detail_product_price_font_style,
            'product_detail_product_description_font_family': settings.product_detail_product_description_font_family,
            'product_detail_product_description_font_size': settings.product_detail_product_description_font_size,
            'product_detail_product_description_font_weight': settings.product_detail_product_description_font_weight,
            'product_detail_product_description_font_style': settings.product_detail_product_description_font_style,
            'product_detail_product_details_label_font_family': settings.product_detail_product_details_label_font_family,
            'product_detail_product_details_label_font_size': settings.product_detail_product_details_label_font_size,
            'product_detail_product_details_label_font_weight': settings.product_detail_product_details_label_font_weight,
            'product_detail_product_details_label_font_style': settings.product_detail_product_details_label_font_style,
            'product_detail_product_details_value_font_family': settings.product_detail_product_details_value_font_family,
            'product_detail_product_details_value_font_size': settings.product_detail_product_details_value_font_size,
            'product_detail_product_details_value_font_weight': settings.product_detail_product_details_value_font_weight,
            'product_detail_product_details_value_font_style': settings.product_detail_product_details_value_font_style,
            
            # Google OAuth Settings
            'google_oauth_enabled': settings.google_oauth_enabled or False,
            'google_oauth_client_id': settings.google_oauth_client_id or '',
            'google_oauth_client_secret': settings.google_oauth_client_secret or '',
            'google_oauth_redirect_uri': settings.google_oauth_redirect_uri or '',
            'google_oauth_scope': settings.google_oauth_scope or 'openid email profile',
            
            # Site URL Settings
            'site_base_url': settings.site_base_url,
            'site_is_production': settings.site_is_production,
            'site_ssl_enabled': settings.site_ssl_enabled,
        }
        
        # Debug: Check if Google OAuth settings are in response
        print(f"🔍 BACKEND - Response Google OAuth keys:")
        oauth_keys = [k for k in response_data.keys() if 'google_oauth' in k]
        print(f"   OAuth keys found: {oauth_keys}")
        for key in oauth_keys:
            print(f"   {key}: {response_data[key]}")
        
        return jsonify(response_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Site Settings - Update endpoint
@site_settings_bp.route('/site-settings', methods=['PUT'])
@admin_required
def update_site_settings():
    try:
        data = request.get_json()
        
        # Debug log to see incoming data
        print(f"🔍 BACKEND - Incoming site settings data:")
        for key, value in data.items():
            if 'marquee' in key:
                print(f"   MARQUEE - {key}: {value}")
            elif 'header' in key:
                print(f"   HEADER - {key}: {value}")
            elif 'nav_link' in key:
                print(f"   NAV_LINK - {key}: {value}")
            elif 'navigation' in key:
                print(f"   NAVIGATION - {key}: {len(value) if isinstance(value, list) else value}")
        
        settings = SiteSettings.query.first()
        
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
        
        # Site Identity
        if 'site_name' in data:
            settings.site_name = data['site_name']
        if 'site_logo' in data:
            settings.site_logo = data['site_logo']
        if 'use_logo' in data:
            settings.use_logo = data['use_logo']
        if 'logo_width' in data:
            settings.logo_width = data['logo_width']
        if 'logo_height' in data:
            settings.logo_height = data['logo_height']
        
        # Second Logo Settings
        if 'site_logo2' in data:
            settings.site_logo2 = data['site_logo2']
        if 'use_logo2' in data:
            settings.use_logo2 = data['use_logo2']
        if 'logo2_width' in data:
            settings.logo2_width = data['logo2_width']
        if 'logo2_height' in data:
            settings.logo2_height = data['logo2_height']
        
        # Logo Shadow Settings
        if 'logo_shadow_enabled' in data:
            settings.logo_shadow_enabled = data['logo_shadow_enabled']
        if 'logo_shadow_color' in data:
            settings.logo_shadow_color = data['logo_shadow_color']
        if 'logo_shadow_blur' in data:
            settings.logo_shadow_blur = data['logo_shadow_blur']
        if 'logo_shadow_offset_x' in data:
            settings.logo_shadow_offset_x = data['logo_shadow_offset_x']
        if 'logo_shadow_offset_y' in data:
            settings.logo_shadow_offset_y = data['logo_shadow_offset_y']
        if 'logo_shadow_opacity' in data:
            settings.logo_shadow_opacity = data['logo_shadow_opacity']
        
        # Second Logo Shadow Settings
        if 'logo2_shadow_enabled' in data:
            settings.logo2_shadow_enabled = data['logo2_shadow_enabled']
        if 'logo2_shadow_color' in data:
            settings.logo2_shadow_color = data['logo2_shadow_color']
        if 'logo2_shadow_blur' in data:
            settings.logo2_shadow_blur = data['logo2_shadow_blur']
        if 'logo2_shadow_offset_x' in data:
            settings.logo2_shadow_offset_x = data['logo2_shadow_offset_x']
        if 'logo2_shadow_offset_y' in data:
            settings.logo2_shadow_offset_y = data['logo2_shadow_offset_y']
        if 'logo2_shadow_opacity' in data:
            settings.logo2_shadow_opacity = data['logo2_shadow_opacity']
        
        # Contact & Social
        if 'contact_phone' in data:
            settings.contact_phone = data['contact_phone']
        if 'contact_email' in data:
            settings.contact_email = data['contact_email']
        if 'contact_address' in data:
            settings.contact_address = data['contact_address']
        if 'social_instagram' in data:
            settings.social_instagram = data['social_instagram']
        if 'social_facebook' in data:
            settings.social_facebook = data['social_facebook']
        if 'social_twitter' in data:
            settings.social_twitter = data['social_twitter']
        if 'social_youtube' in data:
            settings.social_youtube = data['social_youtube']
        if 'social_linkedin' in data:
            settings.social_linkedin = data['social_linkedin']
        
        # SEO Settings
        if 'meta_title' in data:
            settings.meta_title = data['meta_title']
        if 'meta_description' in data:
            settings.meta_description = data['meta_description']
        if 'meta_keywords' in data:
            settings.meta_keywords = data['meta_keywords']
        
        # Business Settings
        if 'currency_symbol' in data:
            settings.currency_symbol = data['currency_symbol']
        if 'currency_code' in data:
            settings.currency_code = data['currency_code']
        if 'shipping_cost' in data:
            settings.shipping_cost = data['shipping_cost']
        if 'free_shipping_threshold' in data:
            settings.free_shipping_threshold = data['free_shipping_threshold']
        
        # Feature Flags
        if 'enable_reviews' in data:
            settings.enable_reviews = data['enable_reviews']
        if 'enable_wishlist' in data:
            settings.enable_wishlist = data['enable_wishlist']
        if 'enable_compare' in data:
            settings.enable_compare = data['enable_compare']
        if 'enable_newsletter' in data:
            settings.enable_newsletter = data['enable_newsletter']
        if 'maintenance_mode' in data:
            settings.maintenance_mode = data['maintenance_mode']
        
        # Footer Settings
        if 'footer_show_section' in data:
            settings.footer_show_section = data['footer_show_section']
        if 'footer_background_color' in data:
            settings.footer_background_color = data['footer_background_color']
        if 'footer_text_color' in data:
            settings.footer_text_color = data['footer_text_color']
        if 'footer_company_name' in data:
            settings.footer_company_name = data['footer_company_name']
        if 'footer_company_description' in data:
            settings.footer_company_description = data['footer_company_description']
        if 'footer_copyright_text' in data:
            settings.footer_copyright_text = data['footer_copyright_text']
        
        # Footer Logo Settings
        if 'footer_use_logo' in data:
            settings.footer_use_logo = data['footer_use_logo']
        if 'footer_logo' in data:
            settings.footer_logo = data['footer_logo']
        if 'footer_logo_width' in data:
            settings.footer_logo_width = data['footer_logo_width']
        if 'footer_logo_height' in data:
            settings.footer_logo_height = data['footer_logo_height']
        
        # Footer Support Section Settings
        if 'footer_support_title' in data:
            settings.footer_support_title = data['footer_support_title']
        if 'footer_support_show_section' in data:
            settings.footer_support_show_section = data['footer_support_show_section']
        if 'footer_support_links' in data:
            settings.footer_support_links = data['footer_support_links']
        
        # Footer Quick Links Section Settings
        if 'footer_quick_links_title' in data:
            settings.footer_quick_links_title = data['footer_quick_links_title']
        if 'footer_quick_links_show_section' in data:
            settings.footer_quick_links_show_section = data['footer_quick_links_show_section']
        if 'footer_quick_links' in data:
            settings.footer_quick_links = data['footer_quick_links']
        
        # Footer Social Section Settings
        if 'footer_social_title' in data:
            settings.footer_social_title = data['footer_social_title']
        if 'footer_social_show_section' in data:
            settings.footer_social_show_section = data['footer_social_show_section']
        
        # Footer Newsletter Section Settings
        if 'footer_newsletter_title' in data:
            settings.footer_newsletter_title = data['footer_newsletter_title']
        if 'footer_newsletter_show_section' in data:
            settings.footer_newsletter_show_section = data['footer_newsletter_show_section']
        if 'footer_newsletter_description' in data:
            settings.footer_newsletter_description = data['footer_newsletter_description']
        if 'footer_newsletter_placeholder' in data:
            settings.footer_newsletter_placeholder = data['footer_newsletter_placeholder']
        if 'footer_newsletter_button_text' in data:
            settings.footer_newsletter_button_text = data['footer_newsletter_button_text']
        
        # Footer Legal Links Section Settings
        if 'footer_legal_title' in data:
            settings.footer_legal_title = data['footer_legal_title']
        if 'footer_legal_show_section' in data:
            settings.footer_legal_show_section = data['footer_legal_show_section']
        if 'footer_legal_privacy_policy_title' in data:
            settings.footer_legal_privacy_policy_title = data['footer_legal_privacy_policy_title']
        if 'footer_legal_privacy_policy_content' in data:
            settings.footer_legal_privacy_policy_content = data['footer_legal_privacy_policy_content']
        if 'footer_legal_terms_of_service_title' in data:
            settings.footer_legal_terms_of_service_title = data['footer_legal_terms_of_service_title']
        if 'footer_legal_terms_of_service_content' in data:
            settings.footer_legal_terms_of_service_content = data['footer_legal_terms_of_service_content']
        if 'footer_legal_return_policy_title' in data:
            settings.footer_legal_return_policy_title = data['footer_legal_return_policy_title']
        if 'footer_legal_return_policy_content' in data:
            settings.footer_legal_return_policy_content = data['footer_legal_return_policy_content']
        if 'footer_legal_shipping_policy_title' in data:
            settings.footer_legal_shipping_policy_title = data['footer_legal_shipping_policy_title']
        if 'footer_legal_shipping_policy_content' in data:
            settings.footer_legal_shipping_policy_content = data['footer_legal_shipping_policy_content']
        if 'footer_legal_cookie_policy_title' in data:
            settings.footer_legal_cookie_policy_title = data['footer_legal_cookie_policy_title']
        if 'footer_legal_cookie_policy_content' in data:
            settings.footer_legal_cookie_policy_content = data['footer_legal_cookie_policy_content']
        if 'footer_legal_dmca_notice_title' in data:
            settings.footer_legal_dmca_notice_title = data['footer_legal_dmca_notice_title']
        if 'footer_legal_dmca_notice_content' in data:
            settings.footer_legal_dmca_notice_content = data['footer_legal_dmca_notice_content']
        if 'footer_legal_accessibility_statement_title' in data:
            settings.footer_legal_accessibility_statement_title = data['footer_legal_accessibility_statement_title']
        if 'footer_legal_accessibility_statement_content' in data:
            settings.footer_legal_accessibility_statement_content = data['footer_legal_accessibility_statement_content']
        
        # Welcome section settings
        if 'welcome_title' in data:
            settings.welcome_title = data['welcome_title']
        if 'welcome_subtitle' in data:
            settings.welcome_subtitle = data['welcome_subtitle']
        if 'welcome_background_image' in data:
            settings.welcome_background_image = data['welcome_background_image']
        if 'welcome_background_color' in data:
            settings.welcome_background_color = data['welcome_background_color']
        if 'welcome_text_color' in data:
            settings.welcome_text_color = data['welcome_text_color']
        if 'welcome_button_text' in data:
            settings.welcome_button_text = data['welcome_button_text']
        if 'welcome_button_link' in data:
            settings.welcome_button_link = data['welcome_button_link']
        if 'welcome_button_color' in data:
            settings.welcome_button_color = data['welcome_button_color']
        
        # Collections settings
        if 'collections_title' in data:
            settings.collections_title = data['collections_title']
        if 'collections_show_categories' in data:
            settings.collections_show_categories = data['collections_show_categories']
        if 'collections_categories_per_row' in data:
            settings.collections_categories_per_row = data['collections_categories_per_row']
        if 'collections_max_rows' in data:
            settings.collections_max_rows = data['collections_max_rows']
        if 'collections_show_section' in data:
            settings.collections_show_section = data['collections_show_section']
        
        # Homepage General Settings
        if 'homepage_background_color' in data:
            settings.homepage_background_color = data['homepage_background_color']
        
        # About Page Settings
        if 'about_page_title' in data:
            settings.about_page_title = data['about_page_title']
        if 'about_page_subtitle' in data:
            settings.about_page_subtitle = data['about_page_subtitle']
        if 'about_page_content' in data:
            settings.about_page_content = data['about_page_content']
        if 'about_page_mission_title' in data:
            settings.about_page_mission_title = data['about_page_mission_title']
        if 'about_page_mission_content' in data:
            settings.about_page_mission_content = data['about_page_mission_content']
        if 'about_page_values_title' in data:
            settings.about_page_values_title = data['about_page_values_title']
        if 'about_page_values_content' in data:
            settings.about_page_values_content = data['about_page_values_content']
        if 'about_page_team_title' in data:
            settings.about_page_team_title = data['about_page_team_title']
        if 'about_page_team_content' in data:
            settings.about_page_team_content = data['about_page_team_content']
        if 'about_page_history_title' in data:
            settings.about_page_history_title = data['about_page_history_title']
        if 'about_page_history_content' in data:
            settings.about_page_history_content = data['about_page_history_content']
        if 'about_page_contact_title' in data:
            settings.about_page_contact_title = data['about_page_contact_title']
        if 'about_page_contact_content' in data:
            settings.about_page_contact_content = data['about_page_contact_content']
        if 'about_page_show_mission' in data:
            settings.about_page_show_mission = data['about_page_show_mission']
        if 'about_page_show_values' in data:
            settings.about_page_show_values = data['about_page_show_values']
        if 'about_page_show_team' in data:
            settings.about_page_show_team = data['about_page_show_team']
        if 'about_page_show_history' in data:
            settings.about_page_show_history = data['about_page_show_history']
        if 'about_page_show_contact' in data:
            settings.about_page_show_contact = data['about_page_show_contact']
        if 'about_page_background_image' in data:
            settings.about_page_background_image = data['about_page_background_image']
        if 'about_page_background_color' in data:
            settings.about_page_background_color = data['about_page_background_color']
        
        # Navigation Settings
        if 'navigation_links' in data:
            settings.navigation_links = data['navigation_links']
        
        # Navigation Link Styling
        if 'nav_link_color' in data:
            settings.nav_link_color = data['nav_link_color']
        if 'nav_link_hover_color' in data:
            settings.nav_link_hover_color = data['nav_link_hover_color']
        if 'nav_link_active_color' in data:
            settings.nav_link_active_color = data['nav_link_active_color']
        if 'nav_link_font_size' in data:
            settings.nav_link_font_size = data['nav_link_font_size']
        if 'nav_link_font_weight' in data:
            settings.nav_link_font_weight = data['nav_link_font_weight']
        if 'nav_link_text_transform' in data:
            settings.nav_link_text_transform = data['nav_link_text_transform']
        if 'nav_link_underline' in data:
            settings.nav_link_underline = data['nav_link_underline']
        if 'nav_link_hover_effect' in data:
            settings.nav_link_hover_effect = data['nav_link_hover_effect']
        if 'nav_link_font_family' in data:
            settings.nav_link_font_family = data['nav_link_font_family']
        if 'nav_link_text_shadow' in data:
            settings.nav_link_text_shadow = data['nav_link_text_shadow']
        
        # Header Appearance Settings
        if 'header_background_color' in data:
            settings.header_background_color = data['header_background_color']
        if 'header_text_color' in data:
            settings.header_text_color = data['header_text_color']
        if 'header_padding' in data:
            settings.header_padding = data['header_padding']
        if 'header_sticky' in data:
            settings.header_sticky = data['header_sticky']
        if 'header_shadow' in data:
            settings.header_shadow = data['header_shadow']
        if 'header_border_bottom' in data:
            settings.header_border_bottom = data['header_border_bottom']
        if 'header_border_color' in data:
            settings.header_border_color = data['header_border_color']
        
        # Marquee Settings
        if 'marquee_enabled' in data:
            settings.marquee_enabled = data['marquee_enabled']
        if 'marquee_text' in data:
            settings.marquee_text = data['marquee_text']
        if 'marquee_font_family' in data:
            settings.marquee_font_family = data['marquee_font_family']
        if 'marquee_font_size' in data:
            settings.marquee_font_size = data['marquee_font_size']
        if 'marquee_font_weight' in data:
            settings.marquee_font_weight = data['marquee_font_weight']
        if 'marquee_color' in data:
            settings.marquee_color = data['marquee_color']
        if 'marquee_background_color' in data:
            settings.marquee_background_color = data['marquee_background_color']
        if 'marquee_speed' in data:
            settings.marquee_speed = data['marquee_speed']
        if 'marquee_direction' in data:
            settings.marquee_direction = data['marquee_direction']
        if 'marquee_pause_on_hover' in data:
            settings.marquee_pause_on_hover = data['marquee_pause_on_hover']
        
        # Products Page Settings
        if 'products_page_background_color' in data:
            settings.products_page_background_color = data['products_page_background_color']
        if 'products_page_per_row' in data:
            settings.products_page_per_row = data['products_page_per_row']
        if 'products_page_max_items_per_page' in data:
            settings.products_page_max_items_per_page = data['products_page_max_items_per_page']
        if 'products_page_show_images' in data:
            settings.products_page_show_images = data['products_page_show_images']
        if 'products_page_image_height' in data:
            settings.products_page_image_height = data['products_page_image_height']
        if 'products_page_image_width' in data:
            settings.products_page_image_width = data['products_page_image_width']
        if 'products_page_remove_image_background' in data:
            settings.products_page_remove_image_background = data['products_page_remove_image_background']
        if 'products_page_show_favorite' in data:
            settings.products_page_show_favorite = data['products_page_show_favorite']
        if 'products_page_show_buy_now' in data:
            settings.products_page_show_buy_now = data['products_page_show_buy_now']
        if 'products_page_show_details' in data:
            settings.products_page_show_details = data['products_page_show_details']
        if 'products_page_show_price' in data:
            settings.products_page_show_price = data['products_page_show_price']
        if 'products_page_show_original_price' in data:
            settings.products_page_show_original_price = data['products_page_show_original_price']
        if 'products_page_show_stock' in data:
            settings.products_page_show_stock = data['products_page_show_stock']
        if 'products_page_show_category' in data:
            settings.products_page_show_category = data['products_page_show_category']
        if 'products_page_default_sort_by' in data:
            settings.products_page_default_sort_by = data['products_page_default_sort_by']
        if 'products_page_card_style' in data:
            settings.products_page_card_style = data['products_page_card_style']
        if 'products_page_card_shadow' in data:
            settings.products_page_card_shadow = data['products_page_card_shadow']
        if 'products_page_card_hover_effect' in data:
            settings.products_page_card_hover_effect = data['products_page_card_hover_effect']
        if 'products_page_show_badges' in data:
            settings.products_page_show_badges = data['products_page_show_badges']
        if 'products_page_show_rating' in data:
            settings.products_page_show_rating = data['products_page_show_rating']
        if 'products_page_show_quick_view' in data:
            settings.products_page_show_quick_view = data['products_page_show_quick_view']
        if 'products_page_enable_pagination' in data:
            settings.products_page_enable_pagination = data['products_page_enable_pagination']
        if 'products_page_enable_filters' in data:
            settings.products_page_enable_filters = data['products_page_enable_filters']
        if 'products_page_enable_search' in data:
            settings.products_page_enable_search = data['products_page_enable_search']
        if 'products_page_enable_image_preview' in data:
            settings.products_page_enable_image_preview = data['products_page_enable_image_preview']
        
        # Products Page Font & Color Settings
        if 'products_page_product_name_color' in data:
            settings.products_page_product_name_color = data['products_page_product_name_color']
        if 'products_page_product_name_font_family' in data:
            settings.products_page_product_name_font_family = data['products_page_product_name_font_family']
        if 'products_page_product_name_font_size' in data:
            settings.products_page_product_name_font_size = data['products_page_product_name_font_size']
        if 'products_page_product_name_font_weight' in data:
            settings.products_page_product_name_font_weight = data['products_page_product_name_font_weight']
        if 'products_page_product_name_font_style' in data:
            settings.products_page_product_name_font_style = data['products_page_product_name_font_style']
        if 'products_page_title_color' in data:
            settings.products_page_title_color = data['products_page_title_color']
        if 'products_page_title_font_family' in data:
            settings.products_page_title_font_family = data['products_page_title_font_family']
        if 'products_page_title_font_size' in data:
            settings.products_page_title_font_size = data['products_page_title_font_size']
        if 'products_page_title_font_weight' in data:
            settings.products_page_title_font_weight = data['products_page_title_font_weight']
        if 'products_page_title_font_style' in data:
            settings.products_page_title_font_style = data['products_page_title_font_style']
        if 'products_page_subtitle_color' in data:
            settings.products_page_subtitle_color = data['products_page_subtitle_color']
        if 'products_page_subtitle_font_family' in data:
            settings.products_page_subtitle_font_family = data['products_page_subtitle_font_family']
        if 'products_page_subtitle_font_size' in data:
            settings.products_page_subtitle_font_size = data['products_page_subtitle_font_size']
        if 'products_page_subtitle_font_weight' in data:
            settings.products_page_subtitle_font_weight = data['products_page_subtitle_font_weight']
        if 'products_page_subtitle_font_style' in data:
            settings.products_page_subtitle_font_style = data['products_page_subtitle_font_style']
        if 'products_page_product_price_color' in data:
            settings.products_page_product_price_color = data['products_page_product_price_color']
        if 'products_page_product_price_font_family' in data:
            settings.products_page_product_price_font_family = data['products_page_product_price_font_family']
        if 'products_page_product_price_font_size' in data:
            settings.products_page_product_price_font_size = data['products_page_product_price_font_size']
        if 'products_page_product_price_font_weight' in data:
            settings.products_page_product_price_font_weight = data['products_page_product_price_font_weight']
        if 'products_page_product_price_font_style' in data:
            settings.products_page_product_price_font_style = data['products_page_product_price_font_style']
        if 'products_page_product_category_color' in data:
            settings.products_page_product_category_color = data['products_page_product_category_color']
        if 'products_page_product_category_font_family' in data:
            settings.products_page_product_category_font_family = data['products_page_product_category_font_family']
        if 'products_page_product_category_font_size' in data:
            settings.products_page_product_category_font_size = data['products_page_product_category_font_size']
        if 'products_page_product_category_font_weight' in data:
            settings.products_page_product_category_font_weight = data['products_page_product_category_font_weight']
        if 'products_page_product_category_font_style' in data:
            settings.products_page_product_category_font_style = data['products_page_product_category_font_style']
        if 'products_page_stock_info_color' in data:
            settings.products_page_stock_info_color = data['products_page_stock_info_color']
        if 'products_page_stock_info_font_family' in data:
            settings.products_page_stock_info_font_family = data['products_page_stock_info_font_family']
        if 'products_page_stock_info_font_size' in data:
            settings.products_page_stock_info_font_size = data['products_page_stock_info_font_size']
        if 'products_page_stock_info_font_weight' in data:
            settings.products_page_stock_info_font_weight = data['products_page_stock_info_font_weight']
        if 'products_page_stock_info_font_style' in data:
            settings.products_page_stock_info_font_style = data['products_page_stock_info_font_style']
        if 'products_page_view_details_button_color' in data:
            settings.products_page_view_details_button_color = data['products_page_view_details_button_color']
        if 'products_page_view_details_button_text_color' in data:
            settings.products_page_view_details_button_text_color = data['products_page_view_details_button_text_color']
        if 'products_page_view_details_button_font_family' in data:
            settings.products_page_view_details_button_font_family = data['products_page_view_details_button_font_family']
        if 'products_page_view_details_button_font_size' in data:
            settings.products_page_view_details_button_font_size = data['products_page_view_details_button_font_size']
        if 'products_page_view_details_button_font_weight' in data:
            settings.products_page_view_details_button_font_weight = data['products_page_view_details_button_font_weight']
        if 'products_page_view_details_button_font_style' in data:
            settings.products_page_view_details_button_font_style = data['products_page_view_details_button_font_style']
        if 'products_page_add_to_cart_button_color' in data:
            settings.products_page_add_to_cart_button_color = data['products_page_add_to_cart_button_color']
        if 'products_page_add_to_cart_button_text_color' in data:
            settings.products_page_add_to_cart_button_text_color = data['products_page_add_to_cart_button_text_color']
        if 'products_page_add_to_cart_button_font_family' in data:
            settings.products_page_add_to_cart_button_font_family = data['products_page_add_to_cart_button_font_family']
        if 'products_page_add_to_cart_button_font_size' in data:
            settings.products_page_add_to_cart_button_font_size = data['products_page_add_to_cart_button_font_size']
        if 'products_page_add_to_cart_button_font_weight' in data:
            settings.products_page_add_to_cart_button_font_weight = data['products_page_add_to_cart_button_font_weight']
        if 'products_page_add_to_cart_button_font_style' in data:
            settings.products_page_add_to_cart_button_font_style = data['products_page_add_to_cart_button_font_style']
        
        # Homepage Products Settings
        if 'homepage_products_show_section' in data:
            settings.homepage_products_show_section = data['homepage_products_show_section']
        if 'homepage_products_title' in data:
            settings.homepage_products_title = data['homepage_products_title']
        if 'homepage_products_subtitle' in data:
            settings.homepage_products_subtitle = data['homepage_products_subtitle']
        if 'homepage_products_max_rows' in data:
            settings.homepage_products_max_rows = data['homepage_products_max_rows']
        if 'homepage_products_per_row' in data:
            settings.homepage_products_per_row = data['homepage_products_per_row']
        if 'homepage_products_max_items' in data:
            settings.homepage_products_max_items = data['homepage_products_max_items']
        if 'homepage_products_show_images' in data:
            settings.homepage_products_show_images = data['homepage_products_show_images']
        if 'homepage_products_image_height' in data:
            settings.homepage_products_image_height = data['homepage_products_image_height']
        if 'homepage_products_image_width' in data:
            settings.homepage_products_image_width = data['homepage_products_image_width']
        if 'homepage_products_show_favorite' in data:
            settings.homepage_products_show_favorite = data['homepage_products_show_favorite']
        if 'homepage_products_show_buy_now' in data:
            settings.homepage_products_show_buy_now = data['homepage_products_show_buy_now']
        if 'homepage_products_show_details' in data:
            settings.homepage_products_show_details = data['homepage_products_show_details']
        if 'homepage_products_show_price' in data:
            settings.homepage_products_show_price = data['homepage_products_show_price']
        if 'homepage_products_show_original_price' in data:
            settings.homepage_products_show_original_price = data['homepage_products_show_original_price']
        if 'homepage_products_show_stock' in data:
            settings.homepage_products_show_stock = data['homepage_products_show_stock']
        if 'homepage_products_show_category' in data:
            settings.homepage_products_show_category = data['homepage_products_show_category']
        if 'homepage_products_sort_by' in data:
            settings.homepage_products_sort_by = data['homepage_products_sort_by']
        if 'homepage_products_filter_categories' in data:
            settings.homepage_products_filter_categories = data['homepage_products_filter_categories']
        if 'homepage_products_show_view_all' in data:
            settings.homepage_products_show_view_all = data['homepage_products_show_view_all']
        if 'homepage_products_view_all_text' in data:
            settings.homepage_products_view_all_text = data['homepage_products_view_all_text']
        if 'homepage_products_view_all_link' in data:
            settings.homepage_products_view_all_link = data['homepage_products_view_all_link']
        if 'homepage_products_card_style' in data:
            settings.homepage_products_card_style = data['homepage_products_card_style']
        if 'homepage_products_card_shadow' in data:
            settings.homepage_products_card_shadow = data['homepage_products_card_shadow']
        if 'homepage_products_card_hover_effect' in data:
            settings.homepage_products_card_hover_effect = data['homepage_products_card_hover_effect']
        if 'homepage_products_show_badges' in data:
            settings.homepage_products_show_badges = data['homepage_products_show_badges']
        if 'homepage_products_show_rating' in data:
            settings.homepage_products_show_rating = data['homepage_products_show_rating']
        if 'homepage_products_show_quick_view' in data:
            settings.homepage_products_show_quick_view = data['homepage_products_show_quick_view']
        if 'homepage_products_enable_image_preview' in data:
            settings.homepage_products_enable_image_preview = data['homepage_products_enable_image_preview']
        
        # Homepage Products Font & Color Settings
        if 'homepage_products_product_name_color' in data:
            settings.homepage_products_product_name_color = data['homepage_products_product_name_color']
        if 'homepage_products_product_name_font_family' in data:
            settings.homepage_products_product_name_font_family = data['homepage_products_product_name_font_family']
        if 'homepage_products_product_name_font_size' in data:
            settings.homepage_products_product_name_font_size = data['homepage_products_product_name_font_size']
        if 'homepage_products_product_name_font_weight' in data:
            settings.homepage_products_product_name_font_weight = data['homepage_products_product_name_font_weight']
        if 'homepage_products_product_name_font_style' in data:
            settings.homepage_products_product_name_font_style = data['homepage_products_product_name_font_style']
        if 'homepage_products_product_price_color' in data:
            settings.homepage_products_product_price_color = data['homepage_products_product_price_color']
        if 'homepage_products_product_price_font_family' in data:
            settings.homepage_products_product_price_font_family = data['homepage_products_product_price_font_family']
        if 'homepage_products_product_price_font_size' in data:
            settings.homepage_products_product_price_font_size = data['homepage_products_product_price_font_size']
        if 'homepage_products_product_price_font_weight' in data:
            settings.homepage_products_product_price_font_weight = data['homepage_products_product_price_font_weight']
        if 'homepage_products_product_price_font_style' in data:
            settings.homepage_products_product_price_font_style = data['homepage_products_product_price_font_style']
        if 'homepage_products_product_category_color' in data:
            settings.homepage_products_product_category_color = data['homepage_products_product_category_color']
        if 'homepage_products_product_category_font_family' in data:
            settings.homepage_products_product_category_font_family = data['homepage_products_product_category_font_family']
        if 'homepage_products_product_category_font_size' in data:
            settings.homepage_products_product_category_font_size = data['homepage_products_product_category_font_size']
        if 'homepage_products_product_category_font_weight' in data:
            settings.homepage_products_product_category_font_weight = data['homepage_products_product_category_font_weight']
        if 'homepage_products_product_category_font_style' in data:
            settings.homepage_products_product_category_font_style = data['homepage_products_product_category_font_style']
        if 'homepage_products_stock_info_color' in data:
            settings.homepage_products_stock_info_color = data['homepage_products_stock_info_color']
        if 'homepage_products_stock_info_font_family' in data:
            settings.homepage_products_stock_info_font_family = data['homepage_products_stock_info_font_family']
        if 'homepage_products_stock_info_font_size' in data:
            settings.homepage_products_stock_info_font_size = data['homepage_products_stock_info_font_size']
        if 'homepage_products_stock_info_font_weight' in data:
            settings.homepage_products_stock_info_font_weight = data['homepage_products_stock_info_font_weight']
        if 'homepage_products_stock_info_font_style' in data:
            settings.homepage_products_stock_info_font_style = data['homepage_products_stock_info_font_style']
        if 'homepage_products_view_details_button_color' in data:
            settings.homepage_products_view_details_button_color = data['homepage_products_view_details_button_color']
        if 'homepage_products_view_details_button_text_color' in data:
            settings.homepage_products_view_details_button_text_color = data['homepage_products_view_details_button_text_color']
        if 'homepage_products_view_details_button_font_family' in data:
            settings.homepage_products_view_details_button_font_family = data['homepage_products_view_details_button_font_family']
        if 'homepage_products_view_details_button_font_size' in data:
            settings.homepage_products_view_details_button_font_size = data['homepage_products_view_details_button_font_size']
        if 'homepage_products_view_details_button_font_weight' in data:
            settings.homepage_products_view_details_button_font_weight = data['homepage_products_view_details_button_font_weight']
        if 'homepage_products_view_details_button_font_style' in data:
            settings.homepage_products_view_details_button_font_style = data['homepage_products_view_details_button_font_style']
        if 'homepage_products_add_to_cart_button_color' in data:
            settings.homepage_products_add_to_cart_button_color = data['homepage_products_add_to_cart_button_color']
        if 'homepage_products_add_to_cart_button_text_color' in data:
            settings.homepage_products_add_to_cart_button_text_color = data['homepage_products_add_to_cart_button_text_color']
        if 'homepage_products_add_to_cart_button_font_family' in data:
            settings.homepage_products_add_to_cart_button_font_family = data['homepage_products_add_to_cart_button_font_family']
        if 'homepage_products_add_to_cart_button_font_size' in data:
            settings.homepage_products_add_to_cart_button_font_size = data['homepage_products_add_to_cart_button_font_size']
        if 'homepage_products_add_to_cart_button_font_weight' in data:
            settings.homepage_products_add_to_cart_button_font_weight = data['homepage_products_add_to_cart_button_font_weight']
        if 'homepage_products_add_to_cart_button_font_style' in data:
            settings.homepage_products_add_to_cart_button_font_style = data['homepage_products_add_to_cart_button_font_style']
        
        # Homepage Products 2 Settings
        if 'homepage_products2_show_section' in data:
            settings.homepage_products2_show_section = data['homepage_products2_show_section']
        if 'homepage_products2_title' in data:
            settings.homepage_products2_title = data['homepage_products2_title']
        if 'homepage_products2_subtitle' in data:
            settings.homepage_products2_subtitle = data['homepage_products2_subtitle']
        if 'homepage_products2_max_rows' in data:
            settings.homepage_products2_max_rows = data['homepage_products2_max_rows']
        if 'homepage_products2_per_row' in data:
            settings.homepage_products2_per_row = data['homepage_products2_per_row']
        if 'homepage_products2_max_items' in data:
            settings.homepage_products2_max_items = data['homepage_products2_max_items']
        if 'homepage_products2_show_images' in data:
            settings.homepage_products2_show_images = data['homepage_products2_show_images']
        if 'homepage_products2_image_height' in data:
            settings.homepage_products2_image_height = data['homepage_products2_image_height']
        if 'homepage_products2_image_width' in data:
            settings.homepage_products2_image_width = data['homepage_products2_image_width']
        if 'homepage_products2_show_favorite' in data:
            settings.homepage_products2_show_favorite = data['homepage_products2_show_favorite']
        if 'homepage_products2_show_buy_now' in data:
            settings.homepage_products2_show_buy_now = data['homepage_products2_show_buy_now']
        if 'homepage_products2_show_details' in data:
            settings.homepage_products2_show_details = data['homepage_products2_show_details']
        if 'homepage_products2_show_price' in data:
            settings.homepage_products2_show_price = data['homepage_products2_show_price']
        if 'homepage_products2_show_original_price' in data:
            settings.homepage_products2_show_original_price = data['homepage_products2_show_original_price']
        if 'homepage_products2_show_stock' in data:
            settings.homepage_products2_show_stock = data['homepage_products2_show_stock']
        if 'homepage_products2_show_category' in data:
            settings.homepage_products2_show_category = data['homepage_products2_show_category']
        if 'homepage_products2_sort_by' in data:
            settings.homepage_products2_sort_by = data['homepage_products2_sort_by']
        if 'homepage_products2_filter_categories' in data:
            settings.homepage_products2_filter_categories = data['homepage_products2_filter_categories']
        if 'homepage_products2_show_view_all' in data:
            settings.homepage_products2_show_view_all = data['homepage_products2_show_view_all']
        if 'homepage_products2_view_all_text' in data:
            settings.homepage_products2_view_all_text = data['homepage_products2_view_all_text']
        if 'homepage_products2_view_all_link' in data:
            settings.homepage_products2_view_all_link = data['homepage_products2_view_all_link']
        if 'homepage_products2_card_style' in data:
            settings.homepage_products2_card_style = data['homepage_products2_card_style']
        if 'homepage_products2_card_shadow' in data:
            settings.homepage_products2_card_shadow = data['homepage_products2_card_shadow']
        if 'homepage_products2_card_hover_effect' in data:
            settings.homepage_products2_card_hover_effect = data['homepage_products2_card_hover_effect']
        if 'homepage_products2_show_badges' in data:
            settings.homepage_products2_show_badges = data['homepage_products2_show_badges']
        if 'homepage_products2_show_rating' in data:
            settings.homepage_products2_show_rating = data['homepage_products2_show_rating']
        if 'homepage_products2_show_quick_view' in data:
            settings.homepage_products2_show_quick_view = data['homepage_products2_show_quick_view']
        if 'homepage_products2_enable_image_preview' in data:
            settings.homepage_products2_enable_image_preview = data['homepage_products2_enable_image_preview']
        
        # Homepage Products 2 Font & Color Settings
        if 'homepage_products2_product_name_color' in data:
            settings.homepage_products2_product_name_color = data['homepage_products2_product_name_color']
        if 'homepage_products2_product_name_font_family' in data:
            settings.homepage_products2_product_name_font_family = data['homepage_products2_product_name_font_family']
        if 'homepage_products2_product_name_font_size' in data:
            settings.homepage_products2_product_name_font_size = data['homepage_products2_product_name_font_size']
        if 'homepage_products2_product_name_font_weight' in data:
            settings.homepage_products2_product_name_font_weight = data['homepage_products2_product_name_font_weight']
        if 'homepage_products2_product_name_font_style' in data:
            settings.homepage_products2_product_name_font_style = data['homepage_products2_product_name_font_style']
        if 'homepage_products2_product_price_color' in data:
            settings.homepage_products2_product_price_color = data['homepage_products2_product_price_color']
        if 'homepage_products2_product_price_font_family' in data:
            settings.homepage_products2_product_price_font_family = data['homepage_products2_product_price_font_family']
        if 'homepage_products2_product_price_font_size' in data:
            settings.homepage_products2_product_price_font_size = data['homepage_products2_product_price_font_size']
        if 'homepage_products2_product_price_font_weight' in data:
            settings.homepage_products2_product_price_font_weight = data['homepage_products2_product_price_font_weight']
        if 'homepage_products2_product_price_font_style' in data:
            settings.homepage_products2_product_price_font_style = data['homepage_products2_product_price_font_style']
        if 'homepage_products2_product_category_color' in data:
            settings.homepage_products2_product_category_color = data['homepage_products2_product_category_color']
        if 'homepage_products2_product_category_font_family' in data:
            settings.homepage_products2_product_category_font_family = data['homepage_products2_product_category_font_family']
        if 'homepage_products2_product_category_font_size' in data:
            settings.homepage_products2_product_category_font_size = data['homepage_products2_product_category_font_size']
        if 'homepage_products2_product_category_font_weight' in data:
            settings.homepage_products2_product_category_font_weight = data['homepage_products2_product_category_font_weight']
        if 'homepage_products2_product_category_font_style' in data:
            settings.homepage_products2_product_category_font_style = data['homepage_products2_product_category_font_style']
        if 'homepage_products2_stock_info_color' in data:
            settings.homepage_products2_stock_info_color = data['homepage_products2_stock_info_color']
        if 'homepage_products2_stock_info_font_family' in data:
            settings.homepage_products2_stock_info_font_family = data['homepage_products2_stock_info_font_family']
        if 'homepage_products2_stock_info_font_size' in data:
            settings.homepage_products2_stock_info_font_size = data['homepage_products2_stock_info_font_size']
        if 'homepage_products2_stock_info_font_weight' in data:
            settings.homepage_products2_stock_info_font_weight = data['homepage_products2_stock_info_font_weight']
        if 'homepage_products2_stock_info_font_style' in data:
            settings.homepage_products2_stock_info_font_style = data['homepage_products2_stock_info_font_style']
        if 'homepage_products2_view_details_button_color' in data:
            settings.homepage_products2_view_details_button_color = data['homepage_products2_view_details_button_color']
        if 'homepage_products2_view_details_button_text_color' in data:
            settings.homepage_products2_view_details_button_text_color = data['homepage_products2_view_details_button_text_color']
        if 'homepage_products2_view_details_button_font_family' in data:
            settings.homepage_products2_view_details_button_font_family = data['homepage_products2_view_details_button_font_family']
        if 'homepage_products2_view_details_button_font_size' in data:
            settings.homepage_products2_view_details_button_font_size = data['homepage_products2_view_details_button_font_size']
        if 'homepage_products2_view_details_button_font_weight' in data:
            settings.homepage_products2_view_details_button_font_weight = data['homepage_products2_view_details_button_font_weight']
        if 'homepage_products2_view_details_button_font_style' in data:
            settings.homepage_products2_view_details_button_font_style = data['homepage_products2_view_details_button_font_style']
        if 'homepage_products2_add_to_cart_button_color' in data:
            settings.homepage_products2_add_to_cart_button_color = data['homepage_products2_add_to_cart_button_color']
        if 'homepage_products2_add_to_cart_button_text_color' in data:
            settings.homepage_products2_add_to_cart_button_text_color = data['homepage_products2_add_to_cart_button_text_color']
        if 'homepage_products2_add_to_cart_button_font_family' in data:
            settings.homepage_products2_add_to_cart_button_font_family = data['homepage_products2_add_to_cart_button_font_family']
        if 'homepage_products2_add_to_cart_button_font_size' in data:
            settings.homepage_products2_add_to_cart_button_font_size = data['homepage_products2_add_to_cart_button_font_size']
        if 'homepage_products2_add_to_cart_button_font_weight' in data:
            settings.homepage_products2_add_to_cart_button_font_weight = data['homepage_products2_add_to_cart_button_font_weight']
        if 'homepage_products2_add_to_cart_button_font_style' in data:
            settings.homepage_products2_add_to_cart_button_font_style = data['homepage_products2_add_to_cart_button_font_style']
        
        # Product Detail Page Settings
        if 'product_detail_show_thumbnails' in data:
            settings.product_detail_show_thumbnails = data['product_detail_show_thumbnails']
        if 'product_detail_show_category_badge' in data:
            settings.product_detail_show_category_badge = data['product_detail_show_category_badge']
        if 'product_detail_show_featured_badge' in data:
            settings.product_detail_show_featured_badge = data['product_detail_show_featured_badge']
        if 'product_detail_show_stock_info' in data:
            settings.product_detail_show_stock_info = data['product_detail_show_stock_info']
        if 'product_detail_show_variations' in data:
            settings.product_detail_show_variations = data['product_detail_show_variations']
        if 'product_detail_show_description' in data:
            settings.product_detail_show_description = data['product_detail_show_description']
        if 'product_detail_show_details_section' in data:
            settings.product_detail_show_details_section = data['product_detail_show_details_section']
        if 'product_detail_show_video' in data:
            settings.product_detail_show_video = data['product_detail_show_video']
        if 'product_detail_show_buy_now_button' in data:
            settings.product_detail_show_buy_now_button = data['product_detail_show_buy_now_button']
        if 'product_detail_show_continue_shopping_button' in data:
            settings.product_detail_show_continue_shopping_button = data['product_detail_show_continue_shopping_button']
        if 'product_detail_show_quantity_selector' in data:
            settings.product_detail_show_quantity_selector = data['product_detail_show_quantity_selector']
        if 'product_detail_show_image_lightbox' in data:
            settings.product_detail_show_image_lightbox = data['product_detail_show_image_lightbox']
        
        # Product Detail Button Colors
        if 'product_detail_add_to_cart_button_color' in data:
            settings.product_detail_add_to_cart_button_color = data['product_detail_add_to_cart_button_color']
        if 'product_detail_add_to_cart_button_text_color' in data:
            settings.product_detail_add_to_cart_button_text_color = data['product_detail_add_to_cart_button_text_color']
        if 'product_detail_buy_now_button_color' in data:
            settings.product_detail_buy_now_button_color = data['product_detail_buy_now_button_color']
        if 'product_detail_buy_now_button_text_color' in data:
            settings.product_detail_buy_now_button_text_color = data['product_detail_buy_now_button_text_color']
        if 'product_detail_continue_shopping_button_color' in data:
            settings.product_detail_continue_shopping_button_color = data['product_detail_continue_shopping_button_color']
        if 'product_detail_continue_shopping_button_text_color' in data:
            settings.product_detail_continue_shopping_button_text_color = data['product_detail_continue_shopping_button_text_color']
        
        # Product Detail Text Colors
        if 'product_detail_product_name_color' in data:
            settings.product_detail_product_name_color = data['product_detail_product_name_color']
        if 'product_detail_product_price_color' in data:
            settings.product_detail_product_price_color = data['product_detail_product_price_color']
        if 'product_detail_product_description_color' in data:
            settings.product_detail_product_description_color = data['product_detail_product_description_color']
        if 'product_detail_product_details_label_color' in data:
            settings.product_detail_product_details_label_color = data['product_detail_product_details_label_color']
        if 'product_detail_product_details_value_color' in data:
            settings.product_detail_product_details_value_color = data['product_detail_product_details_value_color']
        
        # Product Detail Page Font Settings
        if 'product_detail_product_name_font_family' in data:
            settings.product_detail_product_name_font_family = data['product_detail_product_name_font_family']
        if 'product_detail_product_name_font_size' in data:
            settings.product_detail_product_name_font_size = data['product_detail_product_name_font_size']
        if 'product_detail_product_name_font_weight' in data:
            settings.product_detail_product_name_font_weight = data['product_detail_product_name_font_weight']
        if 'product_detail_product_name_font_style' in data:
            settings.product_detail_product_name_font_style = data['product_detail_product_name_font_style']
        if 'product_detail_product_price_font_family' in data:
            settings.product_detail_product_price_font_family = data['product_detail_product_price_font_family']
        if 'product_detail_product_price_font_size' in data:
            settings.product_detail_product_price_font_size = data['product_detail_product_price_font_size']
        if 'product_detail_product_price_font_weight' in data:
            settings.product_detail_product_price_font_weight = data['product_detail_product_price_font_weight']
        if 'product_detail_product_price_font_style' in data:
            settings.product_detail_product_price_font_style = data['product_detail_product_price_font_style']
        if 'product_detail_product_description_font_family' in data:
            settings.product_detail_product_description_font_family = data['product_detail_product_description_font_family']
        if 'product_detail_product_description_font_size' in data:
            settings.product_detail_product_description_font_size = data['product_detail_product_description_font_size']
        if 'product_detail_product_description_font_weight' in data:
            settings.product_detail_product_description_font_weight = data['product_detail_product_description_font_weight']
        if 'product_detail_product_description_font_style' in data:
            settings.product_detail_product_description_font_style = data['product_detail_product_description_font_style']
        if 'product_detail_product_details_label_font_family' in data:
            settings.product_detail_product_details_label_font_family = data['product_detail_product_details_label_font_family']
        if 'product_detail_product_details_label_font_size' in data:
            settings.product_detail_product_details_label_font_size = data['product_detail_product_details_label_font_size']
        if 'product_detail_product_details_label_font_weight' in data:
            settings.product_detail_product_details_label_font_weight = data['product_detail_product_details_label_font_weight']
        if 'product_detail_product_details_label_font_style' in data:
            settings.product_detail_product_details_label_font_style = data['product_detail_product_details_label_font_style']
        if 'product_detail_product_details_value_font_family' in data:
            settings.product_detail_product_details_value_font_family = data['product_detail_product_details_value_font_family']
        if 'product_detail_product_details_value_font_size' in data:
            settings.product_detail_product_details_value_font_size = data['product_detail_product_details_value_font_size']
        if 'product_detail_product_details_value_font_weight' in data:
            settings.product_detail_product_details_value_font_weight = data['product_detail_product_details_value_font_weight']
        if 'product_detail_product_details_value_font_style' in data:
            settings.product_detail_product_details_value_font_style = data['product_detail_product_details_value_font_style']
        
        # Google OAuth Settings
        print(f"🔍 BACKEND - Google OAuth ayarları alındı:")
        print(f"   enabled: {data.get('google_oauth_enabled', 'NOT_PROVIDED')}")
        print(f"   client_id: {data.get('google_oauth_client_id', 'NOT_PROVIDED')}")
        print(f"   client_secret: {'***HIDDEN***' if data.get('google_oauth_client_secret') else 'NOT_PROVIDED'}")
        print(f"   redirect_uri: {data.get('google_oauth_redirect_uri', 'NOT_PROVIDED')}")
        print(f"   scope: {data.get('google_oauth_scope', 'NOT_PROVIDED')}")
        
        if 'google_oauth_enabled' in data:
            settings.google_oauth_enabled = data['google_oauth_enabled']
            print(f"✅ google_oauth_enabled kaydedildi: {settings.google_oauth_enabled}")
        if 'google_oauth_client_id' in data:
            settings.google_oauth_client_id = data['google_oauth_client_id']
            print(f"✅ google_oauth_client_id kaydedildi: {settings.google_oauth_client_id}")
        if 'google_oauth_client_secret' in data:
            settings.google_oauth_client_secret = data['google_oauth_client_secret']
            print(f"✅ google_oauth_client_secret kaydedildi: {'***HIDDEN***' if settings.google_oauth_client_secret else 'EMPTY'}")
        if 'google_oauth_redirect_uri' in data:
            settings.google_oauth_redirect_uri = data['google_oauth_redirect_uri']
            print(f"✅ google_oauth_redirect_uri kaydedildi: {settings.google_oauth_redirect_uri}")
        if 'google_oauth_scope' in data:
            settings.google_oauth_scope = data['google_oauth_scope']
            print(f"✅ google_oauth_scope kaydedildi: {settings.google_oauth_scope}")
        
        # Site URL Settings
        if 'site_base_url' in data:
            settings.site_base_url = data['site_base_url']
        if 'site_is_production' in data:
            settings.site_is_production = data['site_is_production']
        if 'site_ssl_enabled' in data:
            settings.site_ssl_enabled = data['site_ssl_enabled']
        
        db.session.commit()
        
        return jsonify({'message': 'Site settings updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Upload endpoints for site settings
@site_settings_bp.route('/upload/site-logo', methods=['POST'])
@admin_required
def upload_site_logo():
    try:
        create_upload_folders()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename, 'image'):
            filename = generate_unique_filename(file.filename)
            # Save file - use correct path one level up from app
            file_path = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'site', filename)
            
            # Create site upload directory if it doesn't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            file.save(file_path)
            
            return jsonify({
                'message': 'Logo uploaded successfully',
                'logo_url': f'/uploads/site/{filename}'
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@site_settings_bp.route('/upload/site-logo2', methods=['POST'])
@admin_required
def upload_site_logo2():
    try:
        create_upload_folders()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename, 'image'):
            filename = generate_unique_filename(file.filename)
            # Save file - use correct path one level up from app
            file_path = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'site', filename)
            
            # Create site upload directory if it doesn't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            file.save(file_path)
            
            return jsonify({
                'message': 'Second logo uploaded successfully',
                'logo_url': f'/uploads/site/{filename}'
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@site_settings_bp.route('/upload/welcome-background', methods=['POST'])
@admin_required
def upload_welcome_background():
    try:
        create_upload_folders()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename, 'image'):
            filename = generate_unique_filename(file.filename)
            # Save file - use correct path one level up from app
            file_path = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'site', filename)
            
            # Create site upload directory if it doesn't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            file.save(file_path)
            
            return jsonify({
                'message': 'Welcome background uploaded successfully',
                'background_url': f'/uploads/site/{filename}'
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@site_settings_bp.route('/upload/footer-logo', methods=['POST'])
@admin_required
def upload_footer_logo():
    try:
        create_upload_folders()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename, 'image'):
            filename = generate_unique_filename(file.filename)
            # Save file - use correct path one level up from app
            file_path = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'site', filename)
            
            # Create site upload directory if it doesn't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            file.save(file_path)
            
            return jsonify({
                'message': 'Footer logo uploaded successfully',
                'logo_url': f'/uploads/site/{filename}'
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@site_settings_bp.route('/upload-site-file', methods=['POST'])
@admin_required
def upload_site_file():
    """Generic site file upload endpoint that handles different upload types"""
    try:
        create_upload_folders()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        upload_type = request.form.get('upload_type', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, 'image'):
            return jsonify({'error': 'Invalid file type'}), 400
        
        filename = generate_unique_filename(file.filename)
        # Save file - use correct path one level up from app
        file_path = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'site', filename)
        
        # Create site upload directory if it doesn't exist
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        file.save(file_path)
        
        # Return appropriate response based on upload type
        url = f'/uploads/site/{filename}'
        
        messages = {
            'site_logo': 'Site logo uploaded successfully',
            'site_logo2': 'Second logo uploaded successfully', 
            'welcome_background': 'Welcome background uploaded successfully',
            'footer_logo': 'Footer logo uploaded successfully'
        }
        
        message = messages.get(upload_type, 'File uploaded successfully')
        
        return jsonify({
            'message': message,
            'url': url
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Site Settings - Sync with theme endpoint
@site_settings_bp.route('/site-settings/sync-theme', methods=['PUT'])
def sync_site_settings_with_theme():
    """Sync site settings colors with theme colors"""
    try:
        data = request.get_json()
        theme_id = data.get('theme_id')
        
        if not theme_id:
            return jsonify({'error': 'Theme ID is required'}), 400
        
        theme_color_mappings = get_theme_color_mappings()
        theme_colors = theme_color_mappings.get(theme_id)
        
        if not theme_colors:
            return jsonify({'error': f'Unknown theme: {theme_id}'}), 400
        
        print(f"🎨 BACKEND - Syncing site settings with theme: {theme_id}")
        
        settings = SiteSettings.query.first()
        if not settings:
            settings = SiteSettings()
            db.session.add(settings)
        
        # Update site settings with theme colors
        for color_key, color_value in theme_colors.items():
            if hasattr(settings, color_key):
                setattr(settings, color_key, color_value)
                print(f"   Updated {color_key}: {color_value}")
        
        db.session.commit()
        
        print(f"✅ BACKEND - Site settings synced successfully with theme: {theme_id}")
        return jsonify({
            'message': f'Site settings synced successfully with theme: {theme_id}',
            'theme_id': theme_id,
            'updated_colors': list(theme_colors.keys())
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"❌ BACKEND - Error syncing site settings with theme: {str(e)}")
        return jsonify({'error': str(e)}), 500