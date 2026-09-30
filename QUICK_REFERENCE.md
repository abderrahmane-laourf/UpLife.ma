# 🚀 UpLife.ma - Quick Reference Card

## 📁 Important Files

| File | Purpose | Safe to Commit? |
|------|---------|----------------|
| `.env` | Real secrets | ❌ NO |
| `.env.example` | Template | ✅ YES |
| `*.db` | Database | ❌ NO |
| `.gitignore` | Protection | ✅ YES |
| `HOW_TO_USE.md` | User guide | ✅ YES |
| `SECURITY_CHECKLIST.md` | Security guide | ✅ YES |

---

## 🔒 Security Quick Check

```bash
# Check what git will commit
git status

# Verify .env is ignored
git ls-files | grep ".env"
# Should return NOTHING

# Search for secrets in code
git grep -i "secret"
git grep -i "password"
# Review results carefully

# Test .env.example
cp backend/.env.example backend/.env
# Then edit with real values
```

---

## 📚 Documentation Map

| Document | What's Inside |
|----------|---------------|
| `HOW_TO_USE.md` | Complete user guide for end users |
| `SECURITY_CHECKLIST.md` | Security guide for developers |
| `UPDATES_SUMMARY.md` | Latest changes and fixes |
| `GOAL_INTEGRATION_COMPLETE.md` | Goal feature details |
| `GOAL_FRONTEND_INTEGRATION.md` | Technical goal docs |
| `docs/ACTIVITY_SYSTEM.md` | Activity feature docs |
| `docs/AUTH.md` | Authentication docs |
| `backend/API_DOCUMENTATION.md` | API reference |

---

## 🎯 User Features

### Activities
- ✅ Create, Edit, Delete tasks
- ✅ Complete/Uncomplete
- ✅ Date navigation (Previous/Today/Next)
- ✅ Slit Nhar (Reset day)
- ✅ Missed activities (Edit, Delete, Restore)

### Goals
- ✅ Create main goal (title, category, deadline)
- ✅ Add partial goals (steps/milestones)
- ✅ Progress bar (X/Y completed, %)
- ✅ Toggle step completion
- ✅ Auto-complete main goal
- ✅ Edit/Delete goals & steps

### Categories
- ✅ Add custom categories
- ✅ Color coding
- ✅ Delete categories

### Dashboard
- ✅ Stats overview
- ✅ Quick actions
- ✅ Recent activities

---

## 🔧 Developer Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd UpLife.ma

# 2. Backend setup
cd backend
cp .env.example .env
# Edit .env with real values
npm install
npx prisma migrate dev
node prisma/seed-categories.js
npm run dev

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🚫 NEVER Commit

```bash
# Environment files
.env
.env.local
.env.*

# Database files
*.db
*.sqlite
prisma/*.db

# Credentials
*.pem
*.key
*.cert

# User data
uploads/
node_modules/

# WhatsApp sessions
evolution-api/instances/
evolution-api/store/
```

---

## ✅ Safe to Commit

```bash
# Code
*.js
*.jsx
*.ts
*.tsx

# Config (without secrets)
package.json
tsconfig.json
vite.config.js

# Docs
*.md
README.md

# Templates
.env.example
.gitignore

# Schema (no hardcoded URLs)
prisma/schema.prisma
```

---

## 🎨 Latest Fix

**Issue:** Category dropdown showing blank  
**File:** `frontend/src/components/GoalSettings.jsx`  
**Fix:** Added placeholder option

```jsx
// BEFORE
<select value={categoryId}>
  {categories.map(cat => <option>...)}
</select>

// AFTER
<select value={categoryId}>
  {!categoryId && <option value="">-- Select Category --</option>}
  {categories.map(cat => <option>...)}
</select>
```

---

## 📊 Project Structure

```
UpLife.ma/
├── backend/           # Node.js API
│   ├── src/
│   │   ├── modules/   # Features (auth, activities, goals, etc.)
│   │   ├── lib/       # Utilities (jwt, redis, prisma, etc.)
│   │   └── server.js  # Main server
│   ├── prisma/        # Database schema & migrations
│   ├── .env.example   # Environment template ✅
│   └── .gitignore     # Protection ✅
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   └── hooks/         # Custom hooks
│   └── .gitignore     # Protection ✅
├── docs/              # Documentation
├── HOW_TO_USE.md      # User guide ✅
├── SECURITY_CHECKLIST.md  # Security guide ✅
├── .gitignore         # Root protection ✅
└── docker-compose.yml # Docker setup
```

---

## 🚀 Pre-Push Checklist

- [ ] No .env files tracked
- [ ] No database files tracked
- [ ] No API keys in code
- [ ] .env.example created
- [ ] All .gitignore files in place
- [ ] Run `git status` (clean)
- [ ] Run `git ls-files | grep ".env"` (empty)
- [ ] Documentation updated
- [ ] Test category select fix

---

## 💡 Quick Commands

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm test             # Run tests
npx prisma studio    # Database GUI
npx prisma migrate dev  # Run migrations

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build

# Database
node backend/prisma/seed-categories.js  # Seed categories
node backend/clear-all-data.js          # Clear all data
node backend/clear-activities.js        # Clear activities only

# Security
git grep -i "secret"     # Find secrets
git grep -i "api_key"    # Find API keys
npm audit                # Security audit
```

---

## 📞 Help Resources

| Need Help With | Check This |
|----------------|------------|
| Using the app | `HOW_TO_USE.md` |
| Security/Git | `SECURITY_CHECKLIST.md` |
| Latest changes | `UPDATES_SUMMARY.md` |
| Goals feature | `GOAL_INTEGRATION_COMPLETE.md` |
| API endpoints | `backend/API_DOCUMENTATION.md` |
| Activities | `docs/ACTIVITY_SYSTEM.md` |
| Authentication | `docs/AUTH.md` |

---

## 🎯 Key Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| Authentication | ✅ | Phone + OTP via WhatsApp |
| Activities | ✅ | CRUD, Date filter, Slit Nhar |
| Missed Activities | ✅ | Edit, Delete, Restore |
| Goals | ✅ | CRUD with category & deadline |
| Partial Goals | ✅ | Steps/milestones with progress |
| Auto-complete | ✅ | Main goal completes when all steps done |
| Categories | ✅ | CRUD with colors |
| Dashboard | ✅ | Stats and quick actions |
| Reviews | ✅ | Daily reflections |
| Notes | ✅ | Simple note-taking |
| Dark Mode | ✅ | Full theme support |
| Responsive | ✅ | Mobile-friendly |

---

## 🔥 Pro Tips

1. **Always** use `.env.example` as template
2. **Never** commit `.env` files
3. **Always** run security check before push
4. **Use** strong secrets (openssl rand)
5. **Test** with fresh clone before public push
6. **Review** all docs for sensitive data
7. **Rotate** secrets regularly
8. **Enable** 2FA on GitHub
9. **Use** branch protection rules
10. **Setup** automated security scanning

---

**Kolchi f waḥd l-page! Quick reference a sahbi! 🚀✨**

---

**Last Updated:** September 29, 2026
