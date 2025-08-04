#!/usr/bin/env python3
"""
Database Reset Script
This script resets the database and restores settings from backup
"""

import os
import sys
from datetime import datetime

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.models import User, Product, Category, Order, OrderItem, SiteSettings, VariationType, VariationOption, CustomTheme
from backup_current_settings import CURRENT_SETTINGS_BACKUP

def reset_database():
    """Reset and recreate database"""
    print("🔄 Resetting database...")
    
    # Drop all tables
    db.drop_all()
    print("✅ All tables dropped")
    
    # Create all tables
    db.create_all()
    print("✅ All tables recreated")

def create_admin_user():
    """Create admin user"""
    print("👤 Creating admin user...")
    
    admin = User(
        username='admin',
        email='admin@pebdeq.com',
        first_name='Admin',
        last_name='User',
        is_admin=True
    )
    admin.set_password('adminx999')
    
    db.session.add(admin)
    db.session.commit()
    print("✅ Admin user created (admin@pebdeq.com / adminx999)")

def restore_settings_from_backup():
    """Restore settings from backup"""
    print("⚙️ Restoring settings from backup...")
    
    # Create new settings instance
    settings = SiteSettings()
    
    # Apply backup settings
    for key, value in CURRENT_SETTINGS_BACKUP.items():
        if hasattr(settings, key):
            setattr(settings, key, value)
    
    # Set timestamps
    settings.created_at = datetime.now()
    settings.updated_at = datetime.now()
    
    db.session.add(settings)
    db.session.commit()
    print("✅ Settings restored from backup")

def create_sample_categories():
    """Create sample categories"""
    print("📁 Creating sample categories...")
    
    categories = [
        {
            'name': '3D Printing',
            'description': 'Custom 3D printed items and prototypes',
            'slug': '3d-printing',
            'sort_order': 1
        },
        {
            'name': 'Vintage Tools',
            'description': 'Authentic vintage and antique tools',
            'slug': 'vintage-tools',
            'sort_order': 2
        },
        {
            'name': 'Antique Bulbs',
            'description': 'Rare and vintage light bulbs',
            'slug': 'antique-bulbs',
            'sort_order': 3
        },
        {
            'name': 'Laser Engraving',
            'description': 'Custom laser engraved products',
            'slug': 'laser-engraving',
            'sort_order': 4
        },
        {
            'name': 'Smart Gadgets',
            'description': 'Innovative smart home devices',
            'slug': 'smart-gadgets',
            'sort_order': 5
        },
        {
            'name': 'Vintage Collectibles',
            'description': 'Rare vintage collectible items',
            'slug': 'vintage-collectibles',
            'sort_order': 6
        }
    ]
    
    for cat_data in categories:
        category = Category(
            name=cat_data['name'],
            description=cat_data['description'],
            slug=cat_data['slug'],
            sort_order=cat_data['sort_order']
        )
        db.session.add(category)
    
    db.session.commit()
    print("✅ Sample categories created")

def create_variation_types():
    """Create variation types"""
    print("🎨 Creating variation types...")
    
    variation_types = [
        {
            'name': 'Color',
            'display_name': 'Color',
            'slug': 'color',
            'description': 'Product color variations'
        },
        {
            'name': 'Size',
            'display_name': 'Size',
            'slug': 'size',
            'description': 'Product size variations'
        },
        {
            'name': 'Material',
            'display_name': 'Material',
            'slug': 'material',
            'description': 'Product material variations'
        },
        {
            'name': 'Style',
            'display_name': 'Style',
            'slug': 'style',
            'description': 'Product style variations'
        }
    ]
    
    for vt_data in variation_types:
        variation_type = VariationType(
            name=vt_data['name'],
            display_name=vt_data['display_name'],
            slug=vt_data['slug'],
            description=vt_data['description']
        )
        db.session.add(variation_type)
    
    db.session.commit()
    print("✅ Variation types created")

