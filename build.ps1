param (
    [switch]$CI
)

function LogCommand($command) {
    Write-Host "> $($command | Out-String)"
    & $command
}

Push-Location -Path $PSScriptRoot
try {
    if($CI) {
        LogCommand { npm ci }
    } else {
        LogCommand { npm install }
    }
    
    LogCommand { npm run build }
}
finally {
    Pop-Location
}
