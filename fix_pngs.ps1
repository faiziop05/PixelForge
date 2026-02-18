Add-Type -AssemblyName System.Drawing

$assetsDir = "d:\Projects\Wallpapers-application\PixelForge\assets"
$files = Get-ChildItem $assetsDir -Filter *.png

Write-Host "Starting PNG repair/normalization in $assetsDir"

foreach ($file in $files) {
    Write-Host "Processing $($file.Name)..." -NoNewline
    try {
        # Load the image (this works even if it's a JPEG renamed to .png)
        $img = [System.Drawing.Bitmap]::FromFile($file.FullName)
        
        # Save to a temporary file as a proper PNG
        $tempFile = $file.FullName + ".tmp.png"
        
        # Save explicitly as PNG
        $img.Save($tempFile, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Dispose to release the file handle
        $img.Dispose()
        
        # overwrite the original
        Move-Item -Path $tempFile -Destination $file.FullName -Force
        Write-Host " Done."
    } catch {
        Write-Host " ERROR: $_"
    }
}

Write-Host "All operations completed."
