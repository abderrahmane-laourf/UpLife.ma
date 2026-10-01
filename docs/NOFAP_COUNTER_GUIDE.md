# 🚀 NoFap Counter Feature Guide

## Overview

The **NoFap Counter** helps users track their journey to break free from porn and build better habits. It provides a clean streak counter, statistics, and motivation.

---

## 📊 Database Schema

### NoFapCounter Model

```prisma
model NoFapCounter {
  id               Int       @id @default(autoincrement())
  userId           Int       @unique
  currentStreak    Int       @default(0)    // Days clean
  longestStreak    Int       @default(0)    // Personal record
  startDate        DateTime  @default(now())
  lastRelapseDate  DateTime? // Last relapse date
  totalRelapses    Int       @default(0)    // Total count
  isActive         Boolean   @default(true)  // Paused or active
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  user             User      @relation(...)
}
```

**Fields:**
- `currentStreak` - Current days clean
- `longestStreak` - Highest streak achieved
- `startDate` - When current streak started
- `lastRelapseDate` - Last relapse date (for reference)
- `totalRelapses` - Total number of relapses
- `isActive` - Whether counter is active or paused

---

## 🔌 Backend API

### Base URL: `/api/nofap`

All endpoints require authentication.

### 1. GET `/` - Get Counter
Get user's current counter.

**Response:**
```json
{
  "message": "Counter retrieved successfully",
  "counter": {
    "id": 1,
    "userId": 5,
    "currentStreak": 7,
    "longestStreak": 30,
    "startDate": "2026-09-22",
    "lastRelapseDate": "2026-09-15",
    "totalRelapses": 3,
    "isActive": true,
    "createdAt": "2026-09-01T...",
    "updatedAt": "2026-09-29T..."
  }
}
```

**Auto-Create:**
If counter doesn't exist, creates one automatically.

---

### 2. POST `/start` - Start/Reset Counter
Start a new counter or reset existing one.

**Response:**
```json
{
  "message": "Counter started successfully! 💪",
  "counter": {
    "currentStreak": 0,
    "startDate": "2026-09-29",
    "isActive": true,
    ...
  }
}
```

---

### 3. POST `/relapse` - Report Relapse
Report a relapse and reset the streak.

**Behavior:**
- Resets `currentStreak` to 0
- Updates `longestStreak` if current is higher
- Increments `totalRelapses`
- Sets `lastRelapseDate` to today
- Sets new `startDate`

**Response:**
```json
{
  "message": "Relapse reported. Start fresh! You got this! 💪",
  "counter": {
    "currentStreak": 0,
    "longestStreak": 30,
    "totalRelapses": 4,
    "lastRelapseDate": "2026-09-29",
    ...
  }
}
```

---

### 4. PATCH `/pause` - Pause Counter
Pause the counter (stops counting days).

**Response:**
```json
{
  "message": "Counter paused",
  "counter": {
    "isActive": false,
    ...
  }
}
```

---

### 5. PATCH `/resume` - Resume Counter
Resume a paused counter.

**Response:**
```json
{
  "message": "Counter resumed! Keep going! 💪",
  "counter": {
    "isActive": true,
    ...
  }
}
```

---

### 6. DELETE `/` - Delete Counter
Permanently delete the counter.

**Response:**
```json
{
  "message": "Counter deleted successfully"
}
```

---

### 7. GET `/stats` - Get Statistics
Get detailed statistics.

**Response:**
```json
{
  "message": "Stats retrieved successfully",
  "stats": {
    "currentStreak": 7,
    "longestStreak": 30,
    "totalRelapses": 3,
    "totalDays": 28,
    "successRate": 89.3,
    "startDate": "2026-09-22",
    "lastRelapseDate": "2026-09-15",
    "isActive": true
  }
}
```

**Calculated Fields:**
- `totalDays` - Days since counter creation
- `successRate` - Percentage of clean days

---

## 🎨 Frontend Component

### NoFapCounter Component

**Location:** `frontend/src/components/NoFapCounter.jsx`

**Features:**
- 🔢 Large current streak display
- 📊 Statistics grid (longest streak, total days, success rate, relapses)
- 🎯 Action buttons (Start, Report Relapse, Pause/Resume)
- ⚠️ Confirmation modal for relapse
- 💪 Motivational card
- 🎨 Gradient design (purple to pink)
- 🌙 Dark mode support

### UI Sections:

#### 1. Main Counter Card
- **Current Streak** (large display with gradient)
- Start date
- Active/Paused status
- Pause/Resume button

#### 2. Stats Grid
- Longest Streak (purple)
- Total Days (pink)
- Success Rate (green)
- Total Relapses (gray)
- Last relapse date (if available)

#### 3. Action Buttons
- **Report Relapse** - Red button, requires confirmation
- **Restart Counter** - Purple gradient button

#### 4. Motivation Card
- Encouraging message
- Blue theme
- Always visible

---

## 📱 Frontend Integration

### Settings Page Tabs

**Updated Tabs:**
1. Profile
2. My Goal
3. **NoFap 💪** ← NEW TAB!
4. Categories

**Location:** `frontend/src/pages/user/SettingsPage.jsx`

```jsx
import NoFapCounter from '../../components/NoFapCounter.jsx'

{activeTab === 'nofap' && (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <NoFapCounter />
  </div>
)}
```

---

## 🔄 User Flow

### First Time Setup:
```
1. User goes to Settings → NoFap tab
   ↓
2. Sees empty state with "Start Counter" button
   ↓
3. Clicks "Start Counter"
   ↓
4. Counter created with streak = 0
   ↓
5. Counter starts tracking days
```

### Daily Usage:
```
1. User opens NoFap tab
   ↓
2. Sees current streak (auto-updated)
   ↓
3. Reviews stats
   ↓
4. Feels motivated! 💪
```

