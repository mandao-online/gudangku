<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockMovementResource;
use App\Models\Item;
use App\Models\StockMovement;
use App\Models\AttendanceRecord;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $today = Carbon::today();
        
        // Total items
        $totalItems = Item::active()->count();
        
        // Total stock
        $totalStock = Item::active()->sum('stock');
        
        // Low stock items
        $lowStockItems = Item::active()->lowStock()->count();
        
        // Today's movements
        $todayMovements = StockMovement::today()->get();
        $todayIn = $todayMovements->where('type', 'in')->count();
        $todayOut = $todayMovements->where('type', 'out')->count();
        
        // User's attendance today
        $todayAttendance = null;
        if (auth()->check()) {
            $todayAttendance = AttendanceRecord::where('user_id', auth()->id())
                                              ->whereDate('date', $today)
                                              ->first();
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_items' => $totalItems,
                'total_stock' => $totalStock,
                'low_stock_items' => $lowStockItems,
                'today_stock_in' => $todayIn,
                'today_stock_out' => $todayOut,
                'attendance_status' => $todayAttendance ? [
                    'check_in' => $todayAttendance->check_in,
                    'check_out' => $todayAttendance->check_out,
                    'status' => $todayAttendance->status,
                ] : null,
            ]
        ]);
    }

    public function activities(Request $request)
    {
        $query = StockMovement::with(['item', 'user']);
        
        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        } else {
            // Default to today's activities
            $query->today();
        }
        
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        $activities = $query->orderBy('created_at', 'desc')
                           ->limit($request->get('limit', 10))
                           ->get();
        
        return response()->json([
            'success' => true,
            'data' => StockMovementResource::collection($activities)
        ]);
    }
}