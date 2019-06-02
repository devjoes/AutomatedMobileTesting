$uncPath = "\\jsuiautomationapps.file.core.windows.net\selenium\"
Test-NetConnection -ComputerName jsuiautomationapps.file.core.windows.net -Port 445
Invoke-Expression -Command "cmdkey /add:jsuiautomationapps.file.core.windows.net /user:Azure\$NAME /pass:$PASS"
New-PSDrive -Name S -PSProvider FileSystem -Root $uncPath

Copy-Item -Path "$($uncPath)assets\*.*" -Destination "C:\" -Force
Start-Process -FilePath "powershell" -ArgumentList "-File C:\launch.ps1"