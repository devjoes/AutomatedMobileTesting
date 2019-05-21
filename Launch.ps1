$ErrorActionPreference="SilentlyContinue"
Stop-Transcript | out-null
$ErrorActionPreference = "Continue"
Start-Transcript -path C:\log.txt -append



Get-DhcpServerv4Lease -ScopeId 192.168.0.0 -AllLeases |  ForEach-Object { Remove-DhcpServerv4Lease -IPAddress $_.IPAddress }

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
Start-Process -FilePath "C:\Program Files (x86)\Microsoft Emulator Manager\1.0\emulatorcmd.exe" -ArgumentList "launch /sku:Android /id:30AFB6F9-52A6-47DF-99C2-074587997AF3"
Start-Sleep -seconds 60
Start-Process -FilePath "C:\Program Files (x86)\Microsoft Emulator Manager\1.0\emulatorcmd.exe" -ArgumentList "launch /sku:Android /id:30AFB6F9-52A6-47DF-99C2-074587997AF2"
Start-Sleep -seconds 60
Start-Process -FilePath "C:\Program Files (x86)\Microsoft Emulator Manager\1.0\emulatorcmd.exe" -ArgumentList "launch /sku:Android /id:30AFB6F9-52A6-47DF-99C2-074587997A03" 

Start-Process -FilePath "npm" -ArgumentList "run start" -WorkingDirectory "C:\appium-attach\"


exit
Start-Sleep -seconds 300

Start-Process -FilePath "powershell" -ArgumentList "c:\screenshot.ps1" -nonewwindow
Start-Sleep -seconds 5
Stop-Process -Name xde
Start-Sleep -seconds 30
Restart-Computer -Force
Stop-Transcript

