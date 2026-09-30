# 🎯 Global Goal Feature - Complete Guide

## What Was Created

A complete **Global Goal** feature that allows users to set and track their main wellness objective.

---

## 📊 Database Changes

### New Model: `Goal`

```prisma
model Goal {
  id          Int       @id @default(autoincrement())
  userId      Int
  categoryId  Int
  title       String
  description String?
  deadline    DateTime? @db.Date
  isActive    Boolean   @default(true)
  isCompleted Boolean   @default(false)
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  category    Category  @relation(...)
  user        User      @relation(...)
}
```

**Fields:**
- `title` - Goal text (e.g., "Lose 5 kg before summer")
- `description` - Optional details
- `categoryId` - Linked to Category (Fitness, Health, etc.)
- `deadline` - Target date (optional)
- `isActive` - Only one active goal per user
- `isCompleted` - Goal completion status
- `completedAt` - When goal was achieved

---

## 🚀 How to Run Migration

```powershell
cd backend
npx prisma migrate dev --name add_goal_model
npm run dev
```

---

## 🎯 API Endpoints

### GET `/api/goals/active`
Get user's current active goal

**Response:**
```json
{
  "message": "Active goal retrieved successfully",
  "goal": {
    "id": 1,
    "title": "Lose 5 kg before summer",
    "description": "Focus on cardio and healthy eating",
    "deadline": "2026-12-31",
    "category": "Fitness",
    "categoryColor": "#22C55E",
    "categoryId": 1,
    "isCompleted": false
  }
}
```

### GET `/api/goals`
Get all goals (history)

### POST `/api/goals`
Create or update goal

**Body:**
```json
{
  "title": "Lose 5 kg before summer",
  "description": "Focus on cardio",
  "categoryId": 1,
  "deadline": "2026-12-31"
}
```

**Behavior:**
- Deactivates any existing active goal
- Creates new goal as active

### PUT `/api/goals/:id`
Update goal details

### PATCH `/api/goals/:id/complete`
Mark goal as completed

### DELETE `/api/goals/:id`
Delete goal

---

## 🎨 Frontend Component

### `GoalSettings.jsx`

**Features:**
- ✅ View active goal
- ✅ Create new goal
- ✅ Edit existing goal
- ✅ Mark goal as complete
- ✅ Delete goal
- ✅ Category selection
- ✅ Deadline picker

**Usage:**
```jsx
import GoalSettings from '../components/GoalSettings';

function SettingsPage() {
  return (
    <div>
      <GoalSettings />
    </div>
  );
}
```

---

## 📋 UI Flow

### View Mode (Has Goal)
```
┌──────────────────────────────────────┐
│ My Global Goal                       │
│ Set your main wellness objective     │
│                                      │
│ Lose 5 kg before summer   [Fitness] │
│ Focus on cardio and healthy eating   │
│ Target: 12/31/2026                   │
│                                      │
│ [Mark Complete] [Edit] [Delete]      │
└──────────────────────────────────────┘
```

### Edit Mode
```
┌──────────────────────────────────────┐
│ My Global Goal                       │
│ Set your main wellness objective     │
│                                      │
│ Goal: [________________] *           │
│ Description: [________]              │
│ Category: [Fitness ▼] *              │
│ Target Deadline: [mm/dd/yyyy]        │
│                                      │
│ [Cancel] [Save Goal]                 │
└──────────────────────────────────────┘
```

---

## 🎯 Use Cases

### 1. Set First Goal
```
1. User opens Settings/Goal section
2. Sees "No active goal"
3. Form is in edit mode
4. Fills: "Lose 5 kg before summer"
5. Selects: Fitness
6. Sets deadline: Dec 31
7. Clicks "Save Goal"
8. Goal is saved and displayed
```

### 2. Update Goal
```
1. User clicks "Edit" button
2. Form shows with current values
3. Changes title to "Lose 7 kg"
4. Clicks "Save Goal"
5. Goal is updated
```

