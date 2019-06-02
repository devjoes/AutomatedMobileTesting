$sExeFile = "ping"
$cArgs = "1.2.3.4"

$oPsi = New-Object -TypeName System.Diagnostics.ProcessStartInfo
    $oPsi.RedirectStandardOutput = $true
    $oPsi.RedirectStandardError = $true
    $oPsi.FileName = $sExeFile
    if (! [String]::IsNullOrEmpty($cArgs)) {
        $oPsi.Arguments = $cArgs
    }

    $oProcess = New-Object -TypeName System.Diagnostics.Process
    $oProcess.StartInfo = $oPsi

    $sScripBlock = {
        if (! [String]::IsNullOrEmpty($EventArgs.Data)) {
            Write-Output $EventArgs.Data
        }
    }
    $oStdOutEvent = Register-ObjectEvent -InputObject $oProcess `
        -Action $sScripBlock -EventName 'OutputDataReceived' `
        -MessageData $oStdOutBuilder
    $oStdErrEvent = Register-ObjectEvent -InputObject $oProcess `
        -Action $sScripBlock -EventName 'ErrorDataReceived' `
        -MessageData $oStdErrBuilder

    # Starting process.
    [Void]$oProcess.Start()
    $oProcess.BeginOutputReadLine()
    $oProcess.BeginErrorReadLine()
    [Void]$oProcess.WaitForExit()