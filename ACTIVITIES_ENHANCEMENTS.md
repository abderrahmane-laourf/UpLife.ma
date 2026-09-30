# 🚀 Activities Dashboard - New Features

## ✨ Features Added

### 1. **📅 Date Filter (Navigation)**
Navigate through different days to view activities from any date.

### 2. **🔄 Missed Activities CRUD**
Full management of missed activities:
- ✅ **Edit** - Update title, description, time, and reason
- ✅ **Delete** - Remove missed activities
- ✅ **Restore** - Mark as completed and move back to activities
- ✅ **Add Reason** - Explain why task was missed

---

## 📅 1. Date Filter Feature

### Backend Changes

#### Updated `getAllActivities()` Controller
```javascript
// GET /api/activities?date=2026-09-28

// Now accepts optional date query parameter
let targetDate;
if (req.query.date) {
  targetDate = new Date(req.query.date);
} else {
  targetDate = new Date(); // Default to today
}

// Returns activities for the specified date
const activities = await prisma.activity.findMany({
  where: {
    userId,
    date: targetDate,
  },
  // ...
});
```

### Frontend Changes

#### Date State Management
```javascript
const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date()
  return today.toISOString().split('T')[0] // Format: YYYY-MM-DD
})
```

#### Date Navigation Functions
```javascript
// Change date by days (±1)
function handleDateChange(direction) {
  const date = new Date(selectedDate)
  date.setDate(date.getDate() + direction)
  setSelectedDate(date.toISOString().split('T')[0])
}

// Jump to today
function goToToday() {
  const today = new Date()
  setSelectedDate(today.toISOString().split('T')[0])
}

// Check if viewing today
const isToday = selectedDate === new Date().toISOString().split('T')[0]
```

#### Auto-Refetch on Date Change
```javascript
useEffect(() => {
  fetchActivities() // Fetches with selectedDate
}, [selectedDate])
```

#### UI Components

**Date Navigation Bar:**
```jsx
<div className="flex items-center justify-between">
  {/* Previous Button */}
  <button onClick={() => handleDateChange(-1)}>
    ← Previous
  </button>

  {/* Current Date Display */}
  <div>
    <span>{formattedDate}</span>
    {!isToday && <button onClick={goToToday}>Today</button>}
  </div>

  {/* Next Button */}
  <button onClick={() => handleDateChange(1)}>
    Next →
  </button>
</div>
```

**Conditional "Slit Nhar" Button:**
- Only shows when viewing TODAY
- Hidden when viewing past/future dates

---

## 🔄 2. Missed Activities CRUD

### Backend API Endpoints

#### **PUT /api/activities/missed/:id** - Update Missed Activity
```javascript
export async function updateMissedActivity(req, res) {
  const { title, description, time, reason } = req.body;
  
  const missedActivity = await prisma.missedActivity.update({
    where: { id: parseInt(id) },
    data: {
      ...(title && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(time !== undefined && { time: time?.trim() || null }),
      ...(reason !== undefined && { reason: reason?.trim() || null }),
    },
    include: { category: true },
  });
  
  return res.json({
    message: 'Missed activity updated successfully',
    missedActivity,
  });
}
```

#### **DELETE /api/activities/missed/:id** - Delete Missed Activity
```javascript
export async function deleteMissedActivity(req, res) {
  // Check if exists and belongs to user
  const missedActivity = await prisma.missedActivity.findFirst({
    where: { id: parseInt(id), userId },
  });

  if (!missedActivity) {
    return res.status(404).json({ message: 'Missed activity not found' });
  }

  await prisma.missedActivity.delete({
    where: { id: parseInt(id) },
  });

  return res.json({
    message: 'Missed activity deleted successfully',
  });
}
```

#### **POST /api/activities/missed/:id/restore** - Restore to Completed
```javascript
export async function restoreMissedActivity(req, res) {
  // Get missed activity
  const missedActivity = await prisma.missedActivity.findFirst({
    where: { id: parseInt(id), userId },
  });

  // Create new activity as completed on original missed date
  const activity = await prisma.activity.create({
    data: {
      userId,
      categoryId: missedActivity.categoryId,
      title: missedActivity.title,
      description: missedActivity.description,
      time: missedActivity.time,
      date: missedActivity.missedDate, // Original date
      done: true, // ✅ Mark as completed
    },
  });

  // Delete from missed activities
  await prisma.missedActivity.delete({
    where: { id: parseInt(id) },
  });

  return res.json({
    message: 'Missed activity restored as completed',
    activity,
  });
}
```

### Frontend Service Functions

```javascript
// activityService.js

// Update missed activity
export async function updateMissedActivity(id, data) {
  return apiFetch(`/api/activities/missed/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Delete missed activity
