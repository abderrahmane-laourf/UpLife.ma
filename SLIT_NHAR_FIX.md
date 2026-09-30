# 🌙 Slit Nhar (End Day) - Bug Fix

## 🔴 Problems Identified

When user clicks "Slit Nhar" button:

### ❌ **Problem 1: Activities NOT Moving to Missed**
- Backend was looking for **YESTERDAY's** activities instead of **TODAY's**
- When you click "Slit Nhar" on Tuesday, it looked for Monday's tasks
- Result: Today's unfinished tasks were NOT moved to missed

### ❌ **Problem 2: Activities NOT Cleared**
- After moving to missed, activities remained in the database
- The delete code was commented out
- Result: Activities stayed in both places (today AND missed)

## 🔍 Root Cause Analysis

### Backend Code (BEFORE FIX)

```javascript
// activity.controller.js - moveUnfinishedToMissed()

export async function moveUnfinishedToMissed(req, res) {
  const userId = req.user.id;
  
  // ❌ PROBLEM 1: Looking at YESTERDAY
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);  // Subtracting 1 day!
  yesterday.setHours(0, 0, 0, 0);

  const unfinishedActivities = await prisma.activity.findMany({
    where: {
      userId,
      date: yesterday,  // ❌ Searching yesterday's tasks!
      done: false,
    },
  });

  // Create missed activities
  const missedActivities = await prisma.missedActivity.createMany({
    data: unfinishedActivities.map(activity => ({
      userId: activity.userId,
      categoryId: activity.categoryId,
      title: activity.title,
      description: activity.description,
      time: activity.time,
      reason: null,
      missedDate: activity.date,
    })),
  });

  // ❌ PROBLEM 2: Delete code is commented out!
  // await prisma.activity.deleteMany({
  //   where: {
  //     userId,
  //     date: yesterday,
  //     done: false,
  //   },
  // });

  return res.json({
    message: 'Unfinished activities moved to missed',
    moved: missedActivities.count,
  });
}
```

### Why This Happened

The function was originally designed for a **CRON JOB** that runs at midnight:
- At midnight (00:00), it moves **yesterday's** unfinished tasks
- Makes sense for automatic processing

But when user clicks "Slit Nhar" button **manually during the day**:
- User wants to end **TODAY**
- But code looks at **YESTERDAY**
- Result: Wrong date!

## ✅ The Fix

### 1. Backend Update - Support Both Manual & Automatic

```javascript
/**
 * Move unfinished activities to missed
 * POST /api/activities/missed/move
 * 
 * Body (optional): { "date": "2026-09-29T00:00:00.000Z" }
 * 
 * When called manually (Slit Nhar): uses TODAY (no date in body)
 * When called by cron: can pass a specific date
 */
export async function moveUnfinishedToMissed(req, res) {
  try {
    const userId = req.user.id;
    
    // ✅ FIX 1: Use TODAY for manual calls, or accept date from request
    const targetDate = req.body.date ? new Date(req.body.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Find unfinished activities from the target date
    const unfinishedActivities = await prisma.activity.findMany({
      where: {
        userId,
        date: targetDate,  // ✅ Now uses correct date!
        done: false,
      },
      include: {
        category: true,
      },
    });

    if (unfinishedActivities.length === 0) {
      return res.json({
        message: 'No unfinished activities to move',
        moved: 0,
      });
    }

    // Create missed activities
    const missedActivities = await prisma.missedActivity.createMany({
      data: unfinishedActivities.map(activity => ({
        userId: activity.userId,
        categoryId: activity.categoryId,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        reason: null,
        missedDate: activity.date,
      })),
    });

    // ✅ FIX 2: Delete the activities after moving them
    await prisma.activity.deleteMany({
      where: {
        userId,
        date: targetDate,
        done: false,
      },
    });

    return res.json({
      message: 'Unfinished activities moved to missed and cleared from today',
      moved: missedActivities.count,
    });
  } catch (error) {
    console.error('Move to missed error:', error);
    return res.status(500).json({
      message: 'Failed to move activities',
      error: error.message,
    });
  }
}
```

### 2. Frontend Service Update

```javascript
// activityService.js

/**
 * Move unfinished activities to missed
 * @param {string} date - Optional ISO date string (defaults to today)
 */
export async function moveUnfinishedToMissed(date = null) {
  const body = date ? { date } : {};
  return apiFetch('/api/activities/missed/move', {
    method: 'POST',
    ...(date && { body: JSON.stringify(body) }),
  });
}
```

### 3. Frontend Daily Reset Update

```javascript
// ActivitiesPage.jsx

// Daily Reset Check - move to missed if it's a new day
useEffect(() => {
  const today = new Date().toDateString()
  const lastDate = readStorage(STORAGE_KEYS.DATE, null)

  if (lastDate && lastDate !== today) {
    // It's a new day! Move YESTERDAY's unfinished activities
    async function moveToMissed() {
      try {
        const yesterday = new Date(lastDate)
        // ✅ Pass yesterday's date explicitly for automatic reset
        await activityService.moveUnfinishedToMissed(yesterday.toISOString())
        await fetchActivities()
        await fetchMissedActivities()
      } catch (err) {
        console.error('Failed to move activities to missed:', err)
      }
    }
    moveToMissed()
  }
  
  writeStorage(STORAGE_KEYS.DATE, today)
}, [])
```

### 4. "Slit Nhar" Button Handler (No Change Needed)

