from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app import db
from app.models.models import (
    EmailQueue, EmailLog, EmailTemplate, EmailSettings, 
    EmailCampaign, EmailSubscriber, User, Order, Invoice
)
from app.utils.decorators import admin_required
from app.utils.email_service import get_email_service
from app.utils.template_service import template_service

emails_bp = Blueprint('emails', __name__)

# Email Templates Management
@emails_bp.route('/admin/email/templates', methods=['GET'])
@admin_required
def get_email_templates():
    """Get all email templates (static + database)"""
    try:
        templates = template_service.get_all_templates()
        return jsonify(templates)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emails_bp.route('/admin/email/templates', methods=['POST'])
@admin_required
def create_email_template():
    """Create new custom email template"""
    try:
        data = request.get_json()
        new_template = template_service.create_custom_template(data)
        return jsonify({
            'message': 'Custom template created successfully', 
            'template': new_template
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emails_bp.route('/admin/email/templates/<int:template_id>', methods=['PUT'])
@admin_required
def update_email_template(template_id):
    """Update custom email template"""
    try:
        updated_template = template_service.update_custom_template(template_id, request.get_json())
        return jsonify({
            'message': 'Template updated successfully',
            'template': updated_template
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emails_bp.route('/admin/email/templates/<int:template_id>', methods=['DELETE'])
@admin_required
def delete_email_template(template_id):
    """Delete custom email template"""
    try:
        success = template_service.delete_custom_template(template_id)
        if success:
            return jsonify({'message': 'Template deleted successfully'})
        else:
            return jsonify({'error': 'Failed to delete template'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emails_bp.route('/admin/email/templates/<template_id>', methods=['GET'])
@admin_required
def get_email_template(template_id):
    """Get specific email template with full content (supports both static and database IDs)"""
    try:
        template = template_service.get_template_by_id(template_id)
        if not template:
            return jsonify({'error': 'Template not found'}), 404
        return jsonify(template)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Email Queue Management
@emails_bp.route('/admin/email/queue', methods=['GET'])
@admin_required
def get_email_queue():
    """Get email queue status"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '')
        
        query = EmailQueue.query
        if status:
            query = query.filter_by(status=status)
        
        queue_items = query.order_by(EmailQueue.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'queue_items': [{
                'id': item.id,
                'recipient_email': item.recipient_email,
                'subject': item.subject,
                'status': item.status,
                'priority': item.priority,
                'created_at': item.created_at.isoformat()
            } for item in queue_items.items],
            'total': queue_items.total,
            'pages': queue_items.pages,
            'current_page': page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emails_bp.route('/admin/email/queue/stats', methods=['GET'])
@admin_required
def get_queue_stats():
    """Get email queue statistics"""
    try:
        stats = {
            'pending': EmailQueue.query.filter_by(status='pending').count(),
            'processing': EmailQueue.query.filter_by(status='processing').count(),
            'sent': EmailQueue.query.filter_by(status='sent').count(),
            'failed': EmailQueue.query.filter_by(status='failed').count(),
            'total': EmailQueue.query.count()
        }
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emails_bp.route('/admin/email/queue/process', methods=['POST'])
@admin_required
def process_email_queue():
    """Process email queue manually"""
    try:
        data = request.get_json() or {}
        batch_size = data.get('batch_size', 10)
        
        results = get_email_service().process_email_queue(batch_size)
        success_count = sum(1 for r in results if r['success'])
        failed_count = len(results) - success_count
        
        return jsonify({
            'message': 'Queue processing completed',
            'processed': len(results),
            'success': success_count,
            'failed': failed_count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Email Sending
@emails_bp.route('/admin/email/send', methods=['POST'])
@admin_required
def send_email():
    """Send email immediately"""
    try:
        data = request.get_json()
        
        success, result = get_email_service().send_email(
            recipient_email=data['recipient_email'],
            subject=data['subject'],
            html_content=data.get('html_content', ''),
            text_content=data.get('text_content', ''),
            template_name=data.get('template_name'),
            template_variables=data.get('template_variables', {}),
            priority=5 if data.get('priority', 'normal') == 'normal' else 1
        )
        
        if success:
            return jsonify({'message': 'Email sent successfully', 'email_id': result})
        else:
            return jsonify({'error': result}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emails_bp.route('/admin/email/send/welcome/<int:user_id>', methods=['POST'])
@admin_required
def send_welcome_email(user_id):
    """Send welcome email to user"""
    try:
        success, result = get_email_service().send_welcome_email(user_id)
        if success:
            return jsonify({'message': 'Welcome email sent successfully'})
        else:
            return jsonify({'error': result}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emails_bp.route('/admin/email/send/order/<int:order_id>', methods=['POST'])
@admin_required
def send_order_email(order_id):
    """Send order-related email with template selection"""
    try:
        data = request.get_json() or {}
        template_type = data.get('template_type', 'order_confirmation')
        subject = data.get('subject', '')
        custom_message = data.get('custom_message', '')
        
        # Get order details
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Get user details
        user = User.query.get(order.user_id) if order.user_id else None
        
        # Prepare template variables
        template_variables = {
            'user_name': user.first_name if user else 'Customer',
            'order_id': order.id,
            'order_total': f"${order.total_amount:.2f}",
            'order_subtotal': f"{order.subtotal:.2f}",
            'shipping_cost': f"{order.shipping_cost:.2f}",
            'tax_amount': f"{order.tax_amount:.2f}",
            'order_date': order.created_at.strftime('%B %d, %Y'),
            'order_status': order.status.title(),
            'payment_status': order.payment_status.title(),
            'payment_method': order.payment_method.title() if order.payment_method else 'N/A',
            'payment_date': datetime.utcnow().strftime('%B %d, %Y'),
            'tracking_number': 'Will be provided soon',
            'estimated_delivery': 'Within 3-5 business days',
            'tracking_url': f'http://localhost:3000/orders/{order.id}',
            'custom_message': custom_message
        }
        
        # If order_confirmation, add order_items_html and order_items_text
        if template_type == 'order_confirmation':
            order_items_html = ""
            order_items_text = ""
            def get_category_emoji(product):
                if not product or not product.category:
                    return '📦'
                category_name = product.category.name.lower()
                category_emojis = {
                    '3d printing': '🖨️',
                    'vintage tools': '🔧',
                    'antique bulbs': '💡',
                    'laser engraving': '⚡',
                    'smart gadgets': '📱',
                    'miniatures': '🏰',
                    'custom': '⚙️',
                    'electronics': '🔌',
                    'gaming': '🎮',
                    'hobby': '🎨',
                    'tools': '🔧',
                    'accessories': '💎',
                    'parts': '⚙️'
                }
                for key, emoji in category_emojis.items():
                    if key in category_name:
                        return emoji
                return '📦'
            for item in order.order_items:
                product_emoji = get_category_emoji(item.product)
                product_name_safe = item.product_name or (item.product.name if item.product else 'Unknown Product')
                subtotal = item.quantity * item.price
                
                # Try to get product image - use external URL for better email client compatibility
                product_image_html = ''
                if item.product and item.product.images:
                    # Use external URL - works better with email clients
                    image_url = f'http://localhost:5005{item.product.images[0]}'
                    product_image_html = f'''
                    <div class="product-image">
                        <img src="{image_url}" alt="{product_name_safe}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 8px; border: 2px solid #e9ecef;" />
                    </div>'''
                else:
                    # Use emoji placeholder when no product image
                    product_image_html = f'''
                    <div class="product-placeholder" style="width: 90px; height: 90px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-right: 20px; font-size: 36px; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
                        {product_emoji}
                    </div>'''
                
                order_items_html += f'''
                <div class="product-item" style="display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #e0e0e0; margin-bottom: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    {product_image_html}
                    <div class="product-details" style="flex: 1; margin-left: 15px;">
                        <div class="product-name" style="font-weight: bold; color: #2c3e50; margin: 0 0 8px 0; font-size: 18px;">{product_name_safe}</div>
                        <div class="product-badges" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                            <span class="badge badge-qty" style="background: #e3f2fd; color: #1976d2; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                                Qty: {item.quantity}
                            </span>
                            <span class="badge badge-price" style="background: #f3e5f5; color: #7b1fa2; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                                Price: ${item.price:.2f}
                            </span>
                            <span class="badge badge-total" style="background: #e8f5e8; color: #388e3c; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                                Total: ${subtotal:.2f}
                            </span>
                        </div>
                    </div>
                </div>
                '''
            for item in order.order_items:
                product_name_safe = item.product_name or (item.product.name if item.product else 'Unknown Product')
                subtotal = item.quantity * item.price
                order_items_text += f"• {product_name_safe}\n  Quantity: {item.quantity} x ${item.price:.2f} = ${subtotal:.2f}\n\n"
            template_variables['order_items_html'] = order_items_html
            template_variables['order_items_text'] = order_items_text
        
        # Determine template name and default subject
        template_name = None
        if not subject:
            if template_type == 'order_confirmation':
                template_name = 'order_confirmation'
                subject = f'Order Confirmation #{order.id}'
            elif template_type == 'shipping_notification':
                template_name = 'shipping_notification'
                subject = f'Your Order #{order.id} Has Shipped!'
            elif template_type == 'payment_confirmation':
                template_name = 'payment_confirmation'
                subject = f'Payment Confirmed for Order #{order.id}'
            elif template_type == 'order_update':
                template_name = 'order_status_update'
                subject = f'Order #{order.id} - Status Update'
            else:
                subject = f'Order #{order.id} - Update from PEBDEQ'
        
        # For custom messages or when no template exists, create HTML content
        if template_type == 'custom' or not template_name:
            html_content = f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hello {template_variables["user_name"]},</h2>
                <p>This is an update regarding your Order #{order.id}.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
                    <h3>Order Details</h3>
                    <p><strong>Order ID:</strong> #{order.id}</p>
                    <p><strong>Order Date:</strong> {template_variables["order_date"]}</p>
                    <p><strong>Total Amount:</strong> {template_variables["order_total"]}</p>
                    <p><strong>Status:</strong> {template_variables["order_status"]}</p>
                    <p><strong>Payment Status:</strong> {template_variables["payment_status"]}</p>
                </div>
                
                {f'<div style="background-color: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0;"><h4>Personal Message:</h4><p>{custom_message}</p></div>' if custom_message else ''}
                
                <p>You can track your order <a href="{template_variables["tracking_url"]}">here</a>.</p>
                
                <p>Thank you for choosing PEBDEQ!</p>
                <p>Best regards,<br>PEBDEQ Team</p>
            </div>
            '''
            
            success, result = get_email_service().send_email(
                recipient_email=order.user.email if order.user else None,
                subject=subject,
                html_content=html_content,
                email_type='order',
                user_id=order.user_id,
                order_id=order.id,
                priority=2
            )
        else:
            # Use template
            success, result = get_email_service().send_email(
                recipient_email=order.user.email if order.user else None,
                subject=subject,
                template_name=template_name,
                template_variables=template_variables,
                email_type='order',
                user_id=order.user_id,
                order_id=order.id,
                priority=2
            )
        
        if success:
            return jsonify({
                'message': f'{template_type.replace("_", " ").title()} email sent successfully',
                'recipient': order.user.email if order.user else None,
                'template_type': template_type
            })
        else:
            return jsonify({'error': result}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Email Settings Management
@emails_bp.route('/admin/email/settings', methods=['GET'])
@admin_required
def get_email_settings():
    """Get email settings"""
    try:
        settings = EmailSettings.query.first()
        if not settings:
            settings = EmailSettings(
                smtp_server='smtp.gmail.com',
                smtp_port=587,
                smtp_username='',
                smtp_password='',
                smtp_use_tls=True,
                smtp_use_ssl=False,
                from_name='PEBDEQ Store',
                from_email='noreply@pebdeq.com',
                reply_to_email='support@pebdeq.com'
            )
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            'id': settings.id,
            'smtp_server': settings.smtp_server,
            'smtp_port': settings.smtp_port,
            'smtp_username': settings.smtp_username,
            'smtp_password_set': bool(settings.smtp_password),  # Whether password is set
            'smtp_use_tls': settings.smtp_use_tls,
            'smtp_use_ssl': settings.smtp_use_ssl,
            'from_name': settings.from_name,
            'from_email': settings.from_email,
            'reply_to_email': settings.reply_to_email,
            'bounce_email': settings.bounce_email,
            'daily_limit': settings.daily_limit,
            'hourly_limit': settings.hourly_limit,
            'is_enabled': settings.is_enabled,
            'test_mode': settings.test_mode,
            # Auto-send notification settings
            'auto_send_welcome': settings.auto_send_welcome,
            'auto_send_order_confirmation': settings.auto_send_order_confirmation,
            'auto_send_payment_confirmation': settings.auto_send_payment_confirmation,
            'auto_send_shipping_notification': settings.auto_send_shipping_notification,
            'auto_send_order_status_update': settings.auto_send_order_status_update,
            'auto_send_invoice': settings.auto_send_invoice,
            'auto_send_newsletter': settings.auto_send_newsletter
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@emails_bp.route('/admin/email/settings', methods=['PUT'])
@admin_required
def update_email_settings():
    """Update email settings"""
    try:
        data = request.get_json()
        settings = EmailSettings.query.first()
        
        if not settings:
            settings = EmailSettings()
            db.session.add(settings)
        
        settings.smtp_server = data.get('smtp_server', settings.smtp_server)
        settings.smtp_port = data.get('smtp_port', settings.smtp_port)
        settings.smtp_username = data.get('smtp_username', settings.smtp_username)
        if data.get('smtp_password'):
            settings.smtp_password = data['smtp_password']
        settings.smtp_use_tls = data.get('smtp_use_tls', settings.smtp_use_tls)
        settings.smtp_use_ssl = data.get('smtp_use_ssl', settings.smtp_use_ssl)
        settings.from_name = data.get('from_name', settings.from_name)
        settings.from_email = data.get('from_email', settings.from_email)
        settings.reply_to_email = data.get('reply_to_email', settings.reply_to_email)
        settings.bounce_email = data.get('bounce_email', settings.bounce_email)
        settings.daily_limit = data.get('daily_limit', settings.daily_limit)
        settings.hourly_limit = data.get('hourly_limit', settings.hourly_limit)
        settings.is_enabled = data.get('is_enabled', settings.is_enabled)
        settings.test_mode = data.get('test_mode', settings.test_mode)
        
        # Update auto-send notification settings
        settings.auto_send_welcome = data.get('auto_send_welcome', settings.auto_send_welcome)
        settings.auto_send_order_confirmation = data.get('auto_send_order_confirmation', settings.auto_send_order_confirmation)
        settings.auto_send_payment_confirmation = data.get('auto_send_payment_confirmation', settings.auto_send_payment_confirmation)
        settings.auto_send_shipping_notification = data.get('auto_send_shipping_notification', settings.auto_send_shipping_notification)
        settings.auto_send_order_status_update = data.get('auto_send_order_status_update', settings.auto_send_order_status_update)
        settings.auto_send_invoice = data.get('auto_send_invoice', settings.auto_send_invoice)
        settings.auto_send_newsletter = data.get('auto_send_newsletter', settings.auto_send_newsletter)
        
        settings.updated_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify({'message': 'Email settings updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@emails_bp.route('/admin/email/test', methods=['POST'])
@admin_required
def send_test_email():
    """Send a test email"""
    try:
        print(f"🔍 Test email request received")
        
        data = request.get_json()
        print(f"🔍 Request data: {data}")
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        recipient_email = data.get('recipient_email')
        subject = data.get('subject', 'Test Email from PEBDEQ')
        html_content = data.get('html_content', '<h1>Test Email</h1><p>This is a test email from PEBDEQ email system.</p>')
        
        print(f"🔍 Recipient: {recipient_email}")
        print(f"🔍 Subject: {subject}")
        
        if not recipient_email:
            return jsonify({'error': 'Recipient email is required'}), 400
        
        # Check email settings first
        email_settings = EmailSettings.query.first()
        if not email_settings:
            return jsonify({'error': 'Email settings not configured'}), 500
            
        if not email_settings.is_enabled:
            return jsonify({'error': 'Email system is disabled'}), 500
        
        print(f"🔍 Email settings check passed")
        
        # Get email service
        email_service = get_email_service()
        print(f"🔍 Email service instance created")
        
        # Send test email
        success, result = email_service.send_email(
            recipient_email=recipient_email,
            subject=subject,
            html_content=html_content,
            email_type='test',
            priority=1
        )
        
        print(f"🔍 Email send result: success={success}, result={result}")
        
        if success:
            return jsonify({
                'message': 'Test email sent successfully',
                'email_queue_id': result
            })
        else:
            return jsonify({'error': f'Failed to send test email: {result}'}), 500
            
    except Exception as e:
        print(f"❌ Error in send_test_email: {str(e)}")
        return jsonify({'error': str(e)}), 500


# Newsletter Management
@emails_bp.route('/newsletter/subscribe', methods=['POST'])
def subscribe_to_newsletter():
    """Subscribe to newsletter"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        existing = EmailSubscriber.query.filter_by(email=email).first()
        if existing:
            if existing.is_active:
                return jsonify({'message': 'Already subscribed'})
            else:
                existing.is_active = True
                existing.subscribed_at = datetime.utcnow()
                db.session.commit()
                return jsonify({'message': 'Subscription reactivated'})
        
        subscriber = EmailSubscriber(
            email=email,
            name=name,
            source='website'
        )
        db.session.add(subscriber)
        db.session.commit()
        
        return jsonify({'message': 'Successfully subscribed to newsletter'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Email Analytics
@emails_bp.route('/admin/email/analytics', methods=['GET'])
@admin_required
def get_email_analytics():
    """Get email analytics and statistics"""
    try:
        # Get template statistics from template service
        template_stats = template_service.get_template_statistics()
        
        # Get email queue stats
        queue_pending = EmailQueue.query.filter_by(status='pending').count()
        queue_sent = EmailQueue.query.filter_by(status='sent').count()
        queue_failed = EmailQueue.query.filter_by(status='failed').count()
        
        # Calculate basic stats (mock data for now)
        analytics = {
            'summary': {
                'total_sent': queue_sent,
                'total_opened': int(queue_sent * 0.25),  # Mock 25% open rate
                'open_rate': 25,
                'click_rate': 8,
                'total_templates': template_stats['total_templates'],
                'static_templates': template_stats['static_templates'],
                'custom_templates': template_stats['custom_templates'],
                'active_templates': template_stats['active_templates'],
                'queue_pending': queue_pending,
                'queue_failed': queue_failed
            },
            'email_types': [
                {'type': 'transactional', 'count': template_stats['template_types']['transactional']},
                {'type': 'marketing', 'count': template_stats['template_types']['marketing']},
                {'type': 'notification', 'count': template_stats['template_types']['notification']},
                {'type': 'custom', 'count': template_stats['template_types']['custom']}
            ],
            'recent_activity': [
                {
                    'date': (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d'),
                    'sent': max(0, 10 - i),
                    'opened': max(0, 5 - i)
                } for i in range(7)
            ],
            'template_breakdown': {
                'standard_vs_custom': {
                    'standard': template_stats['static_templates'],
                    'custom': template_stats['custom_templates']
                }
            }
        }
        
        return jsonify(analytics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500 