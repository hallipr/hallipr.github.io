function LogCommand($command) {
    Write-Host "> $($command | Out-String)"
    & $command
}

Push-Location -Path $PSScriptRoot
try {
    LogCommand { npm ci }
    $ENV:PUBLIC_URL = "/new-app"
    LogCommand { npm run build -ws --if-present }

    if (Test-Path "./build") {
        Remove-Item -Recurse -Force build
    }

    New-Item -ItemType Directory -Path "./build" | Out-Null

    Write-Host "Copy react site to build/new-app folder"
    Copy-Item -Path "./new-app/build" -Destination "./build/new-app" -Recurse -Force | Out-Null

    Write-Host "Copy static site to build/breeding folder"
    Copy-Item -Path "./breeding" -Destination "./build/breeding" -Recurse -Force | Out-Null

    Write-Host "Copy static index to build folder"
    Copy-Item -Path "./index.html" -Destination "./build" -Recurse -Force | Out-Null
}
finally {
    Pop-Location
}