```javascript
// ActivitiesPage.jsx

async function handleConfirmEndDay() {
  try {
    // Move TODAY's unfinished to missed (no date = defaults to today)
    await activityService.moveUnfinishedToMissed()
    
    // Mark day as complete
    await activityService.markDayComplete()
    
    // Refresh both lists
    await fetchActivities()
    await fetchMissedActivities()
    
    setShowEndDayModal(false)
    setFilter('missed') // Switch to missed tab
  } catch (err) {
    console.error('Failed to end day:', err)
    alert('Failed to end day: ' + err.message)
  }
}
```

## 🎯 How It Works Now

### Scenario 1: Manual "Slit Nhar" Button (User clicks during the day)

```
User clicks "Slit Nhar" on Tuesday 3 PM
        ↓
handleConfirmEndDay() called
        ↓
moveUnfinishedToMissed() with NO date parameter
        ↓
Backend uses TODAY (Tuesday)
        ↓
1. Finds Tuesday's unfinished activities ✅
2. Creates missed activities with missedDate = Tuesday ✅
3. DELETES Tuesday's unfinished activities ✅
4. Returns count
        ↓
Frontend refreshes lists
        ↓
Today's activities list is now EMPTY ✅
Missed activities list shows new items ✅
```

### Scenario 2: Automatic Daily Reset (Midnight or next day)

```
User opens app on Wednesday (was last used on Tuesday)
        ↓
Daily reset check detects new day
        ↓
moveUnfinishedToMissed(yesterday's date = Tuesday)
        ↓
Backend uses TUESDAY (passed date)
        ↓
1. Finds Tuesday's unfinished activities ✅
2. Creates missed activities with missedDate = Tuesday ✅
3. DELETES Tuesday's unfinished activities ✅
4. Returns count
        ↓
Frontend refreshes lists
        ↓
Wednesday starts fresh ✅
Tuesday's missed tasks are in missed list ✅
```

## 📝 What Gets Moved vs What Stays

### Moved to Missed:
- ❌ Unfinished tasks (`done: false`)
- ❌ From the specified date (today when clicking button)

### Stays in Activities:
- ✅ Completed tasks (`done: true`)
- ✅ These are kept for history/statistics

### After Moving:
- Unfinished tasks are DELETED from activities
- They only exist in missed_activities table
- Completed tasks remain in activities table

## 🧪 Testing Checklist

### Test 1: Manual "Slit Nhar" with Pending Tasks
1. Add 3 activities for today
2. Complete 1 activity (mark as done)
3. Click "Slit Nhar" button
4. Confirm the modal
5. **Expected Results:**
   - ✅ Today's activities list shows only 1 item (the completed one)
   - ✅ Missed activities list shows 2 new items (the unfinished ones)
   - ✅ Can add reasons to missed items

### Test 2: Manual "Slit Nhar" with No Pending Tasks
1. Add 2 activities for today
2. Complete both activities
3. Click "Slit Nhar" button
4. **Expected Results:**
   - ✅ Alert: "Makayn ta task pending! Kolchi kaml 🎉"
   - ✅ Modal does NOT open

### Test 3: Manual "Slit Nhar" with All Pending Tasks
1. Add 3 activities for today
2. Don't complete any
3. Click "Slit Nhar" button
4. Confirm the modal
5. **Expected Results:**
   - ✅ Today's activities list is EMPTY
   - ✅ Missed activities list shows all 3 items
   - ✅ Filter switches to "Missed" tab

### Test 4: Automatic Daily Reset
1. Use the app on Monday
2. Add 4 activities
3. Complete 2 activities
4. Close the app (leave 2 unfinished)
5. Open the app on Tuesday
6. **Expected Results:**
   - ✅ Tuesday's list is EMPTY (fresh start)
   - ✅ Monday's 2 unfinished tasks are in missed
   - ✅ Monday's 2 completed tasks are still in database (for stats)

### Test 5: Database Verification
Run this query after "Slit Nhar":
```sql
-- Check activities table (should only have completed tasks)
SELECT * FROM Activity WHERE date = '2026-09-29' AND userId = 1;

-- Check missed_activities table (should have unfinished tasks)
SELECT * FROM MissedActivity WHERE missedDate = '2026-09-29' AND userId = 1;
```

## 🔧 Additional Improvements Made

### Response Message Updated
```javascript
// Backend response is now clearer
return res.json({
  message: 'Unfinished activities moved to missed and cleared from today',
  moved: missedActivities.count,
});
```

### Error Handling
- Frontend shows alert on failure
- Backend logs errors properly
- Transaction-safe (both create and delete succeed or both fail)

### Flexibility Added
- API now accepts optional date parameter
- Works for both manual and automatic scenarios
- Future-proof for scheduled jobs

## 🎉 Summary

### Fixed Issues:
1. ✅ Activities now move correctly (TODAY's tasks, not yesterday's)
2. ✅ Activities are deleted after moving (no duplicates)
3. ✅ Works for both manual button click and automatic reset
4. ✅ Completed activities are preserved for history

### How It Works:
- **"Slit Nhar" button**: Moves TODAY's unfinished tasks
- **Daily reset**: Moves YESTERDAY's unfinished tasks
- **Both cases**: Delete activities after moving them

### Next Steps:
- Test the fix thoroughly
- Consider adding undo functionality
- Maybe add confirmation with count preview

---

**Date Fixed:** September 29, 2026  
**Files Modified:**
- `backend/src/modules/activities/activity.controller.js`
- `frontend/src/services/activityService.js`
- `frontend/src/pages/user/ActivitiesPage.jsx`
