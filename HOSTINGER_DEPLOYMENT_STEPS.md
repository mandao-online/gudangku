# 🚀 Hostinger Deployment Steps

## ✅ **Current Status**
- ✅ Laravel API working locally (`http://localhost:8001/api/test`)
- ✅ Dependencies installed (`vendor/` folder created)
- ✅ Environment configured for production
- ✅ Test routes added for debugging

## 📦 **Files to Upload to Hostinger**

### **1. Complete Laravel Application**
Upload the entire `gudangku/backend/` folder to your Hostinger account.

### **2. Key Files to Verify**
```
gudangku/backend/
├── .env                    ✅ Production configuration
├── vendor/                 ✅ Composer dependencies
├── routes/api.php          ✅ With test routes
├── public/index.php        ✅ Laravel entry point
├── bootstrap/cache/        ✅ Must be writable
└── storage/                ✅ Must be writable
```

### **3. Debug Files**
Also upload these for troubleshooting:
- `debug.php` - Comprehensive debugging
- `info.php` - Server information

## 🔧 **Hostinger Configuration Steps**

### **Step 1: Upload Files**
1. Upload entire `gudangku/backend/` folder to your hosting directory
2. Ensure all files are in the correct location

### **Step 2: Set File Permissions**
Set these permissions in Hostinger File Manager:
- `storage/` folder: **755** or **775**
- `bootstrap/cache/` folder: **755** or **775**
- `.env` file: **644**

### **Step 3: Configure Document Root**
In Hostinger control panel:
1. Go to **Website** → **Manage**
2. Set document root to point to Laravel's `public` folder
3. Or move contents of `public/` to your web root

### **Step 4: Test Endpoints**
Test these URLs in order:

1. **Basic PHP Test**
   ```
   https://gudangku.dashdearchitect.com/info.php
   ```

2. **Debug Information**
   ```
   https://gudangku.dashdearchitect.com/debug.php
   ```

3. **Laravel Test Route**
   ```
   https://gudangku.dashdearchitect.com/api/test
   ```

4. **Laravel Debug Route**
   ```
   https://gudangku.dashdearchitect.com/api/debug
   ```

## 🔍 **Expected Results**

### **info.php Response**
Should show:
- ✅ PHP version 8.0+
- ✅ All Laravel files exist
- ✅ Database connection successful
- ✅ Proper permissions

### **api/test Response**
```json
{
  "status": "success",
  "message": "API is working!",
  "timestamp": "2026-01-11T10:06:39.004980Z",
  "environment": "production"
}
```

### **api/debug Response**
```json
{
  "status": "success",
  "message": "Laravel debug info",
  "debug": {
    "laravel_version": "8.83.29",
    "environment": "production",
    "database_connection": "success",
    "users_count": 5
  }
}
```

## 🚨 **Common Issues & Solutions**

### **Issue: 500 Internal Server Error**
**Causes:**
- Missing `vendor/` folder
- Wrong file permissions
- Database connection failed
- Missing `.env` file

**Solution:**
1. Check `info.php` output
2. Verify all files uploaded
3. Set correct permissions
4. Test database connection

### **Issue: 404 Not Found**
**Causes:**
- Wrong document root
- Missing `.htaccess` file
- URL rewriting disabled

**Solution:**
1. Configure document root to Laravel's `public` folder
2. Ensure `.htaccess` exists in `public/` folder
3. Enable mod_rewrite in Hostinger

### **Issue: Database Connection Failed**
**Causes:**
- Wrong database credentials
- Database server not accessible
- Firewall blocking connection

**Solution:**
1. Verify credentials in `.env`
2. Test connection using `debug.php`
3. Contact Hostinger support if needed

## 📋 **Deployment Checklist**

- [ ] Upload complete Laravel application
- [ ] Set correct file permissions (755/775 for folders, 644 for files)
- [ ] Configure document root to `public/` folder
- [ ] Test `info.php` - should show all green checkmarks
- [ ] Test `debug.php` - should show database connection success
- [ ] Test `api/test` - should return JSON success response
- [ ] Test `api/debug` - should show Laravel debug info
- [ ] Update frontend `VITE_API_URL` to point to your API
- [ ] Test login from frontend

## 🎯 **Next Steps After Deployment**

1. **Test API endpoints** using the debug routes
2. **Update frontend configuration** with your API URL
3. **Test complete application** flow
4. **Remove debug files** from production (optional)
5. **Set up SSL certificate** (usually automatic on Hostinger)

---

**Remember**: The key is to test each step incrementally. Start with basic PHP, then Laravel, then database, then full API functionality.