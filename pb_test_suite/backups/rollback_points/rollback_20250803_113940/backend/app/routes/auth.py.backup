import os
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models.models import User
import jwt
from datetime import datetime, timedelta, timezone

# Google OAuth imports
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        # Safely get JSON data
        try:
            data = request.get_json()
        except Exception as json_error:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        if not data or not all(k in data for k in ('username', 'email', 'password', 'first_name', 'last_name')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 409
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone', ''),
            address=data.get('address', '')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'address': user.address,
                'is_admin': user.is_admin
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        # Safely get JSON data
        try:
            data = request.get_json()
        except Exception as json_error:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        if not data or not all(k in data for k in ('email', 'password')):
            return jsonify({'error': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.now(timezone.utc) + timedelta(hours=24)
        }, os.environ.get('SECRET_KEY') or 'dev-secret-key', algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_admin
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    try:
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
            
            return jsonify({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone': user.phone,
                    'address': user.address,
                    'is_admin': user.is_admin
                }
            })
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    try:
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
            
            update_data = request.get_json()
            
            # Update allowed fields
            if 'first_name' in update_data:
                user.first_name = update_data['first_name']
            if 'last_name' in update_data:
                user.last_name = update_data['last_name']
            if 'phone' in update_data:
                user.phone = update_data['phone']
            if 'address' in update_data:
                user.address = update_data['address']
            
            db.session.commit()
            
            return jsonify({
                'message': 'Profile updated successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone': user.phone,
                    'address': user.address,
                    'is_admin': user.is_admin
                }
            })
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['PUT'])
def change_password():
    try:
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
            
            password_data = request.get_json()
            
            # Validate required fields
            if not all(k in password_data for k in ('current_password', 'new_password')):
                return jsonify({'error': 'Current password and new password required'}), 400
            
            # Verify current password
            if not user.check_password(password_data['current_password']):
                return jsonify({'error': 'Current password is incorrect'}), 400
            
            # Validate new password
            if len(password_data['new_password']) < 6:
                return jsonify({'error': 'New password must be at least 6 characters'}), 400
            
            # Update password
            user.set_password(password_data['new_password'])
            db.session.commit()
            
            return jsonify({
                'message': 'Password changed successfully'
            })
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user - invalidate token on client side"""
    try:
        # Since we're using JWT, logout is handled client-side by removing the token
        # For server-side token invalidation, we'd need a token blacklist
        return jsonify({'message': 'Successfully logged out'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh JWT token"""
    try:
        # Basic refresh token implementation
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token required for refresh'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, os.environ.get('SECRET_KEY') or 'dev-secret-key', algorithms=['HS256'])
            user = User.query.get(data['user_id'])
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Generate new JWT token
            new_token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.now(timezone.utc) + timedelta(hours=24)
            }, os.environ.get('SECRET_KEY') or 'dev-secret-key', algorithm='HS256')
            
            return jsonify({
                'token': new_token,
                'message': 'Token refreshed successfully'
            })
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired, please login again'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    """Google OAuth authentication endpoint"""
    try:
        data = request.get_json()
        google_token = data.get('token')
        
        if not google_token:
            return jsonify({'error': 'Google token is required'}), 400
        
        # Verify the Google token
        try:
            # Get Google OAuth settings from database
            from app.models.models import SiteSettings
            site_settings = SiteSettings.query.first()
            
            if not site_settings or not site_settings.google_oauth_enabled:
                return jsonify({'error': 'Google OAuth is disabled in site settings.'}), 400
            
            GOOGLE_CLIENT_ID = site_settings.google_oauth_client_id
            
            if not GOOGLE_CLIENT_ID:
                return jsonify({'error': 'Google Client ID not configured in site settings.'}), 500
            
            print(f"🔍 BACKEND - Google OAuth verification using client ID: {GOOGLE_CLIENT_ID}")
            print(f"🔍 BACKEND - Google OAuth enabled: {site_settings.google_oauth_enabled}")
            print(f"🔍 BACKEND - Google OAuth scope: {site_settings.google_oauth_scope}")
            print(f"🔍 BACKEND - Google OAuth redirect URI: {site_settings.google_oauth_redirect_uri}")
            
            # Token'ı doğrula
            idinfo = id_token.verify_oauth2_token(
                google_token, 
                google_requests.Request(), 
                GOOGLE_CLIENT_ID
            )
            
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            
            google_id = idinfo['sub']
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            username = email.split('@')[0]  # Email'den username oluştur
            
        except ValueError as e:
            return jsonify({'error': 'Invalid Google token'}), 400
        
        # Kullanıcıyı bul veya oluştur
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            # Email ile mevcut kullanıcı var mı kontrol et
            existing_user = User.query.filter_by(email=email).first()
            
            if existing_user:
                # Mevcut kullanıcıya Google ID ekle
                existing_user.google_id = google_id
                existing_user.last_login = datetime.now(timezone.utc)
                db.session.commit()
                user = existing_user
            else:
                # Yeni kullanıcı oluştur
                # Username unique olması için kontrol et
                base_username = username
                counter = 1
                while User.query.filter_by(username=username).first():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = User(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    google_id=google_id,
                    password_hash=generate_password_hash('google_oauth_user'),  # Dummy password
                    last_login=datetime.now(timezone.utc),
                    settings={}  # Initialize settings for Google OAuth users
                )
                
                db.session.add(user)
                db.session.commit()
        else:
            # Mevcut Google kullanıcısı - last login güncelle
            user.last_login = datetime.now(timezone.utc)
            db.session.commit()
        
        # JWT token oluştur
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.now(timezone.utc) + timedelta(days=30)
        }, os.environ.get('SECRET_KEY') or 'dev-secret-key', algorithm='HS256')
        
        return jsonify({
            'message': 'Google authentication successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_admin
            }
        }), 200
        
    except Exception as e:
        print(f"Google auth error: {str(e)}")
        return jsonify({'error': 'Google authentication failed'}), 500 