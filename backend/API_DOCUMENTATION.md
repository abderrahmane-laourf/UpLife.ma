# 📚 UpLife API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Categories](#categories)
3. [Activities](#activities)
4. [Notes (Mdawanat)](#notes-mdawanat)

---

## 🔐 Authentication

All endpoints except `/api/auth/*` require authentication via cookies (refresh token).

### Base URL
```
http://localhost:3000/api
```

---

## 📂 Categories

### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
{
  "message": "Categories retrieved successfully",
  "categories": [
    {
      "id": 1,
      "name": "Fitness",
      "description": "Physical activities",
      "color": "#22C55E",
      "createdAt": "2026-09-27T10:00:00.000Z",
      "updatedAt": "2026-09-27T10:00:00.000Z"
    }
  ]
}
```

### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Fitness",
  "description": "Physical activities and workouts",
  "color": "#22C55E"
}
```

### Update Category
```http
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "color": "#3B82F6"
}
```

### Delete Category
```http
DELETE /api/categories/:id
```

---

## 🎯 Activities

### Get Today's Activities
```http
GET /api/activities
```

**Response:**
```json
{
  "message": "Activities retrieved successfully",
  "activities": [
    {
      "id": 1,
      "title": "Morning Run",
      "description": "5km run in the park",
      "time": "7:00 AM",
      "done": false,
      "category": "Fitness",
      "categoryColor": "#22C55E",
      "categoryId": 1,
      "date": "2026-09-27",
      "createdAt": "2026-09-27T06:00:00.000Z",
      "updatedAt": "2026-09-27T06:00:00.000Z"
    }
  ]
}
```

### Create Activity
```http
POST /api/activities
Content-Type: application/json

{
  "title": "Morning Run",
  "description": "5km run in the park",
  "time": "7:00 AM",
  "categoryId": 1
}
```

**Validation:**
- `title` is required
- `categoryId` is required and must exist

### Update Activity
```http
PUT /api/activities/:id
Content-Type: application/json

{
  "title": "Evening Run",
  "description": "Updated description",
  "time": "6:00 PM",
  "categoryId": 2,
  "done": true
}
```

### Toggle Activity Done Status
```http
PATCH /api/activities/:id/toggle
```

### Delete Activity
```http
DELETE /api/activities/:id
```

### Get Missed Activities
```http
GET /api/activities/missed/all
```

**Response:**
```json
{
  "message": "Missed activities retrieved successfully",
  "missedActivities": [
    {
      "id": 1,
      "title": "Morning Yoga",
      "description": "30 min yoga session",
      "time": "6:30 AM",
      "reason": "Woke up late",
      "category": "Wellness",
      "categoryColor": "#A855F7",
      "categoryId": 3,
      "missedDate": "2026-09-26",
      "createdAt": "2026-09-27T00:00:00.000Z"
    }
  ]
}
```

### Add Reason to Missed Activity
```http
PATCH /api/activities/missed/:id/reason
Content-Type: application/json

{
  "reason": "Woke up late, overslept after late night work"
}
```

### Move Unfinished to Missed
```http
POST /api/activities/missed/move
```

**Description:** Moves yesterday's unfinished activities to missed activities. Can be called manually or via cron job at midnight.

---

## 📝 Notes (Mdawanat)

### Get All Notes
```http
GET /api/notes
GET /api/notes?search=keyword
```

**Query Parameters:**
- `search` (optional): Search in title and content

**Response:**
```json
{
  "message": "Notes retrieved successfully",
  "notes": [
    {
      "id": 1,
      "title": "My Thoughts",
      "content": "Today was a productive day...",
      "color": "#22C55E",
      "createdAt": "2026-09-27T10:00:00.000Z",
      "updatedAt": "2026-09-27T10:00:00.000Z"
    }
  ]
}
```

### Get Note by ID
```http
GET /api/notes/:id
```

### Create Note
```http
POST /api/notes
Content-Type: application/json

{
  "title": "My Daily Review",
  "content": "Today I accomplished...",
  "color": "#22C55E"
}
```

**Validation:**
- `content` is required
- `color` must be valid hex format (e.g., #22C55E)

**Available Colors:**
- `#22C55E` - Green
- `#3B82F6` - Blue
- `#A855F7` - Purple
- `#F59E0B` - Orange
- `#EC4899` - Pink
- `#EF4444` - Red
- `#06B6D4` - Cyan
- `#9CA3AF` - Gray

### Update Note
```http
PUT /api/notes/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "color": "#3B82F6"
}
```

### Delete Note
```http
DELETE /api/notes/:id
```

### Get Notes Statistics
```http
GET /api/notes/stats
```

**Response:**
```json
{
  "message": "Notes statistics retrieved successfully",
  "stats": {
    "total": 25,
    "recentWeek": 8,
    "byColor": [
      {
        "color": "#22C55E",
        "count": 10
      },
      {
        "color": "#3B82F6",
        "count": 8
      }
    ]
  }
}
```

---

## 📊 Database Schema

### User
```prisma
model User {
  id           Int         @id @default(autoincrement())
  email        String?     @unique
  phone        String?     @unique
  name         String?
  passwordHash String?
  role         UserRole    @default(USER)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  activities   Activity[]
  missedActivities MissedActivity[]
  notes        Note[]
}
```

### Category
```prisma
model Category {
  id          Int         @id @default(autoincrement())
  name        String      @unique
  description String?
  color       String      @default("#22C55E")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  activities  Activity[]
  missedActivities MissedActivity[]
}
```

### Activity
```prisma
model Activity {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId  Int
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  title       String
  description String?
  time        String?
  done        Boolean  @default(false)
  date        DateTime @default(now()) @db.Date
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### MissedActivity
```prisma
model MissedActivity {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId  Int
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  title       String
  description String?
  time        String?
  reason      String?
  missedDate  DateTime @db.Date
  createdAt   DateTime @default(now())
}
```

### Note
```prisma
model Note {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String?
  content   String   @db.Text
  color     String   @default("#22C55E")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🔒 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "No access token provided"
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

## 🚀 Frontend Services

### Category Service
- `getAllCategories()`
- `getCategoryById(id)`
- `createCategory(data)`
- `updateCategory(id, data)`
- `deleteCategory(id)`

### Activity Service
- `getAllActivities()`
- `getActivityById(id)`
- `createActivity(data)`
- `updateActivity(id, data)`
- `deleteActivity(id)`
- `toggleActivityDone(id)`
- `getMissedActivities()`
- `updateMissedActivityReason(id, reason)`
- `moveUnfinishedToMissed()`

### Note Service
- `getAllNotes(search)`
- `getNoteById(id)`
- `createNote(data)`
- `updateNote(id, data)`
- `deleteNote(id)`
- `getNotesStats()`

---

## 🎣 React Hooks

### useCategories
```javascript
const {
  categories,
  loading,
  error,
  fetchCategories,
  addCategory,
  editCategory,
  removeCategory,
} = useCategories()
```

### useNotes
```javascript
const {
  notes,
  loading,
  error,
  stats,
  fetchNotes,
  searchNotes,
  addNote,
  editNote,
  removeNote,
} = useNotes()
```

---

## 📝 Notes

1. **Authentication**: All protected routes require a valid refresh token stored in HTTP-only cookies
2. **Date Handling**: Activities are filtered by date (today only by default)
3. **Search**: Notes support full-text search across title and content
4. **Colors**: All color values must be in hex format (#RRGGBB)
5. **Cascading**: Deleting a user cascades to all their activities, missed activities, and notes

---

## 🔄 Migrations Applied

1. `20260921084239_init_auth` - Initial auth system
2. `20260926131740_add_category_model` - Categories
3. `20260927140051_add_activities_and_missed_activities` - Activities system
4. `20260927141842_add_notes_model` - Notes system

---

**Last Updated:** September 27, 2026
**API Version:** 1.0.0