def create_variation_options():
    """Create variation options"""
    print("🎯 Creating variation options...")
    
    # Get variation types
    color_type = VariationType.query.filter_by(slug='color').first()
    size_type = VariationType.query.filter_by(slug='size').first()
    material_type = VariationType.query.filter_by(slug='material').first()
    style_type = VariationType.query.filter_by(slug='style').first()
    
    variation_options = [
        # Color options
        {
            'variation_type': color_type,
            'name': 'Red',
            'display_name': 'Red',
            'value': 'red',
            'hex_color': '#FF0000',
            'sort_order': 1
        },
        {
            'variation_type': color_type,
            'name': 'Blue',
            'display_name': 'Blue',
            'value': 'blue',
            'hex_color': '#0000FF',
            'sort_order': 2
        },
        {
            'variation_type': color_type,
            'name': 'Green',
            'display_name': 'Green',
            'value': 'green',
            'hex_color': '#00FF00',
            'sort_order': 3
        },
        {
            'variation_type': color_type,
            'name': 'Black',
            'display_name': 'Black',
            'value': 'black',
            'hex_color': '#000000',
            'sort_order': 4
        },
        {
            'variation_type': color_type,
            'name': 'White',
            'display_name': 'White',
            'value': 'white',
            'hex_color': '#FFFFFF',
            'sort_order': 5
        },
        
        # Size options
        {
            'variation_type': size_type,
            'name': 'Small',
            'display_name': 'Small',
            'value': 'small',
            'sort_order': 1
        },
        {
            'variation_type': size_type,
            'name': 'Medium',
            'display_name': 'Medium',
            'value': 'medium',
            'sort_order': 2
        },
        {
            'variation_type': size_type,
            'name': 'Large',
            'display_name': 'Large',
            'value': 'large',
            'sort_order': 3
        },
        {
            'variation_type': size_type,
            'name': 'Extra Large',
            'display_name': 'Extra Large',
            'value': 'extra_large',
            'sort_order': 4
        },
        
        # Material options
        {
            'variation_type': material_type,
            'name': 'Wood',
            'display_name': 'Wood',
            'value': 'wood',
            'sort_order': 1
        },
        {
            'variation_type': material_type,
            'name': 'Metal',
            'display_name': 'Metal',
            'value': 'metal',
            'sort_order': 2
        },
        {
            'variation_type': material_type,
            'name': 'Plastic',
            'display_name': 'Plastic',
            'value': 'plastic',
            'sort_order': 3
        },
        {
            'variation_type': material_type,
            'name': 'Glass',
            'display_name': 'Glass',
            'value': 'glass',
            'sort_order': 4
        },
        
        # Style options
        {
            'variation_type': style_type,
            'name': 'Modern',
            'display_name': 'Modern',
            'value': 'modern',
            'sort_order': 1
        },
        {
            'variation_type': style_type,
            'name': 'Vintage',
            'display_name': 'Vintage',
            'value': 'vintage',
            'sort_order': 2
        },
        {
            'variation_type': style_type,
            'name': 'Classic',
            'display_name': 'Classic',
            'value': 'classic',
            'sort_order': 3
        },
        {
            'variation_type': style_type,
            'name': 'Minimalist',
            'display_name': 'Minimalist',
            'value': 'minimalist',
            'sort_order': 4
        }
    ]
    
    for vo_data in variation_options:
        if vo_data['variation_type']:  # Only create if variation type exists
            variation_option = VariationOption(
                variation_type=vo_data['variation_type'],
                name=vo_data['name'],
                display_name=vo_data['display_name'],
                value=vo_data['value'],
                hex_color=vo_data.get('hex_color'),
                sort_order=vo_data['sort_order']
            )
            db.session.add(variation_option)
    
    db.session.commit()
    print("✅ Variation options created")

