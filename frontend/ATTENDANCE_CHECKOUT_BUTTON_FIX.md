# Fix Attendance Check-Out Button Issue

## Problem
Tombol check-out tidak muncul setelah user melakukan check-in. User tidak bisa melakukan check-out karena tombol tidak terlihat.

## Root Cause
Terdapat ketidaksesuaian nama properti antara frontend dan backend:
- Frontend menggunakan `checkIn` dan `checkOut` (camelCase)
- Backend API mengembalikan `check_in` dan `check_out` (snake_case)

## Solution
Updated `AttendanceCard.tsx` to use the correct property names from API response:

### Changes Made
**File: `field-flow-main/src/components/AttendanceCard.tsx`**

1. **Fixed property check for attendance status:**
   ```typescript
   // Before (incorrect)
   const hasCheckedIn = !!attendance?.checkIn;
   const hasCheckedOut = !!attendance?.checkOut;
   
   // After (correct)
   const hasCheckedIn = !!attendance?.check_in;
   const hasCheckedOut = !!attendance?.check_out;
   ```

2. **Fixed time display in complete attendance view:**
   ```typescript
   // Before (incorrect)
   {formatTime(attendance.checkIn!)}
   {formatTime(attendance.checkOut!)}
   
   // After (correct)
   {formatTime(attendance.check_in!)}
   {formatTime(attendance.check_out!)}
   ```

3. **Fixed time display in check-in status:**
   ```typescript
   // Before (incorrect)
   {formatTime(attendance.checkIn!)}
   
   // After (correct)
   {formatTime(attendance.check_in!)}
   ```

## Expected Behavior After Fix
1. User taps "Tap untuk Hadir" → Check-in modal opens
2. After successful check-in → Shows check-in status with time
3. **"Tap untuk Pulang" button now appears** → User can check-out
4. After check-out → Shows complete attendance with both times

## API Response Structure
The backend returns attendance data with snake_case properties:
```json
{
  "id": "1",
  "date": "2026-01-11",
  "check_in": "2026-01-11 08:00:00",
  "check_out": "2026-01-11 17:00:00",
  "status": "present",
  "check_in_photo_url": "...",
  "check_out_photo_url": "..."
}
```

## Status
✅ **FIXED** - Check-out button will now appear after check-in
✅ Time displays correctly in all states
✅ No TypeScript errors
✅ Maintains all existing functionality

The attendance flow now works correctly:
**Check-in → Check-out button appears → Check-out → Complete status**