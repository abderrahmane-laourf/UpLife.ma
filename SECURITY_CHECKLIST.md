# 🔐 UpLife.ma - Security Checklist

## ⚠️ BEFORE PUSHING TO PUBLIC REPOSITORY

This document lists all sensitive data that MUST be secured before making this repository public.

---

## ✅ .gitignore Files Status

### Root .gitignore ✅
**Location:** `/.gitignore`
- [x] Created comprehensive root .gitignore
- [x] Covers all sensitive files
- [x] Includes environment variables
- [x] Protects database files
- [x] Secures API keys

### Backend .gitignore ✅
**Location:** `/backend/.gitignore`
- [x] Enhanced with detailed comments
- [x] Protects .env files
- [x] Excludes database files
- [x] Ignores node_modules
- [x] Blocks sensitive credentials

### Frontend .gitignore ✅
**Location:** `/frontend/.gitignore`
- [x] Enhanced with security sections
- [x] Protects environment files
- [x] Excludes build artifacts
- [x] Ignores cache files

### Evolution API .gitignore
**Location:** `/evolution-api/.gitignore`
- [ ] Check if exists
- [ ] Should protect instances/
- [ ] Should ignore store/
- [ ] Should block .env files

---

## 🚨 CRITICAL FILES TO NEVER COMMIT

### 1. Environment Variables (.env files)

**Backend .env** - `/backend/.env`
```env
# NEVER COMMIT THESE VALUES!
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
REDIS_URL=redis://...
WHATSAPP_API_KEY=...
EVOLUTION_API_URL=...
```

**Frontend .env** - `/frontend/.env` (if exists)
```env
# NEVER COMMIT!
VITE_API_URL=http://localhost:3000
VITE_API_KEY=...
```

**Evolution API .env** - `/evolution-api/.env`
```env
# NEVER COMMIT!
API_KEY=...
DATABASE_URL=...
# All WhatsApp credentials
```

### 2. Database Files

❌ NEVER COMMIT:
- `*.db`
- `*.sqlite`
- `*.sqlite3`
- `backend/prisma/dev.db`
- `backend/prisma/*.db`

### 3. Node Modules

❌ NEVER COMMIT:
- `node_modules/` (anywhere)
- `**/node_modules/`

### 4. Credentials & Keys

❌ NEVER COMMIT:
- `*.pem`
- `*.key`
- `*.cert`
- `credentials/`
- `secrets/`

### 5. User Data & Uploads

❌ NEVER COMMIT:
- `uploads/`
- `public/uploads/`
- `user-data/`

### 6. WhatsApp Session Data

❌ NEVER COMMIT:
- `evolution-api/instances/`
- `evolution-api/store/`
- `*.data.json`
- `*-auth-info-baileys/`
- `*.session`
- `*.qr`

---

## 📋 Pre-Push Checklist

Before pushing to GitHub, verify:

### 1. Environment Files
- [ ] `/backend/.env` is in .gitignore
- [ ] `/backend/.env` is NOT tracked by git
- [ ] `/frontend/.env` is in .gitignore (if exists)
- [ ] `/evolution-api/.env` is in .gitignore
- [ ] Created `.env.example` files with dummy values

### 2. Database
- [ ] No `.db` files in repo
- [ ] No database URLs in code
- [ ] Prisma schema is safe (no hardcoded URLs)

### 3. API Keys & Secrets
- [ ] No JWT secrets in code
- [ ] No API keys in code
- [ ] No WhatsApp credentials in code
- [ ] All secrets use environment variables

### 4. Git History
- [ ] Check if sensitive data was committed before
- [ ] If yes, rewrite git history (see below)

### 5. Documentation
- [ ] No sensitive data in docs
- [ ] API docs use placeholders
- [ ] README uses example values

---

## 🛠️ How to Create .env.example Files

### Backend .env.example

```bash
cd backend
cat > .env.example << 'EOF'
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/uplife"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-jwt-secret-key-here"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# WhatsApp / Evolution API
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="your-api-key"

# Server
PORT=3000
NODE_ENV="development"
EOF
```

### Frontend .env.example (if needed)

```bash
cd frontend
cat > .env.example << 'EOF'
# API Configuration
VITE_API_URL="http://localhost:3000"
EOF
```

---

## 🔍 How to Check if Sensitive Data is Already in Git

```bash
# 1. Check current tracked files
git ls-files

# 2. Search for .env files
git ls-files | grep -E '\.env$|\.env\.'

# 3. Search git history for sensitive patterns
git log --all --full-history --source --remotes -- "*.env"
git log --all --full-history --source --remotes -- "*.db"

# 4. Search for potential secrets in content
git grep -i "jwt_secret"
git grep -i "database_url"
git grep -i "api_key"
```

---

## 🧹 How to Remove Sensitive Data from Git History

**⚠️ WARNING:** This rewrites git history! Use with caution!

### Option 1: Using BFG Repo-Cleaner (Recommended)

