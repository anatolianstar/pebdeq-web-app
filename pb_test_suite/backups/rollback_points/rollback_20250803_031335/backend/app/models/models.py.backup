from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    is_admin = db.Column(db.Boolean, default=False)
    settings = db.Column(db.JSON, default=lambda: {})  # User settings as JSON
    theme_preference = db.Column(db.String(50), default='default')  # User's theme preference
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    google_id = db.Column(db.String(100), unique=True, nullable=True)  # Google OAuth ID
    
    # Relationships with foreign_keys specified to avoid ambiguity
    orders = db.relationship('Order', foreign_keys='Order.user_id', backref='user', lazy=True)
    processed_returns = db.relationship('Order', foreign_keys='Order.return_processed_by', backref='return_processor', lazy=True)
    cancelled_orders = db.relationship('Order', foreign_keys='Order.cancelled_by', backref='canceller', lazy=True)
    addresses = db.relationship('UserAddress', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    background_image_url = db.Column(db.String(255))  # Kategori arka plan resmi
    background_color = db.Column(db.String(7))  # Kategori arka plan rengi (hex)
    sort_order = db.Column(db.Integer, default=0)  # Sort order for categories
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    products = db.relationship('Product', backref='category', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float)
    stock_quantity = db.Column(db.Integer, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    images = db.Column(db.JSON)  # Array of image URLs
    video_url = db.Column(db.String(255))  # Single video URL
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Basit Varyasyon Alanları
    has_variations = db.Column(db.Boolean, default=False)
    variation_type = db.Column(db.String(50))  # 'color', 'size', 'weight', 'custom'
    variation_name = db.Column(db.String(100))  # Özel varyasyon adı
    variation_options = db.Column(db.JSON)  # [{name: 'Kırmızı', value: 'red', price_modifier: 0, stock: 10, images: []}]
    
    # Product Properties
    weight = db.Column(db.String(50))  # Weight information
    dimensions = db.Column(db.String(100))  # Size information
    material = db.Column(db.String(100))  # Material information
    
    # Relationships
    product_variations = db.relationship('ProductVariation', backref='product', lazy=True, cascade='all, delete-orphan')
    
    def get_like_count(self):
        return ProductLike.query.filter_by(product_id=self.id).count()
    
    def is_liked_by_user(self, user_id):
        if not user_id:
            return False
        return ProductLike.query.filter_by(product_id=self.id, user_id=user_id).first() is not None

class VariationType(db.Model):
    """Variation types (e.g: Color, Size, Material)"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)  # Color, Size, Material
    display_name = db.Column(db.String(100), default='')  # Display name for frontend
    slug = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    variation_options = db.relationship('VariationOption', backref='variation_type', lazy=True, cascade='all, delete-orphan')

class VariationOption(db.Model):
    """Varyasyon seçenekleri (örn: Kırmızı, Mavi, Küçük, Büyük)"""
    id = db.Column(db.Integer, primary_key=True)
    variation_type_id = db.Column(db.Integer, db.ForeignKey('variation_type.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)  # Kırmızı, Mavi, Küçük
    display_name = db.Column(db.String(100), default='')  # Display name for frontend
    value = db.Column(db.String(100), nullable=False)  # red, blue, small
    hex_color = db.Column(db.String(7))  # Renk için hex kodu (opsiyonel)
    image_url = db.Column(db.String(255))  # Bu seçenek için özel resim
    sort_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProductVariation(db.Model):
    """Product-Variation relationships and combinations"""
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    variation_option1_id = db.Column(db.Integer, db.ForeignKey('variation_option.id'))  # İlk varyasyon
    variation_option2_id = db.Column(db.Integer, db.ForeignKey('variation_option.id'))  # İkinci varyasyon
    
    # Bu kombinasyona özel veriler
    sku = db.Column(db.String(100))  # Stok kodu
    price_modifier = db.Column(db.Float, default=0)  # Fiyat farkı (+/-)
    stock_quantity = db.Column(db.Integer, default=0)
    images = db.Column(db.JSON)  # Bu kombinasyona özel resimler
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    variation_option1 = db.relationship('VariationOption', foreign_keys=[variation_option1_id], backref='product_variations1')
    variation_option2 = db.relationship('VariationOption', foreign_keys=[variation_option2_id], backref='product_variations2')

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    shipping_cost = db.Column(db.Float, default=0)
    tax_amount = db.Column(db.Float, default=0)
    status = db.Column(db.String(50), default='pending')  # pending, processing, shipped, delivered, cancelled, return_requested, returned
    shipping_address_id = db.Column(db.Integer, db.ForeignKey('user_address.id'))
    billing_address_id = db.Column(db.Integer, db.ForeignKey('user_address.id'))
    shipping_address = db.Column(db.Text)  # Fallback for address text
    billing_address = db.Column(db.Text)   # Fallback for address text
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.String(50), default='pending')
    stripe_payment_intent_id = db.Column(db.String(255))
    notes = db.Column(db.Text)
    
    # Return & Cancel Management
    return_status = db.Column(db.String(50), default='none')  # none, requested, approved, denied, returned
    return_reason = db.Column(db.String(255))
    return_notes = db.Column(db.Text)
    return_requested_at = db.Column(db.DateTime)
    return_processed_at = db.Column(db.DateTime)
    return_processed_by = db.Column(db.Integer, db.ForeignKey('user.id'))  # Admin who processed
    
    cancel_reason = db.Column(db.String(255))
    cancel_notes = db.Column(db.Text)
    cancelled_at = db.Column(db.DateTime)
    cancelled_by = db.Column(db.Integer, db.ForeignKey('user.id'))  # User or admin who cancelled
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    shipping_address_obj = db.relationship('UserAddress', foreign_keys=[shipping_address_id], lazy=True)
    billing_address_obj = db.relationship('UserAddress', foreign_keys=[billing_address_id], lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'total_amount': self.total_amount,
            'subtotal': self.subtotal,
            'shipping_cost': self.shipping_cost,
            'tax_amount': self.tax_amount,
            'status': self.status,
            'shipping_address': {
                'id': self.shipping_address_obj.id if self.shipping_address_obj else None,
                'title': self.shipping_address_obj.title if self.shipping_address_obj else None,
                'first_name': self.shipping_address_obj.first_name if self.shipping_address_obj else None,
                'last_name': self.shipping_address_obj.last_name if self.shipping_address_obj else None,
                'address_line1': self.shipping_address_obj.address_line1 if self.shipping_address_obj else None,
                'address_line2': self.shipping_address_obj.address_line2 if self.shipping_address_obj else None,
                'city': self.shipping_address_obj.city if self.shipping_address_obj else None,
                'postal_code': self.shipping_address_obj.postal_code if self.shipping_address_obj else None,
                'country': self.shipping_address_obj.country if self.shipping_address_obj else None,
                'phone': self.shipping_address_obj.phone if self.shipping_address_obj else None,
            } if self.shipping_address_obj else None,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'notes': self.notes,
            
            # Return & Cancel Information
            'return_status': self.return_status,
            'return_reason': self.return_reason,
            'return_notes': self.return_notes,
            'return_requested_at': self.return_requested_at.isoformat() if self.return_requested_at else None,
            'return_processed_at': self.return_processed_at.isoformat() if self.return_processed_at else None,
            'cancel_reason': self.cancel_reason,
            'cancel_notes': self.cancel_notes,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,

            'items': [item.to_dict() for item in getattr(self, 'order_items', [])],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)  # Price at the time of order
    product_name = db.Column(db.String(200))  # Store product name at time of order
    product_slug = db.Column(db.String(200))  # Store product slug at time of order
    
    # Relationships
    product = db.relationship('Product', backref='order_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product_name or (self.product.name if self.product else None),
            'product_slug': self.product_slug or (self.product.slug if self.product else None),
            'quantity': self.quantity,
            'price': self.price,
            'subtotal': self.quantity * self.price,
            'product': {
                'id': self.product.id,
                'name': self.product.name,
                'slug': self.product.slug,
                'image_url': self.product.images[0] if self.product and self.product.images else None,
                'current_price': self.product.price,
                'original_price': self.product.original_price
            } if self.product else None
        }

class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    author = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100))
    featured_image = db.Column(db.String(255))
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    likes = db.relationship('BlogLike', backref='blog_post', lazy=True, cascade='all, delete-orphan')
    
    def get_like_count(self):
        return BlogLike.query.filter_by(blog_post_id=self.id).count()
    
    def is_liked_by_user(self, user_id):
        if not user_id:
            return False
        return BlogLike.query.filter_by(blog_post_id=self.id, user_id=user_id).first() is not None

class BlogLike(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    blog_post_id = db.Column(db.Integer, db.ForeignKey('blog_post.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='blog_likes', lazy=True)
    
    # Unique constraint to prevent duplicate likes
    __table_args__ = (db.UniqueConstraint('blog_post_id', 'user_id', name='unique_blog_like'),)

class ProductLike(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='product_likes', lazy=True)
    product = db.relationship('Product', backref='likes', lazy=True)
    
    # Unique constraint to prevent duplicate likes
    __table_args__ = (db.UniqueConstraint('product_id', 'user_id', name='unique_product_like'),)

class ProductReview(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 rating
    comment = db.Column(db.Text, nullable=False)
    is_approved = db.Column(db.Boolean, default=True)  # For moderation
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='product_reviews', lazy=True)
    product = db.relationship('Product', backref='reviews', lazy=True)
    
    # Unique constraint to prevent duplicate reviews from same user
    __table_args__ = (db.UniqueConstraint('product_id', 'user_id', name='unique_product_review'),)

class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SiteSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Site Identity
    site_name = db.Column(db.String(100), default='pebdeq')
    site_logo = db.Column(db.String(255))  # Logo resmi URL'si
    use_logo = db.Column(db.Boolean, default=False)  # Logo kullanılsın mı yoksa yazı mı
    logo_width = db.Column(db.Integer, default=120)  # Logo genişliği (piksel)
    logo_height = db.Column(db.Integer, default=40)  # Logo yüksekliği (piksel)
    site_logo2 = db.Column(db.String(255))  # İkinci logo resmi URL'si
    use_logo2 = db.Column(db.Boolean, default=False)  # İkinci logo kullanılsın mı
    logo2_width = db.Column(db.Integer, default=120)  # İkinci logo genişliği (piksel)
    logo2_height = db.Column(db.Integer, default=40)  # İkinci logo yüksekliği (piksel)
    
    # Logo Shadow Settings
    logo_shadow_enabled = db.Column(db.Boolean, default=False)  # Birinci logo gölge efekti
    logo_shadow_color = db.Column(db.String(7), default='#000000')  # Gölge rengi
    logo_shadow_blur = db.Column(db.Integer, default=5)  # Gölge bulanıklığı (0-20)
    logo_shadow_offset_x = db.Column(db.Integer, default=2)  # Yatay gölge mesafesi (-10 to 10)
    logo_shadow_offset_y = db.Column(db.Integer, default=2)  # Dikey gölge mesafesi (-10 to 10)
    logo_shadow_opacity = db.Column(db.Float, default=0.3)  # Gölge şeffaflığı (0.0-1.0)
    
    # Second Logo Shadow Settings
    logo2_shadow_enabled = db.Column(db.Boolean, default=False)  # İkinci logo gölge efekti
    logo2_shadow_color = db.Column(db.String(7), default='#000000')  # Gölge rengi
    logo2_shadow_blur = db.Column(db.Integer, default=5)  # Gölge bulanıklığı (0-20)
    logo2_shadow_offset_x = db.Column(db.Integer, default=2)  # Yatay gölge mesafesi (-10 to 10)
    logo2_shadow_offset_y = db.Column(db.Integer, default=2)  # Dikey gölge mesafesi (-10 to 10)
    logo2_shadow_opacity = db.Column(db.Float, default=0.3)  # Gölge şeffaflığı (0.0-1.0)
    
    # Header Settings
    header_background_color = db.Column(db.String(7), default='#ffffff')
    header_text_color = db.Column(db.String(7), default='#2c3e50')
    header_height = db.Column(db.Integer, default=60)
    header_padding = db.Column(db.Integer, default=15)
    header_sticky = db.Column(db.Boolean, default=False)
    header_shadow = db.Column(db.Boolean, default=True)
    header_border_bottom = db.Column(db.Boolean, default=True)
    header_border_color = db.Column(db.String(7), default='#e9ecef')
    header_logo_position = db.Column(db.String(20), default='left')  # left, center, right
    header_nav_position = db.Column(db.String(20), default='right')  # left, center, right
    header_nav_spacing = db.Column(db.Integer, default=20)
    
    # Navigation Links Settings (Dynamic)
    navigation_links = db.Column(db.JSON, default=lambda: [
        {'id': 1, 'title': 'Home', 'url': '/', 'enabled': True, 'order': 1, 'is_internal': True, 'show_for': 'all', 'type': 'page'},
        {'id': 2, 'title': 'Products', 'url': '/products', 'enabled': True, 'order': 2, 'is_internal': True, 'show_for': 'all', 'type': 'page'},
        {'id': 3, 'title': 'About', 'url': '/about', 'enabled': True, 'order': 3, 'is_internal': True, 'show_for': 'all', 'type': 'page'},
        {'id': 4, 'title': 'Blog', 'url': '/blog', 'enabled': True, 'order': 4, 'is_internal': True, 'show_for': 'all', 'type': 'page'},
        {'id': 5, 'title': 'Contact', 'url': '/contact', 'enabled': True, 'order': 5, 'is_internal': True, 'show_for': 'all', 'type': 'page'},
        {'id': 6, 'title': 'Login', 'url': '/login', 'enabled': True, 'order': 6, 'is_internal': True, 'show_for': 'guest', 'type': 'auth'},
        {'id': 7, 'title': 'Register', 'url': '/register', 'enabled': True, 'order': 7, 'is_internal': True, 'show_for': 'guest', 'type': 'auth'},
        {'id': 8, 'title': 'Profile', 'url': '/profile', 'enabled': True, 'order': 8, 'is_internal': True, 'show_for': 'user', 'type': 'auth'},
        {'id': 9, 'title': 'Admin', 'url': '/admin', 'enabled': True, 'order': 9, 'is_internal': True, 'show_for': 'admin', 'type': 'auth'},
        {'id': 10, 'title': 'Logout', 'url': 'logout', 'enabled': True, 'order': 10, 'is_internal': True, 'show_for': 'user', 'type': 'auth'}
    ])
    
    # Navigation Styling
    nav_link_color = db.Column(db.String(7), default='#2c3e50')
    nav_link_hover_color = db.Column(db.String(7), default='#007bff')
    nav_link_active_color = db.Column(db.String(7), default='#007bff')
    nav_link_font_size = db.Column(db.Integer, default=16)
    nav_link_font_weight = db.Column(db.String(20), default='500')
    nav_link_text_transform = db.Column(db.String(20), default='none')  # none, uppercase, lowercase, capitalize
    nav_link_underline = db.Column(db.Boolean, default=False)
    nav_link_hover_effect = db.Column(db.String(20), default='color')  # color, underline, background, scale
    nav_link_font_family = db.Column(db.String(100), default='inherit')  # Font family selection
    nav_link_text_shadow = db.Column(db.Boolean, default=False)  # Text shadow effect
    
    # Mobile Navigation Settings
    mobile_nav_enabled = db.Column(db.Boolean, default=True)
    mobile_nav_hamburger_color = db.Column(db.String(7), default='#2c3e50')
    mobile_nav_background_color = db.Column(db.String(7), default='#ffffff')
    mobile_nav_overlay = db.Column(db.Boolean, default=True)
    mobile_nav_slide_direction = db.Column(db.String(20), default='left')  # left, right, top, bottom
    
    # Header Actions
    header_show_search = db.Column(db.Boolean, default=False)
    header_show_cart = db.Column(db.Boolean, default=False)
    header_show_account = db.Column(db.Boolean, default=True)
    header_show_language = db.Column(db.Boolean, default=False)
    header_show_currency = db.Column(db.Boolean, default=False)
    
    # Marquee Settings
    marquee_enabled = db.Column(db.Boolean, default=False)
    marquee_text = db.Column(db.Text, default='Welcome to our store! Special offers available now.')
    marquee_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    marquee_font_size = db.Column(db.String(20), default='14px')
    marquee_font_weight = db.Column(db.String(20), default='normal')
    marquee_color = db.Column(db.String(7), default='#ffffff')
    marquee_background_color = db.Column(db.String(7), default='#ff6b6b')
    marquee_speed = db.Column(db.Integer, default=30)
    marquee_direction = db.Column(db.String(10), default='left')  # left, right
    marquee_pause_on_hover = db.Column(db.Boolean, default=True)
    
    # Welcome Section Settings
    welcome_title = db.Column(db.String(200), default='Welcome to Pebdeq')
    welcome_subtitle = db.Column(db.String(200), default='Crafted. Vintage. Smart.')
    welcome_background_image = db.Column(db.String(255))  # Arka plan resmi URL'si
    welcome_background_color = db.Column(db.String(7), default='#667eea')  # Arka plan rengi (hex)
    welcome_text_color = db.Column(db.String(7), default='#ffffff')  # Yazı rengi (hex)
    welcome_button_text = db.Column(db.String(100), default='Explore Products')
    welcome_button_link = db.Column(db.String(255), default='/products')
    welcome_button_color = db.Column(db.String(7), default='#00b894')  # Buton rengi (hex)
    
    # Homepage General Settings
    homepage_background_color = db.Column(db.String(7), default='#ffffff')  # Ana sayfa arka plan rengi
    
    # Collections Section Settings
    collections_title = db.Column(db.String(200), default='Our Collections')
    collections_show_categories = db.Column(db.JSON, default=lambda: [])  # Gösterilecek kategori ID'leri
    collections_categories_per_row = db.Column(db.Integer, default=4)  # Satırda kaç kategori
    collections_max_rows = db.Column(db.Integer, default=1)  # Maksimum satır sayısı
    collections_show_section = db.Column(db.Boolean, default=True)  # Bölüm gösterilsin mi
    
    # Contact & Social Settings
    contact_phone = db.Column(db.String(20))
    contact_email = db.Column(db.String(120))
    contact_address = db.Column(db.Text)
    social_instagram = db.Column(db.String(100))
    social_facebook = db.Column(db.String(100))
    social_twitter = db.Column(db.String(100))
    social_youtube = db.Column(db.String(100))
    social_linkedin = db.Column(db.String(100))
    
    # SEO Settings
    meta_title = db.Column(db.String(200))
    meta_description = db.Column(db.Text)
    meta_keywords = db.Column(db.Text)
    
    # About Page Settings
    about_page_title = db.Column(db.String(200), default='About Us')
    about_page_subtitle = db.Column(db.String(200), default='Learn more about our company and mission')
    about_page_content = db.Column(db.Text, default='Welcome to PEBDEQ, your trusted e-commerce platform.')
    about_page_mission_title = db.Column(db.String(200), default='Our Mission')
    about_page_mission_content = db.Column(db.Text, default='At PEBDEQ, we specialize in providing high-quality products across four main categories: 3D printing services, professional tools, vintage light bulbs, and custom laser engraving.')
    about_page_values_title = db.Column(db.String(200), default='Our Values')
    about_page_values_content = db.Column(db.Text, default='Quality products and services, competitive prices, fast and reliable shipping, excellent customer support, secure payment options.')
    about_page_team_title = db.Column(db.String(200), default='Our Team')
    about_page_team_content = db.Column(db.Text, default='Our dedicated team works hard to provide the best experience for our customers.')
    about_page_history_title = db.Column(db.String(200), default='Our History')
    about_page_history_content = db.Column(db.Text, default='Founded with a vision to bring quality products to customers worldwide.')
    about_page_contact_title = db.Column(db.String(200), default='Get in Touch')
    about_page_contact_content = db.Column(db.Text, default='Contact us for more information about our products and services.')
    about_page_show_mission = db.Column(db.Boolean, default=True)
    about_page_show_values = db.Column(db.Boolean, default=True)
    about_page_show_team = db.Column(db.Boolean, default=True)
    about_page_show_history = db.Column(db.Boolean, default=True)
    about_page_show_contact = db.Column(db.Boolean, default=True)
    about_page_background_image = db.Column(db.String(255))
    about_page_background_color = db.Column(db.String(7), default='#ffffff')
    
    # Business Settings
    currency_symbol = db.Column(db.String(10), default='₺')
    currency_code = db.Column(db.String(3), default='TRY')
    shipping_cost = db.Column(db.Float, default=0.0)
    free_shipping_threshold = db.Column(db.Float, default=0.0)
    
    # Feature Flags
    enable_reviews = db.Column(db.Boolean, default=True)
    enable_wishlist = db.Column(db.Boolean, default=True)
    enable_compare = db.Column(db.Boolean, default=True)
    enable_newsletter = db.Column(db.Boolean, default=True)
    maintenance_mode = db.Column(db.Boolean, default=False)
    
    # Google OAuth Settings
    google_oauth_enabled = db.Column(db.Boolean, default=False)
    google_oauth_client_id = db.Column(db.String(200))
    google_oauth_client_secret = db.Column(db.String(200))
    google_oauth_redirect_uri = db.Column(db.String(200), default='http://localhost:3000/auth/google/callback')
    google_oauth_scope = db.Column(db.String(200), default='profile email')
    
    # Site URL Settings
    site_base_url = db.Column(db.String(200), default='http://localhost:3000')
    site_is_production = db.Column(db.Boolean, default=False)
    site_ssl_enabled = db.Column(db.Boolean, default=False)
    
    # Footer Settings
    footer_show_section = db.Column(db.Boolean, default=True)
    footer_background_color = db.Column(db.String(7), default='#2c3e50')
    footer_text_color = db.Column(db.String(7), default='#ffffff')
    footer_company_name = db.Column(db.String(100), default='PEBDEQ')
    footer_company_description = db.Column(db.Text, default='Crafted with passion, delivered with precision.')
    footer_copyright_text = db.Column(db.String(200), default='© 2024 PEBDEQ. All rights reserved.')
    footer_use_logo = db.Column(db.Boolean, default=False)
    footer_logo = db.Column(db.String(255))  # Footer logo URL'si
    footer_logo_width = db.Column(db.Integer, default=120)
    footer_logo_height = db.Column(db.Integer, default=40)
    
    # Footer Support Section
    footer_support_title = db.Column(db.String(100), default='Support')
    footer_support_show_section = db.Column(db.Boolean, default=True)
    footer_support_links = db.Column(db.JSON, default=lambda: [
        {'title': 'Contact Us', 'url': '/contact', 'is_external': False},
        {'title': 'FAQ', 'url': '/faq', 'is_external': False},
        {'title': 'Shipping Info', 'url': '/shipping', 'is_external': False},
        {'title': 'Returns', 'url': '/returns', 'is_external': False}
    ])
    
    # Footer Quick Links Section
    footer_quick_links_title = db.Column(db.String(100), default='Quick Links')
    footer_quick_links_show_section = db.Column(db.Boolean, default=True)
    footer_quick_links = db.Column(db.JSON, default=lambda: [
        {'title': 'About Us', 'url': '/about', 'is_external': False},
        {'title': 'Products', 'url': '/products', 'is_external': False},
        {'title': 'Blog', 'url': '/blog', 'is_external': False},
        {'title': 'Privacy Policy', 'url': '/privacy', 'is_external': False}
    ])
    
    # Footer Social Section
    footer_social_title = db.Column(db.String(100), default='Follow Us')
    footer_social_show_section = db.Column(db.Boolean, default=True)
    
    # Footer Newsletter Section
    footer_newsletter_title = db.Column(db.String(100), default='Newsletter')
    footer_newsletter_show_section = db.Column(db.Boolean, default=True)
    footer_newsletter_description = db.Column(db.Text, default='Subscribe to get updates about new products and offers.')
    footer_newsletter_placeholder = db.Column(db.String(100), default='Enter your email address')
    footer_newsletter_button_text = db.Column(db.String(50), default='Subscribe')
    
    # Footer Legal Links Section
    footer_legal_title = db.Column(db.String(100), default='Legal')
    footer_legal_show_section = db.Column(db.Boolean, default=True)
    footer_legal_privacy_policy_title = db.Column(db.String(100), default='Privacy Policy')
    footer_legal_privacy_policy_content = db.Column(db.Text, default='')
    footer_legal_terms_of_service_title = db.Column(db.String(100), default='Terms of Service')
    footer_legal_terms_of_service_content = db.Column(db.Text, default='')
    footer_legal_return_policy_title = db.Column(db.String(100), default='Return Policy')
    footer_legal_return_policy_content = db.Column(db.Text, default='')
    footer_legal_shipping_policy_title = db.Column(db.String(100), default='Shipping Policy')
    footer_legal_shipping_policy_content = db.Column(db.Text, default='')
    footer_legal_cookie_policy_title = db.Column(db.String(100), default='Cookie Policy')
    footer_legal_cookie_policy_content = db.Column(db.Text, default='')
    footer_legal_dmca_notice_title = db.Column(db.String(100), default='DMCA Notice')
    footer_legal_dmca_notice_content = db.Column(db.Text, default='')
    footer_legal_accessibility_statement_title = db.Column(db.String(100), default='Accessibility Statement')
    footer_legal_accessibility_statement_content = db.Column(db.Text, default='')
    
    # Homepage Products Settings
    homepage_products_show_section = db.Column(db.Boolean, default=True)
    homepage_products_title = db.Column(db.String(200), default='Featured Products')
    homepage_products_subtitle = db.Column(db.String(200), default='Discover our most popular items')
    homepage_products_max_rows = db.Column(db.Integer, default=2)
    homepage_products_per_row = db.Column(db.Integer, default=4)
    homepage_products_max_items = db.Column(db.Integer, default=8)
    homepage_products_show_images = db.Column(db.Boolean, default=True)
    homepage_products_image_height = db.Column(db.Integer, default=200)
    homepage_products_image_width = db.Column(db.Integer, default=300)
    homepage_products_show_favorite = db.Column(db.Boolean, default=True)
    homepage_products_show_buy_now = db.Column(db.Boolean, default=True)
    homepage_products_show_details = db.Column(db.Boolean, default=True)
    homepage_products_show_price = db.Column(db.Boolean, default=True)
    homepage_products_show_original_price = db.Column(db.Boolean, default=True)
    homepage_products_show_stock = db.Column(db.Boolean, default=True)
    homepage_products_show_category = db.Column(db.Boolean, default=True)
    homepage_products_sort_by = db.Column(db.String(50), default='featured')  # featured, newest, price_low, price_high, name
    homepage_products_filter_categories = db.Column(db.JSON, default=lambda: [])
    homepage_products_show_view_all = db.Column(db.Boolean, default=True)
    homepage_products_view_all_text = db.Column(db.String(100), default='View All Products')
    homepage_products_view_all_link = db.Column(db.String(255), default='/products')
    homepage_products_card_style = db.Column(db.String(50), default='modern')  # modern, classic, minimal
    homepage_products_card_shadow = db.Column(db.Boolean, default=True)
    homepage_products_card_hover_effect = db.Column(db.Boolean, default=True)
    homepage_products_show_badges = db.Column(db.Boolean, default=True)
    homepage_products_show_rating = db.Column(db.Boolean, default=False)
    homepage_products_show_quick_view = db.Column(db.Boolean, default=False)
    homepage_products_enable_image_preview = db.Column(db.Boolean, default=True)
    
    # Homepage Products 2 Settings
    homepage_products2_show_section = db.Column(db.Boolean, default=True)
    homepage_products2_title = db.Column(db.String(200), default='Latest Products')
    homepage_products2_subtitle = db.Column(db.String(200), default='Check out our newest arrivals')
    homepage_products2_max_rows = db.Column(db.Integer, default=2)
    homepage_products2_per_row = db.Column(db.Integer, default=4)
    homepage_products2_max_items = db.Column(db.Integer, default=8)
    homepage_products2_show_images = db.Column(db.Boolean, default=True)
    homepage_products2_image_height = db.Column(db.Integer, default=200)
    homepage_products2_image_width = db.Column(db.Integer, default=300)
    homepage_products2_show_favorite = db.Column(db.Boolean, default=True)
    homepage_products2_show_buy_now = db.Column(db.Boolean, default=True)
    homepage_products2_show_details = db.Column(db.Boolean, default=True)
    homepage_products2_show_price = db.Column(db.Boolean, default=True)
    homepage_products2_show_original_price = db.Column(db.Boolean, default=True)
    homepage_products2_show_stock = db.Column(db.Boolean, default=True)
    homepage_products2_show_category = db.Column(db.Boolean, default=True)
    homepage_products2_sort_by = db.Column(db.String(50), default='newest')  # featured, newest, price_low, price_high, name
    homepage_products2_filter_categories = db.Column(db.JSON, default=lambda: [])
    homepage_products2_show_view_all = db.Column(db.Boolean, default=True)
    homepage_products2_view_all_text = db.Column(db.String(100), default='View All Products')
    homepage_products2_view_all_link = db.Column(db.String(255), default='/products')
    homepage_products2_card_style = db.Column(db.String(50), default='modern')  # modern, classic, minimal
    homepage_products2_card_shadow = db.Column(db.Boolean, default=True)
    homepage_products2_card_hover_effect = db.Column(db.Boolean, default=True)
    homepage_products2_show_badges = db.Column(db.Boolean, default=True)
    homepage_products2_show_rating = db.Column(db.Boolean, default=False)
    homepage_products2_show_quick_view = db.Column(db.Boolean, default=False)
    homepage_products2_enable_image_preview = db.Column(db.Boolean, default=True)
    
    # Products Page Settings
    products_page_background_color = db.Column(db.String(7), default='#ffffff')  # Products sayfa arka plan rengi
    products_page_per_row = db.Column(db.Integer, default=4)
    products_page_max_items_per_page = db.Column(db.Integer, default=12)
    products_page_show_images = db.Column(db.Boolean, default=True)
    products_page_image_height = db.Column(db.Integer, default=200)
    products_page_image_width = db.Column(db.Integer, default=300)
    products_page_remove_image_background = db.Column(db.Boolean, default=False)  # Resim arka planını kaldır
    products_page_show_favorite = db.Column(db.Boolean, default=True)
    products_page_show_buy_now = db.Column(db.Boolean, default=True)
    products_page_show_details = db.Column(db.Boolean, default=True)
    products_page_show_price = db.Column(db.Boolean, default=True)
    products_page_show_original_price = db.Column(db.Boolean, default=True)
    products_page_show_stock = db.Column(db.Boolean, default=True)
    products_page_show_category = db.Column(db.Boolean, default=True)
    products_page_default_sort_by = db.Column(db.String(50), default='newest')  # featured, newest, price_low, price_high, name
    products_page_card_style = db.Column(db.String(50), default='modern')  # modern, classic, minimal
    products_page_card_shadow = db.Column(db.Boolean, default=True)
    products_page_card_hover_effect = db.Column(db.Boolean, default=True)
    products_page_show_badges = db.Column(db.Boolean, default=True)
    products_page_show_rating = db.Column(db.Boolean, default=False)
    products_page_show_quick_view = db.Column(db.Boolean, default=False)
    products_page_enable_pagination = db.Column(db.Boolean, default=True)
    products_page_enable_filters = db.Column(db.Boolean, default=True)
    products_page_enable_search = db.Column(db.Boolean, default=True)
    products_page_enable_image_preview = db.Column(db.Boolean, default=True)
    
    # Product Detail Page Settings
    product_detail_show_thumbnails = db.Column(db.Boolean, default=True)
    product_detail_show_category_badge = db.Column(db.Boolean, default=True)
    product_detail_show_featured_badge = db.Column(db.Boolean, default=True)
    product_detail_show_stock_info = db.Column(db.Boolean, default=True)
    product_detail_show_variations = db.Column(db.Boolean, default=True)
    product_detail_show_description = db.Column(db.Boolean, default=True)
    product_detail_show_details_section = db.Column(db.Boolean, default=True)
    product_detail_show_video = db.Column(db.Boolean, default=True)
    product_detail_show_buy_now_button = db.Column(db.Boolean, default=True)
    product_detail_show_continue_shopping_button = db.Column(db.Boolean, default=True)
    product_detail_show_quantity_selector = db.Column(db.Boolean, default=True)
    product_detail_show_image_lightbox = db.Column(db.Boolean, default=True)
    
    # Product Detail Button Colors
    product_detail_add_to_cart_button_color = db.Column(db.String(7), default='#007bff')
    product_detail_add_to_cart_button_text_color = db.Column(db.String(7), default='#ffffff')
    product_detail_buy_now_button_color = db.Column(db.String(7), default='#28a745')
    product_detail_buy_now_button_text_color = db.Column(db.String(7), default='#ffffff')
    product_detail_continue_shopping_button_color = db.Column(db.String(7), default='#007bff')
    product_detail_continue_shopping_button_text_color = db.Column(db.String(7), default='#007bff')
    
    # Product Detail Text Colors
    product_detail_product_name_color = db.Column(db.String(7), default='#333333')
    product_detail_product_price_color = db.Column(db.String(7), default='#007bff')
    product_detail_product_description_color = db.Column(db.String(7), default='#333333')
    product_detail_product_details_label_color = db.Column(db.String(7), default='#666666')
    product_detail_product_details_value_color = db.Column(db.String(50), default='#333333')
    
    # Product Detail Page Font Settings
    product_detail_product_name_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    product_detail_product_name_font_size = db.Column(db.Integer, default=28)
    product_detail_product_name_font_weight = db.Column(db.String(20), default='bold')
    product_detail_product_name_font_style = db.Column(db.String(20), default='normal')
    
    product_detail_product_price_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    product_detail_product_price_font_size = db.Column(db.Integer, default=24)
    product_detail_product_price_font_weight = db.Column(db.String(20), default='bold')
    product_detail_product_price_font_style = db.Column(db.String(20), default='normal')
    
    product_detail_product_description_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    product_detail_product_description_font_size = db.Column(db.Integer, default=16)
    product_detail_product_description_font_weight = db.Column(db.String(20), default='normal')
    product_detail_product_description_font_style = db.Column(db.String(20), default='normal')
    
    product_detail_product_details_label_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    product_detail_product_details_label_font_size = db.Column(db.Integer, default=14)
    product_detail_product_details_label_font_weight = db.Column(db.String(20), default='bold')
    product_detail_product_details_label_font_style = db.Column(db.String(20), default='normal')
    
    product_detail_product_details_value_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    product_detail_product_details_value_font_size = db.Column(db.Integer, default=14)
    product_detail_product_details_value_font_weight = db.Column(db.String(20), default='normal')
    product_detail_product_details_value_font_style = db.Column(db.String(20), default='normal')
    
    # Products Page Font & Color Settings
    products_page_product_name_color = db.Column(db.String(7), default='#333333')
    products_page_product_name_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    products_page_product_name_font_size = db.Column(db.Integer, default=18)
    products_page_product_name_font_weight = db.Column(db.String(20), default='bold')
    products_page_product_name_font_style = db.Column(db.String(20), default='normal')
    
    products_page_title_color = db.Column(db.String(7), default='#333333')
    products_page_title_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    products_page_title_font_size = db.Column(db.Integer, default=32)
    products_page_title_font_weight = db.Column(db.String(20), default='bold')
    products_page_title_font_style = db.Column(db.String(20), default='normal')
    
    products_page_subtitle_color = db.Column(db.String(7), default='#666666')
    products_page_subtitle_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    products_page_subtitle_font_size = db.Column(db.Integer, default=16)
    products_page_subtitle_font_weight = db.Column(db.String(20), default='normal')
    products_page_subtitle_font_style = db.Column(db.String(20), default='normal')
    
    products_page_product_price_color = db.Column(db.String(7), default='#007bff')
    products_page_product_price_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    products_page_product_price_font_size = db.Column(db.Integer, default=16)
    products_page_product_price_font_weight = db.Column(db.String(20), default='bold')
    products_page_product_price_font_style = db.Column(db.String(20), default='normal')
    
    products_page_product_category_color = db.Column(db.String(7), default='#666666')
    products_page_product_category_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    products_page_product_category_font_size = db.Column(db.Integer, default=14)
    products_page_product_category_font_weight = db.Column(db.String(20), default='normal')
    products_page_product_category_font_style = db.Column(db.String(20), default='normal')
    
    products_page_stock_info_color = db.Column(db.String(7), default='#28a745')
    products_page_stock_info_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    products_page_stock_info_font_size = db.Column(db.Integer, default=12)
    products_page_stock_info_font_weight = db.Column(db.String(20), default='normal')
    products_page_stock_info_font_style = db.Column(db.String(20), default='normal')
    
    products_page_view_details_button_color = db.Column(db.String(7), default='#007bff')
    products_page_view_details_button_text_color = db.Column(db.String(7), default='#ffffff')
    products_page_view_details_button_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    products_page_view_details_button_font_size = db.Column(db.Integer, default=14)
    products_page_view_details_button_font_weight = db.Column(db.String(20), default='normal')
    products_page_view_details_button_font_style = db.Column(db.String(20), default='normal')
    
    products_page_add_to_cart_button_color = db.Column(db.String(7), default='#28a745')
    products_page_add_to_cart_button_text_color = db.Column(db.String(7), default='#ffffff')
    products_page_add_to_cart_button_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    products_page_add_to_cart_button_font_size = db.Column(db.Integer, default=14)
    products_page_add_to_cart_button_font_weight = db.Column(db.String(20), default='normal')
    products_page_add_to_cart_button_font_style = db.Column(db.String(20), default='normal')
    
    # Homepage Products 1 Font & Color Settings
    homepage_products_product_name_color = db.Column(db.String(7), default='#333333')
    homepage_products_product_name_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products_product_name_font_size = db.Column(db.Integer, default=18)
    homepage_products_product_name_font_weight = db.Column(db.String(20), default='bold')
    homepage_products_product_name_font_style = db.Column(db.String(20), default='normal')
    
    homepage_products_product_price_color = db.Column(db.String(7), default='#007bff')
    homepage_products_product_price_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products_product_price_font_size = db.Column(db.Integer, default=16)
    homepage_products_product_price_font_weight = db.Column(db.String(20), default='bold')
    homepage_products_product_price_font_style = db.Column(db.String(20), default='normal')
    
    homepage_products_product_category_color = db.Column(db.String(7), default='#666666')
    homepage_products_product_category_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products_product_category_font_size = db.Column(db.Integer, default=14)
    homepage_products_product_category_font_weight = db.Column(db.String(20), default='normal')
    homepage_products_product_category_font_style = db.Column(db.String(20), default='normal')
    
    homepage_products_stock_info_color = db.Column(db.String(7), default='#28a745')
    homepage_products_stock_info_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products_stock_info_font_size = db.Column(db.Integer, default=12)
    homepage_products_stock_info_font_weight = db.Column(db.String(20), default='normal')
    homepage_products_stock_info_font_style = db.Column(db.String(20), default='normal')
    
    homepage_products_view_details_button_color = db.Column(db.String(7), default='#007bff')
    homepage_products_view_details_button_text_color = db.Column(db.String(7), default='#ffffff')
    homepage_products_view_details_button_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products_view_details_button_font_size = db.Column(db.Integer, default=14)
    homepage_products_view_details_button_font_weight = db.Column(db.String(20), default='normal')
    homepage_products_view_details_button_font_style = db.Column(db.String(20), default='normal')
    
    homepage_products_add_to_cart_button_color = db.Column(db.String(7), default='#28a745')
    homepage_products_add_to_cart_button_text_color = db.Column(db.String(7), default='#ffffff')
    homepage_products_add_to_cart_button_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products_add_to_cart_button_font_size = db.Column(db.Integer, default=14)
    homepage_products_add_to_cart_button_font_weight = db.Column(db.String(20), default='normal')
    homepage_products_add_to_cart_button_font_style = db.Column(db.String(20), default='normal')
    
    # Homepage Products 2 Font & Color Settings
    homepage_products2_product_name_color = db.Column(db.String(7), default='#333333')
    homepage_products2_product_name_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products2_product_name_font_size = db.Column(db.Integer, default=18)
    homepage_products2_product_name_font_weight = db.Column(db.String(20), default='bold')
    homepage_products2_product_name_font_style = db.Column(db.String(20), default='normal')
    
    homepage_products2_product_price_color = db.Column(db.String(7), default='#007bff')
    homepage_products2_product_price_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products2_product_price_font_size = db.Column(db.Integer, default=16)
    homepage_products2_product_price_font_weight = db.Column(db.String(20), default='bold')
    homepage_products2_product_price_font_style = db.Column(db.String(20), default='normal')
    
    homepage_products2_product_category_color = db.Column(db.String(7), default='#666666')
    homepage_products2_product_category_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products2_product_category_font_size = db.Column(db.Integer, default=14)
    homepage_products2_product_category_font_weight = db.Column(db.String(20), default='normal')
    homepage_products2_product_category_font_style = db.Column(db.String(20), default='normal')
    
    homepage_products2_stock_info_color = db.Column(db.String(7), default='#28a745')
    homepage_products2_stock_info_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products2_stock_info_font_size = db.Column(db.Integer, default=12)
    homepage_products2_stock_info_font_weight = db.Column(db.String(20), default='normal')
    homepage_products2_stock_info_font_style = db.Column(db.String(20), default='normal')
    
    homepage_products2_view_details_button_color = db.Column(db.String(7), default='#007bff')
    homepage_products2_view_details_button_text_color = db.Column(db.String(7), default='#ffffff')
    homepage_products2_view_details_button_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products2_view_details_button_font_size = db.Column(db.Integer, default=14)
    homepage_products2_view_details_button_font_weight = db.Column(db.String(20), default='normal')
    homepage_products2_view_details_button_font_style = db.Column(db.String(20), default='normal')
    
    homepage_products2_add_to_cart_button_color = db.Column(db.String(7), default='#28a745')
    homepage_products2_add_to_cart_button_text_color = db.Column(db.String(7), default='#ffffff')
    homepage_products2_add_to_cart_button_font_family = db.Column(db.String(100), default='Arial, sans-serif')
    homepage_products2_add_to_cart_button_font_size = db.Column(db.Integer, default=14)
    homepage_products2_add_to_cart_button_font_weight = db.Column(db.String(20), default='normal')
    homepage_products2_add_to_cart_button_font_style = db.Column(db.String(20), default='normal')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 

class UserAddress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)  # "Home", "Work", "Other"
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    company = db.Column(db.String(100))
    address_line1 = db.Column(db.String(255), nullable=False)
    address_line2 = db.Column(db.String(255))
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100))
    postal_code = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Null for guest carts
    session_id = db.Column(db.String(255), nullable=True)  # For guest carts
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('CartItem', backref='cart', lazy=True, cascade='all, delete-orphan')
    user = db.relationship('User', backref='carts', lazy=True)
    
    def to_dict(self):
        items_list = getattr(self, 'items', []) or []
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'items': [item.to_dict() for item in items_list if item is not None],
            'total_items': sum(item.quantity for item in items_list if item is not None),
            'total_price': sum(item.quantity * item.price for item in items_list if item is not None),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('cart.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Float, nullable=False)  # Price at the time of adding to cart
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = db.relationship('Product', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'cart_id': self.cart_id,
            'product_id': self.product_id,
            'product': {
                'id': self.product.id,
                'name': self.product.name,
                'slug': self.product.slug,
                'image_url': self.product.images[0] if self.product.images else None,
                'current_price': self.product.price,
                'original_price': self.product.original_price
            } if self.product else None,
            'quantity': self.quantity,
            'price': self.price,
            'subtotal': self.quantity * self.price,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 

class Invoice(db.Model):
    """Invoice model for order billing"""
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Invoice Details
    invoice_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    
    # Amounts
    subtotal = db.Column(db.Float, nullable=False)
    tax_rate = db.Column(db.Float, default=0.06)  # US Sales Tax 6%
    tax_amount = db.Column(db.Float, nullable=False)
    discount_amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    
    # Status
    status = db.Column(db.String(50), default='draft')  # draft, sent, paid, overdue, cancelled
    payment_status = db.Column(db.String(50), default='pending')  # pending, paid, partial, failed
    
    # Company Information
    company_name = db.Column(db.String(200), default='PEBDEQ')
    company_address = db.Column(db.Text)
    company_tax_number = db.Column(db.String(50))
    company_phone = db.Column(db.String(20))
    company_email = db.Column(db.String(120))
    
    # Customer Information
    customer_name = db.Column(db.String(200), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False)
    customer_phone = db.Column(db.String(20))
    billing_address = db.Column(db.Text)
    
    # File Information
    pdf_path = db.Column(db.String(255))
    pdf_generated_at = db.Column(db.DateTime)
    
    # Notes
    notes = db.Column(db.Text)
    internal_notes = db.Column(db.Text)  # Admin notes, not visible to customer
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = db.relationship('Order', backref='invoices', lazy=True)
    user = db.relationship('User', backref='invoices', lazy=True)
    invoice_items = db.relationship('InvoiceItem', backref='invoice', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'order_id': self.order_id,
            'user_id': self.user_id,
            'invoice_date': self.invoice_date.isoformat(),
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'subtotal': self.subtotal,
            'tax_rate': self.tax_rate,
            'tax_amount': self.tax_amount,
            'discount_amount': self.discount_amount,
            'total_amount': self.total_amount,
            'status': self.status,
            'payment_status': self.payment_status,
            'company_name': self.company_name,
            'company_address': self.company_address,
            'company_tax_number': self.company_tax_number,
            'company_phone': self.company_phone,
            'company_email': self.company_email,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'billing_address': self.billing_address,
            'pdf_path': self.pdf_path,
            'pdf_generated_at': self.pdf_generated_at.isoformat() if self.pdf_generated_at else None,
            'notes': self.notes,
            'internal_notes': self.internal_notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'items': [item.to_dict() for item in getattr(self, 'invoice_items', []) or []]
        }

class InvoiceItem(db.Model):
    """Invoice item details"""
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    
    # Item Details
    product_name = db.Column(db.String(200), nullable=False)
    product_description = db.Column(db.Text)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    discount_percentage = db.Column(db.Float, default=0.0)
    line_total = db.Column(db.Float, nullable=False)
    
    # Tax Information
    tax_rate = db.Column(db.Float, default=0.18)
    tax_amount = db.Column(db.Float, default=0.0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    product = db.relationship('Product', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_description': self.product_description,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'discount_percentage': self.discount_percentage,
            'line_total': self.line_total,
            'tax_rate': self.tax_rate,
            'tax_amount': self.tax_amount,
            'created_at': self.created_at.isoformat()
        }

# Custom Theme Model
class CustomTheme(db.Model):
    __tablename__ = 'custom_themes'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    theme_id = db.Column(db.String(100), unique=True, nullable=False)  # Unique identifier for the theme
    description = db.Column(db.Text)
    author = db.Column(db.String(255))
    version = db.Column(db.String(50), default='1.0.0')
    type = db.Column(db.String(20), default='light')  # light, dark, custom
    
    # Theme content
    theme_data = db.Column(db.Text, nullable=False)  # JSON string of theme configuration
    css_content = db.Column(db.Text)  # Generated CSS content
    preview_colors = db.Column(db.Text)  # JSON string of preview colors
    
    # Metadata
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    is_public = db.Column(db.Boolean, default=True)
    is_active = db.Column(db.Boolean, default=True)
    
    # Statistics
    download_count = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0.0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('User', backref='created_themes')
    
    def __repr__(self):
        return f'<CustomTheme {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'theme_id': self.theme_id,
            'description': self.description,
            'author': self.author,
            'version': self.version,
            'type': self.type,
            'theme_data': self.theme_data,
            'css_content': self.css_content,
            'preview_colors': self.preview_colors,
            'creator_id': self.creator_id,
            'is_default': self.is_default,
            'is_public': self.is_public,
            'is_active': self.is_active,
            'download_count': self.download_count,
            'rating': self.rating,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 

# Email System Models

class EmailTemplate(db.Model):
    """Email templates for different types of emails"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    subject = db.Column(db.String(200), nullable=False)
    html_content = db.Column(db.Text, nullable=False)
    text_content = db.Column(db.Text)
    template_type = db.Column(db.String(50), nullable=False)  # 'marketing', 'transactional', 'notification'
    variables = db.Column(db.JSON)  # Available template variables like {{user_name}}, {{order_id}}
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EmailQueue(db.Model):
    """Queue for emails to be sent"""
    id = db.Column(db.Integer, primary_key=True)
    recipient_email = db.Column(db.String(120), nullable=False)
    recipient_name = db.Column(db.String(100))
    subject = db.Column(db.String(200), nullable=False)
    html_content = db.Column(db.Text, nullable=False)
    text_content = db.Column(db.Text)
    email_type = db.Column(db.String(50), nullable=False)  # 'marketing', 'order', 'invoice', 'shipping'
    priority = db.Column(db.Integer, default=5)  # 1=highest, 10=lowest
    status = db.Column(db.String(20), default='pending')  # 'pending', 'sent', 'failed', 'cancelled'
    scheduled_at = db.Column(db.DateTime)
    sent_at = db.Column(db.DateTime)
    failed_at = db.Column(db.DateTime)
    error_message = db.Column(db.Text)
    retry_count = db.Column(db.Integer, default=0)
    max_retries = db.Column(db.Integer, default=3)
    template_variables = db.Column(db.JSON)  # Variables to fill in template
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'))
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EmailLog(db.Model):
    """Log of all sent emails for analytics and tracking"""
    id = db.Column(db.Integer, primary_key=True)
    email_queue_id = db.Column(db.Integer, db.ForeignKey('email_queue.id'))
    recipient_email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    email_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'sent', 'delivered', 'opened', 'clicked', 'bounced'
    tracking_id = db.Column(db.String(100), unique=True)
    opened_at = db.Column(db.DateTime)
    clicked_at = db.Column(db.DateTime)
    bounced_at = db.Column(db.DateTime)
    user_agent = db.Column(db.String(255))
    ip_address = db.Column(db.String(45))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'))
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class EmailSettings(db.Model):
    """Email configuration settings"""
    id = db.Column(db.Integer, primary_key=True)
    smtp_server = db.Column(db.String(100), default='smtp.gmail.com')
    smtp_port = db.Column(db.Integer, default=587)
    smtp_username = db.Column(db.String(120))
    smtp_password = db.Column(db.String(255))  # Should be encrypted
    smtp_use_tls = db.Column(db.Boolean, default=True)
    smtp_use_ssl = db.Column(db.Boolean, default=False)
    from_email = db.Column(db.String(120), default='noreply@pebdeq.com')
    from_name = db.Column(db.String(100), default='PEBDEQ')
    reply_to_email = db.Column(db.String(120))
    bounce_email = db.Column(db.String(120))
    daily_limit = db.Column(db.Integer, default=1000)  # Daily email limit
    hourly_limit = db.Column(db.Integer, default=100)  # Hourly email limit
    is_enabled = db.Column(db.Boolean, default=True)
    test_mode = db.Column(db.Boolean, default=False)  # For testing without actual sending
    
    # Auto-send email notifications (admin can enable/disable each type)
    auto_send_welcome = db.Column(db.Boolean, default=True)  # New user registration
    auto_send_order_confirmation = db.Column(db.Boolean, default=True)  # Order placed
    auto_send_payment_confirmation = db.Column(db.Boolean, default=True)  # Payment received
    auto_send_shipping_notification = db.Column(db.Boolean, default=True)  # Order shipped
    auto_send_order_status_update = db.Column(db.Boolean, default=False)  # Manual status updates
    auto_send_invoice = db.Column(db.Boolean, default=True)  # Invoice generation
    auto_send_newsletter = db.Column(db.Boolean, default=False)  # Marketing emails
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Email Campaign Models for Marketing

class EmailCampaign(db.Model):
    """Email marketing campaigns"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    html_content = db.Column(db.Text, nullable=False)
    text_content = db.Column(db.Text)
    sender_name = db.Column(db.String(100))
    sender_email = db.Column(db.String(120))
    reply_to_email = db.Column(db.String(120))
    status = db.Column(db.String(20), default='draft')  # 'draft', 'scheduled', 'sending', 'sent', 'paused'
    scheduled_at = db.Column(db.DateTime)
    sent_at = db.Column(db.DateTime)
    total_recipients = db.Column(db.Integer, default=0)
    total_sent = db.Column(db.Integer, default=0)
    total_delivered = db.Column(db.Integer, default=0)
    total_opened = db.Column(db.Integer, default=0)
    total_clicked = db.Column(db.Integer, default=0)
    total_bounced = db.Column(db.Integer, default=0)
    total_unsubscribed = db.Column(db.Integer, default=0)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EmailSubscriber(db.Model):
    """Email newsletter subscribers"""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    name = db.Column(db.String(100))
    status = db.Column(db.String(20), default='active')  # 'active', 'unsubscribed', 'bounced'
    source = db.Column(db.String(50))  # 'website', 'order', 'manual', 'import'
    tags = db.Column(db.JSON)  # Subscriber tags for segmentation
    preferences = db.Column(db.JSON)  # Email preferences
    subscribed_at = db.Column(db.DateTime, default=datetime.utcnow)
    unsubscribed_at = db.Column(db.DateTime)
    last_email_sent = db.Column(db.DateTime)
    total_emails_sent = db.Column(db.Integer, default=0)
    total_emails_opened = db.Column(db.Integer, default=0)
    total_emails_clicked = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # If subscriber is also a user
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 