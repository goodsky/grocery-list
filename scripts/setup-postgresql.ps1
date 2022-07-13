# This script will configure the localhost PostgreSQL db for local development
# It assumes an instance is running on localhost with default port and a super user named 'postgres'

if (!(Get-Command psql -errorAction SilentlyContinue)) {
    Write-Error "PostgreSQL is not installed or psql.exe is not in PATH."
    return
}

$username = "groceryuser"
$password = (New-Guid).ToString()
$dbName = "grocerylist"

$commands = @"
DROP DATABASE IF EXISTS $dbName;
DROP USER IF EXISTS $username;

CREATE USER $username WITH PASSWORD '$password';
CREATE DATABASE $dbName WITH OWNER = $username;
"@

$tempFile = "setup.psql"
try {
    if (Test-Path $tempFile) { Remove-Item $tempFile }
    Set-Content -Path $tempFile -Value $commands

    $confirmation = Read-Host "This will delete the database. Ok? [y/n]"
    if ($confirmation -eq 'y' || $confirmation -eq 'Y') {
        psql -U postgres -f $tempFile
        Write-Host "DATABASE_URL=postgres://${username}:$password@localhost:5432/${dbName}?sslmode=disable"
    }
    else {
        Write-Host "Cancelled."
    }
}
finally {
    if (Test-Path $tempFile) { Remove-Item $tempFile }
}
