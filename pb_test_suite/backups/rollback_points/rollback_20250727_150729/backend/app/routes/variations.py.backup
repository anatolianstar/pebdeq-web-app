from flask import Blueprint, request, jsonify
from app.models.models import VariationType, VariationOption, User
from app import db
import jwt
import os
from functools import wraps

variations_bp = Blueprint('variations', __name__)

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

@variations_bp.route('/variation-types', methods=['GET'])
@admin_required
def get_variation_types():
    try:
        variation_types = VariationType.query.all()
        
        return jsonify({
            'variation_types': [{
                'id': vt.id,
                'name': vt.name,
                'display_name': vt.display_name,
                'description': vt.description,
                'is_active': vt.is_active,
                'created_at': vt.created_at.isoformat(),
                'updated_at': vt.updated_at.isoformat()
            } for vt in variation_types]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@variations_bp.route('/variation-types', methods=['POST'])
@admin_required
def create_variation_type():
    try:
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Variation type name is required'}), 400
        
        # Check if variation type with same name already exists
        existing_type = VariationType.query.filter_by(name=data['name']).first()
        if existing_type:
            return jsonify({'error': 'Variation type with this name already exists'}), 400
        
        variation_type = VariationType(
            name=data['name'],
            display_name=data.get('display_name', ''),
            description=data.get('description', ''),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(variation_type)
        db.session.commit()
        
        return jsonify({'message': 'Variation type created successfully'}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@variations_bp.route('/variation-types/<int:variation_type_id>', methods=['PUT'])
@admin_required
def update_variation_type(variation_type_id):
    try:
        variation_type = VariationType.query.get_or_404(variation_type_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check if name is being changed and if new name already exists
        if 'name' in data and data['name'] != variation_type.name:
            existing_type = VariationType.query.filter_by(name=data['name']).first()
            if existing_type:
                return jsonify({'error': 'Variation type with this name already exists'}), 400
        
        # Update fields
        if 'name' in data:
            variation_type.name = data['name']
        if 'display_name' in data:
            variation_type.display_name = data['display_name']
        if 'description' in data:
            variation_type.description = data['description']
        if 'is_active' in data:
            variation_type.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({'message': 'Variation type updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@variations_bp.route('/variation-types/<int:variation_type_id>', methods=['DELETE'])
@admin_required
def delete_variation_type(variation_type_id):
    try:
        variation_type = VariationType.query.get_or_404(variation_type_id)
        
        # Check if variation type has options
        option_count = VariationOption.query.filter_by(variation_type_id=variation_type_id).count()
        if option_count > 0:
            return jsonify({
                'error': f'Cannot delete variation type. It has {option_count} options. Please delete options first.'
            }), 400
        
        db.session.delete(variation_type)
        db.session.commit()
        
        return jsonify({'message': 'Variation type deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@variations_bp.route('/variation-options', methods=['GET'])
@admin_required
def get_variation_options():
    try:
        variation_type_id = request.args.get('variation_type_id', type=int)
        
        query = VariationOption.query
        if variation_type_id:
            query = query.filter_by(variation_type_id=variation_type_id)
        
        variation_options = query.all()
        
        return jsonify({
            'variation_options': [{
                'id': vo.id,
                'variation_type_id': vo.variation_type_id,
                'variation_type_name': vo.variation_type.name,
                'name': vo.name,
                'display_name': vo.display_name,
                'value': vo.value,
                'is_active': vo.is_active,
                'created_at': vo.created_at.isoformat(),
                'updated_at': vo.updated_at.isoformat()
            } for vo in variation_options]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@variations_bp.route('/variation-options', methods=['POST'])
@admin_required
def create_variation_option():
    try:
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('variation_type_id'):
            return jsonify({'error': 'Option name and variation type ID are required'}), 400
        
        # Check if variation type exists
        variation_type = VariationType.query.get(data['variation_type_id'])
        if not variation_type:
            return jsonify({'error': 'Variation type not found'}), 404
        
        # Check if option with same name already exists for this variation type
        existing_option = VariationOption.query.filter_by(
            variation_type_id=data['variation_type_id'],
            name=data['name']
        ).first()
        if existing_option:
            return jsonify({'error': 'Option with this name already exists for this variation type'}), 400
        
        variation_option = VariationOption(
            variation_type_id=data['variation_type_id'],
            name=data['name'],
            display_name=data.get('display_name', ''),
            value=data.get('value', ''),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(variation_option)
        db.session.commit()
        
        return jsonify({'message': 'Variation option created successfully'}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@variations_bp.route('/variation-options/<int:variation_option_id>', methods=['PUT'])
@admin_required
def update_variation_option(variation_option_id):
    try:
        variation_option = VariationOption.query.get_or_404(variation_option_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check if name is being changed and if new name already exists
        if 'name' in data and data['name'] != variation_option.name:
            existing_option = VariationOption.query.filter_by(
                variation_type_id=variation_option.variation_type_id,
                name=data['name']
            ).first()
            if existing_option:
                return jsonify({'error': 'Option with this name already exists for this variation type'}), 400
        
        # Update fields
        if 'name' in data:
            variation_option.name = data['name']
        if 'display_name' in data:
            variation_option.display_name = data['display_name']
        if 'value' in data:
            variation_option.value = data['value']
        if 'is_active' in data:
            variation_option.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({'message': 'Variation option updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@variations_bp.route('/variation-options/<int:variation_option_id>', methods=['DELETE'])
@admin_required
def delete_variation_option(variation_option_id):
    try:
        variation_option = VariationOption.query.get_or_404(variation_option_id)
        
        db.session.delete(variation_option)
        db.session.commit()
        
        return jsonify({'message': 'Variation option deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 