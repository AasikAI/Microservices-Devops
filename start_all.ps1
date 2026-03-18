# Ensure PATH includes Node.js and npm for the new processes
$envPath = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')

Write-Host "Starting All Microservices..." -ForegroundColor Cyan

# Auth Service
Start-Process powershell -ArgumentList "-NoExit -Command `" `$env:Path = '$envPath'; cd auth-service; Write-Host 'Auth Service starting...' -ForegroundColor Yellow; npm run dev `""

# Product Service
Start-Process powershell -ArgumentList "-NoExit -Command `" `$env:Path = '$envPath'; cd product-service; Write-Host 'Product Service starting...' -ForegroundColor Blue; npm run dev `""

# Order Service
Start-Process powershell -ArgumentList "-NoExit -Command `" `$env:Path = '$envPath'; cd order-service; Write-Host 'Order Service starting...' -ForegroundColor Magenta; npm run dev `""

# Frontend
Start-Process powershell -ArgumentList "-NoExit -Command `" `$env:Path = '$envPath'; cd frontend; Write-Host 'Frontend starting...' -ForegroundColor Green; npm run dev `""

Write-Host "Services are starting in new windows. Once Vite reports 'ready', open http://localhost:5173" -ForegroundColor Green