export async function deleteMissedActivity(id) {
  return apiFetch(`/api/activities/missed/${id}`, {
    method: 'DELETE',
  });
}

// Restore to completed
export async function restoreMissedActivity(id) {
  return apiFetch(`/api/activities/missed/${id}/restore`, {
    method: 'POST',
  });
}
```

### Frontend Handlers

```javascript
// Edit missed activity
async function handleEditMissed(task) {
  setModal({ mode: 'edit-missed', task })
}

// Update missed activity (from modal)
async function handleUpdateMissed(data) {
  const result = await activityService.updateMissedActivity(modal.task.id, {
    title: data.title,
    description: data.description,
    time: data.time,
    reason: data.reason
  })
  setMissedTasks(p => p.map(t => t.id === modal.task.id ? result.missedActivity : t))
  setModal(null)
}

// Delete missed activity
async function handleDeleteMissed(id) {
  if (!confirm('Delete this missed activity?')) return
  await activityService.deleteMissedActivity(id)
  setMissedTasks(p => p.filter(t => t.id !== id))
}

// Restore as completed
async function handleRestoreMissed(id) {
  if (!confirm('Restore as completed?')) return
  await activityService.restoreMissedActivity(id)
  setMissedTasks(p => p.filter(t => t.id !== id))
  await fetchActivities() // Refresh in case viewing that date
  alert('Activity restored! ✅')
}
```

### UI Updates

#### Enhanced MissedTaskCard Component

**Added Action Buttons:**
```jsx
<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
  {/* Restore Button */}
  <button onClick={() => onRestore(task.id)} title="Restore as completed">
    <CheckCircleIcon className="text-green-500" />
  </button>

  {/* Edit Button */}
  <button onClick={() => onEdit(task)} title="Edit">
    <EditIcon className="text-blue-500" />
  </button>

  {/* Delete Button */}
  <button onClick={() => onDelete(task.id)} title="Delete">
    <TrashIcon className="text-red-500" />
  </button>
</div>
```

#### Enhanced TaskModal Component

**New Mode: 'edit-missed':**
```jsx
<TaskModal
  mode="edit-missed" // New mode
  initial={missedActivity}
  onSave={handleUpdateMissed}
  // ...
/>
```

**Conditional Fields:**
- Shows **Reason** field only for missed activities
- Hides **Category** field for missed activities (can't change category)
- Updates title, description, time, and reason

---

## 🎯 Use Cases

### Scenario 1: View Past Activities
```
1. User clicks "Previous" button
2. Date changes to yesterday
3. Activities from yesterday are loaded
4. "Slit Nhar" button is hidden (not today)
5. User can view but cannot end day for past dates
```

### Scenario 2: Edit Missed Activity
```
1. User goes to "Missed" tab
2. Hovers over a missed activity
3. Clicks Edit button
4. Modal opens with current values
5. User updates title, description, time, or reason
6. Saves changes
7. Missed activity is updated
```

### Scenario 3: Restore Missed Activity
```
1. User realizes they DID complete a missed activity
2. Hovers over the missed activity
3. Clicks "Restore" button (green check)
4. Confirms the action
5. Backend:
   - Creates new activity on original missed date
   - Marks it as done=true
   - Deletes from missed activities
6. Activity appears in completed list for that date
7. Statistics are updated
```

### Scenario 4: Delete Missed Activity
```
1. User decides a missed activity is no longer relevant
2. Hovers over the missed activity
3. Clicks Delete button (trash icon)
4. Confirms deletion
5. Missed activity is permanently removed
```

### Scenario 5: Navigate to Future Date
```
1. User clicks "Next" multiple times
2. Views future dates (e.g., tomorrow)
3. Can pre-plan activities for future days
4. Activities are stored with future dates
5. When that date arrives, they appear normally
```

---

## 🔧 Technical Implementation

### Database Structure

**No schema changes needed!** The existing schema already supports:
- `Activity.date` - Stores activity date
- `Activity.done` - Completion status
- `MissedActivity.missedDate` - Original date when activity was supposed to be done
- `MissedActivity.reason` - Why it was missed

### API Routes Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/activities?date=YYYY-MM-DD` | Get activities for specific date |
| PUT | `/api/activities/missed/:id` | Update missed activity |
| DELETE | `/api/activities/missed/:id` | Delete missed activity |
| POST | `/api/activities/missed/:id/restore` | Restore to completed |

### State Management

```javascript
// Date filter state
const [selectedDate, setSelectedDate] = useState(todayISO)

// Re-fetch when date changes
useEffect(() => {
  fetchActivities() // Uses selectedDate
}, [selectedDate])

// Conditional rendering
{isToday && <button onClick={handleEndDay}>Slit Nhar</button>}
```

