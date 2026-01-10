@echo off
REM Quick start script for Windows local development

echo 🚀 Starting Flask Application Setup...

REM Check if virtual environment exists
if not exist ".venv" (
    echo 📦 Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call .venv\Scripts\activate

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo 📝 Please edit .env file with your configuration
)

REM Initialize database
echo 🗄️  Initializing database...
python init_db.py

REM Start application
echo ✅ Setup complete! Starting application...
echo 🌐 Application will be available at http://localhost:5000
python run.py

pause
