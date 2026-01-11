<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Models\AttendanceRecord;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function __construct()
    {
        // Set timezone to Asia/Jakarta (UTC+7) or Asia/Singapore (UTC+8)
        // Using Asia/Singapore for UTC+8
        Carbon::setLocale('id');
    }
    public function index(Request $request)
    {
        $query = AttendanceRecord::with('user');
        
        // Only filter by user_id if not admin/manager
        $user = auth()->user();
        if ($user->role !== 'admin' && $user->role !== 'manager') {
            $query->where('user_id', auth()->id());
        }
        
        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }
        
        // Filter by search term (user name)
        if ($request->has('search')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }
        
        $attendance = $query->orderBy('date', 'desc')
                           ->paginate($request->get('per_page', 15));
        
        return response()->json([
            'data' => AttendanceResource::collection($attendance->items()),
            'current_page' => $attendance->currentPage(),
            'last_page' => $attendance->lastPage(),
            'per_page' => $attendance->perPage(),
            'total' => $attendance->total(),
            'from' => $attendance->firstItem(),
            'to' => $attendance->lastItem(),
        ]);
    }

    public function today(Request $request)
    {
        // Use Asia/Singapore timezone (UTC+8)
        $today = Carbon::today('Asia/Singapore');
        $attendance = AttendanceRecord::where('user_id', auth()->id())
                                     ->whereDate('date', $today)
                                     ->first();
        
        return response()->json([
            'success' => true,
            'data' => $attendance ? new AttendanceResource($attendance) : null
        ]);
    }

    public function checkIn(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'notes' => 'nullable|string|max:500',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
        ]);

        // Use Asia/Singapore timezone (UTC+8)
        $today = Carbon::today('Asia/Singapore');
        $now = Carbon::now('Asia/Singapore');
        
        // Check if already checked in today
        $existingAttendance = AttendanceRecord::where('user_id', auth()->id())
                                             ->whereDate('date', $today)
                                             ->first();
        
        if ($existingAttendance && $existingAttendance->check_in) {
            return response()->json([
                'success' => false,
                'message' => 'You have already checked in today'
            ], 400);
        }
        
        // Determine status - always set as present (no late status)
        $status = 'present';
        
        // Handle photo upload
        $photoPath = null;
        if ($request->hasFile('photo')) {
            try {
                $file = $request->file('photo');
                $filename = 'checkin_' . auth()->id() . '_' . $today->format('Y-m-d') . '_' . time() . '.' . $file->getClientOriginalExtension();
                $photoPath = $file->storeAs('attendance', $filename, 'public');
                $photoPath = basename($photoPath); // Store only filename
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to upload photo: ' . $e->getMessage()
                ], 500);
            }
        }
        
        try {
            // Create or update attendance record
            $attendance = AttendanceRecord::updateOrCreate(
                [
                    'user_id' => auth()->id(),
                    'date' => $today,
                ],
                [
                    'check_in' => $now,
                    'status' => $status,
                    'latitude' => $request->latitude,
                    'longitude' => $request->longitude,
                    'notes' => $request->notes,
                    'check_in_photo' => $photoPath,
                ]
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Check-in successful',
                'data' => new AttendanceResource($attendance)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save attendance: ' . $e->getMessage()
            ], 500);
        }
    }

    public function checkOut(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'notes' => 'nullable|string|max:500',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
        ]);

        // Use Asia/Singapore timezone (UTC+8)
        $today = Carbon::today('Asia/Singapore');
        $now = Carbon::now('Asia/Singapore');
        
        // Find today's attendance record
        $attendance = AttendanceRecord::where('user_id', auth()->id())
                                     ->whereDate('date', $today)
                                     ->first();
        
        if (!$attendance || !$attendance->check_in) {
            return response()->json([
                'success' => false,
                'message' => 'You must check in first'
            ], 400);
        }
        
        if ($attendance->check_out) {
            return response()->json([
                'success' => false,
                'message' => 'You have already checked out today'
            ], 400);
        }
        
        // Handle photo upload
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = 'checkout_' . auth()->id() . '_' . $today->format('Y-m-d') . '_' . time() . '.' . $file->getClientOriginalExtension();
            $photoPath = $file->storeAs('attendance', $filename, 'public');
            $photoPath = basename($photoPath); // Store only filename
        }
        
        // Update attendance record
        $attendance->update([
            'check_out' => $now,
            'notes' => $request->notes ?: $attendance->notes,
            'check_out_photo' => $photoPath,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Check-out successful',
            'data' => new AttendanceResource($attendance)
        ]);
    }

    public function history(Request $request)
    {
        $query = AttendanceRecord::where('user_id', auth()->id());
        
        // Get pagination parameters
        $perPage = $request->get('per_page', 7); // Default 7 records per page
        $page = $request->get('page', 1);
        
        // Get last N days (default 30 days) using Asia/Singapore timezone
        $days = $request->get('days', 30);
        $query->whereDate('date', '>=', Carbon::today('Asia/Singapore')->subDays($days));
        
        $attendance = $query->orderBy('date', 'desc')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => AttendanceResource::collection($attendance->items()),
            'pagination' => [
                'current_page' => $attendance->currentPage(),
                'last_page' => $attendance->lastPage(),
                'per_page' => $attendance->perPage(),
                'total' => $attendance->total(),
                'from' => $attendance->firstItem(),
                'to' => $attendance->lastItem(),
            ]
        ]);
    }

    public function exportExcel(Request $request)
    {
        // Start with base query
        $query = AttendanceRecord::with('user');
        
        // Get current user
        $user = auth()->user();
        
        // For regular users, only show their own records
        // For admin/manager, show all records
        if (!in_array($user->role, ['admin', 'manager'])) {
            $query->where('user_id', auth()->id());
        }
        
        // Apply filters
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('date', '<=', $request->date_to);
        }
        
        if ($request->has('search') && $request->search) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }
        
        // Get the data
        $attendance = $query->orderBy('date', 'desc')->get();
        
        // Generate filename
        $filename = 'attendance_export_' . date('Y-m-d_H-i-s') . '.csv';
        
        // Create CSV content with UTF-8 BOM
        $csvContent = "\xEF\xBB\xBF";
        
        // Add headers
        $headers = ['Tanggal', 'Nama', 'Status', 'Jam Masuk', 'Jam Pulang', 'Jam Kerja', 'Catatan'];
        $csvContent .= implode(',', array_map(function($header) {
            return '"' . str_replace('"', '""', $header) . '"';
        }, $headers)) . "\n";
        
        // Add data rows
        if ($attendance->count() > 0) {
            foreach ($attendance as $record) {
                $row = [
                    $record->date instanceof \Carbon\Carbon ? $record->date->format('d/m/Y') : date('d/m/Y', strtotime($record->date)),
                    $record->user ? $record->user->name : 'Unknown User',
                    $record->status === 'present' ? 'Hadir' : 'Tidak Hadir',
                    $record->check_in ? $record->check_in->format('H:i:s') : '-',
                    $record->check_out ? $record->check_out->format('H:i:s') : '-',
                    $record->work_hours_formatted ?: '-',
                    $record->notes ?: '-'
                ];
                
                $csvContent .= implode(',', array_map(function($field) {
                    return '"' . str_replace('"', '""', (string)$field) . '"';
                }, $row)) . "\n";
            }
        } else {
            // Add no data message
            $csvContent .= '"Tidak ada data absensi ditemukan","","","","","",""\n';
        }
        
        // Return CSV response
        return response($csvContent)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    public function debug(Request $request)
    {
        $user = auth()->user();
        $totalRecords = AttendanceRecord::count();
        $userRecords = AttendanceRecord::where('user_id', auth()->id())->count();
        $recentRecords = AttendanceRecord::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        return response()->json([
            'user' => $user,
            'total_attendance_records' => $totalRecords,
            'user_attendance_records' => $userRecords,
            'recent_records' => $recentRecords,
            'sample_query' => AttendanceRecord::with('user')->where('user_id', auth()->id())->toSql()
        ]);
    }
}