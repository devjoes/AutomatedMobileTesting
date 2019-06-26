Start-Sleep -Seconds 120
$p = Start-Process -FilePath "adb.exe" -ArgumentList "-P $port -s $emulator shell getprop ro.build.version.sdk"
Start-Sleep -Seconds 30
if (!$p.HasExited) {
#             $process = (Get-Process xde | Sort-Object { $_.StartTime } | Select-Object -Last 1)
}
