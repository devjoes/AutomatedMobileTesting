Set-Content -Value restarting C:\restarted.txt
try {
    Restart-Computer

    Start-Sleep -Seconds 60
    Restart-Computer -Force
} catch {
    Set-Content -Value $_.ScriptStackTrace C:\restarted.txt
}