function Add-GatewayToVm ($vmName)
{
    $switchName = "Gateway"
    $adapters=Get-VMNetworkAdapter -VMName $vmName | Select-Object -Skip 1
    #$noGateway=(
    #  $adapters | ForEach-Object { $_.SwitchName -eq $switchName }
    #) -notcontains $true
    #If ($noGateway -eq $true) {
        Write-Output "Adding Switch $switchName to $vmName"
        Write-Output $adapters
        # Android seems to use random adapters from eth1-n if they are present
        # try
        #{
        #    Add-VMNetworkAdapter -VMName $vmName -SwitchName $switchName
        #} catch 
        #{
        $adapters | ForEach-Object {
            if ($_.SwitchName -ne $switchName) {
                Write-Output "Replaced $_.Name"
                Connect-VMNetworkAdapter -VMName $vmName -SwitchName $switchName -Name $_.Name
            }
        }
        #}
    #}
}

while ( 1 -eq 1 ) {
    Get-Vm | Where-Object { [System.TimeSpan] $_.Uptime -gt [System.TimeSpan]"00:01:00" } | ForEach-Object -Process { Add-GatewayToVm $_.Name }
    Start-Sleep -Seconds 5
}

