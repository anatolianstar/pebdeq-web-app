#!/bin/bash

# Automatic Deployment Script for PEBDEQ E-commerce Platform
# Bu script hem local hem de production deployment'ı yönetir

echo "🚀 PEBDEQ Deployment Script"
echo "=========================="

# Environment detection
if [[ "$1" == "production" ]]; then
    ENV="production"
    echo "📦 Production deployment mode"
elif [[ "$1" == "development" ]]; then
    ENV="development"
    echo "🔧 Development setup mode"
else
    echo "❌ Usage: ./deploy.sh [production|development]"
    echo "Example: ./deploy.sh production"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "🔍 Checking dependencies..."
if ! command_exists node; then
    echo "❌ Node.js is not installed"
    exit 1
fi
if ! command_exists npm; then
    echo "❌ npm is not installed"
    exit 1
fi
if ! command_exists python3; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✅ All dependencies found"

# Frontend setup
echo "🎨 Setting up Frontend..."
cd frontend || exit 1

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend for production
if [[ "$ENV" == "production" ]]; then
    echo "🏗️ Building frontend for production..."
    npm run build
    echo "✅ Frontend build completed"
else
    echo "🔧 Frontend ready for development"
fi

cd ..

# Backend setup
echo "🔧 Setting up Backend..."
cd backend || exit 1

# Create virtual environment if it doesn't exist
if [[ ! -d "venv" ]]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate || source venv/Scripts/activate

# Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install -r requirements.txt

# Environment configuration
if [[ "$ENV" == "production" ]]; then
    # Production environment setup
    echo "⚙️ Setting up production environment..."
    
    # Copy production environment file if it doesn't exist
    if [[ ! -f ".env" ]]; then
        echo "📋 Creating production environment file..."
        cp env.production.example .env
        echo "⚠️ Please edit .env file with your production values!"
    fi
    
    # Set Flask environment
    export FLASK_ENV=production
    export FLASK_DEBUG=False
    
    echo "🏭 Production environment configured"
else
    # Development environment setup
    echo "🔧 Setting up development environment..."
    export FLASK_ENV=development
    export FLASK_DEBUG=True
    echo "🛠️ Development environment configured"
fi

# Database initialization
echo "🗄️ Initializing database..."
python -c "
from app import create_app, db
app = create_app()
with app.app_context():
    db.create_all()
    print('✅ Database initialized')
"

# Return to project root
cd ..

# Final instructions
echo ""
echo "🎉 Deployment completed successfully!"
echo "=================================="

if [[ "$ENV" == "production" ]]; then
    echo "📁 Frontend build: frontend/build/"
    echo "🐍 Backend: backend/ (with activated venv)"
    echo "⚠️ Don't forget to:"
    echo "   1. Edit backend/.env with your production values"
    echo "   2. Configure your web server (Nginx)"
    echo "   3. Set up process manager (systemd/supervisor)"
    echo ""
    echo "🚀 To start backend in production:"
    echo "   cd backend && source venv/bin/activate && python run.py"
else
    echo "🔧 Development setup complete!"
    echo "🚀 To start development:"
    echo "   Frontend: cd frontend && npm start"
    echo "   Backend: cd backend && source venv/bin/activate && python run.py"
fi

echo ""
echo "📚 Environment Configuration:"
echo "   - Frontend: Automatic localhost/production detection"
echo "   - Backend: Environment variables in backend/.env"
echo "   - CORS: Automatically configured for environment" 