# 🚀 Deploy Frontend ke Vercel

## 📋 Langkah-langkah Deployment

### 1. **Setup di Vercel Dashboard**

1. **Login ke Vercel**: https://vercel.com
2. **Import Project**: Klik "New Project"
3. **Connect GitHub**: Pilih repository `mandao-online/gudangku`
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2. **Environment Variables di Vercel**

Tambahkan environment variable di Vercel Dashboard:

```
VITE_API_URL = https://your-backend-api.com/api
```

**Cara setting**:
1. Go to Project Settings
2. Environment Variables tab
3. Add: `VITE_API_URL` = `https://your-backend-api.com/api`

### 3. **Alternative: Deploy dengan Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy dari root repository
cd gudangku
vercel --prod

# Atau deploy langsung dari frontend folder
cd frontend
vercel --prod
```

## 🔧 Konfigurasi yang Sudah Disiapkan

### ✅ `vercel.json` (Root Level)
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### ✅ Environment Variables Support
- Frontend sudah dikonfigurasi untuk menggunakan `VITE_API_URL`
- Default: `http://localhost:8001/api` (development)
- Production: Set via Vercel environment variables

### ✅ SPA Routing
- Rewrites sudah dikonfigurasi untuk React Router
- Semua routes akan redirect ke `index.html`

## 🌐 Repository Options

### **Option 1: Deploy dari Repository Utama (Recommended)**
- **Repository**: `https://github.com/mandao-online/gudangku.git`
- **Root Directory**: `frontend`
- **Advantage**: Satu repository, mudah maintenance

### **Option 2: Buat Repository Terpisah untuk Frontend**
Jika ingin repository terpisah:

```bash
# Clone hanya frontend
git clone https://github.com/mandao-online/gudangku.git
cd gudangku/frontend

# Buat repository baru
git init
git add .
git commit -m "Initial frontend commit"
git remote add origin https://github.com/mandao-online/gudangku-frontend.git
git push -u origin main
```

## 📱 Hasil Deployment

Setelah deploy berhasil:
- **URL**: `https://your-project.vercel.app`
- **Custom Domain**: Bisa setup domain custom
- **Auto Deploy**: Setiap push ke main branch akan auto deploy
- **Preview**: Setiap PR akan dapat preview URL

## 🔗 Backend Integration

Frontend akan connect ke backend API yang perlu di-deploy terpisah:
- **Laravel**: Deploy ke shared hosting, VPS, atau cloud
- **Database**: MySQL di hosting provider
- **CORS**: Pastikan domain Vercel di-whitelist di backend

## ⚙️ Advanced Configuration

### Custom Build Settings
Jika perlu kustomisasi lebih lanjut, edit `vercel.json`:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": "vite",
  "functions": {
    "frontend/src/api/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-api.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🎯 Quick Deploy Steps

1. **Push ke GitHub** (sudah done ✅)
2. **Login Vercel** → Import Project
3. **Select Repository**: `mandao-online/gudangku`
4. **Set Root Directory**: `frontend`
5. **Add Environment Variable**: `VITE_API_URL`
6. **Deploy** 🚀

---

**Repository**: https://github.com/mandao-online/gudangku.git
**Frontend Path**: `/frontend`
**Framework**: React + Vite + TypeScript