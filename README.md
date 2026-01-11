# GudangKu - Warehouse Management System

Sistem manajemen gudang modern dengan backend Laravel dan frontend React.

## 🚀 Features

### 📊 Dashboard
- Statistik real-time inventory
- Modal detail untuk stok rendah dan transaksi
- Status absensi karyawan
- Aktivitas terbaru

### 📦 Inventory Management
- CRUD barang dengan kategori dan unit
- Barcode scanner untuk input cepat
- Stock in/out dengan tracking
- Low stock alerts
- Soft delete dengan restore
- Image upload dengan compression
- Export data ke CSV/Excel

### 👥 User Management
- Role-based access (Admin, Manager, Staff)
- Profile management dengan avatar
- Phone-based authentication
- User activity tracking

### ⏰ Attendance System
- Check-in/out dengan GPS location
- Photo capture untuk verifikasi
- Export attendance ke Excel
- Timezone support
- Management dashboard untuk admin

### 🏷️ Master Data
- Categories management
- Units management
- Supplier management

## 🛠️ Tech Stack

### Backend (Laravel 8)
- **Framework**: Laravel 8.x
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **File Storage**: Local/Cloud storage
- **API**: RESTful API with Resources

### Frontend (React + TypeScript)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Routing**: React Router
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📁 Project Structure

```
gudangku/
├── backend/          # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
├── frontend/         # React App
│   ├── src/
│   ├── public/
│   └── ...
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- PHP 7.4+
- Composer
- Node.js 16+
- MySQL
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configure database in .env**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=gudangku_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. **Run migrations and seeders**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Create storage link**
   ```bash
   php artisan storage:link
   ```

7. **Start development server**
   ```bash
   php artisan serve --port=8001
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

### Access the Application

- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:8001/api
- **Login**: Phone `081154105490`, Password `password`

## 👤 Default Users

| Role | Phone | Password | Name |
|------|-------|----------|------|
| Admin | 0811545857 | password | Administrator |
| Admin | 081154105490 | password | Rizal Fatih |
| Manager | 08123412341234 | password | Siti Nurhaliza |

## 📱 Mobile Support

Aplikasi fully responsive dan mendukung:
- Touch gestures
- Mobile-first design
- PWA capabilities
- Offline support (coming soon)

## 🔧 Development

### Backend Commands
```bash
# Run tests
php artisan test

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Generate API documentation
php artisan l5-swagger:generate
```

### Frontend Commands
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📊 API Documentation

API documentation tersedia di `/api/documentation` setelah menjalankan:
```bash
php artisan l5-swagger:generate
```

## 🚀 Deployment

### Backend (Laravel)
1. Upload files ke server
2. Install dependencies: `composer install --optimize-autoloader --no-dev`
3. Set environment: `cp .env.example .env`
4. Generate key: `php artisan key:generate`
5. Run migrations: `php artisan migrate --force`
6. Optimize: `php artisan optimize`

### Frontend (React)
1. Build: `npm run build`
2. Upload `dist/` folder ke web server
3. Configure web server untuk SPA routing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

Untuk bantuan dan pertanyaan:
- Create an issue di GitHub
- Email: support@gudangku.com

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Advanced reporting
- [ ] Multi-warehouse support
- [ ] Integration dengan e-commerce
- [ ] Mobile app (React Native)
- [ ] Barcode printing
- [ ] Advanced analytics

---

**GudangKu** - Modern Warehouse Management System