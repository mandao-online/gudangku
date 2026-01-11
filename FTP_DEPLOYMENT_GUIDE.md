# FTP Deployment Guide - Backend Only

## FTP Configuration Details
- **Server**: `ftp.dashdearchitect.com`
- **Username**: `u774809254.gudangku`
- **Password**: `Gudang1!`
- **Remote Path**: `/home/u774809254/domains/dashdearchitect.com/public_html/gudangku`
- **Local Path**: `./backend` (only backend folder)

## Upload Methods

### Method 1: VS Code SFTP Extension (Recommended)

1. **Install Extension**:
   - Install "SFTP" extension in VS Code
   - Configuration file already created: `.vscode/sftp.json`

2. **Upload Steps**:
   - Open VS Code in the `gudangku` directory
   - Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Type "SFTP: Sync Local -> Remote"
   - Select the backend folder to upload

3. **Manual File Upload**:
   - Right-click any file in `backend/` folder
   - Select "SFTP: Upload"

### Method 2: PowerShell Script (Windows)

1. **Run the Script**:
   ```powershell
   .\upload-backend.ps1
   ```

2. **Or use the Batch File**:
   ```cmd
   upload-backend.bat
   ```

3. **Features**:
   - ✅ Uploads only backend files
   - ✅ Excludes unnecessary files (logs, cache, vendor)
   - ✅ Creates directories automatically
   - ✅ Shows upload progress and summary

### Method 3: Manual FTP Client

**Recommended FTP Clients**:
- FileZilla (Free)
- WinSCP (Windows)
- Cyberduck (Mac/Windows)

**Connection Settings**:
```
Host: ftp.dashdearchitect.com
Port: 21
Protocol: FTP
Username: u774809254.gudangku
Password: Gudang1!
```

**Upload Path**:
- Local: `gudangku/backend/`
- Remote: `/home/u774809254/domains/dashdearchitect.com/public_html/gudangku/`

## Files to Exclude

The following files/folders should NOT be uploaded:
- `.git/` - Git repository files
- `.vscode/` - VS Code settings
- `node_modules/` - Node.js dependencies
- `vendor/` - Composer dependencies (if not needed)
- `storage/logs/` - Log files
- `storage/framework/cache/` - Cache files
- `storage/framework/sessions/` - Session files
- `storage/framework/views/` - Compiled views
- `.env.local` - Local environment file
- `.env.example` - Example environment file
- `*.log` - Log files
- `*.tmp` - Temporary files

## Important Files to Upload

Make sure these files are uploaded:
- ✅ `detect-structure.php` - Directory structure detector
- ✅ `fix-storage-paths.php` - Storage link fixer
- ✅ `test-storage-access.php` - Storage access tester
- ✅ `create-storage-link.php` - Storage link creator
- ✅ `cache-manager.php` - Cache management
- ✅ `clear-cache.php` - Cache clearer
- ✅ All PHP files in root directory
- ✅ `app/` directory with controllers and models
- ✅ `config/` directory
- ✅ `database/` directory with migrations and seeders
- ✅ `routes/` directory
- ✅ `public/` directory
- ✅ `.htaccess` files

## After Upload Steps

1. **Test Storage Link**:
   - Visit: `https://gudangku.dashdearchitect.com/detect-structure.php`
   - Check directory structure

2. **Fix Storage Paths**:
   - Visit: `https://gudangku.dashdearchitect.com/fix-storage-paths.php`
   - Create storage symbolic link

3. **Test Image Access**:
   - Visit: `https://gudangku.dashdearchitect.com/storage/avatars/1768132313_2.png`
   - Should display the uploaded image

4. **Clear Cache**:
   - Visit: `https://gudangku.dashdearchitect.com/clear-cache.php`
   - Clear Laravel cache

5. **Test API**:
   - Visit: `https://gudangku.dashdearchitect.com/api/test`
   - Should return API status

## Troubleshooting

### Upload Fails
- Check FTP credentials
- Ensure remote directory exists
- Check file permissions

### Files Not Accessible
- Check `.htaccess` files are uploaded
- Verify directory structure
- Run storage link fixer

### API Not Working
- Check `.env` file configuration
- Clear cache using web tools
- Verify database connection

## Quick Upload Commands

### PowerShell (Windows)
```powershell
# Navigate to gudangku directory
cd path\to\gudangku

# Run upload script
.\upload-backend.ps1
```

### VS Code
```
1. Open gudangku folder in VS Code
2. Ctrl+Shift+P
3. Type "SFTP: Sync Local -> Remote"
4. Select backend folder
```

## File Structure After Upload

```
/home/u774809254/domains/dashdearchitect.com/public_html/gudangku/
├── app/
├── config/
├── database/
├── public/
├── routes/
├── storage/
├── detect-structure.php
├── fix-storage-paths.php
├── test-storage-access.php
├── create-storage-link.php
├── cache-manager.php
├── clear-cache.php
├── .htaccess
└── .env
```

The backend deployment is now configured for easy FTP upload of only the necessary files!