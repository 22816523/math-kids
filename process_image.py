#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Process the provided image for plan card covers
- Crop to appropriate aspect ratio (5.36:1)
- Resize to 750x140 (2x display)
- Save as JPEG
"""

from PIL import Image
import os

# Paths
input_image = r"d:\文档\JTY\VS Code\temp_image.jpg"  # Temporary location for user's image
output_dir = r"d:\文档\JTY\VS Code\2-AI伴读V1.0\界面原型\教师端\images"
output_file = os.path.join(output_dir, "plan-cover.jpg")

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

try:
    # Open the image
    img = Image.open(input_image)
    print(f"Original image size: {img.size}")

    # Crop to the suggested region (0, 200, 2560, 677)
    # This gives us 2560x477 which is approximately 5.37:1 ratio
    cropped = img.crop((0, 200, 2560, 677))
    print(f"Cropped image size: {cropped.size}")

    # Resize to 750x140 (2x display resolution)
    resized = cropped.resize((750, 140), Image.Resampling.LANCZOS)
    print(f"Resized image size: {resized.size}")

    # Save as JPEG with high quality
    resized.save(output_file, "JPEG", quality=90, optimize=True)
    print(f"Image saved to: {output_file}")
    print("OK")

except FileNotFoundError:
    print(f"FAIL: Input image not found at {input_image}")
    print("Please save the provided image to this location first")
except Exception as e:
    print(f"FAIL: {str(e)}")