### Reporting Relapse:
```
1. User clicks "Report Relapse" button
   ↓
2. Confirmation modal appears
   ↓
3. User confirms (or cancels)
   ↓
4. Streak resets to 0
   ↓
5. Longest streak updated (if applicable)
   ↓
6. Total relapses incremented
   ↓
7. New start date set
   ↓
8. Motivational message shown
```

---

## 🎯 Features

### ✅ Implemented:
- [x] Counter creation (auto-create on first access)
- [x] Current streak tracking (auto-calculated)
- [x] Longest streak tracking
- [x] Relapse reporting with confirmation
- [x] Statistics (success rate, total days, etc.)
- [x] Pause/Resume functionality
- [x] Delete counter
- [x] Beautiful gradient UI
- [x] Dark mode support
- [x] Motivational messages
- [x] Confirmation modals

### 💡 Future Enhancements:
- [ ] Weekly/Monthly reports
- [ ] Achievements/Badges (7 days, 30 days, 90 days, etc.)
- [ ] Community leaderboard (optional, anonymous)
- [ ] Daily check-in with mood tracker
- [ ] Relapse reason tracking
- [ ] Trigger logging
- [ ] Resources/Tips section
- [ ] Emergency support button
- [ ] Share progress (optional)

---

## 🎨 Design Highlights

### Color Scheme:
- **Gradient:** Purple (#A855F7) to Pink (#EC4899)
- **Success:** Green (#22C55E)
- **Warning:** Yellow (#F59E0B)
- **Danger:** Red (#EF4444)

### Typography:
- **Streak Number:** 6xl font, gradient text
- **Labels:** Small, semibold
- **Stats:** 2xl font, colored

### Spacing:
- Cards: 2xl rounded, 6 padding
- Grid: 2 columns for stats
- Gaps: 3-4 units between elements

---

## 🚀 Migration Required

Run this before testing:

```bash
cd backend
npx prisma migrate dev --name add_nofap_counter
```

This creates the `NoFapCounter` table.

---

## 🧪 Testing

### Manual Testing:

1. **Start Counter:**
```bash
POST /api/nofap/start
```
Expected: Counter created with streak = 0

2. **Get Counter:**
```bash
GET /api/nofap
```
Expected: Returns counter object

3. **Report Relapse:**
```bash
POST /api/nofap/relapse
```
Expected: Streak resets to 0, longest updated, relapses incremented

4. **Get Stats:**
```bash
GET /api/nofap/stats
```
Expected: Returns calculated statistics

5. **Pause/Resume:**
```bash
PATCH /api/nofap/pause
PATCH /api/nofap/resume
```
Expected: isActive toggles

### Frontend Testing:

1. Go to Settings → NoFap tab
2. Click "Start Counter" button
3. Verify counter shows 0 days
4. Wait or manually update DB to test different streak values
5. Click "Report Relapse" → Confirm
6. Verify streak resets to 0
7. Check stats update correctly
8. Test pause/resume buttons
9. Test dark mode

---

## 📊 Privacy & Sensitivity

### Important Notes:
- ⚠️ **Privacy:** Counter data is private and never shared
- ⚠️ **Sensitivity:** This is a personal wellness feature
- ⚠️ **Respect:** No judgment, no shame
- ⚠️ **Support:** Encourage healthy habits

### Security:
- All endpoints require authentication
- User can only access their own counter
- Data is encrypted in database
- No public leaderboards (privacy first)

---

## 💬 Motivational Messages

**On Start:**
> "Counter started! You got this! 💪"

**On Relapse:**
> "Relapse reported. Start fresh! You got this! 💪"

**On Resume:**
> "Counter resumed! Keep going! 💪"

**Always Visible:**
> "Every day clean is a victory. Stay strong, focus on your goals, and remember why you started!"

---

## 🎯 Success Metrics

Track these to measure progress:
- Current Streak (days)
- Longest Streak (personal best)
- Success Rate (percentage)
- Total Days (since creation)
- Total Relapses (transparency)

---

## 🛠️ Technical Details

### Service Functions:
```js
// Frontend: nofapService.js
getCounter()
startCounter()
reportRelapse()
pauseCounter()
resumeCounter()
deleteCounter()
getStats()
```

### Controller Functions:
```js
// Backend: nofap.controller.js
getCounter()
startCounter()
reportRelapse()
pauseCounter()
resumeCounter()
deleteCounter()
getStats()
```

### Routes:
```js
GET    /api/nofap           // Get counter
POST   /api/nofap/start     // Start/reset
POST   /api/nofap/relapse   // Report relapse
PATCH  /api/nofap/pause     // Pause
PATCH  /api/nofap/resume    // Resume
DELETE /api/nofap           // Delete
GET    /api/nofap/stats     // Get stats
```

---

## 📝 Example Usage

### Scenario: New User

```
Day 0: User creates counter
  → currentStreak: 0
  → longestStreak: 0
  
Day 7: Still clean!
  → currentStreak: 7
  → longestStreak: 7
  
Day 10: Relapse 😔
  → currentStreak: 0 (reset)
  → longestStreak: 10 (updated!)
  → totalRelapses: 1
  
Day 17: Back on track! (7 days clean)
  → currentStreak: 7
  → longestStreak: 10
  
Day 31: New record! 🎉
  → currentStreak: 21
  → longestStreak: 21 (new best!)
```

---

## 🎉 Conclusion

The NoFap Counter helps users:
- ✅ Track progress visually
- ✅ Stay motivated
- ✅ Set personal records
- ✅ Learn from setbacks
- ✅ Build better habits
- ✅ Achieve their goals

**Remember:** Progress, not perfection! 💪

---

**Made with 💜 for UpLife.ma**

**Last Updated:** September 29, 2026
