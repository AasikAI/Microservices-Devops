# Ensure PATH includes Node.js and npm
$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')

Write-Host "Installing dependencies..." -ForegroundColor Cyan

Write-Host "1. Installing Auth Service dependencies..."
cd auth-service
npm install
cd ..

Write-Host "2. Installing Product Service dependencies..."
cd product-service
npm install
cd ..

Write-Host "3. Installing Order Service dependencies..."
cd order-service
npm install
cd ..

Write-Host "4. Installing Frontend dependencies..."
cd frontend
npm install
cd ..

Write-Host "All dependencies installed!" -ForegroundColor Green
