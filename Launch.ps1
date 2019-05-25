$uncPath = "\\jsuiautomationapps.file.core.windows.net\selenium\"
$hostsFile = "c:\Windows\System32\drivers\etc\hosts"
$hostname = $env:computername | Select-Object

function Wait-ForVmCount($desired){
    $vmsUp=0
    while ($vmsUp -ne $desired) {
	    $vmsUp= (Get-DhcpServerv4Lease -ScopeId 192.168.0.0 -AllLeases  | Measure-Object –Line).Lines
	    Start-Sleep -Seconds 5
	    Write-Output "Waiting for VMs to come up $vmsUp/$desired"
    }
}

$ErrorActionPreference="SilentlyContinue"
Stop-Transcript | out-null
$ErrorActionPreference = "Continue"
Start-Transcript -path C:\log.txt

Write-Output "Started $(Get-Date)"


Get-DhcpServerv4Lease -ScopeId 192.168.0.0 -AllLeases |  ForEach-Object { Remove-DhcpServerv4Lease -IPAddress $_.IPAddress  }

Start-Process -FilePath "C:\Program Files (x86)\Microsoft XDE\10.0.10586.0\XdeCleanup.exe" -Wait

#Get-Process xde |   Foreach-Object { $_.CloseMainWindow() | Out-Null } | stop-process –force

$phoneCount=3
$sid=((@(query user) -split '\n' | Select-Object -Skip 1)  -split '\s+')[2]
$res=(Get-WmiObject -Class Win32_VideoController).VideoModeDescription

Write-Output "$sid $res"

#Start-Process -FilePath "tscon" "$sid /dest:console"

Start-Sleep -Seconds 5
Start-Process -FilePath "powershell" -ArgumentList "c:\EnsureVMsHaveGateway.ps1"

# Sudden shutdowns corrupt VMs. Remember permissions are important
#Copy-Item "$ENV:LOCALAPPDATA\Microsoft\VisualStudioEmulator\Android\Containers\Local\Devices\blank\*" -Destination "$ENV:LOCALAPPDATA\Microsoft\VisualStudioEmulator\Android\Containers\Local\Devices\vhd\" -Force -Recurse
Start-Sleep -seconds 5

#for ($i=1; $i-lt($phoneCount+1); $i++) {
#    Write-Output "Starting Phone $i"
#    $args="/sku Android /displayName `"VS Emulator Phone$i`" /memSize 512 /diagonalSize 5 /video `"480x800`" /vhd `"C:\Users\testing\AppData\Local\Microsoft\VisualStudioEmulator\Android\Containers\Local\Devices\vhd\Phone$i\image.vhd`" /name `"VS Emulator Phone$i.testing`""
#    Write-Output "xde.exe $args"
#    Start-Process -FilePath "C:\Program Files (x86)\Microsoft XDE\10.0.10586.0\xde.exe" -ArgumentList $args
#    Start-Process -FilePath "C:\Program Files (x86)\Microsoft XDE\10.0.10586.0\xde.exe" -ArgumentList $args
#    Start-Sleep -Seconds 60
#}

#todo: WE should probably have something here that looks for the @Launching emulator@ bit and then exits so we dont have to sleep for so long
#Start-Process -FilePath "C:\Program Files (x86)\Microsoft Emulator Manager\1.0\emulatorcmd.exe" -ArgumentList "launch /sku:Android /id:30AFB6F9-52A6-47DF-99C2-074587997AF3"
#Start-Sleep -seconds 60
#Start-Process -FilePath "C:\Program Files (x86)\Microsoft Emulator Manager\1.0\emulatorcmd.exe" -ArgumentList "launch /sku:Android /id:30AFB6F9-52A6-47DF-99C2-074587997AF2"
#Start-Sleep -seconds 60
#Start-Process -FilePath "C:\Program Files (x86)\Microsoft Emulator Manager\1.0\emulatorcmd.exe" -ArgumentList "launch /sku:Android /id:30AFB6F9-52A6-47DF-99C2-074587997A03" 
#Start-Sleep -seconds 60

Start-Process -FilePath "C:\Program Files (x86)\Microsoft Emulator Manager\1.0\emulatorcmd.exe" -ArgumentList "launch /sku:Android /id:30AFB6F9-52A6-47DF-99C2-074587997AF1"
Wait-ForVmCount -desired 1
Start-Process -FilePath "C:\Program Files (x86)\Microsoft Emulator Manager\1.0\emulatorcmd.exe" -ArgumentList "launch /sku:Android /id:30AFB6F9-52A6-47DF-99C2-074587997AF2"
Wait-ForVmCount -desired 2
Start-Process -FilePath "C:\Program Files (x86)\Microsoft Emulator Manager\1.0\emulatorcmd.exe" -ArgumentList "launch /sku:Android /id:30AFB6F9-52A6-47DF-99C2-074587997AF3"
Wait-ForVmCount -desired 3

Clear-Content $hostsFile

Start-Process -FilePath "adb" -ArgumentList "start-server"
Start-Sleep -Seconds 30
Get-DhcpServerv4Lease -ScopeId 192.168.0.0 -AllLeases |  ForEach-Object { 
    $phoneIndex= ($_.IPAddress.IPAddressToString.split('.')[-1] - 10)
    Add-Content $hostsFile "$($_.IPAddress) $($hostname)_$($phoneIndex)"
    write-output "Connecting to $($hostname)_$($phoneIndex):5555"
    Start-Process -FilePath "adb" -ArgumentList "connect $($hostname)_$($phoneIndex):5555" | Wait-Process -Timeout 5 -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    #write-output "Starting appium $($hostname)_$($phoneIndex):5555"
    #Start-Process -FilePath "appium" -ArgumentList " -p $(4723 + $phoneIndex) --full-reset  --nodeconfig config$($phoneIndex).json --default-capabilities `"{`"`"deviceName`"`":`"`"$($hostname)_$($phoneIndex):5555`"`",`"`"udid`"`":`"`"$($hostname)_$($phoneIndex):5555`"`"}`"" -W
}

Start-Process -FilePath "powershell" -ArgumentList "c:\LogDevices.ps1"
Get-VM | ForEach-Object { set-VMProcessor -VMName $_.Name -Maximum 30 }

Start-Process -FilePath "appium" -ArgumentList " -p 4723 --full-reset  --nodeconfig C:\config.json"

Write-Output "Finished $(Get-Date)"

Copy-Item C:\log.txt  "$($uncPath)logs\$($hostname).txt"

#Start-Sleep -Seconds 5
#write-output "Starting appium"


#Start-Process -FilePath "appium" -ArgumentList " -p 4724 --full-reset  --nodeconfig config2.json --default-capabilities `"{`"`"deviceName`"`":`"`"$($hostname)_01:5555`"`",`"`"udid`"`":`"`"$($hostname)_01:5555`"`"}`""
#Start-Process -FilePath "appium" -ArgumentList " -p 4725 --full-reset  --nodeconfig config3.json --default-capabilities `"{`"`"deviceName`"`":`"`"$($hostname)_02:5555`"`",`"`"udid`"`":`"`"$($hostname)_02:5555`"`"}`""

