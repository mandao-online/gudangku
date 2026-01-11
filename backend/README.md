# Field Flow API

Backend API untuk aplikasi Field Flow - Warehouse Management System

## Requirements

- PHP 8.1+
- MySQL/MariaDB
- Composer
- XAMPP (untuk development)

## Installation

1. **Clone atau copy project ke folder XAMPP**
   ```bash
   # Project sudah ada di: C:\xampp81\htdocs\warehouse\api
   ```

2. **Install dependencies**
   ```bash
   cd C:\xampp81\htdocs\warehouse\api
   composer install
   ```

3. **Setup Environment**
   ```bash
   # File .env sudah dibuat, pastikan konfigurasi database sesuai
   ```

4. **Start XAMPP Services**
   - Start Apache
   - Start MySQL

5. **Create Database**
   ```sql
   CREATE DATABASE field_flow_db;
   ```

6. **Run Migrations & Seeders**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

7. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

8. **Create Storage Link**
   ```bash
   php artisan storage:link
   ```

## API Endpoints

### Authentication
```
POST /api/login
POST /api/register
POST /api/logout
GET  /api/me
```

### Dashboard
```
GET /api/dashboard/stats
GET /api/dashboard/activities
```

### Items Management
```
GET    /api/items
POST   /api/items
GET    /api/items/{id}
PUT    /api/items/{id}
DELETE /api/items/{id}
POST   /api/items/{id}/stock-in
POST   /api/items/{id}/stock-out
GET    /api/stock-movements
```

### Attendance
```
GET  /api/attendance
POST /api/attendance/check-in
POST /api/attendance/check-out
GET  /api/attendance/history
GET  /api/attendance/today
```

### Profile
```
GET  /api/profile
PUT  /api/profile
POST /api/profile/avatar
```

## Default Users

Setelah menjalankan seeder, tersedia user berikut:

1. **Admin**
   - Email: admin@fieldflow.local
   - Password: password

2. **Staff (Ahmad Budiman)**
   - Email: ahmad.budiman@majubersama.id
   - Password: password

3. **Manager**
   - Email: siti.manager@majubersama.id
   - Password: password

## API Usage Examples

### Login
```bash
curl -X POST http://localhost/warehouse/api/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmad.budiman@majubersama.id",
    "password": "password"
  }'
```

### Get Items (with token)
```bash
curl -X GET http://localhost/warehouse/api/api/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Stock In
```bash
curl -X POST http://localhost/warehouse/api/api/items/1/stock-in \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10,
    "note": "Pembelian dari supplier"
  }'
```

### Check In Attendance
```bash
curl -X POST http://localhost/warehouse/api/api/attendance/check-in \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -6.2088,
    "longitude": 106.8456,
    "notes": "Masuk tepat waktu"
  }'
```

## Database Schema

### Users
- id, name, email, password
- position, department, phone, avatar
- role (admin/manager/staff)
- is_active, timestamps

### Items
- id, name, sku, stock, unit
- category, min_stock, description
- price, supplier, is_active, timestamps

### Stock Movements
- id, item_id, user_id, type (in/out)
- quantity, stock_before, stock_after
- note, reference_number, timestamps

### Attendance Records
- id, user_id, date
- check_in, check_out, status
- notes, latitude, longitude
- work_hours, timestamps

## Features

✅ **Authentication & Authorization**
- JWT tokens via Laravel Sanctum
- Role-based access (admin/manager/staff)
- User registration & login

✅ **Inventory Management**
- CRUD operations for items
- Stock in/out with tracking
- Low stock alerts
- Search & filtering

✅ **Attendance System**
- Check-in/check-out with timestamp
- GPS location tracking
- Automatic late detection
- Attendance history

✅ **Dashboard Analytics**
- Real-time statistics
- Recent activities
- Stock movements tracking

✅ **Profile Management**
- Update user information
- Avatar upload
- Password change

## Development

### Start Development Server
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### Run Tests
```bash
php artisan test
```

### Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## Production Deployment

1. Set `APP_ENV=production` in .env
2. Set `APP_DEBUG=false` in .env
3. Configure proper database credentials
4. Run `php artisan config:cache`
5. Run `php artisan route:cache`
6. Set proper file permissions

## CORS Configuration

API sudah dikonfigurasi untuk menerima request dari frontend React:
- Allowed origins: localhost:8080
- Allowed methods: GET, POST, PUT, DELETE
- Allowed headers: Authorization, Content-Type

## Security Features

- Password hashing with bcrypt
- API token authentication
- Input validation & sanitization
- SQL injection protection via Eloquent ORM
- CORS protection
- Rate limiting (dapat dikonfigurasi)

## Support

Untuk pertanyaan atau issue, silakan hubungi tim development.