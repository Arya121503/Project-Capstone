# Deployment Checklist for Railway

## Pre-Deployment
- [ ] All code changes committed and pushed to GitHub
- [ ] `.env` file NOT committed (check .gitignore)
- [ ] `requirements.txt` up to date
- [ ] Database models tested locally
- [ ] All tests passing

## Railway Setup
- [ ] Railway account created and connected to GitHub
- [ ] New project created in Railway
- [ ] Repository linked to Railway project
- [ ] PostgreSQL database added to project
- [ ] Environment variables configured:
  - [ ] SECRET_KEY (random, secure)
  - [ ] FLASK_ENV=production
- [ ] Custom domain configured (optional)

## Post-Deployment
- [ ] Deployment succeeded (check logs)
- [ ] Database initialized (`railway run python init_db.py`)
- [ ] Application accessible via Railway URL
- [ ] Test login functionality
- [ ] Test prediction endpoints
- [ ] Test file uploads (if any)
- [ ] Check static files loading
- [ ] Monitor logs for errors
- [ ] Test all critical user flows

## Monitoring
- [ ] Set up error monitoring
- [ ] Configure log retention
- [ ] Set up usage alerts
- [ ] Document deployment URL
- [ ] Share access with team members

## Security
- [ ] SECRET_KEY changed from default
- [ ] Debug mode disabled in production
- [ ] HTTPS enabled (automatic with Railway)
- [ ] Database credentials secure
- [ ] No sensitive data in logs
- [ ] CORS configured properly

## Performance
- [ ] Check application response time
- [ ] Monitor memory usage
- [ ] Check database query performance
- [ ] Optimize static file serving
- [ ] Configure caching if needed

## Rollback Plan
- [ ] Document rollback procedure
- [ ] Keep previous working commit hash
- [ ] Database backup strategy in place
- [ ] Know how to revert deployment in Railway

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Railway URL**: ___________
**Commit Hash**: ___________
