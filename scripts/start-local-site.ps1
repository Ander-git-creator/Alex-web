$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path -Parent $PSScriptRoot
$siteNode = 'C:\Users\xfcha\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if (-not (Test-Path -LiteralPath $siteNode)) {
    $siteNode = (Get-Command node.exe -ErrorAction Stop).Source
}
Set-Location -LiteralPath $siteRoot
& $siteNode (Join-Path $PSScriptRoot 'local-site-supervisor.cjs')
exit $LASTEXITCODE
