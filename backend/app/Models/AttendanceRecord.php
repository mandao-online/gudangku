<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AttendanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'check_in',
        'check_out',
        'status',
        'notes',
        'latitude',
        'longitude',
        'work_hours',
        'check_in_photo',
        'check_out_photo'
    ];

    protected $casts = [
        'date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeToday($query)
    {
        return $query->whereDate('date', Carbon::today('Asia/Singapore'));
    }

    public function scopeThisWeek($query)
    {
        $now = Carbon::now('Asia/Singapore');
        return $query->whereBetween('date', [$now->startOfWeek(), $now->endOfWeek()]);
    }

    public function scopeThisMonth($query)
    {
        $now = Carbon::now('Asia/Singapore');
        return $query->whereMonth('date', $now->month)
                    ->whereYear('date', $now->year);
    }

    public function scopePresent($query)
    {
        return $query->whereIn('status', ['present', 'late']);
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', 'absent');
    }

    // Mutators
    public function setCheckInAttribute($value)
    {
        $this->attributes['check_in'] = $value;
        $this->updateStatus();
    }

    public function setCheckOutAttribute($value)
    {
        $this->attributes['check_out'] = $value;
        $this->calculateWorkHours();
    }

    // Helper methods
    private function updateStatus()
    {
        if ($this->check_in) {
            // Always set status as present (no late status)
            $this->attributes['status'] = 'present';
        }
    }

    private function calculateWorkHours()
    {
        if ($this->check_in && $this->check_out) {
            $checkIn = Carbon::parse($this->check_in);
            $checkOut = Carbon::parse($this->check_out);
            
            $this->attributes['work_hours'] = $checkOut->diffInMinutes($checkIn);
        }
    }

    // Accessors
    public function getWorkHoursFormattedAttribute()
    {
        if (!$this->work_hours) return null;
        
        $hours = floor($this->work_hours / 60);
        $minutes = $this->work_hours % 60;
        
        return sprintf('%d jam %d menit', $hours, $minutes);
    }

    public function getCheckInPhotoUrlAttribute()
    {
        return $this->check_in_photo ? asset('storage/attendance/' . $this->check_in_photo) : null;
    }

    public function getCheckOutPhotoUrlAttribute()
    {
        return $this->check_out_photo ? asset('storage/attendance/' . $this->check_out_photo) : null;
    }
}
