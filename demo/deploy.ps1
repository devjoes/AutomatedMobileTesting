Param(
    [string]$buildNumber,
    [string]$src
)
$Context = New-AzStorageContext -ConnectionString "DefaultEndpointsProtocol=https;AccountName=jsuiautomationapps;AccountKey=57H8mvY6rcI+FxHcMMCaseWc7yKYDgKZQ4XD76Wl7Gmqcr2IWHT0QvOWobXoVpAvomxOH9gEiyw1kr/WuqrY/g==;EndpointSuffix=core.windows.net"
$path = "apps/UITestingDemo"
Write-Output "Creating folder $path"
New-AzStorageDirectory -ShareName "selenium" -Context $Context -Path $path
Write-Output "Uploading files to $path"
$src="$ENV:BUILD_SOURCESDIRECTORY\demo\UiTestCalc\app\app\build\outputs\apk\debug\app-debug.apk"

Set-AzStorageFileContent -ShareName "selenium" -Source "$src" -Path "$path/$ENV:BUILD_BUILDNUMBER.apk" -Force -Context $Context