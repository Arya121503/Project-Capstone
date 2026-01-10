# Railway Deployment Files

File-file berikut telah ditambahkan untuk mendukung deployment ke Railway:

## File Konfigurasi

### 1. Procfile
Mendefinisikan command untuk menjalankan aplikasi di Railway menggunakan Gunicorn.

### 2. railway.toml
Konfigurasi Railway-specific untuk build dan deployment settings.

### 3. runtime.txt
Menentukan versi Python yang akan digunakan (3.11.0).

### 4. .railwayignore
Daftar file dan folder yang tidak perlu di-upload ke Railway (mirip .gitignore).

### 5. .env.example
Template untuk environment variables yang diperlukan.

## Perubahan File

### requirements.txt
- Dihapus `mysql-connector-python` (tidak diperlukan di Railway)
- Dihapus `Flask-MySQLdb` (tidak diperlukan di Railway)
- Ditambahkan `gunicorn` untuk production server
- Ditambahkan `psycopg2-binary` untuk PostgreSQL support
- Ditambahkan versi spesifik untuk semua dependencies

### requirements-local.txt (Baru)
- File terpisah untuk development lokal dengan MySQL dependencies
- Digunakan saat development lokal saja

### run.py
- Port sekarang dinamis dari environment variable `PORT`
- Debug mode otomatis disabled di production (`FLASK_ENV=production`)

### config.py
- Support untuk DATABASE_URL (Railway PostgreSQL)
- Fallback ke MySQL untuk development lokal
- Auto-convert postgres:// ke postgresql://

### app/__init__.py
- Conditional MySQL initialization (hanya untuk local)
- Support PostgreSQL untuk production
- Better database connection handling

## Cara Deploy

Lihat panduan lengkap di [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)

Quick steps:
1. Push code ke GitHub
2. Login ke Railway.app
3. Deploy from GitHub repo
4. Add PostgreSQL database
5. Set environment variables
6. Done! ✨
