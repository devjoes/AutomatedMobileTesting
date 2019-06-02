# This should be set as a shutdown script AND a logoff script in GPO editor

Get-Process -name xde | ForEach-Object { $_.CloseMainWindow() }

while (( Get-Process -name xde -ErrorAction Continue | Measure-Object –Line).Lines -ne 0){
    Write-Output "Waiting for shutdown"
    Start-Sleep -Seconds 1
}

Start-Sleep -Seconds 10
Stop-Process -Name xde -ErrorAction Continue
Get-DhcpServerv4Lease -ScopeId 192.168.0.0 -AllLeases |  ForEach-Object { Remove-DhcpServerv4Lease -IPAddress $_.IPAddress  }
