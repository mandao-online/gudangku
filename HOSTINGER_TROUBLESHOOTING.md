# 🔧 Hostinger Deployment Troubleshooting

## 🚨 Current Issue: 500 Internal Server Error

### 📋 **Step-by-Step Debugging**

#### **1. Test Basic PHP Functionality**
Upload and test these files to your Hostinger root directory:

```
https://gudangku.dashdearchitect.com/info.php
https://gudangku.dashdearchitect.com/debug.php
```

#### **2. Check Laravel Routes**
After fixing basic issues, test these endpoints:

```
https://gudangku.dashdearchitect.com/api/test
https://gudangku.dashdearchitect.com/api/debug
```

### 🔍 **Common Hostinger Issues & Solutions**

#### **Issue 1: File Structure**
**Problem**: Laravel files not in correct directory
**Solution**: Ensure your Laravel files are in the correct location:
```
public_html/
├── api/              (your Laravel app)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── public/       (Laravel public folder)
│   └── ...
└── (other files)
```

#### **Issue 2: .htaccess Configuration**
**Problem**: URL rewriting not working
**Solution**: Create/update `.htaccess` in your Laravel public folder:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

#### **Issue 3: PHP Version**
**Problem**: Incompatible PHP version
**Solution**: Ensure PHP 8.0+ is enabled in Hostinger control panel

#### **Issue 4: Composer Dependencies**
**Problem**: Missing vendor folder
**Solution**: Run composer install on server or upload vendor folder

#### **Issue 5: Environment Configuration**
**Problem**: Wrong .env settings
**Solution**: Use the corrected .env file:

```env
APP_NAME="Field Flow API"
APP_ENV=production
APP_KEY=base64:ugdjQ5NQflcwRGDfi/Iwedy1njydxBIuYP+UmbfgC5s=
APP_DEBUG=false
APP_URL=https://gudangku.dashdearchitect.com

DB_CONNECTION=mysql
DB_HOST=194.59.164.10
DB_PORT=3306
DB_DATABASE=u774809254_gudangku
DB_USERNAME=u774809254_gudangku
DB_PASSWORD=Gudangku1!

# Add your frontend domain here
SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

#### **Issue 6: File Permissions**
**Problem**: Laravel can't write to storage/cache
**Solution**: Set correct permissions:
- `storage/` folder: 755 or 775
- `bootstrap/cache/` folder: 755 or 775

### 🎯 **Quick Fix Checklist**

1. **✅ Upload corrected .env file**
2. **✅ Check file structure matches Laravel requirements**
3. **✅ Verify PHP version is 8.0+**
4. **✅ Ensure vendor folder exists**
5. **✅ Set correct file permissions**
6. **✅ Test database connection**
7. **✅ Check .htaccess configuration**

### 🔧 **Hostinger-Specific Setup**

#### **Document Root Configuration**
If your Laravel app is in a subfolder, you may need to:

1. **Option A**: Move Laravel's `public` folder contents to `public_html`
2. **Option B**: Update document root in Hostinger control panel
3. **Option C**: Use subdomain pointing to Laravel's public folder

#### **Database Connection**
Your database credentials look correct:
- Host: `194.59.164.10`
- Database: `u774809254_gudangku`
- Username: `u774809254_gudangku`
- Password: `Gudangku1!`

### 📞 **Next Steps**

1. **Upload debug files** (`info.php`, `debug.php`) to test basic functionality
2. **Check server logs** in Hostinger control panel for specific errors
3. **Test database connection** using the debug scripts
4. **Verify Laravel installation** step by step

### 🆘 **If Still Not Working**

Check these URLs in order:
1. `https://gudangku.dashdearchitect.com/info.php` - Basic PHP info
2. `https://gudangku.dashdearchitect.com/debug.php` - Detailed debug info
3. `https://gudangku.dashdearchitect.com/api/test` - Laravel test route
4. `https://gudangku.dashdearchitect.com/api/debug` - Laravel debug route

Each step will help identify where the issue is occurring.

---

**Remember**: The 500 error means there's a server-side issue. The debug scripts will help identify exactly what's wrong.