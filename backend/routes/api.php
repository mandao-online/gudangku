<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/activities', [DashboardController::class, 'activities']);
    
    // Items routes
    Route::apiResource('items', ItemController::class);
    Route::post('/items/{item}/stock-in', [ItemController::class, 'stockIn']);
    Route::post('/items/{item}/stock-out', [ItemController::class, 'stockOut']);
    Route::get('/stock-movements', [ItemController::class, 'stockMovements']);
    
    // Soft delete routes for items
    Route::get('/items-trashed', [ItemController::class, 'trashed']);
    Route::post('/items/{id}/restore', [ItemController::class, 'restore']);
    Route::delete('/items/{id}/force-delete', [ItemController::class, 'forceDelete']);
    
    // Units routes
    Route::apiResource('units', UnitController::class);
    Route::get('/units-options', [UnitController::class, 'options']);
    
    // Categories routes
    Route::apiResource('categories', CategoryController::class);
    Route::get('/categories-options', [CategoryController::class, 'options']);
    
    // Attendance routes
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('/attendance/history', [AttendanceController::class, 'history']);
    Route::get('/attendance/today', [AttendanceController::class, 'today']);
    Route::get('/attendance/export-excel', [AttendanceController::class, 'exportExcel']);
    Route::get('/attendance/debug', [AttendanceController::class, 'debug']);
    
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    
    // User management routes (admin only)
    Route::apiResource('users', UserController::class);
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
});
