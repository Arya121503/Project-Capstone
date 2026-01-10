# 🚀 Quick Reference - Railway Deployment

## Ringkasan Singkat

Project ini sudah dikonfigurasi untuk deploy ke **Railway** dengan mudah!

## ⚡ Quick Deploy (3 Langkah)

```bash
# 1. Push ke GitHub
git add .
git commit -m "Deploy to Railway"
git push origin main

# 2. Deploy di Railway
# - Login ke railway.app dengan GitHub
# - Click "New Project" → "Deploy from GitHub"
# - Pilih repo: Arya121503/Project-Capstone
# - Add PostgreSQL database

# 3. Set Environment Variables di Railway Dashboard
SECRET_KEY=your-random-secret-key
FLASK_ENV=production
```

**Done!** 🎉 App akan live di `https://[project-name].up.railway.app`

## 📁 File yang Ditambahkan

| File | Fungsi |
|------|--------|
| `Procfile` | Command untuk start app dengan Gunicorn |
| `railway.toml` | Konfigurasi Railway build & deploy |
| `runtime.txt` | Versi Python (3.11.0) |
| `.railwayignore` | File yang tidak di-upload ke Railway |
| `.env.example` | Template environment variables |
| `init_db.py` | Script inisialisasi database |

## 🔧 Commands Penting

### Local Development
```bash
# Setup & run local
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python init_db.py
python run.py
```

### Railway CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login & deploy
railway login
railway link
railway up

# View logs
railway logs

# Run commands
railway run python init_db.py
```

### Database
```bash
# Initialize DB (Railway)
railway run python init_db.py

# Connect to PostgreSQL
railway connect postgres
```

## 🌍 Environment Variables

### Required (Set di Railway Dashboard)
```env
SECRET_KEY=random-secret-key-here
FLASK_ENV=production
```

### Auto-set by Railway
```env
DATABASE_URL=postgresql://...
PORT=5000
RAILWAY_ENVIRONMENT=production
```

## 📊 Monitoring

```bash
# View real-time logs
railway logs --follow

# Check deployment status
railway status

# View metrics
# Go to Railway Dashboard → Metrics
```

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build failed | Check `railway logs` for errors |
| Module not found | Update `requirements.txt` |
| DB connection error | Check PostgreSQL added & DATABASE_URL set |
| App timeout | Increase timeout in `Procfile` |
| 503 Error | App might be sleeping, wait 10-15 seconds |

## 💰 Railway Free Tier

- ✅ $5 credit/month gratis
- ✅ 500 execution hours
- ✅ PostgreSQL included
- ⚠️ Sleep after 30min idle
- ⚠️ 1GB RAM limit

## 📚 Documentation

- **Panduan Lengkap**: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Changes Log**: [DEPLOYMENT_CHANGES.md](DEPLOYMENT_CHANGES.md)
- **Railway Docs**: https://docs.railway.app

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Project GitHub**: https://github.com/Arya121503/Project-Capstone

---

**Quick Start**: Push ke GitHub → Deploy di Railway → Set ENV vars → Done! ✨