def create_sample_products():
    """Create sample products"""
    print("🛍️ Creating sample products...")
    
    # Get categories
    categories = Category.query.all()
    cat_dict = {cat.slug: cat for cat in categories}
    
    products = [
        {
            'name': 'Custom 3D Printed Miniature',
            'description': 'High-quality 3D printed miniature figures with intricate details. Perfect for collectors, gamers, and enthusiasts.',
            'price': 25.99,
            'original_price': 30.99,
            'category': cat_dict.get('3d-printing'),
            'stock_quantity': 50,
            'is_featured': True,
            'weight': '50g',
            'dimensions': '5x5x8cm',
            'material': 'PLA Plastic'
        },
        {
            'name': 'Vintage Hammer Set',
            'description': 'Authentic vintage hammer collection from the 1940s. Beautifully restored and ready for use or display.',
            'price': 89.99,
            'original_price': 99.99,
            'category': cat_dict.get('vintage-tools'),
            'stock_quantity': 5,
            'is_featured': True,
            'weight': '1.2kg',
            'dimensions': '30x12x8cm',
            'material': 'Steel and Wood'
        },
        {
            'name': 'Edison Bulb Collection',
            'description': 'Rare Edison-style light bulbs with vintage filament design. Creates warm, atmospheric lighting.',
            'price': 45.99,
            'original_price': 55.99,
            'category': cat_dict.get('antique-bulbs'),
            'stock_quantity': 12,
            'is_featured': False,
            'weight': '120g',
            'dimensions': '6x6x15cm',
            'material': 'Glass and Tungsten'
        },
        {
            'name': 'Personalized Wooden Sign',
            'description': 'Custom laser engraved wooden signs perfect for home decor, business signage, or gifts.',
            'price': 35.99,
            'original_price': 42.99,
            'category': cat_dict.get('laser-engraving'),
            'stock_quantity': 25,
            'is_featured': True,
            'weight': '300g',
            'dimensions': '25x15x2cm',
            'material': 'Oak Wood'
        },
        {
            'name': 'Smart Home Controller',
            'description': 'Advanced smart home controller with voice control and mobile app integration.',
            'price': 159.99,
            'original_price': 179.99,
            'category': cat_dict.get('smart-gadgets'),
            'stock_quantity': 15,
            'is_featured': True,
            'weight': '250g',
            'dimensions': '12x8x3cm',
            'material': 'Aluminum and Plastic'
        },
        {
            'name': 'Vintage Pocket Watch',
            'description': 'Authentic vintage pocket watch from the 1920s. Fully restored and in working condition.',
            'price': 199.99,
            'original_price': 249.99,
            'category': cat_dict.get('vintage-collectibles'),
            'stock_quantity': 3,
            'is_featured': True,
            'weight': '80g',
            'dimensions': '5x5x1.5cm',
            'material': 'Gold-plated Steel'
        },
        {
            'name': 'Laser Cut Decorative Panel',
            'description': 'Intricate laser cut decorative panel perfect for room dividers or wall art.',
            'price': 75.99,
            'original_price': 85.99,
            'category': cat_dict.get('laser-engraving'),
            'stock_quantity': 8,
            'is_featured': False,
            'weight': '800g',
            'dimensions': '40x30x0.5cm',
            'material': 'MDF Wood'
        },
        {
            'name': '3D Printed Desk Organizer',
            'description': 'Custom 3D printed desk organizer with multiple compartments for office supplies.',
            'price': 19.99,
            'original_price': 24.99,
            'category': cat_dict.get('3d-printing'),
            'stock_quantity': 30,
            'is_featured': False,
            'weight': '200g',
            'dimensions': '20x15x10cm',
            'material': 'PETG Plastic'
        },
        {
            'name': 'Vintage Radio Collection',
            'description': 'Restored vintage radio from the 1950s with original components and working condition.',
            'price': 299.99,
            'original_price': 349.99,
            'category': cat_dict.get('vintage-collectibles'),
            'stock_quantity': 2,
            'is_featured': True,
            'weight': '3.5kg',
            'dimensions': '35x20x18cm',
            'material': 'Bakelite and Metal'
        },
        {
            'name': 'Smart Temperature Sensor',
            'description': 'Wi-Fi enabled temperature and humidity sensor with mobile app notifications.',
            'price': 39.99,
            'original_price': 49.99,
            'category': cat_dict.get('smart-gadgets'),
            'stock_quantity': 20,
            'is_featured': False,
            'weight': '50g',
            'dimensions': '8x8x2cm',
            'material': 'Plastic and Electronics'
        }
    ]
    
    for prod_data in products:
        if prod_data['category']:  # Only create if category exists
            # Generate slug from name
            slug = prod_data['name'].lower().replace(' ', '-').replace(',', '').replace('.', '')
            
            product = Product(
                name=prod_data['name'],
                slug=slug,
                description=prod_data['description'],
                price=prod_data['price'],
                original_price=prod_data.get('original_price'),
                category=prod_data['category'],
                stock_quantity=prod_data['stock_quantity'],
                is_featured=prod_data.get('is_featured', False),
                weight=prod_data.get('weight'),
                dimensions=prod_data.get('dimensions'),
                material=prod_data.get('material')
            )
            db.session.add(product)
    
    db.session.commit()
    print("✅ Sample products created")

