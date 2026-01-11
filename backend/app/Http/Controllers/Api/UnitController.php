<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Unit::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('symbol', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter active units
        if ($request->has('active') && $request->active) {
            $query->active();
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $units = $query->paginate($request->get('per_page', 50));

        return response()->json([
            'data' => $units->items(),
            'current_page' => $units->currentPage(),
            'last_page' => $units->lastPage(),
            'per_page' => $units->perPage(),
            'total' => $units->total(),
            'from' => $units->firstItem(),
            'to' => $units->lastItem(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:units,name',
            'symbol' => 'nullable|string|max:10',
            'description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $unit = Unit::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Satuan berhasil ditambahkan',
            'data' => $unit
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Unit  $unit
     * @return \Illuminate\Http\Response
     */
    public function show(Unit $unit)
    {
        return response()->json([
            'success' => true,
            'data' => $unit
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Unit  $unit
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Unit $unit)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:units,name,' . $unit->id,
            'symbol' => 'nullable|string|max:10',
            'description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $unit->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Satuan berhasil diperbarui',
            'data' => $unit
        ]);
    }

    /**
     * Remove the specified resource from storage (Soft Delete).
     *
     * @param  \App\Models\Unit  $unit
     * @return \Illuminate\Http\Response
     */
    public function destroy(Unit $unit)
    {
        // Check if unit is being used by any items
        $itemsCount = $unit->items()->count();
        
        if ($itemsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Satuan tidak dapat dihapus karena sedang digunakan oleh {$itemsCount} barang"
            ], 422);
        }

        // Soft delete the unit
        $unit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Satuan berhasil dihapus'
        ]);
    }

    /**
     * Get all active units for dropdown/select options.
     *
     * @return \Illuminate\Http\Response
     */
    public function options()
    {
        $units = Unit::active()
                    ->orderBy('name')
                    ->get(['id', 'name', 'symbol']);

        return response()->json([
            'success' => true,
            'data' => $units
        ]);
    }
}
