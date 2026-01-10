#!/bin/bash
# Quick start script for local development

echo "🚀 Starting Flask Application Setup..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
fi

# Initialize database
echo "🗄️  Initializing database..."
python init_db.py

# Start application
echo "✅ Setup complete! Starting application..."
echo "🌐 Application will be available at http://localhost:5000"
python run.py