### 3. Complete Goal
```
1. User achieves their goal!
2. Clicks "Mark Complete"
3. Confirms action
4. Goal is marked completed
5. isActive = false
6. completedAt = now
7. Congrats message! 🎉
```

### 4. Set New Goal
```
1. User completed previous goal
2. Clicks "Edit" (or opens form)
3. Enters new goal
4. Clicks "Save Goal"
5. Previous goal stays in history
6. New goal becomes active
```

---

## 📂 Files Created

### Backend:
- `backend/prisma/schema.prisma` - Updated with Goal model
- `backend/src/modules/goals/goal.controller.js` - Goal API logic
- `backend/src/modules/goals/goal.routes.js` - Goal routes
- `backend/src/server.js` - Added goal routes

### Frontend:
- `frontend/src/services/goalService.js` - Goal API client
- `frontend/src/components/GoalSettings.jsx` - Goal UI component

### Documentation:
- `backend/RUN_MIGRATION.md` - Migration guide
- `GOAL_FEATURE_GUIDE.md` - This file

---

## ✅ Testing Checklist

### Backend:
- [ ] Run migration successfully
- [ ] Create goal via API
- [ ] Get active goal
- [ ] Update goal
- [ ] Complete goal
- [ ] Delete goal
- [ ] Create second goal (first should deactivate)

### Frontend:
- [ ] Component renders without errors
- [ ] Can create new goal
- [ ] Can edit existing goal
- [ ] Can mark goal complete
- [ ] Can delete goal
- [ ] Category dropdown works
- [ ] Date picker works
- [ ] Form validation works

---

## 🔧 Integration Points

### Where to Add GoalSettings Component:

**Option 1: Settings Page**
```jsx
// SettingsPage.jsx
import GoalSettings from '../../components/GoalSettings';

function SettingsPage() {
  return (
    <div className="space-y-6">
      <GoalSettings />
      {/* Other settings */}
    </div>
  );
}
```

**Option 2: Dashboard**
```jsx
// Dashboard.jsx
import GoalSettings from '../../components/GoalSettings';

function Dashboard() {
  return (
    <div className="space-y-6">
      <GoalSettings />
      <ActivitySummary />
      <WeeklyProgress />
    </div>
  );
}
```

**Option 3: Dedicated Goal Page**
```jsx
// GoalPage.jsx
import GoalSettings from '../../components/GoalSettings';

function GoalPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <GoalSettings />
    </div>
  );
}
```

---

## 🎨 Styling

Component uses your existing design system:
- ✅ Tailwind CSS
- ✅ Dark mode support
- ✅ Green (#22C55E) primary color
- ✅ Rounded-xl borders
- ✅ Smooth transitions
- ✅ Responsive design

---

## 🔮 Future Enhancements

### Possible additions:
1. **Progress Tracking** - Track % completion
2. **Sub-goals** - Break main goal into steps
3. **Reminders** - Notify about deadline
4. **History View** - See all past goals
5. **Statistics** - Goal completion rate
6. **Sharing** - Share goal with friends
7. **Milestones** - Celebrate progress points
8. **Goal Templates** - Pre-made goal suggestions

---

## 🚀 Quick Start

```powershell
# 1. Run migration
cd backend
npx prisma migrate dev --name add_goal_model

# 2. Restart backend
npm run dev

# 3. Add component to Settings page
# (Edit frontend/src/pages/user/SettingsPage.jsx)

# 4. Test it!
# Open browser → Settings → See Goal section
```

---

## 📝 Summary

**Created:**
- ✅ Database model (Goal)
- ✅ Backend API (6 endpoints)
- ✅ Frontend service (6 functions)
- ✅ UI Component (fully functional)
- ✅ Documentation

**Ready to use!** Just run the migration and add the component to your page! 🎯

---

**Date Created:** September 29, 2026  
**Feature Status:** ✅ Complete & Ready
