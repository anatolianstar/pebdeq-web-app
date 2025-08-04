#!/usr/bin/env python3
"""
Initialize email templates and settings for PEBDEQ platform
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.models import EmailTemplate, EmailSettings

def create_default_templates():
    """Create default email templates"""
    
    templates = [
        {
            'name': 'welcome',
            'subject': 'Welcome to {{site_name}}!',
            'template_type': 'transactional',
            'html_content': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PEBDEQ</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #007bff; }
        .content { padding: 30px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to PEBDEQ!</h1>
        </div>
        <div class="content">
            <h2>Hello {{user_name}},</h2>
            <p>Welcome to PEBDEQ! We're excited to have you as part of our community.</p>
            <p>Your account has been successfully created with email: <strong>{{user_email}}</strong></p>
            <p>Here's what you can do next:</p>
            <ul>
                <li>Browse our products</li>
                <li>Set up your profile</li>
                <li>Start shopping</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{login_url}}" class="button">Get Started</a>
            </p>
        </div>
        <div class="footer">
            <p>Thank you for choosing PEBDEQ!</p>
            <p>If you have any questions, feel free to contact our support team.</p>
        </div>
    </div>
</body>
</html>
            ''',
            'text_content': '''
Welcome to PEBDEQ!

Hello {{user_name}},

Welcome to PEBDEQ! We're excited to have you as part of our community.

Your account has been successfully created with email: {{user_email}}

Here's what you can do next:
- Browse our products
- Set up your profile  
- Start shopping

Get Started: {{login_url}}

Thank you for choosing PEBDEQ!
If you have any questions, feel free to contact our support team.
            ''',
            'variables': ['user_name', 'user_email', 'site_name', 'login_url']
        },
        {
            'name': 'order_confirmation',
            'subject': 'Order Confirmation #{{order_id}}',
            'template_type': 'transactional',
            'html_content': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #28a745; }
        .content { padding: 30px 0; }
        .order-info { background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .order-items { background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .product-item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #dee2e6; }
        .product-item:last-child { border-bottom: none; }
        .product-image { width: 80px; height: 80px; margin-right: 15px; border-radius: 4px; overflow: hidden; }
        .product-image img { width: 100%; height: 100%; object-fit: cover; }
        .product-placeholder { width: 80px; height: 80px; background-color: #e9ecef; display: flex; align-items: center; justify-content: center; border-radius: 4px; margin-right: 15px; font-size: 24px; color: #6c757d; }
        .product-details { flex: 1; }
        .product-name { font-weight: bold; color: #2c3e50; margin: 0 0 5px 0; }
        .product-info { color: #6c757d; font-size: 14px; margin: 2px 0; }
        .product-price { font-weight: bold; color: #28a745; }
        .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
        .total-section { background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: right; }
        .total-line { margin: 5px 0; }
        .total-amount { font-size: 18px; font-weight: bold; color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
            <h2>Thank you {{user_name}}!</h2>
            <p>Your order has been successfully placed and confirmed.</p>
            
            <div class="order-info">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> #{{order_id}}</p>
                <p><strong>Order Date:</strong> {{order_date}}</p>
                <p><strong>Status:</strong> {{order_status}}</p>
            </div>
            
            <div class="order-items">
                <h3>Order Items</h3>
                {{#order_items}}
                <div class="product-item">
                    {{#product_image}}
                    <div class="product-image">
                        <img src="{{site_url}}{{product_image}}" alt="{{product_name}}" />
                    </div>
                    {{/product_image}}
                    {{^product_image}}
                    <div class="product-placeholder">📦</div>
                    {{/product_image}}
                    <div class="product-details">
                        <div class="product-name">{{product_name}}</div>
                        <div class="product-info">Quantity: {{quantity}}</div>
                        <div class="product-info">Unit Price: ${{unit_price}}</div>
                        <div class="product-price">Subtotal: ${{subtotal}}</div>
                    </div>
                </div>
                {{/order_items}}
            </div>
            
            <div class="total-section">
                <div class="total-line">Subtotal: ${{order_subtotal}}</div>
                <div class="total-line">Shipping: ${{shipping_cost}}</div>
                <div class="total-line">Tax: ${{tax_amount}}</div>
                <div class="total-line total-amount">Total: {{order_total}}</div>
            </div>
            
            <p>We'll send you shipping information once your order is processed.</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{tracking_url}}" class="button">Track Your Order</a>
            </p>
        </div>
        <div class="footer">
            <p>Thank you for shopping with PEBDEQ!</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
            ''',
            'text_content': '''
Order Confirmed!

Thank you {{user_name}}!

Your order has been successfully placed and confirmed.

Order Details:
- Order ID: #{{order_id}}
- Order Date: {{order_date}}
- Status: {{order_status}}

Order Items:
{{#order_items}}
• {{product_name}}
  Quantity: {{quantity}} x ${{unit_price}} = ${{subtotal}}
{{/order_items}}

Order Summary:
- Subtotal: ${{order_subtotal}}
- Shipping: ${{shipping_cost}}
- Tax: ${{tax_amount}}
- Total: {{order_total}}

We'll send you shipping information once your order is processed.

Track Your Order: {{tracking_url}}

Thank you for shopping with PEBDEQ!
If you have any questions, please contact our support team.
            ''',
            'variables': ['user_name', 'order_id', 'order_date', 'order_status', 'order_total', 'order_subtotal', 'shipping_cost', 'tax_amount', 'tracking_url', 'order_items', 'site_url']
        },
        {
            'name': 'invoice',
            'subject': 'Invoice {{invoice_number}}',
            'template_type': 'transactional',
            'html_content': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{invoice_number}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #17a2b8; }
        .content { padding: 30px 0; }
        .invoice-info { background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #17a2b8; color: white; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invoice {{invoice_number}}</h1>
        </div>
        <div class="content">
            <h2>Dear {{customer_name}},</h2>
            <p>Please find your invoice details below.</p>
            
            <div class="invoice-info">
                <h3>Invoice Information</h3>
                <p><strong>Invoice Number:</strong> {{invoice_number}}</p>
                <p><strong>Invoice Date:</strong> {{invoice_date}}</p>
                <p><strong>Due Date:</strong> {{due_date}}</p>
                <p><strong>Total Amount:</strong> {{invoice_total}}</p>
                <p><strong>Payment Status:</strong> {{payment_status}}</p>
            </div>
            
            <p>Please ensure payment is made by the due date to avoid any service interruption.</p>
            
            <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>{{company_name}}</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>
            ''',
            'text_content': '''
Invoice {{invoice_number}}

Dear {{customer_name}},

Please find your invoice details below.

Invoice Information:
- Invoice Number: {{invoice_number}}
- Invoice Date: {{invoice_date}}
- Due Date: {{due_date}}
- Total Amount: {{invoice_total}}
- Payment Status: {{payment_status}}

Please ensure payment is made by the due date to avoid any service interruption.

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
{{company_name}}

This is an automated message. Please do not reply directly to this email.
            ''',
            'variables': ['customer_name', 'invoice_number', 'invoice_date', 'due_date', 'invoice_total', 'payment_status', 'company_name']
        },
        {
            'name': 'shipping_notification',
            'subject': 'Your Order #{{order_id}} Has Shipped!',
            'template_type': 'transactional',
            'html_content': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Shipped</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #fd7e14; }
        .content { padding: 30px 0; }
        .shipping-info { background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #fd7e14; color: white; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Your Order Has Shipped!</h1>
        </div>
        <div class="content">
            <h2>Great news {{user_name}}!</h2>
            <p>Your order is now on its way to you.</p>
            
            <div class="shipping-info">
                <h3>Shipping Details</h3>
                <p><strong>Order ID:</strong> #{{order_id}}</p>
                <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
                <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
            </div>
            
            <p>You can track your package using the tracking number above or by clicking the button below.</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{tracking_url}}" class="button">Track Your Package</a>
            </p>
        </div>
        <div class="footer">
            <p>Thank you for shopping with PEBDEQ!</p>
            <p>We hope you love your order!</p>
        </div>
    </div>
</body>
</html>
            ''',
            'text_content': '''
📦 Your Order Has Shipped!

Great news {{user_name}}!

Your order is now on its way to you.

Shipping Details:
- Order ID: #{{order_id}}
- Tracking Number: {{tracking_number}}
- Estimated Delivery: {{estimated_delivery}}

You can track your package using the tracking number above.

Track Your Package: {{tracking_url}}

Thank you for shopping with PEBDEQ!
We hope you love your order!
            ''',
            'variables': ['user_name', 'order_id', 'tracking_number', 'estimated_delivery', 'tracking_url']
        },
        {
            'name': 'newsletter',
            'subject': 'PEBDEQ Newsletter - {{newsletter_title}}',
            'template_type': 'marketing',
            'html_content': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PEBDEQ Newsletter</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #6f42c1; }
        .content { padding: 30px 0; }
        .cta { background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; padding: 12px 24px; background-color: #6f42c1; color: white; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
        .unsubscribe { font-size: 12px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PEBDEQ Newsletter</h1>
        </div>
        <div class="content">
            <h2>Hello {{user_name}}!</h2>
            <p>Here's what's new at PEBDEQ this week.</p>
            
            <h3>{{newsletter_title}}</h3>
            <p>{{newsletter_content}}</p>
            
            <div class="cta">
                <h3>Special Offer for You!</h3>
                <p>Get 10% off your next purchase</p>
                <a href="{{shop_url}}" class="button">Shop Now</a>
            </div>
        </div>
        <div class="footer">
            <p>Thank you for being a valued PEBDEQ customer!</p>
            <div class="unsubscribe">
                <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
                <a href="{{preferences_url}}">Update Preferences</a>
            </div>
        </div>
    </div>
</body>
</html>
            ''',
            'text_content': '''
PEBDEQ Newsletter

Hello {{user_name}}!

Here's what's new at PEBDEQ this week.

{{newsletter_title}}
{{newsletter_content}}

Special Offer for You!
Get 10% off your next purchase
Shop Now: {{shop_url}}

Thank you for being a valued PEBDEQ customer!

Unsubscribe: {{unsubscribe_url}}
Update Preferences: {{preferences_url}}
            ''',
            'variables': ['user_name', 'newsletter_title', 'newsletter_content', 'shop_url', 'unsubscribe_url', 'preferences_url']
        },
        {
            'name': 'payment_confirmation',
            'subject': 'Payment Confirmed for Order #{{order_id}}',
            'template_type': 'transactional',
            'html_content': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmed</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #28a745; }
        .content { padding: 30px 0; }
        .payment-info { background-color: #d4edda; padding: 20px; border-radius: 4px; margin: 20px 0; border: 1px solid #c3e6cb; }
        .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💳 Payment Confirmed!</h1>
        </div>
        <div class="content">
            <h2>Hello {{user_name}},</h2>
            <p>Great news! We have successfully received your payment for order #{{order_id}}.</p>
            
            <div class="payment-info">
                <h3>Payment Details</h3>
                <p><strong>Order ID:</strong> #{{order_id}}</p>
                <p><strong>Amount Paid:</strong> {{order_total}}</p>
                <p><strong>Payment Method:</strong> {{payment_method}}</p>
                <p><strong>Payment Status:</strong> Confirmed ✅</p>
                <p><strong>Transaction Date:</strong> {{payment_date}}</p>
            </div>
            
            <p>Your order is now being processed and will be shipped soon. We'll send you a shipping confirmation with tracking information once your order is on its way.</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{tracking_url}}" class="button">Track Your Order</a>
            </p>
        </div>
        <div class="footer">
            <p>Thank you for your purchase with PEBDEQ!</p>
            <p>If you have any questions about your payment or order, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
            ''',
            'text_content': '''
💳 Payment Confirmed!

Hello {{user_name}},

Great news! We have successfully received your payment for order #{{order_id}}.

Payment Details:
- Order ID: #{{order_id}}
- Amount Paid: {{order_total}}
- Payment Method: {{payment_method}}
- Payment Status: Confirmed ✅
- Transaction Date: {{payment_date}}

Your order is now being processed and will be shipped soon. We'll send you a shipping confirmation with tracking information once your order is on its way.

Track Your Order: {{tracking_url}}

Thank you for your purchase with PEBDEQ!
If you have any questions about your payment or order, please contact our support team.
            ''',
            'variables': ['user_name', 'order_id', 'order_total', 'payment_method', 'payment_date', 'tracking_url']
        },
        {
            'name': 'order_status_update',
            'subject': 'Order #{{order_id}} - Status Update',
            'template_type': 'transactional',
            'html_content': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #17a2b8; }
        .content { padding: 30px 0; }
        .status-info { background-color: #e7f3ff; padding: 20px; border-radius: 4px; margin: 20px 0; border: 1px solid #b8daff; }
        .custom-message { background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border: 1px solid #ffeaa7; }
        .button { display: inline-block; padding: 12px 24px; background-color: #17a2b8; color: white; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Order Status Update</h1>
        </div>
        <div class="content">
            <h2>Hello {{user_name}},</h2>
            <p>We have an update on your order #{{order_id}}.</p>
            
            <div class="status-info">
                <h3>Order Information</h3>
                <p><strong>Order ID:</strong> #{{order_id}}</p>
                <p><strong>Order Date:</strong> {{order_date}}</p>
                <p><strong>Current Status:</strong> {{order_status}}</p>
                <p><strong>Payment Status:</strong> {{payment_status}}</p>
                <p><strong>Total Amount:</strong> {{order_total}}</p>
            </div>
            
            {{#custom_message}}
            <div class="custom-message">
                <h4>📝 Message from PEBDEQ Team:</h4>
                <p>{{custom_message}}</p>
            </div>
            {{/custom_message}}
            
            <p>You can track your order and view all details using the link below:</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{tracking_url}}" class="button">View Order Details</a>
            </p>
        </div>
        <div class="footer">
            <p>Thank you for choosing PEBDEQ!</p>
            <p>If you have any questions about your order, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
            ''',
            'text_content': '''
📦 Order Status Update

Hello {{user_name}},

We have an update on your order #{{order_id}}.

Order Information:
- Order ID: #{{order_id}}
- Order Date: {{order_date}}
- Current Status: {{order_status}}
- Payment Status: {{payment_status}}
- Total Amount: {{order_total}}

{{#custom_message}}
📝 Message from PEBDEQ Team:
{{custom_message}}
{{/custom_message}}

You can track your order and view all details using the link below:

View Order Details: {{tracking_url}}

Thank you for choosing PEBDEQ!
If you have any questions about your order, please contact our support team.
            ''',
            'variables': ['user_name', 'order_id', 'order_date', 'order_status', 'payment_status', 'order_total', 'custom_message', 'tracking_url']
        }
    ]
    
    for template_data in templates:
        # Check if template already exists
        existing = EmailTemplate.query.filter_by(name=template_data['name']).first()
        
        if not existing:
            template = EmailTemplate(
                name=template_data['name'],
                subject=template_data['subject'],
                html_content=template_data['html_content'],
                text_content=template_data['text_content'],
                template_type=template_data['template_type'],
                variables=template_data['variables'],
                is_active=True
            )
            
            db.session.add(template)
            print(f"✅ Created email template: {template_data['name']}")
        else:
            print(f"⚠️ Email template already exists: {template_data['name']}")
    
    db.session.commit()

def create_default_settings():
    """Create default email settings"""
    
    settings = EmailSettings.query.first()
    
    if not settings:
        settings = EmailSettings(
            smtp_server='smtp.gmail.com',
            smtp_port=587,
            smtp_use_tls=True,
            smtp_use_ssl=False,
            from_email='noreply@pebdeq.com',
            from_name='PEBDEQ',
            reply_to_email='support@pebdeq.com',
            bounce_email='bounce@pebdeq.com',
            daily_limit=1000,
            hourly_limit=100,
            is_enabled=False,  # Start disabled until SMTP is configured
            test_mode=True
        )
        
        db.session.add(settings)
        db.session.commit()
        print("✅ Created default email settings")
    else:
        print("⚠️ Email settings already exist")

def main():
    """Main initialization function"""
    print("🚀 Initializing PEBDEQ Email System...")
    
    app = create_app()
    
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        # Create default templates and settings
        create_default_templates()
        create_default_settings()
        
        print("\n✅ Email system initialization completed!")
        print("\n📧 Next Steps:")
        print("1. Configure SMTP settings in admin panel")
        print("2. Enable email system when ready")
        print("3. Test email sending functionality")
        print("4. Customize email templates as needed")

if __name__ == '__main__':
    main() 