$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $root ".env.bridge"
$serverFile = Join-Path $root "local-bridge\server.ts"

if (-not (Test-Path -LiteralPath $envFile)) {
  Write-Host ""
  Write-Host "'.env.bridge' file was not found." -ForegroundColor Yellow
  Write-Host "1. Copy '.env.bridge.example' to '.env.bridge'" -ForegroundColor Yellow
  Write-Host "2. Fill in SUPABASE_SERVICE_ROLE_KEY and any other needed values" -ForegroundColor Yellow
  Write-Host "3. Run this script again" -ForegroundColor Yellow
  Write-Host ""
  exit 1
}

if (-not (Test-Path -LiteralPath $serverFile)) {
  Write-Host "local-bridge/server.ts was not found." -ForegroundColor Red
  exit 1
}

$denoCommand = Get-Command deno -ErrorAction SilentlyContinue
if (-not $denoCommand) {
  Write-Host "Deno is not installed or not available in PATH." -ForegroundColor Red
  Write-Host "Install Deno first, then run this script again." -ForegroundColor Yellow
  exit 1
}

Get-Content -LiteralPath $envFile | ForEach-Object {
  $line = $_.Trim()

  if (-not $line -or $line.StartsWith("#")) {
    return
  }

  $parts = $line -split "=", 2
  if ($parts.Count -ne 2) {
    return
  }

  $name = $parts[0].Trim()
  $value = $parts[1].Trim()

  [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
}

$required = @(
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ROAMING_COUPON_ISSU_NO",
  "ROAMING_COUPON_CUST_NO",
  "ROAMING_COUPON_AUTH_KEY",
  "ROAMING_COUPON_AES_KEY"
)

$missing = @(
  $required | Where-Object {
    $value = [System.Environment]::GetEnvironmentVariable($_, "Process")
    -not $value -or $value -match "^YOUR_"
  }
)

if ($missing.Count -gt 0) {
  Write-Host ""
  Write-Host "Missing required values in .env.bridge:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  Write-Host ""
  exit 1
}

$port = [System.Environment]::GetEnvironmentVariable("LOCAL_BRIDGE_PORT", "Process")
if (-not $port) {
  $port = "8787"
  [System.Environment]::SetEnvironmentVariable("LOCAL_BRIDGE_PORT", $port, "Process")
}

Write-Host ""
Write-Host "Starting local bridge on http://127.0.0.1:$port" -ForegroundColor Green
Write-Host "Use VITE_API_MODE=local-bridge in the frontend while this is running." -ForegroundColor Green
Write-Host ""

& $denoCommand.Source run --allow-net --allow-env $serverFile
