<#
 .SYNOPSIS
    Set up your dev environment for deployment to Skyler's Dokku instance.
 .DESCRIPTION
    This script will download the SSH credentials from Skyler's Azure subscription.
 #>

$subscription = "03a3abb1-ac55-431c-9cb3-7a358c14b8af"

function Test-CommandExists {
    param($command)

    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) { return $true }
    }
    catch {
        return $false
    }
    finally {
        $ErrorActionPreference = $oldPreference
    }
}

function Download-PublicKey {
    param($name, $file)
    $rg = "skylers-secrets"

    if (Test-Path $file) {
        $confirmation = Read-Host "Credential exists at $file Overwrite? [y/n]"
        if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
            Write-Warning "Skipping $file"
            return
        }

        Remove-Item $file
    }

    $sshkey = az sshkey show --resource-group $rg --name $name --subscription $subscription
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to read public key!"
        return -1
    }

    $sshkey = $sshkey | ConvertFrom-Json
    $publicKey = $sshKey.publicKey
    Set-Content -Path $file -Value $publicKey -Force
}

function Download-PrivateKey {
    param($name, $file)
    $keyvault = "skylerssecrets"

    if (Test-Path $file) {
        $confirmation = Read-Host "Credential exists at $file. Overwrite? [y/n]"
        if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
            Write-Warning "Skipping $file"
            return
        }

        Remove-Item $file
    }

    az keyvault secret download --vault-name $keyvault --name $name --file $file --subscription $subscription
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to read private key!"
    }
}

if (-not (Test-CommandExists az)) {
    Write-Error "Azure CLI required to load certificates. Download at https://aka.ms/azcli"
    return -1
}

# Download public and private keys from Azure
$certDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $certDir)) {
    Write-Host "Creating $certDir"
    New-Item -ItemType Directory -Path $certDir | Out-Null
}

Write-Host "Downloading Dokku public key from Azure SSH"
Download-PublicKey -name "skylers-dokku" -file "$certDir\dokku_rsa.pub"

Write-Host "Downloading Dokku private key from Azure KeyVault"
Download-PrivateKey -name "skylers-dokku-private" -file "$certDir\dokku_rsa"

Write-Host "Downloading Dokku Deployment public key from Azure SSH"
Download-PublicKey -name "skylers-dokku-deployment" -file "$certDir\dokku_deployment_rsa.pub"

Write-Host "Downloading Dokku Deployment private key from Azure KeyVault"
Download-PrivateKey -name "skylers-dokku-deployment-private" -file "$certDir\dokku_deployment_rsa"

if (-not (Test-CommandExists ssh-add)) {
    Write-Error "Could not find OpenSSH commands installed on this computer. Make sure OpenSSH is installed and the service is running."
    return -1
}

ssh-add "$certDir\dokku_rsa"
ssh-add "$certDir\dokku_deployment_rsa"

if (-not (Test-CommandExists git)) {
    Write-Error "git is not installed or is not in path"
    return -1
}

# Add the dokku remote to the repository
Write-Host "Configuring git remote for Dokku deployment"
git remote add dokku dokku@dokku-dev.skylers.app:grocery-list

Write-Host "*******************************************************************************************************************"
Write-Host "To SSH to VM or deploy via git don't forget to install OpenSSH and enable the OpenSSH Authentication Agent service!"
Write-Host "*******************************************************************************************************************"
