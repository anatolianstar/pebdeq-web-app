from flask import Blueprint, request, jsonify, send_file
from app.models.models import Invoice, InvoiceItem, Order, User, UserAddress
from app import db
import jwt
import os
from functools import wraps
from datetime import datetime, timedelta
import uuid
from app.utils.invoice_pdf import generate_invoice_pdf

invoices_bp = Blueprint('invoices', __name__)

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

def generate_invoice_number():
    """Generate unique invoice number"""
    year = datetime.now().year
    month = datetime.now().month
    
    # Find the last invoice number for this month
    last_invoice = Invoice.query.filter(
        Invoice.invoice_number.like(f'PBD-{year}-{month:02d}-%')
    ).order_by(Invoice.created_at.desc()).first()
    
    if last_invoice:
        # Extract the sequence number and increment
        parts = last_invoice.invoice_number.split('-')
        if len(parts) >= 4:
            sequence = int(parts[3]) + 1
        else:
            sequence = 1
    else:
        sequence = 1
    
    return f'PBD-{year}-{month:02d}-{sequence:04d}'

def calculate_tax_amount(subtotal, tax_rate=0.06):
    """Calculate tax amount (US Sales Tax)"""
    return subtotal * tax_rate

def calculate_total_amount(subtotal, tax_amount, discount_amount=0.0):
    """Calculate total amount"""
    return subtotal + tax_amount - discount_amount

