"""
Simple background removal: replace light-colored background pixels with transparency
"""
from PIL import Image
import os, glob

IMG_DIR = r"D:\文档\JTY\AI项目文档\888-自定义产品\2-英语启蒙\mvp_web\images"

for fp in glob.glob(os.path.join(IMG_DIR, "*.png")):
    img = Image.open(fp).convert("RGBA")
    data = img.getdata()
    new_data = []
    for item in data:
        r, g, b, a = item
        brightness = (r + g + b) / 3
        max_c = max(r, g, b)
        min_c = min(r, g, b)
        saturation = (max_c - min_c) / max_c if max_c > 0 else 0
        if brightness > 210 and saturation < 0.2:
            new_data.append((r, g, b, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    img.save(fp)
    print(f"[OK] {os.path.basename(fp)}")

print("Done!")
