<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
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
            'user_id' => $this->user_id,
            'user_name' => $this->user->name,
            'date' => $this->date->format('Y-m-d'),
            'check_in' => $this->check_in ? $this->check_in->format('Y-m-d H:i:s') : null,
            'check_out' => $this->check_out ? $this->check_out->format('Y-m-d H:i:s') : null,
            'status' => $this->status,
            'notes' => $this->notes,
            'work_hours' => $this->work_hours,
            'work_hours_formatted' => $this->work_hours_formatted,
            'check_in_photo' => $this->check_in_photo,
            'check_in_photo_url' => $this->check_in_photo_url,
            'check_out_photo' => $this->check_out_photo,
            'check_out_photo_url' => $this->check_out_photo_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
