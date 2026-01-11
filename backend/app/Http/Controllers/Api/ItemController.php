<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ItemResource;
use App\Http\Resources\StockMovementResource;
use App\Models\Item;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Item::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by low stock
        if ($request->has('low_stock') && $request->low_stock) {
            $query->lowStock();
        }

        // Filter active items
        if ($request->has('active') && $request->active) {
            $query->active();
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $items = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => ItemResource::collection($items->items()),
            'current_page' => $items->currentPage(),
            'last_page' => $items->lastPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'from' => $items->firstItem(),
            'to' => $items->lastItem(),
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
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255|unique:items',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'category' => 'required|string|max:100',
            'min_stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $itemData = $request->except('image');

        // Handle image upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('items', $filename, 'public');
            $itemData['image'] = $filename;
        }

        $item = Item::create($itemData);

        return response()->json([
            'success' => true,
            'message' => 'Item created successfully',
            'data' => new ItemResource($item)
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function show(Item $item)
    {
        return response()->json([
            'success' => true,
            'data' => new ItemResource($item)
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Item $item)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255|unique:items,sku,' . $item->id,
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'category' => 'required|string|max:100',
            'min_stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $itemData = $request->except('image');

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($item->image && file_exists(storage_path('app/public/items/' . $item->image))) {
                unlink(storage_path('app/public/items/' . $item->image));
            }

            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('items', $filename, 'public');
            $itemData['image'] = $filename;
        }

        $item->update($itemData);

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully',
            'data' => new ItemResource($item)
        ]);
    }

    /**
     * Remove the specified resource from storage (Soft Delete).
     *
     * @param  \App\Models\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function destroy(Item $item)
    {
        // Soft delete the item
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item berhasil dihapus'
        ]);
    }

    /**
     * Restore a soft deleted item.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function restore($id)
    {
        $item = Item::withTrashed()->findOrFail($id);
        $item->restore();

        return response()->json([
            'success' => true,
            'message' => 'Item berhasil dipulihkan',
            'data' => new ItemResource($item)
        ]);
    }

    /**
     * Permanently delete an item.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function forceDelete($id)
    {
        $item = Item::withTrashed()->findOrFail($id);
        
        // Delete image file if exists
        if ($item->image && file_exists(storage_path('app/public/items/' . $item->image))) {
            unlink(storage_path('app/public/items/' . $item->image));
        }
        
        $item->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Item berhasil dihapus permanen'
        ]);
    }

    /**
     * Get trashed (soft deleted) items.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function trashed(Request $request)
    {
        $query = Item::onlyTrashed();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'deleted_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $items = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => ItemResource::collection($items->items()),
            'current_page' => $items->currentPage(),
            'last_page' => $items->lastPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'from' => $items->firstItem(),
            'to' => $items->lastItem(),
        ]);
    }

    /**
     * Stock In
     */
    public function stockIn(Request $request, Item $item)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string|max:500',
            'reference_number' => 'nullable|string|max:100',
        ]);

        DB::transaction(function () use ($request, $item) {
            $stockBefore = $item->stock;
            $quantity = $request->quantity;
            $stockAfter = $stockBefore + $quantity;

            // Update item stock
            $item->update(['stock' => $stockAfter]);

            // Create stock movement record
            StockMovement::create([
                'item_id' => $item->id,
                'user_id' => auth()->id(),
                'type' => 'in',
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'note' => $request->note,
                'reference_number' => $request->reference_number,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Stock in recorded successfully',
            'data' => new ItemResource($item->fresh())
        ]);
    }

    /**
     * Stock Out
     */
    public function stockOut(Request $request, Item $item)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1|max:' . $item->stock,
            'note' => 'nullable|string|max:500',
            'reference_number' => 'nullable|string|max:100',
        ]);

        DB::transaction(function () use ($request, $item) {
            $stockBefore = $item->stock;
            $quantity = $request->quantity;
            $stockAfter = $stockBefore - $quantity;

            // Update item stock
            $item->update(['stock' => $stockAfter]);

            // Create stock movement record
            StockMovement::create([
                'item_id' => $item->id,
                'user_id' => auth()->id(),
                'type' => 'out',
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'note' => $request->note,
                'reference_number' => $request->reference_number,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Stock out recorded successfully',
            'data' => new ItemResource($item->fresh())
        ]);
    }

    /**
     * Get stock movements
     */
    public function stockMovements(Request $request)
    {
        $query = StockMovement::with(['item', 'user']);

        // Filter by item
        if ($request->has('item_id')) {
            $query->where('item_id', $request->item_id);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $movements = $query->orderBy('created_at', 'desc')
                          ->paginate($request->get('per_page', 15));

        return StockMovementResource::collection($movements);
    }
}