from app import create_app, db
from app.models.models import User, Category, Product, Order, OrderItem, BlogPost, ContactMessage, VariationType, VariationOption, ProductVariation, SiteSettings
import os
from dotenv import load_dotenv

load_dotenv()

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Category': Category,
        'Product': Product,
        'Order': Order,
        'OrderItem': OrderItem,
        'BlogPost': BlogPost,
        'ContactMessage': ContactMessage,
        'VariationType': VariationType,
        'VariationOption': VariationOption,
        'ProductVariation': ProductVariation,
        'SiteSettings': SiteSettings
    }

def init_database():
    """Initialize database with sample data"""
    try:
        with app.app_context():
            db.create_all()
        
            # Create sample categories if they don't exist
            if not Category.query.first():
                categories = [
                    Category(
                        name='3D Print', 
                        slug='3d-print', 
                        description='Custom 3D printed items and prototypes',
                        background_color='#667eea'
                    ),
                    Category(
                        name='Tools', 
                        slug='tools', 
                        description='Second-hand tools and equipment',
                        background_color='#f093fb'
                    ),
                    Category(
                        name='Vintage Light Bulbs', 
                        slug='vintage-bulbs', 
                        description='Antique and vintage light bulbs',
                        background_color='#ffecd2'
                    ),
                    Category(
                        name='Laser Engraving', 
                        slug='laser-engraving', 
                        description='Custom laser engraving services',
                        background_color='#a8edea'
                    )
                ]
                
                for category in categories:
                    db.session.add(category)
                
                db.session.commit()
                print("Sample categories created!")
        
            # Create sample products if they don't exist
            if not Product.query.first():
                products = [
                    # 3D Print products
                    Product(
                        name='Custom 3D Printed Miniature',
                        slug='custom-3d-printed-miniature',
                        description='High-quality custom 3D printed miniature figures for gaming, collectibles, or personal use.',
                        price=25.99,
                        original_price=35.99,
                        stock_quantity=15,
                        category_id=1,
                        is_featured=True,
                        images=['/images/3d-miniature.jpg']
                    ),
                    Product(
                        name='3D Printed Phone Case',
                        slug='3d-printed-phone-case',
                        description='Durable and stylish 3D printed phone case with custom designs.',
                        price=12.99,
                        stock_quantity=25,
                        category_id=1,
                        images=['/images/phone-case.jpg']
                    ),
                    Product(
                        name='Architectural Model Prototype',
                        slug='architectural-model-prototype',
                        description='Precision 3D printed architectural models for presentations and planning.',
                        price=89.99,
                        stock_quantity=8,
                        category_id=1,
                        images=['/images/arch-model.jpg']
                    ),
                    
                    # Tools products
                    Product(
                        name='Vintage Hammer Set',
                        slug='vintage-hammer-set',
                        description='Well-maintained vintage hammer set with wooden handles. Perfect for collectors.',
                        price=45.00,
                        original_price=65.00,
                        stock_quantity=5,
                        category_id=2,
                        is_featured=True,
                        images=['/images/hammer-set.jpg']
                    ),
                    Product(
                        name='Antique Drill Press',
                        slug='antique-drill-press',
                        description='Restored antique drill press from the 1950s. Fully functional and ready to use.',
                        price=250.00,
                        stock_quantity=2,
                        category_id=2,
                        images=['/images/drill-press.jpg']
                    ),
                    Product(
                        name='Hand Plane Collection',
                        slug='hand-plane-collection',
                        description='Collection of vintage hand planes in excellent condition.',
                        price=125.00,
                        stock_quantity=3,
                        category_id=2,
                        images=['/images/hand-planes.jpg']
                    ),
                    
                    # Vintage Light Bulbs products
                    Product(
                        name='Edison Bulb 40W',
                        slug='edison-bulb-40w',
                        description='Authentic vintage Edison bulb with warm amber glow. Perfect for decorative lighting.',
                        price=15.99,
                        stock_quantity=50,
                        category_id=3,
                        is_featured=True,
                        images=['/images/edison-bulb.jpg']
                    ),
                    Product(
                        name='Vintage Chandelier Bulbs',
                        slug='vintage-chandelier-bulbs',
                        description='Set of 6 vintage chandelier bulbs with decorative filaments.',
                        price=32.99,
                        original_price=45.99,
                        stock_quantity=12,
                        category_id=3,
                        images=['/images/chandelier-bulbs.jpg']
                    ),
                    Product(
                        name='Antique Street Lamp Bulb',
                        slug='antique-street-lamp-bulb',
                        description='Rare antique street lamp bulb from the early 1900s. Collector\'s item.',
                        price=75.00,
                        stock_quantity=3,
                        category_id=3,
                        images=['/images/street-lamp-bulb.jpg']
                    ),
                    
                    # Laser Engraving products
                    Product(
                        name='Custom Wooden Plaque',
                        slug='custom-wooden-plaque',
                        description='Personalized wooden plaque with laser engraving. Perfect for awards or gifts.',
                        price=29.99,
                        stock_quantity=20,
                        category_id=4,
                        is_featured=True,
                        images=['/images/wooden-plaque.jpg']
                    ),
                    Product(
                        name='Engraved Metal Business Cards',
                        slug='engraved-metal-business-cards',
                        description='Premium metal business cards with precision laser engraving.',
                        price=55.00,
                        stock_quantity=15,
                        category_id=4,
                        images=['/images/metal-cards.jpg']
                    ),
                    Product(
                        name='Personalized Acrylic Photo Frame',
                        slug='personalized-acrylic-photo-frame',
                        description='Custom acrylic photo frame with laser-engraved personal message.',
                        price=18.99,
                        stock_quantity=30,
                        category_id=4,
                        images=['/images/acrylic-frame.jpg']
                    )
                ]
                
                for product in products:
                    db.session.add(product)
                
                db.session.commit()
                print("Sample products created!")
        
            # Create admin user if it doesn't exist
            if not User.query.filter_by(is_admin=True).first():
                admin_password = os.getenv('ADMIN_PASSWORD', 'adminx999')
                admin = User(
                    username='admin',
                    email='admin@pebdeq.com',
                    first_name='Admin',
                    last_name='User',
                    is_admin=True
                )
                admin.set_password(admin_password)
                db.session.add(admin)
                db.session.commit()
                print(f"Admin user created! Email: admin@pebdeq.com, Password: {admin_password}")
        
            # Create sample variation types if they don't exist
            if not VariationType.query.first():
                variation_types = [
                    VariationType(name='Color', slug='color', description='Product color options'),
                    VariationType(name='Size', slug='size', description='Product size options'),
                    VariationType(name='Material', slug='material', description='Product material options'),
                    VariationType(name='Style', slug='style', description='Product style options')
                ]
                
                for vtype in variation_types:
                    db.session.add(vtype)
                
                db.session.commit()
                print("Sample variation types created!")
                
                # Create sample variation options
                variation_options = [
                    # Color options
                    VariationOption(variation_type_id=1, name='Red', value='red', hex_color='#FF0000'),
                    VariationOption(variation_type_id=1, name='Blue', value='blue', hex_color='#0000FF'),
                    VariationOption(variation_type_id=1, name='Green', value='green', hex_color='#00FF00'),
                    VariationOption(variation_type_id=1, name='Yellow', value='yellow', hex_color='#FFFF00'),
                    VariationOption(variation_type_id=1, name='Black', value='black', hex_color='#000000'),
                    VariationOption(variation_type_id=1, name='White', value='white', hex_color='#FFFFFF'),
                    
                    # Size options
                    VariationOption(variation_type_id=2, name='XS', value='xs'),
                    VariationOption(variation_type_id=2, name='S', value='small'),
                    VariationOption(variation_type_id=2, name='M', value='medium'),
                    VariationOption(variation_type_id=2, name='L', value='large'),
                    VariationOption(variation_type_id=2, name='XL', value='xl'),
                    VariationOption(variation_type_id=2, name='XXL', value='xxl'),
                    
                    # Material options
                    VariationOption(variation_type_id=3, name='Plastic', value='plastic'),
                    VariationOption(variation_type_id=3, name='Metal', value='metal'),
                    VariationOption(variation_type_id=3, name='Wood', value='wood'),
                    VariationOption(variation_type_id=3, name='Glass', value='glass'),
                    
                    # Style options
                    VariationOption(variation_type_id=4, name='Modern', value='modern'),
                    VariationOption(variation_type_id=4, name='Classic', value='classic'),
                    VariationOption(variation_type_id=4, name='Vintage', value='vintage'),
                    VariationOption(variation_type_id=4, name='Minimalist', value='minimalist')
                ]
                
                for option in variation_options:
                    db.session.add(option)
                
                db.session.commit()
                print("Sample variation options created!")
                
    except Exception as e:
        print(f"Error during database initialization: {e}")

