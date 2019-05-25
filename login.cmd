reg add "HKEY_CURRENT_USER\Software\Microsoft\Terminal Server Client" /v "AuthenticationLevelOverride" /t "REG_DWORD" /d 0 /f
cmdkey /generic:"10.10.0.5" /user:"testing" /pass:"S3l3|\|iuM"
echo logging in
mstsc /v:"10.10.0.5" /w:1920 /h:1080