# 🔧 .htaccess Configurations for Hostinger

## 🎯 **Current Issue**
Your current `.htaccess` is redirecting to `public/$1` but Laravel needs proper routing configuration.

## 📁 **Laravel .htaccess Structure**

### **Option 1: Laravel in Subdirectory (Recommended)**
If your Laravel app is in `public_html/gudangku/`:

#### **Root .htaccess** (`gudangku/.htaccess`)
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Redirect all requests to public folder
    RewriteCond %{REQUEST_URI} !^/public/
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

#### **Public .htaccess** (`gudangku/public/.htaccess`)
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

### **Option 2: Document Root Points to Public Folder**
If you configure Hostinger to point directly to Laravel's `public` folder:

#### **Only Public .htaccess** (`public/.htaccess`)
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

### **Option 3: Move Public Contents to Root**
If you move Laravel's `public` folder contents to `public_html`:

#### **Root .htaccess** (`public_html/.htaccess`)
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

## 🚀 **Recommended Setup for Hostinger**

### **Step 1: Upload Laravel Files**
```
public_html/
├── gudangku/                 (your Laravel app)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/              (Laravel public folder)
│   │   ├── index.php
│   │   └── .htaccess        (Laravel public .htaccess)
│   ├── .htaccess            (Root redirect .htaccess)
│   ├── .env
│   └── ...
└── (other files)
```

### **Step 2: Configure .htaccess Files**
1. **Root .htaccess** (`gudangku/.htaccess`) - Redirects to public folder
2. **Public .htaccess** (`gudangku/public/.htaccess`) - Laravel routing

### **Step 3: Test URLs**
Your API will be accessible at:
```
https://gudangku.dashdearchitect.com/api/test
https://gudangku.dashdearchitect.com/api/debug
```

## 🔍 **Troubleshooting .htaccess Issues**

### **Issue: 404 Not Found**
**Cause**: Wrong .htaccess configuration or mod_rewrite disabled
**Solution**:
1. Check if mod_rewrite is enabled (contact Hostinger)
2. Verify .htaccess files are in correct locations
3. Test with simple redirect first

### **Issue: 500 Internal Server Error**
**Cause**: Syntax error in .htaccess
**Solution**:
1. Check .htaccess syntax
2. Remove .htaccess temporarily to isolate issue
3. Add rules one by one to find problematic line

### **Issue: API Routes Not Working**
**Cause**: Requests not reaching Laravel's index.php
**Solution**:
1. Ensure public/.htaccess has correct Laravel rules
2. Check if Authorization header is being passed
3. Verify RewriteEngine is On

## 🧪 **Testing .htaccess Configuration**

### **Test 1: Basic Redirect**
Create simple test file:
```php
<?php
// test-htaccess.php
echo "htaccess is working!";
?>
```

### **Test 2: Laravel Routes**
Test these URLs:
- `https://gudangku.dashdearchitect.com/api/test`
- `https://gudangku.dashdearchitect.com/api/debug`

### **Test 3: Authorization Headers**
Test API login to ensure headers are passed correctly.

## 📋 **Quick Fix Checklist**

- [ ] Replace current .htaccess with proper Laravel configuration
- [ ] Ensure .htaccess files are in correct locations
- [ ] Test basic redirect functionality
- [ ] Test Laravel API routes
- [ ] Verify mod_rewrite is enabled on server
- [ ] Check file permissions (644 for .htaccess files)

## 🎯 **Expected Results**

After proper .htaccess configuration:
- ✅ `https://gudangku.dashdearchitect.com/api/test` returns JSON
- ✅ `https://gudangku.dashdearchitect.com/api/debug` returns Laravel info
- ✅ All API endpoints work correctly
- ✅ No 404 or 500 errors

---

**Replace your current .htaccess files with the ones provided above and test the API endpoints!**