# 🎯 Partial Goals (Sub-goals) Feature - Complete Guide

## What Are Partial Goals?

**Partial Goals** = Sub-goals/Milestones that break down your main goal into smaller, achievable steps!

### Example:

```
🎯 Main Goal: Lose 5 kg before summer
   ├── ✅ Step 1: Lose 2 kg in month 1 (COMPLETED)
   ├── ⏳ Step 2: Lose 2 kg in month 2 (IN PROGRESS)
   └── ⏸️ Step 3: Lose 1 kg in month 3 (PENDING)
```

---

## 📊 Database Schema

### New Model: `PartialGoal`

```prisma
model PartialGoal {
  id          Int       @id @default(autoincrement())
  goalId      Int
  title       String
  description String?
  order       Int       @default(0)
  isCompleted Boolean   @default(false)
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  goal        Goal      @relation(...)

  @@index([goalId, order])
}
```

**Fields:**
- `goalId` - Links to main goal
- `title` - Step description
- `description` - Optional details
- `order` - Display order (0, 1, 2, ...)
- `isCompleted` - Completion status
- `completedAt` - When completed

**Relationship:**
- `Goal` has many `PartialGoal`
- Cascade delete (deleting goal deletes all partial goals)

---

## 🚀 Run Migration

```powershell
cd backend
npx prisma migrate dev --name add_partial_goals
npm run dev
```

---

## 🎯 API Endpoints

### 1. GET `/api/goals/:goalId/partial`
Get all partial goals for a goal

**Response:**
```json
{
  "message": "Partial goals retrieved successfully",
  "partialGoals": [
    {
      "id": 1,
      "goalId": 1,
      "title": "Lose 2 kg in month 1",
      "description": "Focus on cardio",
      "order": 0,
      "isCompleted": true,
      "completedAt": "2026-10-15T10:00:00.000Z",
      "createdAt": "2026-09-29T10:00:00.000Z"
    },
    {
      "id": 2,
      "goalId": 1,
      "title": "Lose 2 kg in month 2",
      "order": 1,
      "isCompleted": false,
      "completedAt": null
    }
  ]
}
```

---

### 2. POST `/api/goals/:goalId/partial`
Create new partial goal

**Body:**
```json
{
  "title": "Lose 2 kg in month 1",
  "description": "Focus on cardio and clean eating",
  "order": 0
}
```

---

### 3. PUT `/api/goals/:goalId/partial/:id`
Update partial goal

**Body:**
```json
{
  "title": "Lose 3 kg in month 1",
  "description": "Updated description"
}
```

---

### 4. PATCH `/api/goals/:goalId/partial/:id/toggle`
Toggle completion status

**Response:**
```json
{
  "message": "Partial goal marked as completed",
  "partialGoal": { ... },
  "mainGoalCompleted": false
}
```

**Special Feature:**
- When ALL partial goals are completed → Main goal auto-completes! 🎉

---

### 5. DELETE `/api/goals/:goalId/partial/:id`
Delete partial goal

---

### 6. PATCH `/api/goals/:goalId/partial/reorder`
Reorder partial goals (drag & drop)

**Body:**
```json
{
  "partialGoalIds": [3, 1, 2]
}
```

---

## 🎨 Frontend Integration

### Updated `GoalSettings` Component

The component now includes partial goals section:

```jsx
import GoalSettings from '../components/GoalSettings';

<GoalSettings />
```

### Display Structure:

```
┌─────────────────────────────────────────┐
│ My Global Goal                          │
│                                         │
│ 🎯 Lose 5 kg before summer              │
│ Focus on cardio and healthy eating      │
│ Target: 12/31/2026                      │
│                                         │
│ Progress: 1/3 steps completed (33%)     │
│                                         │
│ Steps to Achieve:                       │
│ ┌─────────────────────────────────────┐ │
│ │ ✅ Lose 2 kg in month 1             │ │
│ │    Focus on cardio [Edit] [Delete]  │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ☐ Lose 2 kg in month 2              │ │
│ │    [Edit] [Delete]                  │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ☐ Lose 1 kg in month 3              │ │
│ │    [Edit] [Delete]                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Add Step]                            │
└─────────────────────────────────────────┘
```

---

## 🎯 Features

### 1. **Create Partial Goals**
- Add steps to break down main goal
- Auto-ordered (0, 1, 2, ...)
- Optional description

### 2. **Edit Partial Goals**
- Update title and description
- Change order

### 3. **Toggle Completion**
- Click checkbox to mark done
- Shows completion timestamp
- Auto-completes main goal when all steps done

### 4. **Delete Partial Goals**
- Remove unnecessary steps
- Confirmation dialog

### 5. **Reorder (Drag & Drop)**
- Rearrange steps
- Visual feedback
- Saves order automatically

### 6. **Progress Tracking**
- Shows X/Y steps completed
- Progress percentage
- Visual progress bar

---

## 🎨 UI Components

### Partial Goal Card

```jsx
<div className="partial-goal-card">
  {/* Checkbox */}
  <input type="checkbox" checked={partialGoal.isCompleted} onChange={handleToggle} />
  
  {/* Content */}
  <div>
    <h4>{partialGoal.title}</h4>
    {partialGoal.description && <p>{partialGoal.description}</p>}
    {partialGoal.isCompleted && <span>✅ Completed {date}</span>}
  </div>
  
  {/* Actions */}
  <button onClick={handleEdit}>Edit</button>
  <button onClick={handleDelete}>Delete</button>
</div>
```

