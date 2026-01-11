# Attendance Management Feature

## Overview
Added a comprehensive attendance management system accessible from the Profile menu, featuring data viewing, filtering, pagination, and Excel export functionality.

## Features Added

### 1. Profile Menu Integration
**File: `field-flow-main/src/pages/Profile.tsx`**

Added "Kelola Absensi" menu item:
- Icon: Calendar (blue theme)
- Description: "Lihat dan export data absensi"
- Route: `/attendance-management`
- Positioned between "Edit Profil" and "Kelola Satuan"

### 2. Attendance Management Page
**File: `field-flow-main/src/pages/AttendanceManagement.tsx`**

**Core Features:**
- **Data Display**: Comprehensive attendance records with user details
- **Filtering**: Date range and employee name search
- **Pagination**: 15 records per page with navigation
- **Excel Export**: Download filtered data as Excel file
- **Photo Viewing**: Zoom functionality for attendance photos

**Filter Options:**
- **Date Range**: From/To date pickers
- **Employee Search**: Name-based search with real-time filtering
- **Reset**: Clear all filters button

**Data Display:**
- Employee name and attendance date
- Check-in/out times with status badges
- Work hours calculation
- Notes display
- Photo thumbnails with zoom capability
- Status indicators (Present/Absent)

### 3. API Enhancements
**File: `field-flow-main/src/services/api.ts`**

**New Endpoints:**
```typescript
// Enhanced getAll with search parameter
getAll: async (params?: {
  date_from?: string;
  date_to?: string;
  search?: string;
  per_page?: number;
  page?: number;
}): Promise<PaginatedResponse>

// Excel export functionality
exportExcel: async (params?: {
  date_from?: string;
  date_to?: string;
  search?: string;
}): Promise<ApiResponse>
```

### 4. Backend Implementation
**File: `api/app/Http/Controllers/Api/AttendanceController.php`**

**Export Excel Method:**
- Generates CSV file (Excel-compatible)
- Includes comprehensive attendance data
- Supports filtering by date range and employee name
- Creates downloadable file with timestamp
- Returns download URL for frontend

**Excel Data Structure:**
```
Tanggal | Nama | Status | Jam Masuk | Jam Pulang | Jam Kerja | Catatan
```

**File Storage:**
- Location: `storage/app/public/exports/`
- Naming: `attendance_export_YYYY-MM-DD_HH-mm-ss.xlsx`
- Auto-cleanup: Files stored for download

### 5. Route Configuration
**Files: `field-flow-main/src/App.tsx`, `api/routes/api.php`**

**Frontend Route:**
```typescript
<Route path="/attendance-management" element={
  <ProtectedRoute>
    <AttendanceManagement />
  </ProtectedRoute>
} />
```

**Backend Route:**
```php
Route::get('/attendance/export-excel', [AttendanceController::class, 'exportExcel']);
```

## User Interface Design

### Filter Section
```
┌─────────────────────────────────────┐
│ 🔍 Filter Data                      │
├─────────────────────────────────────┤
│ Tanggal Dari: [Date Picker]        │
│ Tanggal Sampai: [Date Picker]      │
│ Cari Karyawan: [Search Input] [🔍] │
│ [Reset]                             │
└─────────────────────────────────────┘
```

### Data Display
```
┌─────────────────────────────────────┐
│ Data Absensi                        │
├─────────────────────────────────────┤
│ ✅ Ahmad Budiman        [Hadir]     │
│    11 Jan 2026                      │
│    Masuk: 08:00 • Pulang: 17:00     │
│    Jam kerja: 8 jam 30 menit        │
│    [📷 Masuk] [📷 Pulang]           │
├─────────────────────────────────────┤
│ [< Sebelumnya] [1][2][3] [Selanjutnya >] │
└─────────────────────────────────────┘
```

### Export Section
```
┌─────────────────────────────────────┐
│ Menampilkan 15 dari 150 data        │
│                    [📥 Export Excel] │
└─────────────────────────────────────┘
```

## Technical Implementation

### State Management
```typescript
const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [isExporting, setIsExporting] = useState(false);
```

### Filter Logic
- Real-time search with debouncing
- Date range validation
- Combined filter parameters
- Reset functionality

### Pagination
- 15 records per page
- Smart page number display (max 5 pages shown)
- Previous/Next navigation
- Page jump functionality

### Export Process
1. User clicks "Export Excel" button
2. Frontend sends filtered parameters to API
3. Backend generates CSV file with attendance data
4. Backend returns download URL
5. Frontend triggers automatic download
6. Success notification displayed

## Excel Export Features

### Data Included
- **Tanggal**: Formatted date (DD/MM/YYYY)
- **Nama**: Employee name
- **Status**: Hadir/Tidak Hadir
- **Jam Masuk**: Check-in time (HH:mm:ss)
- **Jam Pulang**: Check-out time (HH:mm:ss)
- **Jam Kerja**: Calculated work hours
- **Catatan**: Employee notes

### File Format
- CSV format (Excel-compatible)
- UTF-8 encoding
- Comma-separated values
- Headers in Indonesian

### Download Process
- Automatic download trigger
- Unique filename with timestamp
- Temporary file storage
- Success/error feedback

## User Experience

### Navigation Flow
1. **Profile Page** → Click "Kelola Absensi"
2. **Attendance Management** → View/filter/export data
3. **Export** → Download Excel file
4. **Photo Zoom** → Click thumbnails for full view

### Loading States
- **Data Loading**: Spinner with "Memuat data absensi..."
- **Export Loading**: Button shows "Exporting..." with spinner
- **Search Loading**: Disabled buttons during search

### Error Handling
- Network errors with retry suggestions
- Empty data states with helpful messages
- Export failures with error notifications
- Invalid date range warnings

### Mobile Responsiveness
- Touch-friendly filter controls
- Responsive grid layout
- Mobile-optimized pagination
- Swipe-friendly photo thumbnails

## Benefits

### For Users
- ✅ **Comprehensive View**: All attendance data in one place
- ✅ **Easy Filtering**: Quick search and date range selection
- ✅ **Excel Export**: Download data for external analysis
- ✅ **Photo Verification**: View attendance photos for verification
- ✅ **Mobile Friendly**: Works perfectly on mobile devices

### For Management
- ✅ **Data Export**: Easy export for reporting and analysis
- ✅ **Search Capability**: Find specific employee records quickly
- ✅ **Date Filtering**: Focus on specific time periods
- ✅ **Visual Verification**: Photo evidence for attendance

### Technical Benefits
- ✅ **Scalable Pagination**: Handles large datasets efficiently
- ✅ **Optimized Queries**: Efficient database queries with filtering
- ✅ **File Management**: Proper file storage and cleanup
- ✅ **Error Handling**: Comprehensive error management

## Implementation Status
✅ Profile menu integration
✅ Attendance management page created
✅ Filter functionality (date range, search)
✅ Pagination with navigation
✅ Excel export feature
✅ Photo zoom integration
✅ API endpoints implemented
✅ Backend export logic
✅ Route configuration
✅ Mobile responsive design
✅ Loading states and error handling
✅ File download functionality

The attendance management system provides a complete solution for viewing, filtering, and exporting attendance data with a user-friendly interface and robust functionality.