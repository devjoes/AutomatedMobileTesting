$uncPath = "\\jsuiautomationapps.file.core.windows.net\selenium\"
$hostsFile = "c:\Windows\System32\drivers\etc\hosts"
$devicesPath = "$ENV:LOCALAPPDATA\Microsoft\VisualStudioEmulator\Android\Containers\Local\Devices\"
$emulatorCmdPath = "C:\Program Files (x86)\Microsoft Emulator Manager\1.0\emulatorcmd.exe"
$hostname = $env:computername | Select-Object
$phoneCount = 3

$ip = (Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -ne "Disconnected" }).IPv4Address.IPAddress


function Set-PermsFullControl($dir) {
    $FilesAndFolders = gci "$dir" -Recurse | % { $_.FullName }
    foreach ($FileAndFolder in $FilesAndFolders) {
        $item = gi -LiteralPath $FileAndFolder 
        $acl = $item.GetAccessControl() 
        $permission = "Everyone", "FullControl", "Allow"
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
        $acl.SetAccessRule($rule)
        $item.SetAccessControl($acl)
    }
}

function Start-Xde($id) {
    $wshell = New-Object -ComObject wscript.shell;
    $vmsUp = 0
    $desired = ((Get-DhcpServerv4Lease -ScopeId 192.168.0.0 -AllLeases | Measure-Object -Line).Lines) + 1
    while ($vmsUp -ne $desired) {
        $count = 0
        Start-Process -FilePath $emulatorCmdPath -ArgumentList "launch /sku:Android /id:$id"
        while ($vmsUp -ne $desired -and $count -lt 120) {
            $vmsUp = (Get-DhcpServerv4Lease -ScopeId 192.168.0.0 -AllLeases | Measure-Object -Line).Lines
            Start-Sleep -Seconds 5
            Write-Output "Waiting for VM $id to come up $vmsUp/$desired"
            $count++
            if ($wshell.AppActivate("Visual Studio Emulator for Android")) {
                break;
            }
        }
        if ($vmsUp -ne $desired) {
            Write-Output "Failed"
            $process = (Get-Process xde | Sort-Object { $_.StartTime } | Select-Object -Last 1)
            
            #            $sig = '
            #            [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
            #            [DllImport("user32.dll")] public static extern int SetForegroundWindow(IntPtr hwnd);
            #            '
            #            $type = Add-Type -MemberDefinition $sig -Name WindowAPI -PassThru
            #            $hwnd = $process.MainWindowHandle
            #            $null = $type::ShowWindowAsync($hwnd, 4)
            #            $null = $type::SetForegroundWindow($hwnd)
            #            
            #            Start-Sleep -Seconds 1
            Write-Output "Closing - method 1"

            if ($wshell.AppActivate("Visual Studio Emulator for Android")) {
                Start-Sleep -Seconds 1
                $wshell.SendKeys('{ENTER}')
            }
            
            Start-Sleep -Seconds 1
            Write-Output "Closing - method 2"
            $process.CloseMainWindow()
            Start-Sleep -Seconds 1
            Write-Output "Closing - method 3"
            $process.Close()

            $closeCount = 0
            while ($process.HasExited -eq $false -and $closeCount -lt 180) {
                Start-Sleep -Seconds 5
                Write-Output "Waiting for close"
                $closeCount++
            }
            if (!($process.HasExited)) {
                Write-Output "Killing process"
                $process.Kill()
            }
            Start-Sleep -Seconds 1
        }
    }
}

$ErrorActionPreference = "SilentlyContinue"
Stop-Transcript | Out-Null
$ErrorActionPreference = "Continue"
Start-Transcript -Path C:\log.txt

Write-Output "Started $(Get-Date)"

if ($null -eq (Get-Command "appium.cmd" -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath "npm" -ArgumentList "i appium -g"
}
Get-DhcpServerv4Lease -ScopeId 192.168.0.0 -AllLeases | ForEach-Object { Remove-DhcpServerv4Lease -IPAddress $_.IPAddress }

if (!(Test-Path -Path "$($devicesPath)Phone1.cfg")) {
    Start-Process -FilePath $emulatorCmdPath -ArgumentList "list /sku:Android /type:platform" -Wait # this creates folders etc for the user
    Copy-Item "C:\phones\*" -Destination $devicesPath -Force -Recurse
    Set-PermsFullControl -dir $devicesPath
}

#Start-Process -FilePath "C:\Program Files (x86)\Microsoft XDE\10.0.10586.0\XdeCleanup.exe" -Wait

#Get-Process xde |   Foreach-Object { $_.CloseMainWindow() | Out-Null } | stop-process �force

$sid = ((@(query user) -split '\n' | Select-Object -Skip 1) -split '\s+')[2]
$res = (Get-WmiObject -Class Win32_VideoController).VideoModeDescription

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

Start-Xde -id "30AFB6F9-52A6-47DF-99C2-074587997AF1"
Start-Xde -id "30AFB6F9-52A6-47DF-99C2-074587997AF2"
Start-Xde -id "30AFB6F9-52A6-47DF-99C2-074587997AF3"

Clear-Content $hostsFile

Start-Process -FilePath "adb" -ArgumentList "start-server"
Start-Sleep -Seconds 30
Get-DhcpServerv4Lease -ScopeId 192.168.0.0 -AllLeases | ForEach-Object { 
    $phoneIndex = ($_.IPAddress.IPAddressToString.split('.')[-1] - 10)
    Add-Content $hostsFile "$($_.IPAddress) $($hostname)_$($phoneIndex)"
    Write-Output "Connecting to $($hostname)_$($phoneIndex):5555"
    Start-Process -FilePath "adb" -ArgumentList "connect $($hostname)_$($phoneIndex):5555" | Wait-Process -Timeout 5 -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    #write-output "Starting appium $($hostname)_$($phoneIndex):5555"
    #Start-Process -FilePath "appium" -ArgumentList " -p $(4723 + $phoneIndex) --full-reset  --nodeconfig config$($phoneIndex).json --default-capabilities `"{`"`"deviceName`"`":`"`"$($hostname)_$($phoneIndex):5555`"`",`"`"udid`"`":`"`"$($hostname)_$($phoneIndex):5555`"`"}`"" -W
}

Start-Process -FilePath "powershell" -ArgumentList "c:\LogDevices.ps1"
Get-VM | ForEach-Object { Set-VMProcessor -VMName $_.Name -Maximum 30 }

$core = 1
Get-Process -name xde | ForEach-Object {
    $_.ProcessorAffinity = $core
    $core *= 2
}

(((Get-Content -path C:\config.template.json -Raw) -replace '\$IP', $ip) -replace '\$HOST', $hostname) | Set-Content -Path C:\config.json

Start-Process -FilePath "appium" -ArgumentList " -p 4723 --full-reset  --nodeconfig C:\config.json"

Write-Output "Finished $(Get-Date)"

Copy-Item C:\log.txt  "$($uncPath)logs\$($hostname).txt"

#Start-Sleep -Seconds 5
#write-output "Starting appium"


#Start-Process -FilePath "appium" -ArgumentList " -p 4724 --full-reset  --nodeconfig config2.json --default-capabilities `"{`"`"deviceName`"`":`"`"$($hostname)_01:5555`"`",`"`"udid`"`":`"`"$($hostname)_01:5555`"`"}`""
#Start-Process -FilePath "appium" -ArgumentList " -p 4725 --full-reset  --nodeconfig config3.json --default-capabilities `"{`"`"deviceName`"`":`"`"$($hostname)_02:5555`"`",`"`"udid`"`":`"`"$($hostname)_02:5555`"`"}`""

