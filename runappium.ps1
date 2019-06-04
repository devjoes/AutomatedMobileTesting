$lastLineCount = 0
while (1 -eq 1) {
     Remove-Item -Path "C:\appium.log" 2>$null
     Start-Process -FilePath "appium" -ArgumentList " -p 4723 --full-reset  --nodeconfig C:\config.json --log C:\appium.log"

     $restart = $false
     while (!$restart) {
         Start-Sleep -Seconds 60
         $totalLines = (Get-Content C:\appium.log | Measure-Object –Line).Lines
         Write-Output ($totalLines - $lastLineCount)
         $log = Get-Content -tail ($totalLines - $lastLineCount) C:\appium.log
         $lastLineCount = $totalLines

         $statusCount = 0
         $postCount = 0
         $lineCount = 0;
         foreach ($line in $log){
            if ($line.ToString().Contains("/wd/hub/status")){
                $statusCount++
            }
            if ($line.ToString().Contains("POST")){
                $postCount++
            }
            $lineCount++
         }
     
        Write-Output "$postCount POSTs. $statusCount status in $lineCount"
         if ($lineCount -gt 10 -and $postCount -eq 0 -and (($statusCount / $lineCount) * 100) -gt 20) {
         Write-Output "nothing is going on - lets restart"
            $restart = $true
            Stop-Process -Name node
         }
    }
}