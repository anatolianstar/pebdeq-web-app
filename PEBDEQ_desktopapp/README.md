# PEBDEQ E-Commerce Platform

A comprehensive e-commerce platform built with Flask (backend) and React (frontend), featuring advanced email management, product catalog, order processing, and admin dashboard.

## 📁 Project Structure

```
pebdeq-home/
├── 🚀 deployment/          # Deployment tools and configuration
├── 📦 archive/             # Archived files and backups
├── 🔧 backend/             # Flask API server
├── 🌐 frontend/            # React web application  
├── 🧪 pb_test_suite/       # Testing infrastructure
├── 📊 reports/             # Test and analysis reports
├── 📤 uploads/             # User uploaded files
└── 📚 Documentation files
```

## Features

### 🛒 E-Commerce Core
- **Product Management** - Categories, variations, inventory tracking
- **Shopping Cart** - Session-based cart with real-time updates
- **Order Processing** - Complete order lifecycle management
- **Payment Integration** - Secure payment processing
- **Invoice System** - Automated invoice generation and delivery

### 📧 Email Management System
- **Template Engine** - HTML/Text email templates with variable substitution
- **Email Queue** - Batch processing with priority and retry mechanisms
- **Analytics** - Delivery tracking, open rates, click tracking
- **SMTP Configuration** - Flexible email provider support
- **Marketing Tools** - Newsletter management and campaigns

### 👤 User Management
- **Authentication** - Login/register with Google OAuth support
- **User Profiles** - Complete user profile management
- **Admin Dashboard** - Comprehensive administration interface
- **Role-based Access** - Admin and user permission levels

### 🎨 Theming & Customization
- **Dynamic Themes** - Multiple pre-built themes with custom theme builder
- **Responsive Design** - Mobile-first responsive interface
- **Site Settings** - Configurable site branding and settings
- **Content Management** - Dynamic page content and blog system

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- SQLite (included) or PostgreSQL/MySQL

### 1. Clone and Setup
```bash
git clone https://github.com/your-username/pebdeq.git
cd pebdeq-home

# Quick deployment (recommended)
cd deployment && python deployment_gui.py

# Manual setup
cd ../backend && pip install -r requirements.txt
cd ../frontend && npm install
```

### 2. Initialize Email System
```bash
cd backend
python init_email_templates.py
```

### 3. Run the Application
```bash
# Backend (Terminal 1)
cd backend
python run.py

# Frontend (Terminal 2)  
cd frontend
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5005
- **Admin Dashboard**: http://localhost:3000/admin

## Email System Setup

### Quick Setup
The email system includes 7 pre-built templates and comprehensive management tools:

```bash
# Initialize templates after GitHub pull
cd backend
python init_email_templates.py
```

### Available Email Templates
- **welcome** - New user welcome emails
- **order_confirmation** - Order confirmation notifications
- **invoice** - Invoice delivery emails  
- **shipping_notification** - Shipping status updates
- **newsletter** - Marketing newsletters
- **payment_confirmation** - Payment confirmations
- **order_status_update** - Order status notifications

### Configuration
1. **Via Admin Panel**: Navigate to Email Management → Settings
2. **Via Environment**: Copy `backend/.env.template` to `backend/.env`

For detailed email setup, see [README_EMAIL_SETUP.md](README_EMAIL_SETUP.md)

## Project Structure

```
pebdeq/
├── backend/                 # Flask API backend
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Utilities and services
│   ├── init_email_templates.py  # Email template initializer
│   └── run.py              # Application entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── themes/         # Theme definitions
│   └── public/             # Static assets
├── uploads/                # File upload storage
├── pb_test_suite/          # Comprehensive test suite
├── README_EMAIL_SETUP.md   # Email system documentation
└── setup_email_system.py   # Quick setup script
```

## Technology Stack

### Backend
- **Flask** - Web framework
- **SQLAlchemy** - ORM and database management
- **Flask-Mail** - Email functionality
- **Flask-CORS** - Cross-origin resource sharing
- **SQLite/PostgreSQL** - Database options

### Frontend  
- **React** - UI framework
- **React Router** - Client-side routing
- **Context API** - State management
- **CSS3** - Styling with custom themes
- **Responsive Design** - Mobile-first approach

### Email System
- **SMTP Integration** - Multiple provider support
- **Template Engine** - Variable substitution
- **Queue Management** - Batch processing
- **Analytics** - Delivery and engagement tracking

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python run.py
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Database Management
```bash
# Create migration
cd backend
flask db migrate -m "Description"

# Apply migration
flask db upgrade

# Reset database (development)
python db_reset.py
```

## Testing

### Comprehensive Test Suite
```bash
cd pb_test_suite
pip install -r requirements.txt

# Run all tests
python -m pytest

# Specific test categories
python scripts/run_auth_tests.py
python scripts/run_product_tests.py
python scripts/run_email_tests.py
```

### Email Testing
- **Test Mode** - Enable in email settings to prevent actual sending
- **Test Email** - Send test emails via admin dashboard
- **Template Preview** - Live preview of email templates

## Configuration

### Environment Variables
Create `backend/.env` from template:

```bash
# Database
DATABASE_URL=sqlite:///instance/pebdeq.db

# Email Settings
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Security
SECRET_KEY=your-secret-key-here
```

### Gmail Configuration
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use settings: smtp.gmail.com:587 with TLS

## API Documentation

### Email API Endpoints
- `GET /api/admin/email/templates` - List email templates
- `POST /api/admin/email/templates` - Create new template
- `PUT /api/admin/email/templates/{id}` - Update template
- `GET /api/admin/email/queue` - View email queue
- `POST /api/admin/email/test` - Send test email

### E-Commerce API
- `GET /api/products` - List products
- `POST /api/orders` - Create order
- `GET /api/admin/orders` - Admin order management
- `POST /api/cart/add` - Add to cart

## Security Features

- **Password Encryption** - Secure password hashing
- **Session Management** - Secure session handling
- **CSRF Protection** - Cross-site request forgery protection
- **Rate Limiting** - Email rate limiting and spam prevention
- **Input Validation** - Comprehensive input sanitization

## Deployment

### Production Setup
1. Set environment variables
2. Configure production database
3. Set up SMTP credentials
4. Enable email system
5. Configure domain and SSL

### Environment-Specific Settings
- **Development** - SQLite, test mode emails
- **Production** - PostgreSQL/MySQL, live emails
- **Testing** - In-memory database, mock emails

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Test email functionality thoroughly

## Troubleshooting

### Common Issues

**Email templates not appearing:**
```bash
cd backend
python init_email_templates.py
```

**SMTP authentication failed:**
- Check credentials and use app-specific passwords
- Verify SMTP server and port settings

**Database issues:**
```bash
cd backend
python db_reset.py  # Development only
```

**Frontend build errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- 📧 **Email Setup**: See [README_EMAIL_SETUP.md](README_EMAIL_SETUP.md)
- 🧪 **Testing**: See [TEST_SUITE_PLAN.md](TEST_SUITE_PLAN.md)
- 🎨 **Themes**: See [THEME_SYSTEM_GUIDE.md](THEME_SYSTEM_GUIDE.md)
- 📝 **Tasks**: See [TODO_LIST.md](TODO_LIST.md)

## Recent Updates

- ✅ Complete email management system with templates
- ✅ Email queue processing and analytics
- ✅ New template creation functionality
- ✅ SMTP configuration and testing
- ✅ Gmail integration support
- ✅ Responsive email templates
- ✅ Variable substitution system

