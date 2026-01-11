# PowerShell FTP Upload Script for Backend Only
# Upload only backend changes to Hostinger

param(
    [string]$FtpServer = "ftp.dashdearchitect.com",
    [string]$Username = "u774809254.gudangku",
    [string]$Password = "Gudang1!",
    [string]$RemotePath = "/home/u774809254/domains/dashdearchitect.com/public_html/gudangku",
    [string]$LocalPath = "./backend"
)

Write-Host "=== Gudangku Backend FTP Upload ===" -ForegroundColor Green
Write-Host "FTP Server: $FtpServer"
Write-Host "Username: $Username"
Write-Host "Remote Path: $RemotePath"
Write-Host "Local Path: $LocalPath"
Write-Host ""

# Check if local backend directory exists
if (-not (Test-Path $LocalPath)) {
    Write-Host "Error: Local backend directory not found: $LocalPath" -ForegroundColor Red
    exit 1
}

# Function to upload file via FTP
function Upload-File {
    param(
        [string]$LocalFile,
        [string]$RemoteFile,
        [string]$FtpUri,
        [string]$User,
        [string]$Pass
    )
    
    try {
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($User, $Pass)
        $webclient.UploadFile($FtpUri, $LocalFile)
        Write-Host "✅ Uploaded: $RemoteFile" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Failed to upload: $RemoteFile - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    finally {
        if ($webclient) {
            $webclient.Dispose()
        }
    }
}

# Function to create directory via FTP
function Create-FtpDirectory {
    param(
        [string]$FtpUri,
        [string]$User,
        [string]$Pass
    )
    
    try {
        $request = [System.Net.FtpWebRequest]::Create($FtpUri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.Credentials = New-Object System.Net.NetworkCredential($User, $Pass)
        $response = $request.GetResponse()
        $response.Close()
        return $true
    }
    catch {
        # Directory might already exist, which is fine
        return $false
    }
}

# Files to exclude from upload
$ExcludePatterns = @(
    "*.log",
    "*.tmp",
    ".env.local",
    ".env.example",
    "node_modules",
    "vendor",
    "storage/logs/*",
    "storage/framework/cache/*",
    "storage/framework/sessions/*",
    "storage/framework/views/*",
    ".git",
    ".vscode"
)

# Get all files in backend directory
$AllFiles = Get-ChildItem -Path $LocalPath -Recurse -File

# Filter out excluded files
$FilesToUpload = $AllFiles | Where-Object {
    $file = $_
    $relativePath = $file.FullName.Substring((Resolve-Path $LocalPath).Path.Length + 1)
    
    $shouldExclude = $false
    foreach ($pattern in $ExcludePatterns) {
        if ($relativePath -like $pattern) {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
}

Write-Host "Found $($FilesToUpload.Count) files to upload" -ForegroundColor Yellow
Write-Host ""

# Upload files
$SuccessCount = 0
$FailCount = 0

foreach ($file in $FilesToUpload) {
    $relativePath = $file.FullName.Substring((Resolve-Path $LocalPath).Path.Length + 1)
    $remotePath = $RemotePath + "/" + $relativePath.Replace("\", "/")
    $ftpUri = "ftp://$FtpServer$remotePath"
    
    # Create directory if needed
    $remoteDir = Split-Path $remotePath -Parent
    if ($remoteDir -and $remoteDir -ne $RemotePath) {
        $ftpDirUri = "ftp://$FtpServer$remoteDir/"
        Create-FtpDirectory -FtpUri $ftpDirUri -User $Username -Pass $Password | Out-Null
    }
    
    # Upload file
    if (Upload-File -LocalFile $file.FullName -RemoteFile $relativePath -FtpUri $ftpUri -User $Username -Pass $Password) {
        $SuccessCount++
    } else {
        $FailCount++
    }
}

Write-Host ""
Write-Host "=== Upload Summary ===" -ForegroundColor Green
Write-Host "✅ Successful uploads: $SuccessCount" -ForegroundColor Green
Write-Host "❌ Failed uploads: $FailCount" -ForegroundColor Red
Write-Host "📁 Total files processed: $($FilesToUpload.Count)"

if ($FailCount -eq 0) {
    Write-Host ""
    Write-Host "🎉 All backend files uploaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Visit: https://gudangku.dashdearchitect.com/detect-structure.php"
    Write-Host "2. Run: https://gudangku.dashdearchitect.com/fix-storage-paths.php"
    Write-Host "3. Test: https://gudangku.dashdearchitect.com/storage/avatars/1768132313_2.png"
} else {
    Write-Host ""
    Write-Host "⚠️ Some files failed to upload. Please check the errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")