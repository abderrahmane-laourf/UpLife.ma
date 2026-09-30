# 🗑️ Clear Database Data - Guide

## 📋 Available Scripts

### 1. **Clear Activities Only** (`clear-activities.js`)
Clears activity-related data but **KEEPS users and categories**.

**What it deletes:**
- ✅ All activities
- ✅ All missed activities
- ✅ All daily reviews
- ✅ All notes

**What it preserves:**
- ✅ Users (can still login)
- ✅ Categories
- ✅ OTP codes

**When to use:**
- Starting fresh with activities
- Testing without re-creating users
- Keeping user accounts intact

**Command:**
```bash
cd backend
node clear-activities.js
```

---

### 2. **Clear ALL Data** (`clear-all-data.js`)
Completely wipes the database. **DELETES EVERYTHING!**

**What it deletes:**
- ✅ All activities
- ✅ All missed activities
- ✅ All daily reviews
- ✅ All notes
- ✅ All users
- ✅ All categories
- ✅ All OTP codes

**What it preserves:**
- Nothing! Database will be completely empty.

**When to use:**
- Complete fresh start
- Before production deployment
- Testing from scratch

**Command:**
```bash
cd backend
node clear-all-data.js
```

**After clearing, restore categories:**
```bash
node prisma/seed-categories.js
```

---

## 🚀 Usage Examples

### Scenario 1: Testing Activities (Keep Users)

```bash
# 1. Clear activities but keep users
cd backend
node clear-activities.js

# Output:
# ✅ Deleted 45 missed activities
# ✅ Deleted 123 activities
# ✅ Deleted 10 daily reviews
# ✅ Deleted 5 notes
# 🎉 All activity data cleared!
# 📌 Users and Categories preserved

# 2. Test activities again with same users
# (No need to register again)
```

---

### Scenario 2: Complete Fresh Start

```bash
# 1. Clear everything
cd backend
node clear-all-data.js

# Output:
# ✅ Deleted 45 missed activities
# ✅ Deleted 123 activities
# ✅ Deleted 10 daily reviews
# ✅ Deleted 5 notes
# ✅ Deleted 3 OTP codes
# ✅ Deleted 5 users
# ✅ Deleted 8 categories
# 🎉 ALL DATA CLEARED!

# 2. Restore default categories
node prisma/seed-categories.js

# Output:
# ✅ 8 categories created

# 3. Register new users and start fresh
```

---

## ⚠️ Important Notes

### Before Clearing:

1. **Backup Important Data** (if needed)
   ```bash
   # Export database (if you want backup)
   pg_dump -U postgres uplife_db > backup.sql
   ```

2. **Close Running Servers**
   - Stop backend server (`Ctrl+C` in terminal)
   - Stop frontend (optional, but recommended)

3. **Confirm Your Intention**
   - These scripts are **irreversible**
   - All deleted data is **permanently lost**
   - No "undo" button exists

### After Clearing:

1. **Restart Backend Server**
   ```bash
   npm run dev
   ```

2. **If Cleared Everything:**
   - Re-register users
   - Categories will be restored (if you ran seed script)

3. **Frontend:**
   - Clear browser localStorage (Application → Storage → Clear)
   - Logout and login again

---

## 🔍 What Each Script Does Internally

### `clear-activities.js`

```javascript
// Deletes in this order (to avoid foreign key conflicts):
1. prisma.missedActivity.deleteMany()
2. prisma.activity.deleteMany()
3. prisma.dailyReview.deleteMany()
4. prisma.note.deleteMany()

// Preserves:
- User table
- Category table
- OTP table
```

### `clear-all-data.js`

```javascript
// Deletes EVERYTHING in this order:
1. prisma.missedActivity.deleteMany()
2. prisma.activity.deleteMany()
3. prisma.dailyReview.deleteMany()
4. prisma.note.deleteMany()
5. prisma.oTP.deleteMany()
6. prisma.user.deleteMany()
7. prisma.category.deleteMany()

// Database is now empty!
```

---

## 🛡️ Safety Features

### Built-in Protections:

1. **No Partial Deletes**
   - If any step fails, script exits
   - Database state remains consistent

2. **Clear Output**
   - Shows exactly what was deleted
   - Counts for each table

3. **Explicit Names**
   - Script names clearly indicate what they do
   - No ambiguity

### Manual Verification:

**Check what's in database:**
```bash
# Connect to database
npx prisma studio

# Or use SQL
psql -U postgres uplife_db

# Check counts
SELECT COUNT(*) FROM "Activity";
SELECT COUNT(*) FROM "MissedActivity";
SELECT COUNT(*) FROM "User";
```

---

## 🔄 Alternative: Reset with Prisma Migrate

If you want to reset the **entire database structure**:

```bash
# ⚠️ WARNING: Drops and recreates ALL tables
npx prisma migrate reset

# This will:
# 1. Drop all tables
# 2. Recreate them from schema
# 3. Run seed scripts (if configured)

# After reset:
node prisma/seed-categories.js
```

---

## 📊 Comparison Table

| Action | Activities | Users | Categories | Database Structure |
|--------|-----------|-------|------------|-------------------|
| `clear-activities.js` | ❌ Deleted | ✅ Kept | ✅ Kept | ✅ Kept |
| `clear-all-data.js` | ❌ Deleted | ❌ Deleted | ❌ Deleted | ✅ Kept |
| `prisma migrate reset` | ❌ Deleted | ❌ Deleted | ❌ Deleted | 🔄 Recreated |

---

## 🐛 Troubleshooting

### Error: "Cannot delete due to foreign key constraint"

**Solution:** Scripts already handle this by deleting in correct order.
If still happens:
```bash
# Run clear-all-data.js instead
node clear-all-data.js
```

### Error: "Database connection failed"

**Solution:**
```bash
# 1. Check if PostgreSQL is running
# 2. Verify .env file has correct DATABASE_URL
# 3. Test connection
npx prisma db pull
```

### Error: "Permission denied"

**Solution:**
```bash
# Make scripts executable (Mac/Linux)
chmod +x clear-activities.js
chmod +x clear-all-data.js

# Or run with node explicitly
node clear-activities.js
```

---

## 📝 Quick Reference

```bash
# Clear activities only (keep users)
node clear-activities.js

# Clear everything
node clear-all-data.js

# Restore categories after clearing all
node prisma/seed-categories.js

# View database in browser
npx prisma studio

# Complete reset (structure + data)
npx prisma migrate reset
```

---

## ✅ Checklist: Before Clearing

- [ ] Backup important data (if needed)
- [ ] Stop backend server
- [ ] Confirm you want to delete this data
- [ ] Choose correct script (activities only vs all data)
- [ ] Have seed script ready (if clearing categories)

## ✅ Checklist: After Clearing

- [ ] Run seed script (if cleared categories)
- [ ] Clear browser localStorage
- [ ] Restart backend server
- [ ] Register new users (if cleared users)
- [ ] Test functionality

---

**Created:** September 29, 2026  
**Last Updated:** September 29, 2026

