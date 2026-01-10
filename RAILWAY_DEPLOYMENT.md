# 🚂 Panduan Deployment ke Railway

Panduan lengkap untuk deploy aplikasi Sistem Prediksi Harga Properti Telkom ke Railway.

## 📋 Prerequisites

1. **Akun GitHub** - Project harus sudah di-push ke GitHub repository
2. **Akun Railway** - Daftar gratis di [railway.app](https://railway.app)
3. **Repository sudah di-push** - Pastikan semua file sudah ter-commit dan ter-push

## 🚀 Langkah-Langkah Deployment

### 1. Persiapan Repository

Pastikan file-file berikut sudah ada di repository Anda:
- ✅ `Procfile` - Konfigurasi start command
- ✅ `railway.toml` - Konfigurasi Railway
- ✅ `runtime.txt` - Versi Python
- ✅ `requirements.txt` - Dependencies Python
- ✅ `.railwayignore` - File yang diabaikan saat deploy

### 2. Push ke GitHub

```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 3. Deploy ke Railway

#### Opsi A: Deploy dari GitHub (Recommended)

1. **Login ke Railway**
   - Kunjungi [railway.app](https://railway.app)
   - Klik "Login" dan pilih "Login with GitHub"
   - Authorize Railway untuk akses repository Anda

2. **Create New Project**
   - Klik "New Project"
   - Pilih "Deploy from GitHub repo"
   - Pilih repository: `Arya121503/Project-Capstone`
   - Railway akan otomatis detect dan deploy aplikasi

3. **Add Database (PostgreSQL)**
   - Klik "New" di project Anda
   - Pilih "Database" → "Add PostgreSQL"
   - Railway akan membuat PostgreSQL database dan set environment variable `DATABASE_URL`

#### Opsi B: Deploy dengan Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project atau create new
railway link

# Deploy
railway up
```

### 4. Konfigurasi Environment Variables

Di Railway Dashboard, tambahkan environment variables berikut:

#### Required Variables:
```
SECRET_KEY=your-secret-key-here-change-this
FLASK_ENV=production
PORT=5000
```

#### Optional Variables (jika pakai MySQL eksternal):
```
MYSQL_HOST=your-mysql-host
MYSQL_USER=your-mysql-user
MYSQL_PASSWORD=your-mysql-password
MYSQL_DB=db_kp
MYSQL_PORT=3306
```

**Catatan**: Railway sudah otomatis set `DATABASE_URL` untuk PostgreSQL

### 5. Migrate Database

Setelah deploy berhasil, jalankan migration:

```bash
# Via Railway CLI
railway run flask db upgrade

# Atau via Railway Dashboard
# Settings → Deploy → Add Variable: 
# Name: RUN_MIGRATION
# Value: true
```

### 6. Generate Domain

Railway akan memberikan URL secara otomatis:
- Format: `https://project-capstone-production.up.railway.app`
- Atau bisa custom domain di Settings → Domains

## 🔧 Troubleshooting

### Error: Module not found

**Solusi**: Pastikan semua dependencies ada di `requirements.txt`

```bash
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements.txt"
git push
```

### Error: Database connection failed

**Solusi**: 
1. Pastikan PostgreSQL database sudah ditambahkan
2. Check environment variable `DATABASE_URL` sudah ter-set
3. Restart deployment

### Error: Application timeout

**Solusi**: Increase timeout di `Procfile`:
```
web: gunicorn run:app --bind 0.0.0.0:$PORT --workers 4 --timeout 180
```

### Build Error

**Solusi**:
1. Check build logs di Railway Dashboard
2. Pastikan `runtime.txt` memiliki versi Python yang valid
3. Test build locally:
   ```bash
   pip install -r requirements.txt
   gunicorn run:app
   ```

## 📊 Monitoring

### View Logs
```bash
railway logs
```

### Check Deployment Status
- Railway Dashboard → Deployments
- Lihat real-time logs dan metrics

### Database Management
```bash
# Connect to PostgreSQL
railway connect postgres

# Run SQL queries
\dt  # List tables
SELECT * FROM users LIMIT 10;
```

## 💰 Biaya dan Limitasi

### Railway Free Tier:
- ✅ $5 credit/bulan gratis
- ✅ 500 jam execution/bulan
- ✅ PostgreSQL database included
- ✅ Custom domain support
- ⚠️ Sleep after 30 menit tidak ada traffic
- ⚠️ 1GB RAM limit
- ⚠️ 1GB disk space

### Tips Menghemat Credit:
1. Set sleep policy untuk non-production
2. Optimize startup time
3. Reduce memory usage
4. Monitor usage di Dashboard

## 🔄 Update Aplikasi

Setiap kali push ke GitHub, Railway otomatis redeploy:

```bash
# Make changes to your code
git add .
git commit -m "Update feature X"
git push origin main

# Railway akan otomatis detect dan redeploy
```

## 🛡️ Security Best Practices

1. **Ganti SECRET_KEY** di environment variables
2. **Jangan commit** file `.env` ke repository
3. **Enable HTTPS** (otomatis di Railway)
4. **Set proper CORS** untuk production
5. **Disable debug mode** di production

## 📝 Checklist Sebelum Go Live

- [ ] SECRET_KEY sudah diganti
- [ ] Database migration sudah dijalankan
- [ ] Environment variables sudah di-set
- [ ] Test semua endpoint API
- [ ] Test upload file dan static files
- [ ] Check logs tidak ada error
- [ ] Domain sudah dikonfigurasi
- [ ] SSL/HTTPS sudah aktif

## 🆘 Support

Jika mengalami masalah:
1. Check [Railway Docs](https://docs.railway.app)
2. Check build logs di Railway Dashboard
3. Join [Railway Discord](https://discord.gg/railway)

## 🎉 Selesai!

Aplikasi Anda sekarang sudah live di Railway dan dapat diakses secara online!

URL: `https://your-project.up.railway.app`

---

**Last Updated**: January 2026
