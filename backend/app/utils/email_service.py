import os
import smtplib
import uuid
import base64
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from flask import current_app, render_template_string
from app import db
from app.models.models import (
    EmailQueue, EmailLog, EmailTemplate, EmailSettings, 
    EmailSubscriber, User, Order, Invoice
)

class EmailService:
    """Comprehensive email service for PEBDEQ platform"""
    
    def __init__(self):
        """Initialize email service"""
        self.email_settings = None
    
    def _get_email_settings(self):
        """Get current email settings from database"""
        settings = EmailSettings.query.first()
        if not settings:
            # Create default settings
            settings = EmailSettings()
            db.session.add(settings)
            db.session.commit()
        return settings
    
    def _encode_image_to_base64(self, image_path):
        """Encode image file to base64 data URL for embedding in emails"""
        try:
            # Get project root directory (pb/)
            # From backend/app/utils/email_service.py -> go up 3 levels to get to pb/
            current_file = os.path.abspath(__file__)  # backend/app/utils/email_service.py
            utils_dir = os.path.dirname(current_file)  # backend/app/utils/
            app_dir = os.path.dirname(utils_dir)      # backend/app/
            backend_dir = os.path.dirname(app_dir)    # backend/
            project_root = os.path.dirname(backend_dir)  # pb/
            
            # Clean up the image path - images are in pb/uploads/
            if image_path.startswith('/uploads/'):
                clean_path = image_path[1:]  # Remove leading slash: uploads/products/...
            elif image_path.startswith('/'):
                clean_path = image_path[1:]  # Remove leading slash
            else:
                clean_path = image_path
            
            # Construct full path - images should be in project root uploads/
            full_path = os.path.join(project_root, clean_path)
            
            # Check if file exists
            if not os.path.exists(full_path):
                return None
            
            # Read and encode image
            with open(full_path, 'rb') as image_file:
                image_data = image_file.read()
                encoded_string = base64.b64encode(image_data).decode('utf-8')
                
                # Determine MIME type based on file extension
                file_ext = os.path.splitext(full_path)[1].lower()
                mime_types = {
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.webp': 'image/webp'
                }
                mime_type = mime_types.get(file_ext, 'image/png')
                
                return f"data:{mime_type};base64,{encoded_string}"
        except Exception as e:
            print(f"❌ Error encoding image {image_path}: {str(e)}")
            return None
    
    def send_email(self, 
                   recipient_email, 
                   subject, 
                   template_name=None, 
                   template_variables=None, 
                   html_content=None, 
                   text_content=None,
                   email_type='transactional',
                   priority=5,
                   user_id=None,
                   order_id=None,
                   invoice_id=None,
                   attachments=None):
        """
        Add email to queue for sending
        
        Args:
            recipient_email: Email address of recipient
            subject: Email subject
            template_name: Name of email template to use
            template_variables: Variables to fill in template
            html_content: Direct HTML content (if not using template)
            text_content: Direct text content (if not using template)
            email_type: Type of email ('marketing', 'order', 'invoice', 'shipping', 'transactional')
            priority: Priority level (1=highest, 10=lowest)
            user_id: Associated user ID
            order_id: Associated order ID
            invoice_id: Associated invoice ID
            attachments: List of file paths to attach
        """
        try:
            # Generate tracking ID
            tracking_id = str(uuid.uuid4())
            
            # Get template if specified
            if template_name:
                template = EmailTemplate.query.filter_by(
                    name=template_name, 
                    is_active=True
                ).first()
                
                if template:
                    html_content = self._render_template(template.html_content, template_variables or {})
                    text_content = self._render_template(template.text_content or '', template_variables or {})
                    if not subject:
                        subject = self._render_template(template.subject, template_variables or {})
            
            # Create email queue entry
            email_queue = EmailQueue(
                recipient_email=recipient_email,
                recipient_name=template_variables.get('user_name') if template_variables else None,
                subject=subject,
                html_content=html_content or '',
                text_content=text_content or '',
                email_type=email_type,
                priority=priority,
                template_variables=template_variables,
                user_id=user_id,
                order_id=order_id,
                invoice_id=invoice_id
            )
            
            db.session.add(email_queue)
            db.session.commit()
            
            # If immediate sending is enabled, send now
            settings = self._get_email_settings()
            if settings.is_enabled and not settings.test_mode:
                return self._send_queued_email(email_queue.id)
            
            return True, email_queue.id
            
        except Exception as e:
            print(f"❌ Error queuing email: {str(e)}")
            return False, str(e)
    
    def _render_template(self, template_content, variables):
        """Render template with variables"""
        if not template_content:
            return ''
        
        try:
            # Simple template rendering (can be enhanced with Jinja2)
            for key, value in variables.items():
                placeholder = f'{{{{{key}}}}}'
                template_content = template_content.replace(placeholder, str(value))
            
            return template_content
        except Exception as e:
            print(f"❌ Template rendering error: {str(e)}")
            return template_content
    
    def _send_queued_email(self, queue_id):
        """Send a specific queued email"""
        try:
            email_queue = EmailQueue.query.get(queue_id)
            if not email_queue:
                return False, "Email not found in queue"
            
            if email_queue.status != 'pending':
                return False, f"Email already processed with status: {email_queue.status}"
            
            # Get fresh settings
            settings = self._get_email_settings()
            
            # Check rate limits
            if not self._check_rate_limits():
                return False, "Rate limit exceeded"
            
            # Create SMTP connection
            if settings.smtp_use_ssl:
                server = smtplib.SMTP_SSL(settings.smtp_server, settings.smtp_port)
            else:
                server = smtplib.SMTP(settings.smtp_server, settings.smtp_port)
                if settings.smtp_use_tls:
                    server.starttls()
            
            # Login to SMTP server
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{settings.from_name} <{settings.from_email}>"
            msg['To'] = email_queue.recipient_email
            msg['Subject'] = email_queue.subject
            
            if settings.reply_to_email:
                msg['Reply-To'] = settings.reply_to_email
            
            # Add text and HTML parts
            if email_queue.text_content:
                text_part = MIMEText(email_queue.text_content, 'plain')
                msg.attach(text_part)
            
            if email_queue.html_content:
                # Add tracking pixel for opens
                tracking_id = str(uuid.uuid4())
                tracking_pixel = f'<img src="http://localhost:5005/api/email/track/{tracking_id}" width="1" height="1" style="display:none;">'
                html_content_with_tracking = email_queue.html_content + tracking_pixel
                
                html_part = MIMEText(html_content_with_tracking, 'html')
                msg.attach(html_part)
            
            # Send email
            server.send_message(msg)
            server.quit()
            
            # Update queue status
            email_queue.status = 'sent'
            email_queue.sent_at = datetime.utcnow()
            
            # Create email log
            email_log = EmailLog(
                email_queue_id=email_queue.id,
                recipient_email=email_queue.recipient_email,
                subject=email_queue.subject,
                email_type=email_queue.email_type,
                status='sent',
                tracking_id=tracking_id if email_queue.html_content else None,
                user_id=email_queue.user_id,
                order_id=email_queue.order_id,
                invoice_id=email_queue.invoice_id
            )
            
            db.session.add(email_log)
            db.session.commit()
            
            print(f"✅ Email sent successfully to {email_queue.recipient_email}")
            return True, "Email sent successfully"
            
        except Exception as e:
            # Update queue with error
            if 'email_queue' in locals():
                email_queue.status = 'failed'
                email_queue.failed_at = datetime.utcnow()
                email_queue.error_message = str(e)
                email_queue.retry_count += 1
                db.session.commit()
            
            print(f"❌ Error sending email: {str(e)}")
            return False, str(e)
    
    def _check_rate_limits(self):
        """Check if we're within rate limits"""
        settings = self._get_email_settings()
        now = datetime.utcnow()
        
        # Check hourly limit
        hour_ago = now - timedelta(hours=1)
        hourly_count = EmailLog.query.filter(
            EmailLog.created_at >= hour_ago,
            EmailLog.status == 'sent'
        ).count()
        
        if hourly_count >= settings.hourly_limit:
            return False
        
        # Check daily limit
        day_ago = now - timedelta(days=1)
        daily_count = EmailLog.query.filter(
            EmailLog.created_at >= day_ago,
            EmailLog.status == 'sent'
        ).count()
        
        if daily_count >= settings.daily_limit:
            return False
        
        return True
    
    def process_email_queue(self, batch_size=10):
        """Process pending emails in queue"""
        try:
            pending_emails = EmailQueue.query.filter_by(
                status='pending'
            ).filter(
                EmailQueue.scheduled_at.is_(None) | (EmailQueue.scheduled_at <= datetime.utcnow())
            ).order_by(
                EmailQueue.priority.asc(),
                EmailQueue.created_at.asc()
            ).limit(batch_size).all()
            
            results = []
            for email in pending_emails:
                success, message = self._send_queued_email(email.id)
                results.append({
                    'id': email.id,
                    'recipient': email.recipient_email,
                    'success': success,
                    'message': message
                })
            
            return results
            
        except Exception as e:
            print(f"❌ Error processing email queue: {str(e)}")
            return []

    # Email Templates for Common Use Cases
    
    def send_welcome_email(self, user_id):
        """Send welcome email to new user"""
        user = User.query.get(user_id)
        if not user:
            return False, "User not found"
        
        variables = {
            'user_name': user.first_name,
            'user_email': user.email,
            'site_name': 'PEBDEQ',
            'login_url': 'http://localhost:3000/login'
        }
        
        return self.send_email(
            recipient_email=user.email,
            subject='Welcome to PEBDEQ!',
            template_name='welcome',
            template_variables=variables,
            email_type='transactional',
            user_id=user.id
        )
    
    def send_order_confirmation(self, order_id):
        """Send order confirmation email"""
        order = Order.query.get(order_id)
        if not order:
            return False, "Order not found"
        
        user = User.query.get(order.user_id)
        
        # Format order items as HTML string for email template
        order_items_html = ""
        
        # Category to emoji mapping for better visual representation
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
            
            # Check for partial matches
            for key, emoji in category_emojis.items():
                if key in category_name:
                    return emoji
            
            return '📦'  # Default fallback
        
        for item in order.order_items:
            # Get category-appropriate emoji and try to get real product image
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
        
        # Also create text version for order items
        order_items_text = ""
        for item in order.order_items:
            product_name_safe = item.product_name or (item.product.name if item.product else 'Unknown Product')
            subtotal = item.quantity * item.price
            order_items_text += f"• {product_name_safe}\n  Quantity: {item.quantity} x ${item.price:.2f} = ${subtotal:.2f}\n\n"
        
        variables = {
            'user_name': user.first_name if user else 'Customer',
            'order_id': order.id,
            'order_total': f"${order.total_amount:.2f}",
            'order_subtotal': f"{order.subtotal:.2f}",
            'shipping_cost': f"{order.shipping_cost:.2f}",
            'tax_amount': f"{order.tax_amount:.2f}",
            'order_date': order.created_at.strftime('%B %d, %Y'),
            'order_status': order.status.title(),
            'tracking_url': f'http://localhost:3000/orders/{order.id}',
            'order_items_html': order_items_html,
            'order_items_text': order_items_text,
            'site_url': 'http://localhost:5005'
        }
        
        return self.send_email(
            recipient_email=order.user.email if order.user else None,
            subject=f'Order Confirmation #{order.id}',
            template_name='order_confirmation',
            template_variables=variables,
            email_type='order',
            user_id=order.user_id,
            order_id=order.id
        )
    
    def send_invoice_email(self, invoice_id):
        """Send invoice email"""
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return False, "Invoice not found"
        
        variables = {
            'customer_name': invoice.customer_name,
            'invoice_number': invoice.invoice_number,
            'invoice_total': f"${invoice.total_amount:.2f}",
            'invoice_date': invoice.invoice_date.strftime('%B %d, %Y'),
            'due_date': invoice.due_date.strftime('%B %d, %Y') if invoice.due_date else 'Upon receipt',
            'payment_status': invoice.payment_status.title(),
            'company_name': invoice.company_name
        }
        
        return self.send_email(
            recipient_email=invoice.customer_email,
            subject=f'Invoice {invoice.invoice_number}',
            template_name='invoice',
            template_variables=variables,
            email_type='invoice',
            user_id=invoice.user_id,
            invoice_id=invoice.id
        )
    
    def send_shipping_notification(self, order_id, tracking_number=None):
        """Send shipping notification email"""
        order = Order.query.get(order_id)
        if not order:
            return False, "Order not found"
        
        user = User.query.get(order.user_id)
        variables = {
            'user_name': user.first_name if user else 'Customer',
            'order_id': order.id,
            'tracking_number': tracking_number or 'Will be provided soon',
            'estimated_delivery': 'Within 3-5 business days',
            'tracking_url': f'http://localhost:3000/orders/{order.id}/tracking'
        }
        
        return self.send_email(
            recipient_email=order.user.email if order.user else None,
            subject=f'Your Order #{order.id} Has Shipped!',
            template_name='shipping_notification',
            template_variables=variables,
            email_type='shipping',
            user_id=order.user_id,
            order_id=order.id
        )
    
    def send_marketing_email(self, recipient_list, subject, html_content, text_content=None):
        """Send marketing email to multiple recipients"""
        results = []
        
        for recipient in recipient_list:
            if isinstance(recipient, str):
                email = recipient
                name = None
            else:
                email = recipient.get('email')
                name = recipient.get('name')
            
            variables = {
                'user_name': name or 'Valued Customer',
                'unsubscribe_url': f'http://localhost:3000/unsubscribe?email={email}'
            }
            
            success, message = self.send_email(
                recipient_email=email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
                template_variables=variables,
                email_type='marketing',
                priority=7
            )
            
            results.append({
                'email': email,
                'success': success,
                'message': message
            })
        
        return results

# Global email service instance - lazy loading
email_service = None

def get_email_service():
    """Get or create email service instance"""
    global email_service
    if email_service is None:
        email_service = EmailService()
    return email_service 