# 🚀 Quick Start: Inisialisasi Database Railway

## ⚡ Cara Tercepat (Recommended)

### **Opsi 1: Temporary Build Command**

1. **Buka Railway Dashboard:**
   - Go to: https://railway.app/project/accomplished-quietude
   - Pilih service **web-production-8111a**

2. **Edit Build Command:**
   - Klik tab **"Settings"**
   - Scroll ke **"Build Command"**
   - Isi dengan:
     ```bash
     pip install -r requirements.txt && python railway_init_db.py
     ```
   - Klik **"Save"**

3. **Trigger Deploy:**
   - Railway akan otomatis redeploy
   - Tunggu hingga build selesai
   - Cek logs untuk verifikasi

4. **Hapus Build Command:**
   - Setelah berhasil, hapus build command (biarkan kosong)
   - Ini hanya perlu dijalankan 1x saja

---

## 📋 Opsi 2: Via Railway CLI (Setelah PostgreSQL Ready)

Jika Anda mengalami error `ModuleNotFoundError: No module named 'psycopg2'` saat run dari lokal, itu **NORMAL**. Script harus dijalankan di Railway environment.

### **Cara Deploy & Run di Railway:**

```bash
# 1. Commit semua perubahan
git add .
git commit -m "Add Railway database initialization"
git push origin main

# 2. Deploy ke Railway (otomatis atau manual trigger)
railway up

# 3. Setelah deploy selesai, jalankan init
railway run --service web-production-8111a python railway_init_db.py
```

---

## 🔧 Opsi 3: One-Time Job (Advanced)

1. Railway Dashboard → Project → **New**
2. Pilih **"Empty Service"**
3. Link ke GitHub repo yang sama
4. Settings → **Start Command:**
   ```bash
   python railway_init_db.py
   ```
5. Deploy → Tunggu selesai → Hapus service

---

## ✅ Verifikasi Database

Setelah init berhasil, verifikasi dengan:

```bash
# Via Railway CLI
railway run --service web-production-8111a python -c "from app import create_app, db; app = create_app(); app.app_context().push(); from sqlalchemy import inspect; tables = inspect(db.engine).get_table_names(); print('Tables:', tables)"
```

Expected output:
```
Tables: ['admin_notifications', 'rental_assets', 'rental_requests', 'rental_transactions', 'user_favorites', 'user_notification']
```

---

## 📝 Catatan Penting

### Error yang NORMAL saat run dari lokal:
```
ModuleNotFoundError: No module named 'psycopg2'
```
**Solusi:** Jangan run dari lokal! Run di Railway environment.

### Cara yang BENAR:
1. ✅ Push code ke GitHub
2. ✅ Railway auto-deploy
3. ✅ Run `railway_init_db.py` di Railway (via build command atau CLI)

### Cara yang SALAH:
1. ❌ Run `railway run python railway_init_db.py` dari komputer lokal yang tidak punya psycopg2

---

## 🎯 Langkah Selanjutnya

Setelah database ter-initialize:

1. ✅ Buka aplikasi: https://web-production-8111a.up.railway.app/
2. ✅ Test koneksi database
3. ✅ Upload data awal jika diperlukan
4. ✅ Setup admin user melalui interface aplikasi

**Happy Deploying! 🎉**
