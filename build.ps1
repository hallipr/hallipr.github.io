function LogCommand($command) {
    Write-Host "> $($command | Out-String)"
    & $command
}

Push-Location -Path $PSScriptRoot
try {
    LogCommand { npm ci }
    LogCommand { npm run build -ws --if-present }

    $outFolder = "./out"
    if (Test-Path $outFolder) {
        Remove-Item -Recurse -Force $outFolder
    }

    $outFolder = New-Item -ItemType Directory -Path $outFolder

    Write-Host "Copy react site to build/new-app folder"
    Copy-Item -Path "./new-app/out/*" -Destination "$outFolder" -Recurse -Force | Out-Null
}
finally {
    Pop-Location
}
