#!/usr/bin/env python3
"""
Email Template Service for PEBDEQ
Manages both static (standard) and database (custom) email templates
"""

import os
import json
from typing import List, Dict, Optional
from app import db
from app.models.models import EmailTemplate

class TemplateService:
    """Service for managing email templates"""
    
    def __init__(self):
        # Path should be: backend/email_templates
        self.static_templates_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            'email_templates'
        )
    
    def get_static_templates(self) -> List[Dict]:
        """Load all static templates from JSON files"""
        templates = []
        
        if not os.path.exists(self.static_templates_path):
            return templates
        
        for filename in os.listdir(self.static_templates_path):
            if filename.endswith('.json'):
                filepath = os.path.join(self.static_templates_path, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        template_data = json.load(f)
                        template_data['id'] = f"static_{template_data['name']}"
                        template_data['source'] = 'static'
                        template_data['created_at'] = None
                        template_data['updated_at'] = None
                        templates.append(template_data)
                except Exception as e:
                    print(f"Error loading template {filename}: {str(e)}")
        
        return templates
    
    def get_database_templates(self) -> List[Dict]:
        """Get all custom templates from database"""
        templates = []
        
        try:
            db_templates = EmailTemplate.query.all()
            for template in db_templates:
                templates.append({
                    'id': template.id,
                    'name': template.name,
                    'subject': template.subject,
                    'html_content': template.html_content,
                    'text_content': template.text_content,
                    'template_type': template.template_type,
                    'category': 'custom',
                    'description': f"Custom template: {template.name}",
                    'variables': template.variables or [],
                    'is_active': template.is_active,
                    'source': 'database',
                    'created_at': template.created_at.isoformat() if template.created_at else None,
                    'updated_at': template.updated_at.isoformat() if template.updated_at else None
                })
        except Exception as e:
            print(f"Error loading database templates: {str(e)}")
        
        return templates
    
    def get_all_templates(self) -> List[Dict]:
        """Get all templates (static + database)"""
        static_templates = self.get_static_templates()
        database_templates = self.get_database_templates()
        
        # Combine and sort by category (standard first, then custom)
        all_templates = static_templates + database_templates
        all_templates.sort(key=lambda x: (x['category'] != 'standard', x['name']))
        
        return all_templates
    
    def get_template_by_name(self, name: str) -> Optional[Dict]:
        """Get a specific template by name (checks static first, then database)"""
        # Check static templates first
        static_templates = self.get_static_templates()
        for template in static_templates:
            if template['name'] == name:
                return template
        
        # Check database templates
        try:
            db_template = EmailTemplate.query.filter_by(name=name).first()
            if db_template:
                return {
                    'id': db_template.id,
                    'name': db_template.name,
                    'subject': db_template.subject,
                    'html_content': db_template.html_content,
                    'text_content': db_template.text_content,
                    'template_type': db_template.template_type,
                    'category': 'custom',
                    'description': f"Custom template: {db_template.name}",
                    'variables': db_template.variables or [],
                    'is_active': db_template.is_active,
                    'source': 'database',
                    'created_at': db_template.created_at.isoformat() if db_template.created_at else None,
                    'updated_at': db_template.updated_at.isoformat() if db_template.updated_at else None
                }
        except Exception as e:
            print(f"Error getting template {name}: {str(e)}")
        
        return None
    
    def get_template_by_id(self, template_id: str) -> Optional[Dict]:
        """Get a template by ID (handles both static and database IDs)"""
        if str(template_id).startswith('static_'):
            # Static template
            template_name = template_id.replace('static_', '')
            return self.get_template_by_name(template_name)
        else:
            # Database template
            try:
                db_template = EmailTemplate.query.get(int(template_id))
                if db_template:
                    return {
                        'id': db_template.id,
                        'name': db_template.name,
                        'subject': db_template.subject,
                        'html_content': db_template.html_content,
                        'text_content': db_template.text_content,
                        'template_type': db_template.template_type,
                        'category': 'custom',
                        'description': f"Custom template: {db_template.name}",
                        'variables': db_template.variables or [],
                        'is_active': db_template.is_active,
                        'source': 'database',
                        'created_at': db_template.created_at.isoformat() if db_template.created_at else None,
                        'updated_at': db_template.updated_at.isoformat() if db_template.updated_at else None
                    }
            except Exception as e:
                print(f"Error getting template by ID {template_id}: {str(e)}")
        
        return None
    
    def create_custom_template(self, template_data: Dict) -> Optional[Dict]:
        """Create a new custom template in database"""
        try:
            # Check if name already exists (both static and database)
            if self.get_template_by_name(template_data['name']):
                raise ValueError(f"Template with name '{template_data['name']}' already exists")
            
            new_template = EmailTemplate(
                name=template_data['name'],
                subject=template_data['subject'],
                html_content=template_data.get('html_content', ''),
                text_content=template_data.get('text_content', ''),
                template_type=template_data.get('template_type', 'custom'),
                variables=template_data.get('variables', []),
                is_active=template_data.get('is_active', True)
            )
            
            db.session.add(new_template)
            db.session.commit()
            
            return self.get_template_by_id(new_template.id)
        
        except Exception as e:
            db.session.rollback()
            print(f"Error creating custom template: {str(e)}")
            raise e
    
    def update_custom_template(self, template_id: int, template_data: Dict) -> Optional[Dict]:
        """Update a custom template in database"""
        try:
            template = EmailTemplate.query.get(template_id)
            if not template:
                raise ValueError(f"Template with ID {template_id} not found")
            
            # Update fields
            if 'subject' in template_data:
                template.subject = template_data['subject']
            if 'html_content' in template_data:
                template.html_content = template_data['html_content']
            if 'text_content' in template_data:
                template.text_content = template_data['text_content']
            if 'template_type' in template_data:
                template.template_type = template_data['template_type']
            if 'variables' in template_data:
                template.variables = template_data['variables']
            if 'is_active' in template_data:
                template.is_active = template_data['is_active']
            
            db.session.commit()
            return self.get_template_by_id(template_id)
        
        except Exception as e:
            db.session.rollback()
            print(f"Error updating template {template_id}: {str(e)}")
            raise e
    
    def delete_custom_template(self, template_id: int) -> bool:
        """Delete a custom template from database"""
        try:
            template = EmailTemplate.query.get(template_id)
            if not template:
                raise ValueError(f"Template with ID {template_id} not found")
            
            db.session.delete(template)
            db.session.commit()
            return True
        
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting template {template_id}: {str(e)}")
            raise e
    
    def get_template_statistics(self) -> Dict:
        """Get template statistics"""
        static_templates = self.get_static_templates()
        database_templates = self.get_database_templates()
        
        return {
            'total_templates': len(static_templates) + len(database_templates),
            'static_templates': len(static_templates),
            'custom_templates': len(database_templates),
            'active_templates': len([t for t in static_templates + database_templates if t.get('is_active', True)]),
            'template_types': {
                'transactional': len([t for t in static_templates + database_templates if t.get('template_type') == 'transactional']),
                'marketing': len([t for t in static_templates + database_templates if t.get('template_type') == 'marketing']),
                'notification': len([t for t in static_templates + database_templates if t.get('template_type') == 'notification']),
                'custom': len([t for t in static_templates + database_templates if t.get('template_type') == 'custom'])
            }
        }

# Global instance
template_service = TemplateService() 