# Invoice CRUD Endpoints
@invoices_bp.route('/invoices', methods=['GET'])
@admin_required
def get_invoices():
    """Get all invoices with pagination and filtering"""
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get filter parameters
        status_filter = request.args.get('status', '')
        payment_status_filter = request.args.get('payment_status', '')
        search_term = request.args.get('search', '')
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        # Build query
        query = Invoice.query.join(User, Invoice.user_id == User.id)
        
        # Apply filters
        if status_filter:
            query = query.filter(Invoice.status == status_filter)
        
        if payment_status_filter:
            query = query.filter(Invoice.payment_status == payment_status_filter)
        
        if search_term:
            query = query.filter(
                db.or_(
                    Invoice.invoice_number.ilike(f'%{search_term}%'),
                    Invoice.customer_email.ilike(f'%{search_term}%'),
                    Invoice.customer_name.ilike(f'%{search_term}%'),
                    User.email.ilike(f'%{search_term}%')
                )
            )
        
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d')
                query = query.filter(Invoice.invoice_date >= from_date)
            except ValueError:
                pass
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d')
                # Add 1 day to include the entire day
                to_date = to_date + timedelta(days=1)
                query = query.filter(Invoice.invoice_date < to_date)
            except ValueError:
                pass
        
        # Order by invoice date (newest first)
        query = query.order_by(Invoice.invoice_date.desc())
        
        # Get total count before pagination
        total_invoices = query.count()
        
        # Apply pagination
        invoices_paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Format response
        invoices_data = []
        for invoice in invoices_paginated.items:
            invoice_data = invoice.to_dict()
            # Add user information
            if invoice.user:
                invoice_data['user'] = {
                    'id': invoice.user.id,
                    'username': invoice.user.username,
                    'email': invoice.user.email,
                    'first_name': invoice.user.first_name,
                    'last_name': invoice.user.last_name
                }
            invoices_data.append(invoice_data)
        
        return jsonify({
            'invoices': invoices_data,
            'page': page,
            'per_page': per_page,
            'total': total_invoices,
            'pages': invoices_paginated.pages,
            'has_next': invoices_paginated.has_next,
            'has_prev': invoices_paginated.has_prev
        })
        
    except Exception as e:
        print(f'❌ Error fetching invoices: {str(e)}')
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
@admin_required
def get_invoice(invoice_id):
    """Get specific invoice details"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        
        invoice_data = invoice.to_dict()
        
        # Add order information
        if invoice.order:
            invoice_data['order'] = {
                'id': invoice.order.id,
                'order_number': invoice.order.order_number,
                'status': invoice.order.status,
                'created_at': invoice.order.created_at.isoformat()
            }
        
        # Add user information
        if invoice.user:
            invoice_data['user'] = {
                'id': invoice.user.id,
                'username': invoice.user.username,
                'email': invoice.user.email,
                'first_name': invoice.user.first_name,
                'last_name': invoice.user.last_name,
                'phone': invoice.user.phone
            }
        
        return jsonify(invoice_data)
        
    except Exception as e:
        print(f'❌ Error fetching invoice {invoice_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices', methods=['POST'])
@admin_required
def create_invoice():
    """Create new invoice"""
    try:
        # Safely get JSON data
        try:
            data = request.get_json()
        except Exception as json_error:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['order_id', 'customer_name', 'customer_email']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get order information
        order = Order.query.get_or_404(data['order_id'])
        
        # Generate invoice number
        invoice_number = generate_invoice_number()
        
        # Calculate amounts
        subtotal = data.get('subtotal', order.subtotal)
        tax_rate = data.get('tax_rate', 0.06)  # US Sales Tax 6%
        tax_amount = calculate_tax_amount(subtotal, tax_rate)
        discount_amount = data.get('discount_amount', 0.0)
        total_amount = calculate_total_amount(subtotal, tax_amount, discount_amount)
        
        # Calculate due date (default 30 days)
        due_date = datetime.utcnow() + timedelta(days=data.get('due_days', 30))
        
        # Create invoice
        invoice = Invoice(
            invoice_number=invoice_number,
            order_id=order.id,
            user_id=order.user_id,
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            total_amount=total_amount,
            due_date=due_date,
            status=data.get('status', 'draft'),
            payment_status=data.get('payment_status', 'pending'),
            
            # Company information
            company_name=data.get('company_name', 'PEBDEQ'),
            company_address=data.get('company_address', ''),
            company_tax_number=data.get('company_tax_number', ''),
            company_phone=data.get('company_phone', ''),
            company_email=data.get('company_email', ''),
            
            # Customer information
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            customer_phone=data.get('customer_phone', ''),
            billing_address=data.get('billing_address', ''),
            
            notes=data.get('notes', ''),
            internal_notes=data.get('internal_notes', '')
        )
        
        db.session.add(invoice)
        db.session.flush()  # Get the invoice ID
        
        # Create invoice items from order items
        if 'items' in data:
            # Use provided items
            items_data = data['items']
        else:
            # Create items from order items
            items_data = []
            for order_item in order.order_items:
                items_data.append({
                    'product_id': order_item.product_id,
                    'product_name': order_item.product_name,
                    'quantity': order_item.quantity,
                    'unit_price': order_item.price,
                    'line_total': order_item.quantity * order_item.price
                })
        
        for item_data in items_data:
            invoice_item = InvoiceItem(
                invoice_id=invoice.id,
                product_id=item_data.get('product_id'),
                product_name=item_data['product_name'],
                product_description=item_data.get('product_description', ''),
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                discount_percentage=item_data.get('discount_percentage', 0.0),
                line_total=item_data['line_total'],
                tax_rate=item_data.get('tax_rate', tax_rate),
                tax_amount=item_data.get('tax_amount', item_data['line_total'] * tax_rate)
            )
            db.session.add(invoice_item)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice created successfully',
            'invoice': invoice.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f'❌ Error creating invoice: {str(e)}')
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['PUT'])
@admin_required
def update_invoice(invoice_id):
    """Update invoice"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        data = request.get_json()
        
        # Update invoice fields
        if 'status' in data:
            invoice.status = data['status']
        if 'payment_status' in data:
            invoice.payment_status = data['payment_status']
        if 'due_date' in data:
            invoice.due_date = datetime.fromisoformat(data['due_date'])
        if 'discount_amount' in data:
            invoice.discount_amount = data['discount_amount']
            # Recalculate total
            invoice.total_amount = calculate_total_amount(
                invoice.subtotal, invoice.tax_amount, invoice.discount_amount
            )
        if 'notes' in data:
            invoice.notes = data['notes']
        if 'internal_notes' in data:
            invoice.internal_notes = data['internal_notes']
        
        # Update company information
        if 'company_name' in data:
            invoice.company_name = data['company_name']
        if 'company_address' in data:
            invoice.company_address = data['company_address']
        if 'company_tax_number' in data:
            invoice.company_tax_number = data['company_tax_number']
        if 'company_phone' in data:
            invoice.company_phone = data['company_phone']
        if 'company_email' in data:
            invoice.company_email = data['company_email']
        
        # Update customer information
        if 'customer_name' in data:
            invoice.customer_name = data['customer_name']
        if 'customer_email' in data:
            invoice.customer_email = data['customer_email']
        if 'customer_phone' in data:
            invoice.customer_phone = data['customer_phone']
        if 'billing_address' in data:
            invoice.billing_address = data['billing_address']
        
        invoice.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice updated successfully',
            'invoice': invoice.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f'❌ Error updating invoice {invoice_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['DELETE'])
