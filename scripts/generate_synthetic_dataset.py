"""
Generate synthetic dataset for demo purposes.
Creates basic images with patterns representing different defect types.
This is NOT production data - just for making the training pipeline work end-to-end.
"""
import os
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Configuration
OUTPUT_DIR = Path("dataset/splits")
NUM_TRAIN_PER_CLASS = 100
NUM_VAL_PER_CLASS = 20
IMG_SIZE = 224

LABELS = ["OK", "porosity", "crack", "surface_void"]

def create_ok_image():
    """Create a plain metal-like image (OK class)"""
    # Base gray metal color
    base_color = random.randint(100, 150)
    img = Image.new("RGB", (IMG_SIZE, IMG_SIZE), (base_color, base_color, base_color))
    
    # Add subtle texture
    draw = ImageDraw.Draw(img)
    for _ in range(50):
        x = random.randint(0, IMG_SIZE)
        y = random.randint(0, IMG_SIZE)
        shade = random.randint(-10, 10)
        color = (
            max(0, min(255, base_color + shade)),
            max(0, min(255, base_color + shade)),
            max(0, min(255, base_color + shade))
        )
        draw.rectangle([x, y, x+2, y+2], fill=color)
    
    return img

def create_porosity_image():
    """Create image with small dark dots (porosity)"""
    img = create_ok_image()
    draw = ImageDraw.Draw(img)
    
    # Add small dark dots (pores)
    num_pores = random.randint(5, 15)
    for _ in range(num_pores):
        x = random.randint(20, IMG_SIZE - 20)
        y = random.randint(20, IMG_SIZE - 20)
        radius = random.randint(2, 5)
        draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=(30, 30, 30))
    
    return img

def create_crack_image():
    """Create image with line-like patterns (cracks)"""
    img = create_ok_image()
    draw = ImageDraw.Draw(img)
    
    # Add crack-like lines
    num_cracks = random.randint(1, 3)
    for _ in range(num_cracks):
        x = random.randint(20, IMG_SIZE - 20)
        y = random.randint(20, IMG_SIZE - 20)
        
        # Draw jagged line
        points = [(x, y)]
        for i in range(10):
            x += random.randint(-15, 15)
            y += random.randint(-15, 15)
            x = max(10, min(IMG_SIZE - 10, x))
            y = max(10, min(IMG_SIZE - 10, y))
            points.append((x, y))
        
        draw.line(points, fill=(20, 20, 20), width=2)
    
    return img

def create_surface_void_image():
    """Create image with larger irregular shapes (surface voids)"""
    img = create_ok_image()
    draw = ImageDraw.Draw(img)
    
    # Add larger irregular dark shapes
    num_voids = random.randint(1, 3)
    for _ in range(num_voids):
        x = random.randint(30, IMG_SIZE - 30)
        y = random.randint(30, IMG_SIZE - 30)
        size = random.randint(15, 30)
        
        # Draw irregular shape
        points = []
        for i in range(8):
            angle = (i / 8) * 2 * np.pi
            r = size * random.uniform(0.7, 1.3)
            px = x + r * np.cos(angle)
            py = y + r * np.sin(angle)
            points.append((px, py))
        
        draw.polygon(points, fill=(40, 40, 40))
    
    return img

def generate_dataset():
    """Generate synthetic dataset for all classes"""
    # Create directory structure
    for split in ["train", "val"]:
        for label in LABELS:
            (OUTPUT_DIR / split / label).mkdir(parents=True, exist_ok=True)
    
    # Generate images
    image_generators = {
        "OK": create_ok_image,
        "porosity": create_porosity_image,
        "crack": create_crack_image,
        "surface_void": create_surface_void_image
    }
    
    print("Generating synthetic dataset...")
    
    for split, num_per_class in [("train", NUM_TRAIN_PER_CLASS), ("val", NUM_VAL_PER_CLASS)]:
        for label in LABELS:
            print(f"  Generating {num_per_class} {split} images for '{label}'...")
            generator = image_generators[label]
            
            for i in range(num_per_class):
                img = generator()
                # Add some blur/noise for realism
                if random.random() > 0.5:
                    img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 1.5)))
                
                # Save
                filename = f"{label}_{i:04d}.jpg"
                img.save(OUTPUT_DIR / split / label / filename, quality=90)
    
    print(f"\nDataset generated successfully at: {OUTPUT_DIR}")
    print(f"Total images: {len(LABELS) * (NUM_TRAIN_PER_CLASS + NUM_VAL_PER_CLASS)}")
    print(f"  Train: {len(LABELS) * NUM_TRAIN_PER_CLASS}")
    print(f"  Val: {len(LABELS) * NUM_VAL_PER_CLASS}")

if __name__ == "__main__":
    generate_dataset()