def create_sample_themes():
    """Create sample themes"""
    print("🎨 Creating sample themes...")
    
    # Get admin user
    admin = User.query.filter_by(is_admin=True).first()
    if not admin:
        print("⚠️ Admin user bulunamadı, theme'ler oluşturulamadı")
        return
    
    # Default theme data
    default_theme_data = {
        "colors": {
            "primary": "#3498db",
            "primaryDark": "#2980b9",
            "secondary": "#2ecc71",
            "secondaryDark": "#27ae60",
            "accent": "#e74c3c",
            "success": "#27ae60",
            "warning": "#f39c12",
            "error": "#e74c3c",
            "info": "#3498db",
            "background": "#ffffff",
            "surface": "#f8f9fa",
            "cardBackground": "#ffffff",
            "text": "#2c3e50",
            "textSecondary": "#7f8c8d",
            "textMuted": "#95a5a6",
            "border": "#dee2e6",
            "borderLight": "#e9ecef",
            "shadow": "rgba(0, 0, 0, 0.1)"
        },
        "typography": {
            "fontFamily": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            "headingFont": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            "baseFontSize": 16,
            "lineHeight": 1.5,
            "headingLineHeight": 1.2,
            "fontWeights": {
                "light": 300,
                "normal": 400,
                "medium": 500,
                "semibold": 600,
                "bold": 700
            }
        },
        "spacing": {
            "xs": "0.25rem",
            "sm": "0.5rem",
            "md": "1rem",
            "lg": "1.5rem",
            "xl": "2rem",
            "xxl": "3rem"
        },
        "borderRadius": {
            "none": "0",
            "sm": "0.25rem",
            "md": "0.5rem",
            "lg": "0.75rem",
            "xl": "1rem",
            "full": "9999px"
        }
    }
    
    # Dark theme data
    dark_theme_data = {
        "colors": {
            "primary": "#4a90e2",
            "primaryDark": "#357abd",
            "secondary": "#32c875",
            "secondaryDark": "#28a05d",
            "accent": "#ff6b6b",
            "success": "#28a05d",
            "warning": "#ffa726",
            "error": "#ff6b6b",
            "info": "#4a90e2",
            "background": "#1a1a1a",
            "surface": "#2d2d2d",
            "cardBackground": "#363636",
            "text": "#f8f9fa",
            "textSecondary": "#b0b0b0",
            "textMuted": "#888888",
            "border": "#404040",
            "borderLight": "#505050",
            "shadow": "rgba(0, 0, 0, 0.3)"
        },
        "typography": {
            "fontFamily": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            "headingFont": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            "baseFontSize": 16,
            "lineHeight": 1.5,
            "headingLineHeight": 1.2,
            "fontWeights": {
                "light": 300,
                "normal": 400,
                "medium": 500,
                "semibold": 600,
                "bold": 700
            }
        },
        "spacing": {
            "xs": "0.25rem",
            "sm": "0.5rem",
            "md": "1rem",
            "lg": "1.5rem",
            "xl": "2rem",
            "xxl": "3rem"
        },
        "borderRadius": {
            "none": "0",
            "sm": "0.25rem",
            "md": "0.5rem",
            "lg": "0.75rem",
            "xl": "1rem",
            "full": "9999px"
        }
    }
    
    # Modern theme data
    modern_theme_data = {
        "colors": {
            "primary": "#6366f1",
            "primaryDark": "#4f46e5",
            "secondary": "#10b981",
            "secondaryDark": "#059669",
            "accent": "#f59e0b",
            "success": "#10b981",
            "warning": "#f59e0b",
            "error": "#ef4444",
            "info": "#3b82f6",
            "background": "#ffffff",
            "surface": "#f9fafb",
            "cardBackground": "#ffffff",
            "text": "#111827",
            "textSecondary": "#6b7280",
            "textMuted": "#9ca3af",
            "border": "#e5e7eb",
            "borderLight": "#f3f4f6",
            "shadow": "rgba(0, 0, 0, 0.1)"
        },
        "typography": {
            "fontFamily": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            "headingFont": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            "baseFontSize": 16,
            "lineHeight": 1.6,
            "headingLineHeight": 1.2,
            "fontWeights": {
                "light": 300,
                "normal": 400,
                "medium": 500,
                "semibold": 600,
                "bold": 700
            }
        },
        "spacing": {
            "xs": "0.25rem",
            "sm": "0.5rem",
            "md": "1rem",
            "lg": "1.5rem",
            "xl": "2rem",
            "xxl": "3rem"
        },
        "borderRadius": {
            "none": "0",
            "sm": "0.375rem",
            "md": "0.5rem",
            "lg": "0.75rem",
            "xl": "1rem",
            "full": "9999px"
        }
    }
    
    import json
    
    themes = [
        {
            'name': 'Default Light',
            'theme_id': 'default-light',
            'description': 'Clean and modern light theme with blue accents',
            'author': 'PEBDEQ Team',
            'version': '1.0.0',
            'type': 'light',
            'theme_data': json.dumps(default_theme_data),
            'preview_colors': json.dumps({
                'primary': '#3498db',
                'secondary': '#2ecc71',
                'background': '#ffffff',
                'text': '#2c3e50'
            }),
            'is_default': True,
            'is_public': True,
            'is_active': True
        },
        {
            'name': 'Dark Professional',
            'theme_id': 'dark-professional',
            'description': 'Sleek dark theme perfect for professional use',
            'author': 'PEBDEQ Team',
            'version': '1.0.0',
            'type': 'dark',
            'theme_data': json.dumps(dark_theme_data),
            'preview_colors': json.dumps({
                'primary': '#4a90e2',
                'secondary': '#32c875',
                'background': '#1a1a1a',
                'text': '#f8f9fa'
            }),
            'is_default': False,
            'is_public': True,
            'is_active': True
        },
        {
            'name': 'Modern Gradient',
            'theme_id': 'modern-gradient',
            'description': 'Modern theme with gradient accents and clean typography',
            'author': 'PEBDEQ Team',
            'version': '1.0.0',
            'type': 'light',
            'theme_data': json.dumps(modern_theme_data),
            'preview_colors': json.dumps({
                'primary': '#6366f1',
                'secondary': '#10b981',
                'background': '#ffffff',
                'text': '#111827'
            }),
            'is_default': False,
            'is_public': True,
            'is_active': True
        }
    ]
    
    for theme_data in themes:
        theme = CustomTheme(
            name=theme_data['name'],
            theme_id=theme_data['theme_id'],
            description=theme_data['description'],
            author=theme_data['author'],
            version=theme_data['version'],
            type=theme_data['type'],
            theme_data=theme_data['theme_data'],
            preview_colors=theme_data['preview_colors'],
            creator_id=admin.id,
            is_default=theme_data['is_default'],
            is_public=theme_data['is_public'],
            is_active=theme_data['is_active']
        )
        db.session.add(theme)
    
    db.session.commit()
    print("✅ Sample themes created")