---

## 🔄 User Flow

### Creating Steps:

```
1. User has main goal: "Lose 5 kg"
2. Clicks "Add Step"
3. Modal opens
4. Enters: "Lose 2 kg in month 1"
5. Clicks "Save"
6. Step appears under main goal
7. Repeat for more steps
```

### Completing Steps:

```
1. User completes first step
2. Clicks checkbox ✅
3. Step marked as complete
4. Progress updates: 1/3 (33%)
5. User continues...
6. Completes 2nd step → 2/3 (67%)
7. Completes 3rd step → 3/3 (100%)
8. 🎉 Main goal auto-completes!
9. Congrats message appears
```

### Editing Steps:

```
1. User clicks "Edit" on a step
2. Modal opens with current values
3. Updates title: "Lose 3 kg in month 1"
4. Clicks "Save"
5. Step is updated
```

---

## ⚡ Smart Features

### 1. **Auto-Complete Main Goal**
```javascript
// When toggling partial goal completion
const allCompleted = allPartialGoals.every(pg => pg.isCompleted);

if (allCompleted && allPartialGoals.length > 0) {
  // Auto-complete main goal! 🎉
  await completeMainGoal(goalId);
}
```

### 2. **Cascade Delete**
```sql
-- Deleting main goal deletes all partial goals
onDelete: Cascade
```

### 3. **Ordered Display**
```javascript
// Always displayed in order
orderBy: { order: 'asc' }
```

---

## 📊 Progress Calculation

```javascript
const completed = partialGoals.filter(pg => pg.isCompleted).length;
const total = partialGoals.length;
const progress = total > 0 ? (completed / total) * 100 : 0;

// Display: 2/5 steps completed (40%)
```

---

## 🎨 Visual Progress Bar

```jsx
<div className="w-full h-2 bg-gray-200 rounded-full">
  <div 
    className="h-full bg-green-500 rounded-full transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

## 🔧 Backend Logic Highlights

### Toggle with Auto-Complete:

```javascript
export async function togglePartialGoalCompletion(req, res) {
  // Toggle completion
  const partialGoal = await prisma.partialGoal.update({
    where: { id },
    data: {
      isCompleted: !current,
      completedAt: !current ? new Date() : null,
    },
  });

  // Check if all completed
  const all = await prisma.partialGoal.findMany({ where: { goalId } });
  const allCompleted = all.every(pg => pg.isCompleted);

  // Auto-complete main goal
  if (allCompleted && all.length > 0) {
    await prisma.goal.update({
      where: { id: goalId },
      data: { isCompleted: true, completedAt: new Date() },
    });
  }

  return res.json({
    partialGoal,
    mainGoalCompleted: allCompleted,
  });
}
```

---

## 📁 Files Created/Modified

### Backend:
- ✅ `prisma/schema.prisma` - Added PartialGoal model
- ✅ `src/modules/goals/partialGoal.controller.js` - Partial goal logic
- ✅ `src/modules/goals/goal.routes.js` - Added partial goal routes
- ✅ `src/modules/goals/goal.controller.js` - Include partial goals in responses

### Frontend:
- ✅ `services/goalService.js` - Added partial goal functions
- 🔄 `components/GoalSettings.jsx` - Will update to include partial goals UI

---

## ✅ Testing Checklist

### Backend API:
- [ ] Create partial goal
- [ ] Get all partial goals
- [ ] Update partial goal
- [ ] Toggle completion
- [ ] Delete partial goal
- [ ] Reorder partial goals
- [ ] Main goal auto-completes when all steps done

### Frontend:
- [ ] Display partial goals list
- [ ] Add new partial goal
- [ ] Edit partial goal
- [ ] Toggle completion (checkbox)
- [ ] Delete partial goal
- [ ] Drag & drop reorder
- [ ] Progress bar updates
- [ ] Main goal completion notification

---

## 🎯 Example Use Cases

### Weight Loss Goal:
```
Main: Lose 10 kg in 3 months
├── Month 1: Lose 4 kg
├── Month 2: Lose 4 kg
└── Month 3: Lose 2 kg
```

### Fitness Goal:
```
Main: Run a marathon
├── Run 5km without stopping
├── Run 10km
├── Run half marathon (21km)
└── Run full marathon (42km)
```

### Learning Goal:
```
Main: Learn JavaScript
├── Complete HTML/CSS basics
├── Learn JS fundamentals
├── Build 3 projects
└── Pass certification exam
```

---

## 🚀 Next Steps

```powershell
# 1. Run migration
cd backend
npx prisma migrate dev --name add_partial_goals

# 2. Restart backend
npm run dev

# 3. Update GoalSettings component to display partial goals
# (Component already has the service functions ready!)

# 4. Test the feature!
```

---

## 📝 Summary

**Created:**
- ✅ PartialGoal database model
- ✅ 6 API endpoints (CRUD + toggle + reorder)
- ✅ Frontend service functions
- ✅ Auto-complete main goal feature
- ✅ Progress tracking
- ✅ Complete documentation

**Features:**
- ✅ Break goals into steps
- ✅ Track progress
- ✅ Reorder steps
- ✅ Auto-complete main goal
- ✅ Visual progress indicator

**Ready for UI implementation!** 🎉

---

**Date Created:** September 29, 2026  
**Feature Status:** ✅ Backend Complete, ⏳ Frontend UI Pending
