from flask import Blueprint, request, jsonify, send_from_directory, current_app
from app.models.models import User
from app import db
import jwt
import os
from functools import wraps
from werkzeug.utils import secure_filename
import uuid

uploads_bp = Blueprint('uploads', __name__)

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

def allowed_file(filename, file_type):
    ALLOWED_EXTENSIONS = {
        'image': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
        'video': {'mp4', 'mov', 'avi', 'wmv', 'flv'}
    }
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS.get(file_type, set())

def generate_unique_filename(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return f"{uuid.uuid4().hex}.{ext}"

def create_upload_folders():
    """Create upload folders if they don't exist"""
    # Use correct path - one level up from app directory to match serving path
    base_path = os.path.join(os.path.dirname(current_app.root_path), 'uploads')
    folders = ['categories', 'products', 'site', 'videos', 'blog']
    
    for folder in folders:
        folder_path = os.path.join(base_path, folder)
        os.makedirs(folder_path, exist_ok=True)

@uploads_bp.route('/upload/category-image', methods=['POST'])
@admin_required
def upload_category_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, 'image'):
            return jsonify({'error': 'Invalid file type. Only images are allowed.'}), 400
        
        # Create upload folders
        create_upload_folders()
        
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        
        # Save file - use correct path one level up from app
        file_path = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'categories', filename)
        file.save(file_path)
        
        # Return the URL path
        url = f'/uploads/categories/{filename}'
        
        return jsonify({
            'message': 'Category image uploaded successfully',
            'url': url
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/upload/category-background', methods=['POST'])
@admin_required
def upload_category_background():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, 'image'):
            return jsonify({'error': 'Invalid file type. Only images are allowed.'}), 400
        
        # Create upload folders
        create_upload_folders()
        
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        
        # Save file - use correct path one level up from app
        file_path = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'categories', filename)
        file.save(file_path)
        
        # Return the URL path
        url = f'/uploads/categories/{filename}'
        
        return jsonify({
            'message': 'Category background uploaded successfully',
            'url': url
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Product upload routes moved to admin.py for proper admin authorization
# These routes are now available at /api/admin/upload/product-images and /api/admin/upload/product-video

@uploads_bp.route('/delete-file', methods=['POST'])
@admin_required
def delete_file():
    try:
        data = request.get_json()
        
        if not data or 'file_path' not in data:
            return jsonify({'error': 'File path is required'}), 400
        
        file_path = data['file_path']
        
        # Security check: ensure the file is in uploads directory
        if not file_path.startswith('/uploads/'):
            return jsonify({'error': 'Invalid file path'}), 400
        
        # Remove leading slash and construct full path - use correct base path
        relative_path = file_path[1:]  # Remove leading slash
        full_path = os.path.join(os.path.dirname(current_app.root_path), relative_path)
        
        # Check if file exists and delete
        if os.path.exists(full_path):
            os.remove(full_path)
            return jsonify({'message': 'File deleted successfully'})
        else:
            return jsonify({'error': 'File not found'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/upload/blog-image', methods=['POST'])
@admin_required
def upload_blog_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, 'image'):
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, GIF, and WebP are allowed'}), 400
        
        # Create upload folders
        create_upload_folders()
        
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        
        # Save file - use correct path one level up from app
        file_path = os.path.join(os.path.dirname(current_app.root_path), 'uploads', 'blog', filename)
        file.save(file_path)
        
        # Return the URL path
        url = f'/uploads/blog/{filename}'
        
        return jsonify({
            'message': 'Blog image uploaded successfully',
            'url': url
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500 