```bash
# 1. Install BFG
# Mac: brew install bfg
# Windows: Download from https://rtyley.github.io/bfg-repo-cleaner/

# 2. Create backup
git clone --mirror your-repo.git your-repo-backup.git

# 3. Remove .env files from history
bfg --delete-files .env your-repo.git
bfg --delete-files '*.db' your-repo.git

# 4. Clean up
cd your-repo.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (careful!)
git push --force
```

### Option 2: Using git filter-branch

```bash
# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push --force --all
git push --force --tags
```

---

## 🔐 Recommended Security Practices

### 1. Use Environment Variables

**❌ Bad:**
```js
const JWT_SECRET = "my-secret-key";
const DB_URL = "postgresql://user:pass@localhost/db";
```

**✅ Good:**
```js
const JWT_SECRET = process.env.JWT_SECRET;
const DB_URL = process.env.DATABASE_URL;
```

### 2. Create Strong Secrets

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate API key
openssl rand -hex 32

# Generate password
openssl rand -base64 32
```

### 3. Use .env.example

Create template files without real values:
```env
# .env.example
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
JWT_SECRET="generate-with-openssl-rand"
```

### 4. Document Environment Variables

In README.md:
```markdown
## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (generate with: `openssl rand -base64 64`)
- `REDIS_URL` - Redis connection string
```

---

## 📝 Files to ALWAYS Keep Public

✅ Safe to commit:
- Source code (`.js`, `.jsx`, `.ts`, `.tsx`)
- Configuration files (without secrets)
- Documentation (`.md`)
- Package files (`package.json`, `package-lock.json`)
- `.gitignore` files
- `.env.example` files (with dummy values)
- Prisma schema (without hardcoded URLs)
- Docker files (without secrets)
- CI/CD configs (without secrets)

---

## 🚀 Pre-Deployment Checklist

Before deploying to production:

### Environment
- [ ] All production secrets set in hosting platform
- [ ] No development secrets in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled

### Database
- [ ] Production database secured
- [ ] Backups configured
- [ ] No public access to database

### API
- [ ] All endpoints require authentication
- [ ] Input validation on all routes
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS enforced

### WhatsApp/Evolution API
- [ ] API key secured
- [ ] Webhook URL secured
- [ ] Session data encrypted
- [ ] QR codes expire

---

## 🔍 Regular Security Audits

Run these checks regularly:

```bash
# 1. Check for exposed secrets
npm install -g @gitguardian/ggshield
ggshield scan repo ./

# 2. Audit dependencies
npm audit
npm audit fix

# 3. Check for hardcoded secrets
grep -r "jwt_secret" .
grep -r "api_key" .
grep -r "password" .
```

---

## 📞 What to Do if Secrets are Exposed

If you accidentally commit secrets:

### Immediate Actions:
1. **Rotate ALL exposed secrets immediately**
   - Change JWT_SECRET
   - Change database passwords
   - Regenerate API keys
   - Revoke WhatsApp sessions

2. **Remove from git history**
   - Use BFG or filter-branch (see above)
   - Force push to remote

3. **Update all environments**
   - Update .env files locally
   - Update hosting platform secrets
   - Restart services

4. **Audit access logs**
   - Check if secrets were used
   - Monitor for suspicious activity

### Prevention:
- [ ] Add pre-commit hooks
- [ ] Use secret scanning tools
- [ ] Review PRs for secrets
- [ ] Train team on security

---

## ✅ Final Verification

Before making repository public, run:

```bash
# 1. Check .gitignore is working
git status
# Should NOT show .env files or node_modules

# 2. Check tracked files
git ls-files | grep -E '\.env$|\.db$|node_modules'
# Should return empty

# 3. Search for potential secrets
git grep -i "secret"
git grep -i "password"
git grep -i "api_key"
# Review results, ensure no real secrets

# 4. Test .env.example
cp backend/.env.example backend/.env.test
# Verify it has placeholder values

# 5. Verify .gitignore files exist
ls -la .gitignore
ls -la backend/.gitignore
ls -la frontend/.gitignore
```

---

## 🎯 Summary

### ✅ Completed:
- [x] Root `.gitignore` created
- [x] Backend `.gitignore` enhanced
- [x] Frontend `.gitignore` enhanced
- [x] Documentation created

### ⚠️ TODO Before Public Push:
- [ ] Create `.env.example` files
- [ ] Remove any committed .env files from history
- [ ] Verify no secrets in git history
- [ ] Test with fresh clone
- [ ] Update README with setup instructions
- [ ] Add license file
- [ ] Review all documentation for exposed secrets

### 🚨 NEVER COMMIT:
- ❌ .env files
- ❌ Database files
- ❌ API keys
- ❌ JWT secrets
- ❌ User data
- ❌ WhatsApp sessions
- ❌ node_modules/

---

**🔒 Security is not a feature, it's a requirement!**

**Last Updated:** September 29, 2026
