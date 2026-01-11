<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'stock',
        'unit',
        'category',
        'min_stock',
        'description',
        'price',
        'supplier',
        'image',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('stock <= min_stock');
    }

    // Accessors
    public function getIsLowStockAttribute()
    {
        return $this->stock <= $this->min_stock;
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/items/' . $this->image);
        }
        
        return null;
    }
}
