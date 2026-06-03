from PIL import Image
import os

img_path = r"c:\Users\arsha\.antigravity\KAAMMADAT\kaammadat-app\public\cartoon_worker.png"
if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # If pixel is close to pure white, make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(img_path, "PNG")
    print("Background removed.")
else:
    print("Image not found.")
