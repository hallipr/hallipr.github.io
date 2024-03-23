function LogCommand($command) {
    Write-Host "> $($command | Out-String)"
    & $command
}

Push-Location -Path $PSScriptRoot
try {
    LogCommand { npm ci }
    $ENV:PUBLIC_URL = "/new-app"
    LogCommand { npm run build -ws --if-present }

    $outFolder = "./out"
    if (Test-Path $outFolder) {
        Remove-Item -Recurse -Force $outFolder
    }

    $outFolder = New-Item -ItemType Directory -Path $outFolder

    Write-Host "Copy react site to build/new-app folder"
    Copy-Item -Path "./new-app/out" -Destination "$outFolder/new-app" -Recurse -Force | Out-Null

    Write-Host "Copy static site to build/breeding folder"
    Copy-Item -Path "./breeding" -Destination "$outFolder/breeding" -Recurse -Force | Out-Null

    Write-Host "Copy static index to build folder"
    Copy-Item -Path "./index.html" -Destination $outFolder | Out-Null
}
finally {
    Pop-Location
}
