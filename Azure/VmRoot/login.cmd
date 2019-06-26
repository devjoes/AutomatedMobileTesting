powershell "(Get-NetIPConfiguration | Where-Object { $null -ne $_.IPv4DefaultGateway -and $_.NetAdapter.Status -ne """Disconnected""" }).IPv4Address.IPAddress" > ip
set /p IP=<ip
del ip

reg add "HKEY_CURRENT_USER\Software\Microsoft\Terminal Server Client" /v "AuthenticationLevelOverride" /t "REG_DWORD" /d 0 /f
cmdkey /generic:"%IP%" /user:"testing" /pass:"hTkKhXiVz1Ixh0pJkeE08Q3v"

echo logging in
mstsc /v:"%IP%" /w:1920 /h:1080