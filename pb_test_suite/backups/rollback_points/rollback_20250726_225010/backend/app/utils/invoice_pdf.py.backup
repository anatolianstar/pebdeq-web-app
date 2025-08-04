import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.colors import black, gray, darkblue, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, Frame, PageTemplate
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from num2words import num2words
import qrcode
from PIL import Image as PILImage

class InvoicePDFGenerator:
    def __init__(self, invoice, logo_path=None, site_settings=None):
        self.invoice = invoice
        self.logo_path = logo_path
        self.site_settings = site_settings
        self.styles = getSampleStyleSheet()
        self.page_width, self.page_height = A4
        
        # Define custom styles
        self.title_style = ParagraphStyle(
            'TitleStyle',
            parent=self.styles['Heading1'],
            fontSize=20,
            textColor=darkblue,
            spaceAfter=20,
            alignment=TA_CENTER
        )
        
        self.company_style = ParagraphStyle(
            'CompanyStyle',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=black,
            spaceAfter=6
        )
        
        self.invoice_info_style = ParagraphStyle(
            'InvoiceInfoStyle',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=black,
            alignment=TA_RIGHT
        )
        
        self.customer_style = ParagraphStyle(
            'CustomerStyle',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=black,
            spaceAfter=6
        )
        
        self.table_header_style = ParagraphStyle(
            'TableHeaderStyle',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=white,
            alignment=TA_CENTER
        )
        
        self.table_cell_style = ParagraphStyle(
            'TableCellStyle',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=black
        )

    def generate_qr_code(self, data):
        """Generate QR code for invoice"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=1,  # ERROR_CORRECT_L
            box_size=3,
            border=1,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        # Create QR code image
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to bytes
        img_buffer = io.BytesIO()
        qr_img.save(img_buffer, 'PNG')
        img_buffer.seek(0)
        
        return img_buffer

    def format_currency(self, amount):
        """Format currency amount"""
        return f"${amount:,.2f}"

    def amount_to_words(self, amount):
        """Convert amount to words in English"""
        try:
            # Convert to integer part and decimal part
            int_part = int(amount)
            decimal_part = int((amount - int_part) * 100)
            
            # Convert to words (using English)
            words = num2words(int_part, lang='en').title()
            if decimal_part > 0:
                words += f" and {decimal_part}/100"
            words += " US Dollars"
            return words
        except:
            return f"{self.format_currency(amount)} US Dollars"

    def create_header(self, canvas, doc):
        """Create invoice header"""
        canvas.saveState()
        
        # Company logo (if available) - Use footer logo from site settings
        if (self.site_settings and 
            self.site_settings.footer_use_logo and 
            self.site_settings.footer_logo):
            try:
                # Use footer logo from site settings
                footer_logo_path = None
                if self.site_settings.footer_logo.startswith('/uploads/'):
                    # Remove leading slash and handle Windows paths
                    footer_logo_path = self.site_settings.footer_logo[1:].replace('/', os.sep)
                    if not os.path.exists(footer_logo_path):
                        # Try with current working directory
                        footer_logo_path = os.path.join(os.getcwd(), footer_logo_path)
                
                print(f"🔍 Header Debug - Footer Logo Path: {footer_logo_path}")
                print(f"🔍 Header Debug - File Exists: {os.path.exists(footer_logo_path) if footer_logo_path else False}")
                
                if footer_logo_path and os.path.exists(footer_logo_path):
                    logo = Image(footer_logo_path)
                    
                    # Get original image dimensions for proper scaling
                    from PIL import Image as PILImage
                    with PILImage.open(footer_logo_path) as img:
                        orig_width, orig_height = img.size
                    
                    # Calculate scaled dimensions (max 80px height, maintain aspect ratio)
                    max_height = 80
                    max_width = 160
                    
                    # Scale based on height first
                    if orig_height > max_height:
                        scale_factor = max_height / orig_height
                        new_width = orig_width * scale_factor
                        new_height = max_height
                    else:
                        new_width = orig_width
                        new_height = orig_height
                    
                    # Check if width exceeds maximum
                    if new_width > max_width:
                        scale_factor = max_width / new_width
                        new_width = max_width
                        new_height = new_height * scale_factor
                    
                    logo.drawHeight = new_height
                    logo.drawWidth = new_width
                    logo.drawOn(canvas, 50, self.page_height - 100)
                    print(f"✅ Header Debug - Logo drawn successfully at (50, {self.page_height - 100}) - Size: {new_width}x{new_height} (original: {orig_width}x{orig_height})")
                else:
                    print(f"❌ Header Debug - Footer logo file not found")
            except Exception as e:
                print(f"❌ Header Debug - Footer logo error: {str(e)}")
                pass
        
        # Company information from site settings or invoice
        company_x = 50
        company_y = self.page_height - 120
        
        # Use site settings if available, otherwise fallback to invoice fields
        company_name = (self.site_settings.site_name if self.site_settings and self.site_settings.site_name 
                       else self.invoice.company_name or "PEBDEQ")
        company_address = (self.site_settings.contact_address if self.site_settings and self.site_settings.contact_address 
                          else self.invoice.company_address)
        company_phone = (self.site_settings.contact_phone if self.site_settings and self.site_settings.contact_phone 
                        else self.invoice.company_phone)
        company_email = (self.site_settings.contact_email if self.site_settings and self.site_settings.contact_email 
                        else self.invoice.company_email)
        
        canvas.setFont("Helvetica-Bold", 16)
        canvas.setFillColor(darkblue)
        canvas.drawString(company_x, company_y, company_name)
        
        company_y -= 20
        canvas.setFont("Helvetica", 10)
        canvas.setFillColor(black)
        
        if company_address:
            # Split address into lines
            address_lines = company_address.split('\n')
            for line in address_lines:
                if line.strip():  # Only draw non-empty lines
                    canvas.drawString(company_x, company_y, line.strip())
                    company_y -= 12
        
        if company_phone:
            canvas.drawString(company_x, company_y, f"Tel: {company_phone}")
            company_y -= 12
        
        if company_email:
            canvas.drawString(company_x, company_y, f"Email: {company_email}")
            company_y -= 12
        
        # Only show tax number if it exists in invoice (for backward compatibility)
        if self.invoice.company_tax_number:
            canvas.drawString(company_x, company_y, f"Tax Number: {self.invoice.company_tax_number}")
        
        # Invoice title
        canvas.setFont("Helvetica-Bold", 24)
        canvas.setFillColor(darkblue)
        title_x = self.page_width - 200
        title_y = self.page_height - 80
        canvas.drawRightString(title_x, title_y, "INVOICE")
        
        # Invoice information
        info_x = self.page_width - 200
        info_y = self.page_height - 120
        
        canvas.setFont("Helvetica-Bold", 10)
        canvas.setFillColor(black)
        canvas.drawRightString(info_x, info_y, f"Invoice Number: {self.invoice.invoice_number}")
        
        info_y -= 15
        canvas.drawRightString(info_x, info_y, f"Invoice Date: {self.invoice.invoice_date.strftime('%d/%m/%Y')}")
        
        if self.invoice.due_date:
            info_y -= 15
            canvas.drawRightString(info_x, info_y, f"Due Date: {self.invoice.due_date.strftime('%d/%m/%Y')}")
        
        # Status
        info_y -= 20
        canvas.setFont("Helvetica-Bold", 12)
        if self.invoice.payment_status == 'paid':
            canvas.setFillColor(colors.green)
            canvas.drawRightString(info_x, info_y, "PAID")
        elif self.invoice.payment_status == 'pending':
            canvas.setFillColor(colors.orange)
            canvas.drawRightString(info_x, info_y, "PENDING")
        elif self.invoice.payment_status == 'overdue':
            canvas.setFillColor(colors.red)
            canvas.drawRightString(info_x, info_y, "OVERDUE")
        
        canvas.restoreState()

    def create_customer_info(self):
        """Create customer information section"""
        customer_data = []
        
        # Customer title
        customer_data.append(Paragraph("<b>BILL TO:</b>", self.customer_style))
        customer_data.append(Spacer(1, 6))
        
        # Customer details
        customer_data.append(Paragraph(f"<b>{self.invoice.customer_name}</b>", self.customer_style))
        customer_data.append(Paragraph(self.invoice.customer_email, self.customer_style))
        
        if self.invoice.customer_phone:
            customer_data.append(Paragraph(self.invoice.customer_phone, self.customer_style))
        
        if self.invoice.billing_address:
            # Split address into lines and add each
            address_lines = self.invoice.billing_address.split('\n')
            for line in address_lines:
                if line.strip():
                    customer_data.append(Paragraph(line.strip(), self.customer_style))
        
        return customer_data

    def create_items_table(self):
        """Create invoice items table"""
        # Table headers
        headers = [
            Paragraph("<b>Description</b>", self.table_header_style),
            Paragraph("<b>Qty</b>", self.table_header_style),
            Paragraph("<b>Unit Price</b>", self.table_header_style),
            Paragraph("<b>Tax Rate</b>", self.table_header_style),
            Paragraph("<b>Total</b>", self.table_header_style)
        ]
        
        # Table data
        table_data = [headers]
        
        for item in self.invoice.invoice_items:
            row = [
                Paragraph(f"<b>{item.product_name}</b><br/>{item.product_description or ''}", self.table_cell_style),
                Paragraph(str(item.quantity), self.table_cell_style),
                Paragraph(self.format_currency(item.unit_price), self.table_cell_style),
                Paragraph(f"%{item.tax_rate * 100:.0f}", self.table_cell_style),
                Paragraph(self.format_currency(item.line_total), self.table_cell_style)
            ]
            table_data.append(row)
        
        # Create table
        table = Table(table_data, colWidths=[3*inch, 0.7*inch, 1*inch, 0.8*inch, 1*inch])
        
        # Table style
        table_style = TableStyle([
            # Header style
            ('BACKGROUND', (0, 0), (-1, 0), darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Data rows style
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),  # Description left aligned
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'),  # Numbers center aligned
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Grid lines
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            
            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ])
        
        table.setStyle(table_style)
        return table

    def create_totals_table(self):
        """Create invoice totals table"""
        totals_data = [
            ['Subtotal:', self.format_currency(self.invoice.subtotal)],
            [f'Sales Tax ({self.invoice.tax_rate * 100:.0f}%):', self.format_currency(self.invoice.tax_amount)]
        ]
        
        if self.invoice.discount_amount > 0:
            totals_data.append(['Discount:', f'-{self.format_currency(self.invoice.discount_amount)}'])
        
        totals_data.append(['TOTAL:', self.format_currency(self.invoice.total_amount)])
        
        # Create table
        totals_table = Table(totals_data, colWidths=[1.5*inch, 1*inch])
        
        # Table style
        totals_style = TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, -1), (-1, -1), darkblue),
            ('LINEBELOW', (0, -1), (-1, -1), 2, darkblue),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ])
        
        totals_table.setStyle(totals_style)
        return totals_table

    def create_footer(self, canvas, doc):
        """Create invoice footer"""
        canvas.saveState()
        
        # Footer line
        canvas.setStrokeColor(gray)
        canvas.line(50, 100, self.page_width - 50, 100)
        
        # Footer company name (centered)
        canvas.setFont("Helvetica-Bold", 10)
        canvas.setFillColor(darkblue)
        company_name = (self.site_settings.footer_company_name if self.site_settings and self.site_settings.footer_company_name 
                       else self.invoice.company_name or "PEBDEQ")
        text_width = canvas.stringWidth(company_name, "Helvetica-Bold", 10)
        text_x = (self.page_width - text_width) / 2
        canvas.drawString(text_x, 90, company_name)
        print(f"ℹ️ Footer Debug - Company name drawn: {company_name}")
        
        # Payment terms and notes
        footer_y = 80
        canvas.setFont("Helvetica", 9)
        canvas.setFillColor(black)
        
        if self.invoice.notes:
            canvas.drawString(50, footer_y, f"Notes: {self.invoice.notes}")
            footer_y -= 12
        
        canvas.drawString(50, footer_y, "Thank you for your business!")
        
        # QR Code for payment (if needed)
        qr_data = f"Invoice: {self.invoice.invoice_number}\nAmount: {self.format_currency(self.invoice.total_amount)}"
        qr_buffer = self.generate_qr_code(qr_data)
        
        try:
            qr_image = Image(qr_buffer)
            qr_image.drawHeight = 60
            qr_image.drawWidth = 60
            qr_image.drawOn(canvas, self.page_width - 120, 40)
        except:
            pass
        
        # Page number
        canvas.drawRightString(self.page_width - 50, 20, f"Page {canvas.getPageNumber()}")
        
        canvas.restoreState()

    def generate_pdf(self, output_path):
        """Generate the complete PDF invoice"""
        # Create document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=50,
            leftMargin=50,
            topMargin=160,  # Space for header
            bottomMargin=120  # Space for footer
        )
        
        # Story content
        story = []
        
        # Add some space after header
        story.append(Spacer(1, 30))
        
        # Customer information
        customer_info = self.create_customer_info()
        for item in customer_info:
            story.append(item)
        
        story.append(Spacer(1, 20))
        
        # Items table
        items_table = self.create_items_table()
        story.append(items_table)
        
        story.append(Spacer(1, 20))
        
        # Totals table (right aligned)
        totals_table = self.create_totals_table()
        totals_frame = Table([[totals_table]], colWidths=[doc.width])
        totals_frame.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'RIGHT')]))
        story.append(totals_frame)
        
        story.append(Spacer(1, 20))
        
        # Amount in words
        amount_words = self.amount_to_words(self.invoice.total_amount)
        story.append(Paragraph(f"<b>Amount in words:</b> {amount_words}", self.styles['Normal']))
        
        # Build PDF with custom header and footer
        doc.build(story, onFirstPage=self.create_first_page, onLaterPages=self.create_later_pages)
        
        return output_path
    
    def create_first_page(self, canvas, doc):
        """Create first page with header and footer"""
        self.create_header(canvas, doc)
        self.create_footer(canvas, doc)
    
    def create_later_pages(self, canvas, doc):
        """Create later pages with header and footer"""
        self.create_header(canvas, doc)
        self.create_footer(canvas, doc)

def generate_invoice_pdf(invoice, output_dir=None):
    """Main function to generate invoice PDF"""
    try:
        # Get site settings for company information
        from app.models.models import SiteSettings
        site_settings = SiteSettings.query.first()
        
        print(f"🔍 PDF Debug - Site Settings Found: {site_settings is not None}")
        if site_settings:
            print(f"🔍 PDF Debug - Footer Use Logo: {site_settings.footer_use_logo}")
            print(f"🔍 PDF Debug - Footer Logo Path: {site_settings.footer_logo}")
            print(f"🔍 PDF Debug - Site Logo Path: {site_settings.site_logo}")
        
        # Get header logo path (site_logo)
        header_logo_path = None
        if site_settings and site_settings.site_logo:
            # Get app directory for logo path
            app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            # Handle both absolute and relative logo paths
            if site_settings.site_logo.startswith('/uploads/'):
                header_logo_path = os.path.join(app_dir, site_settings.site_logo.lstrip('/'))
            elif site_settings.site_logo.startswith('/'):
                header_logo_path = os.path.join(app_dir, 'uploads', site_settings.site_logo.lstrip('/'))
            else:
                header_logo_path = os.path.join(app_dir, 'uploads', 'site', site_settings.site_logo)
            
            # Normalize path for Windows
            header_logo_path = os.path.normpath(header_logo_path)
            
            # Check if logo file exists
            if not os.path.exists(header_logo_path):
                print(f"⚠️ Header logo file not found: {header_logo_path}")
                header_logo_path = None
        
        # Get the correct output directory
        if output_dir is None:
            # Get app directory
            app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            output_dir = os.path.join(app_dir, "uploads", "invoices")
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate filename
        filename = f"invoice_{invoice.invoice_number.replace('-', '_')}.pdf"
        output_path = os.path.join(output_dir, filename)
        
        # Create PDF generator with site settings
        generator = InvoicePDFGenerator(invoice, header_logo_path, site_settings)
        
        # Generate PDF
        pdf_path = generator.generate_pdf(output_path)
        
        # Update invoice record with PDF path (relative to app directory)
        # Use forward slashes for web compatibility
        relative_path = os.path.relpath(output_path, app_dir).replace(os.sep, '/')
        invoice.pdf_path = f"/{relative_path}"
        invoice.pdf_generated_at = datetime.utcnow()
        
        from app import db
        db.session.commit()
        
        print(f"✅ PDF generated successfully: {output_path}")
        return pdf_path
        
    except Exception as e:
        print(f"❌ Error generating PDF for invoice {invoice.invoice_number}: {str(e)}")
        raise e 