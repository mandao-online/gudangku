<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'stock' => $this->stock,
            'unit' => $this->unit,
            'category' => $this->category,
            'min_stock' => $this->min_stock,
            'description' => $this->description,
            'price' => $this->price,
            'supplier' => $this->supplier,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'is_active' => $this->is_active,
            'is_low_stock' => $this->is_low_stock,
            'deleted_at' => $this->deleted_at,
            'is_deleted' => !is_null($this->deleted_at),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
