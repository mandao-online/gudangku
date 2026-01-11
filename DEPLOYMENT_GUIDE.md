# Deployment Guide - GudangKu

## 📁 Repository Structure

Repository ini telah disiapkan dengan struktur gabungan backend dan frontend:

```
gudangku/
├── backend/          # Laravel 8 API
├── frontend/         # React + TypeScript
├── README.md         # Dokumentasi utama
├── .gitignore        # Git ignore rules
└── DEPLOYMENT_GUIDE.md
```

## 🚀 Push ke GitHub

### Manual Push (jika ada masalah permission)

1. **Pastikan Anda memiliki akses ke repository**
   ```bash
   # Cek remote
   git remote -v
   ```

2. **Push dengan authentication**
   ```bash
   # Jika menggunakan personal access token
   git push https://[USERNAME]:[TOKEN]@github.com/mandao-online/gudangku.git main
   
   # Atau setup SSH key dan gunakan SSH URL
   git remote set-url origin git@github.com:mandao-online/gudangku.git
   git push -u origin main
   ```

3. **Alternative: Create new repository**
   - Buat repository baru di GitHub dengan nama `gudangku`
   - Copy remote URL dan update:
   ```bash
   git remote set-url origin [NEW_REPO_URL]
   git push -u origin main
   ```

## 🛠️ Local Development Setup

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configure database in .env
php artisan migrate
php artisan db:seed
php artisan serve --port=8001
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:8081
```

## 🌐 Production Deployment

### Backend Deployment
1. Upload `backend/` folder to server
2. Install dependencies: `composer install --optimize-autoloader --no-dev`
3. Configure `.env` file
4. Run migrations: `php artisan migrate --force`
5. Optimize: `php artisan optimize`

### Frontend Deployment
1. Build: `cd frontend && npm run build`
2. Upload `frontend/dist/` contents to web server
3. Configure web server for SPA routing

## 📊 Current Status

✅ **Completed Features:**
- Dashboard with detail modals
- Inventory management (CRUD, soft delete, barcode)
- User management with roles
- Attendance system with photos
- Categories and units management
- Image upload with compression
- Export functionality
- Mobile responsive design

✅ **Technical Stack:**
- Backend: Laravel 8 + MySQL + Sanctum
- Frontend: React 18 + TypeScript + Vite
- UI: shadcn/ui + Tailwind CSS
- Authentication: Phone-based login

## 🔑 Default Login

- **Phone**: `081154105490`
- **Password**: `password`
- **Role**: Admin

## 📝 Next Steps

1. Push repository ke GitHub
2. Setup CI/CD pipeline
3. Configure production environment
4. Setup domain dan SSL
5. Monitor dan maintenance

---

Repository siap untuk di-push ke GitHub! 🚀