def reset_database():
    """Reset the database by dropping all tables and recreating them"""
    try:
        with app.app_context():
            print("Dropping all tables...")
            db.drop_all()
            print("All tables dropped successfully!")

            print("Recreating all tables...")
            db.create_all()
            print("All tables recreated successfully!")
    except Exception as e:
        print(f"Error resetting database: {e}")

def create_default_site_settings():
    """Create default site settings if they don't exist"""
    try:
        with app.app_context():
            if not SiteSettings.query.first():
                settings = SiteSettings(
                    site_name='PEBDEQ',
                    site_logo='/images/logo.png',
                    use_logo=True,
                    logo_width=120,
                    logo_height=40,
                    welcome_title='Craft, Vintage, Innovation',
                    welcome_subtitle='Discover unique products and custom designs',
                    welcome_background_color='#667eea',
                    welcome_text_color='#ffffff',
                    welcome_button_text='Shop Now',
                    welcome_button_link='/products',
                    welcome_button_color='#00b894',
                    collections_title='Our Collections',
                    collections_show_section=True,
                    collections_categories_per_row=4,
                    collections_max_rows=1,
                    # Google OAuth Settings
                    google_oauth_enabled=False,
                    google_oauth_client_id='',
                    google_oauth_client_secret='',
                    google_oauth_redirect_uri='',
                    google_oauth_scope='openid email profile'
                )
                db.session.add(settings)
                db.session.commit()
                print("Default site settings created!")
    except Exception as e:
        print(f"Error creating default site settings: {e}")

if __name__ == '__main__':
    import sys

    # Command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "--reset-db":
        print("⚠️  WARNING: This will delete all data in the database! ⚠️")
        confirm = input("Are you sure you want to reset the database? (y/N): ")
        if confirm.lower() == 'y':
            reset_database()
            init_database()
            create_default_site_settings()
            print("Database has been reset and reinitialized!")
        else:
            print("Database reset cancelled.")
    else:
        init_database()
        create_default_site_settings()
        app.run(debug=True, host='0.0.0.0', port=5005) 