def print_summary():
    """Print summary information"""
    print("\n🎉 Database successfully reset and restored from backup!")
    print("\n📋 Summary:")
    print("• Admin user: admin@pebdeq.com / adminx999")
    print("• Site settings: Restored from backup")
    
    # Count records
    categories_count = Category.query.count()
    products_count = Product.query.count()
    variation_types_count = VariationType.query.count()
    variation_options_count = VariationOption.query.count()
    themes_count = CustomTheme.query.count()
    
    print(f"• Categories: {categories_count} items")
    print(f"• Products: {products_count} items")
    print(f"• Variation types: {variation_types_count} items")
    print(f"• Variation options: {variation_options_count} items")
    print(f"• Custom themes: {themes_count} items")
    print("\n✅ System ready for use!")

def main():
    """Main function"""
    print("🚀 PEBDEQ Database Reset Script")
    print("=" * 50)
    
    # Create app context
    app = create_app()
    
    with app.app_context():
        try:
            # Reset database
            reset_database()
            
            # Create admin user
            create_admin_user()
            
            # Restore settings from backup
            restore_settings_from_backup()
            
            # Create sample data
            create_sample_categories()
            create_variation_types()
            create_variation_options()
            create_sample_products()
            create_sample_themes()
            
            # Print summary
            print_summary()
            
        except Exception as e:
            print(f"\n❌ Error occurred: {str(e)}")
            import traceback
            traceback.print_exc()
            db.session.rollback()
            return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
