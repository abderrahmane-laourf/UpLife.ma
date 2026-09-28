# UpLife Activity System - Complete Guide

## 📋 Table of Contents
- [Overview](#overview)
- [How Activities Work](#how-activities-work)
- [Activity Lifecycle](#activity-lifecycle)
- [API Endpoints](#api-endpoints)
- [Frontend Implementation](#frontend-implementation)
- [Database Schema](#database-schema)
- [Activity Categories](#activity-categories)

---

## 🎯 Overview

The Activity System is the core feature of UpLife that helps users manage their daily tasks and habits. Activities are organized by categories and tracked on a daily basis to help users build consistent habits and achieve their goals.

### Key Features
- ✅ Create daily activities with specific times
- 📊 Track completion status
- 🔄 Missed activity tracking with reasons
- 📅 Daily activity management
- 🎨 Category-based organization
- ⏰ Time-based scheduling

---

## 🔄 How Activities Work

### 1. **Creating Activities**

Users can create activities for today with the following information:
- **Title**: What needs to be done (e.g., "Morning Run")
- **Category**: Type of activity (Health, Work, Learning, etc.)
- **Time**: When to do it (e.g., "07:00")
- **Duration** (optional): How long it takes (in minutes)

**Example:**
```json
{
  "title": "Morning Meditation",
  "categoryId": 1,
  "time": "06:30",
  "duration": 15
}
```

### 2. **Activity States**

Each activity can be in one of these states:

| State | Description | Icon |
|-------|-------------|------|
| **Pending** | Not done yet, still in today's list | ⏳ |
| **Completed** | Marked as done | ✅ |
| **Missed** | Not completed and moved to history | ❌ |

### 3. **Daily Flow**

```
Morning
   ↓
Create Activities for Today
   ↓
Mark as Done ✅ (throughout the day)
   ↓
End of Day
   ↓
Unfinished Activities → Moved to Missed
   ↓
Add Reason (optional): Why was it missed?
```

---

## 🔁 Activity Lifecycle

### Step-by-Step Process:

#### **Morning - Planning Phase**
1. User opens the app
2. Creates new activities for today
3. Each activity is saved with `date = today` and `done = false`

#### **Throughout the Day - Execution Phase**
1. User sees their activity list sorted by time
2. When completing an activity:
   - User clicks the checkbox
   - Frontend calls `PATCH /api/activities/:id/toggle`
   - Backend sets `done = true`
   - Activity gets a checkmark ✅

#### **End of Day - Review Phase**
1. User or system triggers "Move to Missed"
2. Uncompleted activities (`done = false`) are identified
3. For each uncompleted activity:
   - A new `MissedActivity` record is created
   - Contains: activity info, date, and optional reason
4. User can add reasons for why activities were missed

---

## 🔌 API Endpoints

### Activity Endpoints

#### 1. **Get Today's Activities**
```http
GET /api/activities
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Activities retrieved successfully",
  "activities": [
    {
      "id": 1,
      "title": "Morning Run",
      "categoryId": 1,
      "time": "07:00",
      "duration": 30,
      "done": false,
      "date": "2026-09-28T00:00:00.000Z",
      "category": {
        "id": 1,
        "name": "Health",
        "icon": "💪",
        "color": "#22C55E"
      }
    }
  ]
}
```

#### 2. **Create Activity**
```http
POST /api/activities
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Read 30 pages",
  "categoryId": 3,
  "time": "20:00",
  "duration": 45
}
```

#### 3. **Toggle Activity Done**
```http
PATCH /api/activities/:id/toggle
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Activity marked as done",
  "activity": {
    "id": 1,
    "done": true
  }
}
```

#### 4. **Update Activity**
```http
PUT /api/activities/:id
Authorization: Bearer <token>

{
  "title": "Morning Run (5km)",
  "time": "06:30"
}
```

#### 5. **Delete Activity**
```http
DELETE /api/activities/:id
Authorization: Bearer <token>
```

### Missed Activity Endpoints

#### 1. **Get All Missed Activities**
```http
GET /api/activities/missed/all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Missed activities retrieved successfully",
  "missedActivities": [
    {
      "id": 1,
      "activityTitle": "Morning Run",
      "activityTime": "07:00",
      "missedDate": "2026-09-27T00:00:00.000Z",
      "reason": "Woke up late",
      "category": {
        "name": "Health",
        "icon": "💪"
      }
    }
  ]
}
```

#### 2. **Add Reason to Missed Activity**
```http
PATCH /api/activities/missed/:id/reason
Authorization: Bearer <token>

{
  "reason": "Had an early meeting"
}
```

#### 3. **Move Unfinished to Missed**
```http
POST /api/activities/missed/move
Authorization: Bearer <token>
```

This endpoint:
- Finds all activities where `done = false`
- Creates `MissedActivity` records for them
- Useful for end-of-day cleanup

---

## 💻 Frontend Implementation

### Activity Service (`activityService.js`)

```javascript
import { apiRequest } from './authService';

// Get today's activities
export async function getAllActivities() {
  return apiRequest('/api/activities', { method: 'GET' });
}

// Create new activity
export async function createActivity(activityData) {
  return apiRequest('/api/activities', {
    method: 'POST',
    body: JSON.stringify(activityData),
  });
}

// Toggle done status
export async function toggleActivityDone(id) {
  return apiRequest(`/api/activities/${id}/toggle`, {
    method: 'PATCH',
  });
}

// Delete activity
export async function deleteActivity(id) {
  return apiRequest(`/api/activities/${id}`, {
    method: 'DELETE',
  });
}
```

### Usage in React Component

```javascript
import { useState, useEffect } from 'react';
import { getAllActivities, toggleActivityDone } from '../services/activityService';

function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  
  useEffect(() => {
    async function fetchActivities() {
      const data = await getAllActivities();
      setActivities(data.activities);
    }
    fetchActivities();
  }, []);
  
  async function handleToggle(id) {
    await toggleActivityDone(id);
    // Update local state
    setActivities(prev => 
      prev.map(a => a.id === id ? {...a, done: !a.done} : a)
    );
  }
  
  return (
    <div>
      {activities.map(activity => (
        <div key={activity.id}>
          <input 
            type="checkbox" 
            checked={activity.done}
            onChange={() => handleToggle(activity.id)}
          />
          <span>{activity.title}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🗄️ Database Schema

### Activity Table
```prisma
model Activity {
  id         Int       @id @default(autoincrement())
  userId     Int
  categoryId Int
  title      String
  time       String
  duration   Int?
  done       Boolean   @default(false)
  date       DateTime  @default(now())
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  user     User     @relation(fields: [userId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])
}
```

### MissedActivity Table
```prisma
model MissedActivity {
  id            Int      @id @default(autoincrement())
  userId        Int
  categoryId    Int
  activityTitle String
  activityTime  String
  missedDate    DateTime
  reason        String?
  createdAt     DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])
}
```

---

## 🎨 Activity Categories

Categories help organize activities by type:

| ID | Name | Icon | Color | Use Case |
|----|------|------|-------|----------|
| 1 | Health | 💪 | #22C55E | Exercise, nutrition, wellness |
| 2 | Work | 💼 | #3B82F6 | Professional tasks |
| 3 | Learning | 📚 | #8B5CF6 | Study, reading, courses |
| 4 | Social | 👥 | #EC4899 | Friends, family time |
| 5 | Personal | 🎯 | #F59E0B | Hobbies, self-care |
| 6 | Finance | 💰 | #10B981 | Budgeting, investments |

### Creating Custom Categories

```http
POST /api/categories
Authorization: Bearer <token>

{
  "name": "Meditation",
  "icon": "🧘",
  "color": "#A855F7"
}
```

---

## 🔍 Best Practices

### 1. **Time Management**
- Create activities in the morning for the day ahead
- Set realistic time estimates
- Don't overload your schedule (5-8 activities per day is optimal)

### 2. **Tracking Missed Activities**
- Always add a reason when you miss an activity
- Review missed activities weekly to identify patterns
- Adjust your schedule based on what you learn

### 3. **Categories**
- Use consistent categories for similar activities
- Limit to 5-7 main categories
- Color-code for visual clarity

### 4. **Completion Rate**
- Aim for 70-80% completion rate (being realistic is key)
- 100% completion might mean you're not challenging yourself
- Use missed activity data to improve planning

---

## 🚀 Advanced Features

### Automatic End-of-Day Processing
You can set up a cron job or scheduled task to automatically move unfinished activities to missed at midnight:

```javascript
// Pseudo-code for scheduled task
schedule.daily('23:59', async () => {
  await moveUnfinishedToMissed();
});
```

### Activity Streaks
Track consecutive days of completing activities:
```sql
SELECT COUNT(*) as streak
FROM (
  SELECT date, COUNT(*) as completed
  FROM Activity
  WHERE userId = ? AND done = true
  GROUP BY date
  HAVING completed > 0
) consecutive_days;
```

### Statistics
Calculate completion rates:
```javascript
const completionRate = (completedCount / totalCount) * 100;
```

---

## 📱 Mobile Considerations

- Activities are sorted by time for easy viewing
- Swipe gestures for quick actions (mark done, delete)
- Push notifications for upcoming activities
- Offline support with sync when online

---

## 🔒 Security

- All endpoints require authentication (`Authorization: Bearer <token>`)
- Users can only see and modify their own activities
- Input validation on all fields
- SQL injection protection via Prisma ORM

---

## 📊 Analytics Ideas

Track these metrics for user insights:
- Daily completion rate
- Most productive time of day
- Most missed category
- Longest streak
- Weekly/monthly trends

---

## 🐛 Troubleshooting

### Activities Not Showing
- Check authentication token
- Verify date filter (activities are for today only)
- Check network requests in DevTools

### Toggle Not Working
- Ensure activity ID is correct
- Check backend logs for errors
- Verify user permissions

### Missed Activities Not Creating
- Check if activities have `done = false`
- Verify date logic in backend
- Test `/api/activities/missed/move` endpoint manually

---

## 📞 Support

For questions or issues:
- Check the API documentation
- Review backend logs
- Test endpoints with Postman
- Contact the development team

---

**Built with ❤️ by the UpLife Team**
