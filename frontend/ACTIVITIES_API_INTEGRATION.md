# Activities API Integration

## Summary

The ActivitiesPage has been fully integrated with the backend API. The page now fetches data from the server, creates, updates, and deletes activities through API calls, and handles missed activities properly.

## Changes Made

### 1. API Service Files Created

#### `src/services/api.js`
- Base API configuration with `API_BASE_URL` from environment variables
- Generic `apiFetch` wrapper for handling all API requests
- Includes error handling and automatic cookie-based authentication

#### `src/services/activityService.js`
Complete activity API service with functions for:
- `getAllActivities()` - Get today's activities
- `getActivityById(id)` - Get single activity
- `createActivity(data)` - Create new activity
- `updateActivity(id, data)` - Update activity
- `deleteActivity(id)` - Delete activity
- `toggleActivityDone(id)` - Toggle completion status
- `updatePrayerStatus(id, prayerStatus)` - Update prayer status
- `markDayComplete()` - Mark all activities as day completed
- `getMissedActivities()` - Get all missed activities
- `updateMissedActivityReason(id, reason)` - Add reason to missed activity
- `moveUnfinishedToMissed()` - Move yesterday's unfinished tasks to missed
- `getDashboardStats()` - Get statistics (for future use)
- `getDailyCompletionTrend()` - Get 30-day trend (for future use)

#### `src/services/categoryService.js`
Complete category API service with functions for:
- `getAllCategories()` - Get all categories
- `getCategoryById(id)` - Get single category
- `createCategory(data)` - Create new category
- `updateCategory(id, data)` - Update category
- `deleteCategory(id)` - Delete category

### 2. ActivitiesPage Updates

#### Data Management
- **Removed**: Local storage for tasks (now uses API)
- **Added**: API integration for all CRUD operations
- **Added**: Loading states and error handling
- **Added**: Automatic data refresh after mutations

#### Features
- ✅ Fetch activities from backend on page load
- ✅ Create new activities via API
- ✅ Edit activities via API
- ✅ Delete activities with confirmation
- ✅ Toggle activity completion status
- ✅ Fetch and display missed activities
- ✅ Add reasons to missed activities
- ✅ End day functionality (moves unfinished to missed)
- ✅ Automatic daily reset (checks and moves to missed on new day)
- ✅ Category integration from backend
- ✅ Real-time progress calculation
- ✅ Filter by: All, Pending, Done, Missed

#### UI Improvements
- Loading spinner while fetching data
- Error message display
- Confirmation dialogs for destructive actions
- Disabled state for buttons during API calls
- Better error feedback to users

### 3. Environment Configuration

#### `.env.example`
```env
VITE_API_URL=http://localhost:3000/api
```

Users should create a `.env` file from this example.

## Backend API Endpoints Used

### Activities
- `GET /api/activities` - Get today's activities
- `POST /api/activities` - Create activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `PATCH /api/activities/:id/toggle` - Toggle done status
- `PATCH /api/activities/:id/prayer-status` - Update prayer status
- `PATCH /api/activities/day-complete` - Mark day complete

### Missed Activities
- `GET /api/activities/missed/all` - Get missed activities
- `PATCH /api/activities/missed/:id/reason` - Add reason
- `POST /api/activities/missed/move` - Move unfinished to missed

### Categories
- `GET /api/categories` - Get all categories

## Data Flow

```
User Action → Frontend Component → API Service → Backend API
                                        ↓
                                   Update State
                                        ↓
                                   Re-render UI
```

## Error Handling

1. **Network Errors**: Caught and displayed to user with friendly messages
2. **API Errors**: Backend error messages shown in alerts
3. **Validation**: Form validation before API calls
4. **Loading States**: Prevent duplicate submissions

## Testing Checklist

- [ ] Create new activity
- [ ] Edit activity
- [ ] Delete activity
- [ ] Toggle activity completion
- [ ] View all activities
- [ ] Filter by pending
- [ ] Filter by done
- [ ] View missed activities
- [ ] Add reason to missed activity
- [ ] End day functionality
- [ ] Daily reset (test next day)
- [ ] Category selection in modal
- [ ] Progress bar updates
- [ ] Error handling (disconnect backend)

## Next Steps

1. **Add Authentication Check**: Redirect to login if not authenticated
2. **Add Toast Notifications**: Replace alerts with better UI notifications
3. **Add Optimistic Updates**: Update UI before API response
4. **Add Offline Support**: Cache data and sync when online
5. **Add Activity Statistics**: Use the dashboard stats endpoints
6. **Add Prayer Status UI**: Add UI for prayer status field
7. **Add Pull-to-Refresh**: Mobile refresh gesture
8. **Add Activity Search**: Search through activities
9. **Add Date Picker**: View activities from other days

## API Response Format

### Activity Object
```json
{
  "id": 1,
  "title": "Morning Run",
  "description": "5km run in the park",
  "time": "7:00 AM",
  "done": false,
  "prayerStatus": null,
  "dayCompleted": false,
  "category": "Fitness",
  "categoryColor": "#22C55E",
  "categoryId": 1,
  "date": "2026-09-29T00:00:00.000Z",
  "createdAt": "2026-09-29T06:00:00.000Z",
  "updatedAt": "2026-09-29T06:00:00.000Z"
}
```

### Missed Activity Object
```json
{
  "id": 1,
  "title": "Morning Yoga",
  "description": "30 min yoga session",
  "time": "6:30 AM",
  "reason": "Woke up late",
  "category": "Wellness",
  "categoryColor": "#A855F7",
  "categoryId": 3,
  "missedDate": "2026-09-28T00:00:00.000Z",
  "createdAt": "2026-09-29T00:00:00.000Z"
}
```

## Notes

- All API calls require authentication (cookies)
- Activities are filtered by today's date on the backend
- The backend automatically handles date-based filtering
- Categories must exist before creating activities
- Missed activities cannot be edited, only reasons can be added
- The daily reset happens automatically on page load

## Troubleshooting

### "Failed to load activities"
- Check if backend is running on `http://localhost:3000`
- Check if user is logged in (cookies present)
- Check browser console for CORS errors

### Categories not loading
- Run the seed script: `node backend/prisma/seed-categories.js`
- Check if categories table has data

### Activities not saving
- Check request payload in network tab
- Verify categoryId exists
- Check backend console for errors

---

**Integration Complete** ✅

All activities functionality is now connected to the backend API with proper error handling, loading states, and user feedback.
