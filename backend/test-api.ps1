# Field Flow API Testing Script

Write-Host "=== FIELD FLOW API TESTING ===" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:8001/api"

# Test 1: Login
Write-Host "1. Testing Login..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -ContentType "application/json" -Body '{"phone":"+62 812 3456 7890","password":"password"}'
    
    if ($loginResponse.success) {
        Write-Host "✅ Login successful!" -ForegroundColor Green
        $token = $loginResponse.data.token
        $headers = @{
            "Authorization" = "Bearer $token"
            "Accept" = "application/json"
        }
        Write-Host "Token: $($token.Substring(0,20))..." -ForegroundColor Cyan
    } else {
        Write-Host "❌ Login failed!" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "❌ Login error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Get User Profile
Write-Host "2. Testing Get Profile..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/me" -Method GET -Headers $headers
    if ($profileResponse.success) {
        Write-Host "✅ Profile retrieved!" -ForegroundColor Green
        Write-Host "User: $($profileResponse.data.name) ($($profileResponse.data.position))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Profile error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get Items
Write-Host "3. Testing Get Items..." -ForegroundColor Yellow
try {
    $itemsResponse = Invoke-RestMethod -Uri "$baseUrl/items" -Method GET -Headers $headers
    if ($itemsResponse.data) {
        Write-Host "✅ Items retrieved!" -ForegroundColor Green
        Write-Host "Total items: $($itemsResponse.data.Count)" -ForegroundColor Cyan
        $itemsResponse.data | ForEach-Object { 
            Write-Host "- $($_.name) (Stock: $($_.stock) $($_.unit))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Items error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Dashboard Stats
Write-Host "4. Testing Dashboard Stats..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/dashboard/stats" -Method GET -Headers $headers
    if ($statsResponse.success) {
        Write-Host "✅ Dashboard stats retrieved!" -ForegroundColor Green
        Write-Host "Total Items: $($statsResponse.data.total_items)" -ForegroundColor Cyan
        Write-Host "Low Stock Items: $($statsResponse.data.low_stock_items)" -ForegroundColor Cyan
        Write-Host "Today Stock In: $($statsResponse.data.today_stock_in)" -ForegroundColor Cyan
        Write-Host "Today Stock Out: $($statsResponse.data.today_stock_out)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Dashboard stats error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Stock In
Write-Host "5. Testing Stock In..." -ForegroundColor Yellow
try {
    $stockInBody = '{"quantity":10,"note":"Test stock in via API","reference_number":"TEST-001"}'
    $stockInResponse = Invoke-RestMethod -Uri "$baseUrl/items/1/stock-in" -Method POST -Headers $headers -ContentType "application/json" -Body $stockInBody
    if ($stockInResponse.success) {
        Write-Host "✅ Stock in successful!" -ForegroundColor Green
        Write-Host "Message: $($stockInResponse.message)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Stock in error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Check In Attendance
Write-Host "6. Testing Check In Attendance..." -ForegroundColor Yellow
try {
    $checkInBody = '{"latitude":-6.2088,"longitude":106.8456,"notes":"Test check in via API"}'
    $checkInResponse = Invoke-RestMethod -Uri "$baseUrl/attendance/check-in" -Method POST -Headers $headers -ContentType "application/json" -Body $checkInBody
    if ($checkInResponse.success) {
        Write-Host "✅ Check in successful!" -ForegroundColor Green
        Write-Host "Message: $($checkInResponse.message)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Check in error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== API TESTING COMPLETED ===" -ForegroundColor Green
Write-Host ""
Write-Host "API Server is running at: http://localhost:8001" -ForegroundColor Yellow
Write-Host "You can now integrate with your React frontend!" -ForegroundColor Yellow