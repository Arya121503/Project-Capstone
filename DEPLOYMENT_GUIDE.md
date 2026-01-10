# 🚀 Panduan Deploy Gratis ke Render

## 📋 Ringkasan
Aplikasi ini dapat di-hosting **GRATIS** menggunakan Render.com dengan database PostgreSQL gratis.

## ✨ Fitur Render Free Tier
- ✅ 750 jam komputasi gratis per bulan
- ✅ Database PostgreSQL gratis (90 hari, dapat diperpanjang)
- ✅ SSL/HTTPS otomatis
- ✅ Auto-deploy dari GitHub
- ✅ Custom domain support

---

## 📝 Langkah-langkah Deployment

### 1️⃣ Persiapan Repository

1. **Push kode ke GitHub** (jika belum):
```bash
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

2. **Pastikan file berikut sudah ada**:
   - ✅ `render.yaml` - Konfigurasi deployment
   - ✅ `requirements.txt` - Dependencies Python
   - ✅ `Procfile` - Command untuk menjalankan app
   - ✅ `build.sh` - Script build
   - ✅ `runtime.txt` - Versi Python

---

### 2️⃣ Setup Akun Render

1. Buka [https://render.com](https://render.com)
2. Klik **"Get Started"** atau **"Sign Up"**
3. Pilih **"Sign up with GitHub"** untuk koneksi langsung
4. Authorize Render untuk akses repository Anda

---

### 3️⃣ Deploy Aplikasi

#### **Opsi A: Deploy dengan Blueprint (Recommended)**

1. Di dashboard Render, klik **"New +"** → **"Blueprint"**
2. Connect repository GitHub Anda
3. Render akan otomatis mendeteksi `render.yaml`
4. Klik **"Apply"** untuk mulai deployment
5. Tunggu proses build selesai (5-10 menit)

#### **Opsi B: Deploy Manual**

1. **Buat Database PostgreSQL:**
   - Dashboard → **"New +"** → **"PostgreSQL"**
   - Name: `capstone-db`
   - Database: `capstone_property`
   - User: `capstone_user`
   - Klik **"Create Database"**

2. **Buat Web Service:**
   - Dashboard → **"New +"** → **"Web Service"**
   - Connect repository GitHub
   - Settings:
     - **Name**: `capstone-property-app`
     - **Environment**: `Python 3`
     - **Build Command**: `./build.sh`
     - **Start Command**: `gunicorn run:app`

3. **Set Environment Variables:**
   ```
   SECRET_KEY=<generate-random-string>
   DATABASE_URL=<copy-dari-database-internal-url>
   MYSQL_HOST=<dari-database-host>
   MYSQL_PORT=<dari-database-port>
   MYSQL_USER=<dari-database-user>
   MYSQL_PASSWORD=<dari-database-password>
   MYSQL_DB=capstone_property
   ```

4. Klik **"Create Web Service"**

---

### 4️⃣ Konfigurasi Database

Setelah database dibuat, Anda perlu mengimport schema:

1. **Akses Database Shell** di Render:
   - Buka database di dashboard
   - Klik tab **"Connect"**
   - Pilih **"External Connection"**
   - Copy connection string

2. **Import Database** (dari lokal):
```bash
# Install PostgreSQL client jika belum
# Windows: Download dari https://www.postgresql.org/download/

# Connect dan import
psql <connection-string> < instance/db_KP.sql
```

Atau buat tabel secara manual menggunakan Flask-Migrate:
```bash
# Di terminal lokal dengan env variables dari Render
export DATABASE_URL=<render-database-url>
flask db upgrade
```

---

### 5️⃣ Upload File Model ML

Model machine learning perlu diupload karena ukurannya besar:

**Opsi 1: Gunakan Git LFS**
```bash
# Install Git LFS
git lfs install

# Track file model
git lfs track "model/**/*.pkl"
git lfs track "model/**/*.joblib"

# Commit dan push
git add .gitattributes
git add model/
git commit -m "Add ML models with Git LFS"
git push
```

**Opsi 2: Upload ke Cloud Storage**
- Upload model ke Google Drive / Dropbox
- Saat startup, download model otomatis
- Simpan di `/tmp` directory di Render

---

### 6️⃣ Testing

1. Tunggu deployment selesai
2. Render akan memberikan URL: `https://capstone-property-app.onrender.com`
3. Buka URL tersebut di browser
4. Test fitur-fitur utama:
   - ✅ Login/Register
   - ✅ Dashboard
   - ✅ Prediksi harga
   - ✅ Rental management

---

## 🔧 Troubleshooting

### Build Failed
- Periksa `build.sh` memiliki permission execute:
  ```bash
  chmod +x build.sh
  git add build.sh
  git commit -m "Fix build.sh permissions"
  git push
  ```

### Database Connection Error
- Pastikan environment variables sudah benar
- Cek DATABASE_URL format: `postgresql://user:password@host:port/database`
- Untuk MySQL di Render, gunakan external database (PlanetScale, Railway)

### Application Error
- Cek logs di Render dashboard → Logs tab
- Pastikan semua dependencies di `requirements.txt`
- Cek database tables sudah dibuat

### Model Not Found
- Pastikan folder `model/` ter-commit ke Git
- Jika file besar (>100MB), gunakan Git LFS
- Atau download model dari cloud storage saat startup

---

## 💡 Tips Optimasi

1. **Gunakan Environment Variables**
   - Jangan hardcode credentials
   - Simpan di Render environment variables

2. **Database Backup**
   - Render free database expire 90 hari
   - Export backup reguler dengan `pg_dump`
   - Setup auto-backup script

3. **Monitor Usage**
   - Free tier: 750 jam/bulan
   - App sleep setelah 15 menit inactive
   - First request setelah sleep akan lambat (cold start)

4. **Upgrade jika Perlu**
   - Starter plan: $7/bulan (always on)
   - Database persisten tanpa expire

---

## 🌐 Platform Hosting Gratis Alternatif

### 1. **Railway** (Recommended)
- Database: PostgreSQL/MySQL gratis
- Deploy: Git push
- Free tier: $5 credit/bulan
- Link: [railway.app](https://railway.app)

### 2. **Fly.io**
- 3 VMs gratis
- PostgreSQL gratis (3GB)
- Global deployment
- Link: [fly.io](https://fly.io)

### 3. **PythonAnywhere**
- Free tier untuk aplikasi kecil
- MySQL database
- Limited CPU time
- Link: [pythonanywhere.com](https://www.pythonanywhere.com)

### 4. **Vercel** (Untuk Frontend)
- Gratis untuk static sites
- Tidak support backend Flask langsung
- Perlu split frontend/backend
- Link: [vercel.com](https://vercel.com)

---

## 📚 Dokumentasi Tambahan

- [Render Documentation](https://render.com/docs)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/3.0.x/deploying/)
- [PostgreSQL on Render](https://render.com/docs/databases)

---

## 🆘 Bantuan

Jika mengalami masalah:
1. Cek logs di Render dashboard
2. Review environment variables
3. Test koneksi database
4. Hubungi Render support (sangat responsif!)

**Selamat Deploy! 🎉**
