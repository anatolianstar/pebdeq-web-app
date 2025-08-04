import os
from typing import Dict, Any

class Config:
    """Environment-based configuration class"""
    
    @staticmethod
    def get_environment() -> str:
        """Determine current environment"""
        return os.getenv('FLASK_ENV', 'development')
    
    @staticmethod
    def is_production() -> bool:
        """Check if running in production"""
        return Config.get_environment() == 'production'
    
    @staticmethod
    def get_database_url() -> str:
        """Get database URL based on environment"""
        if Config.is_production():
            return os.getenv('DATABASE_URL', 'sqlite:///instance/pebdeq.db')
        else:
            return 'sqlite:///instance/pebdeq.db'
    
    @staticmethod
    def get_upload_folder() -> str:
        """Get upload folder path"""
        if Config.is_production():
            return os.getenv('UPLOAD_FOLDER', '/var/www/pebdeq/uploads')
        else:
            return 'uploads'
    
    @staticmethod
    def get_cors_origins() -> list:
        """Get allowed CORS origins"""
        if Config.is_production():
            # In production, allow only the actual domain
            return [
                os.getenv('FRONTEND_URL', 'https://pebdeq.com'),
                'https://pebdeq.com',
                'https://www.pebdeq.com'
            ]
        else:
            # In development, allow localhost variations
            return [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'http://localhost:3001'
            ]
    
    @staticmethod
    def get_config() -> Dict[str, Any]:
        """Get complete configuration dictionary"""
        return {
            'environment': Config.get_environment(),
            'is_production': Config.is_production(),
            'database_url': Config.get_database_url(),
            'upload_folder': Config.get_upload_folder(),
            'cors_origins': Config.get_cors_origins(),
            'debug': not Config.is_production(),
            'secret_key': os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production'),
            'jwt_secret': os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-change-in-production'),
            
            # Email configuration
            'mail_server': os.getenv('MAIL_SERVER', 'smtp.gmail.com'),
            'mail_port': int(os.getenv('MAIL_PORT', '587')),
            'mail_use_tls': os.getenv('MAIL_USE_TLS', 'True').lower() == 'true',
            'mail_username': os.getenv('MAIL_USERNAME'),
            'mail_password': os.getenv('MAIL_PASSWORD'),
            
            # AI Services
            'openai_api_key': os.getenv('OPENAI_API_KEY'),
            'replicate_api_token': os.getenv('REPLICATE_API_TOKEN'),
            
            # OAuth
            'google_client_id': os.getenv('GOOGLE_CLIENT_ID'),
            'google_client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
        }

# Global config instance
app_config = Config.get_config() 