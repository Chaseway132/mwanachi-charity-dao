# Test admin login endpoint
Start-Sleep -Seconds 2

$body = @{
    username = 'admin'
    password = 'admin123'
} | ConvertTo-Json

Write-Host "Testing login endpoint..."
Write-Host "URL: http://localhost:5000/api/admin/login-simple"
Write-Host "Body: $body"

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/admin/login-simple' `
        -Method POST `
        -ContentType 'application/json' `
        -Body $body `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"

    # Try to read the response body
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
        $reader.Close()
    } catch {
        Write-Host "Could not read response body"
    }
}

