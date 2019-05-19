$phoneCount=3

Start-Process -FilePath "powershell" -ArgumentList "c:\EnsureVMsHaveGateway.ps1"
Start-Sleep -Seconds 20

for ($i=1; $i-lt($phoneCount+1); $i++) {
    Write-Output "Starting Phone $i"
    $args="/sku Android /displayName `"VS Emulator Phone$i`" /memSize 512 /diagonalSize 5 /video `"480x800`" /vhd `"C:\Users\testing\AppData\Local\Microsoft\VisualStudioEmulator\Android\Containers\Local\Devices\vhd\Phone$i\image.vhd`" /name `"VS Emulator Phone$i.testing`""
    Write-Output "xde.exe $args"
    Start-Process -FilePath "C:\Program Files (x86)\Microsoft XDE\10.0.10586.0\xde.exe" -ArgumentList $args
    Start-Sleep -Seconds 60
}
