import os
import glob

def check_file(file_path):
    try:
        with open(file_path, 'rb') as f:
            header = f.read(8)
            if header != b'\x89PNG\r\n\x1a\n':
                print(f"INVALID: {file_path}")
                if header.startswith(b'\xff\xd8'):
                    print(f"  -> It is a JPEG file.")
                else:
                    print(f"  -> Unknown header: {header}")
                return False
    except Exception as e:
        print(f"ERROR reading {file_path}: {e}")
        return False
    return True

assets_dir = r"d:\Projects\Wallpapers-application\PixelForge\assets"
png_files = glob.glob(os.path.join(assets_dir, "*.png"))

print("Checking for invalid PNGs...")
count = 0
for png_file in png_files:
    if not check_file(png_file):
        count += 1

if count == 0:
    print("All PNGs are valid.")
else:
    print(f"Found {count} invalid PNG(s).")
