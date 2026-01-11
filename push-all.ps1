# Push to all remotes
Write-Host "Pushing to all repositories..." -ForegroundColor Green

Write-Host "Pushing to origin (mandao-online)..." -ForegroundColor Yellow
git push origin main

Write-Host "Pushing to backup (rizalariadi21)..." -ForegroundColor Yellow  
git push backup main

Write-Host "All repositories updated!" -ForegroundColor Green