@admin_required
def delete_invoice(invoice_id):
    """Delete invoice"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        
        # Only allow deletion of draft invoices
        if invoice.status != 'draft':
            return jsonify({'error': 'Only draft invoices can be deleted'}), 400
        
        db.session.delete(invoice)
        db.session.commit()
        
        return jsonify({'message': 'Invoice deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        print(f'❌ Error deleting invoice {invoice_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

# Create invoice from order
@invoices_bp.route('/orders/<int:order_id>/create-invoice', methods=['POST'])
@admin_required
def create_invoice_from_order(order_id):
    """Create invoice from existing order"""
    try:
        order = Order.query.get_or_404(order_id)
        
        # Check if invoice already exists for this order
        existing_invoice = Invoice.query.filter_by(order_id=order.id).first()
        if existing_invoice:
            # Get replace parameter from request
            replace_existing = False
            if request.is_json and request.json:
                replace_existing = request.json.get('replaceExisting', False)
            
            if not replace_existing:
                return jsonify({
                    'error': 'Invoice already exists',
                    'invoice_exists': True,
                    'existing_invoice_id': existing_invoice.id,
                    'existing_invoice_number': existing_invoice.invoice_number,
                    'message': 'An invoice already exists for this order. Do you want to delete the existing invoice and create a new one?'
                }), 409
            else:
                # Delete existing invoice if user confirmed to replace
                db.session.delete(existing_invoice)
                db.session.commit()
        
        # Get customer information
        customer_name = f"{order.user.first_name} {order.user.last_name}"
        customer_email = order.user.email
        
        # Get billing address
        billing_address = ""
        if order.billing_address_obj:
            addr = order.billing_address_obj
            billing_address = f"{addr.address_line1}\n"
            if addr.address_line2:
                billing_address += f"{addr.address_line2}\n"
            billing_address += f"{addr.city}, {addr.state} {addr.postal_code}\n{addr.country}"
        elif order.billing_address:
            billing_address = order.billing_address
        
        # Generate invoice number
        invoice_number = generate_invoice_number()
        
        # Calculate amounts
        subtotal = order.subtotal
        tax_rate = 0.06  # US Sales Tax 6%
        tax_amount = calculate_tax_amount(subtotal, tax_rate)
        discount_amount = 0.0
        total_amount = calculate_total_amount(subtotal, tax_amount, discount_amount)
        
        # Calculate due date (default 30 days)
        due_date = datetime.utcnow() + timedelta(days=30)
        
        # Create invoice
        invoice = Invoice(
            invoice_number=invoice_number,
            order_id=order.id,
            user_id=order.user_id,
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            total_amount=total_amount,
            due_date=due_date,
            status='draft',
            payment_status='pending',
            
            # Company information
            company_name='PEBDEQ',
            company_address='',
            company_tax_number='',
            company_phone='',
            company_email='',
            
            # Customer information
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=order.user.phone or '',
            billing_address=billing_address,
            
            notes='',
            internal_notes=f'Invoice created automatically from order #{order.order_number}'
        )
        
        db.session.add(invoice)
        db.session.flush()  # Get the invoice ID
        
        # Create invoice items from order items
        for order_item in order.order_items:
            invoice_item = InvoiceItem(
                invoice_id=invoice.id,
                product_id=order_item.product_id,
                product_name=order_item.product_name,
                product_description=order_item.product.description if order_item.product else '',
                quantity=order_item.quantity,
                unit_price=order_item.price,
                discount_percentage=0.0,
                line_total=order_item.quantity * order_item.price,
                tax_rate=tax_rate,
                tax_amount=(order_item.quantity * order_item.price) * tax_rate
            )
            db.session.add(invoice_item)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice created successfully from order',
            'invoice': invoice.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f'❌ Error creating invoice from order {order_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

# Invoice statistics
@invoices_bp.route('/invoices/stats', methods=['GET'])
@admin_required
def get_invoice_stats():
    """Get invoice statistics"""
    try:
        total_invoices = Invoice.query.count()
        draft_invoices = Invoice.query.filter_by(status='draft').count()
        sent_invoices = Invoice.query.filter_by(status='sent').count()
        paid_invoices = Invoice.query.filter_by(payment_status='paid').count()
        overdue_invoices = Invoice.query.filter(
            Invoice.due_date < datetime.utcnow(),
            Invoice.payment_status != 'paid'
        ).count()
        
        total_amount = db.session.query(db.func.sum(Invoice.total_amount)).scalar() or 0
        paid_amount = db.session.query(db.func.sum(Invoice.total_amount)).filter_by(payment_status='paid').scalar() or 0
        outstanding_amount = total_amount - paid_amount
        
        return jsonify({
            'total_invoices': total_invoices,
            'draft_invoices': draft_invoices,
            'sent_invoices': sent_invoices,
            'paid_invoices': paid_invoices,
            'overdue_invoices': overdue_invoices,
            'total_amount': float(total_amount),
            'paid_amount': float(paid_amount),
            'outstanding_amount': float(outstanding_amount)
        })
        
    except Exception as e:
        print(f'❌ Error fetching invoice stats: {str(e)}')
        return jsonify({'error': str(e)}), 500

# PDF Generation Endpoints
@invoices_bp.route('/invoices/<int:invoice_id>/generate-pdf', methods=['POST'])
@admin_required
def generate_invoice_pdf_endpoint(invoice_id):
    """Generate PDF for invoice"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        
        # Generate PDF
        pdf_path = generate_invoice_pdf(invoice)
        
        return jsonify({
            'message': 'PDF generated successfully',
            'pdf_path': invoice.pdf_path,
            'pdf_generated_at': invoice.pdf_generated_at.isoformat()
        })
        
    except Exception as e:
        print(f'❌ Error generating PDF for invoice {invoice_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices/<int:invoice_id>/download-pdf', methods=['GET'])