---

## 🎨 UI/UX Improvements

### 1. Date Navigation Bar
- **Clean design** with Previous/Next buttons
- **Current date display** with calendar icon
- **"Today" quick button** (only shows when not today)
- **Responsive** - works on mobile and desktop

### 2. Missed Activity Cards
- **Hover effects** - Buttons appear on hover
- **Icon buttons** with tooltips
- **Color-coded actions**:
  - 🟢 Green = Restore (positive action)
  - 🔵 Blue = Edit (neutral action)
  - 🔴 Red = Delete (destructive action)

### 3. Modal Enhancements
- **Dynamic title** based on mode (Add/Edit/Edit Missed)
- **Conditional fields** (reason for missed, category for regular)
- **Better UX** for editing different activity types

---

## 🧪 Testing Guide

### Test Date Filter

1. **View Today**
   - Should show today's activities
   - "Slit Nhar" button visible
   - Can add/edit/delete activities

2. **Go to Yesterday**
   - Click "Previous"
   - Should show yesterday's activities
   - "Slit Nhar" button hidden
   - "Today" button visible

3. **Go to Tomorrow**
   - Click "Next" from today
   - Should show empty list (or pre-planned activities)
   - Can add activities for tomorrow

4. **Jump to Today**
   - From any past/future date
   - Click "Today" button
   - Should return to current date

### Test Missed CRUD

1. **Edit Missed Activity**
   - Go to Missed tab
   - Hover over an activity
   - Click Edit button
   - Change title, description, time, or reason
   - Save
   - Verify changes appear

2. **Delete Missed Activity**
   - Hover over a missed activity
   - Click Delete button
   - Confirm deletion
   - Activity should disappear

3. **Restore Missed Activity**
   - Hover over a missed activity
   - Click Restore button (green check)
   - Confirm restoration
   - Check the original date: activity should appear as completed
   - Activity should be removed from missed list

4. **Add Reason to Missed**
   - Find a missed activity without reason
   - Type reason in textarea
   - Click Save
   - Reason should be saved and displayed

---

## 📊 Benefits

### For Users
- ✅ **View History** - See what they did on any past day
- ✅ **Plan Ahead** - Add activities for future days
- ✅ **Correct Mistakes** - Restore activities completed but marked missed
- ✅ **Clean Up** - Delete irrelevant missed activities
- ✅ **Full Control** - Edit any missed activity details

### For Statistics
- ✅ **Accurate Data** - Restored activities count in statistics
- ✅ **Historical View** - Can view completion rates for any date
- ✅ **Better Insights** - More accurate tracking over time

---

## 🚀 Future Enhancements

### Possible Additions:
1. **Calendar View** - Visual monthly calendar
2. **Date Range Filter** - View activities from date range
3. **Bulk Operations** - Restore/delete multiple missed activities
4. **Activity Templates** - Quick add from templates
5. **Recurring Activities** - Auto-create daily/weekly activities
6. **Export Data** - Download activities for date range
7. **Activity Search** - Search across all dates

---

## 📝 Files Modified

### Backend
- `backend/src/modules/activities/activity.controller.js`
  - Updated `getAllActivities()` - Added date filter
  - Added `updateMissedActivity()` - Edit functionality
  - Added `deleteMissedActivity()` - Delete functionality
  - Added `restoreMissedActivity()` - Restore functionality

- `backend/src/modules/activities/activity.routes.js`
  - Added PUT `/api/activities/missed/:id`
  - Added DELETE `/api/activities/missed/:id`
  - Added POST `/api/activities/missed/:id/restore`

### Frontend
- `frontend/src/services/activityService.js`
  - Updated `getAllActivities(date)` - Added date parameter
  - Added `updateMissedActivity(id, data)`
  - Added `deleteMissedActivity(id)`
  - Added `restoreMissedActivity(id)`

- `frontend/src/pages/user/ActivitiesPage.jsx`
  - Added date filter state and navigation
  - Added missed CRUD handlers
  - Updated TaskModal for edit-missed mode
  - Enhanced MissedTaskCard with action buttons
  - Added date navigation UI

---

## ✅ Summary

**Date Filter:**
- Navigate through days to view activities from any date
- "Slit Nhar" only available for today
- "Today" quick button to jump back

**Missed Activities CRUD:**
- **Edit** - Update all fields including reason
- **Delete** - Remove from missed list
- **Restore** - Mark as completed and move back to activities
- **Full Control** - Manage missed activities like regular activities

Both features work seamlessly together for complete activity management! 🎉
