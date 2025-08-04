from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_mail import Mail
import os

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    # Use absolute path to ensure correct database file
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'instance', 'pebdeq.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Email Configuration
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT') or 587)
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    app.config['MAIL_USE_SSL'] = os.environ.get('MAIL_USE_SSL', 'false').lower() in ['true', 'on', '1']
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER') or 'noreply@pebdeq.com'
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.routes.main import main_bp
    from app.routes.products import products_bp
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    from app.routes.site_settings import site_settings_bp
    from app.routes.categories import categories_bp
    from app.routes.orders import orders_bp
    from app.routes.messages import messages_bp
    from app.routes.uploads import uploads_bp
    from app.routes.variations import variations_bp
    from app.routes.users import users_bp
    from app.routes.cart import cart_bp
    from app.routes.invoices import invoices_bp
    from app.routes.themes import themes_bp
    from app.routes.test_runner import test_runner_bp
    from app.routes.emails import emails_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(site_settings_bp, url_prefix='/api/admin')
    app.register_blueprint(categories_bp, url_prefix='/api/admin')
    app.register_blueprint(orders_bp, url_prefix='/api')
    app.register_blueprint(messages_bp, url_prefix='/api')
    app.register_blueprint(uploads_bp, url_prefix='/api')
    app.register_blueprint(variations_bp, url_prefix='/api/admin')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(cart_bp, url_prefix='/api')
    app.register_blueprint(invoices_bp, url_prefix='/api')
    app.register_blueprint(themes_bp, url_prefix='/api/admin')
    app.register_blueprint(test_runner_bp, url_prefix='/api/admin')
    app.register_blueprint(emails_bp, url_prefix='/api')
    
    # Static file serving for uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        # Serve from the uploads folder one level up from app/
        upload_folder = os.path.join(os.path.dirname(app.root_path), 'uploads')
        return send_from_directory(upload_folder, filename)
    
    return app 