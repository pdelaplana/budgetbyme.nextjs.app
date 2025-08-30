# Restart Development Server (Windows)

Kills any existing Next.js development server processes and starts a fresh one.

## Command
```bash
# Check for processes on ports 3000 and 3001
powershell "Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue | Select-Object LocalPort, OwningProcess"

# Kill any processes found on these ports
for /f "tokens=2 delims= " %i in ('powershell "Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"') do powershell "Stop-Process -Id %i -Force -ErrorAction SilentlyContinue"

# Start the development server in background
start /B npm run dev

# Show status
echo "Development server starting..."
echo "Check http://localhost:3000 or http://localhost:3001"
```

## Alternative PowerShell Version
```powershell
# Get processes on ports 3000 and 3001
$processes = Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

# Kill the processes
if ($processes) {
    $processes | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "Killed existing processes on ports 3000 and 3001"
}

# Start the development server
Start-Process -WindowStyle Hidden npm "run dev"
Write-Host "Development server starting..."
Write-Host "Check http://localhost:3000 or http://localhost:3001"
```

## Usage
This command will:
1. Check for any processes running on ports 3000 and 3001
2. Kill those processes if found
3. Start a fresh Next.js development server
4. Handle Windows-specific process management properly