@admin_required
def download_invoice_pdf(invoice_id):
    """Download invoice PDF"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        
        # Get app directory for absolute path
        app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Check if PDF exists
        if not invoice.pdf_path:
            # Generate PDF if it doesn't exist
            generate_invoice_pdf(invoice)
        
        # Get absolute path
        if invoice.pdf_path.startswith('/'):
            pdf_path = os.path.join(app_dir, invoice.pdf_path.lstrip('/'))
        else:
            pdf_path = os.path.join(app_dir, invoice.pdf_path)
        
        # Normalize path for Windows
        pdf_path = os.path.normpath(pdf_path)
        
        # Check if file exists, if not generate it
        if not os.path.exists(pdf_path):
            print(f"🔄 PDF not found, generating: {pdf_path}")
            generate_invoice_pdf(invoice)
            # Get updated path
            if invoice.pdf_path.startswith('/'):
                pdf_path = os.path.join(app_dir, invoice.pdf_path.lstrip('/'))
            else:
                pdf_path = os.path.join(app_dir, invoice.pdf_path)
            pdf_path = os.path.normpath(pdf_path)
        
        print(f"📄 Sending PDF file: {pdf_path}")
        filename = f"invoice_{invoice.invoice_number}.pdf"
        
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f'❌ Error downloading PDF for invoice {invoice_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices/<int:invoice_id>/preview-pdf', methods=['GET'])
@admin_required
def preview_invoice_pdf(invoice_id):
    """Preview invoice PDF in browser"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        
        # Get app directory for absolute path
        app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Check if PDF exists
        if not invoice.pdf_path:
            # Generate PDF if it doesn't exist
            generate_invoice_pdf(invoice)
        
        # Get absolute path
        if invoice.pdf_path.startswith('/'):
            pdf_path = os.path.join(app_dir, invoice.pdf_path.lstrip('/'))
        else:
            pdf_path = os.path.join(app_dir, invoice.pdf_path)
        
        # Normalize path for Windows
        pdf_path = os.path.normpath(pdf_path)
        
        # Check if file exists, if not generate it
        if not os.path.exists(pdf_path):
            print(f"🔄 PDF not found, generating: {pdf_path}")
            generate_invoice_pdf(invoice)
            # Get updated path
            if invoice.pdf_path.startswith('/'):
                pdf_path = os.path.join(app_dir, invoice.pdf_path.lstrip('/'))
            else:
                pdf_path = os.path.join(app_dir, invoice.pdf_path)
            pdf_path = os.path.normpath(pdf_path)
        
        print(f"📄 Previewing PDF file: {pdf_path}")
        
        return send_file(
            pdf_path,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f'❌ Error previewing PDF for invoice {invoice_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

# Send invoice via email
@invoices_bp.route('/invoices/<int:invoice_id>/send-email', methods=['POST'])
@admin_required
def send_invoice_email(invoice_id):
    """Send invoice via email"""
    try:
        from app.utils.email_service import email_service
        
        invoice = Invoice.query.get_or_404(invoice_id)
        data = request.get_json() or {}
        
        # Send email using email service
        success, result = email_service.send_invoice_email(invoice_id)
        
        if success:
            # Update invoice status to sent
            invoice.status = 'sent'
            invoice.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': 'Invoice email sent successfully',
                'email_sent_to': invoice.customer_email,
                'invoice_status': invoice.status,
                'queue_id': result
            })
        else:
            return jsonify({
                'error': f'Failed to send invoice email: {result}'
            }), 400
        
    except Exception as e:
        db.session.rollback()
        print(f'❌ Error sending email for invoice {invoice_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500 