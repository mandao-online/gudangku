export interface Item {
  id: string;
  name: string;
  sku: string;
  stock: number;
  unit: string;
  category: string;
  min_stock: number;
  description?: string;
  price?: number;
  supplier?: string;
  image?: string;
  image_url?: string;
  is_active: boolean;
  is_low_stock?: boolean;
  deleted_at?: string | null;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  note: string;
  timestamp: Date;
  stock_before?: number;
  stock_after?: number;
  user_name?: string;
  reference_number?: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id: string;
  user_id?: string;
  user_name?: string;
  employeeName?: string; // Keep for backward compatibility
  date: string;
  checkIn?: Date;
  checkOut?: Date;
  check_in?: string; // API format
  check_out?: string; // API format
  status: 'present' | 'absent';
  notes?: string;
  latitude?: number;
  longitude?: number;
  work_hours?: number;
  work_hours_formatted?: string;
  check_in_photo?: string;
  check_in_photo_url?: string;
  check_out_photo?: string;
  check_out_photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  position?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Unit {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
