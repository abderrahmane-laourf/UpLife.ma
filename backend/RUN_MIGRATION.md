# 🎯 Goal Feature - Migration Guide

## Run This Command:

```powershell
cd backend
npx prisma migrate dev --name add_goal_model
```

This will:
1. Create Goal table
2. Add relationships to User and Category
3. Generate Prisma client with Goal model

## After Migration:

```powershell
# Restart backend
npm run dev
```

That's it! Goal model is ready ✅
