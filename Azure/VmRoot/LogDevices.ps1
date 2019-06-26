$uncPath = "\\jsuiautomationapps.file.core.windows.net\selenium\"
$hostname = $env:computername | Select-Object

while ($true) {
    Start-Process -FilePath "adb" -ArgumentList "devices" -Wait -RedirectStandardOutput "C:\devices.txt" -NoNewWindow
    Move-Item "C:\devices.txt" "$($uncPath)vms\$($hostname).txt" -Force
    Start-Sleep -Seconds 30
}