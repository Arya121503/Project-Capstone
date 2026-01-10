# 🚀 Quick Start - Deploy Gratis ke Render

## Langkah Cepat (5 Menit)

### 1. Push ke GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy di Render
1. Buka [render.com](https://render.com) dan daftar dengan GitHub
2. Klik **New +** → **Blueprint**
3. Pilih repository ini
4. Klik **Apply**
5. Tunggu 5-10 menit ✨

### 3. Selesai!
Aplikasi Anda live di: `https://nama-app.onrender.com`

---

## ⚠️ Catatan Penting

### Database
- PostgreSQL gratis 90 hari, bisa diperpanjang
- Export backup sebelum expire: `pg_dump`

### Free Tier Limitations
- App sleep setelah 15 menit tidak aktif
- 750 jam/bulan (cukup untuk 1 bulan penuh)
- Cold start ~30 detik saat wake up

### File Model ML
Jika model >100MB:
```bash
git lfs install
git lfs track "model/**/*.pkl"
git add .gitattributes model/
git commit -m "Track models with Git LFS"
git push
```

---

## 📖 Dokumentasi Lengkap
Lihat [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) untuk panduan detail.

## 🆘 Troubleshooting
- Build gagal? Pastikan `build.sh` executable
- Database error? Cek environment variables
- App crash? Lihat logs di Render dashboard

**Selamat! Aplikasi Anda sekarang online! 🎉**
